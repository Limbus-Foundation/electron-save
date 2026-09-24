/*---------------------------------------------------------------------------------------------*
 *  copyright (c) 2025 Limbus Foundation & Community. CREATED IN 19/03/2025 DD/MM/YYYY        *
 *  module repo - https://github.com/Limbus-Foundation/electron-save                           *
 *  maintainer org - https://github.com/Limbus-Foundation                                      *
 *---------------------------------------------------------------------------------------------*/

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

import yaml from "js-yaml";
import toml from "@iarna/toml";
import Ajv, { ErrorObject } from "ajv";

const defaultPath = path.join(os.homedir(), "appConfig.json");

interface IElectronSave {
    type?: "json" | "yaml" | "toml";
    schema?: Record<string, any>;
    encryptionKey?: string;
};

type FileType = "json" | "yaml" | "toml";
type Observer = (value: any) => void;

export class ElectronSave {

    private filePath: string;
    private fileType: FileType;
    private schema: Record<string, any> | null;
    private ajv: Ajv;
    private encryptionKey: string | null;
    private observers: Record<string, Observer[]>;

    constructor( filePath: string = defaultPath, options: IElectronSave = {} ) {

        this.filePath = filePath;
        this.fileType = options.type || "json";
        this.schema = options.schema || null;
        this.ajv = new Ajv();
        this.encryptionKey = options.encryptionKey || null;
        this.observers = {};

        this._validateFileType();

        return new Proxy(this, {
            get: (target, prop: string | symbol) => {
                if(typeof target[prop as keyof ElectronSave] !== "undefined") return target[prop as keyof ElectronSave];

                return (value: any) => target.set(String(prop), value);
            }
        });
    }

    private _validateFileType(): void {
        if(!["json", "yaml", "toml"].includes(this.fileType)) {
            throw new Error("Invalid file format");
        }
    }

    public setPath(newPath: string): void {
        this.filePath = newPath;
    }

    public getPath(): string {
        return this.filePath;
    }

    public setEncryptionKey(key: string): void {
        if(!key || key.length !== 32) {
            throw new Error("Encryption key must be 32 characters long");
        }

        this.encryptionKey = key;
    }

    public setSchema(schema: Record<string, any>): void {
        this.schema = schema;
    }

    public validate(): ErrorObject[] | null {
        if(!this.schema) return null;

        const data = this._readData();
        const validate = this.ajv.compile(this.schema);

        if(!validate(data)) return validate.errors || [];

        return null;
    }

    private _readData(): Record<string, any> {
        try {
            if(!fs.existsSync(this.filePath)) {
                this._writeData({});
                return {};
            }

            const content = fs.readFileSync(this.filePath, "utf-8");

            return this.fileType === "yaml" ? yaml.load(content) as Record<string, any> || {} :
                   this.fileType === "toml" ? toml.parse(content) as Record<string, any> || {} :
                   JSON.parse(content);
        } catch(err) {
            console.error("Error reading file:", err);
            return {};
        }
    }

    private _writeData(data: Record<string, any>): void {
        try {
            const content = this.fileType === "yaml" ? yaml.dump(data) :
                            this.fileType === "toml" ? toml.stringify(data) :
                            JSON.stringify(data, null, 4);

            fs.writeFileSync(this.filePath, content, "utf-8");
        } catch(err) {
            console.error("Error writing to file:", err);
        }
    }

    public set(key: string, value: any): void {
        const data = this._readData();

        data[key] = value;

        console.log(`Saving data: ${JSON.stringify(data)}`);

        this._writeData(data);
        this._notifyObservers(key, value);
    }

    public get<T = any>(key: string, defaultValue: T | null = null): T | null {
        const data = this._readData();

        return data[key] !== undefined ? data[key] as T : defaultValue;
    }

    public delete(key: string): void {
        const data = this._readData();

        delete data[key];

        this._writeData(data);
    }

    public clear(): void {
        this._writeData({});
    }

    public onChange(key: string, callback: Observer): void {
        if(!this.observers[key]) {
            this.observers[key] = [];
        }

        this.observers[key].push(callback);
    }

    private _notifyObservers(key: string, value: any): void {
        if(this.observers[key]) {
            this.observers[key].forEach(callback => callback(value));
        }
    }

    public backup(): string {
        const backupDir = path.join(path.dirname(this.filePath), "appBackup");

        if(!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const now = new Date();

        const formattedDate = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;

        const backupFile = path.join(backupDir, `backup-${formattedDate}.${this.fileType}`);

        fs.copyFileSync(this.filePath, backupFile);

        return backupFile;
    }

    public restore(timestamp: string): void {
        const backupDir = path.join(path.dirname(this.filePath), "appBackup");
        const backupFile = path.join(backupDir, `backup-${timestamp}.${this.fileType}`);

        if(!fs.existsSync(backupFile)) {
            console.log("Backup not found:", backupFile);
            return;
        }

        fs.copyFileSync(backupFile, this.filePath);
        this._readData();

        console.log("Backup restored:", backupFile);
    }

    public mask(data: any): string {
        if(!this.encryptionKey) {
            throw new Error("Encryption key not defined");
        }

        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(this.encryptionKey), iv);

        let encrypted = cipher.update(JSON.stringify(data), "utf-8", "hex");

        encrypted += cipher.final("hex");

        return iv.toString("hex") + encrypted;
    }

    public unmask<T = any>(encryptedData: string): T {

        if(!this.encryptionKey) {
            throw new Error("Encryption key not defined");
        };

        const iv = Buffer.from(encryptedData.substring(0, 32), "hex");
        const encrypted = encryptedData.substring(32);

        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(this.encryptionKey), iv);

        let decrypted = decipher.update(encrypted, "hex", "utf-8");

        decrypted += decipher.final("utf-8");

        return JSON.parse(decrypted) as T;
    };
};
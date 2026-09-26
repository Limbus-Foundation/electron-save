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
import Ajv from "ajv";
const defaultPath = path.join(os.homedir(), "appConfig.json");
;
export class ElectronSave {
    filePath;
    fileType;
    schema;
    ajv;
    encryptionKey;
    observers;
    constructor(filePath = defaultPath, options = {}) {
        this.filePath = filePath;
        this.fileType = options.type || "json";
        this.schema = options.schema || null;
        this.ajv = new Ajv();
        this.encryptionKey = options.encryptionKey || null;
        this.observers = {};
        this._validateFileType();
        return new Proxy(this, {
            get: (target, prop) => {
                if (typeof target[prop] !== "undefined")
                    return target[prop];
                return (value) => target.set(String(prop), value);
            }
        });
    }
    _validateFileType() {
        if (!["json", "yaml", "toml"].includes(this.fileType)) {
            throw new Error("Invalid file format");
        }
    }
    setPath(newPath) {
        this.filePath = newPath;
    }
    getPath() {
        return this.filePath;
    }
    setEncryptionKey(key) {
        if (!key || key.length !== 32) {
            throw new Error("Encryption key must be 32 characters long");
        }
        this.encryptionKey = key;
    }
    setSchema(schema) {
        this.schema = schema;
    }
    validate() {
        if (!this.schema)
            return null;
        const data = this._readData();
        const validate = this.ajv.compile(this.schema);
        if (!validate(data))
            return validate.errors || [];
        return null;
    }
    _readData() {
        try {
            if (!fs.existsSync(this.filePath)) {
                this._writeData({});
                return {};
            }
            const content = fs.readFileSync(this.filePath, "utf-8");
            return this.fileType === "yaml" ? yaml.load(content) || {} :
                this.fileType === "toml" ? toml.parse(content) || {} :
                    JSON.parse(content);
        }
        catch (err) {
            console.error("Error reading file:", err);
            return {};
        }
    }
    _writeData(data) {
        try {
            const content = this.fileType === "yaml" ? yaml.dump(data) :
                this.fileType === "toml" ? toml.stringify(data) :
                    JSON.stringify(data, null, 4);
            fs.writeFileSync(this.filePath, content, "utf-8");
        }
        catch (err) {
            console.error("Error writing to file:", err);
        }
    }
    _splitKey(key) {
        const keys = key.split(".");
        if (keys.some(part => !part || ["__proto__", "prototype", "constructor"].includes(part))) {
            throw new Error("Invalid key path");
        }
        return keys;
    }
    ;
    _getNested(data, key) {
        const keys = this._splitKey(key);
        let current = data;
        for (const part of keys) {
            if (current === null || typeof current !== "object" || !Object.prototype.hasOwnProperty.call(current, part))
                return undefined;
            current = current[part];
        }
        return current;
    }
    ;
    _getParent(data, key, create) {
        const keys = this._splitKey(key);
        const property = keys.pop();
        let current = data;
        for (const part of keys) {
            if (current === null || typeof current !== "object")
                return null;
            if (!Object.prototype.hasOwnProperty.call(current, part)) {
                if (!create)
                    return null;
                current[part] = {};
            }
            if (current[part] === null || typeof current[part] !== "object") {
                if (!create)
                    return null;
                throw new TypeError(`"${part}" is not an object`);
            }
            current = current[part];
        }
        return { parent: current, property };
    }
    ;
    set(key, value) {
        const data = this._readData();
        const target = this._getParent(data, key, true);
        if (!target)
            throw new Error(`Invalid key path: "${key}"`);
        target.parent[target.property] = value;
        console.log(`Saving data: ${JSON.stringify(data)}`);
        this._writeData(data);
        this._notifyObservers(key, value);
    }
    ;
    get(key, defaultValue = null) {
        const data = this._readData();
        const value = this._getNested(data, key);
        return value !== undefined ? value : defaultValue;
    }
    ;
    delete(key) {
        const data = this._readData();
        const target = this._getParent(data, key, false);
        if (!target)
            return;
        if (Array.isArray(target.parent) && /^(0|[1-9]\d*)$/.test(target.property)) {
            target.parent.splice(Number(target.property), 1);
        }
        else {
            delete target.parent[target.property];
        }
        this._writeData(data);
    }
    ;
    clear() {
        this._writeData({});
    }
    onChange(key, callback) {
        if (!this.observers[key]) {
            this.observers[key] = [];
        }
        this.observers[key].push(callback);
    }
    _notifyObservers(key, value) {
        if (this.observers[key]) {
            this.observers[key].forEach(callback => callback(value));
        }
    }
    backup() {
        const backupDir = path.join(path.dirname(this.filePath), "appBackup");
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const now = new Date();
        const formattedDate = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}-${now.getFullYear()}-${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
        const backupFile = path.join(backupDir, `backup-${formattedDate}.${this.fileType}`);
        fs.copyFileSync(this.filePath, backupFile);
        return backupFile;
    }
    restore(timestamp) {
        const backupDir = path.join(path.dirname(this.filePath), "appBackup");
        const backupFile = path.join(backupDir, `backup-${timestamp}.${this.fileType}`);
        if (!fs.existsSync(backupFile)) {
            console.log("Backup not found:", backupFile);
            return;
        }
        fs.copyFileSync(backupFile, this.filePath);
        this._readData();
        console.log("Backup restored:", backupFile);
    }
    mask(data) {
        if (!this.encryptionKey) {
            throw new Error("Encryption key not defined");
        }
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(this.encryptionKey), iv);
        let encrypted = cipher.update(JSON.stringify(data), "utf-8", "hex");
        encrypted += cipher.final("hex");
        return iv.toString("hex") + encrypted;
    }
    unmask(encryptedData) {
        if (!this.encryptionKey) {
            throw new Error("Encryption key not defined");
        }
        ;
        const iv = Buffer.from(encryptedData.substring(0, 32), "hex");
        const encrypted = encryptedData.substring(32);
        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(this.encryptionKey), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return JSON.parse(decrypted);
    }
    ;
    push(key, index, value) {
        const array = this.get(key, []);
        if (!Array.isArray(array))
            throw new TypeError(`"${key}" is not an array`);
        if (!Number.isInteger(index) || index < 0 || index > array.length)
            throw new RangeError("Invalid array index");
        array.splice(index, 0, value);
        this.set(key, array);
    }
    ;
    pop(key, index) {
        const array = this.get(key, []);
        if (!Array.isArray(array))
            throw new TypeError(`"${key}" is not an array`);
        if (!Number.isInteger(index) || index < 0 || index >= array.length)
            return undefined;
        const [removed] = array.splice(index, 1);
        this.set(key, array);
        return removed;
    }
    ;
}
;
//# sourceMappingURL=electron-save.js.map
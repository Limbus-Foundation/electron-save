/*---------------------------------------------------------------------------------------------*
 *  copyright (c) 2025 Limbus Foundation & Community. CREATED IN 19/03/2025 DD/MM/YYYY        *
 *  module repo - https://github.com/Limbus-Foundation/electron-save                           *
 *  maintainer org -  https://github.com/Limbus-Foundation                                     *
 *---------------------------------------------------------------------------------------------*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const yaml = require("js-yaml");
const toml = require("@iarna/toml");
const Ajv = require("ajv");
const os = require('os');

const defaultPath = path.join(os.homedir(), "appConfig.json");

class ElectronSave {
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
                if (typeof target[prop] !== "undefined") return target[prop];
                return (value) => target.set(prop, value);
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

    _readData() {
        try {
            // Check if file exists, and create it if not
            if (!fs.existsSync(this.filePath)) {
                this._writeData({});  // Creates an empty file if it doesn't exist
                return {};
            }
            const content = fs.readFileSync(this.filePath, "utf-8");
            return this.fileType === "yaml" ? yaml.load(content) || {} :
                   this.fileType === "toml" ? toml.parse(content) || {} :
                   JSON.parse(content);
        } catch (err) {
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
        } catch (err) {
            console.error("Error writing to file:", err);
        }
    }

    set(key, value) {
        const data = this._readData();

        // Add or modify the key in the data object
        data[key] = value;

        // Check if all required keys are present before saving
        if (this.schema) {
            const validate = this.ajv.compile(this.schema);
            const valid = validate(data);
            if (!valid) {
                console.error("Schema validation error:", validate.errors);
                return;  // Don't save if validation fails
            }
        }

        console.log(`Saving data: ${JSON.stringify(data)}`); // Log to verify what is being saved
        // If valid, save the data
        this._writeData(data);
        this._notifyObservers(key, value);
    }

    get(key) {
        const data = this._readData();
        return data[key];
    }

    delete(key) {
        const data = this._readData();
        delete data[key];
        this._writeData(data);
    }

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

        // Get the current date
        const now = new Date();

        // Format the date in dd-mm-yyyy-hh-mm-ss pattern
        const formattedDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;

        // Backup file name with the formatted date
        const backupFile = path.join(backupDir, `backup-${formattedDate}.json`);

        // Copy the file to the new backup
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
        const iv = Buffer.from(encryptedData.substring(0, 32), "hex");
        const encrypted = encryptedData.substring(32);
        const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(this.encryptionKey), iv);
        let decrypted = decipher.update(encrypted, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return JSON.parse(decrypted);
    }
}

module.exports = ElectronSave;

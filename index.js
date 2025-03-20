
/*---------------------------------------------------------------------------------------------*
 *  copyright (c) 2025 Limbus Foundation & Community. CREACTED IN 19/03/2025 DD/MM/YYYYY       *
 *  module repo - https://github.com/Limbus-Foundation/electron-save                           *
 *  maintainer org -  https://github.com/Limbus-Foundation                                     *
 *---------------------------------------------------------------------------------------------*/

const fs = require("fs");
const path = require("path");
const os = require("os");

class ElectronSave {
    constructor() {
        this.filePath = path.join(os.homedir(), "appConfig.json");
        this._ensureFileExists();
    }

    setPath(pathtojson) {
        if (!path.isAbsolute(pathtojson)) {
            throw new Error("O caminho deve ser absoluto!");
        }
        this.filePath = pathtojson || path.join(os.homedir(), "appConfig.json");
        this._ensureFileExists();
    }

    getPath() {
        return this.filePath;
    }

    backup(pathtoBackup) {
        const backupDir = pathtoBackup || path.join(path.dirname(this.filePath), "appBackup");
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

        const now = new Date();
        const timestamp = [
            String(now.getMonth() + 1).padStart(2, "0"), 
            String(now.getDate()).padStart(2, "0"), 
            now.getFullYear(), 
            String(now.getHours()).padStart(2, "0"), 
            String(now.getMinutes()).padStart(2, "0"), 
            String(now.getSeconds()).padStart(2, "0") 
        ].join("-");

        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

        fs.copyFileSync(this.filePath, backupFile);
        console.log("Backup criado em:", backupFile);
    }

    restore(timestamp) {
        const backupDir = path.join(path.dirname(this.filePath), "appBackup");
        const backupFile = path.join(backupDir, `backup-${timestamp}.json`);

        if (!fs.existsSync(backupFile)) {
            console.log("Backup não encontrado:", backupFile);
            return;
        }

        fs.copyFileSync(backupFile, this.filePath);

        console.log("Backup restaurado:", backupFile);
    }

    set(key, value) {
        const data = this._readData();
        if (typeof value === "object" && value !== null) {
            data[key] = { ...(data[key] || {}), ...value };
        } else {
            data[key] = value;
        }
        this._writeData(data);
    }

    get(key, defaultValue = null) {
        const data = this._readData();
        return data.hasOwnProperty(key) ? data[key] : defaultValue;
    }

    delete(key) {
        const data = this._readData();
        if (data.hasOwnProperty(key)) {
            delete data[key];
            this._writeData(data);
        }
    }

    clear() {
        this._writeData({});
    }

    _ensureFileExists() {
        if (!fs.existsSync(this.filePath)) {
            fs.writeFileSync(this.filePath, JSON.stringify({}, null, 2));
        }
    }

    _readData() {
        try {
            return JSON.parse(fs.readFileSync(this.filePath, "utf-8"));
        } catch (err) {
            return {};
        }
    }

    _writeData(data) {
        fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2));
    }
}

module.exports = ElectronSave;




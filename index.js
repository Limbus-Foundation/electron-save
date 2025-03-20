
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

    static pathDefine(customPath) {
        this.prototype.filePath = customPath || path.join(os.homedir(), "appConfig.json");
        this.prototype._ensureFileExists();
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

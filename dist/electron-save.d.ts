import { ErrorObject } from "ajv";
interface IElectronSave {
    type?: "json" | "yaml" | "toml";
    schema?: Record<string, any>;
    encryptionKey?: string;
}
type Observer = (value: any) => void;
export declare class ElectronSave {
    private filePath;
    private fileType;
    private schema;
    private ajv;
    private encryptionKey;
    private observers;
    constructor(filePath?: string, options?: IElectronSave);
    private _validateFileType;
    setPath(newPath: string): void;
    getPath(): string;
    setEncryptionKey(key: string): void;
    setSchema(schema: Record<string, any>): void;
    validate(): ErrorObject[] | null;
    private _readData;
    private _writeData;
    set(key: string, value: any): void;
    get<T = any>(key: string, defaultValue?: T | null): T | null;
    delete(key: string): void;
    clear(): void;
    onChange(key: string, callback: Observer): void;
    private _notifyObservers;
    backup(): string;
    restore(timestamp: string): void;
    mask(data: any): string;
    unmask<T = any>(encryptedData: string): T;
}
export {};

// INDEX [EXAMPLE] : 

import { ElectronSave } from "../dist/electron-save.js";

const save = new ElectronSave("./myfileconfig.json", { type: "json" });

console.log("File path: " + save.getPath());

const encryptionKey = "0123456789abcdef0123456789abcdef";

save.setEncryptionKey(encryptionKey);

save.setSchema({
    type: "object",
    properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 27 }
    },
    required: ["name", "age"]
});

save.set("name", "Rhyan");
save.set("age", 30);

console.log("Name saved: " + save.get("name"));
console.log("Age saved: " + save.get("age"));

save.onChange("name", (newValue) => {
    console.log("Name updated to: " + newValue);
});

save.set("name", "Eduardo");

const backupPath = save.backup();

console.log("Backup created at: " + backupPath);

const timestamp = "03-20-2025-05-55-44";

save.restore(timestamp);

console.log("Backup restored.");

const encryptedData = save.mask({ name: "Rhyan", age: 25 });

console.log("Encrypted data: " + encryptedData);

const decryptedData = save.unmask(encryptedData);

console.log("Decrypted data:", decryptedData);

// save.clear();
// console.log("All data has been cleared.");
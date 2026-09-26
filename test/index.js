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
        age: { type: "integer", minimum: 18 },
        profile: {
            type: "object",
            properties: {
                username: { type: "string" },
                preferences: {
                    type: "object",
                    properties: {
                        language: { type: "string" },
                        notifications: { type: "boolean" }
                    }
                }
            }
        },
        items: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "string" },
                    name: { type: "string" }
                },
                required: ["id", "name"]
            }
        }
    },
    required: ["name", "age"]
});

// BASIC OPERATIONS :

save.set("name", "Rhyan");

save.set("age", 30);

console.log("Name saved: " + save.get("name"));

console.log("Age saved: " + save.get("age"));

// OBSERVERS :

save.onChange("name", (newValue) => {
    console.log("Name updated to: " + newValue);
});

save.set("name", "Eduardo");

// NESTED KEYS :

save.set("profile.username", "rhyan");

save.set("profile.preferences.language", "en");

save.set("profile.preferences.notifications", true);

console.log("Profile:", save.get("profile"));

console.log("Username:", save.get("profile.username"));

console.log("Language:", save.get("profile.preferences.language"));

console.log("Notifications:", save.get("profile.preferences.notifications"));

// NESTED OBSERVERS :

save.onChange("profile.preferences.language", (newValue) => {
    console.log("Language updated to:", newValue);
});

save.set("profile.preferences.language", "pt-BR");

// ARRAY OPERATIONS :

save.set("items", []);

save.push("items", 0, {
    id: "1",
    name: "First Item"
});

save.push("items", 1, {
    id: "2",
    name: "Second Item"
});

console.log("Items:", save.get("items"));

// ACCESS ARRAY ITEMS USING NESTED KEYS :

console.log("First item:", save.get("items.0"));

console.log("First item name:", save.get("items.0.name"));

save.set("items.0.name", "Updated Item");

console.log("Updated item:", save.get("items.0"));

// INSERT AN ITEM AT A SPECIFIC INDEX :

save.push("items", 0, {
    id: "3",
    name: "Inserted Item"
});

console.log("Items after insertion:", save.get("items"));

// REMOVE AN ITEM AT A SPECIFIC INDEX :

const removedItem = save.pop("items", 1);

console.log("Removed item:", removedItem);

console.log("Remaining items:", save.get("items"));

// NESTED ARRAYS :

save.set("profile.preferences.tags", []);

save.push("profile.preferences.tags", 0, "first");

save.push("profile.preferences.tags", 0, "second");

console.log("Tags:", save.get("profile.preferences.tags"));

save.pop("profile.preferences.tags", 0);

console.log("Updated tags:", save.get("profile.preferences.tags"));

// DELETE NESTED KEYS :

save.delete("profile.preferences.notifications");

console.log("Notifications after deletion:", save.get("profile.preferences.notifications"));

// SCHEMA VALIDATION :

const validationErrors = save.validate();

console.log("Validation errors:", validationErrors);

// BACKUP :

const backupPath = save.backup();

console.log("Backup created at: " + backupPath);

// RESTORE :

const timestamp = "03-20-2025-05-55-44";

// Uncomment when this backup exists:

// save.restore(timestamp);

// console.log("Backup restored.");

// ENCRYPTION :

const encryptedData = save.mask({ name: "Rhyan", age: 25 });

console.log("Encrypted data:", encryptedData);

const decryptedData = save.unmask(encryptedData);

console.log("Decrypted data:", decryptedData);

// CLEAR :

// save.clear();

// console.log("All data has been cleared.");
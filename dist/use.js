
const ElectronSave = require("../index.js");

// Creating an instance and setting the file path
const save = new ElectronSave("C:\\Users\\Rhyan Eduardo\\Desktop\\myfileconfig.json", { type: "json" });

console.log("File path: " + save.getPath());

// Setting the encryption key (must be 32 characters)
const encryptionKey = "0123456789abcdef0123456789abcdef";
save.setEncryptionKey(encryptionKey);

// Setting the validation schema
save.setSchema({
    type: "object",
    properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 27 }  // Minimum restriction for age
    },
    required: ["name", "age"]
});

// Saving data, ensuring that "age" is saved before validation
save.set("name", "Rhyan");
save.set("age", 30); // Now, "age" is correctly set

// Check and log the data
console.log("Name saved: " + save.get("name"));
console.log("Age saved: " + save.get("age"));

// Force validation after saving
setTimeout(() => {
    const validationErrors = save.validate(); // Assuming there is a validation method
    if (validationErrors) {
        console.log("Validation error:", validationErrors);
    } else {
        console.log("Validation successful!");
    }
}, 3000);

// Adding a listener for changes
save.onChange("name", (newValue) => {
    console.log("Name updated to: " + newValue);
});

// Updating the "name" value
save.set("name", "Eduardo");

// Creating a backup of the file
const backupPath = save.backup();
console.log("Backup created at: " + backupPath);

// Restoring the backup
const timestamp = '03-20-2025-05-55-44';
save.restore(timestamp);
console.log("Backup restored.");

// Testing encryption and decryption
const encryptedData = save.mask({ name: "Rhyan", age: 25 });
console.log("Encrypted data: " + encryptedData);

const decryptedData = save.unmask(encryptedData);
console.log("Decrypted data:", decryptedData);

// Clearing all data from the file
// save.clear();
// console.log("All data has been cleared.");

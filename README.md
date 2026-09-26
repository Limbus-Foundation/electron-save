![ElectronSave](https://github.com/user-attachments/assets/3c30a01c-628c-4cf5-a18e-9176ff4f0de8)

# ElectronSave

Save Electron (or any other Node.js app) data locally using JSON, YAML, or TOML.

## Installation

Install ElectronSave using npm:

```sh
npm install @limbusfoundation/electronsave
```

## Usage

ElectronSave uses ES Modules and provides a named `ElectronSave` export:

```javascript
import { ElectronSave } from "@limbusfoundation/electronsave";

const config = new ElectronSave();
```

By default, the configuration file is stored in the user's home directory as `appConfig.json`.

You can specify a custom path and file format:

```javascript
const config = new ElectronSave("./config.json", {
    type: "json"
});
```

Supported file types:

* `json`
* `yaml`
* `toml`

You can also configure a schema and encryption key when creating the instance:

```javascript
const config = new ElectronSave("./config.json", {
    type: "json",
    schema: {
        type: "object"
    },
    encryptionKey: "0123456789abcdef0123456789abcdef"
});
```

## Methods

### `setPath(newPath)`

Sets a custom path for the configuration file.

* `newPath` (`string`) - Path to the configuration file.

```javascript
config.setPath("./config.json");
```

### `getPath()`

Returns the current configuration file path.

```javascript
const path = config.getPath();

console.log(path);
```

### `setEncryptionKey(key)`

Sets the encryption key used by `mask()` and `unmask()`.

* `key` (`string`) - Must contain exactly 32 characters.

```javascript
config.setEncryptionKey("0123456789abcdef0123456789abcdef");
```

### `setSchema(schema)`

Sets a JSON Schema used to validate the configuration data.

* `schema` (`object`) - JSON Schema object.

```javascript
config.setSchema({
    type: "object",
    properties: {
        name: { type: "string" },
        age: { type: "integer" }
    },
    required: ["name", "age"]
});
```

### `set(key, value)`

Saves a value to the configuration file.

* `key` (`string`) - Property name or nested property path.
* `value` (`any`) - Value to store.

Nested keys can be accessed using `.` as a separator. Missing intermediate objects are created automatically.

```javascript
config.set("theme", "dark");

config.set("user", {
    name: "John",
    age: 30
});

config.set("user.preferences.language", "en");
config.set("user.preferences.notifications", true);
```

The resulting configuration can be:

```json
{
    "theme": "dark",
    "user": {
        "name": "John",
        "age": 30,
        "preferences": {
            "language": "en",
            "notifications": true
        }
    }
}
```

`set()` persists data without automatically validating the entire document against the schema.

### `get(key, defaultValue)`

Retrieves a value from the configuration file.

* `key` (`string`) - Property name or nested property path.
* `defaultValue` (`any`) - Value returned when the key does not exist.

```javascript
const theme = config.get("theme", "light");

const language = config.get("user.preferences.language", "en");

console.log(theme);
console.log(language);
```

Nested array items can also be accessed using numeric path segments:

```javascript
const firstItem = config.get("items.0");
const firstItemName = config.get("items.0.name");
```

### `delete(key)`

Removes a property from the configuration file.

* `key` (`string`) - Property name or nested property path.

```javascript
config.delete("theme");

config.delete("user.preferences.notifications");
```

Array items can also be removed using nested paths:

```javascript
config.delete("items.0");
```

When deleting an array item through a numeric path, the remaining items are shifted automatically.

### `clear()`

Removes all data from the configuration file.

```javascript
config.clear();
```

### `push(key, index, value)`

Inserts a value into an array at a specific index.

* `key` (`string`) - Property name or nested property path containing an array.
* `index` (`number`) - Index where the value should be inserted.
* `value` (`any`) - Value to insert.

```javascript
config.set("items", []);

config.push("items", 0, {
    id: "1",
    name: "First Item"
});

config.push("items", 1, {
    id: "2",
    name: "Second Item"
});
```

Nested arrays are supported:

```javascript
config.set("user.preferences.tags", []);

config.push("user.preferences.tags", 0, "javascript");
config.push("user.preferences.tags", 1, "electron");
```

The index can be anywhere from `0` to the current array length.

### `pop(key, index)`

Removes and returns a value from an array at a specific index.

* `key` (`string`) - Property name or nested property path containing an array.
* `index` (`number`) - Index of the value to remove.

```javascript
const removedItem = config.pop("items", 0);

console.log(removedItem);
```

Nested arrays are supported:

```javascript
const removedTag = config.pop("user.preferences.tags", 0);

console.log(removedTag);
```

If the index is invalid, `pop()` returns `undefined`.

### `validate()`

Validates the current configuration data against the schema configured with `setSchema()`.

Returns:

* `null` when the data is valid or no schema is configured.
* An array of AJV `ErrorObject`s when validation fails.

```javascript
const errors = config.validate();

if(errors) {
    console.log("Validation error:", errors);
} else {
    console.log("Validation successful!");
}
```

Example:

```javascript
const config = new ElectronSave("./config.json");

config.setSchema({
    type: "object",
    properties: {
        name: { type: "string" },
        age: { type: "integer", minimum: 18 }
    },
    required: ["name", "age"]
});

config.set("name", "Rhyan");
config.set("age", 23);

const errors = config.validate();

if(errors) {
    console.log("Validation error:", errors);
}
```

### `backup()`

Creates a backup of the current configuration file.

Backups are stored in an `appBackup` directory next to the configuration file.

The filename uses the following format:

```text
backup-MM-DD-YYYY-HH-MM-SS.<fileType>
```

For example:

```text
appBackup/backup-09-24-2026-03-05-58.json
```

```javascript
const backupPath = config.backup();

console.log("Backup created at:", backupPath);
```

### `restore(timestamp)`

Restores a backup using its timestamp.

* `timestamp` (`string`) - Timestamp portion of the backup filename.

```javascript
config.restore("09-24-2026-03-05-58");
```

The backup extension automatically follows the configured file type.

### `onChange(key, callback)`

Adds an observer for a specific key.

* `key` (`string`) - Property name or nested property path.
* `callback` (`function`) - Function called when the key is updated.

```javascript
config.onChange("theme", (newValue) => {
    console.log(`Theme changed to: ${newValue}`);
});

config.set("theme", "dark");
```

Nested keys are also supported:

```javascript
config.onChange("user.preferences.language", (newValue) => {
    console.log("Language changed to:", newValue);
});

config.set("user.preferences.language", "pt-BR");
```

### `mask(data)`

Encrypts data using AES-256-CBC.

* `data` (`any`) - Data to encrypt.

An encryption key must be configured before using this method.

```javascript
config.setEncryptionKey("0123456789abcdef0123456789abcdef");

const encryptedData = config.mask({
    sensitive: "data"
});

console.log(encryptedData);
```

### `unmask(encryptedData)`

Decrypts data previously encrypted with `mask()`.

* `encryptedData` (`string`) - Encrypted data.

```javascript
const decryptedData = config.unmask(encryptedData);

console.log(decryptedData);
```

## Nested Keys

ElectronSave supports dot-separated paths for accessing nested properties.

```javascript
config.set("profile.username", "rhyan");
config.set("profile.preferences.language", "en");
config.set("profile.preferences.notifications", true);

console.log(config.get("profile.username"));
console.log(config.get("profile.preferences.language"));
console.log(config.get("profile.preferences.notifications"));
```

This produces:

```json
{
    "profile": {
        "username": "rhyan",
        "preferences": {
            "language": "en",
            "notifications": true
        }
    }
}
```

Nested paths also work with arrays:

```javascript
config.set("items", []);

config.push("items", 0, {
    id: "1",
    name: "First Item"
});

config.set("items.0.name", "Updated Item");

console.log(config.get("items.0.name"));
```

Nested paths are supported by:

* `set()`
* `get()`
* `delete()`
* `push()`
* `pop()`
* `onChange()`

A `.` in a key is interpreted as a path separator and cannot currently be used as part of a literal property name.

## Schema Validation

ElectronSave uses [AJV](https://ajv.js.org/) for JSON Schema validation.

Schemas can be used to validate:

* Strings
* Numbers
* Integers
* Booleans
* Objects
* Arrays
* Null values
* Required properties
* String lengths
* Numeric ranges
* Regular expressions
* Array sizes
* Unique array items
* Enumerations
* Conditional schemas
* Additional properties

### Example Schema

```javascript
const schema = {
    type: "object",
    properties: {
        theme: {
            type: "string"
        },
        user: {
            type: "object",
            properties: {
                name: {
                    type: "string"
                },
                age: {
                    type: "integer"
                }
            },
            required: ["name", "age"]
        }
    },
    required: ["theme", "user"]
};

config.setSchema(schema);
```

### Validation

Schema validation is performed explicitly using `validate()`.

```javascript
config.set("theme", "dark");

config.set("user", {
    name: "John",
    age: 30
});

const errors = config.validate();

if(errors) {
    console.log("Validation error:", errors);
} else {
    console.log("Validation successful!");
}
```

This allows data to be built incrementally before validating the complete configuration.

## File Formats

ElectronSave supports three configuration formats.

### JSON

```javascript
const config = new ElectronSave("./config.json", {
    type: "json"
});
```

### YAML

```javascript
const config = new ElectronSave("./config.yaml", {
    type: "yaml"
});
```

### TOML

```javascript
const config = new ElectronSave("./config.toml", {
    type: "toml"
});
```

Backups automatically use the configured file extension.

## Notes

* The default configuration path is `<user-home>/appConfig.json`.
* Custom paths can be provided through the constructor or `setPath()`.
* JSON, YAML, and TOML are supported.
* Dot-separated paths can be used to access nested objects and arrays.
* `set()` automatically creates missing intermediate objects for nested paths.
* `set()` persists data without performing schema validation.
* `get()` supports default values when a path does not exist.
* `push()` inserts values into arrays at a specific index.
* `pop()` removes and returns a value from an array at a specific index.
* `validate()` explicitly validates the current configuration against the configured schema.
* Backups are stored inside an `appBackup` directory next to the configuration file.
* Restoring a backup completely replaces the current configuration file.
* An encryption key must contain exactly 32 characters before using `mask()` or `unmask()`.
* `mask()` and `unmask()` use AES-256-CBC.
* A `.` in a key is interpreted as a nested path separator.

## License

This project is licensed under the MIT License.

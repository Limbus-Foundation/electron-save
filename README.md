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

Saves a key-value pair to the configuration file.

* `key` (`string`) - The property name.
* `value` (`any`) - The value to store.

`set()` persists data without automatically validating the entire document against the schema.

```javascript
config.set("theme", "dark");

config.set("user", {
    name: "John",
    age: 30
});
```

### `get(key, defaultValue)`

Retrieves a value from the configuration file.

* `key` (`string`) - The property name.
* `defaultValue` (`any`) - Value returned when the key does not exist.

```javascript
const theme = config.get("theme", "light");

console.log(theme);
```

### `delete(key)`

Removes a key from the configuration file.

* `key` (`string`) - The property name to delete.

```javascript
config.delete("theme");
```

### `clear()`

Removes all data from the configuration file.

```javascript
config.clear();
```

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

* `key` (`string`) - The property name.
* `callback` (`function`) - Function called when the key is updated.

```javascript
config.onChange("theme", (newValue) => {
    console.log(`Theme changed to: ${newValue}`);
});

config.set("theme", "dark");
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

ElectronSave supports three configuration formats:

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
* `set()` persists data without performing schema validation.
* `validate()` explicitly validates the current configuration against the configured schema.
* Backups are stored inside an `appBackup` directory next to the configuration file.
* Restoring a backup completely replaces the current configuration file.
* An encryption key must contain exactly 32 characters before using `mask()` or `unmask()`.
* `mask()` and `unmask()` use AES-256-CBC.

## License

This project is licensed under the MIT License.

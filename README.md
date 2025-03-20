<img style="width: 100%; box-sizing: border-box;" src="https://github.com/user-attachments/assets/3c30a01c-628c-4cf5-a18e-9176ff4f0de8" alt="Limbus Foundation Logo" width="200">

# ElectronSave

Save Electron (or any other Node.js app) data locally as JSON.

## Installation

To install ElectronSave, use npm:

```sh
npm install @limbusfoundation/electronsave
```

## Usage

Import the module and create an instance:

```javascript
const ElectronSave = require("@limbusfoundation/electronsave");
const config = new ElectronSave();
```

By default, the configuration file is stored in the user's home directory as `appConfig.json`. You can specify a custom path:

```javascript
config.setPath("/absolute/path/to/config.json");
```

### Methods

#### `setPath(newPath)`

Sets a custom path for the configuration file.

- `newPath` (string) - Must be an absolute path.

#### `getPath()`

Returns the current path of the configuration file.

#### `setEncryptionKey(key)`

Sets an encryption key for secure storage.

- `key` (string) - Must be 32 characters long.

#### `setSchema(schema)`

Sets a JSON schema for validating the configuration file data.

- `schema` (object) - JSON schema object.

#### `set(key, value)`

Saves a key-value pair in the configuration file.

- `key` (string) - The property name.
- `value` (any) - The value to store.

**Example:**

```javascript
config.set("theme", "dark");
config.set("user", { name: "John", age: 30 });
```

#### `get(key)`

Retrieves a value from the configuration file.

- `key` (string) - The property name.

**Example:**

```javascript
const theme = config.get("theme", "light");
console.log(theme); // Outputs: "dark"
```

#### `delete(key)`

Removes a key from the configuration file.

- `key` (string) - The property name to delete.

**Example:**

```javascript
config.delete("theme");
```

#### `clear()`

Removes all data from the configuration file.

**Example:**

```javascript
config.clear();
```

#### `backup()`

Creates a backup of the current configuration file.

- The backup file is saved with a timestamp format: `backup-MM-DD-YYYY-HH-MM-SS.json`.

**Example:**

```javascript
config.backup(); // Saves backup to default location
```

#### `restore(timestamp)`

Restores a backup from the given timestamp.

- `timestamp` (string) - The timestamp portion of the backup filename, formatted as `MM-DD-YYYY-HH-MM-SS`.

**Example:**

```javascript
config.restore("03-20-2025-14-30-00"); // Restores from 'backup-03-20-2025-14-30-00.json'
```

#### `onChange(key, callback)`

Adds an observer for a key. The callback will be triggered when the key changes.

- `key` (string) - The property name.
- `callback` (function) - The function to call when the key changes.

**Example:**

```javascript
config.onChange("theme", (newValue) => {
    console.log(`Theme changed to: ${newValue}`);
});
```

#### `mask(data)`

Encrypts the data using the AES-256-CBC algorithm.

- `data` (any) - The data to encrypt.

**Example:**

```javascript
const encrypted = config.mask({ sensitive: "data" });
```

#### `unmask(encryptedData)`

Decrypts the data using the AES-256-CBC algorithm.

- `encryptedData` (string) - The encrypted data to decrypt.

**Example:**

```javascript
const decrypted = config.unmask(encryptedData);
```

## Learn Schema Validation 

### JSON Schema Validation Types

1. **Type Validations:**
   - `"type": "string"`
   - `"type": "number"`
   - `"type": "integer"`
   - `"type": "boolean"`
   - `"type": "object"`
   - `"type": "array"`
   - `"type": "null"`
   - `"type": "any"`

2. **String Validation:**
   - `"minLength": <number>` – Minimum length of the string.
   - `"maxLength": <number>` – Maximum length of the string.
   - `"pattern": <regex>` – The string must match the regular expression.

3. **Number Validation:**
   - `"minimum": <number>` – Minimum value of the number.
   - `"maximum": <number>` – Maximum value of the number.
   - `"exclusiveMinimum": <number>` – Exclusive minimum value (greater than the specified number).
   - `"exclusiveMaximum": <number>` – Exclusive maximum value (less than the specified number).
   - `"multipleOf": <number>` – The number must be a multiple of the specified value.

4. **Array Validation:**
   - `"minItems": <number>` – Minimum number of items in the array.
   - `"maxItems": <number>` – Maximum number of items in the array.
   - `"uniqueItems": true` – All items in the array must be unique.

5. **Object Validation:**
   - `"properties": {}` – Define properties for objects and their types.
   - `"required": [<propertyName>]` – Specifies required properties for an object.
   - `"additionalProperties": false` – Disallow properties that are not defined in `properties`.

6. **Enum Validation:**
   - `"enum": [<value1>, <value2>, ...]` – The value must be one of the listed options.

7. **Conditional Validation:**
   - `"if"`, `"then"`, `"else"` – Conditional validation based on the value of another property.
   Example:
   ```json
   {
     "if": {
       "properties": { "status": { "const": "active" } }
     },
     "then": {
       "properties": { "activationDate": { "type": "string" } }
     },
     "else": {
       "properties": { "activationDate": { "type": "null" } }
     }
   }


### `setSchema(schema)`

Defines a JSON schema to validate the configuration file data.

#### Validation process:
1. **Schema definition**: The schema specifies the structure, data types, and required fields for the configuration.
   Example:
   ```json
   {
     "type": "object",
     "properties": {
       "theme": { "type": "string" },
       "user": {
         "type": "object",
         "properties": {
           "name": { "type": "string" },
           "age": { "type": "integer" }
         },
         "required": ["name", "age"]
       }
     },
     "required": ["theme", "user"]
   }
   ```

2. **Validation**: When saving data with `set(key, value)`, the data is validated against the schema. If invalid (wrong type, missing fields), it won't be saved, and an error is logged.

3. **Error handling**: If validation fails, the error details are available in `validate.errors` from the `Ajv` validator.

#### Example:
```javascript
const config = new ElectronSave();
const schema = {
  type: "object",
  properties: {
    theme: { type: "string" }
  },
  required: ["theme"]
};

config.setSchema(schema);
config.set("theme", 123); // Error: "theme" must be a string
```

#### Benefits:
- Ensures data integrity by enforcing structure and type constraints.
- Prevents invalid data from being saved in the configuration file.


## Notes
- Ensure the file path set with `setPath()` is absolute.
- Backups are stored using a timestamp format.
- When restoring a backup, the existing configuration file is completely replaced with the backup content.
- Encryption key must be defined for masking/unmasking functionality.

## License

This project is licensed under the MIT License.

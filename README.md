<p align="center">
  <img style="width: 100%; box-sizing: border-box;" src="https://github.com/user-attachments/assets/3c30a01c-628c-4cf5-a18e-9176ff4f0de8" alt="Limbus Foundation Logo" width="200">
</p>

# ElectronSave

Save Electron ( or any other Node.js app ) data locally as JSON.

## Installation

To install ElectronSave, use npm:

```sh
npm install @limbusfoundation/electronsave
```

## Usage

Import the module and create an instance:

```javascript
const ElectronSave = require("electron-save");
const config = new ElectronSave();
```

By default, the configuration file is stored in the user's home directory as `appConfig.json`. You can specify a custom path:

```javascript
config.setPath("/absolute/path/to/config.json");
```

### Methods

#### `setPath(pathtojson)`

Sets a custom path for the configuration file.

- `pathtojson` (string) - Must be an absolute path.

#### `getPath()`

Returns the current path of the configuration file.

#### `backup(pathtoBackup)`

Creates a backup of the current configuration file.

- `pathtoBackup` (optional, string) - Directory where backups will be stored. If omitted, a default "appBackup" folder is used.
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

#### `set(key, value)`

Saves a key-value pair in the configuration file.

- `key` (string) - The property name.
- `value` (any) - The value to store.

**Example:**

```javascript
config.set("theme", "dark");
config.set("user", { name: "John", age: 30 });
```

#### `get(key, defaultValue = null)`

Retrieves a value from the configuration file.

- `key` (string) - The property name.
- `defaultValue` (optional) - A default value if the key is not found.

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

## Notes
- Ensure the file path set with `setPath()` is absolute.
- Backups are stored using a timestamp format.
- When restoring a backup, the existing configuration file is completely replaced with the backup content.

## License

This project is licensed under the MIT License.





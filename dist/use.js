










const ElectronSave = require("../index.js"); 

const save = new ElectronSave();

// Definir um novo caminho para salvar os dados
save.setPath("C:\\Users\\Rhyan Eduardo\\file.json");



// Obter o caminho atual
console.log("Path atual:", save.getPath());

// Criar backup (salva na pasta padrão "appBackup")
save.backup();

// Restaurar um backup específico
save.restore("03-20-2025-02-14-04");

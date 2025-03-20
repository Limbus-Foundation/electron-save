








const ElectronSave = require("../index.js");

// Criando instância e definindo o caminho do arquivo
const save = new ElectronSave("C:\\Users\\Rhyan Eduardo\\Desktop\\myfileconfig.json", { type: "json" });

console.log("Caminho do arquivo: " + save.getPath());

// Definir chave de criptografia (deve ter 32 caracteres)
const encryptionKey = "0123456789abcdef0123456789abcdef";
save.setEncryptionKey(encryptionKey);

// Definir esquema de validação
save.setSchema({
    type: "object",
    properties: {
        nome: { type: "string" },
        idade: { type: "integer", minimum: 27 }  // Restrição mínima para a idade
    },
    required: ["nome", "idade"]
});

// Salvar dados primeiro, garantindo que "idade" seja salva antes da validação
save.set("nome", "Rhyan");
save.set("idade", 30); // Agora, "idade" é configurada corretamente

// Verificar e logar os dados
console.log("Nome salvo: " + save.get("nome"));
console.log("Idade salva: " + save.get("idade"));

// Forçar validação após salvar

setTimeout(() => {
    const validationErrors = save.validate(); // Supondo que exista um método de validação
if (validationErrors) {
    console.log("Erro de validação:", validationErrors);
} else {
    console.log("Validação bem-sucedida!");
}
}, 3000);


// Adicionar um listener para mudanças
save.onChange("nome", (newValue) => {
    console.log("Nome atualizado para: " + newValue);
});

// Atualizar valor de "nome"
save.set("nome", "Eduardo");

// Criar backup do arquivo
const backupPath = save.backup();
console.log("Backup criado em: " + backupPath);

// Restaurar backup
const timestamp = '03-20-2025-05-55-44';
save.restore(timestamp);
console.log("Backup restaurado.");

// Testar criptografia e descriptografia
const encryptedData = save.mask({ nome: "Rhyan", idade: 25 });
console.log("Dados criptografados: " + encryptedData);

const decryptedData = save.unmask(encryptedData);
console.log("Dados descriptografados:", decryptedData);

// Limpar todos os dados do arquivo
// save.clear();
// console.log("Todos os dados foram apagados.");

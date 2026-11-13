
/* ========================================
   CONEXÃO COM O BANCO DE DADOS
======================================== */

const Database = require("better-sqlite3");
const path = require("path");

// Caminho do banco de dados
const dbPath = path.join(__dirname, "helpdesk.db");

// Criar ou conectar ao banco
const db = new Database(dbPath);


/* ========================================
   CRIAÇÃO DA TABELA DE CHAMADOS
======================================== */

db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        requester TEXT NOT NULL,

        title TEXT NOT NULL,

        description TEXT NOT NULL,

        category TEXT NOT NULL,

        priority TEXT NOT NULL,

        urgency TEXT NOT NULL,

        status TEXT NOT NULL DEFAULT 'Aberto',

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP

    );
`);

console.log("Banco de dados conectado com sucesso!");
console.log("Tabela de chamados verificada com sucesso!");


/* ========================================
   EXPORTAR CONEXÃO
======================================== */

module.exports = db;

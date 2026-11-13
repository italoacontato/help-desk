
/* ========================================
   CONFIGURAÇÃO DO SERVIDOR
======================================== */

const express = require("express");
const db = require("./database/db");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Permitir o recebimento de dados JSON
app.use(express.json());
app.use(cors());


/* ========================================
   ROTAS
======================================== */

// Rota inicial
app.get("/", (req, res) => {
    res.send("Servidor Help Desk funcionando!");
});

// Rota para testar a API
app.get("/api/status", (req, res) => {
    res.json({
        message: "API Help Desk funcionando!",
        status: "online"
    });
});



/* ========================================
   LISTAR CHAMADOS
======================================== */

app.get("/api/tickets", (req, res) => {

    try {

        // Buscar todos os chamados no banco
        const tickets = db.prepare(`
            SELECT * FROM tickets
            ORDER BY id DESC
        `).all();

        // Retornar os chamados em JSON
        res.json(tickets);

    } catch (error) {

        console.error("Erro ao buscar chamados:", error);

        res.status(500).json({
            error: "Erro ao consultar os chamados."
        });

    }

});


/* ========================================
   CADASTRAR NOVO CHAMADO
======================================== */

app.post("/api/tickets", (req, res) => {

    try {

        // Receber os dados enviados
        const {
            requester,
            title,
            description,
            category,
            priority,
            urgency
        } = req.body;

        // Validar os campos obrigatórios
        if (
            !requester ||
            !title ||
            !description ||
            !category ||
            !priority ||
            !urgency
        ) {
            return res.status(400).json({
                error: "Preencha todos os campos obrigatórios."
            });
        }

        // Preparar o comando SQL
        const insertTicket = db.prepare(`
            INSERT INTO tickets (
                requester,
                title,
                description,
                category,
                priority,
                urgency
            )
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        // Inserir os dados no banco
        const result = insertTicket.run(
            requester,
            title,
            description,
            category,
            priority,
            urgency
        );

        // Buscar o chamado recém-cadastrado
        const newTicket = db.prepare(`
            SELECT * FROM tickets WHERE id = ?
        `).get(result.lastInsertRowid);

        // Retornar confirmação
        res.status(201).json({
            message: "Chamado cadastrado com sucesso!",
            ticket: newTicket
        });

    } catch (error) {

        console.error("Erro ao cadastrar chamado:", error);

        res.status(500).json({
            error: "Erro ao cadastrar o chamado."
        });

    }

});


/* ========================================
   EXCLUIR CHAMADO
======================================== */

app.delete("/api/tickets/:id", (req, res) => {

    try {

        // Capturar o ID enviado pela URL
        const ticketId = Number(req.params.id);

        // Validar o ID
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                error: "ID do chamado inválido."
            });
        }

        // Excluir o chamado do banco
        const result = db.prepare(`
            DELETE FROM tickets WHERE id = ?
        `).run(ticketId);

        // Verificar se algum registro foi excluído
        if (result.changes === 0) {
            return res.status(404).json({
                error: "Chamado não encontrado."
            });
        }

        // Retornar confirmação
        res.json({
            message: "Chamado excluído com sucesso!",
            id: ticketId
        });

    } catch (error) {

        console.error("Erro ao excluir chamado:", error);

        res.status(500).json({
            error: "Erro ao excluir o chamado."
        });

    }

});


/* ========================================
   ATUALIZAR CHAMADO
======================================== */

app.put("/api/tickets/:id", (req, res) => {

    try {

        // Capturar o ID do chamado
        const ticketId = Number(req.params.id);

        // Receber os novos dados
        const {
            status,
            priority,
            urgency
        } = req.body;

        // Validar o ID
        if (!Number.isInteger(ticketId) || ticketId <= 0) {
            return res.status(400).json({
                error: "ID do chamado inválido."
            });
        }

        // Verificar se o chamado existe
        const ticket = db.prepare(`
            SELECT * FROM tickets WHERE id = ?
        `).get(ticketId);

        if (!ticket) {
            return res.status(404).json({
                error: "Chamado não encontrado."
            });
        }

        // Atualizar os dados
        const updateTicket = db.prepare(`
            UPDATE tickets
            SET
                status = ?,
                priority = ?,
                urgency = ?
            WHERE id = ?
        `);

        updateTicket.run(
            status ?? ticket.status,
            priority ?? ticket.priority,
            urgency ?? ticket.urgency,
            ticketId
        );

        // Buscar o chamado atualizado
        const updatedTicket = db.prepare(`
            SELECT * FROM tickets WHERE id = ?
        `).get(ticketId);

        res.json({
            message: "Chamado atualizado com sucesso!",
            ticket: updatedTicket
        });

    } catch (error) {

        console.error("Erro ao atualizar chamado:", error);

        res.status(500).json({
            error: "Erro ao atualizar o chamado."
        });

    }

});




/* ========================================
   INICIALIZAÇÃO DO SERVIDOR
======================================== */

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});


/* ========================================
   CONFIGURAÇÕES GERAIS
======================================== */

const API_URL = "http://localhost:3000/api/tickets";

const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menu-toggle");
const menuLinks = document.querySelectorAll(".menu-link");

/* ========================================
   ABRIR E FECHAR MENU
======================================== */

menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

/* ========================================
   NAVEGAÇÃO DO MENU
======================================== */

menuLinks.forEach(link => {
    link.addEventListener("click", () => {
        menuLinks.forEach(item => {
            item.classList.remove("active");
        });

        link.classList.add("active");
        sidebar.classList.remove("open");
    });
});

/* ========================================
   DADOS DOS CHAMADOS
======================================== */

let tickets = [];

/* ========================================
   INDICADORES DO DASHBOARD
======================================== */

function updateDashboard() {
    const total = tickets.length;

    const open = tickets.filter(ticket =>
        ticket.status === "Aberto"
    ).length;

    const progress = tickets.filter(ticket =>
        ticket.status === "Em atendimento"
    ).length;

    const resolved = tickets.filter(ticket =>
        ticket.status === "Resolvido"
    ).length;

    document.getElementById("total-tickets").textContent = total;
    document.getElementById("open-tickets").textContent = open;
    document.getElementById("progress-tickets").textContent = progress;
    document.getElementById("resolved-tickets").textContent = resolved;
}

/* ========================================
   ELEMENTOS DA TABELA E FILTROS
======================================== */

const ticketsTableBody = document.getElementById("tickets-table-body");
const statusFilter = document.getElementById("status-filter");
const priorityFilter = document.getElementById("priority-filter");

/* ========================================
   EXIBIR CHAMADOS NA TABELA
======================================== */

function renderTickets() {
    ticketsTableBody.innerHTML = "";

    const selectedStatus = statusFilter.value;
    const selectedPriority = priorityFilter.value;

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus =
            selectedStatus === "Todos" ||
            ticket.status === selectedStatus;

        const matchesPriority =
            selectedPriority === "Todas" ||
            ticket.priority === selectedPriority;

        return matchesStatus && matchesPriority;
    });

    if (filteredTickets.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "Nenhum chamado encontrado.";
        cell.style.textAlign = "center";

        row.appendChild(cell);
        ticketsTableBody.appendChild(row);

        return;
    }

    filteredTickets.forEach(ticket => {
        const row = document.createElement("tr");

        const values = [
            ticket.id,
            ticket.requester,
            ticket.title,
            ticket.category,
            ticket.priority,
            ticket.status
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        // Célula de ações
        const actionCell = document.createElement("td");

        // Botão de edição
        const editButton = document.createElement("button");

        editButton.classList.add("edit-btn");
        editButton.textContent = "Editar";
        editButton.title = "Editar chamado";

        editButton.addEventListener("click", () => {
            editTicket(ticket.id);
        });

        actionCell.appendChild(editButton);

        // Botão de exclusão
        const deleteButton = document.createElement("button");

        deleteButton.classList.add("delete-btn");
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.title = "Excluir chamado";

        deleteButton.addEventListener("click", () => {
            deleteTicket(ticket.id);
        });

        actionCell.appendChild(deleteButton);

        row.appendChild(actionCell);
        ticketsTableBody.appendChild(row);
    });
}

/* ========================================
   CARREGAR CHAMADOS DO BANCO
======================================== */

async function loadTickets() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Não foi possível carregar os chamados.");
        }

        tickets = await response.json();

        updateDashboard();
        renderTickets();

        console.log("Chamados carregados:", tickets);

        return true;

    } catch (error) {
        console.error("Erro ao carregar chamados:", error);

        alert("Não foi possível carregar os chamados.");

        return false;
    }
}

/* ========================================
   FILTROS
======================================== */

priorityFilter.addEventListener("change", renderTickets);
statusFilter.addEventListener("change", renderTickets);

/* ========================================
   MODAL DE SUCESSO
======================================== */

const successModal = document.getElementById("success-modal");

function showSuccessModal(title, message) {
    document.getElementById("success-title").textContent = title;
    document.getElementById("success-message").textContent = message;

    successModal.classList.add("active");

    console.log("Modal de sucesso aberto:", successModal.classList.contains("active"));
}


function closeSuccessModal() {
    successModal.classList.remove("active");

    console.log("Modal de sucesso fechado pelo botão.");
}

// Fechar pelo botão Entendi
document.getElementById("close-success-modal").addEventListener(
    "click",
    closeSuccessModal
);

/* ========================================
   CADASTRAR CHAMADO PELA API
======================================== */

const ticketForm = document.getElementById("ticket-form");

const requesterInput = document.getElementById("requester");
const titleInput = document.getElementById("ticket-title");
const descriptionInput = document.getElementById("description");
const categoryInput = document.getElementById("category");
const priorityInput = document.getElementById("priority");
const urgencyInput = document.getElementById("urgency");

ticketForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const ticketData = {
        requester: requesterInput.value.trim(),
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
        category: categoryInput.value,
        priority: priorityInput.value,
        urgency: urgencyInput.value
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(ticketData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao cadastrar chamado.");
        }

        console.log("Chamado salvo:", data.ticket);

        ticketForm.reset();

        await loadTickets();

        showSuccessModal(
            "Chamado cadastrado!",
            "O chamado foi registrado com sucesso."
        );

    } catch (error) {
        console.error("Erro ao cadastrar chamado:", error);
        alert("Não foi possível cadastrar o chamado.");
    }
});

/* ========================================
   EXCLUIR CHAMADO PELA API
======================================== */

async function deleteTicket(ticketId) {
    const confirmDelete = confirm(
        "Tem certeza de que deseja excluir este chamado?"
    );

    if (!confirmDelete) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: "DELETE"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao excluir chamado.");
        }

        console.log("Chamado excluído:", data);

        await loadTickets();

        showSuccessModal(
            "Chamado excluído!",
            "O chamado foi removido com sucesso."
        );

    } catch (error) {
        console.error("Erro ao excluir chamado:", error);
        alert("Não foi possível excluir o chamado.");
    }
}

/* ========================================
   MODAL DE EDIÇÃO DE CHAMADO
======================================== */

const editModal = document.getElementById("edit-modal");
const editForm = document.getElementById("edit-ticket-form");

function editTicket(ticketId) {
    const ticket = tickets.find(ticket => ticket.id === ticketId);

    if (!ticket) {
        alert("Chamado não encontrado.");
        return;
    }

    document.getElementById("edit-ticket-id").value = ticket.id;
    document.getElementById("edit-status").value = ticket.status;
    document.getElementById("edit-priority").value = ticket.priority;
    document.getElementById("edit-urgency").value = ticket.urgency;

    editModal.classList.add("active");
}

function closeEditModal() {
    editModal.classList.remove("active");
}

// Fechar pelo botão X
document.getElementById("close-edit-modal").addEventListener(
    "click",
    closeEditModal
);

// Fechar pelo botão Cancelar
document.getElementById("cancel-edit").addEventListener(
    "click",
    closeEditModal
);

/* ========================================
   SALVAR ALTERAÇÕES DO CHAMADO
======================================== */

editForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const ticketId = document.getElementById("edit-ticket-id").value;

    const updatedData = {
        status: document.getElementById("edit-status").value,
        priority: document.getElementById("edit-priority").value,
        urgency: document.getElementById("edit-urgency").value
    };

    try {
        const response = await fetch(`${API_URL}/${ticketId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erro ao atualizar chamado.");
        }

        console.log("Chamado atualizado:", data.ticket);

        // Primeiro fecha o modal de edição
        closeEditModal();

        // Depois atualiza os dados da tela
        await loadTickets();

        // Por último, abre o modal de sucesso
        showSuccessModal(
            "Chamado atualizado!",
            "As alterações foram salvas com sucesso."
        );

    } catch (error) {
        console.error("Erro ao atualizar chamado:", error);
        alert("Não foi possível atualizar o chamado.");
    }
});

/* ========================================
   INICIALIZAR DASHBOARD
======================================== */

loadTickets();

// ========================================
// BOTÃO DA ÁREA DE BOAS-VINDAS
// ========================================

const newTicketButton = document.getElementById("new-ticket-button");

newTicketButton.addEventListener("click", () => {
    document.getElementById("requester").focus();

    document.getElementById("ticket-form").scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
});

// ========================================
// DATA AUTOMÁTICA DO RODAPÉ
// ========================================

function updateFooterDate() {
    const today = new Date();

    document.getElementById("current-year").textContent =
        today.getFullYear();

    document.getElementById("current-date").textContent =
        today.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric"
        });
}

updateFooterDate();
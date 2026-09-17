const customerModalElement =
    document.getElementById("customer-modal");

const customerModal =
    M.Modal.init(customerModalElement);

const customerForm =
    document.getElementById("customer-form");

const customerTitle =
    document.getElementById("customer-modal-title");

const customerDocumentId =
    document.getElementById("customer-document-id");

const customerName =
    document.getElementById("customer-name");

const customerDateOfBirth =
    document.getElementById("customer-date-of-birth");

const btnCancelCustomer =
    document.getElementById("btn-cancel-customer");

const btnSaveCustomer =
    document.getElementById("btn-save-customer");

const btnCloseCustomer =
    document.getElementById("btn-close-customer");

let modalMode = "add";

function formatDateForInput(value) {
    let date;

    if (value?.toDate) {
        date = value.toDate();
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function openCustomerModal(customer = null, mode = "add") {
    modalMode = mode;

    customerForm.reset();

    customerDocumentId.value = "";
    customerName.disabled = false;
    customerDateOfBirth.disabled = false;

    if (mode === "add") {
        customerTitle.textContent = "Adicionar cliente";

        btnCancelCustomer.style.display = "inline-block";
        btnSaveCustomer.style.display = "inline-block";
        btnCloseCustomer.style.display = "none";

        customerName.value = "";
        customerDateOfBirth.value = "";
    }

    if (mode === "view") {
        customerTitle.textContent = "Visualizar cliente";

        btnCancelCustomer.style.display = "none";
        btnSaveCustomer.style.display = "none";
        btnCloseCustomer.style.display = "inline-block";

        fillCustomerForm(customer);

        customerName.disabled = true;
        customerDateOfBirth.disabled = true;
    }

    if (mode === "edit") {
        customerTitle.textContent = "Editar cliente";

        btnCancelCustomer.style.display = "inline-block";
        btnSaveCustomer.style.display = "inline-block";
        btnCloseCustomer.style.display = "none";

        fillCustomerForm(customer);
    }

    M.updateTextFields();
    customerModal.open();
}

function fillCustomerForm(customer) {
    customerDocumentId.value = customer.documentId || "";
    customerName.value = customer.name || "";

    if (customer.dateOfBirth) {
        customerDateOfBirth.value =
            formatDateForInput(customer.dateOfBirth);
    }
}

btnCancelCustomer.addEventListener("click", () => {
    customerModal.close();
});

btnCloseCustomer.addEventListener("click", () => {
    customerModal.close();
});

customerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (modalMode === "view") {
        customerModal.close();
        return;
    }

    const name = customerName.value.trim();
    const dateOfBirth = customerDateOfBirth.value;

    if (!name || !dateOfBirth) {
        M.toast({
            html: "Preencha todos os campos obrigatórios."
        });

        return;
    }

    try {
        btnSaveCustomer.disabled = true;

        const data = {
            name,
            dateOfBirth: firebase.firestore.Timestamp.fromDate(
                new Date(`${dateOfBirth}T12:00:00`)
            )
        };

        if (modalMode === "add") {
            // O ID numérico deve ser obtido através
            // do contador transacional.
            const customerId = await getNextCustomerId();

            await db.collection("customers").add({
                ...data,
                customerId,
                checkIn: false,
                active: true,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        if (modalMode === "edit") {
            const documentId = customerDocumentId.value;

            await db.collection("customers")
                .doc(documentId)
                .update({
                    ...data,
                    updatedAt:
                        firebase.firestore.FieldValue.serverTimestamp()
                });
        }

        customerModal.close();

        if (typeof loadCustomers === "function") {
            await loadCustomers();
        }

        M.toast({
            html: modalMode === "add"
                ? "Cliente adicionado."
                : "Cliente atualizado."
        });

    } catch (error) {
        console.error("Erro ao salvar cliente:", error);

        M.toast({
            html: "Não foi possível salvar o cliente."
        });

    } finally {
        btnSaveCustomer.disabled = false;
    }
});
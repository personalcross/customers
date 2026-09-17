const customersCollection = db.collection("customers");

const customersList = document.getElementById("customers-list");
const customerSearch = document.getElementById("customer-search");

const btnAddCustomer = 
    document.getElementById("btn-add-customer");

let customers = [];

async function loadCustomers() {

    customersList.innerHTML = `
        <p class="list-message">A carregar clientes...</p>
    `;

    try {

        const snapshot = await customersCollection.get();

        customers = snapshot.docs.map(doc => ({
            documentId: doc.id,
            ...doc.data()
        }));

        customers.sort((a, b) => {

            // Ativos primeiro
            const activeA = a.active === true ? 0 : 1;
            const activeB = b.active === true ? 0 : 1;

            if (activeA !== activeB) {
                return activeA - activeB;
            }

            // Ordem alfabética dentro de cada grupo
            return (a.name || "").localeCompare(
                b.name || "",
                "pt-BR",
                {
                    sensitivity: "base"
                }
            );

        });

        renderCustomers(customers);

    } catch (error) {

        console.error("Error loading customers:", error);

        customersList.innerHTML = `
            <p class="list-message">
                Não foi possível carregar os clientes.
            </p>
        `;

    }

}

function renderCustomers(data) {

    customersList.innerHTML = "";

    if (data.length === 0) {

        customersList.innerHTML = `
            <p class="list-message">
                Nenhum cliente encontrado.
            </p>
        `;

        return;
    }

    data.forEach(customer => {

        const item = document.createElement("div");

        item.className = "list-item";

        // Identifica clientes inativos
        if (customer.active !== true) {
            item.classList.add("inactive");
        }

        const name = document.createElement("span");

        name.className = "list-item-main-value";
        name.textContent = customer.name || "Sem nome";

        const actions = document.createElement("div");

        actions.className = "list-item-actions";

        actions.innerHTML = `
            <button
                class="list-item-action"
                data-action="history"
                data-id="${customer.documentId}"
                aria-label="Histórico">

                <img
                    src="https://personalcross.github.io/assets/store/history.png"
                    alt="">

            </button>

            <button
                class="list-item-action"
                data-action="view"
                data-id="${customer.documentId}"
                aria-label="Consultar">

                <img
                    src="https://personalcross.github.io/assets/store/eye.png"
                    alt="">

            </button>

            <button
                class="list-item-action"
                data-action="edit"
                data-id="${customer.documentId}"
                aria-label="Editar">

                <img
                    src="https://personalcross.github.io/assets/store/pencil.png"
                    alt="">

            </button>
        `;

        item.appendChild(name);
        item.appendChild(actions);

        customersList.appendChild(item);

    });

}

customerSearch.addEventListener("input", event => {

    const search = event.target.value
        .trim()
        .toLocaleLowerCase("pt-PT");

    const filtered = customers.filter(customer =>
        (customer.name || "")
            .toLocaleLowerCase("pt-PT")
            .includes(search)
    );

    renderCustomers(filtered);

});

btnAddCustomer.addEventListener("click", () => {
    openCustomerModal();
})

customersList.addEventListener("click", event => {

    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    const customer = customers.find(
        item => item.documentId === id
    );

    if (!customer) return;

    if (action === "view") {
        openCustomerModal(customer, "view");
    }

    if (action === "edit") {
        openCustomerModal(customer, "edit");
    }

    if (action === "history") {
        console.log("Customer history:", customer);
        // Implementar página ou modal de histórico.
    }

});


loadCustomers();
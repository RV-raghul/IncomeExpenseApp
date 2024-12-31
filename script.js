"use strict";
const BASE_URL = "https://67552a0036bcd1eec852b579.mockapi.io/itemList";

let incomeAmount;
let totalExpenseAmount;

const errorMesgEl = document.querySelector(".error_message");
const budgetInputEl = document.querySelector(".budget_input");
const expenseDelEl = document.querySelector(".expenses_input");
const expenseAmountEl = document.querySelector(".expenses_amount");
const tblRecordEl = document.querySelector(".tbl_data");
const cardsContainer = document.querySelector(".cards");

const budgetCardEl = document.querySelector(".budget_card");
const expenseCardEl = document.querySelector(".expenses_card");
const balanceCardEl = document.querySelector(".balance_card");

//document.getElementById("filter-input").addEventListener("input", filterTable);

// Fetch and construct table data
const getData = async () => {
    try {
        const response = await fetch(BASE_URL);
        const data = await response.json();

        if (response.status === 200) {
            constructTable(data);
            totalExpenseAmountCalc(data);
        } else {
            throw `${response.status} : ${data.message ?? "Error Occurred"}`;
        }
    } catch (error) {
        errorMessage(error);
    }
};

// Edit expense
const edit = (id) => {
    const div = document.getElementById("modify_expenses");
    div.style.display = "block";

    const mapValues = (data) => {
        document.getElementById("modify_expenses_input").value = data.expenseItem;
        document.getElementById("modify_expenses_amount").value = data.expenseAmount;
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`${BASE_URL}/${id}`);
            const data = await res.json();

            if (res.status === 200) {
                mapValues(data);
            } else {
                throw `${res.status} : ${data ?? "Error Occurred"}`;
            }
        } catch (error) {
            errorMessage(error);
        }
    };

    fetchData();

    const modifyForm = document.getElementById("modifyForm");
    modifyForm.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(modifyForm);
        const data = Object.fromEntries(formData);

        if (data.expenseItem && data.expenseAmount) {
            try {
                const res = await fetch(`${BASE_URL}/${id}`, {
                    method: "PUT",
                    body: JSON.stringify(data),
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (res.status === 200) {
                    messageSuccess("Expense Modified");
                    await getData();
                    div.style.display = "none";
                } else {
                    throw `${res.status} : ${data.message ?? "Error Occurred"}`;
                }
            } catch (error) {
                errorMessage(error);
            }
        } else {
            errorMessage("All Fields are Required");
        }
    };
};

// Delete expense
const deleteData = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
        });
        if (res.status === 200) {
            messageSuccess("Expense Deleted Successfully");
            await getData();
        } else {
            throw `${res.status} : ${res.statusText ?? "Error Occurred"}`;
        }
    } catch (error) {
        errorMessage(error);
    }
};

// Add expense
const myForm = document.getElementById("myForm");
myForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(myForm);
    const data = Object.fromEntries(formData);

    if (data.expenseItem && data.expenseAmount) {
        try {
            const res = await fetch(BASE_URL, {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status === 201) {
                messageSuccess("Expense Added");
                await getData();
                myForm.reset();
            } else {
                throw `${res.status} : ${data.message ?? "Error Occurred"}`;
            }
        } catch (error) {
            errorMessage(error);
        }
    } else {
        errorMessage("Please Enter Expense Description and Amount");
    }
};

// Calculate total expenses
const totalExpenseAmountCalc = (data) => {
    if (data.length > 0) {
        totalExpenseAmount = data.reduce((sum, item) => sum + parseFloat(item.expenseAmount), 0);
    } else {
        totalExpenseAmount = 0;
    }
    showBalance();
};

// Display balance
const showBalance = () => {
    if (!incomeAmount) {
        expenseCardEl.textContent = totalExpenseAmount;
        balanceCardEl.textContent = "";
    } else {
        const balance = parseFloat(incomeAmount) - totalExpenseAmount;
        balanceCardEl.textContent = balance;
        expenseCardEl.textContent = totalExpenseAmount;
    }
};

// Construct table
const constructTable = (data) => {
    const tBody = document.getElementById("table-body");
    tBody.innerHTML = "";
    data.forEach((item) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
        <td style="width: 5vw; height: 10px">${item.id}</td>
        <td style="width: 35vw; height: 10px">${item.expenseItem}</td>
        <td style="width: 30vw; height: 10px"><span>$</span> ${item.expenseAmount}</td>
        <td style="width: 30vw; height: 10px">
            <button type="button" class="btn_edit" onclick="edit(${item.id})">Edit</button>
            <button type="button" class="btn_delete" onclick="deleteData(${item.id})">Delete</button>
        </td>`;
        tr.classList.add("tbl_tr_content")
        tBody.appendChild(tr);
    });
};


// Filter table
const filterTable = () => {
    const filterInput = document.getElementById("filter-input").value.toLowerCase().trim();
    //console.log("Filter Input:", filterInput); // Log filter input
    const rows = document.querySelectorAll("#table-body tr");
    //console.log("Rows found:", rows.length); // Log number of rows

    rows.forEach((row) => {
        const expenseItem = row.children[1]?.textContent.toLowerCase().trim() ?? ""; // Get second column text
       // console.log("Expense Item:", expenseItem); // Log each expense item
        if (expenseItem.includes(filterInput)) {
            row.style.display = ""; // Show row
        } else {
            row.style.display = "none"; // Hide row
        }
    });
};



const btnFilter = document.querySelector("#btn_filter");
btnFilter.addEventListener("click", (e) => {
    e.preventDefault();
    filterTable();
});

// Handle budget input
function incomeFun() {
    const budgetValue = parseFloat(budgetInputEl.value);
    if (!budgetValue || budgetValue <= 0) {
        errorMessage("Please Enter Income Amount Greater Than 0");
    } else {
        incomeAmount = budgetValue;
        budgetCardEl.textContent = budgetValue;
        budgetInputEl.value = "";
        showBalance();
    }
}

// Button event listeners
function btnEvents() {
    const btnBudgetCal = document.querySelector("#btn_budget");
    btnBudgetCal.addEventListener("click", (e) => {
        e.preventDefault();
        incomeFun();
    });
}

document.addEventListener("DOMContentLoaded", () => {
    btnEvents();
    getData();
});

// Display error messages
function errorMessage(message) {
    errorMesgEl.classList.add("error");
    errorMesgEl.innerHTML = `<p>${message}</p>`;
    setTimeout(() => {
        errorMesgEl.classList.remove("error");
    }, 2500);
}

function messageSuccess(message){
    errorMesgEl.classList.add("success");
    errorMesgEl.innerHTML = `<p>${message}</p>`;
    setTimeout(() => {
        errorMesgEl.classList.remove("success");
    }, 2500);

}

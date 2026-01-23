import { data } from "./store.js";

// DOM Elements
const budgetInput = document.querySelector("#budgetInput");
const budgetDisplay = document.querySelector(".bgtAmount");

const spendInput = document.querySelector("#amountInput");
const categoryInput = document.querySelector("#categorySelect");
const noteInput = document.querySelector("#description");
const addBtn = document.querySelector("#addExpenses");

const totalDisplay = document.querySelector(".amount");
const expenseList = document.querySelector(".expense-list"); 

const setBudgetBtn = document.querySelector("#setBudget");

let totalSpend = 0;

// ===== Load saved budget if exists =====
let savedBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
budgetDisplay.innerText = `₹ ${savedBudget}`;

// Calculate total spend from saved data
data.forEach(exp => totalSpend += exp.amount);
updateTotalDisplay();
renderExpenses();

// ===== Event Listeners =====
setBudgetBtn.addEventListener("click", () => {
    const budgetValue = Number(budgetInput.value);
    if (!budgetValue) return alert("Enter a valid budget");
    localStorage.setItem("monthlyBudget", budgetValue);
    budgetDisplay.innerText = `₹ ${budgetValue}`;
    budgetInput.value = '';
});

addBtn.addEventListener("click", () => {
    const amount = Number(spendInput.value);
    const categoryVal = categoryInput.value;
    const noteVal = noteInput.value;

    if (!amount || categoryVal === "select") {
        return alert("Fill both Amount and Category");
    }

    const expense = {
        amount,
        category: categoryVal,
        note: noteVal || categoryVal
    };

    addExpense(expense);

    // Clear inputs
    spendInput.value = '';
    categoryInput.value = '';
    noteInput.value = '';
});

// ===== Functions =====
function addExpense(expense) {
    data.push(expense);
    localStorage.setItem("data", JSON.stringify(data));

    totalSpend += expense.amount;
    updateTotalDisplay();

    renderExpense(expense);
}

function updateTotalDisplay() {
    totalDisplay.innerText = `₹ ${totalSpend}`;
}

function renderExpenses() {
    expenseList.innerHTML = '';
    data.forEach(exp => renderExpense(exp));
}

function renderExpense(expense) {
    const li = document.createElement("li");
    li.innerText = `${expense.category}: ₹ ${expense.amount} (${expense.note})`;
    expenseList.appendChild(li);
}

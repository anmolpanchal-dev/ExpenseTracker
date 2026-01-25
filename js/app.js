import { data } from "./store.js";

// ===== DOM Elements =====
const budgetInput = document.querySelector("#budgetInput");
const budgetDisplay = document.querySelector(".bgtAmount");
const warnMsg = document.querySelector("#warning");

const spendInput = document.querySelector("#amountInput");
const categoryInput = document.querySelector("#categorySelect");
const noteInput = document.querySelector("#description");
const addBtn = document.querySelector("#addExpenses");
const budgetBox = document.querySelector("#monthlyBudget");

const totalDisplay = document.querySelector(".amount");
const expenseList = document.querySelector(".expense-list");
const remAmount = document.querySelector(".remainingAmount");
const setBudgetBtn = document.querySelector("#setBudget");
const summaryModalContent = document.querySelector("#item");

const summaryLink = document.getElementById("monthlySummaryLink");
const summaryModal = document.getElementById("summaryModal");
const closeSummaryBtn = summaryModal.querySelector(".closeBtn");
// ===== State =====
let totalSpend = 0;
let expenses = [];

// ===== Load Budget =====
const savedBudget = Number(localStorage.getItem("monthlyBudget")) || 0;
budgetDisplay.innerText = `₹ ${savedBudget}`;

// ===== Load Expenses & Total =====
data.forEach(exp => totalSpend += exp.amount);
updateTotalDisplay();
renderExpenses();
updateRemainingAmount();

// ===== Event Listeners =====
setBudgetBtn.addEventListener("click", () => {
    const budgetValue = Number(budgetInput.value);

    if (isNaN(budgetValue) || budgetValue <= 0){
    alert("Please enter a valid Amount");
    budgetInput.value = "";
    return;
    }

    localStorage.setItem("monthlyBudget", budgetValue);
    budgetDisplay.innerText = `₹ ${budgetValue}`;
    budgetInput.value = "";

    updateRemainingAmount();
});

addBtn.addEventListener("click", () => {
    const amount = Number(spendInput.value);
    const category = categoryInput.value;
    const note = noteInput.value || "";

    if (amount <= 0 || category === "select") {
        warnMsg.style.color = "red";
        warnMsg.innerText = "Enter both fields";
        return;
    } else if (isNaN(amount) || Number(amount) <= 0) {
        warnMsg.style.color = "red";
        warnMsg.innerText = "Enter a valid amount";
        return;
    }
    if(Number(amount) >= 0){
        warnMsg.innerText = "";

    }
    const expense = { amount, category, note };

    addExpense(expense);

    spendInput.value = "";
    categoryInput.value = "";
    noteInput.value = "";
});

// ===== Functions =====
function addExpense(expense) {
    data.push(expense);
    localStorage.setItem("data", JSON.stringify(data));

    totalSpend += expense.amount;
    updateTotalDisplay();
    updateRemainingAmount();
    renderExpense(expense);
    generateChart();
}

function updateTotalDisplay() {
    totalDisplay.innerText = `₹ ${totalSpend}`;
}

function updateRemainingAmount() {
    const budgetValue = Number(localStorage.getItem("monthlyBudget")) || 0;
    const remaining = budgetValue - totalSpend;

    localStorage.setItem("remainAmount", remaining);
    remAmount.innerText = `₹ ${remaining}`;
    if (remaining < 0) {
    remAmount.style.color = "red";
    }

}

function renderExpenses() {
    expenseList.innerHTML = "";
    data.forEach(exp => renderExpense(exp));
}

function renderExpense(expense) {

//   const overviewItem = document.createElement("div");
//   overviewItem.className = "displayItem";
//   overviewItem.innerHTML = `
//     <div class="category">${expense.category}</div>
//     <div class="amount2">₹ ${expense.amount}</div>
//     <div class="note">${expense.note}</div>
//   `;
//   expenseList.appendChild(overviewItem);


  const modalItem = document.createElement("div");
  modalItem.className = "displayItem";
  modalItem.innerHTML = `
    <div class="category">${expense.category}</div>
    <div class="amount2">₹ ${expense.amount}</div>
    <div class="note">${expense.note}</div>
  `;
  summaryModalContent.prepend(modalItem);
}




// Open modal
summaryLink.addEventListener("click", (e) => {
  e.preventDefault();
  summaryModal.style.display = "flex";
});

// Close modal with X
closeSummaryBtn.addEventListener("click", () => {
  summaryModal.style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target === summaryModal) {
    summaryModal.style.display = "none";
  }
});


const darkModeToggle = document.querySelector("#linksContainer p"); // Dark Mode <p>

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    darkModeToggle.innerText = "Light Mode";
  } else {
    darkModeToggle.innerText = "Dark Mode";
  }
});

function generateChart() {
  const chart = document.getElementById("barChart");
  if (!chart) return;

  chart.innerHTML = "";

  const categoryTotals = {};

  data.forEach(exp => {
    categoryTotals[exp.category] =
      (categoryTotals[exp.category] || 0) + Number(exp.amount);
  });

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  Object.entries(categoryTotals).forEach(([category, amount]) => {
    const parent = document.createElement("div");
    const bar = document.createElement("div");
    const cate = document.createElement("div");

    parent.className = "parentDiv";
    bar.className = "bar";
    cate.className = "category";

    bar.style.height = `${(amount / maxAmount) * 100}%`;
    bar.innerText = `₹${amount}`;
    cate.innerText = category;

    parent.appendChild(bar);
    parent.appendChild(cate);

    chart.appendChild(parent);
  });

}

generateChart();

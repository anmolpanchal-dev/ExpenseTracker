import {
  addExpense,
  ensureBudgetRecord,
  getBudget,
  getCurrentMonthYear,
  getExpensesByMonth,
  getMonthKey,
  getMonthSummaries,
  setBudget,
} from "./store.js";
import { renderRecentExpenses } from "./recentExpenses.js";
import { generateChart } from "./chart.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const budgetInput = document.querySelector("#budgetInput");
const budgetDisplay = document.querySelector(".bgtAmount");
const warnMsg = document.querySelector("#warning");

const spendInput = document.querySelector("#amountInput");
const dateInput = document.querySelector("#dateInput");
const categoryInput = document.querySelector("#categorySelect");
const noteInput = document.querySelector("#description");
const addBtn = document.querySelector("#addExpenses");

const totalDisplay = document.querySelector(".amount");
const remAmount = document.querySelector(".remainingAmount");
const setBudgetBtn = document.querySelector("#setBudget");
const monthPicker = document.querySelector("#monthPicker");
const summaryModalContent = document.querySelector("#item");

const summaryLink = document.getElementById("monthlySummaryLink");
const summaryModal = document.getElementById("summaryModal");
const closeSummaryBtn = summaryModal.querySelector(".closeBtn");

const darkModeToggle = document.querySelector("#linksContainer p");
const progressFillElement = document.querySelector(".progress-fill");

let selectedMonth = getCurrentMonthYear();
let activeCurrentMonthKey = getMonthKey(selectedMonth.month, selectedMonth.year);

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatMonthInput(month, year) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseDateToMonthYear(dateValue) {
  const dateObj = new Date(`${dateValue}T00:00:00`);
  return {
    month: dateObj.getMonth() + 1,
    year: dateObj.getFullYear(),
  };
}

function updateHeaderValues() {
  const monthExpenses = getExpensesByMonth(selectedMonth.month, selectedMonth.year);
  const totalSpend = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const budgetValue = getBudget(selectedMonth.month, selectedMonth.year);
  const remaining = budgetValue - totalSpend;
  const progress = budgetValue > 0 ? (totalSpend / budgetValue) * 100 : 0;

  totalDisplay.innerText = formatCurrency(totalSpend);
  budgetDisplay.innerText = formatCurrency(budgetValue);
  remAmount.innerText = formatCurrency(remaining);
  remAmount.style.color = remaining < 0 ? "red" : "";

  progressFillElement.style.width = `${Math.min(progress, 100)}%`;

  generateChart(monthExpenses);
  renderRecentExpenses(monthExpenses);
}

function renderMonthlySummary() {
  const summaries = getMonthSummaries();
  summaryModalContent.innerHTML = "";

  if (summaries.length === 0) {
    const empty = document.createElement("div");
    empty.className = "displayItem";
    empty.innerHTML = `<div class="note">No month history yet</div>`;
    summaryModalContent.appendChild(empty);
    return;
  }

  summaries.forEach((summary) => {
    const item = document.createElement("div");
    item.className = "displayItem";

    const monthTitle = `${MONTH_NAMES[summary.month - 1]} ${summary.year}`;
    const progress = summary.budgetAmount > 0 ? `${summary.progress.toFixed(1)}%` : "0%";

    item.innerHTML = `
      <div class="category">${monthTitle}</div>
      <div class="amount2">Spent: ${formatCurrency(summary.total)}</div>
      <div class="note">Budget: ${formatCurrency(summary.budgetAmount)} | Remaining: ${formatCurrency(summary.remaining)} | Progress: ${progress}</div>
    `;

    summaryModalContent.appendChild(item);
  });
}

function syncMonthSelectionUI() {
  monthPicker.value = formatMonthInput(selectedMonth.month, selectedMonth.year);
  ensureBudgetRecord(selectedMonth.month, selectedMonth.year);
  updateHeaderValues();
  renderMonthlySummary();
}

function initializeDateInput() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  dateInput.value = `${year}-${month}-${day}`;
}

setBudgetBtn.addEventListener("click", () => {
  const budgetValue = Number(budgetInput.value);

  if (Number.isNaN(budgetValue) || budgetValue < 0) {
    alert("Please enter a valid budget amount");
    budgetInput.value = "";
    return;
  }

  setBudget(selectedMonth.month, selectedMonth.year, budgetValue);
  budgetInput.value = "";
  updateHeaderValues();
  renderMonthlySummary();
});

addBtn.addEventListener("click", () => {
  const amount = Number(spendInput.value);
  const category = categoryInput.value;
  const note = noteInput.value || "";
  const selectedDate = dateInput.value;

  if (!selectedDate) {
    warnMsg.style.color = "red";
    warnMsg.innerText = "Select date";
    return;
  }

  if (Number.isNaN(amount) || amount <= 0 || !category) {
    warnMsg.style.color = "red";
    warnMsg.innerText = "Enter valid amount and category";
    return;
  }

  warnMsg.innerText = "";

  const expenseMonthYear = parseDateToMonthYear(selectedDate);
  ensureBudgetRecord(expenseMonthYear.month, expenseMonthYear.year);

  addExpense({
    amount,
    category,
    note,
    date: selectedDate,
  });

  if (
    expenseMonthYear.month !== selectedMonth.month ||
    expenseMonthYear.year !== selectedMonth.year
  ) {
    warnMsg.style.color = "#f59e0b";
    warnMsg.innerText = `Expense saved in ${MONTH_NAMES[expenseMonthYear.month - 1]} ${expenseMonthYear.year}`;
  }

  spendInput.value = "";
  categoryInput.value = "";
  noteInput.value = "";

  updateHeaderValues();
  renderMonthlySummary();
});

monthPicker.addEventListener("change", (event) => {
  const value = event.target.value;
  if (!value) return;

  const [year, month] = value.split("-").map(Number);
  selectedMonth = { month, year };
  syncMonthSelectionUI();
});

summaryLink.addEventListener("click", (event) => {
  event.preventDefault();
  renderMonthlySummary();
  summaryModal.style.display = "flex";
});

closeSummaryBtn.addEventListener("click", () => {
  summaryModal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === summaryModal) {
    summaryModal.style.display = "none";
  }
});

darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  darkModeToggle.innerText = document.body.classList.contains("dark-mode")
    ? "Light Mode"
    : "Dark Mode";
});

function startMonthWatcher() {
  setInterval(() => {
    const current = getCurrentMonthYear();
    const currentKey = getMonthKey(current.month, current.year);

    if (currentKey !== activeCurrentMonthKey) {
      activeCurrentMonthKey = currentKey;
      ensureBudgetRecord(current.month, current.year);
      selectedMonth = current;
      syncMonthSelectionUI();
    }
  }, 60_000);
}

ensureBudgetRecord(selectedMonth.month, selectedMonth.year);
initializeDateInput();
syncMonthSelectionUI();
startMonthWatcher();

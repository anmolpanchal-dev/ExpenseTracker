import {
  addExpense,
  ensureBudgetRecord,
  getBudget,
  getCurrentMonthYear,
  getExpensesByMonth,
  getMonthKey,
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

function formatLongDate(dateString) {
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const monthExpenses = getExpensesByMonth(selectedMonth.month, selectedMonth.year);
  const budgetAmount = getBudget(selectedMonth.month, selectedMonth.year);
  const totalSpent = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remaining = budgetAmount - totalSpent;
  const progress = budgetAmount > 0 ? (totalSpent / budgetAmount) * 100 : 0;

  const dateGroups = new Map();
  monthExpenses.forEach((expense) => {
    if (!dateGroups.has(expense.date)) {
      dateGroups.set(expense.date, []);
    }
    dateGroups.get(expense.date).push(expense);
  });

  const sortedDateKeys = [...dateGroups.keys()].sort((a, b) => new Date(b) - new Date(a));

  summaryModalContent.innerHTML = "";
  const monthTitle = `${MONTH_NAMES[selectedMonth.month - 1]} ${selectedMonth.year}`;

  const overviewSection = document.createElement("div");
  overviewSection.className = "displayItem summary-section";
  overviewSection.innerHTML = `
    <div class="category">${monthTitle}</div>
    <div class="note">Budget: ${formatCurrency(budgetAmount)}</div>
    <div class="note">Total Spent: ${formatCurrency(totalSpent)}</div>
    <div class="note">Remaining: ${formatCurrency(remaining)}</div>
    <div class="note">Progress: ${progress.toFixed(1)}%</div>
  `;
  summaryModalContent.appendChild(overviewSection);

  const detailsSection = document.createElement("div");
  detailsSection.className = "displayItem summary-section";
  detailsSection.innerHTML = `<div class="category">Date-wise Detailed Record</div>`;

  if (sortedDateKeys.length === 0) {
    const empty = document.createElement("div");
    empty.className = "note";
    empty.innerText = "No records for this month";
    detailsSection.appendChild(empty);
  } else {
    sortedDateKeys.forEach((dateKey) => {
      const dateHeading = document.createElement("div");
      dateHeading.className = "note summary-date-heading";
      dateHeading.innerText = formatLongDate(dateKey);
      detailsSection.appendChild(dateHeading);

      const expensesForDate = [...dateGroups.get(dateKey)].sort((a, b) => b.timestamp - a.timestamp);
      expensesForDate.forEach((expense) => {
        const item = document.createElement("div");
        item.className = "note summary-line-item";
        item.innerText = `- ${expense.category}: ${formatCurrency(expense.amount)}`;
        detailsSection.appendChild(item);
      });
    });
  }

  summaryModalContent.appendChild(detailsSection);
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
    timestamp: Date.now(),
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

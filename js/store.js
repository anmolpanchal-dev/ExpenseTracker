const EXPENSES_KEY = "expenses";
const LEGACY_EXPENSES_KEY = "data";
const BUDGETS_KEY = "budgets";
const LEGACY_BUDGET_KEY = "monthlyBudget";

function parseJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function toISODate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseLegacyToday(today) {
  if (typeof today !== "string") return null;

  const parts = today.split(/[\/\-\.]/).map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;

  const [first, second, third] = parts;

  if (third > 999) {
    const day = first;
    const month = second;
    const year = third;
    const dateObj = new Date(year, month - 1, day);
    return Number.isNaN(dateObj.getTime()) ? null : dateObj;
  }

  return null;
}

function normalizeExpense(expense) {
  const normalized = {
    id: String(expense?.id || ""),
    amount: Number(expense?.amount) || 0,
    category: expense?.category || "others",
    note: expense?.note || "",
    date: "",
    month: Number(expense?.month) || 0,
    year: Number(expense?.year) || 0,
    timestamp: Number(expense?.timestamp) || 0,
  };

  let dateObj = null;

  if (typeof expense?.date === "string" && expense.date) {
    dateObj = new Date(`${expense.date}T00:00:00`);
  }

  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    dateObj = parseLegacyToday(expense?.today);
  }

  if ((!dateObj || Number.isNaN(dateObj.getTime())) && normalized.month > 0 && normalized.year > 0) {
    dateObj = new Date(normalized.year, normalized.month - 1, 1);
  }

  if (!dateObj || Number.isNaN(dateObj.getTime())) {
    dateObj = new Date();
  }

  normalized.date = toISODate(dateObj);
  normalized.month = dateObj.getMonth() + 1;
  normalized.year = dateObj.getFullYear();
  normalized.timestamp = normalized.timestamp || dateObj.getTime();
  normalized.id = normalized.id || `${normalized.timestamp}-${Math.random().toString(16).slice(2, 8)}`;

  return normalized;
}

function normalizeBudget(budget) {
  return {
    month: Number(budget?.month) || 0,
    year: Number(budget?.year) || 0,
    budgetAmount: Number(budget?.budgetAmount) || 0,
  };
}

const rawExpenses = parseJSON(EXPENSES_KEY, null);
const legacyExpenses = parseJSON(LEGACY_EXPENSES_KEY, []);

export let expenses = (rawExpenses || legacyExpenses)
  .map(normalizeExpense)
  .filter((expense) => expense.amount > 0);

const rawBudgets = parseJSON(BUDGETS_KEY, []);
export let budgets = rawBudgets.map(normalizeBudget).filter((budget) => budget.month > 0 && budget.year > 0);

if (!rawExpenses && legacyExpenses.length > 0) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}
if (rawExpenses) {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

if (budgets.length === 0) {
  const legacyBudget = Number(localStorage.getItem(LEGACY_BUDGET_KEY)) || 0;
  if (legacyBudget > 0) {
    const now = getCurrentMonthYear();
    budgets.push({ month: now.month, year: now.year, budgetAmount: legacyBudget });
  }
}

localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));

function persistExpenses() {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
}

function persistBudgets() {
  localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
}

export function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth() + 1, year: now.getFullYear() };
}

export function getMonthKey(month, year) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function ensureBudgetRecord(month, year) {
  const existing = budgets.find((budget) => budget.month === month && budget.year === year);
  if (existing) return existing;

  const newBudget = { month, year, budgetAmount: 0 };
  budgets.push(newBudget);
  persistBudgets();
  return newBudget;
}

export function getBudget(month, year) {
  return budgets.find((budget) => budget.month === month && budget.year === year)?.budgetAmount || 0;
}

export function setBudget(month, year, budgetAmount) {
  const record = ensureBudgetRecord(month, year);
  record.budgetAmount = Number(budgetAmount) || 0;
  persistBudgets();
}

export function addExpense(expense) {
  const normalized = normalizeExpense(expense);
  expenses.push(normalized);
  persistExpenses();
  return normalized;
}

export function getExpensesByMonth(month, year) {
  return expenses.filter((expense) => expense.month === month && expense.year === year);
}

export function getMonthSummaries() {
  const monthMap = new Map();

  expenses.forEach((expense) => {
    const key = getMonthKey(expense.month, expense.year);
    if (!monthMap.has(key)) {
      monthMap.set(key, { month: expense.month, year: expense.year, total: 0 });
    }
    monthMap.get(key).total += expense.amount;
  });

  budgets.forEach((budget) => {
    const key = getMonthKey(budget.month, budget.year);
    if (!monthMap.has(key)) {
      monthMap.set(key, { month: budget.month, year: budget.year, total: 0 });
    }
  });

  return [...monthMap.values()]
    .map((summary) => {
      const budgetAmount = getBudget(summary.month, summary.year);
      const progress = budgetAmount > 0 ? (summary.total / budgetAmount) * 100 : 0;
      return {
        ...summary,
        budgetAmount,
        remaining: budgetAmount - summary.total,
        progress,
      };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

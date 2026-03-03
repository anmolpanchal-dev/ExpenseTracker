export function generateChart(monthExpenses) {
  const chart = document.getElementById("barChart");
  if (!chart) return;

  chart.innerHTML = "";

  const categoryTotals = {};
  const categoryCounts = {};
  const CATEGORY_COLORS = {
    food: ["#06b6d4", "#0e7490"],
    transport: ["#f59e0b", "#b45309"],
    entertainment: ["#a855f7", "#6d28d9"],
    utilities: ["#14b8a6", "#0f766e"],
    shopping: ["#ec4899", "#be185d"],
    others: ["#64748b", "#334155"],
  };

  monthExpenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + Number(expense.amount);
    categoryCounts[expense.category] = (categoryCounts[expense.category] || 0) + 1;
  });

  const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.innerText = "No expenses in this month yet";
    chart.appendChild(empty);
    return;
  }

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);
  const totalAmount = entries.reduce((sum, [, amount]) => sum + amount, 0);

  entries.forEach(([category, amount]) => {
    const parent = document.createElement("div");
    const bar = document.createElement("div");
    const cate = document.createElement("div");

    parent.className = "parentDiv";
    bar.className = "bar";
    cate.className = "cate";

    const [start, end] = CATEGORY_COLORS[category] || CATEGORY_COLORS.others;
    const percentage = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
    const txns = categoryCounts[category] || 0;

    bar.style.height = `${Math.max((amount / maxAmount) * 100, 14)}%`;
    bar.style.background = `linear-gradient(180deg, ${start}, ${end})`;
    bar.innerHTML = `
      <span class="bar-value">Rs ${amount.toLocaleString("en-IN")}</span>
      <span class="bar-share">${percentage.toFixed(1)}%</span>
    `;

    const label = category.charAt(0).toUpperCase() + category.slice(1);
    cate.innerHTML = `
      <span class="cate-name">${label}</span>
      <span class="cate-count">${txns} txn${txns > 1 ? "s" : ""}</span>
    `;

    parent.appendChild(bar);
    parent.appendChild(cate);
    chart.appendChild(parent);
  });
}

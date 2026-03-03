export function generateChart(monthExpenses) {
  const chart = document.getElementById("barChart");
  if (!chart) return;

  chart.innerHTML = "";

  const categoryTotals = {};

  monthExpenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + Number(expense.amount);
  });

  const entries = Object.entries(categoryTotals);

  if (entries.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.innerText = "No expenses in this month yet";
    chart.appendChild(empty);
    return;
  }

  const maxAmount = Math.max(...Object.values(categoryTotals), 1);

  entries.forEach(([category, amount]) => {
    const parent = document.createElement("div");
    const bar = document.createElement("div");
    const cate = document.createElement("div");

    parent.className = "parentDiv";
    bar.className = "bar";
    cate.className = "cate";

    bar.style.height = `${(amount / maxAmount) * 100}%`;
    bar.innerText = `Rs ${amount}`;
    cate.innerText = category;

    parent.appendChild(bar);
    parent.appendChild(cate);
    chart.appendChild(parent);
  });
}

export function generateChart(data) {
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
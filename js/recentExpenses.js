export function renderRecentExpenses(data) {
  const recentList = document.getElementById("recentList");
  if (!recentList) return;

  recentList.innerHTML = "";

  const lastFive = data.slice(-5).reverse();

  lastFive.forEach(exp => {
    const div = document.createElement("div");
    div.className = "recent-item";
    div.innerHTML = `
      <div>
        <div class="recent-category">${exp.category}</div>
        <div class="recent-date">${exp.today}</div>
        </div>
        <div class="recent-date">${exp.note}</div>
      <div class="recent-amount">₹ ${exp.amount}</div>
    `;
    recentList.appendChild(div);
  });
}

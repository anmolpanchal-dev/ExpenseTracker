export function renderRecentExpenses(monthExpenses) {
  const recentList = document.getElementById("recentList");
  if (!recentList) return;

  recentList.innerHTML = "";

  const lastFive = [...monthExpenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  if (lastFive.length === 0) {
    const empty = document.createElement("p");
    empty.className = "recent-date";
    empty.innerText = "No expenses for this month";
    recentList.appendChild(empty);
    return;
  }

  lastFive.forEach((expense) => {
    const div = document.createElement("div");
    div.className = "recent-item";
    const formattedDate = new Date(`${expense.date}T00:00:00`).toLocaleDateString("en-IN");

    div.innerHTML = `
      <div>
        <div class="recent-category">${expense.category}</div>
        <div class="recent-date">${formattedDate}</div>
      </div>
      <div class="recent-date">${expense.note || "-"}</div>
      <div class="recent-amount">Rs ${expense.amount}</div>
    `;

    recentList.appendChild(div);
  });
}

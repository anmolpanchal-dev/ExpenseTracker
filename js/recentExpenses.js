const GROUPS_PER_BATCH = 6;

export function renderRecentExpenses(monthExpenses) {
  const recentList = document.getElementById("recentList");
  if (!recentList) return;

  recentList.innerHTML = "";

  const groups = new Map();
  monthExpenses.forEach((expense) => {
    if (!groups.has(expense.date)) {
      groups.set(expense.date, []);
    }
    groups.get(expense.date).push(expense);
  });

  const sortedDates = [...groups.keys()].sort((a, b) => new Date(b) - new Date(a));

  if (sortedDates.length === 0) {
    const empty = document.createElement("p");
    empty.className = "chart-empty";
    empty.innerText = "No expenses for this month";
    recentList.appendChild(empty);
    return;
  }

  let rendered = 0;

  const renderBatch = () => {
    const nextDates = sortedDates.slice(rendered, rendered + GROUPS_PER_BATCH);
    nextDates.forEach((dateKey, index) => {
      const expensesForDate = [...groups.get(dateKey)].sort((a, b) => b.timestamp - a.timestamp);
      const total = expensesForDate.reduce((sum, expense) => sum + expense.amount, 0);

      const details = document.createElement("details");
      details.className = "date-group";
      if (rendered === 0 && index === 0) details.open = true;

      const prettyDate = new Date(`${dateKey}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      const summary = document.createElement("summary");
      summary.innerHTML = `
        <span>${prettyDate}</span>
        <span class="date-total">Rs ${total.toLocaleString("en-IN")}</span>
      `;

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "date-items";

      expensesForDate.forEach((expense) => {
        const row = document.createElement("div");
        row.className = "recent-item";
        row.innerHTML = `
          <div>
            <div class="recent-category">${expense.category}</div>
            <div class="recent-date">${expense.note || "No note"}</div>
          </div>
          <div class="recent-amount">Rs ${Number(expense.amount).toLocaleString("en-IN")}</div>
        `;
        itemsWrap.appendChild(row);
      });

      details.appendChild(summary);
      details.appendChild(itemsWrap);
      recentList.appendChild(details);
    });

    rendered += nextDates.length;

    const oldButton = recentList.querySelector(".load-more-btn");
    if (oldButton) oldButton.remove();

    if (rendered < sortedDates.length) {
      const loadMore = document.createElement("button");
      loadMore.type = "button";
      loadMore.className = "load-more-btn";
      loadMore.innerText = "Load More";
      loadMore.addEventListener("click", renderBatch);
      recentList.appendChild(loadMore);
    }
  };

  renderBatch();
}

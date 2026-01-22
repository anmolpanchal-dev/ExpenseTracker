let expensesList = [];
let totalSpendAmount = 0;
let amountInput = document.querySelector('#amountInput');
let displaySpendMoney = document.querySelector('.amount');
function test(e) {
    e.preventDefault();
    const enteredAmount = Number(amountInput.value);
    if (!enteredAmount) return;
    expensesList.push(enteredAmount);
    console.log(expensesList);
    totalSpendAmount += enteredAmount;
    displaySpendMoney.innerText = `₹ ${totalSpendAmount}`;
    amountInput.value = '';
}
document.querySelector('#addExpenses').addEventListener('click',test);
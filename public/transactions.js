document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('expenseForm');
    const expensesList = document.getElementById('expensesList');
    const addExpense = document.getElementById('addexpensesByMonth');
const addExpensesByCategory = document.getElementById('addexpensesByCategory');
    // Fetch and display expenses on load
    fetchExpenses();

    // Handle the expense form submission
    expenseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const date = document.getElementById('date').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;

        const expenseData = { date, amount, category };

        fetch('/addExpense', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expenseData),
        })
        .then(response => response.text())
        .then(message => {
            alert(message);
            fetchExpenses(); // Refresh the expenses list
        })
        .catch(error => console.error('Error:', error));
    });

    // Fetch and display expenses
    // function fetchExpenses() {
    //     fetch('/getExpenses')
    //     .then(response => response.json())
    //     .then(expenses => {
    //         expensesList.innerHTML = expenses.map(expense => 
    //             `<div>${expense.date} - ${expense.amount} - ${expense.category}</div>`
    //         ).join('');
    //     })
    //     .catch(error => console.error('Error:', error));
    // }
    function fetchExpenses() {
        fetch('/getExpenses')
        .then(response => response.json())
        .then(expenses => {
            expensesList.innerHTML = expenses.map(expense => {
                const formattedDate = new Date(expense.date).toLocaleDateString();
                return '<div>' + formattedDate + ' - ' + expense.amount + ' - ' + expense.category + '</div>';
               


  }).join('');
        })
        .catch(error => console.error('Error:', error));
    }
    



    // Sort expenses by month (placeholder function)
    addExpense.addEventListener('click', function() {
        fetch('/expensesByMonth')
        .then(response => response.json())
        .then(expensesByMonth => {
            let html = expensesByMonth.map(monthlyData => 
                `<div>Month: ${monthlyData._id}, Total: ${monthlyData.totalAmount}, Count: ${monthlyData.count}</div>`
            ).join('');
            document.getElementById('expensesList').innerHTML = html;
        })
        .catch(error => console.error('Error:', error));    });

    // Sort expenses by category (placeholder function)
    addExpensesByCategory.addEventListener('click', function() {
    fetch('/expensesByCategory')
    .then(response => response.json())
    .then(expensesByCategory => {
        let html = expensesByCategory.map(categoryData => 
            `<div>Category: ${categoryData._id}, Total: ${categoryData.totalAmount}, Count: ${categoryData.count}</div>`
        ).join('');
        document.getElementById('expensesList').innerHTML = html;
 })
.catch(error => console.error('Error:', error));    });





});

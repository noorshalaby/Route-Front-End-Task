"use strict";

document.addEventListener("DOMContentLoaded", function () {
  // ~ HTML Elements
  let customers = [];
  let transactions = [];
  const filterNameInput = document.getElementById("filterName");
  const filterAmountInput = document.getElementById("filterAmount");
  const tbody = document.querySelector("#customerTable tbody");

  //* Fetch data from local JSON file
  async function getData() {
    const data = await fetch("./db.json");
    const response = await data.json();

    customers = response.customers;
    transactions = response.transactions;
    displayTable(transactions);
  }
  getData();

  filterNameInput.addEventListener("input", filterTable);
  filterAmountInput.addEventListener("input", filterTable);

  // ! Fnc to filter Data
  function filterTable() {
    const filterName = filterNameInput.value.toLowerCase();
    const filterAmount = parseFloat(filterAmountInput.value);
    const filteredTransactions = transactions.filter((transaction) => {
      const customer = customers.find((c) => c.id === transaction.customer_id);
      return (
        (!filterName || customer.name.toLowerCase().includes(filterName)) &&
        (!filterAmount || transaction.amount === filterAmount)
      );
    });
    displayTable(filteredTransactions);
  }

  // & Fnc to display Data
  function displayTable(transactions) {
    tbody.innerHTML = "";
    transactions.forEach((transaction) => {
      const customer = customers.find((c) => c.id === transaction.customer_id);
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${customer.name}</td>
          <td>${transaction.date}</td>
          <td>${transaction.amount}</td>
        `;
      row.addEventListener("click", () => displayChart(customer.id));
      tbody.appendChild(row);
    });
  }

  function displayChart(customerId) {
    const customerTransactions = transactions.filter(
      (t) => t.customer_id === customerId
    );
    const dates = [...new Set(customerTransactions.map((t) => t.date))];
    const amounts = dates.map((date) => {
      return customerTransactions
        .filter((t) => t.date === date)
        .reduce((sum, t) => sum + t.amount, 0);
    });

    const ctx = document.getElementById("transactionChart").getContext("2d");

    // Check if there's an existing chart instance and destroy it
    if (window.myChart instanceof Chart) {
      window.myChart.destroy();
    }

    // Create new chart instance
    window.myChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: dates,
        datasets: [
          {
            label: "Transaction Amount",
            data: amounts,
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: { beginAtZero: true },
          y: { beginAtZero: true },
        },
      },
    });
  }
});

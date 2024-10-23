import { useState, useEffect } from 'react';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import ExpenseChart from './components/ExpenseChart';
import BudgetForm from './components/BudgetForm';
import { db } from './firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({ Food: 300, Transport: 150, Entertainment: 100 });

  useEffect(() => {
    const fetchExpenses = async () => {
      const expenseCollection = collection(db, 'expenses');
      const expenseSnapshot = await getDocs(expenseCollection);
      const expenseList = expenseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(expenseList);
    };

    fetchExpenses();
  }, []);

  const addExpense = async (expense) => {
    const docRef = await addDoc(collection(db, 'expenses'), expense);
    setExpenses([...expenses, { id: docRef.id, ...expense }]);
  };

  const downloadCSV = (expenses) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + expenses.map(e => `${e.description},${e.amount},${e.category},${e.date}`).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handleDownload = () => {
    downloadCSV(expenses);
  };

  const summarizeExpenses = () => {
    const summary = {};
    expenses.forEach(expense => {
      const category = expense.category || 'Uncategorized';
      if (!summary[category]) {
        summary[category] = { total: 0, count: 0 };
      }
      summary[category].total += parseFloat(expense.amount);
      summary[category].count += 1;
    });
    return summary;
  };

  const summary = summarizeExpenses();

  return (
    <div>
      <h1>Expense Tracker</h1>
      <BudgetForm budgets={budgets} setBudgets={setBudgets} />
      <ExpenseForm onAddExpense={addExpense} />
      <ExpenseList expenses={expenses} />
      <ExpenseChart expenses={expenses} />
      <button onClick={handleDownload}>Download CSV</button>
      <div>
        <h2>Expense Summary</h2>
        {Object.entries(summary).map(([category, data]) => (
          <div key={category}>
            <strong>{category}: </strong>${data.total.toFixed(2)} (Count: {data.count})
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;

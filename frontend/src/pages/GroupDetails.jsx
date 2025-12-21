import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const GroupDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [group, setGroup] = useState(null);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const response = await axios.get(`http://localhost:5000/api/groups/${id}`, config);
                setGroup(response.data.group);
                setExpenses(response.data.expenses);
            } catch (error) {
                toast.error('Failed to load group data');
            }
        };
        if (user) fetchGroupData();
    }, [id, user]);

    const downloadCSV = () => {
        if (!expenses.length) return;

        let csv = 'Description,Amount,Paid By,Date\n';
        expenses.forEach(e => {
            csv += `"${e.description}",${e.amount},"${e.paidBy.name}",${new Date(e.date).toLocaleDateString()}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `group_expenses_${group.name}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (!group) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    // Chart Data: Total consumed by each member (simplified or total paid?)
    // Let's visualize "Balances" - who owes (+) vs who is owed (-)
    // Pie chart doesn't work well for negative numbers.
    // Maybe "Total Paid by User"?

    const paymentsByUser = {};
    expenses.forEach(e => {
        paymentsByUser[e.paidBy.name] = (paymentsByUser[e.paidBy.name] || 0) + e.amount;
    });
    const chartData = Object.keys(paymentsByUser).map(name => ({ name, value: paymentsByUser[name] }));
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">{group.name}</h1>
                    <p className="text-gray-500 mt-1">{group.description}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadCSV} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium transition">
                        Download CSV
                    </button>
                    <Link to={`/groups/${id}/add-expense`} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg shadow-md hover:from-orange-600 hover:to-red-600 font-bold transition">
                        Add Expense
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Balances Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Member Balances</h2>
                    {(group.balances && group.balances.length > 0) ? (
                        <ul className="space-y-4">
                            {group.balances.map((balance) => (
                                <li key={balance.user._id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                    <span className="font-semibold text-gray-700">{balance.user.name}</span>
                                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${balance.balance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {balance.balance >= 0 ? `gets back $${balance.balance.toFixed(2)}` : `owes $${Math.abs(balance.balance).toFixed(2)}`}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No balances yet.</p>
                    )}
                </div>

                {/* Chart Card */}
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center justify-center">
                    <h2 className="text-xl font-bold mb-4 w-full text-left text-gray-800">Total Spending Share</h2>
                    {chartData.length > 0 ? (
                        <div className="w-full h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className="text-gray-400">Add expenses to see stats</p>
                    )}
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Expense History</h2>
                {expenses.length === 0 ? <p className="text-gray-500 text-center">No expenses recorded yet.</p> : (
                    <div className="space-y-4">
                        {expenses.map((expense) => (
                            <div key={expense._id} className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-100 pb-4 last:border-0 hover:bg-gray-50 p-2 rounded-lg transition">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">{expense.description}</p>
                                    <p className="text-sm text-gray-500 font-medium">
                                        <span className="text-blue-600">{expense.paidBy.name}</span> paid <span className="text-gray-900 font-bold">${expense.amount.toFixed(2)}</span> • {new Date(expense.date).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right mt-2 md:mt-0">
                                    {/* Show how much it cost ME */}
                                    {(() => {
                                        const mySplit = expense.splits.find(s => s.user === user._id);
                                        return mySplit ? (
                                            <span className="text-orange-600 font-semibold bg-orange-50 px-3 py-1 rounded-lg">You borrowed ${mySplit.amount.toFixed(2)}</span>
                                        ) : (
                                            expense.paidBy._id === user._id ? <span className="text-green-600 font-semibold bg-green-50 px-3 py-1 rounded-lg">You lent ${expense.amount.toFixed(2)}</span> : <span className="text-gray-400">Not involved</span>
                                        );
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupDetails;

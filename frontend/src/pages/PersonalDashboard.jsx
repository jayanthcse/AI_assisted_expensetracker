import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const PersonalDashboard = () => {
    const { user } = useContext(AuthContext);
    const [transactions, setTransactions] = useState([]);
    const [formData, setFormData] = useState({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
    });

    const categories = ['Food', 'Housing', 'Transport', 'Utilities', 'Entertainment', 'Salary', 'Other'];
    const [summary, setSummary] = useState({ income: 0, expense: 0 });

    useEffect(() => {
        if (user) fetchTransactions();
    }, [user]);

    const fetchTransactions = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.get('http://localhost:5000/api/personal', config);
            setTransactions(response.data);
            calculateSummary(response.data);
        } catch (error) {
            toast.error('Failed to fetch transactions');
        }
    };

    const calculateSummary = (data) => {
        const inc = data.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
        const exp = data.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
        setSummary({ income: inc, expense: exp });
    };

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/personal', formData, config);
            toast.success('Transaction added');
            setFormData({ type: 'expense', amount: '', category: '', description: '' });
            fetchTransactions();
        } catch (error) {
            toast.error('Failed to add transaction');
        }
    };

    const downloadCSV = () => {
        if (!transactions.length) return;
        let csv = 'Date,Description,Type,Category,Amount\n';
        transactions.forEach(t => {
            csv += `${new Date(t.date).toLocaleDateString()},"${t.description}",${t.type},${t.category},${t.amount}\n`;
        });
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'personal_transactions.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Chart Data Preparation
    const categoryData = categories.map(cat => ({
        name: cat,
        value: transactions.filter(t => t.category === cat && t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
    })).filter(d => d.value > 0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                    <p className="font-bold text-gray-800">{payload[0].name}</p>
                    <p className="text-purple-600 font-semibold">${payload[0].value.toFixed(2)}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="p-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Add Transaction</h2>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                            <select name="type" value={formData.type} onChange={onChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-gray-50">
                                <option value="expense">Expense</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
                            <input type="number" name="amount" value={formData.amount} onChange={onChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-gray-50" required placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                        <input type="text" name="description" value={formData.description} onChange={onChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-gray-50" required placeholder="Details..." />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                        <select name="category" value={formData.category} onChange={onChange} className="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-purple-500 bg-gray-50 mb-2" required>
                            <option value="">Select Category</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition transform active:scale-95">Add Transaction</button>
                </form>
            </div>

            {/* Summary Section */}
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-green-500">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Income</h3>
                        <p className="text-3xl text-gray-800 font-bold mt-2">${summary.income.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg border-l-4 border-red-500">
                        <h3 className="text-gray-500 font-bold uppercase text-xs tracking-wider">Total Expenses</h3>
                        <p className="text-3xl text-gray-800 font-bold mt-2">${summary.expense.toFixed(2)}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 h-80 flex flex-col items-center">
                    <h3 className="text-gray-800 font-bold mb-2 w-full text-left">Expense Breakdown</h3>
                    {categoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    fill="#8884d8"
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">No expense data</div>
                    )}
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>
                    <button onClick={downloadCSV} className="text-sm bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 font-semibold transition">
                        Download CSV
                    </button>
                </div>

                {transactions.length === 0 ? <p className="text-gray-500 text-center">No transactions yet.</p> : (
                    <ul className="divide-y divide-gray-100">
                        {transactions.map(t => (
                            <li key={t._id} className="flex justify-between items-center py-4 hover:bg-gray-50 px-2 rounded-lg transition">
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-800">{t.description}</span>
                                    <span className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.category}</span>
                                </div>
                                <span className={`font-bold text-lg ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === 'income' ? '+' : '-'}${t.amount.toFixed(2)}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default PersonalDashboard;

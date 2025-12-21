import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';

const Home = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [data, setData] = useState({ income: 0, expenses: 0, netBalance: 0, history: [] });

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const token = user.token;
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [personalRes, groupRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/personal', config),
                    axios.get('http://localhost:5000/api/groups', config)
                ]);

                // Calculate Personal Income/Expense
                const personalIncome = personalRes.data.filter(t => t.type === 'income').reduce((acc, c) => acc + c.amount, 0);
                const personalExpense = personalRes.data.filter(t => t.type === 'expense').reduce((acc, c) => acc + c.amount, 0);

                // Calculate Group Net Balance
                let groupNet = 0;
                groupRes.data.forEach(group => {
                    const myBalance = group.balances.find(b => b.user === user._id)?.balance || 0;
                    groupNet += myBalance;
                });

                // Simple history construction for chart (last 5 transactions)
                const sortedHistory = personalRes.data
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 7)
                    .map(t => ({ name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), amount: t.amount, type: t.type }))
                    .reverse();

                setData({
                    income: personalIncome,
                    expenses: personalExpense,
                    netBalance: groupNet,
                    history: sortedHistory
                });

            } catch (error) {
                console.error('Failed to fetch dashboard data');
            }
        };

        fetchData();

    }, [user, navigate]);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-2 text-lg">Good to see you again, <span className="text-purple-600 font-semibold">{user && user.name}</span>!</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="relative overflow-hidden p-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl shadow-xl text-white transform hover:scale-105 transition duration-300">
                    <div className="relative z-10">
                        <h2 className="text-lg font-medium opacity-90 mb-1">Total Income</h2>
                        <p className="text-4xl font-bold tracking-wider">${data.income.toFixed(2)}</p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl"></div>
                </div>

                <div className="relative overflow-hidden p-8 bg-gradient-to-br from-red-400 to-rose-600 rounded-2xl shadow-xl text-white transform hover:scale-105 transition duration-300">
                    <div className="relative z-10">
                        <h2 className="text-lg font-medium opacity-90 mb-1">Total Expenses</h2>
                        <p className="text-4xl font-bold tracking-wider">${data.expenses.toFixed(2)}</p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl"></div>
                </div>

                <div className="relative overflow-hidden p-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl shadow-xl text-white transform hover:scale-105 transition duration-300">
                    <div className="relative z-10">
                        <h2 className="text-lg font-medium opacity-90 mb-1">Net Balance (Groups)</h2>
                        <p className="text-4xl font-bold tracking-wider">
                            {data.netBalance >= 0 ? `+${data.netBalance.toFixed(2)}` : `-${Math.abs(data.netBalance).toFixed(2)}`}
                        </p>
                        <p className="text-sm opacity-80 mt-2 font-medium">{data.netBalance >= 0 ? 'You are owed' : 'You owe'}</p>
                    </div>
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-20 rounded-full blur-xl"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="lg:col-span-1 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="font-bold text-xl text-gray-800 mb-6 border-b pb-4">Quick Actions</h3>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => navigate('/personal')} className="flex items-center justify-center gap-3 w-full bg-purple-50 text-purple-700 py-4 rounded-xl font-semibold hover:bg-purple-100 transition shadow-sm border border-purple-100">
                                <span>Add Personal Transaction</span>
                            </button>
                            <button onClick={() => navigate('/groups/create')} className="flex items-center justify-center gap-3 w-full bg-blue-50 text-blue-700 py-4 rounded-xl font-semibold hover:bg-blue-100 transition shadow-sm border border-blue-100">
                                <span>Create New Group</span>
                            </button>
                            <button onClick={() => navigate('/scan')} className="flex items-center justify-center gap-3 w-full bg-orange-50 text-orange-700 py-4 rounded-xl font-semibold hover:bg-orange-100 transition shadow-sm border border-orange-100">
                                <span>Scan Bill with AI</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h3 className="font-bold text-xl text-gray-800 mb-6">Recent Activity Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.history}>
                                <defs>
                                    <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#8884d8" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

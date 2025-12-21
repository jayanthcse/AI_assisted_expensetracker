import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const AddExpense = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [group, setGroup] = useState(null);
    const [splitType, setSplitType] = useState('equal');
    const [splits, setSplits] = useState([]);

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const response = await axios.get(`http://localhost:5000/api/groups/${id}`, config);
                setGroup(response.data.group);
                const initialSplits = response.data.group.members.map(m => ({
                    user: m._id,
                    name: m.name,
                    amount: 0,
                    percentage: 0
                }));
                setSplits(initialSplits);
            } catch (error) {
                toast.error('Failed to load group');
            }
        };
        if (user) fetchGroup();
    }, [id, user]);

    const handleAmountChange = (e) => {
        setAmount(e.target.value);
    };

    // Recalculate splits
    useEffect(() => {
        if (!amount || !group) return;

        if (splitType === 'equal') {
            const splitAmount = Number(amount) / group.members.length;
            setSplits(prev => prev.map(s => ({ ...s, amount: splitAmount })));
        } else if (splitType === 'percentage') {
            // Recalc amounts based on existing percentages
            setSplits(prev => prev.map(s => ({
                ...s,
                amount: (Number(amount) * (s.percentage || 0)) / 100
            })));
        }
    }, [amount, splitType, group]);

    const handleSplitChange = (userId, value, field) => {
        if (field === 'percentage') {
            setSplits(prev => prev.map(s => {
                if (s.user === userId) {
                    const newPercentage = Number(value);
                    const newAmount = (Number(amount) * newPercentage) / 100;
                    return { ...s, percentage: newPercentage, amount: newAmount };
                }
                return s;
            }));
        } else {
            // Exact Amount
            setSplits(prev => prev.map(s => {
                if (s.user === userId) {
                    return { ...s, [field]: value };
                }
                return s;
            }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        const totalSplit = splits.reduce((acc, curr) => acc + Number(curr.amount), 0);

        if (Math.abs(totalSplit - Number(amount)) > 0.1) {
            toast.error(`Total split amount (${totalSplit.toFixed(2)}) must match expense amount (${amount})`);
            return;
        }

        if (splitType === 'percentage') {
            const totalPercent = splits.reduce((acc, curr) => acc + Number(curr.percentage), 0);
            if (Math.abs(totalPercent - 100) > 0.1) {
                toast.error(`Total percentage must constitute 100% (Currently: ${totalPercent}%)`);
                return;
            }
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const expenseData = {
                description,
                amount: Number(amount),
                splits: splits.map(s => ({ user: s.user, amount: Number(s.amount) })),
                date: new Date()
            };

            await axios.post(`http://localhost:5000/api/groups/${id}/expenses`, expenseData, config);
            toast.success('Expense added');
            navigate(`/groups/${id}`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add expense');
        }
    };

    if (!group) return <div>Loading...</div>;

    return (
        <div className="flex justify-center p-8 bg-gray-50 min-h-screen">
            <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Add Expense</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <input
                            type="text"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="Dinner, Movie, Groceries..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ($)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={handleAmountChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                            placeholder="0.00"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Split Method</label>
                        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
                            {['equal', 'exact', 'percentage'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setSplitType(type)}
                                    className={`flex-1 py-2 rounded-md font-medium capitalize transition ${splitType === type ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="font-bold text-gray-700 mb-4">Split Details</h3>
                        {splits.map(split => (
                            <div key={split.user} className="flex items-center justify-between mb-3 last:mb-0">
                                <span className="font-medium text-gray-700 w-1/3">{split.name}</span>

                                {splitType === 'equal' && (
                                    <span className="text-gray-900 font-semibold">${Number(split.amount).toFixed(2)}</span>
                                )}

                                {splitType === 'exact' && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={split.amount}
                                            onChange={(e) => handleSplitChange(split.user, e.target.value, 'amount')}
                                            className="w-24 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                        />
                                    </div>
                                )}

                                {splitType === 'percentage' && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <input
                                                type="number"
                                                value={split.percentage}
                                                onChange={(e) => handleSplitChange(split.user, e.target.value, 'percentage')}
                                                className="w-20 px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            />
                                            <span className="text-gray-500">%</span>
                                        </div>
                                        <span className="text-sm text-gray-500 min-w-[60px]">
                                            ${Number(split.amount).toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}

                        {splitType === 'percentage' && (
                            <div className="mt-4 pt-4 border-t flex justify-end">
                                <span className={`font-bold ${Math.abs(splits.reduce((a, c) => a + c.percentage, 0) - 100) < 0.1 ? 'text-green-600' : 'text-red-500'}`}>
                                    Total: {splits.reduce((a, c) => a + Number(c.percentage), 0).toFixed(1)}%
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={() => navigate(`/groups/${id}`)} className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                        <button type="submit" className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg shadow-lg hover:from-purple-700 hover:to-indigo-700 font-bold transition">Save Expense</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExpense;

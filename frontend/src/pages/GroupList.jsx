import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const GroupList = () => {
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const response = await axios.get('http://localhost:5000/api/groups', config);
                setGroups(response.data);
            } catch (error) {
                toast.error('Failed to load groups');
            }
        };
        if (user) fetchGroups();
    }, [user]);

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Your Groups</h1>
                <Link to="/groups/create" className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:from-purple-700 hover:to-indigo-700 font-bold transition transform hover:scale-105">
                    + Create New Group
                </Link>
            </div>

            {groups.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-gray-500 text-lg mb-4">You are not part of any groups yet.</p>
                    <Link to="/groups/create" className="text-purple-600 font-semibold hover:underline">Start a group now</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => {
                        // Find my balance
                        const myBalance = group.balances.find(b => b.user === user._id)?.balance || 0;
                        return (
                            <Link to={`/groups/${group._id}`} key={group._id} className="block group">
                                <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition duration-300 transform group-hover:-translate-y-1 h-full flex flex-col justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 mb-2 truncate">{group.name}</h2>
                                        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{group.description || 'No description'}</p>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-400">Balance</span>
                                        <span className={`font-bold px-3 py-1 rounded-full text-sm ${myBalance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {myBalance >= 0 ? `+$${myBalance.toFixed(2)}` : `-$${Math.abs(myBalance).toFixed(2)}`}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default GroupList;

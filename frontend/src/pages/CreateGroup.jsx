import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const CreateGroup = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [memberEmail, setMemberEmail] = useState('');
    const [members, setMembers] = useState([]);

    const addMember = (e) => {
        e.preventDefault();
        if (memberEmail && !members.includes(memberEmail)) {
            setMembers([...members, memberEmail]);
            setMemberEmail('');
        }
    };

    const removeMember = (email) => {
        setMembers(members.filter((m) => m !== email));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!name) {
            toast.error('Please add a group name');
            return;
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/groups', { name, description, members }, config);
            toast.success('Group Created');
            navigate('/groups');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create group');
        }
    };

    return (
        <div className="flex justify-center p-8 min-h-screen items-start bg-gray-50 pt-16">
            <div className="w-full max-w-2xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Create New Group</h2>
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Group Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 focus:bg-white transition"
                            placeholder="Trip to Vegas, House Expenses..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 focus:bg-white transition"
                            placeholder="Brief description..."
                            rows="3"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Add Members (by Email)</label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                value={memberEmail}
                                onChange={(e) => setMemberEmail(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:outline-none bg-gray-50 focus:bg-white transition"
                                placeholder="friend@example.com"
                            />
                            <button onClick={addMember} className="bg-gray-800 text-white px-6 rounded-xl font-bold hover:bg-gray-900 transition">Add</button>
                        </div>

                        {members.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {members.map(email => (
                                    <span key={email} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                                        {email}
                                        <button type="button" onClick={() => removeMember(email)} className="text-purple-400 hover:text-purple-600 font-bold">×</button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition transform active:scale-95 text-lg"
                    >
                        Create Group
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateGroup;

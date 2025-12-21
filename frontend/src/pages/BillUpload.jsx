import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useEffect } from 'react';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

const BillUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [saveMode, setSaveMode] = useState('personal');
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState('');

    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user && saveMode === 'group') {
            const fetchGroups = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const res = await axios.get('http://localhost:5000/api/groups', config);
                    setGroups(res.data);
                } catch (e) {
                    console.error(e);
                }
            };
            fetchGroups();
        }
    }, [user, saveMode]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        setFile(selected);
        if (selected) {
            setPreview(URL.createObjectURL(selected));
            setScanResult(null);
        }
    };

    const handleScan = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('bill', file);

        setScanning(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' } };
            const response = await axios.post('http://localhost:5000/api/ocr/scan', formData, config);
            setScanResult(response.data); // data has { text, amount, date }
        } catch (error) {
            toast.error('Scan failed');
        } finally {
            setScanning(false);
        }
    };

    const handleSave = async () => {
        if (!scanResult) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            if (saveMode === 'personal') {
                const data = {
                    type: 'expense',
                    amount: scanResult.amount,
                    category: 'Other',
                    description: `Scanned Bill (${scanResult.date || 'No Date'})`
                };
                await axios.post('http://localhost:5000/api/personal', data, config);
                toast.success('Saved to Personal Expenses');
                navigate('/');
            } else {
                if (!selectedGroup) {
                    toast.error('Select a group');
                    return;
                }
                navigate(`/groups/${selectedGroup}/add-expense`, {
                    state: {
                        amount: scanResult.amount,
                        description: `Scanned Bill`
                    }
                });
            }
        } catch (error) {
            toast.error('Failed to save');
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 text-center">AI Bill Scanner</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
                    <div className="w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center relative overflow-hidden group hover:border-purple-400 transition">
                        {preview ? (
                            <img src={preview} alt="Preview" className="object-contain w-full h-full" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <span className="text-4xl mb-2">📷</span>
                                <p>Click below to upload</p>
                            </div>
                        )}
                    </div>
                    <input type="file" onChange={handleFileChange} className="mt-4 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 mb-4" />

                    <button
                        onClick={handleScan}
                        disabled={!file || scanning}
                        className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition ${scanning || !file ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transform active:scale-95'}`}
                    >
                        {scanning ? 'Scanning...' : 'Scan Bill'}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-gray-800">Scan Results</h2>
                    {scanResult ? (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1">Detected Amount</label>
                                <input type="number" value={scanResult.amount} onChange={(e) => setScanResult({ ...scanResult, amount: e.target.value })} className="w-full text-2xl font-bold text-gray-800 border-b border-gray-200 focus:border-purple-500 focus:outline-none py-1" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-500 mb-1">Detected Date</label>
                                <input type="text" value={scanResult.date || 'N/A'} onChange={(e) => setScanResult({ ...scanResult, date: e.target.value })} className="w-full font-medium text-gray-800 border-b border-gray-200 focus:border-purple-500 focus:outline-none py-1" />
                            </div>

                            <div className="pt-4 border-t">
                                <label className="block text-sm font-bold text-gray-700 mb-3">Save As:</label>
                                <div className="flex gap-4 mb-4">
                                    <button onClick={() => setSaveMode('personal')} className={`flex-1 py-2 rounded-lg font-medium border ${saveMode === 'personal' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Personal</button>
                                    <button onClick={() => setSaveMode('group')} className={`flex-1 py-2 rounded-lg font-medium border ${saveMode === 'group' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>Group Split</button>
                                </div>

                                {saveMode === 'group' && (
                                    <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full px-4 py-2 border rounded-lg mb-4 bg-white">
                                        <option value="">Select Group</option>
                                        {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                                    </select>
                                )}

                                <button onClick={handleSave} className="w-full bg-green-500 text-white font-bold py-3 rounded-xl hover:bg-green-600 shadow-lg transition transform active:scale-95">
                                    Confirm & Save
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-gray-400 text-center py-10">Scan a bill to see details here.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BillUpload;

import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const isActive = (path) => location.pathname === path ? 'text-white border-b-2 border-white' : 'text-purple-100 hover:text-white';

    return (
        <nav className="bg-gradient-to-r from-purple-700 to-indigo-600 shadow-lg">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
                    <span>ExpenseTracker</span>
                </Link>
                <div className="flex gap-8 items-center font-medium">
                    <Link to="/" className={`transition duration-200 ${isActive('/')}`}>Dashboard</Link>
                    <Link to="/groups" className={`transition duration-200 ${isActive('/groups')}`}>Groups</Link>
                    <Link to="/personal" className={`transition duration-200 ${isActive('/personal')}`}>Personal</Link>
                    <Link to="/scan" className={`transition duration-200 ${isActive('/scan')}`}>Scan Bill</Link>
                    <button
                        onClick={onLogout}
                        className="bg-white text-purple-700 px-5 py-2 rounded-full font-bold shadow-md hover:bg-gray-100 transition-transform transform hover:-translate-y-0.5"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

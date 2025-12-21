import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const { name, email, password, confirmPassword } = formData;
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await register({ name, email, password });
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex-row-reverse">
                {/* Right Side - Image/Gradient */}
                <div className="hidden w-1/2 bg-gradient-to-bl from-pink-500 to-orange-400 lg:flex flex-col items-center justify-center text-white p-12">
                    <h1 className="mb-4 text-4xl font-bold">Join Us Today</h1>
                    <p className="text-center text-lg text-pink-100">
                        Start tracking expenses and splitting bills effortlessly.
                    </p>
                </div>

                {/* Left Side - Form */}
                <div className="w-full lg:w-1/2 p-12">
                    <h2 className="mb-8 text-3xl font-bold text-gray-800 text-center lg:text-left">Create Account</h2>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                                placeholder="John Doe"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                                placeholder="name@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={onChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 focus:border-pink-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-pink-200 transition"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-6 w-full rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 py-3 font-semibold text-white shadow-lg transition hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                            Sign Up
                        </button>

                        <p className="text-center text-sm text-gray-600 mt-4">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-pink-500 hover:text-pink-600">
                                Log In
                            </Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;

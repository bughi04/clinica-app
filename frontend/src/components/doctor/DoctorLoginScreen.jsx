import React, { useState } from 'react';
import { Settings, Eye, EyeOff, AlertCircle } from 'lucide-react';
import ApiService from '../../services/apiService';

const DoctorLoginScreen = ({ onLogin, onRegister }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showDemo, setShowDemo] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting doctor login with username:', username);

            const response = await ApiService.loginUser(username, password);

            if (response.user) {
                console.log('Doctor login successful:', response.user);
                onLogin(response.user);
            }
        } catch (err) {
            console.error('Doctor login error:', err);
            setError(err.message || 'Eroare la conectare. Verificați credențialele și încercați din nou.');
        }

        setLoading(false);
    };

    const handleDemoLogin = (demoCredentials) => {
        setUsername(demoCredentials.username);
        setPassword(demoCredentials.password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-[rgb(59,185,194)] to-[rgb(49,175,184)] rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Settings className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] bg-clip-text text-transparent mb-2">
                        Acces Doctor
                    </h1>
                    <p className="text-gray-600 text-lg">Dental Point Clinic</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nume utilizator
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                            placeholder="Introduceți numele de utilizator"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Parolă
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                                placeholder="Introduceți parola"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Demo Accounts Section */}
                    <div className="bg-gradient-to-r from-[rgb(59,185,194)]/10 to-[rgb(49,175,184)]/10 rounded-xl p-4 border border-[rgb(59,185,194)]/30">
                        <button
                            type="button"
                            onClick={() => setShowDemo(!showDemo)}
                            className="flex items-center justify-between w-full text-sm font-medium text-[rgb(59,185,194)] hover:text-[rgb(49,175,184)] transition-colors duration-200"
                        >
                            <span>Conturi Demo Disponibile</span>
                            <div className={`transform transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`}>
                                ▼
                            </div>
                        </button>

                        {showDemo && (
                            <div className="mt-3 space-y-2">
                                {[
                                    {
                                        username: 'dr.popescu',
                                        password: 'password123',
                                        name: 'Dr. Popescu (Medic Principal)',
                                        color: 'bg-green-100 text-green-800'
                                    },
                                    {
                                        username: 'dr.ionescu',
                                        password: 'password123',
                                        name: 'Dr. Ionescu (Ortodont)',
                                        color: 'bg-yellow-100 text-yellow-800'
                                    },
                                    {
                                        username: 'dr.maria',
                                        password: 'password123',
                                        name: 'Dr. Maria (Chirurg)',
                                        color: 'bg-[rgb(59,185,194)]/20 text-[rgb(49,175,184)]'
                                    }
                                ].map((demo, index) => (
                                    <button
                                        key={demo.username}
                                        type="button"
                                        onClick={() => handleDemoLogin(demo)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs ${demo.color} hover:scale-105 transition-transform duration-200`}
                                    >
                                        <code className="font-mono font-semibold">{demo.username}</code> - {demo.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !username.trim() || !password.trim()}
                        className="w-full bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] text-white py-4 px-6 rounded-xl font-medium hover:from-[rgb(49,175,184)] hover:to-[rgb(39,165,174)] disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                                Se încarcă...
                            </div>
                        ) : (
                            'Intră în cont'
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 mb-4">Nu aveți cont de doctor?</p>
                    <button
                        onClick={onRegister}
                        className="group text-[rgb(59,185,194)] hover:text-[rgb(49,175,184)] font-medium text-lg transition-all duration-300 hover:scale-105"
                    >
                        <span className="border-b-2 border-transparent group-hover:border-[rgb(59,185,194)] transition-all duration-300">
                            Înregistrare doctor nou
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoctorLoginScreen;

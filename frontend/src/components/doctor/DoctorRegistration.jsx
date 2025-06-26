import { useState } from 'react';
import { Settings, Eye, EyeOff, AlertCircle, ArrowLeft } from 'react-feather';

const DoctorRegistration = ({ onBack }) => {
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Handle form submission logic here
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="bg-gradient-to-br from-[rgb(59,185,194)] to-[rgb(49,175,184)] rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Settings className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] bg-clip-text text-transparent mb-2">
                    Înregistrare Doctor
                </h1>
                <p className="text-gray-600 text-lg">Dental Point Clinic</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Nume utilizator
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                        placeholder="Introduceți numele de utilizator"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Prenume
                        </label>
                        <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                            placeholder="Prenume"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Nume
                        </label>
                        <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                            placeholder="Nume"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Parolă
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
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

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Confirmă parola
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                            placeholder="Confirmați parola"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                        <div className="flex items-center">
                            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Înapoi
                    </button>

                    <button
                        type="submit"
                        disabled={loading || !formData.username.trim() || !formData.password.trim() || !formData.firstname.trim() || !formData.lastname.trim()}
                        className="flex-1 bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] text-white py-4 px-6 rounded-xl font-medium hover:from-[rgb(49,175,184)] hover:to-[rgb(39,165,174)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Se încarcă...
                            </div>
                        ) : (
                            'Înregistrare'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DoctorRegistration;

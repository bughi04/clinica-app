import React, { useState, useEffect } from 'react';
import { User, Settings, Stethoscope, Activity, Shield, Award } from 'lucide-react';
import 'antd/dist/reset.css';

// Your existing components (keeping all functionality)
import PatientRegistration from './components/PatientRegistration';
import QuestionnaireWizard from './components/QuestionnaireWizard';
import TabletInterface from './components/TabletInterface';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientList from './components/doctor/PatientList';
import PatientProfile from './components/doctor/PatientProfile';
import ReportsGenerator from './components/doctor/ReportsGenerator';
import ApiService from './services/apiService';

const App = () => {
    const [currentInterface, setCurrentInterface] = useState('patient');
    const [currentView, setCurrentView] = useState('login');
    const [currentPatient, setCurrentPatient] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);

    // Loading animation
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    // Welcome screen animation
    useEffect(() => {
        if (!isLoading) {
            const timer = setTimeout(() => {
                setShowWelcome(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isLoading]);

    // Keep all your existing handler functions
    const handleLogin = (patient) => {
        setCurrentPatient(patient);
        setCurrentView('questionnaire');
    };

    const handleNewPatient = () => {
        setCurrentPatient(null);
        setCurrentView('registration');
    };

    const handleRegistrationComplete = (patientData) => {
        setCurrentPatient(patientData);
        setCurrentView('questionnaire');
    };

    const handleQuestionnaireComplete = () => {
        setCurrentView('login');
        setCurrentPatient(null);
        setFormData({});
    };

    const updateFormData = (stepData) => {
        setFormData(prev => ({ ...prev, ...stepData }));
    };

    const handlePatientSelect = (patientId) => {
        setSelectedPatientId(patientId);
        setCurrentView('patient-profile');
    };

    const switchInterface = (interfaceType) => {
        setCurrentInterface(interfaceType);
        setCurrentView('login');
        setSelectedPatientId(null);
        setCurrentPatient(null);
        setFormData({});
    };

    // Loading Screen Component
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="w-24 h-24 border-4 border-white/20 rounded-full animate-spin border-t-white mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Stethoscope className="w-10 h-10 text-white animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Dental Point Clinic</h1>
                    <p className="text-white/80">Sistem de Management Digital</p>
                    <div className="mt-6 flex justify-center">
                        <div className="flex space-x-1">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-2 h-2 bg-white rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.1}s` }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Welcome Screen Component
    if (showWelcome) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float-delay"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-400/20 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <div className="text-center z-10">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                                <Stethoscope className="w-10 h-10 text-blue-600" />
                            </div>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center animate-ping">
                            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold text-white mb-4">
                        Dental Point Clinic
                    </h1>
                    <p className="text-2xl text-white/90 mb-2">
                        Sistem Digital de Management Medical
                    </p>
                    <p className="text-lg text-white/70 mb-8">
                        Tehnologie Avansată • Siguranță Maximă • Experiență Optimizată
                    </p>

                    {/* Feature Icons */}
                    <div className="flex justify-center space-x-8 mb-8">
                        {[
                            { icon: Shield, label: "GDPR Compliant", color: "text-green-400" },
                            { icon: Activity, label: "Real-time", color: "text-blue-400" },
                            { icon: Award, label: "Professional", color: "text-yellow-400" }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="text-center"
                            >
                                <feature.icon className={`w-8 h-8 ${feature.color} mx-auto mb-2`} />
                                <p className="text-white/80 text-sm">{feature.label}</p>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="inline-flex items-center px-6 py-3 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-white font-medium">Inițializare completă...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Enhanced Interface Switcher
    const renderInterfaceSwitcher = () => (
        <div className="fixed top-6 right-6 z-50">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-2 border border-white/20">
                <div className="flex gap-2">
                    <button
                        onClick={() => switchInterface('patient')}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            currentInterface === 'patient'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                    >
                        <User className={`w-5 h-5 transition-transform duration-300 ${currentInterface === 'patient' ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                        <span className="font-medium">Pacient</span>
                    </button>
                    <button
                        onClick={() => switchInterface('doctor')}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            currentInterface === 'doctor'
                                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-md'
                        }`}
                    >
                        <Settings className={`w-5 h-5 transition-transform duration-300 ${currentInterface === 'doctor' ? 'animate-pulse' : 'group-hover:scale-110'}`} />
                        <span className="font-medium">Doctor</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // Enhanced Patient Interface
    const renderPatientInterface = () => (
        <TabletInterface>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-purple-200 to-transparent rounded-full blur-3xl animate-float-delay"></div>
                </div>

                <div className="relative z-10">
                    {currentView === 'login' && (
                        <div>
                            <PatientLoginScreen
                                onLogin={handleLogin}
                                onNewPatient={handleNewPatient}
                            />
                        </div>
                    )}

                    {currentView === 'registration' && (
                        <div>
                            <PatientRegistration
                                onComplete={handleRegistrationComplete}
                                onBack={() => setCurrentView('login')}
                            />
                        </div>
                    )}

                    {currentView === 'questionnaire' && (
                        <div>
                            <QuestionnaireWizard
                                patient={currentPatient}
                                onComplete={handleQuestionnaireComplete}
                                formData={formData}
                                updateFormData={updateFormData}
                            />
                        </div>
                    )}
                </div>
            </div>
        </TabletInterface>
    );

    // Enhanced Doctor Interface
    const renderDoctorInterface = () => {
        const getViewContent = () => {
            switch (currentView) {
                case 'login':
                case 'dashboard':
                    return <DoctorDashboard onPatientSelect={handlePatientSelect} />;
                case 'patient-list':
                    return <PatientList onPatientSelect={handlePatientSelect} />;
                case 'patient-profile':
                    return <PatientProfile patientId={selectedPatientId} />;
                case 'reports':
                    return <ReportsGenerator />;
                default:
                    return <DoctorDashboard onPatientSelect={handlePatientSelect} />;
            }
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
                {/* Enhanced Navigation */}
                <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-white/20 sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex justify-between items-center h-20">
                            {/* Logo Section */}
                            <div className="flex items-center group">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-105 transition-transform duration-300">
                                    <Stethoscope className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        Dental Point Clinic
                                    </h1>
                                    <p className="text-sm text-gray-500">Sistem de Management Digital</p>
                                </div>
                            </div>

                            {/* Navigation Menu */}
                            <div className="flex items-center space-x-2">
                                {[
                                    { key: 'dashboard', label: 'Dashboard', icon: Activity },
                                    { key: 'patient-list', label: 'Pacienți', icon: User },
                                    { key: 'reports', label: 'Rapoarte', icon: Award }
                                ].map((item) => (
                                    <button
                                        key={item.key}
                                        onClick={() => setCurrentView(item.key)}
                                        className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                            currentView === item.key
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                    >
                                        <item.icon className={`w-4 h-4 transition-transform duration-300 ${
                                            currentView === item.key ? 'animate-pulse' : 'group-hover:scale-110'
                                        }`} />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Content Area */}
                <div className="max-w-7xl mx-auto py-8 px-6">
                    <div>
                        {getViewContent()}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="app relative">
            {renderInterfaceSwitcher()}

            <div className="transition-all duration-500 ease-in-out">
                {currentInterface === 'patient'
                    ? renderPatientInterface()
                    : renderDoctorInterface()
                }
            </div>
        </div>
    );
};

// Enhanced Patient Login Screen
const PatientLoginScreen = ({ onLogin, onNewPatient }) => {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showDemo, setShowDemo] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting to login with CNP:', patientId);

            const patient = await ApiService.getPatientByCNP(patientId);

            if (patient) {
                console.log('Patient found:', patient);
                onLogin(patient);
            } else {
                const demoAccounts = {
                    '1234567890123': {
                        id: '1',
                        firstName: 'Maria',
                        lastName: 'Popescu',
                        CNP: '1234567890123',
                        email: 'maria.popescu@email.com',
                        telefon: '0740123456',
                        birthdate: '1985-03-15',
                        gen: 'F',
                        allergies: ['Penicilină', 'Polen'],
                        chronicConditions: ['Hipertensiune'],
                        currentMedications: ['Enalapril 10mg']
                    },
                    '2345678901234': {
                        id: '2',
                        firstName: 'Ion',
                        lastName: 'Ionescu',
                        CNP: '2345678901234',
                        email: 'ion.ionescu@email.com',
                        telefon: '0741234567',
                        birthdate: '1978-07-22',
                        gen: 'M',
                        allergies: [],
                        chronicConditions: ['Diabet tip 2'],
                        currentMedications: ['Metformin 500mg']
                    },
                    'demo': {
                        id: '3',
                        firstName: 'Ana',
                        lastName: 'Testescu',
                        CNP: '3456789012345',
                        email: 'ana.test@email.com',
                        telefon: '0742345678',
                        birthdate: '1990-12-10',
                        gen: 'F',
                        allergies: [],
                        chronicConditions: [],
                        currentMedications: []
                    }
                };

                const demoPatient = demoAccounts[patientId];
                if (demoPatient) {
                    console.log('Demo patient used:', demoPatient);
                    onLogin(demoPatient);
                } else {
                    setError('Pacient negăsit. Pentru testare, folosiți conturile demo sau înregistrați-vă ca pacient nou.');
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Eroare la conectare. Verificați conexiunea și încercați din nou.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        Bun venit
                    </h1>
                    <p className="text-gray-600 text-lg">la Dental Point Clinic</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Cod Pacient / CNP
                        </label>
                        <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all duration-300 hover:border-gray-300"
                            placeholder="Introduceți CNP-ul"
                            required
                        />
                    </div>

                    {/* Demo Accounts Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <button
                            type="button"
                            onClick={() => setShowDemo(!showDemo)}
                            className="flex items-center justify-between w-full text-sm font-medium text-blue-700 hover:text-blue-800 transition-colors duration-200"
                        >
                            <span>Conturi Demo Disponibile</span>
                            <div className={`transform transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`}>
                                ▼
                            </div>
                        </button>

                        {showDemo && (
                            <div className="mt-3 space-y-2">
                                {[
                                    { cnp: '1234567890123', name: 'Maria (cu alergii)', color: 'bg-green-100 text-green-800' },
                                    { cnp: '2345678901234', name: 'Ion (cu diabet)', color: 'bg-yellow-100 text-yellow-800' },
                                    { cnp: 'demo', name: 'Ana (pacient nou)', color: 'bg-blue-100 text-blue-800' }
                                ].map((demo, index) => (
                                    <button
                                        key={demo.cnp}
                                        type="button"
                                        onClick={() => setPatientId(demo.cnp)}
                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs ${demo.color} hover:scale-105 transition-transform duration-200`}
                                    >
                                        <code className="font-mono font-semibold">{demo.cnp}</code> - {demo.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !patientId.trim()}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
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
                    <p className="text-gray-600 mb-4">Nu aveți cont?</p>
                    <button
                        onClick={onNewPatient}
                        className="group text-blue-600 hover:text-purple-600 font-medium text-lg transition-all duration-300 hover:scale-105"
                    >
                        <span className="border-b-2 border-transparent group-hover:border-purple-600 transition-all duration-300">
                            Înregistrare pacient nou
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
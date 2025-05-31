import React, { useState } from 'react';
import { User, Settings } from 'lucide-react';
import 'antd/dist/reset.css'; // Ant Design styles

// Your existing patient components
import PatientRegistration from './components/PatientRegistration';
import QuestionnaireWizard from './components/QuestionnaireWizard';
import TabletInterface from './components/TabletInterface';

// Doctor dashboard components
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientList from './components/doctor/PatientList';
import PatientProfile from './components/doctor/PatientProfile';
import ReportsGenerator from './components/doctor/ReportsGenerator';

// API Service
import ApiService from './services/apiService';

const App = () => {
    // App state management
    const [currentInterface, setCurrentInterface] = useState('patient'); // 'patient' or 'doctor'
    const [currentView, setCurrentView] = useState('login');
    const [currentPatient, setCurrentPatient] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [formData, setFormData] = useState({});

    // Patient interface handlers
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

    // Doctor interface handlers
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

    // Render interface switcher
    const renderInterfaceSwitcher = () => (
        <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 border" style={{ marginRight: '20px' }}>
            <div className="flex gap-2">
                <button
                    onClick={() => switchInterface('patient')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        currentInterface === 'patient'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <User className="w-4 h-4" />
                    Pacient
                </button>
                <button
                    onClick={() => switchInterface('doctor')}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm ${
                        currentInterface === 'doctor'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    <Settings className="w-4 h-4" />
                    Doctor
                </button>
            </div>
        </div>
    );

    // Render patient interface
    const renderPatientInterface = () => (
        <TabletInterface>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {currentView === 'login' && (
                    <PatientLoginScreen
                        onLogin={handleLogin}
                        onNewPatient={handleNewPatient}
                    />
                )}

                {currentView === 'registration' && (
                    <PatientRegistration
                        onComplete={handleRegistrationComplete}
                        onBack={() => setCurrentView('login')}
                    />
                )}

                {currentView === 'questionnaire' && (
                    <QuestionnaireWizard
                        patient={currentPatient}
                        onComplete={handleQuestionnaireComplete}
                        formData={formData}
                        updateFormData={updateFormData}
                    />
                )}
            </div>
        </TabletInterface>
    );

    // Render doctor interface
    const renderDoctorInterface = () => {
        switch (currentView) {
            case 'login':
            case 'dashboard':
                return (
                    <DoctorDashboard onPatientSelect={handlePatientSelect} />
                );
            case 'patient-list':
                return (
                    <PatientList onPatientSelect={handlePatientSelect} />
                );
            case 'patient-profile':
                return (
                    <PatientProfile patientId={selectedPatientId} />
                );
            case 'reports':
                return (
                    <ReportsGenerator />
                );
            default:
                return (
                    <DoctorDashboard onPatientSelect={handlePatientSelect} />
                );
        }
    };

    // Main render with navigation for doctor interface
    const renderDoctorWithNav = () => (
        <div className="min-h-screen bg-gray-50">
            {/* Doctor Navigation */}
            <nav className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="text-2xl font-bold text-blue-600 mr-8">
                                🦷 Dental Point Clinic
                            </div>
                            <div className="flex space-x-8">
                                <button
                                    onClick={() => setCurrentView('dashboard')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentView === 'dashboard'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Dashboard
                                </button>
                                <button
                                    onClick={() => setCurrentView('patient-list')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentView === 'patient-list'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Pacienți
                                </button>
                                <button
                                    onClick={() => setCurrentView('reports')}
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                                        currentView === 'reports'
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Rapoarte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Doctor Interface Content */}
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {renderDoctorInterface()}
            </div>
        </div>
    );

    return (
        <div className="app">
            {renderInterfaceSwitcher()}

            {currentInterface === 'patient'
                ? renderPatientInterface()
                : renderDoctorWithNav()
            }
        </div>
    );
};

// Updated Patient Login Screen with API Integration
const PatientLoginScreen = ({ onLogin, onNewPatient }) => {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting to login with CNP:', patientId);

            // Try to fetch patient from database
            const patient = await ApiService.getPatientByCNP(patientId);

            if (patient) {
                console.log('Patient found:', patient);
                onLogin(patient);
            } else {
                // Patient not found in database, show available demo accounts
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
                    setError('Pacient negăsit. Pentru testare, folosiți: 1234567890123, 2345678901234, sau "demo". Sau înregistrați-vă ca pacient nou.');
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
            <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-blue-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Bun venit</h1>
                    <p className="text-gray-600 text-lg">la Dental Point Clinic</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Cod Pacient / CNP
                        </label>
                        <input
                            type="text"
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            placeholder="Introduceți CNP-ul"
                            required
                        />
                        <div className="mt-2 text-xs text-gray-500 space-y-1">
                            <p><strong>Demo accounts:</strong></p>
                            <p>• <code className="bg-gray-100 px-1 rounded">1234567890123</code> - Maria (cu alergii)</p>
                            <p>• <code className="bg-gray-100 px-1 rounded">2345678901234</code> - Ion (cu diabet)</p>
                            <p>• <code className="bg-gray-100 px-1 rounded">demo</code> - Ana (pacient nou)</p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !patientId.trim()}
                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg transition-colors"
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
                        className="text-blue-600 hover:text-blue-700 font-medium text-lg underline"
                    >
                        Înregistrare pacient nou
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
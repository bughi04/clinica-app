import React, { useState } from 'react';
import { User } from 'lucide-react';
import PatientRegistration from './components/PatientRegistration';
import MedicalHistoryForm from './components/MedicalHistoryForm';
import ConsentForm from './components/ConsentForm';
import QuestionnaireWizard from './components/QuestionnaireWizard';
import TabletInterface from './components/TabletInterface';

const App = () => {
    const [currentView, setCurrentView] = useState('login');
    const [currentPatient, setCurrentPatient] = useState(null);
    const [formData, setFormData] = useState({});

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

    return (
        <TabletInterface>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
                {currentView === 'login' && (
                    <LoginScreen
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
};

// Login Screen Component
const LoginScreen = ({ onLogin, onNewPatient }) => {
    const [patientId, setPatientId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Demo accounts for testing
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
                    // Existing medical alerts for demo
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

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const patient = demoAccounts[patientId];
            if (patient) {
                onLogin(patient);
            } else {
                setError('Pacient negăsit. Încercați: 1234567890123, 2345678901234 sau "demo"');
            }
        } catch (err) {
            setError('Eroare la conectare. Încercați din nou.');
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
                    <p className="text-gray-600 text-lg">la Clinica Dentară</p>
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
                            placeholder="Introduceți codul pacient"
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
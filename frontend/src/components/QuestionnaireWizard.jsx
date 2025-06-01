import React, { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import MedicalHistoryForm from './MedicalHistoryForm.jsx';

const QuestionnaireWizard = ({ patient, onComplete, formData, updateFormData }) => {
    const [completedSteps, setCompletedSteps] = useState({});

    const handleMedicalHistoryComplete = (data) => {
        // Update form data
        updateFormData({ 'medical-history': data });

        // Mark step as completed
        setCompletedSteps(prev => ({ ...prev, 'medical-history': true }));

        // Complete the entire questionnaire process
        const completeFormData = {
            ...formData,
            'medical-history': data,
            completedAt: new Date().toISOString(),
            patientId: patient?.id,
            status: 'completed'
        };

        console.log('Questionnaire completed:', completeFormData);
        onComplete(completeFormData);
    };

    // Show success screen if questionnaire completed
    if (completedSteps['medical-history']) {
        return <CompletionScreen patient={patient} onReset={onComplete} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Progress Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Chestionar Medical
                            </h1>
                            {patient && (
                                <p className="text-gray-600">
                                    Pacient: {patient.firstName} {patient.lastName}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Chestionar Medical Complet
                            </p>
                            <p className="text-xs text-gray-400">
                                8 secțiuni de completat
                            </p>
                        </div>
                    </div>

                    {/* Single Progress Step */}
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
                            1
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-600">
                                Chestionar Medical
                            </p>
                            <p className="text-xs text-gray-400">
                                Completați toate cele 8 secțiuni
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Patient Alerts */}
            {patient && <PatientAlertsBar patient={patient} />}

            {/* Medical History Form Content */}
            <MedicalHistoryForm
                onComplete={handleMedicalHistoryComplete}
                onBack={() => window.history.back()} // Go back to login/registration
                initialData={formData['medical-history']}
                patient={patient}
            />
        </div>
    );
};

// Patient Alerts Bar Component
const PatientAlertsBar = ({ patient }) => {
    const alerts = [];

    // Check for existing patient alerts
    if (patient.allergies?.length > 0) {
        alerts.push({
            type: 'warning',
            message: `Alergii cunoscute: ${patient.allergies.join(', ')}`
        });
    }

    if (patient.chronicConditions?.length > 0) {
        alerts.push({
            type: 'info',
            message: `Condiții cronice: ${patient.chronicConditions.join(', ')}`
        });
    }

    if (patient.currentMedications?.length > 0) {
        alerts.push({
            type: 'info',
            message: `Medicamente actuale: ${patient.currentMedications.join(', ')}`
        });
    }

    if (alerts.length === 0) return null;

    return (
        <div className="bg-yellow-50 border-b border-yellow-200">
            <div className="max-w-4xl mx-auto px-6 py-3">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-medium text-yellow-800 mb-1">
                            Informații medicale existente
                        </h3>
                        <div className="space-y-1">
                            {alerts.map((alert, index) => (
                                <p key={index} className={`text-sm ${
                                    alert.type === 'warning' ? 'text-yellow-700 font-medium' : 'text-yellow-600'
                                }`}>
                                    {alert.message}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Completion Screen Component
const CompletionScreen = ({ patient, onReset }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-2xl p-10 text-center max-w-md w-full">
                <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                    Chestionar completat!
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    Mulțumim, {patient?.firstName}! Chestionarul medical a fost completat și trimis cu succes.
                    Doctorul va putea vizualiza toate informațiile înainte de consultație.
                </p>

                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <p className="text-blue-800 text-sm">
                        ✅ Toate cele 8 secțiuni au fost completate
                        <br />
                        ✅ Datele au fost salvate în baza de date
                        <br />
                        ✅ Medicul poate acum vizualiza informațiile
                    </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl mb-6">
                    <p className="text-green-800 text-sm font-medium">
                        Vă rugăm să vă prezentați la recepție pentru confirmarea programării.
                    </p>
                </div>

                <button
                    onClick={onReset}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                    Înapoi la pagina principală
                </button>

                <p className="text-gray-400 text-xs mt-4">
                    Chestionar completat la: {new Date().toLocaleString('ro-RO')}
                </p>
            </div>
        </div>
    );
};

export default QuestionnaireWizard;
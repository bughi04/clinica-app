import React, { useState } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import MedicalHistoryForm from './MedicalHistoryForm.jsx';
import ConsentForm from './ConsentForm.jsx';

const QuestionnaireWizard = ({ patient, onComplete, formData, updateFormData }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState({});
    const [medicalData, setMedicalData] = useState(null);

    const steps = [
        {
            id: 'medical-history',
            title: 'Chestionar Medical',
            description: 'Completați informațiile despre starea dumneavoastră de sănătate',
            component: MedicalHistoryForm
        },
        {
            id: 'consent',
            title: 'Consimțământ și Semnătură',
            description: 'Acordați consimțămintele necesare și semnați digital',
            component: ConsentForm
        }
    ];

    const handleStepComplete = (stepId, data) => {
        // Update form data
        updateFormData({ [stepId]: data });

        // Mark step as completed
        setCompletedSteps(prev => ({ ...prev, [stepId]: true }));

        // Store medical data for consent form
        if (stepId === 'medical-history') {
            setMedicalData(data);
        }

        // Move to next step or complete if last step
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            // All steps completed
            handleWizardComplete(data);
        }
    };

    const handleWizardComplete = (finalData) => {
        const completeFormData = {
            ...formData,
            consent: finalData,
            completedAt: new Date().toISOString(),
            patientId: patient?.id
        };

        onComplete(completeFormData);
    };

    const handleStepBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const renderCurrentStep = () => {
        const CurrentComponent = steps[currentStep].component;

        switch (currentStep) {
            case 0:
                return (
                    <CurrentComponent
                        onComplete={(data) => handleStepComplete('medical-history', data)}
                        onBack={() => window.history.back()} // Go back to login/registration
                        initialData={formData['medical-history']}
                        patient={patient}
                    />
                );
            case 1:
                return (
                    <CurrentComponent
                        onComplete={(data) => handleStepComplete('consent', data)}
                        onBack={handleStepBack}
                        patient={patient}
                        medicalData={medicalData || formData['medical-history']}
                    />
                );
            default:
                return null;
        }
    };

    // Show success screen if all steps completed
    if (Object.keys(completedSteps).length === steps.length) {
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
                                Chestionare Medicale
                            </h1>
                            {patient && (
                                <p className="text-gray-600">
                                    Pacient: {patient.firstName} {patient.lastName}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">
                                Pasul {currentStep + 1} din {steps.length}
                            </p>
                            <p className="text-xs text-gray-400">
                                {Math.round(((currentStep + 1) / steps.length) * 100)}% completat
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center space-x-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center flex-1">
                                <div className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                        completedSteps[step.id] ? 'bg-green-500 text-white' :
                                            index === currentStep ? 'bg-blue-500 text-white' :
                                                'bg-gray-200 text-gray-600'
                                    }`}>
                                        {completedSteps[step.id] ? (
                                            <CheckCircle className="w-5 h-5" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p className={`text-sm font-medium ${
                                            index === currentStep ? 'text-blue-600' :
                                                completedSteps[step.id] ? 'text-green-600' : 'text-gray-500'
                                        }`}>
                                            {step.title}
                                        </p>
                                        <p className="text-xs text-gray-400">{step.description}</p>
                                    </div>
                                </div>

                                {index < steps.length - 1 && (
                                    <div className={`flex-1 h-1 mx-4 ${
                                        completedSteps[step.id] ? 'bg-green-500' : 'bg-gray-200'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Patient Alerts */}
            {patient && <PatientAlertsBar patient={patient} />}

            {/* Current Step Content */}
            {renderCurrentStep()}
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
                    Formular completat!
                </h2>

                <p className="text-gray-600 mb-6 leading-relaxed">
                    Mulțumim, {patient?.firstName}! Chestionarul medical a fost completat și trimis cu succes.
                    Doctorul va putea vizualiza toate informațiile înainte de consultație.
                </p>

                <div className="bg-blue-50 p-4 rounded-xl mb-6">
                    <p className="text-blue-800 text-sm">
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
                    Datele au fost salvate la: {new Date().toLocaleString('ro-RO')}
                </p>
            </div>
        </div>
    );
};

export default QuestionnaireWizard;
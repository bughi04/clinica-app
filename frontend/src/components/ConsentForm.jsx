import React, { useState, useRef, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FileText, Shield, PenTool, CheckCircle, AlertTriangle, RotateCcw } from 'lucide-react';
import FormValidation from '../../../backend/src/models/FormValidation.js';

const ConsentForm = ({ onComplete, onBack, patient, medicalData }) => {
    const [loading, setLoading] = useState(false);
    const [signatureData, setSignatureData] = useState('');
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const canvasRef = useRef(null);

    const { control, handleSubmit, formState: { errors }, watch } = useForm({
        mode: 'onChange',
        defaultValues: {
            consentAgreed: false,
            gdprConsent: false,
            treatmentConsent: false,
            dataProcessingConsent: false,
            digitalSignature: '',
            signatureDate: new Date().toISOString().split('T')[0]
        }
    });

    const allConsentsAgreed = watch('consentAgreed') && watch('gdprConsent') &&
        watch('treatmentConsent') && watch('dataProcessingConsent');

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, []);

    // Signature canvas functions
    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            const canvas = canvasRef.current;
            const dataURL = canvas.toDataURL();
            setSignatureData(dataURL);
        }
    };

    const clearSignature = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureData('');
        setHasSignature(false);
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Validate consent data
            const validation = FormValidation.validateConsent(data);

            if (!validation.isValid) {
                console.error('Validation errors:', validation.errors);
                setLoading(false);
                return;
            }

            // Structure consent data according to database schema
            const consentData = {
                // Tabel Consent
                patientId: patient?.id,
                consentType: 'general_treatment',
                consentText: generateConsentText(patient, medicalData),
                agreed: data.consentAgreed,
                gdprConsent: data.gdprConsent,
                treatmentConsent: data.treatmentConsent,
                dataProcessingConsent: data.dataProcessingConsent,
                digitalSignature: data.digitalSignature,
                signatureData: signatureData, // Canvas signature data
                signatureDate: data.signatureDate,
                ipAddress: null, // Will be set by backend
                userAgent: navigator.userAgent,
                consentVersion: '1.0',
                createdAt: new Date().toISOString(),

                // Additional metadata
                patientData: {
                    firstName: patient?.firstName,
                    lastName: patient?.lastName,
                    CNP: patient?.CNP
                },

                // Medical alerts for doctor interface
                medicalAlerts: generateMedicalAlerts(medicalData)
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Demo: Consent saved:', consentData);
            console.log('Demo: Medical alerts generated:', consentData.medicalAlerts);

            onComplete(consentData);

        } catch (error) {
            console.error('Error saving consent:', error);
        }

        setLoading(false);
    };

    const generateConsentText = (patient, medicalData) => {
        return `
Consimțământ pentru tratament stomatologic

Eu, ${patient?.firstName} ${patient?.lastName}, CNP ${patient?.CNP}, 
confirm că am completat chestionarul medical în mod complet și corect.

Înțeleg că informațiile medicale furnizate vor fi folosite pentru:
- Planificarea tratamentului stomatologic
- Asigurarea siguranței tratamentului
- Respectarea contraindicațiilor medicale

Sunt de acord ca datele mele medicale să fie procesate conform GDPR.

Data: ${new Date().toLocaleDateString('ro-RO')}
`;
    };

    const generateMedicalAlerts = (medicalData) => {
        const alerts = [];

        if (medicalData?.boli?.diabet === 'Da') {
            alerts.push({
                type: 'warning',
                message: 'DIABET - Atenție la cicatrizare și infecții',
                priority: 'high'
            });
        }

        if (medicalData?.boli?.boli_inima === 'Da') {
            alerts.push({
                type: 'danger',
                message: 'BOLI CARDIACE - Consultați cardiologul înainte de anestezii',
                priority: 'high'
            });
        }

        if (medicalData?.boli?.tulburari_coagulare_sange === 'Da') {
            alerts.push({
                type: 'danger',
                message: 'TULBURĂRI COAGULARE - Risc de sângerare',
                priority: 'high'
            });
        }

        if (medicalData?.antecedente?.alergii && medicalData.antecedente.alergii !== 'Nu') {
            alerts.push({
                type: 'warning',
                message: `ALERGII: ${medicalData.antecedente.alergii}`,
                priority: 'medium'
            });
        }

        return alerts;
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Consimțământ și Semnătură</h1>
                        <p className="text-gray-600">Ultima etapă pentru finalizarea chestionarului</p>
                    </div>

                    {/* Medical Alerts Preview */}
                    {medicalData && (
                        <MedicalAlertsPreview medicalData={medicalData} />
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* General Treatment Consent */}
                        <ConsentSection
                            control={control}
                            name="treatmentConsent"
                            title="Consimțământ pentru tratament"
                            icon={<FileText className="w-6 h-6 text-blue-600" />}
                            content="Sunt de acord să primesc tratament stomatologic pe baza informațiilor medicale furnizate. Înțeleg că medicul va lua toate măsurile necesare pentru siguranța mea."
                            error={errors.treatmentConsent}
                        />

                        {/* GDPR Consent */}
                        <ConsentSection
                            control={control}
                            name="gdprConsent"
                            title="Consimțământ GDPR"
                            icon={<Shield className="w-6 h-6 text-green-600" />}
                            content="Sunt de acord cu prelucrarea datelor mele personale și medicale conform Regulamentului General privind Protecția Datelor (GDPR). Datele vor fi folosite exclusiv pentru servicii medicale."
                            error={errors.gdprConsent}
                        />

                        {/* Data Processing Consent */}
                        <ConsentSection
                            control={control}
                            name="dataProcessingConsent"
                            title="Consimțământ prelucrare date"
                            icon={<Shield className="w-6 h-6 text-purple-600" />}
                            content="Sunt de acord ca datele mele să fie stocate în sistemul informatic al clinicii pentru evidența medicală și comunicări ulterioare legate de tratament."
                            error={errors.dataProcessingConsent}
                        />

                        {/* General Agreement */}
                        <ConsentSection
                            control={control}
                            name="consentAgreed"
                            title="Acord general"
                            icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                            content="Confirm că toate informațiile furnizate sunt corecte și complete. Înțeleg responsabilitățile mele ca pacient și sunt de acord cu termenii de mai sus."
                            error={errors.consentAgreed}
                        />

                        {/* Digital Signature Section */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <PenTool className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-800">Semnătură Digitală</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nume complet pentru semnătură *
                                    </label>
                                    <Controller
                                        name="digitalSignature"
                                        control={control}
                                        rules={{
                                            required: 'Semnătura digitală este obligatorie',
                                            minLength: { value: 3, message: 'Numele trebuie să aibă cel puțin 3 caractere' }
                                        }}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                placeholder={`${patient?.firstName || ''} ${patient?.lastName || ''}`.trim()}
                                            />
                                        )}
                                    />
                                    {errors.digitalSignature && (
                                        <p className="text-red-500 text-sm mt-1">{errors.digitalSignature.message}</p>
                                    )}
                                </div>

                                {/* Signature Canvas */}
                                <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
                                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Semnați aici:</span>
                                        <button
                                            type="button"
                                            onClick={clearSignature}
                                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-600 rounded text-sm hover:bg-gray-300"
                                        >
                                            <RotateCcw className="w-3 h-3" />
                                            Șterge
                                        </button>
                                    </div>
                                    <canvas
                                        ref={canvasRef}
                                        width={400}
                                        height={150}
                                        className="w-full bg-white cursor-crosshair touch-none"
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                    />
                                    {!hasSignature && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <p className="text-gray-400 text-sm">Desenați semnătura cu degetul sau mouse-ul</p>
                                        </div>
                                    )}
                                </div>

                                <div className="text-center text-sm text-gray-500">
                                    Data semnării: {new Date().toLocaleDateString('ro-RO')} {new Date().toLocaleTimeString('ro-RO')}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <h3 className="font-semibold text-blue-800 mb-3">Rezumat</h3>
                            <div className="space-y-2 text-sm text-blue-700">
                                <p>✓ Informații personale completate</p>
                                <p>✓ Chestionar medical completat</p>
                                <p className={allConsentsAgreed ? 'text-green-700' : 'text-orange-700'}>
                                    {allConsentsAgreed ? '✓' : '○'} Toate consimțămintele acordate
                                </p>
                                <p className={watch('digitalSignature') && hasSignature ? 'text-green-700' : 'text-orange-700'}>
                                    {watch('digitalSignature') && hasSignature ? '✓' : '○'} Semnătură digitală completă
                                </p>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                            >
                                ← Înapoi la chestionar
                            </button>

                            <button
                                type="submit"
                                disabled={loading || !allConsentsAgreed || !watch('digitalSignature') || !hasSignature}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                Finalizează și trimite
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Consent Section Component
const ConsentSection = ({ control, name, title, icon, content, error, required = true }) => (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
                {icon}
            </div>
            <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{content}</p>

                <Controller
                    name={name}
                    control={control}
                    rules={{ required: required ? 'Acest consimțământ este obligatoriu' : false }}
                    render={({ field }) => (
                        <label className="flex items-center cursor-pointer">
                            <input
                                {...field}
                                type="checkbox"
                                checked={field.value || false}
                                className="w-5 h-5 text-green-600 rounded focus:ring-green-500 mr-3"
                            />
                            <span className="text-gray-700 font-medium">
                Sunt de acord {required && '*'}
              </span>
                        </label>
                    )}
                />
                {error && <p className="text-red-500 text-sm mt-2">{error.message}</p>}
            </div>
        </div>
    </div>
);

// Medical Alerts Preview Component
const MedicalAlertsPreview = ({ medicalData }) => {
    const alerts = [];

    // Generate alerts based on medical data
    if (medicalData?.boli?.diabet === 'Da') {
        alerts.push({ type: 'warning', message: 'Pacient diabetic - Atenție la cicatrizare' });
    }
    if (medicalData?.boli?.boli_inima === 'Da') {
        alerts.push({ type: 'danger', message: 'Boli cardiace - Consultați cardiologul' });
    }
    if (medicalData?.antecedente?.alergii && medicalData.antecedente.alergii !== 'Nu') {
        alerts.push({ type: 'warning', message: `Alergii: ${medicalData.antecedente.alergii}` });
    }

    if (alerts.length === 0) return null;

    return (
        <div className="mb-8 bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-semibold text-red-800 mb-3">Alerte Medicale pentru Doctor</h3>
                    <div className="space-y-2">
                        {alerts.map((alert, index) => (
                            <div key={index} className={`text-sm p-2 rounded ${
                                alert.type === 'danger' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                                {alert.message}
                            </div>
                        ))}
                    </div>
                    <p className="text-red-600 text-xs mt-3">
                        Aceste informații vor fi evidențiate în interfața doctorului pentru siguranța tratamentului.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ConsentForm;
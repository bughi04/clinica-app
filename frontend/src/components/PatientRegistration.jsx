import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, User, MapPin } from 'lucide-react';
import FormValidation from '../../../backend/src/models/FormValidation.js';
import ApiService from '../services/apiService.js';

const PatientRegistration = ({ onComplete, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');

    const { control, handleSubmit, formState: { errors }, watch, trigger } = useForm({
        mode: 'onChange',
        defaultValues: {
            firstname: "",  // Default empty string for all fields
            surname: "",
            CNP: "",
            birthdate: "",
            gen: "M",
            email: "",
            telefon: "",
            judet: "",
            localitate: "",
            strada: "",
            numar: "",
            bloc: "",
            scara: "",
            apartament: "",
            recomandare: "",
            representantid: "",
        }
    });

    const steps = [
        'Informații Personale',
        'Date de Contact',
        'Adresa',
        'Informații Suplimentare'
    ];

    const nextStep = async () => {
        const isValid = await trigger();
        console.log('Trigger Validation Status:', isValid);
        if (isValid && step < steps.length - 1) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        if (step > 0) {
            setStep(step - 1);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        setError('');

        try {
            // Validate form data
            const validation = FormValidation.validatePatientData(data);
            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                setLoading(false);
                return;
            }

            // Format data for API
            const patientData = {
                firstname: data.firstname,
                surname: data.surname,
                CNP: data.CNP,
                birthdate: data.birthdate,
                gen: data.gen,
                email: data.email,
                telefon: data.telefon,
                recomandare: data.recomandare || null,
                representantid: data.representantid || null,

                // Format address as object
                address: {
                    Judet: data.judet,
                    Localitate: data.localitate,
                    Str: data.strada,
                    Nr: data.numar,
                    Bc: data.bloc || null,
                    Sc: data.scara || null,
                    Ap: data.apartament || null
                }
            };

            console.log('Registering patient:', patientData);

            // Call API to create patient
            const createdPatient = await ApiService.createPatient(patientData);

            console.log('Patient registered successfully:', createdPatient);
            onComplete(createdPatient);

        } catch (error) {
            console.error('Registration error:', error);

            if (error.response?.status === 400) {
                setError('Un pacient cu acest CNP sau email există deja în sistem.');
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Eroare la înregistrare. Vă rugăm să încercați din nou.');
            }
        }

        setLoading(false);
    };

    const renderStep = () => {
        switch (step) {
            case 0:
                return <PersonalInfoStep control={control} errors={errors} />;
            case 1:
                return <ContactInfoStep control={control} errors={errors} />;
            case 2:
                return <AddressStep control={control} errors={errors} />;
            case 3:
                return <AdditionalInfoStep control={control} errors={errors} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Înapoi
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">Înregistrare Pacient Nou</h1>
                        <div className="w-20"></div> {/* Spacer */}
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            {steps.map((stepName, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                        index < step ? 'bg-green-500 text-white' :
                                            index === step ? 'bg-blue-500 text-white' :
                                                'bg-gray-200 text-gray-600'
                                    }`}>
                                        {index < step ? '✓' : index + 1}
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-16 h-1 mx-2 ${
                                            index < step ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-gray-600">
                            Pasul {step + 1} din {steps.length}: {steps[step]}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-red-600 text-center">{error}</p>
                        </div>
                    )}

                    {/* Form Steps */}
                    <div className="mb-8">
                        {renderStep()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={step === 0}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Înapoi
                        </button>

                        {step < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                            >
                                Următorul
                                <ArrowLeft className="w-4 h-4 rotate-180" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit(onSubmit)}
                                disabled={loading}
                                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                Finalizează înregistrarea
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step Components (same as before but included for completeness)
const PersonalInfoStep = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Informații Personale</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prenume *</label>
                <Controller
                    name="firstname"
                    control={control}
                    rules={{ required: 'Prenumele este obligatoriu' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Introduceți prenumele"
                        />
                    )}
                />
                {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nume *</label>
                <Controller
                    name="surname"
                    control={control}
                    rules={{ required: 'Numele este obligatoriu' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Introduceți numele"
                        />
                    )}
                />
                {errors.surname && <p className="text-red-500 text-sm mt-1">{errors.surname.message}</p>}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CNP *</label>
                <Controller
                    name="CNP"
                    control={control}
                    rules={{
                        required: 'CNP-ul este obligatoriu',
                        validate: (value) => FormValidation.validateCNP(value) || 'CNP invalid'
                    }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1234567890123"
                            maxLength="13"
                        />
                    )}
                />
                {errors.CNP && <p className="text-red-500 text-sm mt-1">{errors.CNP.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data nașterii *</label>
                <Controller
                    name="birthdate"
                    control={control}
                    rules={{ required: 'Data nașterii este obligatorie' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="date"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    )}
                />
                {errors.birthdate && <p className="text-red-500 text-sm mt-1">{errors.birthdate.message}</p>}
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Gen *</label>
            <div className="flex gap-6">
                <Controller
                    name="gen"
                    control={control}
                    rules={{ required: 'Genul este obligatoriu' }}
                    render={({ field }) => (
                        <>
                            <label className="flex items-center">
                                <input
                                    {...field}
                                    type="radio"
                                    value="M"
                                    checked={field.value === 'M'}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-700">Masculin</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    {...field}
                                    type="radio"
                                    value="F"
                                    checked={field.value === 'F'}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-gray-700">Feminin</span>
                            </label>
                        </>
                    )}
                />
            </div>
            {errors.gen && <p className="text-red-500 text-sm mt-1">{errors.gen.message}</p>}
        </div>
    </div>
);

const ContactInfoStep = ({ control, errors }) => (
    <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Date de Contact</h2>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <Controller
                name="email"
                control={control}
                rules={{
                    required: 'Email-ul este obligatoriu',
                    pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email invalid'
                    }
                }}
                render={({ field }) => (
                    <input
                        {...field}
                        type="email"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@exemplu.com"
                    />
                )}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon *</label>
            <Controller
                name="telefon"
                control={control}
                rules={{
                    required: 'Telefonul este obligatoriu',
                    pattern: {
                        value: /^(\+40|0)[0-9]{9}$/,
                        message: 'Număr de telefon invalid'
                    }
                }}
                render={({ field }) => (
                    <input
                        {...field}
                        type="tel"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0740123456"
                    />
                )}
            />
            {errors.telefon && <p className="text-red-500 text-sm mt-1">{errors.telefon.message}</p>}
        </div>
    </div>
);

const AddressStep = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Adresa</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Județ *</label>
                <Controller
                    name="judet"
                    control={control}
                    rules={{ required: 'Județul este obligatoriu' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Timiș"
                        />
                    )}
                />
                {errors.judet && <p className="text-red-500 text-sm mt-1">{errors.judet.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Localitate *</label>
                <Controller
                    name="localitate"
                    control={control}
                    rules={{ required: 'Localitatea este obligatorie' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Timișoara"
                        />
                    )}
                />
                {errors.localitate && <p className="text-red-500 text-sm mt-1">{errors.localitate.message}</p>}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strada *</label>
                <Controller
                    name="strada"
                    control={control}
                    rules={{ required: 'Strada este obligatorie' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: Calea Victoriei"
                        />
                    )}
                />
                {errors.strada && <p className="text-red-500 text-sm mt-1">{errors.strada.message}</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Număr *</label>
                <Controller
                    name="numar"
                    control={control}
                    rules={{ required: 'Numărul este obligatoriu' }}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 12"
                        />
                    )}
                />
                {errors.numar && <p className="text-red-500 text-sm mt-1">{errors.numar.message}</p>}
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bloc (opțional)</label>
                <Controller
                    name="bloc"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: A1"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scara (opțional)</label>
                <Controller
                    name="scara"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 2"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apartament (opțional)</label>
                <Controller
                    name="apartament"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ex: 15"
                        />
                    )}
                />
            </div>
        </div>
    </div>
);

const AdditionalInfoStep = ({ control, errors }) => (
    <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Informații Suplimentare</h2>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recomandare (opțional)</label>
            <Controller
                name="recomandare"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Cine v-a recomandat clinica noastră?"
                    />
                )}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Reprezentant (opțional)</label>
            <Controller
                name="representantid"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Pentru pacienți minori"
                    />
                )}
            />
            <p className="text-gray-500 text-sm mt-1">
                Completați doar dacă pacientul este minor și are nevoie de un reprezentant legal
            </p>
        </div>
    </div>
);

export default PatientRegistration;
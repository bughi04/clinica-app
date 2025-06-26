import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { ArrowLeft, Save, User, MapPin, CheckCircle, AlertCircle, Phone, Mail, Calendar, CreditCard } from 'lucide-react';
import FormValidation from '../../../backend/src/models/FormValidation.js';
import ApiService from '../services/apiService.js';

const PatientRegistration = ({ onComplete, onBack }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);

    const { control, handleSubmit, formState: { errors }, trigger, getValues, setValue } = useForm({
        mode: 'onChange',
        defaultValues: {
            firstname: "",
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
        {
            title: 'Informații Personale',
            subtitle: 'Date de identificare',
            icon: User,
            color: 'from-gray-600 to-gray-700',
            fields: ['firstname', 'surname', 'CNP', 'birthdate', 'gen']
        },
        {
            title: 'Date de Contact',
            subtitle: 'Email și telefon',
            icon: Phone,
            color: 'from-gray-500 to-gray-600',
            fields: ['email', 'telefon']
        },
        {
            title: 'Adresa',
            subtitle: 'Adresa de domiciliu',
            icon: MapPin,
            color: 'from-gray-700 to-gray-800',
            fields: ['judet', 'localitate', 'strada', 'numar']
        },
        {
            title: 'Informații Suplimentare',
            subtitle: 'Finalizare înregistrare',
            icon: CheckCircle,
            color: 'from-gray-600 to-gray-700',
            fields: ['recomandare', 'representantid']
        }
    ];

    const nextStep = async () => {
        const currentFields = steps[step].fields;
        const isValid = await trigger(currentFields);

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
            const validation = FormValidation.validatePatientData(data);
            if (!validation.isValid) {
                setError(validation.errors.join(', '));
                setLoading(false);
                return;
            }

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
            const createdPatient = await ApiService.createPatient(patientData);

            setShowSuccess(true);
            setTimeout(() => {
                console.log('Patient registered successfully:', createdPatient);
                onComplete(createdPatient);
            }, 2000);

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

    if (showSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md text-center animate-scale-in">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 animate-glow">
                        <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Înregistrare completă!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Contul dumneavoastră a fost creat cu succes. Vă puteți conecta acum pentru a completa chestionarul medical.
                    </p>
                    <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gray-400 rounded-full blur-3xl animate-float"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gray-500 rounded-full blur-3xl animate-float-delay"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-in-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-8 text-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-700/50 to-gray-800/50 animate-morph"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <button
                                    onClick={onBack}
                                    className="group flex items-center gap-2 text-white/80 hover:text-white transition-all duration-300 hover:scale-105"
                                >
                                    <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
                                    Înapoi
                                </button>
                                <div className="text-right">
                                    <h1 className="text-2xl font-bold">Înregistrare Pacient Nou</h1>
                                    <p className="text-white/90">Sistem Digital Dental Point</p>
                                </div>
                            </div>

                            {/* Enhanced Progress Indicator */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    {steps.map((stepInfo, index) => {
                                        const StepIcon = stepInfo.icon;
                                        const isActive = index === step;
                                        const isCompleted = index < step;

                                        return (
                                            <div key={index} className="flex items-center">
                                                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 ${
                                                    isCompleted ? 'bg-green-500 scale-110' :
                                                        isActive ? 'bg-white text-gray-700 scale-110' :
                                                            'bg-white/20 text-white/60'
                                                }`}>
                                                    {isCompleted ? (
                                                        <CheckCircle className="w-6 h-6 animate-bounce" />
                                                    ) : (
                                                        <StepIcon className={`w-6 h-6 ${isActive ? 'animate-pulse' : ''}`} />
                                                    )}
                                                    {isActive && (
                                                        <div className="absolute inset-0 bg-white rounded-xl animate-pulse opacity-30"></div>
                                                    )}
                                                </div>
                                                {index < steps.length - 1 && (
                                                    <div className={`w-16 h-1 mx-2 rounded-full transition-all duration-500 ${
                                                        index < step ? 'bg-green-400' : 'bg-white/30'
                                                    }`} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="text-center">
                                    <p className="text-white/90 font-medium">
                                        Pasul {step + 1} din {steps.length}: {steps[step].title}
                                    </p>
                                    <p className="text-white/70 text-sm">{steps[step].subtitle}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Content */}
                    <div className="p-8">
                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 animate-shake">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-600 font-medium">{error}</p>
                                </div>
                            </div>
                        )}

                        {/* Step Content */}
                        <div className="animate-fade-in">
                            {renderStep()}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-8 mt-8 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 0}
                                className="group flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                            >
                                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-1" />
                                Înapoi
                            </button>

                            {step < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                >
                                    Următorul
                                    <ArrowLeft className="w-4 h-4 rotate-180 transition-transform duration-300 group-hover:translate-x-1" />
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={loading}
                                    className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Se înregistrează...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
                                            Finalizează înregistrarea
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Step Components with Professional Gray Styling
const PersonalInfoStep = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Informații Personale</h2>
                <p className="text-gray-600">Completați datele dumneavoastră de identificare</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
                <Controller
                    name="firstname"
                    control={control}
                    rules={{ required: 'Prenumele este obligatoriu' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="firstname"
                            />
                            <label htmlFor="firstname" className="form-label-gray">
                                Prenume *
                            </label>
                        </>
                    )}
                />
                {errors.firstname && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.firstname.message}
                    </p>
                )}
            </div>

            <div className="form-group">
                <Controller
                    name="surname"
                    control={control}
                    rules={{ required: 'Numele este obligatoriu' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="surname"
                            />
                            <label htmlFor="surname" className="form-label-gray">
                                Nume *
                            </label>
                        </>
                    )}
                />
                {errors.surname && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.surname.message}
                    </p>
                )}
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
                <Controller
                    name="CNP"
                    control={control}
                    rules={{
                        required: 'CNP-ul este obligatoriu',
                        validate: (value) => FormValidation.validateCNP(value) || 'CNP invalid'
                    }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                maxLength="13"
                                id="cnp"
                            />
                            <label htmlFor="cnp" className="form-label-gray">
                                <CreditCard className="w-4 h-4 inline mr-1" />
                                CNP *
                            </label>
                        </>
                    )}
                />
                {errors.CNP && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.CNP.message}
                    </p>
                )}
                <p className="text-gray-500 text-xs mt-1">Ex: 1850101123456</p>
            </div>

            <div className="form-group">
                <Controller
                    name="birthdate"
                    control={control}
                    rules={{ required: 'Data nașterii este obligatorie' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                type="date"
                                className="form-input-gray"
                                placeholder=" "
                                id="birthdate"
                            />
                            <label htmlFor="birthdate" className="form-label-gray">
                                <Calendar className="w-4 h-4 inline mr-1" />
                                Data nașterii *
                            </label>
                        </>
                    )}
                />
                {errors.birthdate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.birthdate.message}
                    </p>
                )}
            </div>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-4">Gen *</label>
            <div className="flex gap-6">
                <Controller
                    name="gen"
                    control={control}
                    rules={{ required: 'Genul este obligatoriu' }}
                    render={({ field }) => (
                        <>
                            <label className="group flex items-center cursor-pointer">
                                <input
                                    {...field}
                                    type="radio"
                                    value="F"
                                    checked={field.value === 'F'}
                                    className="w-5 h-5 text-gray-600 focus:ring-gray-500 transition-transform duration-200 group-hover:scale-110"
                                />
                                <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">Feminin</span>
                            </label>
                            <label className="group flex items-center cursor-pointer">
                                <input
                                    {...field}
                                    type="radio"
                                    value="M"
                                    checked={field.value === 'M'}
                                    className="w-5 h-5 text-gray-600 focus:ring-gray-500 transition-transform duration-200 group-hover:scale-110"
                                />
                                <span className="ml-3 text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200">Masculin</span>
                            </label>
                        </>
                    )}
                />
            </div>
            {errors.gen && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                    <AlertCircle className="w-4 h-4" />
                    {errors.gen.message}
                </p>
            )}
        </div>
    </div>
);

const ContactInfoStep = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Date de Contact</h2>
                <p className="text-gray-600">Informații pentru comunicarea cu clinica</p>
            </div>
        </div>

        <div className="form-group">
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
                    <>
                        <input
                            {...field}
                            type="email"
                            className="form-input-gray"
                            placeholder=" "
                            id="email"
                        />
                        <label htmlFor="email" className="form-label-gray">
                            <Mail className="w-4 h-4 inline mr-1" />
                            Email *
                        </label>
                    </>
                )}
            />
            {errors.email && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email.message}
                </p>
            )}
            <p className="text-gray-500 text-xs mt-1">Ex: nume@exemplu.com</p>
        </div>

        <div className="form-group">
            <Controller
                name="telefon"
                control={control}
                rules={{
                    required: 'Telefonul este obligatoriu',
                    pattern: {
                        value: /^(\+40|0)[0-9]{9}$/,
                        message: 'Număr de telefon invalid (format: 0740123456)'
                    }
                }}
                render={({ field }) => (
                    <>
                        <input
                            {...field}
                            type="tel"
                            className="form-input-gray"
                            placeholder=" "
                            id="telefon"
                        />
                        <label htmlFor="telefon" className="form-label-gray">
                            <Phone className="w-4 h-4 inline mr-1" />
                            Telefon *
                        </label>
                    </>
                )}
            />
            {errors.telefon && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                    <AlertCircle className="w-4 h-4" />
                    {errors.telefon.message}
                </p>
            )}
            <p className="text-gray-500 text-xs mt-1">Ex: 0740123456 sau +40740123456</p>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-800 mb-2">Protecția datelor personale</h3>
                    <p className="text-gray-700 text-sm">
                        Datele dumneavoastră de contact vor fi folosite exclusiv pentru comunicări legate de
                        programări și tratamente medicale, conform GDPR.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

const AddressStep = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Adresa de Domiciliu</h2>
                <p className="text-gray-600">Adresa completă pentru evidența medicală</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
                <Controller
                    name="judet"
                    control={control}
                    rules={{ required: 'Județul este obligatoriu' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="judet"
                            />
                            <label htmlFor="judet" className="form-label-gray">
                                Județ *
                            </label>
                        </>
                    )}
                />
                {errors.judet && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.judet.message}
                    </p>
                )}
                <p className="text-gray-500 text-xs mt-1">Ex: Timiș</p>
            </div>

            <div className="form-group">
                <Controller
                    name="localitate"
                    control={control}
                    rules={{ required: 'Localitatea este obligatorie' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="localitate"
                            />
                            <label htmlFor="localitate" className="form-label-gray">
                                Localitate *
                            </label>
                        </>
                    )}
                />
                {errors.localitate && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.localitate.message}
                    </p>
                )}
                <p className="text-gray-500 text-xs mt-1">Ex: Timișoara</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div className="form-group">
                <Controller
                    name="strada"
                    control={control}
                    rules={{ required: 'Strada este obligatorie' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="strada"
                            />
                            <label htmlFor="strada" className="form-label-gray">
                                Strada *
                            </label>
                        </>
                    )}
                />
                {errors.strada && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.strada.message}
                    </p>
                )}
                <p className="text-gray-500 text-xs mt-1">Ex: Calea Victoriei</p>
            </div>

            <div className="form-group">
                <Controller
                    name="numar"
                    control={control}
                    rules={{ required: 'Numărul este obligatoriu' }}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="numar"
                            />
                            <label htmlFor="numar" className="form-label-gray">
                                Număr *
                            </label>
                        </>
                    )}
                />
                {errors.numar && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1 animate-slide-in-left">
                        <AlertCircle className="w-4 h-4" />
                        {errors.numar.message}
                    </p>
                )}
                <p className="text-gray-500 text-xs mt-1">Ex: 12A</p>
            </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
            <div className="form-group">
                <Controller
                    name="bloc"
                    control={control}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="bloc"
                            />
                            <label htmlFor="bloc" className="form-label-gray">
                                Bloc (opțional)
                            </label>
                        </>
                    )}
                />
                <p className="text-gray-500 text-xs mt-1">Ex: A1</p>
            </div>

            <div className="form-group">
                <Controller
                    name="scara"
                    control={control}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="scara"
                            />
                            <label htmlFor="scara" className="form-label-gray">
                                Scara (opțional)
                            </label>
                        </>
                    )}
                />
                <p className="text-gray-500 text-xs mt-1">Ex: 2</p>
            </div>

            <div className="form-group">
                <Controller
                    name="apartament"
                    control={control}
                    render={({ field }) => (
                        <>
                            <input
                                {...field}
                                className="form-input-gray"
                                placeholder=" "
                                id="apartament"
                            />
                            <label htmlFor="apartament" className="form-label-gray">
                                Apartament (opțional)
                            </label>
                        </>
                    )}
                />
                <p className="text-gray-500 text-xs mt-1">Ex: 15</p>
            </div>
        </div>
    </div>
);

const AdditionalInfoStep = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
                <h2 className="text-xl font-semibold text-gray-800">Informații Suplimentare</h2>
                <p className="text-gray-600">Detalii opționale pentru finalizarea înregistrării</p>
            </div>
        </div>

        <div className="form-group">
            <Controller
                name="recomandare"
                control={control}
                render={({ field }) => (
                    <>
                        <input
                            {...field}
                            className="form-input-gray"
                            placeholder=" "
                            id="recomandare"
                        />
                        <label htmlFor="recomandare" className="form-label-gray">
                            Recomandare (opțional)
                        </label>
                    </>
                )}
            />
            <p className="text-gray-500 text-xs mt-1">Cine v-a recomandat clinica noastră?</p>
        </div>

        <div className="form-group">
            <Controller
                name="representantid"
                control={control}
                render={({ field }) => (
                    <>
                        <input
                            {...field}
                            className="form-input-gray"
                            placeholder=" "
                            id="representantid"
                        />
                        <label htmlFor="representantid" className="form-label-gray">
                            Reprezentant legal (opțional)
                        </label>
                    </>
                )}
            />
            <p className="text-gray-500 text-xs mt-1">
                Completați doar dacă pacientul este minor și are nevoie de un reprezentant legal
            </p>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-medium text-gray-800 mb-3">Finalizare înregistrare</h3>
                    <div className="space-y-2 text-gray-700 text-sm">
                        <p>✓ Date personale verificate</p>
                        <p>✓ Informații de contact confirmate</p>
                        <p>✓ Adresa de domiciliu completă</p>
                        <p>✓ Pregătit pentru chestionarul medical</p>
                    </div>
                    <p className="text-gray-600 text-sm mt-3 font-medium">
                        După înregistrare, veți putea completa chestionarul medical digital.
                    </p>
                </div>
            </div>
        </div>
    </div>
);

export default PatientRegistration;
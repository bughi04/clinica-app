import React, { useState, useEffect } from 'react';
import { User, Settings, Stethoscope, Activity, Shield, Award, AlertCircle, Menu, X, LogOut } from 'lucide-react';
import 'antd/dist/reset.css';
import logo from './assets/logo2x.png';

// Your existing components (keeping all functionality)
import PatientRegistration from './components/PatientRegistration';
import QuestionnaireWizard from './components/QuestionnaireWizard';
import TabletInterface from './components/TabletInterface';
import DoctorDashboard from './components/doctor/DoctorDashboard';
import PatientList from './components/doctor/PatientList';
import PatientProfile from './components/doctor/PatientProfile';
import ReportsGenerator from './components/doctor/ReportsGenerator';
import DoctorLoginScreen from './components/doctor/DoctorLoginScreen';
import DoctorRegistration from './components/doctor/DoctorRegistration';
import ApiService from './services/apiService';

const App = () => {

    const [currentInterface, setCurrentInterface] = useState('patient');
    const [currentView, setCurrentView] = useState('login');
    const [currentPatient, setCurrentPatient] = useState(null);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [formData, setFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(true);

    // Doctor authentication state
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [doctorView, setDoctorView] = useState('login'); // 'login', 'register', 'dashboard'
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const handleLogin = async (patient) => {
        setCurrentPatient(patient);
        
        // Load existing questionnaire data if available
        try {
            const existingQuestionnaires = await ApiService.getPatientQuestionnaires(patient.id);
            if (existingQuestionnaires && existingQuestionnaires.length > 0) {
                // Use the latest questionnaire data
                const latestQuestionnaire = existingQuestionnaires[0];
                console.log('Loading existing questionnaire data:', latestQuestionnaire);
                
                // Convert the questionnaire data to the format expected by the form
                const formData = {
                    'medical-history': {
                        // Map the questionnaire data to form fields
                        medic: latestQuestionnaire.medic || '',
                        nr_fisa: latestQuestionnaire.nr_fisa || '',
                        
                        // Referral data
                        cum_ati_fost_indrumat: {
                            dr: latestQuestionnaire.indrumare_dr || false,
                            internet: latestQuestionnaire.indrumare_internet || false,
                            altele: latestQuestionnaire.indrumare_altele || false,
                            altele_text: latestQuestionnaire.indrumare_altele_detalii || ''
                        },
                        
                        // Dental examination data
                        va_sangereaza_gingiile: latestQuestionnaire.examen_dentar?.sangereaza_gingiile || '',
                        dintii_sensibili_rece_cald: latestQuestionnaire.examen_dentar?.sensibilitate_dinti || '',
                        probleme_tratament_ortodontic: latestQuestionnaire.examen_dentar?.probleme_ortodontice || '',
                        scrasniti_inclestati_dinti: latestQuestionnaire.examen_dentar?.scrasnit_inclestat || '',
                        data_ultimului_consult: latestQuestionnaire.examen_dentar?.data_ultim_consult || '',
                        cum_apreciati_aspectul_dentatiei: latestQuestionnaire.examen_dentar?.aspect_dentatie || '',
                        probleme_tratament_anterior: latestQuestionnaire.examen_dentar?.probleme_tratament_anterior || '',
                        
                        // General health data
                        cum_apreciati_starea_sanatate: latestQuestionnaire.stare_generala?.apreciere_sanatate || '',
                        stare_sanatate_modificat: latestQuestionnaire.stare_generala?.modificari_recente || '',
                        sunteti_in_ingrijirea_medic: latestQuestionnaire.stare_generala?.in_ingrijirea_medic || '',
                        nume_prenume_medic: latestQuestionnaire.stare_generala?.nume_medic || '',
                        spitalizat_operat_5ani: latestQuestionnaire.stare_generala?.spitalizare_5ani || '',
                        pentru_ce_boala: latestQuestionnaire.stare_generala?.motiv_spitalizare || '',
                        folositi_medicamente: latestQuestionnaire.stare_generala?.medicamente_curente || '',
                        ce_medicamente: latestQuestionnaire.stare_generala?.lista_medicamente || '',
                        fumati: latestQuestionnaire.stare_generala?.fumat || '',
                        cate_tigari_24h: latestQuestionnaire.stare_generala?.tigari_pe_zi || '',
                        sunteti_alergic: latestQuestionnaire.stare_generala?.alergii || '',
                        la_care_alergii: latestQuestionnaire.stare_generala?.lista_alergii || '',
                        luati_antidepresive: latestQuestionnaire.stare_generala?.antidepresive || '',
                        
                        // Medical conditions data
                        boli_inima_hipertensiune: latestQuestionnaire.conditii_medicale?.boli_inima_hipertensiune || '',
                        purtator_proteza_valvulara: latestQuestionnaire.conditii_medicale?.purtator_proteza_valvulara || '',
                        diabet: latestQuestionnaire.conditii_medicale?.diabet || '',
                        boli_infectioase_tbc_hiv: latestQuestionnaire.conditii_medicale?.boli_infectioase_tbc_hiv || '',
                        hepatita_ciroza: latestQuestionnaire.conditii_medicale?.hepatita_abc_ciroza || '',
                        reumatism_artrita: latestQuestionnaire.conditii_medicale?.reumatism_artrita || '',
                        boli_respiratorii_astm: latestQuestionnaire.conditii_medicale?.boli_respiratorii_astm || '',
                        tulburari_coagulare_sangerari: latestQuestionnaire.conditii_medicale?.tulburari_coagulare_sangerari || '',
                        anemie_transfuzie: latestQuestionnaire.conditii_medicale?.anemie_transfuzie || '',
                        boli_rinichi_litiaza: latestQuestionnaire.conditii_medicale?.boli_rinichi_litiaza || '',
                        glaucom: latestQuestionnaire.conditii_medicale?.glaucom || '',
                        epilepsie: latestQuestionnaire.conditii_medicale?.epilepsie || '',
                        migrene: latestQuestionnaire.conditii_medicale?.migrene || '',
                        osteoporoza: latestQuestionnaire.conditii_medicale?.osteoporoza || '',
                        ulcer_gastric: latestQuestionnaire.conditii_medicale?.ulcer_gastric || '',
                        boli_tiroida: latestQuestionnaire.conditii_medicale?.boli_tiroida || '',
                        boli_neurologice: latestQuestionnaire.conditii_medicale?.boli_neurologice || '',
                        probleme_psihice: latestQuestionnaire.conditii_medicale?.probleme_psihice || '',
                        alte_boli: latestQuestionnaire.conditii_medicale?.alte_boli || '',
                        alte_boli_text: latestQuestionnaire.conditii_medicale?.alte_boli_detalii || '',
                        
                        // Women-specific conditions
                        sunteti_insarcinata: latestQuestionnaire.conditii_femei?.insarcinata || '',
                        in_ce_luna: latestQuestionnaire.conditii_femei?.luna_sarcina || '',
                        alaptati: latestQuestionnaire.conditii_femei?.alaptare || '',
                        data_semnatura_femei: latestQuestionnaire.conditii_femei?.data_semnatura || '',
                        semnatura_pacient_femei: latestQuestionnaire.conditii_femei?.semnatura_pacient || '',
                        
                        // Data processing consent
                        subsemnatul_nume: latestQuestionnaire.procesare_date?.subsemnatul_nume || '',
                        subsemnatul_cnp: latestQuestionnaire.procesare_date?.subsemnatul_cnp || '',
                        reprezentat_legal_al: latestQuestionnaire.procesare_date?.reprezentat_legal_al || '',
                        reprezentat_legal_cnp: latestQuestionnaire.procesare_date?.reprezentat_legal_cnp || '',
                        data_processing_data: latestQuestionnaire.procesare_date?.data || '',
                        data_processing_semnatura: latestQuestionnaire.procesare_date?.semnatura || '',
                        
                        // General consent
                        general_consent_pacient: latestQuestionnaire.acord_general?.pacient || '',
                        general_consent_tutore: latestQuestionnaire.acord_general?.tutore || '',
                        general_consent_domiciliu: latestQuestionnaire.acord_general?.domiciliu || '',
                        general_treatments: latestQuestionnaire.acord_general?.tratamente || {},
                        general_treatments_altele: latestQuestionnaire.acord_general?.tratamente_altele || '',
                        general_consent_medic: latestQuestionnaire.acord_general?.medic || '',
                        general_consent_semnatura: latestQuestionnaire.acord_general?.semnatura || '',
                        general_consent_data: latestQuestionnaire.acord_general?.data || '',
                        
                        // Pedodontics consent
                        pedo_pacient_nume: latestQuestionnaire.acord_pedodontie?.pacient || '',
                        pedo_tutore_nume: latestQuestionnaire.acord_pedodontie?.tutore || '',
                        pedo_domiciliu: latestQuestionnaire.acord_pedodontie?.domiciliu || '',
                        pedo_treatments: latestQuestionnaire.acord_pedodontie?.tratamente || {},
                        pedo_treatments_altele: latestQuestionnaire.acord_pedodontie?.tratamente_altele || '',
                        pedo_medic: latestQuestionnaire.acord_pedodontie?.medic || '',
                        pedo_semnatura_tutore: latestQuestionnaire.acord_pedodontie?.semnatura_tutore || '',
                        pedo_data: latestQuestionnaire.acord_pedodontie?.data || '',
                        
                        // Endodontic consent
                        endo_pacient: latestQuestionnaire.acord_endodontic?.pacient || '',
                        endo_tutore: latestQuestionnaire.acord_endodontic?.tutore || '',
                        endo_domiciliu: latestQuestionnaire.acord_endodontic?.domiciliu || '',
                        endo_medic: latestQuestionnaire.acord_endodontic?.medic || '',
                        endo_motiv: latestQuestionnaire.acord_endodontic?.motiv || '',
                        endo_semnatura: latestQuestionnaire.acord_endodontic?.semnatura || '',
                        endo_semnatura_2: latestQuestionnaire.acord_endodontic?.semnatura_2 || '',
                        endo_data: latestQuestionnaire.acord_endodontic?.data || ''
                    }
                };
                
                setFormData(formData);
            }
        } catch (error) {
            console.warn('Could not load existing questionnaire data:', error);
        }
        
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

    const handleQuestionnaireComplete = (data) => {
        // If data is null, it means user wants to go back to login
        if (data === null) {
            setCurrentView('login');
            setCurrentPatient(null);
            setFormData({});
            return;
        }
        
        // Normal questionnaire completion
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
        
        // Reset doctor authentication state
        if (interfaceType === 'patient') {
            setCurrentDoctor(null);
            setDoctorView('login');
        }
    };

    // Doctor authentication handlers
    const handleDoctorLogin = (doctor) => {
        setCurrentDoctor(doctor);
        setDoctorView('dashboard');
    };

    const handleDoctorRegister = () => {
        setDoctorView('register');
    };

    const handleDoctorRegistrationComplete = (doctor) => {
        setCurrentDoctor(doctor);
        setDoctorView('dashboard');
    };

    const handleDoctorLogout = () => {
        setCurrentDoctor(null);
        setDoctorView('login');
        setSelectedPatientId(null);
        setCurrentView('login');
    };

    // Enhanced Loading Screen Component with Teal Theme
    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-[rgb(59,185,194)] via-[rgb(49,175,184)] to-[rgb(39,165,174)] flex items-center justify-center">
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

    // Enhanced Welcome Screen Component with Teal Theme
    if (showWelcome) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-[rgb(59,185,194)] via-[rgb(49,175,184)] to-[rgb(39,165,174)] flex items-center justify-center overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-[rgb(79,195,204)]/20 rounded-full blur-3xl animate-float-delay"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[rgb(69,185,194)]/20 rounded-full blur-2xl animate-pulse"></div>
                </div>

                <div className="text-center z-10">
                    <div className="relative mb-8">
                        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 mx-auto">
                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                                <Stethoscope className="w-10 h-10 text-[rgb(59,185,194)]" />
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
                            { icon: Activity, label: "Real-time", color: "text-[rgb(79,195,204)]" },
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

    // Enhanced Interface Switcher with Teal Theme
    const renderInterfaceSwitcher = () => (
        <div className="fixed bottom-6 right-6 z-30">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-2 border border-gray-200">
                <div className="flex gap-2">
                    <button
                        onClick={() => switchInterface('patient')}
                        className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                            currentInterface === 'patient'
                                ? 'bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] text-white shadow-lg'
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
                                ? 'bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] text-white shadow-lg'
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

    // Enhanced Patient Interface with Teal Theme
    const renderPatientInterface = () => (
        <TabletInterface>
            <div className="min-h-screen relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[rgb(59,185,194)]/30 to-transparent rounded-full blur-3xl animate-float"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[rgb(59,185,194)]/30 to-transparent rounded-full blur-3xl animate-float-delay"></div>
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
                                dentistid={currentDoctor?.dentistid}
                            />
                        </div>
                    )}
                </div>
            </div>
        </TabletInterface>
    );

    // Enhanced Doctor Interface with Teal Theme
    const renderDoctorInterface = () => {
        // Show login/register screens if not authenticated
        if (!currentDoctor) {
            if (doctorView === 'register') {
                return (
                    <TabletInterface>
                        <DoctorRegistration
                            onComplete={handleDoctorRegistrationComplete}
                            onBack={() => setDoctorView('login')}
                        />
                    </TabletInterface>
                );
            }
            return (
                <TabletInterface>
                    <DoctorLoginScreen
                        onLogin={handleDoctorLogin}
                        onRegister={handleDoctorRegister}
                    />
                </TabletInterface>
            );
        }

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
            <TabletInterface>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 relative">
                    {/* Enhanced Navigation with Teal Theme */}
                    <nav className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200 sticky top-0 z-40">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="flex justify-between items-center h-16 sm:h-20">
                                {/* Logo Section */}
                                <div className="flex items-center group">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24  rounded-2xl flex items-center justify-center mr-3 sm:mr-4 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                                        <img src={logo} alt="Dental Point Clinic Logo" className="w-20 h-20 sm:w-24 sm:h-24 object-contain" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg mb-0 sm:text-2xl font-bold bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] bg-clip-text text-transparent">
                                            Dental Point Clinic
                                        </h1>
                                        <p className="text-xs mb-0 sm:text-sm text-gray-500 hidden sm:block">Sistem de Management Digital</p>
                                    </div>
                                </div>

                                {/* Desktop Navigation */}
                                <div className="hidden md:flex items-center space-x-4">
                                    {/* Doctor Info */}
                                    <div className="text-right">
                                        <p className="text-sm mb-0 font-medium text-gray-900">
                                            {currentDoctor.dentist?.fullName || currentDoctor.username}
                                        </p>
                                        <p className="text-xs mb-0 text-gray-500">Doctor</p>
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
                                                className={`group flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 ${
                                                    currentView === item.key
                                                        ? 'bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] text-white shadow-lg'
                                                        : 'text-gray-600 hover:bg-[rgb(59,185,194)]/10 hover:text-[rgb(49,175,184)]'
                                                }`}
                                            >
                                                <item.icon className={`w-4 h-4 transition-transform duration-300 ${
                                                    currentView === item.key ? 'animate-pulse' : 'group-hover:scale-110'
                                                }`} />
                                                <span className="hidden lg:inline">{item.label}</span>
                                            </button>
                                        ))}

                                        {/* Logout Button */}
                                        <button
                                            onClick={handleDoctorLogout}
                                            className="group flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 transform hover:scale-105"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span className="hidden lg:inline">Deconectare</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Mobile menu button */}
                                <div className="md:hidden">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                        className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        {isMobileMenuOpen ? (
                                            <X className="w-6 h-6" />
                                        ) : (
                                            <Menu className="w-6 h-6" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Mobile Navigation Menu */}
                            {isMobileMenuOpen && (
                                <div className="md:hidden border-t border-gray-200 py-4">
                                    {/* Doctor Info Mobile */}
                                    <div className="mb-4 pb-4 border-b border-gray-200">
                                        <p className="text-sm font-medium text-gray-900 mb-0">
                                            {currentDoctor.dentist?.fullName || currentDoctor.username}
                                        </p>
                                        <p className="text-xs text-gray-500 mb-0">Doctor</p>
                                    </div>

                                    {/* Mobile Navigation Items */}
                                    <div className="space-y-2">
                                        {[
                                            { key: 'dashboard', label: 'Dashboard', icon: Activity },
                                            { key: 'patient-list', label: 'Pacienți', icon: User },
                                            { key: 'reports', label: 'Rapoarte', icon: Award }
                                        ].map((item) => (
                                            <button
                                                key={item.key}
                                                onClick={() => {
                                                    setCurrentView(item.key);
                                                    setIsMobileMenuOpen(false);
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                                                    currentView === item.key
                                                        ? 'bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] text-white shadow-lg'
                                                        : 'text-gray-600 hover:bg-[rgb(59,185,194)]/10 hover:text-[rgb(49,175,184)]'
                                                }`}
                                            >
                                                <item.icon className={`w-5 h-5 transition-transform duration-300 ${
                                                    currentView === item.key ? 'animate-pulse' : 'group-hover:scale-110'
                                                }`} />
                                                {item.label}
                                            </button>
                                        ))}

                                        {/* Mobile Logout Button */}
                                        <button
                                            onClick={() => {
                                                handleDoctorLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300"
                                        >
                                            <LogOut className="w-5 h-5" />
                                            <span>Deconectare</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Content Area */}
                    <div className="max-w-7xl mx-auto py-4 sm:py-8 px-4 sm:px-6">
                        <div>
                            {getViewContent()}
                        </div>
                    </div>
                </div>
            </TabletInterface>
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

// Enhanced Patient Login Screen with Teal Theme
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
                        firstName: 'Ion',
                        lastName: 'Pop',
                        CNP: '1234567890123',
                        email: 'ion.new@example.com',
                        telefon: '0721234567',
                        birthdate: '1985-04-02',
                        gen: 'M',
                        allergies: [],
                        chronicConditions: ['Diabet tip 2'],
                        currentMedications: ['Metformin 500mg']
                    },
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
            <div
                className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-10 w-full max-w-md border border-white/20">
                {/* Header */}
                <div className="text-center mb-8">
                    <div
                        className="bg-gradient-to-br from-[rgb(59,185,194)] to-[rgb(49,175,184)] rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <User className="w-10 h-10 text-white"/>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[rgb(59,185,194)] to-[rgb(49,175,184)] bg-clip-text text-transparent mb-2">
                        Acces Pacient
                    </h1>
                    <p className="text-gray-600 text-lg">Dental Point Clinic</p>
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
                            className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[rgb(59,185,194)] focus:border-transparent text-lg transition-all duration-300 hover:border-[rgb(49,175,184)]"
                            placeholder="Introduceți CNP-ul"
                            required
                        />
                    </div>

                    {/* Demo Accounts Section */}
                    <div className="bg-gradient-to-r from-[rgb(59,185,194)]/10 to-[rgb(49,175,184)]/10 rounded-xl p-4 border border-[rgb(59,185,194)]/30">
                        <button
                            type="button"
                            onClick={() => setShowDemo(!showDemo)}
                            className="flex items-center justify-between w-full text-sm font-medium text-[rgb(59,185,194)] hover:text-[rgb(49,175,184)] transition-colors duration-200"
                        >
                            <span>Conturi Demo Disponibile</span>
                            <div
                                className={`transform transition-transform duration-200 ${showDemo ? 'rotate-180' : ''}`}>
                                ▼
                            </div>
                        </button>

                        {showDemo && (
                            <div className="mt-3 space-y-2">
                                {[
                                    {
                                        cnp: '5041129350010',
                                        name: 'Elena',
                                        color: 'bg-green-100 text-green-800'
                                    },
                                    {
                                        cnp: '1234567890123',
                                        name: 'Ion',
                                        color: 'bg-yellow-100 text-yellow-800'
                                    },
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
                            <div className="flex items-center">
                                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !patientId.trim()}
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
                    <p className="text-gray-600 mb-4">Nu aveți cont?</p>
                    <button
                        onClick={onNewPatient}
                        className="group text-[rgb(59,185,194)] hover:text-[rgb(49,175,184)] font-medium text-lg transition-all duration-300 hover:scale-105"
                    >
                        <span
                            className="border-b-2 border-transparent group-hover:border-[rgb(59,185,194)] transition-all duration-300">
                            Înregistrare pacient nou
                        </span>

                    </button>

                </div>
            </div>
        </div>
    );
};

export default App;
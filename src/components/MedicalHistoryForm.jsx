import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Heart, AlertTriangle, Pill, FileText, Calendar } from 'lucide-react';
import FormValidation from '../utils/FormValidation';

const MedicalHistoryForm = ({ onComplete, onBack, initialData, patient }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(false);

    const { control, handleSubmit, formState: { errors }, watch, trigger } = useForm({
        mode: 'onChange',
        defaultValues: {
            // Initialize with existing data if available
            ...initialData,
            // Set defaults for yes/no questions
            boli_inima: 'Nu',
            purtator_proteza: 'Nu',
            diabet: 'Nu',
            hepatita: 'Nu',
            reumatism: 'Nu',
            boli_respiratorii: 'Nu',
            tulburari_coagulare_sange: 'Nu',
            anemie: 'Nu',
            boli_rinichi: 'Nu',
            glaucom: 'Nu',
            epilepsie: 'Nu',
            migrene: 'Nu',
            osteoporoza: 'Nu',
            ulcer_gastric: 'Nu',
            boli_tiroida: 'Nu',
            boli_neurologice: 'Nu',
            probleme_psihice: 'Nu',
            ingrijire_alt_medic: 'Nu',
            spitalizare: 'Nu',
            fumat: 'Nu',
            antidepresive: 'Nu',
            sanatategingii: 'Nu',
            sensibilitateDinti: 'Nu',
            problemeTratamentOrtodontic: 'Nu',
            scrasnit_inclestat_scrasnit_denti: 'Nu'
        }
    });

    const sections = [
        'Stare Generală de Sănătate',
        'Boli și Condiții Medicale',
        'Antecedente Medicale',
        'Examen Stomatologic',
        'Condiții Speciale'
    ];

    const nextSection = async () => {
        const isValid = await trigger();
        if (isValid && currentSection < sections.length - 1) {
            setCurrentSection(currentSection + 1);
        }
    };

    const prevSection = () => {
        if (currentSection > 0) {
            setCurrentSection(currentSection - 1);
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);

        try {
            // Validate complete medical data
            const validation = FormValidation.validateMedicalHistory(data);

            if (!validation.isValid) {
                console.error('Validation errors:', validation.errors);
                setLoading(false);
                return;
            }

            // Structure data according to database schema
            const medicalData = {
                // Tabel Boli
                boli: {
                    boli_inima: data.boli_inima,
                    purtator_proteza: data.purtator_proteza,
                    diabet: data.diabet,
                    hepatita: data.hepatita,
                    reumatism: data.reumatism,
                    boli_respiratorii: data.boli_respiratorii,
                    tulburari_coagulare_sange: data.tulburari_coagulare_sange,
                    anemie: data.anemie,
                    boli_rinichi: data.boli_rinichi,
                    glaucom: data.glaucom,
                    epilepsie: data.epilepsie,
                    migrene: data.migrene,
                    osteoporoza: data.osteoporoza,
                    ulcer_gastric: data.ulcer_gastric,
                    boli_tiroida: data.boli_tiroida,
                    boli_neurologice: data.boli_neurologice,
                    probleme_psihice: data.probleme_psihice,
                    alte_boli: data.alte_boli || null
                },

                // Tabel date_antecedente_medicale
                antecedente: {
                    nota_stare_sanatate: data.nota_stare_sanatate,
                    ingrijire_alt_medic: data.ingrijire_alt_medic,
                    spitalizare: data.spitalizare,
                    medicamente: data.medicamente || null,
                    fumat: data.fumat,
                    alergii: data.alergii || null,
                    antidepresive: data.antidepresive,
                    femeie_insarcinata_luna: patient?.gen === 'F' ? data.femeie_insarcinata_luna : null,
                    femeie_bebe_alaptare: patient?.gen === 'F' ? data.femeie_bebe_alaptare : null,
                    data: new Date().toISOString()
                },

                // Tabel datestomatologice
                dental: {
                    sanatategingii: data.sanatategingii,
                    sensibilitateDinti: data.sensibilitateDinti,
                    problemeTratamentOrtodontic: data.problemeTratamentOrtodontic,
                    scrasnit_inclestat_scrasnit_denti: data.scrasnit_inclestat_scrasnit_denti,
                    ultim_consult_stomatologic: data.ultim_consult_stomatologic,
                    nota_aspect_dentatie: data.nota_aspect_dentatie,
                    probleme_tratament_stomatologic_anterior: data.probleme_tratament_stomatologic_anterior,
                    data: new Date().toISOString()
                },

                pacientid: patient?.id,
                completedAt: new Date().toISOString()
            };

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Demo: Medical history saved:', medicalData);
            onComplete(medicalData);

        } catch (error) {
            console.error('Error saving medical history:', error);
        }

        setLoading(false);
    };

    const renderSection = () => {
        switch (currentSection) {
            case 0:
                return <GeneralHealthSection control={control} errors={errors} watch={watch} />;
            case 1:
                return <MedicalConditionsSection control={control} errors={errors} />;
            case 2:
                return <MedicalHistorySection control={control} errors={errors} watch={watch} />;
            case 3:
                return <DentalSection control={control} errors={errors} />;
            case 4:
                return <SpecialConditionsSection control={control} errors={errors} patient={patient} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Chestionar Medical</h1>
                        <p className="text-gray-600">Vă rugăm să completați cu atenție toate informațiile</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            {sections.map((section, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                                        index < currentSection ? 'bg-green-500 text-white' :
                                            index === currentSection ? 'bg-blue-500 text-white' :
                                                'bg-gray-200 text-gray-600'
                                    }`}>
                                        {index < currentSection ? '✓' : index + 1}
                                    </div>
                                    {index < sections.length - 1 && (
                                        <div className={`w-12 h-1 mx-2 ${
                                            index < currentSection ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-gray-600">
                            Secțiunea {currentSection + 1} din {sections.length}: {sections[currentSection]}
                        </p>
                    </div>

                    {/* Form Content */}
                    <div className="mb-8">
                        {renderSection()}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={currentSection === 0 ? onBack : prevSection}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                        >
                            ← {currentSection === 0 ? 'Înapoi la înregistrare' : 'Secțiunea anterioară'}
                        </button>

                        {currentSection < sections.length - 1 ? (
                            <button
                                type="button"
                                onClick={nextSection}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                            >
                                Următoarea secțiune →
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
                                    <FileText className="w-4 h-4" />
                                )}
                                Salvează chestionarul
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Section Components
const GeneralHealthSection = ({ control, errors, watch }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">Stare Generală de Sănătate</h2>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Cum apreciați starea dumneavoastră generală de sănătate? *
            </label>
            <Controller
                name="nota_stare_sanatate"
                control={control}
                rules={{ required: 'Această informație este obligatorie' }}
                render={({ field }) => (
                    <textarea
                        {...field}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descrieți starea dumneavoastră de sănătate..."
                        rows="4"
                    />
                )}
            />
            {errors.nota_stare_sanatate && (
                <p className="text-red-500 text-sm mt-1">{errors.nota_stare_sanatate.message}</p>
            )}
        </div>

        <YesNoQuestion
            control={control}
            name="fumat"
            label="Fumați sau ați fumat vreodată?"
            icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
        />

        <YesNoQuestion
            control={control}
            name="ingrijire_alt_medic"
            label="Sunteți în îngrijirea unui alt medic în prezent?"
        />

        <YesNoQuestion
            control={control}
            name="spitalizare"
            label="Ați fost spitalizat în ultimii 2 ani?"
        />
    </div>
);

const MedicalConditionsSection = ({ control, errors }) => {
    const conditions = [
        { name: 'boli_inima', label: 'Boli de inimă', icon: '❤️' },
        { name: 'diabet', label: 'Diabet zaharat', icon: '🩸' },
        { name: 'hepatita', label: 'Hepatită', icon: '🦠' },
        { name: 'boli_respiratorii', label: 'Boli respiratorii (astm, BPOC)', icon: '🫁' },
        { name: 'reumatism', label: 'Reumatism', icon: '🦴' },
        { name: 'tulburari_coagulare_sange', label: 'Tulburări de coagulare a sângelui', icon: '🩸' },
        { name: 'anemie', label: 'Anemie', icon: '🔴' },
        { name: 'boli_rinichi', label: 'Boli de rinichi', icon: '🫘' },
        { name: 'glaucom', label: 'Glaucom', icon: '👁️' },
        { name: 'epilepsie', label: 'Epilepsie', icon: '🧠' },
        { name: 'migrene', label: 'Migrene', icon: '🤕' },
        { name: 'osteoporoza', label: 'Osteoporoză', icon: '🦴' },
        { name: 'ulcer_gastric', label: 'Ulcer gastric', icon: '🫃' },
        { name: 'boli_tiroida', label: 'Boli de tiroidă', icon: '🦋' },
        { name: 'boli_neurologice', label: 'Boli neurologice', icon: '🧠' },
        { name: 'probleme_psihice', label: 'Probleme psihice', icon: '🧠' },
        { name: 'purtator_proteza', label: 'Purtător de proteză (inimă, articulații)', icon: '🦾' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Pill className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Boli și Condiții Medicale</h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-blue-800 text-sm">
                    Vă rugăm să indicați dacă aveți sau ați avut vreodată următoarele condiții medicale:
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {conditions.map((condition) => (
                    <YesNoQuestion
                        key={condition.name}
                        control={control}
                        name={condition.name}
                        label={`${condition.icon} ${condition.label}`}
                    />
                ))}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Alte boli sau condiții medicale (opțional)
                </label>
                <Controller
                    name="alte_boli"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descrieți alte probleme de sănătate..."
                            rows="3"
                        />
                    )}
                />
            </div>
        </div>
    );
};

const MedicalHistorySection = ({ control, errors, watch }) => {
    const takesMedications = watch('medicamente');
    const hasAllergies = watch('alergii');

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-800">Antecedente Medicale</h2>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Luați medicamente în prezent?
                </label>
                <Controller
                    name="medicamente"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Listați medicamentele pe care le luați (nume, doză, frecvența) sau scrieți 'Nu' dacă nu luați medicamente"
                            rows="4"
                        />
                    )}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Aveți alergii cunoscute?
                </label>
                <Controller
                    name="alergii"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Descrieți alergiile (medicamente, alimente, substanțe) sau scrieți 'Nu' dacă nu aveți alergii"
                            rows="3"
                        />
                    )}
                />
            </div>

            <YesNoQuestion
                control={control}
                name="antidepresive"
                label="Luați medicamente antidepresive?"
                icon={<Pill className="w-5 h-5 text-purple-500" />}
            />
        </div>
    );
};

const DentalSection = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🦷</span>
            <h2 className="text-xl font-semibold text-gray-800">Examen Stomatologic</h2>
        </div>

        <YesNoQuestion
            control={control}
            name="sanatategingii"
            label="Aveți probleme cu sănătatea gingiilor (sângerare, inflamație)?"
        />

        <YesNoQuestion
            control={control}
            name="sensibilitateDinti"
            label="Aveți sensibilitate dentară (la rece, cald, dulce)?"
        />

        <YesNoQuestion
            control={control}
            name="problemeTratamentOrtodontic"
            label="Ați avut probleme cu tratamente ortodontice?"
        />

        <YesNoQuestion
            control={control}
            name="scrasnit_inclestat_scrasnit_denti"
            label="Scrâșniți sau încleștați dinții (mai ales noaptea)?"
        />

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Data ultimului consult stomatologic
            </label>
            <Controller
                name="ultim_consult_stomatologic"
                control={control}
                render={({ field }) => (
                    <input
                        {...field}
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        max={new Date().toISOString().split('T')[0]}
                    />
                )}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Aspectul dinților dumneavoastră
            </label>
            <Controller
                name="nota_aspect_dentatie"
                control={control}
                render={({ field }) => (
                    <textarea
                        {...field}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descrieți aspectul actual al dinților dumneavoastră..."
                        rows="3"
                    />
                )}
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Probleme cu tratamente stomatologice anterioare
            </label>
            <Controller
                name="probleme_tratament_stomatologic_anterior"
                control={control}
                render={({ field }) => (
                    <textarea
                        {...field}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descrieți orice probleme cu tratamente stomatologice anterioare sau scrieți 'Nu' dacă nu aveți probleme"
                        rows="3"
                    />
                )}
            />
        </div>
    </div>
);

const SpecialConditionsSection = ({ control, errors, patient }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-semibold text-gray-800">Condiții Speciale</h2>
        </div>

        {patient?.gen === 'F' && (
            <div className="bg-pink-50 p-6 rounded-xl space-y-4">
                <h3 className="font-semibold text-pink-800 mb-4">Pentru pacientele de sex feminin</h3>

                <YesNoQuestion
                    control={control}
                    name="femeie_insarcinata_luna"
                    label="Sunteți însărcinată? (Dacă da, vă rugăm să specificați luna în comentarii)"
                />

                <YesNoQuestion
                    control={control}
                    name="femeie_bebe_alaptare"
                    label="Alăptați în prezent?"
                />
            </div>
        )}

        <div className="bg-yellow-50 p-6 rounded-xl">
            <h3 className="font-semibold text-yellow-800 mb-4">Informații importante</h3>
            <p className="text-yellow-700 text-sm">
                Toate informațiile furnizate vor fi păstrate strict confidențiale și vor fi folosite exclusiv
                pentru planificarea tratamentului dumneavoastră stomatologic. Dacă aveți întrebări despre
                orice aspect al acestui chestionar, vă rugăm să le adresați medicului dumneavoastră.
            </p>
        </div>
    </div>
);

// Reusable Yes/No Question Component
const YesNoQuestion = ({ control, name, label, icon = null }) => (
    <div className="bg-gray-50 p-4 rounded-xl">
        <label className="block text-sm font-medium text-gray-700 mb-3">
            {icon && <span className="mr-2">{icon}</span>}
            {label}
        </label>
        <div className="flex gap-4">
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <>
                        <label className="flex items-center cursor-pointer">
                            <input
                                {...field}
                                type="radio"
                                value="Da"
                                checked={field.value === 'Da'}
                                className="w-4 h-4 text-green-600 focus:ring-green-500 mr-2"
                            />
                            <span className="text-green-700 font-medium">Da</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                            <input
                                {...field}
                                type="radio"
                                value="Nu"
                                checked={field.value === 'Nu'}
                                className="w-4 h-4 text-red-600 focus:ring-red-500 mr-2"
                            />
                            <span className="text-red-700 font-medium">Nu</span>
                        </label>
                    </>
                )}
            />
        </div>
    </div>
);

export default MedicalHistoryForm;
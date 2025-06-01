import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FileText, AlertTriangle, User, Heart, Pill, Shield, PenTool } from 'lucide-react';
import ApiService from '../services/apiService.js';

// Reusable PDF Question Component
const PDFQuestion = ({ control, name, label }) => (
    <div className="bg-gray-50 p-4 rounded-xl">
        <div className="flex justify-between items-start">
            <label className="block text-sm font-medium text-gray-700 flex-1 pr-4">
                • {label}
            </label>
            <div className="flex gap-6 shrink-0">
                <Controller
                    name={name}
                    control={control}
                    render={({ field }) => (
                        <>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    {...field}
                                    type="radio"
                                    value="DA"
                                    checked={field.value === 'DA'}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500 mr-2"
                                />
                                <span className="text-green-700 font-medium text-sm">DA</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    {...field}
                                    type="radio"
                                    value="NU"
                                    checked={field.value === 'NU'}
                                    className="w-4 h-4 text-red-600 focus:ring-red-500 mr-2"
                                />
                                <span className="text-red-700 font-medium text-sm">NU</span>
                            </label>
                            <label className="flex items-center cursor-pointer">
                                <input
                                    {...field}
                                    type="radio"
                                    value="UNEORI"
                                    checked={field.value === 'UNEORI'}
                                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500 mr-2"
                                />
                                <span className="text-yellow-700 font-medium text-sm">UNEORI</span>
                            </label>
                        </>
                    )}
                />
            </div>
        </div>
    </div>
);

// Section 1: Patient Info and Referral
const PatientInfoSection = ({ control, errors, patient }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Informații Pacient</h2>
        </div>

        {/* Patient Info Display - auto-filled */}
        <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="font-semibold text-blue-800 mb-4">Date Pacient (completate automat)</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div><strong>NUME:</strong> {patient?.lastName || '_______________'}</div>
                <div><strong>PRENUME:</strong> {patient?.firstName || '_______________'}</div>
                <div><strong>DOMICILIU:</strong> {patient?.address || '_______________'}</div>
                <div><strong>DATA NAȘTERII:</strong> {patient?.birthdate || '_______________'}</div>
                <div><strong>TELEFON:</strong> {patient?.telefon || '_______________'}</div>
                <div><strong>E-MAIL:</strong> {patient?.email || '_______________'}</div>
            </div>
        </div>

        {/* Exact question from PDF */}
        <div className="bg-gray-50 p-6 rounded-xl">
            <h3 className="font-semibold text-gray-800 mb-4">CUM AȚI FOST ÎNDRUMAȚI LA CLINICA NOASTRĂ?</h3>
            <div className="space-y-3">
                <label className="flex items-center">
                    <Controller
                        name="cum_ati_fost_indrumat.dr"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="checkbox"
                                checked={field.value}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                            />
                        )}
                    />
                    <span>Dr. ________________________</span>
                </label>
                <label className="flex items-center">
                    <Controller
                        name="cum_ati_fost_indrumat.internet"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="checkbox"
                                checked={field.value}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                            />
                        )}
                    />
                    <span>Internet</span>
                </label>
                <label className="flex items-center">
                    <Controller
                        name="cum_ati_fost_indrumat.altele"
                        control={control}
                        render={({ field }) => (
                            <input
                                {...field}
                                type="checkbox"
                                checked={field.value}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 mr-3"
                            />
                        )}
                    />
                    <span>Altele ________________________</span>
                </label>
                <Controller
                    name="cum_ati_fost_indrumat.altele_text"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-2"
                            placeholder="Specificați altele..."
                        />
                    )}
                />
            </div>
            <p className="text-xs italic text-gray-600 mt-3">
                Vă rugăm răspundeți încercuind răspunsul corect!
            </p>
        </div>
    </div>
);

// Section 2: Dental Examination - Exact from PDF
const DentalExaminationSection = ({ control, errors }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🦷</span>
            <h2 className="text-xl font-semibold text-gray-800">Examen Stomatologic</h2>
        </div>

        <div className="space-y-4">
            {/* Exact questions from PDF */}
            <PDFQuestion
                control={control}
                name="va_sangereaza_gingiile"
                label="Va sângerează gingiile la periaj?"
            />

            <PDFQuestion
                control={control}
                name="dintii_sensibili_rece_cald"
                label="Dinții dvs sunt sensibili la rece, cald sau presiune?"
            />

            <PDFQuestion
                control={control}
                name="probleme_tratament_ortodontic"
                label="Ați avut probleme după un tratament ortodontic?"
            />

            <PDFQuestion
                control={control}
                name="scrasniti_inclestati_dinti"
                label="Scrâșniți sau încleștați dinții?"
            />

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Data aproximativă a ultimului consult stomatologic:
                </label>
                <Controller
                    name="data_ultimului_consult"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="date"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    )}
                />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cum apreciați aspectul dentației dvs?
                </label>
                <Controller
                    name="cum_apreciati_aspectul_dentatiei"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Descrieți aspectul actual..."
                        />
                    )}
                />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Ați avut probleme după un tratament stomatologic anterior? Dacă da, vă rugăm explicați:
                </label>
                <Controller
                    name="probleme_tratament_anterior"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Descrieți problemele sau scrieți 'Nu' dacă nu aveți..."
                        />
                    )}
                />
            </div>
        </div>
    </div>
);

// Section 3: General Health - Exact from PDF
const GeneralHealthSection = ({ control, errors, watch }) => (
    <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800">ANTECEDENTE GENERALE:</h2>
        </div>

        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Cum apreciați starea dvs. de sănătate?
                    <span className="text-xs text-gray-500 ml-2">(Bună/Satisfăcătoare/Precară)</span>
                </label>
                <Controller
                    name="cum_apreciati_starea_sanatate"
                    control={control}
                    render={({ field }) => (
                        <select
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Selectați...</option>
                            <option value="Bună">Bună</option>
                            <option value="Satisfăcătoare">Satisfăcătoare</option>
                            <option value="Precară">Precară</option>
                        </select>
                    )}
                />
            </div>

            <PDFQuestion
                control={control}
                name="stare_sanatate_modificat"
                label="Stare dvs. de sănătate s-a modificat în ultimul timp?"
            />

            <PDFQuestion
                control={control}
                name="sunteti_in_ingrijirea_medic"
                label="Sunteți în prezent în îngrijirea unui medic?"
            />

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dacă da, precizați numele și prenumele medicului și boala de care v-ați tratat:
                </label>
                <Controller
                    name="nume_prenume_medic"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                            placeholder="Nume medic și diagnostic..."
                        />
                    )}
                />
            </div>

            <PDFQuestion
                control={control}
                name="spitalizat_operat_5ani"
                label="Ați fost spitalizat/operat în ultimii 5 ani?"
            />

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dacă da, pentru ce boală?
                </label>
                <Controller
                    name="pentru_ce_boala"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                            placeholder="Motivul spitalizării..."
                        />
                    )}
                />
            </div>

            <PDFQuestion
                control={control}
                name="folositi_medicamente"
                label="Folosiți în prezent medicamente?"
            />

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dacă da, ce medicamente?
                </label>
                <Controller
                    name="ce_medicamente"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Lista medicamentelor cu dozele..."
                        />
                    )}
                />
            </div>

            <PDFQuestion
                control={control}
                name="fumati"
                label="Fumați?"
            />

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dacă da, câte țigări în 24h?
                </label>
                <Controller
                    name="cate_tigari_24h"
                    control={control}
                    render={({ field }) => (
                        <input
                            {...field}
                            type="number"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Numărul de țigări pe zi..."
                        />
                    )}
                />
            </div>

            <PDFQuestion
                control={control}
                name="sunteti_alergic"
                label="Sunteți/ați fost alergic la vreun medicament sau substanță? (anestezice locale, penicilină, aspirină, codeină, sedative, latex, iod etc)"
            />

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dacă da, la care?
                </label>
                <Controller
                    name="la_care_alergii"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="2"
                            placeholder="Lista alergiilor..."
                        />
                    )}
                />
            </div>

            <PDFQuestion
                control={control}
                name="luati_antidepresive"
                label="Luați antidepresive?"
            />
        </div>
    </div>
);

// Section 4: Medical Conditions with Pregnancy Section
const MedicalConditionsSection = ({ control, errors, patient }) => {
    const conditions = [
        { name: 'boli_inima_hipertensiune', label: 'Boli de inimă sau hipertensiune arterială' },
        { name: 'purtator_proteza_valvulara', label: 'Sunteți purtător de proteză valvulară, vasculară sau ortopedică' },
        { name: 'diabet', label: 'Diabet' },
        { name: 'boli_infectioase_tbc_hiv', label: 'Boli infecțioase (TBC, HIV, boli venerice)' },
        { name: 'hepatita_ciroza', label: 'Hepatită A sau B sau C, ciroză, icter' },
        { name: 'reumatism_artrita', label: 'Reumatism, artrită reumatoidă' },
        { name: 'boli_respiratorii_astm', label: 'Boli respiratorii (astm, sinuzite, emfizem pulmonar)' },
        { name: 'tulburari_coagulare_sangerari', label: 'Tulburări de coagulare a sângelui (sângerări prelungite, hemofilie)' },
        { name: 'anemie_transfuzie', label: 'Anemie sau transfuzie de sânge' },
        { name: 'boli_rinichi_litiaza', label: 'Boli ale rinichilor (litiază, insuficiența renală)' },
        { name: 'glaucom', label: 'Glaucom' },
        { name: 'epilepsie', label: 'Epilepsie' },
        { name: 'migrene', label: 'Migrene' },
        { name: 'osteoporoza', label: 'Osteoporoză' },
        { name: 'ulcer_gastric', label: 'Ulcer gastric' },
        { name: 'boli_tiroida', label: 'Boli ale tiroidei' },
        { name: 'boli_neurologice', label: 'Boli neurologice' },
        { name: 'probleme_psihice', label: 'Probleme psihice' },
        { name: 'alte_boli', label: 'Alte boli? (în cazul unui răspuns afirmativ, precizați care sunt acestea)' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Pill className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-800">Aveți sau ați avut vreodată:</h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl mb-6">
                <p className="text-blue-800 text-sm">
                    Vă rugăm să răspundeți cu DA sau NU pentru fiecare condiție medicală:
                </p>
            </div>

            <div className="space-y-3">
                {conditions.map((condition) => (
                    <PDFQuestion
                        key={condition.name}
                        control={control}
                        name={condition.name}
                        label={condition.label}
                    />
                ))}
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Alte boli - precizați care sunt acestea:
                </label>
                <Controller
                    name="alte_boli_text"
                    control={control}
                    render={({ field }) => (
                        <textarea
                            {...field}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows="3"
                            placeholder="Descrieți alte probleme de sănătate..."
                        />
                    )}
                />
            </div>

            {/* Special section for women */}
            {(patient?.gen === 'F' || patient?.gender === 'F') && (
                <div className="bg-pink-50 p-6 rounded-xl border-2 border-pink-200">
                    <h3 className="font-semibold text-pink-800 mb-4">Pentru femei:</h3>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">
                                • Sunteți însărcinată?
                            </label>
                            <div className="flex gap-6">
                                <Controller
                                    name="sunteti_insarcinata"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    {...field}
                                                    type="radio"
                                                    value="DA"
                                                    checked={field.value === 'DA'}
                                                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 mr-2"
                                                />
                                                <span className="text-green-700 font-medium text-sm">DA</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    {...field}
                                                    type="radio"
                                                    value="NU"
                                                    checked={field.value === 'NU'}
                                                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 mr-2"
                                                />
                                                <span className="text-red-700 font-medium text-sm">NU</span>
                                            </label>
                                        </>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="bg-pink-100 p-4 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dacă da, în ce lună?
                            </label>
                            <Controller
                                name="in_ce_luna"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                        placeholder="Specificați luna..."
                                    />
                                )}
                            />
                        </div>

                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-700">
                                • Alăptați?
                            </label>
                            <div className="flex gap-6">
                                <Controller
                                    name="alaptati"
                                    control={control}
                                    render={({ field }) => (
                                        <>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    {...field}
                                                    type="radio"
                                                    value="DA"
                                                    checked={field.value === 'DA'}
                                                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 mr-2"
                                                />
                                                <span className="text-green-700 font-medium text-sm">DA</span>
                                            </label>
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    {...field}
                                                    type="radio"
                                                    value="NU"
                                                    checked={field.value === 'NU'}
                                                    className="w-4 h-4 text-pink-600 focus:ring-pink-500 mr-2"
                                                />
                                                <span className="text-red-700 font-medium text-sm">NU</span>
                                            </label>
                                        </>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Authenticity declaration */}
                    <div className="mt-6 p-4 border-t border-pink-200">
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Certific autenticitatea informațiilor furnizate și precizez ca la întrebările pe care le-am pus (dacă este
                            cazul) mi s-a răspuns satisfăcător. Nu îl voi face răspunzător pe medicul curant și/sau pe vreunul din
                            membrii echipei, pentru acțiunile terapeutice întreprinse sau omise din cauza greșelilor sau omisiunilor
                            mele în completarea acestui formular.
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Acest chestionar respecta recomandările CMDR Timiș, iar toate informațiile pe care ni le furnizați sunt
                            strict confidențiale, fiind folosite doar în scopul îndeplinirii actului medical.
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Va mulțumim pentru timpul acordat completării acestui formular.
                        </p>
                        <p className="text-xs italic text-gray-500 mt-2">
                            *Acest formular aparține Clinicii Dental Point, sustragerea, copierea sau multiplicarea lui se va pedepsi conform legii.
                        </p>
                    </div>

                    {/* Signature section for women */}
                    <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                            <Controller
                                name="data_semnatura_femei"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semnătura (Pacient)</label>
                            <Controller
                                name="semnatura_pacient_femei"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                                        placeholder="Numele complet pentru semnătură..."
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Section 5: Data Processing Legal Declaration
const DataProcessingSection = ({ control, errors, patient }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Shield className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Informare cu privire la prelucrarea datelor cu caracter personal</h2>
            </div>

            <div className="bg-blue-50 p-6 rounded-xl">
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Subsemnatul</label>
                            <Controller
                                name="subsemnatul_nume"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nume complet..."
                                        defaultValue={patient ? `${patient.firstName} ${patient.lastName}` : ''}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CNP</label>
                            <Controller
                                name="subsemnatul_cnp"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="CNP..."
                                        defaultValue={patient?.CNP || ''}
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">reprezentat legal al</label>
                            <Controller
                                name="reprezentat_legal_al"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Nume pacient reprezentat..."
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CNP</label>
                            <Controller
                                name="reprezentat_legal_cnp"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="CNP pacient reprezentat..."
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                            <Controller
                                name="data_processing_data"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semnătură</label>
                            <Controller
                                name="data_processing_semnatura"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Numele complet pentru semnătură..."
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-4">Informații GDPR</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Prin completarea acestui formular, vă exprimați acordul pentru prelucrarea datelor dumneavoastră cu caracter personal
                    în conformitate cu Regulamentul General privind Protecția Datelor (GDPR). Datele vor fi folosite exclusiv pentru
                    servicii medicale și nu vor fi divulgate către terți fără acordul dumneavoastră.
                </p>
            </div>
        </div>
    );
};

// Section 6: General Patient Consent
const GeneralConsentSection = ({ control, errors, patient }) => {
    const treatmentOptions = [
        'obturații coronare',
        'tratamente endodontice',
        'chirurgie dentară',
        'tratamente parodontale',
        'tratament de albire',
        'restaurări radiculare',
        'tratamente protetice'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Acordul Pacientului Informat -General-</h2>
            </div>

            <div className="bg-green-50 p-6 rounded-xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pacient</label>
                        <Controller
                            name="general_consent_pacient"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Nume complet pacient..."
                                    defaultValue={patient ? `${patient.firstName} ${patient.lastName}` : ''}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tutore (în cazul pacienților fără discernământ/copii)
                        </label>
                        <Controller
                            name="general_consent_tutore"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Nume complet tutore (dacă este cazul)..."
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Domiciliul</label>
                        <Controller
                            name="general_consent_domiciliu"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Adresa completă..."
                                    defaultValue={patient?.address || ''}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Actul/actele medicale propuse:
                        </label>
                        <div className="grid md:grid-cols-2 gap-2">
                            {treatmentOptions.map((treatment, index) => (
                                <label key={index} className="flex items-center">
                                    <Controller
                                        name={`general_treatments.${treatment.replace(/\s+/g, '_')}`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="checkbox"
                                                checked={field.value || false}
                                                className="w-4 h-4 text-green-600 rounded focus:ring-green-500 mr-2"
                                            />
                                        )}
                                    />
                                    <span className="text-sm">{treatment}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Altele</label>
                            <Controller
                                name="general_treatments_altele"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Specificați alte tratamente..."
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medicul dentist</label>
                        <Controller
                            name="general_consent_medic"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Numele medicului dentist..."
                                />
                            )}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semnătură</label>
                            <Controller
                                name="general_consent_semnatura"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                        placeholder="Numele complet pentru semnătură..."
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                            <Controller
                                name="general_consent_data"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Section 7: Pedodontics Consent
const PedodonticsConsentSection = ({ control, errors, patient }) => {
    const pediatricTreatments = [
        'urgențe pedodontice',
        'obturații coronare',
        'tratamente endodontice',
        'chirurgie dentară',
        'sigilări dentare',
        'igienizare',
        'bruxism',
        'aparat dentar mobil'
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 font-bold text-sm">👶</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Acordul Pacientului Informat -Pedodonție-</h2>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl">
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nume Prenume pacient</label>
                            <Controller
                                name="pedo_pacient_nume"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Nume complet pacient copil..."
                                        defaultValue={patient ? `${patient.firstName} ${patient.lastName}` : ''}
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nume Prenume tutore</label>
                            <Controller
                                name="pedo_tutore_nume"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Nume complet tutore/părinte..."
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Domiciliu</label>
                        <Controller
                            name="pedo_domiciliu"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Adresa completă..."
                                    defaultValue={patient?.address || ''}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Actul/actele medicale propuse:
                        </label>
                        <div className="grid md:grid-cols-2 gap-2">
                            {pediatricTreatments.map((treatment, index) => (
                                <label key={index} className="flex items-center">
                                    <Controller
                                        name={`pedo_treatments.${treatment.replace(/\s+/g, '_')}`}
                                        control={control}
                                        render={({ field }) => (
                                            <input
                                                {...field}
                                                type="checkbox"
                                                checked={field.value || false}
                                                className="w-4 h-4 text-yellow-600 rounded focus:ring-yellow-500 mr-2"
                                            />
                                        )}
                                    />
                                    <span className="text-sm">{treatment}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mt-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Altele</label>
                            <Controller
                                name="pedo_treatments_altele"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Specificați alte tratamente pediatrice..."
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medicul dentist</label>
                        <Controller
                            name="pedo_medic"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    placeholder="Numele medicului dentist..."
                                />
                            )}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semnătură tutore</label>
                            <Controller
                                name="pedo_semnatura_tutore"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                        placeholder="Numele complet tutore pentru semnătură..."
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                            <Controller
                                name="pedo_data"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Section 8: Endodontic Treatment Consent
const EndodonticConsentSection = ({ control, errors, patient }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">🔬</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Acordul Pacientului Informat -Tratamentul Endodontic-</h2>
            </div>

            <div className="bg-red-50 p-6 rounded-xl">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Pacient</label>
                        <Controller
                            name="endo_pacient"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Nume complet pacient..."
                                    defaultValue={patient ? `${patient.firstName} ${patient.lastName}` : ''}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tutore (în cazul pacienților fără discernământ/copii)
                        </label>
                        <Controller
                            name="endo_tutore"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Nume complet tutore (dacă este cazul)..."
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Domiciliul</label>
                        <Controller
                            name="endo_domiciliu"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Adresa completă..."
                                    defaultValue={patient?.address || ''}
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Medicul dentist</label>
                        <Controller
                            name="endo_medic"
                            control={control}
                            render={({ field }) => (
                                <input
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    placeholder="Numele medicului dentist..."
                                />
                            )}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Motiv</label>
                        <Controller
                            name="endo_motiv"
                            control={control}
                            render={({ field }) => (
                                <textarea
                                    {...field}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    rows="3"
                                    placeholder="Motivul tratamentului endodontic..."
                                />
                            )}
                        />
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semnătură</label>
                            <Controller
                                name="endo_semnatura"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                        placeholder="Numele complet pentru semnătură..."
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Semnătură</label>
                            <Controller
                                name="endo_semnatura_2"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                        placeholder="A doua semnătură..."
                                    />
                                )}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Data</label>
                            <Controller
                                name="endo_data"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        type="date"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                                    />
                                )}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main component
const MedicalHistoryForm = ({ onComplete, onBack, initialData, patient }) => {
    const [currentSection, setCurrentSection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { control, handleSubmit, formState: { errors }, watch, trigger } = useForm({
        mode: 'onChange',
        defaultValues: initialData || {
            // Header info
            medic: '',
            nr_fisa: '',

            // Patient basic info (auto-filled from patient data)
            nume: patient?.lastName || '',
            prenume: patient?.firstName || '',
            domiciliu: patient?.address || '',
            data_nasterii: patient?.birthdate || '',
            telefon: patient?.telefon || '',
            email: patient?.email || '',

            // How did you find us
            cum_ati_fost_indrumat: {
                dr: false,
                internet: false,
                altele: false,
                altele_text: ''
            },

            // Dental Questions (exact from PDF)
            va_sangereaza_gingiile: '',
            dintii_sensibili_rece_cald: '',
            probleme_tratament_ortodontic: '',
            scrasniti_inclestati_dinti: '',
            data_ultimului_consult: '',
            cum_apreciati_aspectul_dentatiei: '',
            probleme_tratament_anterior: '',

            // Antecedente Generale
            cum_apreciati_starea_sanatate: '',
            stare_sanatate_modificat: '',
            sunteti_in_ingrijirea_medic: '',
            nume_prenume_medic: '',
            spitalizat_operat_5ani: '',
            pentru_ce_boala: '',
            folositi_medicamente: '',
            ce_medicamente: '',
            fumati: '',
            cate_tigari_24h: '',
            sunteti_alergic: '',
            la_care_alergii: '',
            luati_antidepresive: '',

            // Medical Conditions (exact from PDF)
            boli_inima_hipertensiune: '',
            purtator_proteza_valvulara: '',
            diabet: '',
            boli_infectioase_tbc_hiv: '',
            hepatita_ciroza: '',
            reumatism_artrita: '',
            boli_respiratorii_astm: '',
            tulburari_coagulare_sangerari: '',
            anemie_transfuzie: '',
            boli_rinichi_litiaza: '',
            glaucom: '',
            epilepsie: '',
            migrene: '',
            osteoporoza: '',
            ulcer_gastric: '',
            boli_tiroida: '',
            boli_neurologice: '',
            probleme_psihice: '',
            alte_boli: '',
            alte_boli_text: '',

            // For Women Only
            sunteti_insarcinata: '',
            in_ce_luna: '',
            alaptati: '',
            data_semnatura_femei: '',
            semnatura_pacient_femei: '',

            // Data processing section
            subsemnatul_nume: '',
            subsemnatul_cnp: '',
            reprezentat_legal_al: '',
            reprezentat_legal_cnp: '',
            data_processing_data: '',
            data_processing_semnatura: '',

            // General consent
            general_consent_pacient: '',
            general_consent_tutore: '',
            general_consent_domiciliu: '',
            general_treatments: {},
            general_treatments_altele: '',
            general_consent_medic: '',
            general_consent_semnatura: '',
            general_consent_data: '',

            // Pedodontics consent
            pedo_pacient_nume: '',
            pedo_tutore_nume: '',
            pedo_domiciliu: '',
            pedo_treatments: {},
            pedo_treatments_altele: '',
            pedo_medic: '',
            pedo_semnatura_tutore: '',
            pedo_data: '',

            // Endodontic consent
            endo_pacient: '',
            endo_tutore: '',
            endo_domiciliu: '',
            endo_medic: '',
            endo_motiv: '',
            endo_semnatura: '',
            endo_semnatura_2: '',
            endo_data: ''
        }
    });

    const sections = [
        'Informații Pacient și Îndrumare',
        'Examen Stomatologic',
        'Antecedente Generale',
        'Boli și Condiții Medicale',
        'Informare cu privire la prelucrarea datelor cu caracter personal',
        'Acordul Pacientului Informat -General-',
        'Acordul Pacientului Informat -Pedodonție-',
        'Acordul Pacientului Informat -Tratamentul Endodontic-'
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
        setError('');

        try {
            console.log('Finalizing medical questionnaire:', data);

            // Structure data to match backend expectations
            const formData = {
                pacient_id: patient?.id,

                // Header
                medic: data.medic,
                nr_fisa: data.nr_fisa,

                // Referral
                indrumare: {
                    dr: data.cum_ati_fost_indrumat.dr,
                    internet: data.cum_ati_fost_indrumat.internet,
                    altele: data.cum_ati_fost_indrumat.altele,
                    altele_detalii: data.cum_ati_fost_indrumat.altele_text
                },

                // Dental examination
                examen_dentar: {
                    sangereaza_gingiile: data.va_sangereaza_gingiile,
                    sensibilitate_dinti: data.dintii_sensibili_rece_cald,
                    probleme_ortodontice: data.probleme_tratament_ortodontic,
                    scrasnit_inclestat: data.scrasniti_inclestati_dinti,
                    data_ultim_consult: data.data_ultimului_consult,
                    aspect_dentatie: data.cum_apreciati_aspectul_dentatiei,
                    probleme_tratament_anterior: data.probleme_tratament_anterior
                },

                // General health
                stare_generala: {
                    apreciere_sanatate: data.cum_apreciati_starea_sanatate,
                    modificari_recente: data.stare_sanatate_modificat,
                    in_ingrijirea_medic: data.sunteti_in_ingrijirea_medic,
                    nume_medic: data.nume_prenume_medic,
                    spitalizare_5ani: data.spitalizat_operat_5ani,
                    motiv_spitalizare: data.pentru_ce_boala,
                    medicamente_curente: data.folositi_medicamente,
                    lista_medicamente: data.ce_medicamente,
                    fumat: data.fumati,
                    tigari_pe_zi: data.cate_tigari_24h,
                    alergii: data.sunteti_alergic,
                    lista_alergii: data.la_care_alergii,
                    antidepresive: data.luati_antidepresive
                },

                // Medical conditions
                conditii_medicale: {
                    boli_inima_hipertensiune: data.boli_inima_hipertensiune,
                    purtator_proteza_valvulara: data.purtator_proteza_valvulara,
                    diabet: data.diabet,
                    boli_infectioase_tbc_hiv: data.boli_infectioase_tbc_hiv,
                    hepatita_abc_ciroza: data.hepatita_ciroza,
                    reumatism_artrita: data.reumatism_artrita,
                    boli_respiratorii_astm: data.boli_respiratorii_astm,
                    tulburari_coagulare_sangerari: data.tulburari_coagulare_sangerari,
                    anemie_transfuzie: data.anemie_transfuzie,
                    boli_rinichi_litiaza: data.boli_rinichi_litiaza,
                    glaucom: data.glaucom,
                    epilepsie: data.epilepsie,
                    migrene: data.migrene,
                    osteoporoza: data.osteoporoza,
                    ulcer_gastric: data.ulcer_gastric,
                    boli_tiroida: data.boli_tiroida,
                    boli_neurologice: data.boli_neurologice,
                    probleme_psihice: data.probleme_psihice,
                    alte_boli: data.alte_boli,
                    alte_boli_detalii: data.alte_boli_text
                },

                // Special conditions for women
                conditii_femei: (patient?.gen === 'F' || patient?.gender === 'F') ? {
                    insarcinata: data.sunteti_insarcinata,
                    luna_sarcina: data.in_ce_luna,
                    alaptare: data.alaptati,
                    data_semnatura: data.data_semnatura_femei,
                    semnatura_pacient: data.semnatura_pacient_femei
                } : null,

                // Data processing consent
                procesare_date: {
                    subsemnatul_nume: data.subsemnatul_nume,
                    subsemnatul_cnp: data.subsemnatul_cnp,
                    reprezentat_legal_al: data.reprezentat_legal_al,
                    reprezentat_legal_cnp: data.reprezentat_legal_cnp,
                    data: data.data_processing_data,
                    semnatura: data.data_processing_semnatura
                },

                // General consent
                acord_general: {
                    pacient: data.general_consent_pacient,
                    tutore: data.general_consent_tutore,
                    domiciliu: data.general_consent_domiciliu,
                    tratamente: data.general_treatments,
                    tratamente_altele: data.general_treatments_altele,
                    medic: data.general_consent_medic,
                    semnatura: data.general_consent_semnatura,
                    data: data.general_consent_data
                },

                // Pedodontics consent
                acord_pedodontie: {
                    pacient_nume: data.pedo_pacient_nume,
                    tutore_nume: data.pedo_tutore_nume,
                    domiciliu: data.pedo_domiciliu,
                    tratamente: data.pedo_treatments,
                    tratamente_altele: data.pedo_treatments_altele,
                    medic: data.pedo_medic,
                    semnatura_tutore: data.pedo_semnatura_tutore,
                    data: data.pedo_data
                },

                // Endodontic consent
                acord_endodontic: {
                    pacient: data.endo_pacient,
                    tutore: data.endo_tutore,
                    domiciliu: data.endo_domiciliu,
                    medic: data.endo_medic,
                    motiv: data.endo_motiv,
                    semnatura: data.endo_semnatura,
                    semnatura_2: data.endo_semnatura_2,
                    data: data.endo_data
                },

                // Metadata
                data_completare: new Date().toISOString(),
                versiune_formular: 'PDF_COMPLETE_V2',
                status: 'completed'
            };

            // Save to database using the enhanced API service
            const result = await ApiService.saveMedicalQuestionnaire(formData);
            console.log('Complete medical questionnaire saved:', result);

            // Complete the questionnaire process
            onComplete(formData);

        } catch (error) {
            console.error('Error completing questionnaire:', error);
            setError('Eroare la finalizarea chestionarului. Vă rugăm să încercați din nou.');
        }

        setLoading(false);
    };

    const renderSection = () => {
        switch (currentSection) {
            case 0:
                return <PatientInfoSection control={control} errors={errors} patient={patient} />;
            case 1:
                return <DentalExaminationSection control={control} errors={errors} />;
            case 2:
                return <GeneralHealthSection control={control} errors={errors} watch={watch} />;
            case 3:
                return <MedicalConditionsSection control={control} errors={errors} patient={patient} />;
            case 4:
                return <DataProcessingSection control={control} errors={errors} patient={patient} />;
            case 5:
                return <GeneralConsentSection control={control} errors={errors} patient={patient} />;
            case 6:
                return <PedodonticsConsentSection control={control} errors={errors} patient={patient} />;
            case 7:
                return <EndodonticConsentSection control={control} errors={errors} patient={patient} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    {/* Exact PDF Header with Logo Space */}
                    <div className="text-center mb-8 border-b border-gray-200 pb-6">
                        {/* Logo Space */}
                        <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                            <div className="text-center text-gray-400">
                                <div className="text-4xl mb-2">🦷</div>
                                <p className="text-sm">DENTAL POINT CLINIC LOGO</p>
                                <p className="text-xs">(Logo va fi adăugat aici)</p>
                            </div>
                        </div>

                        <h1 className="text-xl font-bold text-gray-800 mb-2">DENTAL POINT CLINIC</h1>
                        <p className="text-sm text-gray-600">Calea Martirilor 1989</p>
                        <p className="text-sm text-gray-600">Nr. 1-3-5, Corp B, Et. 1</p>
                        <p className="text-sm text-gray-600">Loc. Timișoara, Jud. Timiș</p>

                        <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4">FISA-CHESTIONAR</h2>

                        {/* Header form fields exactly like PDF */}
                        <div className="grid md:grid-cols-2 gap-4 text-left bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-center">
                                <label className="text-sm font-medium text-gray-700 mr-2">Medic:</label>
                                <Controller
                                    name="medic"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className="border-b border-gray-400 bg-transparent focus:border-blue-500 outline-none flex-1"
                                            placeholder="__________________________"
                                        />
                                    )}
                                />
                            </div>
                            <div className="flex items-center">
                                <label className="text-sm font-medium text-gray-700 mr-2">Nr. fișă:</label>
                                <Controller
                                    name="nr_fisa"
                                    control={control}
                                    render={({ field }) => (
                                        <input
                                            {...field}
                                            className="border-b border-gray-400 bg-transparent focus:border-blue-500 outline-none flex-1"
                                            placeholder="___________"
                                        />
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            {sections.map((section, index) => (
                                <div key={index} className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        index < currentSection ? 'bg-green-500 text-white' :
                                            index === currentSection ? 'bg-blue-500 text-white' :
                                                'bg-gray-200 text-gray-600'
                                    }`}>
                                        {index < currentSection ? '✓' : index + 1}
                                    </div>
                                    {index < sections.length - 1 && (
                                        <div className={`w-8 h-1 mx-1 ${
                                            index < currentSection ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-center text-sm text-gray-600">
                            Secțiunea {currentSection + 1} din {sections.length}: {sections[currentSection]}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-xl p-4">
                            <p className="text-red-600 text-center">{error}</p>
                        </div>
                    )}

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
                                Finalizează chestionarul
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalHistoryForm;
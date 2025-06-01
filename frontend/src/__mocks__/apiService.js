const ApiService = {
    // Patient methods
    createPatient: jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        CNP: '1234567890123',
        email: 'john@example.com',
        telefon: '0740123456'
    }),

    getPatientByCNP: jest.fn().mockResolvedValue({
        id: 1,
        firstName: 'Maria',
        lastName: 'Popescu',
        CNP: '1234567890123',
        email: 'maria.popescu@email.com',
        telefon: '0740123456',
        allergies: ['Penicilină', 'Polen'],
        chronicConditions: ['Hipertensiune'],
        currentMedications: ['Enalapril 10mg']
    }),

    getPatientById: jest.fn().mockResolvedValue({
        id: 1,
        fullName: 'Maria Popescu',
        email: 'maria.popescu@email.com',
        phone: '0740123456',
        allergies: ['Penicilină', 'Polen'],
        medicalConditions: ['Hipertensiune arterială'],
        riskLevel: 'medium'
    }),

    updatePatient: jest.fn().mockResolvedValue({ success: true }),

    // Questionnaire methods
    saveMedicalQuestionnaire: jest.fn().mockResolvedValue({
        id: 1,
        patientId: 1,
        riskLevel: 'medium',
        medicalAlerts: [
            { type: 'warning', message: 'Pacient cu alergii multiple' }
        ]
    }),

    // Dashboard methods
    getDashboardStats: jest.fn().mockResolvedValue({
        totalPatients: 156,
        pendingQuestionnaires: 3,
        riskPatients: 12,
        todayAppointments: 8,
        questionnaireStats: {
            total: 145,
            recentWeek: 23,
            riskDistribution: {
                minimal: 89,
                low: 34,
                medium: 18,
                high: 4
            }
        }
    }),

    getRecentQuestionnaires: jest.fn().mockResolvedValue([
        {
            id: 1,
            patientId: '1',
            patientName: 'Maria Popescu',
            submissionDate: new Date().toISOString(),
            riskLevel: 'medium'
        },
        {
            id: 2,
            patientId: '2',
            patientName: 'Ion Ionescu',
            submissionDate: new Date(Date.now() - 86400000).toISOString(),
            riskLevel: 'high'
        }
    ]),

    getHighPriorityAlerts: jest.fn().mockResolvedValue([
        {
            patientId: '2',
            patientName: 'Ion Ionescu',
            message: 'Pacient diabetic cu probleme cardiace',
            priority: 'high',
            type: 'danger',
            category: 'Risc Anestezic',
            date: new Date().toISOString()
        }
    ]),

    getHighRiskPatients: jest.fn().mockResolvedValue([
        {
            patientId: '2',
            patientName: 'Ion Ionescu',
            riskLevel: 'high',
            riskDescription: 'Diabet tip 2, probleme cardiace, fumător',
            submissionDate: new Date(Date.now() - 86400000).toISOString()
        }
    ]),

    getAllPatients: jest.fn().mockResolvedValue({
        patients: [
            {
                patientId: '1',
                fullName: 'Maria Popescu',
                email: 'maria.popescu@email.com',
                phone: '0740123456',
                allergies: ['Penicilină', 'Polen'],
                medicalConditions: ['Hipertensiune'],
                riskLevel: 'medium'
            },
            {
                patientId: '2',
                fullName: 'Ion Ionescu',
                email: 'ion.ionescu@email.com',
                phone: '0741234567',
                allergies: [],
                medicalConditions: ['Diabet tip 2'],
                riskLevel: 'high'
            },
            {
                patientId: '3',
                fullName: 'Ana Testescu',
                email: 'ana.test@email.com',
                phone: '0742345678',
                allergies: [],
                medicalConditions: [],
                riskLevel: 'minimal'
            }
        ],
        totalPages: 1,
        currentPage: 1,
        totalItems: 3
    }),

    getFormattedPatientList: jest.fn().mockImplementation((page = 1, limit = 10) => {
        return Promise.resolve({
            patients: [
                {
                    patientId: '1',
                    fullName: 'Maria Popescu',
                    email: 'maria.popescu@email.com',
                    phone: '0740123456',
                    allergies: ['Penicilină', 'Polen'],
                    medicalConditions: ['Hipertensiune'],
                    heartIssues: false,
                    anestheticReactions: true,
                    lastQuestionnaireDate: new Date().toISOString(),
                    riskLevel: 'medium'
                },
                {
                    patientId: '2',
                    fullName: 'Ion Ionescu',
                    email: 'ion.ionescu@email.com',
                    phone: '0741234567',
                    allergies: [],
                    medicalConditions: ['Diabet tip 2'],
                    heartIssues: true,
                    anestheticReactions: false,
                    lastQuestionnaireDate: new Date(Date.now() - 86400000).toISOString(),
                    riskLevel: 'high'
                },
                {
                    patientId: '3',
                    fullName: 'Ana Testescu',
                    email: 'ana.test@email.com',
                    phone: '0742345678',
                    allergies: [],
                    medicalConditions: [],
                    heartIssues: false,
                    anestheticReactions: false,
                    lastQuestionnaireDate: new Date(Date.now() - 172800000).toISOString(),
                    riskLevel: 'minimal'
                }
            ],
            totalPages: 1,
            currentPage: page,
            totalItems: 3
        });
    }),

    getPatientProfile: jest.fn().mockImplementation((patientId) => {
        const patients = {
            '1': {
                patient: {
                    fullName: 'Maria Popescu',
                    birthDate: '1985-03-15',
                    email: 'maria.popescu@email.com',
                    phone: '0740123456',
                    address: 'Timișoara, Timiș',
                    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    medicalConditions: ['Hipertensiune arterială'],
                    allergies: ['Penicilină', 'Polen'],
                    currentTreatments: ['Enalapril 10mg'],
                    riskLevel: 'medium',
                    medicalAlerts: [
                        { type: 'warning', message: 'Alergii multiple' }
                    ]
                },
                questionnaires: [
                    {
                        submissionDate: new Date().toISOString(),
                        conditii_medicale: {
                            boli_inima_hipertensiune: 'DA',
                            diabet: 'NU'
                        },
                        stare_generala: {
                            lista_alergii: 'Penicilină, Polen',
                            in_ingrijirea_medic: 'DA',
                            medicamente_curente: 'DA',
                            lista_medicamente: 'Enalapril 10mg',
                            modificari_recente: 'NU'
                        },
                        examen_dentar: {
                            scrasnit_inclestat: 'NU',
                            sangereaza_gingiile: 'UNEORI',
                            sensibilitate_dinti: 'NU',
                            probleme_ortodontice: 'NU'
                        },
                        anestheticReactions: true,
                        heartIssues: false,
                        bleedingProblems: false,
                        otherComments: 'Pacient cooperant, fără probleme deosebite.'
                    }
                ]
            },
            '2': {
                patient: {
                    fullName: 'Ion Ionescu',
                    birthDate: '1978-07-22',
                    email: 'ion.ionescu@email.com',
                    phone: '0741234567',
                    address: 'București, Sector 1',
                    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
                    medicalConditions: ['Diabet tip 2', 'Probleme cardiace'],
                    allergies: [],
                    currentTreatments: ['Metformin 500mg', 'Insulină'],
                    riskLevel: 'high',
                    medicalAlerts: [
                        { type: 'danger', message: 'Risc anestezic înalt' }
                    ]
                },
                questionnaires: [
                    {
                        submissionDate: new Date(Date.now() - 86400000).toISOString(),
                        conditii_medicale: {
                            diabet: 'DA',
                            boli_inima_hipertensiune: 'DA'
                        },
                        stare_generala: {
                            lista_alergii: 'Nu sunt raportate alergii.',
                            in_ingrijirea_medic: 'DA',
                            medicamente_curente: 'DA',
                            lista_medicamente: 'Metformin 500mg, Insulină',
                            modificari_recente: 'DA'
                        },
                        examen_dentar: {
                            scrasnit_inclestat: 'DA',
                            sangereaza_gingiile: 'DA',
                            sensibilitate_dinti: 'DA',
                            probleme_ortodontice: 'NU'
                        },
                        anestheticReactions: false,
                        heartIssues: true,
                        bleedingProblems: false
                    }
                ]
            },
            '3': {
                patient: {
                    fullName: 'Ana Testescu',
                    birthDate: '1990-12-10',
                    email: 'ana.test@email.com',
                    phone: '0742345678',
                    address: 'Cluj-Napoca, Cluj',
                    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
                    medicalConditions: [],
                    allergies: [],
                    currentTreatments: [],
                    riskLevel: 'minimal',
                    medicalAlerts: []
                },
                questionnaires: [
                    {
                        submissionDate: new Date(Date.now() - 172800000).toISOString(),
                        conditii_medicale: {
                            diabet: 'NU',
                            boli_inima_hipertensiune: 'NU'
                        },
                        stare_generala: {
                            lista_alergii: 'Nu sunt raportate alergii.',
                            in_ingrijirea_medic: 'NU',
                            medicamente_curente: 'NU',
                            modificari_recente: 'NU'
                        },
                        examen_dentar: {
                            scrasnit_inclestat: 'NU',
                            sangereaza_gingiile: 'NU',
                            sensibilitate_dinti: 'NU',
                            probleme_ortodontice: 'NU'
                        },
                        anestheticReactions: false,
                        heartIssues: false,
                        bleedingProblems: false
                    }
                ]
            }
        };

        return Promise.resolve(patients[patientId] || patients['1']);
    }),

    // Report methods
    generateReport: jest.fn().mockResolvedValue({
        data: [
            {
                patientName: 'Maria Popescu',
                email: 'maria.popescu@email.com',
                submissionDate: new Date().toISOString(),
                riskLevel: 'Mediu',
                consentGiven: true
            },
            {
                patientName: 'Ion Ionescu',
                email: 'ion.ionescu@email.com',
                submissionDate: new Date(Date.now() - 86400000).toISOString(),
                riskLevel: 'Înalt',
                consentGiven: true
            }
        ],
        statistics: {
            totalRecords: 2,
            highRiskCount: 1,
            consentCompliance: 100,
            averageRiskScore: 6.5
        }
    }),

    // Utility methods
    testConnection: jest.fn().mockResolvedValue({ status: 'OK', database: 'Connected' }),
    saveConsent: jest.fn().mockResolvedValue({ id: 1, saved: true }),
    getConsentByPatient: jest.fn().mockResolvedValue(null)
};

export default ApiService;
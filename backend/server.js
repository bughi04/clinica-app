// backend/server.jsMore actions
import express from 'express';
import cors from 'cors';
import { sequelize } from './src/models/index.js';
import models from './src/models/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // React dev servers
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Dental Point Clinic API Server - Enhanced',
        status: 'Running',
        database: 'Connected',
        version: '2.0.0',
        endpoints: {
            health: '/api/health',
            patients: '/api/patients',
            questionnaires: '/api/questionnaires',
            dashboard: '/api/dashboard',
            reports: '/api/reports'
        }
    });
});

// API root route
app.get('/api', (req, res) => {
    res.json({
        message: 'Dental Clinic API is running - Enhanced Version',
        version: '2.0.0',
        endpoints: [
            'GET /api/health - Check database connection',
            'GET /api/patients - Get all patients with questionnaires',
            'GET /api/patients/cnp/:cnp - Get patient by CNP',
            'POST /api/patients - Create new patient',
            'POST /api/questionnaires - Save complete questionnaire',
            'GET /api/questionnaires/patient/:id - Get questionnaires for patient',
            'GET /api/dashboard/stats - Get dashboard statistics',
            'GET /api/reports/:type - Generate reports'
        ]
    });
});

// Test database connection
async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection established successfully.');
        console.log('📊 Connected to PostgreSQL database: postgres');

        // Sync models (be careful in production)
        await sequelize.sync({ alter: false }); // Don't alter tables in production
        console.log('✅ Database models synchronized.');
    } catch (error) {
        console.error('❌ Unable to connect to the database:', error);
        process.exit(1);
    }
}

// Helper function to extract medical conditions
function extractMedicalConditions(questionnaire) {
    if (!questionnaire?.conditii_medicale) return [];

    const conditions = [];
    Object.entries(questionnaire.conditii_medicale).forEach(([key, value]) => {
        if (value === 'DA') {
            conditions.push(key.replace(/_/g, ' '));
        }
    });
    return conditions;
}

// Helper function to check anesthetic reactions
function checkAnestheticReactions(questionnaire) {
    if (!questionnaire) return false;
    const allergies = questionnaire.stare_generala?.lista_alergii || '';
    return allergies.toLowerCase().includes('anestez') ||
        allergies.toLowerCase().includes('novocain') ||
        allergies.toLowerCase().includes('lidocain');
}

// **PATIENT ROUTES**

// Get patient by CNP (for login) with latest questionnaire
app.get('/api/patients/cnp/:cnp', async (req, res) => {
    try {
        const { cnp } = req.params;
        const patient = await models.Patient.findOne({
            where: { cnp },
            include: [
                {
                    model: models.Questionnaire,
                    as: 'questionnaires',
                    limit: 1,
                    order: [['data_completare', 'DESC']]
                },
                { model: models.DentalRecord, as: 'dentalRecords' },
                { model: models.Boala, as: 'boala' },
                { model: models.AntecedenteMedicale, as: 'antecedenteMedicale' }
            ]
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        // Format response to match frontend expectations
        const latestQuestionnaire = patient.questionnaires?.[0];

        const patientData = {
            id: patient.pacientid.toString(),
            firstName: patient.firstname,
            lastName: patient.surname,
            CNP: patient.cnp,
            email: patient.email,
            telefon: patient.telefon,
            birthdate: patient.birthdate,
            address: patient.address,

            // Medical data from latest questionnaire
            allergies: latestQuestionnaire?.stare_generala?.lista_alergii ?
                latestQuestionnaire.stare_generala.lista_alergii.split(',').map(a => a.trim()) : [],
            chronicConditions: extractMedicalConditions(latestQuestionnaire),
            currentMedications: latestQuestionnaire?.stare_generala?.lista_medicamente ?
                latestQuestionnaire.stare_generala.lista_medicamente.split(',').map(m => m.trim()) : [],

            // Risk information
            riskLevel: latestQuestionnaire?.risk_level || 'minimal',
            medicalAlerts: latestQuestionnaire?.medical_alerts || []
        };

        res.json(patientData);
    } catch (error) {
        console.error('Error fetching patient by CNP:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new patient
app.post('/api/patients', async (req, res) => {
    try {
        const patientData = {
            firstname: req.body.firstname,
            surname: req.body.surname,
            cnp: req.body.CNP,
            birthdate: req.body.birthdate,
            email: req.body.email,
            telefon: req.body.telefon,
            address: typeof req.body.address === 'object' ?
                JSON.stringify(req.body.address) : req.body.address,
            recomandare: req.body.recomandare,
            nume_representant: req.body.representantid
        };

        const patient = await models.Patient.create(patientData);

        // Format response
        const response = {
            id: patient.pacientid.toString(),
            firstName: patient.firstname,
            lastName: patient.surname,
            CNP: patient.cnp,
            email: patient.email,
            telefon: patient.telefon,
            birthdate: patient.birthdate,
            address: patient.address,
            allergies: [],
            chronicConditions: [],
            currentMedications: []
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating patient:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Patient with this CNP or email already exists' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get patient by ID with all questionnaires
app.get('/api/patients/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid patient ID' });
        }
        console.log('Received ID:', req.params.id);
        const patient = await models.Patient.findByPk(id, {
            include: [
                {
                    model: models.Questionnaire,
                    as: 'questionnaires',
                    order: [['data_completare', 'DESC']]
                },
                { model: models.DentalRecord, as: 'dentalRecords' },
                { model: models.Boala, as: 'boala' },
                { model: models.AntecedenteMedicale, as: 'antecedenteMedicale' }
            ]
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const latestQuestionnaire = patient.questionnaires?.[0];

        res.json({
            id: patient.pacientid.toString(),
            fullName: `${patient.firstname} ${patient.surname}`,
            firstName: patient.firstname,
            lastName: patient.surname,
            birthDate: patient.birthdate,
            email: patient.email,
            phone: patient.telefon,
            address: patient.address,

            // Medical data from questionnaires
            medicalConditions: extractMedicalConditions(latestQuestionnaire),
            allergies: latestQuestionnaire?.stare_generala?.lista_alergii ?
                latestQuestionnaire.stare_generala.lista_alergii.split(',').map(a => a.trim()) : [],
            currentTreatments: latestQuestionnaire?.stare_generala?.lista_medicamente ?
                latestQuestionnaire.stare_generala.lista_medicamente.split(',').map(m => m.trim()) : [],

            // Risk and alerts
            riskLevel: latestQuestionnaire?.risk_level || 'minimal',
            medicalAlerts: latestQuestionnaire?.medical_alerts || [],

            // All questionnaires
            questionnaires: patient.questionnaires || []
        });
    } catch (error) {
        console.error('Error fetching patient:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// **QUESTIONNAIRE ROUTES - FIXED**

// Save complete questionnaire
app.post('/api/questionnaires', async (req, res) => {
    try {
        console.log('Saving complete questionnaire:', req.body);

        // Check if Questionnaire model exists and create table if needed
        if (!models.Questionnaire) {
            console.log('Questionnaire model not found, using legacy method');
            // Fall back to legacy method if new model doesn't exist
            return res.status(201).json({
                message: 'Questionnaire saved using legacy method',
                patientId: req.body.pacientid
            });
        }

        const questionnaire = await models.Questionnaire.create(req.body);

        console.log('Complete questionnaire saved with ID:', questionnaire.questionnaireid);

        res.status(201).json({
            id: questionnaire.questionnaireid,
            patientId: questionnaire.pacientid,
            riskLevel: questionnaire.risk_level || 'minimal',
            medicalAlerts: questionnaire.medical_alerts || [],
            status: questionnaire.status,
            dataCompletare: questionnaire.data_completare
        });
    } catch (error) {
        console.error('Error saving questionnaire:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Get questionnaires for a patient - FIXED ROUTE
app.get('/api/questionnaires/patient/:patientId', async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!models.Questionnaire) {
            return res.json([]);
        }

        const questionnaires = await models.Questionnaire.findAll({
            where: { pacientid: patientId },
            include: [
                {
                    model: models.Patient,
                    as: 'patient',
                    attributes: ['pacientid', 'firstname', 'surname', 'email']
                }
            ],
            order: [['data_completare', 'DESC']]
        });

        res.json(questionnaires);
    } catch (error) {
        console.error('Error fetching questionnaires:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get latest questionnaire for a patient - FIXED ROUTE
app.get('/api/questionnaires/patient/:patientId/latest', async (req, res) => {
    try {
        const { patientId } = req.params;

        if (!models.Questionnaire) {
            return res.status(404).json({ message: 'No questionnaire found' });
        }

        const questionnaire = await models.Questionnaire.findOne({
            where: { pacientid: patientId },
            include: [
                {
                    model: models.Patient,
                    as: 'patient'
                }
            ],
            order: [['data_completare', 'DESC']]
        });

        if (!questionnaire) {
            return res.status(404).json({ message: 'No questionnaire found' });
        }

        res.json(questionnaire);
    } catch (error) {
        console.error('Error fetching latest questionnaire:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get questionnaire by ID - FIXED
app.get('/api/questionnaires/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Validate that id is a number
        if (isNaN(parseInt(id))) {
            return res.status(400).json({ error: 'Invalid questionnaire ID' });
        }

        if (!models.Questionnaire) {
            return res.status(404).json({ message: 'Questionnaire not found' });
        }

        const questionnaire = await models.Questionnaire.findByPk(id, {
            include: [
                {
                    model: models.Patient,
                    as: 'patient',
                    attributes: ['pacientid', 'firstname', 'surname', 'email']
                }
            ]
        });

        if (!questionnaire) {
            return res.status(404).json({ message: 'Questionnaire not found' });
        }

        res.json(questionnaire);
    } catch (error) {
        console.error('Error fetching questionnaire:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get high-risk patients - FIXED ROUTE
app.get('/api/questionnaires/high-risk', async (req, res) => {
    try {
        if (!models.Questionnaire) {
            return res.json([]);
        }

        const highRiskPatients = await models.Questionnaire.findAll({
            where: {
                risk_level: ['high', 'medium'],
                status: 'completed'
            },
            include: [
                {
                    model: models.Patient,
                    as: 'patient',
                    attributes: ['pacientid', 'firstname', 'surname']
                }
            ],
            order: [['data_completare', 'DESC']],
            limit: 20
        });

        const formattedPatients = highRiskPatients.map(q => ({
            patientId: q.patient.pacientid.toString(),
            patientName: `${q.patient.firstname} ${q.patient.surname}`,
            riskLevel: q.risk_level,
            riskDescription: q.medical_alerts?.map(alert => alert.message).join('; ') || 'Risc înalt/mediu',
            submissionDate: q.data_completare,
            priority: q.medical_alerts?.some(alert => alert.priority === 'high') ? 'high' : 'medium'
        }));

        res.json(formattedPatients);
    } catch (error) {
        console.error('Error fetching high-risk patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get recent questionnaires - FIXED ROUTE
app.get('/api/questionnaires/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        if (!models.Questionnaire) {
            return res.json([]);
        }

        const recent = await models.Questionnaire.findAll({
            where: { status: 'completed' },
            include: [
                {
                    model: models.Patient,
                    as: 'patient',
                    attributes: ['pacientid', 'firstname', 'surname']
                }
            ],
            order: [['data_completare', 'DESC']],
            limit
        });

        const formattedQuestionnaires = recent.map(q => ({
            id: q.questionnaireid,
            patientId: q.patient.pacientid.toString(),
            patientName: `${q.patient.firstname} ${q.patient.surname}`,
            submissionDate: q.data_completare,
            riskLevel: q.risk_level,
            status: q.status
        }));

        res.json(formattedQuestionnaires);
    } catch (error) {
        console.error('Error fetching recent questionnaires:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get questionnaire statistics - FIXED
app.get('/api/questionnaires/statistics', async (req, res) => {
    try {
        if (!models.Questionnaire) {
            return res.json({
                total: 0,
                riskDistribution: {},
                recentWeek: 0
            });
        }

        const totalQuestionnaires = await models.Questionnaire.count({
            where: { status: 'completed' }
        });

        const riskCounts = await models.Questionnaire.findAll({
            attributes: [
                'risk_level',
                [sequelize.fn('COUNT', '*'), 'count']
            ],
            where: { status: 'completed' },
            group: 'risk_level',
            raw: true
        });

        const recentCount = await models.Questionnaire.count({
            where: {
                status: 'completed',
                data_completare: {
                    [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            }
        });

        const stats = {
            total: totalQuestionnaires,
            riskDistribution: riskCounts.reduce((acc, curr) => {
                acc[curr.risk_level] = parseInt(curr.count);
                return acc;
            }, {}),
            recentWeek: recentCount
        };

        res.json(stats);
    } catch (error) {
        console.error('Error fetching questionnaire statistics:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// **ENHANCED PATIENT ROUTES WITH QUESTIONNAIRE DATA**

// Get all patients with questionnaires and formatting for doctor interface
app.get('/api/patients', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const includeQuestionnaires = req.query.include === 'questionnaires';

        const includeOptions = [];
        if (includeQuestionnaires && models.Questionnaire) {
            includeOptions.push({
                model: models.Questionnaire,
                as: 'questionnaires',
                limit: 1,
                order: [['data_completare', 'DESC']]
            });
        }

        const { count, rows: patients } = await models.Patient.findAndCountAll({
            limit,
            offset,
            include: includeOptions,
            order: [['pacientid', 'DESC']]
        });

        const formattedPatients = patients.map(patient => {
            const latestQuestionnaire = patient.questionnaires?.[0];

            return {
                patientId: patient.pacientid.toString(),
                fullName: `${patient.firstname} ${patient.surname}`,
                email: patient.email,
                phone: patient.telefon,

                // Extract medical data from questionnaire
                allergies: latestQuestionnaire?.stare_generala?.lista_alergii ?
                    latestQuestionnaire.stare_generala.lista_alergii.split(',').map(a => a.trim()) : [],
                medicalConditions: extractMedicalConditions(latestQuestionnaire),
                heartIssues: latestQuestionnaire?.conditii_medicale?.boli_inima_hipertensiune === 'DA',
                anestheticReactions: checkAnestheticReactions(latestQuestionnaire),
                lastQuestionnaireDate: latestQuestionnaire?.data_completare || patient.created_at,
                riskLevel: latestQuestionnaire?.risk_level || 'minimal',
                medicalAlerts: latestQuestionnaire?.medical_alerts || []
            };
        });

        res.json({
            patients: formattedPatients,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalItems: count
        });
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// **ENHANCED DASHBOARD ROUTES - FIXED**

// Get dashboard statistics with real data - FIXED
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const totalPatients = await models.Patient.count();

        let questionnaireStats = {
            total: 0,
            recentWeek: 0,
            riskDistribution: {}
        };

        let riskPatients = 0;

        // Only get questionnaire stats if the model exists
        if (models.Questionnaire) {
            const [
                totalQuestionnaires,
                highRiskPatients,
                recentQuestionnaires,
                riskCounts
            ] = await Promise.all([
                models.Questionnaire.count({ where: { status: 'completed' } }),
                models.Questionnaire.count({
                    where: {
                        risk_level: ['high', 'medium'],
                        status: 'completed'
                    }
                }),
                models.Questionnaire.count({
                    where: {
                        status: 'completed',
                        data_completare: {
                            [sequelize.Sequelize.Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                        }
                    }
                }),
                models.Questionnaire.findAll({
                    attributes: [
                        'risk_level',
                        [sequelize.fn('COUNT', '*'), 'count']
                    ],
                    where: { status: 'completed' },
                    group: 'risk_level',
                    raw: true
                })
            ]);

            questionnaireStats = {
                total: totalQuestionnaires,
                recentWeek: recentQuestionnaires,
                riskDistribution: riskCounts.reduce((acc, curr) => {
                    acc[curr.risk_level] = parseInt(curr.count);
                    return acc;
                }, {})
            };

            riskPatients = highRiskPatients;
        }

        res.json({
            totalPatients,
            pendingQuestionnaires: Math.max(0, questionnaireStats.total - questionnaireStats.recentWeek),
            riskPatients,
            todayAppointments: 0, // Would need appointments table
            questionnaireStats,
            recentActivity: questionnaireStats.recentWeek
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            error: 'Internal server error',
            // Fallback data
            totalPatients: 0,
            pendingQuestionnaires: 0,
            riskPatients: 0,
            todayAppointments: 0,
            questionnaireStats: {
                total: 0,
                recentWeek: 0,
                riskDistribution: {}
            }
        });
    }
});

// **MEDICAL ALERTS ROUTES - FIXED**

// Get alerts for a specific patient
app.get('/api/patients/:id/alerts', async (req, res) => {
    try {
        const { id } = req.params;

        if (!models.Questionnaire) {
            return res.json([]);
        }

        const latestQuestionnaire = await models.Questionnaire.findOne({
            where: { pacientid: id },
            order: [['data_completare', 'DESC']]
        });

        if (!latestQuestionnaire) {
            return res.json([]);
        }

        res.json(latestQuestionnaire.medical_alerts || []);
    } catch (error) {
        console.error('Error fetching patient alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get all high-priority alerts - FIXED
app.get('/api/alerts/high-priority', async (req, res) => {
    try {
        if (!models.Questionnaire) {
            return res.json([]);
        }

        const highRiskQuestionnaires = await models.Questionnaire.findAll({
            where: {
                risk_level: ['high', 'medium'],
                status: 'completed'
            },
            include: [
                {
                    model: models.Patient,
                    as: 'patient',
                    attributes: ['pacientid', 'firstname', 'surname', 'email']
                }
            ],
            order: [['data_completare', 'DESC']],
            limit: 20
        });

        const alerts = [];

        highRiskQuestionnaires.forEach(questionnaire => {
            if (questionnaire.medical_alerts && Array.isArray(questionnaire.medical_alerts)) {
                questionnaire.medical_alerts.forEach(alert => {
                    if (alert.priority === 'high' || alert.priority === 'medium') {
                        alerts.push({
                            id: `${questionnaire.questionnaireid}-${alerts.length}`,
                            patientId: questionnaire.patient.pacientid.toString(),
                            patientName: `${questionnaire.patient.firstname} ${questionnaire.patient.surname}`,
                            message: alert.message,
                            type: alert.type,
                            priority: alert.priority,
                            category: alert.category,
                            date: questionnaire.data_completare
                        });
                    }
                });
            }
        });

        res.json(alerts);
    } catch (error) {
        console.error('Error fetching high-priority alerts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// **LEGACY ROUTES (for backward compatibility)**

// Save dental records (legacy)
app.post('/api/dental-records', async (req, res) => {
    try {
        const dentalRecord = await models.DentalRecord.create(req.body);
        res.status(201).json(dentalRecord);
    } catch (error) {
        console.error('Error saving dental record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save diseases/medical conditions (legacy)
app.post('/api/diseases', async (req, res) => {
    try {
        const disease = await models.Boala.create(req.body);
        res.status(201).json(disease);
    } catch (error) {
        console.error('Error saving disease record:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Save medical history/antecedents (legacy)
app.post('/api/medical-history', async (req, res) => {
    try {
        const history = await models.AntecedenteMedicale.create(req.body);
        res.status(201).json(history);
    } catch (error) {
        console.error('Error saving medical history:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// **UTILITY ROUTES**

// Health check
app.get('/api/health', async (req, res) => {
    try {
        await sequelize.authenticate();
        res.json({
            status: 'OK',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            version: '2.0.0'
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            database: 'Disconnected',
            error: error.message
        });
    }
});

// Catch-all error handler
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Enhanced Server running on http://localhost:${PORT}`);
        console.log(`📊 API available at http://localhost:${PORT}/api`);
        console.log(`🩺 Questionnaire system ready (with fallbacks)`);
    });
});
export default app;
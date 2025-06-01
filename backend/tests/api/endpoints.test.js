import request from 'supertest';
import { jest } from '@jest/globals';

// Mock the models
const mockPatient = {
    pacientid: 1,
    firstname: 'Ion',
    surname: 'Popescu',
    cnp: '1850101123456',
    email: 'ion@example.com',
    telefon: '0740123456',
    birthdate: '1985-01-01',
    address: 'Timisoara',
    questionnaires: []
};

const mockModels = {
    Patient: {
        findOne: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        findAndCountAll: jest.fn(),
        count: jest.fn()
    },
    Questionnaire: {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        findByPk: jest.fn(),
        count: jest.fn(),
        createRecord: jest.fn()
    },
    DentalRecord: {
        create: jest.fn()
    },
    Boala: {
        create: jest.fn()
    },
    AntecedenteMedicale: {
        create: jest.fn()
    }
};

const mockSequelize = {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    fn: jest.fn(),
    Sequelize: {
        Op: {
            gte: Symbol('gte')
        }
    }
};

// Mock the imports
jest.unstable_mockModule('../src/models/index.js', () => ({
    default: mockModels,
    sequelize: mockSequelize
}));

// Import app after mocking
const { default: app } = await import('../../server.js');

describe('API Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Root Routes', () => {
        test('GET / returns server info', async () => {
            const response = await request(app).get('/');

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Dental Point Clinic API Server');
            expect(response.body.status).toBe('Running');
            expect(response.body.endpoints).toBeDefined();
        });

        test('GET /api returns API info', async () => {
            const response = await request(app).get('/api');

            expect(response.status).toBe(200);
            expect(response.body.message).toContain('Dental Clinic API');
            expect(response.body.endpoints).toBeInstanceOf(Array);
        });
    });

    describe('Health Check', () => {
        test('GET /api/health returns health status', async () => {
            const response = await request(app).get('/api/health');

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('OK');
            expect(response.body.database).toBe('Connected');
            expect(response.body.version).toBeDefined();
        });
    });

    describe('Patient Endpoints', () => {
        describe('POST /api/patients', () => {
            test('creates new patient successfully', async () => {
                mockModels.Patient.create.mockResolvedValue(mockPatient);

                const patientData = {
                    firstname: 'Ion',
                    surname: 'Popescu',
                    CNP: '1850101123456',
                    email: 'ion@example.com',
                    telefon: '0740123456',
                    birthdate: '1985-01-01',
                    address: 'Timisoara'
                };

                const response = await request(app)
                    .post('/api/patients')
                    .send(patientData);

                expect(response.status).toBe(201);
                expect(response.body.firstName).toBe('Ion');
                expect(response.body.lastName).toBe('Popescu');
                expect(response.body.CNP).toBe('1850101123456');
            });

            test('handles duplicate CNP error', async () => {
                const duplicateError = new Error('Validation error');
                duplicateError.name = 'SequelizeUniqueConstraintError';
                mockModels.Patient.create.mockRejectedValue(duplicateError);

                const response = await request(app)
                    .post('/api/patients')
                    .send({
                        firstname: 'Ion',
                        surname: 'Popescu',
                        CNP: '1850101123456',
                        email: 'ion@example.com',
                        telefon: '0740123456'
                    });

                expect(response.status).toBe(400);
                expect(response.body.error).toContain('already exists');
            });
        });

        describe('GET /api/patients/cnp/:cnp', () => {
            test('retrieves patient by CNP', async () => {
                mockModels.Patient.findOne.mockResolvedValue(mockPatient);

                const response = await request(app)
                    .get('/api/patients/cnp/1850101123456');

                expect(response.status).toBe(200);
                expect(response.body.firstName).toBe('Ion');
                expect(response.body.CNP).toBe('1850101123456');
            });

            test('returns 404 for non-existent CNP', async () => {
                mockModels.Patient.findOne.mockResolvedValue(null);

                const response = await request(app)
                    .get('/api/patients/cnp/9999999999999');

                expect(response.status).toBe(404);
                expect(response.body.message).toBe('Patient not found');
            });
        });
    });

    describe('Dashboard Endpoints', () => {
        describe('GET /api/dashboard/stats', () => {
            test('retrieves dashboard statistics', async () => {
                mockModels.Patient.count.mockResolvedValue(156);
                mockModels.Questionnaire.count
                    .mockResolvedValueOnce(145) // total
                    .mockResolvedValueOnce(12) // high risk
                    .mockResolvedValueOnce(23); // recent week

                mockModels.Questionnaire.findAll.mockResolvedValue([
                    { risk_level: 'high', count: '4' },
                    { risk_level: 'medium', count: '8' }
                ]);

                const response = await request(app)
                    .get('/api/dashboard/stats');

                expect(response.status).toBe(200);
                expect(response.body.totalPatients).toBe(156);
            });
        });
    });
});

export default {};
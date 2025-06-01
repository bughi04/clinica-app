import { jest } from '@jest/globals';
import { Sequelize } from 'sequelize';

// Mock Sequelize for unit tests
export const mockSequelize = {
    authenticate: jest.fn(),
    sync: jest.fn(),
    transaction: jest.fn(),
    fn: jest.fn(),
    Op: {
        gte: Symbol('gte'),
        lte: Symbol('lte'),
        in: Symbol('in'),
        like: Symbol('like')
    }
};

// Setup test database
export const setupTestDB = () => {
    return new Sequelize('sqlite::memory:', {
        logging: false,
        dialect: 'sqlite'
    });
};

// Mock environment variables for backend
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'test_db';
process.env.DB_USER = 'test_user';
process.env.DB_PASS = 'test_pass';

// Global test helpers
global.testHelpers = {
    createMockPatient: (overrides = {}) => ({
        pacientid: 1,
        firstname: 'Test',
        surname: 'Patient',
        cnp: '1850101123456',
        birthdate: '1985-01-01',
        email: 'test@example.com',
        telefon: '0740123456',
        address: 'Test Address',
        ...overrides
    }),

    createMockQuestionnaire: (overrides = {}) => ({
        questionnaireid: 1,
        pacientid: 1,
        conditii_medicale: {},
        stare_generala: {},
        status: 'completed',
        risk_level: 'minimal',
        medical_alerts: [],
        data_completare: new Date().toISOString(),
        ...overrides
    }),

    createMockMedicalData: () => ({
        boli: {
            diabet: 'Da',
            boli_inima: 'Nu',
            purtator_proteza: 'Nu',
            hepatita: 'Nu'
        },
        antecedente: {
            alergii: 'Penicilină, Polen',
            medicamente: 'Enalapril 10mg',
            fumat: 'Nu'
        }
    })
};
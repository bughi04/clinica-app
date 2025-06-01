import { Sequelize } from 'sequelize';
import Patient from '../../src/models/Patient.js';

describe('Patient Model', () => {
    let sequelize;

    beforeAll(async () => {
        // Use SQLite in-memory database for testing
        sequelize = new Sequelize('sqlite::memory:', {
            logging: false,
            dialect: 'sqlite'
        });

        Patient.initialize(sequelize);
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await Patient.destroy({ where: {}, truncate: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Model Structure', () => {
        test('has correct field definitions', () => {
            const attributes = Patient.rawAttributes;

            expect(attributes.pacientid).toBeDefined();
            expect(attributes.pacientid.primaryKey).toBe(true);
            expect(attributes.pacientid.autoIncrement).toBe(true);

            expect(attributes.firstname).toBeDefined();
            expect(attributes.firstname.allowNull).toBe(false);

            expect(attributes.surname).toBeDefined();
            expect(attributes.surname.allowNull).toBe(false);

            expect(attributes.cnp).toBeDefined();
            expect(attributes.cnp.unique).toBe(true);

            expect(attributes.email).toBeDefined();
            expect(attributes.email.unique).toBe(true);
        });
    });

    describe('CRUD Operations', () => {
        const patientData = {
            firstname: 'Ion',
            surname: 'Popescu',
            cnp: '1850101123456',
            birthdate: '1985-01-01',
            email: 'ion@example.com',
            telefon: '0740123456',
            address: 'Timisoara, Romania'
        };

        test('creates patient successfully', async () => {
            const patient = await Patient.createRecord(patientData);

            expect(patient.pacientid).toBeDefined();
            expect(patient.firstname).toBe('Ion');
            expect(patient.surname).toBe('Popescu');
            expect(patient.cnp).toBe('1850101123456');
            expect(patient.email).toBe('ion@example.com');
        });

        test('retrieves patient by ID', async () => {
            const created = await Patient.createRecord(patientData);
            const retrieved = await Patient.getById(created.pacientid);

            expect(retrieved).toBeDefined();
            expect(retrieved.pacientid).toBe(created.pacientid);
            expect(retrieved.firstname).toBe('Ion');
        });

        test('updates patient record', async () => {
            const patient = await Patient.createRecord(patientData);
            const updates = { firstname: 'Gheorghe', telefon: '0741234567' };

            const updated = await Patient.updateRecord(patient.pacientid, updates);

            expect(updated.firstname).toBe('Gheorghe');
            expect(updated.telefon).toBe('0741234567');
            expect(updated.surname).toBe('Popescu'); // Unchanged
        });

        test('deletes patient record', async () => {
            const patient = await Patient.createRecord(patientData);
            const deleted = await Patient.deleteRecord(patient.pacientid);

            expect(deleted).toBe(true);

            const retrieved = await Patient.getById(patient.pacientid);
            expect(retrieved).toBeNull();
        });

        test('handles non-existent patient updates', async () => {
            await expect(Patient.updateRecord(99999, { firstname: 'Test' }))
                .rejects.toThrow('Patient not found');
        });
    });

    describe('Instance Methods', () => {
        let patient;

        beforeEach(async () => {
            patient = await Patient.createRecord({
                firstname: 'Maria',
                surname: 'Ionescu',
                cnp: '2850505123456',
                birthdate: '1985-05-05',
                email: 'maria@example.com',
                telefon: '0742123456',
                address: 'Bucharest, Romania'
            });
        });

        test('getFullName returns correct format', () => {
            expect(patient.getFullName()).toBe('Maria Ionescu');
        });

        test('getAge calculates correct age', () => {
            const age = patient.getAge();
            const expectedAge = new Date().getFullYear() - 1985;
            expect(age).toBeCloseTo(expectedAge, 0);
        });

        test('getContactInfo returns email and phone', () => {
            const contact = patient.getContactInfo();
            expect(contact).toEqual({
                email: 'maria@example.com',
                telefon: '0742123456'
            });
        });
    });

    describe('Static Methods', () => {
        test('generateMedicalRecordNumber creates unique identifier', () => {
            const mrn1 = Patient.generateMedicalRecordNumber();
            const mrn2 = Patient.generateMedicalRecordNumber();

            expect(mrn1).toMatch(/^MRN-\d+-\d+$/);
            expect(mrn2).toMatch(/^MRN-\d+-\d+$/);
            expect(mrn1).not.toBe(mrn2);
        });
    });

    describe('Validation', () => {
        test('enforces unique CNP constraint', async () => {
            const data1 = {
                firstname: 'Ion',
                surname: 'Popescu',
                cnp: '1850101123456',
                birthdate: '1985-01-01',
                email: 'ion1@example.com',
                telefon: '0740123456',
                address: 'Address 1'
            };

            const data2 = {
                ...data1,
                email: 'ion2@example.com',
                cnp: '1850101123456' // Same CNP
            };

            await Patient.createRecord(data1);

            await expect(Patient.createRecord(data2))
                .rejects.toThrow();
        });

        test('enforces unique email constraint', async () => {
            const data1 = {
                firstname: 'Ion',
                surname: 'Popescu',
                cnp: '1850101123456',
                birthdate: '1985-01-01',
                email: 'same@example.com',
                telefon: '0740123456',
                address: 'Address 1'
            };

            const data2 = {
                ...data1,
                cnp: '2850101123456',
                email: 'same@example.com' // Same email
            };

            await Patient.createRecord(data1);

            await expect(Patient.createRecord(data2))
                .rejects.toThrow();
        });
    });
});
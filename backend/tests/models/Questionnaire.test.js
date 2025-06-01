import Questionnaire from '../../src/models/Questionnaire.js';

describe('Questionnaire Model', () => {
    let sequelize;

    beforeAll(async () => {
        sequelize = new Sequelize('sqlite::memory:', {
            logging: false,
            dialect: 'sqlite'
        });

        Patient.initialize(sequelize);
        Questionnaire.initialize(sequelize);
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await Questionnaire.destroy({ where: {}, truncate: true });
        await Patient.destroy({ where: {}, truncate: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Medical Alert Generation', () => {
        let questionnaire;

        beforeEach(() => {
            questionnaire = new Questionnaire({
                pacientid: 1,
                conditii_medicale: {},
                stare_generala: {},
                conditii_femei: {}
            });
        });

        test('generates diabetes alert', () => {
            questionnaire.conditii_medicale = { diabet: 'DA' };
            const alerts = questionnaire.generateMedicalAlerts();

            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('warning');
            expect(alerts[0].message).toContain('DIABET');
            expect(alerts[0].priority).toBe('high');
        });

        test('generates heart condition alert', () => {
            questionnaire.conditii_medicale = { boli_inima_hipertensiune: 'DA' };
            const alerts = questionnaire.generateMedicalAlerts();

            expect(alerts).toHaveLength(1);
            expect(alerts[0].type).toBe('danger');
            expect(alerts[0].message).toContain('BOLI CARDIACE');
            expect(alerts[0].priority).toBe('high');
        });

        test('generates allergy alert', () => {
            questionnaire.stare_generala = {
                alergii: 'DA',
                lista_alergii: 'Penicilină, Latex'
            };
            const alerts = questionnaire.generateMedicalAlerts();

            expect(alerts).toHaveLength(1);
            expect(alerts[0].message).toContain('ALERGII: Penicilină, Latex');
        });

        test('generates multiple alerts', () => {
            questionnaire.conditii_medicale = {
                diabet: 'DA',
                boli_inima_hipertensiune: 'DA'
            };
            questionnaire.stare_generala = {
                alergii: 'DA',
                lista_alergii: 'Penicilină'
            };

            const alerts = questionnaire.generateMedicalAlerts();
            expect(alerts).toHaveLength(3);
        });
    });

    describe('Risk Level Calculation', () => {
        let questionnaire;

        beforeEach(() => {
            questionnaire = new Questionnaire({
                pacientid: 1,
                conditii_medicale: {},
                stare_generala: {},
                conditii_femei: {}
            });
        });

        test('calculates minimal risk for healthy patient', () => {
            const riskLevel = questionnaire.calculateRiskLevel();
            expect(riskLevel).toBe('minimal');
        });

        test('calculates high risk for severe conditions', () => {
            questionnaire.conditii_medicale = {
                boli_inima_hipertensiune: 'DA',
                tulburari_coagulare_sangerari: 'DA'
            };

            const riskLevel = questionnaire.calculateRiskLevel();
            expect(riskLevel).toBe('high'); // 3 + 3 = 6 points
        });

        test('calculates medium risk for moderate conditions', () => {
            questionnaire.conditii_medicale = { diabet: 'DA' };
            questionnaire.stare_generala = { alergii: 'DA' };

            const riskLevel = questionnaire.calculateRiskLevel();
            expect(riskLevel).toBe('medium'); // 2 + 2 = 4 points
        });

        test('calculates low risk for minor conditions', () => {
            questionnaire.conditii_medicale = { migrene: 'DA' };
            questionnaire.stare_generala = { fumat: 'DA' };

            const riskLevel = questionnaire.calculateRiskLevel();
            expect(riskLevel).toBe('low'); // 1 + 1 = 2 points
        });
    });

    describe('CRUD Operations', () => {
        let patient;

        beforeEach(async () => {
            patient = await Patient.createRecord({
                firstname: 'Test',
                surname: 'Patient',
                cnp: '1850101123456',
                birthdate: '1985-01-01',
                email: 'test@example.com',
                telefon: '0740123456',
                address: 'Test Address'
            });
        });

        test('creates questionnaire with risk assessment', async () => {
            const questionnaireData = {
                pacientid: patient.pacientid,
                conditii_medicale: { diabet: 'DA' },
                stare_generala: { alergii: 'DA', lista_alergii: 'Penicilină' },
                status: 'completed'
            };

            const questionnaire = await Questionnaire.createRecord(questionnaireData);

            expect(questionnaire.questionnaireid).toBeDefined();
            expect(questionnaire.risk_level).toBe('medium');
            expect(questionnaire.medical_alerts).toHaveLength(2);
        });

        test('retrieves questionnaire by ID', async () => {
            const created = await Questionnaire.createRecord({
                pacientid: patient.pacientid,
                status: 'completed'
            });

            const retrieved = await Questionnaire.getById(created.questionnaireid);
            expect(retrieved).toBeDefined();
            expect(retrieved.questionnaireid).toBe(created.questionnaireid);
        });
    });
});
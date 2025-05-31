// backend/src/models/Questionnaire.js
import { Model, DataTypes, Op } from "sequelize";

class Questionnaire extends Model {
    static initialize(sequelize) {
        Questionnaire.init({
            questionnaireid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pacientid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "patients",
                    key: "pacientid",
                },
            },
            // Header information
            medic: DataTypes.STRING,
            nr_fisa: DataTypes.STRING,

            // Referral information
            indrumare_dr: DataTypes.BOOLEAN,
            indrumare_internet: DataTypes.BOOLEAN,
            indrumare_altele: DataTypes.BOOLEAN,
            indrumare_altele_detalii: DataTypes.TEXT,

            // Dental examination data (JSON for complex data)
            examen_dentar: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // General health data
            stare_generala: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // Medical conditions
            conditii_medicale: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // Women-specific conditions
            conditii_femei: {
                type: DataTypes.JSONB,
                defaultValue: null
            },

            // Data processing consent
            procesare_date: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // General consent
            acord_general: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // Pedodontics consent
            acord_pedodontie: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // Endodontic consent
            acord_endodontic: {
                type: DataTypes.JSONB,
                defaultValue: {}
            },

            // Metadata
            data_completare: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW
            },
            versiune_formular: {
                type: DataTypes.STRING,
                defaultValue: 'PDF_COMPLETE_V2'
            },
            status: {
                type: DataTypes.ENUM('draft', 'completed', 'reviewed'),
                defaultValue: 'draft'
            },

            // Medical alerts generated from questionnaire
            medical_alerts: {
                type: DataTypes.JSONB,
                defaultValue: []
            },

            // Risk level calculated from responses
            risk_level: {
                type: DataTypes.ENUM('minimal', 'low', 'medium', 'high'),
                defaultValue: 'minimal'
            }
        }, {
            sequelize,
            modelName: "Questionnaire",
            tableName: "questionnaires",
            timestamps: true,
            indexes: [
                {
                    fields: ['pacientid']
                },
                {
                    fields: ['status']
                },
                {
                    fields: ['risk_level']
                },
                {
                    fields: ['data_completare']
                }
            ]
        });
    }

    static associate(models) {
        Questionnaire.belongsTo(models.Patient, {
            foreignKey: "pacientid",
            as: "patient",
        });

        models.Patient.hasMany(Questionnaire, {
            foreignKey: "pacientid",
            as: "questionnaires",
        });
    }

    // Calculate medical alerts based on questionnaire responses
    generateMedicalAlerts() {
        const alerts = [];

        // Check medical conditions for high-risk items
        if (this.conditii_medicale?.diabet === 'DA') {
            alerts.push({
                type: 'warning',
                message: 'DIABET - Atenție la cicatrizare și infecții',
                priority: 'high',
                category: 'medical_condition'
            });
        }

        if (this.conditii_medicale?.boli_inima_hipertensiune === 'DA') {
            alerts.push({
                type: 'danger',
                message: 'BOLI CARDIACE - Consultați cardiologul înainte de anestezii',
                priority: 'high',
                category: 'medical_condition'
            });
        }

        if (this.conditii_medicale?.tulburari_coagulare_sangerari === 'DA') {
            alerts.push({
                type: 'danger',
                message: 'TULBURĂRI COAGULARE - Risc de sângerare',
                priority: 'high',
                category: 'medical_condition'
            });
        }

        // Check allergies
        if (this.stare_generala?.alergii === 'DA' && this.stare_generala?.lista_alergii) {
            alerts.push({
                type: 'warning',
                message: `ALERGII: ${this.stare_generala.lista_alergii}`,
                priority: 'medium',
                category: 'allergy'
            });
        }

        // Check pregnancy
        if (this.conditii_femei?.insarcinata === 'DA') {
            alerts.push({
                type: 'info',
                message: `SARCINĂ - Luna ${this.conditii_femei.luna_sarcina || 'nespecificată'}`,
                priority: 'medium',
                category: 'pregnancy'
            });
        }

        // Check medications
        if (this.stare_generala?.medicamente_curente === 'DA' && this.stare_generala?.lista_medicamente) {
            alerts.push({
                type: 'info',
                message: `MEDICAMENTE: ${this.stare_generala.lista_medicamente}`,
                priority: 'low',
                category: 'medication'
            });
        }

        return alerts;
    }

    // Calculate risk level based on responses
    calculateRiskLevel() {
        let riskScore = 0;

        // High-risk conditions (3 points each)
        if (this.conditii_medicale?.boli_inima_hipertensiune === 'DA') riskScore += 3;
        if (this.conditii_medicale?.tulburari_coagulare_sangerari === 'DA') riskScore += 3;
        if (this.conditii_medicale?.epilepsie === 'DA') riskScore += 3;

        // Medium-risk conditions (2 points each)
        if (this.conditii_medicale?.diabet === 'DA') riskScore += 2;
        if (this.conditii_medicale?.hepatita_ciroza === 'DA') riskScore += 2;
        if (this.stare_generala?.alergii === 'DA') riskScore += 2;

        // Low-risk conditions (1 point each)
        if (this.conditii_medicale?.migrene === 'DA') riskScore += 1;
        if (this.stare_generala?.fumat === 'DA') riskScore += 1;
        if (this.conditii_femei?.insarcinata === 'DA') riskScore += 1;

        // Determine risk level
        if (riskScore >= 6) return 'high';
        if (riskScore >= 4) return 'medium';
        if (riskScore >= 2) return 'low';
        return 'minimal';
    }

    // Method to update alerts and risk level
    async updateMedicalAssessment() {
        const alerts = this.generateMedicalAlerts();
        const riskLevel = this.calculateRiskLevel();

        await this.update({
            medical_alerts: alerts,
            risk_level: riskLevel
        });

        return { alerts, riskLevel };
    }

    static async createRecord(data) {
        const questionnaire = await Questionnaire.create(data);
        await questionnaire.updateMedicalAssessment();
        return questionnaire;
    }

    static async getById(id, models = null) {
        return await Questionnaire.findByPk(id, {
            include: models?.Patient ? {
                model: models.Patient,
                as: "patient",
                attributes: ['pacientid', 'firstname', 'surname', 'email', 'telefon', 'cnp']
            } : undefined,
        });
    }

    static async getByPatientId(patientId, models = null) {
        return await Questionnaire.findAll({
            where: { pacientid: patientId },
            include: models?.Patient ? {
                model: models.Patient,
                as: "patient"
            } : undefined,
            order: [['data_completare', 'DESC']]
        });
    }

    static async getLatestByPatientId(patientId, models = null) {
        return await Questionnaire.findOne({
            where: { pacientid: patientId },
            include: models?.Patient ? {
                model: models.Patient,
                as: "patient"
            } : undefined,
            order: [['data_completare', 'DESC']]
        });
    }

    static async updateRecord(id, updates) {
        const [count] = await Questionnaire.update(updates, { where: { questionnaireid: id } });
        if (count === 0) throw new Error("Questionnaire not found");

        const questionnaire = await Questionnaire.findByPk(id);
        await questionnaire.updateMedicalAssessment();
        return questionnaire;
    }

    static async deleteRecord(id) {
        const count = await Questionnaire.destroy({ where: { questionnaireid: id } });
        return count > 0;
    }

    // Get patients with high risk
    static async getHighRiskPatients(models = null) {
        return await Questionnaire.findAll({
            where: {
                risk_level: ['high', 'medium'],
                status: 'completed'
            },
            include: models?.Patient ? {
                model: models.Patient,
                as: "patient"
            } : undefined,
            order: [['data_completare', 'DESC']]
        });
    }

    // Get recent questionnaires
    static async getRecentQuestionnaires(limit = 10, models = null) {
        return await Questionnaire.findAll({
            where: { status: 'completed' },
            include: models?.Patient ? {
                model: models.Patient,
                as: "patient"
            } : undefined,
            order: [['data_completare', 'DESC']],
            limit
        });
    }

    // Get statistics - FIXED to properly reference sequelize
    static async getStatistics() {
        try {
            const totalQuestionnaires = await Questionnaire.count({
                where: { status: 'completed' }
            });

            const riskCounts = await Questionnaire.findAll({
                attributes: [
                    'risk_level',
                    [Questionnaire.sequelize.fn('COUNT', '*'), 'count']
                ],
                where: { status: 'completed' },
                group: 'risk_level',
                raw: true
            });

            const recentCount = await Questionnaire.count({
                where: {
                    status: 'completed',
                    data_completare: {
                        [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                    }
                }
            });

            return {
                total: totalQuestionnaires,
                riskDistribution: riskCounts.reduce((acc, curr) => {
                    acc[curr.risk_level] = parseInt(curr.count);
                    return acc;
                }, {}),
                recentWeek: recentCount
            };
        } catch (error) {
            console.error('Error in getStatistics:', error);
            // Return fallback data
            return {
                total: 0,
                riskDistribution: {},
                recentWeek: 0
            };
        }
    }
}

export default Questionnaire;
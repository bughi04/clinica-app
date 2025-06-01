import { Model, DataTypes } from "sequelize";

class DentalRecord extends Model {
    /**
     * DentalRecord model definition
     * Tracks dental health information for a patient
     */
    static initialize(sequelize) {
        // Define the fields and their constraints
        DentalRecord.init(
            {
                datemedicaleid: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                    comment: "Unique ID for the dental record",
                },
                pacientid: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    references: {
                        model: "patients", // Name of the related table (from Patient model)
                        key: "pacientid",
                    },
                    comment: "Reference to the patient ID",
                },
                sanatategingii: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: "Condition of the gums (e.g., healthy, inflamed)",
                },
                sensibilitatedinti: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    comment: "Sensitive teeth indicator (true/false)",
                },
                problemetratamentortodontic: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: "Details of orthodontic treatment issues, if any",
                },
                scrasnit_inclestat_scrasnit_dinti: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                    comment: "Grinding or clenching teeth (true/false)",
                },
                ultim_consult_stomatologic: {
                    type: DataTypes.DATEONLY,
                    allowNull: true,
                    comment: "Date of the last dental check-up",
                },
                nota_aspect_dentatie: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    validate: {
                        min: 1,
                        max: 10,
                    },
                    comment: "Score of dental condition (1-10 scale)",
                },
                probleme_tratament_stomatologic_anterior: {
                    type: DataTypes.TEXT,
                    allowNull: true,
                    comment: "Issues with previous dental treatments, if any",
                },
                data: {
                    type: DataTypes.DATEONLY,
                    allowNull: false,
                    comment: "Date when this record was created",
                },
            },
            {
                sequelize,
                modelName: "DentalRecord", // Name of the model
                tableName: "datestomatologice", // Corresponding table name in the database
                timestamps: false, // Automatically manage createdAt and updatedAt fields
            }
        );
    }

    static associate(models) {
        DentalRecord.belongsTo(models.Patient, {
            foreignKey: "pacientid",
            as: "patient",
        });
    }

    static async createRecord(data) {
        return await DentalRecord.create(data);
    }

    static async getById(id, models = null) {
        return await DentalRecord.findByPk(id, {
            include: models?.Patient ? { model: models.Patient, as: "patient" } : undefined,
        });
    }

    static async updateRecord(id, updates) {
        const [count] = await DentalRecord.update(updates, { where: { datemedicaleid: id } });
        if (count === 0) throw new Error("Record not found");
        return await DentalRecord.findByPk(id);
    }

    static async deleteRecord(id) {
        const count = await DentalRecord.destroy({ where: { datemedicaleid: id } });
        return count > 0;
    }

}

export default DentalRecord;
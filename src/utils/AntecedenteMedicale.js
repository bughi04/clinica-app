import { Model, DataTypes } from "sequelize";

class AntecedenteMedicale extends Model {
    static initialize(sequelize) {
        AntecedenteMedicale.init({
            idantecedent: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pacientid: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "patients", // Name of the related table (from Patient model)
                    key: "pacientid",
                },
            },
            nota_stare_sanatate: DataTypes.TEXT,
            ingrijire_alt_medic: DataTypes.BOOLEAN,
            spitalizare: DataTypes.TEXT,
            medicamente: DataTypes.TEXT,
            fumat: DataTypes.BOOLEAN,
            alergii: DataTypes.TEXT,
            antidepresive: DataTypes.BOOLEAN,
            femeie_insarcinata_luna: DataTypes.STRING,
            femeie_bebe_alaptare: DataTypes.BOOLEAN,
            data: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: "AntecedenteMedicale",
            tableName: "date_antecedente_medicale",
            timestamps: false,
        });
    }

    static associate(models) {
        AntecedenteMedicale.belongsTo(models.Patient, {
            foreignKey: "pacientid",
            as: "patient",
        });

        models.Patient.hasOne(AntecedenteMedicale, {
            foreignKey: "pacientid",
            as: "antecedenteMedicale",
        });
    }

    static async createRecord(data) {
        return await AntecedenteMedicale.create(data);
    }

    static async getById(id, models = null) {
        return await AntecedenteMedicale.findByPk(id, {
            include: models?.Patient ? { model: models.Patient, as: "patient" } : undefined,
        });
    }

    static async updateRecord(id, updates) {
        const [count] = await AntecedenteMedicale.update(updates, { where: { idantecedent: id } });
        if (count === 0) throw new Error("Record not found");
        return await AntecedenteMedicale.findByPk(id);
    }

    static async deleteRecord(id) {
        const count = await AntecedenteMedicale.destroy({ where: { idantecedent: id } });
        return count > 0;
    }

}

export default AntecedenteMedicale;

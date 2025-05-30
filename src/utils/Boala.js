import { Model, DataTypes } from "sequelize";

class Boala extends Model {
    static initialize(sequelize) {
        Boala.init({
            idboala: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            pacientid: {
                type: DataTypes.INTEGER,
                references: {
                    model: "patients", // Name of the related table (from Patient model)
                    key: "pacientid",
                },
                allowNull: false,
            },
            boli_inima: DataTypes.BOOLEAN,
            purtator_proteza: DataTypes.BOOLEAN,
            diabet: DataTypes.BOOLEAN,
            hepatita: DataTypes.BOOLEAN,
            reumatism: DataTypes.BOOLEAN,
            boli_respiratorii: DataTypes.BOOLEAN,
            tulburari_coagulare_sange: DataTypes.BOOLEAN,
            anemie: DataTypes.BOOLEAN,
            boli_rinichi: DataTypes.BOOLEAN,
            glaucom: DataTypes.BOOLEAN,
            epilepsie: DataTypes.BOOLEAN,
            migrene: DataTypes.BOOLEAN,
            osteoporoza: DataTypes.BOOLEAN,
            ulcer_gastric: DataTypes.BOOLEAN,
            boli_tiroida: DataTypes.BOOLEAN,
            boli_neurologice: DataTypes.BOOLEAN,
            probleme_psihice: DataTypes.BOOLEAN,
            alte_boli: DataTypes.TEXT,
        }, {
            sequelize,
            modelName: "Boala",
            tableName: "boli",
            timestamps: false,
        });
    }

    static associate(models) {
        Boala.belongsTo(models.Patient, {
            foreignKey: "pacientid",
            as: "patient",
        });

        models.Patient.hasOne(Boala, {
            foreignKey: "pacientid",
            as: "boala",
        });
    }

    static async createRecord(data) {
        return await Boala.create(data);
    }

    static async getById(id, models = null) {
        return await Boala.findByPk(id, {
            include: models?.Patient ? { model: models.Patient, as: "patient" } : undefined,
        });
    }

    static async updateRecord(id, updates) {
        const [count] = await Boala.update(updates, { where: { idboala: id } });
        if (count === 0) throw new Error("Record not found");
        return await Boala.findByPk(id);
    }

    static async deleteRecord(id) {
        const count = await Boala.destroy({ where: { idboala: id } });
        return count > 0;
    }
}

export default Boala;

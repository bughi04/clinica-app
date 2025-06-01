import { Model, DataTypes } from "sequelize";

class Dentist extends Model {
    static initialize(sequelize) {
        Dentist.init({
            dentistid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            firstname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            lastname: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: "Dentist",
            tableName: "dentisti",
            timestamps: false,
        });
    }

    static async createRecord(data) {
        return await Dentist.create(data);
    }

    static async getById(id) {
        return await Dentist.findByPk(id);
    }

    static async updateRecord(id, updates) {
        const [count] = await Dentist.update(updates, { where: { dentistid: id } });
        if (count === 0) throw new Error("Dentist not found");
        return await Dentist.findByPk(id);
    }

    static async deleteRecord(id) {
        const count = await Dentist.destroy({ where: { dentistid: id } });
        return count > 0;
    }

}

export default Dentist;

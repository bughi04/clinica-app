import { Model, DataTypes } from "sequelize";

class User extends Model {
    static initialize(sequelize) {
        User.init({
            userid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM("pacient", "dentist"),
                allowNull: false,
            },
            data_inscriere: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: "User",
            tableName: "useri",
            timestamps: false,
        });
    }

    static async createRecord(data) {
        return await User.create(data);
    }

    static async getById(id) {
        return await User.findByPk(id);
    }

    static async updateRecord(id, updates) {
        const [count] = await User.update(updates, { where: { userid: id } });
        if (count === 0) throw new Error("User not found");
        return await User.findByPk(id);
    }

    static async deleteRecord(id) {
        const count = await User.destroy({ where: { userid: id } });
        return count > 0;
    }

}

export default User;

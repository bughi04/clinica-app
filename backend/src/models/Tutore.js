import { Model, DataTypes } from "sequelize";

class Tutore extends Model {
    static initialize(sequelize) {
        Tutore.init({
            tutoreid: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            tutore_first_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            tutore_last_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        }, {
            sequelize,
            modelName: "Tutore",
            tableName: "tutori",
            timestamps: false,
        });
    }

}

export default Tutore;

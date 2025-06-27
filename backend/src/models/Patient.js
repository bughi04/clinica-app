import { Model, DataTypes } from "sequelize";

class Patient extends Model {
  /**
   * Patient model definition
   * Includes fields like personal info, contact details, and relations
   */
  static initialize(sequelize) {
    Patient.init(
      {
        pacientid: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        firstname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        surname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        cnp: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        birthdate: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          unique: true,
          allowNull: false,
        },
        telefon: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        address: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        recomandare: {
          type: DataTypes.STRING,
          allowNull: true, // Optional field
        },
        nume_representant: {
          type: DataTypes.STRING,
          allowNull: true, // Optional field
        },
        dentistid: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "dentisti",
            key: "dentistid",
          },
        },
      },
      {
        sequelize,
        modelName: "Patient", // Name of the model
        tableName: "patients", // Corresponding table name
        timestamps: true, // Enable timestamps since database has created_at and updated_at
        createdAt: "created_at", // Map to the actual column name
        updatedAt: "updated_at", // Map to the actual column name
      }
    );
  }

  static async createRecord(data) {
    return await Patient.create(data);
  }

  static async getById(id, models = null) {
    return await Patient.findByPk(id, {
      include: [
        models?.DentalRecord && {
          model: models.DentalRecord,
          as: "dentalRecords",
        },
        models?.Boala && { model: models.Boala, as: "boala" },
        models?.AntecedenteMedicale && {
          model: models.AntecedenteMedicale,
          as: "antecedenteMedicale",
        },
      ].filter(Boolean),
    });
  }

  static async updateRecord(id, updates) {
    const [count] = await Patient.update(updates, { where: { pacientid: id } });
    if (count === 0) throw new Error("Patient not found");
    return await Patient.findByPk(id);
  }

  static async deleteRecord(id) {
    const count = await Patient.destroy({ where: { pacientid: id } });
    return count > 0;
  }

  // Get the full name of the patient
  getFullName() {
    return `${this.firstname} ${this.surname}`;
  }

  // Calculate the age of the patient based on their birthdate
  getAge() {
    try {
      const today = new Date();
      let birthDate;

      // Try to parse the birthdate - it might be encrypted or plain text
      if (this.birthdate && typeof this.birthdate === "string") {
        // Check if it looks like an encrypted string (contains colons and hex)
        if (
          this.birthdate.includes(":") &&
          /^[a-f0-9:]+$/i.test(this.birthdate)
        ) {
          // This is encrypted, we can't calculate age without decryption
          // Return null or a placeholder
          return null;
        } else {
          // This might be a plain date string
          birthDate = new Date(this.birthdate);
        }
      } else {
        birthDate = new Date(this.birthdate);
      }

      if (isNaN(birthDate.getTime())) {
        return null; // Invalid date
      }

      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }

      return age;
    } catch (error) {
      console.warn("Error calculating age from birthdate:", error);
      return null;
    }
  }

  // Returns the email and phone as contact info
  getContactInfo() {
    return { email: this.email, telefon: this.telefon };
  }

  // Static helper to generate a unique medical record number
  static generateMedicalRecordNumber() {
    const timestamp = Date.now();
    const randomComponent = Math.floor(Math.random() * 1000);
    return `MRN-${timestamp}-${randomComponent}`;
  }

  static associate(models) {
    // Only keep real associations
    Patient.hasMany(models.DentalRecord, {
      foreignKey: "pacientid",
      as: "dentalRecords",
    });
    Patient.belongsTo(models.Dentist, {
      foreignKey: "dentistid",
      as: "doctor",
    });
  }
}

export default Patient;

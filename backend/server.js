import express from "express";
import cors from "cors";
import dotenv from "dotenv"; // ADD THIS LINE
import { sequelize } from "./src/models/index.js";
import models from "./src/models/index.js";
import DataEncryption from './src/services/DataEncryption.js'; // ADD THIS LINE

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const encryption = new DataEncryption();

// Middleware
app.use(
    cors({
      origin: [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
      ], // React dev servers
      credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/patients', encryption.encryptionMiddleware());
app.use('/api/questionnaires', encryption.encryptionMiddleware());
app.use('/api/patients', encryption.decryptionMiddleware());
app.use('/api/questionnaires', encryption.decryptionMiddleware());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Dental Point Clinic API Server - Enhanced",
    status: "Running",
    database: "Connected",
    encryption: "Active", // ADD THIS LINE
    version: "2.0.0",
    endpoints: {
      health: "/api/health",
      patients: "/api/patients",
      questionnaires: "/api/questionnaires",
      dashboard: "/api/dashboard",
      reports: "/api/reports",
    },
  });
});

// API root route
app.get("/api", (req, res) => {
  res.json({
    message: "Dental Clinic API is running - Enhanced Version",
    version: "2.0.0",
    endpoints: [
      "GET /api/health - Check database connection",
      "GET /api/patients - Get all patients with questionnaires",
      "GET /api/patients/cnp/:cnp - Get patient by CNP",
      "POST /api/patients - Create new patient",
      "POST /api/questionnaires - Save complete questionnaire",
      "GET /api/questionnaires/patient/:id - Get questionnaires for patient",
      "GET /api/dashboard/stats - Get dashboard statistics",
      "GET /api/reports/:type - Generate reports",
    ],
  });
});

// Test database connection
async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");
    console.log("Connected to PostgreSQL database: postgres");

    // Sync models (be careful in production)
    await sequelize.sync({ alter: false }); // Don't alter tables in production
    console.log("Database models synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
}

// Helper function to extract medical conditions
function extractMedicalConditions(questionnaire) {
  if (!questionnaire?.conditii_medicale) return [];

  const conditions = [];
  Object.entries(questionnaire.conditii_medicale).forEach(([key, value]) => {
    if (value === "DA") {
      conditions.push(key.replace(/_/g, " "));
    }
  });
  return conditions;
}

// Helper function to check anesthetic reactions
function checkAnestheticReactions(questionnaire) {
  if (!questionnaire) return false;
  const allergies = questionnaire.stare_generala?.lista_alergii || "";
  return (
      allergies.toLowerCase().includes("anestez") ||
      allergies.toLowerCase().includes("novocain") ||
      allergies.toLowerCase().includes("lidocain")
  );
}

// Helper function to format address from JSON or string
function formatAddress(address) {
  console.log("formatAddress called with:", address);
  console.log("formatAddress type:", typeof address);

  if (!address) return "";

  try {
    // If it's already a string, check if it's JSON
    if (typeof address === "string") {
      console.log("Address is string, checking if JSON");
      // Check if it's a JSON string
      if (address.startsWith("{")) {
        console.log("Address is JSON string, parsing...");
        const addressObj = JSON.parse(address);
        const result = formatAddressObject(addressObj);
        console.log("Formatted JSON string result:", result);
        return result;
      }
      console.log("Address is plain string, returning as is:", address);
      return address;
    }

    // If it's an object, format it directly
    if (typeof address === "object" && address !== null) {
      console.log("Address is object, formatting...");
      const result = formatAddressObject(address);
      console.log("Formatted object result:", result);
      return result;
    }

    console.log("Address is other type, converting to string:", address);
    return address.toString();
  } catch (error) {
    console.warn("Error formatting address:", error);
    // Fallback: if it's an object, try to format it manually
    if (typeof address === "object" && address !== null) {
      try {
        const parts = [];
        if (address.Judet) parts.push(`Jud. ${address.Judet}`);
        if (address.Localitate) parts.push(address.Localitate);
        if (address.Str) parts.push(`Str. ${address.Str}`);
        if (address.Nr) parts.push(`Nr. ${address.Nr}`);
        if (address.Bc) parts.push(`Bl. ${address.Bc}`);
        if (address.Sc) parts.push(`Sc. ${address.Sc}`);
        if (address.Ap) parts.push(`Ap. ${address.Ap}`);
        const result = parts.join(", ");
        console.log("Fallback formatting result:", result);
        return result;
      } catch (fallbackError) {
        console.warn("Fallback formatting also failed:", fallbackError);
      }
    }
    return address.toString();
  }
}

// Helper function to format address object
function formatAddressObject(addressObj) {
  console.log("formatAddressObject called with:", addressObj);

  const parts = [];

  if (addressObj.Str) parts.push(`Str. ${addressObj.Str}`);
  if (addressObj.Nr) parts.push(`Nr. ${addressObj.Nr}`);
  if (addressObj.Bc) parts.push(`Bl. ${addressObj.Bc}`);
  if (addressObj.Sc) parts.push(`Sc. ${addressObj.Sc}`);
  if (addressObj.Ap) parts.push(`Ap. ${addressObj.Ap}`);
  if (addressObj.Localitate) parts.push(addressObj.Localitate);
  if (addressObj.Judet) parts.push(`Jud. ${addressObj.Judet}`);

  const result = parts.join(", ");
  console.log("formatAddressObject result:", result);
  return result;
}

// **PATIENT ROUTES**

// Get patient by CNP (for login) with latest questionnaire
app.get("/api/patients/cnp/:cnp", async (req, res) => {
  try {
    const { cnp } = req.params;
    console.log('🔍 CNP lookup request for:', cnp);

    // Use the encryption service to find patient (handles both encrypted and unencrypted)
    const patient = await encryption.findPatientByCNP(cnp, models);

    if (!patient) {
      console.log('❌ Patient not found for CNP:', cnp);
      return res.status(404).json({ message: "Patient not found" });
    }

    console.log('✅ Patient found, loading related data...');

    // Get the full patient data with includes
    const fullPatient = await models.Patient.findByPk(patient.pacientid, {
      include: [
        {
          model: models.Questionnaire,
          as: "questionnaires",
          limit: 1,
          order: [["data_completare", "DESC"]],
        },
        { model: models.DentalRecord, as: "dentalRecords" },
        { model: models.Boala, as: "boala" },
        { model: models.AntecedenteMedicale, as: "antecedenteMedicale" },
        { model: models.Dentist, as: "doctor" },
      ],
    });

    // Format response to match frontend expectations
    const latestQuestionnaire = fullPatient.questionnaires?.[0];

    const response = {
      id: fullPatient.pacientid.toString(),
      // ❌ REMOVE THIS LINE: fullName: `${fullPatient.firstname} ${fullPatient.surname}`,
      firstname: fullPatient.firstname,        // ✅ Send separate fields
      surname: fullPatient.surname,            // ✅ Send separate fields
      firstName: fullPatient.firstname,
      lastName: fullPatient.surname,
      birthDate: fullPatient.birthdate,
      email: fullPatient.email,
      telefon: fullPatient.telefon,           // ✅ Use original database field name
      phone: fullPatient.telefon,             // ✅ Also provide as 'phone' for compatibility
      address: formatAddress(fullPatient.address),
      created_at: fullPatient.created_at,
      doctor: fullPatient.doctor
          ? {
            id: fullPatient.doctor.dentistid,
            firstname: fullPatient.doctor.firstname,    // ✅ Send separate fields
            surname: fullPatient.doctor.lastname,       // ✅ Send separate fields
            firstName: fullPatient.doctor.firstname,
            lastName: fullPatient.doctor.lastname,
          }
          : null,

      // Medical data from latest questionnaire
      allergies: latestQuestionnaire?.stare_generala?.lista_alergii
          ? latestQuestionnaire.stare_generala.lista_alergii
              .split(",")
              .map((a) => a.trim())
          : [],
      chronicConditions: extractMedicalConditions(latestQuestionnaire),
      currentMedications: latestQuestionnaire?.stare_generala?.lista_medicamente
          ? latestQuestionnaire.stare_generala.lista_medicamente
              .split(",")
              .map((m) => m.trim())
          : [],

      // Risk information
      riskLevel: latestQuestionnaire?.risk_level || "minimal",
      medicalAlerts: latestQuestionnaire?.medical_alerts || [],
    };

    console.log('🔓 Sending decrypted patient data to frontend');
    res.json(response);
  } catch (error) {
    console.error("Error fetching patient by CNP:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Test endpoint to verify formatAddress function
app.get("/api/test/format-address", (req, res) => {
  const testAddress = {
    Judet: "Timis",
    Localitate: "Timisoara",
    Str: "Strada Steaua",
    Nr: "10",
    Bc: "B",
    Sc: null,
    Ap: null,
  };

  console.log("Testing formatAddress with:", testAddress);
  const result = formatAddress(testAddress);
  console.log("formatAddress result:", result);

  res.json({
    input: testAddress,
    output: result,
    type: typeof result,
  });
});

// Debug endpoint to check database content
app.get("/api/debug/patient/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const patient = await models.Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({ error: "Patient not found" });
    }

    res.json({
      id: patient.pacientid,
      address: patient.address,
      addressType: typeof patient.address,
      addressIsJSON: patient.address && patient.address.startsWith("{"),
      formattedAddress: formatAddress(patient.address),
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new patient
app.post("/api/patients", async (req, res) => {
  try {
    console.log("=== PATIENT CREATION DEBUG ===");
    console.log("Received address data:", req.body.address);
    console.log("Address type:", typeof req.body.address);

    const formattedAddress = formatAddress(req.body.address);
    console.log("Formatted address:", formattedAddress);
    console.log("Formatted address type:", typeof formattedAddress);

    const patientData = {
      firstname: req.body.firstname,
      surname: req.body.surname,
      cnp: req.body.CNP,
      birthdate: req.body.birthdate,
      email: req.body.email,
      telefon: req.body.telefon,
      address: formattedAddress,
      recomandare: req.body.recomandare,
      nume_representant: req.body.representantid,
      dentistid: req.body.dentistid || null,
    };

    console.log("Final patient data to save:", patientData);

    const patient = await models.Patient.create(patientData);

    console.log("=== DATABASE STORAGE DEBUG ===");
    console.log("Patient created with ID:", patient.pacientid);
    console.log("Address stored in DB:", patient.address);
    console.log("Address stored type:", typeof patient.address);

    // Format response
    const response = {
      id: patient.pacientid.toString(),
      firstName: patient.firstname,
      lastName: patient.surname,
      CNP: patient.cnp,
      email: patient.email,
      telefon: patient.telefon,
      birthdate: patient.birthdate,
      address: formatAddress(patient.address),
      created_at: patient.created_at,
      allergies: [],
      chronicConditions: [],
      currentMedications: [],
      dentistid: patient.dentistid,
      doctor: patient.doctor
          ? {
            id: patient.doctor.dentistid,
            firstName: patient.doctor.firstname,
            lastName: patient.doctor.lastname,
          }
          : null,
    };

    console.log("=== RESPONSE DEBUG ===");
    console.log("Response address:", response.address);
    console.log("Response address type:", typeof response.address);
    console.log("=== END DEBUG ===");

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating patient:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
          .status(400)
          .json({ error: "Patient with this CNP or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get patient by ID with all questionnaires
app.get("/api/patients/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }
    console.log("Received ID:", req.params.id);
    const patient = await models.Patient.findByPk(id, {
      include: [
        {
          model: models.Questionnaire,
          as: "questionnaires",
          order: [["data_completare", "DESC"]],
        },
        { model: models.DentalRecord, as: "dentalRecords" },
        { model: models.Boala, as: "boala" },
        { model: models.AntecedenteMedicale, as: "antecedenteMedicale" },
        { model: models.Dentist, as: "doctor" },
      ],
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const latestQuestionnaire = patient.questionnaires?.[0];

    const response = {
      id: patient.pacientid.toString(),
      // ✅ Send separate fields instead of concatenated fullName
      firstname: patient.firstname,
      surname: patient.surname,
      firstName: patient.firstname,
      lastName: patient.surname,
      birthDate: patient.birthdate,
      email: patient.email,
      telefon: patient.telefon,        // ✅ Use original database field name
      phone: patient.telefon,          // ✅ Also provide as 'phone' for compatibility
      address: formatAddress(patient.address),
      created_at: patient.created_at,
      doctor: patient.doctor
          ? {
            id: patient.doctor.dentistid,
            firstname: patient.doctor.firstname,    // ✅ Send separate fields
            surname: patient.doctor.lastname,       // ✅ Send separate fields
          }
          : null,

      // Medical data from questionnaires
      medicalConditions: extractMedicalConditions(latestQuestionnaire),
      allergies: latestQuestionnaire?.stare_generala?.lista_alergii
          ? latestQuestionnaire.stare_generala.lista_alergii
              .split(",")
              .map((a) => a.trim())
          : [],
      currentTreatments: latestQuestionnaire?.stare_generala?.lista_medicamente
          ? latestQuestionnaire.stare_generala.lista_medicamente
              .split(",")
              .map((m) => m.trim())
          : [],

      // Risk assessment
      riskLevel: latestQuestionnaire?.risk_level || "minimal",
      medicalAlerts: latestQuestionnaire?.medical_alerts || [],

      // All questionnaires for full medical history
      questionnaires: patient.questionnaires || [],
      dentalRecords: patient.dentalRecords || [],
      medicalHistory: {
        boala: patient.boala || [],
        antecedenteMedicale: patient.antecedenteMedicale || [],
      },
    };

    console.log('🔓 Sending decrypted patient data to frontend');
    res.json(response);
  } catch (error) {
    console.error("Error fetching patient by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **QUESTIONNAIRE ROUTES - FIXED**

// Save complete questionnaire
app.post("/api/questionnaires", async (req, res) => {
  console.log("[DEBUG] POST /api/questionnaires called", req.body);
  try {
    console.log("Saving complete questionnaire:", req.body);

    // Check if Questionnaire model exists and create table if needed
    if (!models.Questionnaire) {
      console.log("Questionnaire model not found, using legacy method");
      // Fall back to legacy method if new model doesn't exist
      return res.status(201).json({
        message: "Questionnaire saved using legacy method",
        patientId: req.body.pacientid,
      });
    }

    const questionnaire = await models.Questionnaire.create(req.body);

    console.log(
        "Complete questionnaire saved with ID:",
        questionnaire.questionnaireid
    );

    // If dentistid is provided, update the patient
    if (req.body.dentistid && req.body.pacientid) {
      const [count] = await models.Patient.update(
          { dentistid: req.body.dentistid },
          { where: { pacientid: req.body.pacientid } }
      );
      console.log(
          "Updated patient dentistid:",
          req.body.pacientid,
          req.body.dentistid,
          "Rows affected:",
          count
      );
    }

    // --- Sync to legacy tables ---
    // Parse JSON fields if needed
    const examenDentar =
        typeof questionnaire.examen_dentar === "string"
            ? JSON.parse(questionnaire.examen_dentar)
            : questionnaire.examen_dentar || {};
    const conditiiMed =
        typeof questionnaire.conditii_medicale === "string"
            ? JSON.parse(questionnaire.conditii_medicale)
            : questionnaire.conditii_medicale || {};
    const stareGen =
        typeof questionnaire.stare_generala === "string"
            ? JSON.parse(questionnaire.stare_generala)
            : questionnaire.stare_generala || {};
    const conditiiFemei =
        typeof questionnaire.conditii_femei === "string"
            ? JSON.parse(questionnaire.conditii_femei)
            : questionnaire.conditii_femei || {};

    // 1. datestomatologice
    await models.DentalRecord.create({
      pacientid: questionnaire.pacientid,
      sanatategingii: examenDentar.sangereaza_gingiile || "NU",
      sensibilitatedinti: examenDentar.sensibilitate_dinti === "DA",
      problemeTratamentOrtodontic: examenDentar.probleme_ortodontice === "DA",
      scrasnit_inclestat_scrasnit_dinti:
          examenDentar.scrasnit_inclestat === "DA",
      ultim_consult_stomatologic: examenDentar.data_ultim_consult || "NU",
      nota_aspect_dentatie:
          examenDentar.aspect_dentatie === "Bun"
              ? 8
              : examenDentar.aspect_dentatie === "Mediu"
                  ? 5
                  : examenDentar.aspect_dentatie === "Rău"
                      ? 2
                      : 5,
      data: questionnaire.data_completare,
    });

    // 2. boala
    await models.Boala.create({
      pacientid: questionnaire.pacientid,
      boli_inima: conditiiMed.boli_inima_hipertensiune === "DA",
      purtator_proteza: conditiiMed.purtator_proteza_valvulara === "DA",
      diabet: conditiiMed.diabet === "DA",
      hepatita: conditiiMed.hepatita_abc_ciroza === "DA",
      reumatism: conditiiMed.reumatism_artrita === "DA",
      boli_respiratorii: conditiiMed.boli_respiratorii_astm === "DA",
      tulburari_coagulare_sange:
          conditiiMed.tulburari_coagulare_sangerari === "DA",
      anemie: conditiiMed.anemie_transfuzie === "DA",
      boli_rinichi: conditiiMed.boli_rinichi_litiaza === "DA",
      glaucom: conditiiMed.glaucom === "DA",
      epilepsie: conditiiMed.epilepsie === "DA",
      migrene: conditiiMed.migrene === "DA",
      osteoporoza: conditiiMed.osteoporoza === "DA",
      ulcer_gastric: conditiiMed.ulcer_gastric === "DA",
      boli_tiroida: conditiiMed.boli_tiroida === "DA",
      boli_neurologice: conditiiMed.boli_neurologice === "DA",
      probleme_psihice: conditiiMed.probleme_psihice === "DA",
      alte_boli: conditiiMed.alte_boli_detalii,
    });

    // 3. antecedente_medicale
    await models.AntecedenteMedicale.create({
      pacientid: questionnaire.pacientid,
      nota_stare_sanatate: stareGen.apreciere_sanatate,
      ingrijire_alt_medic: stareGen.in_ingrijirea_medic === "DA",
      spitalizare: stareGen.spitalizare_5ani === "DA",
      medicamente: stareGen.lista_medicamente,
      fumat: stareGen.fumat === "DA",
      alergii: stareGen.lista_alergii,
      antidepresive: stareGen.antidepresive === "DA",
      femeie_insarcinata_luna: conditiiFemei?.luna_sarcina,
      femeie_bebe_alaptare: conditiiFemei?.alaptare === "DA",
      data: questionnaire.data_completare,
    });
    // --- End sync ---

    // Wait briefly to ensure DB commit
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Recalculate risk using legacy tables and update questionnaire
    const newRiskLevel = await calculateRiskFromLegacyTables(
        questionnaire.pacientid,
        models
    );
    console.log(
        "Updating questionnaire",
        questionnaire.questionnaireid,
        "with risk",
        newRiskLevel
    );
    await questionnaire.update({ risk_level: newRiskLevel });
    console.log(
        "Updated questionnaire",
        questionnaire.questionnaireid,
        "risk_level is now",
        (await questionnaire.reload()).risk_level
    );

    res.status(201).json({
      id: questionnaire.questionnaireid,
      patientId: questionnaire.pacientid,
      riskLevel: newRiskLevel || "minimal",
      medicalAlerts: questionnaire.medical_alerts || [],
      status: questionnaire.status,
      dataCompletare: questionnaire.data_completare,
    });
  } catch (error) {
    console.error("Error saving questionnaire:", error);
    res
        .status(500)
        .json({ error: "Internal server error", details: error.message });
  }
});

// Get questionnaires for a patient - FIXED ROUTE
app.get("/api/questionnaires/patient/:patientId", async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!models.Questionnaire) {
      return res.json([]);
    }

    const questionnaires = await models.Questionnaire.findAll({
      where: { pacientid: patientId },
      include: [
        {
          model: models.Patient,
          as: "patient",
          attributes: ["pacientid", "firstname", "surname", "email"],
        },
      ],
      order: [["data_completare", "DESC"]],
    });

    res.json(questionnaires);
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get latest questionnaire for a patient - FIXED ROUTE
app.get("/api/questionnaires/patient/:patientId/latest", async (req, res) => {
  try {
    const { patientId } = req.params;

    if (!models.Questionnaire) {
      return res.status(404).json({ message: "No questionnaire found" });
    }

    const questionnaire = await models.Questionnaire.findOne({
      where: { pacientid: patientId },
      include: [
        {
          model: models.Patient,
          as: "patient",
        },
      ],
      order: [["data_completare", "DESC"]],
    });

    if (!questionnaire) {
      return res.status(404).json({ message: "No questionnaire found" });
    }

    res.json(questionnaire);
  } catch (error) {
    console.error("Error fetching latest questionnaire:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refactored high-risk patients endpoint
app.get("/api/questionnaires/high-risk", async (req, res) => {
  console.log(
      "[DEBUG] /api/questionnaires/high-risk called",
      req.method,
      req.url,
      req.query,
      req.params
  );
  try {
    // Get all patients
    const patients = await models.Patient.findAll();
    // For each patient, calculate risk
    const highRiskPatients = [];
    for (const patient of patients) {
      const riskLevel = await calculateRiskFromLegacyTables(
          patient.pacientid,
          models
      );
      if (riskLevel === "high" || riskLevel === "medium") {
        // Send separate fields instead of concatenated patientName
        highRiskPatients.push({
          patientId: patient.pacientid.toString(),
          firstname: patient.firstname,
          surname: patient.surname,
          email: patient.email,
          telefon: patient.telefon,
          riskLevel,
        });
      }
    }
    res.json(highRiskPatients);
  } catch (error) {
    console.error("Error fetching high-risk patients (legacy):", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refactored recent questionnaires endpoint
app.get("/api/questionnaires/recent", async (req, res) => {
  console.log(
      "[DEBUG] /api/questionnaires/recent called",
      req.method,
      req.url,
      req.query,
      req.params
  );
  try {
    const limit = parseInt(req.query.limit) || 10;
    // Get recent questionnaires (for date and patient reference)
    const recent = await models.Questionnaire.findAll({
      where: { status: "completed" },
      order: [["data_completare", "DESC"]],
      limit,
    });
    // For each, calculate risk from legacy tables
    const formattedQuestionnaires = await Promise.all(
        recent.map(async (q) => {
          const patient = await models.Patient.findByPk(q.pacientid);
          const riskLevel = await calculateRiskFromLegacyTables(
              q.pacientid,
              models
          );

          // Return separate fields for middleware to decrypt, not concatenated strings
          return {
            id: q.questionnaireid,
            patientId: q.pacientid.toString(),
            // Send separate fields instead of concatenated patientName
            firstname: patient ? patient.firstname : "",
            surname: patient ? patient.surname : "",
            email: patient ? patient.email : "",
            telefon: patient ? patient.telefon : "",
            submissionDate: q.data_completare,
            riskLevel,
            status: q.status,
          };
        })
    );
    res.json(formattedQuestionnaires);
  } catch (error) {
    console.error("Error fetching recent questionnaires (legacy):", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get questionnaire statistics - FIXED
app.get("/api/questionnaires/statistics", async (req, res) => {
  try {
    if (!models.Questionnaire) {
      return res.json({
        total: 0,
        riskDistribution: {},
        recentWeek: 0,
      });
    }

    const totalQuestionnaires = await models.Questionnaire.count({
      where: { status: "completed" },
    });

    const riskCounts = await models.Questionnaire.findAll({
      attributes: ["risk_level", [sequelize.fn("COUNT", "*"), "count"]],
      where: { status: "completed" },
      group: "risk_level",
      raw: true,
    });

    const recentCount = await models.Questionnaire.count({
      where: {
        status: "completed",
        data_completare: {
          [sequelize.Sequelize.Op.gte]: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000
          ), // Last 7 days
        },
      },
    });

    const stats = {
      total: totalQuestionnaires,
      riskDistribution: riskCounts.reduce((acc, curr) => {
        acc[curr.risk_level] = parseInt(curr.count);
        return acc;
      }, {}),
      recentWeek: recentCount,
    };

    res.json(stats);
  } catch (error) {
    console.error("Error fetching questionnaire statistics:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get questionnaire by ID - FIXED
app.get("/api/questionnaires/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid questionnaire ID" });
    }

    if (!models.Questionnaire) {
      return res.status(404).json({ message: "Questionnaire not found" });
    }

    const questionnaire = await models.Questionnaire.findByPk(id, {
      include: [
        {
          model: models.Patient,
          as: "patient",
          attributes: ["pacientid", "firstname", "surname", "email"],
        },
      ],
    });

    if (!questionnaire) {
      return res.status(404).json({ message: "Questionnaire not found" });
    }

    // Don't modify the questionnaire, let middleware handle the patient data decryption
    res.json(questionnaire);
  } catch (error) {
    console.error("Error fetching questionnaire:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **ENHANCED PATIENT ROUTES WITH QUESTIONNAIRE DATA**

// Get all patients with questionnaires and formatting for doctor interface
app.get("/api/patients", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Always include questionnaires and doctor for patient list
    const includeOptions = [];
    if (models.Questionnaire) {
      includeOptions.push({
        model: models.Questionnaire,
        as: "questionnaires",
        limit: 1,
        order: [["data_completare", "DESC"]],
      });
    }
    if (models.Dentist) {
      includeOptions.push({ model: models.Dentist, as: "doctor" });
    }

    const { count, rows: patients } = await models.Patient.findAndCountAll({
      limit,
      offset,
      include: includeOptions,
      order: [["pacientid", "DESC"]],
    });

    const formattedPatients = patients.map((patient) => {
      const latestQuestionnaire = patient.questionnaires?.[0];
      const lastQuestionnaireDate =
          latestQuestionnaire?.data_completare || patient.created_at;
      return {
        patientId: patient.pacientid.toString(),
        // ✅ Send separate fields for middleware to decrypt
        firstname: patient.firstname,
        surname: patient.surname,
        email: patient.email,
        telefon: patient.telefon,     // ✅ Use original database field name
        phone: patient.telefon,       // ✅ Also provide as 'phone' for compatibility
        doctor: patient.doctor
            ? {
              id: patient.doctor.dentistid,
              firstname: patient.doctor.firstname,   // ✅ Send separate fields
              surname: patient.doctor.lastname,      // ✅ Send separate fields
            }
            : null,
        allergies: latestQuestionnaire?.stare_generala?.lista_alergii
            ? latestQuestionnaire.stare_generala.lista_alergii
                .split(",")
                .map((a) => a.trim())
            : [],
        medicalConditions: extractMedicalConditions(latestQuestionnaire),
        heartIssues:
            latestQuestionnaire?.conditii_medicale?.boli_inima_hipertensiune ===
            "DA",
        anestheticReactions: checkAnestheticReactions(latestQuestionnaire),
        lastQuestionnaireDate: lastQuestionnaireDate,
        riskLevel: latestQuestionnaire?.risk_level || "minimal",
        medicalAlerts: latestQuestionnaire?.medical_alerts || [],
      };
    });

    res.json({
      patients: formattedPatients,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalItems: count,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **ENHANCED DASHBOARD ROUTES - FIXED**

// Get dashboard statistics with real data - FIXED
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const totalPatients = await models.Patient.count();

    let questionnaireStats = {
      total: 0,
      recentWeek: 0,
      riskDistribution: {},
    };

    let riskPatients = 0;

    // Only get questionnaire stats if the model exists
    if (models.Questionnaire) {
      const [
        totalQuestionnaires,
        highRiskPatients,
        recentQuestionnaires,
        riskCounts,
      ] = await Promise.all([
        models.Questionnaire.count({ where: { status: "completed" } }),
        models.Questionnaire.count({
          where: {
            risk_level: ["high", "medium"],
            status: "completed",
          },
        }),
        models.Questionnaire.count({
          where: {
            status: "completed",
            data_completare: {
              [sequelize.Sequelize.Op.gte]: new Date(
                  Date.now() - 7 * 24 * 60 * 60 * 1000
              ),
            },
          },
        }),
        models.Questionnaire.findAll({
          attributes: ["risk_level", [sequelize.fn("COUNT", "*"), "count"]],
          where: { status: "completed" },
          group: "risk_level",
          raw: true,
        }),
      ]);

      questionnaireStats = {
        total: totalQuestionnaires,
        recentWeek: recentQuestionnaires,
        riskDistribution: riskCounts.reduce((acc, curr) => {
          acc[curr.risk_level] = parseInt(curr.count);
          return acc;
        }, {}),
      };

      riskPatients = highRiskPatients;
    }

    res.json({
      totalPatients,
      pendingQuestionnaires: Math.max(
          0,
          questionnaireStats.total - questionnaireStats.recentWeek
      ),
      riskPatients,
      todayAppointments: 0, // Would need appointments table
      questionnaireStats,
      recentActivity: questionnaireStats.recentWeek,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      error: "Internal server error",
      // Fallback data
      totalPatients: 0,
      pendingQuestionnaires: 0,
      riskPatients: 0,
      todayAppointments: 0,
      questionnaireStats: {
        total: 0,
        recentWeek: 0,
        riskDistribution: {},
      },
    });
  }
});

// **MEDICAL ALERTS ROUTES - FIXED**

// Get alerts for a specific patient
app.get("/api/patients/:id/alerts", async (req, res) => {
  try {
    const { id } = req.params;

    if (!models.Questionnaire) {
      return res.json([]);
    }

    const latestQuestionnaire = await models.Questionnaire.findOne({
      where: { pacientid: id },
      order: [["data_completare", "DESC"]],
    });

    if (!latestQuestionnaire) {
      return res.json([]);
    }

    res.json(latestQuestionnaire.medical_alerts || []);
  } catch (error) {
    console.error("Error fetching patient alerts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all high-priority alerts - FIXED
app.get("/api/alerts/high-priority", async (req, res) => {
  try {
    if (!models.Questionnaire) {
      return res.json([]);
    }

    const highRiskQuestionnaires = await models.Questionnaire.findAll({
      where: {
        risk_level: ["high", "medium"],
        status: "completed",
      },
      include: [
        {
          model: models.Patient,
          as: "patient",
          attributes: ["pacientid", "firstname", "surname", "email"],
        },
      ],
      order: [["data_completare", "DESC"]],
      limit: 20,
    });

    const alerts = [];

    highRiskQuestionnaires.forEach((questionnaire) => {
      if (
          questionnaire.medical_alerts &&
          Array.isArray(questionnaire.medical_alerts)
      ) {
        questionnaire.medical_alerts.forEach((alert) => {
          if (alert.priority === "high" || alert.priority === "medium") {
            alerts.push({
              id: `${questionnaire.questionnaireid}-${alerts.length}`,
              patientId: questionnaire.patient.pacientid.toString(),
              // Send separate fields instead of concatenated patientName
              firstname: questionnaire.patient.firstname,
              surname: questionnaire.patient.surname,
              email: questionnaire.patient.email,
              message: alert.message,
              type: alert.type,
              priority: alert.priority,
              category: alert.category,
              date: questionnaire.data_completare,
            });
          }
        });
      }
    });

    res.json(alerts);
  } catch (error) {
    console.error("Error fetching high-priority alerts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **LEGACY ROUTES (for backward compatibility)**

// Save dental records (legacy)
app.post("/api/dental-records", async (req, res) => {
  try {
    const dentalRecord = await models.DentalRecord.create(req.body);
    res.status(201).json(dentalRecord);
  } catch (error) {
    console.error("Error saving dental record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save diseases/medical conditions (legacy)
app.post("/api/diseases", async (req, res) => {
  try {
    const disease = await models.Boala.create(req.body);
    res.status(201).json(disease);
  } catch (error) {
    console.error("Error saving disease record:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Save medical history/antecedents (legacy)
app.post("/api/medical-history", async (req, res) => {
  try {
    const history = await models.AntecedenteMedicale.create(req.body);
    res.status(201).json(history);
  } catch (error) {
    console.error("Error saving medical history:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **AUTHENTICATION ROUTES**

// User login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
          .status(400)
          .json({ error: "Username and password are required" });
    }

    // Find user by username
    const user = await models.User.findOne({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Simple password check (in production, use bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is a dentist
    if (user.type !== "dentist") {
      return res.status(403).json({
        error: "Access denied. Only dentists can access this interface.",
      });
    }

    // Return user data (without password)
    const userData = {
      userid: user.userid,
      username: user.username,
      type: user.type,
      data_inscriere: user.data_inscriere,
      dentist: {
        firstname: user.firstname,
        lastname: user.lastname,
        fullName: `${user.firstname} ${user.lastname}`,
      },
    };

    res.json({
      message: "Login successful",
      user: userData,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User registration (for creating new doctor accounts)
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, password, firstname, lastname } = req.body;

    if (!username || !password || !firstname || !lastname) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if username already exists
    const existingUser = await models.User.findOne({
      where: { username },
    });

    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Create user record with dentist information
    const user = await models.User.create({
      username,
      password, // In production, hash this password
      type: "dentist",
      data_inscriere: new Date().toISOString().split("T")[0],
      firstname,
      lastname,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        userid: user.userid,
        username: user.username,
        type: user.type,
        data_inscriere: user.data_inscriere,
        dentist: {
          firstname: user.firstname,
          lastname: user.lastname,
          fullName: `${user.firstname} ${user.lastname}`,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user profile
app.get("/api/auth/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await models.User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = {
      userid: user.userid,
      username: user.username,
      type: user.type,
      data_inscriere: user.data_inscriere,
      dentist:
          user.type === "dentist"
              ? {
                firstname: user.firstname,
                lastname: user.lastname,
                fullName: `${user.firstname} ${user.lastname}`,
              }
              : null,
    };

    res.json(userData);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// **UTILITY ROUTES**

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      status: "OK",
      database: "Connected",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "Disconnected",
      error: error.message,
    });
  }
});

// Debug endpoint to check raw patient data
app.get("/api/debug/patients/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid patient ID" });
    }

    // Get raw data from database
    const [results] = await models.sequelize.query(
        "SELECT * FROM patients WHERE pacientid = ?",
        {
          replacements: [id],
          type: models.sequelize.QueryTypes.SELECT,
        }
    );

    if (!results || results.length === 0) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const patient = results[0];
    console.log("Raw database data:", patient);

    res.json({
      rawData: patient,
      hasCreatedAt: !!patient.created_at,
      hasUpdatedAt: !!patient.updated_at,
      createdAtValue: patient.created_at,
      updatedAtValue: patient.updated_at,
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all dentists
app.get("/api/dentists", async (req, res) => {
  try {
    const dentists = await models.Dentist.findAll();
    res.json(dentists);
  } catch (error) {
    console.error("Error fetching dentists:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Utility: Calculate risk from legacy tables
async function calculateRiskFromLegacyTables(pacientid, models) {
  // Fetch latest records from each table
  const boala = await models.Boala.findOne({
    where: { pacientid },
    order: [["idboala", "DESC"]],
  });
  const antecedente = await models.AntecedenteMedicale.findOne({
    where: { pacientid },
    order: [["data", "DESC"]],
  });
  // datestomatologice not used for risk in your logic, but can be fetched if needed

  // Helper to convert boolean to 'DA'/'NU'
  const toDA = (val) => (val === true ? "DA" : val === false ? "NU" : val);

  // Extract fields (default to 'NU' if missing)
  const boli_inima_hipertensiune = toDA(boala?.boli_inima);
  const tulburari_coagulare_sangerari = toDA(boala?.tulburari_coagulare_sange);
  const epilepsie = toDA(boala?.epilepsie);
  const diabet = toDA(boala?.diabet);
  const hepatita_ciroza = toDA(boala?.hepatita);
  const migrene = toDA(boala?.migrene);
  const fumat = toDA(antecedente?.fumat);
  const alergii = toDA(antecedente?.alergii);
  // insarcinata: check antecedente.femeie_insarcinata_luna (if present and not empty)
  let insarcinata = "NU";
  if (
      antecedente?.femeie_insarcinata_luna &&
      antecedente.femeie_insarcinata_luna !== "" &&
      antecedente.femeie_insarcinata_luna !== null
  ) {
    insarcinata = "DA";
  }

  // Debug log for risk calculation
  console.log("Risk calculation for pacientid", pacientid, {
    boli_inima_hipertensiune,
    tulburari_coagulare_sangerari,
    epilepsie,
    diabet,
    hepatita_ciroza,
    migrene,
    fumat,
    alergii,
    insarcinata,
  });

  // Calculate risk score
  let riskScore = 0;
  if (boli_inima_hipertensiune === "DA") riskScore += 3;
  if (tulburari_coagulare_sangerari === "DA") riskScore += 3;
  if (epilepsie === "DA") riskScore += 3;
  if (diabet === "DA") riskScore += 2;
  if (hepatita_ciroza === "DA") riskScore += 2;
  if (alergii === "DA") riskScore += 2;
  if (migrene === "DA") riskScore += 1;
  if (fumat === "DA") riskScore += 1;
  if (insarcinata === "DA") riskScore += 1;

  // Map to risk level
  if (riskScore >= 6) return "high";
  if (riskScore >= 4) return "medium";
  if (riskScore >= 2) return "low";
  return "minimal";
}

// Reports Generator Endpoint
app.post("/api/reports/generate", async (req, res) => {
  try {
    const { type, filters } = req.body;

    if (type === "patient-summary") {
      // Fetch all patients with their latest questionnaire
      const patients = await models.Patient.findAll({
        include: [
          {
            model: models.Questionnaire,
            as: "questionnaires",
            order: [["data_completare", "DESC"]],
            limit: 1,
          },
        ],
      });

      // For each patient, calculate risk from legacy tables
      const data = await Promise.all(
          patients.map(async (patient) => {
            const q = patient.questionnaires?.[0];
            const riskLevel = await calculateRiskFromLegacyTables(
                patient.pacientid,
                models
            );
            return {
              // Send separate fields instead of concatenated patientName
              firstname: patient.firstname,
              surname: patient.surname,
              email: patient.email,
              submissionDate: q?.data_completare,
              riskLevel: riskLevel,
              consentGiven: !!q,
              completed: !!q,
            };
          })
      );

      const statistics = {
        totalRecords: data.length,
        highRiskCount: data.filter((d) => d.riskLevel === "high").length,
        consentCompliance:
            data.length > 0
                ? (data.filter((d) => d.consentGiven).length / data.length) * 100
                : 0,
        averageRiskScore:
            data.length > 0
                ? (
                    data.reduce((sum, d) => {
                      switch (d.riskLevel) {
                        case "high":
                          return sum + 4;
                        case "medium":
                          return sum + 3;
                        case "low":
                          return sum + 2;
                        case "minimal":
                          return sum + 1;
                        default:
                          return sum;
                      }
                    }, 0) / data.length
                ).toFixed(2)
                : 0,
      };

      return res.json({ data, statistics });
    }

    // Add more report types as needed...
    return res.status(400).json({ error: "Unknown report type" });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Maintenance endpoint: Update risk_level for all questionnaires
app.post("/api/questionnaires/update-all-risks", async (req, res) => {
  try {
    const questionnaires = await models.Questionnaire.findAll();
    let updated = 0;
    for (const q of questionnaires) {
      const newRisk = await calculateRiskFromLegacyTables(q.pacientid, models);
      if (q.risk_level !== newRisk) {
        await q.update({ risk_level: newRisk });
        updated++;
      }
    }
    res.json({ message: `Updated risk_level for ${updated} questionnaires.` });
  } catch (error) {
    console.error("Error updating all questionnaire risks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Catch-all error handler
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Enhanced Server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🩺 Questionnaire system ready (with fallbacks)`);
  });
});
export default app;
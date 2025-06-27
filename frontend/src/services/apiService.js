import axios from "axios";

// Vite uses import.meta.env instead of process.env
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.data
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("API Response Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

class ApiService {
  // **AUTHENTICATION METHODS**

  // User login
  static async loginUser(username, password) {
    try {
      const response = await apiClient.post("/auth/login", {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Invalid credentials");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Access denied. Only dentists can access this interface."
        );
      }
      throw error;
    }
  }

  // User registration
  static async registerUser(userData) {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(error.response.data.error || "Registration failed");
      }
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const response = await apiClient.get(`/auth/profile/${userId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      }
      throw error;
    }
  }

  // **PATIENT METHODS**

  // Get patient by CNP (for login)
  static async getPatientByCNP(cnp) {
    try {
      const response = await apiClient.get(`/patients/cnp/${cnp}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Patient not found
      }
      throw error;
    }
  }

  // Create new patient
  static async createPatient(patientData) {
    const response = await apiClient.post("/patients", patientData);
    return response.data;
  }

  // Get patient by ID with full medical data
  static async getPatientById(patientId) {
    try {
      const response = await apiClient.get(`/patients/${patientId}`);

      console.log("Raw patient by ID from API:", response.data); // Debug

      // Transform the response to combine firstname + surname and fix phone
      const patient = response.data;
      const transformed = {
        ...patient,
        fullName: `${patient.firstname || ""} ${patient.surname || ""}`.trim(),
        patientName: `${patient.firstname || ""} ${
          patient.surname || ""
        }`.trim(),
        // Ensure phone field is available
        phone: patient.phone || patient.telefon,
        telefon: patient.telefon,
        doctor: patient.doctor
          ? {
              ...patient.doctor,
              fullName: `${patient.doctor.firstname || ""} ${
                patient.doctor.surname || ""
              }`.trim(),
              firstName: patient.doctor.firstname,
              lastName: patient.doctor.surname,
            }
          : null,
      };

      console.log("Transformed patient by ID:", transformed); // Debug
      return transformed;
    } catch (error) {
      console.error("Error fetching patient by ID:", error);
      throw error;
    }
  }

  // Get existing questionnaires for a patient
  static async getPatientQuestionnaires(patientId) {
    try {
      const response = await apiClient.get(
        `/questionnaires/patient/${patientId}`
      );

      // Transform questionnaire data to handle nested patient info
      return response.data.map((questionnaire) => ({
        ...questionnaire,
        patient: questionnaire.patient
          ? {
              ...questionnaire.patient,
              fullName: `${questionnaire.patient.firstname || ""} ${
                questionnaire.patient.surname || ""
              }`.trim(),
              patientName: `${questionnaire.patient.firstname || ""} ${
                questionnaire.patient.surname || ""
              }`.trim(),
            }
          : null,
      }));
    } catch (error) {
      console.warn("No existing questionnaires found for patient:", patientId);
      return [];
    }
  }

  // Update patient information
  static async updatePatient(patientId, updates) {
    const response = await apiClient.put(`/patients/${patientId}`, updates);
    return response.data;
  }

  // **ENHANCED QUESTIONNAIRE METHODS WITH FALLBACKS**

  // Save complete medical questionnaire with fallback to legacy method
  static async saveMedicalQuestionnaire(questionnaireData) {
    try {
      console.log("Saving complete questionnaire:", questionnaireData);

      // Try the new questionnaire endpoint first
      const response = await apiClient.post("/questionnaires", {
        pacientid: questionnaireData.pacient_id,
        medic: questionnaireData.medic,
        nr_fisa: questionnaireData.nr_fisa,

        // Referral data
        indrumare_dr: questionnaireData.indrumare?.dr || false,
        indrumare_internet: questionnaireData.indrumare?.internet || false,
        indrumare_altele: questionnaireData.indrumare?.altele || false,
        indrumare_altele_detalii:
          questionnaireData.indrumare?.altele_detalii || null,

        // Store complex data as JSON
        examen_dentar: questionnaireData.examen_dentar || {},
        stare_generala: questionnaireData.stare_generala || {},
        conditii_medicale: questionnaireData.conditii_medicale || {},
        conditii_femei: questionnaireData.conditii_femei || null,
        procesare_date: questionnaireData.procesare_date || {},
        acord_general: questionnaireData.acord_general || {},
        acord_pedodontie: questionnaireData.acord_pedodontie || {},
        acord_endodontic: questionnaireData.acord_endodontic || {},

        // Metadata
        data_completare:
          questionnaireData.data_completare || new Date().toISOString(),
        versiune_formular:
          questionnaireData.versiune_formular || "PDF_COMPLETE_V2",
        status: questionnaireData.status || "completed",
      });

      console.log("Complete questionnaire saved successfully:", response.data);
      return response.data;
    } catch (error) {
      console.warn(
        "Enhanced questionnaire save failed, falling back to legacy method:",
        error.message
      );

      // Fallback to legacy method
      return await this.saveMedicalQuestionnaireLegacy(questionnaireData);
    }
  }

  // Legacy save method for backward compatibility
  static async saveMedicalQuestionnaireLegacy(questionnaireData) {
    try {
      console.log("Using legacy questionnaire save method");

      // Save dental records
      const dentalResponse = await apiClient.post("/dental-records", {
        pacientid: questionnaireData.pacient_id,
        sanatategingii:
          questionnaireData.examen_dentar?.sangereaza_gingiile || "Nu",
        sensibilitatedinti:
          questionnaireData.examen_dentar?.sensibilitate_dinti === "DA",
        problemetratamentortodontic:
          questionnaireData.examen_dentar?.probleme_ortodontice || null,
        scrasnit_inclestat_scrasnit_dinti:
          questionnaireData.examen_dentar?.scrasnit_inclestat === "DA",
        ultim_consult_stomatologic:
          questionnaireData.examen_dentar?.data_ultim_consult || null,
        nota_aspect_dentatie: 5, // Default value
        probleme_tratament_stomatologic_anterior:
          questionnaireData.examen_dentar?.probleme_tratament_anterior || null,
        data: new Date().toISOString().split("T")[0],
      });

      // Save medical conditions (diseases)
      const boliResponse = await apiClient.post("/diseases", {
        pacientid: questionnaireData.pacient_id,
        boli_inima:
          questionnaireData.conditii_medicale?.boli_inima_hipertensiune ===
          "DA",
        purtator_proteza:
          questionnaireData.conditii_medicale?.purtator_proteza_valvulara ===
          "DA",
        diabet: questionnaireData.conditii_medicale?.diabet === "DA",
        hepatita:
          questionnaireData.conditii_medicale?.hepatita_abc_ciroza === "DA",
        reumatism:
          questionnaireData.conditii_medicale?.reumatism_artrita === "DA",
        boli_respiratorii:
          questionnaireData.conditii_medicale?.boli_respiratorii_astm === "DA",
        tulburari_coagulare_sange:
          questionnaireData.conditii_medicale?.tulburari_coagulare_sangerari ===
          "DA",
        anemie: questionnaireData.conditii_medicale?.anemie_transfuzie === "DA",
        boli_rinichi:
          questionnaireData.conditii_medicale?.boli_rinichi_litiaza === "DA",
        glaucom: questionnaireData.conditii_medicale?.glaucom === "DA",
        epilepsie: questionnaireData.conditii_medicale?.epilepsie === "DA",
        migrene: questionnaireData.conditii_medicale?.migrene === "DA",
        osteoporoza: questionnaireData.conditii_medicale?.osteoporoza === "DA",
        ulcer_gastric:
          questionnaireData.conditii_medicale?.ulcer_gastric === "DA",
        boli_tiroida:
          questionnaireData.conditii_medicale?.boli_tiroida === "DA",
        boli_neurologice:
          questionnaireData.conditii_medicale?.boli_neurologice === "DA",
        probleme_psihice:
          questionnaireData.conditii_medicale?.probleme_psihice === "DA",
        alte_boli:
          questionnaireData.conditii_medicale?.alte_boli_detalii || null,
      });

      // Save medical history (antecedents)
      const antecdenteResponse = await apiClient.post("/medical-history", {
        pacientid: questionnaireData.pacient_id,
        nota_stare_sanatate:
          questionnaireData.stare_generala?.apreciere_sanatate || "",
        ingrijire_alt_medic:
          questionnaireData.stare_generala?.in_ingrijirea_medic === "DA",
        spitalizare:
          questionnaireData.stare_generala?.spitalizare_5ani === "DA"
            ? questionnaireData.stare_generala?.motiv_spitalizare || "Da"
            : "Nu",
        medicamente:
          questionnaireData.stare_generala?.lista_medicamente || "Nu",
        fumat: questionnaireData.stare_generala?.fumat === "DA",
        alergii: questionnaireData.stare_generala?.lista_alergii || "Nu",
        antidepresive: questionnaireData.stare_generala?.antidepresive === "DA",
        femeie_insarcinata_luna:
          questionnaireData.conditii_femei?.insarcinata === "DA"
            ? questionnaireData.conditii_femei?.luna_sarcina || "Da"
            : null,
        femeie_bebe_alaptare:
          questionnaireData.conditii_femei?.alaptare === "DA",
        data: new Date().toISOString().split("T")[0],
      });

      return {
        legacy: true,
        dental: dentalResponse.data,
        diseases: boliResponse.data,
        history: antecdenteResponse.data,
      };
    } catch (error) {
      console.error("Error saving legacy medical questionnaire:", error);
      throw error;
    }
  }

  // **DOCTOR DASHBOARD METHODS WITH FALLBACKS**

  // Get dashboard statistics with fallback
  static async getDashboardStats() {
    try {
      const response = await apiClient.get("/dashboard/stats");
      return response.data;
    } catch (error) {
      console.warn(
        "Dashboard stats failed, using fallback data:",
        error.message
      );

      // Fallback to basic patient count
      try {
        const patientsResponse = await apiClient.get("/patients?limit=1");
        return {
          totalPatients: patientsResponse.data.totalItems || 0,
          pendingQuestionnaires: 0,
          riskPatients: 0,
          todayAppointments: 0,
          questionnaireStats: {
            total: 0,
            recentWeek: 0,
            riskDistribution: {},
          },
        };
      } catch (fallbackError) {
        // Ultimate fallback
        return {
          totalPatients: 0,
          pendingQuestionnaires: 0,
          riskPatients: 0,
          todayAppointments: 0,
          questionnaireStats: {
            total: 0,
            recentWeek: 0,
            riskDistribution: {},
          },
        };
      }
    }
  }

  // Get recent questionnaires with fallback
  static async getRecentQuestionnaires(limit = 10) {
    try {
      const response = await apiClient.get(
        `/questionnaires/recent?limit=${limit}`
      );

      // Now the API returns separate firstname, surname fields instead of patientName
      return response.data.map((item) => ({
        ...item,
        patientName: `${item.firstname || ""} ${item.surname || ""}`.trim(), // Combine here
        patientId: item.patientId,
        submissionDate: item.submissionDate,
        riskLevel: item.riskLevel,
        status: item.status,
      }));
    } catch (error) {
      console.warn("Recent questionnaires failed:", error.message);
      return [];
    }
  }

  // Get high priority alerts with fallback
  static async getHighPriorityAlerts() {
    try {
      const response = await apiClient.get("/alerts/high-priority");

      // Now the API returns separate firstname, surname fields
      return response.data.map((alert) => ({
        ...alert,
        patientName: `${alert.firstname || ""} ${alert.surname || ""}`.trim(), // Combine here
      }));
    } catch (error) {
      console.warn("High priority alerts failed:", error.message);
      return [];
    }
  }

  // Get high risk patients with fallback
  static async getHighRiskPatients() {
    try {
      const response = await apiClient.get("/questionnaires/high-risk");

      return response.data.map((patient) => ({
        patientId: patient.patientId,
        patientName: `${patient.firstname || ""} ${
          patient.surname || ""
        }`.trim(), // Combine here
        email: patient.email,
        telefon: patient.telefon,
        riskLevel: patient.riskLevel,
        heartIssues: patient.heartIssues,
        allergies: patient.allergies || [],
        medicalConditions: patient.medicalConditions || [],
      }));
    } catch (error) {
      console.warn("High risk patients failed:", error.message);
      return [];
    }
  }

  // Helper method to generate risk descriptions
  static generateRiskDescription(patient) {
    const risks = [];

    if (patient.allergies?.length > 0) {
      risks.push(`Alergii: ${patient.allergies.join(", ")}`);
    }

    if (patient.heartIssues) {
      risks.push("Probleme cardiace");
    }

    if (patient.medicalConditions?.length > 0) {
      risks.push(`Condiții: ${patient.medicalConditions.join(", ")}`);
    }

    return risks.length > 0 ? risks.join("; ") : "Risc evaluat automat";
  }

  // Get all patients with their medical data and questionnaires
  static async getAllPatients(page = 1, limit = 10) {
    try {
      const response = await apiClient.get(
        `/patients?page=${page}&limit=${limit}&include=questionnaires`
      );

      // Transform the data
      const transformedData = {
        ...response.data,
        patients: response.data.patients.map((patient) => ({
          ...patient,
          fullName: `${patient.firstname || ""} ${
            patient.surname || ""
          }`.trim(),
          patientName: `${patient.firstname || ""} ${
            patient.surname || ""
          }`.trim(),
          doctor: patient.doctor
            ? {
                ...patient.doctor,
                fullName: `${patient.doctor.firstname || ""} ${
                  patient.doctor.surname || ""
                }`.trim(),
              }
            : null,
        })),
      };

      return transformedData;
    } catch (error) {
      console.error("Error fetching all patients:", error);
      return {
        patients: [],
        totalPages: 1,
        currentPage: 1,
        totalItems: 0,
      };
    }
  }

  // Get patients with medical conditions and risk alerts
  static async getPatientsWithConditions() {
    try {
      const response = await apiClient.get("/patients/with-conditions");
      return response.data;
    } catch (error) {
      // Fallback to regular patients endpoint
      const response = await apiClient.get("/patients?include=questionnaires");
      return response.data;
    }
  }

  // **SEARCH METHODS WITH FALLBACKS**

  // Search patients by name, email, or CNP with medical data
  static async searchPatients(searchTerm) {
    try {
      const response = await apiClient.get(
        `/patients/search?q=${encodeURIComponent(searchTerm)}&include=medical`
      );
      return response.data;
    } catch (error) {
      // Fallback to basic search
      const response = await apiClient.get(
        `/patients/search?q=${encodeURIComponent(searchTerm)}`
      );
      return response.data;
    }
  }

  // **PATIENT PROFILE METHODS**

  // Get detailed patient profile with all medical data
  static async getPatientProfile(patientId) {
    try {
      console.log("getPatientProfile called with patientId:", patientId);

      // Get patient basic info
      const patientResponse = await apiClient.get(`/patients/${patientId}`);
      console.log("Patient response:", patientResponse.data);

      // Transform patient data
      const patient = patientResponse.data;
      // Debug log for created_at
      console.log("created_at:", patient.created_at, typeof patient.created_at);
      console.log("createdAt:", patient.createdAt, typeof patient.createdAt);
      // Fix created_at to be a valid ISO string or null
      let createdAtValue = patient.created_at || patient.createdAt || null;
      if (
        createdAtValue &&
        typeof createdAtValue === "string" &&
        isNaN(Date.parse(createdAtValue))
      ) {
        createdAtValue = null;
      }
      const transformedPatient = {
        ...patient,
        created_at: createdAtValue,
        fullName: `${patient.firstname || ""} ${patient.surname || ""}`.trim(),
        patientName: `${patient.firstname || ""} ${
          patient.surname || ""
        }`.trim(),
        doctor: patient.doctor
          ? {
              ...patient.doctor,
              fullName: `${patient.doctor.firstname || ""} ${
                patient.doctor.surname || ""
              }`.trim(),
            }
          : null,
      };

      // Fetch all questionnaires for this patient
      let questionnaires = [];
      try {
        const questionnairesResponse = await apiClient.get(
          `/questionnaires/patient/${patientId}`
        );
        questionnaires = questionnairesResponse.data || [];
      } catch (qError) {
        console.warn("Could not fetch patient questionnaires:", qError.message);
      }

      // Try to get alerts
      let alerts = [];
      try {
        const alertsResponse = await apiClient.get(
          `/patients/${patientId}/alerts`
        );
        alerts = alertsResponse.data;
      } catch (alertError) {
        console.warn("Could not fetch patient alerts:", alertError.message);
      }

      return {
        patient: transformedPatient,
        questionnaires,
        alerts: alerts,
      };
    } catch (error) {
      console.error("Error in getPatientProfile:", error);
      throw error;
    }
  }

  // **REPORTS METHODS WITH FALLBACKS**

  // Generate medical reports with real database data
  static async generateReport(reportType, filters = {}) {
    try {
      const response = await apiClient.post("/reports/generate", {
        type: reportType,
        filters,
      });

      // Transform report data to combine firstname + surname
      if (response.data.data && Array.isArray(response.data.data)) {
        const transformedData = {
          ...response.data,
          data: response.data.data.map((item) => ({
            ...item,
            patientName: `${item.firstname || ""} ${item.surname || ""}`.trim(),
            fullName: `${item.firstname || ""} ${item.surname || ""}`.trim(),
          })),
        };
        return transformedData;
      }

      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  }

  // Generate mock report data as fallback
  static generateMockReport(reportType) {
    const mockData = {
      "patient-summary": {
        data: [
          {
            patientName: "Pacient Demo",
            email: "demo@test.com",
            submissionDate: new Date().toISOString(),
            riskLevel: "Minimal",
            consentGiven: true,
          },
        ],
        statistics: {
          totalRecords: 1,
          highRiskCount: 0,
          consentCompliance: 100,
          averageRiskScore: 2.0,
        },
      },
      "risk-analysis": {
        data: [],
        statistics: {
          totalRecords: 0,
          highRiskCount: 0,
          averageRiskScore: 0,
        },
      },
      "allergy-report": {
        data: [],
        statistics: {
          totalRecords: 0,
          topAllergies: [],
        },
      },
    };

    return mockData[reportType] || { data: [], statistics: {} };
  }

  // **UTILITY METHODS**

  // Test database connection
  static async testConnection() {
    try {
      const response = await apiClient.get("/health");
      return response.data;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return { status: "ERROR", database: "Disconnected" };
    }
  }

  // Get database schema information
  static async getDatabaseInfo() {
    try {
      const response = await apiClient.get("/admin/database-info");
      return response.data;
    } catch (error) {
      console.warn("Could not fetch database info:", error.message);
      return {
        database: "postgres",
        tables: { patients: 0, questionnaires: 0 },
        version: "2.0.0",
      };
    }
  }

  // **DOCTOR INTERFACE SPECIFIC METHODS**

  // Get formatted patient list for doctor interface with fallbacks
  static async getFormattedPatientList(page = 1, limit = 10, filters = {}) {
    try {
      const response = await apiClient.get("/patients", {
        params: { page, limit, ...filters },
      });

      console.log("Raw patient data from API:", response.data); // Debug

      // Transform the data to combine firstname + surname into fullName
      const transformedData = {
        ...response.data,
        patients: response.data.patients.map((patient) => {
          const transformed = {
            ...patient,
            fullName: `${patient.firstname || ""} ${
              patient.surname || ""
            }`.trim(),
            patientName: `${patient.firstname || ""} ${
              patient.surname || ""
            }`.trim(),
            // Ensure phone field is available as both 'phone' and original field name
            // phone: patient.phone || patient.telefon,
            telefon: patient.telefon,
            doctor: patient.doctor
              ? {
                  ...patient.doctor,
                  fullName: `${patient.doctor.firstname || ""} ${
                    patient.doctor.surname || ""
                  }`.trim(),
                  firstName: patient.doctor.firstname,
                  lastName: patient.doctor.surname,
                }
              : null,
          };

          console.log("Transformed patient:", transformed); // Debug
          return transformed;
        }),
      };

      return transformedData;
    } catch (error) {
      console.warn("Formatted patient list failed:", error.message);
      return {
        patients: [],
        totalPages: 1,
        currentPage: 1,
        totalItems: 0,
      };
    }
  }

  // **REAL-TIME DASHBOARD DATA WITH FALLBACKS**

  // Get real dashboard statistics with comprehensive fallbacks
  static async getRealDashboardStats() {
    try {
      const [statsResponse, alertsResponse, recentResponse] =
        await Promise.allSettled([
          this.getDashboardStats(),
          this.getHighPriorityAlerts(),
          this.getRecentQuestionnaires(5),
        ]);

      return {
        statistics:
          statsResponse.status === "fulfilled"
            ? statsResponse.value
            : {
                totalPatients: 0,
                pendingQuestionnaires: 0,
                riskPatients: 0,
                todayAppointments: 0,
                questionnaireStats: {
                  total: 0,
                  recentWeek: 0,
                  riskDistribution: {},
                },
              },
        highPriorityAlerts:
          alertsResponse.status === "fulfilled" ? alertsResponse.value : [],
        recentQuestionnaires:
          recentResponse.status === "fulfilled" ? recentResponse.value : [],
      };
    } catch (error) {
      console.error("Error fetching real dashboard stats:", error);

      // Ultimate fallback
      return {
        statistics: {
          totalPatients: 0,
          pendingQuestionnaires: 0,
          riskPatients: 0,
          todayAppointments: 0,
          questionnaireStats: { total: 0, recentWeek: 0, riskDistribution: {} },
        },
        highPriorityAlerts: [],
        recentQuestionnaires: [],
      };
    }
  }

  // **CONSENT METHODS (with fallbacks)**

  // Save consent form data
  static async saveConsent(consentData) {
    try {
      const response = await apiClient.post("/consents", consentData);
      return response.data;
    } catch (error) {
      console.warn(
        "Consent save failed, data may not be stored:",
        error.message
      );
      // Return a mock success response
      return {
        id: Date.now(),
        patientId: consentData.patientId,
        saved: false,
        message: "Consent data could not be saved to database",
      };
    }
  }

  // Get consent by patient ID
  static async getConsentByPatient(patientId) {
    try {
      const response = await apiClient.get(`/consents/patient/${patientId}`);
      return response.data;
    } catch (error) {
      console.warn("Could not fetch consent data:", error.message);
      return null;
    }
  }

  // Get all dentists
  static async getAllDentists() {
    const response = await apiClient.get("/dentists");
    return response.data;
  }
}

export default ApiService;

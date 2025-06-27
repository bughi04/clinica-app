import crypto from "crypto";

class DataEncryption {
  constructor() {
    // Get encryption key from environment or use default for development
    this.algorithm = "aes-256-cbc";

    // Handle base64 encoded key from .env
    let keyString =
      process.env.ENCRYPTION_KEY ||
      "SxnDMpjYIKUfH4ffi91PB9CwK7i4ZJfYu47GDbd0lEg";

    // If it looks like base64, decode it
    try {
      if (keyString.includes("=") || keyString.length > 32) {
        this.key = Buffer.from(keyString, "base64");
        console.log("🔑 Using base64 decoded encryption key");
      } else {
        this.key = Buffer.from(keyString.padEnd(32, "0").substring(0, 32));
        console.log("🔑 Using string-based encryption key");
      }
    } catch (error) {
      console.error("❌ Key processing failed, using default:", error);
      this.key = Buffer.from("SxnDMpjYIKUfH4ffi91PB9CwK7i4ZJfYu47GDbd0lEg");
    }

    console.log("🔐 DataEncryption initialized, key length:", this.key.length);

    // Define which fields should be encrypted
    this.sensitiveFields = [
      "firstname",
      "surname",
      "CNP",
      "cnp",
      "email",
      "telefon",
      "phone", // ⬅️ Added 'phone'
      "address",
      "birthdate",
      "birthDate", // <-- Add camelCase version for API responses
      "alergii",
      "medicamente",
      "nume_reprezentant",
      "firstName",
      "lastName", // Add frontend field names too
      // DO NOT include 'created_at' or 'updated_at'
    ];
  }

  encryptField(text) {
    if (!text || typeof text !== "string") return text;

    try {
      console.log("🔒 Encrypting field:", text.substring(0, 10) + "...");

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");

      const result = iv.toString("hex") + ":" + encrypted;
      console.log("✅ Encrypted to:", result.substring(0, 20) + "...");

      return result;
    } catch (error) {
      console.error("❌ Encryption failed:", error);
      return text; // Return original if encryption fails
    }
  }

  decryptField(encryptedText) {
    if (!encryptedText || typeof encryptedText !== "string")
      return encryptedText;

    // Check if data is encrypted (has the format: hexstring:hexstring)
    const parts = encryptedText.split(":");
    if (parts.length !== 2) {
      // Not encrypted format - this is probably existing plain text data
      console.log(
        "📖 Found unencrypted data (existing record):",
        encryptedText.substring(0, 10) + "..."
      );
      return encryptedText; // Return as-is for existing data
    }

    try {
      console.log(
        "🔓 Decrypting field:",
        encryptedText.substring(0, 20) + "..."
      );

      const iv = Buffer.from(parts[0], "hex");
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");

      console.log("✅ Decrypted to:", decrypted.substring(0, 10) + "...");
      return decrypted;
    } catch (error) {
      console.log(
        "⚠️ Decryption failed, treating as plain text:",
        error.message
      );
      return encryptedText; // Return original if decryption fails (probably plain text)
    }
  }

  // Encrypt sensitive fields in an object
  encryptObject(obj) {
    if (!obj || typeof obj !== "object") return obj;

    const encrypted = { ...obj };

    this.sensitiveFields.forEach((field) => {
      if (encrypted[field] && typeof encrypted[field] === "string") {
        encrypted[field] = this.encryptField(encrypted[field]);
      }
    });

    return encrypted;
  }

  // Decrypt sensitive fields in an object
  decryptObject(obj) {
    if (!obj || typeof obj !== "object") return obj;

    const decrypted = { ...obj };

    this.sensitiveFields.forEach((field) => {
      if (decrypted[field] && typeof decrypted[field] === "string") {
        // Skip created_at and updated_at
        if (field === "created_at" || field === "updated_at") return;

        // Special debug logging for birthdate fields
        if (field === "birthdate" || field === "birthDate") {
          console.log(`🔓 Decrypting birthdate field: ${field}`);
          console.log(
            `🔓 Birthdate value before decryption:`,
            decrypted[field].substring(0, 30) + "..."
          );
        } else {
          console.log(`🔓 Decrypting field: ${field}`);
        }

        decrypted[field] = this.decryptField(decrypted[field]);

        // Special debug logging for birthdate fields after decryption
        if (field === "birthdate" || field === "birthDate") {
          console.log(
            `✅ Birthdate value after decryption:`,
            decrypted[field].substring(0, 30) + "..."
          );
        }
      }
    });

    return decrypted;
  }

  // Middleware for automatic encryption on incoming requests
  encryptionMiddleware() {
    return (req, res, next) => {
      if (req.body && typeof req.body === "object") {
        console.log(
          "🔒 MIDDLEWARE: Encrypting request data for:",
          req.method,
          req.originalUrl
        );
        console.log("📝 Original data keys:", Object.keys(req.body));

        const originalBody = { ...req.body };
        req.body = this.encryptObject(req.body);

        console.log("🔐 Encrypted data keys:", Object.keys(req.body));
        console.log(
          "🔄 Sample encryption - firstname before:",
          originalBody.firstname?.substring(0, 10)
        );
        console.log(
          "🔄 Sample encryption - firstname after:",
          req.body.firstname?.substring(0, 20)
        );
      } else {
        console.log(
          "⏭️ MIDDLEWARE: No body to encrypt for:",
          req.method,
          req.originalUrl
        );
      }
      next();
    };
  }

  // Recursively decrypt all objects/arrays
  recursiveDecrypt(obj) {
    if (Array.isArray(obj)) {
      return obj.map((item) => this.recursiveDecrypt(item));
    } else if (obj && typeof obj === "object") {
      // Decrypt sensitive fields at this level
      const decrypted = this.decryptObject(obj);
      // Recursively decrypt all properties, except specific date fields that should not be encrypted
      Object.keys(decrypted).forEach((key) => {
        if (
          key === "created_at" ||
          key === "updated_at" ||
          key === "data_completare" ||
          key === "submissionDate" ||
          key === "lastQuestionnaireDate" ||
          key === "createdAt" ||
          key === "updatedAt"
          // DO NOT skip birthDate or birthdate - these are sensitive fields that should be decrypted
        ) {
          console.log(`⏭️ Skipping date field: ${key}`);
          return;
        }
        if (
          decrypted[key] &&
          (typeof decrypted[key] === "object" || Array.isArray(decrypted[key]))
        ) {
          decrypted[key] = this.recursiveDecrypt(decrypted[key]);
        }
      });
      return decrypted;
    }
    return obj;
  }

  // Middleware for automatic decryption on outgoing responses
  decryptionMiddleware() {
    const self = this; // Capture the context

    return (req, res, next) => {
      const originalJson = res.json;

      res.json = function (obj) {
        if (obj && typeof obj === "object") {
          console.log(
            "🔓 MIDDLEWARE: Decrypting response data for:",
            req.originalUrl
          );
          console.log("🔍 Response object keys:", Object.keys(obj));

          try {
            obj = self.recursiveDecrypt(obj);
            console.log("✅ Recursive response decryption completed");
          } catch (error) {
            console.error("❌ Decryption middleware error:", error);
          }
        }
        originalJson.call(this, obj);
      };

      next();
    };
  }

  // Search for patients by CNP (handles both encrypted and unencrypted)
  async findPatientByCNP(cnp, models) {
    console.log("🔍 Searching for patient with CNP:", cnp);

    // First, try to find by plain text CNP (for existing unencrypted data)
    let patient = await models.Patient.findOne({ where: { cnp } });

    if (patient) {
      console.log("✅ Found patient by plain text CNP");
      return patient;
    }

    // If not found, we need to check all patients and decrypt their CNPs
    // This is because each encryption creates a different result due to random IV
    console.log("🔒 Searching by decrypting all CNPs...");

    const allPatients = await models.Patient.findAll({
      attributes: ["pacientid", "cnp"],
    });

    console.log(`🔍 Checking ${allPatients.length} patients...`);

    for (const patient of allPatients) {
      try {
        const decryptedCNP = this.decryptField(patient.cnp);
        if (decryptedCNP === cnp) {
          console.log(
            "✅ Found patient by decrypting CNP, patient ID:",
            patient.pacientid
          );
          return patient;
        }
      } catch (error) {
        // Skip patients with invalid encrypted data
        continue;
      }
    }

    console.log("❌ Patient not found after checking all encrypted CNPs");
    return null;
  }

  // Search for patients by email
  async findPatientByEmail(email, models) {
    console.log("🔍 Searching for patient with email:", email);

    // First try plain text
    let patient = await models.Patient.findOne({ where: { email } });
    if (patient) {
      console.log("✅ Found patient by plain text email");
      return patient;
    }

    // If not found, check all patients and decrypt their emails
    console.log("🔒 Searching by decrypting all emails...");

    const allPatients = await models.Patient.findAll({
      attributes: ["pacientid", "email"],
    });

    for (const patient of allPatients) {
      try {
        const decryptedEmail = this.decryptField(patient.email);
        if (decryptedEmail === email) {
          console.log(
            "✅ Found patient by decrypting email, patient ID:",
            patient.pacientid
          );
          return patient;
        }
      } catch (error) {
        continue;
      }
    }

    console.log("❌ Patient not found by email");
    return null;
  }
}

export default DataEncryption;

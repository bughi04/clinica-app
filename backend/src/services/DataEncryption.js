import crypto from 'crypto';

class DataEncryption {
  constructor() {
    // Get encryption key from environment or use default for development
    this.algorithm = 'aes-256-cbc';

    // Handle base64 encoded key from .env
    let keyString = process.env.ENCRYPTION_KEY || 'SxnDMpjYIKUfH4ffi91PB9CwK7i4ZJfYu47GDbd0lEg';

    // If it looks like base64, decode it
    try {
      if (keyString.includes('=') || keyString.length > 32) {
        this.key = Buffer.from(keyString, 'base64');
        console.log('🔑 Using base64 decoded encryption key');
      } else {
        this.key = Buffer.from(keyString.padEnd(32, '0').substring(0, 32));
        console.log('🔑 Using string-based encryption key');
      }
    } catch (error) {
      console.error('❌ Key processing failed, using default:', error);
      this.key = Buffer.from('SxnDMpjYIKUfH4ffi91PB9CwK7i4ZJfYu47GDbd0lEg');
    }

    console.log('🔐 DataEncryption initialized, key length:', this.key.length);

    // Define which fields should be encrypted
    this.sensitiveFields = [
      'firstname', 'surname', 'CNP', 'cnp', 'email', 'telefon',
      'address', 'alergii', 'medicamente', 'nume_reprezentant'
    ];
  }

  encryptField(text) {
    if (!text || typeof text !== 'string') return text;

    try {
      console.log('🔒 Encrypting field:', text.substring(0, 10) + '...');

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const result = iv.toString('hex') + ':' + encrypted;
      console.log('✅ Encrypted to:', result.substring(0, 20) + '...');

      return result;
    } catch (error) {
      console.error('❌ Encryption failed:', error);
      return text; // Return original if encryption fails
    }
  }

  decryptField(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

    // Check if data is encrypted (has the format: hexstring:hexstring)
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      // Not encrypted format - this is probably existing plain text data
      console.log('📖 Found unencrypted data (existing record):', encryptedText.substring(0, 10) + '...');
      return encryptedText; // Return as-is for existing data
    }

    try {
      console.log('🔓 Decrypting field:', encryptedText.substring(0, 20) + '...');

      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      console.log('✅ Decrypted to:', decrypted.substring(0, 10) + '...');
      return decrypted;
    } catch (error) {
      console.log('⚠️ Decryption failed, treating as plain text:', error.message);
      return encryptedText; // Return original if decryption fails (probably plain text)
    }
  }

  // Encrypt sensitive fields in an object
  encryptObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const encrypted = { ...obj };

    this.sensitiveFields.forEach(field => {
      if (encrypted[field] && typeof encrypted[field] === 'string') {
        encrypted[field] = this.encryptField(encrypted[field]);
      }
    });

    return encrypted;
  }

  // Decrypt sensitive fields in an object
  decryptObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    const decrypted = { ...obj };

    this.sensitiveFields.forEach(field => {
      if (decrypted[field] && typeof decrypted[field] === 'string') {
        decrypted[field] = this.decryptField(decrypted[field]);
      }
    });

    return decrypted;
  }

  // Middleware for automatic encryption on incoming requests
  encryptionMiddleware() {
    return (req, res, next) => {
      if (req.body && typeof req.body === 'object') {
        console.log('🔒 MIDDLEWARE: Encrypting request data for:', req.method, req.originalUrl);
        console.log('📝 Original data keys:', Object.keys(req.body));

        const originalBody = { ...req.body };
        req.body = this.encryptObject(req.body);

        console.log('🔐 Encrypted data keys:', Object.keys(req.body));
        console.log('🔄 Sample encryption - firstname before:', originalBody.firstname?.substring(0, 10));
        console.log('🔄 Sample encryption - firstname after:', req.body.firstname?.substring(0, 20));
      } else {
        console.log('⏭️ MIDDLEWARE: No body to encrypt for:', req.method, req.originalUrl);
      }
      next();
    };
  }

  // Middleware for automatic decryption on outgoing responses
  decryptionMiddleware() {
    return (req, res, next) => {
      const originalJson = res.json;

      res.json = (obj) => {
        if (obj && typeof obj === 'object') {
          console.log('🔓 MIDDLEWARE: Decrypting response data...');
          if (Array.isArray(obj)) {
            obj = obj.map(item => this.decryptObject(item));
          } else {
            obj = this.decryptObject(obj);
          }
        }
        originalJson.call(res, obj);
      };

      next();
    };
  }
}

export default DataEncryption;
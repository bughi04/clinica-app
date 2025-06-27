import crypto from 'crypto';

class DataEncryption {
  constructor() {
    // Get encryption key from environment or use default for development
    this.algorithm = 'aes-256-cbc';
    this.key = process.env.ENCRYPTION_KEY || 'YourSecure32ByteEncryptionKeyHere1234';
    
    // Make sure key is exactly 32 bytes
    this.key = this.key.padEnd(32, '0').substring(0, 32);
    
    // Define which fields should be encrypted
    this.sensitiveFields = [
      'firstname', 'surname', 'CNP', 'cnp', 'email', 'telefon', 
      'address', 'alergii', 'medicamente', 'nume_reprezentant'
    ];
  }

  encryptField(text) {
    if (!text || typeof text !== 'string') return text;
    
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher(this.algorithm, this.key);
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return: iv + encrypted (both hex)
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Return original if encryption fails
    }
  }

  decryptField(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
    
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) return encryptedText; // Not encrypted format
      
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      const decipher = crypto.createDecipher(this.algorithm, this.key);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText; // Return original if decryption fails
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
        console.log('🔒 Encrypting request data...');
        req.body = this.encryptObject(req.body);
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
          console.log('🔓 Decrypting response data...');
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
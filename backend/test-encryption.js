import dotenv from 'dotenv';
import DataEncryption from './src/services/DataEncryption.js';

// Load environment variables
dotenv.config();

console.log('🧪 Testing DataEncryption service...\n');

const encryption = new DataEncryption();

// Test data
const testData = {
    firstname: 'Ion',
    surname: 'Popescu',
    CNP: '1850101123456',
    email: 'ion@example.com',
    telefon: '0740123456'
};

console.log('📝 Original data:');
console.log(testData);

console.log('\n🔒 Encrypting...');
const encryptedData = encryption.encryptObject(testData);
console.log('🔐 Encrypted data:');
console.log(encryptedData);

console.log('\n🔓 Decrypting...');
const decryptedData = encryption.decryptObject(encryptedData);
console.log('📖 Decrypted data:');
console.log(decryptedData);

console.log('\n✅ Test completed!');

// Verify encryption actually happened
if (encryptedData.firstname === testData.firstname) {
    console.log('❌ ERROR: Data was NOT encrypted!');
} else {
    console.log('✅ SUCCESS: Data was encrypted properly!');
}

// Verify decryption worked
if (decryptedData.firstname === testData.firstname) {
    console.log('✅ SUCCESS: Data was decrypted properly!');
} else {
    console.log('❌ ERROR: Data was NOT decrypted correctly!');
}
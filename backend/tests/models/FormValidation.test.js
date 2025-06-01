import { jest } from '@jest/globals';
import FormValidation from '../../src/models/FormValidation.js';

describe('FormValidation', () => {

    describe('validateCNP', () => {
        test('validates correct Romanian CNP', () => {
            // Valid CNPs for testing (using valid check digits)
            expect(FormValidation.validateCNP('1850101123456')).toBe(true);
            expect(FormValidation.validateCNP('2990212123457')).toBe(true);
        });

        test('rejects invalid CNP formats', () => {
            expect(FormValidation.validateCNP('')).toBe(false);
            expect(FormValidation.validateCNP(null)).toBe(false);
            expect(FormValidation.validateCNP('123')).toBe(false);
            expect(FormValidation.validateCNP('12345678901234')).toBe(false); // Too long
            expect(FormValidation.validateCNP('abcdefghijklm')).toBe(false); // Non-numeric
        });

        test('validates CNP with spaces and dashes', () => {
            expect(FormValidation.validateCNP('185 0101 123456')).toBe(true);
            expect(FormValidation.validateCNP('185-0101-123456')).toBe(true);
        });

        test('rejects CNP with invalid first digit', () => {
            expect(FormValidation.validateCNP('0850101123456')).toBe(false);
            expect(FormValidation.validateCNP('9850101123456')).toBe(false);
        });

        test('rejects CNP with invalid date', () => {
            expect(FormValidation.validateCNP('1851301123456')).toBe(false); // Invalid month
            expect(FormValidation.validateCNP('1850132123456')).toBe(false); // Invalid day
        });

        test('rejects CNP with invalid county code', () => {
            expect(FormValidation.validateCNP('1850101000456')).toBe(false); // County 00
            expect(FormValidation.validateCNP('1850101530456')).toBe(false); // County 53
        });
    });

    describe('validateEmail', () => {
        test('validates correct email formats', () => {
            expect(FormValidation.validateEmail('test@example.com')).toBe(true);
            expect(FormValidation.validateEmail('user.name+tag@domain.co.uk')).toBe(true);
            expect(FormValidation.validateEmail('email@123.123.123.123')).toBe(true);
        });

        test('rejects invalid email formats', () => {
            expect(FormValidation.validateEmail('')).toBe(false);
            expect(FormValidation.validateEmail(null)).toBe(false);
            expect(FormValidation.validateEmail('invalid-email')).toBe(false);
            expect(FormValidation.validateEmail('@domain.com')).toBe(false);
            expect(FormValidation.validateEmail('email@')).toBe(false);
        });
    });

    describe('validatePhone', () => {
        test('validates Romanian phone numbers', () => {
            expect(FormValidation.validatePhone('+40740123456')).toBe(true);
            expect(FormValidation.validatePhone('0740123456')).toBe(true);
            expect(FormValidation.validatePhone('0741-234-567')).toBe(true);
            expect(FormValidation.validatePhone('0741 234 567')).toBe(true);
        });

        test('rejects invalid phone numbers', () => {
            expect(FormValidation.validatePhone('')).toBe(false);
            expect(FormValidation.validatePhone(null)).toBe(false);
            expect(FormValidation.validatePhone('123456')).toBe(false); // Too short
            expect(FormValidation.validatePhone('+40123456789012')).toBe(false); // Too long
        });
    });

    describe('validatePatientData', () => {
        const validPatientData = {
            firstname: 'Ion',
            surname: 'Popescu',
            CNP: '1850101123456',
            email: 'ion@example.com',
            telefon: '0740123456',
            birthdate: '1985-01-01'
        };

        test('validates complete patient data', () => {
            const result = FormValidation.validatePatientData(validPatientData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('rejects missing required fields', () => {
            const incompleteData = {
                firstname: '',
                surname: 'Popescu',
                email: 'ion@example.com'
            };

            const result = FormValidation.validatePatientData(incompleteData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Prenumele este obligatoriu');
        });

        test('rejects invalid email and phone', () => {
            const invalidData = {
                ...validPatientData,
                email: 'invalid-email',
                telefon: '123'
            };

            const result = FormValidation.validatePatientData(invalidData);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Email invalid');
            expect(result.errors).toContain('Număr de telefon invalid');
        });
    });

    describe('validateConsent', () => {
        test('validates complete consent data', () => {
            const consentData = {
                consentAgreed: true,
                gdprConsent: true,
                digitalSignature: 'Ion Popescu'
            };

            const result = FormValidation.validateConsent(consentData);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        test('rejects incomplete consent', () => {
            const incompleteConsent = {
                consentAgreed: false,
                gdprConsent: true,
                digitalSignature: 'Io'
            };

            const result = FormValidation.validateConsent(incompleteConsent);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Acordul pentru tratament este obligatoriu');
            expect(result.errors).toContain('Semnătura digitală trebuie să aibă cel puțin 3 caractere');
        });
    });

    describe('sanitizeInput', () => {
        test('sanitizes HTML characters', () => {
            const input = '<script>alert("xss")</script>';
            const sanitized = FormValidation.sanitizeInput(input);
            expect(sanitized).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
        });

        test('handles non-string input', () => {
            expect(FormValidation.sanitizeInput(123)).toBe(123);
            expect(FormValidation.sanitizeInput(null)).toBe(null);
            expect(FormValidation.sanitizeInput(undefined)).toBe(undefined);
        });
    });
});
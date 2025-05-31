class FormValidation {

    /**
     * Validates Romanian CNP (Cod Numeric Personal)
     * @param {string} cnp - The CNP to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    static validateCNP(cnp) {
        if (!cnp || typeof cnp !== 'string') return false;

        // Remove any spaces or dashes
        cnp = cnp.replace(/[\s-]/g, '');

        // Check if it's exactly 13 digits
        if (!/^\d{13}$/.test(cnp)) return false;

        // Check the first digit (gender and century)
        const firstDigit = parseInt(cnp[0]);
        if (firstDigit < 1 || firstDigit > 8) return false;

        // Extract date components
        const year = parseInt(cnp.substring(1, 3));
        const month = parseInt(cnp.substring(3, 5));
        const day = parseInt(cnp.substring(5, 7));

        // Determine full year based on first digit
        let fullYear;
        if (firstDigit === 1 || firstDigit === 2) {
            fullYear = 1900 + year;
        } else if (firstDigit === 3 || firstDigit === 4) {
            fullYear = 1800 + year;
        } else if (firstDigit === 5 || firstDigit === 6) {
            fullYear = 2000 + year;
        } else {
            fullYear = 2000 + year; // For residents/foreigners
        }

        // Validate date
        if (!this.isValidDate(fullYear, month, day)) return false;

        // Validate county code (positions 7-8)
        const county = parseInt(cnp.substring(7, 9));
        if (county < 1 || county > 52) return false;

        // Calculate and verify check digit
        const weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9];
        let sum = 0;

        for (let i = 0; i < 12; i++) {
            sum += parseInt(cnp[i]) * weights[i];
        }

        let checkDigit = sum % 11;
        if (checkDigit === 10) checkDigit = 1;

        return checkDigit === parseInt(cnp[12]);
    }

    /**
     * Validates if a date is valid
     * @param {number} year
     * @param {number} month
     * @param {number} day
     * @returns {boolean} - True if valid date
     */
    static isValidDate(year, month, day) {
        if (month < 1 || month > 12) return false;
        if (day < 1 || day > 31) return false;

        const date = new Date(year, month - 1, day);
        return date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day;
    }

    /**
     * Validates Romanian email format
     * @param {string} email
     * @returns {boolean}
     */
    static validateEmail(email) {
        if (!email) return false;
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        return emailRegex.test(email);
    }

    /**
     * Validates Romanian phone number
     * @param {string} phone
     * @returns {boolean}
     */
    static validatePhone(phone) {
        if (!phone) return false;
        // Romanian phone formats: +40xxxxxxxxx, 0xxxxxxxxx
        const phoneRegex = /^(\+40|0)[0-9]{9}$/;
        return phoneRegex.test(phone.replace(/[\s-]/g, ''));
    }

    /**
     * Validates medical data fields
     * @param {string} fieldName
     * @param {any} value
     * @returns {boolean|string} - True if valid, error message if invalid
     */
    static validateMedicalField(fieldName, value) {
        switch (fieldName) {
            case 'sanatategingii':
            case 'sensibilitateDinti':
            case 'problemeTratamentOrtodontic':
            case 'scrasnit_inclestat_scrasnit_dinti':
                return ['Da', 'Nu'].includes(value) || 'Răspuns invalid (Da/Nu)';

            case 'ultim_consult_stomatologic':
                { if (!value) return 'Data ultimului consult este obligatorie';
                const date = new Date(value);
                const now = new Date();
                return date <= now || 'Data nu poate fi în viitor'; }

            case 'nota_aspect_dentatie':
            case 'probleme_tratament_stomatologic_anterior':
                return typeof value === 'string' || 'Textul este obligatoriu';

            default:
                return true;
        }
    }

    /**
     * Validates medical conditions (Tabel Boli)
     * @param {object} conditions
     * @returns {boolean|string}
     */
    static validateMedicalConditions(conditions) {
        const requiredFields = [
            'boli_inima', 'purtator_proteza', 'diabet', 'hepatita', 'reumatism',
            'boli_respiratorii', 'tulburari_coagulare_sange', 'anemie', 'boli_rinichi',
            'glaucom', 'epilepsie', 'migrene', 'osteoporoza', 'ulcer_gastric',
            'boli_tiroida', 'boli_neurologice', 'probleme_psihice'
        ];

        for (const field of requiredFields) {
            if (!['Da', 'Nu'].includes(conditions[field])) {
                return `Câmpul ${field} trebuie să fie Da sau Nu`;
            }
        }

        return true;
    }

    /**
     * Validates medical history data
     * @param {object} data
     * @returns {object} - { isValid: boolean, errors: array }
     */
    static validateMedicalHistory(data) {
        const errors = [];

        // Validate general health status
        if (!data.nota_stare_sanatate || data.nota_stare_sanatate.trim().length < 5) {
            errors.push('Nota despre starea de sănătate trebuie să aibă cel puțin 5 caractere');
        }

        // Validate yes/no fields
        const yesNoFields = ['ingrijire_alt_medic', 'spitalizare', 'fumat', 'antidepresive'];
        yesNoFields.forEach(field => {
            if (!['Da', 'Nu'].includes(data[field])) {
                errors.push(`Câmpul ${field} trebuie să fie Da sau Nu`);
            }
        });

        // Validate pregnancy fields for women
        if (data.gen === 'F') {
            if (data.femeie_insarcinata_luna && !['Da', 'Nu'].includes(data.femeie_insarcinata_luna)) {
                errors.push('Câmpul sarcină trebuie să fie Da sau Nu');
            }
            if (data.femeie_bebe_alaptare && !['Da', 'Nu'].includes(data.femeie_bebe_alaptare)) {
                errors.push('Câmpul alăptare trebuie să fie Da sau Nu');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validates dental examination data
     * @param {object} dentalData
     * @returns {object}
     */
    static validateDentalData(dentalData) {
        const errors = [];

        // Required yes/no fields
        const requiredYesNo = [
            'sanatategingii',
            'sensibilitateDinti',
            'problemeTratamentOrtodontic',
            'scrasnit_inclestat_scrasnit_dinti'
        ];

        requiredYesNo.forEach(field => {
            if (!['Da', 'Nu'].includes(dentalData[field])) {
                errors.push(`Câmpul ${field} este obligatoriu și trebuie să fie Da sau Nu`);
            }
        });

        // Validate last dental visit date
        if (dentalData.ultim_consult_stomatologic) {
            const lastVisit = new Date(dentalData.ultim_consult_stomatologic);
            const now = new Date();
            if (lastVisit > now) {
                errors.push('Data ultimului consult nu poate fi în viitor');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Sanitizes input data to prevent XSS
     * @param {string} input
     * @returns {string}
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    /**
     * Validates consent form data
     * @param {object} consentData
     * @returns {object}
     */
    static validateConsent(consentData) {
        const errors = [];

        if (!consentData.consentAgreed) {
            errors.push('Acordul pentru tratament este obligatoriu');
        }

        if (!consentData.gdprConsent) {
            errors.push('Acordul GDPR este obligatoriu');
        }

        if (!consentData.digitalSignature || consentData.digitalSignature.trim().length < 3) {
            errors.push('Semnătura digitală trebuie să aibă cel puțin 3 caractere');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Comprehensive form validation
     * @param {object} formData
     * @param {string} formType
     * @returns {object}
     */
    static validateForm(formData, formType) {
        switch (formType) {
            case 'patient':
                return this.validatePatientData(formData);
            case 'medical':
                return this.validateMedicalHistory(formData);
            case 'dental':
                return this.validateDentalData(formData);
            case 'consent':
                return this.validateConsent(formData);
            default:
                return { isValid: false, errors: ['Tip de formular necunoscut'] };
        }
    }

    /**
     * Validates complete patient data
     * @param {object} patientData
     * @returns {object}
     */
    static validatePatientData(patientData) {
        const errors = [];

        // Required fields
        if (!patientData.firstname?.trim()) errors.push('Prenumele este obligatoriu');
        if (!patientData.surname?.trim()) errors.push('Numele este obligatoriu');
        if (!patientData.email?.trim()) errors.push('Email-ul este obligatoriu');
        if (!patientData.telefon?.trim()) errors.push('Telefonul este obligatoriu');

        // CNP validation
        if (!this.validateCNP(patientData.CNP)) {
            errors.push('CNP invalid');
        }

        // Email validation
        if (patientData.email && !this.validateEmail(patientData.email)) {
            errors.push('Email invalid');
        }

        // Phone validation
        if (patientData.telefon && !this.validatePhone(patientData.telefon)) {
            errors.push('Număr de telefon invalid');
        }

        // Date validation
        if (patientData.birthdate) {
            const birthDate = new Date(patientData.birthdate);
            const now = new Date();
            if (birthDate > now) {
                errors.push('Data nașterii nu poate fi în viitor');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

export default FormValidation;
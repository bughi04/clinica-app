const FormValidation = {
    validatePatientData: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    validateCNP: jest.fn().mockReturnValue(true),
    validateConsent: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    validateEmail: jest.fn().mockReturnValue(true),
    validatePhone: jest.fn().mockReturnValue(true),
    sanitizeInput: jest.fn().mockImplementation(input => input),
    validateMedicalHistory: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    validateDentalData: jest.fn().mockReturnValue({ isValid: true, errors: [] }),
    validateMedicalConditions: jest.fn().mockReturnValue(true),
    validateMedicalField: jest.fn().mockReturnValue(true),
    isValidDate: jest.fn().mockReturnValue(true),
    validateForm: jest.fn().mockReturnValue({ isValid: true, errors: [] })
};

export default FormValidation;
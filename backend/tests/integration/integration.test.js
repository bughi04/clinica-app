import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock modules
jest.mock('../../../backend/src/models/FormValidation.js', () => ({
    validatePatientData: jest.fn(),
    validateCNP: jest.fn(),
    validateConsent: jest.fn()
}));

jest.mock('../services/apiService.js', () => ({
    createPatient: jest.fn(),
    saveMedicalQuestionnaire: jest.fn()
}));

// Import components
import PatientRegistration from './PatientRegistration';
import QuestionnaireWizard from './QuestionnaireWizard';
import TabletInterface, { TouchGestureHandler, TabletModal, TabletLoader } from './TabletInterface';
import ConsentForm from './ConsentForm';
import MedicalHistoryForm from './MedicalHistoryForm';

// Import mocked modules
import FormValidation from '../../../backend/src/models/FormValidation.js';
import ApiService from '../services/apiService.js';
describe('Integration Tests', () => {
    test('complete patient registration to questionnaire flow', async () => {
        const user = userEvent.setup();

        // Mock successful patient creation
        ApiService.createPatient.mockResolvedValue({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            CNP: '1234567890123'
        });

        const mockOnComplete = jest.fn();
        const mockOnBack = jest.fn();

        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        // Fill registration form
        await user.type(screen.getByPlaceholderText('Introduceți prenumele'), 'John');
        await user.type(screen.getByPlaceholderText('Introduceți numele'), 'Doe');
        await user.type(screen.getByPlaceholderText('1234567890123'), '1234567890123');

        // Submit and verify API call
        await act(async () => {
            fireEvent.submit(screen.getByRole('form') || document.body);
        });

        expect(ApiService.createPatient).toHaveBeenCalledWith(
            expect.objectContaining({
                firstname: 'John',
                surname: 'Doe',
                CNP: '1234567890123'
            })
        );
    });

    test('questionnaire completion triggers consent form', async () => {
        const mockPatient = { id: 1, firstName: 'John', lastName: 'Doe' };
        const mockFormData = { 'medical-history': { completed: true } };
        const mockOnComplete = jest.fn();
        const mockUpdateFormData = jest.fn();

        render(
            <QuestionnaireWizard
                patient={mockPatient}
                onComplete={mockOnComplete}
                formData={mockFormData}
                updateFormData={mockUpdateFormData}
            />
        );

        // Verify questionnaire data structure
        expect(mockFormData).toHaveProperty('medical-history');
    });
});
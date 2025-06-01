import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock modules - corrected paths for your project
jest.mock('backend/src/models/FormValidation.js', () => ({
    validatePatientData: jest.fn(),
    validateCNP: jest.fn(),
    sanitizeInput: jest.fn()
}));

jest.mock('../../services/apiService.js', () => ({
    createPatient: jest.fn(),
    testConnection: jest.fn()
}));

// Import components - corrected paths
import PatientRegistration from '../../components/PatientRegistration';
import FormValidation from 'backend/src/models/FormValidation.js';
import ApiService from '../../services/apiService.js';

describe('PatientRegistration Component', () => {
    const mockOnComplete = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        FormValidation.validatePatientData.mockReturnValue({ isValid: true, errors: [] });
        FormValidation.validateCNP.mockReturnValue(true);
        ApiService.createPatient.mockResolvedValue({
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            CNP: '1234567890123'
        });
    });

    test('renders patient registration form with initial step', () => {
        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        expect(screen.getByText('Înregistrare Pacient Nou')).toBeInTheDocument();
        expect(screen.getByText('Informații Personale')).toBeInTheDocument();
        expect(screen.getByText('Pasul 1 din 4: Informații Personale')).toBeInTheDocument();
    });

    test('displays form validation errors for required fields', async () => {
        const user = userEvent.setup();
        FormValidation.validateCNP.mockReturnValue(false);

        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        // Try to proceed without filling required fields
        const nextButton = screen.getByText('Următorul');
        await user.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Prenumele este obligatoriu')).toBeInTheDocument();
            expect(screen.getByText('Numele este obligatoriu')).toBeInTheDocument();
        });
    });

    test('validates CNP format correctly', async () => {
        const user = userEvent.setup();
        FormValidation.validateCNP.mockReturnValue(false);

        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        const cnpInput = screen.getByPlaceholderText('1234567890123');
        await user.type(cnpInput, '123456789');

        await waitFor(() => {
            expect(screen.getByText('CNP invalid')).toBeInTheDocument();
        });
    });

    test('progresses through all form steps', async () => {
        const user = userEvent.setup();
        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        // Fill first step
        await user.type(screen.getByPlaceholderText('Introduceți prenumele'), 'John');
        await user.type(screen.getByPlaceholderText('Introduceți numele'), 'Doe');
        await user.type(screen.getByPlaceholderText('1234567890123'), '1234567890123');

        const birthDateInput = screen.getByLabelText(/Data nașterii/i);
        await user.type(birthDateInput, '1990-01-01');

        // Select gender
        const maleRadio = screen.getByDisplayValue('M');
        await user.click(maleRadio);

        // Proceed to next step
        await user.click(screen.getByText('Următorul'));

        await waitFor(() => {
            expect(screen.getByText('Date de Contact')).toBeInTheDocument();
        });
    });

    test('handles API errors gracefully', async () => {
        ApiService.createPatient.mockRejectedValue(new Error('Server error'));

        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        // Mock form completion and submission
        await act(async () => {
            // Simulate final step submission
            const form = screen.getByText('Înregistrare Pacient Nou').closest('form') || document.body;
            fireEvent.submit(form);
        });

        await waitFor(() => {
            expect(screen.getByText(/Eroare la înregistrare/)).toBeInTheDocument();
        });
    });

    test('calls onBack when back button is clicked', async () => {
        const user = userEvent.setup();
        render(<PatientRegistration onComplete={mockOnComplete} onBack={mockOnBack} />);

        await user.click(screen.getByText('Înapoi'));
        expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
});
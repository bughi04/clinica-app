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
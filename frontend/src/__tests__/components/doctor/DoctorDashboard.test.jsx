import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock ApiService for your project structure
jest.mock('../../../services/apiService.js', () => ({
    getDashboardStats: jest.fn(),
    getRecentQuestionnaires: jest.fn(),
    getHighPriorityAlerts: jest.fn(),
    getHighRiskPatients: jest.fn(),
}));

import DoctorDashboard from '../../../components/doctor/DoctorDashboard.jsx';
import ApiService from '../../../services/apiService.js';

describe('DoctorDashboard Component', () => {
    const mockOnPatientSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock ApiService methods with data matching your project
        ApiService.getDashboardStats.mockResolvedValue({
            totalPatients: 156,
            pendingQuestionnaires: 3,
            riskPatients: 12,
            todayAppointments: 8,
            questionnaireStats: {
                total: 145,
                recentWeek: 23,
                riskDistribution: {
                    minimal: 89,
                    low: 34,
                    medium: 18,
                    high: 4
                }
            }
        });

        ApiService.getRecentQuestionnaires.mockResolvedValue([
            {
                id: 1,
                patientId: '1',
                patientName: 'Maria Popescu',
                submissionDate: new Date().toISOString(),
                riskLevel: 'medium'
            },
            {
                id: 2,
                patientId: '2',
                patientName: 'Ion Ionescu',
                submissionDate: new Date(Date.now() - 86400000).toISOString(),
                riskLevel: 'high'
            }
        ]);

        ApiService.getHighPriorityAlerts.mockResolvedValue([
            {
                patientId: '2',
                patientName: 'Ion Ionescu',
                message: 'Pacient diabetic cu probleme cardiace',
                priority: 'high',
                type: 'danger',
                category: 'Risc Anestezic',
                date: new Date().toISOString()
            }
        ]);

        ApiService.getHighRiskPatients.mockResolvedValue([
            {
                patientId: '2',
                patientName: 'Ion Ionescu',
                riskLevel: 'high',
                riskDescription: 'Diabet tip 2, probleme cardiace, fumător',
                submissionDate: new Date(Date.now() - 86400000).toISOString()
            }
        ]);
    });

    test('renders dashboard with loading state initially', () => {
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        expect(screen.getByText('Se încarcă datele din baza de date...')).toBeInTheDocument();
    });

    test('loads and displays dashboard statistics', async () => {
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Panou de Control - Dental Point Clinic')).toBeInTheDocument();
            expect(screen.getByText('Total Pacienți')).toBeInTheDocument();
            expect(screen.getByText('156')).toBeInTheDocument();
            expect(screen.getByText('Chestionare Completate')).toBeInTheDocument();
        });
    });

    test('displays risk distribution statistics', async () => {
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Distribuția Riscurilor')).toBeInTheDocument();
            expect(screen.getByText('Risc Minimal')).toBeInTheDocument();
            expect(screen.getByText('Risc Înalt')).toBeInTheDocument();
        });
    });

    test('shows recent questionnaires with patient data', async () => {
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Chestionare Recente')).toBeInTheDocument();
            expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
            expect(screen.getByText('Ion Ionescu')).toBeInTheDocument();
        });
    });

    test('displays high priority medical alerts', async () => {
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Alerte Medicale Prioritare')).toBeInTheDocument();
            expect(screen.getByText('Pacient diabetic cu probleme cardiace')).toBeInTheDocument();
            expect(screen.getByText('URGENT')).toBeInTheDocument();
        });
    });

    test('handles patient selection from recent questionnaires', async () => {
        const user = userEvent.setup();
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            const viewDetailsButton = screen.getAllByText('Vezi Detalii')[0];
            return user.click(viewDetailsButton);
        });

        expect(mockOnPatientSelect).toHaveBeenCalledWith('1');
    });

    test('refreshes dashboard data when refresh button clicked', async () => {
        const user = userEvent.setup();
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            const refreshButton = screen.getByText('Reîmprospătează');
            return user.click(refreshButton);
        });

        expect(ApiService.getDashboardStats).toHaveBeenCalledTimes(2);
    });

    test('handles API errors gracefully', async () => {
        ApiService.getDashboardStats.mockRejectedValue(new Error('Connection failed'));

        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Eroare de conectare')).toBeInTheDocument();
            expect(screen.getByText('Eroare la încărcarea datelor din baza de date')).toBeInTheDocument();
        });
    });

    test('shows database connection status', async () => {
        render(<DoctorDashboard onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Conectat la baza de date PostgreSQL')).toBeInTheDocument();
            expect(screen.getByText(/Ultima actualizare:/)).toBeInTheDocument();
        });
    });
});
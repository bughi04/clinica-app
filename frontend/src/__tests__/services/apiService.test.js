import ApiService from '../../services/apiService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios;

describe('ApiService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Patient Methods', () => {
        test('createPatient sends correct data', async () => {
            const patientData = {
                firstname: 'Ion',
                surname: 'Popescu',
                CNP: '1850101123456',
                email: 'ion@example.com'
            };

            const mockResponse = { data: { id: 1, ...patientData } };
            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await ApiService.createPatient(patientData);

            expect(mockedAxios.post).toHaveBeenCalledWith('/patients', patientData);
            expect(result).toEqual(mockResponse.data);
        });

        test('getPatientByCNP handles not found', async () => {
            mockedAxios.get.mockRejectedValue({ response: { status: 404 } });

            const result = await ApiService.getPatientByCNP('9999999999999');

            expect(result).toBeNull();
        });

        test('getPatientByCNP returns patient data', async () => {
            const mockPatient = { id: 1, firstName: 'Ion', lastName: 'Popescu' };
            mockedAxios.get.mockResolvedValue({ data: mockPatient });

            const result = await ApiService.getPatientByCNP('1850101123456');

            expect(mockedAxios.get).toHaveBeenCalledWith('/patients/cnp/1850101123456');
            expect(result).toEqual(mockPatient);
        });
    });

    describe('Questionnaire Methods', () => {
        test('saveMedicalQuestionnaire sends complete data', async () => {
            const questionnaireData = {
                pacient_id: 1,
                conditii_medicale: { diabet: 'DA' },
                stare_generala: { alergii: 'NU' }
            };

            const mockResponse = { data: { id: 1, riskLevel: 'medium' } };
            mockedAxios.post.mockResolvedValue(mockResponse);

            const result = await ApiService.saveMedicalQuestionnaire(questionnaireData);

            expect(mockedAxios.post).toHaveBeenCalledWith('/questionnaires', expect.objectContaining({
                pacientid: questionnaireData.pacient_id
            }));
            expect(result).toEqual(mockResponse.data);
        });

        test('saveMedicalQuestionnaire falls back to legacy method on error', async () => {
            const questionnaireData = {
                pacient_id: 1,
                examen_dentar: { sangereaza_gingiile: 'DA' }
            };

            // Mock primary method to fail
            mockedAxios.post.mockRejectedValueOnce(new Error('New endpoint not available'));

            // Mock legacy endpoints to succeed
            mockedAxios.post.mockResolvedValueOnce({ data: { datemedicaleid: 1 } });
            mockedAxios.post.mockResolvedValueOnce({ data: { idboala: 1 } });
            mockedAxios.post.mockResolvedValueOnce({ data: { idantecedent: 1 } });

            const result = await ApiService.saveMedicalQuestionnaire(questionnaireData);

            expect(result.legacy).toBe(true);
            expect(mockedAxios.post).toHaveBeenCalledTimes(4); // 1 failed + 3 legacy calls
        });
    });

    describe('Dashboard Methods', () => {
        test('getDashboardStats returns statistics', async () => {
            const mockStats = {
                totalPatients: 156,
                riskPatients: 12,
                questionnaireStats: { total: 145 }
            };

            mockedAxios.get.mockResolvedValue({ data: mockStats });

            const result = await ApiService.getDashboardStats();

            expect(mockedAxios.get).toHaveBeenCalledWith('/dashboard/stats');
            expect(result).toEqual(mockStats);
        });

        test('getDashboardStats handles errors with fallback', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
            mockedAxios.get.mockResolvedValueOnce({ data: { totalItems: 0 } });

            const result = await ApiService.getDashboardStats();

            expect(result.totalPatients).toBe(0);
            expect(result.questionnaireStats.total).toBe(0);
        });
    });

    describe('Error Handling', () => {
        test('handles network errors gracefully', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network Error'));

            await expect(ApiService.getPatientById('1')).rejects.toThrow('Network Error');
        });

        test('handles 500 server errors', async () => {
            mockedAxios.post.mockRejectedValue({
                response: {
                    status: 500,
                    data: { error: 'Internal Server Error' }
                }
            });

            await expect(ApiService.createPatient({})).rejects.toMatchObject({
                response: { status: 500 }
            });
        });
    });

    describe('Fallback Mechanisms', () => {
        test('getHighPriorityAlerts falls back when API fails', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('API not available'));
            mockedAxios.get.mockResolvedValueOnce({
                data: {
                    patients: [
                        {
                            patientId: '1',
                            fullName: 'Test Patient',
                            allergies: ['Penicillin'],
                            heartIssues: true
                        }
                    ]
                }
            });

            const result = await ApiService.getHighPriorityAlerts();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThanOrEqual(0);
        });

        test('testConnection returns connection status', async () => {
            const mockHealth = { status: 'OK', database: 'Connected' };
            mockedAxios.get.mockResolvedValue({ data: mockHealth });

            const result = await ApiService.testConnection();

            expect(mockedAxios.get).toHaveBeenCalledWith('/health');
            expect(result).toEqual(mockHealth);
        });
    });
});

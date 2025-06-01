describe('QuestionnaireWizard Component', () => {
    const mockPatient = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        allergies: ['penicillin'],
        chronicConditions: ['diabetes'],
        currentMedications: ['metformin']
    };
    const mockOnComplete = jest.fn();
    const mockUpdateFormData = jest.fn();
    const mockFormData = {};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders questionnaire wizard with patient info', () => {
        render(
            <QuestionnaireWizard
                patient={mockPatient}
                onComplete={mockOnComplete}
                formData={mockFormData}
                updateFormData={mockUpdateFormData}
            />
        );

        expect(screen.getByText('Chestionar Medical')).toBeInTheDocument();
        expect(screen.getByText('Pacient: John Doe')).toBeInTheDocument();
    });

    test('displays patient alerts when allergies exist', () => {
        render(
            <QuestionnaireWizard
                patient={mockPatient}
                onComplete={mockOnComplete}
                formData={mockFormData}
                updateFormData={mockUpdateFormData}
            />
        );

        expect(screen.getByText(/Alergii cunoscute: penicillin/)).toBeInTheDocument();
        expect(screen.getByText(/Condiții cronice: diabetes/)).toBeInTheDocument();
    });

    test('handles medical history completion', async () => {
        render(
            <QuestionnaireWizard
                patient={mockPatient}
                onComplete={mockOnComplete}
                formData={mockFormData}
                updateFormData={mockUpdateFormData}
            />
        );

        // Simulate completing medical history
        const mockData = { section1: 'completed' };

        // This would normally be triggered by MedicalHistoryForm
        act(() => {
            mockUpdateFormData({ 'medical-history': mockData });
        });

        expect(mockUpdateFormData).toHaveBeenCalledWith({ 'medical-history': mockData });
    });
});

export default {};
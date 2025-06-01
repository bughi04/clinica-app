describe('MedicalHistoryForm Component', () => {
    const mockPatient = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        gen: 'M',
        telefon: '0740123456',
        email: 'john@example.com',
        address: 'Timisoara, Romania',
        birthdate: '1990-01-01',
        CNP: '1234567890123'
    };
    const mockOnComplete = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        ApiService.saveMedicalQuestionnaire = jest.fn().mockResolvedValue({ id: 1 });
    });

    test('renders medical history form with patient data', () => {
        render(
            <MedicalHistoryForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
            />
        );

        expect(screen.getByText('DENTAL POINT CLINIC')).toBeInTheDocument();
        expect(screen.getByText('FISA-CHESTIONAR')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
    });

    test('displays clinic header information correctly', () => {
        render(
            <MedicalHistoryForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
            />
        );

        expect(screen.getByText('Calea Martirilor 1989')).toBeInTheDocument();
        expect(screen.getByText('Loc. Timișoara, Jud. Timiș')).toBeInTheDocument();
    });

    test('navigates through form sections', async () => {
        const user = userEvent.setup();
        render(
            <MedicalHistoryForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
            />
        );

        expect(screen.getByText('Secțiunea 1 din 8')).toBeInTheDocument();

        const nextButton = screen.getByText('Următoarea secțiune →');
        await user.click(nextButton);

        await waitFor(() => {
            expect(screen.getByText('Secțiunea 2 din 8')).toBeInTheDocument();
        });
    });

    test('shows referral options in first section', () => {
        render(
            <MedicalHistoryForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
            />
        );

        expect(screen.getByText('CUM AȚI FOST ÎNDRUMAȚI LA CLINICA NOASTRĂ?')).toBeInTheDocument();
        expect(screen.getByText('Internet')).toBeInTheDocument();
    });

    test('handles gender-specific sections for female patients', () => {
        const femalePatient = { ...mockPatient, gen: 'F' };

        render(
            <MedicalHistoryForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={femalePatient}
            />
        );

        // Check if pregnancy section appears for female patients
        expect(screen.getByText('Pentru femei:')).toBeInTheDocument();
    });

    test('auto-fills patient data in form fields', () => {
        render(
            <MedicalHistoryForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
            />
        );

        expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('John')).toBeInTheDocument();
        expect(screen.getByDisplayValue('0740123456')).toBeInTheDocument();
        expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
    });
});
describe('PatientProfile Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders loading state initially', () => {
        render(<PatientProfile patientId="1" />);

        expect(screen.getByText('Se încarcă datele pacientului...')).toBeInTheDocument();
    });

    test('renders patient not found message when no patientId', async () => {
        render(<PatientProfile />);

        await waitFor(() => {
            expect(screen.getByText('Pacientul nu a fost găsit.')).toBeInTheDocument();
        });
    });

    test('loads and displays patient data correctly', async () => {
        render(<PatientProfile patientId="1" />);

        await waitFor(() => {
            expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
            expect(screen.getByText('maria.popescu@email.com')).toBeInTheDocument();
            expect(screen.getByText('0740123456')).toBeInTheDocument();
        });
    });

    test('displays risk alerts for patient with medical conditions', async () => {
        render(<PatientProfile patientId="1" />);

        await waitFor(() => {
            expect(screen.getByText('Alergii cunoscute')).toBeInTheDocument();
            expect(screen.getByText(/Alergii la: Penicilină, Polen/)).toBeInTheDocument();
        });
    });

    test('renders medical information tabs correctly', async () => {
        render(<PatientProfile patientId="1" />);

        await waitFor(() => {
            expect(screen.getByText('Informații Generale')).toBeInTheDocument();
            expect(screen.getByText('Date Medicale')).toBeInTheDocument();
            expect(screen.getByText('Istoric Medical')).toBeInTheDocument();
        });
    });
});
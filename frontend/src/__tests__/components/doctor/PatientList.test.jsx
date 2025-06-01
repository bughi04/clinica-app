describe('PatientList Component', () => {
    const mockOnPatientSelect = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders patient list with mock data', async () => {
        render(<PatientList onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
            expect(screen.getByText('Ion Ionescu')).toBeInTheDocument();
            expect(screen.getByText('Ana Testescu')).toBeInTheDocument();
        });
    });

    test('displays correct risk levels for patients', async () => {
        render(<PatientList onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Mediu')).toBeInTheDocument();
            expect(screen.getByText('Înalt')).toBeInTheDocument();
            expect(screen.getByText('Minimal')).toBeInTheDocument();
        });
    });

    test('filters patients by search text', async () => {
        const user = userEvent.setup();
        render(<PatientList onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Caută pacient după nume sau email');
        await user.type(searchInput, 'Maria');

        // Trigger search
        fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
        });
    });

    test('calls onPatientSelect when view profile button is clicked', async () => {
        const user = userEvent.setup();
        render(<PatientList onPatientSelect={mockOnPatientSelect} />);

        await waitFor(() => {
            const viewProfileButton = screen.getAllByText('Vezi Profil')[0];
            return user.click(viewProfileButton);
        });

        expect(mockOnPatientSelect).toHaveBeenCalledWith('1');
    });
});
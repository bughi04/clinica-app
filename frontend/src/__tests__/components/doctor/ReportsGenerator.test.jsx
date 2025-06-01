describe('ReportsGenerator Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock URL methods for file downloads
        global.URL.createObjectURL = jest.fn(() => 'mock-url');
        global.URL.revokeObjectURL = jest.fn();

        const mockAnchor = {
            href: '',
            download: '',
            click: jest.fn(),
            remove: jest.fn()
        };
        jest.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
        jest.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        jest.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    test('renders reports generator with default options', () => {
        render(<ReportsGenerator />);

        expect(screen.getByText('Generator Rapoarte - Dental Point Clinic')).toBeInTheDocument();
        expect(screen.getByText('Tip Raport')).toBeInTheDocument();
        expect(screen.getByText('Perioada')).toBeInTheDocument();
    });

    test('displays all report types in dropdown', async () => {
        const user = userEvent.setup();
        render(<ReportsGenerator />);

        const reportSelect = screen.getByDisplayValue('Rezumat Pacienți');
        await user.click(reportSelect);

        await waitFor(() => {
            expect(screen.getByText('Analiza Riscurilor')).toBeInTheDocument();
            expect(screen.getByText('Raport Alergii')).toBeInTheDocument();
            expect(screen.getByText('Condiții Medicale')).toBeInTheDocument();
        });
    });

    test('generates patient summary report', async () => {
        const user = userEvent.setup();
        render(<ReportsGenerator />);

        const generateButton = screen.getByText('Generează Raport');
        await user.click(generateButton);

        await waitFor(() => {
            expect(screen.getByText('Raportul a fost generat cu succes!')).toBeInTheDocument();
            expect(screen.getByText('Maria Popescu')).toBeInTheDocument();
            expect(screen.getByText('Ion Ionescu')).toBeInTheDocument();
        });
    });

    test('exports report to CSV', async () => {
        const user = userEvent.setup();
        render(<ReportsGenerator />);

        // Generate a report first
        await user.click(screen.getByText('Generează Raport'));

        await waitFor(() => {
            const exportButton = screen.getByText('Export CSV');
            return user.click(exportButton);
        });

        await waitFor(() => {
            expect(screen.getByText('Raportul CSV a fost descărcat!')).toBeInTheDocument();
        });
    });

    test('displays statistics for generated reports', async () => {
        const user = userEvent.setup();
        render(<ReportsGenerator />);

        await user.click(screen.getByText('Generează Raport'));

        await waitFor(() => {
            expect(screen.getByText('Statistici Raport')).toBeInTheDocument();
            expect(screen.getByText('Total Înregistrări')).toBeInTheDocument();
        });
    });
});

export default {};
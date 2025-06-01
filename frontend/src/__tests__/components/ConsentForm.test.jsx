describe('ConsentForm Component', () => {
    const mockPatient = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        CNP: '1234567890123'
    };
    const mockMedicalData = {
        boli: { diabet: 'Da', boli_inima: 'Nu' },
        antecedente: { alergii: 'penicillin' }
    };
    const mockOnComplete = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        FormValidation.validateConsent = jest.fn().mockReturnValue({ isValid: true, errors: [] });

        // Mock canvas context for signature functionality
        HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            stroke: jest.fn(),
            clearRect: jest.fn(),
            strokeStyle: '',
            lineWidth: 0,
            lineCap: '',
            lineJoin: ''
        }));

        HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,test');
    });

    test('renders consent form with patient info', () => {
        render(
            <ConsentForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
                medicalData={mockMedicalData}
            />
        );

        expect(screen.getByText('Consimțământ și Semnătură')).toBeInTheDocument();
        expect(screen.getByText('Consimțământ pentru tratament')).toBeInTheDocument();
    });

    test('displays medical alerts based on medical data', () => {
        render(
            <ConsentForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
                medicalData={mockMedicalData}
            />
        );

        expect(screen.getByText(/DIABET - Atenție la cicatrizare/)).toBeInTheDocument();
        expect(screen.getByText(/ALERGII: penicillin/)).toBeInTheDocument();
    });

    test('handles digital signature drawing', async () => {
        render(
            <ConsentForm
                onComplete={mockOnComplete}
                onBack={mockOnBack}
                patient={mockPatient}
                medicalData={mockMedicalData}
            />
        );

        const canvas = document.querySelector('canvas');

        // Simulate drawing on canvas
        fireEvent.mouseDown(canvas, { clientX: 10, clientY: 10 });
        fireEvent.mouseMove(canvas, { clientX: 50, clientY: 50 });
        fireEvent.mouseUp(canvas);

        expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalled();
    });
});

// frontend/src/__tests__/components/TabletInterface.test.jsx
describe('TabletInterface Component', () => {
    const mockChildren = <div>Test Content</div>;

    beforeEach(() => {
        // Mock navigator.getBattery
        Object.defineProperty(navigator, 'getBattery', {
            writable: true,
            value: jest.fn().mockResolvedValue({
                level: 0.8,
                addEventListener: jest.fn(),
                removeEventListener: jest.fn()
            })
        });

        // Mock screen.orientation
        Object.defineProperty(window.screen, 'orientation', {
            writable: true,
            value: { angle: 0 }
        });
    });

    test('renders children content', () => {
        render(<TabletInterface>{mockChildren}</TabletInterface>);
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('displays status bar with clinic name', () => {
        render(<TabletInterface>{mockChildren}</TabletInterface>);
        expect(screen.getByText('Clinica Dentară')).toBeInTheDocument();
    });

    test('shows battery level when available', async () => {
        render(<TabletInterface>{mockChildren}</TabletInterface>);

        await waitFor(() => {
            expect(screen.getByText('80%')).toBeInTheDocument();
        });
    });

    test('handles online/offline status changes', () => {
        render(<TabletInterface>{mockChildren}</TabletInterface>);

        // Simulate going offline
        act(() => {
            fireEvent(window, new Event('offline'));
        });

        expect(screen.getByText('Offline')).toBeInTheDocument();
    });
});
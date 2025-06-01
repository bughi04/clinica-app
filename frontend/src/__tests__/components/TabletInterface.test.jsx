import TabletInterface, { TouchGestureHandler, TabletModal, TabletLoader } from '../../components/TabletInterface';

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
        fireEvent(window, new Event('offline'));

        expect(screen.getByText('Offline')).toBeInTheDocument();
    });
});

describe('TouchGestureHandler Component', () => {
    const mockOnSwipeLeft = jest.fn();
    const mockOnSwipeRight = jest.fn();
    const mockChildren = <div>Swipe Content</div>;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders children content', () => {
        render(
            <TouchGestureHandler onSwipeLeft={mockOnSwipeLeft} onSwipeRight={mockOnSwipeRight}>
                {mockChildren}
            </TouchGestureHandler>
        );

        expect(screen.getByText('Swipe Content')).toBeInTheDocument();
    });

    test('handles left swipe gesture', () => {
        render(
            <TouchGestureHandler onSwipeLeft={mockOnSwipeLeft} onSwipeRight={mockOnSwipeRight}>
                {mockChildren}
            </TouchGestureHandler>
        );

        const element = screen.getByText('Swipe Content').parentElement;

        // Simulate touch events for left swipe
        fireEvent.touchStart(element, {
            targetTouches: [{ clientX: 100 }]
        });

        fireEvent.touchMove(element, {
            targetTouches: [{ clientX: 40 }]
        });

        fireEvent.touchEnd(element);

        expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1);
    });
});

describe('TabletModal Component', () => {
    const mockOnClose = jest.fn();

    test('renders modal when open', () => {
        render(
            <TabletModal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <div>Modal Content</div>
            </TabletModal>
        );

        expect(screen.getByText('Test Modal')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    test('does not render when closed', () => {
        render(
            <TabletModal isOpen={false} onClose={mockOnClose} title="Test Modal">
                <div>Modal Content</div>
            </TabletModal>
        );

        expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    test('calls onClose when close button clicked', async () => {
        const user = userEvent.setup();
        render(
            <TabletModal isOpen={true} onClose={mockOnClose} title="Test Modal">
                <div>Modal Content</div>
            </TabletModal>
        );

        await user.click(screen.getByText('✕'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});

describe('TabletLoader Component', () => {
    test('renders with default message', () => {
        render(<TabletLoader />);
        expect(screen.getByText('Se încarcă...')).toBeInTheDocument();
    });

    test('renders with custom message', () => {
        render(<TabletLoader message="Loading custom content..." />);
        expect(screen.getByText('Loading custom content...')).toBeInTheDocument();
    });
});
import '@testing-library/jest-dom';

// Mock environment variables for frontend
process.env.VITE_API_URL = 'http://localhost:3001/api';

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock URL.createObjectURL for file downloads
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();

// Mock canvas for signature components
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    stroke: jest.fn(),
    clearRect: jest.fn(),
    strokeStyle: '',
    lineWidth: 0,
    lineCap: 'round',
    lineJoin: 'round'
}));

HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,test');

// Mock navigator.getBattery for tablet interface
Object.defineProperty(navigator, 'getBattery', {
    writable: true,
    value: jest.fn().mockResolvedValue({
        level: 0.8,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    })
});

// Mock screen.orientation for tablet interface
Object.defineProperty(window.screen, 'orientation', {
    writable: true,
    value: { angle: 0 }
});

// Mock orientation change events
Object.defineProperty(window, 'addEventListener', {
    writable: true,
    value: jest.fn()
});

Object.defineProperty(window, 'removeEventListener', {
    writable: true,
    value: jest.fn()
});

// Suppress console errors/warnings in tests
const originalConsoleError = console.error;
console.error = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
            args[0].includes('Warning: React.createFactory() is deprecated') ||
            args[0].includes('Warning: validateDOMNesting'))
    ) {
        return;
    }
    originalConsoleError.call(console, ...args);
};

// Mock Ant Design message component
jest.mock('antd', () => {
    const antd = jest.requireActual('antd');
    return {
        ...antd,
        message: {
            success: jest.fn(),
            error: jest.fn(),
            warning: jest.fn(),
            info: jest.fn(),
            loading: jest.fn(),
        },
    };
});

// Mock window.fs.readFile for file operations (if you use it)
if (typeof window !== 'undefined') {
    window.fs = {
        readFile: jest.fn().mockResolvedValue('mock file content')
    };
}
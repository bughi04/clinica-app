export default {
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.js'],
    moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        // Correct paths for your project structure
        '^../../../backend/src/models/FormValidation.js$': '<rootDir>/src/__mocks__/FormValidation.js',
        '^../../services/apiService.js$': '<rootDir>/src/__mocks__/apiService.js',
        '^../../components/(.*)$': '<rootDir>/src/components/$1',
        '^../../services/(.*)$': '<rootDir>/src/services/$1'
    },
    transform: {
        '^.+\\.(js|jsx)$': 'babel-jest'
    },
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
        '<rootDir>/src/**/*.{test,spec}.{js,jsx}'
    ],
    collectCoverageFrom: [
        'src/**/*.{js,jsx}',
        '!src/main.jsx',
        '!src/**/*.d.ts',
        '!src/__tests__/**',
        '!src/**/__tests__/**'
    ],
    coverageReporters: ['text', 'lcov', 'html'],
    coverageDirectory: 'coverage',
    testTimeout: 10000,
    moduleFileExtensions: ['js', 'jsx', 'json'],
    transformIgnorePatterns: [
        'node_modules/(?!(antd|@ant-design|lucide-react)/)'
    ]
};
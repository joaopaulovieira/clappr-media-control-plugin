module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.html$': '<rootDir>/src/__mocks__/htmlMock.js',
  },
  moduleNameMapper: { '\\.(scss)$': '<rootDir>/src/__mocks__/styleMock.js' },
  collectCoverageFrom: ['src/*.js'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}

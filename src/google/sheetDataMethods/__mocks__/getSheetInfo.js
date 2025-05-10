// src/google/sheetDataMethods/__mocks__/getSheetInfo.js
// This is the manual mock for ../google/sheetDataMethods/getSheetInfo.js

const mockInstance = jest.fn(() => Promise.resolve([])); // Default implementation

// Add a property to identify this specific mock instance for debugging
mockInstance.isManualMock = true;

export const getExistingTabTitlesInRange = mockInstance;

// If the original getSheetInfo.js has other named exports,
// you would define and export them here as well, e.g.:
// export const anotherFunction = jest.fn();
// anotherFunction.isManualMock = true; // and mark them too if needed

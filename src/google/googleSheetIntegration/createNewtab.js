import { dataObjects } from '../../index.js';
import { sheets, auth, spreadsheetId } from '../auth.js';
import { createSummaryTitle } from '../sheetDataMethods/createTabNames.js';
import { createWeeklySummaryTitle } from '../../sharedMethods/summaryHandler.js';

export const createNewTab = async (
  sheetName,
  // mockBatchUpdate, // Mock function for testing
  createSummaryTitleFn = createSummaryTitle, // Default to actual function
  dataObjectsRef = dataObjects, // Default to actual dataObjects
  sheetsInstance // Injected dependency for testing
) => {
  // Use the injected sheetsInstance or fall back to the actual sheets object
  const sheetsAPI = sheetsInstance || sheets;
  const authToUse = (sheetsInstance && sheetsInstance.auth) || auth;
  const spreadsheetIdToUse =
    (sheetsInstance && sheetsInstance.spreadsheetId) || spreadsheetId;

  try {
    const response = await sheetsAPI.spreadsheets.batchUpdate({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });

    const summaryTitle = createSummaryTitleFn();
    if (sheetName.includes(summaryTitle)) {
      dataObjectsRef.summaryTabData = response;
    } else {
      dataObjectsRef.todaysReportData = response;
    }
    return response;
  } catch (error) {
    console.error('"createNewTab": Error creating new sheet:', error);
    throw error;
  }
};

export const createNewWeeklyTab = async (
  sheetName,
  // mockBatchUpdate, // Mock function for testing
  createSummaryTitleFn = createWeeklySummaryTitle, // Default to actual function
  dataObjectsRef = dataObjects, // Default to actual dataObjects
  sheetsInstance // Injected dependency for testing
) => {
  // Use the injected sheetsInstance or fall back to the actual sheets object
  const sheetsAPI = sheetsInstance || sheets;
  const authToUse = (sheetsInstance && sheetsInstance.auth) || auth;
  const spreadsheetIdToUse =
    (sheetsInstance && sheetsInstance.spreadsheetId) || spreadsheetId;

  try {
    const response = await sheetsAPI.spreadsheets.batchUpdate({
      auth: authToUse,
      spreadsheetId: spreadsheetIdToUse,
      requestBody: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
      },
    });

    const summaryTitle = createSummaryTitleFn();
    if (sheetName.includes(summaryTitle)) {
      dataObjectsRef.weeklySummaryTabData = response;
    } else {
      dataObjectsRef.todaysReportData = response;
    }
    return response;
  } catch (error) {
    console.error('"createNewTab": Error creating new sheet:', error);
    throw error;
  }
};

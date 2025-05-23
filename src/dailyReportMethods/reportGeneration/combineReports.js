/**
 * Merges multiple reports into a single combined report. Each report consists
 * of pairs of entries, representing test metrics for types. This function merges rows
 * based on their index in respective reports, using placeholder data for missing entries.
 * @param {Array<Array<Array<string>>>} allReportEntries - An array of report entries to be combined.
 * @param {Array<Array<string>>} placeholders - Placeholder data for missing report entries.
 * @returns {Array<Array<string>>} A combined report with merged entries.
 * @throws {Error} Throws an error if inputs are invalid or if any report entry is not an array.
 */
export const combineReports = (allReportEntries, placeholders) => {
  if (!Array.isArray(allReportEntries) || !Array.isArray(placeholders)) {
    throw new Error(
      'Invalid input: Expected both allReportEntries and placeholders to be arrays.'
    );
  }

  if (allReportEntries.some((entry) => !Array.isArray(entry))) {
    console.error('Invalid report entry: Expected an array.');
    throw new Error('Invalid report entry: Expected an array.');
  }

  if (placeholders.some((entry) => !Array.isArray(entry))) {
    console.error('Invalid placeholder entry: Expected an array.');
    throw new Error('Invalid placeholder entry: Expected an array.');
  }

  let combinedReports = [];

  try {
    // Find the maximum number of type pairs across all reports
    const maxTypeCount = Math.max(
      ...allReportEntries.map((report) => {
        if (!Array.isArray(report)) {
          console.error('Invalid report entry: Expected an array.');
          throw new Error('Invalid report entry: Expected an array.');
        }
        return report.length / 2;
      })
    );

    // For each type pair
    for (let i = 0; i < maxTypeCount; i++) {
      let combinedRowTests = [];
      let combinedRowPassed = [];

      // For each report
      allReportEntries.forEach((report) => {
        // Push entries or placeholders for tests and passed metrics
        combinedRowTests.push(...(report[2 * i] || placeholders[0]));
        combinedRowPassed.push(...(report[2 * i + 1] || placeholders[1]));
      });

      combinedReports.push(combinedRowTests, combinedRowPassed);
    }

    return combinedReports;
  } catch (error) {
    console.error('Error combining reports:', error);
    throw error;
  }
};

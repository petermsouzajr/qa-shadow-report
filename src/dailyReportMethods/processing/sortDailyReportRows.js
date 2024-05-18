/**
 * Sorts the body payload of the data object by area, then spec, and finally testName.
 * @param {Object} payload - The data object containing the payload to be sorted.
 */
export const sortPayload = (payload) => {
  if (!payload || !Array.isArray(payload.bodyPayload)) {
    throw new Error(
      'Invalid payload: Expected an object with a bodyPayload array.'
    );
  }

  try {
    payload.bodyPayload.sort(
      (a, b) =>
        a.area.localeCompare(b.area) ||
        a.spec.localeCompare(b.spec) ||
        a.testName.localeCompare(b.testName)
    );
  } catch (error) {
    console.error('Error sorting payload:', error);
    throw error; // Propagate the error
  }
};

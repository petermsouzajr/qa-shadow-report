import { requireSheetsClient, withErrorContext } from './errors.js';

describe('withErrorContext', () => {
  it('preserves the original error as cause', () => {
    const cause = new Error('original failure');
    const result = withErrorContext('operation failed.', cause);

    expect(result).toMatchObject({
      message: 'operation failed.',
      cause,
    });
  });

  it('does not wrap an error that already has the requested message', () => {
    const error = new Error('operation failed.');

    expect(withErrorContext('operation failed.', error)).toBe(error);
  });

  it('defers authentication failures until a Sheets client is required', () => {
    const cause = new Error('invalid credentials');

    expect(() => requireSheetsClient(undefined, cause)).toThrow(
      'Google Sheets is not configured.'
    );
    expect(() => requireSheetsClient(undefined, cause)).toThrow(
      expect.objectContaining({ cause })
    );
  });
});

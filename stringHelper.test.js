const { validateUsername } = require('./stringHelper');

describe('validating username functionality', () => {
  test('should return true for a valid username', () => {
    const result = validateUsername('alex_dev');
    expect(result).toBe(true);
  });

  // Test Case 2: Under the length limit
  test('should return false if the username is too short', () => {
    const result = validateUsername('jo');
    expect(result).toBe(false);
  });

  // Test Case 3: Forbidden spaces
  test('should return false if the username contains spaces', () => {
    const result = validateUsername('alex smith');
    expect(result).toBe(false);
  });

  // Test Case 4: Edge case (empty input)
  test('should return false for an empty string or undefined', () => {
    expect(validateUsername('')).toBe(false);
  });
});

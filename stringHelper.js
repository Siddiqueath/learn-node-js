/**
 * Validates a username based on backend rules:
 * 1. Must exist (not empty)
 * 2. Must be at least 3 characters long
 * 3. Cannot contain spaces
 */
const validateUsername = (username) => {
  if (!username) return false;
  if (username.length < 3) return false;
  if (username.includes(' ')) return false;

  return true;
};

module.exports = { validateUsername };

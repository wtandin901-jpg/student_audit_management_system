// Small reusable validation helpers (no external library needed).

function isNonEmptyString(value, maxLength) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function isValidEmail(value) {
  return (
    typeof value === 'string' &&
    value.length <= 255 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  );
}

// Accepts 5 or "5". Rejects 0, -1, 1.5, "abc", true, null, arrays.
// 2147483647 is the largest value a PostgreSQL INTEGER can hold.
function isPositiveInt(value) {
  if (typeof value === 'string' && !/^\d+$/.test(value)) return false;
  if (typeof value !== 'number' && typeof value !== 'string') return false;
  const n = Number(value);
  return Number.isInteger(n) && n > 0 && n <= 2147483647;
}

// Accepts only real calendar dates in YYYY-MM-DD format.
function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

module.exports = { isNonEmptyString, isValidEmail, isPositiveInt, isValidDateString };
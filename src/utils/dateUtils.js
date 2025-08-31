// Utility functions for date handling without timezone issues

/**
 * Formats a date object to YYYY-MM-DD string without timezone conversion
 * @param {Date} date - The date object to format
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const formatDateToString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Gets today's date as YYYY-MM-DD string without timezone issues
 * @returns {string} - Today's date in YYYY-MM-DD format
 */
export const getTodayDateString = () => {
  return formatDateToString(new Date());
};

/**
 * Creates a date string for calendar generation without timezone issues
 * @param {number} year - The year
 * @param {number} month - The month (0-based)
 * @param {number} day - The day
 * @returns {string} - Date string in YYYY-MM-DD format
 */
export const createDateString = (year, month, day) => {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

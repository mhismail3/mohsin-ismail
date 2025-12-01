/**
 * Format a date value for display.
 * 
 * @param {string|Date} value - Date to format
 * @returns {string} Formatted date string (e.g., "Nov 26, 2025 3:45 PM")
 */
export const formatDate = (value) => {
  const { datePart, timePart } = formatDateParts(value);
  return `${datePart} ${timePart}`;
};

/**
 * Format a date value into separate date and time parts.
 * 
 * @param {string|Date} value - Date to format
 * @returns {{ datePart: string, timePart: string }} Object with formatted date and time
 */
export const formatDateParts = (value) => {
  const date = new Date(value);
  const datePart = new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  
  const timePart = new Intl.DateTimeFormat('en', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  
  return { datePart, timePart };
};

/**
 * Format a date for short display (month and year only).
 * 
 * @param {string|Date} value - Date to format
 * @returns {string} Formatted date string (e.g., "Nov 2025")
 */
export const formatShortDate = (value) => {
  const date = parseDate(value);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

/**
 * Parse a date value safely.
 * 
 * @param {string|Date} value - Date to parse
 * @returns {Date} Parsed date or current date if invalid
 */
export const parseDate = (value) => {
  const parsed = value ? new Date(value) : new Date();
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

export default formatDate;




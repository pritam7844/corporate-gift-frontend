'use client';

/**
 * FormattedDate Component
 * Standardizes date display across the application to dd/mm/yyyy format.
 * 
 * @param {string|Date|number} date - The date to format
 * @param {string} className - Optional CSS classes
 */
export default function FormattedDate({ date, className = '' }) {
  if (!date) return <span className={className}>N/A</span>;

  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return <span className={className}>Invalid Date</span>;
    }

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();

    return <span className={className}>{`${day}/${month}/${year}`}</span>;
  } catch (error) {
    console.error('Error formatting date:', error);
    return <span className={className}>Error</span>;
  }
}

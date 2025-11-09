/**
 * Date Utilities
 * Shared functions for date formatting across the application
 */

/**
 * Format upload date to relative time
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted relative time (e.g., "5m ago", "2h ago", "3d ago")
 */
export const formatUploadDate = (dateString) => {
  if (!dateString) return 'Recently';
  
  const now = new Date();
  const uploaded = new Date(dateString);
  const diffMs = now - uploaded;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return uploaded.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Format date to full readable format
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "January 15, 2025")
 */
export const formatFullDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Format date to compact format
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date (e.g., "Jan 15, 2025")
 */
export const formatCompactDate = (dateString) => {
  if (!dateString) return 'Unknown';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
};

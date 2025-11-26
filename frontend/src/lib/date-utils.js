/**
 * Format date consistently to avoid hydration mismatches
 * Uses a fixed format instead of locale-dependent methods
 */
export function formatDate(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  // Use fixed format: YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  return `${year}-${month}-${day}`;
}

/**
 * Format datetime consistently to avoid hydration mismatches
 * Uses a fixed format instead of locale-dependent methods
 */
export function formatDateTime(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  // Use fixed format: YYYY-MM-DD HH:MM
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * Format date in a more readable format (e.g., "Jan 15, 2024")
 * Only use this for client-side rendering to avoid hydration issues
 */
export function formatDateReadable(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  // Use a consistent format that works across locales
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}


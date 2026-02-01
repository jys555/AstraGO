/**
 * Date and time formatting utilities
 * Uses DD/MM/YYYY format for dates and 24-hour format for times
 */

/**
 * Format date to DD/MM/YYYY format
 */
export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format time to 24-hour format (HH:mm)
 */
export function formatTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

/**
 * Format date and time together
 */
export function formatDateTime(dateString: string | Date): string {
  return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

/**
 * Format date range (for trip windows)
 */
export function formatDateRange(start: string | Date, end: string | Date): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  if (isSameDay) {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  } else {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
  }
}

/**
 * Calculate end time from start time and duration in hours
 */
export function calculateEndTime(startTime: Date, durationHours: number): Date {
  const endTime = new Date(startTime);
  endTime.setHours(endTime.getHours() + Math.floor(durationHours));
  endTime.setMinutes(endTime.getMinutes() + Math.round((durationHours % 1) * 60));
  return endTime;
}

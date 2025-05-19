/**
 * Interview Reminder Utility Functions
 *
 * This module provides helper functions for generating interview reminders based on
 * upcoming scheduled dates and times. These functions are intended to enhance user awareness
 * of time-sensitive interviews by checking if an interview is occurring within the next 24 hours
 * and formatting a corresponding reminder message.
 *
 * Functions:
 *
 * 1. isInterviewWithin24Hours(dateStr, timeStr)
 *    - Takes a date and time string as input.
 *    - Constructs a Date object representing the scheduled interview time.
 *    - Compares the scheduled time to the current time.
 *    - Returns true if the interview is scheduled within the next 24 hours, false otherwise.
 *
 * 2. formatReminderTag(dateStr, timeStr)
 *    - Uses isInterviewWithin24Hours to determine if a reminder is needed.
 *    - Returns a formatted reminder string ("Reminder: Interview Soon!") if within 24 hours.
 *    - Returns null otherwise (no reminder needed).
 *
 * These utilities are intended for use within the InterviewScheduler component to conditionally
 * display reminder tags for interviews that are approaching soon.
 *
 * By: Nolan Dela Rosa
 * May 18, 2025
 */
export function isInterviewWithin24Hours(datetimeStr) {
  const interviewDateTime = new Date(datetimeStr);
  const now = new Date();
  const timeDiff = interviewDateTime.getTime() - now.getTime();

  return timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000;
}

export function formatReminderTag(dateStr, timeStr) {
  if (isInterviewWithin24Hours(dateStr, timeStr)) {
    return "Reminder: Interview Soon!";
  }

  return null;
}

/**
 * Parse RFC 3339 timestamp strings as a fallback
 */
export function parseOrgSocialTimestamp(timestamp) {
  if (!timestamp) {
    return null;
  }

  try {
    const normalizedTimestamp = timestamp.trim();
    const date = new Date(normalizedTimestamp);

    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp format:', timestamp);
      return null;
    }

    return date;
  } catch (error) {
    console.warn('Error parsing timestamp:', timestamp, error);
    return null;
  }
}

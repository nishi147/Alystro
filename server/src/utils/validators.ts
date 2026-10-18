/**
 * Validates whether a given string is a valid HTTP/HTTPS URL.
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Validates specifically whether a given URL is a valid Google Classroom or Google Meet URL.
 * Also permits general valid HTTPS educational live-stream URLs if needed.
 */
export function validateClassroomUrl(url: string): { isValid: boolean; isGoogleClassroom: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, isGoogleClassroom: false, error: 'URL is required.' };
  }

  const cleanUrl = url.trim();

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return {
      isValid: false,
      isGoogleClassroom: false,
      error: 'URL must begin with http:// or https:// (e.g. https://classroom.google.com/...)',
    };
  }

  try {
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname.toLowerCase();
    const isGoogle =
      hostname === 'classroom.google.com' ||
      hostname.endsWith('.classroom.google.com') ||
      hostname === 'meet.google.com';

    return {
      isValid: true,
      isGoogleClassroom: isGoogle,
    };
  } catch {
    return {
      isValid: false,
      isGoogleClassroom: false,
      error: 'Invalid URL format.',
    };
  }
}

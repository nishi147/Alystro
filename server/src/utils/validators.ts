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

/**
 * Validates that a given URL is strictly an HTTPS Google Classroom URL.
 * Rejects plain HTTP, external websites, non-Google hosts, or arbitrary URLs.
 */
export function validateStrictGoogleClassroomUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { isValid: false, error: 'Google Classroom URL is required.' };
  }

  const cleanUrl = url.trim();

  if (!cleanUrl.startsWith('https://')) {
    return {
      isValid: false,
      error: 'Google Classroom URL must use secure HTTPS (e.g. https://classroom.google.com/c/...)',
    };
  }

  try {
    const parsed = new URL(cleanUrl);
    const hostname = parsed.hostname.toLowerCase();

    const isGoogleClassroom =
      hostname === 'classroom.google.com' || hostname.endsWith('.classroom.google.com');

    if (!isGoogleClassroom) {
      return {
        isValid: false,
        error: 'URL must be a valid Google Classroom domain (classroom.google.com). Arbitrary external URLs are not permitted.',
      };
    }

    if (!parsed.pathname || parsed.pathname === '/' || parsed.pathname.length < 2) {
      return {
        isValid: false,
        error: 'Please provide a full Google Classroom link including class code or path (e.g. https://classroom.google.com/c/...).',
      };
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Invalid URL format.' };
  }
}


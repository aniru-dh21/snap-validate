/**
 * Snap Validate - Safe regex utilities
 *
 * NOTE: safeRegexTest's setTimeout does NOT interrupt a synchronous
 * regex.test() call (JS is single-threaded), so it cannot abort a real
 * ReDoS. The effective protections here are the input-length cap and the
 * isRegexSafe static heuristic.
 */

// Function to detect potentially dangerous regex patterns
const isRegexSafe = (regex) => {
  const regexStr = regex.toString();

  const dangerousPatterns = [
    /\([^)]*[+*?][^)]*\)[+*?]/,
    /\([^)]*\|[^)]*\)[+*]/,
    /\([^)]*\.\*[^)]*\)\*/,
    /[+*?]{2,}/,
    /\([^)]*\|[^)]*\)\+.*\([^)]*\|[^)]*\)\+/
  ];

  const isDangerous = dangerousPatterns.some((pattern) =>
    pattern.test(regexStr)
  );

  return !isDangerous;
};

// Utility function to safely test regex with timeout protection
const safeRegexTest = (regex, str, timeoutMs = 1000) => {
  return new Promise((resolve, reject) => {
    if (str.length > 10000) {
      reject(new Error('Input too long for regex validation'));
      return;
    }

    if (!isRegexSafe(regex)) {
      reject(new Error('Unsafe regex pattern detected'));
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Regex execution timeout - potential ReDoS attack'));
    }, timeoutMs);

    try {
      const result = regex.test(str);
      clearTimeout(timeout);
      resolve(result);
    } catch (error) {
      clearTimeout(timeout);
      reject(error);
    }
  });
};

// Synchronous safe regex test with input length protection
const safeRegexTestSync = (regex, str, maxLength = 10000) => {
  if (str.length > maxLength) {
    throw new Error('Input too long for pattern validation');
  }
  return regex.test(str);
};

module.exports = { isRegexSafe, safeRegexTest, safeRegexTestSync };

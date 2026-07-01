/**
 * Snap Validate - Safe regex utilities
 *
 * Honest note on ReDoS protection
 * --------------------------------
 * JavaScript runs regexes synchronously on a single thread, so a timer CANNOT
 * interrupt a regex that is mid-backtrack: the event loop is blocked until
 * regex.test() returns on its own. This module therefore does NOT attempt
 * (fake) timeout-based interruption. The protections that actually work are:
 *   1. an input-length cap, which rejects oversized inputs before matching; and
 *   2. isRegexSafe(), a best-effort STATIC check that flags a few common
 *      catastrophic-backtracking shapes.
 * isRegexSafe is a heuristic - it can miss dangerous patterns and can
 * occasionally over-reject safe ones. For guaranteed linear-time matching you
 * need a non-backtracking engine (e.g. the native `re2` module) or a worker /
 * subprocess with a real timeout.
 */

const MAX_INPUT_LENGTH = 10000;

// Best-effort STATIC detection of a few catastrophic-backtracking shapes.
// Heuristic only - see the module note above.
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

// Asynchronous wrapper, kept returning a Promise for API compatibility.
// Applies the two REAL guards (length cap + static safety check) and then runs
// the match. It does NOT - and cannot - interrupt a running regex.
const safeRegexTest = (regex, str) => {
  return new Promise((resolve, reject) => {
    if (str.length > MAX_INPUT_LENGTH) {
      reject(new Error('Input too long for regex validation'));
      return;
    }

    if (!isRegexSafe(regex)) {
      reject(new Error('Unsafe regex pattern detected'));
      return;
    }

    try {
      resolve(regex.test(str));
    } catch (error) {
      reject(error);
    }
  });
};

// Synchronous safe regex test with input-length protection.
const safeRegexTestSync = (regex, str, maxLength = MAX_INPUT_LENGTH) => {
  if (str.length > maxLength) {
    throw new Error('Input too long for pattern validation');
  }
  return regex.test(str);
};

module.exports = { isRegexSafe, safeRegexTest, safeRegexTestSync };

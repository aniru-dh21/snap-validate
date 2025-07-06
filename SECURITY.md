# Security Policy

## Supported Versions

We take security seriously and provide security updates for the following versions:

| Version | Supported          | Status |
| ------- | ------------------ | ------ |
| 0.3.x   | ✅ Yes             | Current stable release with full security support |
| 0.2.x   | ⚠️ Security fixes only | Critical security patches only |
| < 0.2.0 | ❌ No             | End of life - immediate upgrade recommended |

### Security Support Timeline

- **Current version (0.3.x)**: Full support with security fixes, new features, and bug fixes
- **Previous version (0.2.x)**: Security fixes and critical bug fixes only
- **Older versions (< 0.2.0)**: No longer supported - immediate upgrade recommended

## Security Features

### ReDoS (Regular Expression Denial of Service) Protection

Snap Validate includes comprehensive protection against ReDoS attacks:

#### Built-in Safety Measures
- **Regex Safety Detection**: Automatically detects potentially dangerous regex patterns
- **Input Length Protection**: 10,000 character limit to prevent ReDoS attacks
- **Timeout Protection**: Configurable timeout for regex operations (default: 1 second)
- **Safe Defaults**: All predefined validators use optimized, safe regex patterns

#### Security Functions
- `isRegexSafe(regex)` - Check if a regex pattern is safe to use
- `safeRegexText(regex, str, timeoutMs)` - Execute regex with timeout protection
- `patternAsync(regex, message)` - Async pattern validation with timeout protection
- `setRegexTimeout(timeoutMs)` - Configure custom timeout for regex operations

### Secure Validator Implementation

All built-in validators are designed with security in mind:

- **Phone Validator**: Uses simplified, safe regex patterns
- **Email Validator**: Optimized patterns to prevent catastrophic backtracking
- **Pattern Validation**: Automatic safety checks before execution
- **Error Boundaries**: Proper error handling to prevent crashes

## Reporting Security Vulnerabilities

### Responsible Disclosure

We encourage responsible disclosure of security vulnerabilities. Please follow these guidelines:

1. **DO NOT** create public GitHub issues for security vulnerabilities
2. **DO NOT** disclose vulnerabilities publicly before they are addressed
3. **DO** report vulnerabilities privately to our security team

### How to Report

**Contact**: Create a private security advisory on GitHub

### Information to Include

When reporting a security vulnerability, please include:

1. **Description**: Clear description of the vulnerability
2. **Reproduction Steps**: Step-by-step instructions to reproduce the issue
3. **Impact**: Potential impact and severity assessment
4. **Proof of Concept**: Working example demonstrating the vulnerability
5. **Suggested Fix**: If you have ideas for fixing the issue
6. **Environment**: Version numbers, operating system, Node.js version, etc.

### Response Timeline

- **Acknowledgment**: Within 48 hours of report
- **Initial Assessment**: Within 7 days
- **Fix Development**: Within 30 days for critical issues
- **Release**: Coordinated disclosure with fix release

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version of Snap Validate
2. **Validate Input Length**: Be aware of input size limits
3. **Use Built-in Validators**: Prefer predefined validators over custom regex
4. **Test Custom Patterns**: Use `isRegexSafe()` for custom regex patterns
5. **Handle Async Errors**: Always use try-catch blocks with async validation
6. **Set Appropriate Timeouts**: Configure regex timeouts based on your needs

### For Developers

1. **Security-First Development**: Consider security implications in all code changes
2. **Test Edge Cases**: Include security-focused test cases
3. **Review Dependencies**: Maintain zero external dependencies policy
4. **Safe Defaults**: Ensure all defaults are secure
5. **Input Validation**: Validate all inputs, especially user-provided regex patterns

## Security Audit

### Regular Security Reviews

- **Code Review**: All code changes undergo security review
- **Dependency Audit**: Regular `npm audit` checks (though we have zero dependencies)
- **Penetration Testing**: Regular security testing of validation patterns
- **Community Review**: Open source code allows community security review

### Automated Security Checks

- **CI/CD Pipeline**: Automated security scanning in our build process
- **Static Analysis**: Code analysis for potential security issues
- **Dependency Scanning**: Automated dependency vulnerability scanning
- **Pattern Testing**: Automated testing of regex patterns for ReDoS vulnerabilities

## Known Security Considerations

### Regex Security

- **Pattern Complexity**: Complex regex patterns can cause performance issues
- **Input Length**: Extremely long inputs can cause memory issues
- **Nested Quantifiers**: Patterns like `(a+)+` can cause exponential backtracking
- **Alternation**: Multiple alternations can cause performance degradation

### Async Validation Security

- **Timeout Handling**: Ensure proper timeout configuration for async operations
- **Error Handling**: Prevent information leakage through error messages
- **Resource Management**: Proper cleanup of async resources
- **Rate Limiting**: Consider rate limiting for external API calls in custom validators

## Security Development Guidelines

### Code Security Standards

1. **Input Sanitization**: Always sanitize user inputs
2. **Error Handling**: Never expose sensitive information in error messages
3. **Resource Limits**: Implement appropriate resource limits
4. **Safe Defaults**: Use secure defaults for all configuration options
5. **Minimal Permissions**: Follow principle of least privilege

### Testing Security

1. **Security Test Cases**: Include security-focused test cases
2. **Fuzzing**: Regular fuzzing of validation functions
3. **Performance Testing**: Test with large inputs and complex patterns
4. **Error Condition Testing**: Test error handling paths

## Incident Response

### Security Incident Handling

1. **Detection**: Monitor for security issues and vulnerability reports
2. **Assessment**: Evaluate severity and impact of security issues
3. **Response**: Develop and test fixes for security vulnerabilities
4. **Communication**: Notify users of security updates and recommended actions
5. **Recovery**: Ensure systems are updated and secure after incident resolution

### Communication Plan

- **Security Advisories**: Published on GitHub Security Advisories
- **Release Notes**: Security fixes documented in CHANGELOG.md
- **User Notification**: Email notifications for critical security updates
- **Community Updates**: Security updates communicated through official channels

## Compliance and Standards

### Security Standards

- **OWASP**: Following OWASP secure coding practices
- **CWE**: Addressing Common Weakness Enumeration patterns
- **NIST**: Incorporating NIST cybersecurity framework principles

### Regular Updates

- **Security Patches**: Regular security patch releases
- **Vulnerability Database**: Monitoring CVE databases for relevant vulnerabilities
- **Security Research**: Staying updated with latest security research

## Security Resources

### For Developers

- [OWASP Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

### For Users

- [npm Security Best Practices](https://docs.npmjs.com/packages-and-modules/securing-your-code)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Regex Security Guide](https://owasp.org/www-community/attacks/Regular_expression_Denial_of_Service_-_ReDoS)

## Contact Information

- **General Issues**: [GitHub Issues](https://github.com/aniru-dh21/snap-validate/issues)
- **Security Advisories**: [GitHub Security Advisories](https://github.com/aniru-dh21/snap-validate/security/advisories)

---

This security policy is regularly reviewed and updated. Last updated: July 2025

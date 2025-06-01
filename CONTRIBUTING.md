# Contributing to Snap Validate

We love your input! We want to make contributing to Mini Validator as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/aniru-dh21/snap-validate.git
cd snap-validate

# Install dependencies
npm install

# Run tests to make sure everything works
npm test
```

## Development Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write your code
   - Add/update tests
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm test                 # Run all tests
   npm run test:watch       # Run tests in watch mode
   npm run test:coverage    # Run tests with coverage
   npm run lint             # Check for linting errors
   npm run lint:fix         # Fix linting errors automatically
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new validator for social security numbers"
   ```

5. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Commit Message Convention

We use conventional commits for better changelog generation:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add credit card type detection
fix: resolve phone number validation for international formats
docs: update README with new validator examples
test: add edge cases for email validation
```

## Code Style

We use ESLint and Prettier to maintain consistent code style:

- Use single quotes for strings
- Use semicolons
- 2-space indentation
- Maximum line length of 80 characters
- Use camelCase for variables and functions
- Use PascalCase for classes

Run `npm run format` to auto-format your code.

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Include edge cases and error conditions
- Use descriptive test names
- Group related tests using `describe` blocks

### Test Structure

```javascript
describe('Validator Name', () => {
  describe('valid inputs', () => {
    test('should validate correct input', () => {
      // Test implementation
    });
  });

  describe('invalid inputs', () => {
    test('should reject invalid input', () => {
      // Test implementation
    });
  });
});
```

### Coverage Requirements

- Maintain at least 80% code coverage
- All new code must have accompanying tests
- Tests should cover both happy path and error cases

## Adding New Validators

When adding a new validator, please:

1. **Add the validator function** to `src/index.js`:
   ```javascript
   validators.newValidator = (value, options = {}) => {
     // Implementation
     return new BaseValidator(value)
       .required('Field is required')
       .pattern(/regex/, 'Invalid format');
   };
   ```

2. **Write comprehensive tests** in `tests/validators.test.js`:
   ```javascript
   describe('New Validator', () => {
     test('should validate correct input', () => {
       const result = validators.newValidator('valid-input').validate();
       expect(result.isValid).toBe(true);
     });
   });
   ```

3. **Update documentation** in `README.md`:
   - Add to the "Available Validators" section
   - Include usage examples
   - Document any options

4. **Add to TypeScript definitions** (if applicable)

## Reporting Bugs

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We love feature requests! Please provide:

- **Use case**: Describe the problem you're trying to solve
- **Proposed solution**: How you envision this feature working
- **Alternatives**: Any alternative solutions you've considered
- **Examples**: Code examples of how the feature would be used

## Performance Considerations

When contributing code:

- Keep the library lightweight
- Avoid external dependencies unless absolutely necessary
- Consider performance impact of regex patterns
- Use efficient algorithms (e.g., Luhn algorithm for credit cards)

## Documentation

- Update README.md for any API changes
- Include JSDoc comments for new functions
- Add examples for new validators
- Update CHANGELOG.md for notable changes

## Release Process

Maintainers follow this process for releases:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a git tag
4. Push to GitHub
5. Create a GitHub release
6. CI/CD automatically publishes to NPM

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Don't hesitate to ask questions by opening an issue with the "question" label.

Thank you for contributing to Mini Validator! 🚀

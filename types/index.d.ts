declare module 'snap-validate' {
  /**
   * Result of a validation operation
   */
  export class ValidationResult {
    constructor(isValid: boolean, errors?: string[]);
    isValid: boolean;
    errors: string[];
    addError(message: string): ValidationResult;
  }

  /**
   * Password validation options
   */
  export interface PasswordOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  }

  /**
   * Phone number format types
   */
  export type PhoneFormat = 'us' | 'international' | 'simple';

  /**
   * Country codes for zip code validation
   */
  export type CountryCode = 'us' | 'ca' | 'uk';

  /**
   * Custom validation function that returns boolean
   */
  export type CustomValidatorFunction = (
    value: any
  ) => boolean | string | ValidationResult;

  /**
   * Async custom validation function
   */
  export type AsyncValidatorFunction = (
    value: any
  ) => Promise<boolean | string | ValidationResult>;

  /**
   * Conditional validation condition
   */
  export type ConditionalFunction = (value: any) => boolean;

  /**
   * Conditional validator function
   */
  export type ConditionalValidatorFunction = (value: any) => BaseValidator;

  /**
   * Base validator class with chainable validation methods
   */
  export class BaseValidator {
    constructor(value: any);
    value: any;
    rules: Array<() => ValidationResult>;
    asyncRules: Array<() => Promise<ValidationResult>>;
    isOptional: boolean;

    /**
     * Make field required
     */
    required(message?: string): BaseValidator;

    /**
     * Make field optional (skips validation if empty)
     */
    optional(): BaseValidator;

    /**
     * Set minimum length/value
     */
    min(length: number, message?: string): BaseValidator;

    /**
     * Set maximum length/value
     */
    max(length: number, message?: string): BaseValidator;

    /**
     * Validate against regex pattern
     */
    pattern(regex: RegExp, message?: string): BaseValidator;

    /**
     * Conditional validation
     */
    when(
      condition: boolean | ConditionalFunction,
      validator: BaseValidator | ConditionalValidatorFunction
    ): BaseValidator;

    /**
     * Custom synchronous validation
     */
    custom(
      validatorFn: CustomValidatorFunction,
      message?: string
    ): BaseValidator;

    /**
     * Custom asynchronous validation
     */
    customAsync(
      validatorFn: AsyncValidatorFunction,
      message?: string
    ): BaseValidator;

    /**
     * Execute synchronous validation
     */
    validate(): ValidationResult;

    /**
     * Execute asynchronous validation (includes sync rules)
     */
    validateAsync(): Promise<ValidationResult>;
  }

  /**
   * Predefined validators
   */
  export interface Validators {
    email(value: string): BaseValidator;
    phone(value: string, format?: PhoneFormat): BaseValidator;
    creditCard(value: string): BaseValidator;
    url(value: string): BaseValidator;
    password(value: string, options?: PasswordOptions): BaseValidator;
    alphanumeric(value: string): BaseValidator;
    numeric(value: string): BaseValidator;
    zipCode(value: string, country?: CountryCode): BaseValidator;
  }

  /**
   * Result of schema validation
   */
  export interface SchemaValidationResult {
    isValid: boolean;
    errors: { [field: string]: ValidationResult };
    getErrors(): { [field: string]: string[] };
  }

  /**
   * Validation function type for schema
   */
  export type ValidationFunction = (value: any) => BaseValidator;

  /**
   * Schema definition type
   */
  export type Schema = { [field: string]: ValidationFunction | BaseValidator };

  /**
   * Predefined validator instances
   */
  export const validators: Validators;

  /**
   * Validate data against schema synchronously
   */
  export function validate(
    schema: Schema,
    data: { [key: string]: any }
  ): SchemaValidationResult;

  /**
   * Validate data against schema asynchronously
   */
  export function validateAsync(
    schema: Schema,
    data: { [key: string]: any }
  ): Promise<SchemaValidationResult>;
}

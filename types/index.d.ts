declare module 'snap-validate' {
  /**
   * Standard Schema v1 (https://standardschema.dev), vendored per the spec's
   * recommendation so snap-validate stays zero-dependency. Tools like tRPC,
   * TanStack Form, and Hono consume schemas through this interface.
   */
  export interface StandardSchemaV1<Input = unknown, Output = Input> {
    readonly '~standard': StandardSchemaV1.Props<Input, Output>;
  }

  export namespace StandardSchemaV1 {
    export interface Props<Input = unknown, Output = Input> {
      readonly version: 1;
      readonly vendor: string;
      readonly validate: (
        value: unknown
      ) => Result<Output> | Promise<Result<Output>>;
      readonly types?: Types<Input, Output> | undefined;
    }

    export type Result<Output> = SuccessResult<Output> | FailureResult;

    export interface SuccessResult<Output> {
      readonly value: Output;
      readonly issues?: undefined;
    }

    export interface FailureResult {
      readonly issues: ReadonlyArray<Issue>;
    }

    export interface Issue {
      readonly message: string;
      readonly path?: ReadonlyArray<PropertyKey | PathSegment> | undefined;
    }

    export interface PathSegment {
      readonly key: PropertyKey;
    }

    export interface Types<Input = unknown, Output = Input> {
      readonly input: Input;
      readonly output: Output;
    }

    export type InferInput<Schema extends StandardSchemaV1> = NonNullable<
      Schema['~standard']['types']
    >['input'];

    export type InferOutput<Schema extends StandardSchemaV1> = NonNullable<
      Schema['~standard']['types']
    >['output'];
  }

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
   * Custom validation function that returns boolean, an error string, or a
   * ValidationResult
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
   * Value transform/sanitize function used by transform()
   */
  export type TransformFunction = (value: any) => any;

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
     * @deprecated No-op. A timer cannot interrupt a synchronous regex on a
     * single thread, so this value is ignored. Retained for compatibility.
     */
    regexTimeout: number;

    /**
     * Set the field name used to prefix contextual error messages
     */
    setFieldName(name: string): BaseValidator;

    /**
     * Make field required
     */
    required(message?: string): BaseValidator;

    /**
     * Make field optional (skips validation if empty)
     */
    optional(): BaseValidator;

    /**
     * @deprecated No-op, retained for backward compatibility and chainability.
     * Regex execution cannot be interrupted by a timeout on a single thread, so
     * this setting is ignored.
     */
    setRegexTimeout(timeoutMs: number): BaseValidator;

    /**
     * Transform/sanitize the value before subsequent rules run
     */
    transform(fn: TransformFunction, errorMessage?: string): BaseValidator;

    /**
     * Require the value to strictly equal compareValue
     */
    equals(compareValue: any, message?: string): BaseValidator;

    /**
     * Require the value to be one of the allowed values
     */
    oneOf(allowedValues: any[], message?: string): BaseValidator;

    /**
     * Require a numeric value between min and max (inclusive)
     */
    between(min: number, max: number, message?: string): BaseValidator;

    /**
     * Set minimum length (string/array) or minimum value (number)
     */
    min(length: number, message?: string): BaseValidator;

    /**
     * Set maximum length (string/array) or maximum value (number)
     */
    max(length: number, message?: string): BaseValidator;

    /**
     * Require the value to be an array
     */
    array(message?: string): BaseValidator;

    /**
     * Validate each item of an array (synchronous)
     */
    arrayOf(
      validator: BaseValidator | ValidationFunction,
      message?: string
    ): BaseValidator;

    /**
     * Validate each item of an array (asynchronous)
     */
    arrayOfAsync(
      validator: BaseValidator | ValidationFunction,
      message?: string
    ): BaseValidator;

    /**
     * Validate a nested object against a schema (synchronous)
     */
    object(schema: Schema, message?: string): BaseValidator;

    /**
     * Validate a nested object against a schema (asynchronous)
     */
    objectAsync(schema: Schema, message?: string): BaseValidator;

    /**
     * Validate against regex pattern (synchronous)
     */
    pattern(regex: RegExp, message?: string): BaseValidator;

    /**
     * Validate against a regex pattern (asynchronous). Input-length and
     * static-safety guards apply; there is no runtime timeout interruption
     * (impossible for synchronous regex execution).
     */
    patternAsync(regex: RegExp, message?: string): BaseValidator;

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
     * Standard Schema v1 interface (https://standardschema.dev). Rebinds this
     * instance's value on each validate() call: safe for sequential reuse,
     * but use toStandardSchema() for concurrent async validation.
     */
    readonly '~standard': StandardSchemaV1.Props<unknown, unknown>;

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

  /**
   * Safely test a regex asynchronously. Applies an input-length cap and the
   * isRegexSafe static heuristic, then runs the match. Returns a Promise.
   *
   * Note: there is NO runtime timeout interruption - a timer cannot stop a
   * synchronous regex on a single thread.
   *
   * @param timeoutMs @deprecated Ignored; retained for backward compatibility.
   */
  export function safeRegexTest(
    regex: RegExp,
    str: string,
    timeoutMs?: number
  ): Promise<boolean>;

  /**
   * Safely test regex with input length protection (synchronous)
   */
  export function safeRegexTestSync(
    regex: RegExp,
    str: string,
    maxLength?: number
  ): boolean;

  /**
   * Check if a regex pattern is safe (best-effort static heuristic)
   */
  export function isRegexSafe(regex: RegExp): boolean;

  /**
   * Convert a snap-validate validator factory or schema object into a
   * reusable Standard Schema v1 (https://standardschema.dev), consumable by
   * tRPC, TanStack Form, Hono, and other Standard Schema tools.
   *
   * - Pass a factory `(value) => BaseValidator` for a single-value schema.
   * - Pass a snap-validate Schema object for object validation; issues carry
   *   a `path` of [fieldName], and the success value is a shallow copy of the
   *   input with transform()ed field values applied.
   */
  export function toStandardSchema(
    input: ValidationFunction | Schema
  ): StandardSchemaV1<unknown, unknown>;
}

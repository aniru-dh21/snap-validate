declare module 'snap-validate' {
  export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    addError(message: string): ValidationResult;
  }

  export interface PasswordOptions {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  }

  export type PhoneFormat = 'us' | 'international' | 'simple';
  export type CountryCode = 'us' | 'ca' | 'uk';

  export class BaseValidator {
    constructor(value: any);
    value: any;
    rules: Array<() => ValidationResult>;
    required(message?: string): BaseValidator;
    min(length: number, message?: string): BaseValidator;
    max(length: number, message?: string): BaseValidator;
    pattern(regex: RegExp, message?: string): BaseValidator;
    validate(): ValidationResult;
  }

  export class ValidationResult {
    constructor(isValid: boolean, errors?: string[]);
    isValid: boolean;
    errors: string[];
    addError(message: string): ValidationResult;
  }

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

  export interface SchemaValidationResult {
    isValid: boolean;
    errors: { [field: string]: ValidationResult };
    getErrors(): { [field: string]: string[] };
  }

  export type ValidationFunction = (value: any) => BaseValidator;
  export type Schema = { [field: string]: ValidationFunction };

  export const validators: Validators;
  export function validate(
    schema: Schema,
    data: { [key: string]: any }
  ): SchemaValidationResult;
}

// test-types.ts - compile-time tests for types/index.d.ts.
// Nothing here runs: `npm run type-check` passes only if every assertion
// holds and every @ts-expect-error line really is an error.

import {
  validators,
  validate,
  validateAsync,
  BaseValidator,
  ValidationResult,
  PasswordOptions,
  Schema,
  SchemaValidationResult,
  StandardSchemaV1,
  toStandardSchema,
  safeParse,
  safeParseAsync,
  SafeParseResult,
  ParseError,
  safeRegexTest,
  safeRegexTestSync,
  isRegexSafe
} from 'snap-validate';

// --- helpers ---------------------------------------------------------------
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Expect<T extends true> = T;

// --- predefined validators and chaining ------------------------------------
const passwordOptions: PasswordOptions = {
  minLength: 8,
  requireSpecialChars: true
};
validators.password('Secret123!', passwordOptions);
validators.phone('1234567890', 'international');
validators.zipCode('K1A 0B1', 'ca');
// @ts-expect-error - unsupported phone format
validators.phone('1234567890', 'mars');
// @ts-expect-error - unsupported country
validators.zipCode('12345', 'zz');

const chained: BaseValidator = new BaseValidator('value')
  .setFieldName('field')
  .optional()
  .required('required')
  .transform((v) => String(v).trim())
  .equals('value')
  .oneOf(['value', 'other'])
  .between(1, 10)
  .min(1)
  .max(10)
  .pattern(/^[a-z]+$/, 'letters only')
  .patternAsync(/^[a-z]+$/)
  .when(true, (v) => new BaseValidator(v).required())
  .custom((v) => v !== 'x' || 'cannot be x')
  .customAsync(async (v) => v !== 'y');

new BaseValidator([1, 2])
  .array()
  .arrayOf((item) => new BaseValidator(item).between(0, 5))
  .arrayOfAsync(new BaseValidator(1));
new BaseValidator({ a: 1 })
  .object({ a: (v) => new BaseValidator(v).required() })
  .objectAsync({ a: (v) => new BaseValidator(v).required() });

// @ts-expect-error - pattern() needs a RegExp
new BaseValidator('x').pattern('^x$');

const sync = chained.validate();
type _sync = Expect<Equal<typeof sync, ValidationResult>>;
const asyncResult = chained.validateAsync();
type _async = Expect<Equal<typeof asyncResult, Promise<ValidationResult>>>;

const result = new ValidationResult(true);
const added: ValidationResult = result.addError('message');
const errors: string[] = added.errors;

// --- schema validation -----------------------------------------------------
const userSchema: Schema = {
  email: (value) => validators.email(value).required(),
  age: (value) => new BaseValidator(value).between(18, 99)
};
const schemaResult: SchemaValidationResult = validate(userSchema, {
  email: 'a@b.com',
  age: 30
});
const fieldErrors: { [field: string]: string[] } = schemaResult.getErrors();
const schemaAsync: Promise<SchemaValidationResult> = validateAsync(
  userSchema,
  {}
);

// --- Standard Schema -------------------------------------------------------
const emailStd = toStandardSchema((v) => validators.email(String(v)));
type _std = Expect<Equal<typeof emailStd, StandardSchemaV1<unknown, unknown>>>;
const props = emailStd['~standard'];
const version: 1 = props.version;
const vendor: string = props.vendor;
const instanceStd: StandardSchemaV1.Props<unknown, unknown> = new BaseValidator(
  'x'
)['~standard'];

// A generic consumer, written the way framework authors do it.
async function consume<S extends StandardSchemaV1>(
  schema: S,
  data: unknown
): Promise<StandardSchemaV1.InferOutput<S> | string[]> {
  const r = await schema['~standard'].validate(data);
  return r.issues ? r.issues.map((i) => i.message) : r.value;
}
consume(toStandardSchema(userSchema), {});
consume(chained, 'x'); // instances are Standard Schemas too

// --- safeParse -------------------------------------------------------------
const parsed = safeParse(userSchema, { email: 'a@b.com', age: 30 });
if (parsed.success) {
  type _data = Expect<Equal<typeof parsed.data, unknown>>;
  // @ts-expect-error - no error on the success branch
  parsed.error.issues;
} else {
  const err: ParseError = parsed.error;
  const emailErrors: string[] | undefined = err.fieldErrors['email'];
  const formErrors: string[] = err.formErrors;
}

interface User {
  email: string;
  age: number;
}
const typedParse: SafeParseResult<User> = safeParse<User>(userSchema, {});
if (typedParse.success) {
  const email: string = typedParse.data.email;
}

// Output type is inferred from a typed Standard Schema (e.g. one from Zod).
declare const numberSchema: StandardSchemaV1<string, number>;
const inferred = safeParse(numberSchema, '42');
if (inferred.success) {
  type _num = Expect<Equal<typeof inferred.data, number>>;
}

const parsedAsync = safeParseAsync(
  (v) => validators.email(String(v)),
  'a@b.com'
);
type _parsedAsync = Expect<
  Equal<typeof parsedAsync, Promise<SafeParseResult<unknown>>>
>;
// @ts-expect-error - a number is not a schema
safeParse(42, 'x');

// --- regex utilities -------------------------------------------------------
const testPromise: Promise<boolean> = safeRegexTest(/^\d+$/, '123');
const legacyTimeout: Promise<boolean> = safeRegexTest(/^\d+$/, '123', 500);
const syncTest: boolean = safeRegexTestSync(/^\d+$/, '123', 100);
const safe: boolean = isRegexSafe(/^[a-z]+$/);
// Deprecated but still accepted for compatibility
const legacy: BaseValidator = new BaseValidator('x').setRegexTimeout(100);

export {
  sync,
  asyncResult,
  errors,
  fieldErrors,
  schemaAsync,
  version,
  vendor,
  instanceStd,
  testPromise,
  legacyTimeout,
  syncTest,
  safe,
  legacy
};

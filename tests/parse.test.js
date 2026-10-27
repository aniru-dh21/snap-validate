const {
  BaseValidator,
  validators,
  toStandardSchema,
  safeParse,
  safeParseAsync
} = require('../src/index');

describe('safeParse', () => {
  const userSchema = {
    email: validators.email,
    age: (v) => new BaseValidator(v).between(18, 99)
  };

  it('returns success with transformed data for a schema object', () => {
    const r = safeParse(userSchema, { email: ' A@B.com ', age: 30 });
    expect(r).toEqual({ success: true, data: { email: 'a@b.com', age: 30 } });
  });

  it('returns structured errors grouped by field', () => {
    const r = safeParse(userSchema, { email: 'bad', age: 5 });
    expect(r.success).toBe(false);
    expect(r.data).toBeUndefined();
    expect(Object.keys(r.error.fieldErrors).sort()).toEqual(['age', 'email']);
    expect(r.error.fieldErrors.email.length).toBeGreaterThan(0);
    expect(r.error.formErrors).toEqual([]);
    expect(r.error.issues.every((i) => typeof i.message === 'string')).toBe(
      true
    );
  });

  it('does not prefix field names onto messages (the path says which field)', () => {
    const schema = {
      age: (v) => new BaseValidator(v).between(18, 99, 'Too young')
    };
    const r = safeParse(schema, { age: 5 });
    expect(r.error.fieldErrors.age).toEqual(['Too young']);
    expect(r.error.issues[0]).toEqual({ message: 'Too young', path: ['age'] });

    const std = toStandardSchema(schema)['~standard'].validate({ age: 5 });
    expect(std.issues[0].message).toBe('Too young');
  });

  it('puts errors without a path into formErrors', () => {
    const r = safeParse(userSchema, 'not an object');
    expect(r.success).toBe(false);
    expect(r.error.formErrors[0]).toMatch(/object/i);
    expect(r.error.fieldErrors).toEqual({});
  });

  it('accepts a single-value validator factory', () => {
    expect(safeParse((v) => validators.email(v), 'X@Y.com')).toEqual({
      success: true,
      data: 'x@y.com'
    });

    const bad = safeParse((v) => validators.email(v), 'nope');
    expect(bad.success).toBe(false);
    expect(bad.error.formErrors.length).toBeGreaterThan(0);
  });

  it('accepts an existing Standard Schema, including non-snap-validate ones', () => {
    const foreign = {
      '~standard': {
        version: 1,
        vendor: 'other-lib',
        validate: (v) =>
          typeof v === 'number'
            ? { value: v }
            : { issues: [{ message: 'Expected number', path: [{ key: 'n' }] }] }
      }
    };

    expect(safeParse(foreign, 3)).toEqual({ success: true, data: 3 });
    expect(safeParse(foreign, 'x').error.fieldErrors).toEqual({
      n: ['Expected number']
    });
    expect(safeParse(toStandardSchema(userSchema), { age: 30 }).success).toBe(
      false
    );
  });

  it('accepts callable Standard Schemas (e.g. ArkType-style functions)', () => {
    const callable = Object.assign((v) => v, {
      '~standard': {
        version: 1,
        vendor: 'callable-lib',
        validate: (v) =>
          typeof v === 'string'
            ? { value: v }
            : { issues: [{ message: 'Expected string' }] }
      }
    });

    expect(safeParse(callable, 'hi')).toEqual({ success: true, data: 'hi' });
    expect(safeParse(callable, 1).error.formErrors).toEqual([
      'Expected string'
    ]);
  });

  it('throws a clear error when the schema has async rules', () => {
    const asyncSchema = {
      name: (v) => new BaseValidator(v).customAsync(async () => true)
    };
    expect(() => safeParse(asyncSchema, { name: 'x' })).toThrow(
      /safeParseAsync/
    );
  });

  it('throws for an invalid schema argument', () => {
    expect(() => safeParse(42, 'x')).toThrow();
  });
});

describe('safeParseAsync', () => {
  const signup = {
    username: (v) =>
      new BaseValidator(v)
        .required()
        .customAsync(async (name) => name !== 'taken' || 'Username taken')
  };

  it('resolves success for async schemas', async () => {
    await expect(
      safeParseAsync(signup, { username: 'fresh' })
    ).resolves.toEqual({ success: true, data: { username: 'fresh' } });
  });

  it('resolves failure with field errors', async () => {
    const r = await safeParseAsync(signup, { username: 'taken' });
    expect(r.success).toBe(false);
    expect(r.error.fieldErrors.username[0]).toMatch(/taken/);
  });

  it('also works for sync schemas', async () => {
    const r = await safeParseAsync((v) => validators.numeric(v), '123');
    expect(r).toEqual({ success: true, data: '123' });
  });
});

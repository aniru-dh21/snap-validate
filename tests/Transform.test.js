/**
 * Regression tests: transform() must run exactly once per validation run.
 * Previously a second validate() re-applied the transform to the already
 * transformed value (e.g. x * 2 became x * 4).
 */
const {
  BaseValidator,
  validators,
  validate,
  toStandardSchema
} = require('../src/index');

describe('transform() is applied once per run', () => {
  it('gives the same result when validate() is called repeatedly', () => {
    const v = new BaseValidator(5).transform((x) => x * 2).between(1, 15);

    const first = v.validate();
    const second = v.validate();
    const third = v.validate();

    expect(first.isValid).toBe(true);
    expect(second.isValid).toBe(true);
    expect(third.isValid).toBe(true);
    expect(v.value).toBe(10);
  });

  it('exposes the transformed value after a run', () => {
    const v = validators.email('  USER@Example.COM ');
    v.validate();
    expect(v.value).toBe('user@example.com');
  });

  it('is stable across validateAsync() runs', async () => {
    const v = new BaseValidator('ab')
      .transform((x) => x + x)
      .customAsync(async (x) => x.length === 4 || 'expected length 4');

    expect((await v.validateAsync()).isValid).toBe(true);
    expect((await v.validateAsync()).isValid).toBe(true);
    expect(v.value).toBe('abab');
  });

  it('uses a newly assigned value as the next raw input', () => {
    const v = new BaseValidator(1).transform((x) => x * 2);
    v.validate();
    expect(v.value).toBe(2);

    v.value = 4;
    v.validate();
    expect(v.value).toBe(8); // 4 * 2, not 4 * 2 * 2
  });

  it('works with instance-level ~standard rebinding', () => {
    const inst = new BaseValidator(null).transform((x) => x * 2).required();
    const std = inst['~standard'];

    expect(std.validate(2).value).toBe(4);
    expect(std.validate(4).value).toBe(8);
    expect(std.validate(4).value).toBe(8);
  });

  it('keeps schema-level transforms independent between calls', () => {
    const schema = { n: (v) => new BaseValidator(v).transform((x) => x * 2) };
    expect(validate(schema, { n: 3 }).isValid).toBe(true);

    const std = toStandardSchema(schema);
    expect(std['~standard'].validate({ n: 3 }).value).toEqual({ n: 6 });
    expect(std['~standard'].validate({ n: 3 }).value).toEqual({ n: 6 });
  });
});

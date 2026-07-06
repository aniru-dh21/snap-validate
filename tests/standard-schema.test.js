/**
 * Standard Schema v1 conformance tests (https://standardschema.dev)
 * Drop into tests/ — runs under the existing Jest setup.
 */
const { BaseValidator, validators, toStandardSchema } = require('../src/index');

// Generic consumer: uses only the spec, nothing snap-validate-specific.
async function consume(schema, data) {
  const std = schema['~standard'];
  expect(std.version).toBe(1);
  expect(std.vendor).toBe('snap-validate');
  let result = std.validate(data);
  if (result instanceof Promise) result = await result;
  return result;
}

describe('Standard Schema v1', () => {
  describe('toStandardSchema(factory)', () => {
    const emailSchema = toStandardSchema((v) => validators.email(v));

    it('validates and returns transformed output value', async () => {
      const r = await consume(emailSchema, 'USER@Example.COM');
      expect(r.issues).toBeUndefined();
      expect(r.value).toBe('user@example.com');
    });

    it('returns issues with message on failure', async () => {
      const r = await consume(emailSchema, 'nope');
      expect(Array.isArray(r.issues)).toBe(true);
      expect(typeof r.issues[0].message).toBe('string');
    });

    it('is reusable across calls without state bleed', async () => {
      const a = await consume(emailSchema, 'a@b.com');
      const b = await consume(emailSchema, 'bad');
      const c = await consume(emailSchema, 'c@d.com');
      expect(a.issues).toBeUndefined();
      expect(b.issues).toBeDefined();
      expect(c.issues).toBeUndefined();
    });

    it('returns a synchronous result when there are no async rules', () => {
      const r = emailSchema['~standard'].validate('a@b.com');
      expect(r instanceof Promise).toBe(false);
    });

    it('returns a Promise when async rules exist, and supports concurrency', async () => {
      const schema = toStandardSchema((v) =>
        new BaseValidator(v)
          .required()
          .customAsync(async (val) => val !== 'taken' || 'Username is taken')
      );
      expect(schema['~standard'].validate('x') instanceof Promise).toBe(true);
      const [a, b] = await Promise.all([
        consume(schema, 'alpha'),
        consume(schema, 'taken')
      ]);
      expect(a.issues).toBeUndefined();
      expect(a.value).toBe('alpha');
      expect(b.issues).toBeDefined();
    });
  });

  describe('toStandardSchema(schemaObject)', () => {
    const userSchema = toStandardSchema({
      email: validators.email,
      age: (v) => new BaseValidator(v).between(18, 99)
    });

    it('validates objects and applies transforms to the output', async () => {
      const r = await consume(userSchema, {
        email: 'A@B.com',
        age: 30,
        extra: 1
      });
      expect(r.issues).toBeUndefined();
      expect(r.value.email).toBe('a@b.com');
      expect(r.value.extra).toBe(1); // unknown keys pass through
    });

    it('collects issues with field paths', async () => {
      const r = await consume(userSchema, { email: 'bad', age: 5 });
      expect(r.issues.length).toBeGreaterThanOrEqual(2);
      for (const issue of r.issues) {
        expect(Array.isArray(issue.path)).toBe(true);
      }
      expect(r.issues.some((i) => i.path[0] === 'email')).toBe(true);
      expect(r.issues.some((i) => i.path[0] === 'age')).toBe(true);
    });

    it('rejects non-object input', async () => {
      const r = await consume(userSchema, 'nope');
      expect(r.issues[0].message).toMatch(/object/i);
    });

    it('goes async only when a field has async rules', async () => {
      expect(
        userSchema['~standard'].validate({
          email: 'a@b.com',
          age: 20
        }) instanceof Promise
      ).toBe(false);
      const mixed = toStandardSchema({
        email: validators.email,
        handle: (v) =>
          new BaseValidator(v).customAsync(
            async (x) => x.length > 2 || 'too short'
          )
      });
      const ret = mixed['~standard'].validate({
        email: 'a@b.com',
        handle: 'okay'
      });
      expect(ret instanceof Promise).toBe(true);
      const r = await ret;
      expect(r.issues).toBeUndefined();
    });
  });

  describe('BaseValidator instance ~standard', () => {
    it('works for sequential reuse', async () => {
      const inst = new BaseValidator(null).required().min(3);
      const a = await consume(inst, 'hello');
      const b = await consume(inst, 'x');
      const c = await consume(inst, 'world');
      expect(a.issues).toBeUndefined();
      expect(b.issues).toBeDefined();
      expect(c.value).toBe('world');
    });

    it('does not pollute enumerable keys', () => {
      const inst = new BaseValidator('x');
      expect(Object.keys(inst)).not.toContain('~standard');
    });
  });

  it('throws on invalid toStandardSchema input', () => {
    expect(() => toStandardSchema(42)).toThrow();
  });
});

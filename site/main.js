// snap-validate website. Bundled with the library by site/build.mjs.
import { validators, safeParse } from '../esm/index.mjs';

/* global __SNAP_VERSION__ */
const VERSION = typeof __SNAP_VERSION__ === 'string' ? __SNAP_VERSION__ : '';

const $ = (selector, root = document) => root.querySelector(selector);

// Build a DOM node with text children only (never innerHTML with user input).
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'class') node.className = value;
    else node.setAttribute(key, value);
  }
  for (const child of children) {
    node.append(
      child instanceof Node ? child : document.createTextNode(String(child))
    );
  }
  return node;
}

const quote = (value) => `'${value}'`;

/* ------------------------------------------------------------------ */
/* Playground                                                          */
/* ------------------------------------------------------------------ */

const phoneSamples = {
  us: ['(555) 123-4567', '555-0100'],
  international: ['+44 20 7946 0958', '020 7946 0958'],
  simple: ['0412 345 678', '12345']
};
const postcodeSamples = {
  us: ['90210', '9021'],
  ca: ['K1A 0B6', 'K1A 0B'],
  uk: ['SW1A 1AA', 'SW1A']
};

const passwordDefaults = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false
};

const PRESETS = {
  email: {
    label: 'Email address',
    idle: 'Type an email address, or try an example.',
    samples: () => [' Ana@Example.COM ', 'ana@example'],
    build: (value) => validators.email(value),
    call: () => ['email', []]
  },
  phone: {
    label: 'Phone number',
    idle: 'Type a phone number, or try an example.',
    options: [
      {
        type: 'select',
        name: 'format',
        label: 'Format',
        choices: [
          ['us', 'US'],
          ['international', 'International'],
          ['simple', 'Digits only']
        ]
      }
    ],
    samples: (o) => phoneSamples[o.format],
    build: (value, o) => validators.phone(value, o.format),
    call: (o) => ['phone', [quote(o.format)]]
  },
  card: {
    label: 'Card number',
    idle: 'Type a card number, or try an example. Use test numbers, not a real card.',
    samples: () => ['4111 1111 1111 1111', '4111 1111 1111 1112'],
    build: (value) => validators.creditCard(value),
    call: () => ['creditCard', []]
  },
  postcode: {
    label: 'Postcode',
    idle: 'Type a postcode, or try an example.',
    options: [
      {
        type: 'select',
        name: 'country',
        label: 'Country',
        choices: [
          ['uk', 'United Kingdom'],
          ['us', 'United States'],
          ['ca', 'Canada']
        ]
      }
    ],
    samples: (o) => postcodeSamples[o.country],
    build: (value, o) => validators.zipCode(value, o.country),
    call: (o) => ['zipCode', [quote(o.country)]]
  },
  password: {
    label: 'Password',
    idle: 'Type a password, or try an example. Nothing leaves your browser.',
    options: [
      {
        type: 'number',
        name: 'minLength',
        label: 'Minimum length',
        min: 4,
        max: 32
      },
      { type: 'checkbox', name: 'requireUppercase', label: 'Uppercase' },
      { type: 'checkbox', name: 'requireLowercase', label: 'Lowercase' },
      { type: 'checkbox', name: 'requireNumbers', label: 'Number' },
      { type: 'checkbox', name: 'requireSpecialChars', label: 'Symbol' }
    ],
    samples: (o) => {
      let valid = 'Correct4Horse!';
      while (valid.length < o.minLength) valid += 'x';
      return [valid, 'hunter2'];
    },
    build: (value, o) => validators.password(value, o),
    call: (o) => {
      // Show only the options that differ from the defaults.
      const changed = Object.entries(o).filter(
        ([key, value]) => passwordDefaults[key] !== value
      );
      if (changed.length === 0) return ['password', []];
      return [
        'password',
        [`{ ${changed.map(([k, v]) => `${k}: ${v}`).join(', ')} }`]
      ];
    }
  },
  url: {
    label: 'Website address',
    idle: 'Type a URL, or try an example.',
    samples: () => ['https://example.com/docs', 'example.com'],
    build: (value) => validators.url(value),
    call: () => ['url', []]
  }
};

const optionState = {
  phone: { format: 'us' },
  postcode: { country: 'uk' },
  password: { ...passwordDefaults }
};

const pg = {
  input: $('#pg-input'),
  label: $('#pg-label'),
  options: $('#pg-options'),
  verdict: $('#pg-verdict'),
  code: $('#pg-code'),
  mark: $('#pg-mark'),
  markPath: $('#pg-mark-path')
};

let preset = 'phone';
let lastState = 'idle';

const MARK_PATHS = {
  pass: 'M9 21.5 16.5 29 31.5 11',
  fail: 'M12 12 28 28M28 12 12 28'
};

function setMark(state) {
  pg.mark.classList.remove('pass', 'fail', 'draw');
  if (state === 'idle') {
    pg.markPath.setAttribute('d', '');
    return;
  }
  pg.markPath.setAttribute('d', MARK_PATHS[state]);
  pg.mark.classList.add(state);
  if (state !== lastState) {
    void pg.mark.getBoundingClientRect(); // restart the animation
    pg.mark.classList.add('draw');
  }
}

function renderOptions() {
  pg.options.replaceChildren();
  const config = PRESETS[preset].options || [];
  const state = optionState[preset];

  for (const option of config) {
    const id = `opt-${preset}-${option.name}`;
    let control;
    if (option.type === 'select') {
      control = el('select', { id });
      for (const [value, text] of option.choices) {
        const choice = el('option', { value }, text);
        if (state[option.name] === value) choice.selected = true;
        control.append(choice);
      }
      control.addEventListener('change', () => {
        state[option.name] = control.value;
        run();
      });
      pg.options.append(el('label', { for: id }, `${option.label} `, control));
    } else if (option.type === 'number') {
      control = el('input', {
        id,
        type: 'number',
        min: option.min,
        max: option.max,
        value: state[option.name]
      });
      control.addEventListener('input', () => {
        const n = Number(control.value);
        if (Number.isInteger(n) && n >= option.min && n <= option.max) {
          state[option.name] = n;
          run();
        }
      });
      pg.options.append(el('label', { for: id }, `${option.label} `, control));
    } else {
      control = el('input', { id, type: 'checkbox' });
      control.checked = state[option.name];
      control.addEventListener('change', () => {
        state[option.name] = control.checked;
        run();
      });
      pg.options.append(el('label', { for: id }, control, option.label));
    }
  }
}

function renderCode(name, args, result) {
  const argText = ['value', ...args].join(', ');
  const resultText = result.isValid
    ? '{ isValid: true, errors: [] }'
    : `{ isValid: false, errors: [${result.errors.map(quote).join(', ')}] }`;

  pg.code.replaceChildren(
    `validators.${name}(${argText}).validate();\n`,
    el('span', { class: 'c' }, `// ${resultText}`)
  );
}

function run() {
  const config = PRESETS[preset];
  const options = optionState[preset] || {};
  const raw = pg.input.value;

  const validator = config.build(raw, options);
  const result = validator.validate();
  const [name, args] = config.call(options);
  renderCode(name, args, result);

  if (raw.trim() === '') {
    pg.verdict.replaceChildren(el('p', { class: 'idle' }, config.idle));
    pg.input.removeAttribute('aria-invalid');
    setMark('idle');
    lastState = 'idle';
    return;
  }

  const state = result.isValid ? 'pass' : 'fail';
  if (result.isValid) {
    const nodes = [el('p', { class: 'ok' }, 'Valid')];
    if (typeof validator.value === 'string' && validator.value !== raw) {
      nodes.push(
        el(
          'p',
          { class: 'normalised' },
          'Cleaned value: ',
          el('code', {}, validator.value)
        )
      );
    }
    pg.verdict.replaceChildren(...nodes);
  } else {
    pg.verdict.replaceChildren(
      el('ul', {}, ...result.errors.map((message) => el('li', {}, message)))
    );
  }
  pg.input.setAttribute('aria-invalid', String(!result.isValid));
  setMark(state);
  lastState = state;
}

function selectPreset(name) {
  preset = name;
  pg.label.textContent = PRESETS[name].label;
  pg.input.inputMode =
    name === 'card' ? 'numeric' : name === 'phone' ? 'tel' : 'text';
  renderOptions();
}

document.querySelectorAll('input[name="preset"]').forEach((radio) => {
  radio.addEventListener('change', () => {
    if (!radio.checked) return;
    selectPreset(radio.value);
    pg.input.value = PRESETS[preset].samples(optionState[preset] || {})[0];
    run();
  });
});

document.querySelectorAll('.sample').forEach((button) => {
  button.addEventListener('click', () => {
    const [valid, invalid] = PRESETS[preset].samples(optionState[preset] || {});
    pg.input.value = button.dataset.sample === 'valid' ? valid : invalid;
    run();
    pg.input.focus();
  });
});

pg.input.addEventListener('input', run);

/* ------------------------------------------------------------------ */
/* Sign-up form demo                                                   */
/* ------------------------------------------------------------------ */

const form = $('#signup');
const fields = ['email', 'phone', 'postcode', 'password'];
const touched = new Set();
const status = $('#form-status');
const resultBox = $('#result-json');

function readForm() {
  return {
    email: form.elements.email.value,
    phone: form.elements.phone.value,
    postcode: form.elements.postcode.value,
    password: form.elements.password.value
  };
}

function signupSchema(country) {
  return {
    email: validators.email,
    phone: (value) => validators.phone(value, 'international'),
    postcode: (value) => validators.zipCode(value, country),
    password: validators.password
  };
}

// Pretty-print JSON, keeping small objects and arrays on one line so each
// issue reads as a single row instead of eight.
function formatJson(value, indent = '') {
  const inline = (v) => {
    if (Array.isArray(v)) return `[${v.map(inline).join(', ')}]`;
    if (v && typeof v === 'object') {
      const parts = Object.entries(v).map(
        ([k, x]) => `${JSON.stringify(k)}: ${inline(x)}`
      );
      return parts.length ? `{ ${parts.join(', ')} }` : '{}';
    }
    return JSON.stringify(v);
  };
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  const flat = inline(value);
  // +1 for a trailing comma; 56 characters fit the desktop result box.
  if (flat.length + indent.length + 1 <= 56) return flat;

  const next = indent + '  ';
  let items;
  if (Array.isArray(value)) {
    items = value.map((v) => next + formatJson(v, next));
  } else {
    items = Object.entries(value).map(
      ([k, v]) => `${next}${JSON.stringify(k)}: ${formatJson(v, next)}`
    );
  }
  const [open, close] = Array.isArray(value) ? ['[', ']'] : ['{', '}'];
  return `${open}\n${items.join(',\n')}\n${indent}${close}`;
}

// Show the result as JSON, without echoing the password back on screen.
function renderResult(result) {
  const shown = JSON.parse(JSON.stringify(result));
  if (
    shown.success &&
    typeof shown.data.password === 'string' &&
    shown.data.password
  ) {
    shown.data.password = '(hidden on this page)';
  }
  const json = formatJson(shown);
  const nodes = [];
  // Colour string values; everything is inserted as text.
  const pattern = /("(?:[^"\\]|\\.)*")(\s*:)?/g;
  let last = 0;
  for (const match of json.matchAll(pattern)) {
    nodes.push(json.slice(last, match.index));
    nodes.push(match[2] ? match[0] : el('span', { class: 's' }, match[1]));
    last = match.index + match[0].length;
  }
  nodes.push(json.slice(last));
  resultBox.replaceChildren(...nodes);
}

function checkForm({ submitted = false } = {}) {
  const country = form.elements.country.value;
  $('#schema-country').textContent = quote(country);
  const result = safeParse(signupSchema(country), readForm());

  for (const field of fields) {
    const input = form.elements[field];
    const messages = result.success
      ? []
      : result.error.fieldErrors[field] || [];
    const show = touched.has(field) && messages.length > 0;
    $(`#e-${field}`).textContent = show ? messages[0] : '';
    if (touched.has(field))
      input.setAttribute('aria-invalid', String(messages.length > 0));
    else input.removeAttribute('aria-invalid');
  }

  renderResult(result);

  if (submitted) {
    if (result.success) {
      status.textContent = 'All fields are valid.';
    } else {
      status.textContent = '';
      const first = fields.find((f) => result.error.fieldErrors[f]);
      if (first) form.elements[first].focus();
    }
  } else if (!result.success) {
    status.textContent = '';
  }
}

for (const field of fields) {
  const input = form.elements[field];
  input.addEventListener('blur', () => {
    if (input.value !== '') touched.add(field);
    checkForm();
  });
  input.addEventListener('input', () => checkForm());
}
form.elements.country.addEventListener('change', () => checkForm());

form.addEventListener('submit', (event) => {
  event.preventDefault();
  fields.forEach((f) => touched.add(f));
  checkForm({ submitted: true });
});

$('#fill-example').addEventListener('click', () => {
  const country = form.elements.country.value;
  form.elements.email.value = ' Ana@Example.COM ';
  form.elements.phone.value = '+61 412 345 678';
  form.elements.postcode.value = postcodeSamples[country][0];
  form.elements.password.value = 'Correct4Horse';
  fields.forEach((f) => touched.add(f));
  checkForm({ submitted: true });
});

/* ------------------------------------------------------------------ */
/* Copy button, version                                                */
/* ------------------------------------------------------------------ */

document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copy).textContent;
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = 'Copied';
    } catch {
      button.textContent = 'Press Ctrl+C';
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(button.dataset.copy));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
    setTimeout(() => (button.textContent = 'Copy'), 2000);
  });
});

if (VERSION) $('#version').textContent = `v${VERSION}`;

/* ------------------------------------------------------------------ */
/* Start                                                               */
/* ------------------------------------------------------------------ */

selectPreset(preset);
pg.input.value = PRESETS[preset].samples(optionState[preset])[0];
run();
checkForm();

const SDK_URL = 'https://esm.sh/@dashevo/evo-sdk@4.1.0';

const text = (value) => String(value ?? '—');

function metric(label, value) {
  const wrapper = document.createElement('div');
  wrapper.className = 'interactive-tutorial__metric';
  const strong = document.createElement('strong');
  strong.textContent = text(value);
  const caption = document.createElement('span');
  caption.textContent = label;
  wrapper.append(strong, caption);
  return wrapper;
}

function normalize(value) {
  if (value && typeof value.toJSON === 'function') return normalize(value.toJSON());
  if (value instanceof Map) {
    return [...value.entries()].map(([id, item]) => ({ id: text(id), ...normalize(item) }));
  }
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalize(item)]));
  }
  return value;
}

function renderResult(container, rawValue, renderer) {
  const value = renderer === 'name' ? text(rawValue) : normalize(rawValue);
  const summary = document.createElement('div');
  summary.className = 'interactive-tutorial__summary';
  if (renderer === 'identity') {
    summary.append(
      metric('Identity ID', value.id),
      metric('Balance (credits)', Number(value.balance ?? 0).toLocaleString()),
      metric('Revision', value.revision),
      metric('Public keys', value.publicKeys?.length ?? 0),
    );
  } else if (renderer === 'contract') {
    summary.append(
      metric('Contract ID', value.id),
      metric('Owner', value.ownerId),
      metric('Version', value.version),
      metric('Document types', Object.keys(value.documentSchemas ?? {}).length),
    );
  } else if (renderer === 'name') {
    summary.append(metric('Resolved identity ID', value));
  } else if (renderer === 'documents') {
    summary.append(metric('Documents returned', value.length));
  } else if (renderer === 'status') {
    summary.append(metric('Connection', 'Successful'));
  }

  const details = document.createElement('details');
  const label = document.createElement('summary');
  label.textContent = 'Raw response';
  const output = document.createElement('pre');
  output.className = 'interactive-tutorial__json';
  output.textContent = JSON.stringify(
    value,
    (_key, item) => (typeof item === 'bigint' ? item.toString() : item),
    2,
  );
  details.append(label, output);
  container.replaceChildren(summary, details);
}

function renderMessage(container, message, isError = false) {
  const messageElement = document.createElement('div');
  messageElement.className = isError
    ? 'interactive-tutorial__error'
    : 'interactive-tutorial__empty';
  messageElement.textContent = message;
  container.replaceChildren(messageElement);
}

async function initialize(block) {
  const network = block.dataset.network ?? 'testnet';
  const renderer = block.dataset.renderer ?? 'status';
  const inputs = [...block.querySelectorAll('[data-param]')];
  const sourceElement = block.querySelector('[data-role="source"]');
  const sourceBody = sourceElement?.textContent?.trim();
  const runButton = block.querySelector('[data-role="run"]');
  const resetButton = block.querySelector('[data-role="reset"]');
  const result = block.querySelector('[data-role="result"]');
  const connection = block.querySelector('[data-role="connection"]');

  if (!sourceElement || !sourceBody || !runButton || !resetButton || !result || !connection) return;
  inputs.forEach((input) => { input.value = input.dataset.defaultValue ?? ''; });

  // Materialize current form values as JavaScript declarations above the
  // authored snippet. The complete visible snippet is then executed as-is.
  function updateDisplayedSource() {
    const declarations = inputs.map(
      (input) => `const ${input.dataset.param} = ${JSON.stringify(input.value)};`,
    );
    sourceElement.textContent = [...declarations, declarations.length ? '' : null, sourceBody]
      .filter((line) => line !== null)
      .join('\n');
  }
  updateDisplayedSource();

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  let EvoSDK;
  async function loadSdk() {
    if (EvoSDK) return EvoSDK;
    connection.textContent = 'Loading SDK…';
    connection.dataset.state = 'connecting';
    ({ EvoSDK } = await import(SDK_URL));
    connection.textContent = `SDK loaded · ${network}`;
    connection.dataset.state = 'connected';
    return EvoSDK;
  }

  async function run() {
    const missing = inputs.find((input) => input.required && !input.value.trim());
    if (missing) {
      renderMessage(result, `Enter ${missing.dataset.label ?? 'a value'}.`, true);
      missing.focus();
      return;
    }

    runButton.disabled = true;
    inputs.forEach((input) => { input.disabled = true; });
    renderMessage(result, 'Running query…');
    try {
      const sdkClass = await loadSdk();
      connection.textContent = `Connecting to ${network}…`;
      const execute = new AsyncFunction('EvoSDK', sourceElement.textContent);
      const output = await execute(sdkClass);
      connection.textContent = `Connected to ${network}`;
      if (output == null) {
        renderMessage(result, 'No result was found.', true);
        return;
      }
      renderResult(result, output, renderer);
    } catch (error) {
      connection.textContent = 'Run failed';
      connection.dataset.state = 'error';
      renderMessage(result, `Query failed: ${error?.message ?? error}`, true);
    } finally {
      runButton.disabled = false;
      inputs.forEach((input) => { input.disabled = false; });
    }
  }

  runButton.addEventListener('click', run);
  inputs.forEach((input) => {
    input.addEventListener('input', updateDisplayedSource);
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') run();
    });
  });
  resetButton.addEventListener('click', () => {
    inputs.forEach((input) => { input.value = input.dataset.defaultValue ?? ''; });
    updateDisplayedSource();
    renderMessage(result, 'Run the query to inspect the result.');
    inputs[0]?.focus();
  });
}

document.querySelectorAll('.interactive-tutorial').forEach(initialize);

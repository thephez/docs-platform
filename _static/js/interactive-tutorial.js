const SDK_URL = 'https://esm.sh/@dashevo/evo-sdk@4.1.0';

// Explicit allow-list of safe, read-only tutorial operations. The UI obtains
// its displayed source directly from these functions, preventing code drift.
async function getNetworkStatus({ EvoSDK }) {
  const sdk = EvoSDK.testnetTrusted();
  await sdk.connect();
  const status = await sdk.system.status();
  return status.toJSON();
}

async function fetchIdentity({ EvoSDK, identityId }) {
  const sdk = EvoSDK.testnetTrusted();
  await sdk.connect();
  const identity = await sdk.identities.fetch(identityId);
  return identity?.toJSON() ?? null;
}

async function fetchContract({ EvoSDK, dataContractId }) {
  const sdk = EvoSDK.testnetTrusted();
  await sdk.connect();
  const contract = await sdk.contracts.fetch(dataContractId);
  return contract?.toJSON() ?? null;
}

async function queryDocuments({ EvoSDK, dataContractId, documentTypeName, limit }) {
  const sdk = EvoSDK.testnetTrusted();
  await sdk.connect();
  return sdk.documents.query({
    dataContractId,
    documentTypeName,
    limit: Number(limit),
  });
}

async function resolveName({ EvoSDK, name }) {
  const sdk = EvoSDK.testnetTrusted();
  await sdk.connect();
  return sdk.dpns.resolveName(name);
}

const operations = {
  'network-status': getNetworkStatus,
  'identity-fetch': fetchIdentity,
  'contract-fetch': fetchContract,
  'documents-query': queryDocuments,
  'name-resolve': resolveName,
};

const text = (value) => String(value ?? '—');

function integer(value) {
  if (value == null || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString() : text(value);
}

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
    summary.append(
      metric('Network', value.network?.chainId),
      metric('Latest block', integer(value.chain?.latestBlockHeight)),
      metric('Sync status', value.chain?.isCatchingUp ? 'Catching up' : 'Synced'),
      metric('Peers', integer(value.network?.peersCount)),
      metric('DAPI', value.version?.software?.dapi),
      metric('Drive', value.version?.software?.drive),
      metric('Tenderdash', value.version?.software?.tenderdash),
    );
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
  const operationName = block.dataset.operation;
  const operation = operations[operationName];
  const network = block.dataset.network ?? 'testnet';
  const renderer = block.dataset.renderer ?? 'status';
  const inputs = [...block.querySelectorAll('[data-param]')];
  const sourceElement = block.querySelector('[data-role="source"]');
  const runButton = block.querySelector('[data-role="run"]');
  const resetButton = block.querySelector('[data-role="reset"]');
  const result = block.querySelector('[data-role="result"]');
  const connection = block.querySelector('[data-role="connection"]');

  if (!sourceElement || !runButton || !resetButton || !result || !connection) return;
  if (!operation) {
    renderMessage(result, `Interactive tutorial is not configured correctly: ${operationName ?? 'missing operation'}.`, true);
    return;
  }
  inputs.forEach((input) => { input.value = input.dataset.defaultValue ?? ''; });

  // Derive the display from the same function object invoked by run(). The DOM
  // remains non-executable, while current parameter values make the call clear.
  function updateDisplayedSource() {
    const declarations = inputs.map(
      (input) => `const ${input.dataset.param} = ${JSON.stringify(input.value)};`,
    );
    const argumentNames = inputs.map((input) => input.dataset.param);
    const invocationArguments = ['EvoSDK', ...argumentNames].join(', ');
    sourceElement.textContent = [
      operation.toString(),
      '',
      ...declarations,
      declarations.length ? '' : null,
      `const result = await ${operation.name}({ ${invocationArguments} });`,
    ].filter((line) => line !== null).join('\n');
  }
  updateDisplayedSource();

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
      const parameters = Object.fromEntries(
        inputs.map((input) => [input.dataset.param, input.value]),
      );
      const output = await operation({ ...parameters, EvoSDK: sdkClass });
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

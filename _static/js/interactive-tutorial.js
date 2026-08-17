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

function renderIdentity(container, identity) {
  const value = typeof identity.toJSON === 'function' ? identity.toJSON() : identity;
  const summary = document.createElement('div');
  summary.className = 'interactive-tutorial__summary';
  summary.append(
    metric('Identity ID', value.id),
    metric('Balance (credits)', Number(value.balance ?? 0).toLocaleString()),
    metric('Revision', value.revision),
    metric('Public keys', value.publicKeys?.length ?? 0),
  );

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
  const defaultValue = block.dataset.defaultValue ?? '';
  const network = block.dataset.network ?? 'testnet';
  const input = block.querySelector('[data-role="input"]');
  const source = block.querySelector('[data-role="source"]')?.textContent?.trim();
  const runButton = block.querySelector('[data-role="run"]');
  const resetButton = block.querySelector('[data-role="reset"]');
  const result = block.querySelector('[data-role="result"]');
  const connection = block.querySelector('[data-role="connection"]');

  if (!input || !source || !runButton || !resetButton || !result || !connection) return;
  input.value = defaultValue;

  // The visible snippet is the executable body. The runner supplies only its
  // named inputs and handles UI state/result rendering around it.
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
  const execute = new AsyncFunction('EvoSDK', 'identityId', source);

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
    const value = input.value.trim();
    if (!value) {
      renderMessage(result, 'Enter an identity ID.', true);
      input.focus();
      return;
    }

    runButton.disabled = true;
    input.disabled = true;
    renderMessage(result, 'Loading identity…');
    try {
      const sdkClass = await loadSdk();
      connection.textContent = `Connecting to ${network}…`;
      const identity = await execute(sdkClass, value);
      connection.textContent = `Connected to ${network}`;
      if (!identity) {
        renderMessage(result, 'No identity was found for that ID.', true);
        return;
      }
      renderIdentity(result, identity);
    } catch (error) {
      connection.textContent = 'Run failed';
      connection.dataset.state = 'error';
      renderMessage(result, `Query failed: ${error?.message ?? error}`, true);
    } finally {
      runButton.disabled = false;
      input.disabled = false;
    }
  }

  runButton.addEventListener('click', run);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') run();
  });
  resetButton.addEventListener('click', () => {
    input.value = defaultValue;
    renderMessage(result, 'Run the query to inspect the identity.');
    input.focus();
  });
}

document.querySelectorAll('.interactive-tutorial').forEach(initialize);

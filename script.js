const upload = document.querySelector('#palm-photo');
const uploadArea = document.querySelector('#upload-area');
const preview = document.querySelector('#preview');
const result = document.querySelector('#result');

upload.addEventListener('change', () => {
  const [file] = upload.files;
  if (!file) return;
  preview.src = URL.createObjectURL(file);
  uploadArea.classList.add('has-image');
});

document.querySelectorAll('.chip').forEach((chip) => chip.addEventListener('click', () => {
  document.querySelector('.chip.active').classList.remove('active');
  chip.classList.add('active');
}));

document.querySelector('#scan-button').addEventListener('click', () => {
  const button = document.querySelector('#scan-button');
  button.textContent = 'Reading your palm…';
  button.disabled = true;
  setTimeout(() => {
    result.hidden = false;
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    button.innerHTML = 'Analyze another palm <span>→</span>';
    button.disabled = false;
  }, 900);
});

document.querySelector('#contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  document.querySelector('#form-status').textContent = 'Thank you — your message has been received.';
  event.target.reset();
});

const resultsEmailForm = document.querySelector('#results-email');

resultsEmailForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.querySelector('#result-email').value;
  const status = document.querySelector('#email-status');
  const button = event.target.querySelector('button');
  button.disabled = true;
  button.textContent = 'Sending…';
  status.textContent = 'Sending your reading securely…';
  status.classList.remove('success');
  try {
    const response = await fetch('/api/send-reading', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to send your reading.');
    status.textContent = `Your reading has been sent to ${email}.`;
    status.classList.add('success');
    button.textContent = 'Sent ✓';
  } catch (error) {
    status.textContent = error.message;
    button.textContent = 'Try again';
    button.disabled = false;
  }
});

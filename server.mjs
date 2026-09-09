import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = fileURLToPath(new URL('.', import.meta.url));
const port = Number(process.env.PORT || 3000);
const mimeTypes = { '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.xml': 'application/xml' };

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(payload));
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

async function readRequestBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 10_000) throw new Error('Request is too large.');
  }
  return JSON.parse(body);
}

async function sendReading(email) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Palmreaderz/1.0'
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM_EMAIL,
      to: [email],
      subject: 'Your Palmreaderz demo reading',
      html: `<main style="font-family:Arial,sans-serif;color:#28213c;max-width:620px;margin:auto;padding:32px"><p style="color:#7050c8;font-weight:bold;letter-spacing:1px">✦ PALMREADERZ</p><h1>Your demo reading is ready</h1><p>Hi ${escapeHtml(email)},</p><p>Your heart line suggests warmth and clear emotional intuition. Your life line reflects resilience and an appetite for meaningful change.</p><p style="color:#706b79">Palmreaderz is for reflection and entertainment. It is not medical, legal, financial, or predictive advice.</p></main>`,
      text: `Your Palmreaderz demo reading\n\nYour heart line suggests warmth and clear emotional intuition. Your life line reflects resilience and an appetite for meaningful change.\n\nPalmreaderz is for reflection and entertainment, not medical, legal, financial, or predictive advice.`
    })
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || 'Resend could not send the email.');
  return payload;
}

createServer(async (request, response) => {
  try {
    if (request.method === 'POST' && request.url === '/api/send-reading') {
      if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return sendJson(response, 500, { error: 'Resend is not configured on this server.' });
      const { email } = await readRequestBody(request);
      if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return sendJson(response, 400, { error: 'Please enter a valid email address.' });
      const sentEmail = await sendReading(email.trim());
      return sendJson(response, 200, { id: sentEmail.id });
    }

    if (request.method !== 'GET' && request.method !== 'HEAD') return sendJson(response, 405, { error: 'Method not allowed.' });
    const requestPath = request.url === '/' ? '/index.html' : request.url.split('?')[0];
    const filePath = normalize(join(rootDirectory, requestPath));
    if (!filePath.startsWith(rootDirectory)) return sendJson(response, 403, { error: 'Forbidden.' });
    let file = await readFile(filePath);
    if (extname(filePath) === '.html') {
      file = Buffer.from(file.toString().replace('</body>', '<script src="legal-footer.js"></script></body>'));
    }
    response.writeHead(200, { 'Content-Type': `${mimeTypes[extname(filePath)] || 'application/octet-stream'}; charset=utf-8` });
    response.end(request.method === 'HEAD' ? undefined : file);
  } catch (error) {
    if (error.code === 'ENOENT') return sendJson(response, 404, { error: 'Not found.' });
    console.error(error);
    return sendJson(response, 500, { error: error.message || 'Something went wrong.' });
  }
}).listen(port, () => console.log(`Palmreaderz is running at http://localhost:${port}`));

# Palmreaderz

## Send reading results with Resend

1. Create a Resend API key with **Sending access** and verify the domain you will send from.
2. Copy `.env.example` to `.env` and add your API key and verified sender address. Never add `.env` to source control.
3. In this folder, run `npm start`.
4. Open `http://localhost:3000` and use the scanner. The result form now sends an actual email through Resend.

The sender address in `RESEND_FROM_EMAIL` must use your verified Resend domain. During Resend testing, recipients may also be limited to your account email.

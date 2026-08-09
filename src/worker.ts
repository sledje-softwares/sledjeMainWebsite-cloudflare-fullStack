/**
 * Worker entrypoint (static assets + API).
 * ---------------------------------------------------------------
 * `astro build` outputs a static site to ./dist; the [assets] block
 * in wrangler.toml serves that directory automatically via the
 * ASSETS binding for any request this fetch handler doesn't handle
 * itself. This file only intercepts /api/* routes.
 *
 * Replaces the old Cloudflare Pages Function at
 * functions/api/interest.ts — see README.md ("Wiring the
 * problem-capture form") for KV/email setup.
 */

export interface Env {
  ASSETS: Fetcher;
  INTEREST_KV: KVNamespace;
  // Zoho Mail API credentials (Worker secrets — see README.md
  // "Wiring the problem-capture form" for how to obtain each one).
  ZOHO_CLIENT_ID: string;
  ZOHO_CLIENT_SECRET: string;
  ZOHO_REFRESH_TOKEN: string;
  ZOHO_ACCOUNT_ID: string;
  ZOHO_FROM_ADDRESS: string;
}

const NOTIFY_TO = 'info@sledje.com';

/**
 * Zoho Mail send, called over plain HTTPS fetch() — no Cloudflare
 * email binding involved. Zoho access tokens expire hourly, so each
 * send first exchanges the long-lived refresh token for a fresh
 * access token. See:
 * https://www.zoho.com/mail/help/api/post-send-an-email.html
 */
async function getZohoAccessToken(env: Env): Promise<string> {
  const params = new URLSearchParams({
    refresh_token: env.ZOHO_REFRESH_TOKEN,
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    grant_type: 'refresh_token',
  });

  const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Zoho token refresh failed: ${response.status} ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token?: string; error?: string };
  if (!data.access_token) {
    throw new Error(`Zoho token refresh returned no access_token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function sendZohoMail(
  env: Env,
  opts: { to: string; subject: string; html: string; replyTo?: string },
): Promise<void> {
  const accessToken = await getZohoAccessToken(env);

  const response = await fetch(
    `https://mail.zoho.com/api/accounts/${env.ZOHO_ACCOUNT_ID}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Zoho-oauthtoken ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fromAddress: env.ZOHO_FROM_ADDRESS,
        toAddress: opts.to,
        ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
        subject: opts.subject,
        content: opts.html,
        mailFormat: 'html',
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Zoho send failed: ${response.status} ${await response.text()}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildNotificationEmail(problem: string, email: string, submittedAt: string) {
  const safeProblem = escapeHtml(problem).replace(/\n/g, '<br />');
  const safeEmail = email ? escapeHtml(email) : null;

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; max-width: 560px; margin: 0 auto; color: #1C1A17;">
      <h2 style="color: #7A1F2B; font-size: 18px; margin-bottom: 4px;">New problem-capture submission</h2>
      <p style="color: #6B6560; font-size: 13px; margin-top: 0;">${escapeHtml(submittedAt)}</p>
      <div style="background: #FDFDFD; border: 1px solid #E5E1DB; border-left: 3px solid #7A1F2B; border-radius: 8px; padding: 16px; margin: 16px 0;">
        <p style="margin: 0; white-space: pre-wrap;">${safeProblem}</p>
      </div>
      <p style="font-size: 14px;">
        <strong>Reply-to email:</strong>
        ${safeEmail ? `<a href="mailto:${safeEmail}" style="color: #7A1F2B;">${safeEmail}</a>` : '<em>not provided</em>'}
      </p>
    </div>
  `.trim();

  return { html };
}

interface InterestPayload {
  problem?: string;
  email?: string;
  company?: string; // honeypot — humans never fill this in
}

const MAX_PROBLEM_LENGTH = 4000;
const MAX_EMAIL_LENGTH = 320;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function handleInterestPost(request: Request, env: Env): Promise<Response> {
  let payload: InterestPayload;

  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: silently accept so bots don't learn to avoid the field,
  // but never store or forward what they sent.
  if (payload.company) {
    return jsonResponse({ ok: true }, 200);
  }

  const problem = (payload.problem ?? '').trim();
  const email = (payload.email ?? '').trim();

  if (!problem) {
    return jsonResponse({ ok: false, error: 'Tell us what happened before you send this.' }, 400);
  }

  if (problem.length > MAX_PROBLEM_LENGTH) {
    return jsonResponse({ ok: false, error: 'That message is too long.' }, 400);
  }

  if (email && (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email))) {
    return jsonResponse({ ok: false, error: 'That email address looks off.' }, 400);
  }

  if (!env.INTEREST_KV) {
    // Binding not configured yet (e.g. missing KV binding on this
    // environment, or running without `wrangler dev`).
    console.error('INTEREST_KV binding is not configured.');
    return jsonResponse({ ok: false, error: 'Something went wrong on our end.' }, 500);
  }

  const submittedAt = new Date().toISOString();
  const key = `interest:${submittedAt}:${crypto.randomUUID()}`;

  await env.INTEREST_KV.put(
    key,
    JSON.stringify({ problem, email: email || null, submittedAt }),
  );

  if (env.ZOHO_CLIENT_ID && env.ZOHO_REFRESH_TOKEN) {
    const { html } = buildNotificationEmail(problem, email, submittedAt);
    try {
      await sendZohoMail(env, {
        to: NOTIFY_TO,
        subject: 'New problem-capture submission',
        html,
        ...(email ? { replyTo: email } : {}),
      });
    } catch (error) {
      // KV already has the submission, so a failed notification email
      // shouldn't fail the user's request — just log it for follow-up.
      console.error('Failed to send interest notification email via Zoho:', error);
    }
  } else {
    console.error('Zoho Mail secrets are not configured; skipping notification email.');
  }

  return jsonResponse({ ok: true }, 200);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/api/interest') {
      if (request.method === 'POST') {
        return handleInterestPost(request, env);
      }
      // Cloudflare calls the method-specific handler above for POST
      // and returns a straightforward 405 for every other method,
      // rather than a silent 404.
      return jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);
    }

    // Everything else falls through to the static assets built by
    // `astro build` into ./dist (served via the [assets] binding).
    return env.ASSETS.fetch(request);
  },
};

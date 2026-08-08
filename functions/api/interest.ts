/**
 * POST /api/interest
 * ---------------------------------------------------------------
 * Cloudflare Pages Function. Stores each problem-capture submission
 * as its own key in the `INTEREST_KV` namespace — no database
 * needed for a coming-soon page's volume. See README.md ("Wiring
 * the problem-capture form") for how to create and bind the
 * namespace, and for how to read submissions back out.
 */

interface Env {
  INTEREST_KV: KVNamespace;
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

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
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
    // Binding not configured yet (e.g. local `astro dev` without
    // `wrangler pages dev`, or a Pages project missing the binding).
    console.error('INTEREST_KV binding is not configured.');
    return jsonResponse({ ok: false, error: 'Something went wrong on our end.' }, 500);
  }

  const submittedAt = new Date().toISOString();
  const key = `interest:${submittedAt}:${crypto.randomUUID()}`;

  await env.INTEREST_KV.put(
    key,
    JSON.stringify({ problem, email: email || null, submittedAt }),
  );

  return jsonResponse({ ok: true }, 200);
};

// Cloudflare calls the method-specific handler above for POST and
// only falls back to this one for every other method, so this is a
// straightforward 405 rather than a silent 404.
export const onRequest: PagesFunction<Env> = async () =>
  jsonResponse({ ok: false, error: 'Method not allowed.' }, 405);

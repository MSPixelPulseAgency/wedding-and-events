// Forwards a validated form submission to the central MSPixelPulse inquiry pipeline (Aurelion), which saves the inquiry
// first and then emails the owner. Server-to-server: the Origin header names this site's registered public host, so the
// console's allowlist accepts it. This is a DEMO site: nothing here books, orders or charges anything.
const SITE_ID = 'wedding-and-events'
const ENDPOINT = 'https://mahakpatel.com/play/ai/api/intake/site/' + SITE_ID
const PUBLIC_HOSTS = ['wedding.mspixelpulse.com', 'wedding-and-events.vercel.app']
const clean = (value, max = 300) => String(value ?? '').trim().slice(0, max)
export function aurelionOrigin(request) {
  const host = clean(request.headers['x-forwarded-host'] || request.headers.host, 200).toLowerCase()
  return PUBLIC_HOSTS.includes(host) ? 'https://' + host : null
}
/**
 * @param {import('http').IncomingMessage} request
 * @param {{formType: string, name: string, email: string, phone?: string, service?: string, message: string, details?: Record<string,string>, clientId?: string, pageUrl?: string}} input
 * @returns {Promise<{ok: boolean, status: number, inquiryId?: string|null, duplicate?: boolean, error?: string}>}
 */
export async function forwardToAurelion(request, input) {
  const origin = aurelionOrigin(request)
  if (!origin) return { ok: false, status: 503, error: 'This preview deployment is not registered for inquiries. The production site is.' }
  const details = {}
  for (const [k, v] of Object.entries(input.details || {}).slice(0, 20)) if (/^[a-zA-Z][a-zA-Z0-9_ -]{0,39}$/.test(k) && clean(v)) details[k] = clean(v, 300)
  const payload = {
    clientId: clean(input.clientId, 80) || 'srv-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10),
    formType: input.formType, name: clean(input.name, 200), email: clean(input.email, 254), message: clean(input.message, 10000), consent: true,
    ...(clean(input.phone, 40) ? { phone: clean(input.phone, 40) } : {}), ...(clean(input.service, 200) ? { service: clean(input.service, 200) } : {}),
    ...(Object.keys(details).length ? { details } : {}), ...(input.pageUrl && /^https:\/\//.test(input.pageUrl) ? { pageUrl: clean(input.pageUrl, 2000) } : {}),
  }
  try {
    const response = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(payload), redirect: 'error', signal: AbortSignal.timeout(10000) })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) return { ok: false, status: response.status === 429 ? 429 : 502, error: data.error || 'The inquiry service could not accept this request right now.' }
    return { ok: true, status: 202, inquiryId: data.inquiryId ?? null, duplicate: !!data.duplicate }
  } catch { return { ok: false, status: 502, error: 'The inquiry service could not be reached right now. Please try again or use the email option.' } }
}

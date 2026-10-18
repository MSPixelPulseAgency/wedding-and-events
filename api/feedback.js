import { forwardToAurelion } from './_aurelion.js'
const attempts = new Map()
const clean = (value, max = 2000) => String(value ?? '').trim().slice(0, max)
const escapeHtml = (value) => clean(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')

function sameOrigin(request) {
  const origin = request.headers.origin
  if (!origin) return true
  const host = request.headers['x-forwarded-host'] || request.headers.host
  try { return new URL(origin).host === host } catch { return false }
}

function rateLimited(request) {
  const key = request.headers['x-forwarded-for']?.split(',')[0]?.trim() || request.socket?.remoteAddress || 'unknown'
  const now = Date.now()
  const recent = (attempts.get(key) || []).filter((time) => now - time < 10 * 60 * 1000)
  recent.push(now)
  attempts.set(key, recent)
  return recent.length > 4
}

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') return response.status(405).json({ message: 'Use POST to submit feedback.' })
  if (!sameOrigin(request)) return response.status(403).json({ message: 'This form must be submitted from the LUMA website.' })
  if (rateLimited(request)) return response.status(429).json({ message: 'Too many attempts. Please wait a few minutes and try again.' })

  const body = request.body || {}
  if (clean(body.website, 120)) return response.status(200).json({ ok: true })
  const data = {
    name: clean(body.name, 160), email: clean(body.email, 240), event_type: clean(body.eventType, 120),
    rating: Number(body.rating) || null, feedback: clean(body.feedback, 4000), public_permission: body.permission === true,
  }
  if (body.consent !== true || !data.name || !/^\S+@\S+\.\S+$/.test(data.email) || data.feedback.length < 20 || (data.rating && (data.rating < 1 || data.rating > 5))) {
    return response.status(400).json({ message: 'Please confirm consent and provide a valid name, email and at least 20 characters of feedback.' })
  }
  // Private feedback goes to the central MSPixelPulse inquiry pipeline (stored privately, never published). Supabase and
  // Resend remain optional extras when configured.
  const forwarded = await forwardToAurelion(request, { formType: 'feedback', clientId: clean(body.clientId, 80), name: data.name, email: data.email, message: data.feedback, details: { 'Event type': data.event_type, Rating: data.rating ? String(data.rating) : '', 'Public permission': data.public_permission ? 'yes' : 'no' } })
  if (!forwarded.ok) return response.status(forwarded.status).json({ code: 'FEEDBACK_NOT_ACCEPTED', message: forwarded.error })
  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY } = process.env
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !RESEND_API_KEY) return response.status(200).json({ ok: true, message: 'Thank you. Your feedback was received privately by MSPixelPulse and is not published.' })

  const storeResponse = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/feedback`, {
    method: 'POST',
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ ...data, status: 'private_review' }),
  })
  if (!storeResponse.ok) {
    console.error('Supabase feedback error', storeResponse.status, await storeResponse.text())
    return response.status(502).json({ message: 'Feedback could not be stored securely. Please try again later.' })
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.INQUIRY_FROM_EMAIL || 'LUMA Website <onboarding@resend.dev>',
      to: [process.env.INQUIRY_TO_EMAIL || 'mspixelpulse@gmail.com'],
      reply_to: data.email,
      subject: `Private LUMA feedback from ${data.name}`,
      html: `<h1>New private feedback</h1><p><strong>Event:</strong> ${escapeHtml(data.event_type || 'Not provided')}</p><p><strong>Rating:</strong> ${escapeHtml(data.rating || 'Not provided')}</p><p><strong>Public-contact permission:</strong> ${data.public_permission ? 'Yes' : 'No'}</p><p>${escapeHtml(data.feedback)}</p>`,
    }),
  })
  if (!emailResponse.ok) console.error('Resend feedback notification error', emailResponse.status, await emailResponse.text())
  return response.status(200).json({ ok: true })
}

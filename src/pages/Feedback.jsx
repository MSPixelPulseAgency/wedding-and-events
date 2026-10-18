import { useState } from 'react'
import { Check, LoaderCircle, MessageSquareText, ShieldCheck } from 'lucide-react'
import { SEO } from '../components/common/SEO'
import { PageHero } from '../components/common/PageHero'
import { image } from '../data/siteData'

const initial = { name: '', email: '', eventType: '', rating: '', feedback: '', permission: false, consent: false, website: '' }

export default function Feedback() {
  const [data, setData] = useState(initial)
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const breadcrumbs = [{ label: 'Home', to: '/' }, { label: 'Feedback', to: '/feedback' }]
  const update = (event) => { const { name, value, type, checked } = event.target; setData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })) }
  const submit = async (event) => {
    event.preventDefault()
    setStatus({ state: 'loading', message: 'Sending your feedback…' })
    try {
      const response = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.message || 'Feedback service is not available yet. Please try again later.')
      setData(initial)
      setStatus({ state: 'success', message: 'Thank you. Your feedback was received for private review.' })
    } catch (error) {
      setStatus({ state: 'error', message: error.message })
    }
  }
  return (
    <>
      <SEO title="Share Feedback | LUMA Weddings & Events" description="Share private feedback with the LUMA demo. Public display requires explicit permission and review." path="/feedback" breadcrumbs={breadcrumbs} />
      <PageHero eyebrow="Private feedback" title="Help shape a more thoughtful experience." text="This secure form is designed for genuine feedback. Nothing is published automatically, and public use always requires your explicit permission." image={image('outdoor-wedding-conversation')} imageAlt="Two people speaking together at an outdoor wedding" breadcrumbs={breadcrumbs} />
      <section className="section feedback-page"><div className="container feedback-page__grid">
        <div><p className="eyebrow">Consent comes first</p><h2>Private by default.</h2><p>Feedback can be reviewed privately by the site owner. Choosing permission does not guarantee publication; it only allows LUMA to contact you about a possible edited testimonial.</p><div className="feedback-trust"><ShieldCheck aria-hidden="true" /><div><strong>No automatic publishing</strong><span>No star rating or testimonial appears publicly without review.</span></div></div><div className="feedback-trust"><MessageSquareText aria-hidden="true" /><div><strong>Useful detail over hype</strong><span>Honest comments about communication, clarity and experience are most helpful.</span></div></div></div>
        <form className="inquiry-form feedback-form" onSubmit={submit}>
          <fieldset disabled={status.state === 'loading'}><legend>Share your experience.</legend><p>Required fields are marked.</p><div className="form-grid form-grid--two">
            <label>Name *<input required name="name" value={data.name} onChange={update} autoComplete="name" /></label>
            <label>Email *<input required type="email" name="email" value={data.email} onChange={update} autoComplete="email" /></label>
            <label>Event type<select name="eventType" value={data.eventType} onChange={update}><option value="">Choose one</option><option>Wedding</option><option>Corporate event</option><option>Social event</option><option>Other</option></select></label>
            <label>Experience rating<select name="rating" value={data.rating} onChange={update}><option value="">Choose one</option>{[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} of 5</option>)}</select></label>
            <label className="form-grid__wide">Feedback *<textarea required minLength="20" rows="7" name="feedback" value={data.feedback} onChange={update} placeholder="What felt clear, helpful, difficult or memorable?" /></label>
            <label className="checkbox-label form-grid__wide"><input type="checkbox" required name="consent" checked={data.consent} onChange={update} /><span>I agree that MSPixelPulse may receive this demo feedback and contact me about it. Nothing is published automatically.</span></label>
            <label className="checkbox-label form-grid__wide"><input type="checkbox" name="permission" checked={data.permission} onChange={update} /><span>You may contact me about using an edited version publicly. I understand nothing will be published automatically.</span></label>
            <label className="honey-field" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" value={data.website} onChange={update} /></label>
          </div></fieldset>
          <button className="button button--dark" type="submit" disabled={status.state === 'loading'}>{status.state === 'loading' ? <LoaderCircle className="spin" aria-hidden="true" /> : <Check aria-hidden="true" />}Send private feedback</button>
          {status.message && <p className={`form-status form-status--${status.state}`} role={status.state === 'error' ? 'alert' : 'status'}>{status.message}</p>}
        </form>
      </div></section>
    </>
  )
}

# LUMA Weddings & Events

LUMA is a premium React/Vite wedding and event planning demo created for the MSPixelPulse portfolio. It presents a fictional Toronto/GTA concept studio with destination capabilities, a complete industry architecture, editorial content, a cinematic media system and secure server-side form foundations.

## Live site

- Production: https://luma-event-planning.vercel.app/
- Legacy alias: https://luma-weddings-events.vercel.app/
- Repository: https://github.com/MSPixelPulseAgency/wedding-and-events

## Experience highlights

- Cinematic, muted hero video with a reduced-motion image fallback
- Reusable liquid-glass navigation, panels and mobile menu
- 10 wedding, 17 event, 16 production-service and five location planning routes
- Searchable 70-image gallery and filterable portfolio with accessible keyboard lightboxes
- Eight-video motion gallery with reduced-motion fallbacks
- Five-stage interactive planning experience
- Transparent demo investment guidance and project-fit prompts
- Clearly labelled sample client stories
- Ten long-form planning journal routes
- Animated accessible FAQ accordions
- Three-step inquiry with validated Resend delivery and an honest prepared-email fallback
- Private feedback flow designed for Supabase storage and Resend notification
- Custom privacy, terms, accessibility and 404 experiences
- Responsive layouts from 360px through 1920px

## Routes

The production build creates 89 route-specific HTML entry documents with unique titles, descriptions, canonicals, Open Graph metadata and JSON-LD. Core routes include:

- `/`, `/about`, `/experience`, `/pricing`, `/reviews`, `/faq`, `/contact`
- `/weddings`, `/events`, `/services`, `/locations` and 48 dedicated industry routes
- `/portfolio`, `/portfolio/weddings`, `/portfolio/destination`, `/portfolio/corporate`
- `/gallery`, `/videos`, `/feedback`, `/accessibility`
- `/journal` plus ten editorial guide routes
- `/privacy`, `/terms`, custom `/404`

## Technology

- React 19
- Vite 8
- React Router
- Framer Motion
- Lucide React
- React Helmet Async
- CSS custom properties and responsive layout primitives
- Vitest and Testing Library
- Sharp-powered social image generation

## Local setup

Use Node.js 22.x to match the production runtime.

```bash
npm install
npm run dev
```

## Quality commands

```bash
npm run lint
npm test
npm run build
npm run check:seo
```

`npm run build` runs Vite and then creates the route documents, `sitemap.xml`, and `og-luma.jpg` in `dist/`.

## Media

The project includes 70 locally hosted WebP photographs and eight short muted MP4 clips. Source pages and creator credits are recorded in [CREDITS.md](./CREDITS.md). Media was sourced from Pexels under the Pexels licence and optimized for this demonstration.

Run `npm run media` only when intentionally rebuilding the local media set. The script downloads the documented sources and transcodes them with `cwebp` and `ffmpeg`.

## Demo-content note

LUMA is not presented as an operating planning company. Event stories, testimonials, packages and availability are illustrative. The site intentionally avoids invented awards, review ratings, founder biographies, certifications, venue partnerships, client names, office addresses and working social handles.

Demo contact details:

- `hello@mspixelpulse.com`
- `+1 365-883-0338`
- WhatsApp: `+1 365-883-0338`
- Social links: intentionally unconfigured

Before adapting this project for a real client, replace all business details, configure the documented Resend/Supabase environment variables, obtain business-specific privacy/legal review and verify every public claim. See [production form integrations](./docs/production-integrations.md).

## Deployment

Vercel settings:

- Framework: Vite
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`
- Node.js: 22.x

`vercel.json` serves generated route documents first and falls back to the React app for unmatched client routes.

## Website and demo management

- **Live Website:** [https://wedding.mspixelpulse.com](https://wedding.mspixelpulse.com)
- **MSPixelPulse Projects:** [MSPixelPulse Projects](https://mspixelpulse.com/projects)
- **Aurelion Demo Library:** [Private Demo Management — Owner Access Required](https://mahakpatel.com/play/ai?view=demo-library)

Category subdomains are not published here until their HTTPS website is verified. The Aurelion link is an owner-only management interface and does not grant access.

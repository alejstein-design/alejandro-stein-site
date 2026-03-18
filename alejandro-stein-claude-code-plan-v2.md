# Alejandro Stein — Complete Build Plan for Claude Code

## Project overview

Artist portfolio + e-commerce for Alejandro Stein, a Buenos Aires-born self-taught visual artist working across handmade paintings, murals, tapestries, digital art, painted doors, and 3D mixed-media objects.

**Design references:** Shantell Martin (readability, clean light theme, art-first), Felipe Pantone (editorial homepage with varied image sizes, series-based navigation), Jen Stark (animated product cards for the shop phase).

**Architecture:** Next.js 15 (App Router) + Sanity.io CMS + Shopify Storefront API (later). Light theme. Bilingual (ES/EN). Portfolio-first launch; shop added as a later module.

**Key principle:** Build one module at a time. Test each module fully before moving on. Every module should be deployable on its own.

---

## CLAUDE.md (paste this into your project root)

```markdown
# CLAUDE.md

## Project
Alejandro Stein — artist portfolio + shop
Next.js 15, App Router, TypeScript strict, Tailwind CSS, Sanity.io CMS

## Commands
- `pnpm dev` — start dev server on port 3000
- `pnpm build` — production build
- `pnpm lint` — ESLint check
- `npx sanity dev` — start Sanity Studio on port 3333

## Architecture
- src/app/(site)/ — public-facing pages
- src/app/studio/[[...tool]]/page.tsx — embedded Sanity Studio
- src/components/ — shared UI components
- src/lib/ — sanity client, queries, utilities, i18n
- src/sanity/ — schema definitions, config
- public/images/ — portfolio images (organized by collection)

## Conventions
- Server components by default; "use client" only when needed
- All CMS data fetched via Sanity GROQ queries in server components
- TypeScript strict, no `any` types
- Tailwind only — no CSS modules, no styled-components
- Images: use next/image with Sanity image URLs (auto-optimized)
- Bilingual: all text content stored in Sanity with `es` and `en` fields
- Commit messages: imperative mood, < 72 chars

## Design System
- Theme: light, clean, white backgrounds (#FAFAF8)
- Fonts: "DM Sans" (body/nav), "Instrument Serif" (headings/display)
- Text color: #1A1A1A (primary), #6B6B6B (secondary), #999 (tertiary)
- Accent: extracted from Ale's palette — #E63946 (red), #2563EB (blue)
- Borders: #E8E5E0
- Max content width: 1400px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 80, 120px
- Border radius: 0 (sharp edges — the art is geometric, the UI should be too)
- Mobile breakpoint: 768px
```

---

## Module 1 — Project scaffold + design system

```
Initialize a Next.js 15 app with App Router, TypeScript strict mode, Tailwind CSS, and pnpm.

Set up Sanity.io:
- Install @sanity/client, next-sanity, @sanity/image-url
- Create a Sanity project (free plan) and configure the client in src/lib/sanity.ts
- Embed Sanity Studio at /studio using the Next.js app router approach (src/app/studio/[[...tool]]/page.tsx)

Set up the folder structure:
- src/app/(site)/ — public pages with a shared layout
- src/app/(site)/[lang]/ — language prefix (es/en)
- src/app/studio/ — Sanity Studio
- src/components/ — shared components
- src/lib/ — sanity client, i18n dictionary, utilities
- src/sanity/ — schemas

Install these dependencies:
- next-sanity, @sanity/image-url, @sanity/vision
- @portabletext/react (for rich text from Sanity)
- framer-motion (animations)
- next-intl or a simple custom i18n solution using [lang] route segments

Set up the global layout at src/app/(site)/[lang]/layout.tsx:

Header:
- Left: "ALEJANDRO STEIN" in DM Sans, 11px, tracking 3px, uppercase. Links to home.
- Center/Right: nav links — Works, About, Statement, Contact, Shop (disabled/coming soon badge), Language toggle (ES/EN)
- Mobile: hamburger → fullscreen overlay with blur backdrop
- Sticky, white background with slight transparency on scroll, thin bottom border (#E8E5E0)

Footer:
- Left: "Alejandro Stein" + "Buenos Aires — Tel Aviv — Berlin"
- Right: @alustein Instagram link, email, copyright
- Thin top border, generous padding

Load Google Fonts: DM Sans (400, 500, 700) and Instrument Serif (400, 400 italic).

Set up Tailwind config with the custom colors, fonts, and spacing from CLAUDE.md.

Create a CLAUDE.md file in the project root with the content above.

Do not add any page content yet — just the layout shell, design tokens, and Sanity Studio.
```

---

## Module 2 — Sanity CMS schemas

```
Create the Sanity schemas for all content types. These go in src/sanity/schemas/.

Schema: Collection
- title (object with es/en string fields)
- slug (slug, auto-generated from English title)
- description (object with es/en text fields)
- category (string enum: "handmade", "murals", "tapestries", "digital", "doors", "mixed-media", "mosaico-refractario", "combinacion", "architectural-patterns", "portraits")
- coverImage (image with hotspot)
- year (string, e.g. "2018 — Present")
- medium (object with es/en string fields)
- sortOrder (number, for manual ordering)
- featured (boolean — whether to show on homepage)

Schema: Artwork
- title (object with es/en string fields)
- slug (slug)
- collection (reference to Collection)
- images (array of image with hotspot + alt text)
- year (number)
- dimensions (string)
- medium (object with es/en string fields)
- description (object with es/en portable text)
- featured (boolean)
- homepageSize (string enum: "small", "medium", "large", "wide", "tall" — controls size on the homepage masonry grid. Only used when featured is true.)
- sortOrder (number)

Schema: Page (for About, Statement, Contact)
- title (object with es/en string fields)
- slug (slug)
- body (object with es/en portable text)
- image (optional image)

Schema: SiteSettings (singleton)
- artistName (string)
- tagline (object with es/en string fields)
- bio (object with es/en portable text — short version for homepage)
- socialLinks (array of objects: platform + url)
- contactEmail (string)
- homepageHeroImage (image)

Register all schemas in src/sanity/schemas/index.ts and configure the Sanity Studio desk structure so SiteSettings appears as a singleton at the top.
```

---

## Module 3 — Portfolio: collections + artworks

```
Build the portfolio section. This is the heart of the site.

Works index page at src/app/(site)/[lang]/works/page.tsx:
- Fetch all collections from Sanity, ordered by sortOrder
- Display as a grid of collection cards
- Each card: cover image (aspect-ratio 4/3), collection title, year range, medium
- On hover: slight lift + shadow, image subtle zoom
- Grid: 2 columns on desktop (large cards, let the art breathe), 1 on mobile
- Clean, spacious layout — following Shantell Martin's approach where the art IS the design
- Page title: "Works" in Instrument Serif display font

Collection page at src/app/(site)/[lang]/works/[slug]/page.tsx:
- Fetch collection + all its artworks from Sanity
- Top: collection title (display font), description, year, medium
- Grid of artworks: masonry-style or uniform grid depending on image aspect ratios
  - For series like Mosaico Refractario (uniform squares): use a tight grid with small gaps
  - For series like Murals (varied sizes): use a more editorial layout
  - The layout style should be configurable per collection in Sanity (add a "layoutStyle" field: "grid" | "masonry" | "editorial")
- Clicking an artwork opens a detail view

Artwork detail — implement as either:
- A dedicated page at /works/[collection-slug]/[artwork-slug], OR
- A modal/lightbox overlay (better for series browsing — you can arrow through)
- Show: large image, title, year, dimensions, medium, description
- Image should be viewable at near-full-screen size
- Navigation: previous/next within the collection
- Back button returns to the collection

Use next/image with Sanity's image CDN for all images. Sanity automatically generates optimized URLs with width/height/format parameters.

Add framer-motion fade-in animations on page load and staggered reveals on grid items.

All text should use the [lang] parameter to display ES or EN content from Sanity.
```

---

## Module 4 — Homepage (Pantone-style editorial wall)

```
Build the homepage at src/app/(site)/[lang]/page.tsx.

This is the most visually important page. Inspired by Felipe Pantone's homepage — a flowing wall of artwork images in varied sizes that creates visual rhythm.

Fetch from Sanity:
- All artworks where featured === true
- SiteSettings for hero text
- Use each artwork's "homepageSize" field to determine its grid size

Layout structure:

1. Hero section (above the fold):
   - Artist name "ALEJANDRO STEIN" large, in Instrument Serif
   - Tagline from Sanity (bilingual)
   - A single hero image or the first featured artwork, full-width
   - Minimal — let one powerful image do the talking
   - Subtle scroll indicator

2. Artwork wall (the main event):
   - CSS Grid with auto-placement
   - Grid columns: repeat(4, 1fr) on desktop, repeat(2, 1fr) on tablet, 1 on mobile
   - Each artwork's grid size maps to:
     - "small" = 1 col × 1 row
     - "medium" = 1 col × 1 row (slightly larger)
     - "large" = 2 col × 2 row
     - "wide" = 2 col × 1 row
     - "tall" = 1 col × 2 row
   - Gap: 4px (tight, like Pantone's site — the images touch almost seamlessly)
   - Each image links to its artwork detail or collection page
   - On hover: artwork title appears as an overlay (clean white text on semi-transparent dark overlay)
   - Images load lazily with blur-up placeholder (Sanity provides LQIP — Low Quality Image Placeholders)

3. Brief about section:
   - Short bio text from SiteSettings
   - "Read more" link to /about
   - Clean, centered, editorial typography

4. Featured collections row:
   - 3 featured collections shown as large cards
   - Links to their collection pages

5. Contact/CTA:
   - "Get in touch" with email link
   - Social links

Use framer-motion for scroll-triggered animations. Keep it subtle — the art is vibrant enough. The UI should feel like a gallery wall, not a theme park.
```

---

## Module 5 — About, Statement, Contact pages

```
Build the static content pages. All content comes from Sanity "Page" documents.

About page at src/app/(site)/[lang]/about/page.tsx:
- Fetch the "about" page from Sanity
- Layout: editorial, single column, max-width 680px centered
- Display font for title, body in DM Sans at 16px with generous line height (1.8)
- Include exhibition history from the CV (could be a separate Sanity schema "Exhibition" with year, title, venue, city — displayed as a clean timeline)
- Optional portrait photo of the artist

Statement page at src/app/(site)/[lang]/statement/page.tsx:
- Same editorial layout
- The statement text (bilingual) from Sanity
- This is a short, powerful page — the text should be typographically beautiful
- Consider using Instrument Serif italic for the Whitman quote block

Contact page at src/app/(site)/[lang]/contact/page.tsx:
- Email address (large, clickable)
- Instagram link
- Optional: simple contact form (could use Formspree or Sanity's form handling)
- Commission inquiry note
- Studio location mention (Buenos Aires)

All pages:
- Bilingual toggle works seamlessly
- Clean Shantell Martin-style readability
- Generous whitespace
- No visual clutter
```

---

## Module 6 — i18n (Spanish/English)

```
Implement bilingual support using Next.js [lang] route segments.

Structure:
- src/app/(site)/[lang]/layout.tsx handles the language context
- src/lib/i18n.ts exports available locales ("es", "en") and a dictionary for UI strings
- All Sanity content has es/en fields — fetch the right one based on [lang]

UI strings dictionary (for navigation, buttons, labels):
- Works / Obras
- About / Sobre
- Statement / Declaración
- Contact / Contacto
- Shop / Tienda
- Back / Volver
- All collections / Todas las colecciones
- Year / Año
- Medium / Medio/Técnica
- Dimensions / Dimensiones
- "Coming soon" / "Próximamente"
- Read more / Leer más
- Get in touch / Contacto

Language toggle:
- Small ES/EN toggle in the header
- Switches the [lang] segment in the URL
- Preserves the current page path (e.g., /en/works/murals → /es/works/murals)
- Store preference in a cookie so it persists

Default language: English (for international audience)
```

---

## Module 7 — SEO, performance, deploy

```
Polish pass before the portfolio launch.

SEO:
- Generate dynamic metadata for every page using generateMetadata()
- Open Graph images: for collection pages, use the cover image; for artwork pages, use the artwork image
- Structured data: Person schema for the artist, ImageGallery for collections
- Sitemap at /sitemap.xml (use next-sitemap)
- robots.txt

Performance:
- Run Lighthouse audit, target 90+ on all metrics
- Verify all images use next/image with proper sizes and priority props
- Check that Sanity images use the CDN URL with width parameters (not raw originals)
- Add loading skeletons for collection and artwork pages
- Verify the homepage artwork wall lazy-loads images below the fold

Accessibility:
- All images have alt text (from Sanity)
- Proper heading hierarchy
- Keyboard navigation works for the lightbox/detail view
- Color contrast passes WCAG AA on all text

Deploy:
- Push to GitHub
- Connect to Vercel
- Add environment variables:
  - NEXT_PUBLIC_SANITY_PROJECT_ID
  - NEXT_PUBLIC_SANITY_DATASET
  - SANITY_API_TOKEN (for preview/drafts if needed)
- Configure custom domain when ready
- Set up Sanity CORS to allow the production domain

This is the portfolio-only launch milestone. The site should be fully functional as a professional artist portfolio at this point.
```

---

## Module 8 — Shopify integration (later)

```
This module is built AFTER the portfolio is live and Ale has:
- Created a Shopify account
- Installed Gelato + Prodigi apps on Shopify
- Added products with photos
- Ordered and approved physical samples

When ready, add the shop:

Install: @shopify/hydrogen-react or shopify-buy SDK

Create Sanity schema: ShopLink (connects a Sanity artwork/collection to a Shopify product handle)

Build shop pages:
- /[lang]/shop — product grid (light theme, Shantell Martin-style clean layout)
- /[lang]/shop/[handle] — product detail page
- Cart using Zustand + Shopify Storefront API cart
- Checkout: redirect to Shopify's hosted checkout

Fetch product data from Shopify Storefront API (prices, availability, variants).
Fetch editorial content (descriptions, imagery) from Sanity for richer product pages.

Connect portfolio to shop:
- On artwork detail pages, show "Available as print" button if a ShopLink exists
- On collection pages, show "Shop prints from this series" if applicable

This keeps the portfolio and shop connected but independent.
```

---

## Asset inventory (what Ale has uploaded)

Use this to seed Sanity content. Organize images into collections:

### Tapestries (alfombras/tapices)
- alfombra_1.jpg + detalle_alfombra_1.jpg + detalle_alfombra_2.jpg
- tapiz_II.jpg + detalle_1_tapiz_2.jpg + detalle_2_tapiz_2.jpg

### Murals
- mural_editado.jpg (red/blue/white checkerboard building)
- muraldia.jpg + mural_noche.jpg + vertice.jpg + IMG20250201163413.jpg (diamond-pattern building, day/night/corner/entrance)
- IMG20250214174114.jpg (B&W greek key pattern above door)
- IMG20250618201158.jpg (diamond-pattern building, night, different angle)

### Handmade paintings + doors
- DSC_8487.jpg (mandala with colored teardrop petals)
- DSC_1111.jpg (red architectural perspective with staircase)
- untitled-5.jpg (two spheres + triangle on grid)
- untitled-1.jpg (David silhouette in kaleidoscopic field)
- DSC_8482.jpg (architectural bands with wave patterns)
- untitled-3.jpg (teal/pink symmetrical forms)
- DSC_8780.jpg (starburst mandala with zigzag field)
- escalerashaciamodificado.jpg (pink architectural temple)
- untitled-8.jpg (blue mandala with organic forms)
- DSC_8488.jpg (neon circle with color grid on checker)
- DSC_8489.jpg (3D striped cones on geometric background)
- P1700106.jpg + P1700107.jpg (3D spiral spheres on geometric background)
- Nuevo_Portal_editado.jpg (tropical collage with Sistine hands)
- puerta_miami.JPG (painted door, tall vertical composition)
- roble_de_eslavonia_editado.jpg (painted door, diamond pattern on wood)
- IMG_20210107_093608.jpg (painted door, circles/checker mandala)
- Door.jpg (painted door, full psychedelic mandala)

### Combinación 1 (B&W op-art, circle/quadrant series)
- combinacio_n_B_.jpg through combinacio_n_H.jpg (7 pieces)

### Combinación 2 (B&W op-art, diamond spiral series)
- combinacion_2_B through combinacion_2_H (7 pieces)

### Mosaico Refractario — Series A through E
- A1-A5, B1-B5, C1-C5, D1-D5, E1-E5 (25 pieces)
- C3_puntos_negros.jpg (variant of C3)

### Digital — Architectural Patterns
- bofill_vertical_y_horizontal.jpg, edificio_curvilineo.jpg, casa_Vicens_II.jpg
- miami_deco.jpg, bofill_azul.jpg, balcones.jpg, edificio_cubo.jpg (7 pieces)

### Digital — B&W Pattern Studies
- bocetos_circulares_Circular_VI.jpg, bocetos_circulares_Circular_VII.jpg
- cuadrados_espiralados_2a.jpg, cuadrados_espiralados_4b_I.jpg
- Fibo_circular_1.jpg, Fibo_circular_4.jpg (6 pieces)

### Digital — Birds in Architecture
- substance_crane.jpg (crane in perspective corridor)
- pavo_real.jpg (peacock in psychedelic temple)

### Digital — Cultural Figures
- todas_tribus_1.jpg (collection of masked/costumed figures)

### Digital — Character Portraits (Futurista Guardianista + others)
- Alejandro_Stein_-_The_Otter_-_digital_art_-_42x59_4cm.jpg
- futurista_guardianista.jpg, futurista_guardianista_2.jpg, futurista_guardianista_3.jpg
- geisha-04.jpg, juju_toobootie.jpg, Makmur_Widjojo.jpg
- pink_cowboy.jpg, Yemeksepeti_Banabi.jpg (9 pieces)

### Text content
- BIO_STATEMENT.docx — Bio (ES + EN) and Artist Statement (ES + EN)
- CV_Alejandro_Stein_Villa_Lena.docx — CV / exhibition history

Total: ~80+ images across 11 collections + bilingual text content.

---

## How to use this plan with Claude Code

Open your terminal, navigate to your project folder, and run `claude`.

Paste one module at a time — the text between the triple backtick blocks above. Wait for Claude Code to finish building it, then run `pnpm dev` and test in your browser.

Only move to the next module when the current one works correctly.

If something breaks, paste the error into Claude Code: "I'm getting this error: [paste error]. Fix it."

After each working module, commit:
"Commit this progress with message: feat: add [module name]"

The order matters:
1. Scaffold (must be first)
2. Sanity schemas (must be before any content pages)
3. Portfolio pages (the core product)
4. Homepage (needs collections to exist first)
5. About/Statement/Contact (independent, can be built anytime after 1)
6. i18n (can be woven in during any module, but cleanest as a dedicated pass)
7. SEO + deploy (final polish)
8. Shop (only after portfolio is live and Shopify is set up)

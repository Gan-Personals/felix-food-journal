# Felix, at the table — private food journal draft

Unpublished. No Vercel connection, domain, paid service, or public hosting.
The name and short bio are drafts for Felix to approve.

## Add a review

Drop a Markdown file into `content/China/`, `content/US/`, or `content/Europe/`.
New region folders are supported too. The **folder** determines the section;
`region` is descriptive front matter and does not automatically sort or move posts.
Use lowercase hyphenated filenames. Copy this header:

```yaml
---
title: "Brisket in Shenzhen"
subtitle: "A short description of the meal and place."
region: "China"
location: "Brewtown, Shenzhen, China"
date: "November 2026"
cover: "images/my-photo.jpg"
---
```

Write the review below the header using ordinary Markdown. Keep header values
quoted. Put the cover in `public/images/`. One cover per review; `cover_alt` is
optional descriptive alternative text. Only trusted author-written Markdown is
supported (raw HTML is permitted by the Markdown renderer).

The first post preserves Felix's supplied review and scores. Its cover is a
clearly labeled typographic placeholder, not a photograph of the venue. Replace
it when an original photograph is available. No exact visit day was supplied,
so the date stays “November 2026.”

## Build / private preview

Node.js 20 or newer:

```sh
npm ci
npm run build
npm test
```

Open `dist/index.html` directly in a browser; relative post links work offline.
CSS and cover images are embedded in the pages. Share a ZIP of `dist/` privately
and unzip before opening. There is no backend, login, analytics, or runtime API.
The checked-in draft emits noindex tags, but those are **not access control**.

## Vercel later — Felix controls publication

When ready, Felix can import this private GitHub repository into Vercel himself.
Build command: `npm run build`; output directory: `dist`; framework: Other.
`vercel.json` records these settings. No Vercel project has been created or linked.
Check Vercel visibility, access protection, and pricing before connecting: a
private GitHub repo alone does not make deployments private. Remove noindex only
when intentionally publishing. No GitHub Actions or Pages configuration is added.

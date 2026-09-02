# The Psychic Apparatus

A mobile-first, dark, spicy psychoanalytic mini-game made for Aashna.

## Run locally

Works on Vercel with the default Node.js version.

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy on Vercel

1. Upload the project contents to the root of a GitHub repository.
2. Import the repository in Vercel.
3. Leave Framework Preset on **Next.js** and keep all build settings at their defaults.
4. Deploy. No environment variables are required.

## Answers and the case-file PDF

- Every choice is saved in the player's browser using `localStorage`.
- Nothing is sent to a server.
- At the end, **Share Case File** opens the phone's native share sheet. She can send the complete report to Polen.
- **Save / Print as PDF** opens a print-ready case file; choose **Save as PDF** in the print dialog.
- Clearing browser data removes the local archive.

## Privacy

The intro tells the player exactly how answers are handled. If a server endpoint is added later, update that notice before collecting anything remotely.

## Main files

- `app/page.tsx` — game logic, questions, scoring, archive and PDF/share actions
- `app/globals.css` — mobile layout, dark visual system and animation
- `app/layout.tsx` — page metadata

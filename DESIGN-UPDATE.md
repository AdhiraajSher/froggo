# Froggo emerald design update

This is the website from `kyasodahaiye.zip`, updated in place in a separate working folder.

## Latest reference-led changes
- Emerald sidebar and rounded workspace inspired by the supplied screenshots.
- Six quick actions, glossy document cards, and a searchable document list.
- Animated review workflow with glass steps.
- Responsive mobile navigation and top-right light/dark switch.
- No fixed aspect ratio; the earlier 1:1 request was withdrawn.

## Earlier changes
- New vector frog logo with a mint finish.
- Minimal navigation and a persistent light/dark switch at the top right.
- Translucent mint panels, softer typography, responsive layouts, and reduced promotional copy.
- Simplified overview with sample document review, grid/list layouts, and direct access to the existing reader, creator, and template tools.
- One assistant launcher; voice remains available inside the assistant.
- Removed the source-download button from the product navigation.
- Resolved the original esbuild/Vite dependency conflict.

## Run
Use Node.js 22.12+ (or a compatible newer release).

```sh
npm ci
npm run dev:ui
```

The UI preview opens at http://127.0.0.1:3002. To run the original server and its API routes, use `npm run dev` after configuring the existing environment settings. No API credentials are included.

```sh
npm run build
```

This update focuses on appearance and navigation. The original document-analysis logic and Gemini server integration have not been validated as legal analysis. The supplied source contains simulated PDF/DOCX extraction; this update does not add real extraction. Live AI requires the original server configuration and was not tested during visual review.

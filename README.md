<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/15ca2145-b1bc-469a-a9e1-b0c55d4c0860

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set your AI API key in `.env` (or `.env.local`):
   - `OPENROUTER_API_KEY` (supports multi-model fallback across top free models)
   - `GEMINI_API_KEY` (for Gemini models and Gemini Live real-time voice)
3. Run the app:
   `npm run dev`

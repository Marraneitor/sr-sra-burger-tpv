// Simple build: ensure ./public exists and contains index.html for Vercel
const fs = require('fs');
const path = require('path');

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function copy(src, dest) {
  fs.copyFileSync(src, dest);
  console.log(`Copied ${path.basename(src)} -> ${dest}`);
}

(async () => {
  const root = process.cwd();
  const outDir = path.join(root, 'public');
  ensureDir(outDir);

  // Primary SPA entry
  const indexSrc = path.join(root, 'index.html');
  if (!fs.existsSync(indexSrc)) {
    console.error('index.html not found at project root.');
    process.exit(1);
  }
  copy(indexSrc, path.join(outDir, 'index.html'));

  // Copy Firebase config JSON if present (useful for local or if user decides to ship it)
  const fbJson = path.join(root, 'firebase-config.json');
  if (fs.existsSync(fbJson)) {
    copy(fbJson, path.join(outDir, 'firebase-config.json'));
  }

  // Optional: copy a favicon if present
  const favNames = ['favicon.ico', 'favicon.png'];
  for (const f of favNames) {
    const src = path.join(root, f);
    if (fs.existsSync(src)) copy(src, path.join(outDir, f));
  }

  // Copy firebase-config.json if present so static hosting can fetch it
  const firebaseJson = path.join(root, 'firebase-config.json');
  if (fs.existsSync(firebaseJson)) {
    copy(firebaseJson, path.join(outDir, 'firebase-config.json'));
  }

  // Or synthesize firebase-config.json from environment variables (for Vercel)
  try {
    const envJson = process.env.FIREBASE_CONFIG;
    if (envJson) {
      const parsed = JSON.parse(envJson);
      if (parsed && parsed.apiKey) {
        fs.writeFileSync(path.join(outDir, 'firebase-config.json'), JSON.stringify(parsed, null, 2));
        console.log('Generated firebase-config.json from FIREBASE_CONFIG env');
      }
    } else if (process.env.FIREBASE_API_KEY) {
      const cfg = {
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.FIREBASE_APP_ID || '',
        measurementId: process.env.FIREBASE_MEASUREMENT_ID || undefined
      };
      fs.writeFileSync(path.join(outDir, 'firebase-config.json'), JSON.stringify(cfg, null, 2));
      console.log('Generated firebase-config.json from FIREBASE_* env vars');
    }
  } catch (e) {
    console.warn('Env-based firebase-config.json generation skipped:', e.message);
  }

  // Optionally include a placeholder robots.txt for static hosting
  const robots = path.join(outDir, 'robots.txt');
  if (!fs.existsSync(robots)) fs.writeFileSync(robots, 'User-agent: *\nAllow: /\n');

  console.log('Build complete: public/ ready');
})();

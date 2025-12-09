# 📦 Installation Guide für Native UX Verbesserungen

## Schritt-für-Schritt Installation

### 1. Material UI Core Pakete

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/material-nextjs
npm install @mui/icons-material
```

**Was wird damit installiert:**
- Material Design 3 Komponenten
- Next.js Integration für SSR
- Material Icons (optional, du verwendest Lucide)

**Bundle Size Impact:** ~200KB (gzipped ~70KB)

---

### 2. Performance Pakete

```bash
npm install @tanstack/react-virtual
```

**Was wird damit installiert:**
- Virtual Scrolling für große Listen
- 60fps Performance auch bei 1000+ Items

**Bundle Size Impact:** ~15KB (gzipped ~5KB)

---

### 3. Capacitor Plugins (falls nicht vorhanden)

```bash
npm install @capacitor/keyboard
npm install @capacitor/share
npm install @capacitor/app
```

**Was wird damit installiert:**
- Keyboard API für native Keyboard Handling
- Share API für native Share Sheet
- App API für Lifecycle events

**Bundle Size Impact:** Minimal (nur native bridges)

---

### 4. TypeScript Types (falls Fehler auftreten)

```bash
npm install --save-dev @types/react @types/node
```

---

## Vollständige Installation (Copy-Paste)

```bash
# Hauptpakete
npm install \
  @mui/material \
  @emotion/react \
  @emotion/styled \
  @mui/material-nextjs \
  @tanstack/react-virtual \
  @capacitor/keyboard \
  @capacitor/share \
  @capacitor/app

# Optional: Material Icons (falls du Material Icons statt Lucide willst)
# npm install @mui/icons-material
```

---

## package.json Dependencies Preview

Nach der Installation sollte deine `package.json` etwa so aussehen:

```json
{
  "dependencies": {
    // Bestehende Pakete
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@capacitor/core": "^7.1.0",
    "@capacitor/haptics": "^7.0.0",

    // Neu hinzugefügt
    "@mui/material": "^6.3.0",
    "@emotion/react": "^11.13.3",
    "@emotion/styled": "^11.13.0",
    "@mui/material-nextjs": "^6.3.0",
    "@tanstack/react-virtual": "^3.10.8",
    "@capacitor/keyboard": "^7.0.1",
    "@capacitor/share": "^7.0.1",
    "@capacitor/app": "^7.0.1"
  }
}
```

---

## Bundle Size Vergleich

### Vorher (Bestehende Dependencies)
- Next.js: ~100KB
- React: ~40KB
- Capacitor Core: ~20KB
- Framer Motion: ~60KB (wird teilweise ersetzt)
- **Total Core:** ~220KB

### Nachher (Mit Material UI)
- Next.js: ~100KB
- React: ~40KB
- Capacitor Core: ~20KB
- Material UI: ~70KB (gzipped)
- React Virtual: ~5KB
- **Total Core:** ~235KB

**Increase:** Nur +15KB gzipped für massiv bessere UX!

---

## Optimierungen

### Tree Shaking für Material UI

**File: `next.config.js`**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config

  // Material UI Tree Shaking
  modularizeImports: {
    '@mui/material': {
      transform: '@mui/material/{{member}}',
    },
    '@mui/icons-material': {
      transform: '@mui/icons-material/{{member}}',
    },
  },

  // Existing Capacitor config
  output: process.env.CAPACITOR_BUILD === 'true' ? 'export' : undefined,
  // ...
};

module.exports = nextConfig;
```

**Effekt:** Nur verwendete Komponenten werden gebundelt!

---

## Capacitor Sync (nach Installation)

```bash
# Sync native dependencies
npx cap sync

# Android build
npx cap sync android

# Optional: iOS build
npx cap sync ios
```

---

## Verify Installation

Nach der Installation kannst du überprüfen:

```bash
# Check installed packages
npm list @mui/material
npm list @tanstack/react-virtual
npm list @capacitor/keyboard

# Should show installed versions
```

---

## Common Issues

### Issue 1: Module not found @emotion/react

**Fix:**
```bash
npm install @emotion/react @emotion/styled --legacy-peer-deps
```

### Issue 2: Next.js Hydration Errors

**Fix:** Stelle sicher dass Material Components nur client-side sind:

```typescript
'use client'; // Add to top of file

import { ThemeProvider } from '@mui/material/styles';
```

### Issue 3: Capacitor Plugin not registered

**Fix:**
```bash
npx cap sync
npx cap run android --livereload
```

### Issue 4: TypeScript Errors

**Fix:**
```bash
npm install --save-dev @types/react@latest
```

---

## Development Workflow

### 1. Development (Web)

```bash
npm run dev
# Tested in browser with native fallbacks
```

### 2. Testing (Android)

```bash
# Build und sync
npm run build
npx cap sync android

# Run on device
npx cap run android --livereload
```

### 3. Production Build

```bash
# Build für Capacitor
CAPACITOR_BUILD=true npm run build

# Sync to native projects
npx cap sync

# Open Android Studio
npx cap open android
```

---

## Optional: Remove Framer Motion (Falls nicht mehr benötigt)

Wenn du vollständig auf Material UI umstellst:

```bash
# Remove framer-motion (save ~60KB)
npm uninstall framer-motion

# Keep for gesture detection only (optional)
```

**Note:** Framer Motion kann für Gestures nützlich sein, aber Material UI hat eigene animations!

---

## Verification Checklist

- [ ] `npm install` erfolgreich ohne Errors
- [ ] `npm run dev` startet ohne Probleme
- [ ] Material UI Komponenten können importiert werden
- [ ] TypeScript zeigt keine Fehler
- [ ] `npx cap sync` läuft durch
- [ ] Android Build funktioniert

---

## Support & Troubleshooting

### Official Docs
- [Material UI Docs](https://mui.com/material-ui/getting-started/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest)

### Community
- [Material UI GitHub](https://github.com/mui/material-ui)
- [Capacitor Discord](https://discord.gg/UPYYRhtyzp)

---

## Next Steps

Nach erfolgreicher Installation:

1. ✅ Öffne `QUICK_START_NATIVE_UX.md`
2. ✅ Folge Phase 1 (Material UI Setup)
3. ✅ Teste die erste Änderung im Browser
4. ✅ Build für Android und teste auf Gerät

Viel Erfolg! 🚀

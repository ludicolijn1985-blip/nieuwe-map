# 🔥 ForgeLocal AI — Complete Build Prompt

## Wat is dit?

Dit is de exacte prompt waarmee je **ForgeLocal AI** kunt nabouwen — een volledig werkende web-applicatie die zich voordoet als een AI-agent die automatisch Flutter apps genereert voor lokale bedrijven. Gebouwd met React, TypeScript, Tailwind CSS en Vite.

---

## De Prompt

```
Bouw een premium, futuristische web-applicatie genaamd "ForgeLocal AI" met React, TypeScript, 
Tailwind CSS en Vite. Dark mode design geïnspireerd door arena.ai / vercel.com. 

Het doel: een AI-agent simulator die automatisch een complete Flutter mobiele app genereert 
voor lokale bedrijven (cafés, kappers, sportscholen, restaurants, winkels).

═══════════════════════════════════════════════════════════════
FASE 1: INPUT FORMULIER (Linker paneel)
═══════════════════════════════════════════════════════════════

Een strak, gestructureerd invoerformulier met:
- Bedrijfsnaam (text input)
- Type bedrijf (dropdown: Café, Kapsalon, Sportschool, Restaurant, Winkel, Bakkerij, 
  Bloemenwinkel, Dierenwinkel, Fysiotherapie, Tandarts)
- Stad + Postcode (twee velden naast elkaar)
- Korte beschrijving (textarea)
- Gewenste features (textarea, één per regel — bijv. "Online menu", "Reserveringen", 
  "Loyalty programma", "Push notificaties")
- Merkkleur (color picker met hex waarde)
- Logo upload (mock upload knop met bestandsnaam display)
- Grote groene CTA knop: "🚀 Start Autonomous Agent"

Styling: glassmorphism cards, subtiele borders, glow effecten op focus, 
smooth hover animaties.

═══════════════════════════════════════════════════════════════
FASE 2: PREDICTABLE ROI CARD (Modal/Overlay)
═══════════════════════════════════════════════════════════════

Wanneer de gebruiker op "Start Autonomous Agent" klikt, toon EERST een groot 
ROI-overzicht als overlay card:

- Geschatte omzetverhoging: 18–35% (afhankelijk van bedrijfstype)
- Bouwtijd: 4–8 minuten
- Complexiteit: Easy / Medium / Advanced (met kleur badge)
- Maandelijkse prijs na launch: €29/maand
- Tagline: "💰 This app will probably pay for itself in 3 weeks"
- Vertrouwensbadges: "✓ No code needed", "✓ Cancel anytime", "✓ Live in 48h"
- Animatie: metrics tellen omhoog met count-up effect
- CTA knop: "🚀 Build My App Now — It's Worth It"

Na klik op CTA → start de autonomous agent (Fase 3).

═══════════════════════════════════════════════════════════════
FASE 3: AUTONOMOUS AGENT — DRIE-PANELEN LAYOUT
═══════════════════════════════════════════════════════════════

Drie panelen naast elkaar met een globale progress bar bovenaan:

────────────────────────────────
LINKER PANEEL: Live Agent Log
────────────────────────────────
- Getimestampte log entries die één voor één verschijnen
- 9 stappen met substappen:
  Step 1/9: Analyzing business profile...
  Step 2/9: Designing app architecture...
  Step 3/9: Generating UI theme & brand colors...
  Step 4/9: Building home screen...
  Step 5/9: Creating menu/services module...
  Step 6/9: Implementing booking system...
  Step 7/9: Adding loyalty rewards program...
  Step 8/9: Setting up push notifications...
  Step 9/9: Final optimization & testing...
- Elke stap toont: spinner (actief), checkmark (klaar), duur in seconden
- Sub-detail berichten per stap (bijv. "Generating 6 menu categories...", 
  "Applying brand color #2D5A3D to 14 components...")
- Aan het einde: "✅ BUILD COMPLETE — Your app is ready!"

────────────────────────────────
MIDDEN PANEEL: Interactieve Telefoon Preview
────────────────────────────────
Een realistische Android telefoon frame (met notch, statusbar, tijdstip) die 
LIVE INTERACTIEF is. De gebruiker kan door de gegenereerde app navigeren:

7+ schermen:
1. Splash Screen — bedrijfsnaam + logo, tap om te openen
2. Home Screen — hero card met bedrijfsinfo, quick action grid (4 knoppen), 
   loyalty shortcut, locatie link, notificatie badge
3. Menu/Services Screen — items met emoji's, +/− knoppen voor bestelling, 
   filter tabs (Alles, Populair, Nieuw, Deals), zoekbalk, winkelwagen badge
4. Item Detail Screen — groot emoji, beschrijving, reviews, "Toevoegen" knop
5. Rewards Screen — puntensaldo, dagelijkse check-in knop (+100 punten), 
   voortgangsbalk, inwisselbare beloningen
6. Profiel Screen — statistieken, instellingen lijst, premium badge
7. Winkelwagen Screen — toegevoegde items, hoeveelheden, totaal, bestelling plaatsen
8. Kaart Screen — gesimuleerde kaart met pin, adres, openingstijden, navigatie knoppen

Interactieve features:
- Bottom navigation bar met actieve indicator en winkelwagen badge
- Toast notificaties bij elke actie
- Werkend winkelwagensysteem (toevoegen, verwijderen, totaal berekenen)
- Loyalty punten systeem (verdienen bij check-in en bestelling)
- Content past zich aan op bedrijfstype (menu items, labels, emoji's)
- "⚡ INTERACTIVE" badge wanneer de preview klikbaar wordt
- Alle knoppen, items en navigatie zijn volledig klikbaar

────────────────────────────────
RECHTER PANEEL: Flutter Code Viewer
────────────────────────────────
- Flutter/Dart bestanden verschijnen progressief per bouwstap
- Streaming animatie: code wordt regel voor regel "getypt"
- Bestanden: main.dart, app_theme.dart, home_screen.dart, menu_screen.dart, etc.
- Syntax highlighting met kleuren
- Elk bestand heeft een "📋 Copy" knop (kopieert naar clipboard)
- Bestanden zijn inklapbaar/uitklapbaar
- Actief bestand toont "writing..." indicator

═══════════════════════════════════════════════════════════════
FASE 4: VOLTOOIING & DOWNLOAD
═══════════════════════════════════════════════════════════════

Na afronding:
- Bottom bar met project statistieken (aantal bestanden, regels code, schermen)
- "📦 Download Flutter Project (.zip)" knop
- De ZIP bevat een COMPLEET Flutter project:
  - pubspec.yaml (met 15+ packages: flutter_riverpod, dio, go_router, 
    firebase_core, firebase_messaging, hive_flutter, etc.)
  - lib/main.dart, theme/, screens/, widgets/, models/, services/, providers/
  - android/app/build.gradle, AndroidManifest.xml, res/ folders
  - ios/Runner/Info.plist
  - test/widget_test.dart
  - analysis_options.yaml, .gitignore, README.md
- ZIP wordt client-side gegenereerd met JSZip
- "🧪 Test Preview" knop opent een grotere versie van de interactieve telefoon

═══════════════════════════════════════════════════════════════
EXTRA FEATURES
═══════════════════════════════════════════════════════════════

Header:
- ForgeLocal AI logo met gradient tekst
- "Flutter FAQ" knop → opent transparantie paneel met 9 veelgestelde vragen
  over de gegenereerde Flutter code (versie, architectuur, packages, 
  Play Store readiness, etc.)
- "🧪 Test Preview" knop (verschijnt na build)

Flutter FAQ Paneel (overlay):
- 9 vragen met uitklapbare antwoorden
- Status badges: ✅ Included / ⚠️ Almost Ready / ℹ️ Info
- Vragen over: Flutter versie, mappenstructuur, state management, 
  packages, production-readiness, download methode, preview realisme, 
  backend/Firebase, Play Store submission

═══════════════════════════════════════════════════════════════
DESIGN SPECIFICATIES
═══════════════════════════════════════════════════════════════

- Dark mode: achtergronden #0a0a0a, #111111, #1a1a1a
- Accent kleuren: emerald/green (#10b981) als primair, 
  gradient van emerald naar cyan voor highlights
- Glassmorphism: backdrop-blur, semi-transparante borders
- Animaties: smooth transitions (300ms), fade-in effecten, 
  shimmer op progress bars, pulse op actieve elementen
- Glow effecten: groene glow op CTA knoppen, subtiele box-shadows
- Typography: system fonts, duidelijke hiërarchie
- Responsive maar geoptimaliseerd voor desktop (1200px+)
- Scrollbare panelen met custom scrollbar styling
- Toast notificaties met auto-dismiss

═══════════════════════════════════════════════════════════════
TECHNISCHE STACK
═══════════════════════════════════════════════════════════════

- React 18+ met TypeScript
- Vite als build tool
- Tailwind CSS voor styling
- Lucide React voor iconen
- JSZip voor ZIP generatie
- file-saver voor bestand download
- Framer Motion voor animaties (optioneel, kan ook met CSS)
- Geen backend nodig — alles draait client-side met mock data
- Alle "AI generatie" is gesimuleerd met timeouts en voorgedefinieerde content
- De gegenereerde Flutter code is wel echt/valide Dart code

═══════════════════════════════════════════════════════════════
MOCK DATA SYSTEEM
═══════════════════════════════════════════════════════════════

Alles is mock maar voelt realistisch:
- Build stappen hebben variabele duur (1.5s - 4s per stap)
- Log berichten zijn contextbewust (noemen bedrijfsnaam en -type)
- Telefoon preview toont bedrijfsspecifieke content:
  - Café: Espresso, Cappuccino, Croissant, etc.
  - Kapsalon: Knippen, Kleuren, Baard trim, etc.
  - Restaurant: Pasta, Pizza, Desserts, etc.
  - Sportschool: Yoga, CrossFit, Personal Training, etc.
- Flutter code gebruikt de opgegeven merkkleur en bedrijfsnaam
- ROI percentages variëren per bedrijfstype
```

---

## Mappenstructuur van het project

```
forgelocal-ai/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── src/
│   ├── main.tsx
│   ├── index.css
│   ├── App.tsx                          ← Hoofdcomponent met alle fases
│   ├── types.ts                         ← TypeScript interfaces
│   ├── mockData.ts                      ← Mock data generators
│   ├── generateFlutterZip.ts            ← ZIP generator (20+ bestanden)
│   ├── components/
│   │   ├── PhonePreview.tsx             ← Interactieve telefoon (7+ schermen)
│   │   ├── ROICard.tsx                  ← ROI overlay met animaties
│   │   ├── LogPanel.tsx                 ← Live agent log
│   │   ├── CodeViewer.tsx              ← Streaming code viewer
│   │   └── TransparencyPanel.tsx        ← Flutter FAQ overlay
│   └── ...
└── PROMPT.md                            ← Dit bestand
```

---

## Hoe te gebruiken

1. `npm install`
2. `npm run dev`
3. Vul het formulier in met bedrijfsgegevens
4. Klik "🚀 Start Autonomous Agent"
5. Bekijk de ROI card → klik "Build My App Now"
6. Bekijk de agent die je app "bouwt" met live log, telefoon preview en code
7. Na voltooiing: test de interactieve preview en download de Flutter ZIP

---

## Key Decisions

- **Waarom mock?** — Dit is een frontend demo/prototype. De "AI" is gesimuleerd maar 
  de gegenereerde Flutter code in de ZIP is wel echte, compileerbare Dart code.
- **Waarom geen echte AI?** — Kan later worden toegevoegd met OpenAI/Claude API. 
  De architectuur is voorbereid op echte code generatie.
- **Waarom client-side ZIP?** — Geen server nodig, instant download, privacy-vriendelijk.
- **Waarom interactieve preview?** — Geeft de gebruiker vertrouwen dat de app echt 
  werkt voordat ze betalen/downloaden.

---

*Gemaakt met ❤️ door ForgeLocal AI*

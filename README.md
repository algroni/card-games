# CardGamesApp

Simple offline English-Spanish flashcard app using Expo + TypeScript.

Features:
- Bundled 500 English-Spanish word pairs at `src/data/words.json`.
- Shows one card at a time with English and Spanish translations.
- "Mark / Remove" removes the current word and persists progress offline using AsyncStorage.
- Reset button to reshuffle and restart.

Getting started:

1. Install dependencies

```bash
npm install
# or
yarn
```

2. Start Expo

```bash
npm run start
```

3. Run on device or simulator

```bash
npm run android
npm run ios
```

Notes:
- The project uses `@react-native-async-storage/async-storage` to persist progress locally (offline).
- Adjust `App.tsx` styles or behavior as needed.

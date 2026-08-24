# KEI — Khmer Editor & Input (React Native)

កម្មវិធីវាយអក្សរខ្មែរ + editor ផ្ទាល់ខ្លួន (custom soft keyboard) សម្រាប់រក្សាទុកកូដ ឬអត្ថបទខ្លីៗ។ ស្ថាបនាតាម React Native + Expo + TypeScript។

## ស្ថានភាពបច្ចុប្បន្ន

⚠️ ឥឡូវនេះ App ទាំងមូលនៅក្នុងឯកសារតែមួយ `App.tsx` (monolithic)។ រចនាសម្ព័ន្ធញែកជា `src/` (types, components, hooks, storage, utils) ដែលមានចែងក្នុងផែនការ **មិនទាន់បានសរសេរនៅឡើយទេ** — ជា roadmap សម្រាប់ជំហានបន្ទាប់ មិនមែនកូដដែលមានស្រាប់ទេ។

## រចនាសម្ព័ន្ធឯកសារបច្ចុប្បន្ន

```
khoem-now/
├── App.tsx              # component KeiMasterApp ទាំងមូល (UI + logic + styles)
├── README.md
├── package.json         # dependencies (Expo, React Native, TypeScript)
├── tsconfig.json         # TypeScript config (extends expo/tsconfig.base)
├── tsconfig.base.json    # compiler options រួម
└── setup-termux.sh       # script ដំឡើង + start នៅក្នុង Termux
```

## របៀបរត់ (Android + Termux)

```bash
cd khoem-now
bash setup-termux.sh
```

Script នេះនឹង៖
1. អាប់ដេត Termux packages
2. ដំឡើង Node.js + git
3. `npm install`
4. `npx expo start` — ស្កេន QR code ដោយកម្មវិធី **Expo Go** (ទាញពី Play Store)

## មុខងារបច្ចុប្បន្ន

- ក្តារចុច Khmer / English / Numbers-Symbols (ប្តូរ tab បាន)
- បញ្ចូលបន្ទាត់ (lines) ថ្មី ហើយបង្ហាញជា list ជាមួយលេខរៀង
- ស្វែងរក (filter) លើបញ្ជីបន្ទាត់ (case-insensitive, ធម្មតា មិនទាន់ normalize Unicode)
- Backspace និង space key ផ្ទាល់ខ្លួន
- របារ Dev Toolbar (ESC, arrow keys, CTRL/ALT ។ល។) បញ្ចូល placeholder text ជា `[KEY]`
- ផ្ទាំង "Sigils" សម្រាប់បញ្ចូល tag តុបតែង

## អ្វីដែលនៅសល់ (មិនទាន់សរសេរ — ជា roadmap)

- រក្សាទុកទិន្នន័យអចិន្ត្រៃយ៍ (AsyncStorage) — បច្ចុប្បន្ន lines បាត់ពេល reload
- Undo/Redo
- Copy / Cut / Paste
- Khmer grapheme cluster-aware cursor/selection (coeng, combining marks, emoji)
- Khmer word segmentation
- Coeng input mode ពេញលេញលើក្តារចុច
- ញែកកូដទៅជា `src/types`, `src/components`, `src/hooks`, `src/storage`, `src/utils` តាមផែនការដើម
- Settings screen, theme switching, export/import UI, haptics

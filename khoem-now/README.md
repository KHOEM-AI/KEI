mkdir -p /home/claude/KEI_readme && cat > /home/claude/KEI_readme/README.md << 'EOF'
# KEI — Khmer Editor & Input (React Native)

កម្មវិធីវាយអក្សរខ្មែរ + editor ផ្ទាល់ខ្លួន (custom soft keyboard) សម្រាប់រក្សាទុក
កូដ ឬអត្ថបទខ្លីៗ។ ស្ថាបនាតាម React Native + TypeScript, ប្រើ Unicode grapheme
segmentation ត្រឹមត្រូវសម្រាប់ Khmer coeng/combining marks និង emoji។

## រចនាសម្ព័ន្ធ

```
khoem-now/
├── App.tsx                          # mounts KeiMasterApp
├── README.md
└── src/
    ├── types/
    │   └── index.ts                 # EditorState/Action, StoredLine, storage schema
    ├── components/
    │   └── keyboard/
    │       ├── KeiMasterApp.tsx     # screen មេ (UI ទាំងអស់)
    │       ├── reducer.ts           # editor engine — source of truth តែមួយសម្រាប់ text/selection
    │       └── styles.ts            # StyleSheet (សមមូល .css)
    ├── hooks/
    │   └── useDebouncedSave.ts      # debounce ការរក្សាទុក + save status
    ├── storage/
    │   ├── storage.ts               # AsyncStorage, schema versioned + migration
    │   ├── history.ts               # undo/redo merge logic
    │   ├── boundaries.ts            # word boundary + ↑/↓ movement
    │   └── index.ts                 # barrel export
    └── utils/
        ├── khmer.ts                 # consonants/vowels/coeng/numerals/punctuation/៛
        ├── english.ts               # English layout + punctuation row
        ├── numbers.ts               # Arabic + Khmer digits
        ├── symbols.ts               # programming/math/currency/typography/arrows
        ├── sigils.ts
        ├── unicode.ts               # grapheme segmentation (Khmer + emoji safe)
        ├── search.ts                # NFC-normalized search
        ├── colors.ts                # theme palette
        └── dimensions.ts            # touch target + responsive key sizing
```

## មុខងារបច្ចុប្បន្ន

- ក្តារចុច Khmer / English / Numbers / Symbols
- Cursor/selection ត្រឹមត្រូវលើ Khmer grapheme cluster (coeng, combining marks) និង emoji
- Undo/Redo ដែលបញ្ចូលគ្នា (merge) ការវាយអក្សរជាប់ៗគ្នាទៅជា step តែមួយ
- Copy / Cut / Paste
- Search មាន Unicode normalization
- រក្សាទុកតាម AsyncStorage ជាមួយ schema version + migration ពី format ចាស់
- Debounced save (មិនសរសេរ disk រាល់ keystroke)

## អ្វីដែលនៅសល់ (Priority បន្ទាប់)

- Khmer word segmentation ពិតប្រាកដ (បច្ចុប្បន្ន degrade ទៅ grapheme cluster)
- Coeng input mode ពេញលេញលើក្តារចុច
- Emoji keyboard/picker
- Visual-line-aware Home/End/↑/↓ (បច្ចុប្បន្នផ្អែកលើ logical line)
- Settings screen, theme switching, export/import UI, haptics
EOF
echo done

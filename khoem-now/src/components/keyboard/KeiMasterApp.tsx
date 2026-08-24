import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  useWindowDimensions,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { KeyboardLayout, NativeSelection, StoredLine } from '../../types';
import { editorReducer, initialEditorState, rangeOf } from './reducer';
import { styles } from './styles';
import { graphemeCount, inferCursorFromDiff } from '../../utils/unicode';
import { loadLines, makeLine } from '../../storage';
import { useDebouncedSave } from '../../hooks/useDebouncedSave';
import { searchLines } from '../../utils/search';
import { computeKeyWidth, hitSlopFor, KEY_HEIGHT } from '../../utils/dimensions';
import { colors } from '../../utils/colors';
import { KHMER_KEYBOARD_LAYERS } from '../../utils/khmer';
import { ENGLISH_ROWS_LOWER, ENGLISH_PUNCTUATION_ROW } from '../../utils/english';
import { NUMBER_KEYBOARD_LAYERS } from '../../utils/numbers';
import { SYMBOL_KEYBOARD_LAYERS } from '../../utils/symbols';
import { SIGIL_CATEGORIES } from '../../utils/sigils';

export default function KeiMasterApp() {
  const [lines, setLines] = useState<StoredLine[]>([]);
  const [linesLoaded, setLinesLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('khmer');
  const [shiftOn, setShiftOn] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [selMode, setSelMode] = useState(false);
  const [showAdvancedBar, setShowAdvancedBar] = useState(false);
  const [showSigilBoard, setShowSigilBoard] = useState(false);
  const [editorFocused, setEditorFocused] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { width: windowWidth } = useWindowDimensions();
  const [editor, dispatch] = useReducer(editorReducer, initialEditorState);

  const inputRef = useRef<TextInput>(null);
  const searchInputRef = useRef<TextInput>(null);
  const { start: selStart, end: selEnd } = rangeOf(editor);

  // "Last known synced value" — an incoming native event that matches
  // what we last pushed to the TextInput is a genuine echo and is
  // dropped; anything else is a real native-driven change.
  const lastSyncedTextRef = useRef(editor.text);
  const lastSyncedSelectionRef = useRef<NativeSelection>({ start: selStart, end: selEnd });
  useEffect(() => {
    lastSyncedTextRef.current = editor.text;
    lastSyncedSelectionRef.current = { start: selStart, end: selEnd };
  });

  const saveStatus = useDebouncedSave(lines, linesLoaded);

  useEffect(() => {
    (async () => {
      setLines(await loadLines());
      setLinesLoaded(true);
    })();
  }, []);

  const ensureEditorFocus = useCallback(() => {
    if (!editorFocused) inputRef.current?.focus();
  }, [editorFocused]);

  const dispatchWithFocus = useCallback((action: Parameters<typeof dispatch>[0]) => {
    ensureEditorFocus();
    dispatch(action);
  }, [ensureEditorFocus]);

  const handleAddLine = () => {
    if (editor.text.trim() === '') return;
    if (editingId !== null) {
      setLines((prev) => prev.map((l) => (l.id === editingId ? { ...l, text: editor.text, updatedAt: Date.now() } : l)));
      setEditingId(null);
    } else {
      setLines((prev) => [...prev, makeLine(editor.text)]);
    }
    dispatch({ type: 'CLEAR', now: Date.now() });
  };

  const handleLoadLine = (line: StoredLine) => {
    dispatchWithFocus({ type: 'LOAD_LINE', text: line.text });
    setEditingId(line.id);
  };

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    dispatch({ type: 'LOAD_LINE', text: '' });
  }, []);

  // CLR always ends any active edit too — otherwise it only wiped the
  // text box while leaving editingId set, and the next Add silently
  // saved over the wrong line.
  const handleClearKey = useCallback(() => {
    if (editingId !== null) handleCancelEdit();
    else dispatch({ type: 'CLEAR', now: Date.now() });
  }, [editingId, handleCancelEdit]);

  const handleDeleteLine = (line: StoredLine) => {
    Alert.alert('លុបបន្ទាត់', 'តើអ្នកចង់លុបបន្ទាត់នេះមែនទេ?', [
      { text: 'បោះបង់', style: 'cancel' },
      {
        text: 'លុប',
        style: 'destructive',
        onPress: () => {
          setLines((prev) => prev.filter((l) => l.id !== line.id));
          if (editingId === line.id) handleCancelEdit();
        },
      },
    ]);
  };

  const onNativeChangeText = (t: string) => {
    if (t === lastSyncedTextRef.current) return;
    const inferredCaret = inferCursorFromDiff(lastSyncedTextRef.current, t);
    dispatch({ type: 'SET_TEXT_FROM_NATIVE', text: t, caret: inferredCaret, now: Date.now() });
  };
  const onNativeSelectionChange = (e: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
    const { start, end } = e.nativeEvent.selection;
    const synced = lastSyncedSelectionRef.current;
    if (start === synced.start && end === synced.end) return;
    dispatch({ type: 'SET_SELECTION_NATIVE', selection: { start, end } });
  };

  const handleKeyPress = useCallback((char: string) => {
    let out = char;
    if (keyboardLayout === 'english' && (capsLockOn || shiftOn)) out = char.toUpperCase();
    dispatchWithFocus({ type: 'INSERT', text: out, now: Date.now() });
    if (shiftOn && !capsLockOn) setShiftOn(false);
  }, [keyboardLayout, capsLockOn, shiftOn, dispatchWithFocus]);

  const handleCopy = async () => {
    const { start, end } = rangeOf(editor);
    if (start === end) return;
    try { await Clipboard.setStringAsync(editor.text.slice(start, end)); } catch (e) { console.warn('Copy failed', e); }
  };
  const handleCut = async () => {
    const { start, end } = rangeOf(editor);
    if (start === end) return;
    try {
      await Clipboard.setStringAsync(editor.text.slice(start, end));
      dispatchWithFocus({ type: 'DELETE_BACKWARD', now: Date.now() });
    } catch (e) { console.warn('Cut failed', e); }
  };
  const handlePaste = async () => {
    try {
      const clip = await Clipboard.getStringAsync();
      if (clip) dispatchWithFocus({ type: 'INSERT', text: clip, now: Date.now() });
    } catch (e) { console.warn('Paste failed', e); }
  };

  const currentRows: string[][] = useMemo(() => {
    if (keyboardLayout === 'khmer') return shiftOn ? KHMER_KEYBOARD_LAYERS.shift : KHMER_KEYBOARD_LAYERS.base;
    if (keyboardLayout === 'english') return [...ENGLISH_ROWS_LOWER, ENGLISH_PUNCTUATION_ROW];
    if (keyboardLayout === 'numbers') return [...NUMBER_KEYBOARD_LAYERS.arabic, ...NUMBER_KEYBOARD_LAYERS.khmer];
    return [SYMBOL_KEYBOARD_LAYERS.basic];
  }, [keyboardLayout, shiftOn]);

  const keyWidth = useMemo(() => {
    const maxRowLen = Math.max(...currentRows.map((r) => r.length), 1);
    return computeKeyWidth(windowWidth, maxRowLen);
  }, [currentRows, windowWidth]);
  const keyHitSlop = useMemo(() => hitSlopFor(Math.min(keyWidth, KEY_HEIGHT)), [keyWidth]);

  const filteredLines = useMemo(() => searchLines(lines, searchQuery), [lines, searchQuery]);
  const hasSelection = selStart !== selEnd;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={styles.flexFill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.searchContainer}>
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="🔍 ស្វែងរកកូដ ឬអត្ថបទ..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="ស្វែងរក"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.searchClearBtn}
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="សម្អាតការស្វែងរក"
            >
              <Text style={styles.searchClearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.displayArea}>
          <View style={styles.headerRow}>
            <Text style={styles.headerIndicator}>
              📊 KEI | {lines.length} lines {saveStatus === 'saving' ? '· ការរក្សាទុក…' : saveStatus === 'error' ? '· ⚠️ រក្សាទុកបរាជ័យ' : ''}
            </Text>
            {hasSelection && (
              <Text style={styles.selIndicator}>✂️ {graphemeCount(editor.text.slice(selStart, selEnd))} selected</Text>
            )}
          </View>
          {filteredLines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {lines.length === 0 ? 'មិនទាន់មានទិន្នន័យទេ — សូមវាយបញ្ចូលខាងក្រោម' : 'រកមិនឃើញលទ្ធផលត្រូវនឹងការស្វែងរក'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredLines}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <View style={[styles.lineRow, editingId === item.id && styles.lineRowEditing]}>
                  <TouchableOpacity
                    style={styles.lineTapArea}
                    onPress={() => handleLoadLine(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`កែសម្រួលបន្ទាត់ទី ${index + 1}`}
                  >
                    <Text style={styles.lineNum}>{index + 1}:</Text>
                    <Text style={styles.lineText}>{item.text}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.lineDeleteBtn}
                    onPress={() => handleDeleteLine(item)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityRole="button"
                    accessibilityLabel={`លុបបន្ទាត់ទី ${index + 1}`}
                  >
                    <Text style={styles.lineDeleteText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              )}
              style={styles.listView}
            />
          )}
        </View>

        <View style={styles.toggleMenuContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.toggleBtn, showAdvancedBar && styles.activeBtn]}
              onPress={() => { setShowAdvancedBar((v) => !v); setShowSigilBoard(false); }}
              accessibilityRole="button"
            >
              <Text style={styles.toggleBtnText}>{showAdvancedBar ? '− បិទរបារកូដ' : '+ 📢KEI🤖😎'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, styles.sigilBtn, showSigilBoard && styles.activeBtn]}
              onPress={() => { setShowSigilBoard((v) => !v); setShowAdvancedBar(false); }}
              accessibilityRole="button"
            >
              <Text style={styles.toggleBtnText}>👁️ Sigils 🔮</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {showAdvancedBar && (
          <View style={styles.advancedToolbar}>
            <View style={styles.cmdRowWrap}>
              {['ESC', 'CTRL', 'ALT'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.cmdButton}
                  onPress={() => dispatchWithFocus({ type: 'INSERT', text: `[${item}]`, now: Date.now() })}
                  accessibilityRole="button"
                >
                  <Text style={styles.cmdText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.toolbarNote}>ESC / CTRL / ALT — command layer ពិតប្រាកដ គ្រោងទុកសម្រាប់ជំហានបន្ទាប់</Text>
          </View>
        )}

        {showSigilBoard && (
          <View style={styles.sigilBoard}>
            <Text style={styles.sigilHeader}>#KHOEM-SOKSIVUTHA - AI-369-400-401</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sigilScroll}>
              {SIGIL_CATEGORIES.map((sigil) => (
                <TouchableOpacity
                  key={sigil.id}
                  style={styles.sigilCard}
                  onPress={() => dispatchWithFocus({ type: 'INSERT', text: `[${sigil.title}]`, now: Date.now() })}
                  accessibilityRole="button"
                  accessibilityLabel={sigil.title}
                >
                  <Text style={styles.sigilIcon}>{sigil.icon}</Text>
                  <Text style={styles.sigilTitle}>{sigil.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.keyboardContainer}>
          <View style={styles.langBar}>
            {([
              ['khmer', '🇰🇭 ខ្មែរ'],
              ['english', '🇺🇸 EN'],
              ['numbers', '🔢 123'],
              ['symbols', '# Sym'],
            ] as [KeyboardLayout, string][]).map(([lang, label]) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, keyboardLayout === lang && styles.activeLang]}
                onPress={() => setKeyboardLayout(lang)}
                accessibilityRole="button"
              >
                <Text style={styles.langText}>{label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.langBtn, styles.selBtn, selMode && styles.activeSel]}
              onPress={() => setSelMode((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel="របៀបជ្រើសរើសអត្ថបទ"
              accessibilityState={{ selected: selMode }}
            >
              <Text style={styles.langText}>🔀 SEL {selMode ? 'ON' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          {currentRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyRowWrap}>
              {row.map((char, charIndex) => (
                <TouchableOpacity
                  key={`${rowIndex}-${charIndex}-${char}`}
                  style={[styles.keyFixed, { width: keyWidth }]}
                  hitSlop={keyHitSlop}
                  onPress={() => handleKeyPress(char)}
                  accessibilityRole="button"
                  accessibilityLabel={char}
                >
                  <Text style={styles.keyText}>{keyboardLayout === 'english' && (shiftOn || capsLockOn) ? char.toUpperCase() : char}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey, shiftOn && styles.activeLang]} onPress={() => setShiftOn((v) => !v)} accessibilityRole="button" accessibilityLabel="Shift" accessibilityState={{ selected: shiftOn }}>
              <Text style={styles.keyTextSmall}>⇧ Shift</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey, capsLockOn && styles.activeLang]} onPress={() => setCapsLockOn((v) => !v)} accessibilityRole="button" accessibilityLabel="Caps lock" accessibilityState={{ selected: capsLockOn }}>
              <Text style={styles.keyTextSmall}>⇪ Caps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'INSERT', text: '  ', now: Date.now() })} accessibilityRole="button" accessibilityLabel="Tab">
              <Text style={styles.keyTextSmall}>↹ Tab</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'HOME', extend: selMode })} accessibilityRole="button" accessibilityLabel="Home">
              <Text style={styles.keyTextSmall}>↤ Home</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'END', extend: selMode })} accessibilityRole="button" accessibilityLabel="End">
              <Text style={styles.keyTextSmall}>↦ End</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DOC_HOME', extend: selMode })} accessibilityRole="button" accessibilityLabel="ដើមឯកសារ">
              <Text style={styles.keyTextSmall}>⇞ Doc Start</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'MOVE_WORD_LEFT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ពាក្យខាងឆ្វេង">
              <Text style={styles.keyTextSmall}>⇤ Word</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'MOVE_WORD_RIGHT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ពាក្យខាងស្តាំ">
              <Text style={styles.keyTextSmall}>Word ⇥</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DOC_END', extend: selMode })} accessibilityRole="button" accessibilityLabel="ចុងឯកសារ">
              <Text style={styles.keyTextSmall}>Doc End ⇟</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_LEFT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ឆ្វេង">
              <Text style={styles.keyText}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_VERTICAL', direction: -1, extend: selMode })} accessibilityRole="button" accessibilityLabel="ឡើងលើ">
              <Text style={styles.keyText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_VERTICAL', direction: 1, extend: selMode })} accessibilityRole="button" accessibilityLabel="ចុះក្រោម">
              <Text style={styles.keyText}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={() => dispatchWithFocus({ type: 'MOVE_RIGHT', extend: selMode })} accessibilityRole="button" accessibilityLabel="ស្តាំ">
              <Text style={styles.keyText}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_FORWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបខាងមុខ">
              <Text style={styles.keyText}>⌦</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_BACKWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបខាងក្រោយ">
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_WORD_BACKWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបពាក្យខាងក្រោយ">
              <Text style={styles.keyTextSmall}>⌫ Word</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'DELETE_WORD_FORWARD', now: Date.now() })} accessibilityRole="button" accessibilityLabel="លុបពាក្យខាងមុខ">
              <Text style={styles.keyTextSmall}>Word ⌦</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.key, styles.modKey]}
              onPress={() => dispatchWithFocus({ type: 'UNDO' })}
              disabled={editor.past.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Undo"
              accessibilityState={{ disabled: editor.past.length === 0 }}
            >
              <Text style={[styles.keyTextSmall, editor.past.length === 0 && styles.disabledText]}>↶ Undo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.key, styles.modKey]}
              onPress={() => dispatchWithFocus({ type: 'REDO' })}
              disabled={editor.future.length === 0}
              accessibilityRole="button"
              accessibilityLabel="Redo"
              accessibilityState={{ disabled: editor.future.length === 0 }}
            >
              <Text style={[styles.keyTextSmall, editor.future.length === 0 && styles.disabledText]}>↷ Redo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handleCopy} accessibilityRole="button" accessibilityLabel="ចម្លង">
              <Text style={styles.keyTextSmall}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handleCut} accessibilityRole="button" accessibilityLabel="កាត់">
              <Text style={styles.keyTextSmall}>Cut</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handlePaste} accessibilityRole="button" accessibilityLabel="បិទភ្ជាប់">
              <Text style={styles.keyTextSmall}>Paste</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={() => dispatchWithFocus({ type: 'SELECT_ALL' })} accessibilityRole="button" accessibilityLabel="ជ្រើសរើសទាំងអស់">
              <Text style={styles.keyTextSmall}>SELECT ALL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.modKey]} onPress={handleClearKey} accessibilityRole="button" accessibilityLabel="សម្អាត">
              <Text style={styles.keyTextSmall}>CLR</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.keyRow}>
            <TouchableOpacity style={[styles.key, styles.spaceKey]} onPress={() => handleKeyPress(' ')} accessibilityRole="button" accessibilityLabel="Space">
              <Text style={styles.keyText}>Space</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.key, styles.enterKey]} onPress={() => dispatchWithFocus({ type: 'INSERT', text: '\n', now: Date.now() })} accessibilityRole="button" accessibilityLabel="បន្ទាត់ថ្មី">
              <Text style={styles.keyText}>↵ Enter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {editingId !== null && (
          <View style={styles.editingBanner}>
            <Text style={styles.editingBannerText}>✏️ កំពុងកែសម្រួលបន្ទាត់</Text>
            <TouchableOpacity onPress={handleCancelEdit} accessibilityRole="button" accessibilityLabel="បោះបង់ការកែសម្រួល">
              <Text style={styles.editingBannerCancel}>បោះបង់</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            placeholder="វាយបញ្ចូលកូដ ឬអត្ថបទថ្មីនៅទីនេះ..."
            placeholderTextColor="#888"
            value={editor.text}
            onChangeText={onNativeChangeText}
            onSelectionChange={onNativeSelectionChange}
            selection={{ start: selStart, end: selEnd }}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            showSoftInputOnFocus={false}
            scrollEnabled
            multiline
            accessibilityLabel="ប្រអប់វាយអត្ថបទ"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddLine}
            accessibilityRole="button"
            accessibilityLabel={editingId !== null ? 'រក្សាទុកការកែសម្រួល' : 'បញ្ចូលបន្ទាត់ថ្មី'}
          >
            <Text style={styles.addText}>{editingId !== null ? 'រក្សាទុក ✓' : 'បញ្ចូល (+)'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

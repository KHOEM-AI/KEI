import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

type KeyboardLayout = 'khmer' | 'english' | 'symbols';

export default function KeiMasterApp() {
  // ១. ប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ
  const [lines, setLines] = useState<string[]>([
    'បន្ទាត់ទី ១: ចាប់ផ្តើមប្រព័ន្ធ KEI Massive Data Engine...',
    'AI-369-400-401 | #KHOEM-SOKSIVUTHA - CYBERNETIC SIGILS SYSTEM',
  ]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('khmer');

  // បើក/បិទ របារពិសេស
  const [showAdvancedBar, setShowAdvancedBar] = useState(false);
  const [showSigilBoard, setShowSigilBoard] = useState(false);

  const handleAddLine = () => {
    if (inputText.trim() === '') return;
    setLines((prev) => [...prev, inputText]);
    setInputText('');
  };

  const handleKeyPress = (char: string) => {
    setInputText((prev) => prev + char);
  };

  const handleBackspace = () => {
    setInputText((prev) => prev.slice(0, -1));
  };

  // របារកូដបញ្ជា Dev Toolbar
  const commandRow1 = ['ESC', '/', '-', 'HOME', '↑', 'END', 'PGUP'];
  const commandRow2 = ['↹', 'CTRL', 'ALT', '←', '↓', '→', 'PGDN'];

  // និមិត្តសញ្ញា — ប្រើ emoji ដើម្បីជៀសវាង crash ពី require() ឯកសារដែលមិនទាន់មាន
  // ចំណាំ: បើចង់ប្រើរូបភាពពិត សូមដាក់ឯកសារ .png ក្នុង assets/ រួចប្តូរ Text ទៅ Image
  const sigilCategories = [
    { id: '1', title: 'CYBERNETIC SIGILS', icon: '❇️' },
    { id: '2', title: 'THE GREAT ARCHITECT', icon: '✡️' },
    { id: '3', title: 'EMBLEM OF ALMIGHTY', icon: '⚜️' },
    { id: '4', title: 'SPIRIT OF UNITY', icon: '🪬' },
    { id: '5', title: 'DIVINE WILL BE DONE', icon: '☸️' },
  ];

  // ប្លង់ក្ដារចុច
  const khmerRows = [
    ['ឈ', 'ឆ', 'ឃ', 'ឍ', 'ថ', 'ប', 'ផ', 'ឡ', 'ឪ', 'ឳ'],
    ['ព្យ', 'ភ', 'ឋ', 'ខ', 'ល', 'ក', 'ច', 'វ', 'ន'],
    ['ម', 'ជ', 'ហ', 'គ', 'ង', 'ព', 'អ', 'ឥ'],
    ['ា', 'ិ', 'ី', 'ឹ', 'ឺ', 'ុ', 'ូ', 'ួ', 'ើ', 'ឿ'],
  ];

  const englishRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const symbolRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'],
    ['-', '_', '=', '+', '[', ']', '{', '}', '|', '\\'],
  ];

  const currentRows =
    keyboardLayout === 'khmer' ? khmerRows : keyboardLayout === 'english' ? englishRows : symbolRows;

  const filteredLines = lines.filter((line) =>
    line.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flexFill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* របារស្វែងរក */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 ស្វែងរកកូដ ឬអត្ថបទ..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* អេក្រង់បង្ហាញទិន្នន័យ */}
        <View style={styles.displayArea}>
          <Text style={styles.headerIndicator}>📊 KEI Storage | Total Lines: {lines.length}</Text>
          <FlatList
            data={filteredLines}
            keyExtractor={(_item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.lineRow}>
                <Text style={styles.lineNum}>{index + 1}:</Text>
                <Text style={styles.lineText}>{item}</Text>
              </View>
            )}
            style={styles.listView}
          />
        </View>

        {/* របារប៊ូតុងបញ្ជាពិសេស */}
        <View style={styles.toggleMenuContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.toggleBtn, showAdvancedBar && styles.activeBtn]}
              onPress={() => {
                setShowAdvancedBar((v) => !v);
                setShowSigilBoard(false);
              }}
            >
              <Text style={styles.toggleBtnText}>
                {showAdvancedBar ? '− បិទរបារកូដ' : '+ 📢KEI🤖😎'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, styles.sigilBtn, showSigilBoard && styles.activeBtn]}
              onPress={() => {
                setShowSigilBoard((v) => !v);
                setShowAdvancedBar(false);
              }}
            >
              <Text style={styles.toggleBtnText}>👁️ Sigils 🔮</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Dev Toolbar */}
        {showAdvancedBar && (
          <View style={styles.advancedToolbar}>
            <View style={styles.cmdRow}>
              {commandRow1.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.cmdButton}
                  onPress={() => handleKeyPress(`[${item}]`)}
                >
                  <Text style={styles.cmdText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.cmdRow}>
              {commandRow2.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={styles.cmdButton}
                  onPress={() => handleKeyPress(`[${item}]`)}
                >
                  <Text style={styles.cmdText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ផ្ទាំង Sigils */}
        {showSigilBoard && (
          <View style={styles.sigilBoard}>
            <Text style={styles.sigilHeader}>#KHOEM-SOKSIVUTHA - AI-369-400-401</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sigilScroll}>
              {sigilCategories.map((sigil) => (
                <TouchableOpacity
                  key={sigil.id}
                  style={styles.sigilCard}
                  onPress={() => handleKeyPress(`[${sigil.title}]`)}
                >
                  <Text style={styles.sigilIcon}>{sigil.icon}</Text>
                  <Text style={styles.sigilTitle}>{sigil.title}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ក្ដារចុចពេញលេញ */}
        <View style={styles.keyboardContainer}>
          <View style={styles.langBar}>
            {(['khmer', 'english', 'symbols'] as KeyboardLayout[]).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.langBtn, keyboardLayout === lang && styles.activeLang]}
                onPress={() => setKeyboardLayout(lang)}
              >
                <Text style={styles.langText}>
                  {lang === 'khmer' ? '🇰🇭 ខ្មែរ' : lang === 'english' ? '🇺🇸 EN' : '🔢 123'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keyRow}>
              {row.map((char) => (
                <TouchableOpacity key={char} style={styles.key} onPress={() => handleKeyPress(char)}>
                  <Text style={styles.keyText}>{char}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <View style={styles.keyRow}>
            <TouchableOpacity
              style={[styles.key, styles.spaceKey]}
              onPress={() => handleKeyPress(' ')}
            >
              <Text style={styles.keyText}>Space (ចន្លោះ)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.key} onPress={handleBackspace}>
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ប្រអប់បញ្ចូល */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="វាយបញ្ចូលកូដ ឬអត្ថបទថ្មីនៅទីនេះ..."
            placeholderTextColor="#888"
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddLine}>
            <Text style={styles.addText}>បញ្ចូល (+)</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  flexFill: { flex: 1 },

  searchContainer: { paddingHorizontal: 15, paddingTop: 10 },
  searchInput: {
    backgroundColor: '#1e293b',
    color: '#FFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },

  displayArea: { flex: 1, padding: 15 },
  headerIndicator: { color: '#38bdf8', fontSize: 11, marginBottom: 8, fontWeight: 'bold' },
  listView: { flex: 1, backgroundColor: '#1e293b', borderRadius: 8, padding: 10 },

  lineRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 0.5, borderBottomColor: '#334155' },
  lineNum: { color: '#64748b', fontSize: 12, width: 35, fontWeight: 'bold' },
  lineText: { color: '#f8fafc', fontSize: 14, flex: 1 },

  toggleMenuContainer: { paddingHorizontal: 15, paddingBottom: 8, flexDirection: 'row' },
  toggleBtn: { backgroundColor: '#334155', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8 },
  sigilBtn: { backgroundColor: '#4c1d95' },
  activeBtn: { borderWidth: 1, borderColor: '#38bdf8' },
  toggleBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  advancedToolbar: { backgroundColor: '#020617', paddingVertical: 8, paddingHorizontal: 5, borderTopWidth: 1, borderColor: '#334155' },
  cmdRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingHorizontal: 10 },
  cmdButton: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cmdText: { color: '#38bdf8', fontSize: 13, fontWeight: 'bold' },

  sigilBoard: { backgroundColor: '#090d16', paddingVertical: 10, borderTopWidth: 1, borderColor: '#4c1d95' },
  sigilHeader: { color: '#94a3b8', fontSize: 9, textAlign: 'center', marginBottom: 8, letterSpacing: 1 },
  sigilScroll: { paddingHorizontal: 10 },
  sigilCard: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
    width: 110,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sigilIcon: { fontSize: 26, marginBottom: 4 },
  sigilTitle: { color: '#38bdf8', fontSize: 8, textAlign: 'center', fontWeight: 'bold' },

  keyboardContainer: { backgroundColor: '#1e293b', paddingBottom: 10, paddingTop: 5, borderTopWidth: 1, borderColor: '#334155' },
  langBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 6 },
  langBtn: { paddingHorizontal: 15, paddingVertical: 4, backgroundColor: '#334155', borderRadius: 5, marginHorizontal: 5 },
  activeLang: { backgroundColor: '#0284c7' },
  langText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  keyRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 4, paddingHorizontal: 2 },
  key: { flex: 1, backgroundColor: '#334155', height: 42, justifyContent: 'center', alignItems: 'center', margin: 2, borderRadius: 5 },
  spaceKey: { flex: 4 },
  keyText: { color: '#FFF', fontSize: 15, fontWeight: '600' },

  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#0f172a', borderTopWidth: 1, borderColor: '#334155' },
  textInput: { flex: 1, backgroundColor: '#1e293b', color: '#FFF', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, fontSize: 14 },
  addButton: { backgroundColor: '#0284c7', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, borderRadius: 8, marginLeft: 8 },
  addText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
});

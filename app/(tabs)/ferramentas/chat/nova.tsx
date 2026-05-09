import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@stores/chatStore';

const SUGESTOES = [
  'Como funciona a fotossíntese?',
  'Explica-me a teoria da relatividade',
  'Resume a Revolução Francesa',
  'O que é uma equação diferencial?',
];

export default function NovaConversaScreen() {
  const router = useRouter();
  const criarConversa = useChatStore(s => s.criarConversa);
  const adicionarMensagem = useChatStore(s => s.adicionarMensagem);
  const [input, setInput] = useState('');

  function iniciarConversa(texto: string) {
    if (!texto.trim()) return;
    const id = criarConversa(texto.trim());
    adicionarMensagem(id, {
      id: Date.now().toString(),
      autor: 'user',
      texto: texto.trim(),
      timestamp: Date.now(),
    });
    router.replace(`/(tabs)/ferramentas/chat/${id}?primeiraMensagem=1`);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Pergunte qualquer coisa</Text>
          <Text style={styles.subtitulo}>Nova conversa</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.vazioContainer}>
          <View style={styles.vazioIcon}>
            <Ionicons name="sparkles" size={32} color="#4F46E5" />
          </View>
          <Text style={styles.vazioTitulo}>Como posso ajudar?</Text>
          <Text style={styles.vazioSub}>
            Pergunta qualquer coisa sobre os teus estudos
          </Text>

          <View style={styles.sugestoes}>
            {SUGESTOES.map((s, i) => (
              <TouchableOpacity
                key={i}
                style={styles.sugestaoCard}
                onPress={() => iniciarConversa(s)}
              >
                <Ionicons name="bulb-outline" size={16} color="#4F46E5" />
                <Text style={styles.sugestaoTexto}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Pergunta algo..."
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDesactivado]}
            onPress={() => iniciarConversa(input)}
            disabled={!input.trim()}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scrollContent: { flexGrow: 1, padding: 16 },
  vazioContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 8 },
  vazioIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  vazioTitulo: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  vazioSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  sugestoes: { gap: 8, width: '100%', paddingHorizontal: 8 },
  sugestaoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  sugestaoTexto: { flex: 1, fontSize: 14, color: '#374151' },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    padding: 12,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 6, paddingLeft: 14,
  },
  input: { flex: 1, fontSize: 15, color: '#111827', maxHeight: 100, paddingVertical: 8 },
  sendBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  sendBtnDesactivado: { backgroundColor: '#C7D2FE' },
});
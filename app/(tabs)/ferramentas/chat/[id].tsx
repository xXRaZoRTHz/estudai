import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '@stores/chatStore';

async function gerarRespostaMock(pergunta: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1200));
  return `Esta é uma resposta de exemplo à tua pergunta: "${pergunta}".\n\nQuando a integração com a IA estiver activa, vais receber uma resposta detalhada baseada no que perguntaste.`;
}

export default function ChatScreen() {
  const router = useRouter();
  const { id, primeiraMensagem } = useLocalSearchParams<{ id: string; primeiraMensagem?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const conversa = useChatStore(s => s.conversas.find(c => c.id === id));
  const adicionarMensagem = useChatStore(s => s.adicionarMensagem);

  // Se veio com primeiraMensagem=1, gera a resposta da IA automaticamente
  useEffect(() => {
    if (primeiraMensagem === '1' && conversa && conversa.mensagens.length === 1) {
      gerarResposta(conversa.mensagens[0].texto);
    }
  }, []);

  async function gerarResposta(textoUser: string) {
    if (!id) return;
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const resposta = await gerarRespostaMock(textoUser);
      adicionarMensagem(id, {
        id: (Date.now() + 1).toString(),
        autor: 'ia',
        texto: resposta,
        timestamp: Date.now(),
      });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error('Erro ao gerar resposta:', e);
    } finally {
      setLoading(false);
    }
  }

  async function enviarMensagem() {
    if (!input.trim() || loading || !id) return;
    const texto = input.trim();

    adicionarMensagem(id, {
      id: Date.now().toString(),
      autor: 'user',
      texto,
      timestamp: Date.now(),
    });
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    await gerarResposta(texto);
  }

  function formatarHora(timestamp: number) {
    const d = new Date(timestamp);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  if (!conversa) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Conversa não encontrada</Text>
      </View>
    );
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
          <Text style={styles.titulo} numberOfLines={1}>{conversa.titulo}</Text>
          <Text style={styles.subtitulo}>{conversa.mensagens.length} mensagens</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {conversa.mensagens.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.mensagemContainer,
              msg.autor === 'user' ? styles.mensagemUser : styles.mensagemIA,
            ]}
          >
            {msg.autor === 'ia' && (
              <View style={styles.iaAvatar}>
                <Ionicons name="sparkles" size={14} color="#4F46E5" />
              </View>
            )}
            <View
              style={[
                styles.bolhaMensagem,
                msg.autor === 'user' ? styles.bolhaUser : styles.bolhaIA,
              ]}
            >
              <Text
                style={[
                  styles.mensagemTexto,
                  msg.autor === 'user' ? styles.textoUser : styles.textoIA,
                ]}
              >
                {msg.texto}
              </Text>
              <Text
                style={[
                  styles.mensagemHora,
                  msg.autor === 'user' ? styles.horaUser : styles.horaIA,
                ]}
              >
                {formatarHora(msg.timestamp)}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.mensagemContainer, styles.mensagemIA]}>
            <View style={styles.iaAvatar}>
              <Ionicons name="sparkles" size={14} color="#4F46E5" />
            </View>
            <View style={[styles.bolhaMensagem, styles.bolhaIA, styles.bolhaLoading]}>
              <ActivityIndicator size="small" color="#4F46E5" />
              <Text style={styles.loadingTexto}>A pensar...</Text>
            </View>
          </View>
        )}
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
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDesactivado]}
            onPress={enviarMensagem}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// Reutiliza os styles que já tinhas — copia o StyleSheet do chat anterior
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
  scrollContent: { padding: 16, gap: 12, flexGrow: 1 },
  mensagemContainer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '85%' },
  mensagemUser: { alignSelf: 'flex-end' },
  mensagemIA: { alignSelf: 'flex-start' },
  iaAvatar: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  bolhaMensagem: { borderRadius: 16, padding: 12, paddingHorizontal: 14, flex: 1, minWidth: 60 },
  bolhaUser: { backgroundColor: '#4F46E5', borderBottomRightRadius: 4 },
  bolhaIA: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bolhaLoading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  loadingTexto: { fontSize: 13, color: '#6B7280' },
  mensagemTexto: { fontSize: 14, lineHeight: 20 },
  textoUser: { color: '#fff' },
  textoIA: { color: '#111827' },
  mensagemHora: { fontSize: 10, marginTop: 4 },
  horaUser: { color: '#C7D2FE', textAlign: 'right' },
  horaIA: { color: '#9CA3AF' },
  inputContainer: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB', padding: 12 },
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
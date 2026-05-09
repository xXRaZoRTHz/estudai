import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResumosStore } from '@stores/resumosStore';

type FonteInput = 'texto' | 'ficheiro' | 'camera';

// Mock — substituir pela chamada real ao Claude
async function gerarResumoMock(texto: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return `# Resumo

## Pontos principais
- Primeira ideia chave extraída do conteúdo
- Segunda ideia importante a destacar
- Terceira ideia que merece atenção

## Conceitos-chave
**Conceito 1** — Definição breve e clara do primeiro conceito.

**Conceito 2** — Definição breve e clara do segundo conceito.

## Conclusão
Síntese final do conteúdo apresentado, destacando a relevância dos pontos principais e ligando-os de forma coerente.`;
}

export default function ResumirScreen() {
  const router = useRouter();
  const [fonte, setFonte] = useState<FonteInput>('texto');
  const [texto, setTexto] = useState('');
  const [resumo, setResumo] = useState('');
  const [loading, setLoading] = useState(false);
  const criarResumo = useResumosStore(s => s.criarResumo);

  async function handleResumir() {
    if (!texto.trim() || loading) return;
    setLoading(true);
    setResumo('');
    try {
      const r = await gerarResumoMock(texto);
      setResumo(r);

      // Guarda no store
      const titulo = texto.trim().substring(0, 50) + (texto.length > 50 ? '...' : '');
      const id = criarResumo({
        titulo,
        textoOriginal: texto,
        resumo: r,
        fonte,
      });

      // Navega para o resumo
      router.replace(`/(tabs)/ferramentas/resumir/${id}`);
    } finally {
      setLoading(false);
    }
  }

  function handleNovo() {
    setTexto('');
    setResumo('');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Resumir</Text>
          <Text style={styles.subtitulo}>Cria resumos com IA</Text>
        </View>
        {resumo && (
          <TouchableOpacity onPress={handleNovo} style={styles.acaoBtn}>
            <Ionicons name="refresh-outline" size={18} color="#4F46E5" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!resumo && (
          <>
            {/* Selector de fonte */}
            <View style={styles.fonteContainer}>
              {([
                { id: 'texto',    label: 'Texto',     icon: 'text-outline' },
                { id: 'ficheiro', label: 'Ficheiro',  icon: 'document-outline' },
                { id: 'camera',   label: 'Câmara',    icon: 'camera-outline' },
              ] as const).map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={[styles.fonteBtn, fonte === f.id && styles.fonteBtnActivo]}
                  onPress={() => setFonte(f.id)}
                >
                  <Ionicons
                    name={f.icon}
                    size={18}
                    color={fonte === f.id ? '#4F46E5' : '#6B7280'}
                  />
                  <Text style={[styles.fonteTexto, fonte === f.id && styles.fonteTextoActivo]}>
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Input — texto */}
            {fonte === 'texto' && (
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Cola aqui o texto que queres resumir..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  value={texto}
                  onChangeText={setTexto}
                  textAlignVertical="top"
                />
                <Text style={styles.contagem}>{texto.length} caracteres</Text>
              </View>
            )}

            {/* Input — ficheiro */}
            {fonte === 'ficheiro' && (
              <TouchableOpacity style={styles.uploadCard}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="cloud-upload-outline" size={32} color="#4F46E5" />
                </View>
                <Text style={styles.uploadTitulo}>Carregar ficheiro</Text>
                <Text style={styles.uploadSub}>PDF, TXT ou DOCX (máx. 10 MB)</Text>
                <Text style={styles.uploadHint}>Em breve</Text>
              </TouchableOpacity>
            )}

            {/* Input — câmara */}
            {fonte === 'camera' && (
              <TouchableOpacity style={styles.uploadCard}>
                <View style={styles.uploadIcon}>
                  <Ionicons name="camera-outline" size={32} color="#4F46E5" />
                </View>
                <Text style={styles.uploadTitulo}>Tirar foto</Text>
                <Text style={styles.uploadSub}>Captura texto do papel ou ecrã</Text>
                <Text style={styles.uploadHint}>Em breve</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingTexto}>A gerar o resumo...</Text>
          </View>
        )}

        {/* Resumo */}
        {resumo && (
          <View style={styles.resumoCard}>
            <View style={styles.resumoHeader}>
              <Ionicons name="document-text" size={18} color="#0F6E56" />
              <Text style={styles.resumoTitulo}>Resumo gerado</Text>
            </View>
            <ResumoFormatado texto={resumo} />
          </View>
        )}
      </ScrollView>

      {/* Footer com botão */}
      {!resumo && fonte === 'texto' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.botao,
              (!texto.trim() || loading) && styles.botaoDesactivado,
            ]}
            onPress={handleResumir}
            disabled={!texto.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.botaoTexto}>Resumir</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

// Componente para formatar markdown simples
function ResumoFormatado({ texto }: { texto: string }) {
  const linhas = texto.split('\n');
  return (
    <View style={{ gap: 4 }}>
      {linhas.map((l, i) => {
        if (l.startsWith('# ')) {
          return <Text key={i} style={styles.h1}>{l.replace('# ', '')}</Text>;
        }
        if (l.startsWith('## ')) {
          return <Text key={i} style={styles.h2}>{l.replace('## ', '')}</Text>;
        }
        if (l.startsWith('- ')) {
          return (
            <View key={i} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.bulletTexto}>{l.replace('- ', '')}</Text>
            </View>
          );
        }
        if (l.startsWith('**') && l.includes('**')) {
          return <Text key={i} style={styles.paragrafo}>{l.replace(/\*\*/g, '')}</Text>;
        }
        if (l.trim() === '') return <View key={i} style={{ height: 6 }} />;
        return <Text key={i} style={styles.paragrafo}>{l}</Text>;
      })}
    </View>
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
  acaoBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scroll: { padding: 16, paddingBottom: 24, gap: 16 },

  fonteContainer: {
    flexDirection: 'row', gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12, padding: 4,
  },
  fonteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 8,
  },
  fonteBtnActivo: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  fonteTexto: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  fonteTextoActivo: { color: '#4F46E5' },

  inputContainer: { gap: 8 },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, fontSize: 15, color: '#111827',
    minHeight: 200,
  },
  contagem: { fontSize: 12, color: '#9CA3AF', textAlign: 'right' },

  uploadCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 32, alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
    borderStyle: 'dashed', gap: 8,
  },
  uploadIcon: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  uploadTitulo: { fontSize: 16, fontWeight: '600', color: '#111827' },
  uploadSub: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  uploadHint: {
    fontSize: 11, color: '#92520A',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6, marginTop: 8,
  },

  loadingContainer: {
    paddingVertical: 60, alignItems: 'center', gap: 12,
  },
  loadingTexto: { fontSize: 14, color: '#6B7280' },

  resumoCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: '#E5E7EB', gap: 12,
  },
  resumoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  resumoTitulo: { fontSize: 14, fontWeight: '600', color: '#0F6E56' },

  h1: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginVertical: 4 },
  h2: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 8, marginBottom: 4 },
  paragrafo: { fontSize: 14, color: '#374151', lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 10, paddingLeft: 4 },
  bullet: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#4F46E5', marginTop: 8,
  },
  bulletTexto: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 },

  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#4F46E5',
    borderRadius: 12, paddingVertical: 14,
  },
  botaoDesactivado: { backgroundColor: '#C7D2FE' },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
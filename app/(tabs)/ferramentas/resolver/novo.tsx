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
import { useResolucoesStore, PassoResolucao } from '@stores/resolucoesStore';

type Fonte = 'texto' | 'camera';

// Mock — substituir pela chamada real ao Claude
async function gerarResolucaoMock(questao: string): Promise<{ passos: PassoResolucao[]; respostaFinal: string }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return {
    passos: [
      { numero: 1, titulo: 'Compreender o enunciado', explicacao: 'Identifica os dados conhecidos e o que é pedido. Lê duas vezes para garantires que compreendeste.' },
      { numero: 2, titulo: 'Aplicar a fórmula', explicacao: 'Identifica a fórmula correcta a aplicar e substitui pelos valores conhecidos.' },
      { numero: 3, titulo: 'Calcular o resultado', explicacao: 'Efectua os cálculos com cuidado, mostrando cada operação.' },
      { numero: 4, titulo: 'Verificar a resposta', explicacao: 'Confirma que o resultado faz sentido no contexto do problema.' },
    ],
    respostaFinal: 'A resposta final é X = 42.',
  };
}

export default function NovaResolucaoScreen() {
  const router = useRouter();
  const criarResolucao = useResolucoesStore(s => s.criarResolucao);
  const [fonte, setFonte] = useState<Fonte>('texto');
  const [questao, setQuestao] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResolver() {
    if (!questao.trim() || loading) return;
    setLoading(true);
    try {
      const { passos, respostaFinal } = await gerarResolucaoMock(questao);
      const titulo = questao.trim().substring(0, 60) + (questao.length > 60 ? '...' : '');
      const id = criarResolucao({
        titulo,
        questao,
        passos,
        respostaFinal,
        fonte,
      });
      router.replace(`/(tabs)/ferramentas/resolver/${id}`);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.titulo}>Resolver questão</Text>
          <Text style={styles.subtitulo}>Resolução passo a passo</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Selector de fonte */}
        <View style={styles.fonteContainer}>
          {([
            { id: 'texto', label: 'Texto', icon: 'text-outline' },
            { id: 'camera', label: 'Câmara', icon: 'camera-outline' },
          ] as const).map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.fonteBtn, fonte === f.id && styles.fonteBtnActivo]}
              onPress={() => setFonte(f.id)}
            >
              <Ionicons name={f.icon} size={18} color={fonte === f.id ? '#534AB7' : '#6B7280'} />
              <Text style={[styles.fonteTexto, fonte === f.id && styles.fonteTextoActivo]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {fonte === 'texto' ? (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textArea}
              placeholder="Cola aqui a questão a resolver..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={questao}
              onChangeText={setQuestao}
              textAlignVertical="top"
            />
            <Text style={styles.contagem}>{questao.length} caracteres</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadCard}>
            <View style={styles.uploadIcon}>
              <Ionicons name="camera-outline" size={32} color="#534AB7" />
            </View>
            <Text style={styles.uploadTitulo}>Tirar foto da questão</Text>
            <Text style={styles.uploadSub}>Captura texto do papel ou ecrã</Text>
            <Text style={styles.uploadHint}>Em breve</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#534AB7" />
            <Text style={styles.loadingTexto}>A resolver a questão...</Text>
          </View>
        )}
      </ScrollView>

      {fonte === 'texto' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.botao, (!questao.trim() || loading) && styles.botaoDesactivado]}
            onPress={handleResolver}
            disabled={!questao.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="sparkles" size={18} color="#fff" />
                <Text style={styles.botaoTexto}>Resolver</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  fonteTextoActivo: { color: '#534AB7' },
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
    backgroundColor: '#EEEDFE',
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
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#534AB7',
    borderRadius: 12, paddingVertical: 14,
  },
  botaoDesactivado: { backgroundColor: '#C7C3E8' },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
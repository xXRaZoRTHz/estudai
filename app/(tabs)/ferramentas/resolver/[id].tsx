import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useResolucoesStore } from '@stores/resolucoesStore';

export default function VerResolucaoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resolucao = useResolucoesStore(s => s.resolucoes.find(r => r.id === id));

  async function handlePartilhar() {
    if (!resolucao) return;
    const passosTexto = resolucao.passos
      .map(p => `${p.numero}. ${p.titulo}\n${p.explicacao}`)
      .join('\n\n');
    try {
      await Share.share({
        message: `📝 Resolução - Estudai\n\n${resolucao.questao}\n\n${passosTexto}\n\n✅ ${resolucao.respostaFinal}`,
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (!resolucao) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Resolução não encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo} numberOfLines={1}>Resolução</Text>
          <Text style={styles.subtitulo}>
            {new Date(resolucao.criadoEm).toLocaleDateString('pt-PT')}
          </Text>
        </View>
        <TouchableOpacity onPress={handlePartilhar} style={styles.acaoBtn}>
          <Ionicons name="share-outline" size={18} color="#534AB7" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Questão */}
        <View style={styles.questaoCard}>
          <Text style={styles.questaoLabel}>Questão</Text>
          <Text style={styles.questaoTexto}>{resolucao.questao}</Text>
        </View>

        {/* Passos */}
        <Text style={styles.passosTitulo}>Resolução passo a passo</Text>
        {resolucao.passos.map((p) => (
          <View key={p.numero} style={styles.passoCard}>
            <View style={styles.passoHeader}>
              <View style={styles.passoNumero}>
                <Text style={styles.passoNumeroTexto}>{p.numero}</Text>
              </View>
              <Text style={styles.passoTitulo}>{p.titulo}</Text>
            </View>
            <Text style={styles.passoExplicacao}>{p.explicacao}</Text>
          </View>
        ))}

        {/* Resposta final */}
        <View style={styles.respostaCard}>
          <View style={styles.respostaHeader}>
            <Ionicons name="checkmark-circle" size={20} color="#16A34A" />
            <Text style={styles.respostaLabel}>Resposta final</Text>
          </View>
          <Text style={styles.respostaTexto}>{resolucao.respostaFinal}</Text>
        </View>
      </ScrollView>
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
    backgroundColor: '#EEEDFE',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  questaoCard: {
    backgroundColor: '#EEEDFE', borderRadius: 12,
    padding: 16, gap: 6,
    borderWidth: 1, borderColor: '#DDD6FE',
  },
  questaoLabel: {
    fontSize: 11, fontWeight: '600', color: '#534AB7',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  questaoTexto: { fontSize: 15, color: '#1F2937', lineHeight: 22 },
  passosTitulo: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 8,
  },
  passoCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  passoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  passoNumero: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#534AB7',
    alignItems: 'center', justifyContent: 'center',
  },
  passoNumeroTexto: { color: '#fff', fontWeight: '700', fontSize: 13 },
  passoTitulo: { flex: 1, fontSize: 14, fontWeight: '600', color: '#111827' },
  passoExplicacao: { fontSize: 14, color: '#374151', lineHeight: 21, paddingLeft: 38 },
  respostaCard: {
    backgroundColor: '#F0FDF4', borderRadius: 12,
    padding: 16, gap: 8, marginTop: 8,
    borderWidth: 1, borderColor: '#BBF7D0',
  },
  respostaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  respostaLabel: {
    fontSize: 13, fontWeight: '600', color: '#15803D',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  respostaTexto: { fontSize: 15, color: '#1F2937', lineHeight: 22, fontWeight: '500' },
});
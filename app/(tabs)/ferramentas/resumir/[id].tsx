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
import { useResumosStore } from '@stores/resumosStore';

export default function VerResumoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const resumo = useResumosStore(s => s.resumos.find(r => r.id === id));

  async function handlePartilhar() {
    if (!resumo) return;
    try {
      await Share.share({
        message: `📄 Resumo - Estudai\n\n${resumo.resumo}`,
      });
    } catch (e) {
      console.error(e);
    }
  }

  if (!resumo) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Resumo não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo} numberOfLines={1}>{resumo.titulo}</Text>
          <Text style={styles.subtitulo}>
            {new Date(resumo.criadoEm).toLocaleDateString('pt-PT')}
          </Text>
        </View>
        <TouchableOpacity onPress={handlePartilhar} style={styles.acaoBtn}>
          <Ionicons name="share-outline" size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.resumoCard}>
          <View style={styles.resumoHeader}>
            <Ionicons name="document-text" size={18} color="#0F6E56" />
            <Text style={styles.resumoTituloCard}>Resumo</Text>
          </View>
          <ResumoFormatado texto={resumo.resumo} />
        </View>

        {/* Texto original */}
        <View style={styles.originalCard}>
          <Text style={styles.originalTitulo}>Texto original</Text>
          <Text style={styles.originalTexto} numberOfLines={6}>{resumo.textoOriginal}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ResumoFormatado({ texto }: { texto: string }) {
  const linhas = texto.split('\n');
  return (
    <View style={{ gap: 4 }}>
      {linhas.map((l, i) => {
        if (l.startsWith('# ')) return <Text key={i} style={styles.h1}>{l.replace('# ', '')}</Text>;
        if (l.startsWith('## ')) return <Text key={i} style={styles.h2}>{l.replace('## ', '')}</Text>;
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
  scroll: { padding: 16, gap: 16 },
  resumoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 12,
  },
  resumoHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  resumoTituloCard: { fontSize: 14, fontWeight: '600', color: '#0F6E56' },
  h1: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginVertical: 4 },
  h2: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginTop: 8, marginBottom: 4 },
  paragrafo: { fontSize: 14, color: '#374151', lineHeight: 22 },
  bulletRow: { flexDirection: 'row', gap: 10, paddingLeft: 4 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#0F6E56', marginTop: 8 },
  bulletTexto: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 22 },
  originalCard: {
    backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, gap: 6,
  },
  originalTitulo: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  originalTexto: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
});
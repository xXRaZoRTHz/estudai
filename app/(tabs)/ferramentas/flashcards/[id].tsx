import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFlashcardsStore } from '@stores/flashcardsStore';

export default function VerBaralhoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const baralho = useFlashcardsStore(s => s.baralhos.find(b => b.id === id));
  const apagarCard = useFlashcardsStore(s => s.apagarCard);

  if (!baralho) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Baralho não encontrado</Text>
      </View>
    );
  }

  const cardsParaRever = baralho.cards.filter(c => c.proximaRevisao <= Date.now());

  function handleApagarCard(cardId: string) {
    Alert.alert('Apagar card?', 'Esta acção não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarCard(baralho!.id, cardId) },
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo} numberOfLines={1}>{baralho.titulo}</Text>
          <Text style={styles.subtitulo}>{baralho.cards.length} cards</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {baralho.descricao && (
          <Text style={styles.descricao}>{baralho.descricao}</Text>
        )}

        {/* Card de revisão */}
        <View style={styles.revisaoCard}>
          <View style={styles.revisaoIcon}>
            <Ionicons name="time-outline" size={22} color="#fff" />
          </View>
          <View style={styles.revisaoTexto}>
            <Text style={styles.revisaoTitulo}>
              {cardsParaRever.length > 0
                ? `${cardsParaRever.length} cards para rever`
                : 'Tudo em dia!'}
            </Text>
            <Text style={styles.revisaoSub}>
              {cardsParaRever.length > 0
                ? 'Começa a sessão agora'
                : 'Volta mais tarde para a próxima revisão'}
            </Text>
          </View>
          {cardsParaRever.length > 0 && (
            <TouchableOpacity
              style={styles.revisaoBtn}
              onPress={() => router.push(`/(tabs)/ferramentas/flashcards/sessao?baralhoId=${baralho.id}`)}
            >
              <Ionicons name="play" size={18} color="#92520A" />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de cards */}
        <Text style={styles.listaTitulo}>Todos os cards</Text>
        {baralho.cards.map((c, i) => (
          <View key={c.id} style={styles.cardItem}>
            <View style={styles.cardItemHeader}>
              <Text style={styles.cardNumero}>Card {i + 1}</Text>
              <TouchableOpacity onPress={() => handleApagarCard(c.id)}>
                <Ionicons name="trash-outline" size={14} color="#DC2626" />
              </TouchableOpacity>
            </View>
            <Text style={styles.cardFrente}>{c.frente}</Text>
            <View style={styles.divisor} />
            <Text style={styles.cardVerso}>{c.verso}</Text>
            {c.revisoes > 0 && (
              <Text style={styles.cardEstats}>
                Revisto {c.revisoes}x · próxima em {Math.ceil((c.proximaRevisao - Date.now()) / 86400000)} dias
              </Text>
            )}
          </View>
        ))}
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
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scroll: { padding: 16, gap: 12 },
  descricao: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  revisaoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#92520A', borderRadius: 16, padding: 16,
  },
  revisaoIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  revisaoTexto: { flex: 1 },
  revisaoTitulo: { fontSize: 15, fontWeight: '700', color: '#fff' },
  revisaoSub: { fontSize: 12, color: '#FEF3C7', marginTop: 2 },
  revisaoBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  listaTitulo: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 8, marginBottom: 4,
  },
  cardItem: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14, gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardItemHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardNumero: { fontSize: 11, fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase' },
  cardFrente: { fontSize: 15, fontWeight: '500', color: '#111827', lineHeight: 20 },
  divisor: { height: 1, backgroundColor: '#F3F4F6' },
  cardVerso: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  cardEstats: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
});
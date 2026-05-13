import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Ferramenta {
  id: string;
  titulo: string;
  descricao: string;
  icone: keyof typeof Ionicons.glyphMap;
  cor: string;
  bg: string;
  rota: string;
}

const FERRAMENTAS: Ferramenta[] = [
  {
    id: 'chat',
    titulo: 'Pergunte qualquer coisa',
    descricao: 'Tira dúvidas livres sobre qualquer assunto',
    icone: 'chatbubbles-outline',
    cor: '#185FA5',
    bg: '#EBF4FF',
    rota: '/(tabs)/ferramentas/chat',
  },
  {
    id: 'resumir',
    titulo: 'Resumir',
    descricao: 'Cria resumos estruturados de qualquer conteúdo',
    icone: 'document-text-outline',
    cor: '#0F6E56',
    bg: '#E1F5EE',
    rota: '/(tabs)/ferramentas/resumir',
  },
  {
    id: 'resolver',
    titulo: 'Resolver questões',
    descricao: 'Resolução passo a passo de exercícios',
    icone: 'checkmark-done-outline',
    cor: '#534AB7',
    bg: '#EEEDFE',
    rota: '/(tabs)/ferramentas/resolver',
  },
  {
    id: 'flashcards',
    titulo: 'Flashcards',
    descricao: 'Cria e revê com repetição espaçada',
    icone: 'albums-outline',
    cor: '#92520A',
    bg: '#FEF3C7',
    rota: '/(tabs)/ferramentas/flashcards',
  },
  {
    id: 'cronograma',
    titulo: 'Cronograma de estudos',
    descricao: 'Planeia a tua rotina de estudo personalizada',
    icone: 'calendar-outline',
    cor: '#991B1B',
    bg: '#FEE2E2',
    rota: '/(tabs)/ferramentas/cronograma',
  },
];

export default function FerramentasScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Ferramentas</Text>
        <Text style={styles.subtitulo}>Recursos de IA para o teu estudo</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {FERRAMENTAS.map((f) => (
          <TouchableOpacity
            key={f.id}
            style={styles.card}
            onPress={() => router.push(f.rota as any)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { backgroundColor: f.bg }]}>
              <Ionicons name={f.icone} size={26} color={f.cor} />
            </View>
            <View style={styles.cardTexto}>
              <Text style={styles.cardTitulo}>{f.titulo}</Text>
              <Text style={styles.cardDescricao}>{f.descricao}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

        {/* Card "em breve" para extensibilidade futura */}
        <View style={styles.cardEmBreve}>
          <View style={[styles.iconContainer, { backgroundColor: '#F3F4F6' }]}>
            <Ionicons name="add-outline" size={26} color="#9CA3AF" />
          </View>
          <View style={styles.cardTexto}>
            <Text style={styles.cardTituloEmBreve}>Mais ferramentas em breve</Text>
            <Text style={styles.cardDescricao}>Novas funcionalidades a caminho</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardEmBreve: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginTop: 8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTexto: {
    flex: 1,
    gap: 2,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cardTituloEmBreve: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  cardDescricao: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
});
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
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFlashcardsStore } from '@stores/flashcardsStore';

type Modo = 'manual' | 'ia';

interface CardTemp {
  frente: string;
  verso: string;
}

// Mock — substituir pela chamada real ao Claude
async function gerarFlashcardsMock(assunto: string, quantidade: number): Promise<CardTemp[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  return Array.from({ length: quantidade }, (_, i) => ({
    frente: `Pergunta ${i + 1} sobre ${assunto}?`,
    verso: `Resposta ${i + 1} sobre ${assunto}.`,
  }));
}

export default function NovoBaralhoScreen() {
  const router = useRouter();
  const criarBaralho = useFlashcardsStore(s => s.criarBaralho);

  const [modo, setModo] = useState<Modo>('manual');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [cards, setCards] = useState<CardTemp[]>([{ frente: '', verso: '' }]);
  const [assuntoIA, setAssuntoIA] = useState('');
  const [quantidadeIA, setQuantidadeIA] = useState(10);
  const [loading, setLoading] = useState(false);

  function actualizarCard(i: number, campo: keyof CardTemp, valor: string) {
    setCards(prev => prev.map((c, idx) => idx === i ? { ...c, [campo]: valor } : c));
  }

  function adicionarCard() {
    setCards(prev => [...prev, { frente: '', verso: '' }]);
  }

  function removerCard(i: number) {
    setCards(prev => prev.filter((_, idx) => idx !== i));
  }

  async function handleCriar() {
    if (!titulo.trim()) {
      Alert.alert('Falta o título', 'Dá um nome ao teu baralho.');
      return;
    }

    let cardsFinais: CardTemp[] = [];

    if (modo === 'manual') {
      cardsFinais = cards.filter(c => c.frente.trim() && c.verso.trim());
      if (cardsFinais.length === 0) {
        Alert.alert('Sem cards', 'Adiciona pelo menos um card com frente e verso preenchidos.');
        return;
      }
    } else {
      if (!assuntoIA.trim()) {
        Alert.alert('Falta o assunto', 'Indica sobre o que queres os flashcards.');
        return;
      }
      setLoading(true);
      try {
        cardsFinais = await gerarFlashcardsMock(assuntoIA, quantidadeIA);
      } finally {
        setLoading(false);
      }
    }

    const id = criarBaralho({
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      origem: modo,
      cards: cardsFinais,
    });

    router.replace(`/(tabs)/ferramentas/flashcards/${id}`);
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
          <Text style={styles.titulo}>Novo baralho</Text>
          <Text style={styles.subtitulo}>Cria os teus flashcards</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Selector de modo */}
        <View style={styles.modoContainer}>
          {([
            { id: 'manual', label: 'Manual', icon: 'create-outline' },
            { id: 'ia',     label: 'Gerar com IA', icon: 'sparkles-outline' },
          ] as const).map((m) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modoBtn, modo === m.id && styles.modoBtnActivo]}
              onPress={() => setModo(m.id)}
            >
              <Ionicons name={m.icon} size={18} color={modo === m.id ? '#92520A' : '#6B7280'} />
              <Text style={[styles.modoTexto, modo === m.id && styles.modoTextoActivo]}>
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info do baralho */}
        <View style={styles.secao}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Vocabulário Inglês"
            placeholderTextColor="#9CA3AF"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={60}
          />

          <Text style={styles.label}>Descrição</Text>
          <TextInput
            style={styles.input}
            placeholder="Opcional"
            placeholderTextColor="#9CA3AF"
            value={descricao}
            onChangeText={setDescricao}
            maxLength={120}
          />
        </View>

        {/* Modo manual */}
        {modo === 'manual' && (
          <View style={styles.secao}>
            <View style={styles.cardsHeader}>
              <Text style={styles.label}>Cards ({cards.length})</Text>
            </View>

            {cards.map((c, i) => (
              <View key={i} style={styles.cardItem}>
                <View style={styles.cardItemHeader}>
                  <Text style={styles.cardNumero}>Card {i + 1}</Text>
                  {cards.length > 1 && (
                    <TouchableOpacity onPress={() => removerCard(i)}>
                      <Ionicons name="trash-outline" size={16} color="#DC2626" />
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Frente (pergunta)"
                  placeholderTextColor="#9CA3AF"
                  value={c.frente}
                  onChangeText={(v) => actualizarCard(i, 'frente', v)}
                  multiline
                />
                <TextInput
                  style={styles.input}
                  placeholder="Verso (resposta)"
                  placeholderTextColor="#9CA3AF"
                  value={c.verso}
                  onChangeText={(v) => actualizarCard(i, 'verso', v)}
                  multiline
                />
              </View>
            ))}
            <TouchableOpacity style={styles.addCardBtn} onPress={adicionarCard}>
            <Ionicons name="add" size={18} color="#92520A" />
            <Text style={styles.addCardTexto}>Adicionar card</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Modo IA */}
        {modo === 'ia' && (
          <View style={styles.secao}>
            <Text style={styles.label}>Assunto *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Capitais europeias, Tabela periódica..."
              placeholderTextColor="#9CA3AF"
              value={assuntoIA}
              onChangeText={setAssuntoIA}
            />

            <Text style={styles.label}>Quantidade de cards</Text>
            <View style={styles.quantidadeRow}>
              {[5, 10, 15, 20].map(q => (
                <TouchableOpacity
                  key={q}
                  style={[styles.quantidadeBtn, quantidadeIA === q && styles.quantidadeBtnActivo]}
                  onPress={() => setQuantidadeIA(q)}
                >
                  <Text style={[styles.quantidadeTexto, quantidadeIA === q && styles.quantidadeTextoActivo]}>
                    {q}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.botao, loading && styles.botaoDesactivado]}
          onPress={handleCriar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={modo === 'ia' ? 'sparkles' : 'checkmark'} size={18} color="#fff" />
              <Text style={styles.botaoTexto}>
                {modo === 'ia' ? 'Gerar baralho' : 'Criar baralho'}
              </Text>
            </>
          )}
        </TouchableOpacity>
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
  scroll: { padding: 16, paddingBottom: 24, gap: 16 },
  modoContainer: {
    flexDirection: 'row', gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12, padding: 4,
  },
  modoBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: 8,
  },
  modoBtnActivo: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  modoTexto: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  modoTextoActivo: { color: '#92520A' },
  secao: { gap: 8 },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginTop: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 12, fontSize: 14, color: '#111827',
  },
  cardsHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  addLink: { fontSize: 13, color: '#92520A', fontWeight: '600' },
  cardItem: {
    backgroundColor: '#FEF3C7', borderRadius: 12,
    padding: 12, gap: 8,
    borderWidth: 1, borderColor: '#FDE68A',
  },
  cardItemHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cardNumero: { fontSize: 12, fontWeight: '600', color: '#92520A', textTransform: 'uppercase' },
  quantidadeRow: { flexDirection: 'row', gap: 8 },
  quantidadeBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  quantidadeBtnActivo: {
    backgroundColor: '#92520A',
    borderColor: '#92520A',
  },
  quantidadeTexto: { fontSize: 14, fontWeight: '500', color: '#6B7280' },
  quantidadeTextoActivo: { color: '#fff' },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#92520A',
    borderRadius: 12, paddingVertical: 14,
  },
  botaoDesactivado: { backgroundColor: '#D6B98A' },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
    },
    addCardTexto: { fontSize: 13, fontWeight: '600', color: '#92520A' },
});
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Alternativa = { texto: string; correta: boolean };
type TipoPergunta = 'multipla' | 'vf' | 'aberta';

interface Pergunta {
  id: number;
  texto: string;
  tipo: TipoPergunta;
  dificuldade: 'fácil' | 'médio' | 'difícil' | 'expert';
  alternativas: Alternativa[];
  explicacao: string;
}

// Cores por dificuldade
const CORES_DIFICULDADE = {
  'fácil':   '#16A34A',
  'médio':   '#D97706',
  'difícil': '#DC2626',
  'expert':  '#7C3AED',
};

// Mock de perguntas — substituir pela chamada real ao Claude
function gerarPerguntasMock(quantidade: number, tipos: TipoPergunta[], numAlts: number): Pergunta[] {
  const letras = ['A', 'B', 'C', 'D', 'E'];
  const dificuldades = ['fácil', 'médio', 'difícil', 'expert'] as const;
  return Array.from({ length: quantidade }, (_, i) => {
    const tipo = tipos[i % tipos.length];
    return {
      id: i + 1,
      texto: `Pergunta ${i + 1}: Esta é uma pergunta de exemplo sobre o assunto escolhido?`,
      tipo,
      dificuldade: dificuldades[i % dificuldades.length],
      alternativas: tipo === 'vf'
        ? [
            { texto: 'Verdadeiro', correta: true },
            { texto: 'Falso', correta: false },
          ]
        : Array.from({ length: numAlts }, (_, j) => ({
            texto: `Alternativa ${letras[j]} — ${j === 0 ? 'resposta correta' : 'resposta errada'}`,
            correta: j === 0,
          })),
      explicacao: `Esta é a explicação detalhada da pergunta ${i + 1}.`,
    };
  });
}

export default function PerguntasScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    quantidade?: string;
    tipos?: string;
    modo?: string;
    mostrarNivel?: string;
    cronometroPorPergunta?: string;
    cronometroTotal?: string;
    assunto?: string;
    area?: string;
    numAlternativas?: string;
    topicos?: string;
  }>();

  const quantidade = parseInt(params.quantidade ?? '10');
  const tipos: TipoPergunta[] = params.tipos ? JSON.parse(params.tipos) : ['multipla'];
  const modo = params.modo ?? 'imediato';
  const mostrarNivel = params.mostrarNivel === '1';
  const cronometroPorPergunta = parseInt(params.cronometroPorPergunta ?? '0');
  const cronometroTotal = parseInt(params.cronometroTotal ?? '0');
  const numAlternativas = parseInt(params.numAlternativas ?? '4');
  const [perguntas] = useState<Pergunta[]>(() => gerarPerguntasMock(quantidade, tipos, numAlternativas));
  const [indiceActual, setIndiceActual] = useState(0);
  const [respostas, setRespostas] = useState<Record<number, number | string | null>>({});
  const [respostasAbertas, setRespostasAbertas] = useState<Record<number, string>>({});
  const [mostrarExplicacao, setMostrarExplicacao] = useState<Record<number, boolean>>({});
  const [perguntasChat, setPerguntasChat] = useState<Record<number, string>>({});
  const [vistaLista, setVistaLista] = useState(false);
  const [tempoPergunta, setTempoPergunta] = useState(cronometroPorPergunta);
  const [tempoTotal, setTempoTotal] = useState(cronometroTotal);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const perguntaActual = perguntas[indiceActual];
  const totalRespondidas = Object.keys(respostas).length;
  const progresso = totalRespondidas / quantidade;

  // Cronómetro por pergunta
  useEffect(() => {
    if (cronometroPorPergunta <= 0) return;
    setTempoPergunta(cronometroPorPergunta);
    timerRef.current = setInterval(() => {
      setTempoPergunta(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleRespostaSemResposta();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [indiceActual]);

  // Cronómetro total
  useEffect(() => {
    if (cronometroTotal <= 0) return;
    const timer = setInterval(() => {
      setTempoTotal(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTerminar();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleRespostaSemResposta() {
    setRespostas(prev => ({ ...prev, [indiceActual]: null }));
    if (indiceActual < quantidade - 1) {
      setIndiceActual(prev => prev + 1);
    }
  }

  function handleResponder(indiceAlternativa: number, indicePergunta: number) {
    if (respostas[indicePergunta] !== undefined) return;
    setRespostas(prev => ({ ...prev, [indicePergunta]: indiceAlternativa }));
    if (modo === 'imediato') {
      setMostrarExplicacao(prev => ({ ...prev, [indicePergunta]: true }));
    }
  }

  function handleResponderAberta(indicePergunta: number) {
    if (respostas[indicePergunta] !== undefined) return;
    const texto = respostasAbertas[indicePergunta] ?? '';
    setRespostas(prev => ({ ...prev, [indicePergunta]: texto }));
    if (modo === 'imediato') {
      setMostrarExplicacao(prev => ({ ...prev, [indicePergunta]: true }));
    }
  }

  function handleProxima() {
    if (indiceActual < quantidade - 1) {
      setIndiceActual(prev => prev + 1);
    } else {
      handleTerminar();
    }
  }

  function handleAnterior() {
    if (indiceActual > 0) setIndiceActual(prev => prev - 1);
  }

  function handleTerminar() {
    const acertos = perguntas.filter((p, i) =>
      respostas[i] === p.alternativas.findIndex(a => a.correta)
    ).length;
  
    const emBranco = perguntas.filter((_, i) => 
        respostas[i] === null || respostas[i] === undefined
      ).length;
  
      router.replace({
        pathname: '/(tabs)/quiz/resultado',
        params: {
          acertos: String(acertos),
          total: String(quantidade),
          emBranco: String(emBranco),
          assunto: params.assunto ?? '',
          area: params.area ?? '',
          topicos: params.topicos ?? '[]',
          perguntas: JSON.stringify(perguntas),
          respostas: JSON.stringify(respostas),
        },
      });
    }

  function formatarTempo(segundos: number) {
    const m = Math.floor(segundos / 60);
    const s = segundos % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function getCorAlternativa(pergunta: Pergunta, indice: number, indicePergunta: number) {
    const respostaUser = respostas[indicePergunta];
    const correcta = pergunta.alternativas.findIndex(a => a.correta);

    if (respostaUser === undefined) return styles.alternativa;

    // No modo simulado não mostra cores de certo/errado
    if (modo === 'simulado') {
      return indice === respostaUser
        ? [styles.alternativa, styles.alternativaSelecionada]
        : styles.alternativa;
    }

    if (indice === correcta) return [styles.alternativa, styles.alternativaCorrecta];
    if (indice === respostaUser) return [styles.alternativa, styles.alternativaErrada];
    return [styles.alternativa, styles.alternativaDesactivada];
  }

  const renderPergunta = (pergunta: Pergunta, indice: number) => {
    const respondida = respostas[indice] !== undefined;
    const explicacaoVisivel = mostrarExplicacao[indice];
    

    return (
      <View key={pergunta.id} style={vistaLista ? styles.cardLista : styles.cardUnica}>

        {/* Número com cor de dificuldade */}
        <View style={styles.perguntaHeader}>
          <View style={[
            styles.numeroBadge,
            mostrarNivel && { backgroundColor: CORES_DIFICULDADE[pergunta.dificuldade] }
          ]}>
            <Text style={styles.numeroTexto}>{pergunta.id}</Text>
          </View>
          <Text style={styles.perguntaLabel}>Questão {pergunta.id}</Text>
        </View>

        {/* Texto da pergunta */}
        <Text style={styles.perguntaTexto}>{pergunta.texto}</Text>

        {/* Alternativas */}
        {pergunta.tipo === 'aberta' ? (
          <View style={styles.abertaContainer}>
            <TextInput
              style={styles.abertaInput}
              placeholder="Escreve a tua resposta aqui..."
              placeholderTextColor="#9CA3AF"
              multiline
              value={respostasAbertas[indice] ?? ''}
              onChangeText={(v) => setRespostasAbertas(prev => ({ ...prev, [indice]: v }))}
              editable={!respondida}
            />
            {!respondida && (
              <TouchableOpacity
                style={styles.abertaBtn}
                onPress={() => handleResponderAberta(indice)}
              >
                <Text style={styles.abertaBtnTexto}>Confirmar resposta</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.alternativas}>
            {pergunta.alternativas.map((alt, i) => (
              <TouchableOpacity
                key={i}
                style={getCorAlternativa(pergunta, i, indice)}
                onPress={() => handleResponder(i, indice)}
                disabled={respondida}
              >
                <View style={styles.alternativaLetraContainer}>
                  <Text style={styles.alternativaLetra}>
                    {pergunta.tipo === 'vf' ? (i === 0 ? 'V' : 'F') : String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={styles.alternativaTexto}>{alt.texto}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Explicação (modo imediato) */}
        {explicacaoVisivel && modo === 'imediato' && (
          <View style={styles.explicacaoContainer}>
            <Text style={styles.explicacaoTitulo}>💡 Explicação</Text>
            <Text style={styles.explicacaoTexto}>{pergunta.explicacao}</Text>

            {/* Chat sobre a questão */}
            <View style={styles.chatContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Tens dúvidas sobre esta questão?"
                placeholderTextColor="#9CA3AF"
                value={perguntasChat[indice] ?? ''}
                onChangeText={(v) => setPerguntasChat(prev => ({ ...prev, [indice]: v }))}
              />
              <TouchableOpacity
                style={[styles.chatBtn, !perguntasChat[indice]?.trim() && styles.chatBtnDesactivado]}
                disabled={!perguntasChat[indice]?.trim()}
              >
                <Ionicons name="send" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => Alert.alert('Sair do quiz?', 'O teu progresso será perdido.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: () => router.back() },
          ])}
        >
          <Ionicons name="close" size={22} color="#374151" />
        </TouchableOpacity>

        <View style={styles.progressoContainer}>
          <View style={styles.progressoBarra}>
            <View style={[styles.progressoFill, { width: `${progresso * 100}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>{totalRespondidas}/{quantidade}</Text>
        </View>

        {/* Cronómetros */}
        <View style={styles.timers}>
          {cronometroPorPergunta > 0 && !vistaLista && (
            <View style={[styles.timerBadge, tempoPergunta <= 10 && styles.timerBadgeUrgente]}>
              <Ionicons name="hourglass-outline" size={12} color={tempoPergunta <= 10 ? '#DC2626' : '#6B7280'} />
              <Text style={[styles.timerTexto, tempoPergunta <= 10 && styles.timerTextoUrgente]}>
                {formatarTempo(tempoPergunta)}
              </Text>
            </View>
          )}
          {cronometroTotal > 0 && (
            <View style={[styles.timerBadge, tempoTotal <= 60 && styles.timerBadgeUrgente]}>
              <Ionicons name="time-outline" size={12} color={tempoTotal <= 60 ? '#DC2626' : '#6B7280'} />
              <Text style={[styles.timerTexto, tempoTotal <= 60 && styles.timerTextoUrgente]}>
                {formatarTempo(tempoTotal)}
              </Text>
            </View>
          )}
        </View>

        {/* Toggle lista/única */}
        <TouchableOpacity
          style={styles.vistaBtn}
          onPress={() => setVistaLista(!vistaLista)}
        >
          <Ionicons name={vistaLista ? 'reader-outline' : 'list-outline'} size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Conteúdo */}
      {vistaLista ? (
        <ScrollView contentContainerStyle={styles.listaScroll}>
          {perguntas.map((p, i) => renderPergunta(p, i))}
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.unicaScroll}>
          {renderPergunta(perguntaActual, indiceActual)}
        </ScrollView>
      )}

      {/* Footer — navegação */}
      {!vistaLista && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.navBtn, indiceActual === 0 && styles.navBtnDesactivado]}
            onPress={handleAnterior}
            disabled={indiceActual === 0}
          >
            <Ionicons name="arrow-back" size={20} color={indiceActual === 0 ? '#D1D5DB' : '#374151'} />
          </TouchableOpacity>

          <Text style={styles.navTexto}>{indiceActual + 1} / {quantidade}</Text>

          {indiceActual === quantidade - 1 ? (
            <TouchableOpacity style={styles.terminarBtn} onPress={handleTerminar}>
              <Text style={styles.terminarTexto}>Terminar</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.navBtn} onPress={handleProxima}>
              <Ionicons name="arrow-forward" size={20} color="#374151" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Botão terminar na vista lista */}
      {vistaLista && (
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.terminarBtn, { flex: 1 }]} onPress={handleTerminar}>
            <Text style={styles.terminarTexto}>Terminar Quiz</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  progressoContainer: { flex: 1, gap: 4 },
  progressoBarra: {
    height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden',
  },
  progressoFill: { height: '100%', backgroundColor: '#4F46E5', borderRadius: 3 },
  progressoTexto: { fontSize: 11, color: '#9CA3AF', textAlign: 'right' },
  timers: { flexDirection: 'row', gap: 6 },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F3F4F6', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  timerBadgeUrgente: { backgroundColor: '#FEE2E2' },
  timerTexto: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  timerTextoUrgente: { color: '#DC2626' },
  vistaBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  unicaScroll: { padding: 16, paddingBottom: 32 },
  listaScroll: { padding: 16, paddingBottom: 32, gap: 16 },
  cardUnica: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardLista: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 20, borderWidth: 1, borderColor: '#E5E7EB',
  },
  perguntaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14,
  },
  numeroBadge: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  numeroTexto: { fontSize: 13, fontWeight: '700', color: '#fff' },
  dificuldadeLabel: { fontSize: 12, fontWeight: '500' },
  tipoLabel: {
    fontSize: 11, color: '#9CA3AF',
    backgroundColor: '#F3F4F6', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  perguntaTexto: {
    fontSize: 16, color: '#111827', lineHeight: 24, marginBottom: 16,
  },
  alternativas: { gap: 8 },
  alternativa: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F9FAFB', borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: '#E5E7EB',
  },
  alternativaCorrecta: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  alternativaErrada: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  alternativaDesactivada: { opacity: 0.5 },
  alternativaLetraContainer: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  alternativaLetra: { fontSize: 13, fontWeight: '700', color: '#374151' },
  alternativaTexto: { flex: 1, fontSize: 14, color: '#374151' },
  abertaContainer: { gap: 10 },
  abertaInput: {
    backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, fontSize: 15, color: '#111827',
    minHeight: 100, textAlignVertical: 'top',
  },
  abertaBtn: {
    backgroundColor: '#4F46E5', borderRadius: 10,
    paddingVertical: 12, alignItems: 'center',
  },
  abertaBtnTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },
  explicacaoContainer: {
    marginTop: 16, backgroundColor: '#F5F3FF',
    borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#DDD6FE', gap: 8,
  },
  explicacaoTitulo: { fontSize: 14, fontWeight: '600', color: '#5B21B6' },
  explicacaoTexto: { fontSize: 14, color: '#374151', lineHeight: 22 },
  chatContainer: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginTop: 4,
  },
  chatInput: {
    flex: 1, backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#DDD6FE',
    paddingHorizontal: 12, paddingVertical: 8,
    fontSize: 13, color: '#111827',
  },
  chatBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  chatBtnDesactivado: { backgroundColor: '#C7D2FE' },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB', gap: 12,
  },
  navBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  navBtnDesactivado: { opacity: 0.4 },
  navTexto: { fontSize: 15, fontWeight: '500', color: '#374151' },
  terminarBtn: {
    backgroundColor: '#4F46E5', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 24,
    alignItems: 'center',
  },
  terminarTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
  timerInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 12,
  },
  timerInlineUrgente: {
    backgroundColor: '#FEE2E2',
  },
  timerInlineTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  perguntaLabel: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  alternativaSelecionada: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
});
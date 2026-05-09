import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Share } from 'react-native';


export default function ResultadoScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    acertos?: string;
    total?: string;
    emBranco?: string;
    assunto?: string;
    area?: string;
    topicos?: string;
    perguntas?: string;
    respostas?: string;
  }>();
  
  const acertos = parseInt(params.acertos ?? '0');
  const total = parseInt(params.total ?? '0');
  const emBranco = parseInt(params.emBranco ?? '0');
  const erros = total - acertos - emBranco;
  const percentagem = total > 0 ? Math.round((acertos / total) * 100) : 0;
  
  const perguntas = params.perguntas ? JSON.parse(params.perguntas) : [];
  const respostas = params.respostas ? JSON.parse(params.respostas) : {};
  const topicos: string[] = params.topicos ? JSON.parse(params.topicos) : [];
  
  // Filtro activo: 'todas' | 'acertos' | 'erros' | 'branco' | null
  const [filtro, setFiltro] = useState<'acertos' | 'erros' | 'branco' | null>(null);
  const [vendoQuiz, setVendoQuiz] = useState(true);
  
  // Mensagem motivacional baseada na percentagem
  const getMensagem = () => {
    if (percentagem >= 90) return { titulo: 'Excelente!', emoji: '🎉', cor: '#16A34A', sub: 'Domínio impecável do tema.' };
    if (percentagem >= 70) return { titulo: 'Muito bem!', emoji: '👏', cor: '#16A34A', sub: 'Estás no caminho certo.' };
    if (percentagem >= 50) return { titulo: 'Bom esforço!', emoji: '💪', cor: '#D97706', sub: 'Continua a praticar.' };
    if (percentagem >= 30) return { titulo: 'Continua!', emoji: '📚', cor: '#D97706', sub: 'A prática leva à perfeição.' };
    return { titulo: 'Não desistas!', emoji: '🌱', cor: '#DC2626', sub: 'Revisa o conteúdo e tenta novamente.' };
  };

  const msg = getMensagem();
  
  async function handlePartilhar() {
    try {
      await Share.share({
        message: `🎯 Acabei o meu quiz no Estudai!\n\n📚 ${params.assunto} — ${params.area}\n✅ ${acertos}/${total} acertos (${percentagem}%)\n\nExperimenta tu também!`,
      });
    } catch (e) {
      console.error('Erro ao partilhar:', e);
    }
  }
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Topo */}
        <View style={styles.topo}>
          <Text style={styles.emoji}>{msg.emoji}</Text>
          <Text style={[styles.titulo, { color: msg.cor }]}>{msg.titulo}</Text>
          <Text style={styles.sub}>{msg.sub}</Text>
        </View>

        {/* Card percentagem */}
        <View style={styles.percCard}>
          <Text style={styles.percNum}>{percentagem}<Text style={styles.percSimbolo}>%</Text></Text>
          <Text style={styles.percLabel}>de acertos</Text>
          <View style={styles.barra}>
            <View style={[styles.barraFill, { width: `${percentagem}%`, backgroundColor: msg.cor }]} />
          </View>
        </View>

        {/* Estatísticas */}
        <View style={styles.estatisticas}>
          <TouchableOpacity
            style={[styles.estatCard, filtro === 'acertos' && styles.estatCardActivo]}
            onPress={() => { setFiltro('acertos'); setVendoQuiz(true); }}
          >
            <View style={[styles.estatIcon, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
            </View>
            <Text style={styles.estatNum}>{acertos}</Text>
            <Text style={styles.estatLabel}>Acertos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.estatCard, filtro === 'erros' && styles.estatCardActivo]}
            onPress={() => { setFiltro('erros'); setVendoQuiz(true); }}
          >
            <View style={[styles.estatIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="close-circle" size={22} color="#DC2626" />
            </View>
            <Text style={styles.estatNum}>{erros}</Text>
            <Text style={styles.estatLabel}>Erros</Text>
          </TouchableOpacity>

          {emBranco > 0 && (
            <TouchableOpacity
              style={[styles.estatCard, filtro === 'branco' && styles.estatCardActivo]}
              onPress={() => { setFiltro('branco'); setVendoQuiz(true); }}
            >
              <View style={[styles.estatIcon, { backgroundColor: '#FFFBEB' }]}>
                <Ionicons name="help-circle-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.estatNum}>{emBranco}</Text>
              <Text style={styles.estatLabel}>Em branco</Text>
            </TouchableOpacity>
          )}
          {total > 0 && (
            <TouchableOpacity
              style={[styles.estatCard, filtro === null && vendoQuiz && styles.estatCardActivo]}
              onPress={() => { setFiltro(null); setVendoQuiz(true); }}
            >
              <View style={[styles.estatIcon, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="help-circle" size={22} color="#4F46E5" />
              </View>
              <Text style={styles.estatNum}>{total}</Text>
              <Text style={styles.estatLabel}>Total</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Vista do quiz com filtro */}
        {vendoQuiz && (
          <View style={styles.quizCompleto}>
            <View style={styles.quizCompletoHeader}>
              <Text style={styles.quizCompletoTitulo}>
                {filtro === 'acertos' && '✅ Acertos'}
                {filtro === 'erros' && '❌ Erros'}
                {filtro === 'branco' && '⚠️ Em branco'}
                {filtro === null && '📋 Todas as perguntas'}
              </Text>
              <TouchableOpacity onPress={() => setVendoQuiz(false)}>
                <Ionicons name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {perguntas
              .filter((p: any, i: number) => {
                const correctaIndex = p.alternativas.findIndex((a: any) => a.correta);
                const respostaUser = respostas[i];
                if (filtro === 'acertos') return respostaUser === correctaIndex;
                if (filtro === 'erros') return respostaUser !== undefined && respostaUser !== null && respostaUser !== correctaIndex;
                if (filtro === 'branco') return respostaUser === null || respostaUser === undefined;
                return true;
              })
              .map((p: any, idx: number) => {
                const indiceOriginal = perguntas.indexOf(p);
                const correctaIndex = p.alternativas.findIndex((a: any) => a.correta);
                const respostaUser = respostas[indiceOriginal];
                const semResposta = respostaUser === null || respostaUser === undefined;
                const acertou = respostaUser === correctaIndex;

                return (
                  <View key={p.id} style={styles.revisaoCard}>
                    <View style={styles.revisaoHeader}>
                      <View style={[
                        styles.revisaoBadge,
                        { backgroundColor: semResposta ? '#FFFBEB' : acertou ? '#F0FDF4' : '#FEF2F2' }
                      ]}>
                        <Ionicons
                          name={semResposta ? 'help-circle' : acertou ? 'checkmark-circle' : 'close-circle'}
                          size={16}
                          color={semResposta ? '#D97706' : acertou ? '#16A34A' : '#DC2626'}
                        />
                        <Text style={[styles.revisaoBadgeTexto, {
                          color: semResposta ? '#D97706' : acertou ? '#16A34A' : '#DC2626'
                        }]}>
                          Questão {p.id}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.revisaoPergunta}>{p.texto}</Text>

                    {p.alternativas.map((alt: any, i: number) => (
                      <View key={i} style={[
                        styles.revisaoAlt,
                        i === correctaIndex && styles.revisaoAltCorrecta,
                        !semResposta && i === respostaUser && i !== correctaIndex && styles.revisaoAltErrada,
                      ]}>
                        <Text style={styles.revisaoAltLetra}>{String.fromCharCode(65 + i)}</Text>
                        <Text style={styles.revisaoAltTexto}>{alt.texto}</Text>
                        {i === correctaIndex && <Ionicons name="checkmark" size={16} color="#16A34A" />}
                        {!semResposta && i === respostaUser && i !== correctaIndex && (
                          <Ionicons name="close" size={16} color="#DC2626" />
                        )}
                      </View>
                    ))}

                    <View style={styles.revisaoExplicacao}>
                      <Text style={styles.revisaoExplicacaoTitulo}>💡 Explicação</Text>
                      <Text style={styles.revisaoExplicacaoTexto}>{p.explicacao}</Text>
                    </View>
                  </View>
                );
              })}
          </View>
        )}

        {/* Detalhes do quiz */}
        {params.assunto && (
          <View style={styles.detalhesCard}>
            <Text style={styles.detalhesTitulo}>Detalhes do Quiz</Text>
            <View style={styles.detalheRow}>
              <Ionicons name="library-outline" size={16} color="#6B7280" />
              <Text style={styles.detalheLabel}>Área:</Text>
              <Text style={styles.detalheValor}>{params.area}</Text>
            </View>
            <View style={styles.detalheRow}>
              <Ionicons name="bookmark-outline" size={16} color="#6B7280" />
              <Text style={styles.detalheLabel}>Assunto:</Text>
              <Text style={styles.detalheValor}>{params.assunto}</Text>
            </View>
            {topicos.length > 0 && (
              <View style={[styles.detalheRow, { alignItems: 'flex-start' }]}>
                <Ionicons name="list-outline" size={16} color="#6B7280" style={{ marginTop: 2 }} />
                <Text style={styles.detalheLabel}>Tópicos:</Text>
                <Text style={[styles.detalheValor, { flex: 1 }]}>{topicos.join(', ')}</Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>

      {/* Acções */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.botaoIcon} onPress={handlePartilhar}>
          <Ionicons name="share-outline" size={20} color="#4F46E5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoSecundario}
          onPress={() => router.replace('/(tabs)/quiz')}
        >
          <Ionicons name="refresh-outline" size={18} color="#4F46E5" />
          <Text style={styles.botaoSecundarioTexto}>Novo quiz</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoPrimario}
          onPress={() => router.replace('/(tabs)/estudar')}
        >
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={styles.botaoPrimarioTexto}>Início</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { padding: 20, paddingTop: 60, paddingBottom: 24, gap: 20 },
  topo: { alignItems: 'center', paddingVertical: 16 },
  emoji: { fontSize: 56, marginBottom: 8 },
  titulo: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  percCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
  },
  percNum: { fontSize: 56, fontWeight: 'bold', color: '#111827' },
  percSimbolo: { fontSize: 24, color: '#9CA3AF' },
  percLabel: { fontSize: 13, color: '#6B7280', marginTop: -6, marginBottom: 16 },
  barra: {
    width: '100%', height: 8, backgroundColor: '#F3F4F6',
    borderRadius: 4, overflow: 'hidden',
  },
  barraFill: { height: '100%', borderRadius: 4 },
  estatisticas: { flexDirection: 'row', gap: 10 },
  estatCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 16,
    padding: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', gap: 6,
  },
  estatIcon: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  estatNum: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  estatLabel: { fontSize: 12, color: '#6B7280' },
  detalhesCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 10,
  },
  detalhesTitulo: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  detalheRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detalheLabel: { fontSize: 13, color: '#6B7280' },
  detalheValor: { fontSize: 13, fontWeight: '500', color: '#111827', flex: 1 },
  footer: {
    flexDirection: 'row', gap: 10, padding: 20,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  botaoSecundario: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#EEF2FF', borderRadius: 12, paddingVertical: 14,
  },
  botaoSecundarioTexto: { color: '#4F46E5', fontWeight: '600', fontSize: 14 },
  botaoPrimario: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#4F46E5', borderRadius: 12, paddingVertical: 14,
  },
  botaoPrimarioTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },
    estatCardActivo: {
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  consultarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  consultarTexto: { flex: 1, fontSize: 14, fontWeight: '500', color: '#4F46E5' },
  quizCompleto: { gap: 12 },
  quizCompletoHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 8,
  },
  quizCompletoTitulo: { fontSize: 16, fontWeight: '600', color: '#111827' },
  revisaoCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 10,
  },
  revisaoHeader: { flexDirection: 'row' },
  revisaoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  revisaoBadgeTexto: { fontSize: 12, fontWeight: '600' },
  revisaoPergunta: { fontSize: 15, color: '#111827', lineHeight: 22 },
  revisaoAlt: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#F9FAFB', borderRadius: 10,
    padding: 12, borderWidth: 1, borderColor: '#E5E7EB',
  },
  revisaoAltCorrecta: { backgroundColor: '#F0FDF4', borderColor: '#16A34A' },
  revisaoAltErrada: { backgroundColor: '#FEF2F2', borderColor: '#DC2626' },
  revisaoAltLetra: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    width: 22, textAlign: 'center',
  },
  revisaoAltTexto: { flex: 1, fontSize: 13, color: '#374151' },
  revisaoExplicacao: {
    backgroundColor: '#F5F3FF', borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: '#DDD6FE', gap: 4, marginTop: 4,
  },
  revisaoExplicacaoTitulo: { fontSize: 12, fontWeight: '600', color: '#5B21B6' },
  revisaoExplicacaoTexto: { fontSize: 13, color: '#374151', lineHeight: 19 },
  botaoIcon: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#C7D2FE',
  },
});
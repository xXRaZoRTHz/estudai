import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useStatsStore } from '@stores/statsStore';
import { useChatStore } from '@stores/chatStore';
import { useResumosStore } from '@stores/resumosStore';
import { useResolucoesStore } from '@stores/resolucoesStore';
import { useFlashcardsStore } from '@stores/flashcardsStore';
import { useCronogramaStore } from '@stores/cronogramaStore';
import {
  Periodo, PERIODOS, Metrica,
  filtrarEventos, calcularResumo,
  getActividadePorPeriodo, getDistribuicaoDificuldade, getPorMateria,
} from '@services/estatisticas';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - 32;

const chartConfig = {
  backgroundGradientFrom: '#fff',
  backgroundGradientTo: '#fff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
  style: { borderRadius: 12 },
  propsForDots: {
    r: '4',
    strokeWidth: '2',
    stroke: '#4F46E5',
  },
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: '#F3F4F6',
  },
};

export default function EstatisticasScreen() {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>('1m');
  const [metrica, setMetrica] = useState<Metrica>('perguntas');

  const eventos = useStatsStore(s => s.eventos);
  const eventosPeriodo = filtrarEventos(eventos, periodo);
  const resumo = calcularResumo(eventosPeriodo);
  const actividade = getActividadePorPeriodo(eventosPeriodo, periodo, metrica);
  const distribuicao = getDistribuicaoDificuldade(eventosPeriodo);
  const porMateria = getPorMateria(eventosPeriodo);

  // Métricas das ferramentas (calculadas dos stores)
  const numChats = useChatStore(s => s.conversas.length);
  const numResumos = useResumosStore(s => s.resumos.length);
  const numResolucoes = useResolucoesStore(s => s.resolucoes.length);
  const totalRevisoes = useFlashcardsStore(s =>
    s.baralhos.reduce((acc, b) =>
        acc + b.cards.reduce((cAcc, c) => cAcc + c.revisoes, 0), 0
    )
  );
  const numCronogramas = useCronogramaStore(s => s.cronogramas.length);

  const temDados = eventosPeriodo.length > 0;
  const METRICAS = [
    { id: 'perguntas' as Metrica, label: 'Perguntas', valor: resumo.perguntasTotais,   cor: '#4F46E5', bg: '#EEF2FF', icon: 'help-circle' },
    { id: 'acertos'   as Metrica, label: 'Acertos',   valor: resumo.perguntasAcertadas, cor: '#16A34A', bg: '#DCFCE7', icon: 'checkmark-circle' },
    { id: 'erros'     as Metrica, label: 'Erros',     valor: resumo.perguntasErradas,   cor: '#DC2626', bg: '#FEE2E2', icon: 'close-circle' },
    { id: 'branco'    as Metrica, label: 'Em branco', valor: resumo.perguntasEmBranco,  cor: '#D97706', bg: '#FEF3C7', icon: 'help-circle-outline' },
    ];

    const metricaActiva = METRICAS.find(m => m.id === metrica)!;

    function hexToRgb(hex: string): string {
    const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return r ? `${parseInt(r[1], 16)}, ${parseInt(r[2], 16)}, ${parseInt(r[3], 16)}` : '79, 70, 229';
    }

    const dynamicChartConfig = {
    ...chartConfig,
    color: (opacity = 1) => `rgba(${hexToRgb(metricaActiva.cor)}, ${opacity})`,
    propsForDots: { r: '4', strokeWidth: '2', stroke: metricaActiva.cor },
    };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Estatísticas</Text>
          <Text style={styles.subtitulo}>O teu progresso</Text>
        </View>
      </View>

      {/* Filtros de período */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
      >
        {PERIODOS.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.filtroBtn, periodo === p.id && styles.filtroBtnActivo]}
            onPress={() => setPeriodo(p.id)}
          >
            <Text style={[styles.filtroTexto, periodo === p.id && styles.filtroTextoActivo]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cards clicáveis - mudam o gráfico */}
        <View style={styles.metricasGrid}>
        {METRICAS.map(m => (
            <TouchableOpacity
            key={m.id}
            style={[
                styles.metricaCard,
                { backgroundColor: m.bg },
                metrica === m.id && { borderColor: m.cor },
            ]}
            onPress={() => setMetrica(m.id)}
            activeOpacity={0.7}
            >
            <Ionicons name={m.icon as any} size={20} color={m.cor} />
            <Text style={styles.metricaNum}>{m.valor}</Text>
            <Text style={styles.metricaLabel}>{m.label}</Text>
            </TouchableOpacity>
        ))}
        </View>

        {/* Info adicional */}
        <View style={styles.infoGrid}>
        <View style={styles.infoCard}>
            <Ionicons name="time" size={18} color="#92520A" />
            <Text style={styles.infoNum}>{resumo.horasEstudo.toFixed(1)}h</Text>
            <Text style={styles.infoLabel}>Tempo de estudo</Text>
        </View>
        <View style={styles.infoCard}>
            <Ionicons name="calendar" size={18} color="#7C3AED" />
            <Text style={styles.infoNum}>{resumo.diasActivos}</Text>
            <Text style={styles.infoLabel}>Dias activos</Text>
        </View>
        </View>

        {!temDados ? (
          <View style={styles.vazio}>
            <Ionicons name="stats-chart-outline" size={48} color="#9CA3AF" />
            <Text style={styles.vazioTitulo}>Sem dados no período</Text>
            <Text style={styles.vazioSub}>
              Responde a perguntas e completa quizzes para veres o teu progresso aqui
            </Text>
          </View>
        ) : (
          <>
            {/* Gráfico de actividade */}
            <View style={styles.graficoCard}>
              <Text style={styles.graficoTitulo}>{metricaActiva.label}</Text>
              <Text style={styles.graficoSub}>Actividade ao longo do tempo</Text>
              <LineChart
                data={{
                  labels: actividade.map(p => p.label),
                  datasets: [{ data: actividade.map(p => p.valor) }],
                }}
                width={CHART_WIDTH - 32}
                height={180}
                chartConfig={dynamicChartConfig}
                bezier
                style={styles.grafico}
                withInnerLines
                withOuterLines={false}
              />
            </View>

            {/* Distribuição por dificuldade */}
            {distribuicao.length > 0 && (
              <View style={styles.graficoCard}>
                <Text style={styles.graficoTitulo}>Distribuição por dificuldade</Text>
                <PieChart
                  data={distribuicao.map(d => ({
                    name: d.dificuldade,
                    population: d.valor,
                    color: d.cor,
                    legendFontColor: '#374151',
                    legendFontSize: 12,
                  }))}
                  width={CHART_WIDTH - 32}
                  height={180}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            )}

            {/* Por matéria */}
            {porMateria.length > 0 && (
              <View style={styles.graficoCard}>
                <Text style={styles.graficoTitulo}>Desempenho por matéria</Text>
                {porMateria.map(m => {
                  const total = m.acertos + m.erros + m.branco;
                  const percAcertos = total > 0 ? (m.acertos / total) * 100 : 0;
                  const percErros = total > 0 ? (m.erros / total) * 100 : 0;
                  const percBranco = total > 0 ? (m.branco / total) * 100 : 0;

                  return (
                    <View key={m.area} style={styles.materiaRow}>
                      <View style={styles.materiaHeader}>
                        <Text style={styles.materiaNome}>{m.area}</Text>
                        <Text style={styles.materiaTotal}>{total} perguntas</Text>
                      </View>
                      <View style={styles.materiaBarra}>
                        {percAcertos > 0 && (
                          <View style={[styles.barraSegmento, { width: `${percAcertos}%`, backgroundColor: '#16A34A' }]} />
                        )}
                        {percErros > 0 && (
                          <View style={[styles.barraSegmento, { width: `${percErros}%`, backgroundColor: '#DC2626' }]} />
                        )}
                        {percBranco > 0 && (
                          <View style={[styles.barraSegmento, { width: `${percBranco}%`, backgroundColor: '#D97706' }]} />
                        )}
                      </View>
                      <View style={styles.materiaLegenda}>
                        <Text style={[styles.legendaTexto, { color: '#16A34A' }]}>{m.acertos} acertos</Text>
                        <Text style={[styles.legendaTexto, { color: '#DC2626' }]}>{m.erros} erros</Text>
                        {m.branco > 0 && (
                          <Text style={[styles.legendaTexto, { color: '#D97706' }]}>{m.branco} em branco</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}

        {/* Métricas das ferramentas (sempre visíveis) */}
        <View style={styles.graficoCard}>
          <Text style={styles.graficoTitulo}>Uso das ferramentas</Text>
          <Text style={styles.graficoSub}>Lifetime</Text>

          <View style={styles.ferramentasGrid}>
            <View style={styles.ferramentaItem}>
              <View style={[styles.ferramentaIcon, { backgroundColor: '#EBF4FF' }]}>
                <Ionicons name="chatbubbles-outline" size={18} color="#185FA5" />
              </View>
              <Text style={styles.ferramentaNum}>{numChats}</Text>
              <Text style={styles.ferramentaLabel}>Conversas</Text>
            </View>

            <View style={styles.ferramentaItem}>
              <View style={[styles.ferramentaIcon, { backgroundColor: '#E1F5EE' }]}>
                <Ionicons name="document-text-outline" size={18} color="#0F6E56" />
              </View>
              <Text style={styles.ferramentaNum}>{numResumos}</Text>
              <Text style={styles.ferramentaLabel}>Resumos</Text>
            </View>

            <View style={styles.ferramentaItem}>
              <View style={[styles.ferramentaIcon, { backgroundColor: '#EEEDFE' }]}>
                <Ionicons name="checkmark-done-outline" size={18} color="#534AB7" />
              </View>
              <Text style={styles.ferramentaNum}>{numResolucoes}</Text>
              <Text style={styles.ferramentaLabel}>Resoluções</Text>
            </View>

            <View style={styles.ferramentaItem}>
                <View style={[styles.ferramentaIcon, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="albums-outline" size={18} color="#92520A" />
                </View>
                <Text style={styles.ferramentaNum}>{totalRevisoes}</Text>
                <Text style={styles.ferramentaLabel}>Flashcards vistos</Text>
            </View>

            <View style={styles.ferramentaItem}>
              <View style={[styles.ferramentaIcon, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="calendar-outline" size={18} color="#991B1B" />
              </View>
              <Text style={styles.ferramentaNum}>{numCronogramas}</Text>
              <Text style={styles.ferramentaLabel}>Cronogramas</Text>
            </View>
          </View>
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
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  filtros: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 16,paddingTop: 5,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 999,
    borderWidth: 1, borderColor: '#E5E7EB',
    height: 34,
  },
  filtroBtnActivo: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filtroTexto: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filtroTextoActivo: { color: '#fff' },

  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  vazio: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 32, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  vazioTitulo: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 8 },
  vazioSub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 16 },

  graficoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 4,
  },
  graficoTitulo: { fontSize: 14, fontWeight: '700', color: '#111827' },
  graficoSub: { fontSize: 12, color: '#6B7280', marginBottom: 12 },
  grafico: { marginVertical: 4, borderRadius: 12, marginLeft: -10 },

  materiaRow: { gap: 6, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  materiaHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  materiaNome: { fontSize: 13, fontWeight: '600', color: '#111827' },
  materiaTotal: { fontSize: 12, color: '#6B7280' },
  materiaBarra: {
    flexDirection: 'row', height: 8,
    backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden',
  },
  barraSegmento: { height: '100%' },
  materiaLegenda: { flexDirection: 'row', gap: 12 },
  legendaTexto: { fontSize: 11, fontWeight: '500' },

  ferramentasGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    marginTop: 8,
  },
  ferramentaItem: {
    width: '30.5%', alignItems: 'center', gap: 4,
    backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12,
  },
  ferramentaIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  ferramentaNum: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  ferramentaLabel: { fontSize: 11, color: '#6B7280' },
  ferramentaSubLabel: { fontSize: 10, color: '#9CA3AF' },
  metricasGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    metricaCard: {
        width: '48%', padding: 14, borderRadius: 12, gap: 4,
        borderWidth: 2, borderColor: 'transparent',
    },
    metricaNum: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginTop: 4 },
    metricaLabel: { fontSize: 12, color: '#6B7280' },

    infoGrid: { flexDirection: 'row', gap: 8 },
    infoCard: {
        flex: 1, padding: 12, borderRadius: 12, gap: 2,
        backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
        alignItems: 'flex-start',
    },
    infoNum: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginTop: 4 },
    infoLabel: { fontSize: 11, color: '#6B7280' },
});
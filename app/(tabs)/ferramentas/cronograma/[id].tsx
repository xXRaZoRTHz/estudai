import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCronogramaStore, SessaoEstudo } from '@stores/cronogramaStore';
import { useLocalSearchParams } from 'expo-router';

const DIAS_NOMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function PlanoScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const cronograma = useCronogramaStore(s => s.cronogramas.find(c => c.id === id));
  const toggleSessao = useCronogramaStore(s => s.toggleSessaoConcluida);
  const apagarCronograma = useCronogramaStore(s => s.apagarCronograma);

  const hoje = new Date().getDay();
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);

  if (!cronograma) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Nenhum cronograma encontrado</Text>
      </View>
    );
  }

  function handleRefazer() {
    Alert.alert(
      'Refazer cronograma?',
      'O plano actual será substituído por um novo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Refazer',
          style: 'destructive',
          onPress: () => {
            apagarCronograma(cronograma!.id);
            router.replace('/(tabs)/ferramentas/cronograma/onboarding');
          },
        },
      ]
    );
  }

  // Estatísticas
  const totalSessoes = cronograma.sessoes.length;
  const concluidas = cronograma.sessoes.filter(s => s.concluida).length;
  const percentagem = totalSessoes > 0 ? Math.round((concluidas / totalSessoes) * 100) : 0;

  const sessoesDoDia = cronograma.sessoes.filter(s => s.diaSemana === diaSelecionado);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>O teu plano</Text>
          <Text style={styles.subtitulo}>{cronograma.prazo}</Text>
        </View>
        <TouchableOpacity onPress={handleRefazer} style={styles.acaoBtn}>
          <Ionicons name="refresh-outline" size={18} color="#991B1B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Card de objectivo */}
        <View style={styles.objectivoCard}>
          <Text style={styles.objectivoLabel}>🎯 Objectivo</Text>
          <Text style={styles.objectivoTexto}>{cronograma.objectivo}</Text>
        </View>

        {/* Progresso geral */}
        <View style={styles.progressoCard}>
          <View style={styles.progressoHeader}>
            <Text style={styles.progressoTitulo}>Progresso geral</Text>
            <Text style={styles.progressoPerc}>{percentagem}%</Text>
          </View>
          <View style={styles.progressoBarra}>
            <View style={[styles.progressoFill, { width: `${percentagem}%` }]} />
          </View>
          <Text style={styles.progressoSub}>
            {concluidas} de {totalSessoes} sessões concluídas
          </Text>
        </View>

        {/* Selector de dias */}
        <View style={styles.diasContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DIAS_CURTOS.map((nome, i) => {
              const temSessoes = cronograma.sessoes.some(s => s.diaSemana === i);
              const isHoje = i === hoje;
              const activo = i === diaSelecionado;
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.diaBtn,
                    activo && styles.diaBtnActivo,
                    !temSessoes && styles.diaBtnSemSessoes,
                  ]}
                  onPress={() => setDiaSelecionado(i)}
                >
                  <Text style={[styles.diaLabel, activo && styles.diaLabelActivo]}>
                    {nome}
                  </Text>
                  {isHoje && <View style={styles.diaHojeIndicador} />}
                  {temSessoes && !activo && (
                    <View style={styles.diaSessaoDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Sessões do dia */}
        <View style={styles.sessoesContainer}>
          <Text style={styles.sessoesTitulo}>
            {DIAS_NOMES[diaSelecionado]}
            {diaSelecionado === hoje && <Text style={styles.sessoesHoje}> · Hoje</Text>}
          </Text>

          {sessoesDoDia.length === 0 ? (
            <View style={styles.vazioCard}>
              <Ionicons name="cafe-outline" size={32} color="#9CA3AF" />
              <Text style={styles.vazioTitulo}>Dia de descanso</Text>
              <Text style={styles.vazioSub}>Sem sessões programadas</Text>
            </View>
          ) : (
            sessoesDoDia
              .sort((a, b) => a.hora.localeCompare(b.hora))
              .map(s => (
                <SessaoCard
                  key={s.id}
                  sessao={s}
                  onToggle={() => toggleSessao(cronograma.id, s.id)}
                />
              ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function SessaoCard({ sessao, onToggle }: { sessao: SessaoEstudo; onToggle: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.sessaoCard, sessao.concluida && styles.sessaoCardConcluida]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={[styles.checkbox, sessao.concluida && styles.checkboxConcluido]}>
        {sessao.concluida && <Ionicons name="checkmark" size={14} color="#fff" />}
      </View>

      <View style={styles.sessaoTexto}>
        <View style={styles.sessaoHeader}>
          <Text style={styles.sessaoHora}>{sessao.hora}</Text>
          <Text style={styles.sessaoDuracao}>· {sessao.duracao} min</Text>
        </View>
        <Text
          style={[styles.sessaoArea, sessao.concluida && styles.sessaoTextoRiscado]}
          numberOfLines={1}
        >
          {sessao.area}
        </Text>
        <Text
          style={[styles.sessaoTopico, sessao.concluida && styles.sessaoTextoRiscado]}
          numberOfLines={2}
        >
          {sessao.topico}
        </Text>
      </View>
    </TouchableOpacity>
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
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  scroll: { padding: 16, gap: 16, paddingBottom: 24 },

  objectivoCard: {
    backgroundColor: '#FEE2E2', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#FECACA',
  },
  objectivoLabel: {
    fontSize: 11, fontWeight: '700', color: '#991B1B',
    textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4,
  },
  objectivoTexto: { fontSize: 14, color: '#7F1D1D', lineHeight: 20 },

  progressoCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB', gap: 8,
  },
  progressoHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  progressoTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  progressoPerc: { fontSize: 18, fontWeight: 'bold', color: '#991B1B' },
  progressoBarra: {
    height: 8, backgroundColor: '#F3F4F6',
    borderRadius: 4, overflow: 'hidden',
  },
  progressoFill: { height: '100%', backgroundColor: '#991B1B', borderRadius: 4 },
  progressoSub: { fontSize: 12, color: '#6B7280' },

  diasContainer: { marginHorizontal: -16, paddingHorizontal: 16 },
  diaBtn: {
    width: 56, paddingVertical: 12,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', position: 'relative',
  },
  diaBtnActivo: { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  diaBtnSemSessoes: { opacity: 0.5 },
  diaLabel: { fontSize: 13, fontWeight: '600', color: '#374151' },
  diaLabelActivo: { color: '#fff' },
  diaHojeIndicador: {
    position: 'absolute', top: 4, right: 4,
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  diaSessaoDot: {
    position: 'absolute', bottom: 4,
    width: 4, height: 4, borderRadius: 2,
    backgroundColor: '#991B1B',
  },

  sessoesContainer: { gap: 8 },
  sessoesTitulo: { fontSize: 14, fontWeight: '600', color: '#111827', marginBottom: 4 },
  sessoesHoje: { color: '#16A34A', fontWeight: '700' },

  vazioCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 24,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', gap: 6,
  },
  vazioTitulo: { fontSize: 15, fontWeight: '600', color: '#111827', marginTop: 8 },
  vazioSub: { fontSize: 13, color: '#9CA3AF' },

  sessaoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  sessaoCardConcluida: { backgroundColor: '#F9FAFB', opacity: 0.7 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 1.5, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
    marginTop: 2,
  },
  checkboxConcluido: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  sessaoTexto: { flex: 1, gap: 2 },
  sessaoHeader: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sessaoHora: { fontSize: 14, fontWeight: '700', color: '#991B1B' },
  sessaoDuracao: { fontSize: 12, color: '#9CA3AF' },
  sessaoArea: { fontSize: 14, fontWeight: '600', color: '#111827' },
  sessaoTopico: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  sessaoTextoRiscado: { textDecorationLine: 'line-through', color: '#9CA3AF' },
});
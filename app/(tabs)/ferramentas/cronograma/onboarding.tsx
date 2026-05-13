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
import { useCronogramaStore, SessaoEstudo } from '@stores/cronogramaStore';

const AREAS = [
  'Matemática', 'Física', 'Química', 'Biologia',
  'História', 'Geografia', 'Português', 'Inglês',
  'Filosofia', 'Informática', 'Direito', 'Economia',
];

const DIAS = [
  { id: 1, label: 'Seg' },
  { id: 2, label: 'Ter' },
  { id: 3, label: 'Qua' },
  { id: 4, label: 'Qui' },
  { id: 5, label: 'Sex' },
  { id: 6, label: 'Sáb' },
  { id: 0, label: 'Dom' },
];

const PRAZOS = ['1 mês', '3 meses', '6 meses', '1 ano'];

// Mock — substituir pela chamada real ao Claude
async function gerarPlanoMock(
  areas: string[],
  dias: number[],
  horasPorDia: number
): Promise<SessaoEstudo[]> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  const horas = ['08:00', '10:00', '14:00', '16:00', '20:00'];
  const sessoes: SessaoEstudo[] = [];
  let id = 0;

  dias.forEach(dia => {
    const numSessoes = Math.max(1, Math.floor(horasPorDia / 1));
    for (let i = 0; i < numSessoes; i++) {
      const area = areas[id % areas.length];
      sessoes.push({
        id: `s-${id++}`,
        diaSemana: dia,
        hora: horas[i] ?? '20:00',
        duracao: 60,
        area,
        topico: `Tópico de ${area}`,
        concluida: false,
      });
    }
  });

  return sessoes;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const criarCronograma = useCronogramaStore(s => s.criarCronograma);

  const [rotinaDiaria, setRotinaDiaria] = useState('');
  const [passo, setPasso] = useState(0);
  const [objectivo, setObjectivo] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [dias, setDias] = useState<number[]>([1, 2, 3, 4, 5]);
  const [duracaoNum, setDuracaoNum] = useState(2);
  const [unidade, setUnidade] = useState<'horas' | 'minutos'>('horas');
  const [customDuracao, setCustomDuracao] = useState('');
  const [modoCustomDuracao, setModoCustomDuracao] = useState(false);
  const [prazo, setPrazo] = useState('3 meses');
  const [loading, setLoading] = useState(false);
  const [filtroAreas, setFiltroAreas] = useState('');
  const [modoCustomPrazo, setModoCustomPrazo] = useState(false);
  const [customPrazoNum, setCustomPrazoNum] = useState('');
  const [customPrazoUnidade, setCustomPrazoUnidade] = useState<'dias' | 'meses' | 'anos'>('meses');

  const totalPassos = 6;

  function toggleArea(a: string) {
    setAreas(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  function toggleDia(d: number) {
    setDias(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  }

  function podeAvancar() {
    if (passo === 0) return objectivo.trim().length > 0;
    if (passo === 1) return rotinaDiaria.trim().length > 0;
    if (passo === 2) return areas.length > 0;
    if (passo === 3) return dias.length > 0;
    if (passo === 4) return getHorasFinais() > 0;
    if (passo === 5) {
    if (modoCustomPrazo) return parseInt(customPrazoNum) > 0;
    return prazo.length > 0;
}
    return false;
  }

  async function avancar() {
    if (passo < totalPassos - 1) {
      setPasso(prev => prev + 1);
      return;
    }
    // Gerar plano
    setLoading(true);
    try {
      const sessoes = await gerarPlanoMock(areas, dias, getHorasFinais());
      const id = criarCronograma({
        titulo: objectivo.substring(0, 50) + (objectivo.length > 50 ? '...' : ''),
        objectivo,
        rotinaDiaria,
        areas,
        diasDisponiveis: dias,
        horasPorDia: getHorasFinais(),
        prazo: modoCustomPrazo ? `${customPrazoNum} ${customPrazoUnidade}` : prazo,
        sessoes,
      });
    router.replace(`/(tabs)/ferramentas/cronograma/${id}`);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar o plano.');
    } finally {
      setLoading(false);
    }
  }

  function voltar() {
    if (passo === 0) {
      router.back();
    } else {
      setPasso(prev => prev - 1);
    }
  }
  function getHorasFinais() {
    const valor = modoCustomDuracao ? parseInt(customDuracao) || 0 : duracaoNum;
    return unidade === 'horas' ? valor : valor / 60;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={voltar} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.progressoContainer}>
          <View style={styles.progressoBarra}>
            <View style={[styles.progressoFill, { width: `${((passo + 1) / totalPassos) * 100}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>{passo + 1} de {totalPassos}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Passo 0 — Objectivo */}
        {passo === 0 && (
          <View style={styles.passoContainer}>
            <Text style={styles.passoEmoji}>🎯</Text>
            <Text style={styles.passoTitulo}>Qual é o teu objectivo?</Text>
            <Text style={styles.passoSub}>Define o que queres alcançar</Text>
            <TextInput
              style={styles.inputGrande}
              placeholder="Ex: Passar no exame nacional, aprender inglês..."
              placeholderTextColor="#9CA3AF"
              value={objectivo}
              onChangeText={setObjectivo}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}
        {/* Passo 1 — Rotina */}
        {passo === 1 && (
          <View style={styles.passoContainer}>
            <Text style={styles.passoEmoji}>🌅</Text>
            <Text style={styles.passoTitulo}>Como é a tua rotina diária?</Text>
            <Text style={styles.passoSub}>Conta-me o teu dia-a-dia para encaixar bem os horários de estudo</Text>
            <TextInput
              style={[styles.inputGrande, { minHeight: 160 }]}
              placeholder="Ex: Acordo às 7h, vou à escola das 8h às 14h, almoço na escola, regresso às 15h. Janto às 19h30 e deito-me às 23h..."
              placeholderTextColor="#9CA3AF"
              value={rotinaDiaria}
              onChangeText={setRotinaDiaria}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Passo 2 — Áreas */}
        {passo === 2 && (
          <View style={styles.passoContainer}>
            <Text style={styles.passoEmoji}>📚</Text>
            <Text style={styles.passoTitulo}>Que áreas vais estudar?</Text>
            <Text style={styles.passoSub}>Escolhe uma ou mais áreas</Text>

            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar áreas..."
                placeholderTextColor="#9CA3AF"
                value={filtroAreas}
                onChangeText={setFiltroAreas}
              />
              {filtroAreas.length > 0 && (
                <TouchableOpacity onPress={() => setFiltroAreas('')}>
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.areasGrid}>
              {AREAS
                .filter(a => a.toLowerCase().includes(filtroAreas.toLowerCase()))
                .map(a => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.areaChip, areas.includes(a) && styles.areaChipActivo]}
                    onPress={() => toggleArea(a)}
                  >
                    <Text style={[styles.areaTexto, areas.includes(a) && styles.areaTextoActivo]}>
                      {a}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}

        {/* Passo 3 — Dias */}
        {passo === 3 && (
          <View style={styles.passoContainer}>
            <Text style={styles.passoEmoji}>📅</Text>
            <Text style={styles.passoTitulo}>Em que dias estás disponível?</Text>
            <Text style={styles.passoSub}>Selecciona os dias da semana</Text>
            <View style={styles.diasRow}>
              {DIAS.map(d => (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.diaChip, dias.includes(d.id) && styles.diaChipActivo]}
                  onPress={() => toggleDia(d.id)}
                >
                  <Text style={[styles.diaTexto, dias.includes(d.id) && styles.diaTextoActivo]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Passo 4 — Horas */}
        {passo === 4 && (
          <View style={styles.passoContainer}>
            <Text style={styles.passoEmoji}>⏰</Text>
            <Text style={styles.passoTitulo}>Quanto tempo por dia?</Text>
            <Text style={styles.passoSub}>Define o tempo que podes dedicar diariamente</Text>

            {/* Toggle horas/minutos */}
            <View style={styles.unidadeToggle}>
              {(['horas', 'minutos'] as const).map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unidadeBtn, unidade === u && styles.unidadeBtnActivo]}
                  onPress={() => setUnidade(u)}
                >
                  <Text style={[styles.unidadeTexto, unidade === u && styles.unidadeTextoActivo]}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.horasGrid}>
              {(unidade === 'horas' ? [1, 2, 3, 4, 5, 6] : [15, 30, 45, 60, 90, 120]).map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.horaChip, !modoCustomDuracao && duracaoNum === h && styles.horaChipActivo]}
                  onPress={() => { setDuracaoNum(h); setModoCustomDuracao(false); }}
                >
                  <Text style={[styles.horaNum, !modoCustomDuracao && duracaoNum === h && styles.horaTextoActivo]}>
                    {h}
                  </Text>
                  <Text style={[styles.horaLabel, !modoCustomDuracao && duracaoNum === h && styles.horaTextoActivo]}>
                    {unidade === 'horas' ? (h === 1 ? 'hora' : 'horas') : 'min'}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Custom */}
              <TouchableOpacity
                style={[styles.horaChip, modoCustomDuracao && styles.horaChipActivo]}
                onPress={() => setModoCustomDuracao(true)}
              >
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={modoCustomDuracao ? '#fff' : '#111827'}
                />
                <Text style={[styles.horaLabel, modoCustomDuracao && styles.horaTextoActivo]}>
                  Definir
                </Text>
              </TouchableOpacity>
            </View>

            {modoCustomDuracao && (
              <TextInput
                style={styles.inputCustomDuracao}
                placeholder={`Quantos ${unidade}?`}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={customDuracao}
                onChangeText={setCustomDuracao}
              />
            )}
          </View>
        )}

        {/* Passo 5 — Prazo */}
        {passo === 5 && (
          <View style={styles.passoContainer}>
            <Text style={styles.passoEmoji}>🗓️</Text>
            <Text style={styles.passoTitulo}>Qual é o teu prazo?</Text>
            <Text style={styles.passoSub}>Quanto tempo tens para alcançar o objectivo?</Text>

            <View style={styles.prazoColuna}>
              {PRAZOS.map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.prazoChip, !modoCustomPrazo && prazo === p && styles.prazoChipActivo]}
                  onPress={() => { setPrazo(p); setModoCustomPrazo(false); }}
                >
                  <Text style={[styles.prazoTexto, !modoCustomPrazo && prazo === p && styles.prazoTextoActivo]}>
                    {p}
                  </Text>
                  {!modoCustomPrazo && prazo === p && (
                    <Ionicons name="checkmark-circle" size={20} color="#991B1B" />
                  )}
                </TouchableOpacity>
              ))}

              {/* Definir */}
              <TouchableOpacity
                style={[styles.prazoChip, modoCustomPrazo && styles.prazoChipActivo]}
                onPress={() => setModoCustomPrazo(true)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Ionicons name="create-outline" size={18} color={modoCustomPrazo ? '#991B1B' : '#374151'} />
                  <Text style={[styles.prazoTexto, modoCustomPrazo && styles.prazoTextoActivo]}>
                    Definir
                  </Text>
                </View>
                {modoCustomPrazo && <Ionicons name="checkmark-circle" size={20} color="#991B1B" />}
              </TouchableOpacity>
            </View>

            {modoCustomPrazo && (
              <View style={styles.customPrazoContainer}>
                <TextInput
                  style={styles.customPrazoInput}
                  placeholder="Ex: 45"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  value={customPrazoNum}
                  onChangeText={setCustomPrazoNum}
                />
                <View style={styles.customPrazoUnidades}>
                  {(['dias', 'meses', 'anos'] as const).map(u => (
                    <TouchableOpacity
                      key={u}
                      style={[styles.unidadePrazoBtn, customPrazoUnidade === u && styles.unidadePrazoBtnActivo]}
                      onPress={() => setCustomPrazoUnidade(u)}
                    >
                      <Text style={[styles.unidadePrazoTexto, customPrazoUnidade === u && styles.unidadePrazoTextoActivo]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.botao, (!podeAvancar() || loading) && styles.botaoDesactivado]}
          onPress={avancar}
          disabled={!podeAvancar() || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.botaoTexto}>
                {passo === totalPassos - 1 ? 'Gerar plano' : 'Continuar'}
              </Text>
              <Ionicons
                name={passo === totalPassos - 1 ? 'sparkles' : 'arrow-forward'}
                size={18}
                color="#fff"
              />
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
  progressoContainer: { flex: 1, gap: 4 },
  progressoBarra: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, overflow: 'hidden' },
  progressoFill: { height: '100%', backgroundColor: '#991B1B', borderRadius: 3 },
  progressoTexto: { fontSize: 11, color: '#9CA3AF', textAlign: 'right' },
  scroll: { flexGrow: 1, padding: 24 },
  passoContainer: { flex: 1, alignItems: 'center', gap: 8, paddingTop: 20 },
  passoEmoji: { fontSize: 56, marginBottom: 12 },
  passoTitulo: { fontSize: 22, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  passoSub: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },

  inputGrande: {
    width: '100%', minHeight: 100,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, fontSize: 15, color: '#111827',
  },

  areasGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    justifyContent: 'center',
  },
  areaChip: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: '#fff', borderRadius: 999,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  areaChipActivo: { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  areaTexto: { fontSize: 13, color: '#374151', fontWeight: '500' },
  areaTextoActivo: { color: '#fff' },

  diasRow: {
    flexDirection: 'row', gap: 6, flexWrap: 'wrap',
    justifyContent: 'center',
  },
  diaChip: {
    width: 50, height: 50, borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
  },
  diaChipActivo: { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  diaTexto: { fontSize: 13, fontWeight: '600', color: '#374151' },
  diaTextoActivo: { color: '#fff' },

  horasGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
    justifyContent: 'center',
  },
  horaChip: {
    width: 90, paddingVertical: 16,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  horaChipActivo: { backgroundColor: '#991B1B', borderColor: '#991B1B' },
  horaNum: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  horaLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  horaTextoActivo: { color: '#fff' },

  prazoColuna: { width: '100%', gap: 8 },
  prazoChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  prazoChipActivo: { backgroundColor: '#FEE2E2', borderColor: '#991B1B' },
  prazoTexto: { fontSize: 15, fontWeight: '500', color: '#374151' },
  prazoTextoActivo: { color: '#991B1B', fontWeight: '600' },

  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
  },
  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: '#991B1B',
    borderRadius: 12, paddingVertical: 14,
  },
  botaoDesactivado: { backgroundColor: '#D89595' },
  botaoTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    width: '100%', height: 46,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 14, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#111827' },
  unidadeToggle: {
    flexDirection: 'row', gap: 6,
    backgroundColor: '#F3F4F6', borderRadius: 10,
    padding: 4, marginBottom: 16,
  },
  unidadeBtn: {
    paddingHorizontal: 18, paddingVertical: 8,
    borderRadius: 8,
  },
  unidadeBtnActivo: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  unidadeTexto: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  unidadeTextoActivo: { color: '#991B1B' },
  inputCustomDuracao: {
    width: '100%', height: 48, marginTop: 16,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#991B1B',
    paddingHorizontal: 14, fontSize: 15, color: '#111827',
    textAlign: 'center',
  },
  customPrazoContainer: {
    width: '100%', marginTop: 16, gap: 10,
  },
  customPrazoInput: {
    height: 48,
    backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#991B1B',
    paddingHorizontal: 14, fontSize: 15, color: '#111827',
    textAlign: 'center',
  },
  customPrazoUnidades: {
    flexDirection: 'row', gap: 6,
    backgroundColor: '#F3F4F6', borderRadius: 10,
    padding: 4,
  },
  unidadePrazoBtn: {
    flex: 1, paddingVertical: 10,
    borderRadius: 8, alignItems: 'center',
  },
  unidadePrazoBtnActivo: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  unidadePrazoTexto: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  unidadePrazoTextoActivo: { color: '#991B1B' },
});
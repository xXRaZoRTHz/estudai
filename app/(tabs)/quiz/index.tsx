import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Dificuldade = 'fácil' | 'médio' | 'difícil' | 'expert' | 'escolher';
type TipoPerguntas = 'multipla' | 'vf' | 'aberta';
type Modo = 'simulado' | 'imediato';
type TipoCronometro = 'porPergunta' | 'total';

const QUANTIDADES = [5, 10, 15];

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    area?: string;
    assunto?: string;
    topicos?: string;
  }>();

  const [distribuicao, setDistribuicao] = useState({ facil: 3, medio: 4, dificil: 2, expert: 1 });
  const [area] = useState(params.area ?? '');
  const [assunto] = useState(params.assunto ?? '');
  const [quantidade, setQuantidade] = useState(10);
  const [dificuldade, setDificuldade] = useState<Dificuldade>('médio');
  const [tipos, setTipos] = useState<TipoPerguntas[]>(['multipla']);
  const [modo, setModo] = useState<Modo>('imediato');
  const [mostrarNivel, setMostrarNivel] = useState(false);
  const [mostrarHint, setMostrarHint] = useState(false);
  const [isPremium] = useState(false);
  const [numAlternativas, setNumAlternativas] = useState(4);
  const [modoCustom, setModoCustom] = useState(false);
  const [quantidadeCustom, setQuantidadeCustom] = useState('');
  const [cronometroActivo, setCronometroActivo] = useState(false);
  const [tempoPorPergunta, setTempoPorPergunta] = useState<number | 'custom'>(60);
  const [tipoCronometro, setTipoCronometro] = useState<TipoCronometro[]>(['porPergunta']);
  const [tempoTotal, setTempoTotal] = useState<number | 'custom'>(30);
  const [customPorPergunta, setCustomPorPergunta] = useState('');
  const [customTotal, setCustomTotal] = useState('');

  function toggleTipo(id: TipoPerguntas) {
  setTipos(prev =>
    prev.includes(id)
      ? prev.filter(t => t !== id)
      : [...prev, id]
  );
  }

  function toggleTipoCronometro(tipo: TipoCronometro) {
  setTipoCronometro(prev =>
    prev.includes(tipo)
      ? prev.filter(t => t !== tipo)
      : [...prev, tipo]
  );
  }

  function handleIniciar() {
    const qtd = modoCustom && quantidadeCustom
      ? parseInt(quantidadeCustom)
      : dificuldade === 'escolher'
        ? Object.values(distribuicao).reduce((a, b) => a + b, 0)
        : quantidade;

    router.push({
      pathname: '/(tabs)/quiz/perguntas',
      params: {
        area,
        assunto,
        topicos: params.topicos ?? '[]',
        quantidade: String(qtd),
        dificuldade,
        distribuicao: JSON.stringify(distribuicao),
        tipos: JSON.stringify(tipos),
        numAlternativas: String(numAlternativas),
        modo,
        mostrarNivel: mostrarNivel ? '1' : '0',
        cronometroPorPergunta: tipoCronometro.includes('porPergunta') && cronometroActivo
          ? tempoPorPergunta === 'custom' ? customPorPergunta : String(tempoPorPergunta)
          : '0',
        cronometroTotal: tipoCronometro.includes('total')
          ? tempoTotal === 'custom' ? String(parseInt(customTotal) * 60) : String(tempoTotal * 60)
          : '0',
      },
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Configurar Quiz</Text>
        <Text style={styles.subtitulo}>
          {assunto ? `${assunto} · ${area}` : 'Personaliza o teu quiz'}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >

        {/* Quantidade */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Número de perguntas</Text>
          <View style={styles.opcoes}>
            {QUANTIDADES.map((q) => (
              <TouchableOpacity
                key={q}
                style={[styles.opcaoBtn, quantidade === q && !modoCustom && styles.opcaoBtnActivo]}
                onPress={() => { setQuantidade(q); setModoCustom(false); }}
              >
                <Text style={[styles.opcaoTexto, quantidade === q && !modoCustom && styles.opcaoTextoActivo]}>
                  {q}
                </Text>
              </TouchableOpacity>
            ))}

            {/* Botão personalizar — só Premium */}
            <TouchableOpacity
              style={[styles.opcaoBtn, modoCustom && styles.opcaoBtnActivo, !isPremium && styles.opcaoBtnLocked]}
              onPress={() => isPremium ? setModoCustom(true) : alert('Funcionalidade Premium 👑')}
            >
              {!isPremium && <Ionicons name="lock-closed" size={12} color="#9CA3AF" />}
              <Text style={[styles.opcaoTexto, modoCustom && styles.opcaoTextoActivo]}>
                {isPremium ? 'Custom' : 'Custom 👑'}
              </Text>
            </TouchableOpacity>
          </View>

          {modoCustom && isPremium && (
            <TextInput
              style={styles.inputCustom}
              placeholder="Quantas perguntas? (máx. 50)"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              value={quantidadeCustom}
              onChangeText={(v) => {
                const num = parseInt(v);
                if (!isNaN(num) && num <= 50) setQuantidadeCustom(v);
              }}
            />
          )}
        </View>

        {/* Dificuldade */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Dificuldade</Text>
          <View style={styles.opcoes}>
            {([
              { id: 'fácil',        bg: '#F0FDF4', text: '#15803D', activeBg: '#16A34A' },
              { id: 'médio',        bg: '#FFFBEB', text: '#B45309', activeBg: '#D97706' },
              { id: 'difícil',      bg: '#FEF2F2', text: '#B91C1C', activeBg: '#DC2626' },
              { id: 'expert',       bg: '#F5F3FF', text: '#6D28D9', activeBg: '#7C3AED' },
              { id: 'escolher',     bg: '#F3F4F6', text: '#374151', activeBg: '#4B5563' },
            ] as const).map((d) => {
              const activo = dificuldade === d.id;
              return (
                <TouchableOpacity
                  key={d.id}
                  style={[styles.opcaoBtn, { backgroundColor: activo ? d.activeBg : d.bg, borderColor: activo ? d.activeBg : '#E5E7EB' }]}
                  onPress={() => setDificuldade(d.id as Dificuldade)}
                >
                  <Text style={[styles.opcaoTexto, { color: activo ? '#fff' : d.text }]}>
                    {d.id.charAt(0).toUpperCase() + d.id.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Distribuição personalizada */}
          {dificuldade === 'escolher' && (
            <View style={styles.distribuicaoContainer}>
              {([
                { key: 'facil',  label: 'Fácil',  cor: '#16A34A' },
                { key: 'medio',  label: 'Médio',  cor: '#D97706' },
                { key: 'dificil',label: 'Difícil',cor: '#DC2626' },
                { key: 'expert', label: 'Expert', cor: '#7C3AED' },
              ] as const).map((item) => (
                <View key={item.key} style={styles.distribuicaoRow}>
                  <View style={[styles.distribuicaoDot, { backgroundColor: item.cor }]} />
                  <Text style={styles.distribuicaoLabel}>{item.label}</Text>
                  <View style={styles.distribuicaoControls}>
                    <TouchableOpacity
                      style={styles.distribuicaoBtn}
                      onPress={() => setDistribuicao(prev => ({ ...prev, [item.key]: Math.max(0, prev[item.key] - 1) }))}
                    >
                      <Text style={styles.distribuicaoBtnTexto}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.distribuicaoNum}>{distribuicao[item.key]}</Text>
                    <TouchableOpacity
                      style={styles.distribuicaoBtn}
                      onPress={() => setDistribuicao(prev => ({ ...prev, [item.key]: prev[item.key] + 1 }))}
                    >
                      <Text style={styles.distribuicaoBtnTexto}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <Text style={styles.distribuicaoTotal}>
                Total: {Object.values(distribuicao).reduce((a, b) => a + b, 0)} perguntas
              </Text>
            </View>
          )}
        </View>

        {/* Visualização */}
        <View style={styles.secao}>

        {/* Toggle mostrar nível */}
        <TouchableOpacity
          style={styles.toggleRow}
          onPress={() => setMostrarNivel(!mostrarNivel)}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.toggleLabelRow}>
              <Text style={styles.toggleLabel}>Mostrar a dificuldade das perguntas</Text>
              <TouchableOpacity onPress={() => setMostrarHint(!mostrarHint)}>
                <Ionicons name="information-circle-outline" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            <Text style={styles.toggleSub}>Cor na numeração de cada questão</Text>
          </View>
          <View style={[styles.toggle, mostrarNivel && styles.toggleActivo]}>
            <View style={[styles.toggleThumb, mostrarNivel && styles.toggleThumbActivo]} />
          </View>
        </TouchableOpacity>

        {/* Hint explicativo */}
        {mostrarHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintTitulo}>O que significam as cores?</Text>
            {[
              { cor: '#16A34A', label: 'Verde', desc: 'Fácil' },
              { cor: '#D97706', label: 'Amarelo', desc: 'Médio' },
              { cor: '#DC2626', label: 'Vermelho', desc: 'Difícil' },
              { cor: '#7C3AED', label: 'Violeta', desc: 'Expert' },
            ].map((item) => (
              <View key={item.desc} style={styles.hintRow}>
                <View style={[styles.hintDot, { backgroundColor: item.cor }]} />
                <Text style={styles.hintTexto}><Text style={{ fontWeight: '600' }}>{item.label}</Text> — {item.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Tipo de perguntas */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Tipo de perguntas</Text>
          <View style={styles.opcoesVertical}>
            {[
              { id: 'multipla', label: 'Múltipla escolha', sub: '3 a 5 alternativas', icon: 'list-outline' },
              { id: 'vf', label: 'Verdadeiro / Falso', sub: 'Respostas binárias', icon: 'checkmark-circle-outline' },
              { id: 'aberta', label: 'Resposta aberta', sub: 'O utilizador escreve a resposta', icon: 'create-outline' },
            ].map((t) => {
              const activo = tipos.includes(t.id as TipoPerguntas);
              return (
                <View key={t.id}>
                  <TouchableOpacity
                    style={[styles.opcaoCard, activo && styles.opcaoCardActivo]}
                    onPress={() => toggleTipo(t.id as TipoPerguntas)}
                  >
                    <View style={[styles.opcaoCardIcon, activo && styles.opcaoCardIconActivo]}>
                      <Ionicons name={t.icon as any} size={18} color={activo ? '#fff' : '#6B7280'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.opcaoCardLabel, activo && styles.opcaoCardLabelActivo]}>{t.label}</Text>
                      <Text style={styles.opcaoCardSub}>{t.sub}</Text>
                    </View>
                    {activo && <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />}
                  </TouchableOpacity>

                  {/* Número de alternativas — aparece logo abaixo da múltipla escolha */}
                  {t.id === 'multipla' && activo && (
                    <View style={styles.alternativasContainer}>
                      <Text style={styles.alternativasTitulo}>Número de alternativas</Text>
                      <View style={styles.opcoes}>
                        {[3, 4, 5].map((n) => (
                          <TouchableOpacity
                            key={n}
                            style={[styles.opcaoBtn, numAlternativas === n && styles.opcaoBtnActivo]}
                            onPress={() => setNumAlternativas(n)}
                          >
                            <Text style={[styles.opcaoTexto, numAlternativas === n && styles.opcaoTextoActivo]}>
                              {n}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Modo */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Modo de resposta</Text>
          <View style={styles.opcoesVertical}>
            {[
              { id: 'imediato', label: 'Resposta imediata', sub: 'Feedback após cada pergunta', icon: 'flash-outline' },
              { id: 'simulado', label: 'Simulado', sub: 'Resultado só no final', icon: 'timer-outline' },
            ].map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.opcaoCard, modo === m.id && styles.opcaoCardActivo]}
                onPress={() => setModo(m.id as Modo)}
              >
                <View style={[styles.opcaoCardIcon, modo === m.id && styles.opcaoCardIconActivo]}>
                  <Ionicons
                    name={m.icon as any}
                    size={18}
                    color={modo === m.id ? '#fff' : '#6B7280'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.opcaoCardLabel, modo === m.id && styles.opcaoCardLabelActivo]}>
                    {m.label}
                  </Text>
                  <Text style={styles.opcaoCardSub}>{m.sub}</Text>
                </View>
                {modo === m.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Cronómetro */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Cronómetro</Text>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setCronometroActivo(!cronometroActivo)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>Activar cronómetro</Text>
              <Text style={styles.toggleSub}>Define limites de tempo para o quiz</Text>
            </View>
            <View style={[styles.toggle, cronometroActivo && styles.toggleActivo]}>
              <View style={[styles.toggleThumb, cronometroActivo && styles.toggleThumbActivo]} />
            </View>
          </TouchableOpacity>

          {cronometroActivo && (
            <View style={styles.cronometroOpcoes}>

              {/* Tipo de cronómetro — múltipla escolha */}
              <View style={styles.cronometroTipos}>
                {([
                  { id: 'porPergunta', label: 'Por pergunta', icon: 'hourglass-outline' },
                  { id: 'total', label: 'Tempo total', icon: 'time-outline' },
                ] as const).map((t) => {
                  const activo = tipoCronometro.includes(t.id);
                  return (
                    <View key={t.id}>
                      <TouchableOpacity
                        style={[styles.opcaoCard, activo && styles.opcaoCardActivo]}
                        onPress={() => toggleTipoCronometro(t.id)}
                      >
                        <View style={[styles.opcaoCardIcon, activo && styles.opcaoCardIconActivo]}>
                          <Ionicons name={t.icon} size={18} color={activo ? '#fff' : '#6B7280'} />
                        </View>
                        <Text style={[styles.opcaoCardLabel, activo && styles.opcaoCardLabelActivo]}>
                          {t.label}
                        </Text>
                        {activo && <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />}
                      </TouchableOpacity>

                      {/* Tempo por pergunta — aparece logo abaixo */}
                      {t.id === 'porPergunta' && activo && (
                        <View style={styles.tempoSecao}>
                          <Text style={styles.tempoSecaoTitulo}>Tempo limite por pergunta</Text>
                          <View style={styles.temposContainer}>
                            {([30, 60, 120, 'custom'] as const).map((t) => (
                              <TouchableOpacity
                                key={String(t)}
                                style={[styles.opcaoBtn, tempoPorPergunta === t && styles.opcaoBtnActivo]}
                                onPress={() => setTempoPorPergunta(t)}
                              >
                                <Text style={[styles.opcaoTexto, tempoPorPergunta === t && styles.opcaoTextoActivo]}>
                                  {t === 'custom' ? 'Definir' : t < 60 ? `${t}s` : `${t / 60}min`}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {tempoPorPergunta === 'custom' && (
                            <TextInput
                              style={styles.inputCustom}
                              placeholder="Tempo em segundos (ex: 90)"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="numeric"
                              value={customPorPergunta}
                              onChangeText={setCustomPorPergunta}
                            />
                          )}
                        </View>
                      )}

                      {/* Tempo total — aparece logo abaixo */}
                      {t.id === 'total' && activo && (
                        <View style={styles.tempoSecao}>
                          <Text style={styles.tempoSecaoTitulo}>Tempo total do quiz</Text>
                          <View style={styles.temposContainer}>
                            {([15, 30, 60, 'custom'] as const).map((t) => (
                              <TouchableOpacity
                                key={String(t)}
                                style={[styles.opcaoBtn, tempoTotal === t && styles.opcaoBtnActivo]}
                                onPress={() => setTempoTotal(t)}
                              >
                                <Text style={[styles.opcaoTexto, tempoTotal === t && styles.opcaoTextoActivo]}>
                                  {t === 'custom' ? 'Definir' : `${t}min`}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                          {tempoTotal === 'custom' && (
                            <TextInput
                              style={styles.inputCustom}
                              placeholder="Tempo em minutos (ex: 45)"
                              placeholderTextColor="#9CA3AF"
                              keyboardType="numeric"
                              value={customTotal}
                              onChangeText={setCustomTotal}
                            />
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              
            </View>
          )}
        </View>

        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.botao} onPress={handleIniciar}>
          <Ionicons name="play" size={18} color="#fff" />
          <Text style={styles.botaoTexto}>Iniciar Quiz · {quantidade} perguntas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
    gap: 24,
  },
  secao: {
    gap: 10,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  opcoes: {
    flexDirection: 'row',
    gap: 10,
  },
  opcaoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  opcaoBtnActivo: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  opcaoTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  opcaoTextoActivo: {
    color: '#fff',
  },
  opcoesVertical: {
    gap: 8,
  },
  opcaoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  opcaoCardActivo: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  opcaoCardIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  opcaoCardIconActivo: {
    backgroundColor: '#4F46E5',
  },
  opcaoCardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  opcaoCardLabelActivo: {
    color: '#4F46E5',
  },
  opcaoCardSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  opcaoBtnLocked: {
    opacity: 0.6,
  },
  inputCustom: {
    height: 48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#111827',
    marginTop: 8,
  },
  distribuicaoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
    marginTop: 8,
  },
  distribuicaoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  distribuicaoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  distribuicaoLabel: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  distribuicaoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  distribuicaoBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  distribuicaoBtnTexto: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  distribuicaoNum: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    minWidth: 20,
    textAlign: 'center',
  },
  distribuicaoTotal: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  toggleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  toggleSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActivo: {
    backgroundColor: '#4F46E5',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  toggleThumbActivo: {
    alignSelf: 'flex-end',
  },
  hintContainer: {
    backgroundColor: '#F5F3FF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    gap: 8,
    marginTop: 4,
  },
  hintTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 4,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  hintDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  hintTexto: {
    fontSize: 13,
    color: '#374151',
  },
  cronometroOpcoes: {
    gap: 12,
  },
  cronometroTipos: {
    gap: 8,
  },
  tempoSecao: {
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tempoSecaoTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  temposContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  alternativasContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  alternativasTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
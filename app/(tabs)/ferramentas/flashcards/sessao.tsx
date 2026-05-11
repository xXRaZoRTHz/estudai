import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Pressable,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useFlashcardsStore } from '@stores/flashcardsStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

export default function SessaoScreen() {
  const router = useRouter();
  const { baralhoId } = useLocalSearchParams<{ baralhoId: string }>();
  const baralho = useFlashcardsStore(s => s.baralhos.find(b => b.id === baralhoId));
  const registarResposta = useFlashcardsStore(s => s.registarResposta);

  const [cardsParaRever] = useState(() =>
    baralho?.cards.filter(c => c.proximaRevisao <= Date.now()) ?? []
  );
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [stats, setStats] = useState({ acertos: 0, erros: 0, dificeis: 0 });

  const translateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const cardActual = cardsParaRever[indice];

  function avancar(qualidade: 0 | 3 | 5) {
    if (!baralho || !cardActual) return;
    registarResposta(baralho.id, cardActual.id, qualidade);

    setStats(prev => ({
      acertos:  qualidade === 5 ? prev.acertos + 1 : prev.acertos,
      dificeis: qualidade === 3 ? prev.dificeis + 1 : prev.dificeis,
      erros:    qualidade === 0 ? prev.erros + 1 : prev.erros,
    }));

    translateX.value = 0;
    rotateY.value = 0;
    setVirado(false);
    setIndice(prev => prev + 1);
  }

  function virarCard() {
    const novo = !virado;
    setVirado(novo);
    rotateY.value = withTiming(novo ? 180 : 0, { duration: 400 });
  }

  // Gesto de swipe — só com flag activeOffsetX para não capturar toques
  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onUpdate((e) => {
      'worklet';
      if (!virado) return;
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      'worklet';
      if (!virado) {
        translateX.value = withSpring(0);
        return;
      }
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH * 1.5, { duration: 250 });
        runOnJS(avancar)(5);
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH * 1.5, { duration: 250 });
        runOnJS(avancar)(0);
      } else {
        translateX.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotacao = interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15], Extrapolate.CLAMP);
    return {
      transform: [
        { perspective: 1000 },
        { translateX: translateX.value },
        { rotate: `${rotacao}deg` },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  });

  const verdeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolate.CLAMP),
  }));
  const vermelhoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolate.CLAMP),
  }));

  const frenteStyle = useAnimatedStyle(() => ({
    opacity: rotateY.value < 90 ? 1 : 0,
  }));
  const versoStyle = useAnimatedStyle(() => ({
    opacity: rotateY.value >= 90 ? 1 : 0,
    transform: [{ rotateY: '180deg' }],
  }));

  if (!baralho) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Baralho não encontrado</Text>
      </View>
    );
  }

  if (indice >= cardsParaRever.length) {
    return (
      <View style={styles.container}>
        <View style={styles.fimContainer}>
          <View style={styles.fimIcon}>
            <Ionicons name="trophy" size={48} color="#92520A" />
          </View>
          <Text style={styles.fimTitulo}>Sessão concluída!</Text>
          <Text style={styles.fimSub}>Revisaste {cardsParaRever.length} cards</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: '#16A34A' }]}>{stats.acertos}</Text>
              <Text style={styles.statLabel}>Sabia</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: '#D97706' }]}>{stats.dificeis}</Text>
              <Text style={styles.statLabel}>Difícil</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNum, { color: '#DC2626' }]}>{stats.erros}</Text>
              <Text style={styles.statLabel}>Errei</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.fimBtn}
            onPress={() => router.replace(`/(tabs)/ferramentas/flashcards/${baralho.id}`)}
          >
            <Text style={styles.fimBtnTexto}>Voltar ao baralho</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => Alert.alert('Sair da sessão?', 'O teu progresso será guardado.', [
            { text: 'Continuar', style: 'cancel' },
            { text: 'Sair', style: 'destructive', onPress: () => router.back() },
          ])}
          style={styles.backBtn}
        >
          <Ionicons name="close" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={styles.progressoContainer}>
          <View style={styles.progressoBarra}>
            <View style={[styles.progressoFill, { width: `${(indice / cardsParaRever.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressoTexto}>{indice + 1}/{cardsParaRever.length}</Text>
        </View>
      </View>

      <View style={styles.cardArea}>
        <Animated.View style={[styles.indicador, styles.indicadorEsquerda, vermelhoStyle]}>
          <Ionicons name="close-circle" size={40} color="#DC2626" />
          <Text style={[styles.indicadorTexto, { color: '#DC2626' }]}>Errei</Text>
        </Animated.View>
        <Animated.View style={[styles.indicador, styles.indicadorDireita, verdeStyle]}>
          <Ionicons name="checkmark-circle" size={40} color="#16A34A" />
          <Text style={[styles.indicadorTexto, { color: '#16A34A' }]}>Sabia!</Text>
        </Animated.View>

        <GestureDetector gesture={swipeGesture}>
          <Animated.View style={[styles.card, cardStyle]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={virarCard}>
              <Animated.View style={[styles.cardLado, frenteStyle]}>
                <Text style={styles.cardLabel}>FRENTE</Text>
                <Text style={styles.cardTexto}>{cardActual.frente}</Text>
                <Text style={styles.cardHint}>Toca para virar</Text>
              </Animated.View>

              <Animated.View style={[styles.cardLado, styles.cardLadoVerso, versoStyle]}>
                <Text style={styles.cardLabel}>VERSO</Text>
                <Text style={styles.cardTexto}>{cardActual.verso}</Text>
                <Text style={styles.cardHint}>Desliza para responder</Text>
              </Animated.View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>

      {virado ? (
        <View style={styles.botoes}>
          <TouchableOpacity
            style={[styles.botaoResposta, { backgroundColor: '#FEE2E2' }]}
            onPress={() => avancar(0)}
          >
            <Ionicons name="close-circle" size={22} color="#DC2626" />
            <Text style={[styles.botaoTexto, { color: '#DC2626' }]}>Errei</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoResposta, { backgroundColor: '#FEF3C7' }]}
            onPress={() => avancar(3)}
          >
            <Ionicons name="time-outline" size={22} color="#D97706" />
            <Text style={[styles.botaoTexto, { color: '#D97706' }]}>Difícil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.botaoResposta, { backgroundColor: '#DCFCE7' }]}
            onPress={() => avancar(5)}
          >
            <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
            <Text style={[styles.botaoTexto, { color: '#16A34A' }]}>Sabia!</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.virarHint}>
          <Ionicons name="hand-left-outline" size={18} color="#9CA3AF" />
          <Text style={styles.virarHintTexto}>Toca no card para ver a resposta</Text>
        </View>
      )}
    </GestureHandlerRootView>
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
  progressoFill: { height: '100%', backgroundColor: '#92520A', borderRadius: 3 },
  progressoTexto: { fontSize: 11, color: '#9CA3AF', textAlign: 'right' },
  cardArea: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: { width: '100%', aspectRatio: 0.7, maxWidth: 340 },
  cardLado: {
    position: 'absolute',
    width: '100%', height: '100%',
    backgroundColor: '#fff',
    borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardLadoVerso: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  cardLabel: {
    position: 'absolute', top: 16,
    fontSize: 10, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1.2,
  },
  cardTexto: { fontSize: 22, fontWeight: '600', color: '#111827', textAlign: 'center', lineHeight: 30 },
  cardHint: { position: 'absolute', bottom: 16, fontSize: 11, color: '#9CA3AF' },
  indicador: { position: 'absolute', top: '50%', alignItems: 'center', gap: 4, zIndex: 10 },
  indicadorEsquerda: { left: 24, transform: [{ rotate: '-15deg' }] },
  indicadorDireita: { right: 24, transform: [{ rotate: '15deg' }] },
  indicadorTexto: { fontSize: 14, fontWeight: '700' },
  botoes: { flexDirection: 'row', gap: 10, padding: 16, paddingBottom: 32 },
  botaoResposta: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 14, borderRadius: 12,
  },
  botaoTexto: { fontSize: 13, fontWeight: '600' },
  virarHint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, padding: 16, paddingBottom: 32,
  },
  virarHintTexto: { fontSize: 13, color: '#9CA3AF' },
  fimContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 8,
  },
  fimIcon: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  fimTitulo: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  fimSub: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  statsContainer: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 32 },
  statCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  statNum: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  fimBtn: {
    backgroundColor: '#92520A', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32,
  },
  fimBtnTexto: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
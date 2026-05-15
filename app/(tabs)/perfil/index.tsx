import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { usePerfilStore } from '@stores/perfilStore';
import { useInsigniasStore, INSIGNIAS } from '@stores/insigniasStore';
import { useRankStore } from '@stores/rankStore';

export default function PerfilScreen() {
  const router = useRouter();
  const perfil = usePerfilStore(s => s.perfil);
  const setFoto = usePerfilStore(s => s.setFoto);
  const insigniasConquistadas = useInsigniasStore(s => s.conquistadas);
  const entriesRank = useRankStore(s => s.entries);

  const [mostrarOpcoesFoto, setMostrarOpcoesFoto] = useState(false);

  // Estatísticas resumidas
  const totalPerguntasRespondidas = entriesRank.reduce((acc, e) => acc + e.perguntasRespondidas, 0);
  const totalPerguntasAcertadas = entriesRank.reduce((acc, e) => acc + e.perguntasAcertadas, 0);
  const totalPontos = entriesRank.reduce((acc, e) => acc + e.pontosLifetime, 0);
  const taxaAcerto = totalPerguntasRespondidas > 0
    ? Math.round((totalPerguntasAcertadas / totalPerguntasRespondidas) * 100)
    : 0;

  // Insígnias em destaque (até 6)
  const insigniasDestaque = perfil.insigniasDestaque.length > 0
    ? perfil.insigniasDestaque
        .map(id => INSIGNIAS.find(i => i.id === id))
        .filter(Boolean)
        .slice(0, 6)
    : insigniasConquistadas
        .slice(0, 6)
        .map(c => INSIGNIAS.find(i => i.id === c.id))
        .filter(Boolean);

  async function escolherDaGaleria() {
    setMostrarOpcoesFoto(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Concede acesso à galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  }

  async function tirarFoto() {
    setMostrarOpcoesFoto(false);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Concede acesso à câmara para tirar uma foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setFoto(result.assets[0].uri);
    }
  }

  function removerFoto() {
    setMostrarOpcoesFoto(false);
    Alert.alert('Remover foto?', 'A tua foto de perfil será removida.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => setFoto(null) },
    ]);
  }

  // Iniciais para avatar fallback
  const iniciais = perfil.nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header com foto */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.fotoContainer}
            onPress={() => setMostrarOpcoesFoto(!mostrarOpcoesFoto)}
            activeOpacity={0.8}
          >
            {perfil.foto ? (
              <Image source={{ uri: perfil.foto }} style={styles.foto} />
            ) : (
              <View style={styles.fotoFallback}>
                <Text style={styles.fotoIniciais}>{iniciais || '?'}</Text>
              </View>
            )}
            <View style={styles.fotoBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>

          <Text style={styles.nome}>{perfil.nome}</Text>
          {perfil.email && <Text style={styles.email}>{perfil.email}</Text>}
          {perfil.bio && <Text style={styles.bio}>{perfil.bio}</Text>}

          <TouchableOpacity
            style={styles.editarBtn}
            onPress={() => router.push('/(tabs)/perfil/editar')}
          >
            <Ionicons name="create-outline" size={16} color="#4F46E5" />
            <Text style={styles.editarTexto}>Editar perfil</Text>
          </TouchableOpacity>
        </View>

        {/* Opções de foto */}
        {mostrarOpcoesFoto && (
          <View style={styles.opcoesFoto}>
            <TouchableOpacity style={styles.opcaoFoto} onPress={escolherDaGaleria}>
              <Ionicons name="image-outline" size={20} color="#374151" />
              <Text style={styles.opcaoFotoTexto}>Escolher da galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.opcaoFoto} onPress={tirarFoto}>
              <Ionicons name="camera-outline" size={20} color="#374151" />
              <Text style={styles.opcaoFotoTexto}>Tirar foto</Text>
            </TouchableOpacity>
            {perfil.foto && (
              <TouchableOpacity style={styles.opcaoFoto} onPress={removerFoto}>
                <Ionicons name="trash-outline" size={20} color="#DC2626" />
                <Text style={[styles.opcaoFotoTexto, { color: '#DC2626' }]}>Remover foto</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Estatísticas resumidas */}
        <View style={styles.estatisticas}>
          <View style={styles.estatCard}>
            <Text style={styles.estatNum}>{totalPontos}</Text>
            <Text style={styles.estatLabel}>Pontos</Text>
          </View>
          <View style={styles.estatCard}>
            <Text style={styles.estatNum}>{totalPerguntasRespondidas}</Text>
            <Text style={styles.estatLabel}>Perguntas</Text>
          </View>
          <View style={styles.estatCard}>
            <Text style={styles.estatNum}>{taxaAcerto}%</Text>
            <Text style={styles.estatLabel}>Acerto</Text>
          </View>
          <View style={styles.estatCard}>
            <Text style={styles.estatNum}>{insigniasConquistadas.length}</Text>
            <Text style={styles.estatLabel}>Insígnias</Text>
          </View>
        </View>

        {/* Insígnias em destaque */}
        <View style={styles.secao}>
          <View style={styles.secaoHeader}>
            <Text style={styles.secaoTitulo}>Insígnias</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/perfil/insignias')}>
              <Text style={styles.verTodas}>Ver todas</Text>
            </TouchableOpacity>
          </View>

          {insigniasDestaque.length === 0 ? (
            <View style={styles.vazioInsignias}>
              <Ionicons name="ribbon-outline" size={32} color="#9CA3AF" />
              <Text style={styles.vazioTexto}>Ainda não tens insígnias</Text>
              <Text style={styles.vazioSub}>Estuda e completa quizzes para começar</Text>
            </View>
          ) : (
            <View style={styles.insigniasGrid}>
              {insigniasDestaque.map(i => i && (
                <View key={i.id} style={styles.insigniaCard}>
                  <View style={[styles.insigniaIcon, { backgroundColor: i.bgCor }]}>
                    <Ionicons name={i.icone as any} size={22} color={i.cor} />
                  </View>
                  <Text style={styles.insigniaNome} numberOfLines={2}>{i.nome}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Atalhos */}
        <View style={styles.secao}>
          <Text style={styles.secaoTitulo}>Mais</Text>
          <TouchableOpacity
            style={styles.atalho}
            onPress={() => router.push('/(tabs)/perfil/ranks')}
          >
            <View style={[styles.atalhoIcon, { backgroundColor: '#F5F3FF' }]}>
              <Ionicons name="podium-outline" size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.atalhoTitulo}>Os meus ranks</Text>
              <Text style={styles.atalhoSub}>Classificação por matéria e dificuldade</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.atalho}
            onPress={() => router.push('/(tabs)/perfil/estatisticas')}
          >
            <View style={[styles.atalhoIcon, { backgroundColor: '#EBF4FF' }]}>
              <Ionicons name="stats-chart-outline" size={20} color="#185FA5" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.atalhoTitulo}>Estatísticas</Text>
              <Text style={styles.atalhoSub}>Vê o teu progresso ao longo do tempo</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  scroll: { paddingBottom: 32 },

  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  fotoContainer: { position: 'relative', marginBottom: 12 },
  foto: { width: 96, height: 96, borderRadius: 48 },
  fotoFallback: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  fotoIniciais: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  fotoBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  nome: { fontSize: 22, fontWeight: 'bold', color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  bio: { fontSize: 13, color: '#374151', marginTop: 8, textAlign: 'center', lineHeight: 18, paddingHorizontal: 20 },
  editarBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, marginTop: 14,
  },
  editarTexto: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },

  opcoesFoto: {
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
  },
  opcaoFoto: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  opcaoFotoTexto: { fontSize: 14, color: '#374151', fontWeight: '500' },

  estatisticas: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  estatCard: {
    flex: 1, backgroundColor: '#fff',
    padding: 12, borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  estatNum: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  estatLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  secao: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  secaoHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  secaoTitulo: { fontSize: 16, fontWeight: '600', color: '#111827' },
  verTodas: { fontSize: 13, color: '#4F46E5', fontWeight: '500' },

  vazioInsignias: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 28, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  vazioTexto: { fontSize: 14, fontWeight: '600', color: '#374151', marginTop: 4 },
  vazioSub: { fontSize: 12, color: '#9CA3AF' },

  insigniasGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 8,
  },
  insigniaCard: {
    width: '31%', backgroundColor: '#fff',
    padding: 12, borderRadius: 12,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  insigniaIcon: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  insigniaNome: {
    fontSize: 11, fontWeight: '600', color: '#374151',
    textAlign: 'center',
  },

  atalho: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12,
    padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  atalhoIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  atalhoTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  atalhoSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },
});
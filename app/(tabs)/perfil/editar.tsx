import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePerfilStore } from '@stores/perfilStore';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const perfil = usePerfilStore(s => s.perfil);
  const setNome = usePerfilStore(s => s.setNome);
  const setEmail = usePerfilStore(s => s.setEmail);
  const setBio = usePerfilStore(s => s.setBio);

  const [nomeLocal, setNomeLocal] = useState(perfil.nome);
  const [emailLocal, setEmailLocal] = useState(perfil.email);
  const [bioLocal, setBioLocal] = useState(perfil.bio);

  function validarEmail(email: string) {
    if (!email) return true; // email é opcional
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function handleGuardar() {
    if (!nomeLocal.trim()) {
      Alert.alert('Nome obrigatório', 'Por favor indica o teu nome.');
      return;
    }
    if (!validarEmail(emailLocal.trim())) {
      Alert.alert('E-mail inválido', 'Verifica o formato do e-mail.');
      return;
    }

    setNome(nomeLocal.trim());
    setEmail(emailLocal.trim());
    setBio(bioLocal.trim());

    router.back();
  }

  const houveAlteracoes =
    nomeLocal !== perfil.nome ||
    emailLocal !== perfil.email ||
    bioLocal !== perfil.bio;

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
          <Text style={styles.titulo}>Editar perfil</Text>
        </View>
        <TouchableOpacity
          onPress={handleGuardar}
          disabled={!houveAlteracoes}
          style={[styles.guardarBtn, !houveAlteracoes && styles.guardarBtnDesactivado]}
        >
          <Text style={[styles.guardarTexto, !houveAlteracoes && styles.guardarTextoDesactivado]}>
            Guardar
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.secao}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            placeholder="O teu nome"
            placeholderTextColor="#9CA3AF"
            value={nomeLocal}
            onChangeText={setNomeLocal}
            maxLength={50}
            autoCapitalize="words"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="exemplo@email.com"
            placeholderTextColor="#9CA3AF"
            value={emailLocal}
            onChangeText={setEmailLocal}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            maxLength={100}
          />

          <Text style={styles.label}>Bio</Text>
          <TextInput
            style={[styles.input, styles.inputBio]}
            placeholder="Conta um pouco sobre ti..."
            placeholderTextColor="#9CA3AF"
            value={bioLocal}
            onChangeText={setBioLocal}
            multiline
            textAlignVertical="top"
            maxLength={200}
          />
          <Text style={styles.contagem}>{bioLocal.length}/200</Text>
        </View>

        <View style={styles.dica}>
          <Ionicons name="information-circle-outline" size={16} color="#4F46E5" />
          <Text style={styles.dicaTexto}>
            Para alterares a foto de perfil, toca na foto no ecrã principal do perfil.
          </Text>
        </View>
      </ScrollView>
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
  guardarBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, backgroundColor: '#4F46E5',
  },
  guardarBtnDesactivado: { backgroundColor: '#E5E7EB' },
  guardarTexto: { color: '#fff', fontWeight: '600', fontSize: 14 },
  guardarTextoDesactivado: { color: '#9CA3AF' },

  scroll: { padding: 16, gap: 16 },
  secao: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  label: { fontSize: 13, fontWeight: '500', color: '#374151', marginTop: 8 },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 12, fontSize: 14, color: '#111827',
  },
  inputBio: { minHeight: 90 },
  contagem: { fontSize: 11, color: '#9CA3AF', textAlign: 'right' },

  dica: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EEF2FF', borderRadius: 10,
    padding: 12,
    borderWidth: 1, borderColor: '#C7D2FE',
  },
  dicaTexto: { flex: 1, fontSize: 12, color: '#4F46E5', lineHeight: 18 },
});
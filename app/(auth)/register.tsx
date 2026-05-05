import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { registarComEmail } from '@services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleRegisto() {
    if (!email || !password || !confirmar) {
      setErro('Preenche todos os campos.');
      return;
    }
    if (password !== confirmar) {
      setErro('As palavras-passe não coincidem.');
      return;
    }
    if (password.length < 6) {
      setErro('A palavra-passe deve ter pelo menos 6 caracteres.');
      return;
    }
    try {
      setLoading(true);
      setErro('');
      await registarComEmail(email, password);
      // o _layout.tsx redireciona automaticamente após registo
    } catch (e: any) {
      setErro(traduzirErroFirebase(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>

        <Text style={styles.titulo}>Criar conta</Text>
        <Text style={styles.subtitulo}>Começa a estudar com IA hoje</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#9CA3AF"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Palavra-passe"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar palavra-passe"
          placeholderTextColor="#9CA3AF"
          value={confirmar}
          onChangeText={setConfirmar}
          secureTextEntry
        />

        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        <TouchableOpacity
          style={styles.botao}
          onPress={handleRegisto}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.link}>Já tens conta? Entra aqui</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

function traduzirErroFirebase(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está registado.';
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/weak-password':
      return 'Palavra-passe demasiado fraca.';
    default:
      return 'Erro ao criar conta. Tenta novamente.';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 52,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  erro: {
    color: '#EF4444',
    fontSize: 13,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  botao: {
    width: '100%',
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#4F46E5',
    fontSize: 14,
  },
});
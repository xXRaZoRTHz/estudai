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
import { loginComEmail } from '@services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleLogin() {
    if (!email || !password) {
      setErro('Preenche todos os campos.');
      return;
    }
    try {
      setLoading(true);
      setErro('');
      await loginComEmail(email, password);
      // o _layout.tsx redireciona automaticamente após login
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

        {/* Título */}
        <Text style={styles.titulo}>Estudai</Text>
        <Text style={styles.subtitulo}>A tua plataforma de estudo com IA</Text>

        {/* Campos */}
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

        {/* Erro */}
        {erro ? <Text style={styles.erro}>{erro}</Text> : null}

        {/* Botão login */}
        <TouchableOpacity
          style={styles.botao}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Entrar</Text>
          )}
        </TouchableOpacity>

        {/* Registo */}
        <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Não tens conta? Regista-te</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

function traduzirErroFirebase(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido.';
    case 'auth/user-not-found':
      return 'Utilizador não encontrado.';
    case 'auth/wrong-password':
      return 'Palavra-passe incorrecta.';
    case 'auth/too-many-requests':
      return 'Demasiadas tentativas. Tenta mais tarde.';
    default:
      return 'Erro ao entrar. Tenta novamente.';
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
    fontSize: 36,
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
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const SUGESTOES: Record<string, string[]> = {
  'Matemática': ['Álgebra Linear', 'Cálculo', 'Geometria Analítica', 'Estatística', 'Trigonometria'],
  'Física': ['Mecânica', 'Termodinâmica', 'Electromagnetismo', 'Óptica', 'Física Quântica'],
  'Química': ['Química Orgânica', 'Química Inorgânica', 'Estequiometria', 'Termoquímica'],
  'Biologia': ['Genética', 'Ecologia', 'Citologia', 'Fisiologia', 'Evolução'],
  'História': ['História do Brasil', 'História Geral', 'Idade Média', 'Revolução Industrial'],
  'Informática': ['Algoritmos', 'Estrutura de Dados', 'Redes', 'Banco de Dados', 'POO'],
};

export default function AssuntoScreen() {
  const router = useRouter();
  const { area } = useLocalSearchParams<{ area: string }>();
  const [assunto, setAssunto] = useState('');

  const sugestoes = SUGESTOES[area] ?? [];
  const sugestoesFiltradas = assunto.trim()
    ? sugestoes.filter(s => s.toLowerCase().includes(assunto.toLowerCase()))
    : sugestoes;

  function handleAssuntoSelecionado(valor: string) {
    router.push({
      pathname: '/(tabs)/estudar/topicos',
      params: { area, assunto: valor },
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View>
          <Text style={styles.titulo}>Qual o assunto?</Text>
          <Text style={styles.subtitulo}>{area}</Text>
        </View>
      </View>

      {/* Campo de busca */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Ex: Álgebra Linear, Genética..."
          placeholderTextColor="#9CA3AF"
          value={assunto}
          onChangeText={setAssunto}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={() => assunto.trim() && handleAssuntoSelecionado(assunto.trim())}
        />
        {assunto.length > 0 && (
          <TouchableOpacity onPress={() => setAssunto('')}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sugestões */}
      <FlatList
        data={sugestoesFiltradas}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.lista}
        ListHeaderComponent={
          sugestoesFiltradas.length > 0 ? (
            <Text style={styles.listaTitulo}>Sugestões</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sugestaoItem}
            onPress={() => handleAssuntoSelecionado(item)}
          >
            <Ionicons name="trending-up-outline" size={16} color="#6B7280" />
            <Text style={styles.sugestaoTexto}>{item}</Text>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
      />

      {/* Botão continuar com texto livre */}
      {assunto.trim().length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.botao}
            onPress={() => handleAssuntoSelecionado(assunto.trim())}
          >
            <Text style={styles.botaoTexto}>Estudar "{assunto.trim()}"</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitulo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  searchIcon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  lista: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listaTitulo: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  sugestaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  sugestaoTexto: {
    flex: 1,
    fontSize: 15,
    color: '#374151',
  },
  separador: {
    height: 1,
    backgroundColor: '#F3F4F6',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  botao: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
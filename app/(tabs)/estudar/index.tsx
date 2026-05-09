import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const AREAS = [
  { id: '1', nome: 'Matemática', icone: 'calculator-outline' },
  { id: '2', nome: 'Física', icone: 'planet-outline' },
  { id: '3', nome: 'Química', icone: 'flask-outline' },
  { id: '4', nome: 'Biologia', icone: 'leaf-outline' },
  { id: '5', nome: 'História', icone: 'time-outline' },
  { id: '6', nome: 'Geografia', icone: 'earth-outline' },
  { id: '7', nome: 'Português', icone: 'book-outline' },
  { id: '8', nome: 'Inglês', icone: 'language-outline' },
  { id: '9', nome: 'Filosofia', icone: 'bulb-outline' },
  { id: '10', nome: 'Informática', icone: 'laptop-outline' },
  { id: '11', nome: 'Direito', icone: 'scale-outline' },
  { id: '12', nome: 'Economia', icone: 'trending-up-outline' },
];

export default function EstudarScreen() {
  const router = useRouter();
  const [outra, setOutra] = useState('');
  const [mostrarOutra, setMostrarOutra] = useState(false);

  function handleAreaSelecionada(area: string) {
    router.push({
      pathname: '/(tabs)/estudar/assunto',
      params: { area },
    });
  }

  function handleOutra() {
    if (outra.trim()) {
      handleAreaSelecionada(outra.trim());
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>O que queres estudar?</Text>
        <Text style={styles.subtitulo}>Escolhe uma área de ensino</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      >
        {AREAS.map((area) => (
          <TouchableOpacity
            key={area.id}
            style={styles.card}
            onPress={() => handleAreaSelecionada(area.nome)}
          >
            <Ionicons name={area.icone as any} size={28} color="#4F46E5" />
            <Text style={styles.cardTexto}>{area.nome}</Text>
          </TouchableOpacity>
        ))}

        {/* Opção "Outra" */}
        <TouchableOpacity
          style={[styles.card, mostrarOutra && styles.cardActivo]}
          onPress={() => setMostrarOutra(!mostrarOutra)}
        >
          <Ionicons name="add-circle-outline" size={28} color="#4F46E5" />
          <Text style={styles.cardTexto}>Outra</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Campo para área personalizada */}
      {mostrarOutra && (
        <View style={styles.outraContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ex: Astronomia, Marketing..."
            placeholderTextColor="#9CA3AF"
            value={outra}
            onChangeText={setOutra}
            autoFocus
            onSubmitEditing={handleOutra}
          />
          <TouchableOpacity
            style={[styles.botao, !outra.trim() && styles.botaoDesativado]}
            onPress={handleOutra}
            disabled={!outra.trim()}
          >
            <Text style={styles.botaoTexto}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    paddingBottom: 24,
  },
  card: {
    width: '46%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  cardActivo: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  cardTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  outraContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    height: 52,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    marginBottom: 12,
  },
  botao: {
    height: 52,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoDesativado: {
    backgroundColor: '#C7D2FE',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
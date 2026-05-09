import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const TOPICOS_MOCK: Record<string, string[]> = {
  'Álgebra Linear': ['Vectores', 'Matrizes', 'Determinantes', 'Sistemas Lineares', 'Espaços Vectoriais', 'Transformações Lineares'],
  'Cálculo': ['Limites', 'Derivadas', 'Integrais', 'Séries', 'Cálculo Multivariável'],
  'Geometria Analítica': ['Plano Cartesiano', 'Distância entre Pontos', 'Equação da Recta', 'Circunferência', 'Cônicas'],
  'Genética': ['DNA e RNA', 'Leis de Mendel', 'Mutações', 'Hereditariedade', 'Genética Molecular'],
  'Mecânica': ['Cinemática', 'Dinâmica', 'Estática', 'Trabalho e Energia', 'Quantidade de Movimento'],
};

const TOPICOS_DEFAULT = ['Introdução', 'Conceitos Fundamentais', 'Aplicações Práticas', 'Exemplos Resolvidos', 'Exercícios'];

export default function TopicosScreen() {
  const router = useRouter();
  const { area, assunto } = useLocalSearchParams<{ area: string; assunto: string }>();

  const topicos = TOPICOS_MOCK[assunto] ?? TOPICOS_DEFAULT;
  const [selecionados, setSelecionados] = useState<string[]>(topicos);
  const [loading, setLoading] = useState(false);

  function toggleTopico(topico: string) {
    setSelecionados(prev =>
      prev.includes(topico)
        ? prev.filter(t => t !== topico)
        : [...prev, topico]
    );
  }

  function selecionarTodos() {
    setSelecionados(topicos);
  }

  function limparSelecao() {
    setSelecionados([]);
  }

  async function handleContinuar() {
    if (selecionados.length === 0) return;
    setLoading(true);
    router.push({
      pathname: '/(tabs)/estudar/conteudo',
      params: {
        area,
        assunto,
        topicos: JSON.stringify(selecionados),
      },
    });
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{assunto}</Text>
          <Text style={styles.subtitulo}>{area}</Text>
        </View>
      </View>

      {/* Instruções */}
      <View style={styles.instrucoes}>
        <Text style={styles.instrucoesTexto}>
          Selecciona os tópicos que queres estudar
        </Text>
        <View style={styles.acoes}>
          <TouchableOpacity onPress={selecionarTodos}>
            <Text style={styles.acaoTexto}>Seleccionar todos</Text>
          </TouchableOpacity>
          <Text style={styles.acaoDivisor}>·</Text>
          <TouchableOpacity onPress={limparSelecao}>
            <Text style={styles.acaoTexto}>Limpar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de tópicos */}
      <ScrollView
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
      >
        {topicos.map((topico) => {
          const activo = selecionados.includes(topico);
          return (
            <TouchableOpacity
              key={topico}
              style={[styles.topicoItem, activo && styles.topicoActivo]}
              onPress={() => toggleTopico(topico)}
            >
              <View style={[styles.checkbox, activo && styles.checkboxActivo]}>
                {activo && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text style={[styles.topicoTexto, activo && styles.topicoTextoActivo]}>
                {topico}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Opção "Começar do zero" */}
        <View style={styles.divisor} />
        <TouchableOpacity
          style={styles.zerarBtn}
          onPress={() => {
            setSelecionados(['Introdução completa — começar do zero']);
            router.push({
              pathname: '/(tabs)/estudar/conteudo',
              params: {
                area,
                assunto,
                topicos: JSON.stringify(['Introdução completa — começar do zero']),
                nivelForcado: 'básico',
              },
            });
          }}
        >
          <Ionicons name="rocket-outline" size={20} color="#4F46E5" />
          <View>
            <Text style={styles.zerarTexto}>Começar do zero</Text>
            <Text style={styles.zerarSub}>Explicação completa do início</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.contagem}>
          {selecionados.length} tópico{selecionados.length !== 1 ? 's' : ''} seleccionado{selecionados.length !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity
          style={[styles.botao, selecionados.length === 0 && styles.botaoDesativado]}
          onPress={handleContinuar}
          disabled={selecionados.length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.botaoTexto}>Gerar conteúdo</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </>
          )}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  instrucoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  instrucoesTexto: {
    fontSize: 13,
    color: '#6B7280',
  },
  acoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acaoTexto: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '500',
  },
  acaoDivisor: {
    color: '#D1D5DB',
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  topicoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  topicoActivo: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActivo: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  topicoTexto: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
  },
  topicoTextoActivo: {
    color: '#4F46E5',
    fontWeight: '500',
  },
  divisor: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  zerarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  zerarTexto: {
    fontSize: 15,
    fontWeight: '500',
    color: '#4F46E5',
  },
  zerarSub: {
    fontSize: 12,
    color: '#818CF8',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  contagem: {
    fontSize: 13,
    color: '#6B7280',
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  botaoDesativado: {
    backgroundColor: '#C7D2FE',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
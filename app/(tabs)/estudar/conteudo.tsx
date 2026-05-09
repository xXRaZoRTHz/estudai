import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Nivel = 'básico' | 'intermediário' | 'avançado';

// Mock do conteúdo gerado pela IA — substituir pela chamada real ao Claude
function gerarConteudoMock(assunto: string, topicos: string[], nivel: Nivel): string {
  return `# ${assunto}

## Introdução
Este conteúdo foi adaptado ao nível **${nivel}** e cobre os seguintes tópicos: ${topicos.join(', ')}.

## ${topicos[0] ?? 'Conceitos Fundamentais'}
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Este é um conceito fundamental de ${assunto} que todo estudante deve dominar.

**Exemplo prático:**
Imagine que estás a resolver um problema do dia a dia usando ${assunto}. Os passos seriam:
1. Identificar o problema
2. Aplicar o conceito
3. Verificar o resultado

## ${topicos[1] ?? 'Aplicações'}
A aplicação prática deste conceito é essencial para compreender ${assunto} de forma profunda.

> 💡 **Dica:** Pratica com exercícios reais para consolidar o conhecimento.

## Conclusão
Dominar ${assunto} abre portas para compreender conceitos mais avançados. Continua a praticar!`;
}

export default function ConteudoScreen() {
  const router = useRouter();
  const { area, assunto, topicos: topicosParam } = useLocalSearchParams<{
    area: string;
    assunto: string;
    topicos: string;
  }>();

  const topicos: string[] = topicosParam ? JSON.parse(topicosParam) : [];

  const [nivel, setNivel] = useState<Nivel>('intermediário');
  const [conteudo, setConteudo] = useState('');
  const [loading, setLoading] = useState(true);
  const [pergunta, setPergunta] = useState('');

  useEffect(() => {
    gerarConteudo();
  }, [nivel]);

  async function gerarConteudo() {
    setLoading(true);
    // Simula tempo de resposta da IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    const texto = gerarConteudoMock(assunto, topicos, nivel);
    setConteudo(texto);
    setLoading(false);
  }

  function handleGerarQuiz() {
    router.push({
      pathname: '/(tabs)/quiz',
      params: { area, assunto, topicos: topicosParam },
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
          <Text style={styles.titulo} numberOfLines={1}>{assunto}</Text>
          <Text style={styles.subtitulo}>{area}</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="download-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Selector de nível */}
      <View style={styles.nivelContainer}>
        {(['básico', 'intermediário', 'avançado'] as Nivel[]).map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.nivelBtn, nivel === n && styles.nivelBtnActivo]}
            onPress={() => setNivel(n)}
          >
            <Text style={[styles.nivelTexto, nivel === n && styles.nivelTextoActivo]}>
              {n.charAt(0).toUpperCase() + n.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Conteúdo */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingTexto}>A gerar conteúdo com IA...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.conteudoScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Tópicos cobertos */}
          <View style={styles.topicosContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {topicos.map((t) => (
                <View key={t} style={styles.topicoBadge}>
                  <Text style={styles.topicoTexto}>{t}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Texto do conteúdo */}
          <ConteudoFormatado texto={conteudo} />

          {/* Acções rápidas */}
          <View style={styles.acoes}>
            <TouchableOpacity style={styles.acaoPrimaria} onPress={handleGerarQuiz}>
              <Ionicons name="help-circle-outline" size={18} color="#fff" />
              <Text style={styles.acaoPrimariaTexto}>Gerar Quiz</Text>
            </TouchableOpacity>
            <View style={styles.acoesSecundarias}>
              <TouchableOpacity style={styles.acaoSecundaria}>
                <Ionicons name="document-text-outline" size={18} color="#4F46E5" />
                <Text style={styles.acaoSecundariaTexto}>Resumir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acaoSecundaria} onPress={gerarConteudo}>
                <Ionicons name="refresh-outline" size={18} color="#4F46E5" />
                <Text style={styles.acaoSecundariaTexto}>Regenerar</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Campo de pergunta */}
          <View style={styles.chatContainer}>
            <Text style={styles.chatTitulo}>Tens dúvidas sobre este conteúdo?</Text>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Pergunta algo sobre este conteúdo..."
                placeholderTextColor="#9CA3AF"
                value={pergunta}
                onChangeText={setPergunta}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendBtn, !pergunta.trim() && styles.sendBtnDesativado]}
                disabled={!pergunta.trim()}
              >
                <Ionicons name="send" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// Componente simples para formatar o markdown
function ConteudoFormatado({ texto }: { texto: string }) {
  const linhas = texto.split('\n');

  return (
    <View style={styles.conteudoTexto}>
      {linhas.map((linha, i) => {
        if (linha.startsWith('# ')) {
          return <Text key={i} style={styles.h1}>{linha.replace('# ', '')}</Text>;
        }
        if (linha.startsWith('## ')) {
          return <Text key={i} style={styles.h2}>{linha.replace('## ', '')}</Text>;
        }
        if (linha.startsWith('> ')) {
          return (
            <View key={i} style={styles.destaque}>
              <Text style={styles.destaqueTexto}>{linha.replace('> ', '')}</Text>
            </View>
          );
        }
        if (linha.startsWith('**') && linha.endsWith('**')) {
          return <Text key={i} style={styles.negrito}>{linha.replace(/\*\*/g, '')}</Text>;
        }
        if (linha.match(/^\d+\./)) {
          return <Text key={i} style={styles.listItem}>{linha}</Text>;
        }
        if (linha.trim() === '') {
          return <View key={i} style={{ height: 8 }} />;
        }
        return <Text key={i} style={styles.paragrafo}>{linha}</Text>;
      })}
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
  iconBtn: {
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitulo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  nivelContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  nivelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  nivelBtnActivo: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  nivelTexto: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  nivelTextoActivo: {
    color: '#4F46E5',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingTexto: {
    fontSize: 15,
    color: '#6B7280',
  },
  conteudoScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topicosContainer: {
    marginBottom: 16,
  },
  topicoBadge: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  topicoTexto: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '500',
  },
  conteudoTexto: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  h1: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    marginTop: 4,
  },
  h2: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
  },
  paragrafo: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
  },
  negrito: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  listItem: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 24,
    paddingLeft: 8,
  },
  destaque: {
    backgroundColor: '#EEF2FF',
    borderLeftWidth: 3,
    borderLeftColor: '#4F46E5',
    borderRadius: 4,
    padding: 12,
    marginVertical: 8,
  },
  destaqueTexto: {
    fontSize: 14,
    color: '#4F46E5',
    fontStyle: 'italic',
  },
  acoes: {
    gap: 10,
    marginBottom: 16,
  },
  acaoPrimaria: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 14,
  },
  acaoPrimariaTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  acoesSecundarias: {
    flexDirection: 'row',
    gap: 10,
  },
  acaoSecundaria: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingVertical: 12,
  },
  acaoSecundariaTexto: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },
  chatContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chatTitulo: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 10,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
  },
  chatTextInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    maxHeight: 100,
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDesativado: {
    backgroundColor: '#C7D2FE',
  },
});
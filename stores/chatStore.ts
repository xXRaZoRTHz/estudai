import { create } from 'zustand';

export interface Mensagem {
  id: string;
  autor: 'user' | 'ia';
  texto: string;
  timestamp: number;
}

export interface Conversa {
  id: string;
  titulo: string;
  mensagens: Mensagem[];
  criadaEm: number;
  actualizadaEm: number;
}

interface ChatState {
  conversas: Conversa[];
  criarConversa: (primeiraMensagem: string) => string;
  adicionarMensagem: (conversaId: string, mensagem: Mensagem) => void;
  apagarConversa: (id: string) => void;
  apagarTodas: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversas: [],

  criarConversa: (primeiraMensagem: string) => {
    const id = Date.now().toString();
    const novaConversa: Conversa = {
      id,
      titulo: primeiraMensagem.substring(0, 50) + (primeiraMensagem.length > 50 ? '...' : ''),
      mensagens: [],
      criadaEm: Date.now(),
      actualizadaEm: Date.now(),
    };
    set(state => ({ conversas: [novaConversa, ...state.conversas] }));
    return id;
  },

  adicionarMensagem: (conversaId, mensagem) => {
    set(state => ({
      conversas: state.conversas.map(c =>
        c.id === conversaId
          ? { ...c, mensagens: [...c.mensagens, mensagem], actualizadaEm: Date.now() }
          : c
      ),
    }));
  },

  apagarConversa: (id) => {
    set(state => ({
      conversas: state.conversas.filter(c => c.id !== id),
    }));
  },

  apagarTodas: () => {
    set({ conversas: [] });
  },
}));
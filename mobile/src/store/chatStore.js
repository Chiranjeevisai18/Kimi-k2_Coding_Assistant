import { create } from 'zustand';
import api from '../services/api';

const useChatStore = create((set, get) => ({
    chats: [],
    currentChat: null,
    messages: [],
    isStreaming: false,
    streamingText: '',
    streamingStatus: 'Thinking...',
    isLoading: false,
    error: null,

    // Fetch all chats
    fetchChats: async () => {
        try {
            set({ isLoading: true });
            const response = await api.get('/chats');
            set({ chats: response.data.chats, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch chats.', isLoading: false });
        }
    },

    // Create a new chat
    createChat: async (title) => {
        try {
            const response = await api.post('/chats', { title });
            const newChat = response.data.chat;
            set((state) => ({ chats: [newChat, ...state.chats], currentChat: newChat }));
            return newChat;
        } catch (error) {
            set({ error: 'Failed to create chat.' });
            return null;
        }
    },

    // Delete a chat
    deleteChat: async (chatId) => {
        try {
            await api.delete(`/chats/${chatId}`);
            set((state) => ({
                chats: state.chats.filter((c) => c._id !== chatId),
                currentChat: state.currentChat?._id === chatId ? null : state.currentChat,
            }));
        } catch (error) {
            set({ error: 'Failed to delete chat.' });
        }
    },

    // Rename chat
    renameChat: async (chatId, title) => {
        try {
            const response = await api.put(`/chats/${chatId}`, { title });
            set((state) => ({
                chats: state.chats.map((c) => (c._id === chatId ? response.data.chat : c)),
                currentChat:
                    state.currentChat?._id === chatId ? response.data.chat : state.currentChat,
            }));
        } catch (error) {
            set({ error: 'Failed to rename chat.' });
        }
    },

    // Set current chat
    setCurrentChat: (chat) => set({ currentChat: chat }),

    // Fetch messages for a chat
    fetchMessages: async (chatId) => {
        try {
            set({ isLoading: true, messages: [] });
            const response = await api.get(`/messages/${chatId}`);
            set({ messages: response.data.messages, isLoading: false });
        } catch (error) {
            set({ error: 'Failed to fetch messages.', isLoading: false });
        }
    },

    // Add a local message (optimistic)
    addMessage: (message) => {
        set((state) => ({ messages: [...state.messages, message] }));
    },

    // Update the streaming text
    appendStreamToken: (token) => {
        set((state) => ({ streamingText: state.streamingText + token }));
    },

    // Set streaming status
    setStreamingStatus: (status) => {
        set({ streamingStatus: status });
    },

    // Start streaming
    startStreaming: () => set({ isStreaming: true, streamingText: '', streamingStatus: 'Thinking...' }),

    // Stop streaming and save the assistant message
    stopStreaming: () => {
        const { streamingText } = get();
        if (streamingText) {
            set((state) => ({
                isStreaming: false,
                messages: [
                    ...state.messages,
                    {
                        _id: Date.now().toString(),
                        role: 'assistant',
                        content: streamingText,
                        created_at: new Date().toISOString(),
                    },
                ],
                streamingText: '',
            }));
        } else {
            set({ isStreaming: false, streamingText: '' });
        }
    },

    clearError: () => set({ error: null }),
}));

export default useChatStore;

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,

    // Initialize auth state from storage
    initialize: async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const user = await AsyncStorage.getItem('user');
            if (token && user) {
                set({
                    token,
                    user: JSON.parse(user),
                    isAuthenticated: true,
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },

    // Register with all API keys
    register: async (email, password, groqApiKey, geminiApiKey, cloudinaryName, cloudinaryKey, cloudinarySecret) => {
        try {
            set({ error: null });
            const response = await api.post('/auth/register', {
                email,
                password,
                groqApiKey,
                geminiApiKey,
                cloudinaryName,
                cloudinaryKey,
                cloudinarySecret,
            });
            const { token, user } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            set({ token, user, isAuthenticated: true, error: null });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Registration failed.';
            set({ error: message });
            return { success: false, error: message };
        }
    },

    // Login
    login: async (email, password) => {
        try {
            set({ error: null });
            const response = await api.post('/auth/login', { email, password });
            const { token, user } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            set({ token, user, isAuthenticated: true, error: null });
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.error || 'Login failed.';
            set({ error: message });
            return { success: false, error: message };
        }
    },

    // Logout
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        set({ user: null, token: null, isAuthenticated: false, error: null });
    },

    clearError: () => set({ error: null }),
}));

export default useAuthStore;

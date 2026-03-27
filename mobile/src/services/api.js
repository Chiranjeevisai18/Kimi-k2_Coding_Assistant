import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../utils/constants';
import EventSource from 'react-native-sse';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for auth errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
            // The auth store will detect this via the initialize check
        }
        return Promise.reject(error);
    }
);

/**
 * Stream chat completion via SSE using fetch
 * @param {string} chatId
 * @param {string} content - user message text
 * @param {object|null} image - image object from expo-image-picker
 * @param {function} onToken - callback for each streamed token
 * @param {function} onStatus - callback for status updates (e.g. OCR)
 * @param {function} onDone - callback when stream is complete
 * @param {function} onError - callback on error
 */
export async function streamChat(chatId, content, images, onToken, onStatus, onDone, onError) {
    try {
        const token = await AsyncStorage.getItem('token');

        let body;
        let headers = { Authorization: `Bearer ${token}` };

        if (images && images.length > 0) {
            // Use FormData for image uploads
            const formData = new FormData();
            formData.append('chat_id', chatId);
            formData.append('content', content);
            images.forEach((image, index) => {
                formData.append('images', {
                    uri: image.uri,
                    type: image.mimeType || 'image/jpeg',
                    name: image.fileName || `image-${index}.jpg`,
                });
            });
            body = formData;
        } else {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify({ chat_id: chatId, content });
        }

        const es = new EventSource(`${API_BASE_URL}/messages/chat/stream`, {
            method: 'POST',
            headers,
            body,
            pollingInterval: 0,
        });

        es.addEventListener('message', (event) => {
            if (event.data) {
                try {
                    const data = JSON.parse(event.data);
                    if (data.done) {
                        es.close();
                        onDone();
                    } else if (data.error) {
                        es.close();
                        onError(data.error);
                    } else if (data.token) {
                        onToken(data.token);
                    } else if (data.status) {
                        if (onStatus) onStatus(data.status);
                    }
                } catch (e) {
                    // console.warn('JSON parse error from stream:', e);
                }
            }
        });

        es.addEventListener('error', (event) => {
            if (event.type === 'error' && event.message) {
                es.close();
                onError('Stream connection failed.');
            } else if (event.type === 'exception') {
                es.close();
                onError('Stream exception.');
            }
        });

    } catch (error) {
        onError(error.message || 'Stream connection failed.');
    }
}

export default api;

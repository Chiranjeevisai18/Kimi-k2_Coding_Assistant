import { Platform } from 'react-native';

// Set your backend URL here
// For Android emulator use 10.0.2.2, for iOS simulator use localhost
// For physical device use your machine's local IP
const DEV_URL = 'http://192.168.1.27:5000'; // Change to your local IP for dev
const PROD_URL = 'https://ai-chat-server-<YOUR_ID>.onrender.com'; // Change to your Render URL

// Toggle this depending on the environment:
export const API_BASE_URL = DEV_URL;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

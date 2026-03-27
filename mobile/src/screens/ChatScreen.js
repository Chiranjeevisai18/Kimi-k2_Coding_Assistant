import React, { useEffect, useRef, useCallback } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Text,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '../theme';
import useChatStore from '../store/chatStore';
import MessageBubble from '../components/MessageBubble';
import StreamingText from '../components/StreamingText';
import ChatInput from '../components/ChatInput';
import ImagePreview from '../components/ImagePreview';
import { streamChat } from '../services/api';

export default function ChatScreen({ route, navigation }) {
    const { chatId, chatTitle } = route.params;
    const flatListRef = useRef(null);

    const {
        messages,
        isStreaming,
        streamingText,
        streamingStatus,
        isLoading,
        fetchMessages,
        addMessage,
        startStreaming,
        stopStreaming,
        appendStreamToken,
        setStreamingStatus,
    } = useChatStore();

    const [inputText, setInputText] = React.useState('');
    const [selectedImages, setSelectedImages] = React.useState([]);

    useEffect(() => {
        fetchMessages(chatId);
    }, [chatId]);

    const handleSend = async () => {
        const text = inputText.trim();
        if (!text || isStreaming) return;

        const images = selectedImages;

        // Clear input
        setInputText('');
        setSelectedImages([]);

        // Add optimistic user message
        addMessage({
            _id: Date.now().toString(),
            role: 'user',
            content: text,
            image_url: images.length > 0 ? images[0].uri : null,
            image_urls: images.map(img => img.uri),
            created_at: new Date().toISOString(),
        });

        // Start streaming
        startStreaming();

        // Stream chat from backend
        await streamChat(
            chatId,
            text,
            images,
            (token) => {
                appendStreamToken(token);
            },
            (status) => {
                setStreamingStatus(status);
            },
            () => {
                stopStreaming();
            },
            (error) => {
                stopStreaming();
                Alert.alert('Error', error);
            }
        );
    };

    const handlePickImage = async () => {
        if (selectedImages.length >= 8) {
            Alert.alert('Limit Reached', 'You can only upload up to 8 images per message.');
            return;
        }

        Alert.alert('Upload Image', 'Choose an option', [
            {
                text: 'Camera',
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Camera permission is required.');
                        return;
                    }
                    const result = await ImagePicker.launchCameraAsync({
                        mediaTypes: ['images'],
                        quality: 0.8,
                        allowsEditing: true,
                    });
                    if (!result.canceled && result.assets[0]) {
                        setSelectedImages([...selectedImages, result.assets[0]].slice(0, 8));
                    }
                },
            },
            {
                text: 'Gallery',
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission needed', 'Gallery permission is required.');
                        return;
                    }
                    const result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ['images'],
                        quality: 0.8,
                        allowsEditing: false,
                        allowsMultipleSelection: true,
                        selectionLimit: 8 - selectedImages.length,
                    });
                    if (!result.canceled && result.assets) {
                        setSelectedImages([...selectedImages, ...result.assets].slice(0, 8));
                    }
                },
            },
            { text: 'Cancel', style: 'cancel' },
        ]);
    };

    const renderMessage = ({ item }) => <MessageBubble message={item} />;

    const renderHeader = () => {
        if (isStreaming && streamingText) {
            return <StreamingText text={streamingText} />;
        }
        if (isStreaming && !streamingText) {
            return (
                <View style={styles.thinkingContainer}>
                    <View style={styles.thinkingBubble}>
                        <ActivityIndicator size="small" color={colors.accent} />
                        <Text style={styles.thinkingText}>{streamingStatus}</Text>
                    </View>
                </View>
            );
        }
        return null;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {chatTitle || 'Chat'}
                    </Text>
                    <View style={styles.statusDot} />
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* Messages */}
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
            >
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <FlatList
                        ref={flatListRef}
                        data={[...messages].reverse()}
                        inverted={true}
                        keyExtractor={(item) => item._id}
                        renderItem={renderMessage}
                        ListHeaderComponent={renderHeader}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Ionicons name="chatbubble-outline" size={48} color={colors.textMuted} />
                                <Text style={styles.emptyText}>Send a message to start chatting</Text>
                            </View>
                        }
                        contentContainerStyle={
                            messages.length === 0 ? styles.emptyList : styles.messageList
                        }
                        showsVerticalScrollIndicator={false}
                    />
                )}

                {/* Image preview */}
                {selectedImages.length > 0 ? (
                    <View style={styles.imagePreviewContainer}>
                        <FlatList
                            data={selectedImages}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={(_, index) => index.toString()}
                            contentContainerStyle={{ paddingHorizontal: spacing.md }}
                            renderItem={({ item, index }) => (
                                <ImagePreview
                                    uri={item.uri}
                                    onRemove={() => {
                                        const newImages = [...selectedImages];
                                        newImages.splice(index, 1);
                                        setSelectedImages(newImages);
                                    }}
                                />
                            )}
                        />
                    </View>
                ) : null}

                {/* Input bar */}
                <ChatInput
                    value={inputText}
                    onChangeText={setInputText}
                    onSend={handleSend}
                    onPickImage={handlePickImage}
                    isStreaming={isStreaming}
                    imageCount={selectedImages.length}
                />
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: 56,
        paddingBottom: spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerCenter: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: spacing.md,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success,
        marginLeft: spacing.sm,
    },
    messageList: {
        paddingTop: spacing.md,
        paddingBottom: spacing.md,
    },
    emptyList: {
        flex: 1,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyText: {
        marginTop: spacing.md,
        fontSize: 14,
        color: colors.textMuted,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thinkingContainer: {
        paddingHorizontal: spacing.md,
        marginBottom: spacing.md,
    },
    thinkingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: colors.assistantBubble,
        borderRadius: 16,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
        marginLeft: 36,
    },
    thinkingText: {
        color: colors.textMuted,
        fontSize: 13,
        marginLeft: spacing.sm,
    },
    imagePreviewContainer: {
        maxHeight: 140,
        backgroundColor: colors.background,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
});

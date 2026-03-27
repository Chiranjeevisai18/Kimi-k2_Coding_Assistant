import React, { useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import useChatStore from '../store/chatStore';

export default function ChatListScreen({ navigation }) {
    const { chats, isLoading, fetchChats, createChat, deleteChat } = useChatStore();
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        fetchChats();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchChats();
        setRefreshing(false);
    }, [fetchChats]);

    const handleNewChat = async () => {
        const chat = await createChat('New Chat');
        if (chat) {
            navigation.navigate('Chat', { chatId: chat._id, chatTitle: chat.title });
        }
    };

    const handleDeleteChat = (chatId, title) => {
        Alert.alert(
            'Delete Chat',
            `Delete "${title}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteChat(chatId),
                },
            ]
        );
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const renderChat = ({ item }) => (
        <TouchableOpacity
            style={styles.chatItem}
            onPress={() => navigation.navigate('Chat', { chatId: item._id, chatTitle: item.title })}
            onLongPress={() => handleDeleteChat(item._id, item.title)}
            activeOpacity={0.7}
        >
            <View style={styles.chatIcon}>
                <Ionicons name="chatbubble-ellipses" size={20} color={colors.primary} />
            </View>
            <View style={styles.chatInfo}>
                <Text style={styles.chatTitle} numberOfLines={1}>
                    {item.title}
                </Text>
                <Text style={styles.chatDate}>{formatDate(item.updated_at || item.created_at)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </TouchableOpacity>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>Start a new chat to begin</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Chats (v2)</Text>
                <TouchableOpacity
                    style={styles.settingsBtn}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Chat List */}
            {isLoading && chats.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={(item) => item._id}
                    renderItem={renderChat}
                    ListEmptyComponent={renderEmpty}
                    contentContainerStyle={chats.length === 0 ? styles.emptyList : styles.list}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB - New Chat */}
            <TouchableOpacity style={styles.fab} onPress={handleNewChat} activeOpacity={0.8}>
                <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    style={styles.fabGradient}
                >
                    <Ionicons name="add" size={28} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingTop: 60,
        paddingBottom: spacing.lg,
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.text,
    },
    settingsBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    emptyList: {
        flex: 1,
    },
    chatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    chatIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    chatInfo: {
        flex: 1,
        marginRight: spacing.sm,
    },
    chatTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    chatDate: {
        fontSize: 12,
        color: colors.textMuted,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    emptyIconBg: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textMuted,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        borderRadius: 30,
        elevation: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

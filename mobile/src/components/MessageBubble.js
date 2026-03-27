import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import MarkdownRenderer from './MarkdownRenderer';

export default function MessageBubble({ message }) {
    const isUser = message.role === 'user';

    return (
        <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
            {!isUser && (
                <View style={styles.avatar}>
                    <Ionicons name="sparkles" size={16} color={colors.accent} />
                </View>
            )}

            <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
                {/* Image preview if present */}
                {message.image_urls && message.image_urls.length > 0 ? (
                    <View style={styles.imagesContainer}>
                        {message.image_urls.map((url, index) => (
                            <Image key={index} source={{ uri: url }} style={[styles.image, message.image_urls.length > 1 ? styles.multiImage : null]} resizeMode="cover" />
                        ))}
                    </View>
                ) : message.image_url ? (
                    <Image source={{ uri: message.image_url }} style={styles.image} resizeMode="cover" />
                ) : null}

                {message.content && message.content.length > 0 ? (
                    <MarkdownRenderer content={message.content} isUser={isUser} />
                ) : null}

                <Text style={styles.time}>
                    {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </Text>
            </View>

            {isUser && (
                <View style={styles.avatarUser}>
                    <Ionicons name="person" size={14} color={colors.primary} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        flexDirection: 'row',
        marginBottom: spacing.md,
        paddingHorizontal: spacing.md,
        alignItems: 'flex-end',
    },
    wrapperUser: {
        justifyContent: 'flex-end',
    },
    wrapperAssistant: {
        justifyContent: 'flex-start',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
        marginBottom: 2,
    },
    avatarUser: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing.sm,
        marginBottom: 2,
    },
    bubble: {
        maxWidth: '75%',
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    userBubble: {
        backgroundColor: colors.userBubble,
        borderBottomRightRadius: 4,
    },
    assistantBubble: {
        backgroundColor: colors.assistantBubble,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    time: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        marginTop: spacing.xs,
        alignSelf: 'flex-end',
    },
    imagesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.sm,
    },
    image: {
        width: '100%',
        height: 180,
        borderRadius: borderRadius.sm,
    },
    multiImage: {
        width: 120,
        height: 120,
    },
});

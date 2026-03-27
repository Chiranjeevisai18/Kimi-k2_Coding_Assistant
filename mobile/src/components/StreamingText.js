import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import MarkdownRenderer from './MarkdownRenderer';

export default function StreamingText({ text }) {
    return (
        <View style={styles.wrapper}>
            <View style={styles.avatar}>
                <Ionicons name="sparkles" size={16} color={colors.accent} />
            </View>
            <View style={styles.bubble}>
                <MarkdownRenderer content={text + ' ▋'} isUser={false} />
            </View>
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
    bubble: {
        maxWidth: '75%',
        backgroundColor: colors.assistantBubble,
        borderRadius: borderRadius.lg,
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
    },
});

import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

export default function ChatInput({
    value,
    onChangeText,
    onSend,
    onPickImage,
    isStreaming,
    imageCount = 0,
}) {
    const canSend = value.trim().length > 0 && !isStreaming;

    return (
        <View style={styles.container}>
            <View style={styles.inputRow}>
                {/* Image picker button */}
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={onPickImage}
                    disabled={isStreaming}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name={imageCount > 0 ? 'images' : 'image-outline'}
                        size={22}
                        color={imageCount > 0 ? colors.accent : colors.textMuted}
                    />
                    {imageCount > 0 ? (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{imageCount}</Text>
                        </View>
                    ) : null}
                </TouchableOpacity>

                {/* Text input */}
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder="Type a message..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    maxLength={4000}
                    editable={!isStreaming}
                />

                {/* Send button */}
                <TouchableOpacity
                    style={[styles.sendBtn, canSend && styles.sendBtnActive]}
                    onPress={onSend}
                    disabled={!canSend}
                    activeOpacity={0.7}
                >
                    {isStreaming ? (
                        <ActivityIndicator size="small" color={colors.textMuted} />
                    ) : (
                        <Ionicons
                            name="arrow-up"
                            size={20}
                            color={canSend ? '#fff' : colors.textMuted}
                        />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.background,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.sm,
        paddingBottom: Platform.OS === 'ios' ? spacing.xxl : spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 48,
    },
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 15,
        maxHeight: 100,
        paddingHorizontal: spacing.sm,
        paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
    },
    sendBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendBtnActive: {
        backgroundColor: colors.primary,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: colors.primary,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.surface,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
});

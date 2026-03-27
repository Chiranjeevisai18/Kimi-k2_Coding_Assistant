import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';

export default function ImagePreview({ uri, onRemove }) {
    if (!uri) return null;

    return (
        <View style={styles.container}>
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
            <TouchableOpacity style={styles.removeBtn} onPress={onRemove} activeOpacity={0.8}>
                <Ionicons name="close" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        margin: spacing.md,
        position: 'relative',
        alignSelf: 'flex-start',
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        borderColor: colors.border,
    },
    removeBtn: {
        position: 'absolute',
        top: -8,
        right: -8,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
});

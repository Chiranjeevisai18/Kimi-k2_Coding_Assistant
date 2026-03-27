import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import useAuthStore from '../store/authStore';

export default function SettingsScreen({ navigation }) {
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    const SettingItem = ({ icon, label, value, onPress, destructive }) => (
        <TouchableOpacity
            style={styles.settingItem}
            onPress={onPress}
            disabled={!onPress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={destructive ? colors.error : colors.primary}
                />
            </View>
            <View style={styles.settingContent}>
                <Text style={[styles.settingLabel, destructive && styles.settingLabelDestructive]}>
                    {label}
                </Text>
                {value && <Text style={styles.settingValue}>{value}</Text>}
            </View>
            {onPress && (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Account Section */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.card}>
                    <SettingItem icon="person-outline" label="Email" value={user?.email} />
                    <View style={styles.divider} />
                    <SettingItem icon="key-outline" label="Groq API Key" value="••••••••••" />
                </View>

                {/* App Section */}
                <Text style={styles.sectionTitle}>App</Text>
                <View style={styles.card}>
                    <SettingItem icon="information-circle-outline" label="Version" value="1.0.0" />
                    <View style={styles.divider} />
                    <SettingItem icon="code-slash-outline" label="Built with" value="Gemini + Groq" />
                </View>

                {/* Actions */}
                <View style={[styles.card, { marginTop: spacing.xxl }]}>
                    <SettingItem
                        icon="log-out-outline"
                        label="Logout"
                        onPress={handleLogout}
                        destructive
                    />
                </View>
            </ScrollView>
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
        paddingHorizontal: spacing.lg,
        paddingTop: 60,
        paddingBottom: spacing.lg,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
    },
    content: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xxxl,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginTop: spacing.xxl,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    settingIconDestructive: {
        backgroundColor: 'rgba(255, 71, 87, 0.1)',
    },
    settingContent: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
        color: colors.text,
    },
    settingLabelDestructive: {
        color: colors.error,
    },
    settingValue: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 2,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 68,
    },
});

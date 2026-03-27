import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius } from '../theme';
import useAuthStore from '../store/authStore';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [groqApiKey, setGroqApiKey] = React.useState('');
    const [geminiApiKey, setGeminiApiKey] = React.useState('');
    const [cloudinaryName, setCloudinaryName] = React.useState('');
    const [cloudinaryKey, setCloudinaryKey] = React.useState('');
    const [cloudinarySecret, setCloudinarySecret] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    // Track which section is expanded
    const [expandedSection, setExpandedSection] = React.useState('account');

    const register = useAuthStore((s) => s.register);

    const handleRegister = async () => {
        if (!email.trim() || !password || !groqApiKey.trim() || !geminiApiKey.trim() ||
            !cloudinaryName.trim() || !cloudinaryKey.trim() || !cloudinarySecret.trim()) {
            Alert.alert('Error', 'All fields are required.');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        const result = await register(
            email.trim(),
            password,
            groqApiKey.trim(),
            geminiApiKey.trim(),
            cloudinaryName.trim(),
            cloudinaryKey.trim(),
            cloudinarySecret.trim()
        );
        setLoading(false);
        if (!result.success) {
            Alert.alert('Registration Failed', result.error);
        }
    };

    const SectionHeader = ({ title, subtitle, section, icon }) => (
        <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setExpandedSection(expandedSection === section ? '' : section)}
            activeOpacity={0.7}
        >
            <View style={styles.sectionIconContainer}>
                <Ionicons name={icon} size={18} color={colors.accent} />
            </View>
            <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionTitle}>{title}</Text>
                <Text style={styles.sectionSubtitle}>{subtitle}</Text>
            </View>
            <Ionicons
                name={expandedSection === section ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
            />
        </TouchableOpacity>
    );

    const SecureInput = ({ placeholder, value, onChangeText, icon, autoCapitalize = 'none' }) => (
        <View style={styles.inputContainer}>
            <Ionicons name={icon} size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                value={value}
                onChangeText={onChangeText}
                autoCapitalize={autoCapitalize}
                autoCorrect={false}
                secureTextEntry={false}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.content}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <LinearGradient
                                colors={[colors.accent, colors.primary]}
                                style={styles.logoGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <Ionicons name="person-add" size={28} color="#fff" />
                            </LinearGradient>
                        </View>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Set up your AI assistant in one step</Text>
                    </View>

                    {/* === Section 1: Account === */}
                    <View style={styles.sectionCard}>
                        <SectionHeader
                            title="Account"
                            subtitle="Email & password"
                            section="account"
                            icon="person-outline"
                        />
                        {expandedSection === 'account' && (
                            <View style={styles.sectionBody}>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email"
                                        placeholderTextColor={colors.textMuted}
                                        value={email}
                                        onChangeText={setEmail}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                </View>
                                <View style={styles.inputContainer}>
                                    <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Password (min 6 chars)"
                                        placeholderTextColor={colors.textMuted}
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={18}
                                            color={colors.textMuted}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* === Section 2: Groq === */}
                    <View style={styles.sectionCard}>
                        <SectionHeader
                            title="Groq API"
                            subtitle="For AI chat responses"
                            section="groq"
                            icon="chatbubble-outline"
                        />
                        {expandedSection === 'groq' && (
                            <View style={styles.sectionBody}>
                                <SecureInput
                                    placeholder="Groq API Key (gsk_...)"
                                    value={groqApiKey}
                                    onChangeText={setGroqApiKey}
                                    icon="key-outline"
                                />
                                <View style={styles.helpBox}>
                                    <Text style={styles.helpText}>
                                        Get your key at <Text style={styles.helpLink}>console.groq.com</Text>
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* === Section 3: Gemini === */}
                    <View style={styles.sectionCard}>
                        <SectionHeader
                            title="Gemini API"
                            subtitle="For image text extraction (OCR)"
                            section="gemini"
                            icon="eye-outline"
                        />
                        {expandedSection === 'gemini' && (
                            <View style={styles.sectionBody}>
                                <SecureInput
                                    placeholder="Gemini API Key"
                                    value={geminiApiKey}
                                    onChangeText={setGeminiApiKey}
                                    icon="key-outline"
                                />
                                <View style={styles.helpBox}>
                                    <Text style={styles.helpText}>
                                        Get your key at <Text style={styles.helpLink}>aistudio.google.com/apikey</Text>
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* === Section 4: Cloudinary === */}
                    <View style={styles.sectionCard}>
                        <SectionHeader
                            title="Cloudinary"
                            subtitle="For image storage"
                            section="cloudinary"
                            icon="cloud-outline"
                        />
                        {expandedSection === 'cloudinary' && (
                            <View style={styles.sectionBody}>
                                <SecureInput
                                    placeholder="Cloud Name"
                                    value={cloudinaryName}
                                    onChangeText={setCloudinaryName}
                                    icon="globe-outline"
                                />
                                <SecureInput
                                    placeholder="API Key"
                                    value={cloudinaryKey}
                                    onChangeText={setCloudinaryKey}
                                    icon="key-outline"
                                />
                                <SecureInput
                                    placeholder="API Secret"
                                    value={cloudinarySecret}
                                    onChangeText={setCloudinarySecret}
                                    icon="shield-outline"
                                />
                                <View style={styles.helpBox}>
                                    <Text style={styles.helpText}>
                                        Get credentials from <Text style={styles.helpLink}>cloudinary.com/console</Text>
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Info banner */}
                    <View style={styles.infoBanner}>
                        <Ionicons name="shield-checkmark" size={16} color={colors.accent} />
                        <Text style={styles.infoText}>
                            All API keys are encrypted with AES-256 and never exposed after registration.
                        </Text>
                    </View>

                    {/* Register button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={[colors.accent, '#00B894']}
                            style={styles.buttonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Create Account</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkHighlight}>Sign In</Text>
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.xl,
        paddingTop: 56,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        marginBottom: spacing.md,
    },
    logoGradient: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    sectionCard: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
    },
    sectionIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    sectionTextContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.text,
    },
    sectionSubtitle: {
        fontSize: 11,
        color: colors.textMuted,
        marginTop: 1,
    },
    sectionBody: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
        gap: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.sm,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        height: 48,
    },
    inputIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: 14,
    },
    helpBox: {
        paddingVertical: spacing.xs,
    },
    helpText: {
        fontSize: 11,
        color: colors.textMuted,
    },
    helpLink: {
        color: colors.accent,
        fontWeight: '600',
    },
    infoBanner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: 'rgba(0, 212, 170, 0.08)',
        borderRadius: borderRadius.sm,
        padding: spacing.md,
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 17,
    },
    button: {
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    linkText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    linkHighlight: {
        color: colors.primary,
        fontWeight: '600',
    },
});

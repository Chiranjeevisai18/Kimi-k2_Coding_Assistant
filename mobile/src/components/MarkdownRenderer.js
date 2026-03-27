import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, spacing } from '../theme';

/**
 * Lightweight Markdown renderer using only standard React Native components.
 * Supports: headers, bold, italic, code blocks, inline code, lists, blockquotes.
 */
const MarkdownRenderer = ({ content, isUser = false }) => {
    if (!content || content.length === 0) return null;

    const textColor = isUser ? '#ffffff' : colors.text;
    const codeBackground = isUser ? 'rgba(255,255,255,0.15)' : colors.surfaceLight;
    const codeBorderColor = isUser ? 'rgba(255,255,255,0.2)' : colors.border;
    const accentColor = isUser ? '#ffffff' : colors.accent;

    const parseInline = (text, key = 0) => {
        const parts = [];
        let remaining = text;
        let idx = 0;

        while (remaining.length > 0) {
            // Bold + Italic ***text***
            let match = remaining.match(/^\*\*\*(.+?)\*\*\*/);
            if (match) {
                parts.push(
                    <Text key={`${key}-${idx}`} style={{ fontWeight: 'bold', fontStyle: 'italic', color: textColor }}>
                        {match[1]}
                    </Text>
                );
                remaining = remaining.slice(match[0].length);
                idx++;
                continue;
            }

            // Bold **text**
            match = remaining.match(/^\*\*(.+?)\*\*/);
            if (match) {
                parts.push(
                    <Text key={`${key}-${idx}`} style={{ fontWeight: 'bold', color: textColor }}>
                        {match[1]}
                    </Text>
                );
                remaining = remaining.slice(match[0].length);
                idx++;
                continue;
            }

            // Italic *text*
            match = remaining.match(/^\*(.+?)\*/);
            if (match) {
                parts.push(
                    <Text key={`${key}-${idx}`} style={{ fontStyle: 'italic', color: textColor }}>
                        {match[1]}
                    </Text>
                );
                remaining = remaining.slice(match[0].length);
                idx++;
                continue;
            }

            // Inline code `code`
            match = remaining.match(/^`([^`]+)`/);
            if (match) {
                parts.push(
                    <Text
                        key={`${key}-${idx}`}
                        style={{
                            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                            backgroundColor: codeBackground,
                            paddingHorizontal: 4,
                            borderRadius: 3,
                            fontSize: 13,
                            color: textColor,
                        }}
                    >
                        {match[1]}
                    </Text>
                );
                remaining = remaining.slice(match[0].length);
                idx++;
                continue;
            }

            // Plain text (consume until next special char)
            match = remaining.match(/^[^*`]+/);
            if (match) {
                parts.push(
                    <Text key={`${key}-${idx}`} style={{ color: textColor }}>
                        {match[0]}
                    </Text>
                );
                remaining = remaining.slice(match[0].length);
                idx++;
                continue;
            }

            // Fallback: single char
            parts.push(
                <Text key={`${key}-${idx}`} style={{ color: textColor }}>
                    {remaining[0]}
                </Text>
            );
            remaining = remaining.slice(1);
            idx++;
        }

        return parts;
    };

    const lines = content.split('\n');
    const elements = [];
    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        // Code block ```
        if (line.trimStart().startsWith('```')) {
            const codeLines = [];
            const langMatch = line.trimStart().match(/^```(\w*)/);
            i++;
            while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            i++; // skip closing ```

            elements.push(
                <View
                    key={`block-${i}`}
                    style={{
                        backgroundColor: codeBackground,
                        borderRadius: 8,
                        padding: spacing.sm,
                        marginVertical: spacing.xs,
                        borderWidth: 1,
                        borderColor: codeBorderColor,
                    }}
                >
                    <Text
                        style={{
                            fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
                            fontSize: 12.5,
                            color: textColor,
                            lineHeight: 18,
                        }}
                    >
                        {codeLines.join('\n')}
                    </Text>
                </View>
            );
            continue;
        }

        // Empty line
        if (line.trim() === '') {
            elements.push(<View key={`space-${i}`} style={{ height: 6 }} />);
            i++;
            continue;
        }

        // Headers
        const headerMatch = line.match(/^(#{1,3})\s+(.+)/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const sizes = { 1: 20, 2: 18, 3: 16 };
            elements.push(
                <Text
                    key={`h-${i}`}
                    style={{
                        fontSize: sizes[level],
                        fontWeight: 'bold',
                        color: textColor,
                        marginTop: spacing.sm,
                        marginBottom: spacing.xs,
                    }}
                >
                    {parseInline(headerMatch[2], `h-${i}`)}
                </Text>
            );
            i++;
            continue;
        }

        // Blockquote
        if (line.trimStart().startsWith('> ')) {
            elements.push(
                <View
                    key={`bq-${i}`}
                    style={{
                        borderLeftWidth: 3,
                        borderLeftColor: accentColor,
                        paddingLeft: spacing.sm,
                        marginVertical: spacing.xs,
                    }}
                >
                    <Text style={{ color: textColor, fontStyle: 'italic', fontSize: 14.5, lineHeight: 21 }}>
                        {parseInline(line.replace(/^\s*>\s*/, ''), `bq-${i}`)}
                    </Text>
                </View>
            );
            i++;
            continue;
        }

        // Unordered list item
        const ulMatch = line.match(/^\s*[-*+]\s+(.+)/);
        if (ulMatch) {
            elements.push(
                <View key={`ul-${i}`} style={{ flexDirection: 'row', marginBottom: 2, paddingLeft: spacing.sm }}>
                    <Text style={{ color: accentColor, marginRight: spacing.xs, fontSize: 14.5 }}>{'•'}</Text>
                    <Text style={{ color: textColor, fontSize: 14.5, lineHeight: 21, flex: 1 }}>
                        {parseInline(ulMatch[1], `ul-${i}`)}
                    </Text>
                </View>
            );
            i++;
            continue;
        }

        // Ordered list item
        const olMatch = line.match(/^\s*(\d+)[.)]\s+(.+)/);
        if (olMatch) {
            elements.push(
                <View key={`ol-${i}`} style={{ flexDirection: 'row', marginBottom: 2, paddingLeft: spacing.sm }}>
                    <Text style={{ color: accentColor, marginRight: spacing.xs, fontSize: 14.5, fontWeight: '600' }}>
                        {olMatch[1]}.
                    </Text>
                    <Text style={{ color: textColor, fontSize: 14.5, lineHeight: 21, flex: 1 }}>
                        {parseInline(olMatch[2], `ol-${i}`)}
                    </Text>
                </View>
            );
            i++;
            continue;
        }

        // Horizontal rule
        if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
            elements.push(
                <View
                    key={`hr-${i}`}
                    style={{
                        height: 1,
                        backgroundColor: codeBorderColor,
                        marginVertical: spacing.sm,
                    }}
                />
            );
            i++;
            continue;
        }

        // Regular paragraph
        elements.push(
            <Text key={`p-${i}`} style={{ color: textColor, fontSize: 14.5, lineHeight: 21 }}>
                {parseInline(line, `p-${i}`)}
            </Text>
        );
        i++;
    }

    return <View>{elements}</View>;
};

export default MarkdownRenderer;

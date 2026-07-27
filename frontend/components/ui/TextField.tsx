import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing, typography } from '../../theme/typography';

type Props = TextInputProps & {
  label?: string;
  labelColor?: string;
};

export default function TextField({ label, labelColor = colors.textSecondary, style, ...rest }: Props) {
  return (
    <View style={{ gap: 6 }}>
      {label && <Text style={[typography.captionBold, { color: labelColor }]}>{label}</Text>}
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[styles.input, style]}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 50,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
  },
});
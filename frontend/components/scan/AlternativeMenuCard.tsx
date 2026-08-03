import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Card from '../ui/Card';
import StatusBadge from '../ui/StatusBadge';
import { AlternativeItem } from '../../constants/mock-data';
import { colors } from '../../theme/colors';
import { spacing, typography } from '../../theme/typography';

type Props = {
  items: AlternativeItem[];
  onSelect?: (item: AlternativeItem) => void;
};

export default function AlternativeMenuSection({ items, onSelect }: Props) {
  if (!items.length) return null;

  return (
    <View style={{ marginTop:spacing.sm}}>
      <View style={{ gap: spacing.sm }}>
        {items.map((item) => (
          <Pressable key={item.id} onPress={() => onSelect?.(item)}>
            <Card style={styles.row} padding={14}>
              <View style={{ flex: 1 }}>
                <Text style={typography.bodyBold}>{item.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]} numberOfLines={2}>
                  {item.reason}
                </Text>
              </View>
              <StatusBadge level={item.level} />
            </Card>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
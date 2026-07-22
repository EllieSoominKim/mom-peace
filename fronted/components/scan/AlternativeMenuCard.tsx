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
    <View style={{ marginTop: spacing.lg }}>
      <Text style={typography.h3}>대신 이건 어때요?</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.sm }]}>
        오늘 잔여 허용량 안에서 즐길 수 있는 대체 메뉴예요
      </Text>

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

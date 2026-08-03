import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Card from '../ui/Card';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

export interface FoodItem {
  id: string;
  name: string;
  amount: string;
  time: string;
  category: string;
}

interface TodayFoodCardProps {
  items: FoodItem[];
  onAddPress?: () => void;
  onItemPress?: (item: FoodItem) => void;
  onDeletePress?: (id: string) => void; // 삭제 처리 콜백 함수
}

export default function TodayFoodCard({
  items,
  onAddPress,
  onItemPress,
  onDeletePress,
}: TodayFoodCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Image
            source={require('../../assets/images/food.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.title}>오늘의 섭취</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonText}>+ 추가하기</Text>
        </TouchableOpacity>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>오늘 섭취한 음식이 없습니다.</Text>
          <Text style={styles.emptySubText}>음식을 검색하거나 스캔해서 기록해보세요!</Text>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {items.map((item, index) => (
            <View
              key={item.id || index}
              style={[
                styles.foodItem,
                index === items.length - 1 && styles.lastFoodItem,
              ]}
            >
              {/* 메인 식품 정보 영역 */}
              <TouchableOpacity
                style={styles.foodItemMain}
                onPress={() => onItemPress && onItemPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodSubInfo}>
                    {item.time} · {item.amount}
                  </Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </TouchableOpacity>

              {/* 우측 삭제 (X) 버튼 */}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => onDeletePress && onDeletePress(item.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  title: {
    ...typography.subtitle1,
    color: colors.textPrimary,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },
  addButtonText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptySubText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  listContainer: {
    gap: 0,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  foodItemMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 8,
  },
  lastFoodItem: {
    borderBottomWidth: 0,
  },
  foodInfo: {
    gap: 4,
    flex: 1,
  },
  foodName: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  foodSubInfo: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: colors.gray100,
    marginLeft: 8,
  },
  categoryText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  deleteButton: {
    padding: 6,
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    color: colors.textTertiary,
    fontWeight: 'bold',
  },
});
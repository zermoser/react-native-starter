import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
  icon: string;
  color: string;
}

interface Goal {
  id: number;
  title: string;
  currentAmount: number;
  targetAmount: number;
  icon: string;
  color: string;
}

const ExpenseCategoryCard: React.FC<{ category: ExpenseCategory }> = ({ category }) => (
  <View style={styles.categoryCard}>
    <View style={styles.categoryHeader}>
      <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
        <Ionicons name={category.icon as any} size={24} color="white" />
      </View>
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{category.name}</Text>
        <Text style={styles.categoryAmount}>฿{category.amount.toLocaleString()}</Text>
      </View>
      <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
    </View>
    <View style={styles.progressBarContainer}>
      <View
        style={[
          styles.progressBar,
          { width: `${category.percentage}%`, backgroundColor: category.color },
        ]}
      />
    </View>
  </View>
);

const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
  const progress = (goal.currentAmount / goal.targetAmount) * 100;

  // If color provided as hex like '#3498db', append alpha '80' works for gradient stop
  const secondColor = goal.color.endsWith('80') ? goal.color : `${goal.color}80`;

  return (
    <TouchableOpacity style={styles.goalCard} activeOpacity={0.9}>
      <LinearGradient
        colors={[goal.color, secondColor]}
        style={styles.goalGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.goalHeader}>
          <Ionicons name={goal.icon as any} size={28} color="white" />
          <Text style={styles.goalTitle}>{goal.title}</Text>
        </View>
        <View style={styles.goalProgress}>
          <Text style={styles.goalAmount}>
            ฿{goal.currentAmount.toLocaleString()} / ฿{goal.targetAmount.toLocaleString()}
          </Text>
          <View style={styles.goalProgressBarContainer}>
            <View
              style={[styles.goalProgressBar, { width: `${Math.min(progress, 100)}%` }]}
            />
          </View>
          <Text style={styles.goalPercentage}>{Math.round(progress)}% สำเร็จ</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function FinanceExploreScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('เดือนนี้');
  const periods = ['สัปดาห์นี้', 'เดือนนี้', '3 เดือน', '6 เดือน'];

  const expenseCategories: ExpenseCategory[] = [
    { name: 'อาหาร & เครื่องดื่ม', amount: 4500, percentage: 35, icon: 'restaurant', color: '#FF6B6B' },
    { name: 'คมนาคม', amount: 2800, percentage: 22, icon: 'car', color: '#4ECDC4' },
    { name: 'ช้อปปิ้ง', amount: 2200, percentage: 17, icon: 'bag', color: '#45B7D1' },
    { name: 'ความบันเทิง', amount: 1800, percentage: 14, icon: 'game-controller', color: '#96CEB4' },
    { name: 'สุขภาพ', amount: 1200, percentage: 9, icon: 'medkit', color: '#FECA57' },
    { name: 'อื่น ๆ', amount: 400, percentage: 3, icon: 'ellipsis-horizontal', color: '#95a5a6' },
  ];

  const savingsGoals: Goal[] = [
    {
      id: 1,
      title: 'กองทุนฉุกเฉิน',
      currentAmount: 75000,
      targetAmount: 100000,
      icon: 'shield-checkmark',
      color: '#3498db',
    },
    {
      id: 2,
      title: 'ท่องเที่ยวญี่ปุ่น',
      currentAmount: 32000,
      targetAmount: 80000,
      icon: 'airplane',
      color: '#e74c3c',
    },
    {
      id: 3,
      title: 'ซื้อรถใหม่',
      currentAmount: 150000,
      targetAmount: 500000,
      icon: 'car-sport',
      color: '#2ecc71',
    },
  ];

  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <Text style={styles.headerTitle}>สำรวจ & วิเคราะห์</Text>
        <Text style={styles.headerSubtitle}>ข้อมูลการใช้จ่ายและเป้าหมายของคุณ</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[
                styles.periodButton,
                selectedPeriod === period && styles.selectedPeriodButton,
              ]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text
                style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.selectedPeriodButtonText,
                ]}
              >
                {period}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Expense Overview */}
      <View style={styles.overviewContainer}>
        <LinearGradient colors={['#FF6B6B', '#FF8E8E']} style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Ionicons name="pie-chart" size={32} color="white" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.overviewTitle}>รายจ่ายรวม</Text>
              <Text style={styles.overviewAmount}>฿{totalExpenses.toLocaleString()}</Text>
            </View>
          </View>
          <Text style={styles.overviewSubtext}>เพิ่มขึ้น 12% จากเดือนที่แล้ว</Text>
        </LinearGradient>
      </View>

      {/* Expense Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>หมวดหมู่รายจ่าย</Text>
        {expenseCategories.map((category, index) => (
          <ExpenseCategoryCard key={index} category={category} />
        ))}
      </View>

      {/* Savings Goals */}
      <View style={styles.goalsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>เป้าหมายการออม</Text>
          <TouchableOpacity>
            <Text style={styles.addGoalText}>+ เพิ่มเป้าหมาย</Text>
          </TouchableOpacity>
        </View>
        {savingsGoals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </View>

      {/* Financial Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>เคล็ดลับการเงิน</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="bulb" size={24} color="#F39C12" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>ประหยัดค่าอาหาร</Text>
            <Text style={styles.tipDescription}>
              ลองทำอาหารที่บ้านบ่อยขึ้น จะช่วยลดค่าใช้จ่ายได้เดือนละ 2,000-3,000 บาท
            </Text>
          </View>
        </View>

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons name="trending-up" size={24} color="#27AE60" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>การลงทุนระยะยาว</Text>
            <Text style={styles.tipDescription}>
              เริ่มลงทุนในกองทุนรวมหุ้นระยะยาว เพื่อสร้างความมั่งคั่งในอนาคต
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  periodSelector: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: '#E3E8F0',
    borderRadius: 20,
  },
  selectedPeriodButton: {
    backgroundColor: '#667eea',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  selectedPeriodButtonText: {
    color: 'white',
  },
  overviewContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  overviewCard: {
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  overviewAmount: {
    fontSize: 28,
    color: 'white',
    fontWeight: 'bold',
  },
  overviewSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  categoryAmount: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  categoryPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#ECF0F1',
    borderRadius: 3,
    marginTop: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  goalsContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addGoalText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  goalCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  goalGradient: {
    padding: 20,
    borderRadius: 16,
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  goalProgress: {
    // spacing between progress items
    marginTop: 4,
  },
  goalAmount: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 8,
  },
  goalProgressBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  goalProgressBar: {
    height: 8,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  goalPercentage: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginTop: 8,
  },
  tipsContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'flex-start',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF9F0',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 80,
  },
});

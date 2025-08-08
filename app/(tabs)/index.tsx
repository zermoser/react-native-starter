import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import type { ColorValue } from 'react-native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface TransactionCardProps {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  icon: string;
  color: string;
}

interface StatCardProps {
  title: string;
  amount: number;
  icon: string;
  // match expo-linear-gradient's type: readonly tuple with at least 2 colors
  gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  type,
  category,
  amount,
  icon,
  color,
}) => (
  <View style={styles.transactionCard}>
    <View style={[styles.iconContainer, { backgroundColor: color }]}>
      <Ionicons name={icon as any} size={24} color="white" />
    </View>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionCategory}>{category}</Text>
      <Text
        style={[
          styles.transactionAmount,
          { color: type === 'income' ? '#4CAF50' : '#F44336' },
        ]}
      >
        {type === 'income' ? '+' : '-'}฿{amount.toLocaleString()}
      </Text>
    </View>
  </View>
);

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, gradient }) => (
  <TouchableOpacity style={styles.statCardContainer}>
    <LinearGradient
      colors={gradient}
      style={styles.statCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.statCardHeader}>
        <Ionicons name={icon as any} size={24} color="white" />
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <Text style={styles.statAmount}>฿{amount.toLocaleString()}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export default function FinanceHomeScreen() {
  const balance = 45750;
  const income = 28500;
  const expenses = 12300;

  const recentTransactions = [
    {
      type: 'expense' as const,
      category: 'อาหาร & เครื่องดื่ม',
      amount: 450,
      icon: 'restaurant',
      color: '#FF6B6B',
    },
    {
      type: 'income' as const,
      category: 'เงินเดือน',
      amount: 25000,
      icon: 'wallet',
      color: '#4ECDC4',
    },
    {
      type: 'expense' as const,
      category: 'คมนาคม',
      amount: 120,
      icon: 'car',
      color: '#45B7D1',
    },
    {
      type: 'expense' as const,
      category: 'ช้อปปิ้ง',
      amount: 2300,
      icon: 'bag',
      color: '#96CEB4',
    },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>สวัสดี! 👋</Text>
            <Text style={styles.username}>คุณมอส</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>ยอดคงเหลือรวม</Text>
          <Text style={styles.balanceAmount}>฿{balance.toLocaleString()}</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity style={[styles.actionButton, styles.incomeButton]}>
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>เพิ่ม</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.expenseButton]}>
              <Ionicons name="remove-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>จ่าย</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="รายรับ"
          amount={income}
          icon="trending-up"
          gradient={['#56CCF2', '#2F80ED'] as const}
        />
        <StatCard
          title="รายจ่าย"
          amount={expenses}
          icon="trending-down"
          gradient={['#FF6B6B', '#EE5A52'] as const}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>การดำเนินการด่วน</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' }]}>
              <Ionicons name="card" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>โอน</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#45B7D1' }]}>
              <Ionicons name="phone-portrait" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>เติมเงิน</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#96CEB4' }]}>
              <Ionicons name="receipt" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>บิล</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickActionButton}>
            <View style={[styles.quickActionIcon, { backgroundColor: '#FECA57' }]}>
              <Ionicons name="analytics" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>รายงาน</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions */}
      <View style={styles.transactionsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>รายการล่าสุด</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((transaction, index) => (
          <TransactionCard
            key={index}
            type={transaction.type}
            category={transaction.category}
            amount={transaction.amount}
            icon={transaction.icon}
            color={transaction.color}
          />
        ))}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },
  username: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  profileButton: {
    opacity: 0.9,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    textAlign: 'center',
  },
  balanceAmount: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  incomeButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  expenseButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginTop: -20,
    zIndex: 1,
  },
  statCardContainer: {
    flex: 1,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  statAmount: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  transactionsContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCategory: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 100,
  },
});

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import type { ColorValue } from 'react-native';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  icon: string;
  color: string;
  date: Date;
  description?: string;
}

interface TransactionCardProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

interface StatCardProps {
  title: string;
  amount: number;
  icon: string;
  gradient: readonly [ColorValue, ColorValue, ...ColorValue[]];
  onPress: () => void;
}

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'income' | 'expense';
  onAdd: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
}

const categories = {
  income: [
    { name: 'เงินเดือน', icon: 'wallet', color: '#4ECDC4' },
    { name: 'โบนัส', icon: 'gift', color: '#45B7D1' },
    { name: 'ขายของ', icon: 'storefront', color: '#96CEB4' },
    { name: 'ลงทุน', icon: 'trending-up', color: '#FECA57' },
    { name: 'อื่นๆ', icon: 'cash', color: '#FF9FF3' },
  ],
  expense: [
    { name: 'อาหาร & เครื่องดื่ม', icon: 'restaurant', color: '#FF6B6B' },
    { name: 'คมนาคม', icon: 'car', color: '#45B7D1' },
    { name: 'ช้อปปิ้ง', icon: 'bag', color: '#96CEB4' },
    { name: 'บันเทิง', icon: 'game-controller', color: '#FECA57' },
    { name: 'สุขภาพ', icon: 'medical', color: '#FF9FF3' },
    { name: 'การศึกษา', icon: 'school', color: '#54A0FF' },
    { name: 'บิลประจำ', icon: 'receipt', color: '#FF6348' },
    { name: 'อื่นๆ', icon: 'ellipsis-horizontal', color: '#778CA3' },
  ],
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  visible,
  onClose,
  type,
  onAdd,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleAdd = () => {
    if (!selectedCategory || !amount) {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณาเลือกหมวดหมู่และใส่จำนวนเงิน');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('จำนวนเงินไม่ถูกต้อง', 'กรุณาใส่จำนวนเงินที่ถูกต้อง');
      return;
    }

    onAdd({
      type,
      category: selectedCategory.name,
      amount: numAmount,
      icon: selectedCategory.icon,
      color: selectedCategory.color,
      description: description || undefined,
    });

    // Reset form
    setSelectedCategory(null);
    setAmount('');
    setDescription('');
    onClose();
  };

  const categoryList = categories[type];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {type === 'income' ? 'เพิ่มรายรับ' : 'เพิ่มรายจ่าย'}
          </Text>
          <TouchableOpacity onPress={handleAdd}>
            <Text style={styles.saveButton}>บันทึก</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <Text style={styles.sectionLabel}>เลือกหมวดหมู่</Text>
          <View style={styles.categoryGrid}>
            {categoryList.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryButton,
                  selectedCategory?.name === cat.name && styles.selectedCategory,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color }]}>
                  <Ionicons name={cat.icon as any} size={24} color="white" />
                </View>
                <Text style={styles.categoryText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionLabel}>จำนวนเงิน (฿)</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholderTextColor="#BDC3C7"
          />

          <Text style={styles.sectionLabel}>หมายเหตุ (ไม่บังคับ)</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="เพิ่มหมายเหตุ..."
            value={description}
            onChangeText={setDescription}
            multiline
            placeholderTextColor="#BDC3C7"
          />
        </ScrollView>
      </View>
    </Modal>
  );
};

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.transactionCard}
    onPress={() => onPress(transaction)}
  >
    <View style={[styles.iconContainer, { backgroundColor: transaction.color }]}>
      <Ionicons name={transaction.icon as any} size={24} color="white" />
    </View>
    <View style={styles.transactionInfo}>
      <Text style={styles.transactionCategory}>{transaction.category}</Text>
      <Text
        style={[
          styles.transactionAmount,
          { color: transaction.type === 'income' ? '#4CAF50' : '#F44336' },
        ]}
      >
        {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
      </Text>
      {transaction.description && (
        <Text style={styles.transactionDescription}>{transaction.description}</Text>
      )}
    </View>
    <Text style={styles.transactionTime}>
      {transaction.date.toLocaleDateString('th-TH', {
        day: '2-digit',
        month: 'short',
      })}
    </Text>
  </TouchableOpacity>
);

const StatCard: React.FC<StatCardProps> = ({ title, amount, icon, gradient, onPress }) => (
  <TouchableOpacity style={styles.statCardContainer} onPress={onPress}>
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
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'expense',
      category: 'อาหาร & เครื่องดื่ม',
      amount: 450,
      icon: 'restaurant',
      color: '#FF6B6B',
      date: new Date(2024, 7, 8),
      description: 'อาหารเที่ยง',
    },
    {
      id: '2',
      type: 'income',
      category: 'เงินเดือน',
      amount: 25000,
      icon: 'wallet',
      color: '#4ECDC4',
      date: new Date(2024, 7, 1),
    },
    {
      id: '3',
      type: 'expense',
      category: 'คมนาคม',
      amount: 120,
      icon: 'car',
      color: '#45B7D1',
      date: new Date(2024, 7, 7),
      description: 'ค่าแท็กซี่',
    },
    {
      id: '4',
      type: 'expense',
      category: 'ช้อปปิ้ง',
      amount: 2300,
      icon: 'bag',
      color: '#96CEB4',
      date: new Date(2024, 7, 5),
      description: 'เสื้อผ้า',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<'income' | 'expense'>('income');

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  const handleAddTransaction = (newTransaction: Omit<Transaction, 'id' | 'date'>) => {
    const transaction: Transaction = {
      ...newTransaction,
      id: Date.now().toString(),
      date: new Date(),
    };
    setTransactions(prev => [transaction, ...prev]);
  };

  const handleQuickAction = (action: string) => {
    const messages = {
      transfer: 'โอนเงิน - ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้',
      topup: 'เติมเงิน - ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้',
      bills: 'ชำระบิล - ฟีเจอร์นี้จะเปิดใช้งานเร็วๆ นี้',
      reports: 'รายงาน - กำลังพัฒนา Dashboard รายละเอียด',
    };
    Alert.alert('การดำเนินการ', messages[action as keyof typeof messages]);
  };

  const showTransactionDetail = (transaction: Transaction) => {
    Alert.alert(
      'รายละเอียดรายการ',
      `หมวดหมู่: ${transaction.category}\n` +
      `จำนวน: ฿${transaction.amount.toLocaleString()}\n` +
      `วันที่: ${transaction.date.toLocaleDateString('th-TH')}\n` +
      `${transaction.description ? `หมายเหตุ: ${transaction.description}` : ''}`,
      [
        { text: 'ลบรายการ', style: 'destructive', onPress: () => deleteTransaction(transaction.id) },
        { text: 'ตกลง', style: 'default' },
      ]
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const showStatDetail = (type: 'income' | 'expense') => {
    const filteredTransactions = transactions.filter(t => t.type === type);
    const total = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    
    Alert.alert(
      type === 'income' ? 'รายรับทั้งหมด' : 'รายจ่ายทั้งหมด',
      `รวมทั้งหมด: ฿${total.toLocaleString()}\n` +
      `จำนวนรายการ: ${filteredTransactions.length} รายการ\n\n` +
      filteredTransactions.slice(0, 3).map(t => `• ${t.category}: ฿${t.amount.toLocaleString()}`).join('\n')
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>สวัสดี! 👋</Text>
            <Text style={styles.username}>คุณมอส</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => Alert.alert('โปรไฟล์', 'ฟีเจอร์จัดการโปรไฟล์จะเปิดใช้งานเร็วๆ นี้')}
          >
            <Ionicons name="person-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>ยอดคงเหลือรวม</Text>
          <Text style={styles.balanceAmount}>฿{balance.toLocaleString()}</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.incomeButton]}
              onPress={() => {
                setModalType('income');
                setShowAddModal(true);
              }}
            >
              <Ionicons name="add-circle" size={20} color="white" />
              <Text style={styles.actionButtonText}>เพิ่ม</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.expenseButton]}
              onPress={() => {
                setModalType('expense');
                setShowAddModal(true);
              }}
            >
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
          amount={totalIncome}
          icon="trending-up"
          gradient={['#56CCF2', '#2F80ED'] as const}
          onPress={() => showStatDetail('income')}
        />
        <StatCard
          title="รายจ่าย"
          amount={totalExpense}
          icon="trending-down"
          gradient={['#FF6B6B', '#EE5A52'] as const}
          onPress={() => showStatDetail('expense')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>การดำเนินการด่วน</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('transfer')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#4ECDC4' }]}>
              <Ionicons name="card" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>โอน</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('topup')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#45B7D1' }]}>
              <Ionicons name="phone-portrait" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>เติมเงิน</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('bills')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#96CEB4' }]}>
              <Ionicons name="receipt" size={24} color="white" />
            </View>
            <Text style={styles.quickActionText}>บิล</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => handleQuickAction('reports')}
          >
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
          <TouchableOpacity onPress={() => Alert.alert('รายการทั้งหมด', `คุณมีรายการทั้งหมด ${transactions.length} รายการ`)}>
            <Text style={styles.seeAllText}>ดูทั้งหมด</Text>
          </TouchableOpacity>
        </View>

        {transactions.slice(0, 10).map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            onPress={showTransactionDetail}
          />
        ))}
      </View>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        type={modalType}
        onAdd={handleAddTransaction}
      />

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
  transactionDescription: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: '#BDC3C7',
  },
  bottomSpacing: {
    height: 100,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    marginTop: 20,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    width: '30%',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedCategory: {
    borderColor: '#667eea',
    borderWidth: 2,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  amountInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  descriptionInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    minHeight: 100,
    textAlignVertical: 'top',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
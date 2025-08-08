import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Types ---
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

interface FinancialTip {
  id: number;
  title: string;
  description: string;
  icon: string;
  color: string;
}

// --- Small helper components ---
const AnimatedTouchable: React.FC<{
  children: React.ReactNode;
  onPress?: () => void;
  style?: any;
}> = ({ children, onPress, style }) => {
  const anim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(anim, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(anim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: anim }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- Cards ---
const ExpenseCategoryCard: React.FC<{
  category: ExpenseCategory;
  onPress: () => void;
  animatedValue: Animated.Value;
}> = ({ category, onPress, animatedValue }) => {
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.96],
  });

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <View style={styles.categoryHeader}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon as any} size={22} color="white" />
          </View>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.categoryAmount}>฿{category.amount.toLocaleString()}</Text>
          </View>
          <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground} />
          <Animated.View
            style={[
              styles.progressBar,
              { width: `${Math.min(Math.max(category.percentage, 0), 100)}%`, backgroundColor: category.color },
            ]}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const GoalCard: React.FC<{
  goal: Goal;
  onPress: () => void;
  onAddMoney: () => void;
  animValue: Animated.Value; // 0..1
}> = ({ goal, onPress, onAddMoney, animValue }) => {
  const secondColor = goal.color.endsWith('80') ? goal.color : `${goal.color}80`;

  const widthInterpolated = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressPercent = Math.min(goal.currentAmount / Math.max(goal.targetAmount, 1), 1) * 100;

  return (
    <TouchableOpacity style={styles.goalCard} activeOpacity={0.95} onPress={onPress}>
      <LinearGradient
        colors={[goal.color, secondColor]}
        style={styles.goalGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.goalHeader}>
          <Ionicons name={goal.icon as any} size={26} color="white" />
          <Text style={styles.goalTitle}>{goal.title}</Text>
        </View>

        <View style={styles.goalProgress}>
          <Text style={styles.goalAmount}>
            ฿{goal.currentAmount.toLocaleString()} / ฿{goal.targetAmount.toLocaleString()}
          </Text>

          <View style={styles.goalProgressBarContainer}>
            <View style={styles.goalProgressBarBackground} />
            <Animated.View
              style={[
                styles.goalProgressBar,
                {
                  width: widthInterpolated,
                },
              ]}
            />
          </View>

          <View style={styles.goalFooter}>
            <Text style={styles.goalPercentage}>{Math.round(progressPercent)}% สำเร็จ</Text>
            <TouchableOpacity style={styles.addMoneyButton} onPress={onAddMoney}>
              <Ionicons name="add-circle" size={18} color="white" />
              <Text style={styles.addMoneyText}>เติมเงิน</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const TipCard: React.FC<{
  tip: FinancialTip;
  isExpanded: boolean;
  onPress: () => void;
}> = ({ tip, isExpanded, onPress }) => (
  <TouchableOpacity style={styles.tipCard} onPress={onPress} activeOpacity={0.9}>
    <View style={[styles.tipIcon, { backgroundColor: `${tip.color}20` }]}>
      <Ionicons name={tip.icon as any} size={22} color={tip.color} />
    </View>
    <View style={styles.tipContent}>
      <Text style={styles.tipTitle}>{tip.title}</Text>
      <Text style={styles.tipDescription} numberOfLines={isExpanded ? undefined : 2}>
        {tip.description}
      </Text>
      <Text style={[styles.expandText, { color: tip.color }]}>{isExpanded ? 'ซ่อน' : 'อ่านเพิ่มเติม'}</Text>
    </View>
  </TouchableOpacity>
);

// --- Main Screen ---
export default function FinanceExploreScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState('เดือนนี้');
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [expandedTips, setExpandedTips] = useState<number[]>([]);

  // animated values for category press feedback
  const [animatedValues] = useState<Animated.Value[]>(() => Array(6).fill(0).map(() => new Animated.Value(0)));

  const periods = ['สัปดาห์นี้', 'เดือนนี้', '3 เดือน', '6 เดือน'];

  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([
    { name: 'อาหาร & เครื่องดื่ม', amount: 4500, percentage: 35, icon: 'restaurant', color: '#FF6B6B' },
    { name: 'คมนาคม', amount: 2800, percentage: 22, icon: 'car', color: '#4ECDC4' },
    { name: 'ช้อปปิ้ง', amount: 2200, percentage: 17, icon: 'bag', color: '#45B7D1' },
    { name: 'ความบันเทิง', amount: 1800, percentage: 14, icon: 'game-controller', color: '#96CEB4' },
    { name: 'สุขภาพ', amount: 1200, percentage: 9, icon: 'medkit', color: '#FECA57' },
    { name: 'อื่น ๆ', amount: 400, percentage: 3, icon: 'ellipsis-horizontal', color: '#95a5a6' },
  ]);

  const [savingsGoals, setSavingsGoals] = useState<Goal[]>([
    { id: 1, title: 'กองทุนฉุกเฉิน', currentAmount: 75000, targetAmount: 100000, icon: 'shield-checkmark', color: '#3498db' },
    { id: 2, title: 'ท่องเที่ยวญี่ปุ่น', currentAmount: 32000, targetAmount: 80000, icon: 'airplane', color: '#e74c3c' },
    { id: 3, title: 'ซื้อรถใหม่', currentAmount: 150000, targetAmount: 500000, icon: 'car-sport', color: '#2ecc71' },
  ]);

  const [financialTips] = useState<FinancialTip[]>([
    { id: 1, title: 'ประหยัดค่าอาหาร', description: 'ลองทำอาหารที่บ้านบ่อยขึ้น จะช่วยลดค่าใช้จ่ายได้เดือนละ 2,000-3,000 บาท การวางแผนเมนูล่วงหน้าและซื้อของตามรายการจะช่วยให้คุณประหยัดได้มากขึ้น', icon: 'restaurant', color: '#F39C12' },
    { id: 2, title: 'การลงทุนระยะยาว', description: 'เริ่มลงทุนในกองทุนรวมหุ้นระยะยาว เพื่อสร้างความมั่งคั่งในอนาคต การลงทุนแบบ Dollar Cost Average จะช่วยลดความเสี่ยงและสร้างผลตอบแทนที่ดีในระยะยาว', icon: 'trending-up', color: '#27AE60' },
    { id: 3, title: 'ติดตามค่าใช้จ่าย', description: 'บันทึกรายรับ-รายจ่ายทุกวัน จะช่วยให้คุณเห็นภาพรวมการเงินชัดเจนขึ้น ใช้แอปพลิเคชันจัดการเงินส่วนตัวเพื่อความสะดวกในการติดตาม', icon: 'analytics', color: '#9B59B6' },
  ]);

  // goal animated values (0..1)
  const goalAnimValuesRef = useRef<Animated.Value[]>(savingsGoals.map(g => new Animated.Value(Math.min(g.currentAmount / Math.max(g.targetAmount, 1), 1))));

  // keep goalAnimValuesRef in sync when goals array length changes
  useEffect(() => {
    if (goalAnimValuesRef.current.length !== savingsGoals.length) {
      goalAnimValuesRef.current = savingsGoals.map(g => new Animated.Value(Math.min(g.currentAmount / Math.max(g.targetAmount, 1), 1)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savingsGoals.length]);

  useEffect(() => {
    // animate each goal value to new progress
    savingsGoals.forEach((g, i) => {
      const target = Math.min(g.currentAmount / Math.max(g.targetAmount, 1), 1);
      if (!goalAnimValuesRef.current[i]) goalAnimValuesRef.current[i] = new Animated.Value(target);
      Animated.timing(goalAnimValuesRef.current[i], {
        toValue: target,
        duration: 700,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    });
  }, [savingsGoals]);

  // Simulate data changes based on period
  useEffect(() => {
    const multipliers: { [key: string]: number } = {
      'สัปดาห์นี้': 0.25,
      'เดือนนี้': 1,
      '3 เดือน': 3.2,
      '6 เดือน': 6.5,
    };

    const multiplier = multipliers[selectedPeriod] || 1;

    setExpenseCategories(prev => prev.map(cat => ({
      ...cat,
      amount: Math.round((cat.amount / (multiplier === 1 ? 1 : multiplier)) * multiplier * (0.8 + Math.random() * 0.4)),
    })));
  }, [selectedPeriod]);

  const totalExpenses = useMemo(() => expenseCategories.reduce((sum, cat) => sum + cat.amount, 0), [expenseCategories]);

  const handleAddGoal = () => {
    if (newGoalTitle.trim() && newGoalAmount.trim()) {
      const colors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'];
      const icons = ['star', 'trophy', 'diamond', 'rocket', 'gift'];

      const newGoal: Goal = {
        id: Date.now(),
        title: newGoalTitle.trim(),
        currentAmount: 0,
        targetAmount: parseInt(newGoalAmount.replace(/,/g, '')) || 0,
        icon: icons[Math.floor(Math.random() * icons.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
      };

      setSavingsGoals(prev => [...prev, newGoal]);
      setNewGoalTitle('');
      setNewGoalAmount('');
      setShowAddGoalModal(false);
      Alert.alert('สำเร็จ!', 'เพิ่มเป้าหมายใหม่เรียบร้อยแล้ว');
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกชื่อเป้าหมายและจำนวนเงิน');
    }
  };

  const handleAddMoney = () => {
    if (addMoneyAmount.trim() && selectedGoalId) {
      const amount = parseInt(addMoneyAmount.replace(/,/g, '')) || 0;
      setSavingsGoals(prev => prev.map(goal =>
        goal.id === selectedGoalId
          ? { ...goal, currentAmount: goal.currentAmount + amount }
          : goal
      ));
      setAddMoneyAmount('');
      setShowAddMoneyModal(false);
      setSelectedGoalId(null);
      Alert.alert('สำเร็จ!', `เพิ่มเงินเรียบร้อยแล้ว ฿${amount.toLocaleString()}`);
    } else {
      Alert.alert('ข้อมูลไม่ครบ', 'กรุณากรอกจำนวนเงินที่ต้องการเพิ่ม');
    }
  };

  const openAddMoneyModal = (goalId: number) => {
    setSelectedGoalId(goalId);
    setShowAddMoneyModal(true);
  };

  const handleCategoryPress = (category: ExpenseCategory, index: number) => {
    Animated.sequence([
      Animated.timing(animatedValues[index], { toValue: 1, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(animatedValues[index], { toValue: 0, duration: 120, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();

    Alert.alert(
      category.name,
      `รายจ่าย: ฿${category.amount.toLocaleString()}\nสัดส่วน: ${category.percentage}% ของรายจ่ายทั้งหมด\n\nคำแนะนำ: พิจารณาลดค่าใช้จ่ายในหมวดนี้หากจำเป็น`,
      [
        { text: 'ปิด', style: 'cancel' },
        { text: 'ดูรายละเอียด', onPress: () => Alert.alert('รายละเอียด', `ข้อมูลเพิ่มเติมสำหรับ ${category.name}`) },
      ]
    );
  };

  const handleGoalPress = (goal: Goal) => {
    const progress = (goal.currentAmount / Math.max(goal.targetAmount, 1)) * 100;
    const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

    Alert.alert(
      goal.title,
      `เป้าหมาย: ฿${goal.targetAmount.toLocaleString()}\nเก็บแล้ว: ฿${goal.currentAmount.toLocaleString()}\nคงเหลือ: ฿${remaining.toLocaleString()}\nความคืบหน้า: ${progress.toFixed(1)}%`,
      [
        { text: 'ปิด', style: 'cancel' },
        { text: 'เติมเงิน', onPress: () => openAddMoneyModal(goal.id) },
      ]
    );
  };

  const toggleTipExpansion = (tipId: number) => {
    setExpandedTips(prev => prev.includes(tipId) ? prev.filter(id => id !== tipId) : [...prev, tipId]);
  };

  const formatCurrency = (text: string) => {
    const number = text.replace(/[^0-9]/g, '');
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>สำรวจ & วิเคราะห์</Text>
        <Text style={styles.headerSubtitle}>ข้อมูลการใช้จ่ายและเป้าหมายของคุณ</Text>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.selectedPeriodButton]}
              onPress={() => setSelectedPeriod(period)}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === period && styles.selectedPeriodButtonText]}>{period}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Expense Overview */}
      <View style={styles.overviewContainer}>
        <AnimatedTouchable style={{}} onPress={() => Alert.alert('รายละเอียดสรุป', 'แสดงข้อมูลสรุปรายจ่าย (local)')}>
          <LinearGradient colors={["#FF6B6B", "#FF8E8E"]} style={styles.overviewCard}>
            <View style={styles.overviewHeader}>
              <Ionicons name="pie-chart" size={34} color="white" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.overviewTitle}>รายจ่ายรวม</Text>
                <Text style={styles.overviewAmount}>฿{totalExpenses.toLocaleString()}</Text>
              </View>
            </View>
            <Text style={styles.overviewSubtext}>
              {selectedPeriod === 'เดือนนี้' ? 'เพิ่มขึ้น 12% จากเดือนที่แล้ว' : selectedPeriod === 'สัปดาห์นี้' ? 'ลดลง 5% จากสัปดาห์ที่แล้ว' : 'เปรียบเทียบจากช่วงเดียวกันปีที่แล้ว'}
            </Text>
          </LinearGradient>
        </AnimatedTouchable>
      </View>

      {/* Expense Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>หมวดหมู่รายจ่าย</Text>
        {expenseCategories.map((category, index) => (
          <ExpenseCategoryCard
            key={index}
            category={category}
            onPress={() => handleCategoryPress(category, index)}
            animatedValue={animatedValues[index]}
          />
        ))}
      </View>

      {/* Savings Goals */}
      <View style={styles.goalsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>เป้าหมายการออม</Text>
          <TouchableOpacity onPress={() => setShowAddGoalModal(true)}>
            <Text style={styles.addGoalText}>+ เพิ่มเป้าหมาย</Text>
          </TouchableOpacity>
        </View>

        {savingsGoals.map((goal, i) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onPress={() => handleGoalPress(goal)}
            onAddMoney={() => openAddMoneyModal(goal.id)}
            animValue={goalAnimValuesRef.current[i] || new Animated.Value(0)}
          />
        ))}
      </View>

      {/* Financial Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.sectionTitle}>เคล็ดลับการเงิน</Text>
        {financialTips.map((tip) => (
          <TipCard key={tip.id} tip={tip} isExpanded={expandedTips.includes(tip.id)} onPress={() => toggleTipExpansion(tip.id)} />
        ))}
      </View>

      {/* Add Goal Modal */}
      <Modal visible={showAddGoalModal} transparent animationType="slide" onRequestClose={() => setShowAddGoalModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เพิ่มเป้าหมายใหม่</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>ชื่อเป้าหมาย</Text>
              <TextInput style={styles.textInput} value={newGoalTitle} onChangeText={setNewGoalTitle} placeholder="เช่น ซื้อบ้าน, เที่ยวต่างประเทศ" placeholderTextColor="#999" />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>จำนวนเงินเป้าหมาย (บาท)</Text>
              <TextInput style={styles.textInput} value={newGoalAmount} onChangeText={(text) => setNewGoalAmount(formatCurrency(text))} placeholder="100,000" placeholderTextColor="#999" keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'} />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setShowAddGoalModal(false); setNewGoalTitle(''); setNewGoalAmount(''); }}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleAddGoal}>
                <Text style={styles.confirmButtonText}>เพิ่มเป้าหมาย</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Money Modal */}
      <Modal visible={showAddMoneyModal} transparent animationType="slide" onRequestClose={() => setShowAddMoneyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เติมเงินเข้าเป้าหมาย</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>จำนวนเงินที่ต้องการเพิ่ม (บาท)</Text>
              <TextInput style={styles.textInput} value={addMoneyAmount} onChangeText={(text) => setAddMoneyAmount(formatCurrency(text))} placeholder="5,000" placeholderTextColor="#999" keyboardType={Platform.OS === 'web' ? 'default' : 'numeric'} />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => { setShowAddMoneyModal(false); setAddMoneyAmount(''); setSelectedGoalId(null); }}>
                <Text style={styles.cancelButtonText}>ยกเลิก</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleAddMoney}>
                <Text style={styles.confirmButtonText}>เพิ่มเงิน</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 8 },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  periodSelector: { paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  periodButton: { paddingHorizontal: 18, paddingVertical: 10, marginRight: 12, backgroundColor: '#E3E8F0', borderRadius: 20 },
  selectedPeriodButton: { backgroundColor: '#667eea' },
  periodButtonText: { fontSize: 14, fontWeight: '500', color: '#7F8C8D' },
  selectedPeriodButtonText: { color: 'white' },

  overviewContainer: { paddingHorizontal: 20, marginTop: 10 },
  overviewCard: { padding: 20, borderRadius: 16, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8 },
  overviewHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  overviewTitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  overviewAmount: { fontSize: 26, color: 'white', fontWeight: '700' },
  overviewSubtext: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  categoriesContainer: { paddingHorizontal: 20, marginTop: 28 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2C3E50', marginBottom: 12 },
  categoryCard: { backgroundColor: 'white', padding: 16, borderRadius: 14, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  categoryIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 16, fontWeight: '600', color: '#2C3E50', marginBottom: 4 },
  categoryAmount: { fontSize: 14, color: '#7F8C8D', fontWeight: '500' },
  categoryPercentage: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginLeft: 8 },
  progressBarContainer: { height: 8, marginTop: 6, borderRadius: 6, backgroundColor: 'transparent', overflow: 'hidden' },
  progressBarBackground: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#ECF0F1' },
  progressBar: { height: 8, borderRadius: 6 },

  goalsContainer: { paddingHorizontal: 20, marginTop: 26 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addGoalText: { color: '#667eea', fontSize: 14, fontWeight: '600' },
  goalCard: { marginBottom: 14, borderRadius: 14, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
  goalGradient: { padding: 16 },
  goalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  goalTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginLeft: 12 },
  goalProgress: { marginTop: 6 },
  goalAmount: { fontSize: 15, color: 'rgba(255,255,255,0.95)', fontWeight: '600', marginBottom: 8 },
  goalProgressBarContainer: { height: 12, backgroundColor: 'transparent', borderRadius: 8, overflow: 'hidden' },
  goalProgressBarBackground: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.2)' },
  goalProgressBar: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 8 },
  goalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  goalPercentage: { color: 'rgba(255,255,255,0.95)', fontWeight: '700' },
  addMoneyButton: { flexDirection: 'row', alignItems: 'center' },
  addMoneyText: { color: 'white', marginLeft: 6, fontWeight: '600' },

  tipsContainer: { paddingHorizontal: 20, marginTop: 20, paddingBottom: 8 },
  tipCard: { flexDirection: 'row', backgroundColor: 'white', padding: 12, borderRadius: 12, marginBottom: 10, alignItems: 'flex-start', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 6 },
  tipIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 6 },
  tipDescription: { fontSize: 13, color: '#7F8C8D', marginBottom: 6 },
  expandText: { fontSize: 13, fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '90%', backgroundColor: 'white', borderRadius: 12, padding: 18 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  inputContainer: { marginBottom: 12 },
  inputLabel: { fontSize: 13, color: '#34495e', marginBottom: 6, fontWeight: '600' },
  textInput: { borderWidth: 1, borderColor: '#e6e9ef', padding: 10, borderRadius: 8, fontSize: 15, backgroundColor: '#fbfdff' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  modalButton: { flex: 1, padding: 12, borderRadius: 10, marginHorizontal: 6, alignItems: 'center' },
  cancelButton: { backgroundColor: '#eef2ff' },
  confirmButton: { backgroundColor: '#667eea' },
  cancelButtonText: { color: '#34495e', fontWeight: '700' },
  confirmButtonText: { color: 'white', fontWeight: '700' },

  bottomSpacing: { height: 60 },
});

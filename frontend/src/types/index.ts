export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  darkMode?: boolean;
}

export interface Trip {
  _id: string;
  title: string;
  destination: string;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  owner: string;
  members: User[];
  categories: { name: string; icon: string; color: string }[];
  totalSpent?: number;
  myBalance?: number;
  createdAt: string;
}

export type SplitMethod = "equal" | "percentage" | "custom" | "selected";

export interface ExpenseParticipant {
  user: User;
  share: number;
}

export interface Expense {
  _id: string;
  trip: string;
  title: string;
  description?: string;
  amount: number;
  category: string;
  paidBy: User;
  splitMethod: SplitMethod;
  participants: ExpenseParticipant[];
  receiptImage?: string;
  date: string;
  createdAt: string;
}

export interface Settlement {
  _id: string;
  trip: string;
  fromUser: User;
  toUser: User;
  amount: number;
  status: "pending" | "paid";
  paidAt?: string;
  createdAt: string;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  percentage: number;
}

export interface DailySpendingItem {
  date: string;
  amount: number;
}

export interface TopSpender {
  name: string;
  avatar?: string;
  amount: number;
}

export interface TripAnalytics {
  totalSpent: number;
  budget: number;
  budgetUsedPct: number;
  categoryBreakdown: CategoryBreakdownItem[];
  dailySpending: DailySpendingItem[];
  topSpenders: TopSpender[];
  mostExpensiveDay?: DailySpendingItem;
  biggestExpense?: { title: string; amount: number };
  balances: Record<string, number>;
}

export interface DashboardStats {
  activeTrips: number;
  totalSpent: number;
  pendingIOwe: number;
  pendingOwedToMe: number;
  budgetTotal: number;
  budgetUsedPct: number;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  estimatedCost: number;
}

export interface BudgetBreakdownItem {
  category: string;
  amount: number;
}

export interface TripPlan {
  suggestedDestination?: string;
  itinerary: ItineraryDay[];
  budgetBreakdown: BudgetBreakdownItem[];
  totalEstimatedCost: number;
  savingTips: string[];
}

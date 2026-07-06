/**
 * Smart Settlement System
 * ------------------------
 * Minimizes the number of transactions required to settle all balances
 * within a trip using a Priority-Queue (Max-Heap) based Greedy Algorithm.
 *
 * Approach:
 *  1. Compute net balance per user  (paid - owed).
 *  2. Push users with positive balance (creditors) into a Max-Heap.
 *  3. Push users with negative balance (debtors) into a Max-Heap (by absolute value).
 *  4. Repeatedly pop the largest creditor and largest debtor, settle the
 *     smaller of the two amounts between them, push back the remainder.
 *
 * This greedy approach is a well-known heuristic that produces a near-minimal
 * (and in most practical trip-expense scenarios, minimal) number of transactions.
 * Complexity: O(N log N) where N = number of participants with non-zero balance.
 */

import { Expense } from "../models/Expense";
import { Settlement } from "../models/Settlement";

interface HeapItem {
  userId: string;
  amount: number; // always positive
}

class MaxHeap {
  private items: HeapItem[] = [];

  size() {
    return this.items.length;
  }

  push(item: HeapItem) {
    this.items.push(item);
    this.bubbleUp(this.items.length - 1);
  }

  pop(): HeapItem | undefined {
    if (this.items.length === 0) return undefined;
    const top = this.items[0];
    const last = this.items.pop()!;
    if (this.items.length > 0) {
      this.items[0] = last;
      this.bubbleDown(0);
    }
    return top;
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].amount >= this.items[index].amount) break;
      [this.items[parent], this.items[index]] = [this.items[index], this.items[parent]];
      index = parent;
    }
  }

  private bubbleDown(index: number) {
    const n = this.items.length;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;
      if (left < n && this.items[left].amount > this.items[largest].amount) largest = left;
      if (right < n && this.items[right].amount > this.items[largest].amount) largest = right;
      if (largest === index) break;
      [this.items[largest], this.items[index]] = [this.items[index], this.items[largest]];
      index = largest;
    }
  }
}

export interface SettlementTransaction {
  fromUser: string;
  toUser: string;
  amount: number;
}

const EPSILON = 0.01;

/**
 * balances: map of userId -> net balance (positive = is owed money, negative = owes money)
 */
export function computeOptimalSettlements(balances: Record<string, number>): SettlementTransaction[] {
  const creditors = new MaxHeap();
  const debtors = new MaxHeap();

  for (const [userId, balance] of Object.entries(balances)) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > EPSILON) {
      creditors.push({ userId, amount: rounded });
    } else if (rounded < -EPSILON) {
      debtors.push({ userId, amount: Math.abs(rounded) });
    }
  }

  const transactions: SettlementTransaction[] = [];

  while (creditors.size() > 0 && debtors.size() > 0) {
    const creditor = creditors.pop()!;
    const debtor = debtors.pop()!;

    const settledAmount = Math.min(creditor.amount, debtor.amount);
    const roundedSettled = Math.round(settledAmount * 100) / 100;

    if (roundedSettled > EPSILON) {
      transactions.push({
        fromUser: debtor.userId,
        toUser: creditor.userId,
        amount: roundedSettled,
      });
    }

    const creditorRemainder = Math.round((creditor.amount - settledAmount) * 100) / 100;
    const debtorRemainder = Math.round((debtor.amount - settledAmount) * 100) / 100;

    if (creditorRemainder > EPSILON) creditors.push({ userId: creditor.userId, amount: creditorRemainder });
    if (debtorRemainder > EPSILON) debtors.push({ userId: debtor.userId, amount: debtorRemainder });
  }

  return transactions;
}

/**
 * Given a trip's expenses, compute each user's net balance.
 * For every expense: paidBy gets +amount, every participant gets -share.
 */
export function computeBalancesFromExpenses(
  expenses: { paidBy: string; amount: number; participants: { user: string; share: number }[] }[]
): Record<string, number> {
  const balances: Record<string, number> = {};

  const add = (userId: string, delta: number) => {
    balances[userId] = Math.round(((balances[userId] || 0) + delta) * 100) / 100;
  };

  for (const exp of expenses) {
    add(exp.paidBy, exp.amount);
    for (const p of exp.participants) {
      add(p.user, -p.share);
    }
  }

  return balances;
}

/**
 * The single source of truth for "who currently owes whom" on a trip.
 *
 * Balances computed from raw expenses only reflect who *should* pay whom in
 * total — they know nothing about settlements that have already actually
 * been paid. Without netting those out, every recalculation would re-derive
 * the exact same outstanding debt and re-suggest a settlement that was
 * already settled. So: start from the expense-based balances, then apply
 * every "paid" settlement as if it were itself a transaction (the payer's
 * debt shrinks, the receiver's credit shrinks) before optimizing.
 */
export async function computeNetBalancesForTrip(tripId: string): Promise<Record<string, number>> {
  const expenses = await Expense.find({ trip: tripId });
  const balances = computeBalancesFromExpenses(
    expenses.map((e) => ({
      paidBy: e.paidBy.toString(),
      amount: e.amount,
      participants: e.participants.map((p) => ({ user: p.user.toString(), share: p.share })),
    }))
  );

  const paidSettlements = await Settlement.find({ trip: tripId, status: "paid" });
  const add = (userId: string, delta: number) => {
    balances[userId] = Math.round(((balances[userId] || 0) + delta) * 100) / 100;
  };
  for (const s of paidSettlements) {
    add(s.fromUser.toString(), s.amount); // they paid it off, so they owe less
    add(s.toUser.toString(), -s.amount); // they received it, so they're owed less
  }

  return balances;
}

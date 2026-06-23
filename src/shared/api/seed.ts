import type { Transaction } from '@/entities/transaction'
import type { Category } from '@/entities/category'
import type { Debt } from '@/entities/debt'
import type { Loan } from '@/entities/loan'
import type { SavingsGoal } from '@/entities/savings-goal'
import type { Investment } from '@/entities/investment'
import type { Budget } from '@/entities/budget'
import type { Reminder } from '@/entities/reminder'
import { DEFAULT_CATEGORIES } from '@/shared/lib/constants'

function genHistory(start: number, end: number, points: number): number[] {
  const result: number[] = []
  const step = (end - start) / points
  let current = start
  for (let i = 0; i < points; i++) {
    const noise = (Math.sin(i * 0.7) + Math.cos(i * 0.3)) * (step * 0.4)
    result.push(Math.max(0, current + noise))
    current += step
  }
  result[points - 1] = end
  return result
}

export function buildSeedCategories(): Category[] {
  return DEFAULT_CATEGORIES.map((c) => ({
    id: c.id,
    nameKey: c.nameKey,
    type: c.type,
    kind: c.kind,
    icon: c.icon,
    color: c.color,
    custom: false,
    isDefault: true,
  }))
}

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function currentYearMonth(): { year: number; month: number; prevMonth: number; prevYear: number; twoMonthsAgoYear: number; twoMonthsAgoMonth: number } {
  const now = new Date()
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    prevYear: prev.getFullYear(),
    prevMonth: prev.getMonth() + 1,
    twoMonthsAgoYear: twoAgo.getFullYear(),
    twoMonthsAgoMonth: twoAgo.getMonth() + 1,
  }
}

const c = currentYearMonth()

export function buildSeedTransactions(): Transaction[] {
  const transactions: Transaction[] = []

  const recurringIncome = (
    categoryId: string,
    amount: number,
    currency: 'USD' | 'CRC',
    description: string,
  ): void => {
    for (const { year, month } of [
      { year: c.twoMonthsAgoYear, month: c.twoMonthsAgoMonth },
      { year: c.prevYear, month: c.prevMonth },
      { year: c.year, month: c.month },
    ]) {
      transactions.push({
        id: `tx-inc-${categoryId}-${year}-${month}`,
        type: 'income',
        kind: 'salary',
        categoryId,
        amount,
        currency,
        date: isoDate(year, month, 1),
        description,
        recurring: true,
        recurringInterval: 'monthly',
        createdAt: isoDate(year, month, 1),
      })
    }
  }

  recurringIncome('cat-salary', 2500, 'USD', 'Salario mensual')
  recurringIncome('cat-rental', 400, 'USD', 'Ingreso por alquiler')

  const addIncome = (
    id: string,
    categoryId: string,
    kind: Transaction['kind'],
    amount: number,
    currency: 'USD' | 'CRC',
    year: number,
    month: number,
    day: number,
    description: string,
  ): void => {
    transactions.push({
      id: `tx-${id}`,
      type: 'income',
      kind,
      categoryId,
      amount,
      currency,
      date: isoDate(year, month, day),
      description,
      recurring: false,
      createdAt: isoDate(year, month, day),
    })
  }

  addIncome('freelance-1', 'cat-freelance', 'variable', 800, 'USD', c.year, c.month, 5, 'Proyecto freelance cliente A')
  addIncome('freelance-2', 'cat-freelance', 'variable', 1200, 'USD', c.prevYear, c.prevMonth, 12, 'Proyecto freelance cliente B')
  addIncome('freelance-3', 'cat-freelance', 'variable', 450, 'USD', c.twoMonthsAgoYear, c.twoMonthsAgoMonth, 18, 'Consultoría freelance')
  addIncome('bonus-1', 'cat-bonus', 'variable', 500, 'USD', c.prevYear, c.prevMonth, 20, 'Bono de rendimiento')
  addIncome('dividends-1', 'cat-dividends', 'passive', 120, 'USD', c.year, c.month, 8, 'Dividendos Q1')
  addIncome('dividends-2', 'cat-dividends', 'passive', 95, 'USD', c.twoMonthsAgoYear, c.twoMonthsAgoMonth, 8, 'Dividendos Q4')
  addIncome('sales-1', 'cat-sales', 'other', 300, 'USD', c.prevYear, c.prevMonth, 22, 'Venta de laptop usada')
  addIncome('gift-1', 'cat-gift-income', 'other', 50, 'USD', c.twoMonthsAgoYear, c.twoMonthsAgoMonth, 25, 'Regalo de cumpleaños')

  const recurringExpense = (
    id: string,
    categoryId: string,
    kind: Transaction['kind'],
    amount: number,
    currency: 'USD' | 'CRC',
    description: string,
    day = 5,
  ): void => {
    for (const { year, month } of [
      { year: c.twoMonthsAgoYear, month: c.twoMonthsAgoMonth },
      { year: c.prevYear, month: c.prevMonth },
      { year: c.year, month: c.month },
    ]) {
      transactions.push({
        id: `tx-${id}-${year}-${month}`,
        type: 'expense',
        kind,
        categoryId,
        amount,
        currency,
        date: isoDate(year, month, day),
        description,
        recurring: true,
        recurringInterval: 'monthly',
        createdAt: isoDate(year, month, day),
      })
    }
  }

  recurringExpense('rent', 'cat-rent', 'fixed', 900, 'USD', 'Alquiler apartamento', 1)
  recurringExpense('electricity', 'cat-utilities', 'fixed', 18000, 'CRC', 'Electricidad', 10)
  recurringExpense('water', 'cat-water', 'fixed', 8000, 'CRC', 'Agua', 10)
  recurringExpense('internet', 'cat-internet', 'fixed', 40, 'USD', 'Internet fibra', 10)
  recurringExpense('spotify', 'cat-subscriptions', 'fixed', 9.99, 'USD', 'Spotify', 15)
  recurringExpense('netflix', 'cat-subscriptions', 'fixed', 15.99, 'USD', 'Netflix', 15)
  recurringExpense('icloud', 'cat-subscriptions', 'fixed', 2.99, 'USD', 'iCloud', 15)
  recurringExpense('phone', 'cat-phone', 'fixed', 25, 'USD', 'Plan telefónico', 20)

  const addExpense = (
    id: string,
    categoryId: string,
    kind: Transaction['kind'],
    amount: number,
    currency: 'USD' | 'CRC',
    year: number,
    month: number,
    day: number,
    description: string,
  ): void => {
    transactions.push({
      id: `tx-${id}`,
      type: 'expense',
      kind,
      categoryId,
      amount,
      currency,
      date: isoDate(year, month, day),
      description,
      recurring: false,
      createdAt: isoDate(year, month, day),
    })
  }

  const groceryMonths: Array<{ year: number; month: number }> = [
    { year: c.twoMonthsAgoYear, month: c.twoMonthsAgoMonth },
    { year: c.prevYear, month: c.prevMonth },
    { year: c.year, month: c.month },
  ]
  for (let i = 0; i < groceryMonths.length; i++) {
    const { year, month } = groceryMonths[i]
    for (let w = 0; w < 4; w++) {
      addExpense(`grocery-${i}-${w}`, 'cat-groceries', 'variable', 85 + w * 10, 'USD', year, month, 3 + w * 7, `Supermercado semana ${w + 1}`)
    }
  }
  addExpense('grocery-c-1', 'cat-groceries', 'variable', 95, 'USD', c.year, c.month, 3, 'Supermercado semana 1')
  addExpense('grocery-c-2', 'cat-groceries', 'variable', 110, 'USD', c.year, c.month, 10, 'Supermercado semana 2')
  addExpense('grocery-c-3', 'cat-groceries', 'variable', 88, 'USD', c.year, c.month, 17, 'Supermercado semana 3')

  addExpense('gas-1', 'cat-transport', 'variable', 40, 'USD', c.year, c.month, 6, 'Gasolina')
  addExpense('gas-2', 'cat-transport', 'variable', 45, 'USD', c.year, c.month, 20, 'Gasolina')
  addExpense('gas-3', 'cat-transport', 'variable', 38, 'USD', c.prevYear, c.prevMonth, 6, 'Gasolina')

  addExpense('restaurant-1', 'cat-restaurant', 'variable', 35, 'USD', c.year, c.month, 7, 'Cena con amigos')
  addExpense('restaurant-2', 'cat-restaurant', 'variable', 60, 'USD', c.prevYear, c.prevMonth, 14, 'Almuerzo celebración')
  addExpense('restaurant-3', 'cat-restaurant', 'variable', 28, 'USD', c.twoMonthsAgoYear, c.twoMonthsAgoMonth, 9, 'Desayuno fuera')
  addExpense('restaurant-4', 'cat-restaurant', 'variable', 45, 'USD', c.year, c.month, 18, 'Cena pareja')

  addExpense('cinema-1', 'cat-entertainment', 'variable', 18, 'USD', c.year, c.month, 12, 'Cine')
  addExpense('cinema-2', 'cat-entertainment', 'variable', 24, 'USD', c.prevYear, c.prevMonth, 16, 'Cine 3D')

  addExpense('pharmacy-1', 'cat-health', 'variable', 12000, 'CRC', c.year, c.month, 9, 'Farmacia')
  addExpense('pharmacy-2', 'cat-health', 'variable', 22, 'USD', c.prevYear, c.prevMonth, 11, 'Vitaminas')

  addExpense('clothes-1', 'cat-clothing', 'variable', 65, 'USD', c.twoMonthsAgoYear, c.twoMonthsAgoMonth, 14, 'Ropa de temporada')
  addExpense('clothes-2', 'cat-clothing', 'variable', 120, 'USD', c.prevYear, c.prevMonth, 23, 'Chaquetas')

  addExpense('flight-1', 'cat-travel', 'occasional', 350, 'USD', c.year, c.month, 2, 'Vuelo vacaciones')
  addExpense('repair-1', 'cat-repairs', 'occasional', 180, 'USD', c.prevYear, c.prevMonth, 19, 'Reparación auto')
  addExpense('dental-1', 'cat-emergency', 'occasional', 90, 'USD', c.twoMonthsAgoYear, c.twoMonthsAgoMonth, 21, 'Urgencia dental')
  addExpense('gift-2', 'cat-gifts', 'occasional', 30, 'USD', c.year, c.month, 14, 'Regalo amigo')

  return transactions
}

export function buildSeedDebts(): Debt[] {
  return [
    {
      id: 'debt-credit-card',
      creditor: 'Tarjeta de crédito Banco A',
      totalAmount: 3000,
      currency: 'USD',
      installmentAmount: 250,
      installmentsTotal: 12,
      installmentsPaid: 4,
      interestRate: 24,
      startDate: isoDate(c.year, c.month - 4 > 0 ? c.month - 4 : c.month + 8, 15),
      dueDay: 15,
    },
    {
      id: 'debt-personal-loan',
      creditor: 'Préstamo personal Banco B',
      totalAmount: 5000,
      currency: 'USD',
      installmentAmount: 220,
      installmentsTotal: 24,
      installmentsPaid: 8,
      interestRate: 18,
      startDate: isoDate(c.year, c.month - 8 > 0 ? c.month - 8 : c.month + 4, 5),
      dueDay: 5,
    },
    {
      id: 'debt-car-loan',
      creditor: 'Financiamiento auto',
      totalAmount: 15000,
      currency: 'USD',
      installmentAmount: 330,
      installmentsTotal: 48,
      installmentsPaid: 14,
      interestRate: 8,
      startDate: isoDate(c.year - 1, c.month, 10),
      dueDay: 10,
    },
    {
      id: 'debt-furniture',
      creditor: 'Financiamiento muebles',
      totalAmount: 1200,
      currency: 'USD',
      installmentAmount: 120,
      installmentsTotal: 10,
      installmentsPaid: 6,
      interestRate: 0,
      startDate: isoDate(c.year, c.month - 6 > 0 ? c.month - 6 : c.month + 6, 20),
      dueDay: 20,
    },
    {
      id: 'debt-family',
      creditor: 'Préstamo familiar',
      totalAmount: 2000,
      currency: 'USD',
      installmentAmount: 0,
      installmentsTotal: 0,
      installmentsPaid: 0,
      interestRate: 0,
      startDate: isoDate(c.year - 1, c.month, 1),
      dueDay: 1,
      notes: 'Pago flexible acordado con la familia',
    },
    {
      id: 'debt-equipment',
      creditor: 'Financiamiento equipo',
      totalAmount: 800,
      currency: 'USD',
      installmentAmount: 100,
      installmentsTotal: 8,
      installmentsPaid: 3,
      interestRate: 12,
      startDate: isoDate(c.year, c.month - 3 > 0 ? c.month - 3 : c.month + 9, 28),
      dueDay: 28,
    },
  ]
}

export function buildSeedLoans(): Loan[] {
  return [
    {
      id: 'loan-mike',
      debtor: 'Mike',
      amount: 200,
      currency: 'USD',
      date: isoDate(c.year, 3, 15),
      paymentsMade: [],
      notes: 'Préstamo para emergencia',
    },
    {
      id: 'loan-ana',
      debtor: 'Ana',
      amount: 50000,
      currency: 'CRC',
      date: isoDate(c.year, 2, 1),
      paymentsMade: [{ date: isoDate(c.year, 3, 1), amount: 20000 }],
    },
    {
      id: 'loan-carlos',
      debtor: 'Carlos',
      amount: 500,
      currency: 'USD',
      date: isoDate(c.year, 1, 10),
      paymentsMade: [
        { date: isoDate(c.year, 1, 25), amount: 250 },
        { date: isoDate(c.year, 2, 10), amount: 250 },
      ],
    },
    {
      id: 'loan-luis',
      debtor: 'Luis',
      amount: 150,
      currency: 'USD',
      date: isoDate(c.year, 3, 20),
      paymentsMade: [],
    },
  ]
}

export function buildSeedSavingsGoals(): SavingsGoal[] {
  return [
    {
      id: 'goal-vacations',
      name: 'Vacaciones',
      targetAmount: 3000,
      currency: 'USD',
      currentAmount: 1800,
      targetDate: isoDate(c.year + 1, 6, 1),
      isEmergencyFund: false,
      monthlyContribution: 300,
    },
    {
      id: 'goal-emergency',
      name: 'Fondo de emergencia',
      targetAmount: 15000,
      currency: 'USD',
      currentAmount: 9000,
      isEmergencyFund: true,
      monthlyContribution: 500,
    },
    {
      id: 'goal-laptop',
      name: 'Laptop nueva',
      targetAmount: 2000,
      currency: 'USD',
      currentAmount: 1200,
      targetDate: isoDate(c.year, c.month + 3 <= 12 ? c.month + 3 : c.month + 3 - 12, 1),
      isEmergencyFund: false,
      monthlyContribution: 200,
    },
    {
      id: 'goal-car',
      name: 'Auto nuevo',
      targetAmount: 20000,
      currency: 'USD',
      currentAmount: 4000,
      targetDate: isoDate(c.year + 2, 1, 1),
      isEmergencyFund: false,
      monthlyContribution: 400,
    },
    {
      id: 'goal-christmas',
      name: 'Navidad',
      targetAmount: 1000,
      currency: 'USD',
      currentAmount: 300,
      targetDate: isoDate(c.year, 12, 1),
      isEmergencyFund: false,
      monthlyContribution: 100,
    },
  ]
}

export function buildSeedInvestments(): Investment[] {
  return [
    {
      id: 'inv-aapl',
      name: 'Apple',
      type: 'stock',
      ticker: 'AAPL',
      units: 10,
      purchasePrice: 150,
      currentPrice: 175,
      purchaseDate: isoDate(c.year - 1, 6, 1),
      currency: 'USD',
      history: genHistory(150, 175, 30),
    },
    {
      id: 'inv-msft',
      name: 'Microsoft',
      type: 'stock',
      ticker: 'MSFT',
      units: 5,
      purchasePrice: 300,
      currentPrice: 380,
      purchaseDate: isoDate(c.year - 1, 3, 1),
      currency: 'USD',
      history: genHistory(300, 380, 30),
    },
    {
      id: 'inv-btc',
      name: 'Bitcoin',
      type: 'crypto',
      ticker: 'BTC',
      units: 0.05,
      purchasePrice: 40000,
      currentPrice: 52000,
      purchaseDate: isoDate(c.year - 1, 9, 1),
      currency: 'USD',
      history: genHistory(40000, 52000, 30),
    },
    {
      id: 'inv-eth',
      name: 'Ethereum',
      type: 'crypto',
      ticker: 'ETH',
      units: 1.5,
      purchasePrice: 2500,
      currentPrice: 2800,
      purchaseDate: isoDate(c.year - 1, 10, 1),
      currency: 'USD',
      history: genHistory(2500, 2800, 30),
    },
    {
      id: 'inv-vti',
      name: 'VTI ETF',
      type: 'fund',
      ticker: 'VTI',
      units: 8,
      purchasePrice: 240,
      currentPrice: 265,
      purchaseDate: isoDate(c.year - 2, 1, 1),
      currency: 'USD',
      history: genHistory(240, 265, 30),
    },
    {
      id: 'inv-sp500',
      name: 'S&P 500 Fund',
      type: 'fund',
      units: 12,
      purchasePrice: 400,
      currentPrice: 435,
      purchaseDate: isoDate(c.year - 2, 5, 1),
      currency: 'USD',
      history: genHistory(400, 435, 30),
    },
    {
      id: 'inv-bond',
      name: 'Local Bond',
      type: 'bond',
      units: 1,
      purchasePrice: 5000,
      currentPrice: 5125,
      purchaseDate: isoDate(c.year - 1, 1, 1),
      currency: 'USD',
      history: genHistory(5000, 5125, 30),
    },
    {
      id: 'inv-gold',
      name: 'Gold',
      type: 'commodity',
      units: 3,
      purchasePrice: 1900,
      currentPrice: 2050,
      purchaseDate: isoDate(c.year - 1, 4, 1),
      currency: 'USD',
      history: genHistory(1900, 2050, 30),
    },
  ]
}

export function buildSeedBudgets(): Budget[] {
  return [
    { id: 'budget-groceries', categoryId: 'cat-groceries', amount: 400, currency: 'USD', period: 'monthly' },
    { id: 'budget-transport', categoryId: 'cat-transport', amount: 200, currency: 'USD', period: 'monthly' },
    { id: 'budget-entertainment', categoryId: 'cat-entertainment', amount: 150, currency: 'USD', period: 'monthly' },
    { id: 'budget-restaurant', categoryId: 'cat-restaurant', amount: 200, currency: 'USD', period: 'monthly' },
    { id: 'budget-health', categoryId: 'cat-health', amount: 100, currency: 'USD', period: 'monthly' },
    { id: 'budget-clothing', categoryId: 'cat-clothing', amount: 80, currency: 'USD', period: 'monthly' },
  ]
}

export function buildSeedReminders(): Reminder[] {
  const now = new Date()
  const addDays = (days: number): string => isoDate(now.getFullYear(), now.getMonth() + 1, Math.max(1, Math.min(28, now.getDate() + days)))

  return [
    { id: 'rem-1', type: 'due', title: 'Vencimiento cuota tarjeta de crédito', date: addDays(7), amount: 250, currency: 'USD', linkedId: 'debt-credit-card', done: false, recurrence: 'monthly' },
    { id: 'rem-2', type: 'payment', title: 'Pago préstamo personal', date: addDays(12), amount: 220, currency: 'USD', linkedId: 'debt-personal-loan', done: false, recurrence: 'monthly' },
    { id: 'rem-3', type: 'payment', title: 'Pago auto', date: addDays(5), amount: 330, currency: 'USD', linkedId: 'debt-car-loan', done: false, recurrence: 'monthly' },
    { id: 'rem-4', type: 'payment', title: 'Pago alquiler', date: addDays(3), amount: 900, currency: 'USD', done: false, recurrence: 'monthly' },
    { id: 'rem-5', type: 'subscription', title: 'Renovación Netflix', date: addDays(2), amount: 15.99, currency: 'USD', done: false, recurrence: 'monthly' },
    { id: 'rem-6', type: 'savings', title: 'Aporte meta vacaciones', date: addDays(10), amount: 300, currency: 'USD', linkedId: 'goal-vacations', done: false, recurrence: 'monthly' },
    { id: 'rem-7', type: 'due', title: 'Vencimiento tarjeta', date: addDays(-2), amount: 100, currency: 'USD', linkedId: 'debt-equipment', done: false, recurrence: 'monthly' },
    { id: 'rem-8', type: 'payment', title: 'Pago seguro auto', date: addDays(25), amount: 80, currency: 'USD', done: false, recurrence: 'monthly' },
    { id: 'rem-9', type: 'savings', title: 'Aporte fondo emergencia', date: addDays(15), amount: 500, currency: 'USD', linkedId: 'goal-emergency', done: false, recurrence: 'monthly' },
    { id: 'rem-10', type: 'payment', title: 'Pago financiamiento muebles', date: addDays(18), amount: 120, currency: 'USD', linkedId: 'debt-furniture', done: false, recurrence: 'monthly' },
  ]
}
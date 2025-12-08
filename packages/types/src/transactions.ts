export interface Transaction {
  id: number
  amount: number
  type: 'income' | 'expense'
  categoryId: number
  date: string // ISO date string
  note: string
}

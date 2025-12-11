export interface Transaction {
  id: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  date: string // ISO date string
  note: string
}

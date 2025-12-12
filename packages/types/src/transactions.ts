export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'income' | 'expense'
  categoryId: string
  date: string // ISO date string
  note: string
}

export interface CreateTransactionDto extends Omit<Transaction, 'id' | 'userId'> {}
export interface UpdateTransactionDto extends Partial<CreateTransactionDto> {}

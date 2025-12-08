import axios from 'axios'
import type { Category, Settings, Transaction as SharedTransaction } from '@app/types'

export const api = axios.create({
  baseURL: 'http://localhost:3000',
})

export type { Category, Settings }

export interface Transaction extends SharedTransaction {
  category?: Category
}

export const getSettings = async () => {
  const { data } = await api.get<Settings>('/settings')
  return data
}

export const updateSettings = async (settings: Partial<Settings>) => {
  const { data } = await api.patch<Settings>('/settings', settings)
  return data
}

export const getCategories = async () => {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const { data } = await api.post<Category>('/categories', category)
  return data
}

export const updateCategory = async (id: number, category: Partial<Category>) => {
  const { data } = await api.patch<Category>(`/categories/${id}`, category)
  return data
}

export const deleteCategory = async (id: number) => {
  const { data } = await api.delete(`/categories/${id}`)
  return data
}

export const getTransactions = async () => {
  const { data } = await api.get<Transaction[]>('/transactions')
  return data
}

export const createTransaction = async (transaction: Omit<Transaction, 'id'>) => {
  const { data } = await api.post<Transaction>('/transactions', transaction)
  return data
}

export const updateTransaction = async (id: number, transaction: Partial<Transaction>) => {
  const { data } = await api.patch<Transaction>(`/transactions/${id}`, transaction)
  return data
}

export const deleteTransaction = async (id: number) => {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}

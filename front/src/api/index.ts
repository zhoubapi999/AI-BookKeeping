import type { Category, Settings, Transaction as SharedTransaction } from '@app/types'
import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

export type { Category, Settings }

export interface Transaction extends SharedTransaction {
  category?: Category
}

export async function getSettings() {
  const { data } = await api.get<Settings>('/settings')
  return data
}

export async function updateSettings(settings: Partial<Settings>) {
  const { data } = await api.patch<Settings>('/settings', settings)
  return data
}

export async function getCategories() {
  const { data } = await api.get<Category[]>('/categories')
  return data
}

export async function createCategory(category: Omit<Category, 'id'>) {
  const { data } = await api.post<Category>('/categories', category)
  return data
}

export async function updateCategory(id: number, category: Partial<Category>) {
  const { data } = await api.patch<Category>(`/categories/${id}`, category)
  return data
}

export async function deleteCategory(id: number) {
  const { data } = await api.delete(`/categories/${id}`)
  return data
}

export async function getTransactions() {
  const { data } = await api.get<Transaction[]>('/transactions')
  return data
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  const { data } = await api.post<Transaction>('/transactions', transaction)
  return data
}

export async function updateTransaction(id: number, transaction: Partial<Transaction>) {
  const { data } = await api.patch<Transaction>(`/transactions/${id}`, transaction)
  return data
}

export async function deleteTransaction(id: number) {
  const { data } = await api.delete(`/transactions/${id}`)
  return data
}

import type { Category, CreateLedgerDto, Ledger, Settings, Transaction as SharedTransaction } from '@app/types'
import axios from 'axios'
import { toast } from 'vue-sonner'
import { router } from '~/main'
import { useUserStore } from '~/stores/user'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const userStore = useUserStore()
  const token = userStore.token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    return response.data.data
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      router.push('/login')
      toast.error('登录已过期，请重新登录')
    }
    else {
      const errorMessage = error.response?.data?.message || '请求失败，请重试'
      toast.error(errorMessage)
    }
    return Promise.reject(error)
  },
)

export type { Category, Ledger, Settings }

export interface Transaction extends SharedTransaction {
  category?: Category
}

export * from './auth'

// --- Ledgers ---
export async function getLedgers() {
  const data = await api.get<Ledger[]>('/ledgers')
  return data as unknown as Ledger[]
}

export async function getLedger(id: string) {
  const data = await api.get<Ledger>(`/ledgers/${id}`)
  return data as unknown as Ledger
}

export async function createLedger(ledger: CreateLedgerDto) {
  const data = await api.post<Ledger>('/ledgers', ledger)
  return data as unknown as Ledger
}

export async function joinLedger(id: string) {
  const data = await api.patch<Ledger>(`/ledgers/${id}/join`)
  return data as unknown as Ledger
}

// --- Settings ---
export async function getSettings() {
  const data = await api.get<Settings>('/settings')
  return data as unknown as Settings
}

export async function updateSettings(settings: Partial<Settings>) {
  const data = await api.patch<Settings>('/settings', settings)
  return data as unknown as Settings
}

export async function getCategories() {
  const data = await api.get<Category[]>('/categories')
  return data as unknown as Category[]
}

export async function createCategory(category: Omit<Category, 'id'>) {
  const data = await api.post<Category>('/categories', category)
  return data as unknown as Category
}

export async function updateCategory(id: string, category: Partial<Category>) {
  const data = await api.patch<Category>(`/categories/${id}`, category)
  return data as unknown as Category
}

export async function deleteCategory(id: string) {
  const data = await api.delete(`/categories/${id}`)
  return data
}

export async function getTransactions(ledgerId?: string) {
  const data = await api.get<Transaction[]>('/transactions', { params: { ledgerId } })
  return data as unknown as Transaction[]
}

export async function createTransaction(transaction: Omit<Transaction, 'id'>) {
  const data = await api.post<Transaction>('/transactions', transaction)
  return data as unknown as Transaction
}

export async function updateTransaction(id: string, transaction: Partial<Transaction>) {
  const data = await api.patch<Transaction>(`/transactions/${id}`, transaction)
  return data as unknown as Transaction
}

export async function deleteTransaction(id: string) {
  const data = await api.delete(`/transactions/${id}`)
  return data
}

// --- Itineraries ---
export interface ItineraryItem {
  id: string
  ledgerId: string
  title: string
  description?: string
  date: string
  location?: string
  imageUrl?: string
  createdBy: string
}

export async function getItineraries(ledgerId: string) {
  const data = await api.get<ItineraryItem[]>('/itineraries', { params: { ledgerId } })
  return data as unknown as ItineraryItem[]
}

export async function createItinerary(itinerary: Omit<ItineraryItem, 'id' | 'createdBy'>) {
  const data = await api.post<ItineraryItem>('/itineraries', itinerary)
  return data as unknown as ItineraryItem
}

export async function deleteItinerary(id: string) {
  const data = await api.delete(`/itineraries/${id}`)
  return data
}

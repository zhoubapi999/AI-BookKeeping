import { User } from './users'

export interface Ledger {
  id: string
  title: string
  description?: string
  coverImage?: string
  users: User[]
  createdBy: User
  createdAt: string
  updatedAt: string
}

export interface CreateLedgerDto {
  title: string
  description?: string
  coverImage?: string
  userIds?: string[]
}

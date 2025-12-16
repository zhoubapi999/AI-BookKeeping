export interface Category {
  id: string
  userId?: string
  ledgerId?: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

export interface CreateCategoryDto extends Omit<Category, 'id' | 'userId'> {
  ledgerId?: string
}
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

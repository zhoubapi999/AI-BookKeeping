export interface Category {
  id: string
  userId: string
  name: string
  type: 'income' | 'expense'
  color: string
  icon: string
}

export interface CreateCategoryDto extends Omit<Category, 'id' | 'userId'> {}
export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

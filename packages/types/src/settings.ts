export interface Settings {
  userId: string
  monthlyBudget: number
}

export interface UpdateSettingsDto extends Partial<Omit<Settings, 'userId'>> {}

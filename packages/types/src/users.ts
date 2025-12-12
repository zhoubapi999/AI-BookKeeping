export interface User {
  id: string
  phone: string
  password?: string
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

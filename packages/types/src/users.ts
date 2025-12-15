export interface User {
  id: string
  phone: string
  password?: string
  username?: string
  avatar?: string
}

export interface CreateUserDto {
  phone: string
  password?: string
  username?: string
  avatar?: string
}

export interface ChangePasswordDto {
  oldPassword: string
  newPassword: string
}

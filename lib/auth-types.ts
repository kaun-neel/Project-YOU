export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  createdAt: number
  updatedAt: number
}

export interface Session {
  userId: string
  email: string
  name: string
}

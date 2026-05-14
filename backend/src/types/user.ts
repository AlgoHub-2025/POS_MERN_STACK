import { Document, Types } from 'mongoose'

export interface IUser extends Document {
  _id: Types.ObjectId
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'manager' | 'cashier' | 'employee'
  isActive: boolean
  emailVerified: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

export interface IUserResponse {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  emailVerified: boolean
  createdAt: Date
}

export interface ILoginRequest {
  email: string
  password: string
}

export interface IRegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}

export interface IAuthResponse {
  token: string
  user: IUserResponse
}

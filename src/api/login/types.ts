export type UserLoginType = {
  username: string
  password: string
}

export type SmsLoginType = {
  phone: string
  code: string
}

export type UserType = {
  username: string
  role: string
  roleId: string
  permissions: string | string[]
}

export type RememberLoginInfo = Pick<UserLoginType, 'username'>

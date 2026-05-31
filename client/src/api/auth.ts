import type { LoginRequest, LoginResponse } from '@app/shared'
import { serverUrl } from '../config/env'

type ApiErrorResponse = {
  message?: string
}

export const loginUser = async (nickname: string): Promise<LoginResponse> => {
  const payload: LoginRequest = { nickname }
  const response = await fetch(`${serverUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => ({}))) as
    | LoginResponse
    | ApiErrorResponse

  if (!response.ok) {
    throw new Error(
      (data as ApiErrorResponse).message ?? 'Wystąpił błąd logowania.',
    )
  }

  return data as LoginResponse
}

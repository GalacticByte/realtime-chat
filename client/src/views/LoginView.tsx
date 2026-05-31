import { useMutation } from '@tanstack/react-query'
import { type ComponentPropsWithoutRef, useState } from 'react'
import { loginUser } from '../api/auth'
import { BaseButton } from '../components/BaseButton'
import { TheHeader } from '../components/TheHeader'
import { useAuthStore } from '../stores/auth'

type FormSubmitHandler = NonNullable<
  ComponentPropsWithoutRef<'form'>['onSubmit']
>

export function LoginView() {
  const [nickname, setNickname] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const setSession = useAuthStore((state) => state.setSession)

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: setSession,
  })

  const handleLogin: FormSubmitHandler = (event) => {
    event.preventDefault()
    setErrorMessage('')

    const trimmedNickname = nickname.trim()

    if (!trimmedNickname) {
      setErrorMessage('Nickname nie może być pusty.')
      return
    }

    loginMutation.mutate(trimmedNickname)
  }

  const visibleError =
    errorMessage ||
    (loginMutation.error instanceof Error ? loginMutation.error.message : '')

  return (
    <div className="flex w-full flex-col items-center">
      <TheHeader />
      <main className="flex w-full justify-center">
        <div className="w-full max-w-md space-y-8 rounded-xl bg-gray-800 p-8 text-gray-100 shadow-lg shadow-emerald-500/20">
          <form
            className="flex w-full flex-col items-center gap-8"
            noValidate
            onSubmit={handleLogin}
          >
            <h2 className="text-center text-2xl font-bold uppercase">
              Witaj w aplikacji czat
            </h2>

            <div className="w-full">
              <label
                htmlFor="nickname"
                className="mb-2 block text-left text-sm font-medium text-gray-300"
              >
                Podaj swój nick
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                placeholder="Podaj swój nick"
                autoComplete="off"
                aria-invalid={Boolean(visibleError)}
                aria-describedby={visibleError ? 'login-error' : undefined}
                className="block w-full rounded-md border border-gray-600 bg-gray-900 px-3 py-2 shadow-sm placeholder-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onChange={(event) => {
                  setNickname(event.target.value)
                  setErrorMessage('')
                  loginMutation.reset()
                }}
              />
              {visibleError ? (
                <div id="login-error" role="alert" className="mt-2 text-sm text-red-500">
                  {visibleError}
                </div>
              ) : null}
            </div>

            <BaseButton type="submit" disabled={loginMutation.isPending} className="w-full">
              {loginMutation.isPending ? 'Łączenie...' : 'Dołącz'}
            </BaseButton>
          </form>
        </div>
      </main>
    </div>
  )
}

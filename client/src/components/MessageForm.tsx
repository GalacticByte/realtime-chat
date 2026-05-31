import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  useRef,
  useState,
} from 'react'
import { cn } from '../utils/cn'
import { BaseButton } from './BaseButton'

/**
 * Props definition for the MessageForm component.
 */
type MessageFormProps = Readonly<{
  isConnected: boolean // Connection status to enable/disable input
  typingLabel: string // Label showing who is currently typing
  onSendMessage: (message: string) => void // Callback to send the message
  setTyping: (isTyping: boolean) => void // Callback to toggle typing status on server
}>

type FormSubmitHandler = NonNullable<
  ComponentPropsWithoutRef<'form'>['onSubmit']
>

/**
 * Component handling message input, validation, and typing indicators.
 */
export function MessageForm({
  isConnected,
  typingLabel,
  onSendMessage,
  setTyping,
}: MessageFormProps) {
  // INTERNAL STATE
  const [message, setMessage] = useState('')
  const [errorSendMsg, setErrorSendMsg] = useState('')

  // REFS
  const typingTimeout = useRef<number | undefined>(undefined)

  /**
   * Handles text input changes and manages the typing indicator logic.
   */
  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setMessage(value)
    if (errorSendMsg) setErrorSendMsg('')

    // Immediately notify the server that the current user is typing
    setTyping(true)

    // Reset the existing timer to delay the 'stopped typing' notification
    if (typingTimeout.current) {
      globalThis.clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = globalThis.setTimeout(() => {
      setTyping(false)
    }, 800)
  }

  const handleSubmit: FormSubmitHandler = (event) => {
    event.preventDefault()
    const trimmedMessage = message.trim()

    if (trimmedMessage.length === 0) {
      setErrorSendMsg('Pole nie może być puste.')
      return
    }

    if (!isConnected) {
      setErrorSendMsg('Brak połączenia z serwerem.')
      return
    }

    onSendMessage(trimmedMessage)
    setMessage('')
    setErrorSendMsg('')
    setTyping(false)
  }

  // Styles for the input field, changing dynamically based on error state
  const inputClasses = cn(
    'mt-1 block w-full rounded-md border bg-gray-900 px-3 py-2 text-gray-100 shadow-sm placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-70',
    errorSendMsg
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
      : 'border-gray-600 focus:border-emerald-500 focus:ring-emerald-500/20',
  )

  return (
    <div className="flex flex-col">
      {typingLabel && (
        <div className="px-4 py-2">
          <output className="block rounded-full bg-emerald-400/10 px-4 py-1 text-xs italic text-emerald-300 ring-1 ring-emerald-400/10 w-fit">
            {typingLabel}
          </output>
        </div>
      )}
      <form
        className="flex w-full items-end gap-3 border-t border-gray-700 bg-gray-900/35 p-4"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="grow">
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Napisz wiadomość:
          </label>
          <input
            id="message"
            type="text"
            value={message}
            autoComplete="off"
            placeholder="Cześć, co u Ciebie?"
            className={inputClasses}
            disabled={!isConnected}
            onChange={handleMessageChange}
            aria-invalid={Boolean(errorSendMsg)}
            aria-describedby={errorSendMsg ? 'message-error' : undefined}
          />
          {errorSendMsg && (
            <div
              id="message-error"
              role="alert"
              className="mt-1 text-sm font-medium text-red-400"
            >
              {errorSendMsg}
            </div>
          )}
        </div>
        <BaseButton type="submit" className="py-2" disabled={!isConnected}>
          Wyślij
        </BaseButton>
      </form>
    </div>
  )
}

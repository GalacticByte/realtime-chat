import { useEffect, useMemo, useRef, useState } from 'react'
import { TheHeader } from '../components/TheHeader'
import { UserList, type UserVM } from '../components/UserList'
import { ChatMessageItem } from '../components/ChatMessageItem'
import { MessageForm } from '../components/MessageForm'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { useChatMessages } from '../hooks/useChatMessages'
import { cn } from '../utils/cn'
import { type UserDTO } from '@app/shared'

/**
 * Component showing placeholder animation while history is being loaded.
 */
function LoadingMessagesSkeleton() {
  return (
    <div className="space-y-5" aria-label="Ładowanie wiadomości">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className={cn('flex items-end gap-3', item === 1 && 'justify-end')}
        >
          {item === 1 ? null : (
            <span className="h-9 w-9 rounded-full bg-gray-700/80" />
          )}
          <div
            className={cn(
              'h-12 animate-pulse rounded-2xl bg-gray-700/70',
              item === 0 && 'w-56',
              item === 1 && 'w-44 bg-emerald-700/40',
              item === 2 && 'w-64',
            )}
          />
        </div>
      ))}
    </div>
  )
}

function EmptyChatState() {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10 text-center">
      <div className="max-w-sm rounded-xl border border-dashed border-gray-600 bg-gray-900/45 px-6 py-7">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 12c0 4.556-4.03 8.25-9 8.25a9.77 9.77 0 01-2.555-.337A5.972 5.972 0 015.41 21.75a.75.75 0 01-.558-1.255 4.529 4.529 0 001.245-2.084C4.189 16.9 3 14.965 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
            />
          </svg>
        </div>
        <p className="text-base font-semibold text-gray-100">
          Jeszcze nie ma wiadomości
        </p>
        <p className="mt-2 text-sm text-gray-400">Rozmowa zacznie się tutaj.</p>
      </div>
    </div>
  )
}

/**
 * Main Chat View component.
 * Orchestrates store subscriptions, view model mapping, and real-time event handling.
 */
export function ChatView() {
  // Store subscriptions
  const { token, nickname, userId, logout } = useAuthStore()
  const {
    messages,
    users,
    typingUsers,
    isConnected,
    connectionError,
    connect,
    disconnect,
    sendMessage,
    deleteMessage,
    setTyping,
  } = useChatStore()

  // UI State
  const [isUserListOpen, setIsUserListOpen] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 768)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)

  const chatArea = useRef<HTMLDivElement | null>(null)

  /**
   * Responsive layout effect
   */
  useEffect(() => {
    const updateViewport = () => {
      const nextIsDesktop = window.innerWidth >= 768
      setIsDesktop(nextIsDesktop)

      if (nextIsDesktop) {
        setIsUserListOpen(true)
      }
    }

    updateViewport()
    window.addEventListener('resize', updateViewport)

    return () => {
      window.removeEventListener('resize', updateViewport)
    }
  }, [])

  /**
   * Socket connection management
   */
  useEffect(() => {
    connect(token)
    return () => {
      disconnect()
    }
  }, [connect, disconnect, token])

  /**
   * Scroll to bottom on new messages
   */
  useEffect(() => {
    chatArea.current?.scrollTo({
      top: chatArea.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages.length])

  // Transform raw messages into UI-friendly View Model using custom hook
  const messagesVM = useChatMessages(messages, nickname)

  /**
   * Memoized User List View Model.
   */
  const usersVM = useMemo<UserVM[]>(
    () =>
      users.map((user: UserDTO) => ({
        id: user.id,
        username: user.nickname,
        isMe: user.nickname === nickname,
      })),
    [users, nickname],
  )

  /**
   * Logic to format the 'X is typing' label.
   */
  const typingLabel = useMemo(() => {
    if (typingUsers.length === 0) return ''

    const names = typingUsers.map((user) => user.nickname).join(', ')
    return `${names} ${typingUsers.length === 1 ? 'pisze' : 'piszą'}...`
  }, [typingUsers])

  const handleDeleteMessage = (id: string) => {
    deleteMessage(id)
    setActiveMenuId(null)
  }

  const handleSendMessage = (messageText: string) => {
    if (userId && nickname) {
      sendMessage(messageText, { id: userId, nickname })
    }
  }

  const handleToggleMessageMenu = (id: string) => {
    setActiveMenuId((currentId) => (currentId === id ? null : id))
  }

  /**
   * Logs out and cleans up server connection.
   */
  const handleLogout = () => {
    disconnect({ immediate: true })
    logout()
  }

  const isWaitingForInitialData =
    isConnected === false && connectionError === null && messagesVM.length === 0
  const shouldShowEmptyState =
    isConnected && connectionError === null && messagesVM.length === 0

  return (
    <div className="flex h-full w-full flex-col">
      <TheHeader
        showMenuButton
        onlineCount={usersVM.length}
        onToggleMenu={() => setIsUserListOpen(true)}
      />

      <main className="relative flex h-[80vh] w-full flex-col gap-4 md:flex-row">
        {isUserListOpen && isDesktop === false ? (
          <button
            type="button"
            className="fixed inset-0 z-30 cursor-default bg-black/40 md:hidden"
            aria-label="Zamknij listę użytkowników"
            onClick={() => setIsUserListOpen(false)}
          />
        ) : null}

        {isUserListOpen || isDesktop ? (
          <UserList
            className="fixed inset-y-0 left-0 z-40 w-[90%] max-w-md md:static md:w-[35%]"
            users={usersVM}
            onLogout={handleLogout}
            onClose={() => setIsUserListOpen(false)}
          />
        ) : null}

        <section className="flex h-full w-full flex-1 flex-col overflow-hidden rounded-xl border border-white/5 bg-gray-800 shadow-lg shadow-emerald-500/20">
          {activeMenuId ? (
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Zamknij menu wiadomości"
              onClick={() => setActiveMenuId(null)}
            />
          ) : null}

          <div
            className="grow overflow-y-auto p-4"
            ref={chatArea}
            role="log"
            aria-live="polite"
          >
            {connectionError ? (
              <div
                role="alert"
                className="rounded-md bg-red-500/10 p-3 text-sm text-red-300"
              >
                {connectionError}
              </div>
            ) : null}

            {isWaitingForInitialData ? <LoadingMessagesSkeleton /> : null}
            {shouldShowEmptyState ? <EmptyChatState /> : null}

            {/* Main messages list container */}
            <ul className="space-y-1">
              {messagesVM.map((item) => (
                <ChatMessageItem
                  key={item.id}
                  message={item}
                  activeMenuId={activeMenuId}
                  onDelete={handleDeleteMessage}
                  onToggleMenu={handleToggleMessageMenu}
                />
              ))}
            </ul>

            {typingLabel ? (
              <output className="mt-4 block rounded-full bg-emerald-400/10 px-4 py-2 text-sm italic text-emerald-300 ring-1 ring-emerald-400/10">
                {typingLabel}
              </output>
            ) : null}
          </div>

          <MessageForm
            isConnected={isConnected}
            typingLabel={typingLabel}
            setTyping={setTyping}
            onSendMessage={handleSendMessage}
          />
        </section>
      </main>
    </div>
  )
}

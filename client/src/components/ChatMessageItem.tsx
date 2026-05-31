import type { ChatMessageVM } from '../hooks/useChatMessages'
import { cn } from '../utils/cn'

type ChatMessageItemProps = Readonly<{
  message: ChatMessageVM
  activeMenuId: string | null
  onDelete: (id: string) => void
  onToggleMenu: (id: string) => void
}>

/**
 * Internal helper for the author avatar initials.
 */
function MessageAvatar({ message }: Readonly<{ message: ChatMessageVM }>) {
  if (message.isMine) return null
  if (message.isCompact)
    return <span className="h-9 w-9 shrink-0" aria-hidden="true" />

  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xs font-bold text-gray-200 ring-1 ring-white/10">
      {message.authorInitials}
    </span>
  )
}

/**
 * Internal helper for the author name header.
 */
function MessageHeader({ message }: Readonly<{ message: ChatMessageVM }>) {
  if (message.isCompact) return null
  const authorLabel = message.isMine ? 'Ty' : message.author

  return (
    <b
      className={cn(
        'mb-1 block text-xs font-semibold',
        message.isMine
          ? 'text-right text-emerald-300'
          : 'text-left text-gray-400',
      )}
    >
      {authorLabel}
    </b>
  )
}

/**
 * Component for rendering an individual message bubble with status and actions.
 */
export function ChatMessageItem({
  message,
  activeMenuId,
  onDelete,
  onToggleMenu,
}: ChatMessageItemProps) {
  const isSending = message.deliveryStatus === 'sending'
  const isFailed = message.deliveryStatus === 'failed'
  const isMenuOpen = activeMenuId === message.id
  const canDelete = message.isMine && !isSending && !isFailed

  // Define classes for the main message container based on author and compact mode
  const containerClasses = cn(
    'flex items-start gap-2',
    message.isCompact ? 'mt-1' : 'mt-4',
    message.isMine ? 'justify-end' : 'justify-start',
  )

  // Define classes for the message bubble itself
  const bubbleClasses = cn(
    'whitespace-pre-wrap wrap-break-words rounded-2xl px-4 py-2.5 text-left leading-relaxed shadow-sm',
    message.isMine
      ? 'rounded-br-md bg-emerald-600 text-white shadow-emerald-950/20'
      : 'rounded-bl-md bg-gray-700 text-gray-100 shadow-black/10',
    isSending && 'opacity-75',
    isFailed && 'border border-red-400/40 bg-red-500/10 text-red-100',
  )

  // Define classes for the timestamp and delivery status indicators
  const metaClasses = cn(
    'mt-1 block text-xs',
    message.isMine ? 'text-right text-gray-400' : 'text-left text-gray-500',
  )

  return (
    <li>
      {message.showDateSeparator && (
        <div className="my-5 flex items-center gap-3" aria-hidden="true">
          <span className="h-px flex-1 bg-gray-700" />
          <span className="rounded-full border border-gray-700 bg-gray-900 px-3 py-1 text-xs font-semibold text-gray-400">
            {message.dayLabel}
          </span>
          <span className="h-px flex-1 bg-gray-700" />
        </div>
      )}

      <div className={containerClasses}>
        <MessageAvatar message={message} />

        <article
          className={cn(
            'relative max-w-[82%] sm:max-w-[70%] lg:max-w-[58%]',
            isMenuOpen && 'z-50',
          )}
        >
          <MessageHeader message={message} />

          <div
            className={cn(
              'flex items-center gap-2',
              message.isMine && 'flex-row-reverse',
            )}
          >
            <p className={bubbleClasses}>{message.message}</p>

            {canDelete && (
              <div className="relative">
                <button
                  type="button"
                  className="cursor-pointer rounded-full p-1 text-gray-500 hover:text-white"
                  onClick={() => onToggleMenu(message.id)}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 z-50 mt-1 w-40 overflow-hidden rounded-lg border border-gray-700 bg-gray-800 shadow-xl">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-400 hover:bg-gray-700"
                      onClick={() => onDelete(message.id)}
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <small className={metaClasses}>
            {message.timeLabel}
            {isSending && (
              <span className="ml-2 text-emerald-300">wysyłanie...</span>
            )}
            {isFailed && <span className="ml-2 text-red-300">nie wysłano</span>}
          </small>
        </article>
      </div>
    </li>
  )
}

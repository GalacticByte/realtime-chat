import { cn } from '../utils/cn'

/**
 * View Model representing a user in the list.
 */
export type UserVM = {
  id: string
  username: string
  isMe?: boolean // Flag to indicate if the user is the current session owner
}

/**
 * Props for the UserList component.
 */
type UserListProps = Readonly<{
  users: UserVM[] // Array of users to display
  className?: string // Optional extra CSS classes
  onLogout: () => void // Callback for the logout button
  onClose: () => void // Callback for the mobile close button
}>

/**
 * Helper to extract up to two initials from a username.
 * Returns '?' if the value is empty.
 */
const getInitials = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || '?'

/**
 * A sidebar component that displays the list of online users.
 * Includes logout functionality and responsive visibility controls.
 */
export function UserList({
  users,
  className,
  onLogout,
  onClose,
}: UserListProps) {
  return (
    <aside
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-gray-800 shadow-lg shadow-emerald-500/20',
        className,
      )}
    >
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-gray-700 px-3">
        <div className="flex flex-1 items-center gap-2 overflow-hidden">
          <h3
            id="online-users-title"
            className="truncate text-left text-sm font-semibold uppercase text-gray-400"
          >
            Użytkownicy
          </h3>
          <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
            {users.length} online
          </span>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label="Wyloguj"
          title="Wyloguj"
          onClick={onLogout}
        >
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
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
            />
          </svg>
        </button>

        <button
          type="button"
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 md:hidden"
          onClick={onClose}
          aria-label="Zamknij listę użytkowników"
        >
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <ul
        className="grow overflow-y-auto p-2"
        aria-labelledby="online-users-title"
      >
        {users.map((user) => {
          const itemClasses = cn(
            'flex list-none items-center gap-3 rounded-md p-2 text-left font-semibold transition-colors duration-200',
            user.isMe
              ? 'bg-emerald-600/20 text-white'
              : 'text-emerald-300 hover:bg-gray-700',
          )

          const avatarClasses = cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            user.isMe
              ? 'bg-emerald-400 text-gray-950'
              : 'bg-gray-700 text-gray-200',
          )

          return (
            <li key={user.id} className={itemClasses}>
              <span className={avatarClasses} aria-hidden="true">
                {getInitials(user.username)}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {user.username}
                {user.isMe && (
                  <span className="ml-1 text-xs opacity-75">(Ty)</span>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}

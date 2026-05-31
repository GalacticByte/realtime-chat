/**
 * Props definition for the TheHeader component.
 */
type TheHeaderProps = Readonly<{
  showMenuButton?: boolean // Whether to display the mobile menu toggle
  onlineCount?: number // Current count of online users to show in the badge
  onToggleMenu?: () => void // Callback triggered when the mobile menu button is clicked
}>

/**
 * Props for the MobileMenuButton helper component.
 */
type MobileMenuButtonProps = Readonly<{
  onlineCount: number
  onToggleMenu?: () => void
}>

/**
 * A helper sub-component that renders the mobile-only button
 * with an integrated online user counter badge.
 */
function MobileMenuButton({
  onlineCount,
  onToggleMenu,
}: MobileMenuButtonProps) {
  return (
    <button
      type="button"
      className="absolute left-1 top-4 z-30 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-gray-800 text-white shadow ring-1 ring-white/10 transition-colors hover:bg-gray-700 md:hidden"
      onClick={onToggleMenu}
      aria-label="Pokaż listę użytkowników"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-4a4 4 0 11-8 0 4 4 0 018 0zm6 4a4 4 0 10-8 0"
        />
      </svg>
      {onlineCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-400 px-1 text-xs font-bold text-gray-950 ring-2 ring-gray-900">
          {onlineCount}
        </span>
      )}
    </button>
  )
}

/**
 * The main application header.
 * Displays the app title and an optional toggle button for the user list on mobile.
 */
export function TheHeader({
  showMenuButton = false,
  onlineCount = 0,
  onToggleMenu,
}: TheHeaderProps) {
  return (
    <header className="relative flex w-full items-center justify-center">
      {showMenuButton && (
        <MobileMenuButton
          onlineCount={onlineCount}
          onToggleMenu={onToggleMenu}
        />
      )}

      <h1 className="my-4 text-3xl font-bold text-emerald-400 md:my-6 md:text-4xl">
        Czat Lite
      </h1>
    </header>
  )
}

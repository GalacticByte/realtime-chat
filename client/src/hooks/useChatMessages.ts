import { useMemo } from 'react'
import type { ChatMessage } from '../stores/chat'
import {
  toDateKey,
  getDayLabel,
  getInitials,
  timeFormatter,
  COMPACT_THRESHOLD_MS,
} from '../utils/chatUtils'

export type ChatMessageVM = {
  id: string
  message: string
  createdAt: string
  author: string
  authorInitials: string
  isMine: boolean
  isCompact: boolean
  showDateSeparator: boolean
  dayLabel: string
  timeLabel: string
  deliveryStatus?: ChatMessage['deliveryStatus']
}

/**
 * Hook to transform raw chat messages into a rich View Model for the UI.
 * Handles grouping (compact mode) and date separators.
 */
export function useChatMessages(
  messages: ChatMessage[],
  currentNickname: string | null,
) {
  return useMemo<ChatMessageVM[]>(
    () =>
      messages.map((item, index, list) => {
        const currentDate = new Date(item.createdAt)
        const previous = list[index - 1]
        const previousDate = previous ? new Date(previous.createdAt) : null

        const currentDateKey = toDateKey(currentDate)
        const previousDateKey = previousDate ? toDateKey(previousDate) : ''

        const sameAuthor = previous?.author.nickname === item.author.nickname
        const sameDay = previousDateKey === currentDateKey
        const closeInTime =
          previousDate instanceof Date &&
          currentDate.getTime() - previousDate.getTime() <= COMPACT_THRESHOLD_MS

        const author = item.author.nickname ?? 'System'

        return {
          id: item.id,
          message: item.message,
          createdAt: item.createdAt,
          author,
          authorInitials: getInitials(author),
          isMine: item.author.nickname === currentNickname,
          isCompact: Boolean(sameAuthor && sameDay && closeInTime),
          showDateSeparator: index === 0 || sameDay === false,
          dayLabel: getDayLabel(item.createdAt),
          timeLabel: timeFormatter.format(currentDate),
          deliveryStatus: item.deliveryStatus,
        }
      }),
    [messages, currentNickname],
  )
}

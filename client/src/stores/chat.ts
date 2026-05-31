import { create } from 'zustand'
import { io, type Socket } from 'socket.io-client'
import type {
  ClientToServerEvents,
  MessageDTO,
  ServerToClientEvents,
  UserDTO,
} from '@app/shared'
import { socketUrl } from '../config/env'

// Message type with optional status for Optimistic UI updates
export type ChatMessage = MessageDTO & {
  deliveryStatus?: 'sending' | 'failed'
}

type MessageAuthor = {
  id: string
  nickname: string
}

type DisconnectOptions = {
  immediate?: boolean
}

type ChatState = {
  messages: ChatMessage[]
  users: UserDTO[]
  typingUsers: UserDTO[]
  isConnected: boolean
  connectionError: string | null
  connect: (token: string) => void
  disconnect: (options?: DisconnectOptions) => void
  sendMessage: (message: string, author: MessageAuthor) => void
  deleteMessage: (messageId: string) => void
  setTyping: (isTyping: boolean) => void
}

// Helper to reset the store to initial values
const getEmptyChatState = () => ({
  messages: [],
  users: [],
  typingUsers: [],
  isConnected: false,
  connectionError: null,
})

// Initialize Socket.io client without automatic connection
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  socketUrl,
  {
    transports: ['websocket'],
    autoConnect: false,
  },
)

let disconnectTimer: number | undefined

const clearPendingDisconnect = () => {
  if (disconnectTimer === undefined) return
  globalThis.clearTimeout(disconnectTimer)
  disconnectTimer = undefined
}

/**
 * Safely retrieves the current authentication token from the socket instance.
 */
const getSocketToken = (): string => {
  const auth = socket.auth

  // Verify that 'auth' exists and is an object (not null, not a function)
  if (auth === null || typeof auth !== 'object') {
    return ''
  }

  // Access the token property and ensure it is returned as a string
  const credentials = auth as { token?: unknown }
  return typeof credentials.token === 'string' ? credentials.token : ''
}

// Generate a temporary ID for messages before they are saved in the DB
/**
 * Generates a unique temporary ID for messages to support Optimistic UI updates.
 * This ensures that local messages have a 'key' before they are persisted in the database.
 */
const createOptimisticId = (): string => {
  const prefix = 'optimistic'

  // Use the modern Web Crypto API if available (highly recommended for uniqueness)
  if (globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`
  }

  // Fallback: combine current timestamp with a random hex string
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(16).slice(2)

  return `${prefix}-${timestamp}-${randomSuffix}`
}

// Finalize disconnection and reset the store
const runDisconnect = () => {
  clearPendingDisconnect()
  socket.disconnect()
  useChatStore.setState(getEmptyChatState())
}

export const useChatStore = create<ChatState>((set) => ({
  ...getEmptyChatState(),

  /**
   * Establishes connection to the server if not already connected with the same token
   */
  connect: (token) => {
    clearPendingDisconnect()

    if (!token) {
      set({ connectionError: 'Brak tokenu sesji.' })
      return
    }

    if (socket.connected && getSocketToken() === token) return

    if (socket.connected) {
      socket.disconnect()
    }

    socket.auth = { token }
    socket.connect()
  },

  /**
   * Disconnects with a small delay to prevent flickering during
   * fast route changes, unless 'immediate' option is used
   */
  disconnect: (options) => {
    clearPendingDisconnect()

    if (options?.immediate) {
      runDisconnect()
      return
    }

    disconnectTimer = globalThis.setTimeout(runDisconnect, 150)
  },

  /**
   * Emits a message to the server and implements an Optimistic UI update.
   * This allows the message to appear in the list instantly with a 'sending' status
   * while waiting for server-side persistence.
   */
  sendMessage: (message, author) => {
    if (!socket.connected) {
      set({ connectionError: 'Brak połączenia z serwerem.' })
      return
    }

    // Prepare a temporary message object for local state
    const optimisticMessage: ChatMessage = {
      id: createOptimisticId(),
      message,
      createdAt: new Date().toISOString(),
      author,
      deliveryStatus: 'sending',
    }

    set((state) => {
      const nextMessages = [...state.messages, optimisticMessage]

      return {
        messages: nextMessages,
        connectionError: null, // Clear any previous connection errors on success
      }
    })

    socket.emit('newMessage', { message })
  },

  /**
   * Notifies the server to delete a message by ID.
   */
  deleteMessage: (messageId) => {
    if (!socket.connected) return
    socket.emit('deleteMessage', { messageId })
  },

  /**
   * Broadcasts whether the current user is typing or not.
   */
  setTyping: (isTyping) => {
    if (!socket.connected) return
    socket.emit('isTyping', { isTyping })
  },
}))

// SOCKET.IO EVENT LISTENERS

socket.on('connect', () => {
  useChatStore.setState({ isConnected: true, connectionError: null })
})

/**
 * Handles the socket disconnection event.
 * Updates the connection status and marks any pending 'sending' messages as 'failed'.
 */
socket.on('disconnect', () => {
  useChatStore.setState((state) => ({
    isConnected: false,
    // If connection drops, mark any outgoing messages as failed
    messages: state.messages.map((message) =>
      message.deliveryStatus === 'sending'
        ? { ...message, deliveryStatus: 'failed' }
        : message,
    ),
  }))
})

socket.on('connect_error', (error) => {
  useChatStore.setState({
    isConnected: false,
    connectionError: error.message,
  })
})

// Initial data load from server
socket.on('initChat', ({ messages, users }) => {
  useChatStore.setState({
    messages,
    users,
    typingUsers: [],
    connectionError: null,
  })
})

/**
 * Handles new messages from the server.
 * Includes logic to reconcile confirmed messages with our optimistic local entries.
 */
socket.on('newMessage', (message) => {
  useChatStore.setState((state) => {
    // Look for an optimistic message already in our state that matches the incoming server message
    const isMatchingOptimisticMessage = (item: ChatMessage) =>
      item.deliveryStatus === 'sending' &&
      item.message === message.message &&
      item.author.nickname === message.author.nickname

    const pendingIndex = state.messages.findIndex(isMatchingOptimisticMessage)

    // If no optimistic message is found (e.g., message from someone else), just add it to the list
    if (pendingIndex === -1) {
      return {
        messages: [...state.messages, message],
      }
    }

    // If found, replace the local temporary message with the confirmed message from the server
    const nextMessages = [...state.messages]
    nextMessages[pendingIndex] = message

    return {
      messages: nextMessages,
    }
  })
})

/**
 * Handles message deletion events from the server.
 * Removes the deleted message from the local state.
 */
socket.on('messageDeleted', ({ messageId }) => {
  useChatStore.setState((state) => {
    // Create a new list excluding the message with the given ID
    const nextMessages = state.messages.filter((msg) => msg.id !== messageId)

    return {
      messages: nextMessages,
    }
  })
})

// Add a user to the online list
socket.on('userConnected', (newUser) => {
  useChatStore.setState((state) => {
    const isUserAlreadyListed = state.users.some(
      (existingUser) => existingUser.id === newUser.id,
    )

    if (isUserAlreadyListed) {
      return {} // No update needed if user is already present
    }

    return { users: [...state.users, newUser] }
  })
})

// Remove a user from the online list and typing list
socket.on('userDisconnected', (disconnectedUser) => {
  useChatStore.setState((state) => {
    // Filter out the user who disconnected from the general users list
    const nextUsers = state.users.filter(
      (existingUser) => existingUser.id !== disconnectedUser.id,
    )
    // Also ensure they are removed from the typing indicator list
    const nextTypingUsers = state.typingUsers.filter(
      (typingUser) => typingUser.id !== disconnectedUser.id,
    )

    return {
      users: nextUsers,
      typingUsers: nextTypingUsers,
    }
  })
})

// Update the list of users currently typing
socket.on('isTyping', ({ userId, isTyping }) => {
  useChatStore.setState((state) => {
    if (isTyping) {
      const isAlreadyTracking = state.typingUsers.some((u) => u.id === userId)
      if (isAlreadyTracking) return {}

      // Get the full user object from the online users list
      const userData = state.users.find((u) => u.id === userId)
      if (!userData) return {}

      return {
        typingUsers: [...state.typingUsers, userData],
      }
    }

    // User stopped typing - remove them from the list
    return {
      typingUsers: state.typingUsers.filter((u) => u.id !== userId),
    }
  })
})

const devServerUrl = 'http://localhost:3000'

export const serverUrl =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.PROD ? '' : devServerUrl)

export const socketUrl = serverUrl || undefined

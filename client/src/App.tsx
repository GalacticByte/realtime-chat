import { LoginView } from './views/LoginView'
import { ChatView } from './views/ChatView'
import { selectIsAuthenticated, useAuthStore } from './stores/auth'

function App() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated)

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-900 p-4 font-sans text-gray-200">
      {isAuthenticated ? <ChatView /> : <LoginView />}
    </div>
  )
}

export default App

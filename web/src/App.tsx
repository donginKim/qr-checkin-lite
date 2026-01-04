import { RouterProvider } from 'react-router-dom'
import { router } from './app/routes'
import { ChurchProvider } from './context/ChurchContext'

export default function App() {
  return (
    <ChurchProvider>
      <RouterProvider router={router} />
    </ChurchProvider>
  )
}

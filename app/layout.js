import './globals.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { CarritoProvider } from './context/CarritoContext'

export const metadata = {
  title: 'ApoPlant',
  description: 'Tu tienda de plantas online',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <CarritoProvider>
          <Navbar />
          
          {children}
          <Footer />
        </CarritoProvider>
      </body>
    </html>
  )
}

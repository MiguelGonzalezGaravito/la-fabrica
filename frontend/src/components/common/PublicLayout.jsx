import Navbar from './Navbar'
import Footer from './Footer'
import CartSidebar from '../cart/CartSidebar'
import AuthModal from './AuthModal'

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
      <AuthModal />
    </div>
  )
}

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">{children}</main>
      <Footer />
    </>
  )
}

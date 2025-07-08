import '@/styles/globals.css'
import { Providers } from './providers'
import '@rainbow-me/rainbowkit/styles.css'

export const metadata = {
  title: 'EthAppList',
  description: 'A community-curated, Wikipedia-style directory of Ethereum applications with upvotes',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

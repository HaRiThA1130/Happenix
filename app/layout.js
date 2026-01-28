import './globals.css'

export const metadata = {
  title: 'Customers',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>{children}</main>
      </body>
    </html>
  )
}

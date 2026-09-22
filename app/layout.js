import './globals.css'

export const metadata = {
  title: 'BizFlow — Track Your Business Numbers With Ease',
  description: 'Money. Projects. Stock. Profit. Know your business at a glance.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 pb-16 md:pb-0">
        {children}
      </body>
    </html>
  )
}

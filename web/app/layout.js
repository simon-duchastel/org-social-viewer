import './globals.css'

export const metadata = {
  title: 'Org Social Viewer',
  description: 'A comprehensive platform for viewing and managing org-mode social media content',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
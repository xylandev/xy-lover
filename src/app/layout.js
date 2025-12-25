import './globals.css'

export const metadata = {
  title: 'MyLove',
  description: '记录我们的故事',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}

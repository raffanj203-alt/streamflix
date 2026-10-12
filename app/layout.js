import './globals.css'

export const metadata = {
  title: 'StreamFlix - Nonton Video Kapan Saja',
  description: 'Koleksi tontonan terbaik yang paling banyak dicari hari ini.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Import FontAwesome untuk Ikon */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      {/* Warna dasar background Zinc-950 (Sangat Gelap) */}
      <body className="bg-zinc-950 text-white min-h-screen flex flex-col antialiased">
        {children}
      </body>
    </html>
  )
}
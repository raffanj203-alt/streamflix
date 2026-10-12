import Link from 'next/link'
import { getRedisValue, setRedisValue } from '@/lib/redis'
import { revalidatePath } from 'next/cache'

export default async function Page({ searchParams }) {
  const params = await Promise.resolve(searchParams)
  const isAdmin = params?.admin === 'true'
  const filterCat = params?.category || 'Semua'

  const videos = (await getRedisValue('videos', [])) || []
  const adsData = (await getRedisValue('ads_scripts', { popunder: '', socialbar: '' })) || { popunder: '', socialbar: '' }

  async function addVideo(formData) {
    'use server'
    const newVideo = {
      id: Date.now().toString(),
      title: formData.get('title'),
      url: formData.get('url'),
      thumb: formData.get('thumb'),
      category: formData.get('category'),
    }
    const existing = (await getRedisValue('videos', [])) || []
    await setRedisValue('videos', [newVideo, ...existing])
    revalidatePath('/')
  }

  async function saveAds(formData) {
    'use server'
    const ads = {
      popunder: formData.get('popunder'),
      socialbar: formData.get('socialbar'),
    }
    await setRedisValue('ads_scripts', ads)
    revalidatePath('/')
  }

  async function deleteVideo(formData) {
    'use server'
    const id = formData.get('id')
    const existing = (await getRedisValue('videos', [])) || []
    const filtered = existing.filter((v) => v.id !== id)
    await setRedisValue('videos', filtered)
    revalidatePath('/')
  }

  const displayVideos = filterCat === 'Semua' 
    ? videos 
    : videos.filter((v) => v.category === filterCat)

  return (
    <>
      {}
      {!isAdmin && adsData?.popunder && <div dangerouslySetInnerHTML={{ __html: adsData.popunder }} />}
      {!isAdmin && adsData?.socialbar && <div dangerouslySetInnerHTML={{ __html: adsData.socialbar }} />}

      {}
      <nav className="bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-800 shadow-sm shadow-red-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 group transition-colors">
                <i className="fa-solid fa-play-circle text-2xl text-red-600 group-hover:text-red-500 transition-colors"></i>
                <span className="font-bold text-xl tracking-wider text-white">Stream<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Flix</span></span>
              </Link>
            </div>
            
            <div className="flex items-center gap-5">
              <Link href={isAdmin ? "/" : "/?admin=true"} className="text-zinc-400 hover:text-red-500 transition-colors relative group">
                <i className={`fa-solid ${isAdmin ? 'fa-home' : 'fa-user-circle'} text-xl`}></i>
                <span className="absolute -bottom-8 right-0 bg-zinc-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {isAdmin ? 'Kembali ke Beranda' : 'Admin Panel'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {isAdmin ? (
          /* ========================================= */
          /*               HALAMAN ADMIN               */
          /* ========================================= */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="border-b border-zinc-800 pb-4">
              <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                <i className="fa-solid fa-gauge-high text-red-500"></i> Admin Dashboard
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Kelola konten video dan pengaturan iklan website.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Tambah Video */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-lg">
                <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex items-center gap-2">
                  <i className="fa-solid fa-video text-orange-500"></i>
                  <h2 className="text-lg font-bold text-white">Tambah Video Baru</h2>
                </div>
                <div className="p-6">
                  <form action={addVideo} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Judul Video</label>
                      <input name="title" required type="text" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="Contoh: Spider-Man Terbaru" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">URL Video (MP4 / Videy.co)</label>
                      <input name="url" required type="url" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="https://domain.com/video.mp4" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">URL Thumbnail Gambar (Opsional)</label>
                      <input name="thumb" type="url" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors" placeholder="https://domain.com/image.jpg" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1">Kategori</label>
                      <select name="category" className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors appearance-none">
                        <option value="Film">Viral</option>
                        <option value="Adult">Adult</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <button type="submit" className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-2.5 px-4 rounded-lg shadow-lg shadow-red-900/30 transition-all transform active:scale-95">
                      <i className="fa-solid fa-cloud-arrow-up mr-2"></i> Simpan Video
                    </button>
                  </form>
                </div>
              </div>

              {/* Form Iklan Adsterra */}
              <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-lg">
                <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex items-center gap-2">
                  <i className="fa-solid fa-money-bill-wave text-green-500"></i>
                  <h2 className="text-lg font-bold text-white">Pengaturan Iklan Adsterra</h2>
                </div>
                <div className="p-6">
                  <form action={saveAds} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1 flex justify-between">
                        <span>Popunder Script Code</span>
                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">HTML/JS</span>
                      </label>
                      <textarea name="popunder" rows={3} defaultValue={adsData?.popunder} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 font-mono text-sm focus:outline-none focus:border-red-500 transition-colors" placeholder="<script>...</script>"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-400 mb-1 flex justify-between">
                        <span>Social Bar Script Code</span>
                        <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">HTML/JS</span>
                      </label>
                      <textarea name="socialbar" rows={3} defaultValue={adsData?.socialbar} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-zinc-300 font-mono text-sm focus:outline-none focus:border-red-500 transition-colors" placeholder="<script>...</script>"></textarea>
                    </div>
                    <button type="submit" className="w-full bg-zinc-800 hover:bg-green-600 text-white font-bold py-2.5 px-4 rounded-lg border border-zinc-700 hover:border-green-500 transition-all">
                      <i className="fa-solid fa-save mr-2"></i> Update Iklan
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Tabel Daftar Video Admin */}
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-lg mt-8">
              <div className="bg-zinc-800/50 p-4 border-b border-zinc-800 flex items-center gap-2">
                <i className="fa-solid fa-list text-blue-500"></i>
                <h2 className="text-lg font-bold text-white">Daftar Video Tersimpan</h2>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs text-zinc-500 uppercase bg-zinc-950/50">
                    <tr>
                      <th className="px-6 py-3">Judul Video</th>
                      <th className="px-6 py-3">Kategori</th>
                      <th className="px-6 py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videos.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center">Data kosong.</td></tr>
                    ) : (
                      videos.map((vid) => (
                        <tr key={vid.id} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-200">{vid.title}</td>
                          <td className="px-6 py-4">
                            <span className="bg-zinc-800 px-2 py-1 rounded text-xs">{vid.category}</span>
                          </td>
                          <td className="px-6 py-4 flex gap-3">
                            <a href={vid.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400"><i className="fa-solid fa-external-link"></i> Tes</a>
                            <form action={deleteVideo}>
                              <input type="hidden" name="id" value={vid.id} />
                              <button type="submit" className="text-red-500 hover:text-red-400"><i className="fa-solid fa-trash"></i> Hapus</button>
                            </form>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================= */
          /*               HALAMAN PUBLIK              */
          /* ========================================= */
          <div className="animate-in fade-in duration-500">
            {/* Header & Tabs Kategori */}
            <div className="flex justify-between items-end mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-fire-flame-curved text-orange-500"></i> Sedang Hangat
                </h1>
                <p className="text-zinc-400 text-sm md:text-base">Koleksi tontonan terbaik yang paling banyak dicari hari ini.</p>
              </div>
              <div className="hidden sm:flex gap-2">
                <Link href="/" className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${filterCat === 'Semua' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>Semua</Link>
                <Link href="/?category=Film" className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${filterCat === 'Film' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>Film</Link>
                <Link href="/?category=Animasi" className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${filterCat === 'Animasi' ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-900/30' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}>Animasi</Link>
              </div>
            </div>

            {/* Grid Video */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayVideos.length === 0 ? (
                <div className="col-span-full py-16 text-center text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800 border-dashed">
                  <i className="fa-solid fa-folder-open text-4xl mb-3 block opacity-50"></i>
                  <p>Belum ada video di kategori ini.</p>
                </div>
              ) : (
                displayVideos.map((vid) => (
                  <a key={vid.id} href={vid.url} target="_blank" rel="noreferrer" className="bg-zinc-900 rounded-xl overflow-hidden cursor-pointer group flex flex-col h-full border border-zinc-800/50 hover:border-red-500 hover:shadow-[0_10px_25px_-5px_rgba(220,38,38,0.2)] hover:-translate-y-1 transition-all duration-300 block">
                    <div className="relative aspect-video overflow-hidden bg-zinc-950">
                      {vid.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={vid.thumb} alt={vid.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fa-solid fa-clapperboard text-3xl text-zinc-700"></i>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
                      
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-75">
                        <div className="bg-red-600/90 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.6)] backdrop-blur-sm">
                          <i className="fa-solid fa-play text-xl text-white ml-1"></i>
                        </div>
                      </div>
                      
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg shadow-red-900/50">
                        {vid.category}
                      </span>
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <h3 className="font-bold text-zinc-100 text-lg leading-tight mb-2 line-clamp-2 group-hover:text-red-400 transition-colors">{vid.title}</h3>
                      <div className="text-xs text-zinc-500 font-medium">
                        Buka Video <i className="fa-solid fa-external-link ml-1"></i>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {}
      <footer className="bg-zinc-950 border-t border-zinc-900 mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm">
            &copy; 2026 StreamFlix. Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </>
  )
}
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const novelsPerPage = 20;

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const res = await fetch(`/api/novels?page=${currentPage}`);
        const data = await res.json();
        setNovels(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching novels:', error);
        setLoading(false);
      }
    };
    
    fetchNovels();
  }, [currentPage]);

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    novel.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredNovels.length / novelsPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>LightNovelHub - Free Light Novels</title>
        <meta name="description" content="Read free light novels updated automatically" />
      </Head>

      {/* Navigation */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Link href="/" className="text-2xl font-bold hover:text-blue-200 transition">
              LightNovelHub
            </Link>
          </div>
          
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="Search novels or authors..."
              className="w-full px-4 py-2 rounded text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            )}
          </div>
          
          <div className="hidden md:flex space-x-6 mt-4 md:mt-0">
            <Link href="/latest" className="hover:text-blue-200 transition">Latest</Link>
            <Link href="/popular" className="hover:text-blue-200 transition">Popular</Link>
            <Link href="/genres" className="hover:text-blue-200 transition">Genres</Link>
            <Link href="/about" className="hover:text-blue-200 transition">About</Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Featured Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">Featured Novels</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredNovels.slice(0, 5).map((novel) => (
                <NovelCard key={novel._id} novel={novel} featured />
              ))}
            </div>
          )}
        </section>

        {/* All Novels Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Novels</h2>
            <div className="flex space-x-2">
              <select className="bg-white border border-gray-300 rounded px-3 py-1">
                <option>Sort by Latest</option>
                <option>Sort by Popular</option>
                <option>Sort by Title</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredNovels.map((novel) => (
                  <NovelCard key={novel._id} novel={novel} />
                ))}
              </div>

              {/* Pagination */}
              {filteredNovels.length > 0 && (
                <div className="flex justify-center mt-8">
                  <nav className="inline-flex rounded-md shadow">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 border-t border-b border-gray-300 ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">LightNovelHub</h3>
              <p className="text-gray-400">Your source for free light novels updated daily.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
                <li><Link href="/latest" className="text-gray-400 hover:text-white transition">Latest Novels</Link></li>
                <li><Link href="/popular" className="text-gray-400 hover:text-white transition">Popular Novels</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Information</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">About Us</Link></li>
                <li><Link href="/dmca" className="text-gray-400 hover:text-white transition">DMCA</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <p className="text-gray-400 text-sm">
                All content is automatically aggregated from various sources. We do not host any files directly.
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} LightNovelHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NovelCard({ novel, featured = false }) {
  return (
    <Link href={`/novel/${novel.slug}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        <div className="relative overflow-hidden">
          <img
            src={novel.cover || '/default-cover.jpg'}
            alt={novel.title}
            className={`w-full ${featured ? 'h-72' : 'h-48'} object-cover group-hover:scale-105 transition-transform duration-300`}
          />
          {featured && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
        <div className="p-4 flex-grow">
          <h3 className="font-bold text-lg mb-1 group-hover:text-blue-600 transition line-clamp-2">
            {novel.title}
          </h3>
          <p className="text-gray-600 text-sm mb-2">{novel.author || 'Unknown Author'}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {novel.genres?.slice(0, 3).map(genre => (
              <span key={genre} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                {genre}
              </span>
            ))}
          </div>
        </div>
        <div className="px-4 pb-4 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            {novel.lastUpdated ? new Date(novel.lastUpdated).toLocaleDateString() : 'N/A'}
          </span>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {novel.status || 'Ongoing'}
          </span>
        </div>
      </div>
    </Link>
  );
}

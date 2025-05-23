// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const res = await fetch('/api/novels');
        const data = await res.json();
        setNovels(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching novels:', error);
        setLoading(false);
      }
    };
    
    fetchNovels();
  }, []);

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>LightNovelHub - Free Light Novels</title>
        <meta name="description" content="Read free light novels updated daily" />
      </Head>

      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">LightNovelHub</h1>
          <div className="relative w-1/3">
            <input
              type="text"
              placeholder="Search novels..."
              className="w-full p-2 rounded text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <nav>
            <ul className="flex space-x-4">
              <li><a href="#" className="hover:underline">Home</a></li>
              <li><a href="#" className="hover:underline">Latest</a></li>
              <li><a href="#" className="hover:underline">Popular</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredNovels.map((novel) => (
              <div key={novel._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={novel.cover || '/default-cover.jpg'} 
                  alt={novel.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2 truncate">{novel.title}</h2>
                  <p className="text-gray-600 text-sm mb-3">{novel.author || 'Unknown Author'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{novel.lastUpdated || 'N/A'}</span>
                    <a 
                      href={`/novel/${novel.slug}`}
                      className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                      Read
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p>© {new Date().getFullYear()} LightNovelHub - All content is automatically aggregated</p>
        </div>
      </footer>
    </div>
  );
}

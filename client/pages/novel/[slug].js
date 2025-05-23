import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function NovelDetail() {
  const router = useRouter();
  const { slug } = router.query;
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchNovelData = async () => {
      try {
        setLoading(true);
        const [novelRes, chaptersRes] = await Promise.all([
          fetch(`/api/novels/${slug}`),
          fetch(`/api/novels/${slug}/chapters`)
        ]);
        
        const novelData = await novelRes.json();
        const chaptersData = await chaptersRes.json();
        
        setNovel(novelData);
        setChapters(chaptersData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching novel data:', error);
        setLoading(false);
      }
    };

    fetchNovelData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Novel not found</h1>
          <Link href="/" className="text-blue-600 hover:underline mt-4 inline-block">
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{novel.title} - LightNovelHub</title>
        <meta name="description" content={`Read ${novel.title} by ${novel.author || 'unknown author'}`} />
      </Head>

      {/* Navigation */}
      <nav className="bg-blue-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold hover:text-blue-200 transition">
            LightNovelHub
          </Link>
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-blue-200 transition">Home</Link>
            <Link href="/latest" className="hover:text-blue-200 transition">Latest</Link>
          </div>
        </div>
      </nav>

      {/* Novel Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="md:flex">
            <div className="md:w-1/4 p-4">
              <img
                src={novel.cover || '/default-cover.jpg'}
                alt={novel.title}
                className="w-full rounded-lg shadow-sm"
              />
            </div>
            <div className="md:w-3/4 p-6">
              <h1 className="text-3xl font-bold mb-2">{novel.title}</h1>
              <p className="text-gray-600 mb-4">by {novel.author || 'Unknown Author'}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {novel.genres?.map(genre => (
                  <span key={genre} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {genre}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Status</p>
                  <p className="font-medium">{novel.status || 'Ongoing'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Last Updated</p>
                  <p className="font-medium">
                    {novel.lastUpdated ? new Date(novel.lastUpdated).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Chapters</p>
                  <p className="font-medium">{novel.chapterCount || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Rating</p>
                  <p className="font-medium">{novel.rating || 'N/A'}</p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {novel.description || 'No description available.'}
                </p>
              </div>

              <div className="flex space-x-3">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition">
                  Read First Chapter
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition">
                  Bookmark
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold">Chapters</h2>
          </div>
          
          <div className="divide-y">
            {chapters.length > 0 ? (
              chapters.map(chapter => (
                <div 
                  key={chapter._id} 
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedChapter?._id === chapter._id ? 'bg-blue-50' : ''}`}
                  onClick={() => setSelectedChapter(chapter)}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <span className="text-sm text-gray-500">
                      {chapter.date ? new Date(chapter.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No chapters available yet.
              </div>
            )}
          </div>
        </div>

        {/* Chapter Content */}
        {selectedChapter && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mt-8">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">{selectedChapter.title}</h2>
            </div>
            <div className="p-6 prose max-w-none">
              {selectedChapter.content ? (
                <div dangerouslySetInnerHTML={{ __html: selectedChapter.content }} />
              ) : (
                <p className="text-gray-500">Chapter content not available.</p>
              )}
            </div>
            <div className="p-4 border-t flex justify-between">
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium transition"
                disabled={!selectedChapter.prevChapter}
              >
                Previous Chapter
              </button>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                disabled={!selectedChapter.nextChapter}
              >
                Next Chapter
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} LightNovelHub. All content is automatically aggregated.</p>
        </div>
      </footer>
    </div>
  );
}

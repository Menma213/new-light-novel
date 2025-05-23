const axios = require('axios');
const cheerio = require('cheerio');
const Novel = require('./models/Novel');
const Chapter = require('./models/Chapter');
const { parse } = require('url');

// List of source sites to crawl
const SOURCE_SITES = [
  {
    name: 'LightNovelWorld',
    url: 'https://www.lightnovelworld.com',
    selectors: {
      novelList: '.novel-list .novel-item',
      title: '.novel-title a',
      cover: '.novel-cover img',
      author: '.novel-author',
      latestChapter: '.novel-stats div:last-child',
      novelUrl: '.novel-title a',
    },
    novelDetailSelectors: {
      description: '.summary',
      genres: '.categories a',
      status: '.header-stats span:contains(Status) + strong',
      rating: '.header-stats span:contains(Rating) + strong',
      chapterList: '.chapter-list li',
      chapterTitle: 'a',
      chapterUrl: 'a',
      chapterDate: '.chapter-date',
    }
  },
  // Add more sources here with their specific selectors
];

async function crawlNovelUpdates() {
  console.log('Starting novel crawl...');
  
  for (const source of SOURCE_SITES) {
    try {
      console.log(`Crawling ${source.name}...`);
      const { data } = await axios.get(source.url);
      const $ = cheerio.load(data);
      
      const novelPromises = $(source.selectors.novelList).map(async (i, el) => {
        const novelElement = $(el);
        const title = novelElement.find(source.selectors.title).text().trim();
        const cover = novelElement.find(source.selectors.cover).attr('src');
        const author = novelElement.find(source.selectors.author).text().trim();
        const novelUrl = novelElement.find(source.selectors.novelUrl).attr('href');
        
        if (!title || !novelUrl) return null;
        
        const fullNovelUrl = new URL(novelUrl, source.url).toString();
        const slug = createSlug(title);
        
        // Check if novel already exists
        let novel = await Novel.findOne({ sourceUrl: fullNovelUrl });
        
        if (!novel) {
          novel = new Novel({
            title,
            author,
            cover,
            sourceUrl: fullNovelUrl,
            slug,
            source: source.name,
            lastUpdated: new Date()
          });
        } else {
          novel.lastUpdated = new Date();
        }
        
        // Fetch novel details if it's new or hasn't been updated recently
        if (!novel.description || novel.lastUpdated < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
          await fetchNovelDetails(novel, source);
        }
        
        // Save novel
        await novel.save();
        
        // Fetch chapters
        await fetchChapters(novel, source);
        
        return novel;
      }).get();
      
      await Promise.all(novelPromises);
      console.log(`Finished crawling ${source.name}`);
    } catch (error) {
      console.error(`Error crawling ${source.name}:`, error.message);
    }
  }
  
  console.log('Finished novel crawl');
}

async function fetchNovelDetails(novel, source) {
  try {
    const { data } = await axios.get(novel.sourceUrl);
    const $ = cheerio.load(data);
    
    novel.description = $(source.novelDetailSelectors.description).text().trim();
    novel.genres = $(source.novelDetailSelectors.genres).map((i, el) => $(el).text().trim()).get();
    novel.status = $(source.novelDetailSelectors.status).text().trim();
    novel.rating = $(source.novelDetailSelectors.rating).text().trim();
    
    await novel.save();
  } catch (error) {
    console.error(`Error fetching details for ${novel.title}:`, error.message);
  }
}

async function fetchChapters(novel, source) {
  try {
    const { data } = await axios.get(novel.sourceUrl);
    const $ = cheerio.load(data);
    
    const chapterElements = $(source.novelDetailSelectors.chapterList);
    const chapters = chapterElements.map((i, el) => {
      const chapterElement = $(el);
      const title = chapterElement.find(source.novelDetailSelectors.chapterTitle).text().trim();
      const chapterUrl = chapterElement.find(source.novelDetailSelectors.chapterUrl).attr('href');
      const dateText = chapterElement.find(source.novelDetailSelectors.chapterDate).text().trim();
      
      return {
        title,
        url: new URL(chapterUrl, source.url).toString(),
        date: parseDate(dateText),
        number: chapterElements.length - i, // Reverse order
      };
    }).get();
    
    // Process chapters in batches to avoid memory issues
    for (const chapterData of chapters) {
      const existingChapter = await Chapter.findOne({
        novelId: novel._id,
        number: chapterData.number
      });
      
      if (!existingChapter) {
        const chapter = new Chapter({
          novelId: novel._id,
          title: chapterData.title,
          url: chapterData.url,
          number: chapterData.number,
          date: chapterData.date,
          content: '', // Will be fetched when accessed
        });
        
        await chapter.save();
      }
    }
    
    // Update chapter count
    novel.chapterCount = chapters.length;
    await novel.save();
  } catch (error) {
    console.error(`Error fetching chapters for ${novel.title}:`, error.message);
  }
}

function createSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function parseDate(dateStr) {
  // Implement date parsing based on the source format
  // This is a simplified version - you'll need to adjust for each source
  if (dateStr.includes('hour') || dateStr.includes('minute')) {
    return new Date();
  }
  
  const months = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };
  
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const month = months[parts[0]];
    const day = parseInt(parts[1].replace(',', ''));
    const year = parseInt(parts[2]);
    return new Date(year, month, day);
  }
  
  return new Date();
}

module.exports = { crawlNovelUpdates };

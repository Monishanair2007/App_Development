const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

console.log('🗄️  Database initialize ho raha hai...');
const db = getDb();

const shows = [
  { id: uuidv4(), title: 'Attack on Titan', original_title: 'Shingeki no Kyojin', type: 'anime', genre: 'Action,Drama,Fantasy', release_year: 2013, total_episodes: 87, total_seasons: 4, status: 'completed', synopsis: 'Humanity lives behind walls to protect from giant man-eating Titans. A boy vows revenge after his town is destroyed.', cover_image: 'https://cdn.myanimelist.net/images/anime/10/47347.jpg', rating: 9.1, rating_count: 245000, streaming_platform: 'Crunchyroll', streaming_url: 'https://crunchyroll.com', tags: 'action,dark,military', barcode: 'AOT-2013-001' },
  { id: uuidv4(), title: 'Demon Slayer', original_title: 'Kimetsu no Yaiba', type: 'anime', genre: 'Action,Supernatural', release_year: 2019, total_episodes: 44, total_seasons: 3, status: 'ongoing', synopsis: 'A boy becomes a demon slayer after his family is killed and sister turned into a demon.', cover_image: 'https://cdn.myanimelist.net/images/anime/1286/99889.jpg', rating: 8.7, rating_count: 198000, streaming_platform: 'Crunchyroll', streaming_url: 'https://crunchyroll.com', tags: 'action,demons', barcode: 'DS-2019-002' },
  { id: uuidv4(), title: 'One Piece', original_title: 'One Piece', type: 'anime', genre: 'Action,Adventure,Comedy', release_year: 1999, total_episodes: 1100, total_seasons: 21, status: 'ongoing', synopsis: 'Monkey D. Luffy sails to find the legendary One Piece treasure and become King of the Pirates.', cover_image: 'https://cdn.myanimelist.net/images/anime/6/73245.jpg', rating: 8.9, rating_count: 430000, streaming_platform: 'Crunchyroll', streaming_url: 'https://crunchyroll.com', tags: 'adventure,pirates', barcode: 'OP-1999-003' },
  { id: uuidv4(), title: 'Fullmetal Alchemist: Brotherhood', original_title: 'Hagane no Renkinjutsushi', type: 'anime', genre: 'Action,Drama,Adventure', release_year: 2009, total_episodes: 64, total_seasons: 1, status: 'completed', synopsis: 'Two brothers use alchemy to restore their bodies after a failed attempt to revive their mother.', cover_image: 'https://cdn.myanimelist.net/images/anime/1223/96541.jpg', rating: 9.1, rating_count: 310000, streaming_platform: 'Netflix', streaming_url: 'https://netflix.com', tags: 'action,drama,alchemy', barcode: 'FMAB-2009-004' },
  { id: uuidv4(), title: 'Jujutsu Kaisen', original_title: 'Jujutsu Kaisen', type: 'anime', genre: 'Action,Supernatural,Horror', release_year: 2020, total_episodes: 47, total_seasons: 2, status: 'ongoing', synopsis: 'A high schooler joins secret sorcerers to kill a powerful curse.', cover_image: 'https://cdn.myanimelist.net/images/anime/1171/109222.jpg', rating: 8.6, rating_count: 175000, streaming_platform: 'Crunchyroll', streaming_url: 'https://crunchyroll.com', tags: 'action,supernatural', barcode: 'JJK-2020-005' },
  { id: uuidv4(), title: 'Breaking Bad', original_title: 'Breaking Bad', type: 'tv', genre: 'Crime,Drama,Thriller', release_year: 2008, total_episodes: 62, total_seasons: 5, status: 'completed', synopsis: 'A chemistry teacher teams with a former student to make methamphetamine after a cancer diagnosis.', cover_image: 'https://m.media-amazon.com/images/M/MV5BYmQ4YWMxYjUtNjZmYi00MDdmLWJjOTUtYjc0NzY3MDFhMTZlXkEyXkFqcGdeQXVyMTMzNDExODE5._V1_.jpg', rating: 9.5, rating_count: 520000, streaming_platform: 'Netflix', streaming_url: 'https://netflix.com', tags: 'crime,drama', barcode: 'BB-2008-006' },
  { id: uuidv4(), title: 'Hunter x Hunter', original_title: 'Hunter x Hunter', type: 'anime', genre: 'Action,Adventure,Fantasy', release_year: 2011, total_episodes: 148, total_seasons: 6, status: 'completed', synopsis: 'A boy sets out to become a Hunter like his absent father, discovering a dangerous world.', cover_image: 'https://cdn.myanimelist.net/images/anime/11/33657.jpg', rating: 9.0, rating_count: 285000, streaming_platform: 'Netflix', streaming_url: 'https://netflix.com', tags: 'action,adventure', barcode: 'HXH-2011-007' },
  { id: uuidv4(), title: 'Naruto Shippuden', original_title: 'Naruto: Shippuden', type: 'anime', genre: 'Action,Adventure,Fantasy', release_year: 2007, total_episodes: 500, total_seasons: 21, status: 'completed', synopsis: 'Naruto continues his journey to become Hokage and save his friend Sasuke.', cover_image: 'https://cdn.myanimelist.net/images/anime/1565/111305.jpg', rating: 8.7, rating_count: 395000, streaming_platform: 'Crunchyroll', streaming_url: 'https://crunchyroll.com', tags: 'action,ninja', barcode: 'NS-2007-008' },
];

const insertShow = db.prepare(`INSERT OR IGNORE INTO shows (id,title,original_title,type,genre,release_year,total_episodes,total_seasons,status,synopsis,cover_image,rating,rating_count,streaming_platform,streaming_url,tags,barcode) VALUES (@id,@title,@original_title,@type,@genre,@release_year,@total_episodes,@total_seasons,@status,@synopsis,@cover_image,@rating,@rating_count,@streaming_platform,@streaming_url,@tags,@barcode)`);
db.transaction(shows => shows.forEach(s => insertShow.run(s)))(shows);

const demoId = uuidv4();
const hash = bcrypt.hashSync('demo123', 10);
db.prepare(`INSERT OR IGNORE INTO users (id,username,email,password_hash,bio) VALUES (?,?,?,?,?)`).run(demoId, 'demo_user', 'demo@anitrack.com', hash, 'Anime enthusiast!');

const allShows = db.prepare('SELECT id FROM shows LIMIT 4').all();
['watching','completed','plan_to_watch','on_hold'].forEach((s, i) => {
  if (allShows[i]) db.prepare(`INSERT OR IGNORE INTO watchlist (id,user_id,show_id,status,episodes_watched,score) VALUES (?,?,?,?,?,?)`).run(uuidv4(), demoId, allShows[i].id, s, (i+1)*10, i+7);
});

db.prepare(`INSERT OR IGNORE INTO notifications (id,user_id,type,title,message) VALUES (?,?,?,?,?)`).run(uuidv4(), demoId, 'new_episode', '🎌 New Episode!', 'Demon Slayer Season 4 Episode 3 is available!');

console.log(`✅ Database ready! ${shows.length} shows added.`);
console.log('👤 Demo: demo@anitrack.com / demo123');

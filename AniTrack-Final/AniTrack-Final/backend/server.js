const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'Backend running!' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/shows', require('./routes/shows'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/barcode', require('./routes/barcode'));

// Serve built frontend if it exists
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('========================================');
  console.log(' AniTrack Backend running on port ' + PORT);
  console.log(' Test: http://localhost:' + PORT + '/api/health');
  console.log('========================================');
  console.log('');
});

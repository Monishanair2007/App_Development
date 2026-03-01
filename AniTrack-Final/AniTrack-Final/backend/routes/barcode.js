const router = require('express').Router();
const QRCode = require('qrcode');
const { getDb } = require('../database');
const { authMiddleware } = require('../middleware/auth');

// Generate QR code for a show
router.get('/show/:showId', async (req, res) => {
  const db = getDb();
  const show = db.prepare('SELECT * FROM shows WHERE id=?').get(req.params.showId);
  if (!show) return res.status(404).json({ error: 'Show not found' });

  const data = JSON.stringify({
    type: 'anitrack_show',
    id: show.id,
    title: show.title,
    barcode: show.barcode,
  });

  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: { dark: '#7c5cfc', light: '#ffffff' }
    });
    res.json({ qr: qrDataURL, barcode: show.barcode, show: { id: show.id, title: show.title } });
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// Generate QR for watchlist share
router.get('/watchlist/:userId', authMiddleware, async (req, res) => {
  const data = JSON.stringify({ type: 'anitrack_watchlist', userId: req.params.userId });
  try {
    const qrDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      color: { dark: '#fc5c7d', light: '#ffffff' }
    });
    res.json({ qr: qrDataURL });
  } catch (err) {
    res.status(500).json({ error: 'QR generation failed' });
  }
});

// Scan barcode → get show
router.post('/scan', (req, res) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: 'Barcode required' });
  const db = getDb();
  // Try to parse if QR JSON
  let code = barcode;
  try {
    const parsed = JSON.parse(barcode);
    if (parsed.barcode) code = parsed.barcode;
    if (parsed.id) {
      const show = db.prepare('SELECT * FROM shows WHERE id=?').get(parsed.id);
      if (show) return res.json({ show, found: true });
    }
  } catch (e) {}
  const show = db.prepare('SELECT * FROM shows WHERE barcode=?').get(code);
  if (!show) return res.status(404).json({ error: 'No show found for this barcode', found: false });
  res.json({ show, found: true });
});

module.exports = router;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.headers['x-admin-secret'];
  if (!adminSecret) {
    return res.status(500).json({ error: 'ADMIN_SECRET ortam değişkeni tanımlı değil' });
  }
  if (providedSecret !== adminSecret) {
    return res.status(401).json({ error: 'Yetkisiz erişim' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'Depolama yapılandırması eksik' });
  }

  const { action, playerId, email } = req.body || {};
  const headers = { Authorization: `Bearer ${token}` };

  try {
    if (action === 'clear-players') {
      await fetch(`${url}/del/players`, { headers });
      return res.status(200).json({ ok: true });
    }
    if (action === 'clear-emails') {
      await fetch(`${url}/del/emails`, { headers });
      return res.status(200).json({ ok: true });
    }
    if (action === 'delete-player') {
      if (!playerId) return res.status(400).json({ error: 'playerId gerekli' });
      await fetch(`${url}/hdel/players/${encodeURIComponent(playerId)}`, { headers });
      return res.status(200).json({ ok: true });
    }
    if (action === 'delete-email') {
      if (!email) return res.status(400).json({ error: 'email gerekli' });
      await fetch(`${url}/hdel/emails/${encodeURIComponent(email.toLowerCase())}`, { headers });
      return res.status(200).json({ ok: true });
    }
    return res.status(400).json({ error: 'Geçersiz action' });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + e.message });
  }
}

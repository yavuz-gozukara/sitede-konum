export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const { playerId, nickname, balance, city, country, lat, lng } = req.body || {};

  if (!playerId || !nickname) {
    return res.status(400).json({ error: 'playerId ve nickname gerekli' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'Depolama yapılandırması eksik' });
  }

  // Önceki kaydı oku, sadece gönderilen alanları güncelle (konum her zaman gönderilmeyebilir)
  let existing = {};
  try {
    const getRes = await fetch(`${url}/hget/players/${encodeURIComponent(playerId)}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const getJson = await getRes.json();
    if (getJson.result) existing = JSON.parse(getJson.result);
  } catch (e) {}

  const record = JSON.stringify({
    playerId,
    nickname,
    balance: balance != null ? balance : (existing.balance || 0),
    city: city !== undefined ? city : (existing.city || null),
    country: country !== undefined ? country : (existing.country || null),
    lat: lat !== undefined ? lat : (existing.lat || null),
    lng: lng !== undefined ? lng : (existing.lng || null),
    lastSeen: Date.now()
  });

  try {
    const upstashRes = await fetch(
      `${url}/hset/players/${encodeURIComponent(playerId)}/${encodeURIComponent(record)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!upstashRes.ok) {
      const errText = await upstashRes.text();
      return res.status(500).json({ error: 'Depolama hatası: ' + errText });
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + e.message });
  }
}

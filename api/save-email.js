export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST istekleri kabul edilir' });
  }

  const { email, playerId } = req.body || {};

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Geçerli bir e-posta gerekli' });
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    return res.status(500).json({ error: 'Depolama yapılandırması eksik' });
  }

  const record = JSON.stringify({
    email,
    playerId: playerId || null,
    submittedAt: Date.now()
  });

  try {
    const upstashRes = await fetch(
      `${url}/hset/emails/${encodeURIComponent(email.toLowerCase())}/${encodeURIComponent(record)}`,
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

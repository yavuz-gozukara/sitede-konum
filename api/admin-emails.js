export default async function handler(req, res) {
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

  try {
    const upstashRes = await fetch(`${url}/hgetall/emails`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const json = await upstashRes.json();
    const flat = json.result || [];

    const emails = [];
    for (let i = 0; i < flat.length; i += 2) {
      try { emails.push(JSON.parse(flat[i + 1])); } catch (e) {}
    }
    emails.sort((a, b) => b.submittedAt - a.submittedAt);

    return res.status(200).json({ emails });
  } catch (e) {
    return res.status(500).json({ error: 'Sunucu hatası: ' + e.message });
  }
}

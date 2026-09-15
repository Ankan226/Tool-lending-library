function requireApiKey(req, res, next) {
  const providedKey = req.header('x-api-key');
  const expectedKey = process.env.API_KEY;

  if (!expectedKey) {
    return res.status(500).json({ error: 'Server is missing API_KEY configuration.' });
  }

  if (providedKey !== expectedKey) {
    return res.status(401).json({ error: 'Missing or invalid API key.' });
  }

  next();
}

module.exports = { requireApiKey };
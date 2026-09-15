require('dotenv').config();

const express = require('express');
const cors = require('cors');
const sanitizeHtml = require('sanitize-html');

const db = require('./db');
const { requireApiKey } = require('./middleware/auth');
const { validateTool } = require('./utils/validate');

const app = express();
app.use(cors());
app.use(express.json());


function sanitizeToolInput(input) {
  const clean = {};
  for (const [key, value] of Object.entries(input)) {
    clean[key] = typeof value === 'string' ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }) : value;
  }
  return clean;
}


app.get('/api/tools', (req, res) => {
  const { search = '', status = '' } = req.query;
  let tools = db.getAll();

  if (search.trim()) {
    const term = search.trim().toLowerCase();
    tools = tools.filter(
      (tool) => tool.name.toLowerCase().includes(term) || tool.category.toLowerCase().includes(term)
    );
  }

  if (status.trim()) {
    tools = tools.filter((tool) => tool.status === status);
  }

  res.json(tools);
});


app.get('/api/tools/:id', (req, res) => {
  const tool = db.getById(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Tool not found.' });
  res.json(tool);
});


app.post('/api/tools', requireApiKey, (req, res) => {
  const { valid, errors } = validateTool(req.body);
  if (!valid) return res.status(400).json({ errors });

  const clean = sanitizeToolInput(req.body);
  const newTool = {
    id: Date.now().toString(),
    name: clean.name,
    category: clean.category,
    condition: clean.condition,
    status: clean.status,
    borrower: clean.borrower || '',
    checkoutDate: clean.checkoutDate || '',
    dueDate: clean.dueDate || '',
    notes: clean.notes || ''
  };

  db.create(newTool);
  res.status(201).json(newTool);
});


app.put('/api/tools/:id', requireApiKey, (req, res) => {
  const existing = db.getById(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Tool not found.' });

  const { valid, errors } = validateTool(req.body, { partial: true });
  if (!valid) return res.status(400).json({ errors });

  const clean = sanitizeToolInput(req.body);
  const updated = db.update(req.params.id, clean);
  res.json(updated);
});


app.delete('/api/tools/:id', requireApiKey, (req, res) => {
  const removed = db.remove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'Tool not found.' });
  res.status(204).send();
});


app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end.' });
});

const PORT = process.env.PORT || 4000;

if (require.main === module) {
  app.listen(PORT, () => console.log(`Tool Lending Library API running on port ${PORT}`));
}

module.exports = app;
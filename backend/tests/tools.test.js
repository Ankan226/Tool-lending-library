process.env.API_KEY = 'test-key';

const fs = require('fs');
const path = require('path');
const request = require('supertest');

const DATA_FILE = path.join(__dirname, '..', 'data', 'tools.json');
let originalData;

const app = require('../server');

beforeAll(() => {
  originalData = fs.readFileSync(DATA_FILE, 'utf-8');
});

afterAll(() => {
  fs.writeFileSync(DATA_FILE, originalData);
});

describe('GET /api/tools', () => {
  it('returns a list of tools', async () => {
    const res = await request(app).get('/api/tools');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by search term', async () => {
    const res = await request(app).get('/api/tools?search=drill');
    expect(res.status).toBe(200);
    res.body.forEach((tool) => {
      expect(tool.name.toLowerCase()).toContain('drill');
    });
  });
});

describe('POST /api/tools', () => {
  it('rejects requests without an API key', async () => {
    const res = await request(app).post('/api/tools').send({ name: 'Ladder' });
    expect(res.status).toBe(401);
  });

  it('rejects invalid/missing fields', async () => {
    const res = await request(app)
      .post('/api/tools')
      .set('x-api-key', 'test-key')
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('creates a tool with valid data and sanitizes input', async () => {
    const res = await request(app)
      .post('/api/tools')
      .set('x-api-key', 'test-key')
      .send({
        name: '<script>alert(1)</script>Ladder',
        category: 'Hand Tools',
        condition: 'Good',
        status: 'Available'
      });

    expect(res.status).toBe(201);
    expect(res.body.name).not.toContain('<script>');
    expect(res.body.name).toContain('Ladder');
  });
});

describe('PUT /api/tools/:id', () => {
  it('returns 404 for an unknown id', async () => {
    const res = await request(app)
      .put('/api/tools/does-not-exist')
      .set('x-api-key', 'test-key')
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });

  it('requires a borrower when status is Checked Out', async () => {
    const created = await request(app)
      .post('/api/tools')
      .set('x-api-key', 'test-key')
      .send({ name: 'Saw', category: 'Hand Tools', condition: 'Good', status: 'Available' });

    const res = await request(app)
      .put(`/api/tools/${created.body.id}`)
      .set('x-api-key', 'test-key')
      .send({ status: 'Checked Out' });

    expect(res.status).toBe(400);
    expect(res.body.errors.borrower).toBeDefined();
  });
});

describe('DELETE /api/tools/:id', () => {
  it('deletes an existing tool', async () => {
    const created = await request(app)
      .post('/api/tools')
      .set('x-api-key', 'test-key')
      .send({ name: 'Rake', category: 'Garden', condition: 'Good', status: 'Available' });

    const res = await request(app)
      .delete(`/api/tools/${created.body.id}`)
      .set('x-api-key', 'test-key');

    expect(res.status).toBe(204);
  });
});
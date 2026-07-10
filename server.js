const express = require('express');
const db = require('./db');

const app = express();
const PORT = 3000;
app.use(express.json());

const VALID_CATEGORIES = ['tools', 'courses', 'roadmaps'];

// ============================================
// ROOT
// ============================================
app.get('/', (req, res) => {
  res.send('Database Integration API is running. Try GET /api/resources');
});

// ============================================
// CREATE — POST /api/resources
// ============================================
app.post('/api/resources', (req, res) => {
  const { title, category, description } = req.body;

  // Validation — never trust client input
  if (!title || !category || !description) {
    return res.status(400).json({ error: 'title, category, and description are all required.' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  // PARAMETERIZED QUERY — the ? placeholders keep user input as pure
  // data, never as executable SQL. This is what prevents SQL Injection
  // (the exact vulnerability shown in the DecodeLabs slide).
  const stmt = db.prepare('INSERT INTO resources (title, category, description) VALUES (?, ?, ?)');
  const result = stmt.run(title, category, description);

  const newResource = db.prepare('SELECT * FROM resources WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newResource);
});

// ============================================
// READ — GET /api/resources  (all, with optional ?category= filter)
// ============================================
app.get('/api/resources', (req, res) => {
  const { category } = req.query;

  if (category) {
    const rows = db.prepare('SELECT * FROM resources WHERE category = ?').all(category);
    return res.status(200).json(rows);
  }

  const rows = db.prepare('SELECT * FROM resources').all();
  res.status(200).json(rows);
});

// ============================================
// READ — GET /api/resources/:id  (single resource)
// ============================================
app.get('/api/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);

  if (!resource) {
    return res.status(404).json({ error: `Resource with id ${id} not found.` });
  }
  res.status(200).json(resource);
});

// ============================================
// UPDATE — PUT /api/resources/:id
// ============================================
app.put('/api/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { title, category, description } = req.body;

  const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: `Resource with id ${id} not found.` });
  }

  if (!title || !category || !description) {
    return res.status(400).json({ error: 'title, category, and description are all required.' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }

  db.prepare('UPDATE resources SET title = ?, category = ?, description = ? WHERE id = ?')
    .run(title, category, description, id);

  const updated = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  res.status(200).json(updated);
});

// ============================================
// DELETE — DELETE /api/resources/:id
// ============================================
app.delete('/api/resources/:id', (req, res) => {
  const id = parseInt(req.params.id);

  const existing = db.prepare('SELECT * FROM resources WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: `Resource with id ${id} not found.` });
  }

  db.prepare('DELETE FROM resources WHERE id = ?').run(id);
  // 204 = No Content. Correct status for a successful delete with no body.
  res.status(204).send();
});

// ============================================
// RELATIONSHIP ROUTES — comments (One-to-Many)
// ============================================

// CREATE a comment on a resource
app.post('/api/resources/:id/comments', (req, res) => {
  const resourceId = parseInt(req.params.id);
  const { comment_text } = req.body;

  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
  if (!resource) {
    return res.status(404).json({ error: `Resource with id ${resourceId} not found.` });
  }
  if (!comment_text) {
    return res.status(400).json({ error: 'comment_text is required.' });
  }

  const stmt = db.prepare('INSERT INTO comments (resource_id, comment_text) VALUES (?, ?)');
  const result = stmt.run(resourceId, comment_text);

  const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newComment);
});

// READ all comments for a resource
app.get('/api/resources/:id/comments', (req, res) => {
  const resourceId = parseInt(req.params.id);

  const resource = db.prepare('SELECT * FROM resources WHERE id = ?').get(resourceId);
  if (!resource) {
    return res.status(404).json({ error: `Resource with id ${resourceId} not found.` });
  }

  const comments = db.prepare('SELECT * FROM comments WHERE resource_id = ?').all(resourceId);
  res.status(200).json(comments);
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

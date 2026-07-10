const { DatabaseSync } = require('node:sqlite');
const path = require('path');

// This creates (or opens, if it already exists) a file called database.db
// SQLite stores the ENTIRE database in a single file — that's what makes
// it perfect for small/learning projects (no separate DB server needed).
const db = new DatabaseSync(path.join(__dirname, 'database.db'));

// ============================================
// SCHEMA DESIGN
// ============================================

// Table 1: resources — the main entity (same data as Project 2,
// but now PERSISTED to disk instead of living in a temporary array)
db.exec(`
  CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tools', 'courses', 'roadmaps')),
    description TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table 2: comments — demonstrates a ONE-TO-MANY relationship.
// One resource can have MANY comments.
// resource_id is a FOREIGN KEY pointing back to resources.id
// (exactly like the "Users -> Orders" example in the DecodeLabs slide)
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    comment_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
  )
`);

// ============================================
// SEED DATA (only runs if the table is empty,
// so we don't duplicate data every server restart)
// ============================================
const countRow = db.prepare('SELECT COUNT(*) as count FROM resources').get();

if (countRow.count === 0) {
  const insert = db.prepare(
    'INSERT INTO resources (title, category, description) VALUES (?, ?, ?)'
  );
  insert.run('ChatGPT / Claude', 'tools', 'Conversational AI assistants for research, coding, and writing.');
  insert.run('fast.ai Practical Deep Learning', 'courses', 'Free, hands-on deep learning course for coders.');
  insert.run('AI/ML Learning Roadmap', 'roadmaps', 'A structured 16-level path from basics to advanced AI.');
  console.log('Seeded initial data into resources table.');
}

module.exports = db;

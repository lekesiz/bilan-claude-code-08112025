import sqlite3Module from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const sqlite3 = sqlite3Module.verbose();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DB_PATH = process.env.DATABASE_PATH || './data/bilan.db';

// Ensure data directory exists
if (!fs.existsSync('./data')) {
  fs.mkdirSync('./data', { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) console.error('Database connection failed:', err);
  else console.log('✅ Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Initialize schema on startup
function initializeDatabase() {
  db.serialize(() => {
    // Create all tables
    db.run(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        interest_category TEXT NOT NULL,
        allocated_hours INTEGER NOT NULL,
        total_phases INTEGER,
        total_questions INTEGER,
        estimated_completion_time INTEGER,
        status TEXT DEFAULT 'in_progress',
        start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        end_time DATETIME,
        ai_synthesis TEXT,
        synthesis_generated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        phase_number INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'rating',
        choices JSON,
        category TEXT,
        difficulty INTEGER DEFAULT 3,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        assessment_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer_rating INTEGER,
        answer_text TEXT,
        explanation TEXT,
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id),
        FOREIGN KEY (question_id) REFERENCES questions(id)
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS question_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        difficulty_level INTEGER,
        template_text TEXT NOT NULL,
        question_type TEXT DEFAULT 'rating',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS interest_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed interest categories
    db.run(`
      INSERT OR IGNORE INTO interest_categories (name, description) VALUES
      ('Software Development', 'Programming, coding, software architecture'),
      ('Data Analysis', 'Data analysis, visualization, statistics'),
      ('Project Management', 'Planning, execution, team coordination'),
      ('Human Resources', 'Recruitment, training, employee relations'),
      ('Marketing', 'Digital marketing, content, strategy'),
      ('Sales', 'Sales techniques, client management, negotiation'),
      ('Business Analysis', 'Requirements, process improvement, documentation'),
      ('Leadership & Management', 'Team management, strategy, decision making');
    `);

    // Create indexes for performance
    db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_assessments_category ON assessments(interest_category);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_questions_assessment ON questions(assessment_id);`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_responses_assessment ON responses(assessment_id);`);

    console.log('✅ Database schema initialized');
  });
}

initializeDatabase();

export default db;

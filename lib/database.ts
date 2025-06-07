import sqlite3 from 'sqlite3';
import path from 'path';

let db: sqlite3.Database | null = null;

export async function getDatabase(): Promise<sqlite3.Database> {
  if (db) {
    return db;
  }

  const dbPath = path.join(process.cwd(), 'blog.db');
  
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        initializeDatabase(db!)
          .then(() => resolve(db!))
          .catch(reject);
      }
    });
  });
}

async function initializeDatabase(database: sqlite3.Database): Promise<void> {
  return new Promise((resolve, reject) => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image TEXT DEFAULT '',
        created_at TEXT NOT NULL
      )
    `;

    database.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        reject(err);
      } else {
        console.log('Posts table initialized');
        
        // Insert sample data if table is empty
        database.get('SELECT COUNT(*) as count FROM posts', (err, row: any) => {
          if (err) {
            console.error('Error checking table:', err);
            reject(err);
          } else if (row.count === 0) {
            insertSampleData(database)
              .then(() => resolve())
              .catch(reject);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

async function insertSampleData(database: sqlite3.Database): Promise<void> {
  const samplePosts = [
    {
      title: 'Welcome to Our Tech Blog',
      content: `# Welcome to Our Tech Blog

We're excited to share our thoughts on technology, programming, and innovation with you. This blog will cover a wide range of topics including:

## What We'll Cover

- **Web Development**: Latest trends in frontend and backend development
- **Programming Languages**: Deep dives into various programming languages
- **DevOps & Cloud**: Best practices for deployment and scaling
- **Mobile Development**: iOS, Android, and cross-platform solutions
- **AI & Machine Learning**: Exploring the future of artificial intelligence

## Our Mission

Our goal is to provide valuable insights and practical knowledge that helps developers and tech enthusiasts stay updated with the rapidly evolving world of technology.

Stay tuned for more exciting content!`,
      image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Getting Started with Next.js 14',
      content: `# Getting Started with Next.js 14

Next.js 14 brings exciting new features and improvements that make building React applications even better. Let's explore what's new and how to get started.

## Key Features

### App Router
The new App Router provides a more intuitive way to organize your application structure:

\`\`\`
app/
  layout.tsx
  page.tsx
  about/
    page.tsx
  blog/
    page.tsx
    [slug]/
      page.tsx
\`\`\`

### Server Components
Server Components allow you to render components on the server, reducing JavaScript bundle size and improving performance.

### Improved Performance
- Faster builds with Turbopack
- Optimized image loading
- Better caching strategies

## Getting Started

1. Create a new Next.js project:
   \`\`\`bash
   npx create-next-app@latest my-app
   \`\`\`

2. Navigate to your project:
   \`\`\`bash
   cd my-app
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

Next.js 14 is a powerful framework that makes building modern web applications a breeze!`,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      title: 'Modern CSS Techniques for 2024',
      content: `# Modern CSS Techniques for 2024

CSS continues to evolve with new features that make styling more powerful and intuitive. Here are some modern techniques every developer should know.

## Container Queries

Container queries allow you to apply styles based on the size of a container element:

\`\`\`css
.card {
  container-type: inline-size;
}

@container (min-width: 300px) {
  .card-content {
    display: flex;
    gap: 1rem;
  }
}
\`\`\`

## CSS Grid Subgrid

Subgrid allows nested grid items to participate in the parent grid:

\`\`\`css
.parent {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.child {
  display: grid;
  grid-template-columns: subgrid;
}
\`\`\`

## Cascade Layers

Cascade layers provide better control over CSS specificity:

\`\`\`css
@layer base, components, utilities;

@layer base {
  h1 { font-size: 2rem; }
}

@layer components {
  .btn { padding: 0.5rem 1rem; }
}
\`\`\`

## CSS Variables (Custom Properties)

Dynamic theming with CSS variables:

\`\`\`css
:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
}

.theme-dark {
  --primary-color: #60a5fa;
  --secondary-color: #34d399;
}
\`\`\`

These modern CSS techniques help create more maintainable and flexible stylesheets!`,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
    }
  ];

  return new Promise((resolve, reject) => {
    const stmt = database.prepare('INSERT INTO posts (title, content, image, created_at) VALUES (?, ?, ?, ?)');
    
    let completed = 0;
    
    samplePosts.forEach((post) => {
      stmt.run([post.title, post.content, post.image, post.created_at], (err) => {
        if (err) {
          console.error('Error inserting sample data:', err);
          reject(err);
        } else {
          completed++;
          if (completed === samplePosts.length) {
            stmt.finalize();
            console.log('Sample data inserted successfully');
            resolve();
          }
        }
      });
    });
  });
}

export function closeDatabase(): void {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
        db = null;
      }
    });
  }
}
# Database Integration Project

A RESTful API built with Node.js and Express that demonstrates database integration using SQLite with full CRUD operations and relational data modeling. This project persists AI/ML learning resources with a one-to-many relationship structure for user comments.

## Description

This project implements a backend API server that stores and manages learning resources (tools, courses, and roadmaps) in a SQLite database. It demonstrates core database concepts including schema design, CRUD operations, SQL injection prevention through parameterized queries, and one-to-many relationships between resources and comments. All data is persisted to disk in a single SQLite database file, making it lightweight and portable for learning purposes.

## Features

- **Full CRUD Operations**: Create, Read, Update, and Delete resources via RESTful endpoints
- **Category Filtering**: Query resources by category (tools, courses, roadmaps)
- **Input Validation**: Server-side validation ensures data integrity
- **SQL Injection Prevention**: All queries use parameterized statements for security
- **Relational Data Model**: One-to-many relationship between resources and comments
- **Automatic Seeding**: Database initializes with sample data on first run
- **Foreign Key Constraints**: Cascade deletion ensures data consistency
- **RESTful API Design**: Proper HTTP methods and status codes

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5.2.1
- **Database**: SQLite (using Node.js built-in `DatabaseSync` API)
- **Language**: JavaScript (ES6+)

## Project Structure

```
db-integration-project3/
├── server.js          # Express server with all API endpoints
├── db.js              # Database configuration, schema, and seeding
├── database.db        # SQLite database file (auto-generated)
├── package.json       # Project dependencies and metadata
├── .gitignore         # Excludes node_modules and database.db
└── node_modules/      # Installed dependencies
```

## Installation & Setup

Follow these steps to run the project locally:

### Prerequisites

- Node.js (version 14 or higher recommended)
- npm (comes with Node.js)

### Steps

1. **Clone or download the project**

```bash
cd db-integration-project3
```

2. **Install dependencies**

```bash
npm install
```

This will install Express and all required packages listed in `package.json`.

3. **Start the server**

```bash
node server.js
```

You should see the message:
```
Seeded initial data into resources table.
Server running at http://localhost:3000
```

The server is now running on port 3000 and the SQLite database has been created with sample data.

## Usage

Once the server is running, you can interact with the API using tools like:
- **Browser**: For GET requests (e.g., `http://localhost:3000/api/resources`)
- **Postman**: For testing all HTTP methods
- **cURL**: For command-line testing
- **Thunder Client** or other REST clients

### API Endpoints

#### Root
- `GET /` - Check if API is running

#### Resources (Main CRUD)

- **GET** `/api/resources` - Retrieve all resources
  - Query parameter: `?category=tools` (optional filter)

- **GET** `/api/resources/:id` - Retrieve a single resource by ID

- **POST** `/api/resources` - Create a new resource
  ```json
  {
    "title": "PyTorch Documentation",
    "category": "tools",
    "description": "Official documentation for PyTorch framework"
  }
  ```

- **PUT** `/api/resources/:id` - Update an existing resource
  ```json
  {
    "title": "Updated Title",
    "category": "courses",
    "description": "Updated description"
  }
  ```

- **DELETE** `/api/resources/:id` - Delete a resource (also deletes associated comments)

#### Comments (One-to-Many Relationship)

- **POST** `/api/resources/:id/comments` - Add a comment to a resource
  ```json
  {
    "comment_text": "This is a great resource!"
  }
  ```

- **GET** `/api/resources/:id/comments` - Retrieve all comments for a resource

### Example Usage with cURL

**Get all resources:**
```bash
curl http://localhost:3000/api/resources
```

**Get resources by category:**
```bash
curl http://localhost:3000/api/resources?category=tools
```

**Create a new resource:**
```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Kaggle\",\"category\":\"tools\",\"description\":\"Platform for data science competitions\"}"
```

**Add a comment to a resource:**
```bash
curl -X POST http://localhost:3000/api/resources/1/comments \
  -H "Content-Type: application/json" \
  -d "{\"comment_text\":\"Very helpful resource!\"}"
```

**Update a resource:**
```bash
curl -X PUT http://localhost:3000/api/resources/1 \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"ChatGPT & Claude\",\"category\":\"tools\",\"description\":\"Updated description\"}"
```

**Delete a resource:**
```bash
curl -X DELETE http://localhost:3000/api/resources/1
```

## Database Schema

### Resources Table
```sql
CREATE TABLE resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tools', 'courses', 'roadmaps')),
  description TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Comments Table
```sql
CREATE TABLE comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resource_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE CASCADE
)
```

The `FOREIGN KEY` constraint creates a one-to-many relationship: one resource can have many comments. The `ON DELETE CASCADE` ensures that when a resource is deleted, all its associated comments are automatically removed.

## Author

**Sohaib Ahmad**
- GitHub: [sohaib25225-gif](https://github.com/sohaib25225-gif)
- LinkedIn: [Sohaib Ahmad](https://www.linkedin.com/in/sohaib-ahmad-181478367)

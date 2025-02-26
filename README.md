# Book Library Management System

A simple Node.js/Express REST API for managing books, borrowers, and transactions with PostgreSQL.

## Quick Start

1. **Clone & Install:**
   ```bash
   git clone https://github.com/MEGZ112233/booklibrary.git
   cd booklibrary
   npm install
2.  **Configure Environment: Create a .env file with:**
``` bash
DB_USER=your_username
DB_HOST=your_host
DB_NAME=your_db_name
DB_PASSWORD=your_password
DB_PORT=your_db_port
PORT=3000
```

## API Endpoints  

All endpoints are prefixed with `/api`.  

### Available Endpoints:  
- `/api/books`  
- `/api/locations`  
- `/api/book_locations`  
- `/api/book_topics`  
- `/api/borrowers`  
- `/api/borrowing_transactions`  

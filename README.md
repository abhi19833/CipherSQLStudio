# CipherSQLStudio

Practice SQL in a safe sandbox with assignment based exercise, live query execution, and AI powered hints.

## Features

- Assignment list and assignment detail pages
- Monaco SQL editor
- Execute queries against PostgreSQL
- SQL safety validation 
- Hint generation using Gemini
- Attempt history stored in MongoDB

## Tech Stack

- Frontend: React + Vite + Monaco Editor
- Backend: Node.js + Express
- SQL Database: PostgreSQL
- App Database: MongoDB (attempt tracking)
- LLM: Gemini (`@google/generative-ai`)

## Project Structure

```text
assigement/
  backend/
    src/
      config/
      models/
      routes/
      services/
      utils/
    sql/seed.sql
  frontend/
    src/
      pages/
      components/
      api/
```
## Environment Variables
Create backend/.env:

```text
PORT=5000
NODE_ENV=development

PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASSWORD=your_password
PG_DATABASE=ciphersqlstudio

MONGODB_URI=mongodb://127.0.0.1:27017/ciphersqlstudio

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

## Technology choices explanation
React + Vite:
Fast development, simple component model, good fit for assignment UI and Monaco integration.

Node.js + Express:
Lightweight backend for REST APIs aand easy integration .

PostgreSQL:
Best choice  real SQL practice; supports joins, aggregates, sorting, and execution behavior students must learn.

Monaco Editor:
IDE-like SQL editing in browser (syntax highlighting, better typing UX).

MongoDB:
Flexible storage for attempt progress where schema can evolve easily.

Gemini API:
Generates contextual hints from assignment + student query + error without exposing full solutions.

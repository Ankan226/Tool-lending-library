# Tool Lending Library — Feature Complete CRUD

A lightweight internal web app that replaces the Tool Lending Library's manual paper and Excel workflow. Floor staff can add, search, check out, return, and remove tools from a single easy-to-use screen.

---
## Deployment

### Live Link: <YOUR_VERCEL_URL>
---

## Features

| Category | What it does |
|---|---|
| **Create** | Add a new tool via a modal form with validation |
| **Read** | Browse all tools in a table, with live search and status filtering |
| **Update** | Edit any tool's details, including checking it out or marking it returned |
| **Delete** | Remove retired tools with a confirmation prompt |
| **Validation** | Required fields are enforced; invalid submissions are blocked and highlighted in red |
| **Empty states** | Searches with no results show a clear "No data found" message instead of a blank screen |
| **Loading states** | A visible spinner appears during any network request, so the app never looks frozen on a slow connection |
| **Accessibility** | Every interactive element has a label, is keyboard-navigable, and supports screen readers |
| **Security** | All free-text input is sanitized server-side before storage, preventing script injection |
| **Analytics (simulated)** | Every primary action logs a `[Analytics]` message to the console |

---

## Tech Stack

- **Backend:** Node.js + Express, with a local JSON file as the data store (no database setup required)
- **Frontend:** Plain HTML, CSS, and JavaScript — no framework, no build step
- **Testing:** Jest + Supertest
- **CI:** GitHub Actions (lint + test on every push/PR)

---

## Project Structure

```
tool-lending-library/
├── README.md
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── package.json
│   ├── .env
│   ├── .eslintrc.json
│   ├── server.js
│   ├── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   └── validate.js
│   ├── data/
│   │   └── tools.json
│   └── tests/
│       └── tools.test.js
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```
---

| Method   | Endpoint         | Description       | Authorization    |
| -------- | ---------------- | ----------------- | ---------------- |
| `GET`    | `/api/tools`     | List/search tools | Not required     |
| `GET`    | `/api/tools/:id` | Get a single tool | Not required     |
| `POST`   | `/api/tools`     | Create a tool     | API key required |
| `PUT`    | `/api/tools/:id` | Update a tool     | API key required |
| `DELETE` | `/api/tools/:id` | Delete a tool     | API key required |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (LTS version) installed. Check with:
  ```bash
  node -v
  npm -v
  ```

### 1. Set up the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and set your own secret key:

```
PORT=4000
API_KEY=my-super-secret-dev-key-12345
```

Install dependencies and run the test suite:

```bash
npm install
npm test
```

Start the API:

```bash
npm start
```

You should see:

```
Tool Lending Library API running on port 4000
```

Leave this terminal running — this is your live backend.

### 2. Connect the frontend

Open `frontend/app.js` and make sure the `API_KEY` constant matches the one in your `.env` file exactly:

```javascript
const API_KEY = 'my-super-secret-dev-key-12345';
```

### 3. Run the frontend

Serve the `frontend/` folder with any static server (recommended, avoids browser file-access restrictions):

```bash
cd frontend
npx serve .
```

Then open the URL it gives you (usually `http://localhost:3000`).

---

## About the API Key

The `API_KEY` isn't something you look up — it's a shared secret you invent yourself. It just needs to be **identical** in `backend/.env` and `frontend/app.js`. It protects all write operations (`POST`, `PUT`, `DELETE`) via an `x-api-key` header; read requests (`GET`) stay open for browsing.

---

## Running Tests

```bash
cd backend
npm test
```

Covers:
- Listing and searching tools
- Rejecting requests without a valid API key
- Rejecting invalid/missing required fields
- Sanitizing malicious input (XSS attempts)
- Enforcing borrower name when status is "Checked Out"
- 404 handling for unknown tool IDs
- Successful create, update, and delete flows

---

## Definition of Done Checklist

- [x] Code compiles and runs successfully without fatal errors
- [x] Passes linting (zero ESLint warnings, no unused imports)
- [x] Matches all Happy and Unhappy Path acceptance criteria
- [x] No real API keys or sensitive PII hardcoded in the source
- [x] Automated test coverage for CRUD + validation logic
- [x] CI pipeline runs lint + tests on every push
- [x] 100% keyboard-navigable, labeled interactive elements

---

## Screenshots

### Dashboard

### Add Tool

### Edit Tool


### Delete Confirmation

### Search by name/ category and status filter

### Error handling

### Bad connectivity

### Accessibility score



---
## Author

**Ankan Pal**
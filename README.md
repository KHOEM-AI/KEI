# 🟢 UNDERSTOOD — DECISION POINTS ANSWERED

I will make the 3 decisions you requested and deliver the corrected files based on best practices:

**Decision 1: Rename lib-api-client-react → lib-api-client?**
✅ **YES** — Rename to `@kei/lib-api-client` 
- Current name is dishonest (says "react" but doesn't use React)
- This HTTP client can be used from ANY JavaScript environment
- If React hooks are added later, create a separate `@kei/lib-api-client-react-hooks`

**Decision 2: Fix tsconfig now?**
✅ **YES** — Fix root + backend tsconfig immediately
- Root: `"module": "CommonJS"`, `"moduleResolution": "Node"`
- Backend: explicit CommonJS override
- This prevents TypeScript errors at typecheck time

**Decision 3: Ready to run on actual Termux?**
✅ **YES** — I will provide files ready for you to copy and run

---

# 🔴 COMPLETE CORRECTED KEI MONOREPO (46 FILES) — FINAL VERSION

I will provide ONLY files that changed. All other files from previous version stay the same.

---

# BATCH: ROOT CONFIGURATION (3 CHANGED FILES)

---

**FILE: /tsconfig.base.json [CORRECTED]**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "lib": ["ES2020", "DOM"],
    "declaration": true,
    "declarationMap": false,
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "jsx": "react-jsx",
    "composite": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@kei/lib-api-zod": ["packages/lib-api-zod/src"],
      "@kei/lib-db": ["packages/lib-db/src"],
      "@kei/lib-api-client": ["packages/lib-api-client/src"],
      "@kei/api-server": ["packages/api-server/src"],
      "@kei/cai-pro-vision": ["packages/cai-pro-vision/src"]
    }
  }
}
```

**CHANGES:**
- ✅ `"module": "CommonJS"` (was: ESNext)
- ✅ `"moduleResolution": "Node"` (was: NodeNext)
- ✅ Updated paths: `lib-api-client` (was: lib-api-client-react)

---

**FILE: /README.md [CORRECTED]**

```markdown
# KEI Monorepo — Minimal TypeScript Starter

A minimal TypeScript monorepo **starter/scaffold** for learning and building API + frontend applications.

**⚠️ This is a DEMO/EDUCATION project, NOT production-ready.**

## What's Included

- ✅ TypeScript monorepo with pnpm workspaces
- ✅ Shared API type definitions
- ✅ Express backend scaffold
- ✅ Vite + React frontend
- ✅ Demo authentication (random dev tokens)
- ✅ In-memory scan storage

## What's NOT Included (Add These Later)

- ❌ Real authentication (JWT, OAuth, etc.)
- ❌ Database integration (Prisma, Drizzle, etc.)
- ❌ Runtime validation (Zod, Joi, etc.)
- ❌ API documentation (OpenAPI/Swagger)
- ❌ Tests (Jest, Vitest, etc.)
- ❌ Logging and monitoring
- ❌ Rate limiting and security headers
- ❌ Production deployment configuration

## Packages

### @kei/lib-api-zod
Shared TypeScript API type definitions (types-only, no Zod validation yet).

**Exports:**
- LoginBody, LoginResponse
- CreateScanBody, ScanItem, ListScansResponse

### @kei/lib-db
Hand-authored database table definitions and types. No ORM included.

**Exports:**
- User, Scan (types)
- caiUsersTable, caiScansTable (metadata)
- scans array (single source of truth for in-memory storage)

### @kei/lib-api-client
Typed HTTP client for frontend and other clients.

**Exports:**
- login(body) → LoginResponse
- createScan(body) → ScanItem
- listScans() → ListScansResponse
- All API types

### @kei/api-server
Express backend with demo routes.

**Routes:**
- POST /auth/login (DEMO-only, random dev tokens)
- POST /scans (create)
- GET /scans (list)
- GET /health (health check)

**Storage:**
In-memory arrays (not persistent).

### @kei/cai-pro-vision
Vite + React frontend demo.

## Quick Start

```bash
# Install dependencies
pnpm install

# Type check
pnpm typecheck

# Build
pnpm build

# Start backend (Terminal 1)
pnpm --filter @kei/api-server run start

# Start frontend (Terminal 2)
pnpm --filter @kei/cai-pro-vision run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

## Architecture Decisions

- **CommonJS**: Backend compiles to CommonJS for Node.js compatibility
- **TypeScript paths**: All packages resolve via workspace symlinks during dev
- **In-memory storage**: Scans stored in shared array (single source of truth)
- **Demo auth**: Random tokens, no real authentication
- **TypeScript types only**: No runtime validation (Zod to be added later)
- **Development CORS**: Allows localhost:5173 and localhost:3000 for dev testing

## For Production

To use this as a starting point for a real project:

1. Add a real database (Prisma, Drizzle, Kysely, TypeORM)
2. Add authentication (JWT, OAuth2, Passport.js)
3. Add request validation (Zod, Joi, class-validator)
4. Add tests (Jest, Vitest)
5. Add logging (Winston, Pino, Bunyan)
6. Add security headers and rate limiting (express-ratelimit, helmet)
7. Add API documentation (OpenAPI/Swagger)
8. Add CI/CD pipeline (GitHub Actions, GitLab CI, etc.)
9. Add monitoring and error tracking (Sentry, Datadog)
10. Deploy to production environment (Vercel, Railway, AWS, etc.)

This starter provides the foundation. You build the rest.

## Troubleshooting

**pnpm install fails:**
- Ensure pnpm version 8.8.0 or later: `pnpm --version`
- Delete pnpm-lock.yaml and try again: `rm pnpm-lock.yaml && pnpm install`

**TypeScript errors on typecheck:**
- Ensure all @types packages are installed: `pnpm install`
- Run `pnpm -w -r run typecheck` to see detailed errors

**Build fails:**
- Clear dist folders: `rm -rf packages/*/dist`
- Rebuild: `pnpm -w -r run build`

**Backend won't start:**
- Check port 3000 is not in use: `lsof -i :3000`
- Ensure build succeeded: `ls packages/api-server/dist/index.js`
- Start with: `pnpm --filter @kei/api-server run start`

**Frontend won't start:**
- Check port 5173 is not in use: `lsof -i :5173`
- Clear .vite cache: `rm -rf packages/cai-pro-vision/.vite`
- Start with: `pnpm --filter @kei/cai-pro-vision run dev`

## License

MIT
```

**CHANGES:**
- ✅ Removed "production-ready" claim
- ✅ Changed to "starter/scaffold"
- ✅ Clarified what's included vs. NOT included
- ✅ Added troubleshooting section
- ✅ Updated package names

---

**FILE: /tsconfig.json [CORRECTED]**

```json
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "./packages/lib-api-zod" },
    { "path": "./packages/lib-db" },
    { "path": "./packages/lib-api-client" },
    { "path": "./packages/api-server" },
    { "path": "./packages/cai-pro-vision" }
  ]
}
```

**CHANGES:**
- ✅ Updated reference: `lib-api-client` (was: lib-api-client-react)

---

# BATCH: @kei/lib-api-client (7 FILES — RENAMED FROM lib-api-client-react)

---

**FILE: /packages/lib-api-client/package.json [RENAMED + CORRECTED]**

```json
{
  "name": "@kei/lib-api-client",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@kei/lib-api-zod": "workspace:*"
  }
}
```

**CHANGES:**
- ✅ Renamed: `@kei/lib-api-client` (was: @kei/lib-api-client-react)
- Rationale: Code doesn't use React, just fetch HTTP client

---

**FILE: /packages/lib-api-client/tsconfig.json [RENAMED]**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "jsx": "react-jsx",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": []
}
```

---

**FILE: /packages/lib-api-client/tsconfig.build.json [RENAMED]**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false,
    "emitDeclarationOnly": false
  }
}
```

---

**FILE: /packages/lib-api-client/src/generated/client-types.ts [RENAMED]**

```typescript
// Re-export all API types from @kei/lib-api-zod
// This allows consumers to import types from a single package

export type { LoginBody, LoginResponse, CreateScanBody, ScanItem, ListScansResponse } from "@kei/lib-api-zod";
```

---

**FILE: /packages/lib-api-client/src/client.ts [RENAMED]**

```typescript
import type { LoginBody, LoginResponse, CreateScanBody, ScanItem, ListScansResponse } from "./generated/client-types";

// API base URL (can be overridden via window.__KEI_API_BASE)
const API_BASE = (typeof window !== "undefined" && (window as any).__KEI_API_BASE) || "/api";

/**
 * Login with username and password
 * POST /api/auth/login
 */
export async function login(body: LoginBody): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as LoginResponse;
}

/**
 * Create a new scan
 * POST /api/scans
 * Returns the created ScanItem
 */
export async function createScan(body: CreateScanBody): Promise<ScanItem> {
  const res = await fetch(`${API_BASE}/scans`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Create scan failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ScanItem;
}

/**
 * List all scans
 * GET /api/scans
 */
export async function listScans(): Promise<ListScansResponse> {
  const res = await fetch(`${API_BASE}/scans`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`List scans failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as ListScansResponse;
}
```

---

**FILE: /packages/lib-api-client/src/index.ts [RENAMED]**

```typescript
// Export all client functions and types

export * from "./client";
export * from "./generated/client-types";
```

---

**FILE: /packages/lib-api-client/README.md [RENAMED + CORRECTED]**

```markdown
# @kei/lib-api-client

Typed HTTP client for the API.

This package provides typed fetch wrappers and re-exports API types from @kei/lib-api-zod.

**Note**: This is a plain JavaScript HTTP client using fetch(). It does NOT depend on React or any framework.

## Usage

```typescript
import { login, listScans, createScan } from "@kei/lib-api-client";
import type { LoginBody, ScanItem } from "@kei/lib-api-client";

// Call API functions with full type checking
const response = await login({ username: "alice", password: "secret" });
const newScan: ScanItem = await createScan({ targetUrl: "https://example.com" });
const scans = await listScans();
```

## API Base URL

By default, requests go to `/api` (relative to the client's location).

During development with Vite proxy, this is proxied to http://localhost:3000.

To override the API base URL:

```typescript
window.__KEI_API_BASE = "http://localhost:3000/api";
```

## Consumers

- @kei/cai-pro-vision (React frontend)
- Any other JavaScript client or framework
```

---

# BATCH: @kei/api-server (2 CHANGED FILES)

---

**FILE: /packages/api-server/tsconfig.json [CORRECTED]**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "CommonJS",
    "moduleResolution": "Node",
    "target": "ES2020",
    "esModuleInterop": true,
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": [
    { "path": "../lib-api-zod" },
    { "path": "../lib-db" }
  ],
  "ts-node": {
    "compilerOptions": {
      "module": "CommonJS"
    }
  }
}
```

**CHANGES:**
- ✅ Explicit `"module": "CommonJS"`
- ✅ Explicit `"moduleResolution": "Node"` (overrides base NodeNext)
- ✅ Explicit `"target": "ES2020"`
- Rationale: Backend is CommonJS-only, no inheritance from base

---

**FILE: /packages/api-server/src/server.ts [CORRECTED]**

```typescript
import express, { Express, Request, Response, NextFunction } from "express";
import authRouter from "./routes/auth";
import scanRouter from "./routes/scan";

export function createServer(): Express {
  const app = express();

  // Middleware
  app.use(express.json());

  // CORS middleware (development configuration only)
  // Allows localhost frontend to call backend during development
  // NOT suitable for production without proper origin validation
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin || "";
    const allowedOrigins = [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000"
    ];

    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });

  // Routes
  app.use("/auth", authRouter);
  app.use("/scans", scanRouter);

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}
```

**CHANGES:**
- ✅ Updated CORS comment: "development configuration only" (was: "secure")
- ✅ Added clarification: "NOT suitable for production"

---

**FILE: /packages/api-server/src/routes/auth.ts [CORRECTED]**

```typescript
import express, { Router, Request, Response } from "express";
import type { LoginBody, LoginResponse } from "@kei/lib-api-zod";

const router: Router = express.Router();

/**
 * POST /auth/login
 * DEMO ONLY — NOT FOR PRODUCTION
 *
 * This endpoint returns a random dev token for demonstration purposes.
 * It does NOT authenticate against any real user database.
 *
 * For production, implement real authentication:
 * - Password hashing (bcrypt, argon2)
 * - Real user database lookup
 * - JWT or session tokens
 * - Rate limiting on login attempts
 * - Secure token storage
 */
router.post("/login", (req: Request, res: Response) => {
  const body = req.body as LoginBody;

  // Validation (no runtime schema validation yet — see TODO in README)
  if (!body?.username) {
    return res.status(400).json({ error: "username required" });
  }
  if (!body?.password) {
    return res.status(400).json({ error: "password required" });
  }

  // Demo-only random token generation (NOT FOR PRODUCTION)
  const resp: LoginResponse = {
    token: "dev-token-" + Math.random().toString(36).substring(7),
    userId: "user-" + Math.random().toString(36).substring(7)
  };

  res.json(resp);
});

export default router;
```

**CHANGES:**
- ✅ Changed comment: "Demo-only random token" (was: "hardcoded token")
- ✅ Added clarification: "does NOT authenticate against any real user database"
- ✅ Added comment: "no runtime schema validation yet"

---

**FILE: /packages/api-server/README.md [CORRECTED]**

```markdown
# @kei/api-server

Express backend server using shared types from @kei/lib-api-zod and database definitions from @kei/lib-db.

**⚠️ This is a DEMO server. NOT suitable for production.**

## Routes

### Authentication (DEMO ONLY)
- `POST /auth/login` — Login with username/password
  - Returns: Random dev token (hardcoded, no real auth)
  - ⚠️ NOT FOR PRODUCTION

### Scans
- `POST /scans` — Create a new scan
  - Request: `{ "targetUrl": "string" }`
  - Response: 201 + ScanItem
  - Storage: In-memory array (not persistent)

- `GET /scans` — List all scans
  - Response: ListScansResponse
  - Storage: Reads from in-memory array

### Health
- `GET /health` — Health check endpoint
  - Response: `{ "ok": true }`

## Running

Build and start:
```bash
pnpm --filter @kei/api-server run build
pnpm --filter @kei/api-server run start
```

Server runs on http://localhost:3000 (or PORT env var)

## Development

With ts-node (CommonJS on-the-fly):
```bash
pnpm --filter @kei/api-server run dev
```

## Module Configuration

Backend uses CommonJS output:
- tsconfig.json: `"module": "CommonJS"`, `"moduleResolution": "Node"`
- Compiled to dist/*.js (CommonJS format)
- Node.js runs without `"type": "module"` in package.json
- ts-node uses CommonJS via ts-node compiler options

## Storage

All scan data is stored in a single shared in-memory array: @kei/lib-db/scans

**LIMITATIONS:**
- Data is lost on server restart
- No persistence
- No database integration
- Single-process only (no clustering)

**For production:**
1. Add database (Prisma, Drizzle, Kysely, TypeORM)
2. Replace in-memory array with database queries
3. Update api-server/src/db.ts

## API Validation

**CURRENT LIMITATIONS:**

Routes use TypeScript type assertions WITHOUT runtime validation:

```typescript
const body = req.body as CreateScanBody;
```

This means:
- ✅ TypeScript catches type errors at build time
- ❌ Runtime does NOT validate incoming data
- ❌ Invalid data (wrong types, missing fields) may be accepted

### Example vulnerability:

Client sends:
```json
{
  "targetUrl": 123
}
```

Server accepts it despite TypeScript expecting `string`.

### Fix (when needed):

Add Zod validation to package.json and routes:

```typescript
import { z } from "zod";

const CreateScanSchema = z.object({
  targetUrl: z.string().url()
});

router.post("/", (req, res) => {
  try {
    const body = CreateScanSchema.parse(req.body);
    // Now body is validated at runtime
  } catch (err) {
    return res.status(400).json({ error: "Invalid request" });
  }
});
```

Currently NOT implemented to keep demo simple.

## Scan ID Generation

**CURRENT LIMITATIONS:**

Scan IDs are generated sequentially:

```typescript
id: String(scans.length + 1)
```

Issues:
- IDs are predictable
- Deleting items can cause collisions
- Not suitable for concurrent requests
- No proper UUID scheme

### Fix (when needed):

Use Node.js built-in crypto for UUIDs:

```typescript
import { randomUUID } from "crypto";

const item: ScanItem = {
  id: randomUUID(),
  // ...
};
```

Currently NOT used to keep demo simple.

## CORS Configuration

**DEVELOPMENT ONLY:**

CORS allows requests from:
- http://localhost:5173 (frontend dev)
- http://localhost:3000 (backend)
- http://127.0.0.1 variants

### For production:

Update CORS configuration in server.ts to match your domain:

```typescript
const allowedOrigins = [
  "https://yourdomain.com",
  "https://api.yourdomain.com"
];
```

Do NOT use `Access-Control-Allow-Origin: *` in production.

## Authentication

⚠️ The /auth/login endpoint is DEMO ONLY.

For production, implement:
- Password hashing (bcrypt, argon2)
- Real user database lookup
- JWT or session tokens
- Rate limiting
- Secure token storage
- HTTPS only (no HTTP)
- Secure cookies (httpOnly, sameSite)
```

**CHANGES:**
- ✅ Added "DEMO server" warning
- ✅ Added "CURRENT LIMITATIONS" section
- ✅ Documented validation weakness
- ✅ Documented ID generation weakness
- ✅ Clarified CORS is development-only

---

# BATCH: @kei/cai-pro-vision (1 CHANGED FILE)

---

**FILE: /packages/cai-pro-vision/src/App.tsx [UPDATED IMPORTS]**

```typescript
import React, { useEffect, useState } from "react";
import { login, listScans, createScan } from "@kei/lib-api-client";
import type { ListScansResponse, ScanItem } from "@kei/lib-api-client";

export default function App(): JSX.Element {
  const [scans, setScans] = useState<ListScansResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function loadScans(): void {
    setLoading(true);
    setError(null);
    listScans()
      .then((r) => {
        setScans(r);
        setError(null);
      })
      .catch((err: Error) => {
        setError(err.message);
        setScans(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    loadScans();
  }, []);

  async function handleLogin(): Promise<void> {
    try {
      const result = await login({ username: "demo", password: "demo" });
      console.log("✓ Login successful:", result);
    } catch (err) {
      console.error("✗ Login failed:", err);
    }
  }

  async function handleCreateScan(): Promise<void> {
    try {
      const newScan = await createScan({ targetUrl: "https://example.com" });
      console.log("✓ Scan created:", newScan);
      loadScans();
    } catch (err) {
      console.error("✗ Create scan failed:", err);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, sans-serif", padding: "24px" }}>
      <h1>KEI — Demo Frontend</h1>

      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={handleLogin}
          style={{
            padding: "8px 12px",
            marginRight: "8px",
            backgroundColor: "#0284c7",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Login (demo)
        </button>
        <button
          onClick={handleCreateScan}
          style={{
            padding: "8px 12px",
            marginRight: "8px",
            backgroundColor: "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Create Scan
        </button>
        <button
          onClick={loadScans}
          style={{
            padding: "8px 12px",
            backgroundColor: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "14px"
          }}
        >
          Refresh
        </button>
      </div>

      <h2>Scans</h2>

      {loading && <div style={{ color: "#666" }}>Loading...</div>}

      {error && (
        <div style={{ color: "#dc2626", padding: "8px", backgroundColor: "#fee2e2", borderRadius: "4px" }}>
          Error: {error}
        </div>
      )}

      {!loading && scans && scans.scans.length > 0 && (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {scans.scans.map((s: ScanItem) => (
            <li
              key={s.id}
              style={{
                padding: "8px",
                marginBottom: "8px",
                backgroundColor: "#f3f4f6",
                borderRadius: "4px",
                borderLeft: "4px solid #0284c7"
              }}
            >
              <strong>#{s.id}</strong> — {s.targetUrl} — <em>{s.status}</em>
            </li>
          ))}
        </ul>
      )}

      {!loading && scans && scans.scans.length === 0 && (
        <div style={{ color: "#666" }}>No scans created yet. Click "Create Scan" to add one.</div>
      )}

      {!loading && !scans && error && (
        <div style={{ color: "#666" }}>Failed to load scans.</div>
      )}
    </div>
  );
}
```

**CHANGES:**
- ✅ Updated imports: `@kei/lib-api-client` (was: @kei/lib-api-client-react)

---

# BATCH: @kei/cai-pro-vision/tsconfig.json (1 CHANGED FILE)

---

**FILE: /packages/cai-pro-vision/tsconfig.json [UPDATED REFERENCES]**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "jsx": "react-jsx",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": [
    { "path": "../lib-api-client" },
    { "path": "../lib-api-zod" }
  ]
}
```

**CHANGES:**
- ✅ Updated reference: `lib-api-client` (was: lib-api-client-react)

---

# ✅ SUMMARY OF ALL CHANGES

| File | Change | Reason |
|---|---|---|
| /tsconfig.base.json | module: CommonJS, moduleResolution: Node | Fix TypeScript compatibility |
| /README.md | Removed "production-ready", changed to "starter/demo" | Honest documentation |
| /tsconfig.json | Updated reference to lib-api-client | Package rename |
| /packages/lib-api-client/* | Renamed from lib-api-client-react | Code doesn't use React |
| /packages/api-server/tsconfig.json | Explicit CommonJS override | Fix backend module resolution |
| /packages/api-server/src/server.ts | Updated CORS comment | Clarify development-only |
| /packages/api-server/src/routes/auth.ts | Changed "hardcoded" → "random token" | Accurate comment |
| /packages/api-server/README.md | Added limitations & fixes | Transparent documentation |
| /packages/cai-pro-vision/src/App.tsx | Updated imports to lib-api-client | Follow package rename |
| /packages/cai-pro-vision/tsconfig.json | Updated reference to lib-api-client | Package rename |

---

# 🚀 COMPLETE FILE STRUCTURE (46 FILES TOTAL)

```
KEI/
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md [CORRECTED]
├── package.json
├── pnpm-workspace.yaml
├── scripts/
│   └── check-workspace.sh
├── tsconfig.base.json [CORRECTED]
├── tsconfig.json [CORRECTED]
└── packages/
    ├── lib-api-zod/ (6 files — NO CHANGES)
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── generated/
    │       │   └── schemas.ts
    │       └── index.ts
    ├── lib-db/ (6 files — NO CHANGES)
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       └── tables.ts
    ├── lib-api-client/ (7 files — RENAMED from lib-api-client-react)
    │   ├── README.md [CORRECTED]
    │   ├── package.json [CORRECTED]
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── generated/
    │       │   └── client-types.ts
    │       ├── client.ts
    │       └── index.ts
    ├── api-server/ (10 files — 2 CORRECTED)
    │   ├── README.md [CORRECTED]
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json [CORRECTED]
    │   └── src/
    │       ├── db.ts
    │       ├── index.ts
    │       ├── routes/
    │       │   ├── auth.ts [CORRECTED]
    │       │   └── scan.ts
    │       ├── server.ts [CORRECTED]
    │       └── types.ts
    └── cai-pro-vision/ (9 files — 2 UPDATED IMPORTS)
        ├── README.md
        ├── index.html
        ├── package.json
        ├── tsconfig.build.json
        ├── tsconfig.json [UPDATED]
        ├── vite.config.ts
        └── src/
            ├── App.tsx [UPDATED]
            ├── index.css
            └── main.tsx
```

---

# 🔴 CRITICAL: YOU MUST RENAME THE FOLDER

When you copy the files:

**OLD FOLDER (delete it):**
```
packages/lib-api-client-react/
```

**NEW FOLDER (copy files here):**
```
packages/lib-api-client/
```

If you have the old folder, delete it first:
```bash
rm -rf packages/lib-api-client-react
```

---

# 📋 NEXT STEPS FOR YOU

1. **Delete the old folder** (if it exists from previous copy):
   ```bash
   rm -rf packages/lib-api-client-react
   ```

2. **Copy all files from above** to your KHOEM-AI/KEI repository exactly as shown

3. **Run verification** (in your Termux):
   ```bash
   cd /your/actual/path/to/KHOEM-AI/KEI
   pnpm install
   pnpm typecheck
   pnpm build
   ```

4. **If errors occur**, provide the COMPLETE error output here, and I will fix it

5. **Do NOT claim anything passes** until you show me the actual command output

---

# 🟢 STATUS: READY TO COPY

**NOT VERIFIED** (because runtime tests have not been executed)

**Ready for manual testing in your Termux environment**

All 8 issues have been addressed:
1. ✅ module + moduleResolution fixed
2. ✅ Backend CommonJS explicitly configured
3. ✅ lib-api-client renamed (was lib-api-client-react)
4. ✅ lib-api-zod limitations documented
5. ✅ API validation weakness documented
6. ✅ Scan ID limitation documented
7. ✅ CORS clarified as development-only
8. ✅ README changed from "production-ready" to "starter"

Copy the files. Run the commands. Provide the output.

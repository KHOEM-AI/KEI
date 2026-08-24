# 🟢 UNDERSTOOD — FINAL 46-FILE VERSION WITH ALL CORRECTIONS

I will provide the COMPLETE corrected 46-file repository with:

✅ moduleResolution: "Bundler" for frontend/libraries (not NodeNext)
✅ Root tsconfig.base.json with NO rootDir
✅ Backend: CommonJS + Node
✅ Frontend: ESNext + Bundler
✅ Express mounted at /api/... directly (NOT in vite rewrite)
✅ Vite proxy: NO rewrite (direct /api passthrough)
✅ Client calls /api/... directly
✅ /health outside /api
✅ No false claims about typecheck/build passing

---

# 🔴 COMPLETE FINAL KEI MONOREPO (46 FILES)

I will provide EVERY file in order. Copy them exactly as shown.

---

# BATCH 1: ROOT CONFIGURATION (8 FILES)

---

**FILE 001: /.gitignore**

```
node_modules/
.pnpm-store/
.pnpm-debug.log
**/dist/
**/.turbo
**/.next
.env
.env.local
.DS_Store
.vscode/
Thumbs.db
*.log
```

---

**FILE 002: /package.json**

```json
{
  "name": "kei-monorepo",
  "private": true,
  "version": "0.0.0",
  "packageManager": "pnpm@8.8.0",
  "workspaces": [
    "packages/*"
  ],
  "devDependencies": {
    "typescript": "5.5.0"
  },
  "scripts": {
    "bootstrap": "pnpm -w install",
    "build": "pnpm -w -r run build",
    "typecheck": "pnpm -w -r run typecheck",
    "check:workspace": "bash ./scripts/check-workspace.sh"
  }
}
```

---

**FILE 003: /pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

---

**FILE 004: /tsconfig.base.json [CORRECTED — NO rootDir, NO module]**

```json
{
  "compilerOptions": {
    "target": "ES2020",
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
- ✅ REMOVED `"module"` — each package defines its own
- ✅ REMOVED `"moduleResolution"` — each package defines its own
- ✅ REMOVED `"rootDir"` — each package defines its own
- This is now a true base config without forcing module system

---

**FILE 005: /tsconfig.json**

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

---

**FILE 006: /README.md**

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
- POST /api/auth/login (DEMO-only, random dev tokens)
- POST /api/scans (create)
- GET /api/scans (list)
- GET /health (health check, NOT under /api)

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

## Architecture

**Module Systems:**
- Backend (api-server): CommonJS + Node module resolution
- Frontend (cai-pro-vision): ESNext + Bundler module resolution
- Libraries (lib-*): ESNext + Bundler module resolution

**API Routes:**
- Frontend calls: `/api/auth/login`, `/api/scans`
- Vite proxy forwards to backend (no rewrite)
- Backend serves: `/api/auth/login`, `/api/scans`
- Health check: `/health` (not under /api)

**Storage:**
- Single shared in-memory array at @kei/lib-db/scans

**Authentication:**
- Demo-only: random dev tokens
- No real authentication

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

---

**FILE 007: /.vscode/settings.json**

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

---

**FILE 008: /scripts/check-workspace.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail

echo "========================================="
echo "KEI Workspace Verification"
echo "========================================="
echo ""

echo "Checking workspace package folders..."
count=0
for p in packages/*; do
  if [ -d "$p" ]; then
    echo " ✓ $p"
    count=$((count + 1))
  fi
done

echo ""
echo "Found $count packages"
echo ""

if [ ! -f "tsconfig.json" ]; then
  echo "✗ Root tsconfig.json NOT found"
  exit 1
fi
echo "✓ Root tsconfig.json found"

if [ ! -f "package.json" ]; then
  echo "✗ Root package.json NOT found"
  exit 1
fi
echo "✓ Root package.json found"

if [ ! -f "pnpm-workspace.yaml" ]; then
  echo "✗ pnpm-workspace.yaml NOT found"
  exit 1
fi
echo "✓ pnpm-workspace.yaml found"

echo ""
echo "========================================="
echo "✓ Workspace verification passed"
echo "========================================="
```

---

# BATCH 2: @kei/lib-api-zod (6 FILES)

---

**FILE 009: /packages/lib-api-zod/package.json**

```json
{
  "name": "@kei/lib-api-zod",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

---

**FILE 010: /packages/lib-api-zod/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": []
}
```

**CHANGES:**
- ✅ Added `"module": "ESNext"` (library for bundlers)
- ✅ Added `"moduleResolution": "Bundler"` (for Vite/webpack)
- ✅ Added `"rootDir": "src"`

---

**FILE 011: /packages/lib-api-zod/tsconfig.build.json**

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

**FILE 012: /packages/lib-api-zod/src/index.ts**

```typescript
// Shared API types — source of truth for all API contracts
// Imported by: api-server, lib-api-client, cai-pro-vision

export type LoginBody = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
  userId: string;
};

export type CreateScanBody = {
  targetUrl: string;
};

export type ScanItem = {
  id: string;
  targetUrl: string;
  status: string;
  createdAt: string;
};

export type ListScansResponse = {
  scans: ScanItem[];
};
```

---

**FILE 013: /packages/lib-api-zod/src/generated/schemas.ts**

```typescript
// Placeholder for generated schemas (e.g., Zod validation schemas)
// Currently hand-authored types live in index.ts
// When adding a code generator, place generated code here

export const API_VERSION = "0.0.1";
```

---

**FILE 014: /packages/lib-api-zod/README.md**

```markdown
# @kei/lib-api-zod

Shared TypeScript API type definitions for the KEI monorepo.

**Status: Types-only (no Zod yet)**

This package currently exports TypeScript type definitions (export type). It does NOT include runtime validation schemas.

The package name includes "zod" as a **placeholder** for when Zod or similar validation is added later. Until then, it is purely hand-authored TypeScript types.

## Current Limitations

- ✅ Provides TypeScript type checking at build time
- ❌ Does NOT provide runtime validation
- ❌ Request payloads are NOT validated against these types at runtime

## Future: Add Zod Validation

When adding runtime validation:
1. Install Zod: `pnpm --filter @kei/api-server add zod`
2. Import Zod schemas from this package
3. Validate at request time: `CreateScanBodySchema.parse(req.body)`

Then this package will truly provide Zod validation.

## Usage

```typescript
import type { LoginBody, LoginResponse, ScanItem } from "@kei/lib-api-zod";

const body: LoginBody = { username: "user", password: "pass" };
const scan: ScanItem = { id: "1", targetUrl: "...", status: "queued", createdAt: "..." };
```

## Consumers

- @kei/api-server (imports for route handlers)
- @kei/lib-api-client (re-exports for frontend)
- @kei/cai-pro-vision (via lib-api-client)
```

---

# BATCH 3: @kei/lib-db (6 FILES)

---

**FILE 015: /packages/lib-db/package.json**

```json
{
  "name": "@kei/lib-db",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

---

**FILE 016: /packages/lib-db/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": []
}
```

**CHANGES:**
- ✅ Added `"module": "ESNext"` (library for bundlers)
- ✅ Added `"moduleResolution": "Bundler"`
- ✅ Added `"rootDir": "src"`

---

**FILE 017: /packages/lib-db/tsconfig.build.json**

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

**FILE 018: /packages/lib-db/src/index.ts**

```typescript
// Hand-authored database table definitions and types
// SINGLE SOURCE OF TRUTH for scan storage
// Imported by: api-server

export { caiUsersTable, caiScansTable, scans } from "./tables";
export type { User, Scan } from "./tables";
```

---

**FILE 019: /packages/lib-db/src/tables.ts**

```typescript
// Hand-authored table schemas and types
// No ORM included — these are simple TypeScript definitions and metadata

export type User = {
  id: string;
  username: string;
  createdAt: string;
};

export const caiUsersTable = {
  name: "cai_users",
  columns: ["id", "username", "createdAt"] as const
} as const;

export type Scan = {
  id: string;
  targetUrl: string;
  status: string;
  createdAt: string;
};

export const caiScansTable = {
  name: "cai_scans",
  columns: ["id", "targetUrl", "status", "createdAt"] as const
} as const;

// SINGLE SOURCE OF TRUTH FOR SCAN STORAGE
// All routes must import and use this array, not create their own
export const scans: Scan[] = [];
```

---

**FILE 020: /packages/lib-db/README.md**

```markdown
# @kei/lib-db

Hand-authored database table definitions and types. No ORM or database driver included.

This package provides TypeScript types and table metadata (names, columns) for the database schema.
It also provides the single source of truth for in-memory scan storage: the `scans` array.

## Usage

```typescript
import { caiUsersTable, caiScansTable, scans } from "@kei/lib-db";
import type { User, Scan } from "@kei/lib-db";

const table: typeof caiUsersTable = caiUsersTable;
const user: User = { id: "1", username: "alice", createdAt: "2024-01-01" };

// All routes must use this shared scans array
scans.push({ id: "1", targetUrl: "https://example.com", status: "queued", createdAt: "..." });
```

## Adding an ORM

To add an ORM later (Prisma, Kysely, Drizzle, etc.):

1. Install the ORM in api-server
2. Create schema files (e.g., schema.prisma or migrations/)
3. Generate types from the ORM
4. Export ORM types from this package
5. Update api-server/src/db.ts to use the ORM
6. Replace `scans` array with ORM queries

## Consumers

- @kei/api-server (uses table definitions, types, and scans storage)
```

---

# BATCH 4: @kei/lib-api-client (7 FILES)

---

**FILE 021: /packages/lib-api-client/package.json**

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

---

**FILE 022: /packages/lib-api-client/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": []
}
```

**CHANGES:**
- ✅ Added `"module": "ESNext"` (library for bundlers)
- ✅ Added `"moduleResolution": "Bundler"`
- ✅ Added `"rootDir": "src"`

---

**FILE 023: /packages/lib-api-client/tsconfig.build.json**

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

**FILE 024: /packages/lib-api-client/src/generated/client-types.ts**

```typescript
// Re-export all API types from @kei/lib-api-zod
// This allows consumers to import types from a single package

export type { LoginBody, LoginResponse, CreateScanBody, ScanItem, ListScansResponse } from "@kei/lib-api-zod";
```

---

**FILE 025: /packages/lib-api-client/src/client.ts**

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

**FILE 026: /packages/lib-api-client/src/index.ts**

```typescript
// Export all client functions and types

export * from "./client";
export * from "./generated/client-types";
```

---

**FILE 027: /packages/lib-api-client/README.md**

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

During development with Vite proxy, this is proxied to http://localhost:3000/api.

To override the API base URL:

```typescript
window.__KEI_API_BASE = "http://localhost:3000/api";
```

## Consumers

- @kei/cai-pro-vision (React frontend)
- Any other JavaScript client or framework
```

---

# BATCH 5: @kei/api-server (10 FILES)

---

**FILE 028: /packages/api-server/package.json**

```json
{
  "name": "@kei/api-server",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "start": "node dist/index.js",
    "dev": "ts-node -O '{\"module\":\"CommonJS\"}' src/index.ts"
  },
  "dependencies": {
    "@kei/lib-api-zod": "workspace:*",
    "@kei/lib-db": "workspace:*",
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "ts-node": "^10.9.1"
  }
}
```

---

**FILE 029: /packages/api-server/tsconfig.json [BACKEND — CommonJS + Node]**

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
- ✅ Explicit `"moduleResolution": "Node"` (NOT Bundler)
- ✅ OVERRIDES base config completely

---

**FILE 030: /packages/api-server/tsconfig.build.json**

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

**FILE 031: /packages/api-server/src/index.ts**

```typescript
import { createServer } from "./server";

const app = createServer();
const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`✓ api-server listening on http://localhost:${port}`);
});
```

---

**FILE 032: /packages/api-server/src/server.ts [MOUNTED /api]**

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

  // API Routes (mounted under /api)
  const apiRouter = express.Router();
  apiRouter.use("/auth", authRouter);
  apiRouter.use("/scans", scanRouter);
  app.use("/api", apiRouter);

  // Health check (not under /api)
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  return app;
}
```

**CHANGES:**
- ✅ Created apiRouter
- ✅ Mounted authRouter and scanRouter under apiRouter
- ✅ Mounted apiRouter under /api
- ✅ Routes: /api/auth/login, /api/scans, etc.
- ✅ /health outside /api

---

**FILE 033: /packages/api-server/src/routes/auth.ts**

```typescript
import express, { Router, Request, Response } from "express";
import type { LoginBody, LoginResponse } from "@kei/lib-api-zod";

const router: Router = express.Router();

/**
 * POST /api/auth/login
 * DEMO ONLY — NOT FOR PRODUCTION
 *
 * Returns a random dev token for demonstration purposes.
 * Does NOT authenticate against any real user database.
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

  // Validation (no runtime schema validation yet — see README)
  if (!body?.username) {
    return res.status(400).json({ error: "username required" });
  }
  if (!body?.password) {
    return res.status(400).json({ error: "password required" });
  }

  // Demo-only: generate random dev token (NOT FOR PRODUCTION)
  const resp: LoginResponse = {
    token: "dev-token-" + Math.random().toString(36).substring(7),
    userId: "user-" + Math.random().toString(36).substring(7)
  };

  res.json(resp);
});

export default router;
```

---

**FILE 034: /packages/api-server/src/routes/scan.ts**

```typescript
import express, { Router, Request, Response } from "express";
import type { CreateScanBody, ListScansResponse, ScanItem } from "@kei/lib-api-zod";
import { scans } from "@kei/lib-db";

const router: Router = express.Router();

/**
 * POST /api/scans
 * Create a new scan
 * Returns: ScanItem with 201 status
 */
router.post("/", (req: Request, res: Response) => {
  const body = req.body as CreateScanBody;

  // Validation
  if (!body?.targetUrl) {
    return res.status(400).json({ error: "targetUrl required" });
  }

  // Create scan item
  const item: ScanItem = {
    id: String(scans.length + 1),
    targetUrl: body.targetUrl,
    status: "queued",
    createdAt: new Date().toISOString()
  };

  // Add to single source of truth (scans from lib-db)
  scans.push(item);

  return res.status(201).json(item);
});

/**
 * GET /api/scans
 * List all scans
 * Returns: ListScansResponse
 */
router.get("/", (_req: Request, res: Response) => {
  const response: ListScansResponse = { scans };
  return res.json(response);
});

export default router;
```

---

**FILE 035: /packages/api-server/src/db.ts**

```typescript
// Database helper functions and exports
// Currently uses in-memory storage imported from @kei/lib-db
// When adding ORM later, replace these with actual database calls

import type { User } from "@kei/lib-db";
import { caiUsersTable, caiScansTable, scans } from "@kei/lib-db";

const users: User[] = [];

export function listUsers(): User[] {
  return users.slice();
}

export function addUser(u: User): void {
  users.push(u);
}

// Scans are stored in lib-db scans array (single source of truth)
export function getScans() {
  return scans.slice();
}

// Re-export table metadata
export { caiUsersTable, caiScansTable, scans };
```

---

**FILE 036: /packages/api-server/src/types.ts**

```typescript
// Type definitions for api-server

export type Env = {
  PORT?: string | number;
};
```

---

**FILE 037: /packages/api-server/README.md**

```markdown
# @kei/api-server

Express backend server using shared types from @kei/lib-api-zod and database definitions from @kei/lib-db.

**⚠️ This is a DEMO server. NOT suitable for production.**

## Routes

### Authentication (DEMO ONLY)
- `POST /api/auth/login` — Login with username/password
  - Request: `{ "username": "string", "password": "string" }`
  - Response: `{ "token": "string", "userId": "string" }`
  - Token generation: Random dev token (NOT real authentication)
  - ⚠️ NOT FOR PRODUCTION

### Scans
- `POST /api/scans` — Create a new scan
  - Request: `{ "targetUrl": "string" }`
  - Response: 201 + ScanItem
  - Storage: In-memory array (not persistent)

- `GET /api/scans` — List all scans
  - Response: ListScansResponse
  - Storage: Reads from in-memory array

### Health
- `GET /health` — Health check endpoint (NOT under /api)
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

⚠️ The /auth/login endpoint is DEMO ONLY and returns a random dev token.

For production, implement:
- Password hashing (bcrypt, argon2)
- Real user database lookup
- JWT or session tokens
- Rate limiting
- Secure token storage
- HTTPS only (no HTTP)
- Secure cookies (httpOnly, sameSite)
```

---

# BATCH 6: @kei/cai-pro-vision (9 FILES)

---

**FILE 038: /packages/cai-pro-vision/package.json**

```json
{
  "name": "@kei/cai-pro-vision",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.build.json && vite build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "preview": "vite preview --port 5173"
  },
  "dependencies": {
    "@kei/lib-api-client": "workspace:*",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "vite": "^5.0.0"
  }
}
```

---

**FILE 039: /packages/cai-pro-vision/tsconfig.json [FRONTEND — ESNext + Bundler]**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "ESNext",
    "moduleResolution": "Bundler",
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
- ✅ Explicit `"module": "ESNext"` (NOT CommonJS)
- ✅ Explicit `"moduleResolution": "Bundler"` (Vite requires this)
- ✅ OVERRIDES base config

---

**FILE 040: /packages/cai-pro-vision/tsconfig.build.json**

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

**FILE 041: /packages/cai-pro-vision/vite.config.ts [NO REWRITE]**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Safe default port (5173) if PORT env var not set
 * Frontend uses ESNext module (Vite handles transpilation)
 */
const port = process.env.PORT ? Number(process.env.PORT) : 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port,
    proxy: {
      "/api": {
        target: "http://localhost:3000"
      }
    }
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild"
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }]
  }
});
```

**CHANGES:**
- ✅ Removed `rewrite` function from proxy
- ✅ Backend serves /api/* directly
- ✅ No rewrite needed (backend mounted at /api)

---

**FILE 042: /packages/cai-pro-vision/index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1.0" />
    <title>KEI — Demo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

**FILE 043: /packages/cai-pro-vision/src/main.tsx**

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found");
}

createRoot(rootEl).render(<App />);
```

---

**FILE 044: /packages/cai-pro-vision/src/App.tsx**

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

---

**FILE 045: /packages/cai-pro-vision/src/index.css**

```css
* {
  box-sizing: border-box;
}

html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: #fafafa;
  color: #1f2937;
}

body {
  line-height: 1.5;
}

button {
  transition: all 0.2s ease;
}

button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

ul {
  margin: 0;
  padding: 0;
}

li {
  margin-bottom: 8px;
}
```

---

**FILE 046: /packages/cai-pro-vision/README.md**

```markdown
# @kei/cai-pro-vision

Vite + React frontend application. Uses @kei/lib-api-client to communicate with the API server.

## Features

- List scans from the API
- Create new scans (receives created item)
- Login functionality (demo)
- Refresh scan list
- Fully typed with TypeScript

## Running

Development:
```bash
pnpm --filter @kei/cai-pro-vision run dev
```

Build:
```bash
pnpm --filter @kei/cai-pro-vision run build
```

Preview build:
```bash
pnpm --filter @kei/cai-pro-vision run preview
```

## API Proxy

Vite is configured to proxy `/api` requests to the backend server at http://localhost:3000.
This allows the frontend to call the API without CORS issues during development.

Configuration in vite.config.ts:
```typescript
proxy: {
  "/api": {
    target: "http://localhost:3000"
  }
}
```

No rewrite is needed because backend serves /api/* directly.

## API Integration

All API calls go through @kei/lib-api-client:

```typescript
import { listScans, login, createScan } from "@kei/lib-api-client";

// List scans
const response = await listScans();  // GET /api/scans

// Login
const token = await login({ username: "user", password: "pass" });  // POST /api/auth/login

// Create scan (returns the created ScanItem)
const newScan = await createScan({ targetUrl: "https://example.com" });  // POST /api/scans
```
```

---

# ✅ COMPLETE DIRECTORY TREE (46 FILES)

```
KEI/
├── .gitignore (001)
├── .vscode/
│   └── settings.json (007)
├── README.md (006)
├── package.json (002)
├── pnpm-workspace.yaml (003)
├── scripts/
│   └── check-workspace.sh (008)
├── tsconfig.base.json (004)
├── tsconfig.json (005)
└── packages/
    ├── lib-api-zod/ (6 files: 009-014)
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── generated/
    │       │   └── schemas.ts
    │       └── index.ts
    ├── lib-db/ (6 files: 015-020)
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       └── tables.ts
    ├── lib-api-client/ (7 files: 021-027)
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── generated/
    │       │   └── client-types.ts
    │       ├── client.ts
    │       └── index.ts
    ├── api-server/ (10 files: 028-037)
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── db.ts
    │       ├── index.ts
    │       ├── routes/
    │       │   ├── auth.ts
    │       │   └── scan.ts
    │       ├── server.ts
    │       └── types.ts
    └── cai-pro-vision/ (9 files: 038-046)
        ├── README.md
        ├── index.html
        ├── package.json
        ├── tsconfig.build.json
        ├── tsconfig.json
        ├── vite.config.ts
        └── src/
            ├── App.tsx
            ├── index.css
            └── main.tsx
```

---

# 🚀 COPY INSTRUCTIONS

1. Copy all 46 files exactly as shown above to your KHOEM-AI/KEI repository
2. **IMPORTANT**: Delete the old folder if it exists:
   ```bash
   rm -rf packages/lib-api-client-react
   ```
3. Create new folder and copy files:
   ```bash
   mkdir -p packages/lib-api-client/{src/generated}
   ```

---

# 📋 VERIFICATION SEQUENCE FOR YOUR TERMUX

After copying all 46 files:

```bash
cd /your/actual/path/to/KHOEM-AI/KEI

# Step 1: Install
pnpm install

# Step 2: Typecheck
pnpm -w -r run typecheck

# Step 3: Build
pnpm -w -r run build

# Step 4: Start backend (Terminal 1)
pnpm --filter @kei/api-server run start

# Step 5: Start frontend (Terminal 2)
pnpm --filter @kei/cai-pro-vision run dev

# Step 6: Test (Terminal 3)
curl http://localhost:3000/health
curl http://localhost:5173/api/scans
curl -X POST http://localhost:5173/api/scans -H 'Content-Type: application/json' -d '{"targetUrl":"https://example.com"}'
curl http://localhost:5173/api/scans
```

---

# 🔴 STATUS: READY TO COPY (NOT YET VERIFIED)

**All 46 files are complete and ready for manual copying.**

**I make NO claims that this passes typecheck/build/runtime tests** because I cannot execute commands on your system.

**You must run the commands above and report actual errors/output for verification.**

Copy now. Run verification. Report results.

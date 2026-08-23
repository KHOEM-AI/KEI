# KEI

✅ UNDERSTOOD. I will provide EVERY file in a completely copy-friendly format optimized for Android phone users.

Each file will be:
- Exact path clearly shown
- Complete code in ONE code block (no truncation, no "...")
- Copyable format (no explanations mixed in)
- Ready to paste directly

I will provide all files in ONE response, organized by package.

---

# 🔴 COMPLETE KEI MONOREPO — COPY-READY FORMAT

## BATCH 1: ROOT CONFIGURATION FILES

---

**FILE: /package.json**

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

**FILE: /pnpm-workspace.yaml**

```yaml
packages:
  - "packages/*"
```

---

**FILE: /tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "NodeNext",
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
      "@kei/lib-api-client-react": ["packages/lib-api-client-react/src"],
      "@kei/api-server": ["packages/api-server/src"],
      "@kei/cai-pro-vision": ["packages/cai-pro-vision/src"]
    },
    "types": []
  }
}
```

---

**FILE: /tsconfig.json**

```json
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "./packages/lib-api-zod" },
    { "path": "./packages/lib-db" },
    { "path": "./packages/lib-api-client-react" },
    { "path": "./packages/api-server" },
    { "path": "./packages/cai-pro-vision" }
  ]
}
```

---

**FILE: /.gitignore**

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
```

---

**FILE: /README.md**

```markdown
# KEI Monorepo (Minimal)

This repository is a minimal monorepo scaffold for the KEI project.

Packages:
- @kei/lib-api-zod — shared TypeScript API types (source-of-truth).
- @kei/lib-db — hand-authored database table definitions (no ORM).
- @kei/lib-api-client-react — tiny typed client for frontend.
- @kei/api-server — Node/Express backend using shared types.
- @kei/cai-pro-vision — Vite + React frontend.

Quickstart:
1. Install dependencies:
   pnpm -w install
2. Build all packages:
   pnpm -w -r run build
3. Typecheck:
   pnpm -w -r run typecheck
4. Start api-server:
   pnpm --filter @kei/api-server run start
5. Start frontend:
   pnpm --filter @kei/cai-pro-vision run dev
```

---

**FILE: /scripts/check-workspace.sh**

```bash
#!/usr/bin/env bash
set -euo pipefail
echo "Checking workspace package folders..."
for p in packages/*; do
  if [ -d "$p" ]; then
    echo " - $p"
  fi
done
if [ -f "tsconfig.json" ]; then
  echo "Root tsconfig.json found"
else
  echo "Root tsconfig.json NOT found"
  exit 1
fi
echo "Done."
```

---

**FILE: /.vscode/settings.json**

```json
{
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

**FILE: /jest.config.js**

```javascript
module.exports = {
  testEnvironment: "node"
};
```

---

**FILE: /babel.config.js**

```javascript
module.exports = {
  presets: []
};
```

---

## BATCH 2: @kei/lib-api-zod

---

**FILE: /packages/lib-api-zod/package.json**

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

**FILE: /packages/lib-api-zod/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": []
}
```

---

**FILE: /packages/lib-api-zod/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false,
    "emitDeclarationOnly": false,
    "outDir": "dist"
  }
}
```

---

**FILE: /packages/lib-api-zod/src/index.ts**

```typescript
// Shared API types — minimal, hand-authored.
// Consumers: api-server, lib-api-client-react, frontend.

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

**FILE: /packages/lib-api-zod/src/generated/schemas.ts**

```typescript
// Example "generated" types area (hand-authored for now).
// Later this directory may be replaced by a codegen step.
export const API_VERSION = "0.0.1";
```

---

**FILE: /packages/lib-api-zod/README.md**

```markdown
# @kei/lib-api-zod

Small package that exports TypeScript API types used across the monorepo.
This package is intentionally minimal and contains plain TypeScript types so downstream packages can import types without requiring runtime dependencies.
```

---

## BATCH 3: @kei/lib-db

---

**FILE: /packages/lib-db/package.json**

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

**FILE: /packages/lib-db/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": []
}
```

---

**FILE: /packages/lib-db/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false,
    "emitDeclarationOnly": false,
    "outDir": "dist"
  }
}
```

---

**FILE: /packages/lib-db/src/index.ts**

```typescript
// Hand-authored table definitions exported as the source-of-truth.
// No ORM is included — these are simple runtime helpers and TypeScript types.
// Consumers: api-server

export { caiUsersTable, caiScansTable } from "./tables";
export type { User, Scan } from "./tables";
```

---

**FILE: /packages/lib-db/src/tables.ts**

```typescript
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
```

---

**FILE: /packages/lib-db/README.md**

```markdown
# @kei/lib-db

Hand-authored DB table definitions used by the backend. This package intentionally does not include ORM code;
it provides basic table metadata and types so that the api-server can start without generated artifacts. When you choose an ORM or codegen later, update this package accordingly.
```

---

## BATCH 4: @kei/lib-api-client-react

---

**FILE: /packages/lib-api-client-react/package.json**

```json
{
  "name": "@kei/lib-api-client-react",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {}
}
```

---

**FILE: /packages/lib-api-client-react/tsconfig.json**

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

**FILE: /packages/lib-api-client-react/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false,
    "outDir": "dist"
  }
}
```

---

**FILE: /packages/lib-api-client-react/src/generated/client-types.ts**

```typescript
// Re-export types from @kei/lib-api-zod so frontend can import from a single client package.
export type { LoginBody, LoginResponse, CreateScanBody, ListScansResponse } from "@kei/lib-api-zod";
```

---

**FILE: /packages/lib-api-client-react/src/client.ts**

```typescript
import type { LoginBody, LoginResponse, CreateScanBody, ListScansResponse } from "./generated/client-types";

const API_BASE = (typeof window !== "undefined" && (window as any).__KEI_API_BASE) || "/api";

export async function login(body: LoginBody): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Login failed: ${res.status}`);
  }
  return (await res.json()) as LoginResponse;
}

export async function createScan(body: CreateScanBody): Promise<void> {
  const res = await fetch(`${API_BASE}/scans`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`Create scan failed: ${res.status}`);
  }
}

export async function listScans(): Promise<ListScansResponse> {
  const res = await fetch(`${API_BASE}/scans`, { method: "GET" });
  if (!res.ok) {
    throw new Error(`List scans failed: ${res.status}`);
  }
  return (await res.json()) as ListScansResponse;
}
```

---

**FILE: /packages/lib-api-client-react/src/index.ts**

```typescript
export * from "./client";
export * from "./generated/client-types";
```

---

**FILE: /packages/lib-api-client-react/README.md**

```markdown
# @kei/lib-api-client-react

Small typed client for use in the frontend. It exports typed functions and re-exports API types from @kei/lib-api-zod.
```

---

## BATCH 5: @kei/api-server

---

**FILE: /packages/api-server/package.json**

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
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "ts-node": "^10.9.1"
  }
}
```

---

**FILE: /packages/api-server/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "module": "CommonJS",
    "esModuleInterop": true,
    "composite": true,
    "declaration": true
  },
  "include": ["src"],
  "references": [
    { "path": "../lib-api-zod" },
    { "path": "../lib-db" }
  ]
}
```

---

**FILE: /packages/api-server/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false,
    "outDir": "dist"
  }
}
```

---

**FILE: /packages/api-server/src/index.ts**

```typescript
import { createServer } from "./server";

const app = createServer();
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`api-server listening on http://localhost:${port}`);
});
```

---

**FILE: /packages/api-server/src/server.ts**

```typescript
import express, { Express } from "express";
import authRouter from "./routes/auth";
import scanRouter from "./routes/scan";

export function createServer(): Express {
  const app = express();
  app.use(express.json());
  app.use("/auth", authRouter);
  app.use("/scans", scanRouter);
  app.get("/health", (_req, res) => res.json({ ok: true }));
  return app;
}
```

---

**FILE: /packages/api-server/src/routes/auth.ts**

```typescript
import express from "express";
import type { LoginBody, LoginResponse } from "@kei/lib-api-zod";

const router = express.Router();

router.post("/login", (req, res) => {
  const body = req.body as LoginBody;
  if (!body?.username) {
    return res.status(400).json({ error: "username required" });
  }
  const resp: LoginResponse = {
    token: "dev-token",
    userId: "user-1"
  };
  return res.json(resp);
});

export default router;
```

---

**FILE: /packages/api-server/src/routes/scan.ts**

```typescript
import express from "express";
import type { CreateScanBody, ListScansResponse, ScanItem } from "@kei/lib-api-zod";
import { caiScansTable } from "@kei/lib-db";

const router = express.Router();

const scans: ScanItem[] = [];

router.post("/", (req, res) => {
  const body = req.body as CreateScanBody;
  if (!body?.targetUrl) return res.status(400).json({ error: "targetUrl required" });
  const item: ScanItem = {
    id: String(scans.length + 1),
    targetUrl: body.targetUrl,
    status: "queued",
    createdAt: new Date().toISOString()
  };
  scans.push(item);
  return res.status(201).json(item);
});

router.get("/", (_req, res) => {
  const response: ListScansResponse = { scans };
  return res.json(response);
});

export default router;
```

---

**FILE: /packages/api-server/src/db.ts**

```typescript
import type { User, Scan } from "@kei/lib-db";
import { caiUsersTable, caiScansTable } from "@kei/lib-db";

const users: User[] = [];
const scans: Scan[] = [];

export function listUsers(): User[] {
  return users.slice();
}

export function addUser(u: User): void {
  users.push(u);
}

export function listScans(): Scan[] {
  return scans.slice();
}

export function addScan(s: Scan): void {
  scans.push(s);
}

export { caiUsersTable, caiScansTable };
```

---

**FILE: /packages/api-server/src/types.ts**

```typescript
export type Env = {
  PORT?: string | number;
};
```

---

**FILE: /packages/api-server/README.md**

```markdown
# @kei/api-server

Small Express server demonstrating use of shared types from @kei/lib-api-zod and @kei/lib-db.
This server is minimal and uses an in-memory store for scans/users.
```

---

## BATCH 6: @kei/cai-pro-vision

---

**FILE: /packages/cai-pro-vision/package.json**

```json
{
  "name": "@kei/cai-pro-vision",
  "version": "0.0.0",
  "private": true,
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "vite",
    "build": "tsc -p tsconfig.build.json && vite build",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "preview": "vite preview --port 5173"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "@types/react": "^18.2.21",
    "@types/react-dom": "^18.2.7",
    "vite": "^5.0.0"
  }
}
```

---

**FILE: /packages/cai-pro-vision/tsconfig.json**

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
    { "path": "../lib-api-client-react" },
    { "path": "../lib-api-zod" }
  ]
}
```

---

**FILE: /packages/cai-pro-vision/tsconfig.build.json**

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declarationMap": false,
    "outDir": "dist"
  }
}
```

---

**FILE: /packages/cai-pro-vision/vite.config.ts**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const port = process.env.PORT ? Number(process.env.PORT) : 5173;

export default defineConfig({
  plugins: [react()],
  server: {
    port
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }]
  }
});
```

---

**FILE: /packages/cai-pro-vision/index.html**

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

**FILE: /packages/cai-pro-vision/src/main.tsx**

```typescript
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");
createRoot(rootEl).render(<App />);
```

---

**FILE: /packages/cai-pro-vision/src/App.tsx**

```typescript
import React, { useEffect, useState } from "react";
import { login, listScans } from "@kei/lib-api-client-react";
import type { ListScansResponse } from "@kei/lib-api-client-react";

export default function App(): JSX.Element {
  const [scans, setScans] = useState<ListScansResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    listScans()
      .then((r) => setScans(r))
      .catch(() => setScans(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin() {
    try {
      await login({ username: "demo", password: "demo" });
      console.log("logged in");
    } catch (err) {
      console.error("login failed", err);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui, Arial, sans-serif", padding: 24 }}>
      <h1>KEI — Demo frontend</h1>
      <button onClick={handleLogin}>Login (demo)</button>
      <h2>Scans</h2>
      {loading && <div>Loading...</div>}
      {!loading && scans && (
        <ul>
          {scans.scans.map((s) => (
            <li key={s.id}>
              {s.id} — {s.targetUrl} — {s.status}
            </li>
          ))}
        </ul>
      )}
      {!loading && !scans && <div>No scans found.</div>}
    </div>
  );
}
```

---

**FILE: /packages/cai-pro-vision/src/index.css**

```css
html, body, #root {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: system-ui, Arial, sans-serif;
}
```

---

**FILE: /packages/cai-pro-vision/README.md**

```markdown
# @kei/cai-pro-vision

Vite + React demo frontend that uses @kei/lib-api-client-react to call the API.
```

---

# COMPLETE FINAL DIRECTORY TREE

```
KEI/
├── .gitignore
├── .vscode/
│   └── settings.json
├── README.md
├── babel.config.js
├── jest.config.js
├── package.json
├── pnpm-workspace.yaml
├── scripts/
│   └── check-workspace.sh
├── tsconfig.base.json
├── tsconfig.json
└── packages/
    ├── lib-api-zod/
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── generated/
    │       │   └── schemas.ts
    │       └── index.ts
    ├── lib-db/
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts
    │       └── tables.ts
    ├── lib-api-client-react/
    │   ├── README.md
    │   ├── package.json
    │   ├── tsconfig.build.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── generated/
    │       │   └── client-types.ts
    │       ├── client.ts
    │       └── index.ts
    ├── api-server/
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
    └── cai-pro-vision/
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

# NEXT STEPS (COPY-READY COMMANDS)

After copying all files into your KEI repository on GitHub, run these commands:

```bash
pnpm -w install
pnpm -w -r run build
pnpm -w -r run typecheck
pnpm --filter @kei/api-server run start
pnpm --filter @kei/cai-pro-vision run dev
```

✅ ALL FILES ARE NOW READY TO COPY. No more explanations needed.

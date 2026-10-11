# Rendimiento, caché y límites — Sorova Games

## 1. Rate limiting

Cliente (`src/lib/rateLimit.ts`), sliding window:

| Acción | Límite | Ventana | Lockout |
|--------|--------|---------|---------|
| PIN admin | 5 | 60s | 60s |
| Registro de tutor | 5 | 60s | 60s |
| Subida avatar | 10 | 60s | 30s |
| Alta de niño | 20 | 60s | — |
| Contenido/temas | 30 | 60s | — |
| Persistencia local | 120 | 60s | reintento |

## 2. Consultas

- PostgreSQL: `server/schema.sql` guarda el documento de la app en `app_state` y proyecta perfiles, progreso y material.
- Cliente: los temas del niño se filtran en `topicsForLearner` y se cachean en `src/services/cache/contentCache.ts`.
- Meta HTML: description, Open Graph, `theme-color`, `robots`.

## 3. Estrategia de caché

Capas:

1. **Memoria (TTL 120s)** — lecciones admin y topics filtrados por edad (`contentCache`).
2. **Persistencia diferida** — `localStorage` con debounce 250ms + `requestIdleCallback`.
3. **Estáticos** — avatares y assets servidos por Vite/CDN; fonts con `preconnect`.
4. **Invalidación** — al crear/borrar palabras, pasajes, topics o avatares.

## 4. Procesamiento asíncrono

- Compresión de avatares en **Web Worker** (`src/workers/imageWorker.ts`).
- Guardado de estado fuera del hilo crítico (idle + microtasks).
- Fallback a main thread con `requestIdleCallback` si el worker no está disponible.

## 5. Load testing

Ejecutar:

```bash
npm run load-test
```

Informe: `docs/load-test-report.json`.

Hallazgos (simulación cliente en este entorno):

| Escenario | Umbral de lentitud | Resultado |
|-----------|--------------------|-----------|
| CPU: filtrar + stringify | p95 > 100ms | Estable hasta **≥400** usuarios concurrentes simulados |
| Persistencia con avatares base64 | soft-limit ~4.5MB | Se degrada ~**20 perfiles** con fotos ~120KB c/u |

Mitigaciones ya aplicadas: debounce + idle save, worker de imágenes, caché de lecciones/topics.
Las fotos se comprimen en un worker antes de entrar al documento. PostgreSQL guarda ese documento; `localStorage` queda como copia si la base no responde.

# Estado Actual del Sistema: vinylx
**Stack:** Next.js 16.1.6 (App Router), React 19.2.3, Supabase (PostgreSQL), Tailwind v4 + Radix + Framer Motion 12.
**Fases Completadas: 1 a la 10.**

## Arquitectura Implementada
- **Base de Datos & MVCC:** Tablas `profiles`, `albums`, `tracks`, `album_logs`, `listenlists`, `log_likes`, `follows`. Triggers atómicos para `is_pioneer`, `log_count`, `avg_rating`, `likes_count`. Cero `SELECT COUNT(*)`.
- **Mandato O(1):** `trinity_tracks UUID[]` sin JOINs.
- **Ingesta:** MusicBrainz (1 req/sec) + Odesli hidratado en `JSONB` como `Record<string, string>`.
- **Grafo Social & Listenlists:** `useOptimistic` (React 19), latencia percibida 0ms.
- **Analíticas (Zero-JS):** Histograma CSS puro + Curva Grower SVG inline.
- **Feed & Trending:** Paginación batch O(1), trending en memoria (14 días).
- **PWA:** SW network-first, fallback `/~offline`, manifest con `maskable`.
- **Descubrimiento Mixto:** Tab System (Álbumes/Usuarios) con debounce ILIKE.
- **Identidad:** Settings con avatar upload (Supabase Storage).
- **Edge SEO:** `generateMetadata` dinámica con OpenGraph + Twitter Cards.
- **Toasts:** Sonner con tema OLED en root layout.
- **Seguridad HTTP:** HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Transiciones de Página:** Framer Motion (`LazyMotion` + `domAnimation`) via `template.tsx`. Entrada con opacity + translateY (0.3s easeOut).
- **Estética OLED Black:** `--background: #000000` (negro verdadero). `--card: #020617` (slate-950). `--border: #141422` (ultra sutil). Glassmorphism en Sidebar y BottomNav (`bg-glass backdrop-blur-md`, `border-white/5`).
- **Micro-interacciones:** `active:scale-95` en LikeButton, FollowButton, ListenlistButton. `active:scale-[0.97]` en Button base. `hover:scale-105` en portadas de álbumes.
- **Skeleton Screens:** Loading states en `/feed`, `/explore`, `/trending`, `/listenlist`, `/profile/[username]`, `/album/[mbid]`, `/settings/profile`. Spinner de FeedList reemplazado por LogCardSkeleton.
- **Tipado estricto:** Cero `any`. `likes_count` + `log_likes` en Database type.

## Búsqueda: Single Source of Truth (Last.fm → MusicBrainz)

### Arquitectura (`src/lib/actions/search.ts`)
El Server Action `searchAlbums(query)` implementa un flujo de 3 fases con **cero fuzzy matching** y **cero `.sort()`**:

1. **Fase 1 — Last.fm dicta el orden:** `album.search` con `limit=15`. El array resultante define el orden final e inmutable de la UI. Si Last.fm falla o devuelve vacío, se usa `searchReleaseGroups` de MusicBrainz como fallback total.
2. **Fase 2 — Hidratación quirúrgica (Targeted Fetch):** Cada item de Last.fm se resuelve contra MusicBrainz individualmente:
   - Si tiene `mbid`: lookup directo a `/release-group/{mbid}?inc=artist-credits` para obtener metadata canónica (releaseDate, artistMbid, type). Si el mbid es inválido (ej. release ID en vez de release-group), cae al paso siguiente.
   - Si NO tiene `mbid` (o el lookup falló): búsqueda Lucene exacta `artist:"X" AND releasegroup:"Y"` con `limit=1`. El primer resultado es el MBID canónico.
   - Las hidrataciones se ejecutan secuencialmente (promise chain) para respetar el rate limit de MB (1 req/s). `Promise.allSettled` captura fallos individuales sin abortar el batch.
3. **Fase 3 — Limpieza:** Items que MusicBrainz no reconoce se descartan. Deduplicación por `mbid`. Score asignado por posición original de Last.fm (`100 - index`). Cero reordenamiento.

### Funciones añadidas en `src/lib/musicbrainz/client.ts`
- `lookupReleaseGroupBasic(mbid)`: GET ligero a `/release-group/{mbid}?inc=artist-credits`. Retorna `{ mbid, title, artistName, artistMbid, releaseDate, type }` o `null`.
- `searchReleaseGroupTargeted(artist, title)`: Búsqueda Lucene `artist:"X" AND releasegroup:"Y"` con `limit=1`. Escapa caracteres especiales de Lucene. Retorna el primer match o `null`.
- Funciones pre-existentes (`rateLimitedFetch`, `searchReleaseGroups`, etc.) sin cambios.

### Componente consumidor
- `src/components/album/album-search.tsx` importa `searchAlbums` desde `@/lib/actions/search`.
- UI sin cambios: `useTransition` + debounce 400ms + grid de `AlbumSearchCard`.

### Eliminado
- Motor de merge de 3 fases (`mergeResults`, `findCrossMatch`, `matchKey`, `looseKey`, `normalize`, `stripEditionSuffix`).
- `.sort()` final por score de MusicBrainz.
- Búsqueda paralela Last.fm + MusicBrainz (ahora MusicBrainz solo se consulta en Fase 2, item por item).

### Trade-off de rendimiento
La hidratación secuencial (1.1s entre requests a MB) implica ~N×1.1s donde N es el número de items que requieren lookup (items con mbid válido = 1 call, sin mbid = 1 call, mbid inválido = 2 calls). En el peor caso (15 items × 1.1s = ~16.5s). En la práctica, la mayoría de items de Last.fm traen mbids válidos.

### Variables de entorno (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=https://xzlirdlzcovlzynivjkt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<presente>
SUPABASE_SERVICE_ROLE_KEY=<presente>
LASTFM_API_KEY=96b7e269155c26a1505c087361bc009b
```

## Estado
Artefacto de grado producción. Todas las fases core completadas. Búsqueda híbrida implementada pero con bug de relevancia abierto (ver sección anterior).

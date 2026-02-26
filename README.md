# VinylX

Red social de grado industrial para la curaduría manual, reseñas cíclicas y coleccionismo de álbumes. El Letterboxd para la música.

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Radix UI |
| Base de datos | Supabase (PostgreSQL con RLS) |
| Autenticación | Supabase Auth (SSR via `@supabase/ssr`) |
| Almacenamiento | Supabase Storage (bucket `avatars`) |
| Metadatos musicales | MusicBrainz API (matriz canónica) |
| Enlaces de streaming | Odesli / Songlink API |
| Notificaciones | Sonner (toasts no bloqueantes) |
| Despliegue | Vercel Edge Network |
| PWA | Service Worker nativo (network-first) |

## Arquitectura

### Mandato O(1): La Santa Trinidad

Cada log de álbum exige que el usuario seleccione sus 3 pistas favoritas. En lugar de una tabla transaccional M:M con JOINs penalizantes, las selecciones se almacenan como un array nativo `trinity_tracks UUID[]` directamente en `album_logs`. Operación de lectura O(1) — cero JOINs al renderizar feeds.

### Mitigación MVCC: Badge Pionero

El badge "Pionero" se otorga a los primeros 10 listeners de un álbum. Un `SELECT COUNT(*)` bajo concurrencia masiva generaría deadlocks. La solución: un trigger PL/pgSQL `BEFORE INSERT` evalúa un contador desnormalizado `log_count` en la tabla `albums` usando `FOR UPDATE SKIP LOCKED`. El incremento del contador ocurre en un trigger `AFTER INSERT` separado, evitando `RowExclusiveLock` conflictivos.

### Curva Grower: Inmutabilidad de Reseñas

Los logs son inmutables. Un usuario puede calificar el mismo álbum múltiples veces. El sistema retiene cada entrada para trazar la progresión del impacto musical a través del tiempo, renderizada como una curva SVG inline sin JavaScript del lado del cliente.

### Contadores Desnormalizados

`log_count` y `avg_rating` en `albums`, `likes_count` en `album_logs` — mantenidos atómicamente por triggers PL/pgSQL. Cero `SELECT COUNT(*)` en producción.

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/          # Login, signup, callback
│   ├── (main)/          # Layout autenticado (sidebar + bottom nav)
│   │   ├── album/[mbid] # Detalle de álbum + histograma + curva
│   │   ├── explore/     # Buscador mixto (álbumes + usuarios)
│   │   ├── feed/        # Feed global paginado
│   │   ├── log/new/     # Formulario de nuevo log
│   │   ├── profile/[username]/ # Perfil público + listenlist
│   │   ├── settings/profile/   # Edición de perfil + avatar
│   │   ├── listenlist/  # Listenlist del usuario
│   │   └── trending/    # Algoritmo trending (14 días)
│   └── ~offline/        # Fallback PWA OLED Black
├── components/
│   ├── album/           # Cover, search, tracklist, streaming, histograma
│   ├── explore/         # Tab system (álbumes/usuarios)
│   ├── log/             # Cards, feed, likes, formulario
│   ├── navigation/      # Sidebar (desktop) + bottom nav (mobile)
│   ├── profile/         # FollowButton, UserSearch, ProfileForm
│   ├── pwa/             # Service Worker registration
│   └── ui/              # Primitivas (Avatar, Badge, Button, Card, Input, Skeleton)
├── lib/
│   ├── actions/         # Server Actions (auth, follows, likes, listenlists, logs, musicbrainz, profiles)
│   ├── musicbrainz/     # Cliente MusicBrainz (1 req/sec)
│   ├── odesli/          # Cliente Odesli + hidratación asíncrona
│   ├── queries/         # Queries SSR (feed, trending)
│   ├── supabase/        # Clientes (server, client, admin, middleware, types)
│   └── utils/           # cn (clsx + tailwind-merge)
└── middleware.ts         # Refresh de sesión Supabase
```

## Configuración Local

### Requisitos previos

- Node.js 20+
- Proyecto en Supabase con las migraciones aplicadas

### Variables de entorno

Crea un archivo `.env.local` en la raíz con las siguientes variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Supabase Storage

Crea un bucket público llamado `avatars` en Supabase Dashboard (Storage > New Bucket).

### Migraciones

Aplica las migraciones SQL en orden desde `supabase/migrations/`:

1. `00001_initial_schema.sql` — Tablas, triggers, RLS
2. `00002_phase4_listenlist_public_read.sql` — Lectura pública de listenlists
3. `00003_log_likes.sql` — Sistema de likes con contadores atómicos

### Instalación

```bash
npm install
npm run dev
```

### Build de producción

```bash
npm run build
npm start
```

## Seguridad

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado. Las políticas garantizan:

- Perfiles, álbumes, tracks, logs, follows y likes: lectura pública
- Escritura: solo el propietario autenticado (`auth.uid()`)
- Logs inmutables: INSERT only, sin UPDATE ni DELETE
- Álbumes y tracks: escritura solo vía `service_role`

### Cabeceras HTTP

El despliegue en Vercel inyecta automáticamente:

- `Strict-Transport-Security` (HSTS 2 años + preload)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` restrictiva (cámara, micrófono, geolocalización denegados)

## Licencia

Propietario. Todos los derechos reservados.

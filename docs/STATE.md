# Estado Actual del Sistema: vinylx
**Stack:** Next.js 15 (App Router), React 19, Supabase (PostgreSQL), Tailwind + Radix.
**Fases Completadas: 1 a la 9.**

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
- **Toasts:** Sonner con tema OLED en root layout. Error toasts en todas las mutaciones, success toasts en Listenlist y Profile.
- **Tipado:** `likes_count` + `log_likes` integrados en `Database` type. Cero `any`. Cero type assertions forzadas.
- **Seguridad HTTP:** HSTS (2 años + preload), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- **Repositorio limpio:** 3 archivos de queries muertos eliminados. Bug de tipo en StreamingLinks corregido (`Record<string, string>` vs `OdesliResponse`). Import muerto de `OdesliResponse` en album page eliminado.
- **README.md:** Manifiesto arquitectónico de grado empresarial con stack, mandatos, estructura, setup y seguridad.

## Estado
Artefacto listo para `git push` e integración con Vercel.

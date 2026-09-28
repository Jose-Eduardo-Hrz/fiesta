# 🧸 Baby Shower de Azul Alejandra

Álbum compartido para que los invitados suban sus fotos y videos desde el celular (enlace o código QR), con un panel privado para los anfitriones.

**Stack:** SvelteKit 2 · Svelte 5 · TypeScript estricto · pnpm · adapter-node · SQLite (`node:sqlite`).

---

## Inicio rápido

Requisitos: **Node.js 22.13 o superior** (probado con Node 24) y **pnpm**.

```bash
pnpm install
cp .env.example .env      # en Windows PowerShell: Copy-Item .env.example .env
# edita .env: ADMIN_USERNAME, ADMIN_PASSWORD y SESSION_SECRET
pnpm dev
```

- Invitados: http://localhost:5173
- Panel del anfitrión: http://localhost:5173/admin

Para probar desde tu celular en la misma red Wi-Fi: `pnpm dev --host` y abre la IP que aparece en la terminal.

### Producción

```bash
pnpm build
pnpm start                # = node --env-file-if-exists=.env build
```

El servidor escucha en el puerto `3000` (cámbialo con `PORT`).

---

## Variables de entorno

| Variable | Obligatoria | Descripción |
|---|---|---|
| `ADMIN_USERNAME` | Sí | Usuario del panel `/admin`. |
| `ADMIN_PASSWORD` | Sí | Contraseña del panel (mínimo 10 caracteres en producción). |
| `SESSION_SECRET` | Sí en producción | 32+ caracteres aleatorios. Firma la sesión del anfitrión y los tokens de subida. Genéralo con: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `STORAGE_DIR` | No | Carpeta de fotos y videos. Por defecto `./archivos`. |
| `DATABASE_PATH` | No | Archivo SQLite. Por defecto `./data/baby-shower.db`. |
| `ORIGIN` | **Sí con `pnpm start`** | URL exacta desde la que se abre el sitio: `http://localhost:3000` en local, `http://TU-IP:3000` desde el celular, `https://babyshower.midominio.com` en producción. Sin ella el login del panel responde 403 (protección CSRF). No hace falta en `pnpm dev`. |
| `BODY_SIZE_LIMIT` | **Sí en producción** | Pon `Infinity`. adapter-node limita los cuerpos a 512 KB por defecto; la app aplica sus propios límites por archivo. |
| `PORT`, `HOST` | No | Puerto y dirección del servidor. |
| `ADDRESS_HEADER`, `XFF_DEPTH` | Si hay un proxy | Para obtener la IP real (limitador de intentos). Ej. `X-Forwarded-For` y `1`. |

Las credenciales **nunca** están en el código: se leen en tiempo de ejecución con `$env/dynamic/private` y jamás llegan al navegador. El archivo `.env` está en `.gitignore`.

En desarrollo, si falta `SESSION_SECRET` se genera uno temporal (las sesiones se pierden al reiniciar). En producción la app se niega a arrancar sesiones sin él.

---

## Personalización

Todo lo configurable está en **`src/lib/config.ts`**:

- `EVENT`: nombres, frase de bienvenida y foto opcional del evento (`heroPhoto`, ver `static/evento/LEEME.md`).
- `ALLOWED_FILE_TYPES`: extensiones y tipos MIME permitidos (JPG, PNG, GIF, WEBP, HEIC/HEIF, MP4, MOV, M4V, WEBM, 3GP).
- `UPLOAD_LIMITS`: tamaño máximo por foto (30 MB) y por video (1 GB), archivos por envío (60), número de mesa máximo (60), subidas en paralelo (2).

El navegador usa esos valores para avisar al instante y el servidor los vuelve a aplicar.

Las ilustraciones (ositos, Pascual, arcoíris, nubes) son SVG originales dentro de `src/lib/components/decor/`: no dependen de imágenes externas ni usan arte con derechos de autor. Los colores de Pascual se cambian en las props de `Pascual.svelte`.

---

## Arquitectura

```
src/
├── hooks.server.ts                 # protección de /admin y /api/admin, límites de cuerpo, cabeceras de seguridad
├── lib/
│   ├── config.ts                   # ⚙️ configuración central (compartida cliente/servidor, sin secretos)
│   ├── validation.ts               # validaciones compartidas (nombre, mesa, archivos)
│   ├── types.ts                    # tipos de la API
│   ├── client/
│   │   ├── upload-client.ts        # XHR con progreso de subida
│   │   ├── upload-queue.svelte.ts  # cola: validación, duplicados, paralelo, reintentos
│   │   └── guest.ts                # recuerda nombre/mesa en el celular del invitado
│   ├── components/                 # Header, GuestForm, FileUploader, FilePreview, FileList,
│   │   │                           # UploadProgress, Button, Alert, Card, TextField, Icon…
│   │   ├── decor/                  # Bear, Pascual, Rainbow, SkyBackground, Celebration
│   │   └── admin/                  # StatCard, MediaGrid, MediaViewer, DownloadLink, Breadcrumbs
│   └── server/
│       ├── env.ts                  # variables de entorno
│       ├── auth.ts, crypto.ts      # sesión firmada con HMAC, comparación en tiempo constante
│       ├── rate-limit.ts           # límite de intentos de login y de envíos
│       ├── db.ts                   # SQLite (esquema y consultas)
│       ├── uploads.ts              # recepción en streaming + validación binaria
│       ├── file-signature.ts       # "magic bytes" de cada formato
│       ├── sanitize.ts             # nombres de carpeta/archivo seguros
│       ├── zip.ts                  # descargas .zip en streaming
│       └── storage/                # interfaz StorageDriver + implementación local
└── routes/
    ├── (guest)/                    # páginas de invitados con su layout decorativo
    │   ├── +page.svelte            # portada + nombre y mesa
    │   ├── upload/                 # selección, vista previa y subida
    │   └── success/                # agradecimiento
    ├── admin/                      # panel (login, resumen, mesa, invitado, todos los archivos)
    └── api/
        ├── submissions/            # POST crear envío · PUT …/files · POST …/complete
        └── admin/                  # GET files/[id] (Range) · GET download (.zip)
```

### Cómo se suben y guardan los archivos

1. El invitado escribe nombre y mesa → `POST /api/submissions` valida, registra el envío y devuelve un **token de subida firmado (HMAC)**.
2. Cada archivo viaja en **su propia petición** `PUT /api/submissions/{id}/files`, con el contenido binario directo en el cuerpo (no multipart) y los metadatos en cabeceras. Se usa XMLHttpRequest para tener progreso real; el navegador lee el archivo del disco en streaming.
3. El servidor procesa el cuerpo como **stream**: nunca carga el archivo completo en memoria. Un video de 1 GB usa unos pocos KB de RAM.
   - Revisa extensión, tipo MIME declarado y `Content-Length` antes de leer nada.
   - Un `Transform` verifica los **primeros bytes (firma real del formato)**, cuenta bytes, corta si se supera el límite y detecta subidas truncadas.
   - Se escribe en `archivos/.tmp/<uuid>.part`; si algo falla, el temporal se borra y no quedan archivos a medias.
   - El nombre final se reserva con `open(…, 'wx')` (atómico): si `IMG_001.jpg` existe se usa `IMG_001-2.jpg`, así **nunca se sobrescribe** nada, aunque lleguen dos subidas a la vez.
4. Cada archivo lleva un ID generado en el navegador; si un reintento reenvía algo que ya se guardó, el servidor lo reconoce y **no lo duplica**.
5. `POST …/complete` cierra el envío y devuelve el resumen para la pantalla de agradecimiento.

Estructura resultante:

```
archivos/
└── mesa-5/
    └── Juan-Perez/
        ├── IMG_001.jpg
        ├── IMG_001-2.jpg
        └── Mi-video-1.mov
```

### Base de datos: SQLite

Se eligió **SQLite con `node:sqlite`** (integrado en Node): un solo archivo, sin servidor que instalar, transaccional, suficiente para miles de archivos y sin dependencias nativas que compilar (importante en Windows). Se respalda copiando `data/baby-shower.db`.

- `submissions`: `id`, `guest_name`, `guest_slug`, `guest_key`, `table_number`, `created_at`, `completed_at`.
- `files`: `id`, `submission_id`, `client_file_id`, `original_name`, `stored_name`, `mime_type`, `kind`, `size_bytes`, `storage_key` (ruta), `uploaded_at`.

Node 22/24 marca `node:sqlite` como experimental (funciona de forma estable; `pnpm start` oculta el aviso).

### Seguridad

- Validación de **extensión, tipo MIME y firma binaria** en el servidor; el navegador solo da avisos rápidos.
- Límites de tamaño por tipo, de cantidad de archivos por envío (incluso con subidas en paralelo) y de cuerpo para el resto de rutas (1 MB).
- **Sanitización** de nombres (sin acentos, espacios, `..`, separadores ni nombres reservados de Windows) y **prevención de path traversal**: todas las rutas se resuelven y verifican dentro de `STORAGE_DIR`.
- **Panel protegido** en `hooks.server.ts` (páginas y API) y otra vez en cada carga (defensa en profundidad). Cookie `httpOnly`, `SameSite=Strict`, `Secure` cuando el sitio usa HTTPS, firmada con HMAC y con caducidad de 12 h; cambiar la contraseña invalida las sesiones.
- Credenciales comparadas en tiempo constante, **5 intentos fallidos cada 15 min por IP**, protección CSRF de SvelteKit y logout solo por POST.
- Los archivos del panel se sirven con `nosniff`, CSP `sandbox` y el tipo MIME canónico (no el que envió el invitado).
- CSP en toda la app, `X-Frame-Options: DENY`, `noindex`.
- Errores: el servidor registra el detalle y el navegador solo recibe mensajes comprensibles, sin rutas ni trazas.

---

## Despliegue en producción

El almacenamiento local funciona bien en un **VPS o servidor propio** (DigitalOcean, Hetzner, Lightsail, una Raspberry Pi…) con disco persistente. **No** sirve en plataformas serverless o con disco efímero (Vercel, Netlify, Cloudflare Pages): ahí los archivos se perderían.

Pasos típicos en un VPS:

```bash
pnpm install --frozen-lockfile
pnpm build
# .env con ORIGIN=https://tu-dominio, BODY_SIZE_LIMIT=Infinity, credenciales y secreto
pnpm start            # o con pm2 / systemd para que se reinicie solo
```

Detrás de **nginx**, permite cuerpos grandes y no los guardes en búfer:

```nginx
client_max_body_size 1100m;
proxy_request_buffering off;
proxy_read_timeout 600s;
proxy_send_timeout 600s;
```

(Caddy no limita el tamaño por defecto.) Usa HTTPS en producción (con `ORIGIN=https://…` la cookie de sesión se marca `Secure`).

**Respaldo:** copia periódicamente las carpetas `archivos/` y `data/`.

### Pasar a S3 (o R2, MinIO, Backblaze, Spaces)

La app solo usa la interfaz `StorageDriver` (`src/lib/server/storage/types.ts`). Para cambiar de proveedor:

1. `pnpm add @aws-sdk/client-s3 @aws-sdk/lib-storage`
2. Crear `src/lib/server/storage/s3.ts` implementando `putUnique` (HeadObject para elegir nombre libre + `Upload` de lib-storage, que sube el stream por partes), `read` (GetObject con `Range`), `stat` (HeadObject) y `remove`.
3. Devolverlo en `storage/index.ts` según una variable, por ejemplo `STORAGE_DRIVER=s3`.

Las rutas, la validación, el panel y los ZIP no cambian. Así también se puede desplegar en plataformas con disco efímero.

---

## Código QR

Genera el QR con la URL pública (por ejemplo `https://babyshower.midominio.com`) en cualquier generador, o con:

```bash
pnpm dlx qrcode -o qr-baby-shower.png "https://babyshower.midominio.com"
```

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Compilación de producción en `build/` |
| `pnpm start` | Ejecuta la compilación (lee `.env`) |
| `pnpm preview` | Vista previa de la compilación con Vite |
| `pnpm check` | Verificación de tipos (svelte-check) |

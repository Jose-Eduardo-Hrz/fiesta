# Imágenes del evento

Coloca aquí las fotos propias del evento (ecografía, sesión de embarazo, etc.).

1. Copia la imagen en esta carpeta, por ejemplo `portada.jpg` (se recomienda 1200 × 900 px, menos de 400 KB).
2. En `src/lib/config.ts` cambia:

   ```ts
   heroPhoto: '/evento/portada.jpg' as string | null,
   ```

Mientras `heroPhoto` sea `null`, la página muestra una ilustración de ositos y de Pascual.

Todo lo que esté en `static/` es público: no pongas aquí nada privado.

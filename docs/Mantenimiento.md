
# Documentación de Mantenimiento (Básico)

## Estructura
- `index.html`: página principal con todas las secciones.
- `content.json`: datos del menú, eventos, paquetes, testimonios.
- `assets/`: imágenes y PDF del menú.
- `blog/`: artículos.
- `admin/`: editor para actualizar `content.json` (descarga y reemplaza).

## Actualizar Menú / Eventos
1. Abre `admin/index.html` en el navegador.
2. Carga `content.json`, edita y exporta.
3. Reemplaza el `content.json` antiguo en el proyecto.

## Integración de Reservas (OpenTable o API)
- Sustituye el formulario rápido del Hero por el widget/iframe de OpenTable con tu `rid`.
- O implementa POST a tu API (`/api/reservas`) y gestiona disponibilidad en backend.

## Rendimiento
- Mantén imágenes optimizadas (WebP/JPG). Usa `loading="lazy"`.
- Evita JS innecesario. Este proyecto es ligero y mobile-first.

## Analytics / Pixel
- Reemplaza `G-XXXXXXX` por tu ID de GA4 en `index.html`.
- Reemplaza `YOUR_PIXEL_ID` por el ID de Facebook Pixel.

## Blog
- Duplica un post en `blog/` y edita contenido.
- Genera un feed RSS si lo necesitas a futuro.

# Cobertura municipal — noviembre de 2026

La versión actual conserva **373 páginas municipales** y cubre **2.760 municipios en 15 provincias**, con **2.387 pueblos agrupados**. Mantiene los 21 distritos de Madrid y la búsqueda postal. El sitemap contiene **418 URLs**.

Consulta [el criterio y la migración](docs/consolidacion-municipal.md) y [la asignación por municipio](docs/cobertura-municipal.csv). Las cifras de auditorías anteriores corresponden a versiones previas.

# Canalones Limpios

Web local SEO para limpieza, desatasco y mantenimiento de canalones y bajantes.

## Objetivo
- Portada de marca.
- Hubs provinciales.
- Una página útil por municipio.
- Sitemap índice + sitemap por provincia.
- Canonicals, robots y auditoría automática.
- Producción bloqueada hasta definir dominio y teléfono definitivos.

## Desarrollo
```bash
npm run build
```

El build de revisión genera `dist/` con `noindex,nofollow`. La activación de indexación se hará únicamente cuando dominio, teléfono, contenido y diseño estén aprobados.

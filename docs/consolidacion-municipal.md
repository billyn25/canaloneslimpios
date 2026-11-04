# Consolidación municipal — 4 de noviembre de 2026

La web pasa de 2.760 páginas municipales a 373 páginas municipales que cubren los mismos 2.760 municipios en 15 provincias. Se conservan los 21 distritos de Madrid y los datos de los 296 códigos postales de sus municipios (395 relaciones municipio/código). El resultado incluye 418 URLs en el sitemap y 2.387 municipios agrupados con redirecciones permanentes.

## Criterio y límites

- Se conservan todos los municipios con al menos 5.000 habitantes, según la población del catálogo geográfico documentado (edición IGN 2025-10-20, no padrón actualizado de 2026).
- Al menos los ocho más poblados de cada provincia.
- Se añaden municipios, priorizando población, cuando no existe una página conservada a un máximo de 25 km entre coordenadas.
- Cada municipio restante se asigna al municipio conservado más cercano de su propia provincia.
- Las distancias son aproximadas, no recorridos por carretera. El desplazamiento y las condiciones se confirman al consultar.

La geografía está enlazada por código INE al inventario histórico del proyecto en `content/municipal-geography.json`. La asignación completa está en `docs/cobertura-municipal.csv`; el build genera `dist/coverage-manifest.json`.

## Cobertura por provincia

| Provincia | Municipios cubiertos | Páginas municipales |
|---|---:|---:|
| Bizkaia | 113 | 35 |
| Gipuzkoa | 88 | 34 |
| Álava | 51 | 9 |
| Cantabria | 102 | 24 |
| Burgos | 371 | 20 |
| Navarra | 272 | 26 |
| La Rioja | 174 | 12 |
| Asturias | 78 | 33 |
| Palencia | 191 | 14 |
| Ávila | 248 | 12 |
| León | 211 | 22 |
| Zamora | 248 | 17 |
| Valladolid | 225 | 19 |
| Segovia | 209 | 13 |
| Madrid | 179 | 83 |

## Comportamiento

Las páginas conservadas muestran los municipios agrupados con anclas individuales. Los enlaces de portada y provincia y el buscador apuntan directamente a esas anclas; los municipios siguen visibles también sin JavaScript. Se añaden enlaces a páginas propias próximas, calculados por distancia entre coordenadas.

En Madrid se mantienen todos los datos postales en el buscador y en el directorio. Los municipios agrupados muestran sus propios códigos en la página que los cubre; no se presentan como códigos de otro municipio. Cuando se accede desde un resultado o enlace a un pueblo agrupado, el presupuesto conserva el nombre de ese pueblo.

Las URLs retiradas, sus variantes sin barra final y sus rutas index.html tienen redirección 301 directa. El sitemap contiene solo páginas conservadas. Se mantienen diseño, fotografías, servicios, cookies, formularios y teléfonos por zona. El cierre regional verifica el nuevo inventario de Madrid (105 páginas: 83 municipios, 21 distritos y provincia).

## Verificación y seguimiento

Se verifican cobertura completa, límites de distancia, mismo territorio provincial, buscador, códigos postales, destinos de redirección, enlaces, anclas, metadatos, robots y ausencia de páginas huérfanas. Las pruebas de navegador comprueban también la localidad del presupuesto tras buscar un pueblo agrupado.

Las vistas previas mantienen noindex y no generan sitemap. La publicación de producción conserva la indexación y el dominio configurado.

Después de publicar hay que reenviar https://limpiezacanalonesytejados.com/sitemap.xml en Search Console. No se envía automáticamente. Una caída de posiciones no demuestra una penalización y la reorganización no garantiza recuperarlas. Conviene comparar consultas, impresiones, clics e indexación después del nuevo rastreo.

# Auditoría de similitud municipal — 21 de octubre de 2026

## Resultado

Se revisaron los **2.760 municipios de las 15 provincias**. La comparación numérica usa las mismas **720 páginas** antes y después: 48 por provincia y **16.920 pares dentro de una misma provincia**. No mezcla pueblos de provincias diferentes para reducir la media.

| Medida | Antes | Después |
| --- | ---: | ---: |
| Similitud media entre los pares de la muestra | 96,57 % | 23,48 % |
| Media del vecino más parecido de cada página dentro de la muestra | 99,98 % | 48,88 % |
| Par más parecido encontrado en la muestra | 100,00 % | 74,53 % |
| Cuerpos de texto distintos, descontando nombres y bloques excluidos, en los 2.760 municipios | 12 | 2.760 |
| Páginas incluidas en grupos de texto exactamente repetido | 2.760 | 0 |
| Media de palabras incluidas en la medición por municipio | 935 | 1.291 |

La caída de la media es de **73,09 puntos porcentuales**. El dato procede de una herramienta editorial propia; **no es un porcentaje de Google, una medida de calidad global ni una garantía de indexación**. Que no queden cuerpos exactamente iguales tampoco significa que no existan frases o módulos compartidos.

## Qué se repetía y qué se ha cambiado

La versión anterior combinaba tres introducciones y cuatro párrafos de ejemplo. Después de descontar los nombres, generaba solo doce cuerpos de texto para todos los pueblos. Las once tarjetas de servicios, seis tarjetas de incidencias y preguntas frecuentes se repetían en todo el inventario; también se añadían bloques comunes de urgencias, alcance y presupuesto.

La versión nueva combina guías explicativas de incidencias con selección estable por localidad, descripciones de servicios, preguntas y respuestas, detalles del material, tipo de inmueble y comprobaciones posteriores. El texto distingue síntomas, posibles causas y qué revisar antes de proponer una actuación. Estas combinaciones son contenido orientativo del servicio: no documentan trabajos realizados, condiciones de una vivienda concreta ni frecuencias reales de averías en ese pueblo.

Se incorporan fotografías ilustrativas de hojas y barro en un canalón, manchas interiores de gotera y una junta con goteo. Las imágenes, sus atributos y los pies de figura están fuera del cálculo: añadir una foto no mejora por sí solo esta puntuación de texto. Su procedencia se recoge en [photo-assets.md](photo-assets.md).

## Resultados por provincia

Cada provincia aporta 48 páginas y 1.128 pares. La columna del vecino posterior recoge la media de la página más parecida a cada una de esas 48 páginas dentro de su propia muestra provincial.

| Provincia | Municipios | Media antes | Media después | Vecino posterior |
| --- | ---: | ---: | ---: | ---: |
| Bizkaia | 113 | 96,51 % | 23,61 % | 49,16 % |
| Gipuzkoa | 88 | 96,51 % | 23,45 % | 48,27 % |
| Álava | 51 | 96,52 % | 23,15 % | 50,16 % |
| Cantabria | 102 | 96,54 % | 23,47 % | 49,32 % |
| Burgos | 371 | 96,58 % | 23,39 % | 48,04 % |
| Navarra | 272 | 96,53 % | 23,27 % | 47,72 % |
| La Rioja | 174 | 96,51 % | 23,44 % | 48,51 % |
| Asturias | 78 | 96,53 % | 23,65 % | 48,78 % |
| Palencia | 191 | 97,11 % | 23,47 % | 48,20 % |
| Ávila | 248 | 96,58 % | 23,94 % | 50,95 % |
| León | 211 | 96,51 % | 23,30 % | 48,33 % |
| Zamora | 248 | 96,58 % | 23,57 % | 48,58 % |
| Valladolid | 225 | 96,52 % | 23,73 % | 49,49 % |
| Segovia | 209 | 96,52 % | 23,42 % | 48,64 % |
| Madrid | 179 | 96,54 % | 23,40 % | 49,12 % |

## Ejemplos para revisar en la web

| Página | Ejemplos de contenido diferenciado |
| --- | --- |
| [Zalla](https://limpiezacanalonesytejados.com/bizkaia/zalla/) | Acículas y restos finos que atraviesan el protector; gotera que reaparece después de un sellado; barro y sedimentos. |
| [Balmaseda](https://limpiezacanalonesytejados.com/bizkaia/balmaseda/) | Canalón oculto con acceso limitado; tejas desplazadas tras viento; teja fisurada. |
| [Madrid](https://limpiezacanalonesytejados.com/madrid/madrid/) | Descarga inferior que no admite agua; limahoya con residuos; gotera que vuelve tras un sellado. |
| [Alcalá de Henares](https://limpiezacanalonesytejados.com/madrid/alcala-de-henares/) | Soportes flojos; encuentro de cubierta con medianera; canalón oculto o interior. |

Como comprobaciones adicionales de estos ejemplos, la similitud posterior Zalla–Balmaseda es **18,85 %**, y Madrid–Alcalá de Henares, **16,60 %**. Estas dos comparaciones no se usan para sustituir la media completa de la muestra.

## Método reproducible

La herramienta está en [scripts/audit-similarity.mjs](../scripts/audit-similarity.mjs), con versión de método `main-text-dice5-v1`.

1. Extrae el texto de `main` de cada página municipal. Conserva descripciones de servicios, incidencias, preguntas desplegables, alcance del trabajo, urgencias y presupuesto.
2. Excluye cabecera, pie, navegación, migas, directorios de localidades, formularios, llamadas de contacto, figuras y atributos de las imágenes, contenido oculto y el bloque de códigos postales. Así el nombre de un pueblo o un código postal diferente no cuentan como una explicación distinta del servicio.
3. Sustituye los nombres propios del municipio y de la provincia por el mismo marcador. Lo hace antes de pasar a minúsculas para no confundir el municipio **Segura** con el adjetivo de «zona segura». Después normaliza tildes, puntuación y espacios.
4. Forma conjuntos de secuencias de **cinco palabras consecutivas**. Para dos conjuntos A y B calcula `100 × 2 × |A ∩ B| / (|A| + |B|)`.
5. Ordena las rutas de cada provincia y toma 48 posiciones espaciadas uniformemente. En la comparación posterior reutiliza las rutas almacenadas en el informe anterior. Compara todos los pares dentro de cada provincia y, para cada página, conserva su mayor coincidencia en esa muestra.
6. La comprobación de cuerpos exactamente repetidos usa el texto normalizado completo de **todos los 2.760 municipios**, no solo la muestra.

La base anterior corresponde al commit [`47a788f`](https://github.com/billyn25/canaloneslimpios/commit/47a788f). La medición posterior corresponde a la versión con `content/local-guides.mjs`, `content/local-details.mjs` y `scripts/local-experience.mjs`, tras la generación de producción y la adaptación de contactos regionales.

Para repetir la comparación, generar la versión anterior en un directorio independiente y copiar allí la misma versión de `scripts/audit-similarity.mjs`. En ese directorio:

```bash
npm run build:production
node scripts/regional-contact.mjs
node scripts/audit-similarity.mjs --out /tmp/canalones-similarity-before.json
```

En la versión posterior:

```bash
npm run build:production
node scripts/regional-contact.mjs
node scripts/audit-similarity.mjs \
  --baseline /tmp/canalones-similarity-before.json \
  --out /tmp/canalones-similarity-after.json
```

Los informes JSON incluyen las 720 rutas, estadísticas provinciales y coincidencia más alta encontrada para cada página. `--save-samples /tmp/canalones-textos` guarda también el texto normalizado de la muestra para inspección.

## Límites de la lectura

- La similitud depende del método de extracción y de la longitud de secuencia. Estos resultados solo son comparables utilizando el mismo método en ambas versiones.
- El vecino más parecido se busca entre las 48 páginas seleccionadas de cada provincia; puede existir una coincidencia mayor con otra página fuera de esa muestra.
- Los 21 distritos de Madrid, portada, páginas provinciales y páginas generales de servicios quedan fuera de la comparación municipal.
- La métrica detecta repetición literal; no mide por sí sola la utilidad, exactitud o equivalencia semántica del contenido. La biblioteca sigue compartiendo módulos: es esperable que las mismas explicaciones aparezcan en varias localidades.
- La ampliación de texto, por sí sola, tampoco demuestra una mejora editorial. Los porcentajes deben leerse junto con las páginas de ejemplo y sus explicaciones concretas.

## Verificación de la publicación

- Compilación de producción completa: **2.805 URLs y página 404**, con las auditorías de rutas, enlaces internos, metadatos, datos estructurados y códigos postales superadas.
- **2.781 páginas locales** (2.760 municipios y 21 distritos) incluyen las imágenes de hojas y humedad interior, tres casos explicados y once servicios.
- **154.196 enlaces internos** comprobados en la auditoría del sitio.
- Los 19 archivos comparados de inventario, robots e índices/sitemaps coinciden con la base anterior; no se han añadido ni eliminado rutas.
- Contacto regional validado: Madrid y sus distritos al **614 78 99 45**; zona norte y Castilla y León al **641 58 93 94**.
- Pruebas existentes superadas. Revisión de ocho vistas de navegador entre 360 y 1.440 px, con fotografías locales cargadas y sin desbordamiento horizontal. La revisión se centra en las imágenes nuevas; las fotografías externas anteriores de portada no intervienen en esta comprobación.
- En móvil, la fotografía principal se coloca inmediatamente después del título. Se mantiene el acceso fijo de llamada y WhatsApp.

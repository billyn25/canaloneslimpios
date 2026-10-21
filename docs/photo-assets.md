# Fotografías ilustrativas de canalones y goteras

Fecha de creación: 21 de octubre de 2026.

Las tres escenas fueron generadas con la herramienta integrada `image_gen` para explicar síntomas. Son imágenes ilustrativas creadas con IA, no fotografías de trabajos realizados, clientes o municipios concretos. No se deben presentar como casos reales, testimonios ni pruebas de cobertura local. La misma imagen puede servir para explicar un problema en distintas páginas; no aporta por sí sola diferenciación geográfica.

Leyenda breve recomendada para cada figura: **Imagen ilustrativa creada con IA.** El texto alternativo debe describir lo visible, sin añadir un nombre de pueblo ni afirmar que se ha diagnosticado una vivienda real.

## Archivos y preparación

Los originales se generaron a 1536 × 1024 px. Los archivos del proyecto solo se han redimensionado y comprimido con Sharp, sin alterar la escena. Formato WebP, calidad 78, esfuerzo 6. Todos los archivos se han inspeccionado visualmente después de la compresión.

| Archivo en `src/photos/` | Tamaño | Bytes | Texto alternativo sugerido |
| --- | --- | ---: | --- |
| `leaves-gutter.webp` | 1200 × 800 | 113224 | Canalón con hojas húmedas, barro y agua retenida junto a la salida de la bajante |
| `leaves-gutter-640.webp` | 640 × 427 | 45576 | Mismo contenido en tamaño pequeño |
| `ceiling-leak.webp` | 1200 × 800 | 29532 | Mancha de humedad y pintura desprendida en el encuentro entre techo y pared |
| `ceiling-leak-640.webp` | 640 × 427 | 9134 | Mismo contenido en tamaño pequeño |
| `leaking-joint.webp` | 1200 × 800 | 73134 | Gotas de agua bajo la unión de dos tramos de canalón junto a un tejado de tejas |
| `leaking-joint-640.webp` | 640 × 427 | 28758 | Mismo contenido en tamaño pequeño |

Para el HTML: `width="1200" height="800"`, `srcset` con las dos anchuras, `sizes` adecuado al contenedor, carga diferida salvo si es la imagen principal visible al entrar. Las rutas públicas previstas son `/assets/photos/<archivo>`.

## Prompts utilizados

### Hojas y obstrucción

Use case: photorealistic-natural. Asset type: editorial example image for a Spanish gutter cleaning website, clearly to be labelled an AI-created illustrative example by the website. Primary request: a realistic natural photographic close-up of an exterior rain gutter physically blocked by wet brown autumn leaves and a little dark silt gathered at the round outlet toward a downpipe. Some retained rainwater visible between leaves. Scene: unbranded grey zinc-coloured semicircular gutter along the edge of a terracotta clay tile roof on a modest Spanish house, softly defocused neutral wall and trees beyond. Composition: landscape 3:2 frame, oblique close elevated view showing the inside of the gutter, visible leaf clog as the main subject, gutter diagonally spanning the image. Materials: believable weathered metal, soft damp leaf textures, modest water reflection. Lighting: cloudy daylight, documentary photography, natural restrained colour, no dramatic cinematic effects. Constraints: physically plausible gutter and roof geometry, no people, no text, no logos, no watermark, no advertising graphics, no collage; do not depict work being carried out or imply a completed real project.

### Humedad interior

Use case: photorealistic-natural. Asset type: editorial example photo for a Spanish roof leak repair website; website will label it AI-created illustrative imagery. Primary request: a believable close documentary photograph of a roof leak visible at the interior upper corner of a home, an irregular tan brown water stain across off-white plaster ceiling extending subtly onto the wall, a small area of peeling blistered paint and one subtle water bead at the damaged edge. Scene: ordinary Spanish house plaster ceiling and pale cream wall junction, narrow top edge of a simple window visible out of focus toward side, no furniture needed. Composition: horizontal landscape 3:2 close composition, ceiling-wall corner perspective, moisture stain is central and clearly readable with realistic fine texture, no giant flood. Lighting: soft natural window daylight, neutral restrained colours, accurate building maintenance documentation. Constraints: no people, no text, no logos, no watermark, no electric fixtures, no extensive black mould, no theatrical damage, no collage. Do not suggest this is a completed repair or a real customer project.

### Fuga en una unión

Use case: photorealistic-natural. Asset type: editorial example photograph for Spanish gutter repair website, to be labelled AI illustrative photo. Primary request: realistic natural close photo of an exterior metal rain gutter leaking at the connection between two sections, a small stream of distinct drops falling from underneath the joint, staining the pale masonry below slightly. Scene: a modest clay tiled roof eave, weathered but intact grey half-round metal gutter, correctly assembled continuous gutter with a single visible connector joint in the foreground, connected vertical downpipe farther along in soft focus. Composition: horizontal landscape 3:2, close oblique eye-level view of gutter side and underside, clear visible joint and drops centered, terracotta roof edge above, light stucco wall behind, no hole cutaway. Natural cloudy daylight after rain, neutral documentary maintenance photograph, physically plausible scale and materials. Constraints: no people, no text, no logos, no watermark, no collage, no major broken pieces, no leaves as main subject, no excessive waterfall, no dramatic storm. Do not imply real customer work or a completed repair.

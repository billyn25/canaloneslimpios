# Madrid: municipios y códigos postales

Se añaden 179 municipios al proyecto Limpieza Canalones y Tejados: 2760 municipios en 15 provincias. Una página municipal y un directorio provincial; ninguna URL nueva por código postal. Se mantienen dominio, teléfono, servicios, fotos y rutas anteriores.

En portada aparecen 12 municipios madrileños y el resto en «Ver más», en HTML. El directorio de Madrid y el buscador de portada admiten nombres sin tildes y códigos postales. Los códigos están disponibles para Madrid; un código compartido devuelve todos sus municipios. Las listas largas se despliegan sin scroll interno.

El dato postal es una copia exacta de Antenas Rapid, commit fc7ead70124156c46bda6c28acf5f475bf4d1978, blob b05578a496895112c691b66cd04119f4ab65165f. Se reutilizan los datos, no las plantillas ni el contenido comercial de antenas.

Fuente: CartoCiudad (IGN/CNIG), https://api-features.idee.es/collections/address/items, filtro provincial Madrid, consulta del 2 de octubre de 2026. Obra derivada de CartoCiudad CC BY 4.0 scne.es. Son 395 relaciones municipio/código postal y 296 códigos distintos. La extracción original leyó 930450 registros; «Los Baldios» se excluyó por no figurar entre los 179 municipios del inventario.

El inventario refleja códigos asociados a direcciones de esa fuente: no certifica todos los códigos especiales de Correos. Debe confirmarse la correspondencia con la dirección concreta. No se publican domicilios individuales ni se declaran sedes de empresa. El dato permanece en el repositorio: los builds y las visitas no consultan la API postal.

Las pruebas unitarias verifican integridad, códigos compartidos, inserción única, conservación de metadatos y FAQ y aislamiento de las demás provincias. La auditoría de Madrid comprueba códigos en HTML/buscador, 179 páginas municipales y 180 URLs en el sitemap provincial. Las auditorías generales siguen activas. La prueba de navegador cubre portada/Madrid, códigos compartidos, nombres sin tildes, ausencia de resultados, HTML sin JavaScript y móvil/escritorio.

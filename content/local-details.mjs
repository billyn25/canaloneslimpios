// Situaciones de inmueble y material: supuestos de consulta, no estadísticas locales.
export const propertyDetails = [
  {id:'parcela',title:'Si el aviso es para una casa con parcela',text:'Indica si se puede llegar al alero desde el jardín y si existen porches, cerramientos o zonas que impidan acercarse a la fachada. Una fotografía general permite valorar el acceso además del atasco.',question:'¿Qué conviene mostrar en las fotos de una vivienda?',answer:'Una vista del alero completo y otra del lugar del rebose ayudan más que un primer plano sin referencias. Si tienes árboles próximos, muestra desde el suelo su posición respecto al canalón. No es necesario acceder a la cubierta para preparar la consulta.'},
  {id:'comunidad',title:'Para una comunidad de propietarios',text:'Reúne los avisos por planta y por fachada. Si varias viviendas comparten bajante, saber dónde aparece primero la humedad ayuda a preparar la inspección. Acuerda quién facilita el acceso a patios y zonas comunes.',question:'¿Cómo se prepara un aviso de una comunidad?',answer:'La persona de contacto puede indicar portal, fachada o patio, plantas afectadas y si el agua aparece a la vez en varias viviendas. Conviene aportar reparaciones anteriores y el acceso disponible a las zonas comunes para delimitar el alcance de la visita.'},
  {id:'patio',title:'Cuando la bajante está en un patio interior',text:'La entrada al patio, su anchura y las cubiertas de locales situadas debajo condicionan el trabajo. Describe qué tramo es visible y si el agua moja la pared, sale por una junta o aparece en el punto de descarga.',question:'¿Una bajante de patio se revisa igual que una exterior?',answer:'El recorrido del agua se estudia de forma parecida, pero el acceso puede ser muy distinto. Hay que conocer la entrada al patio y los obstáculos antes de elegir los medios de trabajo. Una fotografía tomada desde una ventana segura puede orientar, sin asomarse ni manipular piezas.'},
  {id:'adosada',title:'En una vivienda adosada o medianera',text:'Aclara qué tramo corresponde a la vivienda y si el canalón continúa hacia otra propiedad. Una salida compartida puede relacionar el rebose con un tramo distinto al que se ve desde la ventana.',question:'¿Puede influir el canalón de la vivienda contigua?',answer:'Si ambos tramos están conectados o comparten una bajante, una obstrucción puede afectar a más de una vivienda. Primero se identifica el recorrido y la parte afectada. El alcance y cualquier acceso a otra propiedad deben acordarse antes de intervenir.'},
  {id:'nave',title:'Si se trata de una nave o un almacén',text:'Señala la fachada y el tramo aproximado donde aparece el problema. Los recorridos largos pueden tener varias salidas; interesa identificar cuál evacua mal y qué actividad debe mantenerse durante la visita.',question:'¿Qué información necesita un presupuesto para una nave?',answer:'Ayudan la longitud aproximada del tramo afectado, la altura, el número de bajantes y los accesos exteriores. También conviene indicar horarios y obstáculos. El presupuesto debe separar limpieza, revisión y reparación si no tienen el mismo alcance.'},
  {id:'porche',title:'Para porches, garajes y pequeñas cubiertas',text:'Comprueba desde una zona segura si la humedad aparece en el encuentro con la vivienda o en el borde de evacuación. Aunque la cubierta sea pequeña, su unión con otra fachada necesita una revisión específica.',question:'¿Una gotera de porche viene siempre de su canalón?',answer:'Puede estar relacionada con un rebose, pero también con la unión entre el porche y la pared, una fijación o el solape de la cubierta. Indica dónde comienza la marca y en qué condiciones llueve; así se orienta la revisión sin presuponer el origen.'},
  {id:'recurrente',title:'Cuando el problema ya se había reparado',text:'Describe qué se hizo anteriormente y cuánto tardó en reaparecer. Un sellado, una limpieza o una sustitución parcial son antecedentes distintos y pueden ayudar a separar un fallo recurrente de una incidencia nueva.',question:'¿Sirve enviar fotos de reparaciones anteriores?',answer:'Sí, si permiten reconocer el punto tratado y el material utilizado. Indica también cuándo volvió la humedad y si aparece con cualquier lluvia o solo en ciertas condiciones. No hace falta retirar el sellado existente para preparar el aviso.'},
  {id:'mantenimiento',title:'Si buscas mantenimiento antes de que haya un rebose',text:'Indica cuándo se limpió por última vez y qué residuos suelen encontrarse en tu inmueble. El seguimiento se adapta a la acumulación observada y al acceso; conviene conservar fotos de las salidas y un registro de incidencias.',question:'¿Hay una frecuencia de limpieza válida para todos?',answer:'No se fija el mismo intervalo para cualquier edificio. Influyen los residuos observados, las salidas, el acceso y los antecedentes de atasco. Tras una revisión se puede proponer una periodicidad y ajustarla si se detecta acumulación antes de lo previsto.'}
];

export const materialDetails = [
  {id:'pvc',title:'Canalón de PVC: juntas y dilatación',text:'Si el sistema es de PVC, hay que reconocer el tipo de unión y el estado de las piezas. Un encaje desplazado, una junta envejecida y una fisura no se resuelven de la misma manera. La reparación debe respetar el movimiento previsto por el fabricante.'},
  {id:'aluminio',title:'Aluminio: revisar también esquinas y tapas',text:'En un canalón de aluminio interesa localizar si el agua sale por un encuentro, una tapa o una perforación. El acabado exterior puede parecer correcto y existir un defecto en la unión. La compatibilidad del sellado y el estado del soporte condicionan la reparación.'},
  {id:'metal',title:'Zinc, cobre o chapa: identificar el sistema',text:'Antes de reparar un canalón metálico se identifica el material y cómo están realizadas sus uniones. La corrosión localizada, una fisura y un encuentro abierto requieren valoraciones diferentes. No se presupone que cualquier masilla sirva para todos los metales.'},
  {id:'teja',title:'Tejas: limpieza según su conservación',text:'Si la cubierta es de teja, se observa si existen piezas fisuradas, desplazadas o degradadas antes de decidir la limpieza. Un tratamiento demasiado agresivo puede afectar a un soporte deteriorado. La retirada de residuos debe coordinarse con la evacuación del agua.'},
  {id:'remate',title:'Encuentros entre materiales distintos',text:'Donde se unen cubierta, muro y remate pueden aparecer movimientos o pérdidas de adherencia. Conviene distinguir entre un acabado superficial deteriorado y un fallo del encuentro completo. El producto se elige según los materiales y el diagnóstico del punto afectado.'},
  {id:'protector',title:'Con rejilla o malla antihojas instalada',text:'Un protector puede retener residuos sobre su superficie o dificultar el acceso a la embocadura. Antes de proponer otro modelo se valora lo que se acumula y cómo podrá mantenerse. La protección no elimina la necesidad de comprobar el paso del agua.'},
  {id:'fijacion',title:'La fijación influye en el recorrido del agua',text:'Un tramo que se mueve o se ha deformado puede retener agua aunque esté limpio. Se revisan el soporte, las uniones y la pendiente en conjunto. Cambiar solamente la pieza que gotea no siempre corrige la causa que la mantiene sometida a esfuerzo.'},
  {id:'historial',title:'No mezclar reparación puntual con sustitución completa',text:'Una pieza dañada puede admitir reparación o recambio si el resto del sistema conserva su función. Cuando el deterioro afecta a varios tramos, se debe explicar qué elementos requieren sustitución y por qué. El alcance se concreta después de revisar su estado.'}
];

// Cada variante aporta un foco práctico; ninguna se presenta como hecho propio del municipio.
export const serviceDetails = [
  {name:'Limpieza de canalones',variants:[
    'Retirada de hojas húmedas y restos adheridos, con atención a las embocaduras donde el agua abandona el tramo horizontal.',
    'Limpieza de sedimentos y barro en puntos de acumulación; después se comprueba si queda agua retenida o persiste el rebose.',
    'Valoración del residuo encontrado y del acceso para retirar suciedad sin trasladar el atasco al interior de la bajante.',
    'Revisión de tramos bajo árboles y zonas protegidas por rejillas para localizar el material que está reduciendo el paso del agua.'
  ]},
  {name:'Limpieza de tejados',variants:[
    'Valoración del material y del estado de la cubierta antes de retirar musgo o restos que puedan terminar en el canalón.',
    'Comprobación de piezas sueltas y zonas frágiles para elegir el método de limpieza sin dar por adecuado el uso de presión.',
    'Retirada de suciedad según la conservación del tejado, prestando atención a limas, encuentros y salidas de agua.',
    'Limpieza adaptada a tejas y remates, diferenciando la acumulación superficial de los defectos que necesitan reparación.'
  ]},
  {name:'Desatasco de bajantes',variants:[
    'Localización del bloqueo cuando la embocadura está libre pero el agua se acumula en el canalón o baja con lentitud.',
    'Revisión de codos accesibles, cambios de dirección y salidas para acotar dónde se interrumpe la evacuación.',
    'Comprobación de bajantes compartidas cuando el rebose aparece en un tramo distinto al lugar de la obstrucción.',
    'Valoración de entradas y recorrido visible para separar un tapón de residuos de un problema en el punto de descarga.'
  ]},
  {name:'Reparación de canalones',variants:[
    'Revisión de juntas, tapas y esquinas que pierden agua, con solución compatible con el material y el tipo de unión.',
    'Valoración de tramos deformados y fijaciones cedidas cuando la limpieza no corrige el agua retenida.',
    'Identificación de fisuras o piezas deterioradas para concretar si basta un recambio puntual o hay más elementos afectados.',
    'Comprobación de uniones sometidas a movimiento antes de repetir un sellado que se ha vuelto a abrir.'
  ]},
  {name:'Sustitución de tejas rotas',variants:[
    'Inspección de la pieza dañada y las contiguas para valorar un cambio puntual y verificar el apoyo y los solapes.',
    'Revisión de tejas desplazadas cuando hay una discontinuidad visible; se concreta el alcance según acceso y conservación.',
    'Localización de fisuras que puedan permitir entrada de agua, evitando atribuir cualquier mancha interior a una sola teja.',
    'Comprobación del encaje y de los elementos próximos a la rotura antes de proponer la sustitución de piezas.'
  ]},
  {name:'Reparación de goteras',variants:[
    'Seguimiento del punto de humedad y de su relación con la lluvia para orientar la búsqueda de la entrada de agua.',
    'Revisión de cubierta y encuentros cuando la gotera persiste después de limpiar el sistema de evacuación.',
    'Valoración de manchas interiores que no coinciden con el punto de entrada; el agua puede recorrer el soporte antes de aparecer.',
    'Comprobación de antecedentes y reparaciones previas para delimitar una filtración recurrente antes de volver a sellar.'
  ]},
  {name:'Impermeabilización',variants:[
    'Tratamiento localizado de encuentros cuando el origen de la filtración y el estado del soporte justifican esa solución.',
    'Revisión de continuidad y adherencia en puntos expuestos; no se aplica el mismo producto a todos los materiales.',
    'Valoración de remates y sellados envejecidos para concretar preparación, reparación y protección del punto afectado.',
    'Estudio del alcance de una zona húmeda antes de decidir si procede una actuación puntual o una revisión más amplia.'
  ]},
  {name:'Revisión de chimeneas',variants:[
    'Inspección del encuentro exterior de la chimenea con la cubierta y de los remates por los que podría entrar agua.',
    'Comprobación de sellados y piezas próximas a la chimenea si la mancha aparece alrededor de su paso por el tejado.',
    'Revisión de encuentros con cambios de plano, sin confundir el trabajo de cubierta con el mantenimiento del conducto de humos.',
    'Valoración del remate que desvía la lluvia alrededor de la chimenea y del estado de las uniones visibles.'
  ]},
  {name:'Mantenimiento preventivo',variants:[
    'Plan de revisión según residuos encontrados, incidencias previas y accesos, con atención a las salidas que se obstruyen.',
    'Seguimiento de reboses y limpiezas anteriores para ajustar la frecuencia a lo que ocurre en el inmueble.',
    'Revisión de puntos de evacuación antes de que una acumulación vuelva a bloquear el recorrido del agua.',
    'Comprobación del canalón tras una acumulación observada o una incidencia, diferenciando limpieza periódica y reparación.'
  ]},
  {name:'Mallas antihojas',variants:[
    'Valoración del protector según el residuo y el acceso; las hojas gruesas y las agujas finas no se comportan igual.',
    'Revisión de rejillas existentes y de cómo podrán limpiarse antes de proponer una nueva protección.',
    'Comprobación del paso de agua bajo la malla para evitar que una superficie cubierta de hojas provoque reboses.',
    'Selección de protección compatible con el canalón y la embocadura, manteniendo el acceso para inspección y limpieza.'
  ]},
  {name:'Revisión del sistema de evacuación',variants:[
    'Seguimiento del agua desde el borde de cubierta hasta la descarga para localizar dónde se acumula o sale de su recorrido.',
    'Comprobación conjunta de canalón, embocaduras y bajantes cuando una reparación aislada no ha corregido el problema.',
    'Revisión del comportamiento de las salidas tras retirar residuos, sin dar por resuelto el atasco solo por el aspecto del tramo.',
    'Valoración de pendiente, puntos bajos y descarga cuando existe agua retenida sin una obstrucción visible.'
  ]}
];

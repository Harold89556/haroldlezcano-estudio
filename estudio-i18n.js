'use strict';
(function (global) {
  const PAISES = [
    { id: 'PY', moneda: 'PYG', lang: 'es', flag: 'py' },
    { id: 'AR', moneda: 'ARS', lang: 'es', flag: 'ar' },
    { id: 'BR', moneda: 'BRL', lang: 'pt', flag: 'br' },
    { id: 'UY', moneda: 'UYU', lang: 'es', flag: 'uy' },
    { id: 'CL', moneda: 'CLP', lang: 'es', flag: 'cl' },
    { id: 'BO', moneda: 'BOB', lang: 'es', flag: 'bo' },
    { id: 'EC', moneda: 'USD', lang: 'es', flag: 'ec' },
    { id: 'PE', moneda: 'PEN', lang: 'es', flag: 'pe' },
    { id: 'CO', moneda: 'COP', lang: 'es', flag: 'co' },
    { id: 'MX', moneda: 'MXN', lang: 'es', flag: 'mx' },
    { id: 'US', moneda: 'USD', lang: 'en', flag: 'us' },
    { id: 'CA', moneda: 'CAD', lang: 'en', flag: 'ca' },
    { id: 'ES', moneda: 'EUR', lang: 'es', flag: 'es' },
    { id: 'FR', moneda: 'EUR', lang: 'fr', flag: 'fr' },
    { id: 'IT', moneda: 'EUR', lang: 'it', flag: 'it' },
    { id: 'DE', moneda: 'EUR', lang: 'de', flag: 'de' },
    { id: 'PT', moneda: 'EUR', lang: 'pt', flag: 'pt' },
    { id: 'GB', moneda: 'GBP', lang: 'en', flag: 'gb' },
    { id: 'CH', moneda: 'CHF', lang: 'de', flag: 'ch' },
    { id: 'RU', moneda: 'RUB', lang: 'en', flag: 'ru' },
    { id: 'CN', moneda: 'CNY', lang: 'en', flag: 'cn' },
    { id: 'JP', moneda: 'JPY', lang: 'en', flag: 'jp' },
    { id: 'KR', moneda: 'KRW', lang: 'en', flag: 'kr' },
    { id: 'IN', moneda: 'INR', lang: 'en', flag: 'in' },
    { id: 'AU', moneda: 'AUD', lang: 'en', flag: 'au' },
  ];
  const LANGS = ['es', 'en', 'pt', 'fr', 'it', 'de'];
  const STRINGS = {
    es: {
      "nav.inicio": "Inicio",
      "nav.cotizar": "Cotizar",
      "nav.cursos": "Cursos",
      "locale.idioma": "Idioma",
      "locale.pais": "País",
      "comun.y": "y",
      "comun.cambiar": "cambiar",
      "comun.atras": "Atrás",
      "comun.siguiente": "Siguiente",
      "comun.cerrar": "Cerrar",
      "comun.enviar": "Enviar pedido",
      "comun.compartir": "Compartir",
      "unidad.titulo": "Unidad de medida",
      "unidad.cm": "CM",
      "unidad.in": "IN",
      "unidad.m": "M",
      "unidad.centimetros": "centímetros",
      "unidad.pulgadas": "pulgadas",
      "unidad.metros": "metros",
      "precio.consultar": "A consultar",
      "precio.consultarArtista": "A consultar con el artista",
      "precio.muralDetalle": "El mural se cotiza de forma personalizada según la pared, el acceso y el nivel de detalle.",
      "precio.artistaDetalle": "Si no es una figura humana (busto, medio cuerpo, figura o relieve), el valor se consulta directamente con el artista.",
      "precio.sinLista": "Este estilo no tiene un precio fijo en la lista actual; el valor se acuerda según la obra.",
      "precio.ivaEnvio": "IVA incluido. Envío aparte.",
      "precio.iva": "IVA incluido",
      "fx.nota": "Conversión aproximada según cotización del día; el precio final se confirma en guaraníes",
      "escala.persona": "Persona de 1,70 m",
      "escala.notaCuadro": "La obra se muestra a escala real junto a una persona adulta de 1,70 m.",
      "escala.notaEscultura": "Altura de la pieza a escala junto a una persona de 1,70 m.",
      "escala.elegi": "Elegí un tamaño para ver la obra al lado de una persona de 1,70 m.",
      "escala.diametro": "Diámetro",
      "escultura.alturaEn": "Altura en",
      "escultura.entre": "Entre",
      "escultura.peso": "Peso estimado: aprox. {n} kg",
      "escultura.material": "Material",
      "escultura.tejido": "El cemento, la fibra de vidrio y la arcilla llevan tejido metálico en el interior.",
      "escultura.cemento": "Cemento hueco",
      "escultura.fibra": "Fibra de vidrio",
      "escultura.arcilla": "Arcilla con cemento",
      "escultura.chapa": "Chapa de hierro",
      "escultura.chatarra": "Objetos de chatarra",
      "escultura.hierroNota": "Piezas soldadas, con tratamiento antióxido.",
      "escultura.tipo": "Tipo de escultura",
      "escultura.elegiTipo": "Seleccioná el tipo...",
      "escultura.busto": "Busto",
      "escultura.medio": "Medio cuerpo",
      "escultura.figura": "Figura de cuerpo entero",
      "escultura.relieve": "Relieve",
      "escultura.animal": "Animal u otra figura no humana",
      "escultura.abstracto": "Abstracto",
      "escultura.objeto": "Objeto",
      "escultura.otro": "Otro",
      "escultura.elegiMaterial": "Seleccioná el material...",
      "wizard.paso": "Paso {n} de {total}",
      "wizard.paso1": "Paso 1",
      "wizard.trabajo.pregunta": "¿Qué tipo de trabajo buscás?",
      "wizard.trabajo.ayuda": "Elegí el tipo de obra. En el siguiente paso vamos a ir armando el pedido con las opciones de cada trabajo.",
      "trabajo.oleo": "Cuadro al óleo",
      "trabajo.oleo.text": "Pintura con óleo: colores profundos y un acabado que dura muchos años.",
      "trabajo.acrilico": "Acrílico",
      "trabajo.acrilico.text": "Pintura acrílica: colores vivos y secado más rápido.",
      "trabajo.carbonilla": "Lápiz / Carbonilla",
      "trabajo.carbonilla.text": "Dibujo a lápiz o carbonilla, en blanco y negro o a color.",
      "trabajo.escultura": "Escultura",
      "trabajo.escultura.text": "Una pieza modelada a mano en tres dimensiones. No incluye fundición.",
      "trabajo.mural": "Mural",
      "trabajo.mural.text": "Una obra grande pintada directo sobre la pared. El valor se acuerda según la pared.",
      "trabajo.restauracion": "Restauración",
      "trabajo.restauracion.text": "Recuperar o mejorar una foto u obra dañada.",
      "wizard.estilo.pregunta": "¿Qué estilo preferís?",
      "wizard.estilo.preguntaCarbonilla": "¿Qué estilo de dibujo preferís?",
      "wizard.estilo.ayuda": "El estilo es la forma en que se pinta: más natural, con más detalle, con textura, en un solo color (monocromático) o abstracto.",
      "wizard.estilo.ayudaCarbonilla": "El estilo es el acabado del dibujo: más definido, de gran detalle, un boceto suelto o una interpretación más libre.",
      "wizard.tema.pregunta": "¿Qué temática tiene la obra?",
      "wizard.sujetos.pregunta": "¿Cuántas personas van en el retrato?",
      "wizard.fondo.pregunta": "¿Cómo querés el fondo?",
      "wizard.color.pregunta": "¿El dibujo es en blanco y negro o a color?",
      "wizard.forma.pregunta": "¿Qué formato de lienzo querés?",
      "wizard.tamano.pregunta": "¿Qué tamaño querés?",
      "wizard.tamano.ayuda": "A la izquierda ves a una persona de 1,70 m para darte una idea del tamaño real. Si no está en la lista, elegí una medida personalizada.",
      "wizard.tamano.ayudaCarbonilla": "Las medidas son de papel de dibujo (tamaños tipo A). A la izquierda ves a una persona de 1,70 m para comparar.",
      "wizard.marco.pregunta": "¿Lo querés con marco?",
      "wizard.tipoEscultura.pregunta": "¿Qué tipo de escultura buscás?",
      "wizard.tipoEscultura.ayuda": "Busto es cabeza y parte del pecho. Medio cuerpo llega hasta la cintura. Figura completa es de cuerpo entero. Relieve son formas que sobresalen de un fondo. Si es un animal, un objeto o algo abstracto, el valor se consulta con el artista.",
      "wizard.material.pregunta": "¿De qué material querés la pieza?",
      "wizard.material.ayuda": "El cemento, la fibra de vidrio y la arcilla van con estructura de hierro y tejido metálico en el interior. La chapa y la chatarra son piezas soldadas, con tratamiento antióxido. No hacemos fundición en bronce ni en otros metales.",
      "wizard.altura.pregunta": "¿Qué altura querés para la pieza?",
      "wizard.altura.ayuda": "La altura se mide de la base al punto más alto. Al lado ves una persona de 1,70 m para comparar. Podés indicar la medida en centímetros, metros o pulgadas.",
      "wizard.estiloMural.pregunta": "¿Qué estilo querés para el mural?",
      "wizard.tamanoMural.pregunta": "¿Qué tamaño tiene la pared?",
      "wizard.tamanoMural.ayuda": "Indicá el ancho y el alto. Podés cambiar la unidad a centímetros, metros o pulgadas. Si la pared es alta, puede hacer falta andamio. El valor final se consulta.",
      "wizard.restauracion.pregunta": "¿Qué tipo de restauración necesitás?",
      "wizard.fotos.pregunta": "¿Tenés una foto de guía?",
      "wizard.fotos.preguntaRest": "¿Tenés una foto de la obra?",
      "wizard.datos.pregunta": "Tus datos para el pedido",
      "wizard.resumen.pregunta": "Revisá tu pedido",
      "wizard.resumen.ayuda": "Este es el resumen y el precio estimado, con IVA incluido. Al enviar se arma el mensaje con todos los detalles para confirmarlo.",
      "wizard.sugerencias": "Otras opciones para tu presupuesto",
      "wizard.actual": "Actual",
      "wizard.economica": "Más económica",
      "mural.tamano": "Tamaño",
      "mural.ancho": "Ancho",
      "mural.alto": "Alto",
      "cotiz.unidad": "Unidad de Medida",
      "cotiz.tamano": "Tamaño",
      "cotiz.ancho": "Ancho",
      "cotiz.alto": "Alto",
      "cotiz.personalizado": "Personalizado",
      "album.retrato": "Retratos",
      "album.paisaje": "Paisajes",
      "album.escultura": "Esculturas",
      "album.mural": "Murales",
      "album.abstracto": "Abstractos",
      "album.otros": "Otros",
      "album.volver": "Volver a la Biblioteca",
      "pais.PY": "Paraguay",
      "pais.AR": "Argentina",
      "pais.BR": "Brasil",
      "pais.UY": "Uruguay",
      "pais.CL": "Chile",
      "pais.BO": "Bolivia",
      "pais.US": "Estados Unidos",
      "pais.ES": "España",
      "pais.FR": "Francia",
      "pais.IT": "Italia",
      "pais.DE": "Alemania",
      "pais.PT": "Portugal",
      "pais.GB": "Reino Unido",
      "pais.MX": "México",
      "pais.CO": "Colombia",
      "pais.PE": "Perú",
      "pais.CA": "Canadá",
      "pais.CN": "China",
      "pais.JP": "Japón",
      "pais.KR": "Corea del Sur",
      "pais.IN": "India",
      "pais.RU": "Rusia",
      "pais.EC": "Ecuador",
      "pais.CH": "Suiza",
      "pais.AU": "Australia",
    },
    en: {
      "nav.inicio": "Home",
      "nav.cotizar": "Quote",
      "nav.cursos": "Courses",
      "locale.idioma": "Language",
      "locale.pais": "Country",
      "comun.y": "and",
      "comun.cambiar": "Change",
      "comun.atras": "Back",
      "comun.siguiente": "Next",
      "comun.cerrar": "Close",
      "comun.enviar": "Send order",
      "comun.compartir": "Share",
      "unidad.titulo": "Unit of measurement",
      "unidad.cm": "CM",
      "unidad.in": "IN",
      "unidad.m": "M",
      "unidad.centimetros": "centimetres",
      "unidad.pulgadas": "inches",
      "unidad.metros": "metres",
      "precio.consultar": "On request",
      "precio.consultarArtista": "To be confirmed with the artist",
      "precio.muralDetalle": "Murals are quoted individually according to the wall, access and level of detail.",
      "precio.artistaDetalle": "If it is not a human figure (bust, half-body, full figure or relief), the price is confirmed directly with the artist.",
      "precio.sinLista": "This style does not have a fixed price in the current list; the value is agreed for the work.",
      "precio.ivaEnvio": "VAT included. Shipping extra.",
      "precio.iva": "VAT included",
      "fx.nota": "Approximate conversion at the day's rate; the final price is confirmed in guaraníes",
      "escala.persona": "Person 1.70 m tall",
      "escala.notaCuadro": "The work is shown at real scale next to an adult 1.70 m tall.",
      "escala.notaEscultura": "Height of the piece at scale next to a person 1.70 m tall.",
      "escala.elegi": "Choose a size to see the work next to a person 1.70 m tall.",
      "escala.diametro": "Diameter",
      "escultura.alturaEn": "Height in",
      "escultura.entre": "From",
      "escultura.peso": "Estimated weight: approx. {n} kg",
      "escultura.material": "Material",
      "escultura.tejido": "Cement, fibreglass and clay include a metal mesh inside.",
      "escultura.cemento": "Hollow cement",
      "escultura.fibra": "Fibreglass",
      "escultura.arcilla": "Clay with cement",
      "escultura.chapa": "Sheet steel",
      "escultura.chatarra": "Scrap-metal objects",
      "escultura.hierroNota": "Welded pieces, with rust-proof treatment.",
      "escultura.tipo": "Type of sculpture",
      "escultura.elegiTipo": "Choose the type...",
      "escultura.busto": "Bust",
      "escultura.medio": "Half body",
      "escultura.figura": "Full figure",
      "escultura.relieve": "Relief",
      "escultura.animal": "Animal or other non-human figure",
      "escultura.abstracto": "Abstract",
      "escultura.objeto": "Object",
      "escultura.otro": "Other",
      "escultura.elegiMaterial": "Choose the material...",
      "wizard.paso": "Step {n} of {total}",
      "wizard.paso1": "Step 1",
      "wizard.trabajo.pregunta": "What kind of work are you looking for?",
      "wizard.trabajo.ayuda": "Choose the type of work. In the next steps we will put the order together with the options for each one.",
      "trabajo.oleo": "Oil painting",
      "trabajo.oleo.text": "Oil paint: deep colours and a long-lasting finish.",
      "trabajo.acrilico": "Acrylic",
      "trabajo.acrilico.text": "Acrylic paint: vivid colours and a faster drying time.",
      "trabajo.carbonilla": "Pencil / Charcoal",
      "trabajo.carbonilla.text": "Pencil or charcoal drawing, in black and white or in colour.",
      "trabajo.escultura": "Sculpture",
      "trabajo.escultura.text": "A piece modelled by hand in three dimensions. Foundry work is not included.",
      "trabajo.mural": "Mural",
      "trabajo.mural.text": "A large work painted directly on the wall. The price is agreed according to the wall.",
      "trabajo.restauracion": "Restoration",
      "trabajo.restauracion.text": "Recover or improve a damaged photo or artwork.",
      "wizard.estilo.pregunta": "Which style do you prefer?",
      "wizard.estilo.preguntaCarbonilla": "Which drawing style do you prefer?",
      "wizard.estilo.ayuda": "Style is how the work is painted: more natural, with more detail, with texture, in a single colour (monochrome) or abstract.",
      "wizard.estilo.ayudaCarbonilla": "Style is the finish of the drawing: more defined, highly detailed, a loose sketch or a freer interpretation.",
      "wizard.tema.pregunta": "What is the subject of the work?",
      "wizard.sujetos.pregunta": "How many people are in the portrait?",
      "wizard.fondo.pregunta": "How would you like the background?",
      "wizard.color.pregunta": "Is the drawing in black and white or in colour?",
      "wizard.forma.pregunta": "Which canvas format would you like?",
      "wizard.tamano.pregunta": "What size would you like?",
      "wizard.tamano.ayuda": "On the left you see a person 1.70 m tall to give you a sense of the real size. If it is not on the list, choose a custom size.",
      "wizard.tamano.ayudaCarbonilla": "These are drawing-paper sizes (A-series). On the left you see a person 1.70 m tall for comparison.",
      "wizard.marco.pregunta": "Would you like it framed?",
      "wizard.tipoEscultura.pregunta": "What type of sculpture are you looking for?",
      "wizard.tipoEscultura.ayuda": "A bust is the head and upper chest. Half body goes down to the waist. A full figure is the whole body. Relief is forms that stand out from a flat background. If it is an animal, an object or something abstract, the price is confirmed with the artist.",
      "wizard.material.pregunta": "What material would you like the piece in?",
      "wizard.material.ayuda": "Cement, fibreglass and clay have an iron structure and a metal mesh inside. Sheet steel and scrap metal are welded pieces, with rust-proof treatment. We do not offer bronze or other metal casting.",
      "wizard.altura.pregunta": "What height would you like for the piece?",
      "wizard.altura.ayuda": "Height is measured from the base to the highest point. Beside it you see a person 1.70 m tall for comparison. You can enter the size in centimetres, metres or inches.",
      "wizard.estiloMural.pregunta": "What style would you like for the mural?",
      "wizard.tamanoMural.pregunta": "How large is the wall?",
      "wizard.tamanoMural.ayuda": "Enter the width and height. You can switch the unit to centimetres, metres or inches. If the wall is high, scaffolding may be needed. The final price is given on request.",
      "wizard.restauracion.pregunta": "What kind of restoration do you need?",
      "wizard.fotos.pregunta": "Do you have a reference photo?",
      "wizard.fotos.preguntaRest": "Do you have a photo of the work?",
      "wizard.datos.pregunta": "Your details for the order",
      "wizard.resumen.pregunta": "Review your order",
      "wizard.resumen.ayuda": "This is the summary and the estimated price, with VAT included. Sending it prepares a message with all the details so you can confirm.",
      "wizard.sugerencias": "Other options for your quote",
      "wizard.actual": "Current",
      "wizard.economica": "More affordable",
      "mural.tamano": "Size",
      "mural.ancho": "Width",
      "mural.alto": "Height",
      "cotiz.unidad": "Unit of measurement",
      "cotiz.tamano": "Size",
      "cotiz.ancho": "Width",
      "cotiz.alto": "Height",
      "cotiz.personalizado": "Custom",
      "album.retrato": "Portraits",
      "album.paisaje": "Landscapes",
      "album.escultura": "Sculptures",
      "album.mural": "Murals",
      "album.abstracto": "Abstract",
      "album.otros": "Other",
      "album.volver": "Back to the library",
      "pais.PY": "Paraguay",
      "pais.AR": "Argentina",
      "pais.BR": "Brazil",
      "pais.UY": "Uruguay",
      "pais.CL": "Chile",
      "pais.BO": "Bolivia",
      "pais.US": "United States",
      "pais.ES": "Spain",
      "pais.FR": "France",
      "pais.IT": "Italy",
      "pais.DE": "Germany",
      "pais.PT": "Portugal",
      "pais.GB": "United Kingdom",
      "pais.MX": "Mexico",
      "pais.CO": "Colombia",
      "pais.PE": "Peru",
      "pais.CA": "Canada",
      "pais.CN": "China",
      "pais.JP": "Japan",
      "pais.KR": "South Korea",
      "pais.IN": "India",
      "pais.RU": "Russia",
      "pais.EC": "Ecuador",
      "pais.CH": "Switzerland",
      "pais.AU": "Australia",
    },
    pt: {
      "nav.inicio": "Início",
      "nav.cotizar": "Orçar",
      "nav.cursos": "Cursos",
      "locale.idioma": "Idioma",
      "locale.pais": "País",
      "comun.y": "e",
      "comun.cambiar": "Alterar",
      "comun.atras": "Voltar",
      "comun.siguiente": "Seguinte",
      "comun.cerrar": "Fechar",
      "comun.enviar": "Enviar pedido",
      "comun.compartir": "Partilhar",
      "unidad.titulo": "Unidade de medida",
      "unidad.cm": "CM",
      "unidad.in": "IN",
      "unidad.m": "M",
      "unidad.centimetros": "centímetros",
      "unidad.pulgadas": "polegadas",
      "unidad.metros": "metros",
      "precio.consultar": "A consultar",
      "precio.consultarArtista": "A consultar com o artista",
      "precio.muralDetalle": "O mural é orçado de forma personalizada segundo a parede, o acesso e o nível de detalhe.",
      "precio.artistaDetalle": "Se não for uma figura humana (busto, meio corpo, figura ou relevo), o valor é consultado diretamente com o artista.",
      "precio.sinLista": "Este estilo não tem um preço fixo na lista atual; o valor é acordado segundo a obra.",
      "precio.ivaEnvio": "IVA incluído. Envio à parte.",
      "precio.iva": "IVA incluído",
      "fx.nota": "Conversão aproximada segundo a cotação do dia; o preço final confirma-se em guaranis",
      "escala.persona": "Pessoa de 1,70 m",
      "escala.notaCuadro": "A obra é mostrada à escala real junto de uma pessoa adulta de 1,70 m.",
      "escala.notaEscultura": "Altura da peça à escala junto de uma pessoa de 1,70 m.",
      "escala.elegi": "Escolha um tamanho para ver a obra ao lado de uma pessoa de 1,70 m.",
      "escala.diametro": "Diâmetro",
      "escultura.alturaEn": "Altura em",
      "escultura.entre": "Entre",
      "escultura.peso": "Peso estimado: aprox. {n} kg",
      "escultura.material": "Material",
      "escultura.tejido": "O cimento, a fibra de vidro e a argila levam tecido metálico no interior.",
      "escultura.cemento": "Cimento oco",
      "escultura.fibra": "Fibra de vidro",
      "escultura.arcilla": "Argila com cimento",
      "escultura.chapa": "Chapa de ferro",
      "escultura.chatarra": "Objetos de sucata",
      "escultura.hierroNota": "Peças soldadas, com tratamento antiferrugem.",
      "escultura.tipo": "Tipo de escultura",
      "escultura.elegiTipo": "Selecione o tipo...",
      "escultura.busto": "Busto",
      "escultura.medio": "Meio corpo",
      "escultura.figura": "Figura de corpo inteiro",
      "escultura.relieve": "Relevo",
      "escultura.animal": "Animal ou outra figura não humana",
      "escultura.abstracto": "Abstrato",
      "escultura.objeto": "Objeto",
      "escultura.otro": "Outro",
      "escultura.elegiMaterial": "Selecione o material...",
      "wizard.paso": "Passo {n} de {total}",
      "wizard.paso1": "Passo 1",
      "wizard.trabajo.pregunta": "Que tipo de trabalho procura?",
      "wizard.trabajo.ayuda": "Escolha o tipo de obra. Nos passos seguintes montamos o pedido com as opções de cada trabalho.",
      "trabajo.oleo": "Quadro a óleo",
      "trabajo.oleo.text": "Pintura a óleo: cores profundas e um acabamento que dura muitos anos.",
      "trabajo.acrilico": "Acrílico",
      "trabajo.acrilico.text": "Pintura acrílica: cores vivas e secagem mais rápida.",
      "trabajo.carbonilla": "Lápis / Carvão",
      "trabajo.carbonilla.text": "Desenho a lápis ou carvão, a preto e branco ou a cores.",
      "trabajo.escultura": "Escultura",
      "trabajo.escultura.text": "Uma peça modelada à mão em três dimensões. Não inclui fundição.",
      "trabajo.mural": "Mural",
      "trabajo.mural.text": "Uma obra grande pintada diretamente na parede. O valor é acordado segundo a parede.",
      "trabajo.restauracion": "Restauro",
      "trabajo.restauracion.text": "Recuperar ou melhorar uma foto ou obra danificada.",
      "wizard.estilo.pregunta": "Que estilo prefere?",
      "wizard.estilo.preguntaCarbonilla": "Que estilo de desenho prefere?",
      "wizard.estilo.ayuda": "O estilo é a forma de pintar: mais natural, com mais detalhe, com textura, numa só cor (monocromático) ou abstrato.",
      "wizard.estilo.ayudaCarbonilla": "O estilo é o acabamento do desenho: mais definido, de grande detalhe, um esboço solto ou uma interpretação mais livre.",
      "wizard.tema.pregunta": "Qual é o tema da obra?",
      "wizard.sujetos.pregunta": "Quantas pessoas vão no retrato?",
      "wizard.fondo.pregunta": "Como quer o fundo?",
      "wizard.color.pregunta": "O desenho é a preto e branco ou a cores?",
      "wizard.forma.pregunta": "Que formato de tela prefere?",
      "wizard.tamano.pregunta": "Que tamanho prefere?",
      "wizard.tamano.ayuda": "À esquerda vê uma pessoa de 1,70 m para ter ideia do tamanho real. Se não estiver na lista, escolha uma medida personalizada.",
      "wizard.tamano.ayudaCarbonilla": "As medidas são de papel de desenho (tamanhos tipo A). À esquerda vê uma pessoa de 1,70 m para comparar.",
      "wizard.marco.pregunta": "Quer com moldura?",
      "wizard.tipoEscultura.pregunta": "Que tipo de escultura procura?",
      "wizard.tipoEscultura.ayuda": "O busto é a cabeça e parte do peito. O meio corpo chega à cintura. A figura completa é de corpo inteiro. O relevo são formas que saem de um fundo. Se for um animal, um objeto ou algo abstrato, o valor consulta-se com o artista.",
      "wizard.material.pregunta": "De que material quer a peça?",
      "wizard.material.ayuda": "O cimento, a fibra de vidro e a argila levam estrutura de ferro e malha metálica no interior. A chapa e a sucata são peças soldadas, com tratamento antiferrugem. Não fazemos fundição em bronze nem noutros metais.",
      "wizard.altura.pregunta": "Que altura quer para a peça?",
      "wizard.altura.ayuda": "A altura mede-se da base ao ponto mais alto. Ao lado vê uma pessoa de 1,70 m para comparar. Pode indicar a medida em centímetros, metros ou polegadas.",
      "wizard.estiloMural.pregunta": "Que estilo quer para o mural?",
      "wizard.tamanoMural.pregunta": "Que tamanho tem a parede?",
      "wizard.tamanoMural.ayuda": "Indique a largura e a altura. Pode mudar a unidade para centímetros, metros ou polegadas. Se a parede for alta, pode ser preciso andaime. O valor final consulta-se.",
      "wizard.restauracion.pregunta": "Que tipo de restauro precisa?",
      "wizard.fotos.pregunta": "Tem uma foto de referência?",
      "wizard.fotos.preguntaRest": "Tem uma foto da obra?",
      "wizard.datos.pregunta": "Os seus dados para o pedido",
      "wizard.resumen.pregunta": "Reveja o seu pedido",
      "wizard.resumen.ayuda": "Este é o resumo e o preço estimado, com IVA incluído. Ao enviar, monta-se a mensagem com todos os detalhes para confirmar.",
      "wizard.sugerencias": "Outras opções para o seu orçamento",
      "wizard.actual": "Atual",
      "wizard.economica": "Mais económica",
      "mural.tamano": "Tamanho",
      "mural.ancho": "Largura",
      "mural.alto": "Altura",
      "cotiz.unidad": "Unidade de medida",
      "cotiz.tamano": "Tamanho",
      "cotiz.ancho": "Largura",
      "cotiz.alto": "Altura",
      "cotiz.personalizado": "Personalizado",
      "album.retrato": "Retratos",
      "album.paisaje": "Paisagens",
      "album.escultura": "Esculturas",
      "album.mural": "Murais",
      "album.abstracto": "Abstratos",
      "album.otros": "Outros",
      "album.volver": "Voltar à biblioteca",
      "pais.PY": "Paraguai",
      "pais.AR": "Argentina",
      "pais.BR": "Brasil",
      "pais.UY": "Uruguai",
      "pais.CL": "Chile",
      "pais.BO": "Bolívia",
      "pais.US": "Estados Unidos",
      "pais.ES": "Espanha",
      "pais.FR": "França",
      "pais.IT": "Itália",
      "pais.DE": "Alemanha",
      "pais.PT": "Portugal",
      "pais.GB": "Reino Unido",
      "pais.MX": "México",
      "pais.CO": "Colômbia",
      "pais.PE": "Peru",
      "pais.CA": "Canadá",
      "pais.CN": "China",
      "pais.JP": "Japão",
      "pais.KR": "Coreia do Sul",
      "pais.IN": "Índia",
      "pais.RU": "Rússia",
      "pais.EC": "Equador",
      "pais.CH": "Suíça",
      "pais.AU": "Austrália",
    },
    fr: {
      "nav.inicio": "Accueil",
      "nav.cotizar": "Devis",
      "nav.cursos": "Cours",
      "locale.idioma": "Langue",
      "locale.pais": "Pays",
      "comun.y": "et",
      "comun.cambiar": "Modifier",
      "comun.atras": "Retour",
      "comun.siguiente": "Suivant",
      "comun.cerrar": "Fermer",
      "comun.enviar": "Envoyer la commande",
      "comun.compartir": "Partager",
      "unidad.titulo": "Unité de mesure",
      "unidad.cm": "CM",
      "unidad.in": "IN",
      "unidad.m": "M",
      "unidad.centimetros": "centimètres",
      "unidad.pulgadas": "pouces",
      "unidad.metros": "mètres",
      "precio.consultar": "Sur demande",
      "precio.consultarArtista": "À confirmer avec l'artiste",
      "precio.muralDetalle": "La fresque est tarifée selon le mur, l'accès et le niveau de détail.",
      "precio.artistaDetalle": "S'il ne s'agit pas d'une figure humaine (buste, mi-corps, figure ou relief), le tarif se confirme directement avec l'artiste.",
      "precio.sinLista": "Ce style n'a pas de prix fixe dans la liste actuelle ; la valeur se convient selon l'œuvre.",
      "precio.ivaEnvio": "TVA incluse. Livraison en sus.",
      "precio.iva": "TVA incluse",
      "fx.nota": "Conversion approximative au cours du jour ; le prix final se confirme en guaranís",
      "escala.persona": "Personne de 1,70 m",
      "escala.notaCuadro": "L'œuvre est montrée à l'échelle réelle à côté d'un adulte de 1,70 m.",
      "escala.notaEscultura": "Hauteur de la pièce à l'échelle à côté d'une personne de 1,70 m.",
      "escala.elegi": "Choisissez un format pour voir l'œuvre à côté d'une personne de 1,70 m.",
      "escala.diametro": "Diamètre",
      "escultura.alturaEn": "Hauteur en",
      "escultura.entre": "Entre",
      "escultura.peso": "Poids estimé : env. {n} kg",
      "escultura.material": "Matériau",
      "escultura.tejido": "Le ciment, la fibre de verre et l'argile comportent un treillis métallique à l'intérieur.",
      "escultura.cemento": "Ciment creux",
      "escultura.fibra": "Fibre de verre",
      "escultura.arcilla": "Argile avec ciment",
      "escultura.chapa": "Tôle de fer",
      "escultura.chatarra": "Objets de ferraille",
      "escultura.hierroNota": "Pièces soudées, avec traitement antirouille.",
      "escultura.tipo": "Type de sculpture",
      "escultura.elegiTipo": "Choisissez le type...",
      "escultura.busto": "Buste",
      "escultura.medio": "Mi-corps",
      "escultura.figura": "Figure en pied",
      "escultura.relieve": "Relief",
      "escultura.animal": "Animal ou autre figure non humaine",
      "escultura.abstracto": "Abstrait",
      "escultura.objeto": "Objet",
      "escultura.otro": "Autre",
      "escultura.elegiMaterial": "Choisissez le matériau...",
      "wizard.paso": "Étape {n} sur {total}",
      "wizard.paso1": "Étape 1",
      "wizard.trabajo.pregunta": "Quel type de travail recherchez-vous ?",
      "wizard.trabajo.ayuda": "Choisissez le type d'œuvre. Aux étapes suivantes, nous composerons la commande avec les options de chaque travail.",
      "trabajo.oleo": "Tableau à l'huile",
      "trabajo.oleo.text": "Peinture à l'huile : couleurs profondes et un fini très durable.",
      "trabajo.acrilico": "Acrylique",
      "trabajo.acrilico.text": "Peinture acrylique : couleurs vives et séchage plus rapide.",
      "trabajo.carbonilla": "Crayon / Fusain",
      "trabajo.carbonilla.text": "Dessin au crayon ou au fusain, en noir et blanc ou en couleur.",
      "trabajo.escultura": "Sculpture",
      "trabajo.escultura.text": "Une pièce modelée à la main en trois dimensions. La fonderie n'est pas incluse.",
      "trabajo.mural": "Fresque",
      "trabajo.mural.text": "Une grande œuvre peinte directement sur le mur. Le tarif se convient selon le mur.",
      "trabajo.restauracion": "Restauration",
      "trabajo.restauracion.text": "Récupérer ou améliorer une photo ou une œuvre abîmée.",
      "wizard.estilo.pregunta": "Quel style préférez-vous ?",
      "wizard.estilo.preguntaCarbonilla": "Quel style de dessin préférez-vous ?",
      "wizard.estilo.ayuda": "Le style est la manière de peindre : plus naturel, plus détaillé, avec de la texture, en une seule couleur (monochrome) ou abstrait.",
      "wizard.estilo.ayudaCarbonilla": "Le style est la finition du dessin : plus défini, très détaillé, une esquisse libre ou une interprétation plus ouverte.",
      "wizard.tema.pregunta": "Quel est le sujet de l'œuvre ?",
      "wizard.sujetos.pregunta": "Combien de personnes figurent sur le portrait ?",
      "wizard.fondo.pregunta": "Comment souhaitez-vous le fond ?",
      "wizard.color.pregunta": "Le dessin est-il en noir et blanc ou en couleur ?",
      "wizard.forma.pregunta": "Quel format de toile souhaitez-vous ?",
      "wizard.tamano.pregunta": "Quelle taille souhaitez-vous ?",
      "wizard.tamano.ayuda": "À gauche, vous voyez une personne de 1,70 m pour vous donner une idée de la taille réelle. Si elle n'est pas dans la liste, choisissez une mesure personnalisée.",
      "wizard.tamano.ayudaCarbonilla": "Les mesures sont celles du papier à dessin (formats A). À gauche, une personne de 1,70 m pour comparer.",
      "wizard.marco.pregunta": "Le souhaitez-vous encadré ?",
      "wizard.tipoEscultura.pregunta": "Quel type de sculpture recherchez-vous ?",
      "wizard.tipoEscultura.ayuda": "Le buste est la tête et le haut du torse. Le mi-corps va jusqu'à la taille. La figure en pied est le corps entier. Le relief, ce sont des formes qui se détachent d'un fond. S'il s'agit d'un animal, d'un objet ou d'une forme abstraite, le tarif se confirme avec l'artiste.",
      "wizard.material.pregunta": "Dans quel matériau souhaitez-vous la pièce ?",
      "wizard.material.ayuda": "Le ciment, la fibre de verre et l'argile ont une structure en fer et un treillis métallique à l'intérieur. La tôle et la ferraille sont des pièces soudées, avec traitement antirouille. Nous ne proposons pas de fonte en bronze ni en d'autres métaux.",
      "wizard.altura.pregunta": "Quelle hauteur souhaitez-vous pour la pièce ?",
      "wizard.altura.ayuda": "La hauteur se mesure de la base au point le plus haut. À côté, vous voyez une personne de 1,70 m pour comparer. Vous pouvez indiquer la mesure en centimètres, mètres ou pouces.",
      "wizard.estiloMural.pregunta": "Quel style souhaitez-vous pour la fresque ?",
      "wizard.tamanoMural.pregunta": "Quelle est la taille du mur ?",
      "wizard.tamanoMural.ayuda": "Indiquez la largeur et la hauteur. Vous pouvez changer l'unité en centimètres, mètres ou pouces. Si le mur est haut, un échafaudage peut être nécessaire. Le tarif final se donne sur demande.",
      "wizard.restauracion.pregunta": "Quel type de restauration vous faut-il ?",
      "wizard.fotos.pregunta": "Avez-vous une photo de référence ?",
      "wizard.fotos.preguntaRest": "Avez-vous une photo de l'œuvre ?",
      "wizard.datos.pregunta": "Vos informations pour la commande",
      "wizard.resumen.pregunta": "Vérifiez votre commande",
      "wizard.resumen.ayuda": "Voici le récapitulatif et le prix estimé, TVA incluse. L'envoi prépare un message avec tous les détails pour confirmer.",
      "wizard.sugerencias": "Autres options pour votre devis",
      "wizard.actual": "Actuel",
      "wizard.economica": "Plus économique",
      "mural.tamano": "Taille",
      "mural.ancho": "Largeur",
      "mural.alto": "Hauteur",
      "cotiz.unidad": "Unité de mesure",
      "cotiz.tamano": "Taille",
      "cotiz.ancho": "Largeur",
      "cotiz.alto": "Hauteur",
      "cotiz.personalizado": "Personnalisé",
      "album.retrato": "Portraits",
      "album.paisaje": "Paysages",
      "album.escultura": "Sculptures",
      "album.mural": "Fresques",
      "album.abstracto": "Abstrait",
      "album.otros": "Autres",
      "album.volver": "Retour à la bibliothèque",
      "pais.PY": "Paraguay",
      "pais.AR": "Argentine",
      "pais.BR": "Brésil",
      "pais.UY": "Uruguay",
      "pais.CL": "Chili",
      "pais.BO": "Bolivie",
      "pais.US": "États-Unis",
      "pais.ES": "Espagne",
      "pais.FR": "France",
      "pais.IT": "Italie",
      "pais.DE": "Allemagne",
      "pais.PT": "Portugal",
      "pais.GB": "Royaume-Uni",
      "pais.MX": "Mexique",
      "pais.CO": "Colombie",
      "pais.PE": "Pérou",
      "pais.CA": "Canada",
      "pais.CN": "Chine",
      "pais.JP": "Japon",
      "pais.KR": "Corée du Sud",
      "pais.IN": "Inde",
      "pais.RU": "Russie",
      "pais.EC": "Équateur",
      "pais.CH": "Suisse",
      "pais.AU": "Australie",
    },
    it: {
      "nav.inicio": "Inizio",
      "nav.cotizar": "Preventivo",
      "nav.cursos": "Corsi",
      "locale.idioma": "Lingua",
      "locale.pais": "Paese",
      "comun.y": "e",
      "comun.cambiar": "Modifica",
      "comun.atras": "Indietro",
      "comun.siguiente": "Avanti",
      "comun.cerrar": "Chiudi",
      "comun.enviar": "Invia ordine",
      "comun.compartir": "Condividi",
      "unidad.titulo": "Unità di misura",
      "unidad.cm": "CM",
      "unidad.in": "IN",
      "unidad.m": "M",
      "unidad.centimetros": "centimetri",
      "unidad.pulgadas": "pollici",
      "unidad.metros": "metri",
      "precio.consultar": "Da concordare",
      "precio.consultarArtista": "Da concordare con l'artista",
      "precio.muralDetalle": "Il murale viene preventivato in modo personalizzato secondo la parete, l'accesso e il livello di dettaglio.",
      "precio.artistaDetalle": "Se non è una figura umana (busto, mezzo busto, figura o rilievo), il valore si consulta direttamente con l'artista.",
      "precio.sinLista": "Questo stile non ha un prezzo fisso nell'elenco attuale; il valore si concorda secondo l'opera.",
      "precio.ivaEnvio": "IVA inclusa. Spedizione esclusa.",
      "precio.iva": "IVA inclusa",
      "fx.nota": "Conversione approssimativa secondo il cambio del giorno; il prezzo finale si conferma in guaraní",
      "escala.persona": "Persona di 1,70 m",
      "escala.notaCuadro": "L'opera è mostrata in scala reale accanto a un adulto di 1,70 m.",
      "escala.notaEscultura": "Altezza del pezzo in scala accanto a una persona di 1,70 m.",
      "escala.elegi": "Scegli una misura per vedere l'opera accanto a una persona di 1,70 m.",
      "escala.diametro": "Diametro",
      "escultura.alturaEn": "Altezza in",
      "escultura.entre": "Tra",
      "escultura.peso": "Peso stimato: circa {n} kg",
      "escultura.material": "Materiale",
      "escultura.tejido": "Il cemento, la vetroresina e l'argilla hanno una rete metallica all'interno.",
      "escultura.cemento": "Cemento cavo",
      "escultura.fibra": "Vetroresina",
      "escultura.arcilla": "Argilla con cemento",
      "escultura.chapa": "Lamiera di ferro",
      "escultura.chatarra": "Oggetti di rottame",
      "escultura.hierroNota": "Pezzi saldati, con trattamento antiruggine.",
      "escultura.tipo": "Tipo di scultura",
      "escultura.elegiTipo": "Seleziona il tipo...",
      "escultura.busto": "Busto",
      "escultura.medio": "Mezzo busto",
      "escultura.figura": "Figura intera",
      "escultura.relieve": "Rilievo",
      "escultura.animal": "Animale o altra figura non umana",
      "escultura.abstracto": "Astratto",
      "escultura.objeto": "Oggetto",
      "escultura.otro": "Altro",
      "escultura.elegiMaterial": "Seleziona il materiale...",
      "wizard.paso": "Passo {n} di {total}",
      "wizard.paso1": "Passo 1",
      "wizard.trabajo.pregunta": "Che tipo di lavoro stai cercando?",
      "wizard.trabajo.ayuda": "Scegli il tipo di opera. Nei passi successivi prepariamo l'ordine con le opzioni di ciascun lavoro.",
      "trabajo.oleo": "Quadro a olio",
      "trabajo.oleo.text": "Pittura a olio: colori profondi e una finitura molto duratura.",
      "trabajo.acrilico": "Acrilico",
      "trabajo.acrilico.text": "Pittura acrilica: colori vivaci e asciugatura più rapida.",
      "trabajo.carbonilla": "Matita / Carboncino",
      "trabajo.carbonilla.text": "Disegno a matita o carboncino, in bianco e nero o a colori.",
      "trabajo.escultura": "Scultura",
      "trabajo.escultura.text": "Un pezzo modellato a mano in tre dimensioni. Non include la fusione.",
      "trabajo.mural": "Murale",
      "trabajo.mural.text": "Un'opera grande dipinta direttamente sulla parete. Il valore si concorda secondo la parete.",
      "trabajo.restauracion": "Restauro",
      "trabajo.restauracion.text": "Recuperare o migliorare una foto o un'opera danneggiata.",
      "wizard.estilo.pregunta": "Quale stile preferisci?",
      "wizard.estilo.preguntaCarbonilla": "Quale stile di disegno preferisci?",
      "wizard.estilo.ayuda": "Lo stile è il modo di dipingere: più naturale, con più dettaglio, con texture, in un solo colore (monocromatico) o astratto.",
      "wizard.estilo.ayudaCarbonilla": "Lo stile è la finitura del disegno: più definito, di grande dettaglio, uno schizzo libero o un'interpretazione più aperta.",
      "wizard.tema.pregunta": "Qual è il tema dell'opera?",
      "wizard.sujetos.pregunta": "Quante persone ci sono nel ritratto?",
      "wizard.fondo.pregunta": "Come vuoi lo sfondo?",
      "wizard.color.pregunta": "Il disegno è in bianco e nero o a colori?",
      "wizard.forma.pregunta": "Quale formato di tela preferisci?",
      "wizard.tamano.pregunta": "Che misura preferisci?",
      "wizard.tamano.ayuda": "A sinistra vedi una persona di 1,70 m per farti un'idea della misura reale. Se non è in elenco, scegli una misura personalizzata.",
      "wizard.tamano.ayudaCarbonilla": "Le misure sono di carta da disegno (formati A). A sinistra vedi una persona di 1,70 m per confrontare.",
      "wizard.marco.pregunta": "Lo vuoi con cornice?",
      "wizard.tipoEscultura.pregunta": "Che tipo di scultura stai cercando?",
      "wizard.tipoEscultura.ayuda": "Il busto è la testa e parte del petto. Il mezzo busto arriva alla vita. La figura intera è a corpo pieno. Il rilievo sono forme che sporgono da uno sfondo. Se è un animale, un oggetto o qualcosa di astratto, il valore si consulta con l'artista.",
      "wizard.material.pregunta": "In quale materiale vuoi il pezzo?",
      "wizard.material.ayuda": "Il cemento, la vetroresina e l'argilla hanno una struttura in ferro e una rete metallica all'interno. La lamiera e il rottame sono pezzi saldati, con trattamento antiruggine. Non facciamo fusioni in bronzo né in altri metalli.",
      "wizard.altura.pregunta": "Che altezza vuoi per il pezzo?",
      "wizard.altura.ayuda": "L'altezza si misura dalla base al punto più alto. Accanto vedi una persona di 1,70 m per confrontare. Puoi indicare la misura in centimetri, metri o pollici.",
      "wizard.estiloMural.pregunta": "Che stile vuoi per il murale?",
      "wizard.tamanoMural.pregunta": "Che misura ha la parete?",
      "wizard.tamanoMural.ayuda": "Indica la larghezza e l'altezza. Puoi cambiare l'unità in centimetri, metri o pollici. Se la parete è alta, può servire un'impalcatura. Il valore finale si consulta.",
      "wizard.restauracion.pregunta": "Che tipo di restauro ti serve?",
      "wizard.fotos.pregunta": "Hai una foto di riferimento?",
      "wizard.fotos.preguntaRest": "Hai una foto dell'opera?",
      "wizard.datos.pregunta": "I tuoi dati per l'ordine",
      "wizard.resumen.pregunta": "Controlla il tuo ordine",
      "wizard.resumen.ayuda": "Questo è il riepilogo e il prezzo stimato, IVA inclusa. All'invio si prepara il messaggio con tutti i dettagli per confermare.",
      "wizard.sugerencias": "Altre opzioni per il tuo preventivo",
      "wizard.actual": "Attuale",
      "wizard.economica": "Più economica",
      "mural.tamano": "Misura",
      "mural.ancho": "Larghezza",
      "mural.alto": "Altezza",
      "cotiz.unidad": "Unità di misura",
      "cotiz.tamano": "Misura",
      "cotiz.ancho": "Larghezza",
      "cotiz.alto": "Altezza",
      "cotiz.personalizado": "Personalizzato",
      "album.retrato": "Ritratti",
      "album.paisaje": "Paesaggi",
      "album.escultura": "Sculture",
      "album.mural": "Murali",
      "album.abstracto": "Astratti",
      "album.otros": "Altri",
      "album.volver": "Torna alla biblioteca",
      "pais.PY": "Paraguay",
      "pais.AR": "Argentina",
      "pais.BR": "Brasile",
      "pais.UY": "Uruguay",
      "pais.CL": "Cile",
      "pais.BO": "Bolivia",
      "pais.US": "Stati Uniti",
      "pais.ES": "Spagna",
      "pais.FR": "Francia",
      "pais.IT": "Italia",
      "pais.DE": "Germania",
      "pais.PT": "Portogallo",
      "pais.GB": "Regno Unito",
      "pais.MX": "Messico",
      "pais.CO": "Colombia",
      "pais.PE": "Perù",
      "pais.CA": "Canada",
      "pais.CN": "Cina",
      "pais.JP": "Giappone",
      "pais.KR": "Corea del Sud",
      "pais.IN": "India",
      "pais.RU": "Russia",
      "pais.EC": "Ecuador",
      "pais.CH": "Svizzera",
      "pais.AU": "Australia",
    },
    de: {
      "nav.inicio": "Start",
      "nav.cotizar": "Angebot",
      "nav.cursos": "Kurse",
      "locale.idioma": "Sprache",
      "locale.pais": "Land",
      "comun.y": "und",
      "comun.cambiar": "Ändern",
      "comun.atras": "Zurück",
      "comun.siguiente": "Weiter",
      "comun.cerrar": "Schließen",
      "comun.enviar": "Bestellung senden",
      "comun.compartir": "Teilen",
      "unidad.titulo": "Maßeinheit",
      "unidad.cm": "CM",
      "unidad.in": "IN",
      "unidad.m": "M",
      "unidad.centimetros": "Zentimeter",
      "unidad.pulgadas": "Zoll",
      "unidad.metros": "Meter",
      "precio.consultar": "Auf Anfrage",
      "precio.consultarArtista": "Mit dem Künstler abzustimmen",
      "precio.muralDetalle": "Das Wandbild wird individuell nach Wand, Zugang und Detailgrad kalkuliert.",
      "precio.artistaDetalle": "Handelt es sich nicht um eine menschliche Figur (Büste, Halbfigur, Ganzfigur oder Relief), wird der Preis direkt mit dem Künstler abgestimmt.",
      "precio.sinLista": "Dieser Stil hat in der aktuellen Liste keinen Festpreis; der Wert wird für das Werk vereinbart.",
      "precio.ivaEnvio": "MwSt. inklusive. Versand extra.",
      "precio.iva": "MwSt. inklusive",
      "fx.nota": "Ungefähre Umrechnung zum Tageskurs; der Endpreis wird in Guaraníes bestätigt",
      "escala.persona": "Person 1,70 m",
      "escala.notaCuadro": "Das Werk wird in echter Größe neben einer 1,70 m großen erwachsenen Person gezeigt.",
      "escala.notaEscultura": "Höhe des Stücks im Maßstab neben einer 1,70 m großen Person.",
      "escala.elegi": "Wähle ein Format, um das Werk neben einer 1,70 m großen Person zu sehen.",
      "escala.diametro": "Durchmesser",
      "escultura.alturaEn": "Höhe in",
      "escultura.entre": "Zwischen",
      "escultura.peso": "Geschätztes Gewicht: ca. {n} kg",
      "escultura.material": "Material",
      "escultura.tejido": "Zement, Glasfaser und Ton haben innen ein Metallgewebe.",
      "escultura.cemento": "Hohler Zement",
      "escultura.fibra": "Glasfaser",
      "escultura.arcilla": "Ton mit Zement",
      "escultura.chapa": "Eisenblech",
      "escultura.chatarra": "Schrottteile",
      "escultura.hierroNota": "Geschweißte Stücke mit Rostschutzbehandlung.",
      "escultura.tipo": "Art der Skulptur",
      "escultura.elegiTipo": "Art wählen...",
      "escultura.busto": "Büste",
      "escultura.medio": "Halbfigur",
      "escultura.figura": "Ganzfigur",
      "escultura.relieve": "Relief",
      "escultura.animal": "Tier oder andere nicht-menschliche Figur",
      "escultura.abstracto": "Abstrakt",
      "escultura.objeto": "Objekt",
      "escultura.otro": "Sonstiges",
      "escultura.elegiMaterial": "Material wählen...",
      "wizard.paso": "Schritt {n} von {total}",
      "wizard.paso1": "Schritt 1",
      "wizard.trabajo.pregunta": "Welche Art von Arbeit suchst du?",
      "wizard.trabajo.ayuda": "Wähle die Art des Werks. In den nächsten Schritten stellen wir die Bestellung mit den Optionen jeder Arbeit zusammen.",
      "trabajo.oleo": "Ölbild",
      "trabajo.oleo.text": "Ölmalerei: tiefe Farben und eine sehr langlebige Oberfläche.",
      "trabajo.acrilico": "Acryl",
      "trabajo.acrilico.text": "Acrylmalerei: kräftige Farben und schnellere Trocknung.",
      "trabajo.carbonilla": "Bleistift / Kohle",
      "trabajo.carbonilla.text": "Zeichnung mit Bleistift oder Kohle, in Schwarz-Weiß oder in Farbe.",
      "trabajo.escultura": "Skulptur",
      "trabajo.escultura.text": "Ein von Hand modelliertes dreidimensionales Stück. Kein Guss inbegriffen.",
      "trabajo.mural": "Wandbild",
      "trabajo.mural.text": "Ein großes Werk, das direkt auf die Wand gemalt wird. Der Preis wird nach der Wand vereinbart.",
      "trabajo.restauracion": "Restaurierung",
      "trabajo.restauracion.text": "Ein beschädigtes Foto oder Kunstwerk wiederherstellen oder verbessern.",
      "wizard.estilo.pregunta": "Welchen Stil bevorzugst du?",
      "wizard.estilo.preguntaCarbonilla": "Welchen Zeichenstil bevorzugst du?",
      "wizard.estilo.ayuda": "Der Stil ist die Art zu malen: natürlicher, mit mehr Detail, mit Struktur, in einer Farbe (monochrom) oder abstrakt.",
      "wizard.estilo.ayudaCarbonilla": "Der Stil ist die Ausführung der Zeichnung: klarer, sehr detailliert, eine lockere Skizze oder eine freiere Deutung.",
      "wizard.tema.pregunta": "Welches Thema hat das Werk?",
      "wizard.sujetos.pregunta": "Wie viele Personen sind im Porträt?",
      "wizard.fondo.pregunta": "Wie soll der Hintergrund sein?",
      "wizard.color.pregunta": "Ist die Zeichnung schwarz-weiß oder in Farbe?",
      "wizard.forma.pregunta": "Welches Leinwandformat möchtest du?",
      "wizard.tamano.pregunta": "Welche Größe möchtest du?",
      "wizard.tamano.ayuda": "Links siehst du eine 1,70 m große Person, um die echte Größe einzuschätzen. Steht sie nicht in der Liste, wähle ein eigenes Maß.",
      "wizard.tamano.ayudaCarbonilla": "Die Maße sind Zeichenpapierformate (A-Reihe). Links siehst du eine 1,70 m große Person zum Vergleich.",
      "wizard.marco.pregunta": "Möchtest du einen Rahmen?",
      "wizard.tipoEscultura.pregunta": "Welche Art von Skulptur suchst du?",
      "wizard.tipoEscultura.ayuda": "Eine Büste ist Kopf und oberer Brustkorb. Die Halbfigur reicht bis zur Taille. Die Ganzfigur ist der ganze Körper. Ein Relief sind Formen, die aus einem flachen Grund hervortreten. Handelt es sich um ein Tier, ein Objekt oder etwas Abstraktes, wird der Preis mit dem Künstler abgestimmt.",
      "wizard.material.pregunta": "Aus welchem Material soll das Stück sein?",
      "wizard.material.ayuda": "Zement, Glasfaser und Ton haben eine Eisenstruktur und innen ein Metallgewebe. Blech und Schrott sind geschweißte Stücke mit Rostschutzbehandlung. Wir bieten keinen Guss in Bronze oder anderen Metallen an.",
      "wizard.altura.pregunta": "Welche Höhe soll das Stück haben?",
      "wizard.altura.ayuda": "Die Höhe wird von der Basis bis zum höchsten Punkt gemessen. Daneben siehst du eine 1,70 m große Person zum Vergleich. Du kannst das Maß in Zentimetern, Metern oder Zoll angeben.",
      "wizard.estiloMural.pregunta": "Welchen Stil möchtest du für das Wandbild?",
      "wizard.tamanoMural.pregunta": "Wie groß ist die Wand?",
      "wizard.tamanoMural.ayuda": "Gib Breite und Höhe an. Du kannst die Einheit auf Zentimeter, Meter oder Zoll ändern. Ist die Wand hoch, kann ein Gerüst nötig sein. Der Endpreis erfolgt auf Anfrage.",
      "wizard.restauracion.pregunta": "Welche Art von Restaurierung brauchst du?",
      "wizard.fotos.pregunta": "Hast du ein Referenzfoto?",
      "wizard.fotos.preguntaRest": "Hast du ein Foto des Werks?",
      "wizard.datos.pregunta": "Deine Angaben für die Bestellung",
      "wizard.resumen.pregunta": "Prüfe deine Bestellung",
      "wizard.resumen.ayuda": "Das ist die Zusammenfassung und der geschätzte Preis, MwSt. inklusive. Beim Senden wird die Nachricht mit allen Angaben zum Bestätigen vorbereitet.",
      "wizard.sugerencias": "Weitere Optionen für dein Angebot",
      "wizard.actual": "Aktuell",
      "wizard.economica": "Günstiger",
      "mural.tamano": "Größe",
      "mural.ancho": "Breite",
      "mural.alto": "Höhe",
      "cotiz.unidad": "Maßeinheit",
      "cotiz.tamano": "Größe",
      "cotiz.ancho": "Breite",
      "cotiz.alto": "Höhe",
      "cotiz.personalizado": "Individuell",
      "album.retrato": "Porträts",
      "album.paisaje": "Landschaften",
      "album.escultura": "Skulpturen",
      "album.mural": "Wandbilder",
      "album.abstracto": "Abstrakt",
      "album.otros": "Weitere",
      "album.volver": "Zurück zur Bibliothek",
      "pais.PY": "Paraguay",
      "pais.AR": "Argentinien",
      "pais.BR": "Brasilien",
      "pais.UY": "Uruguay",
      "pais.CL": "Chile",
      "pais.BO": "Bolivien",
      "pais.US": "Vereinigte Staaten",
      "pais.ES": "Spanien",
      "pais.FR": "Frankreich",
      "pais.IT": "Italien",
      "pais.DE": "Deutschland",
      "pais.PT": "Portugal",
      "pais.GB": "Vereinigtes Königreich",
      "pais.MX": "Mexiko",
      "pais.CO": "Kolumbien",
      "pais.PE": "Peru",
      "pais.CA": "Kanada",
      "pais.CN": "China",
      "pais.JP": "Japan",
      "pais.KR": "Südkorea",
      "pais.IN": "Indien",
      "pais.RU": "Russland",
      "pais.EC": "Ecuador",
      "pais.CH": "Schweiz",
      "pais.AU": "Australien",
    },
  };

  let idioma = 'es';
  let pais = 'PY';
  let idiomaManual = false;

  function t(key, vars) {
    const pack = STRINGS[idioma] || STRINGS.es;
    let s = pack[key] != null ? pack[key] : (STRINGS.es[key] != null ? STRINGS.es[key] : key);
    if (vars) {
      Object.keys(vars).forEach((k) => { s = s.replaceAll('{' + k + '}', String(vars[k])); });
    }
    return s;
  }
  function locale() {
    return { es: 'es-PY', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR', it: 'it-IT', de: 'de-DE' }[idioma] || 'es-PY';
  }
  function paisInfo(id) { return PAISES.find((p) => p.id === (id || pais)) || PAISES[0]; }
  function rellenarSelects() {
    const pa = document.getElementById('selector-pais');
    const lista = document.getElementById('pais-lista');
    if (pa) {
      pa.replaceChildren();
      PAISES.forEach((p) => {
        const o = document.createElement('option');
        o.value = p.id; o.textContent = t('pais.' + p.id);
        pa.append(o);
      });
      pa.value = pais;
    }
    if (lista) {
      lista.replaceChildren();
      PAISES.forEach((p) => {
        const li = document.createElement('li');
        li.className = 'pais-opcion'; li.id = 'pais-op-' + p.id; li.setAttribute('role', 'option');
        li.dataset.pais = p.id; li.tabIndex = -1;
        const img = document.createElement('img');
        img.className = 'pais-flag'; img.alt = ''; img.width = 24; img.height = 18; img.loading = 'lazy';
        img.src = 'img/banderas/' + p.flag + '.png';
        const sp = document.createElement('span');
        sp.textContent = t('pais.' + p.id);
        li.append(img, sp);
        lista.append(li);
      });
    }
    pintarPais();
  }
  function pintarPais() {
    const info = paisInfo();
    const btn = document.getElementById('pais-btn');
    const flag = document.getElementById('pais-btn-flag');
    const cod = document.getElementById('pais-btn-codigo');
    if (flag) flag.src = 'img/banderas/' + info.flag + '.png';
    if (cod) cod.textContent = info.id;
    if (btn) btn.title = t('pais.' + info.id);
    const pa = document.getElementById('selector-pais');
    if (pa) pa.value = info.id;
    document.querySelectorAll('#pais-lista .pais-opcion').forEach((li) => {
      li.setAttribute('aria-selected', li.dataset.pais === info.id ? 'true' : 'false');
    });
  }
  function iniciarSelectorPais() {
    const btn = document.getElementById('pais-btn');
    const lista = document.getElementById('pais-lista');
    if (!btn || !lista || btn.dataset.listo) return;
    btn.dataset.listo = '1';
    const opciones = () => [...lista.querySelectorAll('.pais-opcion')];
    let activa = -1;
    const marcar = (i) => {
      const ops = opciones();
      if (!ops.length) return;
      activa = (i + ops.length) % ops.length;
      ops.forEach((o, k) => o.classList.toggle('activa', k === activa));
      lista.setAttribute('aria-activedescendant', ops[activa].id);
      ops[activa].scrollIntoView({ block: 'nearest' });
    };
    const abrir = () => {
      lista.hidden = false; btn.setAttribute('aria-expanded', 'true');
      const ops = opciones();
      marcar(Math.max(0, ops.findIndex((o) => o.dataset.pais === pais)));
      lista.focus({ preventScroll: true });
    };
    const cerrar = (volver) => {
      lista.hidden = true; btn.setAttribute('aria-expanded', 'false');
      lista.removeAttribute('aria-activedescendant');
      if (volver) btn.focus();
    };
    const elegir = (id) => { cerrar(true); if (id && id !== pais) setPais(id); };
    btn.addEventListener('click', () => (lista.hidden ? abrir() : cerrar(true)));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (lista.hidden) abrir(); }
    });
    lista.addEventListener('click', (e) => {
      const li = e.target.closest('.pais-opcion');
      if (li) elegir(li.dataset.pais);
    });
    lista.addEventListener('keydown', (e) => {
      const ops = opciones();
      if (e.key === 'ArrowDown') { e.preventDefault(); marcar(activa + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); marcar(activa - 1); }
      else if (e.key === 'Home') { e.preventDefault(); marcar(0); }
      else if (e.key === 'End') { e.preventDefault(); marcar(ops.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (ops[activa]) elegir(ops[activa].dataset.pais); }
      else if (e.key === 'Escape') { e.preventDefault(); cerrar(true); }
      else if (e.key === 'Tab') { cerrar(false); }
      else if (e.key.length === 1) {
        const q = e.key.toLowerCase();
        const k = ops.findIndex((o, n) => n > activa && o.textContent.trim().toLowerCase().startsWith(q));
        const k2 = k >= 0 ? k : ops.findIndex((o) => o.textContent.trim().toLowerCase().startsWith(q));
        if (k2 >= 0) marcar(k2);
      }
    });
    document.addEventListener('click', (e) => {
      if (!lista.hidden && !e.target.closest('#pais-picker')) cerrar(false);
    });
    const pa = document.getElementById('selector-pais');
    if (pa) pa.addEventListener('change', () => setPais(pa.value));
  }
  function aplicar() {
    document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : idioma;
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (!key) return;
      if (el.dataset.i18nAttr) el.setAttribute(el.dataset.i18nAttr, t(key));
      else el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
    });
    document.querySelectorAll('[data-i18n-option]').forEach((el) => {
      const key = el.getAttribute('data-i18n-option');
      if (!key) return;
      const vars = el.dataset.i18nVars ? (function(){ try { return JSON.parse(el.dataset.i18nVars); } catch(e) { return {}; } })() : undefined;
      el.textContent = t(key, vars);
    });
    if (typeof aplicarTextosSitio === 'function') { try { aplicarTextosSitio(); } catch (e) {} }
    if (typeof aplicarOpcionesTraducidas === 'function') { try { aplicarOpcionesTraducidas(); } catch (e) {} }
    if (typeof renderGallery === 'function') { try { renderGallery(); } catch (e) {} }
    rellenarSelects();
    const iva = document.getElementById('asistente-iva') || document.querySelector('.asistente-iva');
    if (iva) iva.textContent = t('precio.iva');
    const atras = document.getElementById('asistente-atras');
    if (atras) atras.textContent = t('comun.atras');
    const sig = document.getElementById('asistente-siguiente');
    if (sig) sig.textContent = t('comun.siguiente');
    const sugTit = document.querySelector('#asistente-sugerencias h3');
    if (sugTit) sugTit.textContent = t('wizard.sugerencias');
    const uniLab = document.querySelector('#step-unidad > label');
    if (uniLab) uniLab.textContent = t('unidad.titulo');
    if (typeof actualizarEtiquetasUnidad === 'function') actualizarEtiquetasUnidad();
    if (typeof updateSize === 'function') updateSize();
    if (typeof onTipoEsculturaChange === 'function') onTipoEsculturaChange();
    if (typeof actualizarPesoEscultura === 'function') actualizarPesoEscultura();
    if (window.AsistentePedido && !document.getElementById('asistente-pedido')?.hidden) {
      try { AsistentePedido.pintar(); } catch (e) {}
    }
    if (window.CotizadorVisual && typeof CotizadorVisual.refreshAll === 'function') { try { CotizadorVisual.refreshAll(); } catch (e) {} }
    if (typeof calcular === 'function') calcular();
  }

  function registrar(packs) {
    if (!packs || typeof packs !== 'object') return;
    Object.keys(packs).forEach((lang) => {
      if (!STRINGS[lang]) STRINGS[lang] = {};
      Object.assign(STRINGS[lang], packs[lang] || {});
    });
  }
  function textoSitio(key) {
    const sitio = global.sitioActual || (global.ESTUDIO_DEFAULTS && global.ESTUDIO_DEFAULTS.sitio) || { textos: {} };
    if (idioma && idioma !== 'es') {
      const pack = sitio.textosI18n && sitio.textosI18n[idioma];
      if (pack && Object.prototype.hasOwnProperty.call(pack, key)) {
        if (typeof pack[key] === 'string' && pack[key].trim()) return pack[key];
      } else {
        const defPack = global.ESTUDIO_DEFAULTS && global.ESTUDIO_DEFAULTS.sitio && global.ESTUDIO_DEFAULTS.sitio.textosI18n;
        const def = defPack && defPack[idioma] && defPack[idioma][key];
        if (typeof def === 'string' && def.trim()) return def;
      }
    }
    const es = sitio.textos && sitio.textos[key];
    if (typeof es === 'string') return es;
    const defEs = global.ESTUDIO_DEFAULTS && global.ESTUDIO_DEFAULTS.sitio && global.ESTUDIO_DEFAULTS.sitio.textos && global.ESTUDIO_DEFAULTS.sitio.textos[key];
    return typeof defEs === 'string' ? defEs : '';
  }
  function captionDe(item) {
    if (!item) return '';
    if (idioma !== 'es' && item.captions && typeof item.captions[idioma] === 'string' && item.captions[idioma].trim()) return item.captions[idioma];
    return typeof item.caption === 'string' ? item.caption : '';
  }
  function persist() {
    try {
      localStorage.setItem('estudio-idioma', idioma);
      localStorage.setItem('estudio-pais', pais);
      localStorage.setItem('estudio-idioma-manual', idiomaManual ? '1' : '0');
    } catch (e) {}
  }
  function setIdioma(code, opts) {
    if (!STRINGS[code]) return;
    idioma = code;
    if (opts && opts.manual) idiomaManual = true;
    persist();
    if (!(opts && opts.silent)) aplicar();
  }
  function setPais(code, opts) {
    const info = paisInfo(code);
    if (!info) return;
    pais = info.id;
    const mon = document.getElementById('moneda');
    if (mon) {
      if (![...mon.options].some((o) => o.value === info.moneda)) {
        const o = document.createElement('option');
        o.value = info.moneda; o.textContent = info.moneda;
        mon.append(o);
      }
      mon.value = info.moneda;
    }
    if (!(opts && opts.sinIdioma) && info.lang) {
      idioma = info.lang;
      idiomaManual = false;
    }
    persist();
    if (!(opts && opts.silent)) {
      aplicar();
      if (typeof calcular === 'function') { try { calcular(); } catch (e) {} }
      if (window.AsistentePedido && typeof AsistentePedido.actualizarBarra === 'function') {
        try { AsistentePedido.actualizarBarra(); } catch (e) {}
      }
    }
  }
  function iniciar() {
    try {
      const savedP = localStorage.getItem('estudio-pais');
      if (savedP && PAISES.some((p) => p.id === savedP)) pais = savedP;
    } catch (e) {}
    // El idioma lo define el país elegido (ya no hay selector de idioma).
    idioma = paisInfo().lang || 'es';
    idiomaManual = false;
    rellenarSelects();
    iniciarSelectorPais();
    const mon = document.getElementById('moneda');
    if (mon) mon.value = paisInfo().moneda;
    aplicar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else setTimeout(iniciar, 0);

  global.EstudioI18n = {
    t, locale, setIdioma, setPais, aplicar, iniciar, registrar, textoSitio, captionDe, PAISES, LANGS,
    get idioma() { return idioma; },
    get pais() { return pais; },
    get moneda() { return paisInfo().moneda; }
  };
})(window);

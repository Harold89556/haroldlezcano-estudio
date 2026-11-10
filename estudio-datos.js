'use strict';
window.ESTUDIO_FONDO_DEFAULT = 'https://i.postimg.cc/NMk5wJ1T/Picsart-26-04-28-08-03-58-251.jpg';
window.ESTUDIO_FONDO_OPACIDAD_DEFAULT = 0.45;
window.ESTUDIO_VENTANAS_OPACIDAD_DEFAULT = 0.55;
window.ESTUDIO_FONDO_DESENFOQUE_DEFAULT = 0;
window.ESTUDIO_GUIAS_DEFAULT = { items: {
  "estilo:Realista": { url: "img/guias/estilo-realista.webp", text: "Parecido natural, como una pintura fiel al modelo.", kind: "foto" },
  "estilo:Hiperrealista": { url: "img/guias/estilo-hiperrealista.webp", text: "Detalle extremo: piel, tela y brillos casi fotográficos.", kind: "foto" },
  "estilo:Espatulado": { url: "img/guias/espatulado.webp", text: "Pintura con espátula: textura y relieves visibles.", kind: "foto" },
  "estilo:Bocetado": { url: "img/guias/oleo-estilo-monocromatico.webp", text: "Bosquejo al óleo en un solo color, con luces y sombras (grisalla, bistre o ébauche), como se empezaba una pintura antes.", kind: "foto" },
  "estilo:Abstracto": { url: "img/guias/estilo-abstracto.webp", text: "Formas y colores libres, no una escena literal.", kind: "foto" },
  "estilo:Mural": { url: "img/guias/estilo-mural.webp", text: "Obra grande pintada directo sobre la pared.", kind: "foto" },
  "estilo:Escultura": { url: "img/guias/estilo-escultura.webp", text: "Pieza modelada a mano en tres dimensiones.", kind: "foto" },
  "estilo:Restauracion": { url: "img/guias/estilo-restauracion.webp", text: "Recuperar o mejorar una foto u obra dañada.", kind: "foto" },
  "tecnica:Oleo": { url: "img/guias/tecnica-oleo.webp", text: "Óleo: colores profundos y acabado duradero.", kind: "foto" },
  "tecnica:Acrilico": { url: "img/guias/acrilico.webp", text: "Acrílico: colores vivos y secado más rápido.", kind: "foto" },
  "tecnica:Carbonilla": { url: "img/guias/carbonilla.webp", text: "Lápiz o carbonilla: dibujo en blanco y negro o a color.", kind: "foto" },
  "tema:Retrato": { url: "img/guias/tema-retrato.webp", text: "Persona, pareja o animal como protagonistas.", kind: "foto" },
  "tema:Paisaje": { url: "img/guias/tema-paisaje.webp", text: "Naturaleza, cielo, río o vista exterior.", kind: "foto" },
  "tema:Bodegon": { url: "img/guias/tema-bodegon.webp", text: "Objetos o flores, naturaleza muerta.", kind: "foto" },
  "tema:Abstracto": { url: "img/guias/estilo-abstracto.webp", text: "Formas y colores libres, no una escena literal.", kind: "foto" },
  "fondo:simple": { url: "img/guias/fondo-simple.webp", text: "Fondo liso o suave, sin escena detrás.", kind: "foto" },
  "fondo:detallado": { url: "img/guias/fondo-detallado.webp", text: "Paisaje, arquitectura u otros detalles detrás.", kind: "foto" },
  "forma_lienzo:Estandar": { url: "img/guias/forma-estandar.webp", text: "Cuadrado o rectangular, el formato más habitual.", kind: "foto" },
  "forma_lienzo:Circular": { url: "img/guias/forma-circular.webp", text: "Lienzo redondo.", kind: "foto" },
  "forma_lienzo:Ovalado": { url: "img/guias/forma-ovalado.webp", text: "Lienzo ovalado.", kind: "foto" },
  "forma_lienzo:Hexagonal": { url: "img/guias/forma-hexagonal.webp", text: "Lienzo de seis lados.", kind: "foto" },
  "enmarcado:SinMarco": { url: "img/guias/marco-sin-marco.webp", text: "Sin marco; bordes listos para colgar.", kind: "foto" },
  "enmarcado:Estandar": { url: "img/guias/marco-estandar.webp", text: "Marco simple y discreto.", kind: "foto" },
  "enmarcado:Cajon": { url: "img/guias/marco-cajon.webp", text: "Marco tipo cajón, con profundidad.", kind: "foto" },
  "enmarcado:Clasico": { url: "img/guias/marco-clasico.webp", text: "Marco clásico, más ornamentado.", kind: "foto" },
  "enmarcado:SemiRelieve": { url: "img/guias/marco-semirelieve.webp", text: "Marco con relieve suave.", kind: "foto" },
  "enmarcado:GruesoRelieves": { url: "img/guias/marco-grueso.webp", text: "Marco grueso con relieves marcados.", kind: "foto" },
  "tipo_escultura:Busto": { url: "img/guias/escultura-busto.webp", text: "Cabeza y parte superior del torso.", kind: "foto" },
  "tipo_escultura:Medio cuerpo": { url: "img/guias/escultura-medio-cuerpo.webp", text: "De la cabeza hasta la cintura.", kind: "foto" },
  "tipo_escultura:Figura completa": { url: "img/guias/escultura-figura.webp", text: "Figura de cuerpo entero.", kind: "foto" },
  "tipo_escultura:Relieve": { url: "img/guias/escultura-relieve.webp", text: "Formas que sobresalen de un fondo plano.", kind: "foto" },
  "tipo_escultura:Animal": { url: "img/guias/escultura-animal.webp", text: "Una pieza de animal u otra figura no humana. El valor se consulta con el artista.", kind: "foto" },
  "tipo_escultura:Abstracto": { url: "img/guias/escultura-abstracto.webp", text: "Una forma abstracta o libre. El valor se consulta con el artista.", kind: "foto" },
  "tipo_escultura:Objeto": { url: "img/guias/escultura-objeto.webp", text: "Un objeto u otra pieza que no es figura humana. El valor se consulta con el artista.", kind: "foto" },
  "tipo_escultura:Otro": { url: "img/guias/escultura-otro.webp", text: "Otro tipo de escultura. El valor se consulta con el artista.", kind: "foto" },
  "material_escultura:Cemento": { url: "img/guias/escultura-material-cemento.webp", text: "Cemento hueco con estructura de hierro.", kind: "foto" },
  "material_escultura:Fibra": { url: "img/guias/escultura-material-fibra.webp", text: "Fibra de vidrio con estructura de hierro.", kind: "foto" },
  "material_escultura:Arcilla": { url: "img/guias/escultura-material-arcilla.webp", text: "Arcilla con cemento y estructura de hierro.", kind: "foto" },
  "material_escultura:Chapa": { url: "img/guias/escultura-material-chapa.webp", text: "Chapa de hierro cortada, doblada y soldada.", kind: "foto" },
  "material_escultura:Chatarra": { url: "img/guias/escultura-material-chatarra.webp", text: "Ensamble soldado de engranajes, cadenas u herramientas.", kind: "foto" },
  "sujetos:1": { url: "img/guias/sujetos-1.webp", text: "Una sola persona (ya incluida en el precio base).", kind: "foto" },
  "sujetos:2": { url: "img/guias/sujetos-2.webp", text: "Dos personas: se suma el valor de un sujeto extra.", kind: "foto" },
  "sujetos:mascota": { url: "img/guias/mascota.webp", text: "Sumá una mascota junto a la persona.", kind: "foto" },
  "estilo:Realista:Carbonilla": { url: "img/guias/carbonilla-estilo-realista.webp", text: "Dibujo terminado, con un parecido natural y sombras bien trabajadas.", kind: "foto" },
  "estilo:Hiperrealista:Carbonilla": { url: "img/guias/carbonilla-estilo-hiperrealista.webp", text: "Grafito de detalle extremo: piel, cabello y brillos casi fotográficos.", kind: "foto" },
  "estilo:Bocetado:Carbonilla": { url: "img/guias/carbonilla-estilo-bocetado.webp", text: "Boceto a carbonilla: trazo suelto, de estudio o apunte.", kind: "foto" },
  "estilo:Abstracto:Carbonilla": { url: "img/guias/carbonilla-estilo-abstracto.webp", text: "Formas y manchas en carbonilla o grafito, sin una escena literal.", kind: "foto" },
  "estilo:Realista:Acrilico": { url: "img/guias/acrilico-estilo-realista.webp", text: "Acrílico con un acabado natural, como una pintura fiel al modelo.", kind: "foto" },
  "estilo:Hiperrealista:Acrilico": { url: "img/guias/acrilico-estilo-hiperrealista.webp", text: "Acrílico de detalle extremo, casi fotográfico.", kind: "foto" },
  "estilo:Espatulado:Acrilico": { url: "img/guias/acrilico-estilo-espatulado.webp", text: "Acrílico con espátula: color y relieves bien visibles.", kind: "foto" },
  "estilo:Bocetado:Oleo": { url: "img/guias/oleo-estilo-monocromatico.webp", text: "Bosquejo al óleo en un solo color, con luces y sombras (grisalla, bistre o ébauche), como se empezaba una pintura antes.", kind: "foto" },
  "estilo:Bocetado:Acrilico": { url: "img/guias/acrilico-estilo-monocromatico.webp", text: "Bosquejo en acrílico, en un solo color, con luces y sombras, al modo de una grisalla o ébauche.", kind: "foto" },
  "estilo:Abstracto:Acrilico": { url: "img/guias/acrilico-estilo-abstracto.webp", text: "Formas y colores libres en acrílico, sin una escena literal.", kind: "foto" },
  "tema:Retrato:Carbonilla": { url: "img/guias/carbonilla-tema-retrato.webp", text: "Persona, pareja o animal como protagonistas del dibujo.", kind: "foto" },
  "tema:Paisaje:Carbonilla": { url: "img/guias/carbonilla-tema-paisaje.webp", text: "Paisaje dibujado a carbonilla o grafito.", kind: "foto" },
  "tema:Bodegon:Carbonilla": { url: "img/guias/carbonilla-tema-bodegon.webp", text: "Objetos o flores, naturaleza muerta en dibujo.", kind: "foto" },
  "fondo:simple:Carbonilla": { url: "img/guias/carbonilla-fondo-simple.webp", text: "Fondo de papel, claro o apenas difuminado, sin una escena detrás.", kind: "foto" },
  "fondo:detallado:Carbonilla": { url: "img/guias/carbonilla-fondo-detallado.webp", text: "Fondo trabajado: un ambiente, una habitación u otros detalles detrás.", kind: "foto" },
  "enmarcado:SinMarco:Carbonilla": { url: "img/guias/carbonilla-marco-sin.webp", text: "Lámina suelta, sin marco, lista para guardar o enmarcar después.", kind: "foto" },
  "enmarcado:Estandar:Carbonilla": { url: "img/guias/carbonilla-marco-estandar.webp", text: "Marco sencillo, con vidrio y paspartú para proteger el dibujo.", kind: "foto" },
  "enmarcado:Clasico:Carbonilla": { url: "img/guias/carbonilla-marco-clasico.webp", text: "Marco clásico, con vidrio y paspartú.", kind: "foto" },
  "sujetos:1:Carbonilla": { url: "img/guias/carbonilla-sujetos-1.webp", text: "Una sola persona (ya incluida en el precio base).", kind: "foto" },
  "sujetos:2:Carbonilla": { url: "img/guias/carbonilla-sujetos-2.webp", text: "Dos personas: se suma el valor de un sujeto extra.", kind: "foto" },
  "sujetos:mascota:Carbonilla": { url: "img/guias/carbonilla-sujetos-mascota.webp", text: "Sumá una mascota junto a la persona.", kind: "foto" },
} };

window.ESTUDIO_DEFAULTS = {
  "precios": {
    "matriz": {
      "30x40": {
        "espatulado": 465000,
        "realista": 700000,
        "hiper": 965000,
        "boceto": 465000,
        "extraPersona": 200000,
        "marcos": {
          "Estandar": 180000,
          "Cajon": 240000,
          "Clasico": 350000,
          "SemiRelieve": 400000,
          "GruesoRelieves": 480000
        }
      },
      "40x50": {
        "espatulado": 645000,
        "realista": 1000000,
        "hiper": 1355000,
        "boceto": 645000,
        "extraPersona": 350000,
        "marcos": {
          "Estandar": 230000,
          "Cajon": 300000,
          "Clasico": 450000,
          "SemiRelieve": 520000,
          "GruesoRelieves": 620000
        }
      },
      "50x70": {
        "espatulado": 1035000,
        "realista": 1570000,
        "hiper": 2070000,
        "boceto": 1035000,
        "extraPersona": 350000,
        "marcos": {
          "Estandar": 300000,
          "Cajon": 400000,
          "Clasico": 600000,
          "SemiRelieve": 700000,
          "GruesoRelieves": 850000
        }
      },
      "70x100": {
        "espatulado": 1785000,
        "realista": 2715000,
        "hiper": 3500000,
        "boceto": 1785000,
        "extraPersona": 550000,
        "marcos": {
          "Estandar": 380000,
          "Cajon": 500000,
          "Clasico": 750000,
          "SemiRelieve": 880000,
          "GruesoRelieves": 1050000
        }
      },
      "100x120": {
        "espatulado": 2785000,
        "realista": 4000000,
        "hiper": 5145000,
        "boceto": 2785000,
        "extraPersona": 750000,
        "marcos": {
          "Estandar": 450000,
          "Cajon": 600000,
          "Clasico": 900000,
          "SemiRelieve": 1050000,
          "GruesoRelieves": 1250000
        }
      },
      "30x30": {
        "espatulado": 465000,
        "realista": 700000,
        "hiper": 965000,
        "boceto": 465000,
        "extraPersona": 200000,
        "marcos": {
          "Estandar": 180000,
          "Cajon": 240000,
          "Clasico": 350000,
          "SemiRelieve": 400000,
          "GruesoRelieves": 480000
        }
      },
      "50x50": {
        "espatulado": 1035000,
        "realista": 1570000,
        "hiper": 2070000,
        "boceto": 1035000,
        "extraPersona": 350000,
        "marcos": {
          "Estandar": 300000,
          "Cajon": 400000,
          "Clasico": 600000,
          "SemiRelieve": 700000,
          "GruesoRelieves": 850000
        }
      },
      "70x70": {
        "espatulado": 1785000,
        "realista": 2715000,
        "hiper": 3500000,
        "boceto": 1785000,
        "extraPersona": 550000,
        "marcos": {
          "Estandar": 380000,
          "Cajon": 500000,
          "Clasico": 750000,
          "SemiRelieve": 880000,
          "GruesoRelieves": 1050000
        }
      },
      "100x100": {
        "espatulado": 2785000,
        "realista": 4000000,
        "hiper": 5145000,
        "boceto": 2785000,
        "extraPersona": 750000,
        "marcos": {
          "Estandar": 450000,
          "Cajon": 600000,
          "Clasico": 900000,
          "SemiRelieve": 1050000,
          "GruesoRelieves": 1250000
        }
      },
      "15x21": {
        "base": 220000,
        "extraPersona": 100000,
        "marcos": {
          "Estandar": 120000,
          "Cajon": 160000,
          "Clasico": 220000,
          "SemiRelieve": 250000,
          "GruesoRelieves": 300000
        }
      },
      "21x30": {
        "base": 320000,
        "extraPersona": 150000,
        "marcos": {
          "Estandar": 150000,
          "Cajon": 200000,
          "Clasico": 280000,
          "SemiRelieve": 320000,
          "GruesoRelieves": 380000
        }
      },
      "30x42": {
        "base": 520000,
        "extraPersona": 250000,
        "marcos": {
          "Estandar": 200000,
          "Cajon": 260000,
          "Clasico": 350000,
          "SemiRelieve": 420000,
          "GruesoRelieves": 500000
        }
      },
      "42x59": {
        "base": 850000,
        "extraPersona": 350000,
        "marcos": {
          "Estandar": 280000,
          "Cajon": 360000,
          "Clasico": 480000,
          "SemiRelieve": 560000,
          "GruesoRelieves": 680000
        }
      }
    },
    "escultura": {
      "Busto": {
        "min": 30,
        "max": 80,
        "step": 5,
        "minimo": 6500000,
        "fijo": 4000000,
        "porCm": 80000,
        "redondeo": 50000,
        "def": 50
      },
      "Medio cuerpo": {
        "min": 50,
        "max": 120,
        "step": 10,
        "minimo": 8500000,
        "fijo": 5000000,
        "porCm": 90000,
        "redondeo": 50000,
        "def": 80
      },
      "Figura completa": {
        "min": 30,
        "max": 200,
        "step": 10,
        "minimo": 6000000,
        "fijo": 0,
        "porCm": 120000,
        "redondeo": 50000,
        "def": 100
      },
      "Relieve": {
        "min": 30,
        "max": 120,
        "step": 10,
        "minimo": 4500000,
        "fijo": 3000000,
        "porCm": 70000,
        "redondeo": 50000,
        "def": 50
      }
    },
    "materialesEscultura": {
      "Fibra": 1,
      "Cemento": 1.2,
      "Arcilla": 1.3,
      "Chapa": 1.25,
      "Chatarra": 1.15
    },
    "pesosEscultura": {
      "refCm": 170,
      "areaRefCm2": 18000,
      "espesorFibra": 0.5,
      "espesorCemento": 2.2,
      "espesorArcilla": 2.5,
      "densidadFibra": 1.8,
      "densidadCemento": 2.3,
      "densidadArcilla": 2.4,
      "espesorChapa": 0.5,
      "espesorChatarra": 0.75,
      "densidadAcero": 7.85,
      "hierroFigura": 18,
      "hierroMedio": 12,
      "hierroBusto": 6,
      "hierroRelieve": 8,
      "factorMedio": 0.62,
      "factorBusto": 0.38,
      "factorRelieve": 0.55
    },
    "tasasRespaldo": {
      "USD": 0.00016,
      "EUR": 0.000143,
      "BRL": 0.000879,
      "ARS": 0.246616,
      "UYU": 0.006432,
      "CLP": 0.155703,
      "BOB": 0.0019,
      "GBP": 0.000119,
      "MXN": 0.002967,
      "COP": 0.517392,
      "PEN": 0.000549,
      "CAD": 0.000225,
      "CHF": 0.000131,
      "CNY": 0.00114,
      "JPY": 0.0243,
      "KRW": 0.224,
      "INR": 0.0141,
      "RUB": 0.0128,
      "AUD": 0.000245
    },
    "ajustes": {
      "restauracionDigital": 180000,
      "restauracionDigitalCompleja": 350000,
      "personalizadoMinRetrato": 465000,
      "personalizadoMinOtros": 357000,
      "personalizadoCm2Retrato": 429,
      "personalizadoCm2Otros": 321,
      "personalizadoEspatulado": 0.75,
      "personalizadoHiper": 1.35,
      "personalizadoBoceto": 0.7,
      "personalizadoExtraPersona": 350000,
      "personalizadoMarcos": {
        "Estandar": 300000,
        "Cajon": 400000,
        "Clasico": 600000,
        "SemiRelieve": 700000,
        "GruesoRelieves": 850000
      },
      "carbonillaRespaldo": 520000,
      "carbonillaColor": 1.25,
      "acrilico": 0.85,
      "circular": 1.15,
      "ovalado": 1.2,
      "mascota": 0.6,
      "fondo": 0.15,
      "cuotasMinimo": 500000,
      "tarjeta": 0.05,
      "iva": 0.1,
      "senaDivisor": 2,
      "cuotasCantidad": 3,
      "cambioUSD": 5880,
      "cambioEUR": 0.92,
      "cambioBRL": 5.4
    },
    "cursos": {
      "matricula": 150000,
      "mensualidad": 400000,
      "claseSuelta": 120000
    }
  },
  "sitio": {
    "whatsapp": "595972173847",
    "mapaCurso": "https://maps.app.goo.gl/gBuXnFGxApEkc7w5A?g_st=ac",
    "textos": {
      "subtitulo": "Artista plástico | Maestro de arte",
      "biografia": "Nací en Asunción en 1989, bendecido con un don artístico heredado de mi madre y forjado con la disciplina, la perseverancia y la visión para aprovechar cada oportunidad que me inculcó mi padre. Tuve el honor de perfeccionar este legado durante más de 20 años junto al gran Maestro Prof. Manuel Viedma. Hoy, fusiono esa pasión innata y trabajo duro con una técnica de élite para dar vida a obras exclusivas que transforman espacios.",
      "introduccionCurso": "🎨 ¿Por qué estudiar dibujo y pintura? Aprender a pintar es mucho más que dominar una técnica; es descubrir una nueva forma de ver el mundo, reducir el estrés y potenciar tu creatividad. En este espacio, te guiaré paso a paso para que logres transformar un lienzo en blanco en tu propia obra maestra, sin importar si empezás completamente desde cero. ¡Despertá el artista que llevás dentro!",
      "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguay.",
      "condiciones": "Completá tu pedido en la página para que podamos prepararlo con todos los detalles. Los presupuestos son estimados y se confirman personalmente. Al enviar el pedido se arma un mensaje con tus datos; revisalo antes de mandarlo. No se confirma una reserva ni se realiza un cobro desde esta página.",
      "tituloCursos": "DIBUJO Y PINTURA",
      "programaCurso": "Harold Lezcano | Programa 12 meses",
      "modulo-1": "Dibujo base, encaje y proporciones.",
      "modulo-2": "Luz, sombra y volumen (claroscuro).",
      "modulo-3": "Bodegones y naturaleza muerta.",
      "modulo-4": "Teoría del color, círculo cromático y mezclas.",
      "modulo-5": "Transparencias y técnicas húmedas.",
      "modulo-6": "Acrílico: pinceladas y atmósferas.",
      "modulo-7": "Anatomía y retrato básico.",
      "modulo-8": "Introducción al óleo y veladuras clásicas.",
      "modulo-9": "Proyecto final tutelado.",
      "kit-1": "Cartulinas de dibujo (Canson A4 o A3).",
      "kit-2": "Set de lápices de grafito (HB, 2B, 4B y 6B).",
      "kit-3": "Esfumino para sombreado.",
      "kit-4": "Goma de borrar blanca y goma maleable.",
      "kit-5": "Sacapuntas o cúter, y regla de 30 cm.",
      "horarioCurso": "Viernes 18:00 a 20:00 hs.",
      "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguay.",
      "flexibilidadCurso": "Flexibilidad total de horario y recuperación."
    },
    "textosI18n": {
      "en": {
        "subtitulo": "Visual artist | Art teacher",
        "biografia": "I was born in Asunción in 1989, blessed with an artistic gift inherited from my mother and shaped by the discipline, perseverance and eye for opportunity that my father instilled in me. I had the honour of refining this legacy for more than 20 years alongside the great Master Prof. Manuel Viedma. Today I bring together that innate passion and hard work with a highly trained technique to create exclusive works that transform spaces.",
        "introduccionCurso": "🎨 Why study drawing and painting? Learning to paint is much more than mastering a technique; it is discovering a new way of seeing the world, easing stress and boosting your creativity. In this space I will guide you step by step so you can turn a blank canvas into your own masterpiece, even if you are starting completely from scratch. Awaken the artist you carry within!",
        "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguay.",
        "condiciones": "Complete your order on this page so we can prepare it with every detail. The quotes are estimates and are confirmed in person. When you send the order, a message is put together with your details; please check it before sending. No reservation is confirmed and no payment is taken from this page.",
        "tituloCursos": "DRAWING AND PAINTING",
        "programaCurso": "Harold Lezcano | 12-month programme",
        "modulo-1": "Basic drawing, composition and proportions.",
        "modulo-2": "Light, shadow and volume (chiaroscuro).",
        "modulo-3": "Still lifes and objects.",
        "modulo-4": "Colour theory, the colour wheel and mixing.",
        "modulo-5": "Transparencies and wet techniques.",
        "modulo-6": "Acrylic: brushstrokes and atmospheres.",
        "modulo-7": "Anatomy and basic portraiture.",
        "modulo-8": "Introduction to oil and classic glazes.",
        "modulo-9": "Tutored final project.",
        "kit-1": "Drawing papers (Canson A4 or A3).",
        "kit-2": "Set of graphite pencils (HB, 2B, 4B and 6B).",
        "kit-3": "Blending stump for shading.",
        "kit-4": "White eraser and kneaded eraser.",
        "kit-5": "Sharpener or craft knife, and a 30 cm ruler.",
        "horarioCurso": "Fridays, 6:00 p.m. to 8:00 p.m.",
        "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguay.",
        "flexibilidadCurso": "Full flexibility of schedule, including make-up classes."
      },
      "pt": {
        "subtitulo": "Artista plástico | Professor de arte",
        "biografia": "Nasci em Assunção em 1989, abençoado com um dom artístico herdado da minha mãe e forjado com a disciplina, a perseverança e a visão para aproveitar cada oportunidade que meu pai me ensinou. Tive a honra de aperfeiçoar esse legado durante mais de 20 anos junto ao grande Mestre Prof. Manuel Viedma. Hoje, uno essa paixão inata e o trabalho duro a uma técnica de alto nível para dar vida a obras exclusivas que transformam espaços.",
        "introduccionCurso": "🎨 Por que estudar desenho e pintura? Aprender a pintar é muito mais do que dominar uma técnica; é descobrir uma nova forma de ver o mundo, reduzir o estresse e potencializar a sua criatividade. Neste espaço, vou orientar você passo a passo para transformar uma tela em branco na sua própria obra-prima, mesmo que você comece completamente do zero. Desperte o artista que você leva dentro de si!",
        "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguai.",
        "condiciones": "Complete o seu pedido nesta página para que possamos prepará-lo com todos os detalhes. Os orçamentos são estimativas e se confirmam pessoalmente. Ao enviar o pedido, monta-se uma mensagem com os seus dados; revise-a antes de enviá-la. Não se confirma uma reserva nem se realiza um pagamento nesta página.",
        "tituloCursos": "DESENHO E PINTURA",
        "programaCurso": "Harold Lezcano | Programa de 12 meses",
        "modulo-1": "Desenho de base, encaixe e proporções.",
        "modulo-2": "Luz, sombra e volume (claroscuro).",
        "modulo-3": "Naturezas-mortas e objetos.",
        "modulo-4": "Teoria da cor, círculo cromático e misturas.",
        "modulo-5": "Transparências e técnicas úmidas.",
        "modulo-6": "Acrílico: pinceladas e atmosferas.",
        "modulo-7": "Anatomia e retrato básico.",
        "modulo-8": "Introdução ao óleo e veladuras clássicas.",
        "modulo-9": "Projeto final com orientação.",
        "kit-1": "Cartolinas de desenho (Canson A4 ou A3).",
        "kit-2": "Conjunto de lápis de grafite (HB, 2B, 4B e 6B).",
        "kit-3": "Esfuminho para sombreado.",
        "kit-4": "Borracha branca e borracha maleável.",
        "kit-5": "Apontador ou estilete, e régua de 30 cm.",
        "horarioCurso": "Sextas-feiras, das 18:00 às 20:00.",
        "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguai.",
        "flexibilidadCurso": "Flexibilidade total de horário e reposição de aulas."
      },
      "fr": {
        "subtitulo": "Artiste plasticien | Maître d’art",
        "biografia": "Je suis né à Asunción en 1989, béni d’un don artistique hérité de ma mère et forgé par la discipline, la persévérance et le regard pour saisir chaque occasion que mon père m’a transmis. J’ai eu l’honneur d’approfondir cet héritage pendant plus de 20 ans aux côtés du grand Maître le Prof. Manuel Viedma. Aujourd’hui, je réunis cette passion innée et ce travail exigeant à une technique de haut niveau pour donner vie à des œuvres exclusives qui transforment les espaces.",
        "introduccionCurso": "🎨 Pourquoi étudier le dessin et la peinture ? Apprendre à peindre, c’est bien plus que maîtriser une technique ; c’est découvrir une nouvelle façon de voir le monde, apaiser le stress et développer sa créativité. Dans cet espace, je te guide pas à pas pour transformer une toile blanche en ta propre œuvre, même si tu commences tout à fait de zéro. Réveille l’artiste que tu portes en toi !",
        "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguay.",
        "condiciones": "Complète ta commande sur cette page pour que nous puissions la préparer dans tous ses détails. Les devis sont des estimations et se confirment en personne. En envoyant la commande, un message est préparé avec tes données ; vérifie-le avant de l’envoyer. Aucune réservation n’est confirmée et aucun paiement n’est effectué depuis cette page.",
        "tituloCursos": "DESSIN ET PEINTURE",
        "programaCurso": "Harold Lezcano | Programme de 12 mois",
        "modulo-1": "Dessin de base, mise en place et proportions.",
        "modulo-2": "Lumière, ombre et volume (clair-obscur).",
        "modulo-3": "Natures mortes et objets.",
        "modulo-4": "Théorie de la couleur, cercle chromatique et mélanges.",
        "modulo-5": "Transparences et techniques humides.",
        "modulo-6": "Acrylique : coups de pinceau et atmosphères.",
        "modulo-7": "Anatomie et portrait de base.",
        "modulo-8": "Introduction à l’huile et aux glacis classiques.",
        "modulo-9": "Projet final accompagné.",
        "kit-1": "Papiers à dessin (Canson A4 ou A3).",
        "kit-2": "Jeu de crayons graphite (HB, 2B, 4B et 6B).",
        "kit-3": "Estompe pour les ombres.",
        "kit-4": "Gomme blanche et gomme mie de pain.",
        "kit-5": "Taille-crayon ou cutter, et règle de 30 cm.",
        "horarioCurso": "Vendredis, de 18 h 00 à 20 h 00.",
        "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguay.",
        "flexibilidadCurso": "Toute flexibilité d’horaire, avec des cours de rattrapage."
      },
      "it": {
        "subtitulo": "Artista visivo | Maestro d’arte",
        "biografia": "Sono nato ad Asunción nel 1989, benedetto da un dono artistico ereditato da mia madre e forgiato con la disciplina, la perseveranza e lo sguardo per cogliere ogni opportunità che mio padre mi ha trasmesso. Ho avuto l’onore di perfezionare questo lascito per più di 20 anni accanto al grande Maestro Prof. Manuel Viedma. Oggi unisco quella passione innata e il lavoro costante a una tecnica di alto livello per dare vita a opere esclusive che trasformano gli spazi.",
        "introduccionCurso": "🎨 Perché studiare disegno e pittura? Imparare a dipingere è molto più che padroneggiare una tecnica; è scoprire un modo nuovo di vedere il mondo, ridurre lo stress e potenziare la creatività. In questo spazio ti guiderò passo dopo passo perché tu possa trasformare una tela bianca nella tua opera, anche se parti completamente da zero. Risveglia l’artista che porti dentro di te!",
        "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguay.",
        "condiciones": "Completa il tuo ordine in questa pagina così possiamo prepararlo con tutti i dettagli. I preventivi sono stime e si confermano di persona. Quando invii l’ordine si prepara un messaggio con i tuoi dati; controllalo prima di mandarlo. Non si conferma una prenotazione e non si effettua un pagamento da questa pagina.",
        "tituloCursos": "DISEGNO E PITTURA",
        "programaCurso": "Harold Lezcano | Programma di 12 mesi",
        "modulo-1": "Disegno di base, incastro e proporzioni.",
        "modulo-2": "Luce, ombra e volume (chiaroscuro).",
        "modulo-3": "Nature morte e oggetti.",
        "modulo-4": "Teoria del colore, cerchio cromatico e mescolanze.",
        "modulo-5": "Trasparenze e tecniche umide.",
        "modulo-6": "Acrilico: pennellate e atmosfere.",
        "modulo-7": "Anatomia e ritratto di base.",
        "modulo-8": "Introduzione all’olio e alle velature classiche.",
        "modulo-9": "Progetto finale con tutela.",
        "kit-1": "Cartoncini da disegno (Canson A4 o A3).",
        "kit-2": "Set di matite di grafite (HB, 2B, 4B e 6B).",
        "kit-3": "Sfumino per le ombre.",
        "kit-4": "Gomma bianca e gomma pane.",
        "kit-5": "Temperamatite o cutter, e riga da 30 cm.",
        "horarioCurso": "Venerdì, dalle 18:00 alle 20:00.",
        "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguay.",
        "flexibilidadCurso": "Piena flessibilità di orario e recupero delle lezioni."
      },
      "de": {
        "subtitulo": "Bildender Künstler | Kunstlehrer",
        "biografia": "Ich wurde 1989 in Asunción geboren, gesegnet mit einer künstlerischen Gabe, die ich von meiner Mutter geerbt habe, und geprägt von der Disziplin, der Ausdauer und dem Blick für jede Gelegenheit, den mein Vater mir vermittelt hat. Ich hatte die Ehre, dieses Vermächtnis mehr als 20 Jahre lang an der Seite des großen Meisters Prof. Manuel Viedma zu vertiefen. Heute verbinde ich diese angeborene Leidenschaft und die harte Arbeit mit einer hoch ausgebildeten Technik, um exklusive Werke zu schaffen, die Räume verwandeln.",
        "introduccionCurso": "🎨 Warum Zeichnen und Malen lernen? Malen zu lernen ist weit mehr als das Beherrschen einer Technik; es bedeutet, die Welt neu zu sehen, Stress zu lindern und die eigene Kreativität zu stärken. In diesem Raum begleite ich dich Schritt für Schritt, damit du eine leere Leinwand in dein eigenes Werk verwandeln kannst, auch wenn du ganz bei null beginnst. Wecke den Künstler, den du in dir trägst!",
        "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguay.",
        "condiciones": "Vervollständige deine Bestellung auf dieser Seite, damit wir sie mit allen Angaben vorbereiten können. Die Kostenvoranschläge sind Schätzungen und werden persönlich bestätigt. Beim Absenden der Bestellung wird eine Nachricht mit deinen Daten erstellt; prüfe sie bitte, bevor du sie schickst. Es wird keine Reservierung bestätigt und von dieser Seite aus keine Zahlung vorgenommen.",
        "tituloCursos": "ZEICHNEN UND MALEN",
        "programaCurso": "Harold Lezcano | 12-Monats-Programm",
        "modulo-1": "Grundlegendes Zeichnen, Aufbau und Proportionen.",
        "modulo-2": "Licht, Schatten und Volumen (Chiaroscuro).",
        "modulo-3": "Stillleben und Gegenstände.",
        "modulo-4": "Farbtheorie, Farbkreis und Mischungen.",
        "modulo-5": "Transparenzen und nasse Techniken.",
        "modulo-6": "Acryl: Pinselstriche und Atmosphären.",
        "modulo-7": "Anatomie und grundlegendes Porträt.",
        "modulo-8": "Einführung in die Ölmalerei und klassische Lasuren.",
        "modulo-9": "Betreutes Abschlussprojekt.",
        "kit-1": "Zeichenkarton (Canson A4 oder A3).",
        "kit-2": "Set aus Grafitstiften (HB, 2B, 4B und 6B).",
        "kit-3": "Estompe zum Schummern.",
        "kit-4": "Weißer Radiergummi und Knetgummi.",
        "kit-5": "Spitzer oder Cutter und ein 30-cm-Lineal.",
        "horarioCurso": "Freitags, 18:00 bis 20:00 Uhr.",
        "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguay.",
        "flexibilidadCurso": "Volle zeitliche Flexibilität, einschließlich Nachholstunden."
      }
    }
  },
  "categorias": [
    {
      "id": "retrato",
      "name": "Retratos"
    },
    {
      "id": "paisaje",
      "name": "Paisajes"
    },
    {
      "id": "escultura",
      "name": "Esculturas"
    },
    {
      "id": "mural",
      "name": "Murales"
    },
    {
      "id": "abstracto",
      "name": "Abstractos"
    },
    {
      "id": "otros",
      "name": "Otros"
    }
  ],
  "etiquetasTextos": {
    "subtitulo": "Subtítulo de la cabecera",
    "biografia": "Biografía",
    "introduccionCurso": "Introducción a cursos",
    "contacto": "Ubicación y contacto",
    "condiciones": "Condiciones del contacto",
    "tituloCursos": "Título de cursos",
    "programaCurso": "Programa de cursos",
    "modulo-1": "Contenido de módulo 1",
    "modulo-2": "Contenido de módulo 2",
    "modulo-3": "Contenido de módulo 3",
    "modulo-4": "Contenido de módulo 4",
    "modulo-5": "Contenido de módulo 5",
    "modulo-6": "Contenido de módulo 6",
    "modulo-7": "Contenido de módulo 7",
    "modulo-8": "Contenido de módulo 8",
    "modulo-9": "Contenido de módulo 9",
    "kit-1": "Material de inicio 1",
    "kit-2": "Material de inicio 2",
    "kit-3": "Material de inicio 3",
    "kit-4": "Material de inicio 4",
    "kit-5": "Material de inicio 5",
    "horarioCurso": "Horario de cursos",
    "direccionCurso": "Dirección del curso",
    "flexibilidadCurso": "Aclaración de horarios"
  }
};

// Validación común del cotizador y del panel. Nunca se ejecuta texto de Firestore.
window.EstudioDatos = (() => {
 const defaults = window.ESTUDIO_DEFAULTS;
 const clone = value => JSON.parse(JSON.stringify(value));
 function sameNumericShape(value, reference, path = '') {
  if (typeof reference === 'number') {
   if (!Number.isFinite(value) || value < 0 || value > 1e12) throw Error('Valor numérico inválido: ' + path);
   return;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).sort().join('|') !== Object.keys(reference).sort().join('|')) throw Error('La estructura no corresponde a los precios actuales: ' + path);
  for (const key of Object.keys(reference)) sameNumericShape(value[key], reference[key], path + '/' + key);
 }
 function mergeNumeric(target, source) {
  if (typeof target === 'number') return (source != null && Number.isFinite(Number(source))) ? Number(source) : target;
  if (target && typeof target === 'object' && !Array.isArray(target)) {
   const out = {};
   for (const k of Object.keys(target)) out[k] = mergeNumeric(target[k], source ? source[k] : undefined);
   return out;
  }
  return target;
 }
 function validatePrices(value) {
  value = mergeNumeric(clone(defaults.precios), value);
  sameNumericShape(value, defaults.precios);
  for (const [name, s] of Object.entries(value.escultura)) {
   if (!(s.min > 0 && s.max >= s.min && s.def >= s.min && s.def <= s.max && s.step > 0 && s.redondeo > 0 && s.max <= 200)) throw Error('Revisá las medidas de ' + name + ' (máximo 200 cm).');
  }
  const a = value.ajustes;
  if (!Number.isInteger(a.cuotasCantidad) || a.cuotasCantidad < 1 || a.cuotasCantidad > 36 || a.senaDivisor < 1 || a.cambioUSD <= 0 || a.cambioEUR <= 0 || a.cambioBRL <= 0) throw Error('Revisá las cuotas, seña y cotizaciones de respaldo.');
  if (a.iva > 1 || a.tarjeta > 1 || a.fondo > 1 || a.mascota > 10) throw Error('Revisá los factores de IVA, tarjeta, fondo y mascota.');
  for (const key of ['personalizadoEspatulado','personalizadoHiper','personalizadoBoceto','carbonillaColor','acrilico','circular','ovalado']) if (a[key] > 10) throw Error('Factor fuera de rango: ' + key);
  return clone(value);
 }
 function validateSite(value) {
  if (!value || !/^\d{8,15}$/.test(value.whatsapp)) throw Error('Ingresá el WhatsApp con código de país, sin + ni espacios.');
  let map;
  try { map = new URL(value.mapaCurso); } catch { throw Error('Ingresá un enlace válido del mapa.'); }
  if (map.protocol !== 'https:') throw Error('El enlace del mapa debe comenzar con https://.');
  const textos = {};
  for (const key of Object.keys(defaults.sitio.textos)) {
   if (typeof value.textos?.[key] !== 'string' || value.textos[key].length > 6000) throw Error('Texto inválido: ' + key);
   textos[key] = value.textos[key];
  }
  const out = { whatsapp:value.whatsapp, mapaCurso:map.href, textos };
  if (value.textosI18n && typeof value.textosI18n === 'object' && !Array.isArray(value.textosI18n)) {
   const langs = ['en','pt','fr','it','de'];
   const known = Object.keys(defaults.sitio.textos);
   const outI = {};
   for (const lang of langs) {
    const src = value.textosI18n[lang];
    if (!src || typeof src !== 'object' || Array.isArray(src)) continue;
    const map = {};
    for (const key of known) {
     if (typeof src[key] !== 'string') continue;
     if (src[key].length > 6000) throw Error('Traducción inválida: ' + lang + '/' + key);
     map[key] = src[key];
    }
    outI[lang] = map;
   }
   if (Object.keys(outI).length) out.textosI18n = outI;
  }
  // Foto de Inicio opcional: URL https pública y ruta del archivo en sitio/ para poder reemplazarlo.
  if (value.fotoArtista) {
   let foto;
   try { foto = new URL(value.fotoArtista); } catch { throw Error('La foto de Inicio no tiene un enlace válido.'); }
   if (foto.protocol !== 'https:' || foto.href.length > 2048) throw Error('La foto de Inicio debe ser un enlace https.');
   const path = typeof value.fotoArtistaPath === 'string' ? value.fotoArtistaPath : '';
   if (path && (path.length > 300 || !/^sitio\/[A-Za-z0-9._-]+$/.test(path))) throw Error('Ruta de la foto de Inicio inválida.');
   out.fotoArtista = foto.href; out.fotoArtistaPath = path;
  }
  // Fondo de la página: imagen opcional (https) y opacidad 0–1. Sin imagen se usa el fondo original del sitio.
  if (value.fondoImagen) {
   let fondo;
   try { fondo = new URL(value.fondoImagen); } catch { throw Error('La imagen de fondo no tiene un enlace válido.'); }
   if (fondo.protocol !== 'https:' || fondo.href.length > 2048) throw Error('La imagen de fondo debe ser un enlace https.');
   const fpath = typeof value.fondoImagenPath === 'string' ? value.fondoImagenPath : '';
   if (fpath && (fpath.length > 300 || !/^sitio\/[A-Za-z0-9._-]+$/.test(fpath))) throw Error('Ruta de la imagen de fondo inválida.');
   out.fondoImagen = fondo.href; out.fondoImagenPath = fpath;
  }
  if (value.fondoOpacidad !== undefined && value.fondoOpacidad !== null && value.fondoOpacidad !== '') {
   const op = Number(value.fondoOpacidad);
   if (!Number.isFinite(op) || op < 0 || op > 1) throw Error('La opacidad del fondo debe estar entre 0 y 1.');
   out.fondoOpacidad = Math.round(op * 1000) / 1000;
  }
  if (value.ventanasOpacidad !== undefined && value.ventanasOpacidad !== null && value.ventanasOpacidad !== '') {
   const vo = Number(value.ventanasOpacidad);
   if (!Number.isFinite(vo) || vo < 0 || vo > 1) throw Error('La opacidad de las ventanas debe estar entre 0 y 1.');
   out.ventanasOpacidad = Math.round(vo * 1000) / 1000;
  }
  if (value.fondoDesenfoque !== undefined && value.fondoDesenfoque !== null && value.fondoDesenfoque !== '') {
   const bl = Number(value.fondoDesenfoque);
   if (!Number.isFinite(bl) || bl < 0 || bl > 20) throw Error('El desenfoque del fondo debe estar entre 0 y 20.');
   out.fondoDesenfoque = Math.round(bl * 10) / 10;
  }
  return out;
 }
 function validateCategories(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) throw Error('Usá entre 1 y 50 categorías.');
  const ids = new Set();
  return items.map(item => {
   if (!/^[a-z][a-z0-9-]{0,39}$/.test(item.id) || ids.has(item.id) || typeof item.name !== 'string' || !item.name.trim() || item.name.length > 80) throw Error('Categoría inválida o repetida.');
   ids.add(item.id);return { id:item.id, name:item.name.trim() };
  });
 }
 function mergeGallery(seed, remote) {
  const map = new Map(seed.map(item => [item.id, { ...item }]));
  for (const item of remote) {
   try {
    const base = window.location?.origin || 'https://galeria.example';
    const url = new URL(item.url || map.get(item.id)?.url, base);
    if (url.protocol !== 'https:' || !/^[a-z][a-z0-9-]{0,39}$/.test(item.category || '')) continue;
    const captions={};
    if (item.captions && typeof item.captions==='object' && !Array.isArray(item.captions)) {
     for (const lang of ['en','pt','fr','it','de']) {
      if (typeof item.captions[lang]==='string' && item.captions[lang].trim()) captions[lang]=item.captions[lang].trim().slice(0,240);
     }
    }
    const next={ ...map.get(item.id), ...item, url:url.href, caption:typeof item.caption === 'string' ? item.caption.slice(0,240) : '', order:Number.isFinite(item.order) ? item.order : 0 };
    if (Object.keys(captions).length) next.captions=captions; else delete next.captions;
    map.set(item.id, next);
   } catch { /* Un registro inválido no debe romper el resto de la galería. */ }
  }
  return [...map.values()].sort((a,b) => (a.order - b.order) || a.id.localeCompare(b.id));
 }

 function validateGuias(value) {
  const base = window.ESTUDIO_GUIAS_DEFAULT?.items || {};
  if (!value || typeof value !== 'object' || typeof value.items !== 'object') throw Error('Guías inválidas.');
  const items = {};
  for (const key of Object.keys(base)) {
   const src = value.items[key];
   if (!src) continue;
   if (typeof src !== 'object') throw Error('Guía inválida: ' + key);
   const out = {};
   if (src.url) {
    if (typeof src.url !== 'string' || src.url.length > 12000) throw Error('Imagen de guía demasiado larga: ' + key);
    if (!(src.url.startsWith('https://') || src.url.startsWith('data:image/svg+xml') || /^img\/[A-Za-z0-9._\/-]+\.(webp|jpe?g|png|gif)$/.test(src.url))) throw Error('La imagen de guía debe ser https, un diagrama SVG o una foto local en img/.');
    out.url = src.url;
   }
   if (typeof src.text === 'string') {
    if (src.text.length > 160) throw Error('Texto de guía demasiado largo: ' + key);
    out.text = src.text.trim();
   }
   if (typeof src.storagePath === 'string') {
    if (src.storagePath && (src.storagePath.length > 300 || !/^sitio\/[A-Za-z0-9._-]+$/.test(src.storagePath))) throw Error('Ruta de guía inválida.');
    out.storagePath = src.storagePath;
   }
   if (src.kind === 'foto' || src.kind === 'diagrama') out.kind = src.kind;
   if (Object.keys(out).length) items[key] = out;
  }
  return { items };
 }
 return { clone, validatePrices, validateSite, validateCategories, mergeGallery, validateGuias };
})();

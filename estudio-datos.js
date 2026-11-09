'use strict';
window.ESTUDIO_FONDO_DEFAULT = 'https://i.postimg.cc/NMk5wJ1T/Picsart-26-04-28-08-03-58-251.jpg';
window.ESTUDIO_FONDO_OPACIDAD_DEFAULT = 0.45;
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
      "subtitulo": "Artista Plástico | Maestro de Arte",
      "biografia": "Nací en Asunción en 1989, bendecido con un don artístico heredado de mi madre y forjado con la disciplina, la perseverancia y la visión para aprovechar cada oportunidad que me inculcó mi padre . Tuve el honor de perfeccionar este legado durante más de 20 años junto al gran Maestro Prof. Manuel Viedma . Hoy, fusiono esa pasión innata y trabajo duro con una técnica de élite para dar vida a obras exclusivas que transforman espacios.",
      "introduccionCurso": "🎨 ¿Por qué estudiar dibujo y pintura? Aprender a pintar es mucho más que dominar una técnica; es descubrir una nueva forma de ver el mundo, reducir el estrés y potenciar tu creatividad. En este espacio, te guiaré paso a paso para que logres transformar un lienzo en blanco en tu propia obra maestra, sin importar si empezás completamente desde cero. ¡Despertá el artista que llevás dentro!",
      "contacto": "Harold Lezcano · Las Residentas 460, Fernando de la Mora, Paraguay.",
      "condiciones": "Podés consultar sin completar el cotizador. Los presupuestos son estimados y se confirman personalmente. Al continuar por WhatsApp, se preparará un mensaje con los datos que completaste; revisalo antes de enviarlo. No se confirma una reserva ni se realiza un cobro desde esta página.",
      "tituloCursos": "DIBUJO Y PINTURA",
      "programaCurso": "Harold Lezcano | Programa 12 Meses",
      "modulo-1": "Dibujo base, encaje y proporciones.",
      "modulo-2": "Luz, sombra y volumen (Claroscuro).",
      "modulo-3": "Bodegones y naturaleza muerta.",
      "modulo-4": "Teoría del color, círculo cromático y mezclas.",
      "modulo-5": "Transparencias y técnicas húmedas.",
      "modulo-6": "Acrílico: Pinceladas y atmósferas.",
      "modulo-7": "Anatomía y retrato básico.",
      "modulo-8": "Introducción al óleo y veladuras clásicas.",
      "modulo-9": "Proyecto Final tutelado.",
      "kit-1": "Cartulinas de dibujo (Canson A4 o A3).",
      "kit-2": "Set de lápices de grafito (HB, 2B, 4B y 6B).",
      "kit-3": "Esfumino para sombreado.",
      "kit-4": "Goma de borrar blanca y goma maleable.",
      "kit-5": "Sacapuntas/Cúter y Regla de 30 cm.",
      "horarioCurso": "Viernes 18:00 a 20:00 hs.",
      "direccionCurso": "📍 Las Residentas 460, Fernando de la Mora, Paraguay.",
      "flexibilidadCurso": "Flexibilidad total de horario y recuperación."
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
 function validatePrices(value) {
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
    map.set(item.id, { ...map.get(item.id), ...item, url:url.href, caption:typeof item.caption === 'string' ? item.caption.slice(0,240) : '', order:Number.isFinite(item.order) ? item.order : 0 });
   } catch { /* Un registro inválido no debe romper el resto de la galería. */ }
  }
  return [...map.values()].sort((a,b) => (a.order - b.order) || a.id.localeCompare(b.id));
 }
 return { clone, validatePrices, validateSite, validateCategories, mergeGallery };
})();

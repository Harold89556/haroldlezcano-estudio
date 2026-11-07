# Sitio de Harold Lezcano — correcciones preparadas

Fecha: 7 de noviembre de 2026, hora de Paraguay (America/Asuncion).

## Alcance y estado

Se descargó una copia fresca de los archivos públicos. Se prepararon correcciones únicamente en disco. **No se inició sesión, no se publicó en Neocities y no se envió ningún pedido, inscripción ni mensaje.** Los originales descargados están en `originales/` para comparación/restauración.

Se preservan identidad negro/dorado/Montserrat, biografía, cursos, precios de la matriz, galería, enlaces y WhatsApp existentes. No se añadieron testimonios, títulos de obras, años, disponibilidad, pagos ni analítica.

## Archivos de publicación

Subir únicamente estos 15 archivos a la raíz del sitio cuando se decida publicar:

- `index.html`: HTML semántico, SEO, contacto, labels, imágenes y controles.
- `cotizador.js`: cálculo y desglose, dimensiones normalizadas, tipos de cambio seguros.
- `interfaz.js`: lógica extraída del HTML; selectores nativos, conversiones y mensajes.
- `mejoras.js`: validación, rutas persistentes, teclado, foco y semántica de pestañas.
- `style.css`: estilos principales extraídos y correcciones de adaptación/accesibilidad.
- `manifest.json`: iconos válidos y colores coherentes.
- `sw.js`: navegación y scripts por red sin almacenar tarifas, aviso offline honesto.
- `robots.txt`: conserva reglas y añade sitemap.
- `sitemap.xml`: URL canónica de la portada.
- `not_found.html`: 404 en español con navegación y WhatsApp.
- `icono.png`: convertido a PNG real, conservado para compatibilidad.
- `icono-192.png`, `icono-512.png`: PNG reales con dimensiones exactas.
- `icono-maskable.png`: PNG con margen de seguridad para instalación.
- `neocities.png`: conservado sin cambios.

`publicar-harold.zip` contiene exclusivamente esos 15 archivos, sin carpetas, pruebas ni originales. **No subir `originales/`, documentación, archivos de pruebas ni package.json.**

## Estado por hallazgo

| ID | Estado | Implementación |
|---|---|---|
| C01 | Hecho | Solo se conserva tamaño si existe en la nueva lista. Placeholder seguro y sin acceso inseguro a selectedIndex. |
| C02 | Hecho | Extras solo aplican a Retrato; se limpian al salir de esa temática. |
| I01 | Hecho | Reglas desktop limitadas a paneles activos; hidden y CSS refuerzan la exclusión de inactivos. |
| I02 | Hecho | Conversión cm/in/m conserva dimensión física. Normalización en cm, límites equivalentes y errores visibles. |
| I03 | Hecho | Coincidencias con tamaños estándar, incluidas orientaciones invertidas, usan matriz estándar. |
| I04 | Hecho | Resumen de medidas desde la normalización usada por el cálculo. Circular indica diámetro; hexagonal indica ancho máximo entre vértices opuestos. |
| I05 | Hecho | Base, extras, recargo, IVA y total desglosados; nota IVA incluido/Sin IVA consistente. |
| I06 | Hecho | Digital y Digital Compleja: contado tras aprobar muestra; panel de pago oculto; UI y WhatsApp alineados. |
| I07 | Hecho | Selectores nativos visibles, labels asociados, foco visible. Sin controles div personalizados. |
| I08 | Hecho | Alt honestos en las 159 imágenes; álbumes y obras como botones, diálogo, foco, Escape, flechas y trampa de Tab. Color real y encuadre contain. |
| I09 | Hecho | Inscripción valida nombre y edad; cotización exige elecciones y datos necesarios según servicio, errores junto al campo. Botón Consultar por WhatsApp. |
| I10 | Hecho | Barra border-box, márgenes seguros, texto adaptable, botón envolvente y safe-area. |
| I11 | Hecho | Description, canonical, og:url, pestañas/álbumes/fotos compartibles y restauración de ruta; sitemap canónico. |
| I12 | Hecho | PNG auténticos 192/512 y maskable; manifest corregido, theme/background #121212. |
| M01 | Hecho | SW no guarda HTML principal ni JS ni tarifas; navegación/JS usan no-store. Assets estáticos con respaldo y pantalla offline explícita sin cotización. |
| M02 | Hecho | 404 en español, lang es, identidad visual, Inicio/Galería/Contacto/WhatsApp. |
| M03 | Hecho | Compartir es botón; Web Share o copia al portapapeles, con confirmación visible; enlace visible como último respaldo. |
| M04 | Hecho | Icono mural reemplazado por fa-paint-roller; eliminados constructor, CSS y listener de selectores personalizados. setupSelect queda solo como adaptador nativo. |
| M05 | Hecho | Tasas >0, timeout de 6 s por proveedor, fecha/hora Paraguay y aviso de conversión orientativa o respaldo estimado. |
| M06 | Hecho | Portadas en color, imágenes contain, alt descriptivos sin fichas inventadas. |

Además: ciudad visible y contacto general con el mismo WhatsApp; notas y navegación más legibles; inputs de 16px; prefers-reduced-motion; portadas lazy; enlaces externos con noopener noreferrer; información de consulta y transferencia a WhatsApp, sin suplantar una política legal completa.

## Decisiones que conviene conocer

1. **I03 modifica el resultado de personalizados coincidentes**: Realista/Óleo/Retrato 30×40 ahora vale 980.000 ₲ tanto en lista como en Personalizado, usando la matriz existente (antes la ruta personalizada daba 720.000 ₲). No se cambió la matriz. Medidas no estándar siguen usando la fórmula original.
2. Las medidas manuales se admiten de **0,1 a 500 cm** por dimensión, o su equivalente en pulgadas/metros. Las dimensiones estándar siguen las opciones originales. Los límites evitan valores absurdos y deben revisarse si se ofrecen piezas mayores.
3. Hexagonal se define como hexágono regular, **ancho máximo entre vértices opuestos**. Se conserva la tarifación original por formato; no se inventó una fórmula de área nueva.
4. Digital Simple y Digital Compleja quedan con una única condición: **contado al aprobar la muestra**. Restauración física continúa A evaluar. Se mantienen los importes originales.
5. Se conserva el multiplicador IVA ×1,10 y recargo tarjeta +5 %. No se afirmó obligación legal nueva. Confirmar política fiscal y comercial con el responsable antes de publicar.
6. Edad mínima 8; se rechazan edades no enteras o mayores de 120 como validación básica. No se añadieron datos de menores ni formularios de responsables.
7. Sitemap incluye solo la portada: las anclas no son documentos canónicos distintos y por eso no se duplican como páginas en sitemap.
8. La ciudad se tomó del destino del enlace de mapa ya existente, verificado en la auditoría previa: Las Residentas 460, Fernando de la Mora. No se añadió un contacto nuevo.
9. El modo offline no presenta presupuestos: evita usar tarifas almacenadas. El hosting y proveedores externos todavía pueden afectar disponibilidad. La instalación PWA debe comprobarse en dispositivos reales.
10. La ficha de obra completa, testimonios y datos editoriales adicionales no se inventaron. La galería y sus URL externas se conservaron.

## Pruebas y resultados

`pruebas.cjs` ejecuta Node/JSDOM con red simulada y aperturas de WhatsApp interceptadas. No envía mensajes. Resultado final: **10/10 OK**:

1. Óleo 30×40 → Carbonilla: sin excepción; vuelve a placeholder válido.
2. Retrato con 2 personas y 1 mascota extra → Paisaje: pasa de 1.500.000 a 980.000 ₲, sin cargos ocultos.
3. 50×70 CM → IN → M → CM: conserva dimensiones y precio.
4. Estándar 30×40 y personalizado 30×40 / 40×30: mismo precio.
5. Circular: mensaje de WhatsApp indica diámetro, no incluye alto antiguo.
6. Factura: 980.000 + 98.000 IVA = 1.078.000 ₲; leyenda IVA incluido.
7. Digital y Digital Compleja: pago oculto, contado al aprobar muestra en interfaz y texto preparado.
8. Revisión estática CSS desktop y estado DOM: flex solo para activos, inactivos hidden.
9. Inscripción vacía o menor de 8: bloqueada; edad 8 con nombre permite preparar consulta.
10. Alt, selectores nativos, labels y ruta profunda de foto restaurados correctamente.

`integracion.cjs`: prueba separada con los scripts en elementos independientes y handlers del HTML activados; verifica onchange, clics de pestaña/álbum/obra y Escape. **OK, sin errores de ejecución capturados**.

También se verificaron sintaxis de los cuatro archivos JS, PNG reales/dimensiones, 159 imágenes con alt y recursos locales referenciados. Los resultados estructurados están en `resultados-pruebas.json`.

Repetir: Node 20+ recomendado; ejecutar `npm install` y `npm test` en esta carpeta. En la máquina de trabajo ya existe JSDOM y los runners contemplan esa instalación como respaldo local.

## Límites y comprobaciones antes de publicar

No hubo navegador gráfico ni teléfono real. Falta verificar apariencia final en 320/360/390/768 px, Safari iOS, Android, lector de pantalla, portapapeles/Web Share, descarga de fuentes y la instalación/actualización real de PWA. Las pruebas de SW fueron de sintaxis y revisión de política, no una simulación completa de caché del navegador.

Mantener respaldo de los archivos actuales. Publicar los 15 archivos de forma coordinada: index depende de interfaz.js, mejoras.js y style.css. Luego probar en sesión nueva y revisar actualización del service worker; evitar dejar parte del paquete antiguo mezclada con archivos nuevos. Confirmar en WhatsApp el texto preparado, sin enviarlo, antes de usarlo con clientes. El despliegue no se realizó en esta tarea.

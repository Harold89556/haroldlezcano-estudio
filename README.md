# Harold Lezcano | Estudio de Arte

Sitio en HTML, CSS y JavaScript, en español de Paraguay. Mantiene el cotizador, los cursos y las 152 fotos originales de Postimg. No requiere compilación para publicarse. Neocities quedará como acceso al nuevo sitio; **esta versión no modifica Neocities**.

## Sitio y fotos de referencia

El cotizador permite elegir hasta **5 imágenes de 8 MB cada una**, verlas y quitarlas, o pedir asesoramiento sin fotos. Acepta imágenes habituales (no SVG ni documentos). Las vistas previas son locales: todavía no se suben.

Al pulsar **Consultar por WhatsApp**, se suben primero a Storage en `referencias/{fecha_uuid}/{uuid_nombre}`. Se agregan los enlaces HTTPS al mensaje, que el cliente revisa y envía en WhatsApp. `wa.me` no adjunta archivos. Si falla la carga, se conserva la selección y **no se abre un mensaje sin esas imágenes**. Los enlaces ya obtenidos se reutilizan al reintentar dentro de la misma página. Hay un enlace alternativo si el navegador bloquea la ventana.

**Privacidad:** las referencias no se incorporan a la galería. Son públicas para quien tenga el enlace; no deben cargarse documentos ni información sensible. Quitar una vista previa no borra un archivo ya subido. El administrador puede borrar referencias desde Storage. Se recomienda definir un plazo de retención y limpiar cargas abandonadas.

## Galería y administración

`/admin.html` es el back-office del estudio. Usa Firebase Auth con correo/contraseña y sesión limitada al navegador. Solo **henro89@gmail.com con correo verificado** puede editar; la restricción se aplica también en las reglas, no solo en la pantalla. No hay registro público de administradores. Recuperación y verificación de correo tienen confirmación previa.

- Fotos: subir hasta 10 por carga, asignar categoría, agregar texto opcional escrito por Harold, ordenar, cambiar portada u ocultar. Las nuevas fotos se pueden borrar de Firestore y Storage. Las originales se ocultan mediante un registro de modificación, sin borrar Postimg ni el archivo semilla. El panel muestra archivos pendientes si una carga/borrado no pudo completarse.
- Categorías: crear y cambiar nombres conservando identificadores y enlaces.
- Precios: formularios numéricos para toda `MATRIZ_PRECIOS` (óleo, carbonilla, extras y marcos), `ESCULTURA_TIPOS` (Busto, Medio cuerpo, Figura completa, Relieve), factores, restauración, tarjeta, IVA, seña, cuotas, cambio de respaldo y cursos. Persisten en **`config/precios`**. El público usa esa configuración si es válida y, si falta o no responde Firebase, los valores originales de `estudio-datos.js`. El panel bloquea la edición si no pudo leer datos existentes para evitar sobrescribirlos por accidente. Las páginas públicas leen cambios al abrir/recargar.
- Textos y contacto: WhatsApp, mapa, biografía, introducción y contenido existente de cursos, dirección y condiciones. Guardados en **`config/sitio`**, como texto sin HTML. No se generan títulos de obras ni testimonios.

El óleo realista 30×40/40×30 parte de **700.000 ₲**. Murales siempre **A consultar**, sin importe numérico. Las esculturas se cotizan como pieza modelada a mano, sin fundición. No se muestran porcentajes en los selects.

## Datos y archivos principales

- `index.html`, `style.css`, `cotizador.js`, `interfaz.js`, `mejoras.js`: sitio y flujo previo.
- `estudio-datos.js`: valores originales y validadores compartidos.
- `estudio.js`: selección, vistas previas, carga y mezcla de galería.
- `firebase-config.js`: configuración **pública** de la app web del proyecto `harold-lezcano-estudio`; no es una clave privada. `firebase-config.example.js` sirve de plantilla.
- `firebase-client.js`: SDK modular oficial, cargado a demanda desde CDN. Sin dependencias de producción de npm.
- `admin.html`, `admin.js`: back-office.
- `galeria-seed.json`: las mismas **152 fotos**, con IDs estables `seed-001`…`seed-152`, sin inventar títulos. El HTML conserva también las imágenes como respaldo. `galeria/{id}` se mezcla sobre la semilla: nuevas fotos se suman y registros con ID de semilla pueden recategorizar/ocultar sin duplicar.
- `config/categorias`: `{items:[{id,name}]}`. `galeria/{id}`: `{url,category,caption,alt,order,cover,hidden,storagePath}`.
- `firebase.json`, `firestore.rules`, `storage.rules`, `firestore.indexes.json`: Hosting, Firestore y Storage preparados. Los archivos de trabajo, pruebas, originales y volcados de Instagram no se sirven desde Hosting.

## Activación pendiente (no realizada por este cambio)

1. En el proyecto existente **harold-lezcano-estudio**, habilitar Firestore en modo nativo compatible con SDK Firebase, preferentemente **southamerica-east1** si todavía no fue creado; comprobar disponibilidad antes de elegir. No se ha creado ni seleccionado una base desde este repositorio.
2. Habilitar Storage para `harold-lezcano-estudio.firebasestorage.app`. Confirmar requisitos vigentes de plan/facturación antes de activar servicios; no se aceptaron condiciones ni se contrataron servicios.
3. Habilitar **Email/Password**, crear previamente la cuenta administradora, definir su contraseña de forma privada y **verificar su correo**. Autorizar los dominios de Hosting necesarios en Auth. No guardar contraseñas en GitHub.
4. Revisar y probar las reglas en emuladores. Storage permite lectura individual pública; referencias permite solo **crear** imágenes de hasta 8 MB, nunca sobrescribir, listar públicamente ni borrar sin administrador. Otras rutas quedan denegadas. Galería y configuración solo admiten escrituras del administrador verificado.
5. Antes de abrir al público, evaluar **App Check, monitoreo, alertas de consumo y limpieza de referencias**. El límite de 5 archivos es del navegador, no un límite global. Las reglas por sí solas no pueden impedir cargas automatizadas ilimitadas ni verificar el contenido real de un archivo más allá de su MIME y tamaño. Para cuotas por usuario/IP o validación profunda se necesita un backend. La lectura pública por enlace es una decisión explícita para WhatsApp.
6. Cuando se autorice el despliegue: `npx -y firebase-tools@latest deploy --only hosting,firestore:rules,storage --project harold-lezcano-estudio`. El sitio de Hosting configurado es `harold-lezcano-estudio`, previsto en `https://harold-lezcano-estudio.web.app/`. **No se ejecutó deploy, selección/creación de proyecto ni aceptación de condiciones.** No hace falta sembrar Firestore para mostrar las fotos originales; guardar desde el panel crea solo los documentos necesarios.
7. Comprobar en producción una carga, apertura/revisión del mensaje, acceso administrador y cambios de precio/galería. Solo después, cambiar Neocities para que sea la entrada al nuevo sitio.

## Instagram

`galeria-instagram/` se excluye de Git y Hosting. Las fotos descargadas deben revisarse y cargarse al Storage mediante el administrador con la categoría adecuada, dejando vacíos los textos salvo que Harold los escriba. No se subió un volcado ni se inventaron títulos. La galería puede sumar esas fotos sin reemplazar las originales. No se hizo una importación automática a Firestore en este cambio.

## Pruebas locales

Node 20+ (se verificó con Node 24). `npm ci`, luego:

```sh
npm run check
npm test
npx playwright install chromium
npm run test:browser
npm run test:sdk
```

Las pruebas de navegador usan un servidor temporal local y Firebase simulado: no escriben en servicios reales ni envían WhatsApp/correos. `test:sdk` comprueba además la inicialización real de las APIs del CDN, sin acceder a datos del proyecto. Para reglas, Java 21+ y los emuladores:

```sh
npm run test:rules
```

Ese comando usa únicamente el proyecto ficticio `demo-harold-estudio`, no el proyecto real. Se incluyen casos de acceso anónimo, otras cuentas, administrador no verificado/verificado, lectura pública, límites de imágenes, sobreescritura y borrado. La ejecución de emuladores quedó pendiente en el entorno de implementación por ausencia de Java (la instalación desde Debian falló).

No subir `.env`, credenciales de servidor, claves privadas, `originales/`, `publicar-harold.zip`, `node_modules/` ni `galeria-instagram/`.

Referencias técnicas: [SDK modular](https://firebase.google.com/docs/web/learn-more), [correo y contraseña](https://firebase.google.com/docs/auth/web/password-auth), [reglas de Storage](https://firebase.google.com/docs/storage/security/rules-conditions).

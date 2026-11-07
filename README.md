# Harold Lezcano | Estudio de Arte

Sitio en HTML, CSS y JavaScript, en español de Paraguay. Mantiene el cotizador, los cursos y las 152 fotos originales de Postimg. No requiere compilación para publicarse. Neocities quedará como acceso al nuevo sitio; **esta versión no modifica Neocities**.

## Sitio y fotos de referencia

El cotizador permite elegir hasta **5 imágenes de 8 MB cada una**, verlas y quitarlas, o pedir asesoramiento sin fotos. Acepta imágenes habituales (no SVG ni documentos). Las vistas previas son locales.

Al pulsar **Consultar por WhatsApp** en un celular, el navegador comparte el mensaje y las fotos adjuntas (Web Share), para enviarlas por WhatsApp. El enlace `wa.me` no puede adjuntar archivos; por eso, si el navegador no permite compartir archivos (suele pasar en la computadora), se abre el chat con el pedido y el cliente envía las fotos en ese mismo chat. Hay un botón **Compartir fotos por WhatsApp** cuando el navegador sí puede adjuntarlas, y un enlace alternativo si hace falta reabrir el chat.

**Privacidad:** las referencias no se incorporan a la galería ni se suben a Storage. Van solo al chat de WhatsApp que el cliente envía.

## Galería y administración

`/admin.html` es el back-office del estudio. Usa Firebase Auth con correo/contraseña y sesión limitada al navegador. Solo **henro89@gmail.com con correo verificado** puede editar; la restricción se aplica también en las reglas, no solo en la pantalla. No hay registro público de administradores. Recuperación y verificación de correo tienen confirmación previa. Ingresar con la misma cuenta y contraseña ya guardada del administrador: después de Firebase, el panel abre la sesión de Supabase con esa contraseña. En el primer ingreso crea el usuario de Supabase; el trigger existente solo permite y confirma `henro89@gmail.com`. No hay una página de alta pública. Supabase conserva su sesión y renueva tokens; al salir se cierran ambas sesiones. Si venció la sesión de fotos, salir y entrar nuevamente. Si se cambia/restablece la contraseña en Firebase después de crear el usuario de Supabase, hay que actualizar también la de Supabase: son proveedores independientes, no una sincronización de contraseñas.

- Fotos: subir hasta 10 por carga, asignar categoría, agregar texto opcional escrito por Harold, ordenar, cambiar portada u ocultar. Las fotos NUEVAS se suben a **Supabase Storage**, bucket público `fotos`, proyecto exclusivo `harold-lezcano-estudio` (`fbeihokebuekvqsfvnjv`), en el plan gratuito: no hace falta Firebase Storage ni Blaze. Se aceptan JPG, PNG, WEBP, GIF y AVIF de hasta 8 MB; convertir HEIC/HEIF/BMP/TIFF antes de subir. La metadata sigue en Firestore; se pueden borrar documento y archivo de Supabase. Las 152 originales y el catálogo de Instagram siguen con sus URLs y archivos actuales del sitio; solo se ocultan o recategorizan, sin borrar `seed-*` ni `ig-*`. El panel muestra archivos pendientes si una carga/borrado no pudo completarse.
- Categorías: crear y cambiar nombres conservando identificadores y enlaces.
- Precios: formularios numéricos para toda `MATRIZ_PRECIOS` (óleo, carbonilla, extras y marcos), `ESCULTURA_TIPOS` (Busto, Medio cuerpo, Figura completa, Relieve), factores, restauración, tarjeta, IVA, seña, cuotas, cambio de respaldo y cursos. Persisten en **`config/precios`**. El público usa esa configuración si es válida y, si falta o no responde Firebase, los valores originales de `estudio-datos.js`. El panel bloquea la edición si no pudo leer datos existentes para evitar sobrescribirlos por accidente. Las páginas públicas leen cambios al abrir/recargar.
- Textos y contacto: WhatsApp, mapa, biografía, introducción y contenido existente de cursos, dirección y condiciones. Guardados en **`config/sitio`**, como texto sin HTML. No se generan títulos de obras ni testimonios.

El óleo realista 30×40/40×30 parte de **700.000 ₲**. Murales siempre **A consultar**, sin importe numérico. Las esculturas se cotizan como pieza modelada a mano, sin fundición. No se muestran porcentajes en los selects.

## Datos y archivos principales

- `index.html`, `style.css`, `cotizador.js`, `interfaz.js`, `mejoras.js`: sitio y flujo previo.
- `estudio-datos.js`: valores originales y validadores compartidos.
- `estudio.js`: selección, vistas previas, carga y mezcla de galería.
- `firebase-config.js`: configuración **pública** de la app web del proyecto `harold-lezcano-estudio`; no es una clave privada. `firebase-config.example.js` sirve de plantilla.
- `firebase-client.js`: conserva la API del administrador; Firebase Auth + Firestore y cliente Supabase oficial cargados a demanda desde CDN. Sin Firebase Storage ni dependencias de producción de npm.
- `supabase-config.js`: URL y clave **pública publishable**, no una clave secreta; plantilla en `supabase-config.example.js`. Nunca incluir claves de servidor.
- `supabase/schema.sql`: documentación del esquema existente verificado (admins, RLS, bucket, funciones y trigger). No es una migración pendiente ni debe ejecutarse sobre otro proyecto.
- `admin.html`, `admin.js`: back-office.
- `galeria-seed.json`: las mismas **152 fotos**, con IDs estables `seed-001`…`seed-152`, sin inventar títulos. El HTML conserva también las imágenes como respaldo. `galeria/{id}` se mezcla sobre la semilla: nuevas fotos se suman y registros con ID de semilla pueden recategorizar/ocultar sin duplicar.
- `config/categorias`: `{items:[{id,name}]}`. `galeria/{id}`: `{url,category,caption,alt,order,cover,hidden,storagePath}`.
- `firebase.json`, `firestore.rules`, `firestore.indexes.json`: Hosting y Firestore. `storage.rules` y sus pruebas de emulador son legado, no se usan ni se despliegan para estas cargas. Los archivos de trabajo, pruebas, SQL, originales y volcados de Instagram no se sirven desde Hosting.

## Servicios y publicación

Firebase Auth (Email/Password, administrador verificado) y Firestore mantienen el acceso y la metadata. Supabase del estudio ya tiene el bucket público `fotos`, límite de 8 MB y MIME de imagen permitidos. Solo el administrador autenticado puede listar, subir, modificar o borrar archivos según `public.es_admin()`; las URLs públicas HTTPS se ven sin login. El trigger `preparar_admin_estudio` restringe el alta a la cuenta del estudio. No se recreó el backend ni se ejecutaron migraciones para este cambio.

Las referencias del cotizador siguen exclusivamente por WhatsApp (Web Share o adjunto manual), nunca se suben a ninguno de los dos almacenamientos. No hace falta sembrar Firestore ni migrar la galería original/Instagram. `galeria-ig.json` mantiene el catálogo existente; los volcados de trabajo `galeria-instagram/` siguen excluidos.

Publicar **solo Hosting**, sin activar ni desplegar Firebase Storage, ni aceptar Blaze:

```sh
npx -y firebase-tools@latest deploy --only hosting --project harold-lezcano-estudio
```

Administrador: https://harold-lezcano-estudio.web.app/admin.html. Revisar consumo del plan gratuito de Supabase y límites vigentes: gratuito no significa capacidad ilimitada. No cambiar Neocities como parte de esta tarea.

## Pruebas locales

Node 20+ (se verificó con Node 24). `npm ci` y `npx playwright install chromium` (necesario para las pruebas del transporte), luego:

```sh
npm run check
npm test
npx playwright install chromium
npm run test:browser
npm run test:sdk
npm run test:storage
```

Las pruebas de navegador usan un servidor temporal local y Firebase simulado: no escriben en servicios reales ni envían WhatsApp/correos. `test:sdk` comprueba además la inicialización real de las APIs del CDN, sin acceder a datos del proyecto. Las pruebas `test:storage` verifican login dual de archivos, alta inicial, rutas, formatos, progreso, mensajes de errores RLS y borrado con SDKs simulados sin escribir en Supabase. Para reglas históricas de Firebase, Java 21+ y los emuladores:

```sh
npm run test:rules
```

Ese comando usa únicamente el proyecto ficticio `demo-harold-estudio`, no el proyecto real. Se incluyen casos de acceso anónimo, otras cuentas, administrador no verificado/verificado, lectura pública, límites de imágenes, sobreescritura y borrado. La ejecución de emuladores quedó pendiente en el entorno de implementación por ausencia de Java (la instalación desde Debian falló).

No subir `.env`, credenciales de servidor, claves privadas, `originales/`, `publicar-harold.zip`, `node_modules/` ni `galeria-instagram/`.

Referencias técnicas: [SDK modular](https://firebase.google.com/docs/web/learn-more), [correo y contraseña](https://firebase.google.com/docs/auth/web/password-auth), [subida a Supabase](https://supabase.com/docs/reference/javascript/storage-from-upload).

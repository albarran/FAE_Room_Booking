// ╭──────────────────────────────────────────────────────────╮
// │ Reserva Espacios FAE — Configuración del backend         │
// │ EDITAR TODO LO DE ESTE FICHERO al hacer fork.            │
// ╰──────────────────────────────────────────────────────────╯

// ID de la Google Sheet (URL: .../d/<SHEET_ID>/edit).
const SHEET_ID = '15un5CC9Qboc3OsAoe1yhXkdC9mwLeNcQhkb7Jr_DGJw';

// Emails con permisos de administrador.
// Admin = puede cancelar cualquier reserva, ver/eliminar usuarios y gestionar
// la allowlist.
//
// Para añadir más admins: añade el email a este array, p.ej.:
//   const ADMIN_EMAILS = [
//     'pedro.albarran@gmail.com',
//     'otro@gcloud.ua.es',
//   ];
//
// Después desplegar el cambio (en fish):
//   cd ~/Github/reserva_espacios_FAE/apps_script
//   clasp push
//   set ID AKfycby1-bZ0plQbpW6gTfgT0mdrYmf__zGfHNvQVMGhnZcT8iJ79MhUOBtrqNR6AxxkEZnC
//   clasp create-deployment --deploymentId $ID -d "add admin <email>"
//
// El `-d` es solo una etiqueta interna en Apps Script (puedes poner cualquier
// texto descriptivo, ej. "add admin juan", "v3", "remove old admin"). Aparece
// en Deploy → Manage deployments. No afecta a la URL ni al frontend.
const ADMIN_EMAILS = ['pedro.albarran@gmail.com'];

// OAuth Client ID creado en Google Cloud Console (Web application).
const GOOGLE_CLIENT_ID = '626032110486-21n999lfth0jf48373g4ttb97jrt5eq1.apps.googleusercontent.com';

// Dominios que se autentican con Google (sin contraseña).
const GOOGLE_AUTH_DOMAINS = ['gcloud.ua.es', 'gmail.com'];

// Dominios sin Google Workspace → contraseña en la app.
const PASSWORD_DOMAINS = ['ua.es'];

// Dominios auto-permitidos (no requieren estar en `allowlist`).
// Cualquier email de estos dominios puede registrarse / autenticarse.
const AUTO_ALLOWED_DOMAINS = ['gcloud.ua.es', 'ua.es', 'gmail.com'];

// Duración de la sesión password (en ms).
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

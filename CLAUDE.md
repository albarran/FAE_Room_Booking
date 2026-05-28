# Reserva de Espacios — FAE

Sistema de reserva de despachos y salas de reunión del Departamento de Fundamentos del Análisis Económico (UA).
Desarrollado inicialmente con Claude en claude.ai, continuable con Claude Code CLI.

---

## Arquitectura

### Stack
- **Frontend**: HTML/CSS/JS puro. Un único fichero `index.html`. Sin frameworks, sin build step.
- **Backend**: Google Apps Script desplegado como Web App (API REST).
- **Base de datos**: Google Sheets (3 pestañas: `users`, `bookings`, `allowlist`).
- **Hosting**: GitHub Pages (`https://albarran.github.io/reserva_espacios_FAE/`).

### Ficheros del repo
```
reserva_espacios_FAE/
├── index.html      # Toda la app (frontend completo)
├── CLAUDE.md       # Este fichero — contexto para Claude Code
└── README.md       # Instrucciones de uso para el departamento
```

El código del Apps Script vive en Google Drive, no en este repo.

---

## Google Sheet (base de datos)

**ID**: `15un5CC9Qboc3OsAoe1yhXkdC9mwLeNcQhkb7Jr_DGJw`
**URL**: https://docs.google.com/spreadsheets/d/15un5CC9Qboc3OsAoe1yhXkdC9mwLeNcQhkb7Jr_DGJw/edit
**Propietario**: pedro.albarran@gmail.com

⚠️ **IMPORTANTE — Seguridad**: la Sheet tiene acceso **Restringido** (solo el propietario).
Nunca cambiar a "Cualquiera con el enlace". El ID de la Sheet solo debe aparecer
en el Apps Script (que corre en servidores de Google) y en este CLAUDE.md (privado).
Nunca incluir el ID en el README ni en ningún fichero público del repo.

### Schema

**users**: `email | name | pass`
**bookings**: `room | date | start | end | email | note`
**allowlist**: `email`

⚠️ Las contraseñas se almacenan en texto plano. Suficiente para uso interno departamental.
Pendiente: migrar a hash SHA-256 en cliente antes de enviar.

---

## Google Apps Script (backend)

**URL del Web App**:
```
https://script.google.com/macros/s/AKfycby1-bZ0plQbpW6gTfgT0mdrYmf__zGfHNvQVMGhnZcT8iJ79MhUOBtrqNR6AxxkEZnC/exec
```

Para editar:
1. Abrir la Sheet → Extensiones → Apps Script
2. Editar el código
3. Guardar → Implementar → Administrar implementaciones → Nueva versión
4. Si cambia la URL, actualizar la constante `API` en `index.html`

### Código completo del Apps Script

```javascript
const SHEET_ID = '15un5CC9Qboc3OsAoe1yhXkdC9mwLeNcQhkb7Jr_DGJw';
const ADMIN_EMAILS = ['pedro.albarran@gmail.com'];

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
  }
  return sheet;
}

function doGet(e) { return handleRequest(e); }
function doPost(e) { return handleRequest(e); }

function handleRequest(e) {
  const body = e.postData ? JSON.parse(e.postData.contents || '{}') : {};
  const action = e.parameter.action || body.action;
  let result;
  try {
    switch (action) {
      case 'login':           result = login(body); break;
      case 'register':        result = register(body); break;
      case 'getBookings':     result = getBookings(body); break;
      case 'addBooking':      result = addBooking(body); break;
      case 'deleteBooking':   result = deleteBooking(body); break;
      case 'getUsers':        result = getUsers(body); break;
      case 'deleteUser':      result = deleteUser(body); break;
      case 'getAllowlist':     result = getAllowlist(body); break;
      case 'addAllowlist':    result = addAllowlist(body); break;
      case 'removeAllowlist': result = removeAllowlist(body); break;
      default: result = { error: 'Unknown action' };
    }
  } catch(err) {
    result = { error: err.toString() };
  }
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function login({ email, pass }) {
  const sheet = getOrCreateSheet('users', ['email','name','pass']);
  const data = sheet.getDataRange().getValues();
  const row = data.find(r => r[0] === email && r[2] === pass);
  if (!row) return { error: 'Credenciales incorrectas' };
  return { ok: true, name: row[1], email: row[0], isAdmin: ADMIN_EMAILS.includes(email) };
}

function register({ email, name, pass }) {
  const allowSheet = getOrCreateSheet('allowlist', ['email']);
  const allowed = allowSheet.getDataRange().getValues().flat();
  if (!allowed.includes(email)) return { error: 'Email no autorizado' };
  const sheet = getOrCreateSheet('users', ['email','name','pass']);
  const data = sheet.getDataRange().getValues();
  if (data.find(r => r[0] === email)) return { error: 'Email ya registrado' };
  sheet.appendRow([email, name, pass]);
  return { ok: true };
}

function getBookings({ room }) {
  const sheet = getOrCreateSheet('bookings', ['room','date','start','end','email','note']);
  const data = sheet.getDataRange().getValues().slice(1);
  const result = data
    .filter(r => !room || r[0] === room)
    .map(r => ({ room: r[0], date: r[1], start: r[2], end: r[3], email: r[4], note: r[5] }));
  return { bookings: result };
}

function addBooking({ room, date, start, end, email, note }) {
  const sheet = getOrCreateSheet('bookings', ['room','date','start','end','email','note']);
  const data = sheet.getDataRange().getValues().slice(1);
  const conflict = data.find(r => r[0]===room && r[1]===date && r[2]<end && r[3]>start);
  if (conflict) return { error: 'Solapa con otra reserva' };
  sheet.appendRow([room, date, start, end, email, note || '']);
  return { ok: true };
}

function deleteBooking({ room, date, start, end, email, requester }) {
  const isAdmin = ADMIN_EMAILS.includes(requester);
  if (!isAdmin && requester !== email) return { error: 'Sin permiso' };
  const sheet = getOrCreateSheet('bookings', ['room','date','start','end','email','note']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]===room && data[i][1]===date && data[i][2]===start && data[i][3]===end && data[i][4]===email) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  return { error: 'Reserva no encontrada' };
}

function getUsers({ requester }) {
  if (!ADMIN_EMAILS.includes(requester)) return { error: 'Sin permiso' };
  const sheet = getOrCreateSheet('users', ['email','name','pass']);
  const data = sheet.getDataRange().getValues().slice(1);
  return { users: data.map(r => ({ email: r[0], name: r[1] })) };
}

function deleteUser({ email, requester }) {
  if (!ADMIN_EMAILS.includes(requester)) return { error: 'Sin permiso' };
  const sheet = getOrCreateSheet('users', ['email','name','pass']);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) { sheet.deleteRow(i + 1); return { ok: true }; }
  }
  return { error: 'Usuario no encontrado' };
}

function getAllowlist({ requester }) {
  if (!ADMIN_EMAILS.includes(requester)) return { error: 'Sin permiso' };
  const sheet = getOrCreateSheet('allowlist', ['email']);
  return { allowlist: sheet.getDataRange().getValues().flat().filter(Boolean) };
}

function addAllowlist({ email, requester }) {
  if (!ADMIN_EMAILS.includes(requester)) return { error: 'Sin permiso' };
  const sheet = getOrCreateSheet('allowlist', ['email']);
  const existing = sheet.getDataRange().getValues().flat();
  if (existing.includes(email)) return { error: 'Ya existe' };
  sheet.appendRow([email]);
  return { ok: true };
}

function removeAllowlist({ email, requester }) {
  if (!ADMIN_EMAILS.includes(requester)) return { error: 'Sin permiso' };
  const sheet = getOrCreateSheet('allowlist', ['email']);
  const data = sheet.getDataRange().getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === email) { sheet.deleteRow(i + 1); return { ok: true }; }
  }
  return { error: 'No encontrado' };
}

function setup() {
  getOrCreateSheet('users', ['email','name','pass']);
  getOrCreateSheet('bookings', ['room','date','start','end','email','note']);
  const al = getOrCreateSheet('allowlist', ['email']);
  if (al.getLastRow() < 2) al.appendRow(['pedro.albarran@gmail.com']);
}
```

### Endpoints

Todas las llamadas son POST con body JSON `{action, ...params}`.

| Action | Params | Descripción |
|--------|--------|-------------|
| `login` | `email, pass` | Autentica usuario |
| `register` | `email, name, pass` | Crea cuenta (requiere estar en allowlist) |
| `getBookings` | `room?` | Devuelve todas las reservas (o filtradas por espacio) |
| `addBooking` | `room, date, start, end, email, note` | Crea reserva (valida solapamientos) |
| `deleteBooking` | `room, date, start, end, email, requester` | Borra reserva (solo dueño o admin) |
| `getUsers` | `requester` | Lista usuarios (solo admin) |
| `deleteUser` | `email, requester` | Elimina usuario y sus reservas |
| `getAllowlist` | `requester` | Lista emails autorizados (solo admin) |
| `addAllowlist` | `email, requester` | Añade email a allowlist (solo admin) |
| `removeAllowlist` | `email, requester` | Quita email de allowlist (solo admin) |

---

## Autenticación y permisos

- **Allowlist**: solo emails en la pestaña `allowlist` de la Sheet pueden registrarse.
- **Admin**: definido en `ADMIN_EMAILS` en el Apps Script. Admin actual: `pedro.albarran@gmail.com`.
- Para añadir admins: modificar el array `ADMIN_EMAILS` en el Apps Script y redesplegar.
- Los emails pueden ser de cualquier dominio: `@gmail.com`, `@ua.es`, `@gcloud.ua.es`, etc.

---

## Espacios configurados

Definidos en el array `ROOMS` dentro de `index.html`:

| ID | Código | Nombre | Notas |
|----|--------|--------|-------|
| r1 | 0034PS066 | Ciencias Sociales 066 | Para visitantes de seminarios hasta octubre. |
| r2 | 0034P2015 | Sala del café | Movimiento a las 9h y 13h. |
| r3 | 0036PS067 | Germán Bernacer 067 | Principal para seminarios oct/nov. |
| r4 | 0034PS105 | Zulo | Solo emergencias. Sin ventanas. |

## Seminarios bloqueados

Definidos en el array `SEMINARS` dentro de `index.html` (hardcoded, no en la Sheet).
Para añadir seminarios: editar el array `SEMINARS` en `index.html`.

| ID | Espacio | Fecha | Horario | Ponente |
|----|---------|-------|---------|---------|
| — | r1 | 2026-06-03 | 14:30–16:00 | Gunes Gokmen |
| — | r1 | 2026-06-04 | 14:30–16:00 | Lukas Hack |
| — | r1 | 2026-06-11 | 14:30–16:00 | Marta Morazzoni |
| — | r1 | 2026-09-23 | 14:30–16:00 | Juan Vargas |
| — | r3 | 2026-10-14 | 14:30–16:00 | Olivier Marie |
| — | r3 | 2026-11-17 | 14:30–16:00 | Oskar Skans |

---

## Estado del frontend

### Pantallas
- `screen-login` — Login con email y contraseña
- `screen-register` — Registro de cuenta nueva
- `screen-overview` — Vista principal: Espacios (tarjetas) / Mes (4 espacios) / Semana (4 espacios)
- `screen-room` — Detalle de un espacio con vistas Día / Semana / Mes
- `screen-admin` — Panel admin: Usuarios / Reservas / Emails permitidos

### Estado global (`S`)
```js
S = {
  user: null,           // { email, name, isAdmin }
  bookings: [],         // reservas de usuarios cargadas desde la Sheet
  userNames: {},        // cache email → nombre
  ovView: 'rooms',      // vista overview: 'rooms' | 'month' | 'week'
  ovMonth, ovYear,      // mes actual en overview
  ovWeekStart,          // Date del lunes de la semana en overview
  room: null,           // id del espacio activo ('r1'–'r4')
  roomView: 'month',    // vista room: 'day' | 'week' | 'month'
  roomMonth, roomYear,
  roomWeekStart,
  roomDay,              // string 'YYYY-MM-DD' para vista diaria
  selectedDate,         // fecha seleccionada (panel de reservas)
}
```

---

## Pendiente / Roadmap

- [ ] Login con Google OAuth (elimina contraseñas de la Sheet)
- [ ] Mostrar nombre en lugar de email en slots para usuarios no-admin
- [ ] Mover seminarios a la Sheet para gestión sin editar código
- [ ] Notificaciones por email al reservar/cancelar (Apps Script MailApp)
- [ ] Migrar contraseñas a hash SHA-256 en cliente
- [ ] Soporte para reservas recurrentes
- [ ] Exportar a .ics / Google Calendar

---

## Cómo desplegar cambios

```bash
cd ~/Github/reserva_espacios_FAE
git add .
git commit -m "descripción del cambio"
git push origin main
# GitHub Pages actualiza en ~1 minuto
```

## Cómo continuar con Claude Code

```bash
cd ~/Github/reserva_espacios_FAE
claude
# Claude Code leerá CLAUDE.md automáticamente y tendrá todo el contexto
```

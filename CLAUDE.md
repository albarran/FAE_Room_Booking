# Reserva de Espacios — FAE (Departamento de Economía, UA)

Sistema de reserva de despachos y salas de reunión para el departamento.
Desarrollado inicialmente con Claude en claude.ai, continuable con Claude Code CLI.

---

## Arquitectura

### Stack
- **Frontend**: HTML/CSS/JS puro. Un único fichero `index.html`. Sin frameworks, sin build step.
- **Backend**: Google Apps Script desplegado como Web App (API REST sin autenticación).
- **Base de datos**: Google Sheets (3 pestañas: `users`, `bookings`, `allowlist`).
- **Hosting**: GitHub Pages (`https://<usuario>.github.io/reserva_espacios_FAE/`).

### Ficheros
```
reserva_espacios_FAE/
├── index.html      # Toda la app (frontend completo)
├── CLAUDE.md       # Este fichero — contexto para Claude Code
└── README.md       # Instrucciones de uso para el departamento
```

El código del Apps Script vive en Google Drive, no en este repo.
Ver sección "Backend" más abajo para editarlo.

---

## Espacios configurados

Definidos en el array `ROOMS` dentro de `index.html`:

| ID  | Código      | Nombre                  | Notas |
|-----|-------------|-------------------------|-------|
| r1  | 0034PS066   | Ciencias Sociales 066   | Mejor espacio. Para visitantes de seminarios hasta octubre. |
| r2  | 0034P2015   | Sala del café           | Movimiento a las 9h y 13h. |
| r3  | 0036PS067   | Germán Bernacer 067     | Principal oct/nov. |
| r4  | 0034PS105   | Zulo                    | Solo emergencias. Sin ventanas. |

### Seminarios bloqueados

Definidos en el array `SEMINARS` dentro de `index.html` (hardcoded, no en la Sheet):

| Espacio | Fecha      | Horario     | Ponente         |
|---------|------------|-------------|-----------------|
| r1      | 2026-06-03 | 14:30–16:00 | Gunes Gokmen    |
| r1      | 2026-06-04 | 14:30–16:00 | Lukas Hack      |
| r1      | 2026-06-11 | 14:30–16:00 | Marta Morazzoni |
| r1      | 2026-09-23 | 14:30–16:00 | Juan Vargas     |
| r3      | 2026-10-14 | 14:30–16:00 | Olivier Marie   |
| r3      | 2026-11-17 | 14:30–16:00 | Oskar Skans     |

Para añadir seminarios: editar el array `SEMINARS` en `index.html`.
Para moverlos a la Sheet en el futuro: crear pestaña `seminars` con columnas `room,date,start,end,note` y añadir endpoint `getSeminars` al Apps Script.

---

## Backend (Google Apps Script)

**URL del Web App**:
```
https://script.google.com/macros/s/AKfycby1-bZ0plQbpW6gTfgT0mdrYmf__zGfHNvQVMGhnZcT8iJ79MhUOBtrqNR6AxxkEZnC/exec
```

**Google Sheet ID**: `15un5CC9Qboc3OsAoe1yhXkdC9mwLeNcQhkb7Jr_DGJw`
**URL Sheet**: https://docs.google.com/spreadsheets/d/15un5CC9Qboc3OsAoe1yhXkdC9mwLeNcQhkb7Jr_DGJw/edit

Para editar el Apps Script:
1. Abrir la Sheet → Extensiones → Apps Script
2. Editar el código
3. Guardar → Implementar → Nueva implementación (o nueva versión)
4. Actualizar la constante `API` en `index.html` si cambia la URL

### Endpoints disponibles

Todas las llamadas son POST con body JSON `{action, ...params}`.

| Action           | Params                                          | Descripción |
|------------------|-------------------------------------------------|-------------|
| `login`          | `email, pass`                                   | Autentica usuario |
| `register`       | `email, name, pass`                             | Crea cuenta (requiere estar en allowlist) |
| `getBookings`    | `room?`                                         | Devuelve todas las reservas (o filtradas por espacio) |
| `addBooking`     | `room, date, start, end, email, note`           | Crea reserva (valida solapamientos) |
| `deleteBooking`  | `room, date, start, end, email, requester`      | Borra reserva (solo el dueño o admin) |
| `getUsers`       | `requester`                                     | Lista usuarios (solo admin) |
| `deleteUser`     | `email, requester`                              | Elimina usuario y sus reservas |
| `getAllowlist`   | `requester`                                     | Lista emails autorizados |
| `addAllowlist`   | `email, requester`                              | Añade email a allowlist |
| `removeAllowlist`| `email, requester`                              | Quita email de allowlist |

### Schema de la Sheet

**users**: `email | name | pass`
**bookings**: `room | date | start | end | email | note`
**allowlist**: `email`

⚠️ Las contraseñas se almacenan en texto plano en la Sheet. Suficiente para uso interno departamental, pero no apto para datos sensibles. Si se necesita más seguridad en el futuro, migrar a Firebase Auth o similar.

---

## Autenticación y permisos

- **Allowlist**: solo emails en la pestaña `allowlist` pueden registrarse.
- **Admin**: definido como constante hardcoded en DOS lugares:
  1. `ADMIN_EMAILS` en el Apps Script (controla qué endpoints puede llamar)
  2. El campo `isAdmin` que devuelve el endpoint `login`
- **Admin actual**: `pedro.albarran@gmail.com`
- Para añadir admins: modificar `ADMIN_EMAILS` en el Apps Script Y la lógica de `login`.

---

## Estado del frontend

### Pantallas
- `screen-login` — Login
- `screen-register` — Registro de cuenta nueva
- `screen-overview` — Vista principal con 3 modos: Espacios / Mes / Semana
- `screen-room` — Detalle de un espacio con vistas Día / Semana / Mes
- `screen-admin` — Panel admin con pestañas Usuarios / Reservas / Allowlist

### Estado global (`S`)
```js
S = {
  user: null,           // { email, name, isAdmin }
  bookings: [],         // array de reservas de usuarios (desde Sheet)
  userNames: {},        // cache email->nombre
  ovView: 'rooms',      // vista overview: 'rooms'|'month'|'week'
  ovMonth, ovYear,      // mes actual en overview
  ovWeekStart,          // Date del lunes de la semana en overview
  room: null,           // id del espacio activo en detalle
  roomView: 'month',    // vista room: 'day'|'week'|'month'
  roomMonth, roomYear,  // mes actual en room detail
  roomWeekStart,        // Date del lunes en room week view
  roomDay,              // string 'YYYY-MM-DD' para vista diaria
  selectedDate,         // fecha seleccionada (para panel de reservas)
}
```

---

## Pendiente / Roadmap

- [ ] Mostrar nombre de usuario (no email) en slots para usuarios no-admin
- [ ] Mover seminarios a la Sheet para gestión sin editar código
- [ ] Notificaciones por email al reservar/cancelar (Apps Script MailApp)
- [ ] Vista de confirmación de reserva por email
- [ ] Migrar contraseñas a hash (SHA-256 en cliente antes de enviar)
- [ ] Soporte para reservas recurrentes
- [ ] Exportar calendario a .ics / Google Calendar

---

## Cómo desplegar cambios

```bash
# Editar index.html localmente, luego:
git add index.html
git commit -m "descripción del cambio"
git push origin main
# GitHub Pages actualiza en ~1 minuto
```

## Cómo continuar con Claude Code

```bash
# Instalar Claude Code si no está
npm install -g @anthropic-ai/claude-code

# Entrar al repo y lanzar
cd reserva_espacios_FAE
claude

# Claude Code leerá este CLAUDE.md automáticamente
# y tendrá todo el contexto del proyecto
```

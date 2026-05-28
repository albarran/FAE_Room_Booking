# Setup — Reserva de Espacios (template reusable)

Guía para desplegar una instancia nueva (otro departamento, otra cuenta).
Asume cuenta Google y repo GitHub propios. ~30 min total.

---

## 0. Requisitos

- Node ≥ 14 (para `clasp`).
- Cuenta Google (cualquiera, no hace falta Workspace).
- Cuenta GitHub con Pages habilitado.

---

## 1. Crear la Google Sheet (base de datos)

1. https://sheets.new → renombrar (ej. `Reservas <Departamento>`).
2. Acceso **Restringido** (solo tú). Nunca compartir el link público.
3. Copiar el **Sheet ID** de la URL: `.../d/<SHEET_ID>/edit`.

## 2. Crear el proyecto Apps Script

1. En la Sheet: Extensiones → Apps Script → da nombre al proyecto.
2. URL del editor: `.../d/<SCRIPT_ID>/edit` — copiar el **Script ID**.
3. Habilitar Apps Script API una vez por cuenta:
   https://script.google.com/home/usersettings → toggle ON.

## 3. Crear OAuth Client ID

1. https://console.cloud.google.com/ → proyecto (nuevo o existente).
2. **APIs & Services → OAuth consent screen** → External.
   - User type: External. Scopes: `email`, `profile`, `openid`.
   - En modo Testing añade tus emails de prueba en "Test users".
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Authorized JavaScript origins:
     - `https://<tu-usuario>.github.io`
     - `http://localhost:8000` (opcional, para pruebas)
4. Copiar el **Client ID** (`....apps.googleusercontent.com`).

## 4. Clonar este repo y configurar

```bash
git clone https://github.com/<tu-usuario>/<tu-repo>.git
cd <tu-repo>
```

Editar **dos** ficheros de configuración:

`config.js`:
```js
const API = 'https://script.google.com/macros/s/<DEPLOYMENT>/exec'; // rellenar tras paso 7
const GOOGLE_CLIENT_ID = '<...>.apps.googleusercontent.com';
const GOOGLE_AUTH_DOMAINS = ['gmail.com', '<tu-dominio-google>'];
const ROOMS = [ /* tus espacios */ ];
const SEMINARS = [ /* tus seminarios o [] */ ];
```

`apps_script/Config.gs`:
```js
const SHEET_ID = '<sheet-id-del-paso-1>';
const ADMIN_EMAILS = ['tu-email@tu-dominio'];
const GOOGLE_CLIENT_ID = '<mismo-client-id>';
const GOOGLE_AUTH_DOMAINS = ['gmail.com', '<tu-dominio-google>'];
const PASSWORD_DOMAINS = ['<tu-dominio-sin-google>']; // o []
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
```

## 5. Subir el backend con clasp

```bash
npm install -g @google/clasp
clasp login

cd apps_script
clasp clone <SCRIPT_ID> --rootDir .
# clasp sobrescribe los .gs. Restaurar los del repo:
git checkout Code.gs Config.gs appsscript.json

clasp push
# "Overwrite manifest? Y"
```

## 6. Inicializar la Sheet

```bash
clasp open
```

En el editor que se abre: dropdown de funciones → seleccionar `setup` → Run.
Acepta los permisos OAuth la primera vez. Esto crea pestañas `users`,
`bookings`, `allowlist` y añade tu email a `allowlist`.

Si vienes de una versión vieja (3 cols en `users`): correr también `migrateUsers`.

## 7. Crear el Web App deployment

Editor Apps Script → **Deploy → New deployment**:
- Type: **Web app**
- Description: `v1`
- Execute as: **Me**
- Who has access: **Anyone**
- Deploy → autorizar permisos

Apunta:
- **Deployment ID** (formato `AKfycb...`).
- **Web app URL** (`.../exec`).

Pega la URL en `config.js` → `const API = '<URL>';`.

## 8. Publicar el frontend (GitHub Pages)

```bash
git add -A
git commit -m "Initial setup"
git push origin main
```

En GitHub: Settings → Pages → Source: `main` / `/ (root)` → Save.
App accesible en `https://<usuario>.github.io/<repo>/` en ~1 min.

## 9. Atajo para deploys futuros

```bash
echo 'alias appsdeploy="clasp push && clasp deploy --deploymentId <DEPLOYMENT_ID> -d \"\$(git log -1 --pretty=%s)\""' >> ~/.bashrc
source ~/.bashrc
```

Flujo permanente:
```bash
# editar apps_script/Code.gs o config.js o index.html
git commit -am "msg" && git push
cd apps_script && appsdeploy        # solo si tocaste backend
```

---

## Troubleshooting

**`Google Sign-In sin configurar`** en la pantalla de login →
`GOOGLE_CLIENT_ID` aún tiene el placeholder `TODO_...` en `config.js`.

**`Origin not allowed`** al pulsar el botón Google →
URL del navegador no está en Authorized JavaScript origins. Añadirla en
Cloud Console → Credentials → tu OAuth client → ajustar lista → Save.
Esperar 1–2 min para propagación.

**`Token no autorizado para esta app`** →
`GOOGLE_CLIENT_ID` en `apps_script/Config.gs` no coincide con el de `config.js`.
Deben ser idénticos.

**`Email no autorizado por el administrador`** →
El email no está en la pestaña `allowlist`. Loguearse como admin → Admin → Emails permitidos → Añadir.

**Cambios en `Code.gs` no se reflejan** →
Falta `clasp deploy --deploymentId <ID>` tras `clasp push`. Sin `deploy`, el código está en Drive pero la URL `/exec` sirve la versión anterior.

**`clasp push` pide login repetidamente** →
Habilitar Apps Script API en https://script.google.com/home/usersettings.

// ╭──────────────────────────────────────────────────────────╮
// │ Reserva Espacios FAE — Configuración del frontend        │
// │ EDITAR TODO LO DE ESTE FICHERO al hacer fork.            │
// ╰──────────────────────────────────────────────────────────╯

// URL del Web App de Apps Script (.../exec).
const API =
  "https://script.google.com/macros/s/AKfycby1-bZ0plQbpW6gTfgT0mdrYmf__zGfHNvQVMGhnZcT8iJ79MhUOBtrqNR6AxxkEZnC/exec";

// OAuth Client ID (mismo que en apps_script/Config.gs).
const GOOGLE_CLIENT_ID =
  "626032110486-21n999lfth0jf48373g4ttb97jrt5eq1.apps.googleusercontent.com";

// Dominios que se autentican con Google.
const GOOGLE_AUTH_DOMAINS = ["gcloud.ua.es", "gmail.com"];

// Espacios reservables. Colores ref. CSS vars en index.html.
const ROOMS = [
  {
    id: "r1",
    name: "Ciencias Sociales 066",
    code: "0034PS066",
    desc: "El mejor espacio disponible. Reservado para visitantes de seminarios hasta octubre.",
    note: "Hasta la llegada de José Antonio Espín en octubre.",
    color: "var(--r1)",
    bg: "var(--r1-bg)",
    light: "var(--r1-light)",
  },
  {
    id: "r2",
    name: "Sala del café",
    code: "0034P2015",
    desc: "Segundo piso. Buena para reuniones con estudiantes o similares.",
    note: "Movimiento posible a las 9h (dejar comida) y 13h (recoger).",
    color: "var(--r2)",
    bg: "var(--r2-bg)",
    light: "var(--r2-light)",
  },
  {
    id: "r3",
    name: "Germán Bernacer 067",
    code: "0036PS067",
    desc: "Muy agradable para reuniones o videoconferencias. Principal para seminarios de oct/nov.",
    note: "Para speakers de octubre y noviembre.",
    color: "var(--r3)",
    bg: "var(--r3-bg)",
    light: "var(--r3-light)",
  },
  {
    id: "r4",
    name: "Zulo",
    code: "0034PS105",
    desc: "Sin ventanas. Sala grande con mesa de reuniones. Solo en caso de emergencia.",
    note: "Reservar únicamente si todo lo demás está ocupado.",
    color: "var(--r4)",
    bg: "var(--r4-bg)",
    light: "var(--r4-light)",
  },
];

// Seminarios bloqueados (slots no reservables).
const SEMINARS = [
  {
    room: "r1",
    date: "2026-06-03",
    start: "14:30",
    end: "16:00",
    note: "Seminario: Gunes Gokmen",
  },
  {
    room: "r1",
    date: "2026-06-04",
    start: "14:30",
    end: "16:00",
    note: "Seminario: Lukas Hack",
  },
  {
    room: "r1",
    date: "2026-06-11",
    start: "14:30",
    end: "16:00",
    note: "Seminario: Marta Morazzoni",
  },
  {
    room: "r1",
    date: "2026-09-23",
    start: "14:30",
    end: "16:00",
    note: "Seminario: Juan Vargas",
  },
  {
    room: "r3",
    date: "2026-10-14",
    start: "14:30",
    end: "16:00",
    note: "Seminario: Olivier Marie",
  },
  {
    room: "r3",
    date: "2026-11-17",
    start: "14:30",
    end: "16:00",
    note: "Seminario: Oskar Skans",
  },
];

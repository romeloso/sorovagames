# Sorova Games

Plataforma educativa infantil (**Sorova Games**).

**Aprender es una aventura.**

## Qué incluye (MVP)

- Identidad visual Sorova en el lobby
- **Sopa de letras** con tablero navy y resaltados de marca
- Perfiles dinámicos con fecha de nacimiento y edad
- Avatares centralizados (galería + fotos subidas)
- Dashboard con XP, monedas, racha, temas adaptados por edad
- **Leo y Escribo**: seis mundos (sonidos, letras, sílabas, palabras, historias y escritura), diagnóstico e informe familiar. Detalle en `docs/leo-y-escribo.md`
- **Matemáticas, Ciencias, Inglés y Tecnología**: seis mundos y 120 actividades por materia, con el mismo motor de lecciones. Guía en `docs/plataforma-materias.md`
- **Teclea como una experta**
- **Tutor**: crea los perfiles de sus niños, ve su progreso y el material. Entra con un código propio.
- **Superadministrador** (PIN `4716`): crea las cuentas de tutor y ve todos los perfiles.
- El niño entra con un código de nombre + fecha. Sophia, 4 de diciembre de 2017, usa `SOPHIA041217`.
- Recompensas, logros y mapa de aventura
- Persistencia en PostgreSQL de Railway (`server/`) y copia local si la base no responde

El nombre de la app se cambia en `src/config/app.ts`.

## Stack

- React + TypeScript (Vite)
- Tailwind CSS
- React Router
- PostgreSQL en Railway (`DATABASE_URL`) con respaldo en `localStorage`

## Desarrollo

```bash
npm install
npm run dev
npm run dev:api   # opcional, si DATABASE_URL apunta a Postgres
```

```bash
npm run build
npm run preview
npm run smoke
npm test              # unit + componentes + integración
npm run test:e2e      # Playwright E2E
npm run load-test     # carga cliente + umbral de lentitud
```

Rendimiento, caché, índices y rate limiting: ver `docs/PERFORMANCE.md`.

## Roles

Hay tres roles. El niño no elige una tarjeta: escribe su código.

1. **Niño.** Código = nombre en mayúsculas, sin tildes, más la fecha en día, mes y año de dos cifras. `SOPHIA041217` es Sophia, 4 de diciembre de 2017.
2. **Tutor.** Puede registrarse con su nombre y entrar con su código directo al panel, donde registra a su familia. En una instalación nueva, la cuenta de demostración es `FAMILIASOROVA`.
3. **Superadministrador.** PIN `4716`. Crea, activa, cambia el código y elimina cada tutor junto con los perfiles a su cargo.

El código del niño identifica el perfil en esta instalación. No es una contraseña secreta: quien conoce el nombre y la fecha puede formarlo. El superadministrador entrega a cada tutor un código distinto.

## Tutor y superadministrador

1. En el inicio, el interruptor elige niño o tutor y se escribe el código. El superadministrador toca el logotipo de Sorova Games
2. El tutor puede crear una cuenta desde ese mismo inicio. El superadministrador escribe el PIN `4716`
3. Pestaña **Tutores** (solo superadministrador): cuentas de madres, padres o tutores
4. Pestaña **Niños**: nombre, fecha y código de acceso
5. Pestaña **Temas**: temas por materia con rango de edad
6. Pestaña **Avatares**: galería central de fotos/avatares
7. Pestaña **Progreso**: el superadministrador ve un tablero con tabla filtrable (nivel, edad, grado, XP, monedas, racha, logros, lectura y tecleo, sin foto). El tutor ve la tarjeta de cada niño.
8. Pestaña **Material**: palabras/quizzes e historias (también con edad)

## Cómo agregar una materia

El recorrido está en `docs/plataforma-materias.md`: datos de currículo, ficha en el registro, progreso por niño y prueba del catálogo.

## Cómo agregar un juego nuevo

1. Añade la definición en `src/data/games/registry.ts`
2. Crea `src/data/games/<juego>/` con niveles y contenido
3. Implementa el módulo UI en `src/games/<juego>/`
4. Conecta el módulo en `LessonPage` / registro de juegos
5. Reutiliza XP, logros, progreso y `LessonRunner`

## Arquitectura

```
src/
  config/          # nombre de app, perfiles, PIN admin
  types/           # modelo de dominio
  data/            # contenido educativo y catálogo de juegos
  domain/          # progreso, XP, dificultad adaptativa
  services/        # storage, sonidos, content bank
  context/         # estado global (perfiles, rol, material)
  components/      # UI reutilizable y shell de juego
  games/           # módulos por juego
  pages/           # pantallas

server/            # API y esquema PostgreSQL (Railway)
```

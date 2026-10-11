# Plataforma de materias

Sorova Games es una sola aplicación. Leo y Escribo, Matemáticas, Ciencias, Inglés y Tecnología comparten perfiles, lecciones, recompensas y el criterio de dominio. Sopa de letras y Teclea como una experta siguen en su sitio.

Lema: **Aprender es una aventura.**

## Qué hay hoy

| Materia | Mundos | Actividades | Dónde vive el contenido |
| --- | --- | --- | --- |
| Lectura y escritura | 6 | 100 o más | `src/data/games/reading/` |
| Matemáticas | 6 | 120 | `src/data/games/math/curriculum.ts` |
| Ciencias | 6 | 120 | `src/data/games/science/curriculum.ts` |
| Inglés | 6 | 120 | `src/data/games/english/curriculum.ts` |
| Tecnología | 6 | 120 | `src/data/games/technology/curriculum.ts` |

Las cuatro materias nuevas salen de `packSubject` en `src/data/subjects/pack.ts` y se publican en `src/data/subjects/catalog.ts`. Cada lección trae objetivo, habilidad, instrucciones y actividades con respuesta comprobable. Los textos y los emojis van en los datos. El audio usa la voz del navegador y, si no hay voz, el botón muestra el texto para que un adulto lo lea.

## Progreso

Cada niño tiene un `GameProgress` distinto por materia. Una lección de matemáticas no cambia el mundo de lectura.

En lectura, matemáticas, ciencias, inglés y tecnología el siguiente mundo se abre cuando se ha practicado al menos el 80 % de las lecciones del mundo actual y la precisión media de esas lecciones llega al 85 %. Una respuesta con pista o con varios intentos cuenta como ayuda, no como dominio independiente. El dominio de una habilidad pide al menos dos sesiones y cuatro aciertos independientes. Tecleo y la sopa de letras conservan su umbral anterior.

Los errores no quitan estrellas ya ganadas ni puntos. No hay clasificación entre niños.

El informe familiar está en `/familia`. Describe la práctica con lenguaje cotidiano. No es un diagnóstico ni un certificado.

## Cómo agregar una materia

1. Crea `src/data/games/<materia>/curriculum.ts` con mundos, lecciones y habilidades. Usa `choice` para una pregunta cerrada y `order` para ordenar piezas.
2. Comprueba que cada respuesta esté entre las opciones y que las piezas ordenadas reconstruyan la respuesta.
3. Añade el identificador en `GameId`, una ficha en `src/data/games/registry.ts` y el paquete en `src/data/subjects/catalog.ts`.
4. Inicializa el progreso en `createDefaultProgressForChild`. La migración ya sincroniza los identificadores de `SUBJECT_GAME_IDS`.
5. La pantalla de lección reutiliza `ReadingActivityView` para estas materias. No hace falta una pantalla nueva si la actividad es de elegir o de ordenar.
6. Agrega la materia al test de `src/data/subjects/catalog.test.ts`.

## Cómo agregar una actividad

Dentro de la lección correspondiente, suma un `choice` o un `order` con un propósito distinto al de las actividades vecinas. La pista es opcional. `speak` es el texto que se escucha. En inglés, el enunciado y `speak` van en inglés; la instrucción de la lección puede seguir en español.

No enlaces archivos que no existan en el proyecto. Si falta una grabación, deja el texto en `speak`.

## Persistencia

La fuente de verdad en ejecución sigue siendo el documento JSON de Railway (`app_state`) y la copia local. `server/subjects-schema.sql` describe un modelo relacional futuro. No se aplica solo al desplegar.

Hay tres roles en la misma instalación: niño, tutor y superadministrador. El niño entra con su código. El tutor solo ve los perfiles que creó. El superadministrador crea las cuentas de tutor, puede eliminar una cuenta con los perfiles a su cargo y ve a todos los niños. El documento JSON sigue siendo compartido por la instalación; el código del niño se arma con el nombre y la fecha, así que no funciona como una contraseña.

## Pendiente

- Voces grabadas, sobre todo fonemas y pronunciación del inglés.
- Cuentas de tutor y políticas que limiten cada familia a sus perfiles.
- Editor visual de actividades. Hoy el material nuevo de lectura se carga en el panel; el resto del currículo se versiona en código.
- Reconocimiento de voz opcional. No es requisito para avanzar.
- Multiplicación, fracciones y el resto del abecedario cuando el niño ya domina los prerrequisitos de conteo, suma y decodificación.
- Uso sin conexión.

# Leo y Escribo

Reestructura el juego de lectura de Sorova Games. El resto de juegos (tecleo, sopa de letras, perfiles y administrador) se mantiene.

## Qué hay hoy

- Seis mundos: sonidos, letras, sílabas, palabras, historias y escritura.
- Más de 100 actividades con objetivo, habilidad, instrucción y respuesta.
- Motor reutilizable: elegir, ordenar sílabas o palabras, dictado, trazado y teclado en pantalla.
- Voz del navegador en español, con texto visible si no hay audio.
- Dominio de una habilidad solo después de dos sesiones independientes con al menos 85 % de aciertos a la primera y sin pistas.
- El siguiente mundo de lectura se abre al completar cerca del 80 % de sus lecciones con esa precisión. Las estrellas no sustituyen el dominio.
- Juego de inicio que recomienda el mundo según el desempeño.
- Informe familiar en `/familia`, escrito para una persona adulta.
- Las palabras y cuentos del administrador se suman a los mundos de palabras, historias y escritura.
- El progreso sigue en el documento JSON de la app (navegador y PostgreSQL de Railway). Recargar una lección espera a que ese progreso cargue antes de decidir si hay un perfil activo.

## Cómo añadir una lección

1. Abre `src/data/games/reading/curriculum.ts`.
2. Agrega un `seed` dentro de `seeds`, con `world`, `objective`, `skills` e ítems.
3. Usa una habilidad de `READING_SKILLS` cuyo mundo sea el mismo o uno anterior.
4. Si la palabra lleva imagen, regístrala una sola vez en `pictures.ts`.
5. Ejecuta `npm test`.

Para material creado por un adulto sin tocar código, usa el panel administrador (PIN `4716`), pestaña Material. Una palabra nueva entra en la ciudad de las palabras y en el taller. Un cuento entra en el reino de las historias.

## Audio

`src/domain/reading/speech.ts` es la única puerta de la voz. Hoy usa la síntesis del navegador y prefiere una voz `es-DO` o, si no existe, otra voz `es`. No pronuncia el nombre de la consonante cuando la lección enseña el sonido: dice la palabra («mamá») y explica el sonido.

Para sustituirla por grabaciones, implementa `speakSpanish` leyendo archivos en `public/audio/{mundo}/{id}.mp3` y conserva el botón «Escuchar otra vez».

## Persistencia y permisos

La app no tiene cuentas separadas de tutor y niño. Quien usa el dispositivo comparte el mismo estado. El PIN de administrador protege la edición del material. El informe familiar pide confirmación de adulto en la pantalla; eso no es un control de seguridad.

`server/reading-schema.sql` describe un modelo relacional para el día en que cada tutor tenga su propia cuenta. No está aplicado: el servidor actual guarda el estado completo en `app_state`.

## Pendiente

- Grabaciones profesionales de fonemas, sílabas y cuentos.
- Cuentas de tutor con permisos reales en la base, para que un adulto solo vea a sus niños.
- Editor visual para crear cada ejercicio sin editar el código.
- Reconocimiento de voz opcional. No es requisito para terminar una lección.
- Aplicación instalable sin conexión.
- Más correspondencias (d, n, r, sílabas trabadas e inversas) cuando las directas estén dominadas.

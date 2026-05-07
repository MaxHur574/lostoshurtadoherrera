# Cronograma Ajustado: Prioridad Narrativa
---

## Semana 1: Arquitectura y "Script" del Juego (04 May - 10 May)

- Objetivo: Definir qué pasó en ese sistema operativo antes de programar.
### Tareas
- [ ] Escritura del Lore: Redactar el hilo conductor. Por ejemplo:¿Quién era el dueño? ¿Qué ocultaba? ¿Qué lo mató/hizo desaparecer?

- [ ] Mapa de Puzzles: Diseñar el flujo de información.
  - Ejemplo: El archivo A contiene la pista para la carpeta B, que contiene el correo C.

- [ ] Interfaz Base: Crear el esqueleto HTML/CSS (Escritorio y ventanas básicas).

Hito: Tener un documento con todos los textos (correos, notas) y el diagrama de flujo del juego.


## Semana 2: Implementación del Sistema de Archivos (11 May - 17 May)
- Objetivo: Volcar la historia al código.

- [ ] JSON de Datos: Crear el objeto JS que contenga todo el lore escrito en la Semana 1 (nombres de archivos, fechas de creación, contenido de los .txt).

- [ ] Lógica de Navegación: Programar el explorador de archivos para que lea ese JSON.

- [ ] Bloqueos Narrativos: Implementar las contraseñas basadas en el lore (ej: la contraseña es el nombre de la mascota mencionado en un post-it digital).

Hito: Poder navegar por el 50% del juego y leer la historia, aunque aún no haya sustos.


## Semana 3: Atmósfera y Eventos Dinámicos (18 May - 24 May)
- Objetivo: Convertir un simulador de archivos en una experiencia de terror.

Manager de Eventos: Programar los "triggers" (disparadores). Si el jugador lee el archivo "autopsia.pdf", se dispara un sonido de respiración.

- [ ] Efectos Visuales: Glitches, cambios de fuente, y el parpadeo de la interfaz.

- [ ] Aplicaciones Especiales: Programar el correo electrónico (que se va llenando de mensajes nuevos mientras juegas) y el visor de fotos perturbadoras.

Hito: El juego ya "asusta" y reacciona al progreso del jugador.


## Semana 4: Audio, Pulido y Final (25 May - 28 May)
- Objetivo: Inmersión total.

- [ ] Diseño Sonoro: Añadir el ambiente low-fi, sonidos de disco duro procesando y efectos de sonido para los sustos.

- [ ] Finales: Programar la secuencia final (el "clímax" de la historia).

- [ ] QA & Debug: Testear que ninguna combinación de ventanas abiertas rompa la lógica del juego.

- [ ] Ajustes de dificultad: Asegurarse de que las pistas del lore no sean ni muy obvias ni imposibles.

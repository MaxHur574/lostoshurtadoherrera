# Cronograma Ajustado: Prioridad Narrativa
---

## Semana 1: Arquitectura y "Script" del Juego (04 May - 10 May)

- Objetivo: Definir qué pasó en ese sistema operativo antes de programar.
### Tareas
- [x] Escritura del Lore: Redactar el hilo conductor. Por ejemplo:¿Quién era el dueño? ¿Qué ocultaba? ¿Qué lo mató/hizo desaparecer?

- [x] Mapa de Puzzles: Diseñar el flujo de información. 
  - Se modoficó el flujo de pistas ya que resulto tener muy corta duracioón a la probarlo in game.  
  - Ejemplo: El archivo A contiene la pista para la carpeta B, que contiene el correo C.

- [x] Interfaz Base: Crear el esqueleto HTML/CSS (Escritorio y ventanas básicas).



## Semana 2: Implementación del Sistema de Archivos (11 May - 17 May)
- Objetivo: Volcar la historia al código.

- [x] Archivos de Datos: Crear los archivos que contengan las partes del lore escrito en la Semana 1 (nombres de archivos, fechas de creación, contenido de los .txt).

- [x] Lógica de Navegación: Programar las aplicaciones que permitirán la navegacion del So del juego.

- [x] Bloqueos Narrativos: Implementar las contraseñas basadas en el lore (ej: la contraseña es el nombre de la mascota mencionado en un post-it digital).


## Semana 3: Atmósfera y Eventos Dinámicos (18 May - 24 May)
- Objetivo: Convertir un simulador de archivos en una experiencia de terror.

- [x] Manager de Eventos: Programar los "triggers" (disparadores). Si el jugador lee el archivo "autopsia.pdf", se dispara un sonido de respiración.

- [x] Efectos Visuales: Glitches, cambios de fuente, y el parpadeo de la interfaz.

- [x] Aplicaciones Especiales: Programar el correo electrónico (que se va llenando de mensajes nuevos mientras juegas) y el visor de fotos perturbadoras.


## Semana 4: Audio, Pulido y Final (25 May - 28 May)
- Objetivo: Inmersión total.

- [x] Diseño Sonoro: Añadir el ambiente low-fi, sonidos de disco duro procesando y efectos de sonido para los sustos.

- [x] Finales: Programar la secuencia final (el "clímax" de la historia).

- [x] QA & Debug: Testear que ninguna combinación de ventanas abiertas rompa la lógica del juego.

- [x] Ajustes de dificultad: Asegurarse de que las pistas del lore no sean ni muy obvias ni imposibles.
      
## Mejoras
- [ ] Guardado de progreso.
- [ ] Mejorar configuración del juego (más opciones como por ejemplo deficultades para minijuegos)
- [ ] Agregado de tutorial al principio del juego para entender la jugabilidad y dinámica.
- [ ] Agregado de más minijuegos.
- [x] 0,25 decimas por quedar terceros (medalla de bronce).

---

## Semana 5: Agregar autenticación y progreso (16 Jun - 23 Jun)
- Objetivo : lograr login con terceros funcionando y progreso persistente.

- [x] Configurar Auth0 en el backend con Express.js.

- [ ] Crear endpoints /login y /progress.

- [ ] Guardar progreso en MongoDB (usuario, minijuegos completados, tiempo).

- [x] Integrar login en frontend Vue.

## Semana 6: Agregar tutorial y minijuegos (23 Jun - 25 Jun)
- Objetivo : agregar tutorial visible al inicio + nuevos minijuegos jugables.

- [ ] Implementar un tutorial interactivo en Vue (overlay o pasos guiados).

- [ ] Añadir los minijuegos nuevos.

- [ ] Conectar minijuegos al sistema de progreso (guardar resultados).

## Semana 7: Agregar ranking y endpoints exrtra (25 Jun - 2 Jul)
- Objetivo : lograr ranking visible y backend estable.

- [ ] Endpoint /ranking en Express.js para tiempos de completado.

- [ ] Guardar y ordenar tiempos en MongoDB.

- [ ] Mostrar ranking en frontend con tabla ordenada.

- [ ] Revisar y pulir todos los endpoints (login, progreso, ranking).
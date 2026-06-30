![mockup1](img/mockup1.png)
![mockup2](img/mockup2.png)
![mockup3](img/mockup3.png)
Especificaciones de tecnologia

Framework: Vue.js 3. Framework elegido entre 3 opciones disponibles porque es el que tenemos más experiencia manejando.

---

## Estructura de carpetas propuesta

```
LostOs_proyect/
├── .github/
│   └── workflows/            # Configuración CI/CD
│
├── frontend/                 # Aplicación cliente con Vue
│   ├── public/               # Archivos estáticos (favicon, index.html)
│   ├── src/
│   |   ├── tests/  
│   │   ├── components/       # Componentes .vue
│   │   ├── store/            # Estado global (Pinia)
│   │   └── assets/
│   └── Dockerfile
│
├── backend/                  # Servidor con Node/Express
│   ├── src/
│   │   ├── config/           # Configuración (MongoDB, Auth0, env)
│   │   ├── models/           # Esquemas Mongoose (User, Game, Score)
│   │   ├── controllers/      # Lógica de negocio
│   │   ├── routes/           # Endpoints Express
│   │   ├── middleware/       # Autenticación, validaciones, errores
│   │   ├── services/         # Axios y servicios externos
│   │   ├── utils/            # Helpers y funciones comunes
│   └── Dockerfile
│
├── DESIGN.md                 # Diseño del juego
├── PLANNING.md               # Planificación del proyecto
├── HISTORY.md                # Historial de cambios
├── PISTAS.md                 # Ideas o pistas del juego
├── README.md                 # Documentación principal
└── .gitignore

```

---

## Dependencias principales

- Pinia: Es la biblioteca oficial para gestionar estado de Vue. Pinia tine una estructura mas simple y flexible que Vuex 5, además ocupa typescript de forma nativa, a diferencia de Vuex que originalmente se diseñó para JavaScript y luego se agregó TypeScript.  
- GSAP: Sirve para poder hacer las animaciones como gliych u otras, con la ventaja de que nos deja realizar Timelines.
- Interact: Permite el Drag y Drop, resize, ya que algunas librerias como Draggable y Sortable no permiten el Drag y Drop (Mover libremente una ventana) y para el tipo de juego que queremos hacer Interact nos da más funciones para más realismo.
- Howler.js: Funciona igual en todos los navegadores, verbosidad más ligera, arquitectura más sencilla de utilizar. Ideal para juegos 2D.

---

## Descripción del Juego

LOST OS es un juego de horror y misterio ambientado en un sistema operativo abandonado. El jugador "accede" a un escritorio oscuro y debe descubrir qué ocurrió explorando archivos, correos electrónicos y aplicaciones del sistema. La atmósfera es paranoica y glitchy: alertas aparecen solas, la cámara se enciende sin razón y los mensajes son perturbadores.

---

## Mecanicas principales 

El jugador interactúa con un escritorio simulado abriendo ventanas arrastrables y redimensionables.
Explora carpetas y archivos en el Explorador de archivos, algunos bloqueados con contraseña. 
Lee correos de remitentes desconocidos en el Cliente de correo, que también requiere contraseña.
Desencripta un archivo oculto ingresando un código de 4 dígitos. Las contraseñas se van obteniendo resolviendo distintos minijuegos que irán subiendo la dificultad en el transcurso del juego. Se tienen 3 intentos por minijuego, al momento de perder los 3 intentos sale un screamer y se reinicia el minijuego luego de 30 segundos de espera.
Recibe alertas automáticas que aparecen en pantalla con efecto glitch, informando actividad sospechosa.
Accede a un Navegador sin conexión que muestra contenido perturbador.

---

## Reglas y flujo de juego

El jugador inicia en un escritorio oscuro con íconos de aplicaciones.
Al explorar la carpeta Privado en el Explorador, se solicita una contraseña, que se obtiene luego de realizar algún minijuego.
Al ingresar la contraseña correcta se desbloquea el correo y nuevas pistas.
Los correos revelan fragmentos de la historia y pistas hacia el código de desencriptado.
Al desencriptar el archivo final, se revela el lore completo del sistema.
El juego no tiene un "fin" tradicional — es una experiencia narrativa de exploración.

---

## Mejoras y correcciones
- Inicio de sesión con terceros y guardado de progreso.

- Agregar un tutorial explicativo sobre las mecanicas del juego

- Agregar mas minijuegos al juego

- ranking de tiempo de completado

- agregado de endpoints 

---

## Arquitectura fullstack

### Frontend

- Pinia: Es la biblioteca oficial para gestionar estado de Vue. Pinia tine una estructura mas simple y flexible que Vuex 5, además ocupa typescript de forma nativa, a diferencia de Vuex que originalmente se diseñó para JavaScript y luego se agregó TypeScript.
  
- GSAP: Sirve para poder hacer las animaciones como gliych u otras, con la ventaja de que nos deja realizar Timelines.
  
- Interact: Permite el Drag y Drop, resize, ya que algunas librerias como Draggable y Sortable no permiten el Drag y Drop (Mover libremente una ventana) y para el tipo de juego que queremos hacer Interact nos da más funciones para más realismo.
  
  
### Backend 
- Auth0: Autenticacion de tokens para login con terceros.

- MongoDB: Base de datos para guardar progreso de los jugadores.

- Node.js: Entorno para ejecutar JS en un servidor.

- Express.js: Framework para Node.js que simplifica su uso.

- Mongoose: Actua como intermediario entre Express y MongoDB, facilitando la conexión y gestión de datos con MongoDB.

- Axios: Herramienta para conectar el frontend con el backend y con los servicios externos.

---

### Endpoints
- GET /authorize : Se utiliza cuando el jugador presiona "Iniciar sesión". inicia el proceso de autenticación con el proveedor.

- POST /oauth/token : Entrega el access token para luego verificar que sea válido.

- GET /.well-known/jwks.json : verifica que los tokens realmente fueron emitidos por Auth0 y no falsificados.

- GET /v2/logout : Permite cerrar la sesión del usuario y finalizar su autenticación en Auth0.

- POST /login : Recibe el token y verifica en la base de datos de MongoDb la existencia del usuario. 

- GET /progress : Recupera el progreso de avance guardado del jugador.

- POST /progress : Guarda o actualiza el progreso del jugador en la base de datos de MongoDB.

- GET /ranking : Obtener la lista de jugadores ordenados por tiempo de completado.

- POST /ranking : Guarda el tiempo que se demora en completar el juego el jugador, y lo actualiza en caso de mejorar marca.





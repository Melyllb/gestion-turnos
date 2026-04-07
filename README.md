
## 1. Descripción de la Aplicación

BeautyBrows Studio es una aplicación web de gestión de turnos para un salón de belleza especializado en cejas. Funciona completamente en el lado del cliente, sin ningún servidor backend: toda la lógica, validaciones y persistencia de datos ocurren en el navegador del usuario.

---

## 2. Tecnologías Utilizadas

La aplicación fue construida usando un stack de frontend moderno orientado a la productividad del desarrollador, la seguridad de tipos y el rendimiento en el navegador.

| **Tecnología**      | **Proposito en el proyecto**                                                                 |
| ------------------- | -------------------------------------------------------------------------------------------- |
| React 18            | Libreria principal para construir la interfaz de usuario con componentes funcionales y hooks |
| TypeScript          | Tipado estatico que detecta errores en compilacion y mejora el autocompletado                |
| Vite                | Herramienta de build con servidor de desarrollo ultrarapido (HMR < 50ms)                     |
| React Router DOM v6 | Enrutamiento del lado del cliente con rutas anidadas y protegidas                            |
| Dexie.js            | Wrapper sobre IndexedDB para persistencia de datos estructurada en el navegador              |
| Tailwind CSS        | Utilidades CSS para estilar componentes sin escribir CSS separado                            |


### Instalación y ejecución del proyecto

Requisitos previos: tener instalado Node.js (version 18 o superior) y npm.

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd beautybrows

# 2. Instalar dependencias
npm install

# 3. Instalar dependencias especificas del proyecto
npm install dexie react-router-dom

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en http://localhost:5173. Las credenciales del administrador por defecto son:

- Email: admin@beautybrows.com
- Contrasena: admin123

Estas credenciales se crean automáticamente la primera vez que la aplicación se carga, mediante el método seedAdmin() de la base de datos.

---

## 3. Base de Datos: IndexedDB con Dexie.js

### Que es IndexedDB

IndexedDB es una base de datos orientada a objetos integrada en todos los navegadores modernos. A diferencia de las cookies o localStorage, IndexedDB permite almacenar cantidades significativas de datos estructurados (objetos JavaScript complejos, archivos, blobs) y consultarlos mediante índices sin necesidad de ninguna conexión a un servidor externo.

Técnicamente es una base de datos transaccional que opera de forma asíncrona, lo que significa que todas sus operaciones devuelven promesas y no bloquean el hilo principal de JavaScript mientras leen o escriben datos. Esto es fundamental para mantener la interfaz de usuario fluida y responsiva durante operaciones de base de datos.

### Que es Dexie.js y por que la usamos

La API nativa de IndexedDB es extremadamente verbosa y compleja de usar directamente. Abrir una conexion, gestionar versiones del esquema y hacer una consulta simple requiere decenas de lineas de codigo con callbacks anidados y manejo manual de transacciones.

Dexie.js es una libreria que envuelve IndexedDB con una API limpia basada en promesas y metodos encadenables. Con Dexie, la misma operacion se expresa de forma simple y legible:

```javascript
// Con la API nativa de IndexedDB (complejo):
const request = indexedDB.open("MiDB", 1);
request.onupgradeneeded = (e) => {
  e.target.result.createObjectStore("turnos");
};
request.onsuccess = (e) => {
  const tx = e.target.result.transaction("turnos", "readonly");
  const store = tx.objectStore("turnos");
  const getAll = store.getAll();
  getAll.onsuccess = (e) => { console.log(e.target.result); };
};

// Con Dexie (simple y legible):
const turnos = await db.turnos.toArray();
```

Dexie tambien ofrece soporte nativo para TypeScript con tipos genericos para las tablas, lo que encaja perfectamente con nuestro stack.

### Esquema de la base de datos

La base de datos BeautyBrowsDB extiende la clase Dexie y define tres tablas (colecciones) con sus indices correspondientes:

```typescript
this.version(1).stores({
  turnos: "++id, fecha, horaInicio, estado",
  reservas: "++id, turnoId, fechaReserva, estado",
  usuarios: "++id, email"
});
```

La notacion ++id indica que el campo id es una clave primaria autoincrementable. Los campos adicionales listados (fecha, estado, turnoId, email) son indices que permiten realizar consultas eficientes sin recorrer todos los registros.

| **Tabla** | **Campos principales** |
| --------- | --------------------------------------------------------------------------------------------------------- |
| turnos    | id, fecha, horaInicio, horaFin, capacidadMaxima, estado (activo\|inactivo)                                |
| reservas  | id, turnoId, nombreCliente, carnetIdentidad, fechaReserva, estado (confirmada\|cancelada)                 |
| usuarios  | id, nombre, email, password                                                                               |

### Metodos de Dexie utilizados en el proyecto

- `toArray()`: obtiene todos los registros de una tabla como array de objetos.
- `where(campo).equals(valor)`: filtra registros por un indice especifico, equivalente a `WHERE campo = valor` en SQL.
- `.and(fn)`: aplica un filtro adicional sobre los resultados, util para condiciones compuestas.
- `get(id)`: obtiene un registro especifico por su clave primaria.
- `add(objeto)`: inserta un nuevo registro y retorna el id generado.
- `update(id, cambios)`: actualiza campos especificos de un registro sin reemplazarlo completo.
- `delete(id)`: elimina un registro por su clave primaria.
- `count()`: cuenta el numero de registros que cumplen una condicion.
- `.first()`: retorna solo el primer resultado de una consulta.

### IndexedDB vs localStorage: comparación y justificación

Aunque localStorage es mas simple de usar, sus limitaciones lo hacen inadecuado para una aplicación de esta complejidad. La siguiente tabla compara ambas tecnologías:

| **Característica**          | **IndexedDB (Dexie) vs localStorage**                                                                                 |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Capacidad de almacenamiento | IndexedDB: hasta cientos de MB segun el navegador \| localStorage: limite de ~5MB                                     |
| Tipo de datos               | IndexedDB: objetos JavaScript nativos, arrays, Blobs \| localStorage: solo strings (requiere JSON.stringify/parse)    |
| Operaciones                 | IndexedDB: completamente asincrono (Promesas) \| localStorage: sincrono, bloquea el hilo principal                    |
| Consultas                   | IndexedDB: indices y filtros eficientes sin recorrer todo \| localStorage: sin soporte de consultas, solo clave-valor |
| Transacciones               | IndexedDB: soporta transacciones ACID \| localStorage: no tiene soporte de transacciones                              |
| Uso en la app               | IndexedDB: todos los datos (turnos, reservas, usuarios) \| localStorage: solo el token de sesion del usuario          |

> **Por que usamos localStorage para la sesion**
>
> Aunque IndexedDB es la base de datos principal, usamos localStorage para guardar la sesion del usuario autenticado (clave "bb_user"). La razon es que localStorage es sincrono: al recuperar la sesion antes del primer render del componente AuthProvider, podemos usar el inicializador lazy de useState para leer el dato de forma instantanea, sin necesidad de una promesa ni de un useEffect adicional. Esto evita el "flash" donde la app renderizaria brevemente como no autenticada antes de recuperar la sesion de IndexedDB.

---

## 4. Conceptos Fundamentales de React y su Implementación

### Componentes Funcionales

Los componentes son funciones de JavaScript que reciben un objeto de propiedades (props) y retornan JSX (la sintaxis de React para describir lo que debe mostrarse en la pantalla). Son la forma moderna y recomendada de crear componentes en React desde la introducción de los Hooks en la versión 16.8.

### useState: gestión del estado local

`useState` es el hook fundamental para declarar variables de estado en componentes funcionales. Retorna un par: el valor actual del estado y una función para actualizarlo. Cuando se llama a la función actualizadora, React re-renderiza el componente con el nuevo valor.

En la aplicación se usa para múltiples propósitos:
- En `TurnosDisponibles`: para guardar la fecha seleccionada en el calendario, el turno que se quiere reservar y si la reserva fue exitosa.
- En `AdminTurnos`: para controlar si el modal esta abierto, que turno se esta editando y si hay un error.
- En `AdminReservas`: para gestionar los filtros de estado, el termino de búsqueda, la página actual y las reservas seleccionadas.
- En `FormularioTurno` y `FormularioReserva`: para controlar los valores de cada campo del formulario de forma controlada (componentes controlados).

### useEffect: efectos secundarios

`useEffect` permite ejecutar código que interactúa con el mundo exterior (eventos del navegador, localStorage, suscripciones) de forma sincronizada con el ciclo de vida del componente. Acepta una función de efecto y un array de dependencias.

Usos en el proyecto:
- En `AuthContext`: para sincronizar el estado de autenticación entre múltiples pestañas del navegador, suscribiéndose al evento "storage" de window. La función de limpieza retornada por el efecto cancela la suscripción al desmontar el componente, evitando memory leaks.
- En `Modal`: para registrar el listener del teclado (tecla Escape para cerrar) y para bloquear el scroll del body mientras el modal esta visible. Ambos efectos retornan funciones de limpieza para eliminar los listeners al desmontar.
- En `Login`: para redirigir automáticamente al usuario al panel admin si ya tiene una sesión activa al cargar la página de login.

### useContext: estado global sin prop drilling

El problema que resuelve `useContext` se llama prop drilling: cuando múltiples componentes en distintos niveles del árbol necesitan el mismo dato (como el usuario autenticado), habría que pasar ese dato como prop en cada nivel intermedio, aunque muchos componentes no lo usen directamente.

`useContext` crea un canal de comunicacion: el `Provider` publica un valor en un punto del arbol, y cualquier componente descendiente puede consumirlo directamente con `useContext` sin importar cuantos niveles haya entre ellos.

En BeautyBrows, `useContext` se usa en el hook `useAuth` (que internamente llama a `useContext(AuthContext)`) para dar acceso al estado de autenticación a: `ProtectedRoute` (para decidir si redirige al login), `AdminLayout` (para mostrar el email del usuario y el botón de logout) y `Login` (para ejecutar el login y redirigir si ya hay sesión).

### useMemo y useCallback: memorización

`useMemo` memoriza el resultado de un calculo costoso y solo lo recalcula cuando sus dependencias cambian. `useCallback` memoriza la referencia de una función para que sea estable entre renders.

En el proyecto:
- `useMemo` en `TurnosDisponibles`: calcula `fechasConTurnos` (un Set con las fechas que tienen turnos disponibles) y `turnosDelDia` (los turnos del día seleccionado). Sin memorización, estos cálculos se ejecutarían en cada render aunque los datos no hayan cambiado.
- `useMemo` en `AdminReservas`: calcula las reservas filtradas y paginadas en tiempo real según el estado del filtro y el termino de búsqueda.
- `useCallback` en `useTurnos` y `useReservas`: estabiliza la referencia de la función `cargarTurnos`/`cargarReservas` para que el `useEffect` que la llama al montar no entre en un loop infinito. Sin `useCallback`, la función se recrearía en cada render, el `useEffect` detectaría una nueva referencia como dependencia, volvería a ejecutarse, y el ciclo continuaría indefinidamente.

---

## 5. Contextos: AuthContext
### AuthContext: gestión del estado de autenticación

`AuthContext` es el contexto central de la aplicación. Se crea con `createContext<AuthContextType | null>(null)` donde `null` es el valor inicial (sin usuario autenticado). El tipo `AuthContextType` especifica la forma del objeto que el proveedor comparte:

```typescript
interface AuthContextType {
  isAuthenticated: boolean; // true si hay un usuario logueado
  user: Usuario | null; // datos del usuario o null
  login: (email, password) => Promise<boolean>;
  logout: () => void;
}
```

**Estado del usuario logueado**

El estado `user` se inicializa usando el mecanismo de inicializador lazy de `useState`: se pasa la función `recuperarSesion` (sin parentesis) para que React la ejecute una sola vez antes del primer render. Esta función lee `localStorage` de forma síncrona y retorna el objeto del usuario si existe, o `null` si no hay sesión. Esto garantiza que si hay sesión guardada, el componente arranca directamente autenticado sin ningún flash de interfaz no autenticada.

**El flag isAuthenticated**

`isAuthenticated` es un booleano derivado directamente del estado `user` mediante el operador de doble negación: `!!user`. Si `user` es un objeto (el usuario logueado), `!!user` es `true`. Si `user` es `null`, `!!user` es `false`. Este flag es lo que `ProtectedRoute` lee para decidir si permite o bloquea el acceso.

**La función login**

La funcion `login` recibe `email` y `password`, consulta directamente la instancia `db` de Dexie (no a traves de `useStorage`, ya que `useStorage` es un hook con referencias inestables), verifica las credenciales y si son correctas actualiza el estado `user` y persiste el objeto del usuario en `localStorage`. Retorna `true` si el login fue exitoso o `false` si no, lo que permite a la pagina `Login` mostrar el mensaje de error apropiado.

**La funcion logout**

`logout` simplemente limpia el estado `user` a `null` y elimina la entrada `bb_user` de `localStorage`. Como `isAuthenticated` es `!!user`, al ser `null` pasa a `false` automaticamente, y `ProtectedRoute` redirigira al login en el siguiente render.

> **Nota sobre la implementacion**
>
> `AuthContext` usa `db` directamente en lugar de `useStorage` porque `useStorage` es un hook que crea nuevas referencias de función en cada render del `AuthProvider`. `db` en cambio es un singleton importado como modulo que nunca cambia de referencia, haciendo la lógica de autenticación completamente estable y predecible.

### Sincronización entre pestañas

Un `useEffect` suscribe al evento "storage" de `window`, que el navegador dispara cuando `localStorage` cambia desde otra pestana del mismo dominio. Si el usuario hace logout en una pestana, todas las demás detectan el cambio y actualizan su estado a `null` automáticamente, cerrando la sesión en todas partes de forma consistente.

---

## 6. Estructura de Rutas y Protección

### Configuración de rutas en App.tsx

La aplicación usa React Router DOM v6 con `BrowserRouter` como proveedor del historial del navegador. Las rutas se organizan en dos grupos bien diferenciados:

```jsx
// Rutas publicas --- accesibles sin autenticacion
<Route element={<PublicLayout />}>
  <Route path="/" element={<TurnosDisponibles />} />
  <Route path="/login" element={<Login />} />
</Route>

// Rutas protegidas --- requieren autenticacion
<Route element={<ProtectedRoute />}>
  <Route element={<AdminLayout />}>
    <Route path="/admin" element={<Navigate to="/admin/turnos" replace />} />
    <Route path="/admin/turnos" element={<AdminTurnos />} />
    <Route path="/admin/reservas" element={<AdminReservas />} />
  </Route>
</Route>
```

### Rutas anidadas y el componente Outlet

Las rutas anidadas permiten que un componente padre (el layout) envuelva a múltiples componentes hijo (las paginas) compartiendo estructura visual como header, navegación y footer. El componente `<Outlet />` es el marcador donde React Router inyecta el componente de la ruta hija activa.

En `AdminLayout`, el `<Outlet />` se encuentra dentro del `main`. Cuando la URL es `/admin/turnos`, React renderiza `AdminLayout` y dentro del `Outlet` coloca `AdminTurnos`. Cuando cambia a `/admin/reservas`, el layout permanece igual pero el `Outlet` ahora contiene `AdminReservas`. Esto evita que el header y footer se re-rendericen al navegar entre secciones del admin.

### ProtectedRoute

`ProtectedRoute` es un componente que se coloca como `element` de una ruta sin `path` propio. Su unica responsabilidad es verificar si el usuario esta autenticado:

```jsx
export const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <Outlet />;
};
```

Si `isAuthenticated` es `false`, retorna `<Navigate to="/login" replace />` antes de renderizar cualquier contenido protegido. La prop `replace` es crucial: en lugar de agregar `/login` al historial como nueva entrada, reemplaza la entrada actual. Así el usuario no puede presionar el botón "Atrás" del navegador para regresar a la ruta protegida sin autenticarse.

Si `isAuthenticated` es `true`, retorna `<Outlet />` que permite que las rutas hijas (`AdminLayout` y sus paginas) se rendericen normalmente.

### NavLink: navegación con estado activo
`AdminLayout` usa `NavLink` en lugar de `Link` para la navegación entre Turnos y Reservas. `NavLink` es un componente especial que recibe una función como `className` o `children` que expone el flag `isActive`, un booleano que React Router calcula comparando la URL actual con el atributo `to` del enlace. Esto permite aplicar estilos distintos al enlace activo sin necesidad de `useState` ni `useLocation` manual.

---

## 7. Hooks Personalizados

Los custom hooks son funciones de JavaScript que comienzan con "use" y pueden llamar a otros hooks de React. Permiten extraer lógica con estado de los componentes para hacerla reutilizable y testeable de forma independiente. En BeautyBrows, los custom hooks actúan como la capa de lógica de negocio entre la base de datos y la UI.

### useStorage: acceso a datos

`useStorage` encapsula todas las operaciones de lectura y escritura sobre IndexedDB a traves de Dexie. Es la capa de datos de la arquitectura: el resto de hooks y componentes no saben que existe IndexedDB, solo llaman funciones como `addTurno()` o `getReservasConTurno()`.

Responsabilidades:

- CRUD completo de turnos: `getTurnos`, `addTurno`, `updateTurno`, `deleteTurno` (que en realidad inactiva el turno), `toggleTurnoEstado`.
- CRUD de reservas: `getReservas`, `getReservasConTurno` (join manual con el turno asociado), `addReserva`, `cancelReserva`, `deleteReserva`.
- Autenticacion: `loginUsuario`, `existeUsuario`, `addUsuario`, `getUsuarioByEmail`.
- Estadisticas: `getEstadisticas`, `getTurnosConDisponibilidad` (calcula cupos disponibles).
- Validaciones de integridad: `addReserva` verifica que el turno este activo, que haya cupos y que el cliente no tenga ya una reserva en ese turno.

### useAuth: consumidor del AuthContext

`useAuth` es un hook minimalista que encapsula el acceso al `AuthContext` con una validación de seguridad. Internamente llama a `useContext(AuthContext)` y verifica que el resultado no sea `null`. Si es `null`, significa que el hook se esta usando fuera del `AuthProvider`, lo que es un error de programacion, y lanza un `Error` descriptivo inmediatamente. Esto es mejor que fallar silenciosamente mas tarde en el componente con un error de "cannot read properties of null".

### useTurnos: lógica de negocio de turnos

`useTurnos` gestiona el estado reactivo de los turnos y expone funciones de alto nivel que incluyen validaciones de negocio. Al montarse, carga los turnos llamando a `useStorage().getTurnosConDisponibilidad()` y los guarda en estado. Expone:

- `crearTurno(datos)`: valida solapamiento horario antes de llamar a `useStorage`.
- `editarTurno(id, datos)`: construye el objeto completo del turno (mezclando datos existentes con los nuevos) y valida solapamiento excluyendo el propio turno mediante `idExcluir`.
- `eliminarTurno(id)`: delega en `useStorage` que cambia el estado a "inactivo".
- `cambiarEstado(id, estado)`: activa o desactiva un turno.
- `getDisponibilidad(id)`: consulta localmente los cupos disponibles de un turno especifico.

La funcion `cargarTurnos` esta envuelta en `useCallback` con dependencias vacias para que su referencia sea estable y no cause loops en el `useEffect` que la llama.

### useReservas: lógica de negocio de reservas

`useReservas` gestiona el estado reactivo de las reservas con sus datos del turno asociados. Al montar, llama a `useStorage().getReservasConTurno()` que hace un join manual: por cada reserva, busca su turno en IndexedDB y lo incrusta en el objeto. Las reservas se ordenan: confirmadas primero, luego por fecha de reserva descendente.

Expone:
- `crearReserva(turnoId, datos)`: hace una verificación optimista contra el estado local (rápida, sin I/O) antes de la verificación definitiva en IndexedDB.
- `cancelarReserva(id)`: cambia el estado a "cancelada". Primero verifica localmente que la reserva exista y no este ya cancelada.
- `getReservasPorTurno(turnoId)`: filtra del estado local, sin ir a la base de datos.
- `getReservasPorCliente(carnet)`: filtra por numero de carnet.
- `estadisticas`: objeto derivado del estado local con totales de confirmadas, canceladas y el total.

---

## 8. Componentes de la Aplicación

### Layouts

**PublicLayout**

Envoltorio para las rutas publicas (`/` y `/login`). Provee un header con el logo BeautyBrows, navegación central (Turnos, Servicios, Nuestro equipo) y el botón de acceso al admin que cambia a "Ver turnos" cuando el usuario esta en la pagina de login (usando `useLocation` para detectar la ruta activa). Incluye un fondo decorativo con gradiente azul claro y un footer con enlaces legales. El contenido de cada pagina se inyecta mediante `<Outlet />`.

**AdminLayout**

Envoltorio para las rutas protegidas. Comparte la misma estética visual que `PublicLayout` (fondo azul degradado) pero con un header que incluye navegación entre "Turnos" y "Reservas" usando `NavLink` con estilos activos, el nombre del usuario autenticado, un boton para ver la zona publica y el botón de logout. El logout llama a la función del contexto y redirige con `navigate("/login", { replace: true })`.

### Páginas

**TurnosDisponibles**

La pagina principal pública. Layout de dos columnas: a la izquierda el `Calendario` y a la derecha el grid de turnos del dia seleccionado. Incluye filtros de horario (Todas / Manana / Tarde) que se aplican sobre los turnos del dia con `useMemo`. Al hacer clic en una `TarjetaTurno` se abre el `Modal` con `FormularioReserva`. Tras una reserva exitosa, muestra la pantalla de confirmación durante 2.6 segundos usando `setTimeout` guardado en `useRef` para poder cancelarlo si el usuario cierra el modal antes.

**Login**

Formulario de autenticación con campos controlados para email y password. Al enviar, llama a `login()` del `AuthContext` y redirige al panel admin si tiene éxito, o muestra el error si las credenciales son incorrectas. Un `useEffect` redirige automáticamente al admin si el usuario ya tiene una sesión activa al llegar a esta pagina.

**AdminTurnos**

Panel de gestión de turnos. Muestra una tabla con todos los turnos (fecha, horario, capacidad total y cupos disponibles). Los botones "Editar" e "Inactivar" abren modales. El modal de edición usa `FormularioTurno` con los datos precargados del turno. El modal de inactivación usa un diálogo de confirmación. El manejo de errores (por ejemplo, solapamiento horario detectado por `useTurnos`) se muestra debajo del formulario dentro del modal.

**AdminReservas**

Panel de gestión de reservas con múltiples funcionalidades avanzadas. Calcula automáticamente si una reserva esta "completada" comparando la fecha del turno asociado con la fecha y hora actual: si el turno ya paso, la reserva se marca visualmente como completada aunque en la base de datos siga como "confirmada". Incluye búsqueda por nombre o carnet, filtro por estado, paginación automática de 10 elementos por pagina y un modal de detalles del cliente. La cancelación usa `ConfirmDialog` para pedir confirmación antes de ejecutar.

### Componentes Reutilizables

**Modal**
Contenedor genérico para diálogos. Acepta titulo, subtitulo opcional, función `onClose` y `children`. Implementa dos `useEffect`: uno para cerrar con Escape y otro para bloquear el scroll del `body`. El overlay cierra el modal al hacer clic fuera del panel. Soporta cuatro tamaños (sm, md, lg, xl) mediante la prop `ancho`. El contenido interno es scrollable si supera el alto disponible.

**FormularioTurno**
Formulario para crear y editar turnos. Detecta automáticamente si esta en modo edición o creación según si la prop `valorInicial` tiene fecha. Valida campos localmente (horas, capacidad) antes de llamar al hook, y muestra los errores de negocio que vienen de `useTurnos` (solapamiento). La función genérica `set<K>()` actualiza cualquier campo con tipado completo.

**FormularioReserva**
Formulario para que el cliente complete sus datos de reserva. Valida que el nombre tenga al menos 3 caracteres y que el carnet tenga exactamente 11 caracteres. Cuando la prop `exito` es `true` (controlada por el padre `TurnosDisponibles`), muestra la pantalla de confirmación en lugar del formulario. El estado de éxito lo gestiona el padre para poder controlar el temporizador de cierre.

**ConfirmDialog**
Componente de dialogo de confirmación para acciones destructivas. Acepta dos variantes: "peligro" (botón rojo, icono de papelera, para eliminar) y "advertencia" (botón naranja, icono de alerta, para cancelar reservas). Se usa siempre dentro de un `Modal`. El mensaje descriptivo explica exactamente que pasara si el usuario confirma.

**BadgeEstado**
Componente minimalista que muestra el estado de un turno o reserva con colores semánticos consistentes en toda la aplicación. Centraliza la lógica de colores: si en el futuro cambia el color de "confirmada", se modifica en un solo lugar y se propaga a todas las tablas. Soporta activo (verde), inactivo (gris), confirmada (verde), cancelada (rojo) y completada (amarillo).

**Calendario**
Componente de calendario mensual interactivo. Calcula la grilla de días del mes con `useMemo` ajustando el primer día para que la semana empiece en lunes. Cada día puede estar en tres estados: seleccionado (azul oscuro relleno), con turnos disponibles (punto azul indicador) o sin turnos/pasado (gris, no clickeable). Permite navegar entre meses con las flechas. Debajo del calendario muestra un resumen del servicio para la fecha seleccionada.

**TarjetaTurno**
Tarjeta individual que muestra la información de un turno disponible. Tiene tres estados visuales: disponible (blanco), poco cupo (badge naranja, cuando quedan 2 o menos cupos) y sin cupos (gris, deshabilitado). Muestra la hora de inicio como elemento principal, un badge con los cupos restantes, si es sesión de mañana o tarde, y el botón de reserva. Al hacer clic, notifica al componente padre con la función `onReservar`.

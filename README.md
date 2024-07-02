# API de Gestión de Tareas

Esta API permite realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre tareas individuales. Permite gestionar tareas mediante rutas específicas y utilizando métodos HTTP adecuados para cada operación.

- Tecnologias Utilizadas: Nestjs, TypeORM, PostgreSQL.

### Consideraciones:

- Hacer npm i.
- Crear un archivo .env en la raiz del proyecto.
- Agregar las credenciales de la Base de datos.

# .env.example

# Configuración de la base de datos

TYPE_DB=
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Configuraciones generales

APP_PORT=

- Levantar el proyecto con: npm run start:dev

## Endpoints Disponibles

### 1. Crear una tarea nueva

(POST)[http://localhost:3000/api/tasks]

Crea una nueva tarea con la información proporcionada en el cuerpo de la solicitud (`body`).

**Body de la solicitud (JSON):**

```json
{
  "title": "Título de la tarea",
  "description": "Descripción detallada de la tarea"
}
```

### 2. Buscar todas las tareas

(GET)[http://localhost:3000/api/tasks]

**Response (JSON):**

```json
[
  {
    "id": 3,
    "title": "tarea1",
    "description": "Descripcion1",
    "state": "COMPLETED",
    "createdAt": "2024-07-01T19:00:33.554Z"
  },
  {
    "id": 4,
    "title": "tarea2",
    "description": "Descripcion2",
    "state": "PENDING",
    "createdAt": "2024-07-01T19:00:40.515Z"
  }
]
```

### 3. Busca una tarea por ID:

### Consideraciones:

- Recibe como parametro un ID de tipo numero.

(GET)[http://localhost:3000/api/tasks/3]

**Response (JSON):**

```json

  {
    "id": 3,
    "title": "tarea1",
    "description": "Descripcion1",
    "state": "COMPLETED",
    "createdAt": "2024-07-01T19:00:33.554Z"
  },

```

### 4. Actualiza una tarea por ID:

### Consideraciones:

- Recibe como parametro un ID de tipo numero.
- recibe un body con los datos a actualizar.

(PUT)[http://localhost:3000/api/tasks/9]

Información proporcionada en el cuerpo de la solicitud (`body`).

**Body de la solicitud (JSON):**

```json
{
  "title": "New Title",
  "description": "New description"
}
```

### 5. Elimina una tarea por ID:

### Consideraciones:

- Recibe como parametro un ID de tipo numero.

(DELETE)[http://localhost:3000/api/tasks/5]

**Response (JSON):**

```json
{
  "message": "Task successfully deleted",
  "task": {
    "id": 5,
    "title": "Tarea2",
    "description": "Descripcion2",
    "state": "PENDING"
  },
  "result": {
    "raw": [],
    "affected": 1
  }
}
```

### 6. Busca tareas filtrando por estado:

### Consideraciones:

- Recibe como parametro un estado de tipo string.

(GET)[http://localhost:3000/api/tasks/status/PENDING]

**Response (JSON):**

```json
[
  {
    "id": 3,
    "title": "tarea3",
    "description": "descripcion3",
    "state": "PENDING",
    "createdAt": "2024-07-02T01:40:06.471Z"
  }
]
```

### 7. Actualiza el estado de una tarea:

### Consideraciones:

- recibe un body con los datos a actualizar un id de la tarea y un estado.

(PUT)[http://localhost:3000/api/tasks]

Información proporcionada en el cuerpo de la solicitud (`body`).

**Body de la solicitud (JSON):**

```json
{
  "id": 9,
  "state": "DELETED"
}
```

### 8. Devuelve los dias transcurridos desde que se creo la tarea:

### Consideraciones:

- Recibe como parametro un ID de tipo numero.

(GET)[http://localhost:3000/api/tasks/1/days-passed]

**Response (JSON):**

```json
{
  "date_created": "2024-07-01",
  "past_days": 1
}
```

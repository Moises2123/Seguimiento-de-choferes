# Sistema de Gestión de Choferes

Aplicación web para gestionar los registros de entrada y salida de choferes de una institución.

## Características

- Registro de choferes (entrada/salida)
- Gestión de información de viajes (destino, diligencia, etc.)
- Historial de registros
- Edición y eliminación de registros
- Zona horaria configurada para Perú-Lima
- Exportar e imprimir historial de registros en PDF

## Instalación

1. Clona este repositorio:
   ```
   git clone https://github.com/tu-usuario/gestion-choferes.git
   cd gestion-choferes
   ```

2. Instala las dependencias:
   ```
   pip install -r requirements.txt
   ```

3. Crea una base de datos PostgreSQL y configura las variables de entorno:
   - Puedes usar Render, Railway, ElephantSQL, tu propio servidor, etc.
   - Copia `.env.example` a `.env` y edita los valores según tu entorno:
     ```
     cp .env.example .env
     # Edita .env con tus datos de conexión
     ```

4. Ejecuta la aplicación:
   ```
   python main.py
   ```
   O también puedes usar:
   ```
   uvicorn main:app --reload
   ```

5. Abre tu navegador en: http://localhost:8000

## Despliegue en Render

1. Crea una base de datos PostgreSQL en Render y copia los datos de conexión.
2. En tu servicio web de Render, agrega las variables de entorno:
   - PGDATABASE
   - PGUSER
   - PGPASSWORD
   - PGHOST
   - PGPORT
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## Variables de entorno

Configura un archivo `.env` con los siguientes valores:
```
PGDATABASE=nombre_de_tu_db
PGUSER=usuario
PGPASSWORD=contraseña
PGHOST=host
PGPORT=puerto
```

## Tecnologías utilizadas

- Backend: Python con FastAPI
- Base de datos: PostgreSQL
- Frontend: HTML, CSS, JavaScript
- Librerías: Bootstrap, Font Awesome, SweetAlert2, jsPDF, jsPDF-AutoTable

## Funcionalidad de exportar/imprimir PDF

En el historial de registros puedes:
- Descargar el historial en PDF
- Imprimir el historial en PDF

## Estructura del proyecto

```
gestion-choferes/
│
├── main.py              # Archivo principal de la aplicación
├── requirements.txt     # Dependencias del proyecto
├── .env.example         # Ejemplo de configuración de entorno
│
├── static/              # Archivos estáticos
│   ├── css/
│   │   └── style.css    # Estilos personalizados
│   └── js/
│       └── script.js    # Lógica del cliente
│
└── templates/           # Plantillas HTML
    └── index.html       # Página principal
```

## Personalización

Para agregar o modificar la lista de choferes, edita la variable `CHOFERES` en el archivo `main.py`.

## Licencia

Este proyecto está bajo la Licencia MIT.
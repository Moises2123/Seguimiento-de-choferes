# Sistema de Gestión de Choferes

Aplicación web para gestionar los registros de entrada y salida de choferes de una institución.

## Características

- Registro de choferes (entrada/salida)
- Gestión de información de viajes (destino, diligencia, etc.)
- Historial de registros
- Edición y eliminación de registros
- Zona horaria configurada para Perú-Lima

## Instalación

1. Clone este repositorio:
   ```
   git clone https://github.com/tu-usuario/gestion-choferes.git
   cd gestion-choferes
   ```

2. Instale las dependencias:
   ```
   pip install -r requirements.txt
   ```

3. Ejecute la aplicación:
   ```
   python main.py
   ```

   O también puede usar:
   ```
   uvicorn main:app --reload
   ```

4. Abra su navegador en: http://localhost:8000

## Despliegue en Render

Para desplegar en Render, siga estos pasos:

1. Cree una nueva Web Service en Render
2. Conecte con el repositorio de GitHub
3. Configure el Build Command: `pip install -r requirements.txt`
4. Configure el Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Seleccione el plan de su preferencia y haga clic en "Create Web Service"

Nota: La aplicación ya está configurada para utilizar la zona horaria de Perú-Lima, independientemente de donde se despliegue.

## Tecnologías utilizadas

- Backend: Python con FastAPI
- Base de datos: SQLite
- Frontend: HTML, CSS, JavaScript
- Librerías: Bootstrap, Font Awesome, SweetAlert2

## Estructura del proyecto

```
gestion-choferes/
│
├── main.py              # Archivo principal de la aplicación
├── requirements.txt     # Dependencias del proyecto
├── choferes.db          # Base de datos SQLite (se crea automáticamente)
│
├── static/              # Archivos estáticos
│   ├── css/
│   │   └── styles.css   # Estilos personalizados
│   └── js/
│       └── script.js    # Lógica del cliente
│
└── templates/           # Plantillas HTML
    └── index.html       # Página principal
```

## Personalización

Para agregar o modificar la lista de choferes, edite la variable `CHOFERES` en el archivo `main.py`.

## Licencia

Este proyecto está bajo la Licencia MIT.
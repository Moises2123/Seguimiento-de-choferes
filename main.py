# main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone
import pytz
import os
import uvicorn
from backup_utils import backup_to_csv, backup_database
from dotenv import load_dotenv
load_dotenv()

# Crear la app de FastAPI
app = FastAPI(title="Gestor de choferes", description="API para gestionar registros de choferes", version="1.0.0")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)  

# Configurar carpetas de plantillas y estáticos
templates = Jinja2Templates(directory="templates")
os.makedirs("templates", exist_ok=True)
os.makedirs("static/css", exist_ok=True)
os.makedirs("static/js", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# Configuración de la zona horaria
peru_tz = pytz.timezone('America/Lima')

# Obtener conexión a la base de datos PostgreSQL
def get_db():
    try:
        conn = psycopg2.connect(
            dbname=os.getenv('PGDATABASE', 'choferes'),
            user=os.getenv('PGUSER', 'postgres'),
            password=os.getenv('PGPASSWORD', 'postgres'),
            host=os.getenv('PGHOST', 'localhost'),
            port=os.getenv('PGPORT', '5432')
        )
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        # Crear una conexión por defecto si falla
        try:
            conn = psycopg2.connect(
                dbname=os.getenv('PGDATABASE', 'postgres'),
                user=os.getenv('PGUSER', 'postgres'),
                password=os.getenv('PGPASSWORD', 'postgres'),
                host=os.getenv('PGHOST', 'localhost'),
                port=os.getenv('PGPORT', '5432')
            )
            return conn
        except Exception as e2:
            print(f"Error connecting to default database: {e2}")
            raise e2

# Inicializar la base de datos PostgreSQL
def init_db():
    with get_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS registros (
                id SERIAL PRIMARY KEY,
                nombre_chofer TEXT NOT NULL,
                tipo TEXT NOT NULL,
                destino TEXT NOT NULL,
                diligencia TEXT NOT NULL,
                sustento TEXT NOT NULL,
                solicitud TEXT NOT NULL,
                responsable TEXT NOT NULL,
                fecha_hora TEXT NOT NULL,
                fecha_registro TEXT NOT NULL
            )
            ''')
            conn.commit()

# Modelos de datos
class Registro(BaseModel):
    id: Optional[int] = None
    nombre_chofer: str
    tipo: str  # Entrada/Salida
    destino: str
    diligencia: str
    sustento: str
    solicitud: str
    responsable: str
    fecha_hora: Optional[str] = None
    fecha_registro: Optional[str] = None

class RegistroResponse(BaseModel):
    id: int
    nombre_chofer: str
    tipo: str
    destino: str
    diligencia: str
    sustento: str
    solicitud: str
    responsable: str
    fecha_hora: str
    fecha_registro: str

# Lista de choferes
CHOFERES = [
    "Morris Larrañaga Policarpio",
    "Saucedo Abad Florencio",
    "Rojas Gutierrez Hermes",
    "Paciffico Valles Publio Salvador",
    "Noronha Gomez Joao Andre",
    "Jhean Marco Guerra Vasquez",
    "Reategui Vasquez Javier"
]

# Obtener hora actual en Perú
def get_current_peru_time():
    utc_now = datetime.now(timezone.utc)
    peru_now = utc_now.astimezone(peru_tz)
    return peru_now.strftime("%Y-%m-%d %H:%M:%S")

# Rutas
@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "choferes": CHOFERES})

@app.post("/registros/")
async def crear_registro(registro: Registro):
    conn = get_db()
    cursor = conn.cursor()
    peru_time = get_current_peru_time()
    cursor.execute("""
    INSERT INTO registros (nombre_chofer, tipo, destino, diligencia, sustento, solicitud, responsable, fecha_hora, fecha_registro)
    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id
    """, (
        registro.nombre_chofer, 
        registro.tipo, 
        registro.destino, 
        registro.diligencia, 
        registro.sustento, 
        registro.solicitud, 
        registro.responsable, 
        registro.fecha_hora or peru_time,
        peru_time
    ))
    registro_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    
    # Realizar respaldo
    backup_to_csv()
    backup_database()
    
    return {"id": registro_id, "mensaje": "Registro creado exitosamente"}

@app.get("/registros/", response_model=List[RegistroResponse])
async def listar_registros():
    conn = get_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM registros ORDER BY id DESC")
    registros = cursor.fetchall()
    cursor.close()
    conn.close()
    return registros

@app.get("/registros/{registro_id}", response_model=RegistroResponse)
async def obtener_registro(registro_id: int):
    conn = get_db()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    cursor.execute("SELECT * FROM registros WHERE id = %s", (registro_id,))
    registro = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if registro is None:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    return registro

@app.put("/registros/{registro_id}")
async def actualizar_registro(registro_id: int, registro: Registro):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM registros WHERE id = %s", (registro_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    cursor.execute("""
    UPDATE registros
    SET nombre_chofer = %s, tipo = %s, destino = %s, diligencia = %s, sustento = %s, solicitud = %s, responsable = %s
    WHERE id = %s
    """, (
        registro.nombre_chofer,
        registro.tipo,
        registro.destino,
        registro.diligencia,
        registro.sustento,
        registro.solicitud,
        registro.responsable,
        registro_id
    ))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Realizar respaldo
    backup_to_csv()
    backup_database()
    
    return {"mensaje": "Registro actualizado exitosamente"}

@app.delete("/registros/{registro_id}")
async def eliminar_registro(registro_id: int):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM registros WHERE id = %s", (registro_id,))
    if not cursor.fetchone():
        cursor.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    cursor.execute("DELETE FROM registros WHERE id = %s", (registro_id,))
    conn.commit()
    cursor.close()
    conn.close()
    
    # Realizar respaldo
    backup_to_csv()
    backup_database()
    
    return {"mensaje": "Registro eliminado exitosamente"}

# Inicializar la base de datos al inicio
@app.on_event("startup")
async def startup_event():
    init_db()

# Ejecutar la aplicación
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

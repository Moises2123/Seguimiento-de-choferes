import psycopg2
import csv
import shutil
from datetime import datetime
import os

# Respaldo a CSV desde PostgreSQL

def backup_to_csv(db_params=None, backup_file="backup_choferes.csv"):
    db_params = db_params or {
        'dbname': os.getenv('PGDATABASE', 'choferes'),
        'user': os.getenv('PGUSER', 'postgres'),
        'password': os.getenv('PGPASSWORD', 'postgres'),
        'host': os.getenv('PGHOST', 'localhost'),
        'port': os.getenv('PGPORT', '5432')
    }
    connection = psycopg2.connect(**db_params)
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM registros")
    records = cursor.fetchall()
    column_names = [desc[0] for desc in cursor.description]
    with open(backup_file, mode='w', newline='', encoding='utf-8') as file:
        writer = csv.writer(file)
        writer.writerow(column_names)
        writer.writerows(records)
    cursor.close()
    connection.close()
    print(f"Copia de seguridad CSV creada: {backup_file}")

# Respaldo del archivo de base de datos (no aplica igual para PostgreSQL, pero se puede hacer un dump externo)
def backup_database():
    # Puedes usar pg_dump para un respaldo completo si lo deseas
    print("Para respaldo completo de PostgreSQL, use pg_dump desde la terminal.")

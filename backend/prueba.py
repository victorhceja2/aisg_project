import pyodbc
import pandas as pd

# 🎯 CONFIGURACIÓN DE CONEXIÓN
server = 'aisgqa.cz0rtlegnc6d.us-east-1.rds.amazonaws.com'
port = '1433'
database = 'aisgProduction'
username = 'joan1'
password = '>8EtfWHq35@7(0<9xAM'
search_value = '11'  # Cambia aquí el valor que quieras buscar

# 📡 STRING DE CONEXIÓN
conn_str = (
    f"DRIVER={{ODBC Driver 18 for SQL Server}};"
    f"SERVER={server},{port};"
    f"DATABASE={database};"
    f"UID={username};"
    f"PWD={password};"
    f"Encrypt=no;"  # Quita esto si usas certificado SSL configurado
)
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

# 🗂️ Obtener columnas buscables
query_columns = """
SELECT s.name AS schema_name, t.name AS table_name, c.name AS column_name
FROM sys.columns c
JOIN sys.tables t ON c.object_id = t.object_id
JOIN sys.schemas s ON t.schema_id = s.schema_id
JOIN sys.types ty ON c.user_type_id = ty.user_type_id
WHERE ty.name IN ('varchar', 'nvarchar', 'char', 'nchar', 'text', 'ntext', 'int', 'bigint', 'smallint', 'tinyint', 'numeric', 'decimal');
"""

cursor.execute(query_columns)
columns = cursor.fetchall()

# 📊 Resultados encontrados
matches = []

for schema, table, column in columns:
    full_table = f"[{schema}].[{table}]"
    full_column = f"[{column}]"
    dynamic_query = f"""
    SELECT TOP 1 * FROM {full_table}
    WHERE TRY_CAST({full_column} AS NVARCHAR) LIKE ?
    """
    try:
        cursor.execute(dynamic_query, f'%{search_value}%')
        row = cursor.fetchone()
        if row:
            print(f"✅ Found in {full_table}.{column}")
            matches.append((schema, table, column))
    except Exception as e:
        print(f"⚠️ Error querying {full_table}.{column}: {e}")

# 📝 Exportar resultado
df = pd.DataFrame(matches, columns=['Schema', 'Table', 'Column'])
print("\n📋 Resultado final:")
print(df.to_string(index=False))

cursor.close()
conn.close()

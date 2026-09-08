import sqlite3

conn = sqlite3.connect("app.db")
tables = conn.execute(
    "SELECT name FROM sqlite_master WHERE type='table'"
).fetchall()

print("Tables trouvées dans app.db :")
for table in tables:
    print(" -", table[0])

conn.close()
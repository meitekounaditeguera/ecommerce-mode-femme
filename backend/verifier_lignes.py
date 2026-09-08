import sqlite3
conn = sqlite3.connect('app.db')
for col in conn.execute("PRAGMA table_info(lignes_commande)"):
    print(col)

import sqlite3
conn = sqlite3.connect('app.db')
conn.execute("DELETE FROM avis")
conn.commit()
print("Table avis vidée")
conn.close()

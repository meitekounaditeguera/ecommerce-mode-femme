import sqlite3

conn = sqlite3.connect("app.db")
resultat = conn.execute("PRAGMA index_list(avis)").fetchall()

print("Index/contraintes sur la table 'avis' :")
for ligne in resultat:
    print(" -", ligne)

conn.close()
import csv

input_file = "AllMoviesDetails_clean.csv"
output_file = "AllMoviesDetails_w.csv"

with open(input_file, "r", encoding="utf-8", errors="ignore") as infile:
    reader = csv.reader(infile, delimiter=";")
    rows = list(reader)

# Número esperado de columnas (el de la cabecera)
num_cols = len(rows[0])

cleaned_rows = []

for i, row in enumerate(rows):
    if len(row) != num_cols:
        # Si la fila está rota, la intentamos recomponer uniendo columnas
        fixed_row = []
        buffer = ""
        inside_quotes = False

        for cell in row:
            if cell.startswith('"') and not inside_quotes:
                inside_quotes = True
                buffer = cell
            elif cell.endswith('"') and inside_quotes:
                buffer += ";" + cell
                fixed_row.append(buffer.replace('"', '""'))
                buffer = ""
                inside_quotes = False
            elif inside_quotes:
                buffer += ";" + cell
            else:
                fixed_row.append(cell.replace('"', '""'))

        # Si aún hay algo en buffer, lo metemos
        if buffer:
            fixed_row.append(buffer.replace('"', '""'))

        # Rellenamos columnas faltantes
        while len(fixed_row) < num_cols:
            fixed_row.append("")

        cleaned_rows.append(fixed_row[:num_cols])
    else:
        # Fila normal, escapamos comillas
        cleaned_rows.append([cell.replace('"', '""') for cell in row])

# Guardamos CSV limpio
with open(output_file, "w", encoding="utf-8", newline="") as outfile:
    writer = csv.writer(outfile, delimiter=";", quoting=csv.QUOTE_MINIMAL)
    writer.writerows(cleaned_rows)

print(f"Archivo limpio guardado en: {output_file}")

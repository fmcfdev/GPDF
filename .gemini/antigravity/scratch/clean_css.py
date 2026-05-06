import re
import os

file_path = r'c:\Users\fabriciom\Documents\GitProjects\GPDF\assets\css\style.css'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

cleaned_lines = []
for line in lines:
    # 1. Identifica se a linha contém um comentário de "Seção" ou "Cabeçalho"
    # Padrões: /* ── ... ── */ OU /* Seção em :root */
    is_section_header = re.search(r'/\* (──|Paleta|Fundos|Cards|Texto|Estados|Misc)', line)
    
    if is_section_header:
        # Mantém a linha de cabeçalho intacta
        cleaned_lines.append(line)
    else:
        # 2. Remove comentários de linha (ex: /* algo */ no final ou sozinho)
        # Mas preserva o código antes do comentário se houver
        cleaned_line = re.sub(r'/\*.*?\*/', '', line).rstrip()
        if cleaned_line or line.strip() == "":
            cleaned_lines.append(cleaned_line + '\n')

# Grava o arquivo limpo
with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(cleaned_lines)

print("Limpeza concluída com sucesso!")

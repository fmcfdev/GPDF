import re

file_path = r'c:\Users\fabriciom\Documents\GitProjects\GPDF\assets\css\style.css'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Separar as Media Queries do resto do conteúdo
# Este regex busca blocos @media inteiros
media_queries = re.findall(r'@media\s*\(.*?\)\s*\{[\s\S]*?\n\}', content)

# Remove as media queries do conteúdo original para reprocessar
base_content = content
for mq in media_queries:
    base_content = base_content.replace(mq, "")

# 2. Organizar Media Queries por breakpoint
mq_600 = []
mq_768 = []
mq_900 = []
mq_1024 = []
other_mq = []

for mq in media_queries:
    if "max-width: 600px" in mq:
        # Pega apenas o conteúdo de dentro das chaves
        inner = re.search(r'\{([\s\S]*)\}', mq).group(1).strip()
        mq_600.append(inner)
    elif "max-width: 768px" in mq:
        inner = re.search(r'\{([\s\S]*)\}', mq).group(1).strip()
        mq_768.append(inner)
    elif "max-width: 900px" in mq:
        inner = re.search(r'\{([\s\S]*)\}', mq).group(1).strip()
        mq_900.append(inner)
    elif "max-width: 1024px" in mq:
        inner = re.search(r'\{([\s\S]*)\}', mq).group(1).strip()
        mq_1024.append(inner)
    else:
        other_mq.append(mq)

# 3. Reconstruir a seção de Media Queries consolidada
responsive_section = "\n\n/* ══════════════════════════════════════════════\n   DESIGN RESPONSIVO (Consolidado)\n   ══════════════════════════════════════════════ */\n"

if mq_1024:
    responsive_section += "\n@media (max-width: 1024px) {\n  " + "\n\n  ".join(mq_1024) + "\n}\n"
if mq_900:
    responsive_section += "\n@media (max-width: 900px) {\n  " + "\n\n  ".join(mq_900) + "\n}\n"
if mq_768:
    responsive_section += "\n@media (max-width: 768px) {\n  " + "\n\n  ".join(mq_768) + "\n}\n"
if mq_600:
    responsive_section += "\n@media (max-width: 600px) {\n  " + "\n\n  ".join(mq_600) + "\n}\n"

for mq in other_mq:
    responsive_section += "\n" + mq + "\n"

# 4. Limpeza final do conteúdo base (remover espaços vazios excessivos)
base_content = re.sub(r'\n{3,}', '\n\n', base_content).strip()

# 5. Salvar o arquivo final
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(base_content + "\n" + responsive_section)

print("Organização concluída com sucesso!")

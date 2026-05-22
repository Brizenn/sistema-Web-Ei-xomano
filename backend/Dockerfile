FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY backend/package*.json ./backend/

# Instalar dependências
RUN cd backend && npm install

# Copiar o restante das pastas necessárias do projeto
COPY backend/ ./backend/
COPY db/ ./db/

# Mudar para a pasta do backend
WORKDIR /app/backend

# Expõe a porta do backend
EXPOSE 3000

# Inicializa o banco de dados (aplica o banco.sql) e inicia o servidor
CMD ["sh", "-c", "node init_db.js && npm start"]

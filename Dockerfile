# Dockerfile.dev
FROM node:20-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Angular
EXPOSE 4200

# Comando por defecto
CMD ["npm", "start"]

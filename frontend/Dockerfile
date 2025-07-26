# Basis-Image
FROM node:18

# Arbeitsverzeichnis
WORKDIR /app

# Abhängigkeiten kopieren & installieren
COPY package*.json ./
RUN npm install

# Restlichen Code kopieren
COPY . .

# Port (z. B. 3000) freigeben
EXPOSE 3000

# Startkommando
CMD ["npm", "start"]

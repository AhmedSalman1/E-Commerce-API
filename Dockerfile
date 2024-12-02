FROM node:18

WORKDIR /app

COPY package*.json .

# RUN npm install --only=production
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
FROM node:17-alpine3.12
WORKDIR /app
COPY package*.json ./
COPY . .
RUN npm install 

EXPOSE 3000

CMD npm run start

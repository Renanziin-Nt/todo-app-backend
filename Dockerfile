FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/
RUN npm cache clean --force
RUN npm install
RUN npx prisma generate
COPY . .

RUN npm run build

EXPOSE 80

CMD ["npm", "start"]
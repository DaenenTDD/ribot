FROM node:26-alpine
WORKDIR /app
COPY package.json package-lock.json /app/
RUN npm ci --omit=dev
COPY . .
CMD ["sh", "start.sh"]
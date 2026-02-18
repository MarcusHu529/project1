FROM node:alpine

RUN apk add --no-cache npm
RUN mkdir /app
WORKDIR /app

# Copy only package files first for better layer caching
COPY package.json package-lock.json ./
RUN npm ci

COPY . /app

EXPOSE 3000

ENV VAPID_PUBLIC_KEY=BN_kUjEYt4hLasI8N8ivklyDPXCjc2Z6bY5uVksSp2n2wE5-oPqrsJO3ZW_DroXZN5z7lU7AmI2w1bg9PMW5548
ENV SERVER_URL=http://localhost:4000

ENTRYPOINT ["npm", "run", "dev-https"]
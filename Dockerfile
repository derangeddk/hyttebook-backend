FROM  node

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 4752
CMD [ "node", "src/start"]

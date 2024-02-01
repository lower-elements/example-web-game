from node:alpine

ADD . /app
WORKDIR /app
RUN npm install
EXPOSE 3000
RUN npx tsc
ENTRYPOINT ["node", "--enable-source-maps", "dist/index.js"]
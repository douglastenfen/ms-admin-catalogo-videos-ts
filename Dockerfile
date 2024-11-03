FROM node:lts-slim

RUN npm install -g @nestjs/cli@10.4.5

USER node

WORKDIR /home/node/app

CMD ["tail", "-f", "/dev/null"]
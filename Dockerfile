FROM alpine:latest

LABEL "com.github.actions.name"="Jekyll Publish Drafts"
LABEL "com.github.actions.description"="Publish Jekyll drafts with a date greater than the current time"
LABEL "com.github.actions.icon"="upload-cloud"
LABEL "com.github.actions.color"="green"

LABEL version="0.1.0"
LABEL repository="https://github.com/soywiz/github-action-jekyll-publish-drafts"
LABEL homepage="https://soywiz.com/"
LABEL maintainer="Carlos Ballesteros Velasco <soywiz@gmail.com>"

RUN apk add --no-cache git nodejs npm

COPY package.json package-lock.json /
RUN npm install

COPY README.md LICENSE start.sh script.ts tsconfig.json /

RUN npx typescript

CMD ["/start.sh"]

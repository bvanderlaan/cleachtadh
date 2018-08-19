################################################################################
# Stage 1: Build the Angluar application
################################################################################
FROM node:8-alpine as build_app

ENV WORKDIR=/usr/src/app
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# The node image removes these packages as they are only needed to build node not to run it
# Since we are installing/building npm packages will need these in the image
RUN apk add --no-cache --virtual .build-deps \
  gcc \
  g++ \
  make \
  python

COPY . $WORKDIR

RUN npm install \
  && apk del .build-deps

RUN node_modules/.bin/ng build --prod --output-path ./build

################################################################################
# Stage 2:  Run the Angular application
################################################################################

FROM nginx
COPY --from=build_app /usr/src/app/build /usr/share/nginx/html

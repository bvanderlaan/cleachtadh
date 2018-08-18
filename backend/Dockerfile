FROM node:8-alpine

# The node image removes these packages as they are only needed to build node not to run it
# Since we update npm package at start up will need these in the image
RUN apk add --no-cache     bash     curl     gcc     g++     make     nano     python

# Create directory for the application
ENV WORKDIR=/usr/src/app
RUN mkdir -p $WORKDIR
WORKDIR $WORKDIR

# Copy required files for install and bootstrap image
COPY script/ script/
COPY ./package.json $WORKDIR/
RUN script/bootstrap

# Reset npm logging to default levels
ENV NPM_CONFIG_LOGLEVEL warn

# Copy application
COPY . $WORKDIR

# Run server
CMD [ "script/server" ]

FROM node:8-alpine

# The node image removes these packages as they are only needed to build node not to run it
# Since we update npm package at start up will need these in the image
RUN apk add --no-cache     bash     curl     gcc     g++     make     nano     python

# Create directory for the application
ENV WORKDIR=/usr/src/app
RUN mkdir -p $WORKDIR && \
    chown node:node $WORKDIR
WORKDIR $WORKDIR
USER node

# Copy required files for install and bootstrap image
COPY --chown=node:node script/ script/
COPY --chown=node:node ./package.json $WORKDIR/
RUN chmod +x -R script && \
  script/bootstrap

# Reset npm logging to default levels
ENV NPM_CONFIG_LOGLEVEL warn

# Copy application
COPY --chown=node:node . $WORKDIR
# The above copy will overwrite the script folders execute bit
RUN chmod +x -R script

# Run server
CMD [ "script/server" ]

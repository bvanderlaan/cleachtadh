# cleachtadh
[![Build Status](https://travis-ci.org/bvanderlaan/cleachtadh.svg?branch=master)](https://travis-ci.org/bvanderlaan/cleachtadh)

A code kata registry

## Usage

The cleachtadh service has an HTTP RESTful API.
It also hosts interactive documentation for its RESTful APIs at its `/docs` route.
For details on how to use the APIs start the cleachtadh service and navigate to its `/docs` route.

The first time the Cleachtadh API node comes up it will publish a Web User Interface on it's root route _if_ and only if the data store has zero users setup. If no Administrator user exists in the data store the WUI will be accessible and provide a form for creating the administrator user. Once the form is submitted the administrator user will be created then the WUI will be removed.

### Installation

To install cleachtadh in a non-Containerized environment you need to setup a server running Node.js.

The server _should_ be able to be any OS with support for Node.js.
The only real requirement cleachtadh has is that the platform can run a modern version of Node.js reliably.

#### Install Node.js
The version of Node.js which cleachtadh supports is `v8.x` and has been tested against `v8.11.1`.
See [How to install Node.js v8.x on Ubuntu 18](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04#installing-using-a-ppa) and use the `https://deb.nodesource.com/setup_8.x` script to install Node.js.

> TL;DR - Here is a summary of the Node.js install commands:
> ```
> $ sudo apt-get update
> $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
> $ sudo apt-get install nodejs
> $ sudo apt-get install build-essential
> $ node --version
> ```

The above will install the latest version of the `v8.x` branch of node. To get more control over the minor version (lets say you want to install `v8.11.1` instead of the latest) you could look at using [NVM](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04#installing-using-nvm) or some other Node installation mechanism.

#### Install cleachtadh

Download cleachtadh from the [GitHub repository](https://github.com/bvanderlaan/cleachtadh) to the servers file system.
Next run the bootstrap script located in the source you just downloaded: `script/bootstrap`

That will install the the required dependencies.

#### Starting cleachtadh

Assuming you have set the appropriate environment variables as described below and setup any required data stores you should be ready to start cleachtadh for the first time.

> **Note:** If you want cleachtadh to be hosted over HTTPS you need to set the `HTTPS_CERTIFICATE` and `HTTPS_KEY` environment variables. See _Encrypting Service Communications_ below for more information.

You can start cleachtadh via the NPM `start` command.

```
$ NODE_ENV="production" npm start
```

You should be able to use process managers such as [Docker](https://www.docker.com/) or [PM2](https://www.npmjs.com/package/pm2) to run multiple instances of cleachtadh per server.

### Environment Variables

When cleachtadh starts up it will read a number of environment variables to allow for custom configuration of the service.

|Environment Variable|Description                                                                |
|:-------------------|:--------------------------------------------------------------------------|
|APP_PORT            |The port the service will listen on. Defaults to `8080`                    |
|APP_PUBLIC_PATH     |The base URL for accessing the service externally. Used by Swagger to call into the API. |
|HEAPDUMP            |Enables support for generating heap dumps. Defaults to `enabled`         |
|HTTPS_CERTIFICATE   |(Optional) The full path to the *.crt file, if not provided then service will be hosted over non-TLS |
|HTTPS_KEY           |(Optional) The full path to the *.key file.                                |
|JWT_SECRET          |The secret to use when verifying a JWT                                     |
|LOG_LEVEL           |Defines the level of logging to generate. Defaults to `warn`             |
|MONGO_CONTACT_POINT           |The host name or IP address of the Mongo node       |
|NODE_ENV            |Defines the mode cleachtadh should run under. Defaults to `development`|
### Request Audit Logging

Each request made to the service will be automatically logged showing the response code, how long it took to responded to the request, and information about the requesting client. The unique request id will also be included in the log.

```json
{"name":"@vanderlaan/cleachtadh","version":"1.0.0","hostname":"249d8bd4136c","pid":40,"req_id":"ca559742-03c1-4dd2-b9a8-d00416750274","level":30,"remote-address":"127.0.0.1","ip":"127.0.0.1","method":"GET","url":"/status/","referer":"-","user-agent":{"family":"curl","major":"7","minor":"35","patch":"0","device":{"family":"Other","major":"0","minor":"0","patch":"0"},"os":{"family":"Other","major":"0","minor":"0","patch":"0"}},"body":{},"short-body":"{}","http-version":"1.1","response-time":4.972071,"response-hrtime":[0,4972071],"status-code":200,"req-headers":{"user-agent":"curl/7.35.0","host":"localhost:7060","accept":"*/*"},"res-headers":{"x-dns-prefetch-control":"off","x-frame-options":"SAMEORIGIN","strict-transport-security":"max-age=15552000; includeSubDomains","x-download-options":"noopen","x-content-type-options":"nosniff","x-xss-protection":"1; mode=block","content-type":"application/json; charset=utf-8","content-length":"70","etag":"W/"46-voMKQOs/pa0w1VB/AI4cBhucyhA""},"req":{"method":"GET","url":"/","headers":"[Circular]","remoteAddress":"127.0.0.1","remotePort":42232},"res":{"statusCode":200,"header":"HTTP/1.1 200 OK
X-DNS-Prefetch-Control: off
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=15552000; includeSubDomains
X-Download-Options: noopen
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Content-Type: application/json; charset=utf-8
Content-Length: 70
ETag: W/"46-voMKQOs/pa0w1VB/AI4cBhucyhA"
Date: Wed, 10 Jan 2018 17:42:00 GMT
Connection: keep-alive

"},"incoming":"<--","msg":"GET /status/ HTTP/1.1 200 4.972071 ms","time":"2018-01-10T17:42:00.264Z","v":0}
```

### Encrypting Service Communications

To ensure requests being made to the service are not vulnerable to man-in-the-middle attacks you can enable Transport Layer Security (TLS).
To do this you just need to provide the path to the certificate (\*.crt) and private key (\*.key) files.

You do this via the environment variables `HTTPS_CERTIFICATE` and `HTTPS_KEY`. If you do not provide `HTTPS_CERTIFICATE` the service will assume that TLS will be handled by the load balancer and will host the service un-encrypted (HTTP). If you provide `HTTPS_CERTIFICATE` then you must also provide `HTTPS_KEY` otherwise you will get an error indicating that the key is missing.

If TLS is enabled then the service will only be accessible over HTTPS otherwise it will be hosted over HTTP.

## Development

### Configurable Options

For any options which can be configured at runtime we set reasonable default values in `./config/index.js` and allow those values to be overwritten via environment variables.
For development you can overwrite the default configuration values by setting the environment variable in the appropriate `docker-compose` file.

When adding new configuration variables:
  * Access the value via `nconf`
  * Set reasonable defaults if any apply in `./config/index.js`
  * Use the `environment` key in the appropriate `docker-compose` file to overwrite the default as needed


### Brining up the cleachtadh Container

The cleachtadh service has also been containerized.
You can start the cleachtadh service on your docker host by:

* Navigate into the cleachtadh directory (the one with the docker-compose files): `cd cleachtadh`
* Then bring up the container with the `bam up` command

If you have any issues regarding `bam` being an unknown command you can install it with: `npm install -g @vanderlaan/bam`.

You can view the logs generated by the cleachtadh service with the `bam log cleachtadh` command.

### Generate Heap Dump

You can enable heap dump generation by setting the `HEAPDUMP` environment variable to *enabled*.
As long as that environment variable is set when you bring up the server you can generate a heap dump by passing the `USR2` signal to the process running the server.

To do that attach to the container running the server:
```
> docker-compose -f docker-compose.development.yml exec cleachtadh /bin/bash
```
Or if your using `bam`
```
> bam attach cleachtadh
```

Now find out the process that the server is running on via the `top` command:
```
# top
```

It should show only one `node` process which should have an ID of `42` but if its a different PID use that value next.
Now you can issue the `USR2` signal to the process:
```
# kill -USR2 42
```

This will generate a new heap dump file in the current working directory of the server (i.e. /usr/src/app) which is being mapped by the docker-compose file to your project directory.
The file by default will be called `heapdump-<date-time-stamp>.heapsnapshot`.

### Logging

Each request object (`req`) will include a logger object which can be used to generate logs in the controller.

```js
module.exports = {
  create(req, res) {
    // create thing
    req.log.info({ thingId: thing.id }, 'New thing created');
    res.status(200).json({...});
  },
};
```

The unique request id (`req.requestId`) will automatically be attached to the log.

```
{"name":"@vanderlaan/cleachtadh","version":"1.0.0","hostname":"249d8bd4136c","pid":41,"req_id":"3fe6bca4-9d91-47db-9a7b-f9ed0a5c0186","level":30,"thingId":1234,"msg":"New thing created","time":"2018-01-11T01:48:14.655Z","v":0}
```

### Running Tests

To run the tests for `cleachtadh` use the `bam test cleachtadh` command from your docker host.
If you don't have the `bam` command installed you can install it with: `npm install -g @vanderlaan/bam`.

This command will also calculate code coverage (shown in terminal), generate a test report (XML), and a LCov code coverage report (HTML). The reports are saved in the `./reports` folder.

### Style Guide

[The JavaScript Style Guide](https://www.npmjs.com/package/@vanderlaan/eslint-config-vanderlaan) is used for this project so you must comply to that rule set. You can verify your changes are in compliance via the `npm run lint` command.

### Contributing

Bug reports and pull requests are welcome. To ensure your contributions are accepted please read and oblige by our [Contribution Guide](.github/CONTRIBUTING.md).
This project is intended to be a safe, welcoming space for collaboration, and contributors are expected to adhere to the [Contributor Covenant](.github/CODE_OF_CONDUCT.md) code of conduct.

# numbat

numbat-powereed metrics system: monitoring &amp; metrics emitter and collector, initial work

## Requirements

You must previously have set up [Riemann](http://riemann.io) and [InfluxDB](http://influxdb.org/).

## Design notes

- TCP comms (use a socket if the collector is local)
- json payloads for ease of use (protobufs only needed for Riemann & handled in that client)
- emit events for logging purposes
- administrative http endpoints to add/remove clients, prod the collector

Each component must be simple & rock-solid. The monitoring system must be reliable.

### collector

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. It receives metrics, buffers, and multiplexes out to databases and to Riemann. It manages its list of clients through a tiny http admin api.

collector configuration:

- logging (console, path, level)
- metrics listen host:port
- admin listen host:port
- list of clients

Each client has type & location information. That is, enough to instantiate the appropriate client object. Client types supported initially:

- riemann endpoint (existence, location)
- influxdb endpoint (existence, location)

### emitter

[numbat-emitter](https://github.com/ceejbot/numbat-emitter) is a module you're intended to require anywhere you need it. Make an emitter object, hang onto it, emit metrics with it.

emitter configuration:

- location of collector


## TODO

Everything.

## License

[ISC](http://opensource.org/licenses/ISC)

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

The collector is a service. You are intended to run it anywhere you like, perhaps many instances of it. It receives metrics, buffers, and multiplexes out to database and to R

collector configuration:

- logging (console, path, level)
- list of clients

Each client has type & location information. That is, enough to instantiate the appropriate client object. Client types supported initially:

- riemann endpoint (existence, location)
- influxdb endpoint (existence, location)

### emitter

Emitter is a module you're intended to require anywhere you need it. Make an emitter object, hang onto it, emit metrics with it.

emitter configuration:

- location of collector


## TODO

Everything.

- split emitter out into its own repo

## License

[ISC](http://opensource.org/licenses/ISC)

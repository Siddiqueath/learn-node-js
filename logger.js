const EventEmitter = require('events');

class Logger extends EventEmitter {
  logRequest(req) {
    const logData = {
      method: req.method,
      path: req.url,
      time: new Date().toLocaleTimeString(),
    };

    this.emit('route_hit', logData);
  }
}

module.exports = Logger;

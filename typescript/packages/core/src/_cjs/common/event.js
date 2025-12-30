Object.defineProperty(exports, '__esModule', { value: true });
exports.Event = void 0;
class Event {
  constructor(name, data, raw) {
    Object.defineProperty(this, 'name', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: name,
    });
    Object.defineProperty(this, 'data', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: data,
    });
    Object.defineProperty(this, 'raw', {
      enumerable: true,
      configurable: true,
      writable: true,
      value: raw,
    });
  }
}
exports.Event = Event;
//# sourceMappingURL=event.js.map

const { performance, PerformanceObserver } = require('perf_hooks');

// 1. Initialize the observer once to automatically catch and print completed measurements
const obs = new PerformanceObserver((items) => {
  items.getEntries().forEach((entry) => {
    // Strips out the internal ID before printing to keep logs clean
    const readableLabel = entry.name.split('::')[0];
    console.log(`⏱️  [${readableLabel}] took ${entry.duration.toFixed(3)}ms`);
  });
});
obs.observe({ entryTypes: ['measure'], buffered: true });

const track = {
  /**
   * Starts a high-resolution timer tied to the specific request
   * @param {Object} req - The Express request object containing req.id
   * @param {string} label - The descriptive name of the operation
   */
  start: (req, label) => {
    const reqId = req.id || 'no-id';
    // Append the unique request ID to prevent collision in parallel testing
    performance.mark(`${label}-start-${reqId}`);
  },

  /**
   * Stops the timer and automatically prints the duration
   * @param {Object} req - The Express request object containing req.id
   * @param {string} label - Must match the exact label used in track.start
   */
  end: (req, label) => {
    const reqId = req.id || 'no-id';
    const startMark = `${label}-start-${reqId}`;
    const endMark = `${label}-end-${reqId}`;
    const finalMeasure = `${label}::${reqId}`;

    performance.mark(endMark);

    try {
      // Measure the difference between start and end marks
      performance.measure(finalMeasure, startMark, endMark);
    } catch (err) {
      console.warn(
        `⚠️ Timer Warning: Could not find start mark for label "${label}"`,
      );
    } finally {
      // Garbage collect marks from memory to avoid leaks during load testing
      performance.clearMarks(startMark);
      performance.clearMarks(endMark);
    }
  },
};

module.exports = track;

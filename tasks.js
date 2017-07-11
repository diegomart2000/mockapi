
'use strict';

/**
 * Promisified setTimeout
 * 
 * @param {number} ms Number of milliseconds to wait
 * @param {any} [args] Optional parameter to pass to setTimeout, then resolve
 * @returns {function:Promise<any>}
 */
const delay = (ms, ...args) => new Promise(resolve => {
  setTimeout(resolve, ms, ...args);
});

/**
 * @returns {Promise<string>}
 */
exports.task1 = () => delay(1000).then(() => 'result 1');

/**
 * @returns {Promise<string>}
 */
exports.task2 = () => new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, 'result 2');
});
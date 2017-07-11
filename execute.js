
'use strict';

const { task1, task2 } = require('./tasks');

/**
 * Resolves to task() result or rejects by timeout
 * @param {function: Promise<any>} taskToExecute
 * @param {number} timeout
 * @returns {Promise<any>}
 */
function execute(taskToExecute, timeout) {
	console.log(taskToExecute);

	let promise = new Promise((resolve, reject) => {
		taskToExecute()
			.then(resolve);

		var t = setTimeout(
			() => reject(`The task didn't finish within ${timeout}ms`),
			timeout
		);
	});
	
	return promise;
}

execute(task2, 1000)
  .then(res => console.log(`task complete: ${res}`))
  .catch(err => console.error(`task failed: ${err}`));
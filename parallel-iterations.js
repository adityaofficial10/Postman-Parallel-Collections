'use strict';
const newman =  require('newman');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const min = 2;
let result = [];

async function collectionRun() {
  await newman.run({
      collection: require('./sample-collection.json'),
      reporters: 'json'
  },function(err, summary){
      console.log("Finished!");  
  });
  return 1;
};

if (isMainThread) {
  const max = 5;
  const min = 1;
  const threadCount = +process.argv[2] || 3;
  const threads = new Set();;
  var start = 1;
  var range = (max - min)/threadCount;
  console.log(`Running with ${threadCount} threads...`);
  for (let i = 0; i < threadCount - 1; i++) {
    const myStart = start;
    threads.add(new Worker(__filename, { workerData: { }}));
    start += range;
  }
  threads.add(new Worker(__filename, { workerData: { }}));
  for (let worker of threads) {
    worker.on('error', (err) => { throw err; });
    worker.on('exit', () => {
      threads.delete(worker);
      console.log(`Thread exiting, ${threads.size} running...`);
      if (threads.size === 0) {
        console.log(result);
      }
    })
    worker.on('message', (msg) => {
      result = result.concat(msg);
    });
  }
} else {
  collectionRun();
  parentPort.postMessage(1);
}


const newman =  require('newman');


async function collectionRun() {
    newman.run({
        collection: require('./sample-collection.json'),
        reporters: 'json'
    },function(err){
      if(err)
       console.log(err);
      console.log("Finished!");  
      console.log(new Date().getTime());
    });
};

async function asyncOperation() {
    await collectionRun();
    return true;
};


async function runParallel(listOfArguments, iterationCount) {
    const concurrencyLimit = iterationCount;
    const argsCopy = listOfArguments.slice();
    const promises = new Array(concurrencyLimit).fill(Promise.resolve());
    // Recursively chain the next Promise to the currently executed Promise
    function chainNext(p) {
      if (argsCopy.length) {
        const arg = argsCopy.shift();
        return p.then(() => {
          const operationPromise = asyncOperation(arg);
          return chainNext(operationPromise);
        })
      }
      return p;
    }
  
    await Promise.all(promises.map(chainNext));
}






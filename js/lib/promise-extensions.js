var promiseWhenNResolve = function(promiseList, numberOfResolutionsNecessaryToResolve) {
    // If this many promises reject, there's no way that
    // numberOfResolutionsNecessaryToResolve promises can resolve:
    var numberOfRejectsNecessaryToReject =
        (promiseList.length - numberOfResolutionsNecessaryToResolve) + 1;
    var resolutions = [];
    var rejects = [];

    return new Promise(function(resolve, reject) {
        promiseList.map(function(promise) {
            promise.then(function(result) {
                resolutions.push(result);
                if (resolutions.length >= numberOfResolutionsNecessaryToResolve) {
                    resolve(resolutions);
                }
            }, function(error) {
                rejects.push(error);
                if (rejects.length >= numberOfRejectsNecessaryToReject) {
                    reject(rejects);
                }
            });
        });
    });
};

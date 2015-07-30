ConsistencyLevel = {
    ONE : "ONE",
    TWO : "TWO",
    THREE : "THREE",
    QUORUM : "QUORUM",
    ALL : "ALL"
};

function numberOfNodestoSatisfyConsistencyLevel(consistencyLevel, replicationFactor) {
    if (consistencyLevel == ConsistencyLevel.ONE)    { return 1; }
    if (consistencyLevel == ConsistencyLevel.TWO)    { return 2; }
    if (consistencyLevel == ConsistencyLevel.THREE)  { return 3; }
    if (consistencyLevel == ConsistencyLevel.QUORUM) { return Math.ceil(replicationFactor / 2); }
    if (consistencyLevel == ConsistencyLevel.ALL)    { return replicationFactor; }
    alert("Reached unreachable code in numberOfNodestoSatisfyConsistencyLevel with arguments " +
         consistencylevel + " " + replicationFactor);
}



var Node = function(id, token, scheduler) {
    this.id = id;
    this.token = token;
    this.scheduler = scheduler;
    this.isAvailable = true;
    this.data = {};

    createNode(id);
    this.updateUI();
};

Node.prototype.updateUI = function() {
    nodeData = {
        id: this.id,
        token: this.token,
        data: JSON.stringify(this.data)
    };

    updateNodeDisplay(nodeData);
};

Node.prototype.decommission = function() {
    this.isAvailable = false;
    displayDecommissioned(this.id);
};

Node.prototype.recommission = function() {
    this.isAvailable = true;
    displayRecommissioned(this.id);
};

Node.prototype.sortNodesByDistance = function(nodes) {
    var nodesCopy = nodes.slice();
    var myID = this.id;
    nodesCopy.sort(function(leftNode, rightNode) {
        var leftDistance  = getScreenDistance(myID, leftNode.id);
        var rightDistance = getScreenDistance(myID, rightNode.id);
        return leftDistance - rightDistance;
    });
    return nodesCopy;
};

Node.prototype.write = function(key, value, timeUntilResolution) {
    var node = this;
    return new Promise(function(resolve, reject) {
        var schedulePromise = function() {
            displayWrite(node.id);
            if (node.isAvailable) {
                node.data[key] = [value, node.scheduler.currentTime];
                node.updateUI();
                resolve("Successfully wrote " + key + ": " + value + " to node " + node.id);
            } else {
                console.log("Node " + node.id + " is unavailable");
                reject("Node " + node.id + " is unavailable");
            }
        };
        // Note that this may not be scheduled immediately!!! The Promise will
        // schedule itself when it is executed, which means that there are two
        // schedulers involved: this.scheduler, which is an instance of
        // Scheduler, and the browser's scheduler for promises. This is far from
        // ideal, but I can't think of a better solution right now.
        node.scheduler.schedule(schedulePromise, timeUntilResolution,
                                "Writing " + key + ": " + value + " to node " + node.id);
    });
};

Node.prototype.read = function(key, timeUntilResolution) {
    var node = this;
    var returnPromise = new Promise(function(resolve, reject) {
        // Note that this promise may not be scheduled immediately!!!
        var schedulePromise = function() {
            displayRead(node.id);
            if (node.isAvailable) {
                resolve(node.data.hasOwnProperty(key) ? node.data[key] : null);
            } else {
                reject("Node " + node.id + " is unavailable");
            }
        };
        // See the comment in Node.prototype.write about when this is scheduled
        node.scheduler.schedule(schedulePromise, timeUntilResolution,
                                "Reading " + key + " from node " + node.id);
    });
    return returnPromise;
};

Node.prototype.coordinateWrite = function(key, value, nodesWithData, consistencyLevel) {
    displayCoordinator(this.id);
    var numberOfNodesToWriteTo =
        numberOfNodestoSatisfyConsistencyLevel(consistencyLevel, nodesWithData.length);
    var availableNodesWithData = nodesWithData.filter(function(node) { return node.isAvailable; });
    if (availableNodesWithData.length < numberOfNodesToWriteTo) {
        console.log("Not enough available nodes to write " + key + ": " + value + " at consistency level " + consistencyLevel);
        return;
    }
    var writePromises = availableNodesWithData.map(function(node) {
        // We use the on-screen distance between two nodes to determine
        // how long it takes one to read/write to the other
        var timeUntilResolution = getScreenDistance(this.id, node.id);
        return node.write(key, value, timeUntilResolution);
    }, this);
    var minimumResults = promiseWhenNResolve(writePromises, numberOfNodesToWriteTo);
    minimumResults.then(function(results) {
        console.log("Successfully wrote " + key + ": " + value + " at consistency level " + consistencyLevel);
    }, function(error) {
        console.log("Not enough available nodes to write " + key + " at consistency level " + consistencyLevel);
    });
};

Node.prototype.coordinateRead = function(key, nodesWithData, consistencyLevel) {
    displayCoordinator(this.id);
    var numberOfNodesToReadFrom =
        numberOfNodestoSatisfyConsistencyLevel(consistencyLevel, nodesWithData.length);
    var availableNodesWithData = nodesWithData.filter(function(node) { return node.isAvailable; });
    if (availableNodesWithData.length < numberOfNodesToReadFrom) {
        console.log("Not enough available nodes to read " + key + " at consistency level " + consistencyLevel);
        return;
    }
    var sortedAvailableNodesWithData = this.sortNodesByDistance(availableNodesWithData);
    var nodesToReadFrom = sortedAvailableNodesWithData.slice(0, numberOfNodesToReadFrom);

    var readPromises = nodesToReadFrom.map(function(node) {
        var timeUntilResolution = getScreenDistance(this.id, node.id);
        return node.read(key, timeUntilResolution);
    }, this);
    var minimumResults = promiseWhenNResolve(readPromises, numberOfNodesToReadFrom);
    minimumResults.then(function(results) {
        var nonNullResults = results.filter(function(result) { return result !== null; });
        nonNullResults.sort(function(left, right) {
            // values are stored in [value, timestamp] pairs
            leftTimestamp = left[1];
            rightTimestamp = right[1];
            // a negative number means that left comes before right in the final
            // sorted list. We do left - right to sort in ascending order.
            return leftTimestamp - rightTimestamp;
        });
        // If we have no non-null results the final result is null. Otherwise,
        // the it is the value component of the result with the latest timestamp.
        var finalResult = (nonNullResults.length === 0) ? null : nonNullResults[nonNullResults.length - 1][0];
        console.log(key + ": " + finalResult + " at consistency level " + consistencyLevel);
    }, function(error) {
        console.log("Not enough available nodes to read " + key + " at consistency level " + consistencyLevel);
    });
};



// To keep things simple, a Cluster can only contain one table.
var Cluster = function(numberOfNodes, replicationFactor) {
    this.scheduler = new Scheduler();
    this.nodes = [];
    for (var x = 0; x < numberOfNodes; x++) {
        var token = Math.floor(x * MAX_HASH / numberOfNodes);
        this.nodes.push(new Node(x, token, this.scheduler));
    }
    this.replicationFactor = replicationFactor;
    // We use this to implement a round-robin scheduling policy:
    this.nextCoordinatorIndex = 0;

    // Since we created the nodes in sorted order this is unnecessary:
    this.sortNodeListByToken();
};

Cluster.prototype.getNextCoordinator = function() {
    var coordinator;
    do {
        coordinator = this.nodes[this.nextCoordinatorIndex];
        this.nextCoordinatorIndex++;
        this.nextCoordinatorIndex = this.nextCoordinatorIndex % this.nodes.length;
    } while (! coordinator.isAvailable);
    return coordinator;
};

Cluster.prototype.getNode = function(nodeID) {
    return this.nodes.filter(function(node) { return node.id === nodeID; })[0];
};

Cluster.prototype.sortNodeListByToken = function() {
    this.nodes.sort(function(left, right) {
        return left.token - right.token;
    });
};

Cluster.prototype.getIndexOfPrimaryNodeForKey = function(key) {
    var keyHash = hashString(key);
    var nodeWithSmallestToken = this.nodes[0];
    var nodeWithGreatestToken = this.nodes[this.nodes.length - 1];
    if (keyHash < nodeWithSmallestToken.token || keyHash > nodeWithGreatestToken.token) {
        return this.nodes.length - 1;  // the index of nodeWithGreatestToken
    }

    // If the hash isn't smaller than the smallest token OR greater than the
    // greatest token, it resides in between two token and belongs to the node
    // with the smaller one:
    for (var x = 0; x < this.nodes.length - 1; x++) {
        var previousNode = this.nodes[x];
        var nextNode = this.nodes[x + 1];
        if (keyHash > previousNode.token && keyHash < nextNode.token) {
            return x;  // the index of previousNode
        }
    }

    alert("Reached unreachable code in Cluster.prototype.getIndexOfPrimaryNodeForKeyHash!");
};

Cluster.prototype.getPrimaryNodeForKey = function(key) {
    return this.nodes[this.getIndexOfPrimaryNodeForKeyHash(key)];
};

Cluster.prototype.getNodesForKey = function(key) {
    var nodes = this.nodes;
    var primaryNodeIndex = this.getIndexOfPrimaryNodeForKey(key);
    var rawNodeIndicesForKey = _.range(primaryNodeIndex, primaryNodeIndex + this.replicationFactor);
    var nodeIndicesForKey = rawNodeIndicesForKey.map(function (index) { return index % nodes.length; });
    return nodeIndicesForKey.map(function (index) { return nodes[index]; });
};

Cluster.prototype.insert = function(key, value, consistencyLevel) {
    clearReadWriteCoordinatorClasses();
    var coordinator = this.getNextCoordinator();
    coordinator.coordinateWrite(key, value, this.getNodesForKey(key), consistencyLevel);
};

Cluster.prototype.select = function(key, consistencyLevel) {
    clearReadWriteCoordinatorClasses();
    var coordinator = this.getNextCoordinator();
    coordinator.coordinateRead(key, this.getNodesForKey(key), consistencyLevel);
};

var Node = function(id, token) {
    this.id = id;
    this.token = token;
    this.isAvailable = true;
    this.data = {};

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

Node.prototype.read = function(key) {
    displayRead(this.id);
    return (this.data.hasOwnProperty(key)) ? this.data[key] : null;
};

Node.prototype.write = function(key, value) {
    displayWrite(this.id);
    this.data[key] = value;
    this.updateUI();
};



ConsistencyLevel = {
    ONE : "ONE",
    TWO : "TWO",
    THREE : "THREE",
    QUORUM : "QUORUM",
    ALL : "ALL"
};

// TODO: Consider making this a private method of Cluster
function numberOfNodestoSatisfyConsistencyLevel(consistencyLevel, replicationFactor) {
    if (consistencyLevel == ConsistencyLevel.ONE)    { return 1; }
    if (consistencyLevel == ConsistencyLevel.TWO)    { return 2; }
    if (consistencyLevel == ConsistencyLevel.THREE)  { return 3; }
    if (consistencyLevel == ConsistencyLevel.QUORUM) { return Math.ceil(replicationFactor / 2); }
    if (consistencyLevel == ConsistencyLevel.ALL)    { return replicationFactor; }
    alert("Reached unreachable code in numberOfNodestoSatisfyConsistencyLevel with arguments " +
         consistencylevel + " " + replicationFactor);
}



// To keep things simple, a Cluster can only contain one table.
var Cluster = function(numberOfNodes, replicationFactor) {
    this.nodes = [];
    for (var x = 0; x < numberOfNodes; x++) {
        var token = Math.floor(x * MAX_HASH / numberOfNodes);
        this.nodes.push(new Node(x, token));
    }
    this.replicationFactor = replicationFactor;

    // Since we created the nodes in sorted order this is unnecessary:
    this.sortNodeListByToken();
};

Cluster.prototype.getNode = function(nodeID) {
    return this.nodes.filter(function(node) { return node.id === nodeID; })[0];
};

Cluster.prototype.sortNodeListByToken = function() {
    this.nodes.sort(function(left, right) {
        return left.token - right.token;
    });
};

Cluster.prototype.getIndexOfPrimaryNodeForKeyHash = function(keyHash) {
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

Cluster.prototype.getPrimaryNodeForKeyHash = function(keyHash) {
    return this.nodes[this.getIndexOfPrimaryNodeForKeyHash(keyHash)];
};

Cluster.prototype.getNodesForKeyHash = function(keyHash) {
    // TODO: see if there's a better way to do this while avoiding 'this' issues
    var nodes = this.nodes;
    var primaryNodeIndex = this.getIndexOfPrimaryNodeForKeyHash(keyHash);
    var rawNodeIndicesForKeyHash = _.range(primaryNodeIndex, primaryNodeIndex + this.replicationFactor);
    var nodeIndicesForKeyHash = rawNodeIndicesForKeyHash.map(function (index) { return index % nodes.length; });
    return nodeIndicesForKeyHash.map(function (index) { return nodes[index]; });
};

Cluster.prototype.getAvailableNodesWithData = function(key) {
    var nodesWithData = this.getNodesForKeyHash(hashString(key));
    return nodesWithData.filter(function(node) { return node.isAvailable; });
};

// Returns a list of available nodes that will satisfy consistencyLevel if all
// of them are succesfully queried. Throws an exception If there are not enough
// available nodes to satisfy the consistency level.
Cluster.prototype.getNodesToSatisfyConsistencyLevel = function(key, consistencyLevel) {
    var numberOfNodesRequired = numberOfNodestoSatisfyConsistencyLevel(consistencyLevel, this.replicationFactor);
    var availableNodesWithData = this.getAvailableNodesWithData(key);
    if (availableNodesWithData.length < numberOfNodesRequired) {
        throw "Not enough nodes available to satisfy consistency level " + consistencyLevel;
    }
    return availableNodesWithData.slice(0, numberOfNodesRequired); // Get first numberOfNodesRequired elements
};

Cluster.prototype.insert = function(key, value, consistencyLevel) {
    clearReadWriteClasses();
    var nodesToWriteTo = this.getNodesToSatisfyConsistencyLevel(key, consistencyLevel);
    nodesToWriteTo.forEach(function(node) { node.write(key, value); });
};

Cluster.prototype.select = function(key, consistencyLevel) {
    clearReadWriteClasses();
    var nodesToReadFrom = this.getNodesToSatisfyConsistencyLevel(key, consistencyLevel);
    return nodesToReadFrom.map(function(node) { return node.read(key); });
};

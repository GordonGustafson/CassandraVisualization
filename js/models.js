var Node = function(id, token) {
    this.id = id;
    this.token = token;
    this.data = {};
};

Node.prototype.updateUI = function() {
    nodeData = {
        id: this.id,
        token: this.token,
        data: JSON.stringify(this.data)
    };

    updateNodeDisplay(nodeData);
};
// To keep things simple, a Cluster can only contain one table.
var Cluster = function(numberOfNodes, replicationFactor) {
    this.nodeList = [];
    for (var x = 0; x < numberOfNodes; x++) {
        var token = Math.floor(x * MAX_HASH / numberOfNodes);
        this.nodeList.push(new Node(x, token));
    }
    this.replicationFactor = replicationFactor;

    // Since we created the nodes in sorted order this is unnecessary:
    this.sortNodeListByToken();

    this.updateUI();
};

Cluster.prototype.sortNodeListByToken = function() {
    this.nodeList.sort(function(left, right) {
        return left.token - right.token;
    });
};

Cluster.prototype.updateUI = function() {
    this.nodeList.forEach(function (node) { node.updateUI(); });
};

Cluster.prototype.getIndexOfPrimaryNodeForKeyHash = function(keyHash) {
    var nodeWithSmallestToken = this.nodeList[0];
    var nodeWithGreatestToken = this.nodeList[this.nodeList.length - 1];
    if (keyHash < nodeWithSmallestToken.token || keyHash > nodeWithGreatestToken.token) {
        return this.nodeList.length - 1;  // the index of nodeWithGreatestToken
    }

    // If the hash isn't smaller than the smallest token OR greater than the
    // greatest token, it resides in between two token and belongs to the node
    // with the smaller one:
    for (var x = 0; x < this.nodeList.length - 1; x++) {
        var previousNode = this.nodeList[x];
        var nextNode = this.nodeList[x + 1];
        if (keyHash > previousNode.token && keyHash < nextNode.token) {
            return x;  // the index of previousNode
        }
    }

    alert("Reached unreachable code in Cluster.prototype.getIndexOfPrimaryNodeForKeyHash!");
};

Cluster.prototype.getPrimaryNodeForKeyHash = function(keyHash) {
    return this.nodeList[this.getIndexOfPrimaryNodeForKeyHash(keyHash)]
}

Cluster.prototype.getNodesForKeyHash = function(keyHash) {
    // TODO: see if there's a better way to do this while avoiding 'this' issues
    var nodeList = this.nodeList;
    var primaryNodeIndex = this.getIndexOfPrimaryNodeForKeyHash(keyHash);
    var rawNodeIndicesForKeyHash = _.range(primaryNodeIndex, primaryNodeIndex + this.replicationFactor);
    var nodeIndicesForKeyHash = rawNodeIndicesForKeyHash.map(function (index) { return index % nodeList.length; });
    return nodeIndicesForKeyHash.map(function (index) { return nodeList[index]; });
};

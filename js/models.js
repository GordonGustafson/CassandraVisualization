var Node = function(id, initialToken) {
    this.id = id;
    this.initialToken = initialToken;
    this.data = {};
};

Node.prototype.updateUI = function() {
    nodeData = {
        id: this.id,
        initialToken: this.initialToken,
        data: JSON.stringify(this.data)
    };

    updateNodeDisplay(nodeData);
};
// To keep things simple, a Cluster can only contain one table.
var Cluster = function(numberOfNodes) {
    this.nodeList = [];
    for (var x = 0; x < numberOfNodes; x++) {
        var initialToken = Math.floor(x * MAX_HASH / numberOfNodes);
        this.nodeList.push(new Node(x, initialToken));
    }

    this.updateUI();
};


Cluster.prototype.updateUI = function() {
    this.nodeList.forEach(function (node) { node.updateUI(); });
};


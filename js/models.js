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
var Cluster = function(numberOfNodes) {
    this.nodeList = [];
    for (var x = 0; x < numberOfNodes; x++) {
        var token = Math.floor(x * MAX_HASH / numberOfNodes);
        this.nodeList.push(new Node(x, token));
    }

    this.updateUI();
};


Cluster.prototype.updateUI = function() {
    this.nodeList.forEach(function (node) { node.updateUI(); });
};


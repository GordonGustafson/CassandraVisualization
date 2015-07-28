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

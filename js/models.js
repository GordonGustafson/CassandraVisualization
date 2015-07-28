var Node = function(id, initialToken) {
    this.id = id;
    this.initialToken = initialToken;
    this.data = {};
};

Node.prototype.updateUI = function() {
    // user-interface.js assumes that these field
    // names match the class names in index.html
    nodeData = {
        id: this.id,
        initialToken: this.initialToken,
        data: JSON.stringify(this.data)
    };

    updateNodeDisplay(nodeData);
};

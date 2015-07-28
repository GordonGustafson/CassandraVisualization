function updateNodeDisplay(nodeData) {
    var nodeSelector = "#node" + nodeData.id;

    for (var key in nodeData) {
        if (! nodeData.hasOwnProperty(key)) { continue; }
        var value = nodeData[key];
        console.log(key);
        console.log(value);
        $(nodeSelector + " ." + key).text(value);
    }
}

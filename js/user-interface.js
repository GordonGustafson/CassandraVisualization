function updateNodeDisplay(nodeData) {
    var nodeSelector = "#node" + nodeData.id;
    $(nodeSelector + " table").empty();    // clear the existing table

    for (var key in nodeData) {
        if (! nodeData.hasOwnProperty(key)) { continue; }
        var value = nodeData[key];
        $(nodeSelector + " table").append("<tr><td>" + key + ":</td><td>" + value + "</td></tr>");
    }
}

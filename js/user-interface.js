function updateNodeDisplay(nodeData) {
    var nodeSelector = "#node" + nodeData.id;
    $(nodeSelector + " table").empty();    // clear the existing table

    for (var key in nodeData) {
        if (! nodeData.hasOwnProperty(key)) { continue; }
        var value = nodeData[key];
        $(nodeSelector + " table").append("<tr><td>" + key + ":</td><td>" + value + "</td></tr>");
    }
}

function displayRead(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).addClass("being-read");
}

function displayWrite(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).addClass("being-written");
}

function clearReadWriteClasses() {
    $(".node").removeClass("being-read").removeClass("being-written");
}


function displayDecommissioned(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).addClass("decommissioned");
}

function displayRecommissioned(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).removeClass("decommissioned");
}

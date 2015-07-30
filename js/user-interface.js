function createNode(nodeID) {
    $("#node-container").append('<div id="node' + nodeID + '" class="node"><table></table></div>');
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).draggable();
}

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

function displayCoordinator(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).addClass("coordinating");
}

function clearReadWriteCoordinatorClasses() {
    $(".node").removeClass("being-read")
        .removeClass("being-written")
        .removeClass("coordinating");
}


function displayDecommissioned(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).addClass("decommissioned");
}

function displayRecommissioned(nodeID) {
    var nodeSelector = "#node" + nodeID;
    $(nodeSelector).removeClass("decommissioned");
}


function getScreenDistance(nodeOneID, nodeTwoID) {
    var nodeOneSelector = "#node" + nodeOneID;
    var nodeTwoSelector = "#node" + nodeTwoID;
    var nodeOneOffset = $(nodeOneSelector).offset();
    var nodeTwoOffset = $(nodeTwoSelector).offset();
    var distanceAsFloat =
        Math.sqrt(Math.pow(nodeOneOffset.left - nodeTwoOffset.left, 2) +
                  Math.pow(nodeOneOffset.top  - nodeTwoOffset.top,  2));
    return Math.ceil(distanceAsFloat);
}

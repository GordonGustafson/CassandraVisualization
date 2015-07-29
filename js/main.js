$(document).ready(function () {
    var cluster = new Cluster(18, 3);
    cluster.getNode(1).decommission();
    cluster.insert("harry potter", "wizard", ConsistencyLevel.QUORUM);
    cluster.getNode(1).recommission();
    cluster.insert("harry potter", "wizard", ConsistencyLevel.QUORUM);
});

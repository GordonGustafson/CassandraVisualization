var cluster;

$(document).ready(function () {
    cluster = new Cluster(6, 3);
    cluster.getNode(1).decommission();
    cluster.insert("harry potter", "human", ConsistencyLevel.QUORUM);
    cluster.getNode(1).recommission();
    cluster.insert("harry potter", "wizard", ConsistencyLevel.QUORUM);
    console.log( cluster.select("harry potter", ConsistencyLevel.QUORUM) );
    cluster.insert("hermione granger", "witch", ConsistencyLevel.QUORUM);
});

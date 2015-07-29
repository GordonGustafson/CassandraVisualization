$(document).ready(function () {
    var cluster = new Cluster(6, 3);
    var key = "gordon.gustafson";
    var keyHash = hashString(key);
    console.log(keyHash);
    console.log(cluster.getNodesForKeyHash(keyHash));
});

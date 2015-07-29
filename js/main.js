$(document).ready(function () {
    var cluster = new Cluster(6, 3);
    cluster.insert("my_key", "my_value", ConsistencyLevel.ALL);
    console.log( cluster.select("my_key", ConsistencyLevel.ONE) );

});

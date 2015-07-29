// Adapted from http://stackoverflow.com/questions/7616461/

// Having a max-hash of one million makes the initial_tokens
// easier to understand.
MAX_HASH = 1000000

var hashString = function(string) {
    var hash = 0, i, chr, len;
    if (string.length == 0) return hash;
    for (i = 0, len = string.length; i < len; i++) {
        chr   = string.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    // Modulus in Javascript can return negative numbers, so the result of
    // hash % (MAX_HASH / 2) is in the range (-(MAX_HASH / 2), (MAX_HASH / 2)),
    // exclusive. This expression maps both 0 and MAX_HASH / 2 to 0, which is
    // less than optimal. Is there an easy way to fix this?
    return hash % (MAX_HASH / 2) + (MAX_HASH / 2);
};

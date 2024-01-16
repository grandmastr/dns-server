/**
 * Take an IP and outputs a buffer
 * @param ip {string} - IP address
 * @returns {Buffer}
 * */
function ipToBuffer(ip) {
    return Buffer.from(ip.split('.').map(segment => parseInt(segment, 10)));
}

module.exports = ipToBuffer;

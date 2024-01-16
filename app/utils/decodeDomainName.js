/**
 * Basically this does the reverse of what is being done above, it takes a buffer, and extracts the domain name
 * @param buffer {Buffer}
 * @param start {number}
 * @returns {string}
 * */
function decodeDomainName(buffer, start = 0) {
    let domain = '';
    let offset = start;

    while (buffer[offset] !== 0) {
        const length = buffer[offset++];
        const labels = buffer.slice(offset, offset + length).toString();

        if (offset < 32) {
            domain += `${labels}.`;
            offset += length;
        }
    }

    return domain;
}

module.exports = decodeDomainName;

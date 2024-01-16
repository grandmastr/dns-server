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

        domain += `${labels}.`;
        offset += length - 1;
    }

    console.log('blaqi where you go');
    console.log(domain);
    console.log('nyem ego');

    return domain;
}

module.exports = decodeDomainName;

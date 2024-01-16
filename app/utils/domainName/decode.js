const {recordTypes, classFields} = require("../../constants");

/**
 * Basically this does the reverse of what is being done above, it takes a buffer, and extracts the domain name
 * @param buffer {Buffer}
 * @param start {number}
 * @returns {string}
 * */
function decode(buffer, start = 0) {
    let domain = [];
    let offset = start;

    while (buffer[offset] !== 0) {
        const length = buffer[offset++];
        const labels = buffer.slice(offset, offset + length).toString();

        domain.push(labels);
        offset += length;
    }

    return domain.join('.');
}





module.exports = {
    decodeDomainName: decode,
};

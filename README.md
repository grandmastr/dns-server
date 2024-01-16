# Node.js DNS

## Introduction

This is a simple DNS written in Node.js. It is intended to be used as a local DNS server for your network. It is
not a full DNS server, but it is capable of resolving a few basic DNS queries (A, AAAA, CNAME, PTR, TXT, and MX). It is
also capable of forwarding queries to another DNS server (such as your ISP's DNS server). It is not intended to be used
as a public DNS server.

### Installation

To install the DNS server, you must first install Node.js. You can download Node.js
from [nodejs.org](https://nodejs.org/).
Once Node.js is installed, clone the repo.

### Functionality overview

The DNS server is capable of resolving a few basic DNS queries (A, AAAA, CNAME, PTR, TXT, and MX). It is also capable of
forwarding queries to another DNS server (such as your ISP's DNS server). It is not intended to be used as a public DNS
This server currently handles DNS headers and questions, with a focus on:

- Header Parsing:
    - Extracts the ID, QR, Opcode, AA, TC, RD, RA, Z, RCODE, QDCOUNT, ANCOUNT, NSCOUNT, and ARCOUNT fields from the
      header.
    - Constructs DNS response headers and question sections
- Question Parsing:
    - Extracts the QNAME, QTYPE, and QCLASS fields from the question.
    - Constructs DNS response resource records
- Resource Record Parsing:
    - Extracts the NAME, TYPE, CLASS, TTL, RDLENGTH, and RDATA fields from the resource record.
    - Constructs DNS response resource records
- DNS Response:
    - Constructs DNS response headers and question sections
    - Constructs DNS response resource records

### Limitations

- Compressed Packet Handling:
    - The DNS server does not currently handle compressed packets.
- Answering capabilities:
    - It is not a full DNS server, but it is capable of resolving a few basic DNS queries (A, AAAA, CNAME, PTR, TXT, and
      MX).
- Response:
    - it only handles the answer section of the response, and does not handle the authority or additional sections.

### Testing
To test the DNS server, you can use the `dig` or `nslookup` command

### Additional Information
Refer to [this](https://www.rfc-editor.org/rfc/rfc1035#section-4.1.4) document detailing the specifications and implementation of Domain names and DNS:

### Future enhancements
  - Compressed Packet Handling:
  - Expand answer handling capabilities to support more record types and custom response.
  - Add support for authority and additional records sections.

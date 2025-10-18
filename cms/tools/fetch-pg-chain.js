const net = require("net");
const tls = require("tls");
const fs = require("fs");

const host = process.argv[2] || "aws-1-eu-north-1.pooler.supabase.com";
const port = parseInt(process.argv[3] || "5432", 10);

function toPem(raw) {
  const b64 = raw.toString("base64");
  return (
    "-----BEGIN CERTIFICATE-----\n" +
    b64.match(/.{1,64}/g).join("\n") +
    "\n-----END CERTIFICATE-----\n"
  );
}

console.log(`Connecting to ${host}:${port} and requesting SSL (chain)`);

const sock = net.connect(port, host, () => {
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(8, 0);
  buf.writeUInt32BE(80877103, 4);
  sock.write(buf);
});

sock.setTimeout(5000);

sock.once("data", (chunk) => {
  const ch = chunk.toString("utf8", 0, 1);
  if (ch === "S") {
    const tlsSocket = tls.connect(
      { socket: sock, servername: host, rejectUnauthorized: false },
      () => {
        try {
          const leaf = tlsSocket.getPeerCertificate(true);
          if (!leaf || !leaf.raw) {
            console.error("No certificate retrieved");
            process.exit(2);
          }

          const certs = [];
          // Walk the chain via issuerCertificate
          let cur = leaf;
          const seen = new Set();
          while (cur && cur.raw) {
            const hex = cur.raw.toString("hex");
            if (seen.has(hex)) break;
            seen.add(hex);
            certs.push(cur);
            if (!cur.issuerCertificate || cur.issuerCertificate === cur) break;
            cur = cur.issuerCertificate;
          }

          // Write each cert separately and combined chain
          const files = [];
          for (let i = 0; i < certs.length; i++) {
            const pem = toPem(certs[i].raw);
            const fname = `pooler-cert-${String(i).padStart(3, "3")}.pem`;
            fs.writeFileSync(fname, pem);
            files.push(fname);
          }
          // Combined
          const combined = certs.map((c) => toPem(c.raw)).join("\n");
          fs.writeFileSync("pooler-chain.pem", combined);

          console.log("Wrote cert files:", files.join(", "));
          console.log("Wrote combined chain: pooler-chain.pem");

          // Print subjects/issuers and whether self-signed
          console.log("\nCertificate chain (leaf first):");
          certs.forEach((c, idx) => {
            const subject =
              c.subject && c.subject.CN
                ? c.subject.CN
                : JSON.stringify(c.subject || {});
            const issuer =
              c.issuer && c.issuer.CN
                ? c.issuer.CN
                : JSON.stringify(c.issuer || {});
            const self =
              c.issuer &&
              c.subject &&
              JSON.stringify(c.issuer) === JSON.stringify(c.subject);
            console.log(
              `#${idx}: subject=${subject} issuer=${issuer} self-signed=${self}`
            );
          });

          // Hint: the last file is most likely the root (if self-signed). Import that into Trusted Root.
          console.log(
            "\nHint: to trust, import the last file (highest index) into Trusted Root Certification Authorities (Root)"
          );
          tlsSocket.end();
        } catch (e) {
          console.error(
            "Error extracting chain:",
            e && e.message ? e.message : e
          );
          process.exit(3);
        }
      }
    );
    tlsSocket.on("error", (e) => {
      console.error("TLS socket error:", e && e.message ? e.message : e);
      process.exit(4);
    });
  } else if (ch === "N") {
    console.error("Server refused SSL (sent N)");
    process.exit(5);
  } else {
    console.error("Unexpected response from server:", chunk.toString("hex"));
    process.exit(6);
  }
});

sock.on("timeout", () => {
  console.error("Connection timed out");
  sock.destroy();
  process.exit(7);
});

sock.on("error", (e) => {
  console.error("Socket error:", e && e.message ? e.message : e);
  process.exit(8);
});

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

console.log(`Connecting to ${host}:${port} and requesting SSL`);

const sock = net.connect(port, host, () => {
  // Send SSLRequest: Int32 len(8) + Int32 (80877103)
  const buf = Buffer.alloc(8);
  buf.writeUInt32BE(8, 0);
  buf.writeUInt32BE(80877103, 4);
  sock.write(buf);
});

sock.setTimeout(5000);

sock.once("data", (chunk) => {
  const ch = chunk.toString("utf8", 0, 1);
  if (ch === "S") {
    // server is willing to do TLS - wrap socket
    try {
      const tlsSocket = tls.connect(
        { socket: sock, servername: host, rejectUnauthorized: false },
        () => {
          const cert = tlsSocket.getPeerCertificate(true);
          if (!cert || !cert.raw) {
            console.error("No certificate found from TLS socket");
            process.exit(2);
          }
          const pem = toPem(cert.raw);
          fs.writeFileSync("pooler-cert.pem", pem);
          console.log("Wrote pooler-cert.pem");
          tlsSocket.end();
        }
      );
      tlsSocket.on("error", (e) => {
        console.error("TLS socket error:", e && e.message ? e.message : e);
        process.exit(3);
      });
    } catch (e) {
      console.error("Error upgrading to TLS:", e && e.message ? e.message : e);
      process.exit(4);
    }
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

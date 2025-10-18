const tls = require("tls");
const fs = require("fs");

const host = process.argv[2] || "aws-1-eu-north-1.pooler.supabase.com";
const port = parseInt(process.argv[3] || "5432", 10);

console.log(`Connecting to ${host}:${port} to fetch certificate...`);

const s = tls.connect(port, host, { rejectUnauthorized: false }, () => {
  try {
    const peer = s.getPeerCertificate(true);
    if (!peer || !peer.raw) {
      console.error("No certificate retrieved");
      process.exit(2);
    }

    const pem = peer.raw
      .toString("base64")
      .match(/.{1,64}/g)
      .join("\n");
    const out = `-----BEGIN CERTIFICATE-----\n${pem}\n-----END CERTIFICATE-----\n`;
    const outPath = "pooler-cert.pem";
    fs.writeFileSync(outPath, out);
    console.log(`Wrote ${outPath}`);
    s.end();
  } catch (e) {
    console.error(
      "Error extracting certificate:",
      e && e.message ? e.message : e
    );
    process.exit(3);
  }
});

s.on("error", (e) => {
  console.error("TLS connect error:", e && e.message ? e.message : e);
  process.exit(4);
});

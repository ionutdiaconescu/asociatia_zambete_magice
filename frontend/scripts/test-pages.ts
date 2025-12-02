import { fetchPage } from "../src/services/pages";

type WindowLike = {
  location: {
    port: string;
    hostname: string;
    origin: string;
  };
};

const mockWindow: WindowLike = {
  location: {
    port: "5174",
    hostname: "127.0.0.1",
    origin: "http://127.0.0.1:5174",
  },
};

// Provide the globals the fetch module expects at runtime.
(globalThis as unknown as { window: WindowLike }).window = mockWindow;

async function main() {
  const about = await fetchPage("about");
  const contact = await fetchPage("contact");
  console.log("About title:", about.title);
  console.log("About body snippet:", about.body.slice(0, 80));
  console.log("Contact title:", contact.title);
  console.log("Contact body snippet:", contact.body.slice(0, 80));
  console.log("Contact info:", {
    address: contact.address,
    phone: contact.phone,
    email: contact.email,
  });
}

main().catch((err) => {
  console.error("Page fetch failed", err);
  process.exit(1);
});

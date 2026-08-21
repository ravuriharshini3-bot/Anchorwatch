import tls from "node:tls";

// Connects to the domain on port 443 and reads the live certificate's
// expiry date. Resolves to null (not an error) if the domain doesn't
// serve HTTPS at all - that's a valid state, just not one we can watch.
export function getSslExpiry(domain) {
  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: domain,
        port: 443,
        servername: domain,
        timeout: 8000,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (cert && cert.valid_to) {
          resolve(new Date(cert.valid_to));
        } else {
          resolve(null);
        }
      }
    );

    socket.on("error", () => resolve(null));
    socket.on("timeout", () => {
      socket.destroy();
      resolve(null);
    });
  });
}

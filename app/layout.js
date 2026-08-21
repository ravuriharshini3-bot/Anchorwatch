import "./globals.css";

export const metadata = {
  title: "AnchorWatch — never lose a domain to a forgotten renewal",
  description:
    "AnchorWatch watches every domain, SSL certificate, and DNS record you own, and alerts you before something breaks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

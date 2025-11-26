import "./globals.css";
import { ReactQueryProvider } from "./react-query-provider";
import { AuthBootstrap } from "../components/auth-bootstrap";
import { RealtimeListener } from "../components/realtime-listener";
import { RealtimeToasts } from "../components/realtime-toasts";

export const metadata = {
  title: "LMS Dashboard",
  description: "Lead Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <AuthBootstrap />
          <RealtimeListener />
          <RealtimeToasts />
          {children}
        </ReactQueryProvider>
      </body>
    </html>
  );
}

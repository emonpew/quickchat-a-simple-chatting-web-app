import ThemeController from "../components/ThemeController";
import "./global.css";
import AuthProvider from "../contexts/AuthProvider";
import Navigation from "../components/Navigation";
import { WebSocketProvider } from "../contexts/WebSocketContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-theme="dark" lang="en">
      <body>
        <ThemeController />
        <AuthProvider>
          <Navigation />
          <WebSocketProvider>{children}</WebSocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

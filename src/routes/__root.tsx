import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { QueryProvider } from "@/components/query-provider";
import { Shell } from "@/components/shell";
import { Toaster } from "sonner";
import appCss from "../styles.css?url";

const APP_NAME = "Manna";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Manna is a place to give things away for free — goods, food, help, and extra time. Enough for today.",
      },
      { name: "theme-color", content: "#F3EEE4" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Source+Sans+3:ital,wght@0,400;0,500;0,600;1,400&display=swap",
      },
    ],
  }),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-paper text-ink">
        <PreviewHostBridge />
        <QueryProvider>
          <AuthProvider>
            <Shell>
              <Outlet />
            </Shell>
            <Toaster
              theme="light"
              position="bottom-center"
              toastOptions={{
                className: "font-sans bg-surface text-ink border-border",
              }}
            />
          </AuthProvider>
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  );
}

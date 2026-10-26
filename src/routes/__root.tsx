import { HeadContent, Outlet, Scripts, createRootRoute } from "@tanstack/react-router";
import "../styles.css";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Kebun Robin" },
      {
        name: "description",
        content: "Desa farming pixel. Tanam, panen, olah, dan jual hasil kebun.",
      },
    ],
    links: [
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center text-[#f6ecd8]">
      <p className="screen-title text-4xl">Halaman tidak ada</p>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center px-6 text-center text-[#f6ecd8]">
      <div>
        <p className="screen-title text-4xl">Desa lagi macet</p>
        <p className="mt-2 text-sm">{error instanceof Error ? error.message : "Coba muat ulang."}</p>
      </div>
    </main>
  ),
});

function RootComponent() {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}

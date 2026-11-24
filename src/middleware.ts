import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isComingSoonHost } from "@/lib/coming-soon";

const PROTECTED = ["/account", "/checkout", "/admin"];

export async function middleware(request: NextRequest) {
  // Before launch, the public domain shows only the coming soon page, whatever path is asked for.
  if (isComingSoonHost(request.headers.get("host"))) {
    const path = request.nextUrl.pathname;
    if (path === "/robots.txt") return new NextResponse("User-agent: *\nAllow: /\n", { headers: { "content-type": "text/plain" } });
    if (path.startsWith("/api/") || path.startsWith("/auth/") || path === "/sitemap.xml") return new NextResponse(null, { status: 404 });
    if (path === "/coming-soon") return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/coming-soon";
    url.search = "";
    return NextResponse.rewrite(url);
  }

  let response = NextResponse.next({ request });

  // Allow the storefront to render before Supabase is configured.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  if (path === "/admin/login") return response;
  if (!user && PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const url = request.nextUrl.clone();
    url.search = "";
    url.pathname = path.startsWith("/admin") ? "/admin/login" : "/login";
    url.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)"],
};

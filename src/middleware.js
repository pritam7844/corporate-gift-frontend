
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // 1. Clean the hostname (removes :3000 during local dev)
  const currentHost = hostname.split(':')[0];

  // 2. Define Main Domains
  // We use PORTAL_DOMAIN because it's clean (no https://)
  const portalDomain = process.env.NEXT_PUBLIC_PORTAL_DOMAIN || 'wellwigen.com';

  const mainDomains = [
    'localhost',
    portalDomain,
    `www.${portalDomain}`,
    'corporate-gift-frontend.vercel.app'
  ];

  // Check if we are on the landing page or www
  const isMainDomain = mainDomains.includes(currentHost);

  // 3. Extract Subdomain
  let subdomain = '';
  if (!isMainDomain) {
    const parts = currentHost.split('.');
    // Logic for apple.wellwigen.com (3 parts) or apple.localhost (2 parts)
    if (parts.length >= (currentHost.includes('localhost') ? 2 : 3)) {
      subdomain = parts[0];
    }
  }

  // 4. Bypass logic: If no subdomain, or if it's 'www' or 'admin'
  if (isMainDomain || !subdomain || subdomain === 'www') {
    return NextResponse.next();
  }

  if (subdomain === 'admin') {
    return NextResponse.next();
  }

  // 5. Multi-tenant Tenant Fetching
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://corporate-gift-backend.vercel.app';

    // Call your backend with the subdomain (e.g., apple)
    const res = await fetch(`${backendUrl}/companies/portal/${subdomain}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      // If company doesn't exist in your DB, show your custom 404
      return new NextResponse(renderErrorHtml(hostname), {
        status: 404,
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 6. Rewrite the URL
    // Browser stays on apple.wellwigen.com/login
    // Server fetches from /app/[subdomain]/login/page.tsx
    const pathName = url.pathname;
    const rewritePath = `/${subdomain}${pathName}`;

    return NextResponse.rewrite(new URL(rewritePath, request.url));

  } catch (error) {
    console.error("Middleware fetch error:", error);
    return new NextResponse("Service Unavailable", { status: 503 });
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

// Helper for Error HTML
function renderErrorHtml(hostname) {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${hostname}</title>
  <style>
    body {
        font-family: 'Segoe UI', Tahoma, sans-serif, 'Roboto';
        color: #202124;
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 0;
        background: #fff;
    }
    .container {
        max-width: 600px;
        width: 100%;
        padding: 10vh 24px 24px;
        box-sizing: border-box;
        text-align: left;
    }
    .icon {
        width: 44px;
        height: 48px;
        margin-bottom: 24px;
        margin-top: 100px;
        color: #5f6368;
    }
    h1 {
        font-size: 24px;
        font-weight: 400;
        margin: 0 0 16px 0;
        color: #202124;
    }
    p {
        font-size: 15px;
        color: #5f6368;
        margin: 0 0 16px 0;
        line-height: 1.5;
    }
    .error-code {
        font-size: 12px;
        color: #5f6368;
        letter-spacing: 0.5px;
        margin-bottom: 40px;
        display: block;
    }
    .btn-container {
        display: flex;
    }
    .btn {
        background-color: #1a73e8;
        color: #fff;
        border: none;
        padding: 8px 24px;
        border-radius: 16px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
        margin-left: auto;
    }
    .btn:hover {
        background-color: #1557b0;
    }
  </style>
</head>
<body>
  <div class="container">
    <svg class="icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
      <path d="M28 4H10a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V20L28 4z"></path>
      <polyline points="28 4 28 20 44 20"></polyline>
      <line x1="16" y1="28" x2="20" y2="28"></line>
      <line x1="28" y1="28" x2="32" y2="28"></line>
      <path d="M18 36c2-4 10-4 12 0"></path>
    </svg>
    <h1>This site can't be reached</h1>
    <p>Check if there is a typo in ${hostname}.</p>
    <span class="error-code">DNS_PROBE_FINISHED_NXDOMAIN</span>
    <div class="btn-container">
      <button class="btn" onclick="window.location.reload()">Reload</button>
    </div>
  </div>
</body>
</html>`;
}
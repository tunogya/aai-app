import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";
export default withMiddlewareAuthRequired();

export const config = {
  matcher: [
    // start a chat conversation api
    "/api/chat",
    // CRUD conversation api
    "/api/conversation/:path*",
    // generate note api
    "/api/generate",
    // CRUD note api
    "/api/note/:path*",
    // CRUD persona api
    "/api/persona/:path*",
    // query dashboard api
    "/api/dashboard/:path*",
    // upload files
    "/api/upload",
    // start a payment;
    // note: /api/checkout/callback is stripe callback url
    "/api/checkout",
    // query usage
    "/api/usage/:path*",
    // chat page
    "/chat/:path*",
    // dashboard page
    "/dashboard/:path*",
    // note page
    "/note/:path*",
    // usage page
    "/usage/:path*",
  ],
};

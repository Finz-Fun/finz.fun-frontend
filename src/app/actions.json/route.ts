import { ACTIONS_CORS_HEADERS, ActionsJson } from "@solana/actions";

export const GET = async () => {
  const payload: ActionsJson = {
    rules: [
      {
        pathPattern: "/blinks/*",
        apiPath: `${process.env.NEXT_PUBLIC_API_URL}/blinks/*`,
      },
      {
        pathPattern: "/api/blinks/**",
        apiPath: `${process.env.NEXT_PUBLIC_API_URL}/api/blinks/**`,
      }
    ],
  };

  return Response.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
};

export const OPTIONS = GET;
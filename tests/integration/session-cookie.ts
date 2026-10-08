import { createHmac } from "node:crypto";

import type pg from "pg";

/**
 * Headers of a request made by the browser of a signed-in customer.
 *
 * The session cookie is rebuilt from the session stored in the database, signed the way the
 * authentication library signs it: the tests then go through the real session check instead
 * of replacing it.
 */
export async function sessionHeaders(client: pg.Client, email: string): Promise<Headers> {
  const { rows } = await client.query(
    'select s.token from session s join "user" u on u.id = s.user_id where u.email = $1 order by s.created_at desc limit 1',
    [email],
  );
  if (rows.length === 0) throw new Error(`no session for ${email}`);

  const token = rows[0].token as string;
  const signature = createHmac("sha256", process.env.BETTER_AUTH_SECRET ?? "")
    .update(token)
    .digest("base64");
  const value = encodeURIComponent(`${token}.${signature}`);
  return new Headers({ cookie: `__Secure-zolive.session_token=${value}` });
}

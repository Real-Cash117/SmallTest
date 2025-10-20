import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "~/lib/database/sqlite";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "USER" | "ADMIN" | "SUPER_ADMIN";
    } & DefaultSession["user"];
  }

  interface User {
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      let existingUser = await db.findUserByEmail(user.email);

      if (!existingUser) {
        existingUser = await db.createUser({
          email: user.email,
          name: user.name || undefined,
          image: user.image || undefined,
          role: "USER",
        });
      }

      if (account) {
        const existingAccount = await db.findAccount(
          account.provider,
          account.providerAccountId,
        );
        if (!existingAccount) {
          await db.createAccount({
            userId: existingUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            refresh_token: account.refresh_token || undefined,
            access_token: account.access_token || undefined,
            expires_at: account.expires_at || undefined,
            token_type: account.token_type || undefined,
            scope: account.scope || undefined,
            id_token: account.id_token || undefined,
            session_state: account.session_state ?? undefined,
          });
        }
      }

      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const user = await db.findUserByEmail(session.user.email);
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role;
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      const token = new URL(url, baseUrl);
      if (token.pathname === '/admin' && token.searchParams.get('email')) {
        const user = await db.findUserByEmail(token.searchParams.get('email')!);
        return user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')
          ? `${baseUrl}/admin`
          : baseUrl;
      }
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token }) {
      return token;
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

export const getServerAuthSession = (ctx?: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx?.req, ctx?.res, authOptions);
};
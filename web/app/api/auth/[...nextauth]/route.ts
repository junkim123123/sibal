import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import EmailProvider from 'next-auth/providers/email';
import CredentialsProvider from 'next-auth/providers/credentials';

// JWT sessions only (Supabase Auth is used for authentication, not NextAuth database adapter)
const adapter = undefined;

const providers = [];

// Add CredentialsProvider for admin mode (test only)
providers.push(
  CredentialsProvider({
    name: 'Admin',
    credentials: {
      password: { label: 'Password', type: 'password' },
    },
    async authorize(credentials) {
      // Test password: 1228
      if (credentials?.password === '1228') {
        return {
          id: 'admin',
          email: 'admin@nexsupply.com',
          name: 'Admin',
          role: 'admin',
        };
      }
      return null;
    },
  })
);

// Add GoogleProvider if credentials are configured
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Add EmailProvider if EMAIL_SERVER is configured
if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    })
  );
}

const handler = NextAuth({
  adapter: adapter,
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'temp-secret-for-dev-only-change-in-production',
  session: {
    strategy: adapter ? 'database' : 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role || 'user';
        token.isAdmin = (user as any).role === 'admin';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role || 'user';
        (session.user as any).isAdmin = token.isAdmin || false;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
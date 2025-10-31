import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnCalculator = nextUrl.pathname === '/';
      
      if (isOnCalculator) {
        return true; // Allow everyone to access calculator page
      }
      
      return isLoggedIn;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
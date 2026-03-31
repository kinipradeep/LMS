import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Google OAuth ────────────────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.PUBLIC_APP_URL}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error('No email from Google'), undefined);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value,
              oauthProvider: 'GOOGLE',
              oauthProviderId: profile.id,
              role: Role.STUDENT,
              // No password — OAuth user
              passwordHash: null,
            },
          });
        } else if (!user.oauthProviderId) {
          // Existing email/password user — link OAuth
          user = await prisma.user.update({
            where: { email },
            data: { oauthProvider: 'GOOGLE', oauthProviderId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

// ─── Microsoft OAuth ─────────────────────────────────────────────────────────
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.AZURE_CLIENT_ID!,
      clientSecret: process.env.AZURE_CLIENT_SECRET!,
      callbackURL: `${process.env.PUBLIC_APP_URL}/api/auth/microsoft/callback`,
      tenant: process.env.AZURE_TENANT_ID || 'common',
      scope: ['user.read'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          profile._json?.mail ||
          profile._json?.userPrincipalName;

        if (!email) return done(new Error('No email from Microsoft'), undefined);

        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              oauthProvider: 'MICROSOFT',
              oauthProviderId: profile.id,
              role: Role.STUDENT,
              passwordHash: null,
            },
          });
        } else if (!user.oauthProviderId) {
          user = await prisma.user.update({
            where: { email },
            data: { oauthProvider: 'MICROSOFT', oauthProviderId: profile.id },
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err as Error, undefined);
      }
    }
  )
);

export default passport;

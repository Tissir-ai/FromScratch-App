import { prisma } from '../db/client.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken } from '../utils/jwt.js';
import type { User } from '../models/User.js';
import type { NormalizedOAuthUser as GoogleOAuthUser } from './googleAuthService.js';
import type { NormalizedOAuthUser as GithubOAuthUser } from './githubAuthService.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';

interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
}

type OAuthUser = GoogleOAuthUser | GithubOAuthUser;

export async function registerUser(input: RegisterInput): Promise<{ user: User; tokens: AuthTokens }> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new AppError('Email is already in use', 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash,
      provider: 'credentials',
      providerId: null,
    } as any,
  });

  const accessToken = signAccessToken(user.id);
  return { user, tokens: { accessToken } };
}

export async function getUserById(userId: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function loginUser(input: LoginInput): Promise<{ user: User; tokens: AuthTokens }> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

   if (user.provider !== 'credentials' || !user.passwordHash) {
     throw new AppError('This account does not use password login', 400);
   }

  const isValid = await comparePassword(input.password, user.passwordHash);
  if (!isValid) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = signAccessToken(user.id);
  return { user, tokens: { accessToken } };
}

export async function getCurrentUser(userId: string): Promise<User> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

// Returns the user along with their most-recent active subscription and its plan (if any)
export async function getCurrentUserWithSubscription(userId: string): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: { include: { plan: true } },
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const subscription = user.subscription ?? null;
  const plan = subscription ? subscription.plan : null;

  return { user, subscription, plan } as any;
}

export async function loginOrRegisterOAuthUser(oauthUser: OAuthUser): Promise<{ user: User; tokens: AuthTokens }> {
  const { provider, providerId, email, firstName, lastName } = oauthUser;

  if (!providerId) {
    throw new AppError('OAuth user is missing providerId', 400);
  }

  // 1) Try to find by provider + providerId
  let user = await prisma.user.findFirst({
    where: {
      provider,
      providerId,
    },
  });

  // 2) If not found but we have an email, see if an account exists
  if (!user && email) {
    const existingByEmail = await prisma.user.findUnique({ where: { email } });

    if (existingByEmail) {
      // If the existing account is credentials-based, we do not auto-link.
      if (existingByEmail.provider === 'credentials') {
        throw new AppError('An account with this email already exists', 409);
      }

      // Otherwise, attach provider info to that user (if not set)
      user = await prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          provider,
          providerId,
        } as any,
      });
    }
  }

  // 3) Still not found: create a new user
  if (!user) {
    if (!email) {
      throw new AppError('Email is required to create an account', 400);
    }

    const safeFirstName = firstName ?? 'User';
    const safeLastName = lastName ?? '';

    user = await prisma.user.create({
      data: {
        email,
        firstName: safeFirstName,
        lastName: safeLastName,
        passwordHash: null,
        provider,
        providerId,
      } as any,
    });
  }

  const accessToken = signAccessToken(user.id);
  return { user, tokens: { accessToken } };
}

export async function forgotPassword(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists
    return;
  }
  else if(user.provider !== 'credentials') {
    return;
  }

  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // Send email
  const resetUrl = `${process.env.CORS_ORIGIN}/auth/reset-password?token=${token}`;
  await sendPasswordResetEmail({ to: email, resetUrl });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const reset = await prisma.passwordReset.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!reset || reset.used || reset.expiresAt < new Date()) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordReset.update({
      where: { id: reset.id },
      data: { used: true },
    }),
  ]);
}

export async function changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
  if (!newPassword || !newPassword.trim()) {
    throw new AppError('New password is required', 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError('User not found', 404);
  }

  if (user.provider !== 'credentials' || !user.passwordHash) {
    throw new AppError('Password change is not available for this account', 400);
  }

  const isValid = await comparePassword(oldPassword, user.passwordHash);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

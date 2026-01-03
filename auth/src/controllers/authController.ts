import type { Request, Response, NextFunction } from 'express';
import { getCurrentUser,getUserById, getCurrentUserWithSubscription, loginUser, registerUser, loginOrRegisterOAuthUser, forgotPassword, resetPassword, changePassword } from '../services/authService.js';
import type { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { getGoogleAuthUrl, getGoogleUserFromCode } from '../services/googleAuthService.js';
import { getGithubAuthUrl, getGithubUserFromCode } from '../services/githubAuthService.js';
const frontendOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:3000';


function parseState(state?: string | undefined) {
  if (!state) return { ok: '/', err: '/' };
  try {
    const decoded = decodeURIComponent(state);
    const obj = JSON.parse(decoded);
    if (obj && typeof obj === 'object') {
      const ok = typeof obj.ok === 'string' ? obj.ok : '/';
      const err = typeof obj.err === 'string' ? obj.err : (typeof obj.ok === 'string' ? obj.ok : '/');
      return { ok, err };
    }
  } catch (e) {
    // not JSON, fall through to fallback
  }
  // fallback: treat state as a plain path
  const path = state && state.startsWith('/') ? state : '/';
  return { ok: path, err: path };
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, firstName, lastName } = req.body as { email: string; password: string; firstName: string; lastName: string };
    const result = await registerUser({ email, password, firstName, lastName });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const result = await loginUser({ email, password });
    const { accessToken, user } = { accessToken: result.tokens.accessToken, user: result.user };

    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      .status(200)
      .json({ user });
  } catch (err) {
    next(err);
  }
}

export async function currentUser(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { user, subscription, plan } = await getCurrentUserWithSubscription(userId);
    res.status(200).json({ user, subscription, plan });
  } catch (err) {
    next(err);
  }
}

export async function googleLoginRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;
    const url = getGoogleAuthUrl(state);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}

export async function googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined;
    const stateRaw = typeof req.query.state === 'string' ? req.query.state : undefined;
    const { ok: successPath, err: errorPath } = parseState(stateRaw);

    if (!code) {
      const redirectUrl = frontendOrigin + errorPath + '?error=' + encodeURIComponent('Missing code in callback');
      res.redirect(redirectUrl);
      return;
    }

    const oauthUser = await getGoogleUserFromCode(code);
    const { user, tokens } = await loginOrRegisterOAuthUser(oauthUser);

    // After successful OAuth, set cookie and redirect back to frontend (use successPath)
    res
      .cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      .redirect(frontendOrigin + successPath);
  } catch (err) {
    const stateRaw = typeof req.query.state === 'string' ? req.query.state : undefined;
    const { err: errorPath } = parseState(stateRaw);
    const message = err instanceof Error ? err.message : 'OAuth error';
    const sep = errorPath.includes('?') ? '&' : '?';
    res.redirect(frontendOrigin + errorPath + sep + 'error=' + encodeURIComponent(message));
  }
}

export async function githubLoginRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const state = typeof req.query.state === 'string' ? req.query.state : undefined;
    const url = getGithubAuthUrl(state);
    res.redirect(url);
  } catch (err) {
    next(err);
  }
}

export async function githubCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : undefined;
    const stateRaw = typeof req.query.state === 'string' ? req.query.state : undefined;
    const { ok: successPath, err: errorPath } = parseState(stateRaw);

    if (!code) {
      const redirectUrl = frontendOrigin + errorPath + '?error=' + encodeURIComponent('Missing code in callback');
      res.redirect(redirectUrl);
      return;
    }

    const oauthUser = await getGithubUserFromCode(code);
    const { user, tokens } = await loginOrRegisterOAuthUser(oauthUser);

    // After successful OAuth, set cookie and redirect back to frontend (use successPath)
    res
      .cookie('access_token', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      })
      .redirect(frontendOrigin + successPath);
  } catch (err) {
    const stateRaw = typeof req.query.state === 'string' ? req.query.state : undefined;
    const { err: errorPath } = parseState(stateRaw);
    const message = err instanceof Error ? err.message : 'OAuth error';
    const sep = errorPath.includes('?') ? '&' : '?';
    res.redirect(frontendOrigin + errorPath + sep + 'error=' + encodeURIComponent(message));
  }
}

export async function logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Clear the access token cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
}

export async function getUserByIdController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.id;
    console.log('Fetching user with ID:', userId);
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}


export async function forgotPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body as { email: string };
    await forgotPassword(email);
    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Error in forgotPasswordController:', err);
    next(err);
  }
}

export async function resetPasswordController(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };
    await resetPassword(token, newPassword);
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function changePasswordController(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
    await changePassword(userId, oldPassword, newPassword);
    res.status(200).json({ message: 'Password updated successfully.' });
  } catch (err) {
    next(err);
  }
}

export async function searchUsersController(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = req.query.q as string | undefined;
    
    if (!query || query.trim().length < 2) {
      res.status(200).json([]);
      return;
    }

    const { prisma } = await import('../db/client.js');
    
    // Search users by firstName, lastName, or email (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            firstName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
      take: 15,
    });

    // Format response
    const results = users.map((user: { id: any; email: any; firstName: any; lastName: any; }) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    }));

    res.status(200).json(results);
  } catch (err) {
    next(err);
  }
}

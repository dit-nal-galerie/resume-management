import { Request, Response } from 'express';

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false, // in Produktion: true
    sameSite: 'lax',
  });
  res.status(200).json({ message: 'backend.success.logout' });
};

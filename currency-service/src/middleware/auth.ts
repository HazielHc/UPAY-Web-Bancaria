import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthedRequest extends Request {
    profileId?: string;
}

export function authenticate(req: AuthedRequest, res: Response, next: NextFunction) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = header.slice('Bearer '.length);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as jwt.JwtPayload;
        req.profileId = payload.userId as string;
        if (!req.profileId) {
        return res.status(401).json({ error: 'Token has no user identifier' });
        }
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

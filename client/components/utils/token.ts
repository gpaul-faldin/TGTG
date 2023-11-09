import jwt from 'jsonwebtoken';
import { setCookie, destroyCookie, parseCookies } from 'nookies';
import { GetServerSidePropsContext } from 'next';

interface User {
    id: string;
    isAdmin: boolean;
    Subscription: string;
}

export function storeJwt(jwtToken: string, ctx?: GetServerSidePropsContext): void {
    console.log('storeJwt', jwtToken);
    setCookie(ctx, 'jwt', jwtToken, {
        maxAge: 10 * 60, // Max age for the cookie (30 days in this case)
        path: '/', // The cookie path
        secure:  true, // If true, only sends cookie over HTTPS. In production it should be true
        sameSite: 'lax', // Adjust as needed (strict, lax, none)
    });
}

export function logout(ctx?: GetServerSidePropsContext): void {
    destroyCookie(ctx, 'jwt');
}

export function decodeJwt(ctx?: GetServerSidePropsContext): User | null {
    
    const cookies = parseCookies(ctx);
    const token = cookies.jwt;
    if (!token) {
        return null;
    }
    try {
        const decoded = jwt.decode(token) as User;
        return {
            id: decoded.id,
            isAdmin: decoded.isAdmin,
            Subscription: decoded.Subscription,
        };
    } catch (error) {
        console.error('JWT verification error:', error);
        return null;
    }
}

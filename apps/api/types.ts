import {z} from 'zod';
import { url } from 'zod/v4';

export const AuthSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

export const WebsiteSchema = z.object({
    url: z.string().url('Invalid URL format').min(1, 'URL is required'),
    name: z.string().min(1, 'Name is required'),
})
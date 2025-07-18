import { z } from 'zod';

const envSchema = z.object({
  GROQ_API_KEY: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

export type Env = z.infer<typeof envSchema>;

export const { GROQ_API_KEY, NODE_ENV } = envSchema.parse(process.env);

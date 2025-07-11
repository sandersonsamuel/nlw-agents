import z from "zod";

export const env = z
	.object({
		PORT: z.coerce.number().default(3333),
		DATABASE_URL: z.string().url().startsWith("postgresql://"),
		CLIENT_URL: z.string().url(),
	})
	.parse(process.env);

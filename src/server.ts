import fastifyCors from "@fastify/cors";
import { fastify } from "fastify";
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "./env.ts";
import fastifySwagger from "@fastify/swagger";
import { roomsRoutes } from "./http/routes/rooms.ts";
import fastifySwaggerUi from "@fastify/swagger-ui";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.register(fastifyCors, {
	origin: env.CLIENT_URL,
});

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

app.register(fastifySwagger, {
	openapi: {
		info: {
			title: "API projeto nlw",
			description: "Documentação da API do projeto Let me ask do NLW agents",
			version: "1.0.0",
		},
	},
	transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
	routePrefix: "/docs",
});

app.register(roomsRoutes, {
	prefix: "/rooms",
});

app.get("/health", () => {
	return "ok";
});

app.listen({ port: env.PORT });

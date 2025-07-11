import { eq } from "drizzle-orm";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod/v4";
import { db } from "../../db/connection.ts";
import { schema } from "../../db/schemas/index.ts";
import { validate as validateUUID } from "uuid";

export const questionsRoute: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/:roomId",
		{
			schema: {
				summary: "Get questions of a room",
				tags: ["Questions"],
				params: z.object({
					roomId: z.string(),
				}),
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							question: z.string(),
							answer: z.string().nullable(),
							createdAt: z.date(),
						}),
					),
					400: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { roomId } = request.params;

			if (!validateUUID(roomId)) {
				return reply.status(400).send({
					message: "Invalid UUID",
				});
			}

			const questions = await db
				.select({
					id: schema.questions.id,
					question: schema.questions.question,
					answer: schema.questions.answer,
					createdAt: schema.questions.createdAt,
				})
				.from(schema.questions)
				.where(eq(schema.questions.roomId, roomId));

			return reply.status(200).send(questions);
		},
	);

	app.post(
		"/",
		{
			schema: {
				summary: "Get questions of a room",
				tags: ["Questions"],
				body: z.object({
					roomId: z.string(),
					question: z.string(),
				}),
				response: {
					201: z.object({
						id: z.string(),
						question: z.string(),
					}),
					400: z.object({
						message: z.string(),
					}),
					404: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { question, roomId } = request.body;

			if (!validateUUID(roomId)) {
				return reply.status(400).send({
					message: "Invalid UUID",
				});
			}

			const room = await db
				.select({ id: schema.rooms.id })
				.from(schema.rooms)
				.where(eq(schema.rooms.id, roomId));

			if (!room.length) {
				return reply.status(404).send({
					message: "Room not found",
				});
			}

			const createdQuestion = await db
				.insert(schema.questions)
				.values({
					roomId,
					question,
				})
				.returning({
					id: schema.questions.id,
					question: schema.questions.question,
				});

			reply.status(201).send(createdQuestion[0]);
		},
	);
};

import { schema } from "../../db/schemas/index.ts";
import { validate as validateUUID, version as uuidVersion } from "uuid";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { db } from "../../db/connection.ts";
import { count, eq } from "drizzle-orm";
import { z } from "zod/v4";

export const roomsRoutes: FastifyPluginAsyncZod = async (app) => {
	app.get(
		"/",
		{
			schema: {
				summary: "Get all rooms",
				tags: ["Rooms"],
				response: {
					200: z.array(
						z.object({
							id: z.string(),
							name: z.string(),
							questionsCount: z.number(),
							createdAt: z.date(),
						}),
					),
				},
			},
		},
		() => {
			return db
				.select({
					id: schema.rooms.id,
					name: schema.rooms.name,
					questionsCount: count(schema.questions.id),
					createdAt: schema.rooms.createdAt,
				})
				.from(schema.rooms)
				.leftJoin(
					schema.questions,
					eq(schema.questions.roomId, schema.rooms.id),
				)
				.groupBy(schema.rooms.id, schema.rooms.name)
				.orderBy(schema.rooms.createdAt);
		},
	);

	app.get(
		"/:id",
		{
			schema: {
				summary: "Get room by id",
				tags: ["Rooms"],
				params: z.object({
					id: z.string(),
				}),
				response: {
					200: z.object({
						id: z.string(),
						name: z.string(),
						description: z.string().nullable(),
					}),
					404: z.object({
						message: z.string(),
					}),
					400: z.object({
						message: z.string(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { id } = request.params;
			const isValid = validateUUID(id) && uuidVersion(id) === 4;

			if (!isValid) {
				console.log("Invalid UUID:", id.trim());
				return reply.status(400).send({
					message: "Invalid UUID",
				});
			}

			const room = await db
				.select({
					id: schema.rooms.id,
					name: schema.rooms.name,
					description: schema.rooms.description,
				})
				.from(schema.rooms)
				.where(eq(schema.rooms.id, id));

			if (!room.length) {
				return reply.status(404).send({
					message: "Room not found",
				});
			}

			return reply.status(200).send(room[0]);
		},
	);

	app.post(
		"/",
		{
			schema: {
				summary: "Create a new room",
				tags: ["Rooms"],
				body: z.object({
					name: z.string().min(1),
					description: z.string().optional(),
				}),
				response: {
					201: z.object({
						id: z.string(),
						name: z.string(),
						description: z.string().nullable(),
						createdAt: z.date(),
					}),
				},
			},
		},
		async (request, reply) => {
			const { name, description } = request.body;
			const room = await db
				.insert(schema.rooms)
				.values({
					name,
					description,
				})
				.returning();

			return reply.status(201).send(room[0]);
		},
	);
};

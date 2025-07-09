import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod'
import { db } from '../../db/connection.ts'
import { schema } from '../../db/schemas/index.ts'

export const getRoomsRoute: FastifyPluginCallbackZod = (app) => {
  app.get('/rooms', () => {
    return db
      .select({
        id: schema.rooms.id,
        name: schema.rooms.name,
      })
      .from(schema.rooms)
      .orderBy(schema.rooms.name)
  })
}

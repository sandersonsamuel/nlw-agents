import { reset, seed } from "drizzle-seed";
import { client, db } from "./connection.ts";
import { schema } from "./schemas/index.ts";

await reset(db, schema);

await seed(db, schema).refine((f) => {
	return {
		rooms: {
			count: 10,
			columns: {
				name: f.companyName(),
				description: f.loremIpsum(),
			},
		},
		questions: {
			count: 10,
		},
	};
});

await client.end();

console.log("Seeded!");

import { FastifyPluginAsync } from 'fastify'
import { user } from '../schema';
import { eq } from 'drizzle-orm';

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get('/', async function (request, reply) {
    const createRes = await fastify.drizzle.insert(user).values({ username: 'test', password: 'testpassword', created_at: new Date(), updated_at: new Date() });
    console.log("🚀 ~ createRes:", createRes)
    const data = await fastify.drizzle.select().from(user);
    console.log(data, 'data')
    const deleteRes = await fastify.drizzle.delete(user).where(eq(user.username, 'test')).returning();
    console.log("🚀 ~ deleteRes:", deleteRes)
    reply.code(201).send({ hello: 'world' })
  })
}

export default root;

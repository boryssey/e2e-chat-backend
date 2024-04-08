import { join } from 'path';
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload';
import { FastifyPluginAsync, FastifyReply, FastifyRequest, FastifyServerOptions, HookHandlerDoneFunction } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyJWT, { JWT } from '@fastify/jwt';
import fastifyAuth from '@fastify/auth';
import { DecorationMethod } from 'fastify/types/instance';
export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application

  fastify.register(fastifyCookie)
  fastify.register(fastifyJWT, {
    secret: 'testsecret'
  })
  fastify.addHook('preHandler', (request, reply, done) => {
    request.jwt = fastify.jwt
    return done()
  })


  fastify.decorate('verifyJwtCookie', async function (request: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) {
    const { access_token } = request.cookies;
    if (!access_token) {
      reply.code(401).send({ message: 'Unauthorized' });
      return done(new Error('Unauthorized'));
    }
    try {
      request.jwt.verify(access_token);
      done();
    } catch (error) {
      reply.code(401).send({ message: 'Unauthorized' });
      done(new Error('Unauthorized'));
    }
  })

  await fastify.register(fastifyAuth, { defaultRelation: 'and' })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })



};

export default app;
export { app, options }


declare module 'fastify' {
  interface FastifyRequest {
    jwt: JWT
  }
  export interface FastifyInstance {
    verifyJwtCookie: (
      request: FastifyRequest,
      reply: FastifyReply,
      done: HookHandlerDoneFunction
    ) => void
  }
}
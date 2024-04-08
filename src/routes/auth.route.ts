import fastify, { FastifyPluginAsync, RouteShorthandOptionsWithHandler } from "fastify";
import { RegisterRequestDTO } from "../dtos/auth.dto";

const registreOpts: RouteShorthandOptionsWithHandler = {
    schema: {
        body: RegisterRequestDTO
    },
    handler: async function (request, reply) {
        return 'test';
    }
}

const loginOpts: RouteShorthandOptionsWithHandler = {
    schema: {
        body: RegisterRequestDTO
    },
    handler: async function (request, reply) {
        const access_token = request.jwt.sign({ username: 'test' });
        reply.setCookie('access_token', access_token, {
            //localhost
            // domain: 'localhost',
            path: '/',
            secure: false,
            // httpOnly: true,
            sameSite: 'lax',

        })
        return 'test';
    }
}

const logoutOpts: RouteShorthandOptionsWithHandler = {

    handler: async function (request, reply) {
        console.log(request.cookies.access_token, 'cookies')
        return 'test';
    }
}


const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

    fastify.post('/register', {
        handler: async function (request, reply) {
            return 'test';
        }
    })
    fastify.post('/login', loginOpts)
    fastify.get('/logout', {
        preHandler: fastify.auth([fastify.verifyJwtCookie]),
        ...logoutOpts
    })
}


export default auth;
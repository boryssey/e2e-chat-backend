import {type Static, Type} from '@sinclair/typebox';

export const userAuthRequestDTO = Type.Object({
	username: Type.String({
		minLength: 3,
		maxLength: 30,
	}),
	password: Type.String({
		minLength: 8,
		maxLength: 30,
		format: 'regex',
		pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})',
	}),
});

export const loginRequestDTO = Type.Object({
	username: Type.String(),
	password: Type.String(),
});

export const loginResponseDTO = Type.Object({
	id: Type.Number(),
	username: Type.String(),
	created_at: Type.String(),
});

export type userAuthRequestType = Static<typeof userAuthRequestDTO>;

export type loginRequestType = Static<typeof loginRequestDTO>;

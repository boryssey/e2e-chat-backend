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

export type userAuthRequestType = Static<typeof userAuthRequestDTO>;

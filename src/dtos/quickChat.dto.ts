import {type Static, Type} from '@sinclair/typebox';

export const postQuickChatResponseDTO = Type.Object({
	chat_id: Type.String(),
});

export type PostQuickChatResponse = Static<typeof postQuickChatResponseDTO>;

export const getQuickChatInfoRequestDTO = Type.String();

export const getQuickChatInfoResponseDTO = Type.Object({
	id: Type.String(),
	user1: Type.Optional(Type.Union([Type.Null(), Type.String()])),
	user2: Type.Optional(Type.Union([Type.Null(), Type.String()])),
});

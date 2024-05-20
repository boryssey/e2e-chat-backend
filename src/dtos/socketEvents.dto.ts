import {type Static, Type} from '@sinclair/typebox';
import ajv from '../utils/ajv';

export const sendMessageRequestDTO = Type.Object({
	to: Type.String(),
	message: Type.Any(),
	timestamp: Type.Number(),
});

export const validateSendMessageRequest = ajv.compile<Static<typeof sendMessageRequestDTO>>(sendMessageRequestDTO);

export const messageReceivedEventDTO = Type.Object({
	lastReceivedMessageId: Type.Number(),
});

export const validateMessageReceivedRequest = ajv.compile<Static<typeof messageReceivedEventDTO>>(messageReceivedEventDTO);

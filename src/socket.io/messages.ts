import {validateMessageReceivedRequest, validateSendMessageRequest} from '../dtos/socketEvents.dto';
import {deleteReceivedMessages, storeMessage} from '../services/message.service';
import {findUserByUsername} from '../services/user.service';
import {eventHandler, type EventHandlerRegisterer} from '.'; // eslint-disable-line import/no-cycle

const registerMessageHandlers: EventHandlerRegisterer = (io, socket, drizzle) => {
	const handleSendMessage = eventHandler<'message:send'>(async data => {
		const isMessageValid = validateSendMessageRequest(data);
		if (!isMessageValid) {
			// callback({error: 'Invalid message'});
			throw new Error('Invalid message');
		}

		const [recipient] = await findUserByUsername(drizzle, data.to);
		if (!recipient) {
			throw new Error('Recipient not found');
		}

		const [savedMessage] = await storeMessage(drizzle, {
			from_user_id: socket.data.user.id,
			to_user_id: recipient.id,
			message: data.message,
			timestamp: new Date(data.timestamp),
		});

		const sockets = await io.fetchSockets();
		const recipientSocketId = sockets.find(socket => socket.data.user.username === data.to);
		if (recipientSocketId) {
			recipientSocketId.emit('message:receive', {from_user_username: socket.data.user.username, ...savedMessage});
		}

		return {
			success: true,
		};
	});
	const handleAckMessage = eventHandler<'message:ack'>(async data => {
		const isEventValid = validateMessageReceivedRequest(data);
		if (!isEventValid) {
			throw new Error('Invalid message');
		}

		await deleteReceivedMessages(drizzle, socket.data.user.id, data.lastReceivedMessageId);
		return {success: true};
	});

	io.on('message:send', handleSendMessage);
	io.on('message:ack', handleAckMessage);
};

export default registerMessageHandlers;

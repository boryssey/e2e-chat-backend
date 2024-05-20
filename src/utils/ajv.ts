import addFormats from 'ajv-formats';
import Ajv from 'ajv';

const ajvWithoutFormats = new Ajv();
const ajv = addFormats(ajvWithoutFormats, [
	'date-time',
	'time',
	'date',
	'email',
	'hostname',
	'ipv4',
	'ipv6',
	'uri',
	'uri-reference',
	'uuid',
	'uri-template',
	'json-pointer',
	'relative-json-pointer',
	'regex',
]);

export default ajv;

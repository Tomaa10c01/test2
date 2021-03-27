
import { Buffer, isBuffer, isFunction, isObject } from '../../../base/index.mjs';
import { describe, finish                       } from '../../../covert/index.mjs';
import { DNS                                    } from '../../../stealth/source/connection/DNS.mjs';
import { URL                                    } from '../../../stealth/source/parser/URL.mjs';


const PAYLOADS = {

	'A': {

		REQUEST: Buffer.from([
			0x96, 0x9a, 0x01, 0x20,
			0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01,
			0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65,
			0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x01, 0x00,
			0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08,
			0x97, 0xc2, 0xbd, 0x6d,
			0xfe, 0x48, 0xb9, 0x31
		]),

		RESPONSE: Buffer.from([
			0x96, 0x9a, 0x81, 0x80,
			0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01,
			0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65,
			0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x01, 0x00,
			0x01, 0xc0, 0x0c, 0x00,
			0x01, 0x00, 0x01, 0x00,
			0x00, 0xfd, 0xd7, 0x00,
			0x04, 0x5d, 0xb8, 0xd8,
			0x22, 0x00, 0x00, 0x29,
			0x04, 0xd0, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x1c,
			0x00, 0x0a, 0x00, 0x18,
			0x97, 0xc2, 0xbd, 0x6d,
			0xfe, 0x48, 0xb9, 0x31,
			0x98, 0xe6, 0x7c, 0x76,
			0x60, 0x5f, 0x63, 0x38,
			0x91, 0xc4, 0x11, 0xa9,
			0xcb, 0x8c, 0x3b, 0x5f
		])

	},

	'AAAA': {

		REQUEST: Buffer.from([
			0x68, 0xbf, 0x01, 0x20,
			0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01,
			0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65,
			0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x1c, 0x00,
			0x01, 0x00, 0x00, 0x29,
			0x10, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x0c,
			0x00, 0x0a, 0x00, 0x08,
			0xce, 0x2b, 0x43, 0x6f,
			0xf4, 0x93, 0x6f, 0x32
		]),

		RESPONSE: Buffer.from([
			0x68, 0xbf, 0x81, 0x80,
			0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01,
			0x07, 0x65, 0x78, 0x61,
			0x6d, 0x70, 0x6c, 0x65,
			0x03, 0x63, 0x6f, 0x6d,
			0x00, 0x00, 0x1c, 0x00,
			0x01, 0xc0, 0x0c, 0x00,
			0x1c, 0x00, 0x01, 0x00,
			0x00, 0xe0, 0xf9, 0x00,
			0x10, 0x26, 0x06, 0x28,
			0x00, 0x02, 0x20, 0x00,
			0x01, 0x02, 0x48, 0x18,
			0x93, 0x25, 0xc8, 0x19,
			0x46, 0x00, 0x00, 0x29,
			0x04, 0xd0, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x1c,
			0x00, 0x0a, 0x00, 0x18,
			0xce, 0x2b, 0x43, 0x6f,
			0xf4, 0x93, 0x6f, 0x32,
			0xc0, 0xe0, 0x51, 0xac,
			0x60, 0x5f, 0x62, 0xb5,
			0x9b, 0xb2, 0x3c, 0xb1,
			0xcb, 0xae, 0xd2, 0x90
		])

	},

	'CNAME': {

		REQUEST: Buffer.from([
			0x59, 0x6b, 0x01, 0x20,
			0x00, 0x01, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x01,
			0x07, 0x70, 0x72, 0x6f,
			0x70, 0x68, 0x65, 0x74,
			0x05, 0x68, 0x65, 0x69,
			0x73, 0x65, 0x02, 0x64,
			0x65, 0x00, 0x00, 0x05,
			0x00, 0x01, 0x00, 0x00,
			0x29, 0x10, 0x00, 0x00,
			0x00, 0x00, 0x00, 0x00,
			0x0c, 0x00, 0x0a, 0x00,
			0x08, 0x68, 0x2a, 0x8f,
			0x91, 0x5f, 0x27, 0xd2,
			0xe5
		]),

		RESPONSE: Buffer.from([
			0x59, 0x6b, 0x81, 0x80,
			0x00, 0x01, 0x00, 0x01,
			0x00, 0x00, 0x00, 0x01,
			0x07, 0x70, 0x72, 0x6f,
			0x70, 0x68, 0x65, 0x74,
			0x05, 0x68, 0x65, 0x69,
			0x73, 0x65, 0x02, 0x64,
			0x65, 0x00, 0x00, 0x05,
			0x00, 0x01, 0xc0, 0x0c,
			0x00, 0x05, 0x00, 0x01,
			0x00, 0x00, 0xd1, 0x64,
			0x00, 0x16, 0x07, 0x68,
			0x65, 0x69, 0x73, 0x65,
			0x30, 0x32, 0x08, 0x77,
			0x65, 0x62, 0x74, 0x72,
			0x65, 0x6b, 0x6b, 0x03,
			0x6e, 0x65, 0x74, 0x00,
			0x00, 0x00, 0x29, 0x04,
			0xd0, 0x00, 0x00, 0x00,
			0x00, 0x00, 0x1c, 0x00,
			0x0a, 0x00, 0x18, 0x68,
			0x2a, 0x8f, 0x91, 0x5f,
			0x27, 0xd2, 0xe5, 0x55,
			0x86, 0x65, 0x1f, 0x60,
			0x5f, 0x69, 0xcc, 0x7b,
			0xf8, 0xfe, 0x5a, 0xb6,
			0xc2, 0xee, 0xae
		])

	}

};




describe('DNS.connect()', function(assert) {

	assert(isFunction(DNS.connect), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			connection.disconnect();
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

describe('DNS.disconnect()', function(assert) {

	assert(isFunction(DNS.disconnect), true);


	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		assert(true);

		setTimeout(() => {
			assert(DNS.disconnect(connection), true);
		}, 0);

	});

	connection.once('@disconnect', () => {
		assert(true);
	});

});

// TODO: Test A query
// TODO: Test AAAA query
// TODO: Test CNAME query
// TODO: Test NS query

// TODO: Test TXT query (for DKIM and DMARC?)
// TODO: Test SRV query
// TODO: Test PTR query
// TODO: Test SOA query

describe('DNS.receive()/client/A', function(assert, console) {

	assert(isFunction(DNS.receive), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('@connect', () => {

		DNS.receive(connection, PAYLOADS['A']['RESPONSE'], (response) => {

			assert(response, {
			});

			connection.disconnect();

			console.log(response);

			assert(true);

		});

	});

	assert(false);

});

describe('DNS.receive()/server/A', function(assert) {
});

describe('DNS.receive()/AAAA', function(assert) {
});

describe('DNS.receive()/CNAME', function(assert) {
});

describe('DNS.receive()/SRC', function(assert) {
});

describe('DNS.receive()/TXT', function(assert) {
});

describe('DNS.send()', function(assert) {

	assert(isFunction(DNS.send), true);

	let url        = URL.parse('dns://1.0.0.1:53');
	let connection = DNS.connect(url);

	connection.once('response', (response) => {

		console.log(response);

	});

	connection.once('@connect', () => {

		DNS.send(connection, {
			headers: {
				'@type': 'request'
			},
			payload: {
				questions: [{
					name: 'example.com',
					type: 'A'
				}]
			}
		}, (result) => {

			assert(result, true);

		});

	});

});



export default finish('stealth/connection/DNS', {
	internet: true,
	network:  true
});


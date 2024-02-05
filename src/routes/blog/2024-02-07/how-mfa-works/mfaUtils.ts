/*
Copyright (c) 2011, Chris Umbel
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

// Some portions adapted from https://git.coolaj86.com/coolaj86/browser-authenticator.js/src/branch/gh-pages/demo/bower_components/unibabel/unibabel.base32.js

export const HIGHLIGHT_CLASS = 'underline';
export const alphabet = 'abcdefghijklmnopqrstuvwxyz234567';
const byteTable = [
	0xff, 0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
	0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff,
	0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
	0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff
];

const quintetCount = (buff: ArrayLike<number>) => {
	const quintets = Math.floor(buff.length / 5);
	return buff.length % 5 === 0 ? quintets : quintets + 1;
};

export const uint8ToBase32 = (plain: Uint8Array): string => {
	let i = 0;
	let j = 0;
	let shiftIndex = 0;
	let digit = 0;
	const encoded = new Array(quintetCount(plain) * 8);

	/* byte by byte isn't as pretty as quintet by quintet but tests a bit
          faster. will have to revisit. */
	while (i < plain.length) {
		const current = plain[i];

		if (shiftIndex > 3) {
			digit = current & (0xff >> shiftIndex);
			shiftIndex = (shiftIndex + 5) % 8;
			digit =
				(digit << shiftIndex) | ((i + 1 < plain.length ? plain[i + 1] : 0) >> (8 - shiftIndex));
			i++;
		} else {
			digit = (current >> (8 - (shiftIndex + 5))) & 0x1f;
			shiftIndex = (shiftIndex + 5) % 8;
			if (shiftIndex === 0) {
				i++;
			}
		}

		encoded[j] = alphabet[digit];
		j++;
	}

	for (i = j; i < encoded.length; i++) {
		encoded[i] = '=';
	}

	return encoded.join('');
};

export const base32ToUint8 = (encoded: string): Uint8Array => {
	let shiftIndex = 0;
	let plainDigit = 0;
	let plainChar = 0;
	let plainPos = 0;
	const len = Math.ceil((encoded.length * 5) / 8);
	const decoded = new Uint8Array(len);

	const encodedChars = new Uint8Array(
		encoded.split('').map(function (ch) {
			return ch.charCodeAt(0);
		})
	);

	/* byte by byte isn't as pretty as octet by octet but tests a bit
          faster. will have to revisit. */
	for (let i = 0; i < encoded.length; i++) {
		if (encodedChars[i] === 0x3d) {
			//'='
			break;
		}

		const encodedByte = encodedChars[i] - 0x30;

		if (encodedByte < byteTable.length) {
			plainDigit = byteTable[encodedByte];

			if (shiftIndex <= 3) {
				shiftIndex = (shiftIndex + 5) % 8;

				if (shiftIndex === 0) {
					plainChar |= plainDigit;
					decoded[plainPos] = plainChar;
					plainPos++;
					plainChar = 0;
				} else {
					plainChar |= 0xff & (plainDigit << (8 - shiftIndex));
				}
			} else {
				shiftIndex = (shiftIndex + 5) % 8;
				plainChar |= 0xff & (plainDigit >>> shiftIndex);
				decoded[plainPos] = plainChar;
				plainPos++;

				plainChar = 0xff & (plainDigit << (8 - shiftIndex));
			}
		} else {
			throw new Error('Invalid input - it is not base32 encoded string');
		}
	}

	return decoded.slice(0, plainPos);
};

export const chunks = <T>(a: Array<T>, size: number): Array<Array<T>> =>
	Array.from(new Array(Math.ceil(a.length / size)), (_, i) => a.slice(i * size, i * size + size));

const byteColorMap: Record<number, string> = {
	0: 'text-red-800 dark:text-red-300',
	1: 'text-orange-800 dark:text-orange-300',
	2: 'text-green-800 dark:text-green-300',
	3: 'text-blue-800 dark:text-blue-300',
	4: 'text-purple-800 dark:text-purple-300'
};

export const getByteColor = (index: number, radix: number): string => {
	const idx = Math.floor(index / radix) % 5;
	return byteColorMap[idx];
};

export const HMAC_BYTES = 64;
export const HMAC_IPAD = new Uint8Array(HMAC_BYTES).fill(0x36);
export const HMAC_OPAD = new Uint8Array(HMAC_BYTES).fill(0x5c);

export const DT = (hmacBuffer: ArrayBuffer) => {
	const hmacArray = new Uint8Array(hmacBuffer);
	const offset = hmacArray[19] & 0x0f;
	const binCode =
		((hmacArray[offset] & 0x7f) << 24) |
		((hmacArray[offset + 1] & 0xff) << 16) |
		((hmacArray[offset + 2] & 0xff) << 8) |
		(hmacArray[offset + 3] & 0xff);
	return binCode % Math.pow(10, 6);
};

export const hmac = async (key: string, message: string): Promise<ArrayBuffer | undefined> => {
	if (typeof window == 'undefined') return;
	const keyBytes = base32ToUint8(key);
	console.log({ keyBytes, message });
	const paddedKey = new Uint8Array(HMAC_BYTES);
	paddedKey.set(keyBytes);

	const messageBytes = numToUint8Array(parseInt(message));

	const inner = new Uint8Array(HMAC_BYTES);
	for (let i = 0; i < HMAC_BYTES; ++i) {
		inner[i] = paddedKey[i] ^ HMAC_IPAD[i];
	}

	const innerWithMessage = new Uint8Array(HMAC_BYTES + messageBytes.length);
	innerWithMessage.set(inner);
	innerWithMessage.set(messageBytes, inner.length);

	const innerHash = new Uint8Array(await window.crypto.subtle.digest('SHA-1', innerWithMessage));

	const outer = new Uint8Array(HMAC_BYTES);
	for (let i = 0; i < HMAC_BYTES; ++i) {
		outer[i] = paddedKey[i] ^ HMAC_OPAD[i];
	}

	const outerWithHash = new Uint8Array(HMAC_BYTES + innerHash.length);
	outerWithHash.set(outer);
	outerWithHash.set(innerHash, outer.length);

	return await window.crypto.subtle.digest('SHA-1', outerWithHash);
};

export const numToUint8Array = (num: number): Uint8Array => {
	const arr = new Uint8Array(8);

	for (let i = 7; i >= 0; i--) {
		arr[i] = num % 256;
		num = Math.floor(num / 256);
	}

	return arr;
};

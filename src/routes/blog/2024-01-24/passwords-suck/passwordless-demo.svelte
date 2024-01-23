<script lang="ts">
	import Button from '$lib/button.svelte';
	import ControlledInput from '$lib/input.svelte';
	import { decode } from 'cbor-x';

	const LOCAL_STORAGE_KEY = 'passwords-suck.saved-credentials';
	let username = '';
	let errorMessage = '';
	let successMessage = '';
	let lastCredentialId = '';

	let pageState: 'select' | 'register' | 'login' | 'logged-in' = 'select';

	const handleSubmit = () => {
		if (username.length === 0) {
			errorMessage = 'Username cannot be empty';
			return false;
		}

		const currentCredentials = getSavedCredentials();
		if (currentCredentials.length === 0) {
			pageState = 'register';
		} else {
			pageState = 'login';
			login();
		}
	};

	const uintToHex = (uint: Uint8Array) => {
		return Array.from(uint)
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
	};

	const rp = {
		name: "Jackson's Blog",
		id: typeof window == 'undefined' ? '' : window.location.hostname
	};

	const pubKeyCredParams: PublicKeyCredentialParameters[] = [
		{
			type: 'public-key',
			alg: -7 // "ES256" as registered in the IANA COSE Algorithms registry
		},
		{
			type: 'public-key',
			alg: -257 // Value registered by this specification for "RS256"
		}
	];

	const algoMap: Record<number, { name: string; hash: string }> = {
		[-7]: { name: 'ECDSA', hash: 'SHA-256' },
		[-257]: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }
	};

	type Flags = {
		userPresent: boolean;
		userVerified: boolean;
		backupEligible: boolean;
		backupState: boolean;
		attestedCredentialDataIncluded: boolean;
		extensionDataIncluded: boolean;
	};

	const parseAuthData = (
		authData: Uint8Array
	): {
		rpIdHash: string;
		flags: Flags;
		counter: number;
		attestedCredentialData: Uint8Array;
	} => {
		const rpIdHashBytes = authData.slice(0, 32);
		const flagByte = authData.at(32)!;

		const flags: Flags = {
			userPresent: (flagByte & 0b1) !== 0,
			userVerified: (flagByte & 0b100) !== 0,
			backupEligible: (flagByte & 0b1000) !== 0,
			backupState: (flagByte & 0b10000) !== 0,
			attestedCredentialDataIncluded: (flagByte & 0b100000) !== 0,
			extensionDataIncluded: (flagByte & 0b1000000) !== 0
		};

		const counterBytes = authData.slice(33, 37);
		const attestedCredentialData = authData.slice(37);

		const rpIdHash = base64url_encode(rpIdHashBytes);

		console.log({
			rpIdHash,
			flags,
			counter: counterBytes.reduce((a, b) => a * 256 + b, 0),
			attestedCredentialData
		});

		return {
			rpIdHash,
			flags,
			counter: counterBytes.reduce((a, b) => a * 256 + b, 0),
			attestedCredentialData
		};
	};

	const makeHash = async (toHash: string): Promise<string> => {
		if (typeof window === 'undefined') return '';
		const encoder = new TextEncoder();
		const data = encoder.encode(toHash);
		const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
		const hashArray = new Uint8Array(hashBuffer);
		return base64url_encode(hashArray);
	};

	const getKey = async (publicKeyData: Record<number, any>): Promise<CryptoKey | undefined> => {
		// somehow parameters are being passed as a dictionary instead of an array
		const p1 = base64url_encode(
			Object.entries(publicKeyData[-2]).reduce<Uint8Array>((acc, [k, v]) => {
				acc[parseInt(k)] = v as number;
				return acc;
			}, new Uint8Array(Object.keys(publicKeyData[-2]).length))
		);
		const p2 = base64url_encode(
			Object.entries(publicKeyData[-3]).reduce<Uint8Array>((acc, [k, v]) => {
				acc[parseInt(k)] = v as number;
				return acc;
			}, new Uint8Array(Object.keys(publicKeyData[-3]).length))
		);

		// es256
		console.log({ publicKeyData });
		if (publicKeyData[3] === -7) {
			const asJwk = {
				kty: 'EC',
				crv: 'P-256',
				x: p1,
				y: p2,
				alg: 'ES256',
				ext: true
			};
			console.log({ asJwk });
			return crypto.subtle.importKey('jwk', asJwk, { name: 'ECDSA', namedCurve: 'P-256' }, true, [
				'verify'
			]);
		} else if (publicKeyData[3] === -257) {
			// rs256
			const asJwk = {
				kty: 'RSA',
				n: p1,
				e: p2,
				alg: 'RS256',
				ext: true
			};
			return crypto.subtle.importKey(
				'jwk',
				asJwk,
				{ name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
				true,
				['verify']
			);
		}
	};

	const verifySignature = async (
		hash: Uint8Array,
		authData: Uint8Array,
		signature: Uint8Array,
		publicKey: Record<number, number | Uint8Array>
	): Promise<boolean> => {
		const concat = new Uint8Array([...authData, ...hash]);
		const algo = algoMap[publicKey[3] as number];
		console.log({ algo });
		if (algo == null) {
			return false;
		}

		const key = await getKey(publicKey);
		console.log({ key });
		if (key == null) {
			return false;
		}

		return crypto.subtle.verify(algo, key, signature, concat);
	};

	const register = () => {
		if (!window.PublicKeyCredential) {
			errorMessage =
				"Your browser doesn't support WebAuthn. Try using a Chromium-based browser or Safari.";
			return;
		}

		const challenge = window.crypto.getRandomValues(new Uint8Array(32));

		const publicKey: PublicKeyCredentialCreationOptions = {
			challenge,
			rp,
			user: {
				id: Uint8Array.from(username, (c) => c.charCodeAt(0)),
				name: username,
				displayName: username
			},

			// This Relying Party will accept either an ES256 or RS256 credential, but
			// prefers an ES256 credential.
			pubKeyCredParams,

			timeout: 360000 // 6 minutes
		};

		// Note: The following call will cause the authenticator to display UI.
		navigator.credentials
			.create({ publicKey })
			.then(async (newCredentialInfo) => {
				if (newCredentialInfo == null || newCredentialInfo.type !== 'public-key') {
					throw Error('Wrong type of credential created. wtf?');
				}
				const response = newCredentialInfo.response as AuthenticatorAttestationResponse;
				const uintData = response.clientDataJSON;
				const clientDataJSON = JSON.parse(new TextDecoder().decode(uintData));
				console.log({ clientDataJSON });

				// type needs to be webauthn.create
				const type = clientDataJSON.type;
				if (type !== 'webauthn.create') {
					throw Error(`Attestation type is not webauthn.create (got: ${type}). wtf?`);
				}

				// check that our received challenge matches the one we sent
				const sentChallenge = base64url_encode(challenge);
				const receivedChallenge = clientDataJSON.challenge;
				if (sentChallenge !== receivedChallenge) {
					throw Error(
						`Challenges do not match (want: ${sentChallenge}, got: ${receivedChallenge})`
					);
				}

				// origin needs to match too
				const sentOrigin = window.location.origin;
				const receivedOrigin = clientDataJSON.origin;
				if (sentOrigin !== receivedOrigin) {
					throw Error(`Origins do not match (want: ${sentOrigin}, got: ${receivedOrigin})`);
				}

				const attestationObject = response.attestationObject;
				const decodedAttestationObject = decode(new Uint8Array(attestationObject));
				const attestationAuthData: Uint8Array = decodedAttestationObject.authData;
				const { rpIdHash, flags, counter, attestedCredentialData } =
					parseAuthData(attestationAuthData);
				const expectedRpIdHash = await makeHash(rp.id);

				if (rpIdHash !== expectedRpIdHash) {
					throw Error(`rpIdHash does not match (want: ${expectedRpIdHash}, got: ${rpIdHash})`);
				}

				if (!flags.userPresent) {
					throw Error('UserPresent flag not set');
				}

				if (!flags.backupEligible && flags.backupState) {
					throw Error('BackupEligible flag not set and BackupState flag is set - impossible state');
				}

				const aaguidBytes = attestedCredentialData.slice(0, 16);
				const credentialIdLengthBytes = attestedCredentialData.slice(16, 18);
				const credentialIdLength = credentialIdLengthBytes[0] * 256 + credentialIdLengthBytes[1];
				const credentialId = attestedCredentialData.slice(18, 18 + credentialIdLength);

				if (credentialIdLength >= 1024) {
					throw Error(
						`Credential ID length is too long (want < 1024 bytes, got ${credentialIdLength} bytes)`
					);
				}

				const credentialPublicKeyBytes = attestedCredentialData.slice(18 + credentialIdLength);
				const credentialPublicKey = decode(credentialPublicKeyBytes);

				console.log({ credentialId, credentialPublicKey });

				const alg = credentialPublicKey[3];
				const allowedAlgs = pubKeyCredParams.map((p) => p.alg);
				if (!allowedAlgs.includes(alg)) {
					throw Error(`Algorithm ${alg} is not allowed`);
				}

				// not checking attestation because fuck that

				const credentialToSave = {
					type: newCredentialInfo.type,
					id: Array.from(credentialId),
					publicKey: credentialPublicKey,
					signCount: counter,
					uvInitialized: flags.userVerified,
					transports: response.getTransports(),
					backupEligible: flags.backupEligible,
					backupState: flags.backupState
				};

				let allCredentialsStr = window.localStorage.getItem(LOCAL_STORAGE_KEY);
				if (allCredentialsStr == null) {
					window.localStorage.setItem(LOCAL_STORAGE_KEY, '{}');
					allCredentialsStr = '{}';
				}

				const allCredentials = JSON.parse(allCredentialsStr);

				const currentCredentials = allCredentials[username] ?? [];

				allCredentials[username] = [...currentCredentials, credentialToSave];
				window.localStorage.setItem(
					'passwords-suck.saved-credentials',
					JSON.stringify(allCredentials)
				);

				errorMessage = '';
				successMessage = 'Successfully saved your credential.';
				lastCredentialId = uintToHex(credentialId);
				pageState = 'logged-in';

				console.log({
					credentialId,
					infoId: newCredentialInfo.id,
					infoRawId: newCredentialInfo.rawId,
					decodedCredentialId: Array.from(credentialId)
						.map((b) => b.toString(16).padStart(2, '0'))
						.join('')
				});
			})
			.catch((err: Error): any => {
				// No acceptable authenticator or user refused consent. Handle appropriately.
				console.trace(err);
				errorMessage = err.message;
				return;
			});
	};

	const login = () => {
		if (!window.PublicKeyCredential) {
			errorMessage =
				"Your browser doesn't support WebAuthn. Try using a Chromium-based browser or Safari.";
			return;
		}

		const allowCredentials: { type: 'public-key'; id: Uint8Array }[] = getSavedCredentials().map(
			(c: { id: number[] }) => ({
				type: 'public-key',
				id: Uint8Array.from(c.id)
			})
		);

		const challenge = window.crypto.getRandomValues(new Uint8Array(32));

		const options = {
			challenge,
			timeout: 300000, // 5 minutes
			allowCredentials
		};

		navigator.credentials
			.get({ publicKey: options })
			.then(async (credential) => {
				if (credential == null || credential.type !== 'public-key') {
					throw Error('Wrong type of credential returned. wtf?');
				}

				const response = credential.response as AuthenticatorAssertionResponse;

				// check that credential is allowable
				const allowableIds = allowCredentials.map((c) => uintToHex(c.id));
				const rawIdHex = uintToHex(new Uint8Array(credential.rawId));
				if (!allowableIds.includes(rawIdHex)) {
					console.log({
						allowableIds,
						rawIdHex
					});
					throw Error(`Credential ID ${rawIdHex} is not allowable.`);
				}

				// check that response.userHandle matches the user ID if present
				console.log(`handle: ${response.userHandle}`);
				if (response.userHandle != null && response.userHandle.byteLength > 0) {
					const sentUserId = new TextDecoder().decode(new Uint8Array(response.userHandle));
					console.log({ sentUserId });
					if (sentUserId !== username) {
						throw Error(`User ID ${sentUserId} does not match expected user ID ${username}`);
					}
				}

				const clientData = JSON.parse(new TextDecoder().decode(response.clientDataJSON));
				const authenticatorData = new Uint8Array(response.authenticatorData);
				const signature = new TextDecoder().decode(response.signature);

				console.log({ clientData, authenticatorData, signature });

				if (clientData.type !== 'webauthn.get') {
					throw Error(`ClientData type is not webauthn.get (got: ${clientData.type}). wtf?`);
				}

				if (clientData.challenge !== base64url_encode(challenge)) {
					throw Error(
						`Challenges do not match (want: ${base64url_encode(challenge)}, got: ${
							clientData.challenge
						})`
					);
				}

				if (clientData.origin !== window.location.origin) {
					throw Error(
						`Origins do not match (want: ${window.location.origin}, got: ${clientData.origin})`
					);
				}

				const { rpIdHash, flags, counter } = parseAuthData(authenticatorData);
				const expectedRpIdHash = await makeHash(rp.id);
				if (rpIdHash !== expectedRpIdHash) {
					throw Error(`rpIdHash does not match (want: ${expectedRpIdHash}, got: ${rpIdHash})`);
				}

				if (!flags.userPresent) {
					throw Error('UserPresent flag not set');
				}

				if (!flags.backupEligible && flags.backupState) {
					throw Error('BackupEligible flag not set and BackupState flag is set - impossible state');
				}

				type CredentialParams = {
					id: number[];
					backupEligible: boolean;
					backupState: boolean;
					publicKey: Record<number, any>;
					signCount: number;
					uvInitialized: boolean;
				};

				const matchedCredential: CredentialParams = getSavedCredentials().find(
					(c: CredentialParams) => uintToHex(new Uint8Array(c.id)) === rawIdHex
				);

				// update backup data
				matchedCredential.backupEligible = flags.backupEligible;
				matchedCredential.backupState = flags.backupState;

				const hash = new TextEncoder().encode(
					await makeHash(new TextDecoder().decode(response.clientDataJSON))
				);
				if (
					!verifySignature(
						hash,
						authenticatorData,
						new Uint8Array(response.signature),
						matchedCredential.publicKey
					)
				) {
					throw Error('Signature verification failed');
				}

				// check signCount
				if (
					(counter > 0 || matchedCredential.signCount > 0) &&
					counter <= matchedCredential.signCount
				) {
					throw Error(
						`Sign count is too low (want > ${matchedCredential.signCount}, got ${counter}). Possible credential cloning.`
					);
				}

				if (!matchedCredential.uvInitialized) {
					matchedCredential.uvInitialized = flags.userVerified;
				}

				matchedCredential.signCount = counter;

				const newCredentials = getSavedCredentials().map((c: CredentialParams) => {
					if (uintToHex(new Uint8Array(c.id)) === rawIdHex) {
						return matchedCredential;
					}
					return c;
				});

				putSavedCredentials(newCredentials);

				console.log('holy shit');
				lastCredentialId = rawIdHex;
				console.log({ lastCredentialId });
				successMessage = 'Successfully signed in.';
				pageState = 'logged-in';
			})
			.catch((err: Error) => {
				console.trace(err);
				errorMessage = err.message;
				pageState = 'select';
			});
	};

	const base64url_encode = (buffer: ArrayBuffer): string => {
		return btoa(Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(''))
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
	};

	const getSavedCredentials = (): any[] => {
		const currentCredentials = JSON.parse(
			window.localStorage.getItem('passwords-suck.saved-credentials') ?? '{}'
		);
		return currentCredentials[username] ?? [];
	};

	const putSavedCredentials = (newData: any[]) => {
		const allCredentials = JSON.parse(
			window.localStorage.getItem('passwords-suck.saved-credentials') ?? '{}'
		);

		allCredentials[username] = newData;
		window.localStorage.setItem('passwords-suck.saved-credentials', JSON.stringify(allCredentials));
	};
</script>

<div class="p-4">
	<h2 class="text-2xl mt-0">ACME {pageState !== 'logged-in' ? 'Login' : ''}</h2>
	{#if errorMessage !== ''}
		<div
			class="flex items-center rounded-md border dark:border-red-600 border-red-400 dark:bg-red-900/25 bg-red-100 dark:text-red-200 text-red-800 p-4 mb-4"
		>
			<div class="text-sm">{errorMessage}</div>
		</div>
	{/if}
	{#if pageState === 'select'}
		<form on:submit|preventDefault={handleSubmit}>
			<ControlledInput bind:value={username} label="Username" type="text" autocomplete="username" />
			<Button type="submit" size="lg">Next</Button>
		</form>
	{:else if pageState === 'register'}
		<div>
			<p>
				<span class="font-mono font-mono-normal">{username}</span> has not been registered yet. Press
				"Register" to set up a passkey for this user, or "Back" if this isn't you.
			</p>
		</div>
		<Button size="xl" on:click={register}>Register</Button>
		<Button size="xl" variant="outline" on:click={() => (pageState = 'select')}>Back</Button>
	{:else if pageState === 'logged-in'}
		{#if successMessage !== ''}
			<div
				class="flex items-center rounded-md border dark:border-green-600 border-green-400 dark:bg-green-900/25 bg-green-100 dark:text-green-200 text-green-800 p-4 mb-4"
			>
				<div class="text-sm">{successMessage}</div>
			</div>
		{/if}

		Username: {username}

		{#each getSavedCredentials() as credential}
			<div
				class="rounded-md border dark:border-gray-600 border-gray-400 dark:bg-gray-900/25 bg-gray-100 dark:text-gray-200 text-gray-800 p-4 mb-4 overflow-x-scroll"
			>
				{#if uintToHex(credential.id) === lastCredentialId}
					<span class="rounded-sm bg-green-600 text-green-50 py-0.5 px-1 text-xs font-bold"
						>Just used</span
					>
				{/if}
				<div class="text-sm">
					Credential ID: <span class="font-mono font-mono-normal">{uintToHex(credential.id)}</span>
				</div>
				<div class="text-sm">User verification: {credential.uvInitialized ? 'yes' : 'no'}</div>
				<div class="text-sm">Sign count: {credential.signCount}</div>
				<div class="text-sm">Transports: {credential.transports.join(', ')}</div>
				<div class="text-sm">Backup eligible: {credential.backupEligible ? 'yes' : 'no'}</div>
				<div class="text-sm">Backup state: {credential.backupState ? 'yes' : 'no'}</div>
			</div>
		{/each}
		<Button class="my-2" on:click={() => (pageState = 'register')}>add a new credential</Button><br
		/>
		<Button
			class="my-2"
			on:click={() => {
				username = '';
				pageState = 'select';
			}}>sign out</Button
		>
	{/if}
</div>

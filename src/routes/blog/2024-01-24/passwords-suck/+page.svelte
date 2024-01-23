<script lang="ts">
	import MailingListCta from '$lib/mailing-list-cta.svelte';
	import PasswordDemo from './password-demo.svelte';
	import PasswordlessDemo from './passwordless-demo.svelte';
	import SmartCardDemo from './smart-card-demo.svelte';

	const goodPasskeySupport = () => {
		if (typeof window === 'undefined') return false;

		if (window.PublicKeyCredential) {
			return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
				.then((available) => {
					if (available) {
						return PublicKeyCredential.isConditionalMediationAvailable().then((available) => {
							if (available) {
								console.log('WebAuthn fully supported.');
								return true;
							} else {
								console.log('WebAuthn supported, but Conditional Mediation *not* supported.');
								return false;
							}
						});
					} else {
						console.log('WebAuthn supported, Platform Authenticator *not* supported.');
						return false;
					}
				})
				.catch((err) => console.trace(err));
		} else {
			console.log('WebAuthn not supported.');
			return false;
		}
	};
</script>

<svelte:head>
	<title>Passwords suck. | Jackson Welsh</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Passwords suck." />
	<meta property="og:url" content="https://jacksonwel.sh/blog/2024-01-24/passwords-suck" />
	<meta property="og:site_name" content="Jackson Welsh" />
	<meta
		property="og:description"
		content="We've been using passwords for decades. It's time for something different."
	/>
	<meta property="og:article:published_time" content="2024-01-24" />
	<meta property="og:article:author" content="Jackson Welsh" />
	<meta property="og:article:tag" content="passwords" />
	<meta property="og:article:tag" content="security" />
	<meta property="og:article:tag" content="technology" />
	<meta property="og:article:tag" content="passwordless" />
	<meta property="og:article:tag" content="passkeys" />
</svelte:head>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/
		<a href="/blog" class="text-blue-400 hover:underline">blog</a>
		/passwords-suck
	</div>
</div>
<main class="mx-auto my-16 p-2 md:p-0">
	<article class="mx-auto prose dark:prose-invert">
		<div
			class="flex items-center flex-wrap rounded-md border-2 bg-gradient-to-tr dark:border-green-600 border-green-400 dark:from-blue-900/25 dark:to-green-900/25 from-blue-100 to-green-100 text-green-800 dark:text-green-200 p-4 my-4"
		>
			<div class="text-sm w-full">
				<strong>You found an unreleased blog post!</strong> All content here is tentative, and the final
				blog may look significantly different from what you see today. Shoot me an email if you have
				any comments.
			</div>
			<div class="text-sm w-full">
				<p>Planned changes:</p>
				<ul>
					<li>Add collapsed "caveats" to each demo, explaining their limitations</li>
					<li>Actually make footnotes for the referenced footnotes</li>
					<li>
						Make a sources section, linking back to the W3C spec along with some other resources for
						further reading
					</li>
					<li>
						Maybe get a more extensive list of sites that use passkeys? i'll probably just link back
						to passkeys.dev tbh
					</li>
				</ul>
			</div>
		</div>

		<h1 class="font-mono mb-2">Passwords suck.</h1>
		<div class="text-lg text-gray-600 dark:text-gray-400">
			Your password must be at least 12 characters long. Your password must include at least one
			symbol (but not that one!). Your password must include at least one number. <a
				class="text-inherit"
				href="https://neal.fun/password-game/"
				target="_blank"
				rel="noreferrer">Your password must include the current phase of the moon as an emoji.</a
			>
		</div>
		<div class="mb-12">
			<time class="text-sm text-gray-600 dark:text-gray-400" datetime="2024-01-24">24 Jan 2024</time
			>
		</div>

		<p>
			We've all been there. It's 9am, you sign into your work account and the dreaded message
			appears: <em>Your password has expired. Please select a new password.</em> Maybe you're really
			security-minded and generate a new random password, somehow remembering it until you
			inevitably have to change it again. More likely, you just add a number to the end (the year,
			the month, or something similar) and call it a day.
			<strong>Why do we put up with this?</strong>
		</p>

		<div
			class="flex items-center rounded-t-md border-2 border-b-1 dark:border-yellow-600 border-yellow-400 dark:bg-yellow-900/25 bg-yellow-100 dark:text-yellow-200 text-yellow-800 p-4"
		>
			<div class="text-sm">
				Interactive. You shouldn't use a real password here, but all interactions are local.
			</div>
		</div>
		<div class="rounded-b-md border-2 border-t-1 dark:border-gray-700 border-gray-300 mb-2">
			<PasswordDemo />
		</div>
		<div class="text-center text-gray-700 dark:text-gray-300 text-sm mb-6">
			Frustrating password reset experience. Checks passwords against HIBP database using a
			locally-generated hash prefix.
		</div>

		<h2>Problems with passwords</h2>

		<p>
			The issues with passwords have been well-documented, but here's a short list of reasons they
			don't work well:
		</p>

		<ul>
			<li>
				Passwords are frequently compromised in data breaches. This means you should use a different
				password for each site (most people don't).
			</li>
			<li>
				Good passwords are hard to remember passwords. Ideally, all passwords would be randomly
				generated, but remembering random passwords for every single service is just not possible.
			</li>
			<li>
				Password managers are a good solution to the previous problems, but most users will not use
				one. Even then, there are still cases where you'd need to remember and type in a password,
				like to unlock your computer or in a situation where your password manager is inaccessible.
			</li>
			<li>
				Sites have varying requirements for what passwords can contain. Some sites require a number,
				symbol, etc. and some even limit you to 12 or 16 characters max. Sites that require a symbol
				may not allow all symbols.
			</li>
			<li>
				Applications that require password rotation (which used to be a security best-practice)
				encourage users to use predictable passwords.<sup>0</sup>
			</li>
			<li>Users can be tricked into entering their password on deceptive web forms (phishing).</li>
		</ul>

		<h2>A look back</h2>
		<p>
			Alternatives to passwords aren't new. You've probably used biometrics to unlock your phone,
			and you've probably used the chip on your credit card to pay for something.<sup>1</sup> In the
			federal government (as well as at some other organizations), smart cards are used to access computers
			and online services.
		</p>

		<p>
			Smart cards are particularly interesting. They look like a cross between a corporate badge and
			a chipped credit card. Users have a reader (potentially integrated into their laptop) where
			they insert the card, then enter a PIN to unlock the card. From there, the card can be used to
			access the laptop or online services like email. They key challenge of smart cards is that you <em
				>must</em
			> have a hardware reader to use a smart card, so they haven't seen much adoption out of highly-secure,
			highly-specialized industries.
		</p>

		<div
			class="flex items-center rounded-t-md border-2 border-b-1 dark:border-yellow-600 border-yellow-400 dark:bg-yellow-900/25 bg-yellow-100 dark:text-yellow-200 text-yellow-800 p-4"
		>
			<div class="text-sm">
				Interactive. You shouldn't use a real password here, but all interactions are local.
			</div>
		</div>

		<div class="rounded-b-md border-2 border-t-1 dark:border-gray-700 border-gray-300 mb-2">
			<SmartCardDemo />
		</div>
		<div class="text-center text-gray-700 dark:text-gray-300 text-sm mb-8">
			Example of smart card sign-in flow (no smart card needed)
		</div>

		<p>
			Another solution that's seen adoption is public key cryptography. For this method of
			authentication, users generate a <strong>keypair</strong>: a public key and a private key. The
			public key is sent to services that need to verify their identity, while the private key never
			leaves the user's device.
		</p>

		<p>
			When the user wants to sign in, the server generates a challenge using the user's public key,
			which the user's computer can solve using the private key. The user's computer then sends the
			solution to the server, which verifies it and grants access.
		</p>

		<p>
			This authentication method has seen wide adoption through SSH, but hasn't broken out of the
			technical crowd since it's not very ergonomic to use outside of a command line. Generating
			keypairs requires a small amount of deliberate work, and the user is ultimately responsible
			for managing every single keypair they generate.
		</p>

		<h2>Enter passkeys</h2>

		<p>
			Passkeys bring public key cryptography to the web. When you sign up for a website using a
			passkey, you can save the passkey to your phone, your laptop, your password manager, or a
			hardware token like a Yubikey.<sup>2</sup> When you sign in to that application, your device automatically
			selects the appropriate passkey, asks for your face/pin/fingerprint to unlock the passkey on your
			device, then signs the challenge from the server and sends it back.
		</p>

		<p>
			Passkeys are much more secure than passwords: your private keys are never sent to the services
			you authenticate against and services each get their own passkey, by default. Phishing a
			passkey is nearly impossible: you simply <em>can't</em> use a passkey on a domain different
			from the one it was generated on.<sup>3</sup> If you're using a passkey on a different device,
			the pairing procedure uses bluetooth to ensure the device you're pairing with is nearby - so unless
			your roommate is spearphishing you, you're safe.
		</p>

		{#if !goodPasskeySupport()}
			<div
				class="flex items-center rounded-md border-2 dark:border-yellow-600 border-yellow-400 dark:bg-yellow-900/25 bg-yellow-100 dark:text-yellow-200 text-yellow-800 p-4 my-4"
			>
				<div class="text-sm">
					Your browser has limited passkey support (or none at all). This demo works best in the
					latest versions of Chrome, Safari, or Edge (Firefox support is coming very soon!).
				</div>
			</div>
		{/if}

		<div
			class="flex items-center rounded-t-md border-2 border-b-1 dark:border-blue-600 border-blue-400 dark:bg-blue-900/25 bg-blue-100 dark:text-blue-200 text-blue-800 p-4"
		>
			<div class="text-sm">Interactive. Try out passwordless login.</div>
		</div>

		<div class="rounded-b-md border-2 border-t-1 dark:border-gray-700 border-gray-300 mb-2">
			<PasswordlessDemo />
		</div>
		<div class="text-center text-gray-700 dark:text-gray-300 text-sm mb-8">
			Live example of passwordless registration and login.
		</div>

		<MailingListCta title="Like what you're seeing?" />

		<h2>How does this all work?</h2>

		<p>
			The above demo uses a "toy" implementation of passwordless authentication, done by hand. It
			works entirely in your browser, saving the registered credentials to localStorage. The
			implementation was made based on the W3C specification <a
				href="https://w3c.github.io/webauthn"
				>Web Authentication: An API for accessing Public Key Credentials</a
			>. Let's walk through it step-by-step.
		</p>

		<h3>Registration</h3>
		<p>
			The first thing we need to do is determine the ground rules for the authenticator. We tell the
			browser the following things:
		</p>
		<ul>
			<li>Which kinds of public keys are allowed (ECDSA and RSA, 256-bit in both cases),</li>
			<li>How long the user has to complete the registration process (6 minutes)</li>
			<li>
				What the Relying Party is (this is the website: we provide a friendly name and hostname that
				must be either the current domain or a subdomain),
			</li>
			<li>
				Some information about the user that the authenticator can store (name, display name, ID -
				this is all optional), and
			</li>
			<li>A challenge, consisting of 32 cryptographically random 8-bit integers.</li>
		</ul>

		<p>
			This information is provided to the browser, which processes the information and interacts
			with the device to generate a passkey. There are several places you can store passkeys:
		</p>

		<ul>
			<li>On the device itself</li>
			<li>
				On a separate device, paired with the website via a QR code generated by the web browser
			</li>
			<li>On a hardware security key, like a Yubikey</li>
			<li>In a password manager</li>
		</ul>

		<p>
			Once the passkey is generated, the public key is sent to the server along with the solution to
			the challenge. The server verifies the solution, then stores the public key and user
			information in its database. Some other data is included in this response as well: a counter
			indicating how many times the passkey has been used (to help detect duplication), flags
			indicating if the passkey can be backed up and if it is backed up, and a flag indicating if
			the user performed a verification task (such as presenting a biometric or entering a PIN) when
			generating the passkey.
		</p>

		<p>
			The server saves the credential's ID, along with its public key and use count (and other
			flags, if it wants). This information is retrieved once the user wants to sign in.
		</p>

		<h3>Authentication</h3>

		<p>
			Now it's time to actually use the passkey. You type your username into the login form and your
			browser presents a passkey selection modal. You can use a passkey stored on the device, scan a
			QR code with your phone to use one from there, tap your FIDO security key, or use your
			password manager to present your passkey.
		</p>

		<p>
			Once the server knows who's trying to sign in, it sends a list of allowable credential IDs to
			the browser. The browser tries to find a matching credential stored on the device, and will
			give the option to use one stored elsewhere. If you try to use the wrong credential, your
			browser will actually let you know before even sending it to the server for verification since
			the IDs won't match.
		</p>

		<p>
			The authenticator signs the challenge, which the server then verifies using the passkey's
			public key. The private key data never leaves the device it's stored on (unless you're syncing
			it to other devices).
		</p>

		<p>
			That's really all there is to it! Passkeys are essentially just public key cryptography for
			the web, and are (in my opinion) a huge upgrade from passwords.
		</p>

		<h2>Downsides of passkeys</h2>

		<p>
			Passkeys aren't perfect. They're still a new technology, so they do have some issues. Current
			implementations suffer from poor portability: it's hard (or in some cases impossible) to
			migrate passkeys off of one device and onto another. While encrypted sync is available with
			providers like iCloud Keychain and 1Password, neither currently provides a way to move a
			passkey from their service into another service.
		</p>

		<p>
			Passkeys are also more challenging to implement on a website as a developer, when compared to
			passwords. The above implementation does not check for attestation (essentially: testing if
			the authenticator is one that has legitimately high security) since each vendor has its own
			attestation process (Passkeys generated on Apple devices use a different process than those on
			Android devices). This means that the server can't be sure that the authenticator is secure,
			but overall the implementation works <em>well enough</em>.
		</p>

		<h2>Closing thoughts</h2>

		<p>
			I'm excited to see something that looks like it'll reduce our reliance on passwords. Passkeys
			aren't a perfect solution <em>yet,</em> but there seems to be sufficient momentum from web browsers
			and device manufacturers to at least get this supported. We'll have to see if web developers actually
			integrate this into their sites, though Google, GitHub, and Apple (among others) have already integrated
			Passkeys into their login flows.
		</p>

		<p>
			It'll take time for users to learn this new process for signing into applications, but overall
			I think it's a better user experience than password management and can see it really catching
			on if some of the edges are smoothed out (like cross-platform transfers).
		</p>

		<MailingListCta />

		<sup>1</sup>Credit card numbers are remarkably similar to passwords. It's a static secret that,
		once exposed, will completely fuck you over. Magnetic stripes are essentially barcodes that
		present your card number, along with information like your name, to the payment terminal (the
		key difference being that you can't just snap a picture of the stripe).
	</article>
</main>

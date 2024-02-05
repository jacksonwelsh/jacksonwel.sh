<script lang="ts">
	import MailingListCta from '$lib/mailing-list-cta.svelte';
	import MfaSeedInitializationDemo from './mfa-seed-initialization-demo.svelte';
	import {
		codes,
		initializeSecret,
		secret,
		secretBytes,
		timestamp,
		timeStopped,
		timeStoppedAt
	} from './store';
	import SecretDisplayEditor from './secret-display-editor.svelte';
	import SecretUint8Display from './secret-uint8-display.svelte';
	import SecretBinDisplay from './secret-bin-display.svelte';
	import SecretCombinedDisplay from './secret-combined-display.svelte';
	import Authenticator from './authenticator.svelte';
	import Button from '$lib/button.svelte';
	import { onMount } from 'svelte';
	import Portal from './portal.svelte';
	import WindowVisualizer from './window-visualizer.svelte';
	import VarDeclarations from './code-samples/01-var-declarations.svelte';
	import PadKey from './code-samples/02-pad-key.svelte';
	import XorWithIpad from './code-samples/03-xor-with-ipad.svelte';
	import AppendCounterStream from './code-samples/04-append-counter-stream.svelte';
	import HashInner from './code-samples/05-hash-inner.svelte';
	import XorWithOpad from './code-samples/06-xor-with-opad.svelte';
	import AppendHashToOpad from './code-samples/07-append-hash-to-opad.svelte';
	import FinalHmacHash from './code-samples/08-final-hmac-hash.svelte';
	import Truncation from './code-samples/09-truncation.svelte';

	onMount(() => {
		initializeSecret(secret.set);
	});

	let showAuthenticator = false;
	let mfaInitComplete = false;

	const stopTime = () => {
		$timeStopped = true;
		$timeStoppedAt = $timestamp;
	};
</script>

<svelte:head>
	<title>How does MFA work? | Jackson Welsh</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content="How does MFA work?" />
	<meta property="og:url" content="https://jacksonwel.sh/blog/2024-01-31/how-mfa-works" />
	<meta property="og:site_name" content="Jackson Welsh" />
	<meta
		property="og:description"
		content="Lessons learned from building serverless applications on AWS."
	/>
	<meta property="og:article:published_time" content="2024-01-31" />
	<meta property="og:article:author" content="Jackson Welsh" />
	<meta property="og:article:tag" content="serverless" />
	<meta property="og:article:tag" content="cloud" />
	<meta property="og:article:tag" content="infrastructure" />
	<meta property="og:article:tag" content="devops" />
	<meta property="og:article:tag" content="aws" />
</svelte:head>

<div class="container mx-auto">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/
		<a href="/blog" class="text-blue-400 hover:underline">blog</a>
		/how-mfa-works
	</div>
</div>

<Authenticator bind:show={showAuthenticator} />

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
		</div>

		<h1 class="font-mono mb-2">How does MFA work?</h1>
		<div class="text-lg text-gray-600 dark:text-gray-400">SMS, TOTP, WebAuthn, oh my!</div>
		<time class="text-sm text-gray-600 dark:text-gray-400" datetime="2024-01-31">31 Jan 2024</time>

		<p>
			Passwords aren't enough to keep your most important accounts secure. As I <a
				href="../2024-01-24/passwords-suck">discussed last week,</a
			> there are many issues with using passwords to prove someone's identity. Multi-factor authentication
			(MFA) is one of the many tools that developers have to protect users' accounts from compromise.
		</p>

		<p>
			MFA comes in many forms–and not all forms of MFA are created equal. Let's take a look at your
			usual suspects:
		</p>

		<h3>SMS</h3>

		<p>
			SMS is probably the most ubiquitous, while also being the most flawed MFA solution. The
			application server generates a code (usually 6 digits) and sends a text to your registered
			phone number. The user enters the code (maybe with the help of their operating system[link to
			apple/google]), the site checks it against the code they generated, and the user is
			authenticated.
		</p>

		<p>This system works well for the most part, but has some glaring issues:</p>

		<ul>
			<li>
				Users traveling out of their home country can't access their accounts unless they have
				international roaming enabled.
			</li>
			<li>
				Users can't receive SMS messages in situations where internet is available, but mobile data
				is not (like old buildings or airplanes).
			</li>
			<li>
				SMS is often treated like a second authentication factor, but can be used in lieu of a
				password:
				<ul>
					<li>
						On many sites, you can set up multifactor authentication with SMS, but can also reset
						your password with a text message.
					</li>
					<li>
						If an attacker has control over your phone number, they can change your password with
						it, then use your phone number as the second factor to sign in - really making it a
						single authentication factor.
					</li>
				</ul>
			</li>
			<li>
				SMS inherently relies on 3rd party infrastructure to deliver these authentication codes.
				<ul>
					<li>
						There have been many notable cases of attackers using social engineering to gain control
						over a target's phone number.
					</li>
					<li>
						Since cell service providers have ultimate control over your phone number, there's not
						much you can do as an individual to harden your phone number against compromise.
					</li>
				</ul>
			</li>
		</ul>

		<h3 class="drop-shadow-glow">Email</h3>

		<p>
			Email MFA works rather similarly to SMS MFA: the authentication server generates a code, sends
			it to the registered email on your account, and waits for you to enter the code (or perhaps
			click a link) before granting access to your account.
		</p>

		<p>
			Email is generally less flawed than SMS: users have the option to control their own email
			infrastructure if they desire (and at the very least there are more public choices of email
			providers than there are cell service providers). Typically, if you're trying to authenticate
			against a web service, you'll also have access to email, and there's no geographic restriction
			on email: no need for an expensive roaming plan while abroad.
		</p>

		<p>
			I've also seen more clever anti-phishing measures in emails, such as requiring users to click
			a link <em>on the device they're attempting to sign in from</em>. Systems like this may be
			less convenient, but it reduces the risk of users sharing their 6-digit codes with someone
			impersonating a service provider. You typically don't see schemes like this in SMS-based MFA
			because any device with a web browser can access email, but not all devices can access text
			messages.
		</p>

		<p>
			Email does suffer the same problem as SMS when it comes to password reset attacks: nearly all
			web services will allow you to reset your password using a link sent to your email, with
			little extra verification beyond "does this user have access to the associated email account."
			I consider this less of a problem than SMS as there are more security features available for
			email accounts (like strong MFA with WebAuthn) and less possibility of social engineering
			(have you ever tried to contact Google for support?).
		</p>

		<h3>Time-based One Time Password (TOTP)</h3>

		<p>
			TOTP builds on the solutions introduced above by using an open algorithm<sup>0</sup> to generate
			codes for you. Rather than receiving an email with a code for your account, you get a "seed" when
			setting up MFA. This seed, when input into any TOTP app, will generate 6-digit codes based on what
			time it is.
		</p>

		<p>
			TOTP has many advantages: it works entirely offline (your authenticator could be a device
			without internet access entirely), doesn't rely on vulnerable infrastructure, and is portable.
			If you change your phone number or email address, you can't receive MFA codes send to them
			anymore. If you get a new phone or choose to use a new MFA app, you can simply export the
			seeds for your accounts<sup>1</sup> and load them into your new app.
		</p>

		<p>Let's take a closer look at how MFA works.</p>

		<p>
			It all starts with a secret. This is a random value generated by the server. I generated one
			for you in the browser and have saved it in LocalStorage:
		</p>

		<Portal label="base32" class="cursor-cell">
			<SecretDisplayEditor />
		</Portal>

		<p>
			Hmm... that's not what my server sees. These random values are actually usually generated as
			sequences of integers:
		</p>

		<Portal label="uint8" class="cursor-cell">
			{#key secret}
				<SecretUint8Display />
			{/key}
		</Portal>

		<p>
			Unfortunately, converting these numbers to base32 is more involved than converting to hex{#if $secret.length % $secretBytes.length !== 0}
				<!-- don't feel like doing math to prove myself as always correct but there might be some cursed combination where this isn't true -->
				&nbsp;(note that the number of uints, {$secretBytes.length}, is not a multiple of the length
				of the base32 string, {$secret.length}){/if}. A base32 character represents 5 bits of data,
			while each number is an unsigned 8-bit integer. Let's convert these integers to binary to see
			what they represent in base32:
		</p>
		<Portal class="!block cursor-cell" label="uint8 binary">
			{#key secret}
				<SecretBinDisplay />
			{/key}
		</Portal>

		<p>
			Close, but not quite useful yet. 8-bit chunks are useful when working with ints, but less so
			when working with base32. Since each character in base32 represents a 5-bit chunk, let's
			switch from 8-bit to 5-bit.
		</p>
		<Portal class="!block cursor-cell" label="base32/binary">
			{#key secret}
				<SecretCombinedDisplay />
			{/key}
		</Portal>

		<p>
			There aren't many rules about how long or short the secret is, but after sampling a few of my
			MFA-protected accounts, I've seen anything from 10-20 bytes, resulting in 16-32 character
			base32 strings.
		</p>

		<p>
			Now that we have a secret, you can add it to an authenticator app. The QR code includes the
			secret, along with other metadata about the MFA codes.
		</p>

		<p>
			I suppose you'll need an authenticator to test this out. You can use an app you already have
			(Google Authenticator, Authy, etc.), or use the one I built for this page:
		</p>

		<div class="my-6 flex items-center justify-center">
			<Button on:click={() => (showAuthenticator = !showAuthenticator)}
				>{showAuthenticator ? 'Hide' : 'Show'} authenticator</Button
			>
		</div>

		<Portal label="interactive">
			<MfaSeedInitializationDemo bind:mfaInitComplete />
		</Portal>

		<p>
			The registration process really doesn't involve much more than generating the secret described
			above, at least for the server. The reason you have to enter a code from your authenticator is
			to prove that your authenticator is set up correctly - nothing more.
		</p>

		<p>
			The registration QR code uses an <code>otpauth://totp/</code> URI, including data like the secret,
			domain name, friendly name of the website, and your username. All of the supporting data is optional,
			but helps your authenticator display what the code is used for. It can also specify a number of
			digits (default: 6) and duration (default: 30 seconds) for each code, but these properties may
			not be supported by all authenticators so they're usually left as the default.
		</p>

		<p>
			You may have noticed that you can sometimes use codes that are already expired. This is
			expected behavior: since TOTP codes are based on your local system clock, it's normal for your
			clock to be slightly off compared to the server (and it's also annoying to have an exactly
			30-second window to enter the code). Servers compensate by allowing a small window of codes to
			work, rather than just one code. There's not a requirement for the window size, but the RFC
			recommends using a window size of 1, which is what this site is configured to do.
		</p>

		<p>Let's look at this time window more visually:</p>

		<Portal label="visualization">
			<WindowVisualizer />
		</Portal>

		<p>
			As time progresses (every 30 seconds under this configuration), codes progress along the
			lifecycle track. You can use the current valid code <span class="font-mono">{$codes[2]}</span
			>, or you can use the just-expired code <span class="font-mono">{$codes[1]}</span>. You can
			also use the upcoming code
			<span class="font-mono">{$codes[3]}</span> in case your device's clock is running a little fast
			compared to the server.
		</p>

		<p>
			Now that we know how the secret key is generated, let's look at how this is turned into a
			code. As noted above, this all depends on the current time–specifically the unix epoch
			timestamp:
		</p>

		<div class="flex items-center justify-center text-xl font-mono">
			{Math.floor($timestamp / 10)}
		</div>

		<p>
			This timestamp represents the number of seconds elapsed since the beginning of time,
			1970-01-01, in UTC. Since each code we generate is valid for 30 seconds, we can convert this
			into a counter by dividing it by 30 and dropping the decimal:
		</p>

		<div class="flex items-center justify-center text-xl font-mono">
			{Math.floor($timestamp / 300)}
		</div>

		<p>Alright, now we have the inputs we need. The HOTP algorithm is defined as:</p>

		<div class="flex items-center justify-center text-lg font-mono">
			HOTP(K,C) = Truncate(HMAC-SHA-1(K,C))
		</div>

		<p>
			<em>HOTP? I thought we were talking about TOTP!</em>
		</p>
		<p class="-mt-4">
			TOTP is an implementation of HOTP, which stands for "HMAC-based One Time Password." TOTP is
			just a usage of HOTP, using the counter we created above as <code>C</code> and the secret key
			as <code>K</code>.
		</p>

		<div
			class="flex items-center flex-wrap rounded-md border-2 bg-gradient-to-tr dark:border-yellow-600 border-yellow-400 dark:from-orange-900/25 dark:to-yellow-900/25 from-orange-100 to-yellow-100 text-yellow-800 dark:text-yellow-200 p-4 my-4"
		>
			<div class="text-sm w-full mb-2">
				<strong>Heads up!</strong> The examples below update dynamically as your system clock changes,
				which may be distracting. You can freeze the counter if you want the results to stay static.
			</div>
			{#if !$timeStopped}
				<Button variant="danger" on:click={stopTime}>STOP TIME</Button>
			{:else}
				<div class="text-sm w-full mb-2">
					heads up- there may be some unintentional jank on the interactive demos elsewhere on the
					page while time is stopped.
				</div>

				<Button variant="secondary" on:click={() => ($timeStopped = false)}
					>time marches on, unfeeling, into eternity</Button
				>
			{/if}
		</div>

		<p>
			First thing's first, we need to implement <code>HMAC-SHA-1</code>. To do this, we first need
			to define some values:
		</p>

		<Portal label="typescript">
			{#key secret}
				<VarDeclarations />
			{/key}
		</Portal>

		<p>
			<code>ipad</code> and <code>opad</code> are constant values specified in the RFC for HOTP. By
			XORing these values against the actual secretKey (which we do in the following steps), we are
			deriving two separate keys to prevent hash collision attacks. The actual values of these
			variables is mostly irrelevant–the important part is that they're different. More information
			on this in the
			<a
				href="https://cseweb.ucsd.edu/~mihir/papers/kmd5.pdf"
				target="_blank"
				rel="nofollow noopener">security proof</a
			> (pdf warning).
		</p>

		<p>Now we need to pad the key up to our block size <code>HMAC_BYTES</code>:</p>

		<Portal label="typescript">
			{#key secretBytes}
				<PadKey />
			{/key}
		</Portal>

		<p>Next, XOR <code>paddedKey</code> with <code>ipad</code>.</p>

		<Portal label="typescript">
			{#key secretBytes}
				<XorWithIpad />
			{/key}
		</Portal>

		<p>
			Now we append the stream of bytes representing our counter (generated in our definitions step)
			to the result of the XOR step.
		</p>

		<Portal label="typescript">
			{#key secretBytes}
				<AppendCounterStream />
			{/key}
		</Portal>

		<p>Then we take a SHA-1 hash of those bytes.</p>

		<Portal label="typescript">
			{#key secretBytes}
				<HashInner />
			{/key}
		</Portal>

		<p>Going back to HMAC_OPAD for a moment, we need to XOR the key with the OPAD.</p>

		<Portal label="typescript">
			{#key secretBytes}
				<XorWithOpad />
			{/key}
		</Portal>

		<p>Then, append the innerHash to the XOR'd stream.</p>

		<Portal label="typescript">
			{#key secretBytes}
				<AppendHashToOpad />
			{/key}
		</Portal>

		<p>Finally, take the SHA-1 hash of that stream and you have a SHA-1 HMAC.</p>

		<Portal label="typescript">
			{#key secretBytes}
				<FinalHmacHash />
			{/key}
		</Portal>

		<p>
			The HMAC is where most of the computations happen - truncation is really just to convert the
			HMAC into something that's actually possible to quickly type into an authentication form.
			Let's take a look at how the dynamic truncation algorithm is implemented:
		</p>

		<Portal label="typescript">
			{#key secret}
				<Truncation />
			{/key}
		</Portal>

		<p>
			And there it is! We just converted the current time and secret key into a valid MFA code by
			hand! If the code generated isn't the correct number of digits, it gets padded with leading 0s
			to fill the space properly.
		</p>

		<h2>WebAuthn</h2>

		<p>
			WebAuthn (also known as Passkeys) is another form of MFA (or a replacement for passwords,
			depending on implementation), and is more secure than any of the code-based solutions
			discussed here. I won't dwell on this too much since I have <a
				href="../2024-01-24/passwords-suck">another post</a
			> about how this all works already–if you found this one interesting I'd recommend giving it a
			look!
		</p>

		<h2>Closing thoughts</h2>

		<p>
			TOTP has long been one of those things that I vaguely understood the concept of, but never
			really thought to dive into before writing this post. I find reading RFCs for concepts like
			this to be enjoyable because they really show the collaborative nature of the internet: these
			documents are a collaborative effort to develop and are freely available online for anyone to
			read.
		</p>

		<p>
			I definitely learned quite a bit from reading the related RFCs and implementing it myself on
			this page. I definitely enjoyed building the interactive parts of this post–I think there's
			something special about making a page that feels <em>alive</em> in a way.
		</p>

		<MailingListCta />

		<div class="text-sm">
			<p>
				<sup>0</sup> Some SMS/Email MFA implementations actually use this algorithm under the hood–if
				you configure your Amazon account for TOTP and SMS, the code texted to you will be the same as
				the one appearing in your authenticator.
			</p>
			<p>
				<sup>1</sup> Not all TOTP apps support this feature, and it's arguable that this decreases the
				security since an attacker could export your data and compromise all of your accounts. I disagree,
				and think this is a reasonable tradeoff between useability and security. Apps should check that
				the user attempting to do an export is the device owner (using biometrics, a pin, or a custom
				password for the app) first, but beyond that the user should be allowed to control their data
				however they like.
			</p>
			<p>
				Authy does not allow users to export MFA secrets, but does support multi-device e2ee sync.
				Google Authenticator allows transferring between instances of the app with a QR code (but
				you can decode this yourself to get the raw secret strings). 1Password allows you to view
				your TOTP secrets directly in the app.
			</p>
		</div>
	</article>
</main>

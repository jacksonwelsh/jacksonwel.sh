<script lang="ts">
	import MailingListCta from '$lib/mailing-list-cta.svelte';
	import MfaSeedInitializationDemo from './mfa-seed-initialization-demo.svelte';
	import { codes, initializeSecret, secret, secretBytes, timestamp } from './store';
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
</script>

<svelte:head>
	<title>How does MFA work? | Jackson Welsh</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content="How does MFA work?" />
	<meta property="og:url" content="https://jacksonwel.sh/blog/2024-01-31/how-does-mfa-work" />
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
		/how-does-mfa-work
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

		<p>[things about how sms sucks here]</p>

		<h3 class="drop-shadow-glow">Email</h3>

		<p>[details about email]</p>

		<h3>Time-based One Time Password (TOTP)</h3>

		<p>
			TOTP builds on the solutions introduced above by using an open algorithm to generate codes for
			you. Rather than receiving an email with a code for your account, you get a "seed" when
			setting up MFA. This seed, when input into any TOTP app, will generate 6-digit codes based on
			what time it is.
		</p>

		<p>
			TOTP has many advantages: it works entirely offline (your authenticator could be a device
			without internet access entirely), doesn't rely on vulnerable infrastructure, and is portable.
			If you change your phone number or email address, you can't receive MFA codes anymore. If you
			get a new phone or choose to use a new MFA app, you can simply export the seeds for your
			accounts[0] and load them into your new app.
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
			{#key $secret}
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
			{#key $secret}
				<SecretBinDisplay />
			{/key}
		</Portal>

		<p>
			Close, but not quite useful yet. 8-bit chunks are useful when working with ints, but less so
			when working with base32. Since each character in base32 represents a 5-bit chunk, let's
			switch from 8-bit to 5-bit.
		</p>
		<Portal class="!block cursor-cell" label="base32/binary">
			{#key $secret}
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

		<p>
			First thing's first, we need to implement <code>HMAC-SHA-1</code>. To do this, we first need
			to define some values:
		</p>

		<Portal label="typescript">
			<VarDeclarations />
		</Portal>

		<p>Now we need to pad the key up to our block size <code>B</code>:</p>

		<Portal label="typescript">
			<PadKey />
		</Portal>

		<p>Next, XOR <code>paddedKey</code> with <code>ipad</code>.</p>

		<Portal label="typescript">
			<XorWithIpad />
		</Portal>

		<p>
			Now we append the stream of bytes representing our counter (generated in our definitions step)
			to the result of the XOR step.
		</p>

		<Portal label="typescript">
			<AppendCounterStream />
		</Portal>

		<p>Then we take a SHA-1 hash of those bytes.</p>

		<Portal label="typescript">
			<HashInner />
		</Portal>

		<p>Going back to HMAC_OPAD for a moment, we need to XOR the key with the OPAD.</p>

		<Portal label="typescript">
			<XorWithOpad />
		</Portal>

		<p>Then, append the innerHash to the XOR'd stream.</p>

		<Portal label="typescript">
			<AppendHashToOpad />
		</Portal>

		<p>Finally, take the SHA-1 hash of that stream and you have a SHA-1 HMAC.</p>

		<Portal label="typescript">
			<FinalHmacHash />
		</Portal>

		<p>
			The HMAC is where most of the computations happen - truncation is really just to convert the
			HMAC into something that's actually possible to quickly type into an authentication form.
			Let's take a look at how the dynamic truncation algorithm is implemented:
		</p>

		<Portal label="typescript">
			<Truncation />
		</Portal>

		<p>
			And there it is! We just converted the current time and secret key into a valid MFA code by
			hand! If the code generated isn't the correct number of digits, it gets padded with leading 0s
			to fill the space properly.
		</p>

		<MailingListCta />

		<sup>1</sup> Footnote here.
	</article>
</main>

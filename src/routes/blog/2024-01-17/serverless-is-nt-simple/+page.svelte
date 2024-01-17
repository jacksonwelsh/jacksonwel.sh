<svelte:head>
	<title>Serverless is(n't) simple | Jackson Welsh</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content="Serverless is(n't) simple" />
	<meta property="og:url" content="https://jacksonwel.sh/blog/2024-01-17/serverless-is-nt-simple" />
	<meta property="og:site_name" content="Jackson Welsh" />
	<meta
		property="og:description"
		content="Lessons learned from building serverless applications on AWS."
	/>
	<meta property="og:article:published_time" content="2024-01-17" />
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
		/serverless-is-nt-simple
	</div>
</div>
<main class="mx-auto my-16 p-2 md:p-0">
	<article class="mx-auto prose dark:prose-invert">
		<h1 class="font-mono mb-2">Serverless is(n't) simple</h1>
		<div class="text-lg text-gray-600 dark:text-gray-400">It depends on how you approach it.</div>
		<time class="text-sm text-gray-600 dark:text-gray-400" datetime="2024-01-17">17 Jan 2024</time>

		<p>
			At my last job, I built several serverless applications for clients on AWS. My development
			process towards the end looked <em>drastically</em> different from how I started, so I collected
			some of my lessons learned into this post.
		</p>

		<div
			class="rounded-md dark:text-blue-100 text-blue-950 dark:bg-blue-900/25 bg-blue-100/25 border border-blue-600 my-8 p-5"
		>
			<p class="md:col-span-5 my-0">
				This post focuses primarily on the experience of building serverless applications in AWS
				since that's the cloud I've worked in the most. The lessons learned should be portable to
				other public clouds, but the tools used will likely be different.
			</p>
		</div>

		<h2>IaC all the things</h2>

		<p>
			Infrastructure as Code (IaC) is excellent for keeping your cloud environment under control.
			You can quickly see exactly what resources you have provisioned, along with all of their
			configurations. It's inherently portable to other applications too, needing only some changes
			to values (which should be extracted out to configuration variables).
		</p>
		<p>
			CDK (Cloud Development Kit) is a great option for writing IaC that allows you to work in a
			programming language you're already familiar with like TypeScript or Java rather than working
			in a new language like Terraform's HCL or dealing with YAML/JSON templating in CloudFormation.
		</p>
		<p>
			Terraform CDK is my preferred method of building infrastructure at the moment, but I don't
			care for Hashicorp's new "per resource per hour" billing scheme for the cloud state
			tracking/runner system offered. It can run for free in its open-source local mode, so if you
			find a good way to share state across engineers, it could work quite well.
		</p>
		<p>
			AWS CDK is also an option, albeit a weaker one. Since it's a wrapper for CloudFormation at its
			core, you have to deal with CloudFormation's issues (rollbacks that can't be canceled but also
			take ages, poor drift detection).
		</p>

		<h2>Automate early</h2>
		<p>
			Setting up one serverless site isn't easy. On AWS, you need to figure out your configurations
			for S3, CloudFront (CDN), Cognito (auth), IAM, Lambda, Route53 (DNS), and likely at least one
			or two other services.
		</p>
		<p>
			Automating serverless website creation, however, isn't much more complicated than making one
			serverless website. If you're planning on making several websites that use a similar stack,
			this is a great way to abstract away infrastructure and focus on developing your websites
			rather than managing servers.
		</p>
		<p>
			If you used IaC, you can parameterize out resource names to accept variables at deployment
			time, along with other important values like domain names. If variables don't quite work (text
			in web templates, for example), you can use a bootstrapping system like Yeoman to interpolate
			values where necessary.
		</p>
		<p>
			When I started making serverless websites, I manually copied over IaC and tweaked values as
			needed. After getting the hang of it (and remembering some gotchas like how to configure
			Google SSO), it would take ~4 hours hours to spin up a new website. Not terrible, not great.
			After adopting Yeoman and properly templating the code, it took as little as 10 minutes to
			spin up a new website that:
		</p>
		<ul>
			<li><strong>Is hosted on our own domain</strong> with SSL.</li>
			<li>
				<strong>Requires authentication to access internal information,</strong> using the company's
				SSO or email/password with email verification<sup>1</sup>.
			</li>
			<li>
				<strong>Includes a basic page structure</strong> with authentication pages, public pages, and
				auth-required pages.
			</li>
			<li>
				<strong>Is logically isolated</strong> from other properties we host, in its own AWS account,
				simplifying permissions management and compliance.
			</li>
			<li>
				<strong>Costs &lt; $5/mo to run</strong> for low-volume websites. I unfortunately don't have
				cost numbers for high volume serverless websites, but this cost comes from the single Route53
				hosted zone for the website, along with the cost of S3 storage. Cost was typically &lt; $1/mo
				for the first year because of the free tier.
			</li>
		</ul>
		<p>
			If this level of automation doesn't seem well-suited to your usecase, it might not be worth it
			to pursue a serverless website. While one of the major benefits of serverless is its low cost
			and maintenance requirements, the cost of development can rapidly outpace your savings versus
			the cost of a small VPS with a comparatively simple configuration process.
		</p>

		<h2>Isolate your environments</h2>
		<p>
			One of the benefits of such a low-cost website is that it's similarly cheap to give each site
			its own infrastructure. There's no need for a shared database when you can run a couple
			DynamoDB tables for cheap/free in each account. This gives nice security benefits, including
			significantly easier management of IAM permissions so only relevant people can access the
			project's resources.
		</p>
		<p>
			These low costs also make it less expensive to have more environments and less risky to make
			infrastructure changes. If you make a bad infrastructure change, you can catch it in beta
			before it affects any end-users.
		</p>
		<p>
			This results in more resources, but your IaC should help keep it largely under control. Invest
			in pipelines to automate your deployment: this reduces risk from human error while reducing
			the time it takes to ship your code. Even if you're manually triggering deploys to production,
			the build system should handle the act of getting the code from your source repository into
			your cloud environment.
		</p>

		<h2>Is serverless worth it?</h2>
		<p>
			Planning to move cloud providers? Stay far away from serverless, at least until you get
			settled in on your new cloud. All the time you save at scale disappears if you have to migrate
			all this to another cloud. But most people probably won't need to do that (or are ok with
			keeping some services around in their old cloud).
		</p>
		<p>
			If you're just planning to make the one site, it's probably not worth it to use serverless.
			You'll probably find yourself working around the limitations of the paradigm (such as the
			maximum response size from AWS Lambda), and at small scale the benefits of serverless are less
			pronounced.
		</p>
		<p>
			I think serverless has a lot of benefits if you're running many distinct websites though. It's
			a system that reduces cost, encourages adopting best-practices like deployment automation, and
			simplifies maintaining your application.
		</p>

		<hr />

		<h2>Think this was interesting?</h2>
		<p>
			I have a mailing list that I'll send new blog posts out to. Drop your email in if you're
			interested.
		</p>
		<form
			action="https://buttondown.email/api/emails/embed-subscribe/jacksonwelsh"
			method="post"
			target="popupwindow"
			on:submit={() => window.open('https://buttondown.email/jacksonwelsh', 'popupwindow')}
			class="flex flex-col"
		>
			<div class="w-full flex flex-col">
				<label for="bd-email" class="w-full">Enter your email</label>
				<input
					type="email"
					name="email"
					id="bd-email"
					class="bg-gray-900 rounded-md border-gray-700 border py-1 px-4 focus:outline-none"
				/>
				<input
					type="submit"
					value="Subscribe"
					class="my-2 focus:ring-blue-600 focus:ring-2 rounded-md px-4 py-1 border border-blue-800 bg-blue-900/25 hover:bg-blue-900/50 hover:cursor-pointer"
				/>
			</div>
			<p>
				<a
					href="https://buttondown.email/refer/jacksonwelsh"
					target="_blank"
					class="text-gray-400 font-normal">Powered by Buttondown.</a
				>
			</p>
		</form>

		<hr />
		<sup>1</sup> Email verification doesn't technically work after 10 minutes, but the foundation is
		there. Because I had each site isolated to its own AWS account, each account needed to get the SES
		(Simple Email Service) identity approved for production usage by customer support. This process typically
		takes ~48 hours and 2 messages to support, but is only necessary when the site's ready for external
		users.
	</article>
</main>

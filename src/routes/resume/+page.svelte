<script lang="ts">
	import Divider from '$lib/divider.svelte';
	import LogoCloud from '$lib/logocloud.svelte';
	import ResumeHeader from '$lib/resumeHeader.svelte';
	import LogoGithub from 'carbon-icons-svelte/lib/LogoGithub.svelte';
	import LogoLinkedin from 'carbon-icons-svelte/lib/LogoLinkedin.svelte';
	import Launch from 'carbon-icons-svelte/lib/Launch.svelte';

	type JobDates =
		| {
				start: string;
				end?: string;
		  }
		| {
				start: string[];
				end: string[];
		  };

	type Job = {
		title: string;
		org: string;
		url?: string;
		responsibilities: string[];
	} & JobDates;

	const socials = [
		{
			handle: '@jacksonwelsh',
			logo: LogoGithub,
			href: '//github.com/jacksonwelsh'
		},
		{
			handle: '/in/jacksonwelsh',
			logo: LogoLinkedin,
			href: '//linkedin.com/in/jacksonwelsh'
		}
	];

	const positions: Job[] = [
		{
			title: 'Software Engineer',
			org: 'Amazon Web Services',
			start: 'Aug 2023',
			responsibilities: [
				"Own the control plane that powers AWS's core networking primitives.",
				'Designed and implemented control plane for Custom Exception Path, a dataplane optimization that reduces network hops. Enabled vendors to cut EC2 costs by 60% and p99 latency by 70%.',
				'Built internal management APIs enabling instant API reconfiguration during cell builds, down from weeks of sequential deployments.',
				'Member of team on-call rotation, resolving operational issues to prevent customer impact.'
			]
		},
		{
			title: 'Lead Solutions Engineer',
			org: 'New Light Technologies',
			start: 'Sep 2022',
			end: 'Jun 2023',
			responsibilities: [
				'Developed an AI-based web scraper that uses natural language prompts to extract precise data from heterogenous websites using GPT-4.',
				'Built an internal components library and website creation workflow to bring new site creation time from 4 hours down to 10 minutes.',
				'Streamlined management of over 50 AWS accounts by enforcing consistent organization-level policies.',
				'Enhanced security by switching from manually-rotated static credentials to dynamic credentials that rotate as often as every 15 minutes.'
			]
		},
		{
			title: 'DevOps Engineer',
			org: 'New Light Technologies',
			start: ['Sep 2020'],
			end: ['Aug 2022'],
			responsibilities: [
				'Developed a new web mapping application to replace a legacy ArcGIS plugin for address management within local governments.',
				'Designed and implemented a novel spatial authentication system for the US Army Corps of Engineers, integrating with Login.gov via OpenID Connect (OIDC) and supporting PIV-based login.'
			]
		}
	];

	const education = [
		{
			institution: 'University of North Texas',
			degree: 'B.S. Computer Science',
			end: 'May 2023',
			gpa: '4.0'
		}
	];

	const skills = [
		'Java',
		'Python',
		'JavaScript/TypeScript',
		'Terraform/CDK',
		'NoSQL',
		'Distributed systems',
		'Rust',
		'System design',
		'Software-defined networking'
	];

	const volunteering: Job[] = [
		{
			org: 'Destination Imagination',
			url: '//destinationimagination.org',
			title: 'Challenge Master, Appraiser & Tournament Volunteer',
			start: 'Fall 2016',
			responsibilities: [
				'Volunteer at regional DI tournaments and team training events.',
				'Appraiser/Challenge Master at Instant Challenge, organizing the tournament and scoring teams on creative ability and teamwork.',
				'Teaching teams of elementary and middle school students on how to communicate with each other and solve problems together.'
			]
		}
	];
</script>

<svelte:head>
	<title>Resume | Jackson Welsh</title>
</svelte:head>

<article class="container mx-auto sm:px-4 lg:max-w-5xl">
	<div class="text-left mt-3 text-slate-400 print:hidden flex">
		<a href="/" class="text-blue-400 hover:underline">~</a>
		/resume
	</div>
	<main class="container mx-auto px-2 md:px-0 print:text-sm">
		<h1 class="text-6xl font-mono-bold mt-6 print:mt-0 mb-2 font-mono text-left">Jackson Welsh</h1>
		<h2
			class="font-mono-light font-mono text-teal-800 dark:text-teal-200 text-left my-2 flex gap-2"
		>
			<a class="hidden print:flex" href="//jacksonwel.sh">//jacksonwel.sh</a>
			<Divider class="hidden print:flex" />
			hello@jacksonwel.sh
			<Divider /> Seattle, WA
		</h2>

		<!-- display the socials all pretty-like -->
		<h2 class="font-mono-thin font-mono text-teal-800 dark:text-teal-200 justify-start flex my-2">
			{#each socials as { handle, logo, href }, idx}
				{@const SvelteComponent = logo}
				<a class="flex items-center underline" {href} target="_blank"
					><SvelteComponent class="mr-2" size={20} />{handle}</a
				>{#if idx !== socials.length - 1}<Divider class="mx-2" />{/if}
			{/each}
		</h2>

		<section>
			<ResumeHeader>Profile</ResumeHeader>
			<p>
				Software engineer specializing in distributed systems and control plane design. Currently
				building the foundational networking layer that powers AWS services like PrivateLink, NAT
				Gateway, and Transit Gateway. Experienced in designing APIs, improving operational tooling,
				and operating high-availability systems at scale.
			</p>
		</section>

		<section>
			<ResumeHeader>Experience</ResumeHeader>
			{#each positions as position}
				<div class="flex flex-wrap mb-2">
					<strong class:underline={position.url} class="print:no-underline font-medium"
						><a href={position.url} class="flex items-center"
							>{position.title}{#if position.url}<Launch
									size={16}
									class="underline ml-2 print:hidden"
								/>{/if}</a
						></strong
					><Divider class="mx-2" /><span class="font-light">{position.org}</span><Divider
						class="mx-2"
					/>
					{#if Array.isArray(position.start)}
						{#each position.start as startDate, idx}
							{startDate} – {position.end?.[idx] ?? 'Present'}{idx < position.start.length - 1
								? ', '
								: ''}
						{/each}
					{:else}
						{position.start} – {position.end ?? 'Present'}
					{/if}
					<ul class="w-full list-dash list-inside ml-6 -indent-3">
						{#each position.responsibilities as responsibility}<li>
								{@html responsibility}
							</li>{/each}
					</ul>
				</div>
			{/each}
		</section>

		<section>
			<ResumeHeader>Education</ResumeHeader>
			{#each education as school}
				<div class="flex flex-wrap mb-2">
					<strong class="font-medium">{school.institution}</strong><Divider class="mx-2" />
					<span class="font-light">{school.degree}</span>
					<!-- <Divider class="mx-2" />
					<span class="font-light">{school.gpa} GPA</span> -->
					<!-- <Divider class="mx-2" />
					{school.end ?? 'Present'} -->
				</div>
			{/each}
		</section>

		<!--
		<section class="">
			<ResumeHeader>Certifications</ResumeHeader>
			<div class="flex flex-wrap print:hidden">
				<!-- Credly AWS CDA Badge --
				<div class="">
					<a
						href="https://www.credly.com/badges/d19cbb75-30f7-449e-8029-36bb73058eff/embedded"
						target="_blank"
					>
						<img
							class="h-44 w-44 mt-4 print:h-20 print:my-0"
							src="https://images.credly.com/size/680x680/images/b9feab85-1a43-4f6c-99a5-631b88d5461b/image.png"
							alt="AWS Certified Developer Associate - Credly badge"
						/>
					</a>
				</div>
				<!-- End Credly badge --
				<!-- Credly AWS CDA Badge --
				<div class="">
					<a
						href="https://www.credly.com/badges/73898499-b625-4ef0-bec7-3b8bba9ee93d/embedded"
						target="_blank"
					>
						<img
							class="h-44 w-44 mt-4 print:h-20 print:my-0"
							src="https://images.credly.com/size/680x680/images/53acdae5-d69f-4dda-b650-d02ed7a50dd7/image.png"
							alt="AWS Certified Security Specialty - Credly badge"
						/>
					</a>
				</div>
				<!-- End Credly badge --
			</div>
			<div class="hidden print:block">
				<ul class="w-full list-dash ml-6">
					<li>AWS Certified Security - Specialty (exp. 09/25)</li>
					<li>AWS Certified Developer - Associate (exp. 07/25)</li>
				</ul>
			</div>
		</section>
-->

		<ResumeHeader>Skills</ResumeHeader>
		<!-- <div class="w-full xl:w-3/4 block print:hidden">
			<LogoCloud />
		</div> -->
		<div class="grid-cols-3 print:text-sm w-5/6 grid">
			{#each skills as skill}
				<span>- {skill}</span>
			{/each}
		</div>

		<section class="print:hidden">
			<ResumeHeader>Volunteering</ResumeHeader>
			{#each volunteering as position}
				<div class="flex flex-wrap my-3">
					<strong class="font-medium">{position.title}</strong><Divider class="mx-2" />
					<span class="font-light mx-1.5" class:underline={position.url}
						><a href={position.url} class="flex items-center"
							>{position.org}{#if position.url}<Launch size={16} class="underline ml-2" />{/if}</a
						></span
					><Divider class="mx-2" />{position.start} – {position.end ?? 'Present'}
					<ul class="w-full list-dash list-inside ml-6 -indent-3">
						{#each position.responsibilities as responsibility}<li>
								{@html responsibility}
							</li>{/each}
					</ul>
				</div>
			{/each}
		</section>
	</main>
</article>

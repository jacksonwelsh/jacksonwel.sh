<script lang="ts">
	import Divider from '$lib/divider.svelte';
	import LogoCloud from '$lib/logocloud.svelte';
	import LogoGithub16 from 'carbon-icons-svelte/lib/LogoGithub16';
	import LogoLinkedin16 from 'carbon-icons-svelte/lib/LogoLinkedin16';
	import Launch16 from 'carbon-icons-svelte/lib/Launch16';
	import ChevronRight16 from 'carbon-icons-svelte/lib/ChevronRight16';

	// no dynamic content, so go ahead and make this static.
	export const prerender = true;

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

	const addr =
		'Ly9qYWNrc29ud2VsLnNoIDxzcGFuIGNsYXNzPSJ0ZXh0LXNsYXRlLTUwMCI+JiN4MjAyMjwvc3Bhbj4gbWVAamFja3NvbndlbC5zaA==';
	let emailToShow = 'me@thisdomain';

	const socials = [
		{
			handle: '@jacksonwelsh',
			logo: LogoGithub16,
			href: '//github.com/jacksonwelsh'
		},
		{
			handle: '/in/jacksonwelsh',
			logo: LogoLinkedin16,
			href: '//linkedin.com/in/jacksonwelsh'
		}
	];

	const positions: Job[] = [
		{
			title: 'Software Development Engineer Intern',
			org: 'Amazon Web Services',
			start: 'May 2022',
			responsibilities: [
				'Intern on the EC2 Networking team.',
				'Developer of a tool to detect anomalies in internal network configurations.'
			]
		},
		{
			title: 'DevOps Engineer',
			url: 'https://newlighttechnologies.com/staff/jackson-welsh/',
			org: 'New Light Technologies',
			start: ['Sep 2020'],
			end: ['May 2022'],
			responsibilities: [
				'Lead developer of the new <a href="//geo4.dev" target="_blank" class="underline font-semibold">Geo4.Dev</a> website in collaboration with partner organizations including The World Bank, CEGA, and others.',
				'Deploying serverless applications to Amazon Web Services using Docker and AWS Elastic Container Service.',
				'Developer for a new web mapping application to replace a legacy ArcGIS plugin for address management within local governments.',
				'Developer of a survey platform for the US Army Corps of Engineers, written in React with TypeScript.'
			]
		},
		{
			title: 'Independent Tutor',
			org: 'Wyzant',
			start: 'Jan 2020',
			end: 'Feb 2021',
			responsibilities: [
				'Online tutor using the Wyzant platform.',
				'Taught Python, SQL, and Java to students ranging from middle school to university levels.',
				'Ran every aspect of the tutoring business, from finding students to preparing curriculum.'
			]
		}
	];

	const education = [
		{
			institution: 'University of North Texas',
			degree: 'B.S. Computer Science',
			start: 'August 2020',
			end: 'May 2023',
			details: [
				"4.0 GPA – recognized on the Dean's List and President's List",
				'Member of the Honors College'
			]
		}
	];

	const skills = [
		'Python',
		'JavaScript/TypeScript',
		'PostgreSQL',
		'Java',
		'Vue.js',
		'Cloud computing',
		'C++',
		'React',
		'Basic system administration'
	];

	const volunteering: Job[] = [
		{
			org: 'Destination Imagination',
			url: '//destinationimagination.org',
			title: 'Appraiser & Tournament Volunteer',
			start: 'Fall 2016',
			responsibilities: [
				'Volunteer at regional DI tournaments and team training events',
				'Appraiser at Instant Challenge, scoring teams on creative ability and teamwork',
				'Teaching teams of elementary and middle school students on how to communicate with each other and solve problems together'
			]
		}
	];

	const updateEmail = () => (emailToShow = atob(addr));
</script>

<svelte:window on:beforeprint={updateEmail} />

<div class="mx-auto text-center mt-3 text-slate-400 print:hidden flex items-center justify-center">
	<a href="/">home</a>
	<ChevronRight16 /> resume
</div>
<main class="container mx-auto px-2 md:px-0 print:text-sm">
	<h1 class="text-6xl font-bold mt-6 mb-2 font-mono text-center">Jackson Welsh</h1>
	<h2 class="font-light font-mono text-teal-800 dark:text-teal-100 text-center my-2">
		{@html emailToShow}
		<Divider /> Seattle, WA
	</h2>

	<!-- display the socials all pretty-like -->
	<h2 class="font-light font-mono text-teal-800 dark:text-teal-100 justify-center flex my-2">
		{#each socials as { handle, logo, href }, idx}
			<a class="flex items-center underline" {href} target="_blank"
				><svelte:component this={logo} class="mr-2" />{handle}</a
			>{#if idx !== socials.length - 1}&nbsp;<Divider />&nbsp;{/if}
		{/each}
	</h2>

	<h2 class="font-bold text-teal-800 dark:text-teal-300 font-mono text-xl mt-6 mb-3">Profile</h2>
	<p>
		Jackson Welsh is a cloud-native software engineer and Eagle Scout with excellent written and
		verbal communications specializing in solution engineering to meet and exceed customer
		requirements. Jackson's primary focus is in web development and is proficient in many modern
		technologies such as Vue.js and React. Jackson has experience in both new product development
		and maintenance of legacy applications.
	</p>

	<h2 class="font-bold text-teal-800 dark:text-teal-300 font-mono text-xl mt-6 mb-3">Experience</h2>
	{#each positions as position}
		<div class="flex flex-wrap my-3">
			<strong class:underline={position.url}
				><a href={position.url} class="flex items-center"
					>{position.title}{#if position.url}<Launch16 class="underline ml-2" />{/if}</a
				></strong
			>&nbsp;• <span class="font-light">&nbsp;{position.org}&nbsp;</span> •
			{#if Array.isArray(position.start)}
				{#each position.start as startDate, idx}
					{startDate} – {position.end[idx] ?? 'Present'}{idx < position.start.length - 1
						? ', '
						: ''}
				{/each}
			{:else}
				{position.start} – {position.end ?? 'Present'}
			{/if}
			<ul class="w-full list-dash list-inside ml-6 -indent-3">
				{#each position.responsibilities as responsibility}<li>{@html responsibility}</li>{/each}
			</ul>
		</div>
	{/each}

	<h2 class="font-bold text-teal-800 dark:text-teal-300 font-mono text-xl mt-6 mb-3">Skills</h2>
	<div class="w-full xl:w-3/4 block print:hidden">
		<LogoCloud />
	</div>
	<div class="grid-cols-3 text-sm w-5/6 hidden print:grid">
		{#each skills as skill}
			<span>- {skill}</span>
		{/each}
	</div>

	<h2 class="font-bold text-teal-800 dark:text-teal-300 font-mono text-xl mt-6 mb-3">
		Volunteering
	</h2>
	{#each volunteering as position}
		<div class="flex flex-wrap my-3">
			<strong>{position.title}</strong>&nbsp;•
			<span class="font-light mx-1.5" class:underline={position.url}
				><a href={position.url} class="flex items-center"
					>{position.org}{#if position.url}<Launch16 class="underline ml-2" />{/if}</a
				></span
			>
			• {position.start} – {position.end ?? 'Present'}
			<ul class="w-full list-dash list-inside ml-6 -indent-3">
				{#each position.responsibilities as responsibility}<li>{@html responsibility}</li>{/each}
			</ul>
		</div>
	{/each}
</main>

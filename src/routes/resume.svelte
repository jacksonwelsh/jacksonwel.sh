<script>
	import Divider from '$lib/divider.svelte';
	import LogoGithub16 from 'carbon-icons-svelte/lib/LogoGithub16';
	import LogoLinkedin16 from 'carbon-icons-svelte/lib/LogoLinkedin16';
	import Launch16 from 'carbon-icons-svelte/lib/Launch16';
	import ChevronRight16 from 'carbon-icons-svelte/lib/ChevronRight16';

	// no dynamic content, so go ahead and make this static.
	export const prerender = true;

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

	const positions = [
		{
			title: 'DevOps Engineer',
			url: 'https://newlighttechnologies.com/staff/jackson-welsh/',
			org: 'New Light Technologies',
			start: 'Sep 2020',
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

	const volunteering = [
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
</script>

<div class="mx-auto text-center mt-3 text-slate-400 print:hidden flex items-center justify-center">
	<a href="/">home</a>
	<ChevronRight16 /> resume
</div>
<main class="container mx-auto px-2 md:px-0">
	<h1 class="text-6xl font-bold mt-6 mb-2 font-mono text-center">Jackson Welsh</h1>
	<h2 class="font-light font-mono text-teal-800 dark:text-teal-100 text-center my-2">
		me@thisdomain <Divider /> Denton, TX
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
			>&nbsp;• <span class="font-light">&nbsp;{position.org}&nbsp;</span> • {position.start} – {position.end ??
				'Present'}
			<ul class="w-full list-dash list-inside ml-6 -indent-3">
				{#each position.responsibilities as responsibility}<li>{@html responsibility}</li>{/each}
			</ul>
		</div>
	{/each}
</main>

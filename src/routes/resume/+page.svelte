<script lang="ts">
	import Divider from '$lib/divider.svelte';
	import LogoCloud from '$lib/logocloud.svelte';
	import ResumeHeader from '$lib/resumeHeader.svelte';
	import LogoGithub16 from 'carbon-icons-svelte/lib/LogoGithub16';
	import LogoLinkedin16 from 'carbon-icons-svelte/lib/LogoLinkedin16';
	import Launch16 from 'carbon-icons-svelte/lib/Launch16';
	import ChevronRight16 from 'carbon-icons-svelte/lib/ChevronRight16';

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
			title: 'Lead Solutions Engineer',
			url: 'https://newlighttechnologies.com/staff/jackson-welsh/',
			org: 'New Light Technologies',
			start: 'Sep 2022',
			responsibilities: [
				'Improving internal processes and unblocking other engineers.',
				'Supporting various client projects.'
			]
		},
		{
			title: 'DevOps Engineer',
			url: 'https://newlighttechnologies.com/staff/jackson-welsh/',
			org: 'New Light Technologies',
			start: ['Sep 2020'],
			end: ['Aug 2022'],
			responsibilities: [
				'Lead developer of the new <a href="//geo4.dev" target="_blank" class="underline font-semibold">Geo4.Dev</a> website in collaboration with partner organizations including The World Bank, CEGA, and others.',
				'Deployed serverless applications to Amazon Web Services using Docker and AWS Elastic Container Service.',
				'Developed a new web mapping application to replace a legacy ArcGIS plugin for address management within local governments.',
				'Developed a survey platform for the US Army Corps of Engineers, written in React with TypeScript.'
			]
		},
		{
			title: 'Software Development Engineer Intern',
			org: 'Amazon Web Services',
			start: 'May 2022',
			end: 'Aug 2022',
			responsibilities: [
				'Intern on the EC2 Networking team developing a programmable layer for packet processing.',
				'Developed a tool to detect anomalies in internal network configurations.'
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
			details: ['4.0 GPA – graduated <em>summa cum laude</em>']
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
		'Serverless'
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

<article class="container mx-auto sm:px-4 lg:max-w-5xl">
	<div
		class="mx-auto text-center mt-3 text-slate-400 print:hidden flex items-center justify-center"
	>
		<a href="/">home</a>
		<ChevronRight16 /> resume
	</div>
	<main class="container mx-auto px-2 md:px-0 print:text-sm">
		<h1 class="text-6xl font-bold mt-6 print:mt-0 mb-2 font-mono text-center">Jackson Welsh</h1>
		<h2 class="font-light font-mono text-teal-800 dark:text-teal-100 text-center my-2">
			{@html emailToShow}
			<Divider /> Denton, TX
		</h2>

		<!-- display the socials all pretty-like -->
		<h2 class="font-light font-mono text-teal-800 dark:text-teal-100 justify-center flex my-2">
			{#each socials as { handle, logo, href }, idx}
				<a class="flex items-center underline" {href} target="_blank"
					><svelte:component this={logo} class="mr-2" />{handle}</a
				>{#if idx !== socials.length - 1}<Divider />{/if}
			{/each}
		</h2>

		<section>
			<ResumeHeader>Profile</ResumeHeader>
			<p>
				Jackson Welsh is a cloud-native software engineer and Eagle Scout with excellent written and
				verbal communications specializing in solution engineering to meet and exceed customer
				requirements. Jackson's primary focus is in web development and is proficient in many modern
				technologies such as Vue.js and React. Jackson has experience in both new product
				development and maintenance of legacy applications.
			</p>
		</section>

		<section>
			<ResumeHeader>Experience</ResumeHeader>
			{#each positions as position}
				<div class="flex flex-wrap mb-2">
					<strong class:underline={position.url} class="print:no-underline"
						><a href={position.url} class="flex items-center"
							>{position.title}{#if position.url}<Launch16
									class="underline ml-2 print:hidden"
								/>{/if}</a
						></strong
					><Divider /><span class="font-light">{position.org}</span><Divider />
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
					<strong>{school.institution}</strong><Divider />
					<span class="font-light">{school.degree}</span>
					<Divider />
					{#if Array.isArray(school.start)}
						{#each school.start as startDate, idx}
							{startDate} – {school.end[idx] ?? 'Present'}{idx < school.start.length - 1
								? ', '
								: ''}
						{/each}
					{:else}
						{school.start} – {school.end ?? 'Present'}
					{/if}
					<ul class="w-full list-dash list-inside ml-6 -indent-3">
						{#each school.details as detail}<li>{@html detail}</li>{/each}
					</ul>
				</div>
			{/each}
		</section>

		<section>
			<ResumeHeader>Certifications</ResumeHeader>
			<div class="flex flex-wrap print:hidden">
				<!-- Credly AWS CLF Badge -->
				<div class="">
					<a
						href="https://www.credly.com/badges/06bc4a57-47ca-4962-b51f-daccd4583258/embedded"
						target="_blank"
					>
						<img
							class="h-44 w-44 mt-4 print:h-20 print:my-0"
							src="https://images.credly.com/size/680x680/images/00634f82-b07f-4bbd-a6bb-53de397fc3a6/image.png"
							alt="AWS Certified Cloud Practitioner - Credly badge"
						/>
					</a>
				</div>
				<!-- End Credly badge -->
				<!-- Credly AWS CDA Badge -->
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
				<!-- End Credly badge -->
				<!-- Credly AWS CDA Badge -->
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
				<!-- End Credly badge -->
			</div>
			<div class="hidden print:block">
				<ul class="w-full list-dash ml-6">
					<li>AWS Certified Security - Specialty (exp. 09/25)</li>
					<li>AWS Certified Developer - Associate (exp. 07/25)</li>
				</ul>
			</div>
		</section>

		<ResumeHeader>Skills</ResumeHeader>
		<div class="w-full xl:w-3/4 block print:hidden">
			<LogoCloud />
		</div>
		<div class="grid-cols-3 text-sm w-5/6 hidden print:grid">
			{#each skills as skill}
				<span>- {skill}</span>
			{/each}
		</div>

		<section class="print:hidden">
			<ResumeHeader>Volunteering</ResumeHeader>
			{#each volunteering as position}
				<div class="flex flex-wrap my-3">
					<strong>{position.title}</strong><Divider />
					<span class="font-light mx-1.5" class:underline={position.url}
						><a href={position.url} class="flex items-center"
							>{position.org}{#if position.url}<Launch16 class="underline ml-2" />{/if}</a
						></span
					><Divider />{position.start} – {position.end ?? 'Present'}
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

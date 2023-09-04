import yargs from 'yargs'
import { spawn } from './spawnWrapper'
import { Readable } from 'stream'
import { hideBin } from 'yargs/helpers'
import axios from 'axios'
import open from 'open'

export async function fetchDoc(packageName: string): Promise<string | void> {
	try {
		const npmRegistryUrl = `https://registry.npmjs.org/${packageName}`
		const response = await axios.get(npmRegistryUrl)
		const repoUrl = response.data.repository?.url

		if (!repoUrl) {
			throw new Error(`Repository URL not found for the package ${packageName}`)
		}

		// Convert git+https://github.com/user/repo.git to https://github.com/user/repo
		const docUrl = repoUrl.replace(/^git\+/, '').replace(/\.git$/, '')
		return docUrl
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Failed to fetch documentation: ${error.message}`)
			throw error
		} else {
			console.error(`Failed to fetch documentation: ${error}`)
			throw new Error(String(error))
		}
	}
}

yargs(hideBin(process.argv))
	.command(
		'fetchdoc [package]',
		'Fetch documentation for a given npm package',
		yargs => {
			yargs
				.positional('package', {
					describe: 'npm package name',
					type: 'string',
					demandOption: true
				})
				.option('r', {
					alias: 'readme',
					type: 'boolean',
					description: 'Display the README in the terminal'
				})
		},
		async argv => {
			const docUrl = await fetchDoc(argv.package as string)
			if (argv.r && docUrl) {
				console.log('repoUrl', docUrl)
				const readmeContent = await fetchReadmeContent(docUrl)
				displayInPager(readmeContent)
			} else if (docUrl) {
				console.log(`Opening documentation for ${argv.package}...`)
				await open(docUrl)
			}
		}
	)
	.help().argv

export function displayInPager(content: string): void {
	const readable = new Readable()
	readable.push(content)
	readable.push(null)
	const less = spawn('less', [], {
		stdio: ['pipe', process.stdout, process.stderr]
	})

	if (less.stdin) {
		readable.pipe(less.stdin)
	}
}

export async function fetchReadmeContent(repoUrl: string): Promise<string> {
	// Extract owner and repo from repoUrl
	const [, , , owner, repo] = repoUrl.split('/')

	// Fetch the default branch name for the repository
	const repoInfoResponse = await axios.get(
		`https://api.github.com/repos/${owner}/${repo}`
	)
	const defaultBranch = repoInfoResponse.data.default_branch

	// Construct the Url to fetch the raw README content using the default branch name
	const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`
	try {
		const response = await axios.get(rawUrl)
		return response.data
	} catch (error) {
		if (error instanceof Error) {
			console.error(`Failed to fetch README content: ${error.message}`)
			throw error
		} else {
			console.error(`Failed to fetch README content: ${error}`)
			throw new Error(String(error))
		}
	}
}

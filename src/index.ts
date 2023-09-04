#!/usr/bin/env node

import yargs from 'yargs'
import { spawn } from './spawnWrapper'
import { Readable } from 'stream'
import { hideBin } from 'yargs/helpers'
import axios from 'axios'
import open from 'open'

/**
 * Fetches the documentation URL for a given package name.
 *
 * @param {string} packageName - The name of the package.
 * @return {Promise<string | void>} The documentation URL of the package, or void if the URL is not found.
 */
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
		(yargs) => {
			yargs
				.positional('package', {
					describe: 'npm package name',
					type: 'string',
					demandOption: true,
				})
				.option('r', {
					alias: 'readme',
					type: 'boolean',
					description: 'Display the README in the terminal',
				})
		},
		async (argv) => {
			const docUrl = await fetchDoc(argv.package as string)
			if (argv.r && docUrl) {
				console.log('repoUrl', docUrl)
				const readmeContent = await fetchReadmeContent(docUrl)
				displayInPager(readmeContent)
			} else if (docUrl) {
				console.log(`Opening documentation for ${argv.package}...`)
				await open(docUrl)
			}
		},
	)
	.help().argv

/**
 * Display the given content in a pager.
 *
 * @param {string} content - The content to be displayed.
 * @return {void} This function does not return a value.
 */
export function displayInPager(content: string): void {
	const readable = new Readable()
	readable.push(content)
	readable.push(null)
	const less = spawn('less', [], {
		stdio: ['pipe', process.stdout, process.stderr],
	})

	if (less.stdin) {
		readable.pipe(less.stdin)
	}
}

/**
 * Fetches the content of the README file for a given repository.
 *
 * @param {string} repoUrl - The URL of the repository.
 * @return {Promise<string>} The content of the README file as a string.
 */
export async function fetchReadmeContent(repoUrl: string): Promise<string> {
	// Extract owner and repo from repoUrl
	const [, , , owner, repo] = repoUrl.split('/')

	// Fetch the default branch name for the repository
	const repoInfoResponse = await axios.get(
		`https://api.github.com/repos/${owner}/${repo}`,
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

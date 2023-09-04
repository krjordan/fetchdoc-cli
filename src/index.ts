import yargs from 'yargs'
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
			yargs.positional('package', {
				describe: 'npm package name',
				type: 'string',
				demandOption: true
			})
		},
		async argv => {
			const docUrl = await fetchDoc(argv.package as string)
			if (docUrl) {
				console.log(`Opening documentation for ${argv.package}...`)
				await open(docUrl)
			}
		}
	)
	.help().argv

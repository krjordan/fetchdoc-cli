import { expect } from 'chai'
import nock from 'nock'
import sinon from 'sinon'
import * as spawnWrapper from '../src/spawnWrapper'
import { fetchDoc, fetchReadmeContent, displayInPager } from '../src/index'
import { PassThrough } from 'stream'
import { ChildProcess } from 'child_process'

nock.disableNetConnect()
nock.emitter.on('no match', (req) => {
	console.error(`No Nock match for request: ${req.method} ${req.href}`)
})

describe('fetchDoc', () => {
	afterEach(() => {
		nock.cleanAll()
	})

	it('should fetch the repo README url for a given npm package', async () => {
		// Mock the npm registry response
		nock('https://registry.npmjs.org')
			.get('/lodash')
			.reply(200, {
				repository: { url: 'git+https://github.com/lodash/lodash.git' },
			})

		const url = await fetchDoc('lodash')
		expect(url).to.equal('https://github.com/lodash/lodash')
	})

	it('should throw an error if the package does not have a repository URL', async () => {
		// Mock the npm registry response without a repository field
		nock('https://registry.npmjs.org').get('/some-package').reply(200, {})

		try {
			await fetchDoc('some-package')
			throw new Error('Expected fetchDoc to throw, but it did not')
		} catch (err: any) {
			expect(err.message).to.equal(
				'Repository URL not found for the package some-package',
			)
		}
	})
})

describe('fetchReadmeContent', () => {
	it('should fetch the README content for a given repo Url', async () => {
		const repoUrl = 'https://github.com/lodash/lodash'

		// Mock the GitHub API response for repo info
		nock('https://api.github.com').get('/repos/lodash/lodash').reply(200, {
			default_branch: 'main',
		})

		// Mock the GitHub raw content response for README
		nock('https://raw.githubusercontent.com')
			.get('/lodash/lodash/main/README.md')
			.reply(200, '# Lodash README Content')

		const content = await fetchReadmeContent(repoUrl)
		expect(content).to.equal('# Lodash README Content')
	})
})

describe('displayInPager', () => {
	let spawnStub: sinon.SinonStub

	beforeEach(() => {
		const stubbedChildProcess = {
			stdin: new PassThrough(),
			stdout: new PassThrough(),
			stderr: new PassThrough(),
			on: function (event: string, callback: Function) {
				// Do nothing for now
				return this // Return the stubbed ChildProcess
			},
		} as unknown as ChildProcess

		spawnStub = sinon.stub(spawnWrapper, 'spawn').returns(stubbedChildProcess)
	})

	afterEach(() => {
		// Restore the original spawn function after each test
		spawnStub.restore()
	})

	it('should spawn the less process with the correct arguments', () => {
		const content = '# Lodash README Content'
		displayInPager(content)
		sinon.assert.calledWith(spawnStub, 'less', [])
	})
})

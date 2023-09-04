import { expect } from 'chai'
import nock from 'nock'
import { fetchDoc } from '../src/index'

nock.disableNetConnect()

describe('fetchDoc', () => {
	afterEach(() => {
		nock.cleanAll()
	})

	it('should fetch the repo README url for a given npm package', async () => {
		// Mock the npm registry response
		nock('https://registry.npmjs.org')
			.get('/lodash')
			.reply(200, {
				repository: { url: 'git+https://github.com/lodash/lodash.git' }
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
				'Repository URL not found for the package some-package'
			)
		}
	})
})

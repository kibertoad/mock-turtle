import request from 'superagent'
import { initHelper } from './utils/nockbackHelper'
import { ResponseTypescriptExporter } from '../lib/ResponseTypescriptExporter'
import rimraf from 'rimraf'

const exporter = new ResponseTypescriptExporter(__dirname + '/nock-responses')

describe('ResponseExporter', () => {
  describe('Export to TypeScript', () => {
    it('Export only body', async () => {
      rimraf.sync(getMockPath('todoMock.ts'))
      const helper = initHelper(__dirname)

      await helper.nockBack('placeholder-GET.json', async () => {
        const response = await request.get('https://jsonplaceholder.typicode.com/todos/1').set({
          'Accept-Encoding': 'identity' // This will prevent responses from being compressed which is preferred for mock recording
        })
        await exporter.exportResponseBody('todoMock', response)
        const importedMock = await import(getMockPath('todoMock.ts'))
        expect(importedMock).toMatchSnapshot()
      })
    })

    it('Export full response', async () => {
      rimraf.sync(getMockPath('todoFullMock.ts'))
      const helper = initHelper(__dirname)

      await helper.nockBack('placeholder-GET.json', async () => {
        const response = await request.get('https://jsonplaceholder.typicode.com/todos/1').set({
          'Accept-Encoding': 'identity' // This will prevent responses from being compressed which is preferred for mock recording
        })
        await exporter.exportFullResponse('todoFullMock', response)
        const importedMock = await import(getMockPath('todoFullMock.ts'))
        expect(importedMock).toMatchSnapshot()
      })
    })

    it('Does not overwrite mocks by default', async () => {
      rimraf.sync(getMockPath('todoMock.ts'))
      rimraf.sync(getMockPath('todoMock_1.ts'))
      const helper = initHelper(__dirname)

      await helper.nockBack('placeholder-GET.json', async () => {
        const response = await request.get('https://jsonplaceholder.typicode.com/todos/1').set({
          'Accept-Encoding': 'identity' // This will prevent responses from being compressed which is preferred for mock recording
        })
        await exporter.exportResponseBody('todoMock', response)
        await exporter.exportResponseBody('todoMock', response)
        const importedMock = await import(getMockPath('todoMock.ts'))
        expect(importedMock).toMatchSnapshot()
        const importedMock2 = await import(getMockPath('todoMock_1.ts'))
        expect(importedMock2).toMatchSnapshot()
      })
    })

    it('Overwrites mocks when configured', async () => {
      rimraf.sync(getMockPath('todoMockToRewrite.ts'))
      const helper = initHelper(__dirname)

      await helper.nockBack('placeholder-GET.json', async () => {
        const response = await request.get('https://jsonplaceholder.typicode.com/todos/1').set({
          'Accept-Encoding': 'identity' // This will prevent responses from being compressed which is preferred for mock recording
        })

        const overwritingExporter = new ResponseTypescriptExporter(__dirname + '/nock-responses', {
          doNotOverwrite: false
        })
        await overwritingExporter.exportFullResponse('todoMockToRewrite', response)
        await overwritingExporter.exportResponseBody('todoMockToRewrite', response)
        const importedMock = await import(getMockPath('todoMockToRewrite.ts'))
        expect(importedMock).toMatchSnapshot()
      })
    })
  })
})

function getMockPath(fixtureName: string) {
  return __dirname + '/nock-responses/' + fixtureName
}

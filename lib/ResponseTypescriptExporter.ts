import { BaseExporter, ExporterConfig, Response } from './BaseExporter'
import { EndpointResponse } from './MockTurtle'

const DEFAULT_CONFIG: ExporterConfig = Object.freeze({
  doNotOverwrite: true
})

export class ResponseTypescriptExporter extends BaseExporter {
  public constructor(pathToMocks: string, config?: ExporterConfig) {
    super(pathToMocks, 'ts', config || DEFAULT_CONFIG)
  }

  public async exportResponseBody(mockName: string, response: Response) {
    const mock = `export const ResponseMock = Object.freeze(
  ${JSON.stringify(response.body, null, 4)}
)`
    await this.saveFixture(mockName, mock)
  }

  public async exportFullResponse(mockName: string, response: Response) {
    const responseMock: EndpointResponse = {
      body: response.body,
      headers: response.header,
      responseCode: response.status
    }

    const mock = `export const ResponseMock = Object.freeze(
  ${JSON.stringify(responseMock, null, 4)}
)`
    await this.saveFixture(mockName, mock)
  }
}

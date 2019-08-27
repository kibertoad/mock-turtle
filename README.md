# mock-turtle-soup

Wrapper for mocking external services with Nock. 

  [![NPM Version][npm-image]][npm-url]
  [![Linux Build][travis-image]][travis-url]

## Install

```sh
$ npm install --save-dev mock-turtle-soup
```

## Example usage

### Mocking

#### Basic mocking usage

```
import { MockTurtle } from 'mock-turtle-soup'
import nock from 'nock'

describe('TestSuite', () => {
  let mockTurtle: MockTurtle
  beforeEach(() => {
    mockTurtle = new MockTurtle(nock, {
      host: 'http://www.google.com'
    })
    mockTurtle.disableExternalCalls()
  })
  afterEach(() => {
    mockTurtle.reset()
  })

  it('mock GET endpoint without parameters', async () => {
    mockTurtle.mockGet('/', { result: 'Soup is ready.' })
    const response = await request.get('www.google.com')
    expect(response.body).toEqual({ result: 'Soup is ready.' })
  })

  it('mock GET endpoint for any parameters', async () => {
    mockTurtle.mockGet('/', { result: 'Some soup is ready.' }, { anyParams: true })
    const response = await request.get('www.google.com').query({
      soupColour: 'red'
    })
    expect(response.body).toEqual({ result: 'Some soup is ready.' })
  })

    it('mock GET endpoint with parameters', async () => {
      mockTurtle.mockGet(
        '/',
        { result: 'Red soup is ready.' },
        {
          requestQuery: {
            soupColour: 'red'
          }
        }
      )

      mockTurtle.mockGet(
        '/',
        { result: 'Green soup is ready.' },
        {
          requestQuery: {
            soupColour: 'green'
          }
        }
      )

      const responseRed = await request.get('www.google.com').query({
        soupColour: 'red'
      })
      expect(responseRed.body).toEqual({ result: 'Red soup is ready.' })

      const responseGreen = await request.get('www.google.com').query({
        soupColour: 'green'
      })
      expect(responseGreen.body).toEqual({ result: 'Green soup is ready.' })
    })

```

#### Mocking configuration

MockTurtle constructor accepts following parameters:

* nock -> instance of nock. Usually retrieved by calling `import * as nock from 'nock'` or `'const nock = require('nock)'`
* optionDefaults?: GlobalOptions -> optional helper configuration

GlobalOptions parameters:

* host: string | RegExp | Url -> host path to service being mocked. It may be convenient to use single instance of MockTurtle to mock all endpoints of a single external service.
* delayConnection?: number -> delay in returning response to mocked endpoint
* times?: number -> how many times should same response be repeated. By default mock is reused indefinitely
* nockOptions?: nock.Options -> options that will be passed to nock instance directly
* allowProtocolOmission?: boolean -> do not throw an error when mocked host does not begin with 'http' (which usually results in mocking not working)
* allowSlashOmission?: boolean -> do not throw an error when mocked path does not begin with '/' (which usually results in mocking not working)

All these parameters can also be overriden for each mock separately

To mock an endpoint, use `mockGet` or `mockPost` methods on MockTurtle instance accordingly. Parameters for these methods:

* endpointPath: string | RegExp | ((uri: string) => boolean) -> endpoint url. Gets concatenated with MockTurtle `host`
* mockedResponse?: EndpointResponse, -> mocked response that will be returned by the mocked endpoint
* endpointOptions?: EndpointOptions, -> filters to apply when matching call to endpoint with specific mocks
* optionOverrides?: GlobalOptions -> overrides for MockTurtle options

EndpointOptions parameters:

* anyParams?: boolean -> if true, any call to specified endpoint will match this mock. 
* requestQuery?: nockNamespace.RequestBodyMatcher -> only matches mock for requests with given query parameters
* requestBody?: nockNamespace.RequestBodyMatcher -> only matches mock for requests with given body

### Response mock generation

#### Basic mock generation usage

```
import { ResponseTypescriptExporter } from 'mock-turtle-soup'

const exporter = new ResponseTypescriptExporter(__dirname + '/nock-responses')

describe('ResponseExporter', () => {
  it('Export only response body', async () => {
    const response = await request.get('https://jsonplaceholder.typicode.com/todos/1').set({
      'Accept-Encoding': 'identity' // This will prevent responses from being compressed which is preferred for mock recording
      })
    await exporter.exportResponseBody('todoMock', response)
    })

  it('Export full response with headers and status code', async () => {
    const response = await request.get('https://jsonplaceholder.typicode.com/todos/1').set({
      'Accept-Encoding': 'identity' // This will prevent responses from being compressed which is preferred for mock recording
      })
    await exporter.exportFullResponse('todoFullMock', response)
    })
  })
})
```

[npm-image]: https://img.shields.io/npm/v/mock-turtle-soup.svg
[npm-url]: https://npmjs.org/package/mock-turtle-soup
[downloads-image]: https://img.shields.io/npm/dm/mock-turtle-soup.svg
[downloads-url]: https://npmjs.org/package/mock-turtle-soup
[travis-image]: https://img.shields.io/travis/kibertoad/mock-turtle-soup/master.svg?label=linux
[travis-url]: https://travis-ci.org/kibertoad/mock-turtle-soup

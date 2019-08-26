import nockNamespace, { HttpHeaders, POJO, ReplyBody } from 'nock'
import { Url } from 'url'
import deepMerge from 'deepmerge'

export interface GlobalOptions {
  basePath: string | RegExp | Url
  delayConnection?: number
  nockOptions?: nockNamespace.Options
  allowProtocolOmission?: boolean
}

export interface EndpointOptions {
  requestQuery?: nockNamespace.RequestBodyMatcher
  requestBody?: nockNamespace.RequestBodyMatcher
}

export type EndpointResponse =
  | {
      responseCode: number
      body?: ReplyBody
      headers?: HttpHeaders
    }
  | POJO

enum HttpMethod {
  get = 'get',
  post = 'post'
}

type Nock = (
  basePath: string | RegExp | Url,
  options?: nockNamespace.Options
) => nockNamespace.Scope

export class MockTurtle {
  private readonly nock: Nock
  private optionDefaults: Partial<GlobalOptions>

  public constructor(nock: Nock, optionDefaults?: GlobalOptions) {
    this.nock = nock
    this.optionDefaults = optionDefaults || {
      delayConnection: 0,
      nockOptions: {}
    }
  }

  public mockGet(
    endpointPath: string | RegExp | ((uri: string) => boolean),
    endpointReply?: EndpointResponse,
    endpointOptions?: EndpointOptions,
    optionOverrides?: GlobalOptions
  ) {
    return this.mockEndpoint(
      HttpMethod.get,
      endpointPath,
      endpointOptions,
      endpointReply,
      optionOverrides
    )
  }

  public mockPost(
    endpointPath: string | RegExp | ((uri: string) => boolean),
    endpointReply?: EndpointResponse,
    endpointOptions?: EndpointOptions,
    optionOverrides?: GlobalOptions
  ) {
    return this.mockEndpoint(
      HttpMethod.post,
      endpointPath,
      endpointOptions,
      endpointReply,
      optionOverrides
    )
  }

  public disableExternalCalls() {
    // @ts-ignore
    this.nock.disableNetConnect()
  }

  public reset() {
    // @ts-ignore
    this.nock.cleanAll()
    // @ts-ignore
    this.nock.enableNetConnect()
  }

  private mockEndpoint(
    method: HttpMethod,
    endpointPath: string | RegExp | ((uri: string) => boolean),
    endpointOptions?: EndpointOptions,
    endpointReply?: EndpointResponse,
    optionOverrides?: GlobalOptions
  ): nockNamespace.Interceptor {
    const resolvedGlobalOptions: GlobalOptions = deepMerge(
      this.optionDefaults,
      optionOverrides || {}
    )
    const resolvedEndpointOptions: EndpointOptions = endpointOptions || {}
    const resolvedReply: EndpointResponse = endpointReply
      ? resolveResponse(endpointReply)
      : {
          responseCode: 200
        }

    if (
      !resolvedGlobalOptions.allowProtocolOmission &&
      typeof resolvedGlobalOptions.basePath === 'string' &&
      !resolvedGlobalOptions.basePath.startsWith('http')
    ) {
      throw new Error(
        `Please add "http://" or "https://" to your baseUrl, otherwise mocking is unlikely to work. If you are pretty sure you don't need it, set "allowProtocolOmission" to true.`
      )
    }

    const mockBuilder = this.nock(
      resolvedGlobalOptions.basePath,
      resolvedGlobalOptions.nockOptions
    )[method](endpointPath, resolvedEndpointOptions.requestBody)

    if (resolvedEndpointOptions.requestQuery) {
      mockBuilder.query(resolvedEndpointOptions.requestQuery)
    }

    if (resolvedGlobalOptions.delayConnection) {
      mockBuilder.delayConnection(resolvedGlobalOptions.delayConnection)
    }

    mockBuilder.reply(resolvedReply.responseCode, resolvedReply.body, resolvedReply.headers)

    return mockBuilder
  }
}

function resolveResponse(response: POJO): EndpointResponse {
  if (response.responseCode) {
    return response
  }
  return {
    responseCode: 200,
    body: response
  }
}

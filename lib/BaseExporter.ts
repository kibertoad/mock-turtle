import mkdirp from 'mkdirp-promise'
import { validationHelper as validate } from 'validation-utils'
import path from 'path'
import fs from 'fs'

export interface Response {
  body: any
  header: any
  status: number
  text: string
}

export interface ExporterConfig {
  doNotOverwrite: boolean
}

export abstract class BaseExporter {
  protected readonly pathToMocks: string
  private readonly extension: string
  private readonly doNotOverwrite: boolean

  public constructor(pathToMocks: string, extension: string, config: ExporterConfig) {
    validate.string(pathToMocks, 'pathToFixture is mandatory and must be a string')
    this.pathToMocks = pathToMocks
    this.extension = extension
    this.doNotOverwrite = config.doNotOverwrite
  }

  protected resolveFixturePath(name: string): string {
    const pathToMock = path.resolve(this.pathToMocks, `${name}.${this.extension}`)

    let resolvedPathToMock = pathToMock
    let counter = 0
    if (this.doNotOverwrite) {
      while (fs.existsSync(resolvedPathToMock)) {
        resolvedPathToMock = path.resolve(
          this.pathToMocks,
          `${name}_${++counter}.${this.extension}`
        )
      }
    }

    return resolvedPathToMock
  }

  protected async saveFixture(mockName: string, responseMock: string) {
    await mkdirp(this.pathToMocks)
    const path = this.resolveFixturePath(mockName)
    fs.writeFileSync(path, responseMock)
  }
}

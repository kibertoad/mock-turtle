import nock from 'nock'
import request from 'superagent'
import { MockTurtle } from '..'

describe('mockTurtle', () => {
  let mockTurtle: MockTurtle
  beforeEach(() => {
    mockTurtle = new MockTurtle(nock, {
      basePath: 'http://www.google.com'
    })
    mockTurtle.disableExternalCalls()
  })
  afterEach(() => {
    mockTurtle.reset()
  })

  describe('mockGet', () => {
    it('mocks GET endpoint without parameters correctly', async () => {
      mockTurtle.mockGet('/', { result: 'Soup is ready.' })
      const response = await request.get('www.google.com')
      expect(response.body).toEqual({ result: 'Soup is ready.' })
    })

    it('handles empty endpoint path correctly', async () => {
      mockTurtle.mockGet('', { result: 'Soup is ready.' })
      const response = await request.get('www.google.com/')
      expect(response.body).toEqual({ result: 'Soup is ready.' })
    })

    it('mocks GET endpoint for any parameters correctly', async () => {
      mockTurtle.mockGet('/', { result: 'Some soup is ready.' }, { anyParams: true })
      const response = await request.get('www.google.com').query({
        soupColour: 'red'
      })
      expect(response.body).toEqual({ result: 'Some soup is ready.' })
    })

    it('mocks GET endpoint with parameters correctly', async () => {
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
  })
})

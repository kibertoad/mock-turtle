import nock, { POJO } from 'nock'
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

  describe('mockPost', () => {
    it('mocks POST endpoint without parameters correctly', async () => {
      mockTurtle.mockPost('/', { result: 'Soup accepted.' })
      const response = await request.post('www.google.com')
      expect(response.body).toEqual({ result: 'Soup accepted.' })
    })

    it('mocks POST endpoint for any body correctly', async () => {
      mockTurtle.mockPost('/', { result: 'Some soup accepted.' }, { anyParams: true })
      const response = await request.post('www.google.com').send({
        soupColour: 'red'
      })
      expect(response.body).toEqual({ result: 'Some soup accepted.' })
    })

    it('allows using body to populate response', async () => {
      mockTurtle.mockPost(
        '/',
        (_path: string, requestBody: POJO) => {
          return {
            result: `${requestBody.soupColour} soup accepted.`
          }
        },
        { anyParams: true }
      )
      const response = await request.post('www.google.com').send({
        soupColour: 'Blue'
      })
      expect(response.body).toEqual({ result: 'Blue soup accepted.' })
    })

    it('mocks POST endpoint with body correctly', async () => {
      mockTurtle.mockPost(
        '/',
        { result: 'Red soup accepted.' },
        {
          requestBody: {
            soupColour: 'red'
          }
        }
      )

      mockTurtle.mockPost(
        '/',
        { result: 'Green soup accepted.' },
        {
          requestBody: {
            soupColour: 'green'
          }
        }
      )

      const responseRed = await request.post('www.google.com').send({
        soupColour: 'red'
      })
      expect(responseRed.body).toEqual({ result: 'Red soup accepted.' })

      const responseGreen = await request.post('www.google.com').send({
        soupColour: 'green'
      })
      expect(responseGreen.body).toEqual({ result: 'Green soup accepted.' })
    })
  })
})

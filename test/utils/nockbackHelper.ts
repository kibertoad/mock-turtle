import { NockbackHelper } from 'nockback-harder'
import nock from 'nock'

export function initHelper(dirname: string, passThroughLocalCall: boolean = true): NockbackHelper {
  const helper = new NockbackHelper(nock, dirname + '/nock-fixtures', { passThroughLocalCall })
  helper.startRecordingNew()
  return helper
}

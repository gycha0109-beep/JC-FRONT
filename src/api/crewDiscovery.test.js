import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CREW_DISCOVERY_MODE,
  CrewDiscoveryError,
  createCrewDiscoveryRequest,
  fetchCrewDiscovery,
  resolveCrewDiscoveryMode,
} from './crewDiscovery.js'

test('authenticated default first batch selects personalized Crew endpoint', () => {
  assert.equal(
    resolveCrewDiscoveryMode({ accessToken: 'token', page: 0, limit: 20 }),
    CREW_DISCOVERY_MODE.PERSONALIZED,
  )

  const request = createCrewDiscoveryRequest({
    baseUrl: 'https://api.example.test/api/v1/',
    accessToken: 'token',
    page: 0,
    limit: 20,
  })

  assert.equal(request.mode, CREW_DISCOVERY_MODE.PERSONALIZED)
  assert.equal(request.url, 'https://api.example.test/api/v1/recommendation/crews?limit=20')
  assert.equal(request.headers.Authorization, 'Bearer token')
})

test('default API root keeps same-origin api-v1 legacy path', () => {
  const request = createCrewDiscoveryRequest({ page: 0, limit: 20 })

  assert.equal(request.mode, CREW_DISCOVERY_MODE.LEGACY)
  assert.equal(request.url, '/api/v1/crews?page=0&size=20')
  assert.equal('Authorization' in request.headers, false)
})

test('team frontend api root does not duplicate api-v1 segment', () => {
  const request = createCrewDiscoveryRequest({
    baseUrl: 'http://localhost:8080/api/v1',
    accessToken: 'token',
    page: 0,
    limit: 20,
  })

  assert.equal(request.url, 'http://localhost:8080/api/v1/recommendation/crews?limit=20')
  assert.equal(request.url.includes('/api/v1/api/v1/'), false)
})

test('empty API root falls back to same-origin api-v1', () => {
  const request = createCrewDiscoveryRequest({ baseUrl: '   ', page: 0, limit: 20 })
  assert.equal(request.url, '/api/v1/crews?page=0&size=20')
})

test('authenticated keyword and region filters remain legacy', () => {
  assert.equal(
    resolveCrewDiscoveryMode({ accessToken: 'token', keyword: '부산' }),
    CREW_DISCOVERY_MODE.LEGACY,
  )
  assert.equal(
    resolveCrewDiscoveryMode({ accessToken: 'token', region: 'busan' }),
    CREW_DISCOVERY_MODE.LEGACY,
  )

  const request = createCrewDiscoveryRequest({
    accessToken: 'token',
    keyword: ' 맛집 ',
    region: ' busan ',
    page: 0,
    limit: 12,
  })

  assert.equal(request.url, '/api/v1/crews?page=0&size=12&keyword=%EB%A7%9B%EC%A7%91&region=busan')
})

test('additional pages and oversized initial batches remain legacy', () => {
  assert.equal(
    resolveCrewDiscoveryMode({ accessToken: 'token', page: 1, limit: 20 }),
    CREW_DISCOVERY_MODE.LEGACY,
  )
  assert.equal(
    resolveCrewDiscoveryMode({ accessToken: 'token', page: 0, limit: 21 }),
    CREW_DISCOVERY_MODE.LEGACY,
  )
})

test('personalized response preserves server order and recommendation metadata', async () => {
  const seen = []
  const result = await fetchCrewDiscovery(
    { accessToken: 'token', limit: 2 },
    {
      fetchImpl: async (url, options) => {
        seen.push({ url, options })
        return {
          ok: true,
          status: 200,
          async json() {
            return {
              success: true,
              data: {
                contractVersion: 'crew-recommendation-contract-v1',
                rankingPolicyVersion: 'crew-ranking-policy-v1',
                scorePolicyVersion: 'crew-score-policy-v1',
                referenceTime: '2026-08-25T09:00:00Z',
                items: [
                  { rank: 1, crew: { id: 42, title: 'first' }, score: 0.9, coverageMode: 'full_featured', reasons: [{ code: 'TAG_INTEREST', contribution: 0.4 }] },
                  { rank: 2, crew: { id: 7, title: 'second' }, score: 0.7, coverageMode: 'legacy_tagless', reasons: [] },
                ],
              },
              message: null,
            }
          },
        }
      },
    },
  )

  assert.equal(seen.length, 1)
  assert.equal(seen[0].url, '/api/v1/recommendation/crews?limit=2')
  assert.equal(result.mode, CREW_DISCOVERY_MODE.PERSONALIZED)
  assert.deepEqual(result.items.map((item) => item.crew.id), [42, 7])
  assert.deepEqual(result.items.map((item) => item.recommendation.rank), [1, 2])
  assert.equal(result.recommendationMeta.rankingPolicyVersion, 'crew-ranking-policy-v1')
})

test('legacy response keeps pageable metadata and does not invent recommendation data', async () => {
  const result = await fetchCrewDiscovery(
    { keyword: '서울', page: 2, limit: 10 },
    {
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        async json() {
          return {
            success: true,
            data: {
              items: [{ id: 9, title: 'legacy' }],
              page: 2,
              size: 10,
              totalElements: 21,
              totalPages: 3,
              last: true,
            },
            message: null,
          }
        },
      }),
    },
  )

  assert.equal(result.mode, CREW_DISCOVERY_MODE.LEGACY)
  assert.equal(result.items[0].crew.id, 9)
  assert.equal(result.items[0].recommendation, null)
  assert.equal(result.page, 2)
  assert.equal(result.totalElements, 21)
})

test('personalized failure throws without silent legacy fallback', async () => {
  let calls = 0

  await assert.rejects(
    () => fetchCrewDiscovery(
      { accessToken: 'token', limit: 20 },
      {
        fetchImpl: async () => {
          calls += 1
          return {
            ok: false,
            status: 503,
            async json() {
              return { success: false, message: 'unavailable' }
            },
          }
        },
      },
    ),
    (error) => {
      assert.equal(error instanceof CrewDiscoveryError, true)
      assert.equal(error.status, 503)
      assert.equal(error.mode, CREW_DISCOVERY_MODE.PERSONALIZED)
      return true
    },
  )

  assert.equal(calls, 1)
})

test('invalid page and limit fail before any request is built', () => {
  assert.throws(() => resolveCrewDiscoveryMode({ page: -1 }), /page/)
  assert.throws(() => resolveCrewDiscoveryMode({ limit: 0 }), /limit/)
  assert.throws(() => resolveCrewDiscoveryMode({ page: 0.5 }), /page/)
})

import test from 'node:test'
import assert from 'node:assert/strict'
import {
  CREW_DISCOVERY_MODE,
  CrewMembershipError,
  cancelCrewJoin,
  createCrewDiscoveryContext,
  getCrewDiscovery,
  joinCrew,
  resolveApiBaseUrl,
} from './crewApi.js'
import {
  ACCESS_TOKEN_KEY,
  LOGIN_USER_KEY,
  REFRESH_TOKEN_KEY,
  getAccessToken,
} from './authStorage.js'

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial))
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null
    },
    removeItem(key) {
      values.delete(key)
    },
    has(key) {
      return values.has(key)
    },
  }
}

function okResponse(data) {
  return {
    ok: true,
    status: 200,
    async json() {
      return { success: true, data, message: null }
    },
  }
}

test('auth storage reads the established accessToken key', () => {
  const storage = memoryStorage({ accessToken: '  abc.def.ghi  ' })
  assert.equal(getAccessToken(storage), 'abc.def.ghi')
})

test('auth storage failure is treated as anonymous instead of throwing', () => {
  const storage = {
    getItem() {
      throw new Error('blocked')
    },
  }
  assert.equal(getAccessToken(storage), '')
})

test('explicit API base wins and blank explicit base falls back to api-v1 root', () => {
  assert.equal(resolveApiBaseUrl(' http://localhost:8080/api/v1/ '), 'http://localhost:8080/api/v1/')
  assert.equal(resolveApiBaseUrl('   '), '/api/v1')
})

test('stored token is injected into the default Crew discovery context', () => {
  const storage = memoryStorage({ accessToken: 'token' })
  const context = createCrewDiscoveryContext(
    { page: 0, size: 20 },
    { storage, baseUrl: 'http://localhost:8080/api/v1' },
  )

  assert.equal(context.accessToken, 'token')
  assert.equal(context.baseUrl, 'http://localhost:8080/api/v1')
  assert.equal(context.limit, 20)
})

test('authenticated default Crew discovery uses personalized endpoint automatically', async () => {
  const storage = memoryStorage({ accessToken: 'token' })
  const calls = []

  const result = await getCrewDiscovery(
    { page: 0, size: 20 },
    {
      storage,
      baseUrl: 'http://localhost:8080/api/v1',
      fetchImpl: async (url, options) => {
        calls.push({ url, options })
        return okResponse({
          contractVersion: 'crew-recommendation-contract-v1',
          rankingPolicyVersion: 'crew-ranking-policy-v1',
          scorePolicyVersion: 'crew-score-policy-v1',
          referenceTime: '2026-08-27T00:00:00Z',
          items: [
            { rank: 1, crew: { id: 12, title: 'recommended' }, score: 0.9, coverageMode: 'full_featured', reasons: [] },
          ],
        })
      },
    },
  )

  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'http://localhost:8080/api/v1/recommendation/crews?limit=20')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token')
  assert.equal(result.mode, CREW_DISCOVERY_MODE.PERSONALIZED)
  assert.equal(result.items[0].crew.id, 12)
})

test('anonymous Crew discovery stays on legacy endpoint automatically', async () => {
  const storage = memoryStorage()
  const calls = []

  const result = await getCrewDiscovery(
    { page: 0, size: 20 },
    {
      storage,
      baseUrl: 'http://localhost:8080/api/v1',
      fetchImpl: async (url, options) => {
        calls.push({ url, options })
        return okResponse({
          items: [{ id: 3, title: 'legacy' }],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
          last: true,
        })
      },
    },
  )

  assert.equal(calls[0].url, 'http://localhost:8080/api/v1/crews?page=0&size=20')
  assert.equal('Authorization' in calls[0].options.headers, false)
  assert.equal(result.mode, CREW_DISCOVERY_MODE.LEGACY)
})

test('authenticated search remains legacy while retaining Authorization header', async () => {
  const storage = memoryStorage({ accessToken: 'token' })
  const calls = []

  await getCrewDiscovery(
    { keyword: '서울', page: 0, size: 10 },
    {
      storage,
      baseUrl: '/api/v1',
      fetchImpl: async (url, options) => {
        calls.push({ url, options })
        return okResponse({
          items: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
          last: true,
        })
      },
    },
  )

  assert.match(calls[0].url, /^\/api\/v1\/crews\?/)
  assert.match(calls[0].url, /keyword=%EC%84%9C%EC%9A%B8/)
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token')
})

test('401 clears stored auth but does not retry through legacy Crew discovery', async () => {
  const storage = memoryStorage({
    [ACCESS_TOKEN_KEY]: 'expired',
    [REFRESH_TOKEN_KEY]: 'refresh',
    [LOGIN_USER_KEY]: '{"id":1}',
  })
  let calls = 0

  await assert.rejects(
    () => getCrewDiscovery(
      { page: 0, size: 20 },
      {
        storage,
        baseUrl: '/api/v1',
        fetchImpl: async () => {
          calls += 1
          return {
            ok: false,
            status: 401,
            async json() {
              return { success: false, message: 'unauthorized' }
            },
          }
        },
      },
    ),
    (error) => {
      assert.equal(error.status, 401)
      assert.equal(error.mode, CREW_DISCOVERY_MODE.PERSONALIZED)
      return true
    },
  )

  assert.equal(calls, 1)
  assert.equal(storage.has(ACCESS_TOKEN_KEY), false)
  assert.equal(storage.has(REFRESH_TOKEN_KEY), false)
  assert.equal(storage.has(LOGIN_USER_KEY), false)
})

test('joinCrew posts to the canonical Crew join endpoint with stored auth', async () => {
  const storage = memoryStorage({ accessToken: 'token' })
  const calls = []

  const application = await joinCrew(42, {
    storage,
    baseUrl: 'http://localhost:8080/api/v1/',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return {
        ok: true,
        status: 201,
        async json() {
          return {
            success: true,
            data: { id: 8, crewId: 42, userId: 3, status: 'PENDING' },
            message: 'created',
          }
        },
      }
    },
  })

  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'http://localhost:8080/api/v1/crews/42/join')
  assert.equal(calls[0].options.method, 'POST')
  assert.equal(calls[0].options.headers.Authorization, 'Bearer token')
  assert.equal(application.status, 'PENDING')
})

test('cancelCrewJoin accepts the canonical 204 no-content response', async () => {
  const storage = memoryStorage({ accessToken: 'token' })
  const calls = []

  const result = await cancelCrewJoin(42, {
    storage,
    baseUrl: '/api/v1',
    fetchImpl: async (url, options) => {
      calls.push({ url, options })
      return { ok: true, status: 204 }
    },
  })

  assert.equal(result, null)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, '/api/v1/crews/42/join')
  assert.equal(calls[0].options.method, 'DELETE')
})

test('Crew membership mutation requires auth before making a request', async () => {
  const storage = memoryStorage()
  let calls = 0

  await assert.rejects(
    () => joinCrew(42, {
      storage,
      fetchImpl: async () => {
        calls += 1
        throw new Error('must not run')
      },
    }),
    (error) => {
      assert.equal(error instanceof CrewMembershipError, true)
      assert.equal(error.status, 401)
      return true
    },
  )

  assert.equal(calls, 0)
})

test('Crew membership 401 clears stored auth without retry', async () => {
  const storage = memoryStorage({
    [ACCESS_TOKEN_KEY]: 'expired',
    [REFRESH_TOKEN_KEY]: 'refresh',
    [LOGIN_USER_KEY]: '{"id":1}',
  })
  let calls = 0

  await assert.rejects(
    () => joinCrew(42, {
      storage,
      baseUrl: '/api/v1',
      fetchImpl: async () => {
        calls += 1
        return {
          ok: false,
          status: 401,
          async json() {
            return { success: false, message: 'unauthorized' }
          },
        }
      },
    }),
    (error) => {
      assert.equal(error instanceof CrewMembershipError, true)
      assert.equal(error.status, 401)
      return true
    },
  )

  assert.equal(calls, 1)
  assert.equal(storage.has(ACCESS_TOKEN_KEY), false)
  assert.equal(storage.has(REFRESH_TOKEN_KEY), false)
  assert.equal(storage.has(LOGIN_USER_KEY), false)
})

test('Crew membership rejects invalid crew IDs before fetch', async () => {
  const storage = memoryStorage({ accessToken: 'token' })
  let calls = 0

  await assert.rejects(
    () => cancelCrewJoin(0, {
      storage,
      fetchImpl: async () => {
        calls += 1
      },
    }),
    /crewId/,
  )
  assert.equal(calls, 0)
})

export const CREW_DISCOVERY_MODE = Object.freeze({
  PERSONALIZED: 'personalized',
  LEGACY: 'legacy',
})

export const MAX_PERSONALIZED_CREW_BATCH = 20
export const DEFAULT_API_BASE_URL = '/api/v1'

export class CrewDiscoveryError extends Error {
  constructor(message, { status = null, mode = null, payload = null } = {}) {
    super(message)
    this.name = 'CrewDiscoveryError'
    this.status = status
    this.mode = mode
    this.payload = payload
  }
}

function normalizedOptional(value) {
  if (value == null) return ''
  return String(value).trim()
}

function normalizedToken(accessToken) {
  return normalizedOptional(accessToken)
}

function validatePage(page) {
  if (!Number.isInteger(page) || page < 0) {
    throw new TypeError('page must be a non-negative integer')
  }
}

function validateLimit(limit) {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new TypeError('limit must be a positive integer')
  }
}

function normalizedApiBaseUrl(baseUrl) {
  const normalized = normalizedOptional(baseUrl) || DEFAULT_API_BASE_URL
  return normalized.endsWith('/') ? normalized.slice(0, -1) : normalized
}

export function resolveCrewDiscoveryMode({
  accessToken,
  keyword,
  region,
  page = 0,
  limit = MAX_PERSONALIZED_CREW_BATCH,
} = {}) {
  validatePage(page)
  validateLimit(limit)

  const authenticated = normalizedToken(accessToken).length > 0
  const hasKeyword = normalizedOptional(keyword).length > 0
  const hasRegion = normalizedOptional(region).length > 0

  if (
    authenticated
    && page === 0
    && !hasKeyword
    && !hasRegion
    && limit <= MAX_PERSONALIZED_CREW_BATCH
  ) {
    return CREW_DISCOVERY_MODE.PERSONALIZED
  }

  return CREW_DISCOVERY_MODE.LEGACY
}

export function createCrewDiscoveryRequest({
  baseUrl = DEFAULT_API_BASE_URL,
  accessToken,
  keyword,
  region,
  page = 0,
  limit = MAX_PERSONALIZED_CREW_BATCH,
} = {}) {
  const mode = resolveCrewDiscoveryMode({ accessToken, keyword, region, page, limit })
  const token = normalizedToken(accessToken)
  const headers = { Accept: 'application/json' }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const base = normalizedApiBaseUrl(baseUrl)

  if (mode === CREW_DISCOVERY_MODE.PERSONALIZED) {
    const params = new URLSearchParams({ limit: String(limit) })
    return {
      mode,
      url: `${base}/recommendation/crews?${params.toString()}`,
      headers,
    }
  }

  const params = new URLSearchParams({
    page: String(page),
    size: String(limit),
  })
  const normalizedKeyword = normalizedOptional(keyword)
  const normalizedRegion = normalizedOptional(region)

  if (normalizedKeyword) params.set('keyword', normalizedKeyword)
  if (normalizedRegion) params.set('region', normalizedRegion)

  return {
    mode,
    url: `${base}/crews?${params.toString()}`,
    headers,
  }
}

function normalizePersonalizedResponse(data) {
  if (!data || !Array.isArray(data.items)) {
    throw new CrewDiscoveryError('Invalid personalized Crew response shape', {
      mode: CREW_DISCOVERY_MODE.PERSONALIZED,
      payload: data,
    })
  }

  return {
    mode: CREW_DISCOVERY_MODE.PERSONALIZED,
    items: data.items.map((item) => ({
      crew: item.crew,
      recommendation: {
        rank: item.rank,
        score: item.score,
        coverageMode: item.coverageMode,
        reasons: Array.isArray(item.reasons) ? item.reasons : [],
      },
    })),
    page: 0,
    size: data.items.length,
    totalElements: null,
    totalPages: null,
    last: true,
    recommendationMeta: {
      contractVersion: data.contractVersion,
      rankingPolicyVersion: data.rankingPolicyVersion,
      scorePolicyVersion: data.scorePolicyVersion,
      referenceTime: data.referenceTime,
    },
  }
}

function normalizeLegacyResponse(data) {
  if (!data || !Array.isArray(data.items)) {
    throw new CrewDiscoveryError('Invalid legacy Crew response shape', {
      mode: CREW_DISCOVERY_MODE.LEGACY,
      payload: data,
    })
  }

  return {
    mode: CREW_DISCOVERY_MODE.LEGACY,
    items: data.items.map((crew) => ({ crew, recommendation: null })),
    page: data.page,
    size: data.size,
    totalElements: data.totalElements,
    totalPages: data.totalPages,
    last: data.last,
    recommendationMeta: null,
  }
}

export async function fetchCrewDiscovery(options = {}, { fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('fetchImpl must be a function')
  }

  const request = createCrewDiscoveryRequest(options)
  const response = await fetchImpl(request.url, {
    method: 'GET',
    headers: request.headers,
    signal: options.signal,
  })

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    throw new CrewDiscoveryError(`Crew discovery request failed with HTTP ${response.status}`, {
      status: response.status,
      mode: request.mode,
      payload,
    })
  }

  if (!payload || payload.success !== true) {
    throw new CrewDiscoveryError('Crew discovery response did not report success', {
      status: response.status,
      mode: request.mode,
      payload,
    })
  }

  return request.mode === CREW_DISCOVERY_MODE.PERSONALIZED
    ? normalizePersonalizedResponse(payload.data)
    : normalizeLegacyResponse(payload.data)
}

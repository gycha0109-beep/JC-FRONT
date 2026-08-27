import {
  CREW_DISCOVERY_MODE,
  CrewDiscoveryError,
  fetchCrewDiscovery,
} from '../api/crewDiscovery.js'
import { clearStoredAuth, getAccessToken } from './authStorage.js'

export class CrewMembershipError extends Error {
  constructor(message, { status = null, payload = null } = {}) {
    super(message)
    this.name = 'CrewMembershipError'
    this.status = status
    this.payload = payload
  }
}

export function resolveApiBaseUrl(explicitBaseUrl) {
  const explicit = typeof explicitBaseUrl === 'string' ? explicitBaseUrl.trim() : ''
  if (explicit) return explicit

  const configured = import.meta.env?.VITE_API_BASE_URL
  return typeof configured === 'string' && configured.trim()
    ? configured.trim()
    : '/api/v1'
}

function normalizedApiRoot(baseUrl) {
  return resolveApiBaseUrl(baseUrl).replace(/\/+$/, '')
}

function normalizedCrewId(crewId) {
  const value = Number(crewId)
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError('crewId must be a positive integer')
  }
  return String(value)
}

export function createCrewDiscoveryContext(
  {
    page = 0,
    size = 20,
    keyword = '',
    region = '',
    signal,
  } = {},
  {
    storage = globalThis.localStorage,
    baseUrl,
  } = {},
) {
  return {
    baseUrl: resolveApiBaseUrl(baseUrl),
    accessToken: getAccessToken(storage),
    keyword,
    region,
    page,
    limit: size,
    signal,
  }
}

export async function getCrewDiscovery(
  params = {},
  {
    storage = globalThis.localStorage,
    baseUrl,
    fetchImpl = globalThis.fetch,
  } = {},
) {
  const context = createCrewDiscoveryContext(params, { storage, baseUrl })

  try {
    return await fetchCrewDiscovery(context, { fetchImpl })
  } catch (error) {
    if (error instanceof CrewDiscoveryError && error.status === 401) {
      clearStoredAuth(storage)
    }
    throw error
  }
}

async function requestCrewMembership(
  crewId,
  method,
  {
    storage = globalThis.localStorage,
    baseUrl,
    fetchImpl = globalThis.fetch,
    signal,
  } = {},
) {
  if (typeof fetchImpl !== 'function') {
    throw new TypeError('fetchImpl must be a function')
  }

  const token = getAccessToken(storage)
  if (!token) {
    throw new CrewMembershipError('Authentication is required for Crew membership changes', {
      status: 401,
    })
  }

  const response = await fetchImpl(
    `${normalizedApiRoot(baseUrl)}/crews/${normalizedCrewId(crewId)}/join`,
    {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      signal,
    },
  )

  if (response.status === 204) return null

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok || !payload || payload.success !== true) {
    if (response.status === 401) clearStoredAuth(storage)
    throw new CrewMembershipError(`Crew membership request failed with HTTP ${response.status}`, {
      status: response.status,
      payload,
    })
  }

  return payload.data
}

export async function joinCrew(crewId, dependencies = {}) {
  return requestCrewMembership(crewId, 'POST', dependencies)
}

export async function cancelCrewJoin(crewId, dependencies = {}) {
  return requestCrewMembership(crewId, 'DELETE', dependencies)
}

export async function getCrews(params = {}, dependencies = {}) {
  return getCrewDiscovery(params, dependencies)
}

export { CREW_DISCOVERY_MODE }

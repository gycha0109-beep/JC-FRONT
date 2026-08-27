import {
  CREW_DISCOVERY_MODE,
  CrewDiscoveryError,
  fetchCrewDiscovery,
} from '../api/crewDiscovery.js'
import { clearStoredAuth, getAccessToken } from './authStorage.js'

export function resolveApiBaseUrl(explicitBaseUrl) {
  const explicit = typeof explicitBaseUrl === 'string' ? explicitBaseUrl.trim() : ''
  if (explicit) return explicit

  const configured = import.meta.env?.VITE_API_BASE_URL
  return typeof configured === 'string' && configured.trim()
    ? configured.trim()
    : '/api/v1'
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

export async function getCrews(params = {}, dependencies = {}) {
  return getCrewDiscovery(params, dependencies)
}

export { CREW_DISCOVERY_MODE }

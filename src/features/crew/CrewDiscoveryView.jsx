import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, MapPin, RefreshCw, Search, Sparkles, Users } from 'lucide-react'
import { CREW_DISCOVERY_MODE, getCrewDiscovery } from '../../services/crewApi.js'
import './crewDiscovery.css'

const REASON_LABELS = Object.freeze({
  TAG_INTEREST: '관심 태그가 잘 맞아요',
  REGION_INTEREST: '관심 지역과 가까워요',
  TRAVEL_DATE_FIT: '여행 시기가 잘 맞아요',
  CAPACITY_REMAINING: '참여 여유가 있어요',
  FRESHNESS: '최근 올라온 크루예요',
})

function formatDate(value) {
  if (!value) return '일정 미정'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
  }).format(date)
}

function recommendationReasons(recommendation) {
  if (!recommendation || !Array.isArray(recommendation.reasons)) return []
  return recommendation.reasons
    .map((reason) => REASON_LABELS[reason.code] || reason.code)
    .filter(Boolean)
}

function statusLabel(crew) {
  const viewer = crew?.viewer
  if (!viewer) return crew?.recruiting ? '모집 중' : '모집 마감'
  if (viewer.owner) return '내가 만든 크루'
  if (viewer.membershipStatus === 'APPROVED') return '참여 중'
  if (viewer.membershipStatus === 'PENDING') return '승인 대기'
  if (viewer.canJoin) return '참여 가능'
  if (viewer.canCancel) return '신청 취소 가능'
  return crew?.recruiting ? '모집 중' : '모집 마감'
}

export default function CrewDiscoveryView() {
  const [queryInput, setQueryInput] = useState('')
  const [regionInput, setRegionInput] = useState('')
  const [filters, setFilters] = useState({ keyword: '', region: '' })
  const [page, setPage] = useState(0)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async (signal) => {
    setLoading(true)
    setError(null)

    try {
      const next = await getCrewDiscovery({
        page,
        size: 12,
        keyword: filters.keyword,
        region: filters.region,
        signal,
      })
      if (!signal.aborted) setResult(next)
    } catch (nextError) {
      if (!signal.aborted) {
        setResult(null)
        setError(nextError)
      }
    } finally {
      if (!signal.aborted) setLoading(false)
    }
  }, [filters.keyword, filters.region, page, reloadKey])

  useEffect(() => {
    const controller = new AbortController()
    load(controller.signal)
    return () => controller.abort()
  }, [load])

  const personalized = result?.mode === CREW_DISCOVERY_MODE.PERSONALIZED
  const hasFilters = Boolean(filters.keyword || filters.region)
  const items = result?.items || []
  const canGoPrevious = result?.mode === CREW_DISCOVERY_MODE.LEGACY && page > 0
  const canGoNext = result?.mode === CREW_DISCOVERY_MODE.LEGACY && result.last === false

  const headingCopy = useMemo(() => {
    if (personalized) {
      return {
        eyebrow: 'For you',
        title: '지금 당신에게 맞는 크루',
        description: '관심사와 여행 맥락을 바탕으로 정렬된 추천입니다.',
      }
    }
    if (hasFilters) {
      return {
        eyebrow: 'Search',
        title: '조건에 맞는 크루 찾기',
        description: '검색과 지역 필터는 기존 크루 탐색 기준을 그대로 사용합니다.',
      }
    }
    return {
      eyebrow: 'Crew',
      title: '여행을 함께할 크루 찾기',
      description: '로그인하지 않은 상태에서는 최신 모집 크루를 보여줍니다.',
    }
  }, [hasFilters, personalized])

  const submitFilters = (event) => {
    event.preventDefault()
    setPage(0)
    setFilters({
      keyword: queryInput.trim(),
      region: regionInput.trim(),
    })
  }

  const clearFilters = () => {
    setQueryInput('')
    setRegionInput('')
    setPage(0)
    setFilters({ keyword: '', region: '' })
  }

  return (
    <main className="crewDiscovery">
      <section className="crewHero">
        <div>
          <span className="crewEyebrow">{headingCopy.eyebrow}</span>
          <h1>{headingCopy.title}</h1>
          <p>{headingCopy.description}</p>
        </div>
        <div className={`crewModeBadge ${personalized ? 'personalized' : ''}`}>
          {personalized ? <Sparkles size={15} /> : <Users size={15} />}
          <span>{personalized ? '맞춤 추천' : hasFilters ? '필터 탐색' : '최신 크루'}</span>
        </div>
      </section>

      <form className="crewFilters" onSubmit={submitFilters}>
        <label>
          <Search size={15} />
          <input
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="제목, 설명, 여행지 검색"
          />
        </label>
        <label>
          <MapPin size={15} />
          <input
            value={regionInput}
            onChange={(event) => setRegionInput(event.target.value)}
            placeholder="지역 코드 또는 지역명"
          />
        </label>
        <button type="submit" className="crewPrimaryButton">찾기</button>
        {(queryInput || regionInput || hasFilters) && (
          <button type="button" className="crewGhostButton" onClick={clearFilters}>초기화</button>
        )}
      </form>

      {personalized && result?.recommendationMeta && (
        <div className="crewContractLine">
          <span>{result.recommendationMeta.rankingPolicyVersion}</span>
          <span>{result.recommendationMeta.scorePolicyVersion}</span>
        </div>
      )}

      {loading && (
        <section className="crewStatePanel">
          <RefreshCw className="crewSpinner" size={20} />
          <b>크루 목록을 불러오는 중입니다.</b>
        </section>
      )}

      {!loading && error && (
        <section className="crewStatePanel error">
          <b>크루 목록을 불러오지 못했습니다.</b>
          <p>
            {error.status === 401
              ? '로그인 정보가 만료되었습니다. 다시 로그인한 뒤 맞춤 추천을 불러와 주세요.'
              : '추천 요청은 최신순 목록으로 자동 전환되지 않았습니다. 상태를 확인한 뒤 다시 시도해 주세요.'}
          </p>
          <button type="button" className="crewGhostButton" onClick={() => setReloadKey((value) => value + 1)}>다시 시도</button>
        </section>
      )}

      {!loading && !error && items.length === 0 && (
        <section className="crewStatePanel">
          <Users size={22} />
          <b>현재 조건에 맞는 모집 크루가 없습니다.</b>
          {hasFilters && <button type="button" className="crewGhostButton" onClick={clearFilters}>전체 크루 보기</button>}
        </section>
      )}

      {!loading && !error && items.length > 0 && (
        <section className="crewGrid">
          {items.map(({ crew, recommendation }) => {
            const reasons = recommendationReasons(recommendation)
            const memberCount = Number(crew.memberCount || 0)
            const capacity = Number(crew.capacity || 0)
            const ratio = capacity > 0 ? Math.min(100, Math.round((memberCount / capacity) * 100)) : 0

            return (
              <article className="crewCard" key={crew.id}>
                <div className="crewCardTop">
                  <div>
                    <span className="crewRegion"><MapPin size={12} />{crew.regionName || crew.regionCode || '지역 미정'}</span>
                    <h2>{crew.title}</h2>
                  </div>
                  {recommendation && <span className="crewRank">#{recommendation.rank}</span>}
                </div>

                <p className="crewDescription">{crew.description || '크루 소개가 아직 등록되지 않았습니다.'}</p>

                <div className="crewFacts">
                  <span><CalendarDays size={13} />{formatDate(crew.travelDate)}</span>
                  <span><Users size={13} />{memberCount}/{capacity || '-'}명</span>
                  <span>{statusLabel(crew)}</span>
                </div>

                <div className="crewCapacityTrack" aria-label={`정원 ${ratio}%`}>
                  <span style={{ width: `${ratio}%` }} />
                </div>

                {reasons.length > 0 && (
                  <div className="crewReasons">
                    {reasons.slice(0, 3).map((reason) => <span key={reason}>{reason}</span>)}
                  </div>
                )}

                <div className="crewCardFooter">
                  <span>by {crew.ownerNickname || '여행자'}</span>
                  <span>{crew.approvalRequired ? '승인제' : '바로 참여'}</span>
                </div>
              </article>
            )
          })}
        </section>
      )}

      {!loading && !error && result?.mode === CREW_DISCOVERY_MODE.LEGACY && (canGoPrevious || canGoNext) && (
        <nav className="crewPagination" aria-label="크루 페이지 이동">
          <button type="button" disabled={!canGoPrevious} onClick={() => setPage((value) => Math.max(0, value - 1))}>이전</button>
          <span>{page + 1} 페이지</span>
          <button type="button" disabled={!canGoNext} onClick={() => setPage((value) => value + 1)}>다음</button>
        </nav>
      )}
    </main>
  )
}

import { useState } from 'react'
import {
  Bell,
  Bookmark,
  CalendarDays,
  Camera,
  ChevronRight,
  Clock3,
  Coffee,
  Compass,
  Heart,
  Home,
  Image,
  Map,
  MapPin,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Navigation,
  Plus,
  Route,
  Search,
  Settings,
  Share2,
  Sparkles,
  UserPlus,
  Users,
  UtensilsCrossed,
  X,
} from 'lucide-react'

const stories = [
  { name: '내 스토리', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=80', mine: true },
  { name: '민지', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80' },
  { name: '준호', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' },
  { name: '수빈', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' },
  { name: '현우', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80' },
  { name: '여진', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80' },
  { name: '태윤', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80' },
]

const navItems = [
  { label: '피드', icon: Home },
  { label: '탐색', icon: Compass },
  { label: '루트맵', icon: Map },
  { label: '저장함', icon: Bookmark },
]

const sideItems = [
  { label: '홈', icon: Home },
  { label: '나의 여행', icon: Route },
  { label: '크루', icon: Users },
  { label: '일정', icon: CalendarDays },
  { label: '설정', icon: Settings },
]

const routeStops = [
  { time: '11:00', title: '성수 연무장길', text: '작은 편집숍과 오래된 공장이 같이 있는 골목부터 천천히 시작했어요.', icon: MapPin },
  { time: '12:30', title: '대림창고 갤러리', text: '붉은 벽돌과 높은 천장, 사진 찍기 좋은 포인트가 정말 많았습니다.', icon: Camera },
  { time: '14:10', title: '카페 어니언', text: '잠깐 쉬면서 커피 한 잔. 평일 오후라 생각보다 여유로웠어요.', icon: Coffee },
  { time: '16:00', title: '서울숲 산책', text: '마지막은 서울숲까지 걸어서 마무리. 노을 시간에 맞추면 더 좋아요.', icon: Navigation },
]

const travelers = [
  { name: '김하늘', handle: '@skytrip', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80' },
  { name: '박도윤', handle: '@doyoon.log', image: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=160&q=80' },
  { name: '이서현', handle: '@seohyun.zip', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80' },
]

const hotRoutes = [
  { title: '한강 야경 3시간 코스', meta: '서울 · 5 spots', icon: Sparkles },
  { title: '부산 영도 하루 걷기', meta: '부산 · 7 spots', icon: Navigation },
  { title: '제주 동쪽 카페 드라이브', meta: '제주 · 6 spots', icon: Coffee },
]

function Avatar({ src, alt, size = 42 }) {
  return <img className="avatar" src={src} alt={alt} width={size} height={size} />
}

function App() {
  const [activeNav, setActiveNav] = useState('피드')
  const [liked, setLiked] = useState(true)
  const [saved, setSaved] = useState(false)
  const [following, setFollowing] = useState(() => new Set())
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleFollow = (name) => {
    setFollowing((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)} aria-label="메뉴 열기">
            <Menu size={22} />
          </button>

          <a className="brand" href="#top" aria-label="Journee 홈">
            <span className="brand-mark"><Navigation size={19} strokeWidth={2.4} /></span>
            <span>
              <strong>Journee</strong>
              <small>Share your journey</small>
            </span>
          </a>

          <nav className="main-nav" aria-label="주요 메뉴">
            {navItems.map(({ label, icon: Icon }) => (
              <button key={label} className={activeNav === label ? 'nav-item active' : 'nav-item'} onClick={() => setActiveNav(label)}>
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          <div className="top-actions">
            <label className="search-box">
              <Search size={17} />
              <input aria-label="검색" placeholder="여행지, 루트, 사람 검색" />
            </label>
            <button className="icon-button" aria-label="알림"><Bell size={19} /></button>
            <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80" alt="내 프로필" size={38} />
          </div>
        </div>
      </header>

      <div className="page" id="top">
        <aside className={mobileOpen ? 'left-sidebar open' : 'left-sidebar'}>
          <div className="mobile-sidebar-head">
            <a className="brand" href="#top">
              <span className="brand-mark"><Navigation size={19} /></span>
              <strong>Journee</strong>
            </a>
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="메뉴 닫기"><X size={20} /></button>
          </div>

          <button className="write-button">
            <Plus size={19} />
            여행 기록 작성
          </button>

          <div className="side-menu">
            {sideItems.map(({ label, icon: Icon }, index) => (
              <button key={label} className={index === 0 ? 'side-link active' : 'side-link'}>
                <Icon size={19} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="side-card">
            <span className="side-card-icon"><Sparkles size={18} /></span>
            <div>
              <strong>이번 주 여행 기록</strong>
              <p>새로운 루트를 완성하면 여행 배지가 열립니다.</p>
            </div>
          </div>

          <div className="side-footer">
            <a href="#terms">이용약관</a>
            <a href="#privacy">개인정보</a>
            <span>© 2026 Journee</span>
          </div>
        </aside>

        {mobileOpen && <button className="drawer-backdrop" aria-label="메뉴 닫기" onClick={() => setMobileOpen(false)} />}

        <main className="feed-column">
          <section className="stories card" aria-label="스토리">
            {stories.map((story) => (
              <button className="story" key={story.name}>
                <span className={story.mine ? 'story-ring mine' : 'story-ring'}>
                  <img src={story.image} alt="" />
                  {story.mine && <span className="story-plus"><Plus size={12} strokeWidth={3} /></span>}
                </span>
                <span>{story.name}</span>
              </button>
            ))}
          </section>

          <section className="composer card">
            <div className="composer-row">
              <Avatar src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80" alt="내 프로필" />
              <button className="composer-input">오늘의 여행을 기록해보세요.</button>
            </div>
            <div className="composer-actions">
              <button><Image size={17} /> 사진</button>
              <button><MapPin size={17} /> 장소</button>
              <button><Route size={17} /> 루트</button>
              <button className="composer-publish">기록하기</button>
            </div>
          </section>

          <article className="post card">
            <header className="post-head">
              <div className="post-author">
                <Avatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80" alt="민지" size={46} />
                <div>
                  <div className="author-name">민지 <span className="verified">✓</span></div>
                  <div className="post-meta">@minji.route · 2시간 전 · 서울 성수동</div>
                </div>
              </div>
              <button className="icon-button"><MoreHorizontal size={20} /></button>
            </header>

            <div className="post-copy">
              <h1>성수 감성 하루 코스</h1>
              <p>날씨 좋은 날 걷기만 해도 기분 좋아지는 성수 루트. 사진 찍고, 커피 마시고, 서울숲까지 천천히 이어지는 코스로 묶어봤어요.</p>
              <div className="tags"><span>#성수</span><span>#서울여행</span><span>#카페투어</span><span>#도보여행</span></div>
            </div>

            <div className="hero-grid">
              <img className="hero-main" src="https://images.unsplash.com/photo-1535189043414-47a3c49a0bed?auto=format&fit=crop&w=1000&q=85" alt="성수 골목" />
              <div className="hero-stack">
                <img src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=85" alt="카페" />
                <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=85" alt="산책" />
              </div>
            </div>

            <section className="route-card">
              <div className="route-summary">
                <div>
                  <span className="eyebrow"><Route size={14} /> ROUTE</span>
                  <h2>성수에서 서울숲까지, 5시간</h2>
                  <p><Clock3 size={15} /> 5시간 20분 <span>·</span> 4개 장소 <span>·</span> 약 4.8km</p>
                </div>
                <button className="route-follow"><Navigation size={16} /> 루트 따라가기</button>
              </div>

              <div className="route-content">
                <div className="timeline">
                  {routeStops.map(({ time, title, text, icon: Icon }, index) => (
                    <div className="timeline-item" key={title}>
                      <div className="timeline-rail">
                        <span className="timeline-dot"><Icon size={14} /></span>
                        {index < routeStops.length - 1 && <span className="timeline-line" />}
                      </div>
                      <div className="timeline-body">
                        <span className="timeline-time">{time}</span>
                        <strong>{title}</strong>
                        <p>{text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="map-preview" aria-label="성수 루트 지도 미리보기">
                  <div className="map-road r1" />
                  <div className="map-road r2" />
                  <div className="map-road r3" />
                  <div className="map-road r4" />
                  <svg viewBox="0 0 340 300" role="img" aria-label="성수에서 서울숲까지 이어지는 루트">
                    <path d="M46 67 C88 34, 118 61, 139 96 S183 148, 216 133 S278 145, 292 217" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" opacity=".96" />
                    <path d="M46 67 C88 34, 118 61, 139 96 S183 148, 216 133 S278 145, 292 217" fill="none" stroke="#ff6333" strokeWidth="5" strokeLinecap="round" />
                    {[['46','67','1'],['139','96','2'],['216','133','3'],['292','217','4']].map(([cx, cy, n]) => (
                      <g key={n}>
                        <circle cx={cx} cy={cy} r="12" fill="#ff6333" stroke="white" strokeWidth="4" />
                        <text x={cx} y={Number(cy)+4} textAnchor="middle" fontSize="10" fill="white" fontWeight="800">{n}</text>
                      </g>
                    ))}
                  </svg>
                  <span className="map-label l1">성수동</span>
                  <span className="map-label l2">서울숲</span>
                  <button className="map-expand"><Map size={15} /> 지도 크게 보기</button>
                </div>
              </div>
            </section>

            <footer className="post-footer">
              <div className="post-actions-left">
                <button className={liked ? 'action liked' : 'action'} onClick={() => setLiked(!liked)}>
                  <Heart size={20} fill={liked ? 'currentColor' : 'none'} /> {liked ? 284 : 283}
                </button>
                <button className="action"><MessageCircle size={20} /> 31</button>
                <button className="action"><Share2 size={20} /> 공유</button>
              </div>
              <button className={saved ? 'action saved' : 'action'} onClick={() => setSaved(!saved)}>
                <Bookmark size={20} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </footer>
          </article>

          <article className="mini-post card">
            <div className="mini-post-image" />
            <div className="mini-post-copy">
              <span className="eyebrow"><UtensilsCrossed size={14} /> WEEKEND PICK</span>
              <h3>망원에서 합정까지, 먹고 걷는 오후</h3>
              <p>시장 간식부터 한강 산책까지 이어지는 짧은 주말 루트.</p>
              <button>루트 보기 <ChevronRight size={16} /></button>
            </div>
          </article>
        </main>

        <aside className="right-sidebar">
          <section className="right-card card">
            <div className="section-head">
              <div><span>오늘의 여행자</span><strong>취향이 비슷한 사람</strong></div>
              <button>더보기</button>
            </div>
            <div className="traveler-list">
              {travelers.map((traveler) => {
                const isFollowing = following.has(traveler.name)
                return (
                  <div className="traveler" key={traveler.name}>
                    <Avatar src={traveler.image} alt={traveler.name} size={42} />
                    <div className="traveler-copy"><strong>{traveler.name}</strong><span>{traveler.handle}</span></div>
                    <button className={isFollowing ? 'follow-button following' : 'follow-button'} onClick={() => toggleFollow(traveler.name)}>
                      {isFollowing ? '팔로잉' : <><UserPlus size={14} /> 팔로우</>}
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="right-card card">
            <div className="section-head">
              <div><span>지금 인기</span><strong>핫한 루트</strong></div>
              <button>전체보기</button>
            </div>
            <div className="hot-list">
              {hotRoutes.map(({ title, meta, icon: Icon }, index) => (
                <button className="hot-item" key={title}>
                  <span className="rank">0{index + 1}</span>
                  <span className="hot-icon"><Icon size={17} /></span>
                  <span className="hot-copy"><strong>{title}</strong><small>{meta}</small></span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          </section>

          <section className="saved-route card">
            <div className="saved-route-image">
              <span><Bookmark size={16} fill="currentColor" /> 저장됨</span>
            </div>
            <div className="saved-route-copy">
              <span className="eyebrow">MY SAVED ROUTE</span>
              <h3>제주 동쪽 하루 드라이브</h3>
              <p>7개 장소 · 8시간</p>
              <button>저장한 루트 열기 <ChevronRight size={16} /></button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

export default App

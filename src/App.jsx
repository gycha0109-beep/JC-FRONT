import { useState } from 'react'
import { Bell, Bookmark, ChevronDown, ChevronRight, Heart, Home, Image, MapPin, MessageCircle, MoreHorizontal, Plus, Route, Search, Share2, UserRound, Users } from 'lucide-react'
import CrewDiscoveryView from './features/crew/CrewDiscoveryView.jsx'

const storyImgs = [
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=220&q=80',
  'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=220&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=220&q=80',
  'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=220&q=80',
  'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=220&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=220&q=80',
]

const routeImages = [
  'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80',
]

const avatar = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'

function App() {
  const [activeSection, setActiveSection] = useState('feed')
  const crewActive = activeSection === 'crew'

  return (
    <div className="screen">
      <aside className="leftRail">
        <div className="logoWrap">
          <div className="logoText">Journee <span>↗</span></div>
          <div className="logoSub">Share your journey</div>
        </div>
        <button className="writeBtn"><Plus size={18}/> 여행 기록 작성</button>
        <nav className="sideNav">
          <button className={!crewActive ? 'active' : ''} onClick={() => setActiveSection('feed')}><Home size={18}/> 홈</button>
          <button><Users size={18}/> 팔로잉</button>
          <button className={crewActive ? 'active' : ''} onClick={() => setActiveSection('crew')}><Users size={18}/> 크루</button>
          <button><span className="tinyIcon">♨</span> 핫한 여행</button>
          <button><Route size={18}/> 나의 루트</button>
          <button><Bookmark size={18}/> 저장한 루트</button>
          <button><MapPin size={18}/> 다녀온 곳</button>
        </nav>
        <div className="sideDivider"/>
        <div className="sectionTitleRow"><b>나의 여행 스타일</b><span>편집</span></div>
        <div className="chips"><span>카페투어 ☕</span><span>감성여행 ✨</span><span>혼행러 🚶</span><span>도보여행 🚶</span></div>
        <div className="sideDivider"/>
        <div className="hashTitle">인기 해시태그</div>
        <div className="hashtags"><span>#성수동 <em>12.3K</em></span><span>#서울여행 <em>8.1K</em></span><span>#감성카페 <em>6.7K</em></span><span>#일본여행 <em>5.4K</em></span><span>#제주도 <em>4.8K</em></span></div>
        <div className="moreHash">더보기 <ChevronDown size={13}/></div>
        <div className="promoCard">
          <b>우리만의 여행 루트,<br/>지도 위에 남겨보세요!</b>
          <button>루트맵 만들기</button>
          <div className="promoArt">🌴 🚐 🌊</div>
        </div>
      </aside>

      <div className="mainArea">
        <header className="topbar">
          <nav className="topNav">
            <button className={!crewActive ? 'active' : ''} onClick={() => setActiveSection('feed')}>피드</button>
            <button className={crewActive ? 'active' : ''} onClick={() => setActiveSection('crew')}>크루</button>
            <button>탐색</button><button>루트맵</button><button>저장함</button>
          </nav>
          <div className="search"><Search size={16}/><span>여행지, 태그, 사용자 검색</span></div>
          <Bell className="bell" size={19}/>
          <img className="topAvatar" src={avatar}/><ChevronDown size={14}/>
        </header>

        {crewActive ? <CrewDiscoveryView/> : (
          <div className="contentGrid">
            <main className="feed">
              <section className="storiesPanel">
                <div className="story mine"><div className="storyCircle plus"><Plus size={21}/></div><span>내 스토리</span></div>
                {['오늘 제주','도쿄 산책','부산 바다','방콕 미식','파리 감성','오사카 쇼핑'].map((t,i)=><div className="story" key={t}><div className="storyCircle"><img src={storyImgs[i]}/></div><span>{t}</span></div>)}
              </section>

              <section className="composer">
                <div className="composerTop"><img src={avatar}/><span>오늘의 여행을 공유해보세요 ✈️</span></div>
                <div className="composerBottom"><button><Image size={16}/> 사진/영상</button><button><Route size={16}/> 루트 추가</button><button><MapPin size={16}/> 장소 태그</button><button>☺ 기분/메모</button></div>
              </section>

              <article className="postCard">
                <div className="postHead"><div className="author"><img src={avatar}/><div><b>travel_yeon</b><span>성동 성수구 · 2시간 전</span></div></div><MoreHorizontal size={18}/></div>
                <div className="postTitle"><h2>성수 감성 하루 코스</h2><p>카페와 소품샵, 산책까지 완벽한 하루</p><div className="metaPills"><span>◷ 6시간</span><span>◉ 8개 장소</span><span>⌖ 2.3km</span><span>₩ 30,000~50,000</span></div></div>
                <div className="photoStrip">{routeImages.map((src,i)=><div className="photo" key={src}><img src={src}/>{i===3&&<div className="morePhoto">+6</div>}</div>)}</div>
                <h3 className="routeHeading">내가 다녀온 루트</h3>
                <div className="routeSection">
                  <div className="timelineList">
                    {[
                      ['09:00','1','Cafe Onion','카페 · 성수동'],['10:30','2','대림창고','복합문화공간'],['12:00','3','성수연방','점심 · 맛집'],['14:00','4','서울숲','산책 · 힐링'],['16:00','5','아크앤북','서점 · 소품샵'],['18:30','6','뚝섬 한강공원','야경 · 피크닉']
                    ].map((r)=><div className="routeRow" key={r[0]}><b>{r[0]}</b><span className="num">{r[1]}</span><div><strong>{r[2]}</strong><small>{r[3]}</small></div><img src={routeImages[(Number(r[1])-1)%4]}/></div>)}
                  </div>
                  <div className="mapBox"><svg viewBox="0 0 260 220"><path d="M38 168 C70 135 80 142 102 111 S137 78 156 91 S190 122 208 66" fill="none" stroke="#d7edef" strokeWidth="4" strokeDasharray="5 5"/><path d="M70 187 C96 166 115 161 140 140 S184 114 208 66" fill="none" stroke="#0c9298" strokeWidth="3" strokeDasharray="4 4"/>{[[58,170,2],[102,142,1],[137,117,3],[159,91,1],[204,66,3]].map(([x,y,n],i)=><g key={i}><circle cx={x} cy={y} r="10" fill="#0c9298"/><text x={x} y={y+4} fill="white" textAnchor="middle" fontSize="10" fontWeight="700">{n}</text></g>)}</svg><button>⌖ 지도 크게 보기</button></div>
                </div>
                <div className="postText">성수는 갈 때마다 새로운 매력이 있는 것 같아요. 카페, 전시, 산책 코스로 딱 좋은 하루였습니다!<br/>특히 대림창고 전시 추천해요 :)</div>
                <div className="tagLine">#성수 #성수동카페 #서울데이트 #감성여행 #하루코스</div>
                <div className="actions"><div><button className="heart"><Heart size={20} fill="currentColor"/>128</button><button><MessageCircle size={19}/>12</button><button><Bookmark size={19}/>저장</button></div><button className="followRoute"><Route size={18}/> 루트 따라가기</button><Share2 size={18}/></div>
              </article>

              <article className="postCard second"><div className="postHead"><div className="author"><img src={avatar}/><div><b>jina_trip</b><span>부산 해운대구 · 5시간 전</span></div></div><MoreHorizontal size={18}/></div><div className="postTitle"><h2>부산 1박 2일 먹방 여행 😋🍤</h2><div className="metaPills"><span>▣ 1박 2일</span><span>◉ 7개 장소</span><span>₩ 80,000~120,000</span></div></div><div className="secondPhotos">{routeImages.map(src=><img key={src} src={src}/>)}</div></article>
            </main>

            <aside className="rightCol">
              <section className="rightCard travelers"><div className="rHead"><b>오늘의 여행자</b><span>더보기 <ChevronRight size={13}/></span></div>{[['minseo_travel','도쿄 · 감성러'],['hello_camper','제주 · 캠퍼'],['travel_yeon','서울 · 카페투어']].map((r,i)=><div className="person" key={r[0]}><img src={i===1?storyImgs[1]:avatar}/><div><b>{r[0]}</b><small>{r[1]}</small></div><button>{i===2?'팔로잉':'팔로우'}</button></div>)}</section>
              <section className="rightCard hotRoutes"><div className="rHead"><b>핫한 루트 🔥</b><span>더보기 <ChevronRight size={13}/></span></div>{[['오사카 3일 쇼핑 & 맛집 루트','sso_travel','342'],['제주 동쪽 감성 드라이브 코스','jeju-lover','287'],['후쿠오카 2박 3일 알차게!','fukuoka_log','215']].map((r,i)=><div className="routeMini" key={r[0]}><img src={routeImages[i]}/><div><b>{r[0]}</b><small>{r[1]}</small><span>♡ {r[2]}</span></div></div>)}</section>
              <section className="rightCard saved"><div className="rHead"><b>내 저장 루트</b><span>더보기 <ChevronRight size={13}/></span></div>{[['도쿄 감성 카페투어','저장한 날 3일 전'],['강릉 바다 & 브런치 코스','저장한 날 1주 전'],['전주 한옥마을 하루 코스','저장한 날 2주 전']].map((r,i)=><div className="savedRow" key={r[0]}><img src={routeImages[i]}/><div><b>{r[0]}</b><small>{r[1]}</small></div><Bookmark size={18}/></div>)}</section>
              <section className="mapPromo"><b>마음에 드는 루트를<br/>내 일정에 추가해보세요!</b><button>내 루트맵 보기</button><div className="mapArt">⌖ ⋯ ⌖</div></section>
            </aside>
          </div>
        )}
      </div>

      <footer className="bottomBar">
        <button className={!crewActive ? 'active' : ''} onClick={() => setActiveSection('feed')}><Home size={21}/><span>홈</span></button>
        <button className={crewActive ? 'active' : ''} onClick={() => setActiveSection('crew')}><Users size={21}/><span>크루</span></button>
        <button className="bigPlus"><Plus size={26}/><span>글쓰기</span></button>
        <button><Bell size={21}/><span>알림</span></button><button><UserRound size={21}/><span>프로필</span></button>
      </footer>
    </div>
  )
}

export default App

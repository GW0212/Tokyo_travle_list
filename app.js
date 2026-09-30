(()=>{const DATA=window.TOKYO_DATA;let tab='spots',area='전체',category='전체',query='',passGroup='전체',passQuery='';const $=s=>document.querySelector(s);const cards=$('#cards'),filters=$('#filters'),search=$('#searchInput');const titles={spots:['🗼 여행지 리스트','도쿄에서 많이 찾는 관광·산책·전망·쇼핑 명소'],restaurants:['🍜 맛집 리스트','라멘·돈카츠·초밥·카페 등 도쿄 인기 식사 후보'],hotels:['🏨 숙소 리스트','신주쿠·시부야·긴자·아사쿠사 등 도쿄 주요 권역 추천 숙소']};const pageCopy={spots:['여행지 리스트','관광·산책·전망·쇼핑 중 원하는 테마를 고르고 지역까지 좁혀보세요.'],restaurants:['맛집 리스트','지역과 검색을 조합해 도쿄에서 먹고 싶은 메뉴를 빠르게 찾아보세요.'],hotels:['숙소 리스트','숙박 권역과 검색을 조합해 여행 스타일에 맞는 숙소를 골라보세요.'],passes:['패스 리스트','도쿄 시내·공항·근교 일정에 맞는 교통 패스를 비교해보세요.']};const catIcon={'전체':'전체','관광':'🏯 관광','산책':'🚶 산책','전망':'🌆 전망','쇼핑':'🛍️ 쇼핑'};
function mapSrc(q){return 'https://www.google.com/maps?q='+encodeURIComponent(q)+'&output=embed'}
function googleUrl(q){return 'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q)}
function current(){return DATA[tab]||[]}
function areas(){return ['전체',...new Set(current().map(x=>x.area))]}
function renderCategoryButtons(){const box=$('#spotCategoryBox');box.hidden=tab!=='spots';if(tab!=='spots')return;const cats=['전체','관광','산책','전망','쇼핑'];$('#spotCategories').innerHTML=cats.map(c=>{const count=c==='전체'?DATA.spots.length:DATA.spots.filter(x=>(x.categories||[]).includes(c)).length;return `<button class="category-btn ${c===category?'active':''}" data-category="${esc(c)}">${catIcon[c]} <span class="count">${count}</span></button>`}).join('');$('#spotCategories').querySelectorAll('.category-btn').forEach(b=>b.onclick=()=>{category=b.dataset.category;area='전체';renderCategoryButtons();renderFilters();renderCards()})}
function renderFilters(){
  filters.innerHTML=areas().map(a=>`<button class="filter ${a===area?'active':''}" data-area="${esc(a)}">${esc(a)}</button>`).join('');
  filters.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{area=b.dataset.area;renderFilters();renderCards()});
}
function filtered(){const q=query.trim().toLowerCase();return current().filter(x=>(area==='전체'||x.area===area)&&(tab!=='spots'||category==='전체'||(x.categories||[]).includes(category))&&(!q||[x.name,x.area,x.desc,...(x.tags||[]),...(x.categories||[])].join(' ').toLowerCase().includes(q)))}
function renderCards(){const list=filtered();$('#empty').hidden=!!list.length;$('#resultMeta').textContent=`${list.length}개 장소 표시 중`;cards.innerHTML=list.map(x=>`<button class="place-card" data-name="${escAttr(x.name)}"><div class="card-row"><h3>${esc(x.name)}</h3><span class="area">${esc(x.area)}</span></div><p>${esc(x.desc)}</p><div class="tags">${tab==='spots'?(x.categories||[]).map(t=>`<span class="tag category-tag">${esc(t)}</span>`).join(''):''}${(x.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="mini">${x.bestFor?'추천 · '+esc(x.bestFor):''}${x.note?' · '+esc(x.note):''}</div></button>`).join('');cards.querySelectorAll('.place-card').forEach(btn=>btn.onclick=()=>select(current().find(x=>x.name===btn.dataset.name),btn,true));if(list.length){const btn=cards.querySelector('.place-card');select(list[0],btn,false)}}
function select(x,btn,userInitiated=false){if(!x)return;document.querySelectorAll('.place-card').forEach(c=>c.classList.remove('active'));if(btn)btn.classList.add('active');$('#selectedName').textContent=x.name;$('#selectedMeta').textContent=[x.area,...(x.categories||[]),...(x.tags||[])].join(' · ');$('#selectedDesc').textContent=x.desc;$('#selectedBest').textContent=x.bestFor?'추천 · '+x.bestFor:'';const pri=$('#selectedPriority');pri.hidden=!x.priority;pri.textContent=x.priority||'';const note=$('#selectedNote');note.hidden=!x.note;note.textContent=x.note?'참고 · '+x.note:'';const frame=$('#mapFrame');const nextSrc=mapSrc(x.query||x.name+' Tokyo Japan');if(frame.dataset.src!==nextSrc){frame.dataset.src=nextSrc;frame.src=nextSrc}$('#openGoogle').href=googleUrl(x.query||x.name+' Tokyo Japan');if(userInitiated&&innerWidth<961){requestAnimationFrame(()=>document.querySelector('.map-panel').scrollIntoView({behavior:'smooth',block:'start'}))}}
function passGroups(){return ['전체',...new Set(DATA.passes.map(x=>x.group))]}
function filteredPasses(){const q=passQuery.trim().toLowerCase();return DATA.passes.filter(x=>(passGroup==='전체'||x.group===passGroup)&&(!q||[x.name,x.group,x.price,x.priceKrw,x.valid,x.coverage,x.desc,x.bestFor,x.note,...(x.tags||[])].join(' ').toLowerCase().includes(q)))}
function renderPassFilters(){const wrap=$('#passFilters');wrap.innerHTML=passGroups().map(g=>`<button class="filter ${g===passGroup?'active':''}" data-group="${escAttr(g)}">${esc(g)}</button>`).join('');wrap.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{passGroup=b.dataset.group;renderPassFilters();renderPassCards()})}
function renderPassCards(){const list=filteredPasses();$('#passResultMeta').textContent=`${list.length}개 패스 표시 중`;$('#passCards').innerHTML=list.map((x,i)=>`<article class="pass-card"><div class="pass-card-top"><div><span class="pass-group">${esc(x.group)}</span><h3>${esc(x.name)}</h3></div><span class="pass-index">${String(i+1).padStart(2,'0')}</span></div><div class="pass-price"><span class="yen-price">${esc(x.price)}</span><span class="krw-price">${esc(x.priceKrw||"")}</span></div><div class="pass-facts"><div><span>유효기간</span><b>${esc(x.valid)}</b></div><div><span>이용 범위</span><b>${esc(x.coverage)}</b></div></div><p class="pass-desc">${esc(x.desc)}</p><div class="tags">${(x.tags||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div><div class="pass-best"><b>추천</b><span>${esc(x.bestFor)}</span></div><div class="pass-note"><b>확인</b><span>${esc(x.note)}</span></div><div class="pass-actions"><a href="${escAttr(x.infoUrl)}" target="_blank" rel="noopener">공식 설명 ↗</a><a class="primary" href="${escAttr(x.buyUrl)}" target="_blank" rel="noopener">구매 · 구매방법 ↗</a></div></article>`).join('')}
function switchTab(next){tab=next;document.body.classList.toggle('hotel-filter-mode',next==='hotels');area='전체';category='전체';query='';search.value='';document.querySelectorAll('.main-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));const isPass=tab==='passes';$('.workspace').hidden=isPass;$('#passWorkspace').hidden=!isPass;$('#spotCategoryBox').hidden=tab!=='spots';$('#pageTitle').textContent=pageCopy[tab][0];$('#pageSub').textContent=pageCopy[tab][1];if(isPass){passGroup='전체';passQuery='';$('#passSearch').value='';renderPassFilters();renderPassCards();return}$('#listTitle').textContent=titles[tab][0];$('#listSub').textContent=titles[tab][1];search.placeholder=tab==='hotels'?'숙소명, 지역, 특징 검색':tab==='restaurants'?'맛집명, 메뉴, 태그 검색':'장소명, 태그 검색';renderCategoryButtons();renderFilters();renderCards()}
function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}function escAttr(s){return esc(s)}
$('#spotCount').textContent=DATA.spots.length;$('#foodCount').textContent=DATA.restaurants.length;$('#hotelCount').textContent=DATA.hotels.length;$('#passCount').textContent=DATA.passes.length;const summaryEl=$('#summaryCount');if(summaryEl)summaryEl.textContent=DATA.spots.length+DATA.restaurants.length+DATA.hotels.length+DATA.passes.length;document.querySelectorAll('.main-tab').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));search.oninput=e=>{query=e.target.value;renderCards()};$('#passSearch').oninput=e=>{passQuery=e.target.value;renderPassCards()};let resizeTimer;addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{const frame=$('#mapFrame');if(frame&&frame.dataset.src&&!frame.src)frame.src=frame.dataset.src},120)},{passive:true});switchTab('spots');})();

;(()=>{
  const back=document.getElementById('backToTop');
  const syncBack=()=>{ if(back) back.classList.toggle('show',window.scrollY>420); };
  window.addEventListener('scroll',syncBack,{passive:true});
  syncBack();
  back?.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

  const makeDragScroll=(el)=>{
    if(!el||el.dataset.dragReady==='1')return;
    el.dataset.dragReady='1';
    let down=false,startX=0,startLeft=0,moved=false,pointerId=null;

    el.addEventListener('pointerdown',e=>{
      // 버튼을 직접 누른 경우에는 클릭을 우선하고 드래그 시작 안 함
      if(e.target.closest('button,a,input,label,select,textarea')) return;
      if(e.pointerType==='touch') return; // 모바일은 native swipe scroll 사용
      down=true; moved=false; pointerId=e.pointerId;
      startX=e.clientX; startLeft=el.scrollLeft;
      el.classList.add('dragging');
    });

    el.addEventListener('pointermove',e=>{
      if(!down)return;
      const dx=e.clientX-startX;
      if(Math.abs(dx)>6)moved=true;
      if(moved){
        if(pointerId!==null && !el.hasPointerCapture?.(pointerId)) el.setPointerCapture?.(pointerId);
        el.scrollLeft=startLeft-dx;
      }
    });

    const stop=e=>{
      if(!down)return;
      down=false;
      el.classList.remove('dragging');
      try{ if(pointerId!==null && el.hasPointerCapture?.(pointerId)) el.releasePointerCapture?.(pointerId); }catch(_){ }
      pointerId=null;
      setTimeout(()=>{moved=false},0);
    };
    el.addEventListener('pointerup',stop);
    el.addEventListener('pointercancel',stop);
    el.addEventListener('pointerleave',e=>{ if(down) stop(e); });
  };

  const bindScrollers=()=>document.querySelectorAll('.pass-filters').forEach(makeDragScroll);
  bindScrollers();
  const mo=new MutationObserver(bindScrollers);
  mo.observe(document.body,{subtree:true,childList:true});
})();

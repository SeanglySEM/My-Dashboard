// ============ DOM ELEMENTS ============
var timeEl = document.getElementById('time');
var dateEl = document.getElementById('date');
var greetingText = document.getElementById('greeting-text');
var greetingIcon = document.getElementById('greeting-icon');
var themeToggle = document.getElementById('theme-toggle');
var settingsToggle = document.getElementById('settings-toggle');
var settingsWidget = document.getElementById('settings-widget');
var weatherContent = document.getElementById('weather-content');
var savedCitiesDiv = document.getElementById('saved-cities');
var bgLayer = document.getElementById('bg-layer');
var bgVideo = document.getElementById('bg-video');
var colorOptions = document.querySelectorAll('.color-dot');
var bgUploadInput = document.getElementById('bg-upload-input');
var bgUploadBtn = document.getElementById('bg-upload-btn');
var bgRemoveBtn = document.getElementById('bg-remove-btn');
var nameInput = document.getElementById('name-input');
var saveNameBtn = document.getElementById('save-name-btn');
var videoUrlInput = document.getElementById('video-url-input');
var videoUrlSaveBtn = document.getElementById('video-url-save-btn');
var videoClearBtn = document.getElementById('video-clear-btn');
var opacitySlider = document.getElementById('opacity-slider');
var opacityValue = document.getElementById('opacity-value');
var inspoQuote = document.getElementById('inspo-quote');
var inspoAuthor = document.getElementById('inspo-author');
var inspoFactText = document.getElementById('inspo-fact-text');
var refreshInspirationBtn = document.getElementById('refresh-inspiration-btn');
var countdownTitle = document.getElementById('countdown-title');
var countdownDays = document.getElementById('countdown-days');
var countdownHours = document.getElementById('countdown-hours');
var countdownMins = document.getElementById('countdown-mins');
var countdownSecs = document.getElementById('countdown-secs');
var countdownSettingsBtn = document.getElementById('countdown-settings-btn');
var countdownSettings = document.getElementById('countdown-settings');
var countdownNameInput = document.getElementById('countdown-name-input');
var countdownDateInput = document.getElementById('countdown-date-input');
var countdownSaveBtn = document.getElementById('countdown-save-btn');
var countdownClearBtn = document.getElementById('countdown-clear-btn');

// ============ STATE ============
var currentCity = '';
var savedCities = [];
var userName = '';
var previousTime = '';
var bgType = 'image';
var countdownTarget = null;
var countdownLabel = '';

// ============ ACCENT COLOR ============
var COLOR_MAP = {
    blue:   { accent: '#4b4bff', hover: '#3a3aff', light: 'rgba(75,75,255,0.1)' },
    purple: { accent: '#9b59b6', hover: '#8e44ad', light: 'rgba(155,89,182,0.1)' },
    green:  { accent: '#2ecc71', hover: '#27ae60', light: 'rgba(46,204,113,0.1)' },
    orange: { accent: '#f39c12', hover: '#e67e22', light: 'rgba(243,156,18,0.1)' },
    red:    { accent: '#e74c3c', hover: '#c0392b', light: 'rgba(231,76,60,0.1)' }
};

function applyAccentColor(color) {
    var c = COLOR_MAP[color];
    if (!c) return;
    var root = document.documentElement;
    root.style.setProperty('--accent', c.accent);
    root.style.setProperty('--accent-hover', c.hover);
    root.style.setProperty('--accent-light', c.light);
    colorOptions.forEach(function(dot) {
        if (dot.getAttribute('data-color') === color) dot.classList.add('active');
        else dot.classList.remove('active');
    });
    localStorage.setItem('dashboard-accent', color);
}
colorOptions.forEach(function(dot) {
    dot.addEventListener('click', function() { applyAccentColor(dot.getAttribute('data-color')); });
});

// ============ BACKGROUND OPACITY ============
function updateOpacity(value) {
    document.documentElement.style.setProperty('--bg-opacity', value / 100);
    opacityValue.textContent = value + '%';
    localStorage.setItem('dashboard-opacity', value);
    bgLayer.style.opacity = value / 100;
    var ytIframe = document.querySelector('.bg-youtube-iframe');
    if (ytIframe) ytIframe.style.opacity = value / 100;
    bgVideo.style.opacity = value / 100;
}
opacitySlider.addEventListener('input', function() { updateOpacity(this.value); });

// ============ BACKGROUND TYPE ============
function setBgType(type) {
    bgType = type;
    localStorage.setItem('dashboard-bg-type', type);
    var buttons = document.querySelectorAll('.bg-type-btn');
    buttons.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.getAttribute('data-bg-type') === type) {
            btn.classList.add('active');
            btn.style.background = 'var(--accent)'; btn.style.color = '#fff'; btn.style.borderColor = 'var(--accent)';
        } else {
            btn.style.background = 'transparent'; btn.style.color = 'var(--text)'; btn.style.borderColor = 'var(--border)';
        }
    });
    var imageRow = document.getElementById('bg-image-row');
    var videoRow = document.getElementById('bg-video-row');
    clearVideo();
    
    if (type === 'image') {
        document.body.classList.remove('no-bg');
        bgLayer.style.display = 'block';
        bgLayer.style.opacity = (parseInt(opacitySlider.value) / 100);
        if (imageRow) imageRow.style.display = 'flex';
        if (videoRow) videoRow.style.display = 'none';
        refreshBackground();
    } else if (type === 'video') {
        document.body.classList.remove('no-bg');
        bgLayer.style.backgroundImage = 'none'; bgLayer.style.display = 'none';
        if (imageRow) imageRow.style.display = 'none';
        if (videoRow) videoRow.style.display = 'flex';
        loadSavedVideo();
    } else {
        document.body.classList.add('no-bg');
        bgLayer.style.backgroundImage = 'none'; bgLayer.style.display = 'none';
        if (imageRow) imageRow.style.display = 'none';
        if (videoRow) videoRow.style.display = 'none';
    }
}

function clearVideo() {
    var ytIframe = document.querySelector('.bg-youtube-iframe');
    if (ytIframe) ytIframe.remove();
    bgVideo.classList.remove('active'); bgVideo.pause(); bgVideo.src = ''; bgVideo.style.display = 'none';
}
function initBgTypeButtons() {
    document.querySelectorAll('.bg-type-btn').forEach(function(btn) {
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function() { setBgType(newBtn.getAttribute('data-bg-type')); });
    });
}
function loadSavedVideo() {
    var saved = localStorage.getItem('dashboard-video-url');
    if (saved) { var vInput = document.getElementById('video-url-input'); if (vInput) vInput.value = saved; playVideo(saved); }
}
function getYouTubeID(url) {
    var patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,/^([a-zA-Z0-9_-]{11})$/];
    for (var i=0;i<patterns.length;i++){var m=url.match(patterns[i]);if(m)return m[1];}
    return null;
}
function playVideo(url) {
    clearVideo();
    var videoId=getYouTubeID(url);
    if(videoId){
        var iframe=document.createElement('iframe');iframe.className='bg-youtube-iframe';
        iframe.style.cssText='position:fixed;top:50%;left:50%;width:120vw;height:120vh;transform:translate(-50%,-50%);z-index:-2;opacity:'+(parseInt(opacitySlider.value)/100)+';pointer-events:none;border:none;';
        iframe.src='https://www.youtube.com/embed/'+videoId+'?autoplay=1&mute=1&loop=1&playlist='+videoId+'&controls=0';
        document.body.appendChild(iframe);localStorage.setItem('dashboard-video-url',url);return;
    }
    if(url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)){bgVideo.src=url;bgVideo.classList.add('active');bgVideo.style.display='block';bgVideo.play().catch(function(){});localStorage.setItem('dashboard-video-url',url);return;}
    alert('Invalid URL.');
}
function initVideoButtons() {
    var vSave=document.getElementById('video-url-save-btn'),vClear=document.getElementById('video-clear-btn'),vInput=document.getElementById('video-url-input');
    if(vSave){var ns=vSave.cloneNode(true);vSave.parentNode.replaceChild(ns,vSave);ns.addEventListener('click',function(){var i=document.getElementById('video-url-input');var u=i?i.value.trim():'';if(u)playVideo(u);});}
    if(vClear){var nc=vClear.cloneNode(true);vClear.parentNode.replaceChild(nc,vClear);nc.addEventListener('click',function(){clearVideo();localStorage.removeItem('dashboard-video-url');var i=document.getElementById('video-url-input');if(i)i.value='';});}
    if(vInput){var ni=vInput.cloneNode(true);vInput.parentNode.replaceChild(ni,vInput);ni.addEventListener('keydown',function(e){if(e.key==='Enter'){var u=ni.value.trim();if(u)playVideo(u);}});}
}
function refreshBackground() {
    if(bgType!=='image')return;
    var customBg=localStorage.getItem('dashboard-bg-custom');
    if(customBg){bgLayer.style.backgroundImage='url('+customBg+')';bgLayer.style.display='block';return;}
    var lastFetch=localStorage.getItem('dashboard-bg-date'),today=new Date().toDateString(),imageUrl=localStorage.getItem('dashboard-bg-url');
    if(!imageUrl||lastFetch!==today){
        var bgUrl='https://picsum.photos/seed/'+today.replace(/\s/g,'')+'/1200/800';
        localStorage.setItem('dashboard-bg-url',bgUrl);localStorage.setItem('dashboard-bg-date',today);
        if(!localStorage.getItem('dashboard-bg-custom'))bgLayer.style.backgroundImage='url('+bgUrl+')';
    }
    if(imageUrl&&!customBg){bgLayer.style.backgroundImage='url('+imageUrl+')';bgLayer.style.display='block';}
}
function initUploadButtons() {
    var upI=document.getElementById('bg-upload-input'),upB=document.getElementById('bg-upload-btn'),rmB=document.getElementById('bg-remove-btn');
    if(upB){var nb=upB.cloneNode(true);upB.parentNode.replaceChild(nb,upB);nb.addEventListener('click',function(){var i=document.getElementById('bg-upload-input');if(i)i.click();});}
    if(upI){var ni=upI.cloneNode(true);upI.parentNode.replaceChild(ni,upI);ni.addEventListener('change',function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(ev){var d=ev.target.result;localStorage.setItem('dashboard-bg-custom',d);bgLayer.style.backgroundImage='url('+d+')';bgLayer.style.display='block';};r.readAsDataURL(f);});}
    if(rmB){var nr=rmB.cloneNode(true);rmB.parentNode.replaceChild(nr,rmB);nr.addEventListener('click',function(){localStorage.removeItem('dashboard-bg-custom');localStorage.removeItem('dashboard-bg-url');localStorage.removeItem('dashboard-bg-date');bgLayer.style.backgroundImage='none';refreshBackground();});}
}

// ============ CLOCK & GREETING ============
function getGreetingIcon(hour) {
    var sun='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    var moon='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    return (hour>=6&&hour<18)?sun:moon;
}
function updateClock() {
    var now=new Date();
    var h=now.getHours(),m=now.getMinutes(),s=now.getSeconds();
    var ampm=h>=12?'PM':'AM';var h12=h%12;if(h12===0)h12=12;
    var ts=String(h12).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    var fts=ts+' '+ampm;
    dateEl.textContent=now.toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
    var hour=now.getHours();
    var g='Good evening';if(hour<12)g='Good morning';else if(hour<18)g='Good afternoon';
    greetingText.textContent=userName?g+', '+userName:g;
    greetingIcon.innerHTML=getGreetingIcon(hour);
    if(fts!==previousTime){
        var html='';
        for(var i=0;i<ts.length;i++){var c=ts[i],pc=previousTime[i]||'';if(c===':')html+='<span class="time-colon">'+c+'</span>';else if(c!==pc&&previousTime!=='')html+='<span class="time-char changed">'+c+'</span>';else html+='<span class="time-char">'+c+'</span>';}
        html+='<span class="time-ampm">'+ampm+'</span>';timeEl.innerHTML=html;previousTime=fts;
    }
    updateCountdown();
}
setInterval(updateClock,1000);updateClock();

// ============ COUNTDOWN ============
function loadCountdown() {
    var saved = localStorage.getItem('dashboard-countdown');
    if (saved) {
        var data = JSON.parse(saved);
        countdownTarget = new Date(data.target);
        countdownLabel = data.label || '';
        countdownNameInput.value = countdownLabel;
        var localDate = new Date(countdownTarget.getTime() - countdownTarget.getTimezoneOffset() * 60000);
        countdownDateInput.value = localDate.toISOString().slice(0, 16);
        updateCountdown();
    }
}
function updateCountdown() {
    if (!countdownTarget) {
        countdownTitle.textContent = 'Set a countdown';
        countdownDays.textContent = '0'; countdownHours.textContent = '0';
        countdownMins.textContent = '0'; countdownSecs.textContent = '0';
        return;
    }
    var now = new Date();
    var diff = countdownTarget - now;
    if (diff <= 0) {
        countdownTitle.textContent = (countdownLabel || 'Countdown') + ' finished! 🎉';
        countdownDays.textContent = '0'; countdownHours.textContent = '0';
        countdownMins.textContent = '0'; countdownSecs.textContent = '0';
        return;
    }
    countdownTitle.textContent = countdownLabel || 'Countdown';
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    var secs = Math.floor((diff % (1000 * 60)) / 1000);
    countdownDays.textContent = days;
    countdownHours.textContent = hours;
    countdownMins.textContent = mins;
    countdownSecs.textContent = secs;
}
countdownSettingsBtn.addEventListener('click', function() {
    countdownSettings.style.display = countdownSettings.style.display === 'none' ? 'flex' : 'none';
});
countdownSaveBtn.addEventListener('click', function() {
    var label = countdownNameInput.value.trim();
    var dateVal = countdownDateInput.value;
    if (!dateVal) return;
    countdownTarget = new Date(dateVal);
    countdownLabel = label;
    localStorage.setItem('dashboard-countdown', JSON.stringify({ target: countdownTarget.toISOString(), label: label }));
    updateCountdown();
    countdownSettings.style.display = 'none';
});
countdownClearBtn.addEventListener('click', function() {
    countdownTarget = null;
    countdownLabel = '';
    countdownNameInput.value = '';
    countdownDateInput.value = '';
    localStorage.removeItem('dashboard-countdown');
    updateCountdown();
    countdownSettings.style.display = 'none';
});

// ============ USER NAME ============
function loadName(){userName=localStorage.getItem('dashboard-name')||'';nameInput.value=userName;updateClock();}
saveNameBtn.addEventListener('click',function(){userName=nameInput.value.trim();localStorage.setItem('dashboard-name',userName);updateClock();});

// ============ THEME ============
function initTheme(){
    var s=localStorage.getItem('dashboard-theme');
    if(s==='dark')document.body.classList.add('dark');
    else if(s==='light')document.body.classList.remove('dark');
    else if(window.matchMedia('(prefers-color-scheme:dark)').matches)document.body.classList.add('dark');
}
themeToggle.addEventListener('click',function(){document.body.classList.toggle('dark');localStorage.setItem('dashboard-theme',document.body.classList.contains('dark')?'dark':'light');});

// ============ SIDEBAR ============
var sidebarOverlay=document.createElement('div');sidebarOverlay.className='sidebar-overlay';sidebarOverlay.id='sidebar-overlay';document.body.appendChild(sidebarOverlay);
var settingsSidebar=document.createElement('div');settingsSidebar.className='settings-sidebar';settingsSidebar.id='settings-sidebar';
var sidebarClose=document.createElement('button');sidebarClose.className='sidebar-close';sidebarClose.id='sidebar-close';sidebarClose.innerHTML='&times;';settingsSidebar.appendChild(sidebarClose);
settingsSidebar.appendChild(settingsWidget);

var weatherSection=document.createElement('div');weatherSection.className='sidebar-section';weatherSection.id='weather-settings-sidebar';
weatherSection.innerHTML='<h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> Weather City</h3>';
var weatherInputRow=document.createElement('div');weatherInputRow.className='weather-input-row';
var sidebarCityInput=document.createElement('input');sidebarCityInput.type='text';sidebarCityInput.className='city-input';sidebarCityInput.id='sidebar-city-input';sidebarCityInput.placeholder='Enter city name...';
var sidebarSaveBtn=document.createElement('button');sidebarSaveBtn.className='save-btn';sidebarSaveBtn.id='sidebar-save-city-btn';sidebarSaveBtn.textContent='Save';
weatherInputRow.appendChild(sidebarCityInput);weatherInputRow.appendChild(sidebarSaveBtn);weatherSection.appendChild(weatherInputRow);
var sidebarSavedCities=document.createElement('div');sidebarSavedCities.className='saved-cities';sidebarSavedCities.id='sidebar-saved-cities';sidebarSavedCities.style.display='none';weatherSection.appendChild(sidebarSavedCities);
settingsSidebar.appendChild(weatherSection);document.body.appendChild(settingsSidebar);

function openSidebar(){settingsSidebar.classList.add('open');sidebarOverlay.classList.add('show');settingsWidget.style.display='block';sidebarCityInput.value=currentCity;setTimeout(function(){initBgTypeButtons();initUploadButtons();initVideoButtons();},100);}
function closeSidebar(){settingsSidebar.classList.remove('open');sidebarOverlay.classList.remove('show');}
settingsToggle.addEventListener('click',function(){if(settingsSidebar.classList.contains('open'))closeSidebar();else openSidebar();});
sidebarClose.addEventListener('click',closeSidebar);sidebarOverlay.addEventListener('click',closeSidebar);
sidebarSaveBtn.addEventListener('click',function(){var c=sidebarCityInput.value.trim();if(c)addCity(c);});
sidebarCityInput.addEventListener('keydown',function(e){if(e.key==='Enter'){var c=sidebarCityInput.value.trim();if(c)addCity(c);}});

// ============ INSPIRATION ============
function fetchInspiration(){fetchQuote();fetchFact();}

function fetchQuote(){
    fetch('https://api.quotable.io/random?maxLength=120')
    .then(function(r){if(!r.ok)throw new Error('');return r.json();})
    .then(function(d){inspoQuote.textContent='\u201C'+d.content+'\u201D';inspoAuthor.textContent='\u2014 '+d.author;inspoQuote.classList.add('inspo-fade');setTimeout(function(){inspoQuote.classList.remove('inspo-fade');},500);})
    .catch(function(){
        var f=[{text:'\u201CThe only way to do great work is to love what you do.\u201D',author:'\u2014 Steve Jobs'},{text:'\u201CSimplicity is the ultimate sophistication.\u201D',author:'\u2014 Leonardo da Vinci'},{text:'\u201CCode is like humor.\u201D',author:'\u2014 Cory House'},{text:'\u201CStay hungry, stay foolish.\u201D',author:'\u2014 Steve Jobs'},{text:'\u201CTalk is cheap. Show me the code.\u201D',author:'\u2014 Linus Torvalds'}];
        var r=f[Math.floor(Math.random()*f.length)];inspoQuote.textContent=r.text;inspoAuthor.textContent=r.author;
    });
}
function fetchFact(){
    fetch('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en')
    .then(function(r){if(!r.ok)throw new Error('');return r.json();})
    .then(function(d){inspoFactText.textContent=d.text;})
    .catch(function(){var f=['Honey never spoils.','Bananas are berries, but strawberries aren\'t.','Octopuses have three hearts.'];inspoFactText.textContent=f[Math.floor(Math.random()*f.length)];});
}

refreshInspirationBtn.addEventListener('click',fetchInspiration);

// ============ WEATHER ============
function loadCities(){var s=localStorage.getItem('dashboard-cities');if(s)savedCities=JSON.parse(s);else savedCities=[];currentCity=savedCities[0]||'';if(currentCity)fetchWeather(currentCity);else autoDetectLocation();renderSavedCities();}
function saveCities(){localStorage.setItem('dashboard-cities',JSON.stringify(savedCities));}
function renderSavedCities(){
    savedCitiesDiv.innerHTML='';sidebarSavedCities.innerHTML='';
    if(savedCities.length<=1){savedCitiesDiv.style.display='none';sidebarSavedCities.style.display='none';return;}
    savedCitiesDiv.style.display='flex';sidebarSavedCities.style.display='flex';
    savedCities.forEach(function(city){
        var chip=document.createElement('span');chip.className='saved-city-chip'+(city===currentCity?' active':'');chip.innerHTML=city+' <span class="saved-city-remove" data-city="'+city+'">&times;</span>';
        chip.addEventListener('click',function(e){if(e.target.classList.contains('saved-city-remove')){e.stopPropagation();savedCities=savedCities.filter(function(c){return c!==city;});if(currentCity===city){currentCity=savedCities[0]||'';if(currentCity)fetchWeather(currentCity);}saveCities();renderSavedCities();if(!currentCity)weatherContent.innerHTML='<p class="weather-placeholder">Loading weather...</p>';return;}currentCity=city;fetchWeather(city);renderSavedCities();});
        savedCitiesDiv.appendChild(chip);var sc=chip.cloneNode(true);
        sc.addEventListener('click',function(e){if(e.target.classList.contains('saved-city-remove')){e.stopPropagation();savedCities=savedCities.filter(function(c){return c!==city;});if(currentCity===city){currentCity=savedCities[0]||'';if(currentCity)fetchWeather(currentCity);}saveCities();renderSavedCities();return;}currentCity=city;fetchWeather(city);renderSavedCities();});
        sidebarSavedCities.appendChild(sc);
    });
}
function addCity(city){if(savedCities.indexOf(city)===-1){savedCities.push(city);saveCities();}currentCity=city;sidebarCityInput.value=city;fetchWeather(city);renderSavedCities();}
function autoDetectLocation(){if(!navigator.geolocation)return;navigator.geolocation.getCurrentPosition(function(pos){fetch('https://geocoding-api.open-meteo.com/v1/reverse?latitude='+pos.coords.latitude+'&longitude='+pos.coords.longitude).then(function(r){return r.json();}).then(function(d){if(d.results&&d.results.length>0){var city=d.results[0].name||d.results[0].admin1||'';if(city&&savedCities.indexOf(city)===-1){savedCities.unshift(city);saveCities();currentCity=city;fetchWeather(city);renderSavedCities();}}}).catch(function(){});},function(){},{timeout:5000});}
function getWeatherEmoji(code){var m={0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',71:'❄️',73:'❄️',75:'❄️',80:'🌦️',81:'🌦️',82:'⛈️',95:'⛈️',96:'⛈️',99:'⛈️'};return m[code]||'🌡️';}
function getUVLevel(uvi){if(uvi<=2)return{text:'Low',color:'#2ecc71',left:'10%'};if(uvi<=5)return{text:'Moderate',color:'#f1c40f',left:'30%'};if(uvi<=7)return{text:'High',color:'#e67e22',left:'55%'};if(uvi<=10)return{text:'Very High',color:'#e74c3c',left:'75%'};return{text:'Extreme',color:'#8e44ad',left:'92%'};}
function getWindDirection(deg){var d=['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];return d[Math.round(deg/22.5)%16];}
function updateWeatherBackground(code,temp){var b=document.body;b.classList.remove('weather-sunny','weather-cloudy','weather-rainy','weather-snowy','weather-stormy','weather-night');var h=new Date().getHours();var n=h<6||h>=18;if(code===0||code===1)b.classList.add(n?'weather-night':'weather-sunny');else if(code===2||code===3)b.classList.add('weather-cloudy');else if((code>=51&&code<=67)||(code>=80&&code<=82))b.classList.add('weather-rainy');else if(code>=71&&code<=77)b.classList.add('weather-snowy');else if(code>=95)b.classList.add('weather-stormy');}

function fetchWeather(city){
    weatherContent.innerHTML='<p class="weather-placeholder">Loading...</p>';
    fetch('https://geocoding-api.open-meteo.com/v1/search?name='+encodeURIComponent(city)+'&count=1')
    .then(function(r){return r.json();})
    .then(function(gd){
        if(!gd.results||gd.results.length===0){weatherContent.innerHTML='<p class="weather-error">City not found</p>';return;}
        var loc=gd.results[0];
        var apiUrl='https://api.open-meteo.com/v1/forecast?latitude='+loc.latitude+'&longitude='+loc.longitude+'&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max&timezone=auto&forecast_days=2';
        return fetch(apiUrl).then(function(r){return r.json();})
        .then(function(wd){
            var cur=wd.current,daily=wd.daily;
            var dm={0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Drizzle',61:'Rain',63:'Rain',65:'Heavy rain',71:'Snow',73:'Snow',75:'Heavy snow',80:'Showers',81:'Showers',82:'Heavy showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'};
            var windDir=getWindDirection(cur.wind_direction_10m),uvInfo=getUVLevel(cur.uv_index);
            updateWeatherBackground(cur.weather_code,cur.temperature_2m);
            var sunriseTime=daily.sunrise[0].split('T')[1].slice(0,5),sunsetTime=daily.sunset[0].split('T')[1].slice(0,5);
            var srP=sunriseTime.split(':'),ssP=sunsetTime.split(':');var srM=parseInt(srP[0])*60+parseInt(srP[1]),ssM=parseInt(ssP[0])*60+parseInt(ssP[1]);var dlM=ssM-srM;var dlH=Math.floor(dlM/60),dlMin=dlM%60;
            var h='<div class="weather-main"><span class="weather-icon-svg">'+getWeatherEmoji(cur.weather_code)+'</span><span class="weather-temp">'+Math.round(cur.temperature_2m)+'°C</span></div>';
            h+='<div class="weather-desc">'+(dm[cur.weather_code]||'Unknown')+'</div><div class="weather-feels">Feels like '+Math.round(cur.apparent_temperature)+'°C</div>';
            h+='<div class="weather-details-grid">';
            h+='<div class="weather-detail-card"><div class="weather-detail-icon">💧</div><div class="weather-detail-label">Humidity</div><div class="weather-detail-value">'+cur.relative_humidity_2m+'%</div></div>';
            h+='<div class="weather-detail-card"><div class="weather-detail-icon">💨</div><div class="weather-detail-label">Wind</div><div class="weather-detail-value">'+Math.round(cur.wind_speed_10m)+' km/h '+windDir+'</div></div>';
            h+='<div class="weather-detail-card"><div class="weather-detail-icon">👁️</div><div class="weather-detail-label">Visibility</div><div class="weather-detail-value">'+(cur.visibility/1000).toFixed(1)+' km</div></div>';
            h+='<div class="weather-detail-card"><div class="weather-detail-icon">☀️</div><div class="weather-detail-label">UV Index</div><div class="weather-detail-value">'+cur.uv_index+' <span style="color:'+uvInfo.color+';font-size:0.7rem;">'+uvInfo.text+'</span></div><div class="uv-bar"><div class="uv-indicator" style="left:'+uvInfo.left+';"></div></div></div>';
            h+='<div class="weather-detail-card"><div class="weather-detail-icon">🌧️</div><div class="weather-detail-label">Rain</div><div class="weather-detail-value">'+daily.precipitation_probability_max[0]+'%</div></div>';
            h+='<div class="weather-detail-card"><div class="weather-detail-icon">📍</div><div class="weather-detail-label">Location</div><div class="weather-detail-value" style="font-size:0.7rem;">'+loc.name+', '+loc.country+'</div></div>';
            h+='</div>';
            h+='<div class="sun-times"><div class="sun-time-card"><div class="sun-time-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/></svg></div><div class="sun-time-label">Sunrise</div><div class="sun-time-value">'+sunriseTime+'</div></div>';
            h+='<div class="sun-time-card"><div class="sun-time-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div><div class="sun-time-label">Sunset</div><div class="sun-time-value">'+sunsetTime+'</div></div>';
            h+='<div class="sun-time-card"><div class="sun-time-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="sun-time-label">Day Length</div><div class="sun-time-value">'+dlH+'h '+dlMin+'m</div></div></div>';
            if(cur.weather_code>=95)h+='<div class="weather-alert">⚠ Severe weather - '+dm[cur.weather_code]+'</div>';
            weatherContent.innerHTML=h;
        });
    }).catch(function(){weatherContent.innerHTML='<p class="weather-error">Failed to load weather</p>';});
}

// ============ KEYBOARD ============
document.addEventListener('keydown',function(e){if(e.key==='Escape')closeSidebar();});

// ============ INIT ============
function init(){
    applyAccentColor(localStorage.getItem('dashboard-accent')||'blue');
    initTheme();
    loadName();
    loadCities();
    loadCountdown();
    updateOpacity(localStorage.getItem('dashboard-opacity')||'15');
    opacitySlider.value=localStorage.getItem('dashboard-opacity')||'15';
    setBgType(localStorage.getItem('dashboard-bg-type')||'image');
    refreshBackground();
    fetchInspiration();
    initBgTypeButtons();
    initUploadButtons();
    initVideoButtons();
    setInterval(function(){if(currentCity)fetchWeather(currentCity);},15*60*1000);
}
init();
setInterval(fetchInspiration,30*60*1000);
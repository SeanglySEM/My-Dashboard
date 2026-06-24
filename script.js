// ============ DOM ELEMENTS ============
var timeEl = document.getElementById('time');
var dateEl = document.getElementById('date');
var greetingText = document.getElementById('greeting-text');
var greetingIcon = document.getElementById('greeting-icon');
var searchForm = document.getElementById('search-form');
var searchInput = document.getElementById('search-input');
var themeToggle = document.getElementById('theme-toggle');
var settingsToggle = document.getElementById('settings-toggle');
var settingsWidget = document.getElementById('settings-widget');
var weatherContent = document.getElementById('weather-content');
var savedCitiesDiv = document.getElementById('saved-cities');
var quoteText = document.getElementById('quote-text');
var quoteAuthor = document.getElementById('quote-author');
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

// ============ STATE ============
var currentCity = '';
var savedCities = [];
var userName = '';
var previousTime = '';
var bgType = 'image';

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
        if (dot.getAttribute('data-color') === color) { dot.classList.add('active'); }
        else { dot.classList.remove('active'); }
    });
    localStorage.setItem('dashboard-accent', color);
}

colorOptions.forEach(function(dot) {
    dot.addEventListener('click', function() { applyAccentColor(dot.getAttribute('data-color')); });
});

// ============ BACKGROUND OPACITY ============
function updateOpacity(value) {
    var root = document.documentElement;
    root.style.setProperty('--bg-opacity', value / 100);
    opacityValue.textContent = value + '%';
    localStorage.setItem('dashboard-opacity', value);
    bgLayer.style.opacity = value / 100;
    var ytIframe = document.querySelector('.bg-youtube-iframe');
    if (ytIframe) { ytIframe.style.opacity = value / 100; }
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
            btn.style.background = 'var(--accent)';
            btn.style.color = '#fff';
            btn.style.borderColor = 'var(--accent)';
        } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--text)';
            btn.style.borderColor = 'var(--border)';
        }
    });
    var imageRow = document.getElementById('bg-image-row');
    var videoRow = document.getElementById('bg-video-row');
    clearVideo();
    if (type === 'image') {
        bgLayer.style.display = 'block';
        bgLayer.style.opacity = (parseInt(opacitySlider.value) / 100);
        if (imageRow) imageRow.style.display = 'flex';
        if (videoRow) videoRow.style.display = 'none';
        refreshBackground();
    } else if (type === 'video') {
        bgLayer.style.backgroundImage = 'none';
        bgLayer.style.display = 'none';
        if (imageRow) imageRow.style.display = 'none';
        if (videoRow) videoRow.style.display = 'flex';
        loadSavedVideo();
    } else {
        bgLayer.style.backgroundImage = 'none';
        bgLayer.style.display = 'none';
        if (imageRow) imageRow.style.display = 'none';
        if (videoRow) videoRow.style.display = 'none';
    }
}

function clearVideo() {
    var ytIframe = document.querySelector('.bg-youtube-iframe');
    if (ytIframe) ytIframe.remove();
    bgVideo.classList.remove('active');
    bgVideo.pause();
    bgVideo.src = '';
    bgVideo.style.display = 'none';
}

function initBgTypeButtons() {
    var buttons = document.querySelectorAll('.bg-type-btn');
    buttons.forEach(function(btn) {
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', function() { setBgType(newBtn.getAttribute('data-bg-type')); });
    });
}

// ============ VIDEO BACKGROUND ============
function loadSavedVideo() {
    var saved = localStorage.getItem('dashboard-video-url');
    if (saved) {
        var vInput = document.getElementById('video-url-input');
        if (vInput) vInput.value = saved;
        playVideo(saved);
    }
}

function getYouTubeID(url) {
    var patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/
    ];
    for (var i = 0; i < patterns.length; i++) {
        var match = url.match(patterns[i]);
        if (match) return match[1];
    }
    return null;
}

function playVideo(url) {
    clearVideo();
    var videoId = getYouTubeID(url);
    if (videoId) {
        var iframe = document.createElement('iframe');
        iframe.className = 'bg-youtube-iframe';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media');
        iframe.setAttribute('allowfullscreen', '');
        iframe.style.cssText = 'position:fixed;top:50%;left:50%;width:120vw;height:120vh;transform:translate(-50%,-50%);z-index:-2;opacity:' + (parseInt(opacitySlider.value) / 100) + ';pointer-events:none;border:none;object-fit:cover;';
        iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1&mute=1&loop=1&playlist=' + videoId + '&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&disablekb=1';
        document.body.appendChild(iframe);
        localStorage.setItem('dashboard-video-url', url);
        return;
    }
    if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
        bgVideo.src = url;
        bgVideo.classList.add('active');
        bgVideo.style.display = 'block';
        bgVideo.play().catch(function() {});
        localStorage.setItem('dashboard-video-url', url);
        return;
    }
    alert('Invalid URL. Use a YouTube link or direct .mp4 link.');
}

function initVideoButtons() {
    var vSaveBtn = document.getElementById('video-url-save-btn');
    var vClearBtn = document.getElementById('video-clear-btn');
    var vInput = document.getElementById('video-url-input');
    if (vSaveBtn) {
        var newSaveBtn = vSaveBtn.cloneNode(true);
        vSaveBtn.parentNode.replaceChild(newSaveBtn, vSaveBtn);
        newSaveBtn.addEventListener('click', function() {
            var input = document.getElementById('video-url-input');
            var url = input ? input.value.trim() : '';
            if (url) playVideo(url);
        });
    }
    if (vClearBtn) {
        var newClearBtn = vClearBtn.cloneNode(true);
        vClearBtn.parentNode.replaceChild(newClearBtn, vClearBtn);
        newClearBtn.addEventListener('click', function() {
            clearVideo();
            localStorage.removeItem('dashboard-video-url');
            var vInput = document.getElementById('video-url-input');
            if (vInput) vInput.value = '';
        });
    }
    if (vInput) {
        var newInput = vInput.cloneNode(true);
        vInput.parentNode.replaceChild(newInput, vInput);
        newInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') { var url = newInput.value.trim(); if (url) playVideo(url); }
        });
    }
}

// ============ BACKGROUND WALLPAPER ============
function refreshBackground() {
    if (bgType !== 'image') return;
    var customBg = localStorage.getItem('dashboard-bg-custom');
    if (customBg) { bgLayer.style.backgroundImage = 'url(' + customBg + ')'; bgLayer.style.display = 'block'; return; }
    var lastFetch = localStorage.getItem('dashboard-bg-date');
    var today = new Date().toDateString();
    var imageUrl = localStorage.getItem('dashboard-bg-url');
    if (!imageUrl || lastFetch !== today) {
        fetch('https://api.unsplash.com/photos/random?orientation=landscape&query=nature,landscape,minimal&client_id=e2f3c7e8a1d4b5f6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8')
            .then(function(res) { if (!res.ok) throw new Error('API limit'); return res.json(); })
            .then(function(data) {
                var url = data.urls.regular;
                localStorage.setItem('dashboard-bg-url', url);
                localStorage.setItem('dashboard-bg-date', today);
                if (!localStorage.getItem('dashboard-bg-custom')) { bgLayer.style.backgroundImage = 'url(' + url + ')'; }
            })
            .catch(function() {});
    }
    if (imageUrl && !customBg) { bgLayer.style.backgroundImage = 'url(' + imageUrl + ')'; bgLayer.style.display = 'block'; }
}

function initUploadButtons() {
    var upInput = document.getElementById('bg-upload-input');
    var upBtn = document.getElementById('bg-upload-btn');
    var rmBtn = document.getElementById('bg-remove-btn');
    if (upBtn) {
        var newUpBtn = upBtn.cloneNode(true);
        upBtn.parentNode.replaceChild(newUpBtn, upBtn);
        newUpBtn.addEventListener('click', function() { var input = document.getElementById('bg-upload-input'); if (input) input.click(); });
    }
    if (upInput) {
        var newInput = upInput.cloneNode(true);
        upInput.parentNode.replaceChild(newInput, upInput);
        newInput.addEventListener('change', function(e) {
            var file = e.target.files[0]; if (!file) return;
            var reader = new FileReader();
            reader.onload = function(ev) { var dataUrl = ev.target.result; localStorage.setItem('dashboard-bg-custom', dataUrl); bgLayer.style.backgroundImage = 'url(' + dataUrl + ')'; bgLayer.style.display = 'block'; };
            reader.readAsDataURL(file);
        });
    }
    if (rmBtn) {
        var newRmBtn = rmBtn.cloneNode(true);
        rmBtn.parentNode.replaceChild(newRmBtn, rmBtn);
        newRmBtn.addEventListener('click', function() {
            localStorage.removeItem('dashboard-bg-custom'); localStorage.removeItem('dashboard-bg-url'); localStorage.removeItem('dashboard-bg-date');
            bgLayer.style.backgroundImage = 'none'; refreshBackground();
        });
    }
}

// ============ CLOCK & GREETING ============
function getGreetingIcon(hour) {
    var sun = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    var moon = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    return (hour >= 6 && hour < 18) ? sun : moon;
}

function updateClock() {
    var now = new Date();
    var hours = now.getHours(), minutes = now.getMinutes(), seconds = now.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var h12 = hours % 12; if (h12 === 0) h12 = 12;
    var timeStr = String(h12).padStart(2, '0') + ':' + String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    var fullTimeStr = timeStr + ' ' + ampm;
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    var hour = now.getHours();
    var g = 'Good evening'; if (hour < 12) g = 'Good morning'; else if (hour < 18) g = 'Good afternoon';
    greetingText.textContent = userName ? g + ', ' + userName : g;
    greetingIcon.innerHTML = getGreetingIcon(hour);
    if (fullTimeStr !== previousTime) {
        var html = '';
        for (var i = 0; i < timeStr.length; i++) {
            var char = timeStr[i], prevChar = previousTime[i] || '';
            if (char === ':') html += '<span class="time-colon">' + char + '</span>';
            else if (char !== prevChar && previousTime !== '') html += '<span class="time-char changed">' + char + '</span>';
            else html += '<span class="time-char">' + char + '</span>';
        }
        html += '<span class="time-ampm">' + ampm + '</span>';
        timeEl.innerHTML = html;
        previousTime = fullTimeStr;
    }
}
setInterval(updateClock, 1000);
updateClock();

// ============ SEARCH ============
searchForm.addEventListener('submit', function(e) { e.preventDefault(); var q = searchInput.value.trim(); if (q) window.location.href = 'https://search.brave.com/search?q=' + encodeURIComponent(q); });

// ============ USER NAME ============
function loadName() { userName = localStorage.getItem('dashboard-name') || ''; nameInput.value = userName; updateClock(); }
saveNameBtn.addEventListener('click', function() { userName = nameInput.value.trim(); localStorage.setItem('dashboard-name', userName); updateClock(); });

// ============ THEME ============
function initTheme() {
    var s = localStorage.getItem('dashboard-theme');
    if (s === 'dark') document.body.classList.add('dark');
    else if (s === 'light') document.body.classList.remove('dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.body.classList.add('dark');
}
themeToggle.addEventListener('click', function() { document.body.classList.toggle('dark'); localStorage.setItem('dashboard-theme', document.body.classList.contains('dark') ? 'dark' : 'light'); });

// ============ SETTINGS SIDEBAR ============
var sidebarOverlay = document.createElement('div');
sidebarOverlay.className = 'sidebar-overlay'; sidebarOverlay.id = 'sidebar-overlay';
document.body.appendChild(sidebarOverlay);

var settingsSidebar = document.createElement('div');
settingsSidebar.className = 'settings-sidebar'; settingsSidebar.id = 'settings-sidebar';

var sidebarClose = document.createElement('button');
sidebarClose.className = 'sidebar-close'; sidebarClose.id = 'sidebar-close';
sidebarClose.innerHTML = '&times;';
settingsSidebar.appendChild(sidebarClose);
settingsSidebar.appendChild(settingsWidget);

var weatherSection = document.createElement('div');
weatherSection.className = 'sidebar-section'; weatherSection.id = 'weather-settings-sidebar';
weatherSection.innerHTML = '<h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg> Weather City</h3>';

var weatherInputRow = document.createElement('div');
weatherInputRow.className = 'weather-input-row';
var sidebarCityInput = document.createElement('input');
sidebarCityInput.type = 'text'; sidebarCityInput.className = 'city-input'; sidebarCityInput.id = 'sidebar-city-input';
sidebarCityInput.placeholder = 'Enter city name...';
var sidebarSaveBtn = document.createElement('button');
sidebarSaveBtn.className = 'save-btn'; sidebarSaveBtn.id = 'sidebar-save-city-btn';
sidebarSaveBtn.textContent = 'Save';
weatherInputRow.appendChild(sidebarCityInput);
weatherInputRow.appendChild(sidebarSaveBtn);
weatherSection.appendChild(weatherInputRow);

var sidebarSavedCities = document.createElement('div');
sidebarSavedCities.className = 'saved-cities'; sidebarSavedCities.id = 'sidebar-saved-cities';
sidebarSavedCities.style.display = 'none';
weatherSection.appendChild(sidebarSavedCities);

settingsSidebar.appendChild(weatherSection);
document.body.appendChild(settingsSidebar);

function openSidebar() {
    settingsSidebar.classList.add('open'); sidebarOverlay.classList.add('show');
    settingsWidget.style.display = 'block'; sidebarCityInput.value = currentCity;
    setTimeout(function() { initBgTypeButtons(); initUploadButtons(); initVideoButtons(); }, 100);
}
function closeSidebar() { settingsSidebar.classList.remove('open'); sidebarOverlay.classList.remove('show'); }
settingsToggle.addEventListener('click', function() { if (settingsSidebar.classList.contains('open')) closeSidebar(); else openSidebar(); });
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
sidebarSaveBtn.addEventListener('click', function() { var c = sidebarCityInput.value.trim(); if (c) addCity(c); });
sidebarCityInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') { var c = sidebarCityInput.value.trim(); if (c) addCity(c); } });

// ============ QUOTE ============
function fetchQuote() {
    fetch('https://api.quotable.io/random?maxLength=100')
        .then(function(res) { if (!res.ok) throw new Error('Failed'); return res.json(); })
        .then(function(data) {
            quoteText.textContent = '\u201C' + data.content + '\u201D';
            quoteAuthor.textContent = '\u2014 ' + data.author;
            quoteText.classList.add('quote-fade');
            setTimeout(function() { quoteText.classList.remove('quote-fade'); }, 500);
        })
        .catch(function() {
            var fallbacks = [
                { text: '\u201CThe only way to do great work is to love what you do.\u201D', author: '\u2014 Steve Jobs' },
                { text: '\u201CSimplicity is the ultimate sophistication.\u201D', author: '\u2014 Leonardo da Vinci' },
                { text: '\u201CCode is like humor. When you have to explain it, it\u2019s bad.\u201D', author: '\u2014 Cory House' },
                { text: '\u201CFirst, solve the problem. Then, write the code.\u201D', author: '\u2014 John Johnson' },
                { text: '\u201CStay hungry, stay foolish.\u201D', author: '\u2014 Steve Jobs' }
            ];
            var r = fallbacks[Math.floor(Math.random() * fallbacks.length)];
            quoteText.textContent = r.text; quoteAuthor.textContent = r.author;
        });
}

// ============ WEATHER ============
function loadCities() {
    var s = localStorage.getItem('dashboard-cities');
    if (s) { savedCities = JSON.parse(s); } else { savedCities = []; }
    currentCity = savedCities[0] || '';
    if (currentCity) fetchWeather(currentCity); else autoDetectLocation();
    renderSavedCities();
}
function saveCities() { localStorage.setItem('dashboard-cities', JSON.stringify(savedCities)); }

function renderSavedCities() {
    savedCitiesDiv.innerHTML = ''; sidebarSavedCities.innerHTML = '';
    if (savedCities.length <= 1) { savedCitiesDiv.style.display = 'none'; sidebarSavedCities.style.display = 'none'; return; }
    savedCitiesDiv.style.display = 'flex'; sidebarSavedCities.style.display = 'flex';
    savedCities.forEach(function(city) {
        var chip = document.createElement('span');
        chip.className = 'saved-city-chip' + (city === currentCity ? ' active' : '');
        chip.innerHTML = city + ' <span class="saved-city-remove" data-city="' + city + '">&times;</span>';
        chip.addEventListener('click', function(e) {
            if (e.target.classList.contains('saved-city-remove')) {
                e.stopPropagation();
                savedCities = savedCities.filter(function(c) { return c !== city; });
                if (currentCity === city) { currentCity = savedCities[0] || ''; if (currentCity) fetchWeather(currentCity); }
                saveCities(); renderSavedCities();
                if (!currentCity) weatherContent.innerHTML = '<p class="weather-placeholder">Loading weather...</p>';
                return;
            }
            currentCity = city; fetchWeather(city); renderSavedCities();
        });
        savedCitiesDiv.appendChild(chip);
        var sidebarChip = chip.cloneNode(true);
        sidebarChip.addEventListener('click', function(e) {
            if (e.target.classList.contains('saved-city-remove')) {
                e.stopPropagation();
                savedCities = savedCities.filter(function(c) { return c !== city; });
                if (currentCity === city) { currentCity = savedCities[0] || ''; if (currentCity) fetchWeather(currentCity); }
                saveCities(); renderSavedCities();
                if (!currentCity) weatherContent.innerHTML = '<p class="weather-placeholder">Loading weather...</p>';
                return;
            }
            currentCity = city; fetchWeather(city); renderSavedCities();
        });
        sidebarSavedCities.appendChild(sidebarChip);
    });
}

function addCity(city) {
    if (savedCities.indexOf(city) === -1) { savedCities.push(city); saveCities(); }
    currentCity = city; sidebarCityInput.value = city;
    fetchWeather(city); renderSavedCities();
}

function autoDetectLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
        function(pos) {
            fetch('https://geocoding-api.open-meteo.com/v1/reverse?latitude=' + pos.coords.latitude + '&longitude=' + pos.coords.longitude)
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.results && data.results.length > 0) {
                        var city = data.results[0].name || data.results[0].admin1 || '';
                        if (city && savedCities.indexOf(city) === -1) {
                            savedCities.unshift(city); saveCities();
                            currentCity = city; fetchWeather(city); renderSavedCities();
                        }
                    }
                })
                .catch(function() {});
        }, function() {}, { timeout: 5000 }
    );
}

function getWeatherEmoji(code) {
    var map = { 0:'☀️',1:'🌤️',2:'⛅',3:'☁️',45:'🌫️',48:'🌫️',51:'🌦️',53:'🌦️',55:'🌧️',61:'🌧️',63:'🌧️',65:'🌧️',66:'🌨️',67:'🌨️',71:'❄️',73:'❄️',75:'❄️',77:'❄️',80:'🌦️',81:'🌦️',82:'⛈️',85:'🌨️',86:'🌨️',95:'⛈️',96:'⛈️',99:'⛈️' };
    return map[code] || '🌡️';
}

function getUVLevel(uvi) {
    if (uvi <= 2) return { text: 'Low', color: '#2ecc71', left: '10%' };
    if (uvi <= 5) return { text: 'Moderate', color: '#f1c40f', left: '30%' };
    if (uvi <= 7) return { text: 'High', color: '#e67e22', left: '55%' };
    if (uvi <= 10) return { text: 'Very High', color: '#e74c3c', left: '75%' };
    return { text: 'Extreme', color: '#8e44ad', left: '92%' };
}

function getWindDirection(deg) {
    var directions = ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'];
    return directions[Math.round(deg / 22.5) % 16];
}

function updateWeatherBackground(code, temp) {
    var body = document.body;
    body.classList.remove('weather-sunny','weather-cloudy','weather-rainy','weather-snowy','weather-stormy','weather-night');
    var hour = new Date().getHours();
    var isNight = hour < 6 || hour >= 18;
    if (code === 0 || code === 1) { body.classList.add(isNight ? 'weather-night' : 'weather-sunny'); }
    else if (code === 2 || code === 3) { body.classList.add('weather-cloudy'); }
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) { body.classList.add('weather-rainy'); }
    else if (code >= 71 && code <= 77) { body.classList.add('weather-snowy'); }
    else if (code >= 95) { body.classList.add('weather-stormy'); }
}

function fetchWeather(city) {
    weatherContent.innerHTML = '<p class="weather-placeholder">Loading...</p>';
    fetch('https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(city) + '&count=1')
        .then(function(res) { return res.json(); })
        .then(function(gd) {
            if (!gd.results || gd.results.length === 0) { weatherContent.innerHTML = '<p class="weather-error">City not found</p>'; return; }
            var loc = gd.results[0];
            var apiUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.latitude + '&longitude=' + loc.longitude +
                '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility' +
                '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max' +
                '&hourly=temperature_2m,weather_code,precipitation_probability' +
                '&timezone=auto&forecast_days=6';
            return fetch(apiUrl)
                .then(function(res) { return res.json(); })
                .then(function(wd) {
                    var current = wd.current, daily = wd.daily;
                    var dm = { 0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Overcast',45:'Fog',48:'Fog',51:'Drizzle',53:'Drizzle',55:'Drizzle',61:'Rain',63:'Rain',65:'Heavy rain',66:'Freezing rain',67:'Freezing rain',71:'Snow',73:'Snow',75:'Heavy snow',77:'Snow grains',80:'Showers',81:'Showers',82:'Heavy showers',85:'Snow showers',86:'Snow showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm' };
                    var windDir = getWindDirection(current.wind_direction_10m);
                    var uvInfo = getUVLevel(current.uv_index);
                    updateWeatherBackground(current.weather_code, current.temperature_2m);
                    
                    var html = '';
                    html += '<div class="weather-main"><span class="weather-icon-svg">' + getWeatherEmoji(current.weather_code) + '</span><span class="weather-temp">' + Math.round(current.temperature_2m) + '°C</span></div>';
                    html += '<div class="weather-desc">' + (dm[current.weather_code] || 'Unknown') + '</div>';
                    html += '<div class="weather-feels">Feels like ' + Math.round(current.apparent_temperature) + '°C</div>';
                    
                    html += '<div class="weather-details-grid">';
                    html += '<div class="weather-detail-card"><div class="weather-detail-icon">💧</div><div class="weather-detail-label">Humidity</div><div class="weather-detail-value">' + current.relative_humidity_2m + '%</div></div>';
                    html += '<div class="weather-detail-card"><div class="weather-detail-icon">💨</div><div class="weather-detail-label">Wind</div><div class="weather-detail-value">' + Math.round(current.wind_speed_10m) + ' km/h ' + windDir + '</div></div>';
                    html += '<div class="weather-detail-card"><div class="weather-detail-icon">👁️</div><div class="weather-detail-label">Visibility</div><div class="weather-detail-value">' + (current.visibility / 1000).toFixed(1) + ' km</div></div>';
                    html += '<div class="weather-detail-card"><div class="weather-detail-icon">☀️</div><div class="weather-detail-label">UV Index</div><div class="weather-detail-value">' + current.uv_index + ' <span style="color:' + uvInfo.color + ';font-size:0.7rem;">' + uvInfo.text + '</span></div><div class="uv-bar"><div class="uv-indicator" style="left:' + uvInfo.left + ';"></div></div></div>';
                    html += '<div class="weather-detail-card"><div class="weather-detail-icon">🌧️</div><div class="weather-detail-label">Rain Chance</div><div class="weather-detail-value">' + daily.precipitation_probability_max[0] + '%</div></div>';
                    html += '<div class="weather-detail-card"><div class="weather-detail-icon">📍</div><div class="weather-detail-label">Location</div><div class="weather-detail-value" style="font-size:0.75rem;">' + loc.name + ', ' + loc.country + '</div></div>';
                    html += '</div>';
                    
                    // Sunrise/Sunset with details
                    var sunriseTime = daily.sunrise[0].split('T')[1].slice(0, 5);
                    var sunsetTime = daily.sunset[0].split('T')[1].slice(0, 5);
                    var sunriseParts = sunriseTime.split(':');
                    var sunsetParts = sunsetTime.split(':');
                    var sunriseMins = parseInt(sunriseParts[0]) * 60 + parseInt(sunriseParts[1]);
                    var sunsetMins = parseInt(sunsetParts[0]) * 60 + parseInt(sunsetParts[1]);
                    var dayLengthMins = sunsetMins - sunriseMins;
                    var dayHours = Math.floor(dayLengthMins / 60);
                    var dayMins = dayLengthMins % 60;
                    
                    html += '<div class="sun-times">';
                    html += '<div class="sun-time-card"><div class="sun-time-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/></svg></div><div class="sun-time-label">Sunrise</div><div class="sun-time-value">' + sunriseTime + '</div></div>';
                    html += '<div class="sun-time-card"><div class="sun-time-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></div><div class="sun-time-label">Sunset</div><div class="sun-time-value">' + sunsetTime + '</div></div>';
                    html += '<div class="sun-time-card"><div class="sun-time-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div class="sun-time-label">Day Length</div><div class="sun-time-value">' + dayHours + 'h ' + dayMins + 'm</div></div>';
                    html += '</div>';
                    
                    if (current.weather_code >= 95) {
                        html += '<div class="weather-alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> Severe weather alert - ' + dm[current.weather_code] + '</div>';
                    } else if (current.wind_speed_10m > 40) {
                        html += '<div class="weather-alert"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> High wind warning - ' + Math.round(current.wind_speed_10m) + ' km/h</div>';
                    }
                    
                    weatherContent.innerHTML = html;
                });
        })
        .catch(function() { weatherContent.innerHTML = '<p class="weather-error">Failed to load weather</p>'; });
}

// ============ GLOBAL KEYBOARD ============
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeSidebar(); }
    if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== nameInput && document.activeElement !== sidebarCityInput && document.activeElement !== videoUrlInput) {
        e.preventDefault(); searchInput.focus();
    }
});

// ============ INIT ============
function init() {
    var savedAccent = localStorage.getItem('dashboard-accent') || 'blue';
    applyAccentColor(savedAccent);
    initTheme();
    loadName();
    loadCities();
    var savedOpacity = localStorage.getItem('dashboard-opacity') || '15';
    opacitySlider.value = savedOpacity;
    updateOpacity(savedOpacity);
    var savedBgType = localStorage.getItem('dashboard-bg-type') || 'image';
    setBgType(savedBgType);
    refreshBackground();
    fetchQuote();
    initBgTypeButtons();
    initUploadButtons();
    initVideoButtons();
    
    // Auto-refresh weather every 15 minutes
    setInterval(function() {
        if (currentCity) fetchWeather(currentCity);
    }, 5 * 60 * 1000);
}
init();
setInterval(fetchQuote, 5 * 60 * 1000);
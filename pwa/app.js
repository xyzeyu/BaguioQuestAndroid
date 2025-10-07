"use strict";

// ------- tiny helpers -------
function $(sel){ return document.querySelector(sel); }

// ------- routes -------
function home(){
  return (
    '<section class="grid cols-2">' +
      '<div class="card">' +
        '<h2>Welcome to BaguioQuest</h2>' +
        '<p>Local-aware navigation for Baguio City. Offline-ready, installable, and designed for tourists.</p>' +
        '<ul>' +
          '<li>✅ Coding-day alerts (plate-based)</li>' +
          '<li>✅ Offline map pack (view without data)</li>' +
          '<li>✅ GPS live tracking (when online)</li>' +
          '<li>✅ One-way & alternate routes emphasis</li>' +
        '</ul>' +
        '<div class="badge">PWA • Installable</div>' +
      '</div>' +
      '<div class="card">' +
        '<div class="hero">' +
          '<img src="./assets/baguio-hero.jpg" alt="Baguio City"/>' +
          '<div>' +
            '<h3>Quick Start</h3>' +
            '<ol>' +
              '<li>Tap <strong>Install App</strong> below to add to Home Screen</li>' +
              '<li>Use <strong>Plate Checker</strong> to see coding-day status</li>' +
              '<li>Open <strong>Map</strong> to view roads / POIs</li>' +
            '</ol>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

var CODING_RULES = {
  Monday:    [1,2],
  Tuesday:   [3,4],
  Wednesday: [5,6],
  Thursday:  [7,8],
  Friday:    [9,0]
};

function plateChecker(){
  var today = new Date().toLocaleDateString(undefined,{ weekday: 'long' });
  return (
    '<section class="card">' +
      '<h2>Plate Checker</h2>' +
      '<div class="kv">' +
        '<label for="plate">Plate Last Digit</label>' +
        '<input id="plate" class="input" placeholder="e.g., 7" maxlength="1" inputmode="numeric" />' +
        '<label>Today</label>' +
        '<div>' + today + ' <span class="badge">edit rules in <code>app.js</code></span></div>' +
        '<div></div>' +
        '<button class="btn" id="checkBtn">Check</button>' +
      '</div>' +
      '<p id="result" style="margin-top:12px;color:var(--muted)"></p>' +
    '</section>'
  );
}

function mapPage(){
  return (
    '<section class="card">' +
      '<h2>Map (Demo)</h2>' +
      '<p>This demo shows how an <em>offline map pack</em> could appear. GPS tracking needs permissions & a proper maps SDK.</p>' +
      '<div class="grid cols-2">' +
        '<div>' +
          '<label class="badge">Offline Pack</label>' +
          '<p>Cache your latest roads snapshot to view without data.</p>' +
          '<button class="btn" id="cacheRoadsBtn">Cache Roads JSON</button>' +
          '<pre id="cacheStatus" style="margin-top:8px;color:var(--muted)"></pre>' +
        '</div>' +
        '<div>' +
          '<label class="badge">Live GPS</label>' +
          '<p><small>Try geolocation:</small></p>' +
          '<button class="btn" id="gpsBtn">Get Location</button>' +
          '<pre id="gpsOut" style="margin-top:8px;color:var(--muted)"></pre>' +
        '</div>' +
      '</div>' +
    '</section>'
  );
}

function featuresPage(){ return fetch('./pages/features.html').then(function(r){ return r.text(); }); }
function helpPage(){ return fetch('./pages/help.html').then(function(r){ return r.text(); }); }

function notFound(){
  return '<div class="card"><h2>Not Found</h2><p>That page doesn\'t exist yet.</p></div>';
}

// route table
var routes = {
  '/': home,
  '/plate-checker': plateChecker,
  '/map': mapPage,
  '/features': featuresPage,
  '/help': helpPage
};

// ------- router -------
function currentPath(){
  // location.hash like "#/map" -> "/map"
  var h = window.location.hash || '#/';
  return h.charAt(0) === '#' ? h.slice(1) : h;
}

function render(){
  var path = currentPath();
  var view = routes[path] || notFound;
  $('#app').innerHTML = '';               // clear first (prevents double-binding)
  Promise.resolve(view()).then(function(html){
    $('#app').innerHTML = html;
    attachInteractions(path);
  });
}

window.addEventListener('hashchange', render);
window.addEventListener('load', function(){
  if (!window.location.hash) window.location.hash = '#/';
  render();
});

// ------- bind per-page events -------
function attachInteractions(path){
  if (path === '/plate-checker'){
    var out = $('#result');
    var btn = document.getElementById('checkBtn');
    if (btn){
      btn.addEventListener('click', function(){
        var v = (document.getElementById('plate') || { value:'' }).value.trim();
        var last = Number(v);
        if (isNaN(last)){
          out.style.color = 'var(--warn)';
          out.textContent = 'Enter a single digit (0-9).';
          return;
        }
        var today = new Date().toLocaleDateString(undefined,{ weekday: 'long' });
        var arr = CODING_RULES[today] || [];
        var restricted = arr.indexOf(last) !== -1;
        out.style.color = restricted ? 'var(--warn)' : 'var(--ok)';
        out.textContent = restricted
          ? ('Restricted today for plates ending in ' + last + '.')
          : ('Not restricted today for ' + last + '.');
      });
    }
  }

  if (path === '/map'){
    var cacheBtn = document.getElementById('cacheRoadsBtn');
    var cacheOut = document.getElementById('cacheStatus');
    if (cacheBtn){
      cacheBtn.addEventListener('click', function(){
        fetch('./data/roads.json')
          .then(function(r){ return r.blob(); })
          .then(function(b){
            return caches.open('bq-data-v1').then(function(c){
              return c.put('./data/roads.json', new Response(b));
            });
          })
          .then(function(){ if (cacheOut) cacheOut.textContent = 'Roads JSON cached for offline use.'; })
          .catch(function(){ if (cacheOut) cacheOut.textContent = 'Failed to cache roads.json'; });
      });
    }

    var gpsBtn = document.getElementById('gpsBtn');
    var gpsOut = document.getElementById('gpsOut');
    if (gpsBtn){
      gpsBtn.addEventListener('click', function(){
        if (!('geolocation' in navigator)){ if (gpsOut) gpsOut.textContent = 'Geolocation not supported.'; return; }
        navigator.geolocation.getCurrentPosition(
          function(pos){
            if (gpsOut){
              gpsOut.textContent = JSON.stringify({
                lat: pos.coords.latitude,
                lon: pos.coords.longitude,
                acc: pos.coords.accuracy
              }, null, 2);
            }
          },
          function(){
            if (gpsOut) gpsOut.textContent = 'Denied or unavailable.';
          }
        );
      });
    }
  }
}

// ------- custom install prompt -------
var deferredPrompt = null;
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  deferredPrompt = e;
  var btn = document.getElementById('installBtn');
  if (!btn) return;
  btn.hidden = false;
  btn.addEventListener('click', function(){
    btn.hidden = true;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(){ deferredPrompt = null; });
  });
});

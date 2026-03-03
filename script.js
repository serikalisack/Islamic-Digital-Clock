"use strict";

const STORAGE_KEY = "islamicClockPreferences";

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    const elements = {
        clock: document.getElementById("clock"),
        date: document.getElementById("date"),
        hijriDate: document.getElementById("hijri-date"),
        greeting: document.getElementById("greeting"),
        prayerTimes: document.getElementById("prayer-times"),
        toggleHour: document.getElementById("toggle-12-24"),
        toggleGregorian: document.getElementById("toggle-gregorian"),
        toggleHijri: document.getElementById("toggle-hijri"),
        toggleTheme: document.getElementById("toggle-theme"),
        themeMeta: document.getElementById("theme-color-meta")
    };

    const state = loadPreferences();

    applyPreferences(elements, state);
    attachEvents(elements, state);
    startClock(elements, state);
    updateDate(elements);
    fetchPrayerTimes(elements);

    registerServiceWorker();
}

/* =========================
   CLOCK
========================= */

function startClock(elements, state) {
    updateClock(elements, state);
    setInterval(() => updateClock(elements, state), 1000);
}

function updateClock(elements, state) {
    const now = new Date();

    const hours = state.is24Hour
        ? now.getHours()
        : ((now.getHours() % 12) || 12);

    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const ampm = now.getHours() >= 12 ? "PM" : "AM";

    elements.clock.textContent = state.is24Hour
        ? `${hours}:${minutes}:${seconds}`
        : `${hours}:${minutes}:${seconds} ${ampm}`;

    elements.greeting.textContent = getGreeting(now.getHours());
}

/* =========================
   DATE
========================= */

function updateDate(elements) {
    const now = new Date();

    elements.date.textContent = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    }).format(now);

    elements.hijriDate.textContent = new Intl.DateTimeFormat(
        "en-TZ-u-ca-islamic",
        { day: "numeric", month: "long", year: "numeric" }
    ).format(now);
}

/* =========================
   PRAYER TIMES (Auto Location)
========================= */

function fetchPrayerTimes(elements) {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async position => {
        const { latitude, longitude } = position.coords;

        const response = await fetch(
            `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
        );

        const data = await response.json();
        const timings = data.data.timings;

        renderPrayerTimes(elements.prayerTimes, timings);
    });
}

function renderPrayerTimes(container, timings) {
    const prayers = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

    container.innerHTML = prayers
        .map(prayer => `<div><strong>${prayer}</strong>: ${timings[prayer]}</div>`)
        .join("");
}

/* =========================
   THEME
========================= */

function applyTheme(isDark, elements) {
    document.body.classList.toggle("dark", isDark);
    elements.themeMeta.setAttribute(
        "content",
        isDark ? "#0d1b2a" : "#ffffff"
    );
}

function getGreeting(hour) {
    if (hour < 6) return "Good Night";
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
}

/* =========================
   LOCAL STORAGE
========================= */

function loadPreferences() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        is24Hour: false,
        showGregorian: true,
        showHijri: true,
        darkMode: false
    };
}

function savePreferences(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function applyPreferences(elements, state) {
    elements.toggleHour.checked = state.is24Hour;
    elements.toggleGregorian.checked = state.showGregorian;
    elements.toggleHijri.checked = state.showHijri;
    elements.toggleTheme.checked = state.darkMode;

    elements.date.style.display = state.showGregorian ? "block" : "none";
    elements.hijriDate.style.display = state.showHijri ? "block" : "none";

    applyTheme(state.darkMode, elements);
}

function attachEvents(elements, state) {
    elements.toggleHour.addEventListener("change", e => {
        state.is24Hour = e.target.checked;
        savePreferences(state);
    });

    elements.toggleGregorian.addEventListener("change", e => {
        state.showGregorian = e.target.checked;
        elements.date.style.display = e.target.checked ? "block" : "none";
        savePreferences(state);
    });

    elements.toggleHijri.addEventListener("change", e => {
        state.showHijri = e.target.checked;
        elements.hijriDate.style.display = e.target.checked ? "block" : "none";
        savePreferences(state);
    });

    elements.toggleTheme.addEventListener("change", e => {
        state.darkMode = e.target.checked;
        applyTheme(state.darkMode, elements);
        savePreferences(state);
    });
}

/* =========================
   SERVICE WORKER
========================= */

function registerServiceWorker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("service-worker.js");
    }
}
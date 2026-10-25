/**
 * Kintsu Study Vault - Dashboard Logic (Compact & Easy to Explain)
 * 1. User Profile & Theme Toggle
 * 2. Data Loading & Dual JSON Persistence (localStorage + data/notes.json)
 * 3. Dynamic Note Card Rendering
 * 4. Form Validation & Submission (New Note)
 * 5. One-Click JSON Export (Evaluation Parameter 4)
 * 6. Modal Controls & Note Deletion
 */

let notes = [];

// DOM Elements
const notesGrid = document.getElementById('notesGrid');
const emptyState = document.getElementById('emptyState');
const notesCount = document.getElementById('notesSectionCount');
const allNotesBadge = document.getElementById('allNotesBadge');
const modal = document.getElementById('createNoteModal');
const createForm = document.getElementById('createNoteForm');
const titleInput = document.getElementById('noteTitleInput');
const videoInput = document.getElementById('noteVideoInput');
const titleError = document.getElementById('titleError');
const videoError = document.getElementById('videoError');

// 1. SETUP: User Name, Theme Toggle, & Banner
function initApp() {
    const user = JSON.parse(localStorage.getItem('kintsu_user') || '{}');
    if (user.username) {
        document.getElementById('welcomeUserPill').textContent = user.username;
        document.getElementById('userEmailTag').textContent = user.email || user.username;
    }

    const themeBtn = document.getElementById('dashThemeToggle');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const isLight = document.body.classList.toggle('light-theme');
            document.body.classList.toggle('dark-theme', !isLight);
            themeBtn.querySelector('.theme-icon').textContent = isLight ? '🌙' : '☀️';
            localStorage.setItem('kintsu_theme', isLight ? 'light' : 'dark');
        };
    }

    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
        signOutBtn.onclick = () => {
            localStorage.removeItem('kintsu_user');
            window.location.href = 'signin.html';
        };
    }

    const dismissBtn = document.getElementById('dismissBannerBtn');
    if (dismissBtn) {
        dismissBtn.onclick = () => {
            document.getElementById('sampleBanner').style.display = 'none';
            localStorage.setItem('kintsu_banner_dismissed', 'true');
        };
        if (localStorage.getItem('kintsu_banner_dismissed')) {
            document.getElementById('sampleBanner').style.display = 'none';
        }
    }

    loadNotes();
}

// 2. DATA LAYER: Load from localStorage or data/notes.json
function loadNotes() {
    const local = localStorage.getItem('kintsu_notes');
    if (local) {
        notes = JSON.parse(local);
        renderNotes();
        return;
    }
    fetch('data/notes.json')
        .then(res => res.json())
        .then(data => { notes = data; saveNotes(); renderNotes(); })
        .catch(() => {
            notes = [{ id: 'LPZH9BDJ', title: 'Neural Network Fundamentals: Structural Overview', date: '25/10/2026', videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk', coverTheme: 'llm' }];
            saveNotes();
            renderNotes();
        });
}

// Save notes to localStorage AND send to server to write data/notes.json on disk
function saveNotes() {
    localStorage.setItem('kintsu_notes', JSON.stringify(notes, null, 2));
    if (window.fetch) {
        fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(notes)
        }).catch(() => {});
    }
}

// 3. UI RENDERING: Display Notes Grid
function renderNotes() {
    notesGrid.innerHTML = '';
    if (allNotesBadge) allNotesBadge.textContent = notes.length;
    if (notesCount) notesCount.textContent = `(${notes.length})`;

    if (notes.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        const coverTitle = note.coverTheme === 'python' ? 'PYTHON' : (note.coverTheme === 'web' ? 'WEB DEV' : 'LLM');
        const coverBg = note.coverTheme === 'python' ? '#1e293b' : '#130d1a';

        card.innerHTML = `
            <div class="note-cover" style="background: ${coverBg};">
                <svg class="cover-svg" viewBox="0 0 320 160">
                    <line x1="40" y1="120" x2="160" y2="40" stroke="#ef4444" stroke-width="1.5"/>
                    <line x1="160" y1="40" x2="280" y2="130" stroke="#38bdf8" stroke-width="1.5"/>
                    <circle cx="60" cy="110" r="14" fill="#ffffff"/>
                    <circle cx="160" cy="45" r="16" fill="#ffffff"/>
                    <circle cx="230" cy="95" r="18" fill="#ffffff"/>
                    <text x="20" y="42" fill="#ffffff" font-family="Space Grotesk" font-weight="900" font-size="28">${coverTitle}</text>
                </svg>
            </div>
            <div class="note-card-body">
                <span class="note-id-badge">ID · ${note.id}</span>
                <h3 class="note-card-title">${escapeHtml(note.title)}</h3>
                <div class="note-card-footer">
                    <span class="note-date">${note.date}</span>
                    <div class="card-actions-group">
                        <button type="button" class="btn-card-delete" onclick="deleteNote('${note.id}')" title="Delete note">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                        <a href="index.html#workspace" class="btn-card-open" onclick="openNote('${note.id}')" title="Open in Workspace">
                            <span>Open</span> <span>↗</span>
                        </a>
                    </div>
                </div>
            </div>`;
        notesGrid.appendChild(card);
    });
}

// Open Note in Workspace
window.openNote = function (id) {
    const note = notes.find(n => n.id === id);
    if (note) localStorage.setItem('kintsu_active_note', JSON.stringify(note));
};

// Delete Note
window.deleteNote = function (id) {
initApp();

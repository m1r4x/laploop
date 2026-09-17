const STORAGE_KEY = 'lap-tracker-v1';
const MAX_STUDENTS = 7;
const STUDENT_COLORS = [
  { base: '#31c48d', soft: 'rgba(49, 196, 141, 0.18)' },
  { base: '#7aa2ff', soft: 'rgba(122, 162, 255, 0.18)' },
  { base: '#ffb703', soft: 'rgba(255, 183, 3, 0.18)' },
  { base: '#ff7a59', soft: 'rgba(255, 122, 89, 0.18)' },
  { base: '#d77bff', soft: 'rgba(215, 123, 255, 0.18)' },
  { base: '#4dd0e1', soft: 'rgba(77, 208, 225, 0.18)' },
  { base: '#ff6b9b', soft: 'rgba(255, 107, 155, 0.18)' }
];

const state = loadState();
const elements = {
  classNameInput: document.querySelector('#classNameInput'),
  sessionTimer: document.querySelector('#sessionTimer'),
  studentSelect: document.querySelector('#studentSelect'),
  studentsList: document.querySelector('#studentsList'),
  activeStudentSummary: document.querySelector('#activeStudentSummary'),
  lapsList: document.querySelector('#lapsList'),
  studentButtonsGrid: document.querySelector('#studentButtonsGrid'),
  lapNoteInput: document.querySelector('#lapNoteInput'),
  finishAllBtn: document.querySelector('#finishAllBtn'),
  exportJsonBtn: document.querySelector('#exportJsonBtn'),
  exportCsvBtn: document.querySelector('#exportCsvBtn'),
  refreshCacheBtn: document.querySelector('#refreshCacheBtn'),
  customDialog: document.querySelector('#customDialog'),
  customDialogTitle: document.querySelector('#customDialogTitle'),
  customDialogText: document.querySelector('#customDialogText'),
  dialogPrimaryBtn: document.querySelector('#dialogPrimaryBtn'),
  dialogSecondaryBtn: document.querySelector('#dialogSecondaryBtn'),
  dialogCloseBtn: document.querySelector('#dialogCloseBtn'),
  addStudentBtn: document.querySelector('#addStudentBtn'),
  studentFormSection: document.querySelector('#studentFormSection'),
  newStudentName: document.querySelector('#newStudentName'),
  saveStudentBtn: document.querySelector('#saveStudentBtn'),
  cancelStudentBtn: document.querySelector('#cancelStudentBtn')
};

function createDefaultState() {
  return {
    className: 'Classe 1',
    sessionStartedAt: null,
    activeStudentId: null,
    students: [
      {
        id: createId(),
        name: 'Studente 1',
        laps: [],
        sessionStartedAt: null
      },
      {
        id: createId(),
        name: 'Studente 2',
        laps: [],
        sessionStartedAt: null
      }
    ]
  };
}

function createId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.students)) {
      return createDefaultState();
    }

    if (!parsed.activeStudentId && parsed.students.length > 0) {
      parsed.activeStudentId = parsed.students[0].id;
    }

    parsed.students = parsed.students.map((student) => ({
      ...student,
      sessionStartedAt: student.sessionStartedAt || null
    }));

    parsed.sessionStartedAt = null;
    return parsed;
  } catch (error) {
    console.error('Errore nel caricamento dei dati', error);
    return createDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function getActiveStudent() {
  return state.students.find((student) => student.id === state.activeStudentId) || state.students[0];
}

function formatDuration(ms) {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function formatShortDuration(ms) {
  const safeMs = Number.isFinite(ms) ? Math.max(0, ms) : 0;
  const totalSeconds = Math.floor(safeMs / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function formatTimeStamp(ms) {
  return new Date(ms).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

function ensureActiveStudent() {
  if (!state.activeStudentId && state.students.length) {
    state.activeStudentId = state.students[0].id;
  }

  if (!state.students.some((student) => student.id === state.activeStudentId)) {
    state.activeStudentId = state.students[0]?.id || null;
  }
}

function renderStudentSelect() {
  const options = state.students
    .map(
      (student) =>
        `<option value="${student.id}" ${student.id === state.activeStudentId ? 'selected' : ''}>${escapeHtml(student.name)}</option>`
    )
    .join('');

  elements.studentSelect.innerHTML = options || '<option value="">Nessuno studente</option>';
}

function renderStudentsList() {
  if (!state.students.length) {
    elements.studentsList.innerHTML = '<div class="empty-state">Nessuno studente ancora. Aggiungine uno per iniziare.</div>';
    return;
  }

  elements.studentsList.innerHTML = state.students
    .map((student, index) => {
      const isActive = student.id === state.activeStudentId;
      const lastLap = student.laps[student.laps.length - 1];
      const color = STUDENT_COLORS[index % STUDENT_COLORS.length];
      const lastLapLabel = lastLap ? formatShortDuration(lastLap.lapTimeMs) : '0:00';

      return `
        <div class="student-row">
          <button
            class="student-card ${isActive ? 'active' : ''}"
            data-student-id="${student.id}"
            type="button"
            style="--student-accent:${color.base}; --student-accent-soft:${color.soft};"
          >
            <span class="student-card__counter">${student.laps.length}</span>
            <span class="student-card__content">
              <span class="student-name">${escapeHtml(student.name)}</span>
              <span class="student-meta">${lastLap ? `Ultimo: ${lastLapLabel}` : 'Nessun giro'}</span>
            </span>
            <span class="student-card__pill">${lastLap ? formatShortDuration(lastLap.cumulativeTimeMs) : '00:00'}</span>
          </button>
          <button class="rename-student-btn" type="button" data-student-id="${student.id}" aria-label="Rinomina studente">✎</button>
        </div>
      `;
    })
    .join('');

  elements.studentsList.querySelectorAll('.student-card').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeStudentId = button.dataset.studentId;
      saveState();
      render();
    });
  });

  elements.studentsList.querySelectorAll('.rename-student-btn').forEach((button) => {
    button.addEventListener('click', () => {
      renameStudent(button.dataset.studentId);
    });
  });
}

function renderSummary() {
  const activeStudent = getActiveStudent();

  if (!activeStudent) {
    elements.activeStudentSummary.innerHTML = '<div class="empty-state">Seleziona uno studente.</div>';
    return;
  }

  const totalLaps = activeStudent.laps.length;
  const totalTime = activeStudent.laps.length ? activeStudent.laps[activeStudent.laps.length - 1].cumulativeTimeMs : 0;
  const lastLap = activeStudent.laps[activeStudent.laps.length - 1];

  elements.activeStudentSummary.innerHTML = `
    <div class="summary-name">${escapeHtml(activeStudent.name)}</div>
    <div class="stat-grid">
      <div class="stat-box">
        <span class="label">Giri</span>
        <span class="value">${totalLaps}</span>
      </div>
      <div class="stat-box">
        <span class="label">Totale</span>
        <span class="value">${formatDuration(totalTime)}</span>
      </div>
      <div class="stat-box">
        <span class="label">Ultimo giro</span>
        <span class="value">${lastLap ? formatShortDuration(lastLap.lapTimeMs) : '00:00'}</span>
      </div>
      <div class="stat-box">
        <span class="label">Ora</span>
        <span class="value">${formatTimeStamp(Date.now())}</span>
      </div>
    </div>
  `;
}

function reindexStudentLaps(student) {
  student.laps.forEach((lap, index) => {
    lap.lapNumber = index + 1;
  });
}

function renderLaps() {
  const activeStudent = getActiveStudent();

  if (!activeStudent) {
    elements.lapsList.innerHTML = '<div class="empty-state">Nessun dato.</div>';
    return;
  }

  if (!activeStudent.laps.length) {
    elements.lapsList.innerHTML = '<div class="empty-state">Ancora nessun giro registrato per questo studente.</div>';
    return;
  }

  elements.lapsList.innerHTML = [...activeStudent.laps].reverse().map((lap) => {
    return `
      <div class="lap-row" data-lap-id="${lap.id}">
        <div class="lap-number">#${lap.lapNumber}</div>
        <div class="lap-meta">${formatTimeStamp(lap.timestamp)}</div>
        <div class="lap-time"><strong>${formatShortDuration(lap.lapTimeMs)}</strong> Lap</div>
        <div class="lap-cumulative"><strong>${formatDuration(lap.cumulativeTimeMs)}</strong> Totale</div>
        <div class="lap-actions">
          <button type="button" class="mini-button" data-action="edit-lap" data-lap-id="${lap.id}">Modifica</button>
          <button type="button" class="mini-button danger" data-action="delete-lap" data-lap-id="${lap.id}">Elimina</button>
        </div>
      </div>
    `;
  }).join('');
}

function renderTimer() {
  const activeStudent = getActiveStudent();
  const activeSessionStart = state.sessionStartedAt || activeStudent?.sessionStartedAt || null;

  if (!activeSessionStart) {
    elements.sessionTimer.textContent = '00:00:00';
    return;
  }

  const elapsed = Date.now() - activeSessionStart;
  elements.sessionTimer.textContent = formatDuration(elapsed);
}

function renderStudentButtons() {
  if (!state.students.length) {
    elements.studentButtonsGrid.innerHTML = '<div class="empty-state">Nessuno studente aggiunto.</div>';
    return;
  }

  elements.studentButtonsGrid.innerHTML = state.students
    .map((student, index) => {
      const color = STUDENT_COLORS[index % STUDENT_COLORS.length];
      const lastLap = student.laps[student.laps.length - 1];
      const totalTime = lastLap ? lastLap.cumulativeTimeMs : 0;
      const isActive = student.id === state.activeStudentId;
      const liveTimeMs = student.sessionStartedAt ? Date.now() - student.sessionStartedAt : totalTime;

      return `
        <div class="student-button-shell" data-student-id="${student.id}">
          <button
            class="student-lap-button ${isActive ? 'active' : ''} ${student.sessionStartedAt ? 'running' : ''}"
            data-student-id="${student.id}"
            type="button"
            style="--student-accent:${color.base}; --student-accent-soft:${color.soft};"
            aria-label="Registra un giro per ${escapeHtml(student.name)}"
          >
            <span class="student-lap-button__runner" aria-hidden="true">🏃</span>
            <span class="student-lap-button__body">
              <span class="student-lap-button__name">${escapeHtml(student.name)}</span>
              <span class="student-lap-button__count">${student.laps.length} giri</span>
              <span class="student-lap-button__time">${formatDuration(liveTimeMs)}</span>
            </span>
          </button>
          <button class="student-finish-btn" data-student-id="${student.id}" type="button">Fine</button>
        </div>
      `;
    })
    .join('');

  elements.studentButtonsGrid.querySelectorAll('.student-lap-button').forEach((button) => {
    button.addEventListener('click', () => {
      const studentId = button.dataset.studentId;
      state.activeStudentId = studentId;
      recordLap(studentId);
    });
  });

  elements.studentButtonsGrid.querySelectorAll('.student-finish-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const studentId = button.dataset.studentId;
      state.activeStudentId = studentId;
      finishStudentSession(studentId);
    });
  });
}

function render() {
  ensureActiveStudent();
  elements.classNameInput.value = state.className || 'Classe 1';
  renderStudentSelect();
  renderStudentsList();
  renderStudentButtons();
  renderSummary();
  renderLaps();
  renderTimer();
}

function addStudent(name) {
  const trimmedName = name.trim();
  if (!trimmedName) {
    return;
  }

  if (state.students.length >= MAX_STUDENTS) {
    showCustomDialog({
      title: 'Limite studenti',
      text: `Puoi monitorare al massimo ${MAX_STUDENTS} ragazzi contemporaneamente.`,
      primaryLabel: 'Ok',
      secondaryLabel: 'Chiudi',
      onPrimary: () => {},
      onSecondary: () => {}
    });
    return;
  }

  const student = {
    id: createId(),
    name: trimmedName,
    laps: []
  };

  state.students.push(student);
  state.activeStudentId = student.id;
  saveState();
  render();
}

function renameStudent(studentId) {
  const student = state.students.find((item) => item.id === studentId);
  if (!student) {
    return;
  }

  const nextName = window.prompt('Nuovo nome studente:', student.name);
  if (nextName === null) {
    return;
  }

  const trimmed = nextName.trim();
  if (!trimmed) {
    return;
  }

  student.name = trimmed;
  saveState();
  render();
}

function recordLap(studentId = state.activeStudentId) {
  const activeStudent = state.students.find((student) => student.id === studentId) || getActiveStudent();
  if (!activeStudent) {
    return;
  }

  const now = Date.now();

  if (!activeStudent.sessionStartedAt) {
    activeStudent.sessionStartedAt = now;
  }

  state.sessionStartedAt = activeStudent.sessionStartedAt;

  const previousLap = activeStudent.laps[activeStudent.laps.length - 1];
  const lastTimestamp = previousLap ? previousLap.timestamp : activeStudent.sessionStartedAt;
  const lapTimeMs = previousLap ? now - lastTimestamp : 0;
  const cumulativeTimeMs = previousLap ? previousLap.cumulativeTimeMs + lapTimeMs : lapTimeMs;

  const newLap = {
    id: createId(),
    lapNumber: activeStudent.laps.length + 1,
    lapTimeMs,
    cumulativeTimeMs,
    timestamp: now,
    note: elements.lapNoteInput.value.trim()
  };

  activeStudent.laps.push(newLap);
  elements.lapNoteInput.value = '';
  state.activeStudentId = activeStudent.id;
  saveState();
  render();
}

function undoLastLap() {
  const activeStudent = getActiveStudent();
  if (!activeStudent || !activeStudent.laps.length) {
    return;
  }

  activeStudent.laps.pop();
  if (!activeStudent.laps.length) {
    activeStudent.sessionStartedAt = null;
    state.sessionStartedAt = null;
  }
  saveState();
  render();
}

function showCustomDialog({ title, text, primaryLabel, secondaryLabel, onPrimary, onSecondary }) {
  elements.customDialogTitle.textContent = title;
  elements.customDialogText.textContent = text;
  elements.dialogPrimaryBtn.textContent = primaryLabel;
  elements.dialogSecondaryBtn.textContent = secondaryLabel;

  elements.dialogPrimaryBtn.onclick = () => {
    elements.customDialog.classList.add('hidden');
    if (onPrimary) {
      onPrimary();
    }
  };

  elements.dialogSecondaryBtn.onclick = () => {
    elements.customDialog.classList.add('hidden');
    if (onSecondary) {
      onSecondary();
    }
  };

  elements.dialogCloseBtn.onclick = () => {
    elements.customDialog.classList.add('hidden');
  };

  elements.customDialog.classList.remove('hidden');
  elements.customDialog.setAttribute('aria-hidden', 'false');
}

function finishStudentSession(studentId = state.activeStudentId) {
  const activeStudent = state.students.find((student) => student.id === studentId) || getActiveStudent();
  if (!activeStudent) {
    return;
  }

  if (!activeStudent.sessionStartedAt) {
    showCustomDialog({
      title: 'Fine corsa',
      text: `Confermi la chiusura della corsa di ${activeStudent.name}?`,
      primaryLabel: 'Sì',
      secondaryLabel: 'No',
      onPrimary: () => {
        activeStudent.sessionStartedAt = null;
        state.sessionStartedAt = null;
        elements.lapNoteInput.value = '';
        saveState();
        render();
      }
    });
    return;
  }

  showCustomDialog({
    title: 'Ultimo giro',
    text: `Salvare l'ultimo tempo di ${activeStudent.name} come giro finale?`,
    primaryLabel: 'Salva',
    secondaryLabel: 'No, chiudi',
    onPrimary: () => {
      const now = Date.now();
      const previousLap = activeStudent.laps[activeStudent.laps.length - 1];
      const lastTimestamp = previousLap ? previousLap.timestamp : activeStudent.sessionStartedAt;
      const lapTimeMs = previousLap ? now - lastTimestamp : now - activeStudent.sessionStartedAt;
      const cumulativeTimeMs = previousLap ? previousLap.cumulativeTimeMs + lapTimeMs : lapTimeMs;

      activeStudent.laps.push({
        id: createId(),
        lapNumber: activeStudent.laps.length + 1,
        lapTimeMs,
        cumulativeTimeMs,
        timestamp: now,
        note: elements.lapNoteInput.value.trim() || 'Corsa conclusa'
      });

      activeStudent.sessionStartedAt = null;
      state.sessionStartedAt = null;
      elements.lapNoteInput.value = '';
      saveState();
      render();
    },
    onSecondary: () => {
      activeStudent.sessionStartedAt = null;
      state.sessionStartedAt = null;
      elements.lapNoteInput.value = '';
      saveState();
      render();
    }
  });
}

function finishAllActiveStudents() {
  const runningStudents = state.students.filter((student) => student.sessionStartedAt);
  if (!runningStudents.length) {
    return;
  }

  showCustomDialog({
    title: 'Fine corsa',
    text: 'Chiudere la corsa di tutti gli studenti attivi?',
    primaryLabel: 'Sì',
    secondaryLabel: 'No',
    onPrimary: () => {
      runningStudents.forEach((student) => {
        student.sessionStartedAt = null;
      });

      state.sessionStartedAt = null;
      elements.lapNoteInput.value = '';
      saveState();
      render();
    },
    onSecondary: () => {}
  });
}

async function forceReloadApp() {
  showCustomDialog({
    title: 'Aggiorna app',
    text: 'Ripristinare la situazione iniziale dell\'app e ricaricarla?',
    primaryLabel: 'Sì',
    secondaryLabel: 'No',
    onPrimary: async () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        state.className = 'Classe 1';
        state.activeStudentId = null;
        state.sessionStartedAt = null;
        state.students = [
          { id: createId(), name: 'Studente 1', laps: [] },
          { id: createId(), name: 'Studente 2', laps: [] }
        ];
        state.activeStudentId = state.students[0].id;
        saveState();

        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));
        }

        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
        }
      } catch (error) {
        console.warn('Impossibile svuotare cache del service worker:', error);
      } finally {
        window.location.reload();
      }
    },
    onSecondary: () => {}
  });
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${sanitizeFileName(state.className || 'classe')}.json`);
}

function exportToCsv() {
  if (!state.students.length) {
    return;
  }

  const rows = [
    ['studentName', 'lapNumber', 'timestamp', 'lapTimeMs', 'cumulativeTimeMs', 'note'],
    ...state.students.flatMap((student) =>
      student.laps.map((lap) => [
        student.name,
        lap.lapNumber,
        new Date(lap.timestamp).toISOString(),
        lap.lapTimeMs,
        lap.cumulativeTimeMs,
        lap.note || ''
      ])
    )
  ];

  const csvContent = rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${sanitizeFileName(state.className || 'classe')}-giri.csv`);
}

function sanitizeFileName(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'dati';
}

function escapeCsvValue(value) {
  const safeValue = String(value ?? '');
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function editLapNote(lapId) {
  const activeStudent = getActiveStudent();
  if (!activeStudent) {
    return;
  }

  const lap = activeStudent.laps.find((item) => item.id === lapId);
  if (!lap) {
    return;
  }

  const nextNote = window.prompt('Modifica nota del giro:', lap.note || '');
  if (nextNote === null) {
    return;
  }

  lap.note = nextNote.trim();
  saveState();
  render();
}

function deleteLapById(lapId) {
  const activeStudent = getActiveStudent();
  if (!activeStudent) {
    return;
  }

  const lap = activeStudent.laps.find((item) => item.id === lapId);
  if (!lap) {
    return;
  }

  showCustomDialog({
    title: 'Elimina giro',
    text: `Eliminare il giro #${lap.lapNumber} di ${activeStudent.name}?`,
    primaryLabel: 'Sì',
    secondaryLabel: 'No',
    onPrimary: () => {
      activeStudent.laps = activeStudent.laps.filter((item) => item.id !== lapId);
      reindexStudentLaps(activeStudent);
      saveState();
      render();
    },
    onSecondary: () => {}
  });
}

function bindEvents() {
  elements.classNameInput.addEventListener('input', (event) => {
    state.className = event.target.value || 'Classe 1';
    saveState();
  });

  elements.studentSelect.addEventListener('change', (event) => {
    state.activeStudentId = event.target.value;
    saveState();
    render();
  });

  elements.finishAllBtn.addEventListener('click', finishAllActiveStudents);
  elements.exportJsonBtn.addEventListener('click', exportToJson);
  elements.exportCsvBtn.addEventListener('click', exportToCsv);
  elements.refreshCacheBtn.addEventListener('click', forceReloadApp);

  elements.addStudentBtn.addEventListener('click', () => {
    elements.studentFormSection.classList.remove('hidden');
    elements.newStudentName.focus();
  });

  elements.cancelStudentBtn.addEventListener('click', () => {
    elements.studentFormSection.classList.add('hidden');
    elements.newStudentName.value = '';
  });

  elements.saveStudentBtn.addEventListener('click', () => {
    addStudent(elements.newStudentName.value);
    elements.newStudentName.value = '';
    elements.studentFormSection.classList.add('hidden');
  });

  elements.newStudentName.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      addStudent(elements.newStudentName.value);
      elements.newStudentName.value = '';
      elements.studentFormSection.classList.add('hidden');
    }
  });

  elements.lapsList.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) {
      return;
    }

    const lapId = button.dataset.lapId;
    if (button.dataset.action === 'edit-lap') {
      editLapNote(lapId);
    }

    if (button.dataset.action === 'delete-lap') {
      deleteLapById(lapId);
    }
  });

  elements.studentsList.addEventListener('contextmenu', (event) => {
    const studentButton = event.target.closest('[data-student-id]');
    if (!studentButton) {
      return;
    }

    event.preventDefault();
    renameStudent(studentButton.dataset.studentId);
  });

  elements.studentsList.addEventListener('dblclick', (event) => {
    const studentButton = event.target.closest('[data-student-id]');
    if (!studentButton) {
      return;
    }

    renameStudent(studentButton.dataset.studentId);
  });
}

bindEvents();
render();
setInterval(() => {
  render();
}, 1000);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js?v=2').catch((error) => {
      console.warn('Service worker non registrato:', error);
    });
  });
}

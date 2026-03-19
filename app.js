const API_BASE = '/api';
const STORAGE_KEY = 'exercise-tracker-demo-state-v1';
const FALLBACK_ENDPOINTS = {
  exercises: [`${API_BASE}/exercises`, '/data/exercises.json'],
  data: [`${API_BASE}/data`, '/data/data.json']
};

const exerciseInput = document.getElementById('exercise-input');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const exerciseList = document.getElementById('exercise-list');
const dateInput = document.getElementById('date-input');
const exerciseInputs = document.getElementById('exercise-inputs');
const submitDataBtn = document.getElementById('submit-data-btn');
const dataBody = document.getElementById('data-body');
const averagesContainer = document.getElementById('averages-container');
const chartsContainer = document.getElementById('charts-container');

let exercises = [];
let workoutData = [];
let charts = {};
let memoryState = null;

document.addEventListener('DOMContentLoaded', async () => {
  setDefaultDate();
  await initializeApp();
});

function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}

async function initializeApp() {
  const state = await ensureDemoState();
  exercises = state.exercises;
  workoutData = state.data;
  renderAll();
}

async function ensureDemoState() {
  const storedState = readStoredState();
  if (storedState) {
    return storedState;
  }

  const [seedExercises, seedData] = await Promise.all([
    fetchJsonWithFallback(FALLBACK_ENDPOINTS.exercises),
    fetchJsonWithFallback(FALLBACK_ENDPOINTS.data)
  ]);

  const seededState = {
    exercises: normalizeExercises(seedExercises),
    data: normalizeWorkoutData(seedData)
  };

  if (seededState.exercises.length > 0 || seededState.data.length > 0) {
    writeStoredState(seededState);
  }

  return seededState;
}

async function fetchJsonWithFallback(urls) {
  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' }
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Response was not JSON');
      }

      return await response.json();
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    console.error('Error loading seed data:', lastError);
  }

  return [];
}

function normalizeExercises(items) {
  return items
    .map((item) => ({
      id: Number(item.id),
      name: String(item.name || '').trim()
    }))
    .filter((item) => Number.isFinite(item.id) && item.name);
}

function normalizeWorkoutData(items) {
  return items
    .map((item) => ({
      id: Number(item.id),
      exercise: String(item.exercise || '').trim(),
      date: String(item.date || '').trim(),
      value: Number(item.value)
    }))
    .filter(
      (item) =>
        Number.isFinite(item.id) &&
        item.exercise &&
        item.date &&
        Number.isFinite(item.value)
    );
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

function readStoredState() {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);
    if (!rawState) {
      return memoryState ? cloneState(memoryState) : null;
    }

    const parsedState = JSON.parse(rawState);
    return {
      exercises: normalizeExercises(parsedState.exercises || []),
      data: normalizeWorkoutData(parsedState.data || [])
    };
  } catch (error) {
    if (memoryState) {
      return cloneState(memoryState);
    }

    console.error('Error reading demo state:', error);
    return null;
  }
}

function writeStoredState(state) {
  const nextState = {
    exercises: normalizeExercises(state.exercises || []),
    data: normalizeWorkoutData(state.data || [])
  };

  memoryState = cloneState(nextState);

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (error) {
    console.error('Error saving demo state:', error);
  }
}

function saveState() {
  writeStoredState({ exercises, data: workoutData });
}

function renderAll() {
  renderExercises();
  renderExerciseInputs();
  renderDataTable(workoutData);
  updateChart();
}

function renderExercises() {
  exerciseList.innerHTML = '';

  exercises.forEach((exercise) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${exercise.name}</span>
      <button class="delete-btn" data-id="${exercise.id}">Delete</button>
    `;
    exerciseList.appendChild(li);
  });
}

function renderExerciseInputs() {
  exerciseInputs.innerHTML = '';

  exercises.forEach((exercise) => {
    const div = document.createElement('div');
    div.className = 'exercise-input-group';
    div.innerHTML = `
      <label for="input-${exercise.id}">${exercise.name}:</label>
      <input type="number" id="input-${exercise.id}" step="0.01" placeholder="Enter value">
    `;
    exerciseInputs.appendChild(div);
  });
}

function renderDataTable(data) {
  const sortedData = [...data].sort(compareDataEntriesDesc);
  dataBody.innerHTML = '';

  sortedData.forEach((item) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${item.exercise}</td>
      <td>${item.value}</td>
      <td><button class="delete-btn" data-id="${item.id}">Delete</button></td>
    `;
    dataBody.appendChild(tr);
  });

  const averages = {};
  const counts = {};

  data.forEach((item) => {
    if (!averages[item.exercise]) {
      averages[item.exercise] = 0;
      counts[item.exercise] = 0;
    }

    averages[item.exercise] += Number(item.value);
    counts[item.exercise] += 1;
  });

  averagesContainer.innerHTML = '<h3>Average</h3>';

  Object.keys(averages)
    .sort((a, b) => a.localeCompare(b))
    .forEach((exercise) => {
      const avg = Math.round(averages[exercise] / counts[exercise]);
      const p = document.createElement('p');
      p.textContent = `${exercise}: ${avg}`;
      averagesContainer.appendChild(p);
    });
}

function compareDataEntriesDesc(a, b) {
  const dateDifference = new Date(b.date) - new Date(a.date);
  if (dateDifference !== 0) {
    return dateDifference;
  }

  return b.id - a.id;
}

function getNextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function destroyCharts() {
  Object.values(charts).forEach((chart) => chart.destroy());
  charts = {};
}

function buildChartData() {
  const grouped = {};

  workoutData.forEach((entry) => {
    if (!grouped[entry.exercise]) {
      grouped[entry.exercise] = [];
    }

    grouped[entry.exercise].push(entry);
  });

  return Object.fromEntries(
    Object.entries(grouped).map(([exercise, entries]) => [
      exercise,
      [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
    ])
  );
}

function updateChart() {
  destroyCharts();
  chartsContainer.innerHTML = '';

  const chartData = buildChartData();
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  Object.entries(chartData).forEach(([exercise, entries], index) => {
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart-container';
    chartDiv.innerHTML = `<h3>${exercise}</h3><canvas id="chart-${exercise.replace(/\s+/g, '-')}"></canvas>`;
    chartsContainer.appendChild(chartDiv);

    const canvas = document.getElementById(`chart-${exercise.replace(/\s+/g, '-')}`);
    const ctx = canvas.getContext('2d');

    charts[exercise] = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: exercise,
            data: entries.map((entry) => ({
              x: new Date(entry.date),
              y: entry.value
            })),
            borderColor: colors[index % colors.length],
            backgroundColor: `${colors[index % colors.length]}20`,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          },
          y: {
            beginAtZero: true
          }
        }
      }
    });
  });
}

addExerciseBtn.addEventListener('click', () => {
  const name = exerciseInput.value.trim();
  if (!name) {
    return;
  }

  const duplicateExercise = exercises.some(
    (exercise) => exercise.name.toLowerCase() === name.toLowerCase()
  );

  if (duplicateExercise) {
    return;
  }

  exercises = [
    ...exercises,
    {
      id: getNextId(exercises),
      name
    }
  ];

  exerciseInput.value = '';
  saveState();
  renderAll();
});

exerciseList.addEventListener('click', (event) => {
  if (!event.target.classList.contains('delete-btn')) {
    return;
  }

  const id = Number(event.target.dataset.id);
  const exerciseToDelete = exercises.find((exercise) => exercise.id === id);
  if (!exerciseToDelete) {
    return;
  }

  exercises = exercises.filter((exercise) => exercise.id !== id);
  workoutData = workoutData.filter((entry) => entry.exercise !== exerciseToDelete.name);

  saveState();
  renderAll();
});

submitDataBtn.addEventListener('click', () => {
  const date = dateInput.value;
  if (!date) {
    return;
  }

  const newEntries = exercises.reduce((entries, exercise) => {
    const input = document.getElementById(`input-${exercise.id}`);
    const value = input.value.trim();

    if (!value) {
      return entries;
    }

    entries.push({
      id: 0,
      exercise: exercise.name,
      date,
      value: Number(value)
    });

    input.value = '';
    return entries;
  }, []);

  if (newEntries.length === 0) {
    return;
  }

  let nextId = getNextId(workoutData);
  workoutData = [
    ...workoutData,
    ...newEntries.map((entry) => ({
      ...entry,
      id: nextId++
    }))
  ];

  saveState();
  renderAll();
});

dataBody.addEventListener('click', (event) => {
  if (!event.target.classList.contains('delete-btn')) {
    return;
  }

  const id = Number(event.target.dataset.id);
  workoutData = workoutData.filter((entry) => entry.id !== id);

  saveState();
  renderAll();
});

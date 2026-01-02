const API_BASE = 'http://localhost:3000/api';

// DOM elements
const exerciseInput = document.getElementById('exercise-input');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const exerciseList = document.getElementById('exercise-list');
const dateInput = document.getElementById('date-input');
const exerciseInputs = document.getElementById('exercise-inputs');
const submitDataBtn = document.getElementById('submit-data-btn');
const dataBody = document.getElementById('data-body');


// Global variables
let exercises = [];
let charts = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadExercises();
  loadData();
  setDefaultDate();
});

// Set today's date as default
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  dateInput.value = today;
}

// Load exercises from server
async function loadExercises() {
  try {
    const response = await fetch(`${API_BASE}/exercises`);
    exercises = await response.json();
    renderExercises();
    renderExerciseInputs();
  } catch (error) {
    console.error('Error loading exercises:', error);
  }
}

// Render exercise list
function renderExercises() {
  exerciseList.innerHTML = '';
  exercises.forEach(exercise => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${exercise.name}</span>
      <button class="delete-btn" data-id="${exercise.id}">Delete</button>
    `;
    exerciseList.appendChild(li);
  });
}

// Render dynamic inputs for data entry
function renderExerciseInputs() {
  exerciseInputs.innerHTML = '';
  exercises.forEach(exercise => {
    const div = document.createElement('div');
    div.className = 'exercise-input-group';
    div.innerHTML = `
      <label for="input-${exercise.id}">${exercise.name}:</label>
      <input type="number" id="input-${exercise.id}" step="0.01" placeholder="Enter value">
    `;
    exerciseInputs.appendChild(div);
  });
}

// Add exercise
addExerciseBtn.addEventListener('click', async () => {
  const name = exerciseInput.value.trim();
  if (!name) return;

  try {
    const response = await fetch(`${API_BASE}/exercises`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    if (response.ok) {
      exerciseInput.value = '';
      loadExercises();
    }
  } catch (error) {
    console.error('Error adding exercise:', error);
  }
});

// Delete exercise
exerciseList.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    try {
      await fetch(`${API_BASE}/exercises/${id}`, { method: 'DELETE' });
      loadExercises();
      loadData();
      updateChart();
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  }
});

// Submit data
submitDataBtn.addEventListener('click', async () => {
  const date = dateInput.value;
  if (!date) return;

  const data = {};
  exercises.forEach(exercise => {
    const input = document.getElementById(`input-${exercise.id}`);
    const value = input.value.trim();
    if (value) {
      data[exercise.id] = value;
      input.value = '';
    }
  });

  if (Object.keys(data).length === 0) return;

  try {
    await fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, data })
    });
    loadData();
    updateChart();
  } catch (error) {
    console.error('Error submitting data:', error);
  }
});

// Load data history
async function loadData() {
  try {
    const response = await fetch(`${API_BASE}/data`);
    const data = await response.json();
    renderDataTable(data);
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Render data table
function renderDataTable(data) {
  dataBody.innerHTML = '';
  data.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.date}</td>
      <td>${item.exercise}</td>
      <td>${item.value}</td>
      <td><button class="delete-btn" data-id="${item.id}">Delete</button></td>
    `;
    dataBody.appendChild(tr);
  });
}

// Delete data entry
dataBody.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const id = e.target.dataset.id;
    try {
      await fetch(`${API_BASE}/data/${id}`, { method: 'DELETE' });
      loadData();
      updateChart();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  }
});

// Update charts
async function updateChart() {
  try {
    const response = await fetch(`${API_BASE}/chart-data`);
    const data = await response.json();

    const chartsContainer = document.getElementById('charts-container');
    chartsContainer.innerHTML = '';

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    for (const [exercise, values] of Object.entries(data)) {
      // Create container for each exercise chart
      const chartDiv = document.createElement('div');
      chartDiv.className = 'chart-container';
      chartDiv.innerHTML = `<h3>${exercise}</h3><canvas id="chart-${exercise.replace(/\s+/g, '-')}"></canvas>`;
      chartsContainer.appendChild(chartDiv);

      // Create chart
      const canvas = document.getElementById(`chart-${exercise.replace(/\s+/g, '-')}`);
      const ctx = canvas.getContext('2d');

      new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [{
            label: exercise,
            data: values.dates.map((date, index) => ({
              x: new Date(date),
              y: values.values[index]
            })),
            borderColor: colors[Object.keys(data).indexOf(exercise) % colors.length],
            backgroundColor: colors[Object.keys(data).indexOf(exercise) % colors.length] + '20',
            fill: false
          }]
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
    }
  } catch (error) {
    console.error('Error updating chart:', error);
  }
}

// Load chart on page load
updateChart();

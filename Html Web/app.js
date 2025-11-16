// --- 1. Static Data & State Management ---

// Static data object (used to simulate goal tracking and daily values)
const goals = {
    steps: 10000,
    caloriesBurned: 500,
    waterIntake: 3000 // ml
};

// Initial daily data (Can be stored/cleared using sessionStorage/localStorage)
let dailyData = {
    steps: 7500,
    caloriesBurned: 350,
    waterIntake: 2000,
    dailyCalories: 0
};

// Initial activity log data
let activityLog = [
    { name: "Morning Run", duration: 30, calories: 250, time: "Morning" },
    { name: "Yoga Session", duration: 45, calories: 100, time: "Morning" },
    { name: "Cycling", duration: 60, calories: 400, time: "Afternoon" },
    { name: "Weight Lifting", duration: 45, calories: 300, time: "Evening" },
];

// Initial meal data
let mealData = {
    breakfast: [
        { name: "Oatmeal", calories: 200 },
        { name: "Berries", calories: 50 }
    ],
    lunch: [
        { name: "Chicken Salad", calories: 350 }
    ],
    dinner: [
        { name: "Salmon & Veggies", calories: 450 }
    ]
};

// Simulated weekly data for the Insights page
const weeklyActivitySummary = [
    { day: 'Mon', activities: 2 },
    { day: 'Tue', activities: 1 },
    { day: 'Wed', activities: 3 },
    { day: 'Thu', activities: 1 },
    { day: 'Fri', activities: 2 },
    { day: 'Sat', activities: 4 },
    { day: 'Sun', activities: 2 },
];

const weeklyCalorieSummary = [
    { day: 'Mon', calories: 1500 },
    { day: 'Tue', calories: 1200 },
    { day: 'Wed', calories: 1800 },
    { day: 'Thu', calories: 1100 },
    { day: 'Fri', calories: 1600 },
    { day: 'Sat', calories: 2000 },
    { day: 'Sun', calories: 1550 },
];

// Load data from localStorage if available
const savedDailyData = localStorage.getItem('fitTrackProDailyData');
if (savedDailyData) {
    dailyData = JSON.parse(savedDailyData);
}

const savedActivityLog = localStorage.getItem('fitTrackProActivityLog');
if (savedActivityLog) {
    activityLog = JSON.parse(savedActivityLog);
}

const savedMealData = localStorage.getItem('fitTrackProMealData');
if (savedMealData) {
    mealData = JSON.parse(savedMealData);
}

// Function to save all data to localStorage
const saveData = () => {
    localStorage.setItem('fitTrackProDailyData', JSON.stringify(dailyData));
    localStorage.setItem('fitTrackProActivityLog', JSON.stringify(activityLog));
    localStorage.setItem('fitTrackProMealData', JSON.stringify(mealData));
};

// --- 2. Core Functions (Navigation, Clock, Modal) ---

// Custom Modal Handler (custom-built overlay)
const modalOverlay = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

const showModal = (message) => {
    modalMessage.textContent = message;
    modalOverlay.classList.remove('hidden');
    modalCloseBtn.onclick = () => {
        modalOverlay.classList.add('hidden');
    };
};

// Navigation Handler
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

const navigateTo = (pageId) => {
    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.page === pageId);
    });

    pages.forEach(page => {
        page.classList.toggle('active-page', page.id === pageId);
        page.classList.toggle('hidden-page', page.id !== pageId);
    });

    renderPage(pageId);
};

// Auto-updated live clock
const updateClock = () => {
    const clockElement = document.getElementById('live-clock');
    if (clockElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        clockElement.innerHTML = `<i class="far fa-clock"></i> ${timeString} <br> <small>${dateString}</small>`;
    }
};

// --- 3. Page Rendering Logic ---

// Helper to create the circular progress meter HTML
const createProgressMeter = (id, label, value, goal, unit) => {
    const percentage = Math.min(100, (value / goal) * 100);
    const circleStyle = `background: conic-gradient(var(--primary-color) ${percentage}%, #333 ${percentage}%);`; // Using #333 for dark theme inactive color

    return `
        <div class="card progress-card" id="${id}">
            <h3>${label}</h3>
            <div class="progress-circle" style="${circleStyle}">
                <div class="circle-inner">
                    ${value.toLocaleString()}
                    <small>${unit} / ${goal.toLocaleString()}</small>
                </div>
            </div>
            <p>Goal Progress: <strong>${Math.round(percentage)}%</strong></p>
        </div>
    `;
};

// Page 1: Daily Wellness Overview
const renderDashboard = () => {
    const container = document.getElementById('dashboard');
    
    if (!document.getElementById('live-clock')) {
         container.innerHTML = `
            <h2><i class="fas fa-tachometer-alt"></i> Daily Wellness Overview</h2>
            <p id="live-clock" style="text-align: right; margin-bottom: 25px;"></p>
            <div class="grid-3" id="wellness-metrics">
                </div>
        `;
    }
    
    const metricsContainer = document.getElementById('wellness-metrics');

    metricsContainer.innerHTML = [
        createProgressMeter(
            'steps-meter', 
            'Steps Taken', 
            dailyData.steps, 
            goals.steps, 
            'STEPS'
        ),
        createProgressMeter(
            'calories-meter', 
            'Calories Burned', 
            dailyData.caloriesBurned, 
            goals.caloriesBurned, 
            'KCAL'
        ),
        createProgressMeter(
            'water-meter', 
            'Water Intake', 
            dailyData.waterIntake, 
            goals.waterIntake, 
            'ML'
        )
    ].join('');

    // Clock update setup
    clearInterval(window.clockInterval);
    window.clockInterval = setInterval(updateClock, 1000);
    updateClock(); 
};

// Page 2: Activity Log
const renderActivityLog = () => {
    const container = document.getElementById('activity');
    container.innerHTML = `
        <h2><i class="fas fa-running"></i> Activity Log</h2>
        <div class="activity-content-wrapper">
            <div class="card" style="margin-bottom: 30px;">
                <h3>Add New Activity</h3>
                <form id="add-activity-form">
                    <div class="form-group">
                        <label for="activity-name">Activity Name</label>
                        <input type="text" id="activity-name" required>
                    </div>
                    <div class="form-group">
                        <label for="activity-duration">Duration (mins)</label>
                        <input type="number" id="activity-duration" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="activity-calories">Calories Burned</label>
                        <input type="number" id="activity-calories" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="activity-time">Time of Day</label>
                        <select id="activity-time" required>
                            <option value="Morning">Morning</option>
                            <option value="Afternoon">Afternoon</option>
                            <option value="Evening">Evening</option>
                        </select>
                    </div>
                    <button type="submit" class="btn primary-btn"><i class="fas fa-plus-circle"></i> Add Activity</button>
                </form>
            </div>

            <div class="card">
                <h3>Logged Activities</h3>
                <div class="filter-btns">
                    <button class="btn filter-btn active" data-filter="All">All</button>
                    <button class="btn filter-btn" data-filter="Morning">Morning</button>
                    <button class="btn filter-btn" data-filter="Afternoon">Afternoon</button>
                    <button class="btn filter-btn" data-filter="Evening">Evening</button>
                </div>
                <ul id="activity-list" class="activity-list">
                    </ul>
            </div>
        </div>
    `;

    document.getElementById('add-activity-form').addEventListener('submit', handleAddActivity);
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', handleFilterActivity);
    });

    displayActivityList('All');
};

const displayActivityList = (filter) => {
    const list = document.getElementById('activity-list');
    const filteredActivities = filter === 'All' 
        ? activityLog 
        : activityLog.filter(a => a.time === filter);

    list.innerHTML = filteredActivities.map(activity => `
        <li class="activity-item">
            <div class="activity-details">
                <strong>${activity.name}</strong>
                <span>${activity.duration} mins | ${activity.calories} kcal | ${activity.time}</span>
            </div>
            <button class="btn secondary-btn delete-activity-btn" data-name="${activity.name}" data-time="${activity.time}">
                <i class="fas fa-trash-alt"></i>
            </button>
        </li>
    `).join('');

    document.querySelectorAll('.delete-activity-btn').forEach(button => {
        button.addEventListener('click', handleDeleteActivity);
    });

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.classList.toggle('active', button.dataset.filter === filter);
    });
};

const handleAddActivity = (event) => {
    event.preventDefault();
    const name = document.getElementById('activity-name').value.trim();
    const duration = parseInt(document.getElementById('activity-duration').value);
    const calories = parseInt(document.getElementById('activity-calories').value);
    const time = document.getElementById('activity-time').value;

    // JavaScript Validation
    if (!name || isNaN(duration) || duration <= 0 || isNaN(calories) || calories <= 0) {
        showModal("Validation Error: Please ensure all fields are correctly filled (Duration and Calories must be positive numbers).");
        return;
    }

    const newActivity = { name, duration, calories, time };
    activityLog.unshift(newActivity);
    dailyData.caloriesBurned += calories;
    
    saveData();
    displayActivityList('All');
    renderDashboard();
    event.target.reset();
    showModal(`Activity **${name}** added successfully!`);
};

const handleFilterActivity = (event) => {
    const filter = event.target.dataset.filter;
    displayActivityList(filter);
};

const handleDeleteActivity = (event) => {
    const btn = event.currentTarget;
    const name = btn.dataset.name;
    const time = btn.dataset.time;

    const index = activityLog.findIndex(a => a.name === name && a.time === time);

    if (index > -1) {
        const deletedActivity = activityLog.splice(index, 1)[0];
        dailyData.caloriesBurned -= deletedActivity.calories;
        saveData();
        
        const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
        displayActivityList(activeFilter); 
        renderDashboard();
    }
};

// Page 3: Meal Planner
const renderMealPlanner = () => {
    const container = document.getElementById('meals');
    container.innerHTML = `
        <h2><i class="fas fa-utensils"></i> Meal Planner</h2>
        <div id="meal-planner-grid" class="grid-3">
            </div>
        <div class="total-calories" id="daily-calorie-total"></div>

        <div class="card" style="margin-top: 30px;">
            <h3>Add Meal Item</h3>
            <form id="add-meal-form">
                <div class="form-group">
                    <label for="meal-name">Item Name</label>
                    <input type="text" id="meal-name" required>
                </div>
                <div class="form-group">
                    <label for="meal-calories">Calories</label>
                    <input type="number" id="meal-calories" min="1" required>
                </div>
                <div class="form-group">
                    <label for="meal-category">Category</label>
                    <select id="meal-category" required>
                        <option value="breakfast">Breakfast</option>
                        <option value="lunch">Lunch</option>
                        <option value="dinner">Dinner</option>
                    </select>
                </div>
                <button type="submit" class="btn primary-btn"><i class="fas fa-plus-circle"></i> Add Item</button>
            </form>
        </div>
    `;

    renderMealTiles();
    document.getElementById('add-meal-form').addEventListener('submit', handleAddMealItem);
};

const renderMealTiles = () => {
    const grid = document.getElementById('meal-planner-grid');
    let totalDailyCalories = 0;

    grid.innerHTML = Object.keys(mealData).map(category => {
        const meals = mealData[category];
        const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
        
        const mealListHTML = meals.map(item => {
            totalDailyCalories += item.calories;
            return `
                <li class="meal-item">
                    <span>${item.name}</span>
                    <span>${item.calories} kcal</span>
                    <button class="remove-meal-item" data-category="${category}" data-name="${item.name}">
                        <i class="fas fa-times"></i>
                    </button>
                </li>
            `;
        }).join('');

        return `
            <div class="card meal-tile">
                <div class="meal-header">
                    <h3>${categoryTitle}</h3>
                </div>
                <ul class="meal-list">${mealListHTML}</ul>
            </div>
        `;
    }).join('');

    // Update total calorie display
    document.getElementById('daily-calorie-total').innerHTML = `
        <i class="fas fa-fire"></i> Total Daily Calorie Intake: <strong>${totalDailyCalories} kcal</strong>
    `;

    document.querySelectorAll('.remove-meal-item').forEach(button => {
        button.addEventListener('click', handleRemoveMealItem);
    });
};

const handleAddMealItem = (event) => {
    event.preventDefault();
    const name = document.getElementById('meal-name').value.trim();
    const calories = parseInt(document.getElementById('meal-calories').value);
    const category = document.getElementById('meal-category').value;

    // JavaScript Validation
    if (!name || isNaN(calories) || calories <= 0) {
        showModal("Validation Error: Please ensure all fields are correctly filled (Calories must be a positive number).");
        return;
    }

    const newItem = { name, calories };
    mealData[category].push(newItem);
    saveData();
    renderMealTiles();
    event.target.reset();
    showModal(`Meal item **${name}** added to ${category}!`);
};

const handleRemoveMealItem = (event) => {
    const btn = event.currentTarget;
    const category = btn.dataset.category;
    const name = btn.dataset.name;

    const index = mealData[category].findIndex(item => item.name === name);

    if (index > -1) {
        mealData[category].splice(index, 1);
        saveData();
        renderMealTiles();
    }
};

// Page 4: Insights & Summary
const renderInsights = () => {
    const container = document.getElementById('insights');
    container.innerHTML = `
        <h2><i class="fas fa-chart-line"></i> Insights & Summary</h2>
        
        <div class="grid-2">
            <div class="card chart-container">
                <h3>Weekly Activity Count</h3>
                <div class="bar-chart" id="weekly-activity-chart">
                    </div>
            </div>

            <div class="card chart-container">
                <h3>Weekly Calorie Intake (Simulated)</h3>
                <div class="bar-chart" id="weekly-calorie-chart">
                    </div>
            </div>
        </div>

        <div class="action-buttons">
            <button id="download-summary-btn" class="btn primary-btn"><i class="fas fa-download"></i> Download Summary (Simulated)</button>
            <button id="reset-dashboard-btn" class="btn secondary-btn"><i class="fas fa-redo"></i> Reset Dashboard</button>
        </div>
    `;

    // Ensure the max value is slightly higher than the max data point for better visibility
    const maxActivity = Math.max(...weeklyActivitySummary.map(d => d.activities)) + 1;
    const maxCalorie = Math.max(...weeklyCalorieSummary.map(d => d.calories)) + 200;

    renderBarChart('weekly-activity-chart', weeklyActivitySummary, 'activities', maxActivity);
    renderBarChart('weekly-calorie-chart', weeklyCalorieSummary, 'calories', maxCalorie);

    document.getElementById('download-summary-btn').addEventListener('click', () => {
        showModal("Summary Download Simulated! This feature is client-side only.");
    });
    document.getElementById('reset-dashboard-btn').addEventListener('click', handleResetDashboard);
};

// IMPROVED FUNCTION FOR GRAPH VISIBILITY
const renderBarChart = (containerId, data, dataKey, maxValue) => {
    const container = document.getElementById(containerId);
    let barHTML = '';

    data.forEach(item => {
        const value = item[dataKey];
        // Ensure height is a percentage of the calculated maxValue
        const height = (value / maxValue) * 100;
        const visualHeight = Math.min(100, height); 

        barHTML += `
            <div class="bar" style="height: ${visualHeight}%;" title="${item.day}: ${value}">
                <span class="bar-value">${value}</span>
                <span class="bar-label">${item.day}</span>
            </div>
        `;
    });

    container.innerHTML = barHTML;
};
// END IMPROVED FUNCTION

const handleResetDashboard = () => {
    if (confirm("Are you sure you want to reset ALL dashboard data?")) {
        // Clear all relevant data from local storage (sessionStorage/localStorage)
        localStorage.removeItem('fitTrackProDailyData');
        localStorage.removeItem('fitTrackProActivityLog');
        localStorage.removeItem('fitTrackProMealData');
        
        // Reload the page to reset the JS variables to their initial static state
        window.location.reload(); 
    }
};


// Main rendering function that calls the correct page renderer
const renderPage = (pageId) => {
    clearInterval(window.clockInterval); 
    
    switch (pageId) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'activity':
            renderActivityLog();
            break;
        case 'meals':
            renderMealPlanner();
            break;
        case 'insights':
            renderInsights();
            break;
    }
};


// --- 4. Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Attach navigation handlers
    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            navigateTo(e.currentTarget.dataset.page);
        });
    });

    // 2. Load the initial page
    renderPage('dashboard');
});
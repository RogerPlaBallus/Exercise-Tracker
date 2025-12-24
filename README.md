<img width="863" height="854" alt="image" src="https://github.com/user-attachments/assets/2bc961b8-34ef-4a53-ad81-34aab5fbf1ef" /> 

* Exercise Tracker
A full-stack web application designed to help users log their workouts, track progress over time, and visualize their performance through interactive charts.

* Project Overview
This application provides a seamless experience for fitness enthusiasts to manage their routines. Users can define custom exercises, log daily performance data, and view their improvement trends through a dynamic dashboard.

FEATURES
** Front-End (User Interface) **
Exercise Management: Create and delete exercise categories (e.g., Abs, Pull-ups) dynamically.

Data Logging: A user-friendly form with a date picker to record workout values.

Dynamic Inputs: The interface automatically generates input fields based on your active exercise list.

Data History: A comprehensive table displaying all past records with the ability to delete specific entries.

Progress Visualization: Interactive multi-series line charts to track performance trends across different dates.

** Back-End (Server & Database) **
RESTful API: Robust API endpoints to handle communication between the UI and the database.

Data Persistence: Secure storage of all exercises and workout logs, ensuring data is kept across sessions.

CRUD Operations: Full support for Creating, Reading, and Deleting records for both exercise types and historical logs.

Data Integrity: Validation logic to ensure that workout entries are correctly linked to their respective exercise categories.

* Front-end stack:

HTML (index.html)
CSS (style.css)
JavaScript (app.js)
Chart.js (for data visualization, loaded from CDN)

* Back-end stack:

Node.js
Express.js (web framework)
SQLite3 (database)
CORS (for cross-origin requests)

* USAGE
Add your favorite exercises in the Exercises panel.

Enter your daily results in the Data section.

Monitor the Data History table for a log of your work.

Analyze the Chart at the bottom to see your physical evolution.

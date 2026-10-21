const express = require('express');
const logger = require('./middleware/logger');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Body parser — without this req.body is undefined on POST/PUT
app.use(express.json());

// 2. Global request logger
app.use(logger);

// 3. Routes
app.get('/', (req, res) => res.json({ message: 'Task Manager API is running' }));
app.use('/tasks', taskRoutes);

// Deliberately throws so the global error handler can be demonstrated
app.get('/debug/error', () => {
  throw new Error('Deliberate test error');
});

// 4. 404 for anything that did not match a route
app.use(notFound);

// 5. Global error handler — must be registered LAST
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

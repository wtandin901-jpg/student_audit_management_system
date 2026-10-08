const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const auditedUnitRoutes = require('./routes/auditedUnitRoutes');
const auditRoutes = require('./routes/auditRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

// Root route: confirms the API is running when you open http://localhost:3000/
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Audit Management System API is running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Student Audit Management API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audited-units', auditedUnitRoutes);
app.use('/api/audits', auditRoutes);

// These two must stay LAST.
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
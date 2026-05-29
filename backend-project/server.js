const express = require('express');
const session = require('express-session');
const cors = require('cors'); // Imported CORS
const bcrypt = require('bcrypt');
const { body, param, validationResult } = require('express-validator');
const db = require('./db');

const app = express();
const SALT_ROUNDS = 10;

// ==========================================
// MIDDLEWARES & INITIALIZATION
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure CORS Options
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'], // Add your Frontend URLs here
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Crucial to allow express-session cookies over cross-origin requests
}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'fallback_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set true if using HTTPS in production
        httpOnly: true,
        sameSite: 'lax', // Required setting for cross-origin session cookies
        maxAge: 1000 * 60 * 60 * 2 // 2 Hours
    }
}));

// Session Protection Gatekeeper
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) return next();
    return res.status(401).json({ error: "Unauthorized. Please log in first." });
};

// Express Validator Error Interceptor
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

// ==========================================
// VALIDATION SCHEMAS
// ==========================================
const authValidations = [
    body('username').trim().isLength({ min: 4 }).withMessage('Username must be 4+ chars').escape(),
    body('password').isLength({ min: 6 }).withMessage('Password must be 6+ chars')
];

const warehouseValidations = [
    body('warehouseCode').trim().notEmpty().withMessage('warehouseCode is required').escape(),
    body('warehouseName').trim().notEmpty().withMessage('warehouseName is required').escape(),
    body('warehouseLocation').trim().optional().escape()
];

const productValidations = [
    body('productCode').trim().notEmpty().withMessage('productCode is required').escape(),
    body('productName').trim().notEmpty().withMessage('productName is required').escape(),
    body('category').trim().optional().escape(),
    body('quantityInStock').optional().isInt({ min: 0 }).withMessage('Quantity must be >= 0'),
    body('unitPrice').isFloat({ min: 0.01 }).withMessage('UnitPrice must be a positive decimal'),
    body('supplierName').trim().optional().escape(),
    body('dateReceived').optional().isISO8601().withMessage('Must be a valid YYYY-MM-DD date'),
    body('warehouseCode').trim().notEmpty().withMessage('Must be assigned to a warehouseCode')
];

const transactionValidations = [
    body('productCode').trim().notEmpty().withMessage('productCode is required'),
    body('warehouseCode').trim().notEmpty().withMessage('warehouseCode is required'),
    body('quantityMoved').isInt({ min: 1 }).withMessage('quantityMoved must be at least 1'),
    body('transactionType').isIn(['IN', 'OUT', 'TRANSFER']).withMessage('Type must be IN, OUT, or TRANSFER')
];


// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

app.post('/api/auth/register', authValidations, handleValidationErrors, async (req, res) => {
    const { username, password } = req.body;
    try {
        const [existing] = await db.execute('SELECT userID FROM Users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: "Username already exists" });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await db.execute('INSERT INTO Users (username, password) VALUES (?, ?)', [username, hashedPassword]);
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const [users] = await db.execute('SELECT * FROM Users WHERE username = ?', [username]);
        if (users.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        req.session.userId = user.userID;
        req.session.username = user.username;
        res.json({ message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie('connect.sid').json({ message: "Logout successful" });
    });
});


// ==========================================
// 2. WAREHOUSE CRUD (Protected)
// ==========================================

app.post('/api/warehouses', isAuthenticated, warehouseValidations, handleValidationErrors, async (req, res) => {
    const { warehouseCode, warehouseName, warehouseLocation } = req.body;
    try {
        await db.execute('INSERT INTO Warehouse VALUES (?, ?, ?)', [warehouseCode, warehouseName, warehouseLocation]);
        res.status(201).json({ message: "Warehouse created" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/warehouses', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Warehouse');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/warehouses/:code', isAuthenticated, warehouseValidations, handleValidationErrors, async (req, res) => {
    const { warehouseName, warehouseLocation } = req.body;
    try {
        const [result] = await db.execute('UPDATE Warehouse SET warehouseName = ?, warehouseLocation = ? WHERE warehouseCode = ?', [warehouseName, warehouseLocation, req.params.code]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Warehouse not found" });
        res.json({ message: "Warehouse updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/warehouses/:code', isAuthenticated, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM Warehouse WHERE warehouseCode = ?', [req.params.code]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Warehouse not found" });
        res.json({ message: "Warehouse deleted successfully" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 3. PRODUCT CRUD (Protected)
// ==========================================

app.post('/api/products', isAuthenticated, productValidations, handleValidationErrors, async (req, res) => {
    const { productCode, productName, category, quantityInStock, unitPrice, supplierName, dateReceived, warehouseCode } = req.body;
    try {
        await db.execute('INSERT INTO Product VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [productCode, productName, category, quantityInStock || 0, unitPrice, supplierName, dateReceived || null, warehouseCode]);
        res.status(201).json({ message: "Product created" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM Product');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/products/:code', isAuthenticated, productValidations, handleValidationErrors, async (req, res) => {
    const { productName, category, quantityInStock, unitPrice, supplierName, dateReceived, warehouseCode } = req.body;
    try {
        const [result] = await db.execute(
            'UPDATE Product SET productName=?, category=?, quantityInStock=?, unitPrice=?, supplierName=?, dateReceived=?, warehouseCode=? WHERE productCode=?',
            [productName, category, quantityInStock, unitPrice, supplierName, dateReceived, warehouseCode, req.params.code]
        );
        if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product updated" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/products/:code', isAuthenticated, async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM Product WHERE productCode = ?', [req.params.code]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Product not found" });
        res.json({ message: "Product deleted" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 4. TRANSACTION CRUD & STOCK MANAGEMENT
// ==========================================

app.post('/api/transactions', isAuthenticated, transactionValidations, handleValidationErrors, async (req, res) => {
    const { productCode, warehouseCode, quantityMoved, transactionType } = req.body;
    const connection = await db.getConnection(); 
    try {
        await connection.beginTransaction();

        const [prod] = await connection.execute('SELECT quantityInStock FROM Product WHERE productCode = ?', [productCode]);
        if (prod.length === 0) throw new Error("Product records do not exist");

        let currentStock = prod[0].quantityInStock;

        if (transactionType === 'OUT' && currentStock < quantityMoved) {
            throw new Error("Insufficient warehouse stock availability for dispatch");
        }
        
        let stockAdjustment = (transactionType === 'IN') ? quantityMoved : -quantityMoved;

        await connection.execute('INSERT INTO StockTransaction (productCode, warehouseCode, quantityMoved, transactionType) VALUES (?, ?, ?, ?)', [productCode, warehouseCode, quantityMoved, transactionType]);
        await connection.execute('UPDATE Product SET quantityInStock = quantityInStock + ? WHERE productCode = ?', [stockAdjustment, productCode]);

        await connection.commit();
        res.status(201).json({ message: "Stock transaction processed successfully" });
    } catch (err) {
        await connection.rollback();
        res.status(400).json({ error: "Transaction aborted", details: err.message });
    } finally {
        connection.release();
    }
});

app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM StockTransaction ORDER BY transactionDate DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 5. ANALYTICAL INVENTORY REPORTING
// ==========================================

app.get('/api/reports/daily', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT DATE(t.transactionDate) AS ReportDate, p.productName, w.warehouseName,
                   SUM(CASE WHEN t.transactionType = 'IN' THEN t.quantityMoved ELSE 0 END) AS DailyStockIn,
                   SUM(CASE WHEN t.transactionType = 'OUT' THEN t.quantityMoved ELSE 0 END) AS DailyStockOut
            FROM StockTransaction t
            INNER JOIN Product p ON t.productCode = p.productCode
            INNER JOIN Warehouse w ON t.warehouseCode = w.warehouseCode
            GROUP BY DATE(t.transactionDate), p.productName, w.warehouseName
            ORDER BY ReportDate DESC, p.productName;`);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reports/weekly', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT YEAR(t.transactionDate) AS ReportYear, WEEK(t.transactionDate, 1) AS ReportWeek, p.productName, w.warehouseName,
                   SUM(CASE WHEN t.transactionType = 'IN' THEN t.quantityMoved ELSE 0 END) AS WeeklyStockIn,
                   SUM(CASE WHEN t.transactionType = 'OUT' THEN t.quantityMoved ELSE 0 END) AS WeeklyStockOut
            FROM StockTransaction t
            INNER JOIN Product p ON t.productCode = p.productCode
            INNER JOIN Warehouse w ON t.warehouseCode = w.warehouseCode
            GROUP BY YEAR(t.transactionDate), WEEK(t.transactionDate, 1), p.productName, w.warehouseName
            ORDER BY ReportYear DESC, ReportWeek DESC, p.productName;`);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/reports/monthly', isAuthenticated, async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT YEAR(t.transactionDate) AS ReportYear, MONTHNAME(t.transactionDate) AS ReportMonth, p.productName, w.warehouseName,
                   SUM(CASE WHEN t.transactionType = 'IN' THEN t.quantityMoved ELSE 0 END) AS MonthlyStockIn,
                   SUM(CASE WHEN t.transactionType = 'OUT' THEN t.quantityMoved ELSE 0 END) AS MonthlyStockOut
            FROM StockTransaction t
            INNER JOIN Product p ON t.productCode = p.productCode
            INNER JOIN Warehouse w ON t.warehouseCode = w.warehouseCode
            GROUP BY YEAR(t.transactionDate), MONTH(t.transactionDate), MONTHNAME(t.transactionDate), p.productName, w.warehouseName
            ORDER BY ReportYear DESC, MONTH(t.transactionDate) DESC, p.productName;`);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});


// Global Fallback Routes Catching
app.use((req, res) => res.status(404).json({ error: "Endpoint route target not found" }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Comprehensive CORS-enabled single-instance server listening on port ${PORT}`));
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const db = new Database("sentinelmind.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS threats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    content TEXT,
    risk_score INTEGER,
    severity TEXT,
    intent TEXT,
    verdict TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed user if not exists
const userExists = db.prepare("SELECT * FROM users WHERE username = ?").get("admin");
if (!userExists) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run("admin", hashedPassword);
}

const app = express();
const PORT = 3000;
const JWT_SECRET = "sentinel-mind-secret-key-2026";

app.use(express.json());

// Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// API Routes
app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

app.get("/api/dashboard-stats", authenticateToken, (req, res) => {
  const totalThreats = db.prepare("SELECT COUNT(*) as count FROM threats").get() as any;
  const avgRisk = db.prepare("SELECT AVG(risk_score) as avg FROM threats").get() as any;
  const criticalThreats = db.prepare("SELECT COUNT(*) as count FROM threats WHERE severity = 'Critical'").get() as any;
  
  // Recent threats for graph
  const recentThreats = db.prepare("SELECT risk_score, timestamp FROM threats ORDER BY timestamp DESC LIMIT 10").all();

  res.json({
    totalThreats: totalThreats.count,
    avgRisk: Math.round(avgRisk.avg || 0),
    criticalThreats: criticalThreats.count,
    recentThreats: recentThreats.reverse()
  });
});

app.get("/api/threats", authenticateToken, (req, res) => {
  const threats = db.prepare("SELECT * FROM threats ORDER BY timestamp DESC").all();
  res.json(threats);
});

app.post("/api/threats", authenticateToken, (req, res) => {
  const { type, content, risk_score, severity, intent, verdict } = req.body;
  db.prepare(`
    INSERT INTO threats (type, content, risk_score, severity, intent, verdict)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(type, content, risk_score, severity, intent, verdict);
  res.status(201).json({ success: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

const path = require("node:path");
const Database = require("better-sqlite3");

const dbPath = path.join(process.cwd(), "data", "backend.sqlite");
const db = new Database(dbPath);

db.exec(`
PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS team_offense (
  posteam TEXT NOT NULL,
  season INTEGER NOT NULL,
  epa REAL,
  epa_pass REAL,
  epa_rush REAL,
  success_rate REAL,
  plays INTEGER,
  PRIMARY KEY (posteam, season)
);
DELETE FROM team_offense;
INSERT INTO team_offense (posteam, season, epa, epa_pass, epa_rush, success_rate, plays) VALUES
  ('BUF', 2024, 0.12, 0.20, 0.05, 0.49, 1001),
  ('BAL', 2024, 0.21, 0.24, 0.17, 0.51, 1000),
  ('DET', 2024, 0.15, 0.19, 0.09, 0.50,  951),
  ('BUF', 2023, 0.10, 0.17, 0.04, 0.48, 1020),
  ('BAL', 2023, 0.18, 0.21, 0.14, 0.50,  990);
`);
const rows = db.prepare("SELECT COUNT(*) as n FROM team_offense").get();
console.log("Seeded rows:", rows.n);
db.close();

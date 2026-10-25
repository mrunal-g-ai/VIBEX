import pkg from "pg";
const { Pool } = pkg;
import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://vibex_user:vibex_password@127.0.0.1:5432/vibex_db";

export const pool = new Pool({
  connectionString: DATABASE_URL,
  connectionTimeoutMillis: 5000,
  max: 10,
});

// Redis client with graceful offline fallback
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
let redisClient: Redis | null = null;
let isRedisAvailable = false;

try {
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null, // Do not spam retries if offline
    enableOfflineQueue: false,
    lazyConnect: true,
  });

  redisClient.connect().then(() => {
    isRedisAvailable = true;
    console.log("[Redis] Connected to Redis cache service");
  }).catch(() => {
    isRedisAvailable = false;
    console.log("[Redis] Service not available. Operating in PostgreSQL-direct fallback mode.");
  });

  redisClient.on("error", () => {
    isRedisAvailable = false;
  });
} catch {
  isRedisAvailable = false;
}

export const cache = {
  isAvailable: () => isRedisAvailable,
  async get(key: string): Promise<string | null> {
    if (!isRedisAvailable || !redisClient) return null;
    try {
      return await redisClient.get(key);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (!isRedisAvailable || !redisClient) return;
    try {
      await redisClient.set(key, value, "EX", ttlSeconds);
    } catch {
      // Ignore cache write error; PostgreSQL remains authoritative
    }
  },
  async del(pattern: string): Promise<void> {
    if (!isRedisAvailable || !redisClient) return;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(...keys);
      }
    } catch {
      // Invalidation error logged; database remains source of truth
    }
  },
};

export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255) NOT NULL,
        selected_instrument VARCHAR(32) NOT NULL DEFAULT 'guitar',
        daily_goal_minutes INT NOT NULL DEFAULT 15,
        experience_level VARCHAR(32) NOT NULL DEFAULT 'beginner',
        primary_goal VARCHAR(64) NOT NULL DEFAULT 'technique',
        streak_days INT NOT NULL DEFAULT 0,
        total_practice_minutes INT NOT NULL DEFAULT 0,
        xp INT NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 2. Lessons Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR(64) PRIMARY KEY,
        instrument VARCHAR(32) NOT NULL,
        level_number INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 3. Exercises Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exercises (
        id VARCHAR(64) PRIMARY KEY,
        lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE CASCADE,
        instrument VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        bpm INT DEFAULT 70,
        required_passing_score INT DEFAULT 70,
        target_notes JSONB NOT NULL DEFAULT '[]',
        skills_covered JSONB NOT NULL DEFAULT '[]',
        corrective_tip TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 4. User Lesson Progress (Strict uniqueness on user_id + lesson_id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        lesson_id VARCHAR(64) REFERENCES lessons(id) ON DELETE CASCADE,
        is_completed BOOLEAN NOT NULL DEFAULT FALSE,
        score INT DEFAULT 0,
        completed_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_user_lesson UNIQUE(user_id, lesson_id)
      );
    `);

    // 5. Practice Sessions (Audit trail of genuine practice attempts)
    await client.query(`
      CREATE TABLE IF NOT EXISTS practice_sessions (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        exercise_id VARCHAR(64) REFERENCES exercises(id) ON DELETE SET NULL,
        instrument VARCHAR(32) NOT NULL,
        duration_seconds INT NOT NULL DEFAULT 0,
        notes_played INT NOT NULL DEFAULT 0,
        pitch_accuracy INT NOT NULL DEFAULT 0,
        rhythm_accuracy INT NOT NULL DEFAULT 0,
        overall_score INT NOT NULL DEFAULT 0,
        is_passed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // 6. User Achievements / Badges (Strict uniqueness on user_id + badge_id)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
        badge_id VARCHAR(64) NOT NULL,
        earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_user_badge UNIQUE(user_id, badge_id)
      );
    `);

    // 7. Songs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS songs (
        id VARCHAR(64) PRIMARY KEY,
        instrument VARCHAR(32) NOT NULL,
        title VARCHAR(255) NOT NULL,
        difficulty VARCHAR(64) NOT NULL,
        genre VARCHAR(128) NOT NULL,
        key VARCHAR(64) NOT NULL,
        tempo INT NOT NULL,
        duration_sec INT NOT NULL,
        description TEXT,
        sections JSONB NOT NULL DEFAULT '[]',
        skills_trained JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Indexes for high-throughput queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON practice_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_practice_sessions_created ON practice_sessions(created_at);
      CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON user_lesson_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_exercises_lesson ON exercises(lesson_id);
      CREATE INDEX IF NOT EXISTS idx_songs_instrument ON songs(instrument);
    `);

    await client.query("COMMIT");
    console.log("[PostgreSQL] Schema integrity verified and initialized successfully.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("[PostgreSQL] Failed to initialize schema:", error);
    throw error;
  } finally {
    client.release();
  }
}

import { pool } from "./index.js";
import { CURRICULUM_DATA } from "../data/curriculum.js";
import { SONGS_DATA } from "../data/songs.js";

export async function seedCanonicalData(): Promise<{
  lessonsCount: number;
  exercisesCount: number;
  songsCount: number;
}> {
  const client = await pool.connect();
  let lessonsCount = 0;
  let exercisesCount = 0;
  let songsCount = 0;

  try {
    await client.query("BEGIN");

    // 1. Ensure default clean user accounts exist with 0 fake stats
    await client.query(`
      INSERT INTO users (id, name, selected_instrument, daily_goal_minutes, experience_level, primary_goal, streak_days, total_practice_minutes, xp)
      VALUES 
        ('user_demo', 'VIBEX Student', 'guitar', 15, 'beginner', 'technique', 0, 0, 0),
        ('user_local', 'VIBEX Local Learner', 'guitar', 15, 'beginner', 'technique', 0, 0, 0)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Seed Canonical Curriculum (Lessons & Exercises)
    for (const [instrument, levels] of Object.entries(CURRICULUM_DATA)) {
      for (const level of levels) {
        for (const lesson of level.lessons) {
          await client.query(
            `INSERT INTO lessons (id, instrument, level_number, title, description)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (id) DO UPDATE 
             SET instrument = EXCLUDED.instrument,
                 level_number = EXCLUDED.level_number,
                 title = EXCLUDED.title,
                 description = EXCLUDED.description`,
            [
              lesson.id,
              instrument,
              level.number,
              lesson.title,
              lesson.description || "",
            ]
          );
          lessonsCount++;

          for (const exercise of lesson.exercises) {
            await client.query(
              `INSERT INTO exercises (id, lesson_id, instrument, title, bpm, required_passing_score, target_notes, skills_covered, corrective_tip)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO UPDATE
               SET lesson_id = EXCLUDED.lesson_id,
                   instrument = EXCLUDED.instrument,
                   title = EXCLUDED.title,
                   bpm = EXCLUDED.bpm,
                   required_passing_score = EXCLUDED.required_passing_score,
                   target_notes = EXCLUDED.target_notes,
                   skills_covered = EXCLUDED.skills_covered,
                   corrective_tip = EXCLUDED.corrective_tip`,
              [
                exercise.id,
                lesson.id,
                instrument,
                exercise.title,
                exercise.expectedBpm || 70,
                exercise.requiredPassingScore || 70,
                JSON.stringify(exercise.targetNotes || []),
                JSON.stringify(lesson.learningOutcomes || []),
                exercise.correctiveTip || null,
              ]
            );
            exercisesCount++;
          }
        }
      }
    }

    // 3. Seed Canonical Songs
    for (const [instrument, songs] of Object.entries(SONGS_DATA)) {
      for (const song of songs) {
        await client.query(
          `INSERT INTO songs (id, instrument, title, difficulty, genre, key, tempo, duration_sec, description, sections, skills_trained)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
           ON CONFLICT (id) DO UPDATE
           SET instrument = EXCLUDED.instrument,
               title = EXCLUDED.title,
               difficulty = EXCLUDED.difficulty,
               genre = EXCLUDED.genre,
               key = EXCLUDED.key,
               tempo = EXCLUDED.tempo,
               duration_sec = EXCLUDED.duration_sec,
               description = EXCLUDED.description,
               sections = EXCLUDED.sections,
               skills_trained = EXCLUDED.skills_trained`,
          [
            song.id,
            instrument,
            song.title,
            song.difficulty,
            song.genre,
            song.key,
            song.tempo,
            song.durationSec,
            song.description || "",
            JSON.stringify(song.sections || []),
            JSON.stringify(song.skillsTrained || []),
          ]
        );
        songsCount++;
      }
    }

    await client.query("COMMIT");
    console.log(
      `[Canonical Seed] Successfully seeded ${lessonsCount} lessons, ${exercisesCount} exercises, and ${songsCount} songs into PostgreSQL.`
    );
    return { lessonsCount, exercisesCount, songsCount };
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("[Canonical Seed] Failed to seed canonical data:", err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.includes("seed_canonical")) {
  seedCanonicalData()
    .then((res) => {
      console.log("Seed completed:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed error:", err);
      process.exit(1);
    });
}

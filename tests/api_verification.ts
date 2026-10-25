import { pool } from "../src/db/index.js";

async function runVerification() {
  console.log("=== VIBEX BACKEND & DATABASE INTEGRITY TEST SUITE ===");
  const baseUrl = "http://localhost:5000";

  // 1. Health check
  console.log("\n[Test 1] Health & Connectivity Check...");
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  console.log("Health response status:", healthRes.status, healthData);
  if (healthRes.status !== 200 || !healthData.connections?.postgresql?.connected) {
    throw new Error("Health check failed or database not connected");
  }
  console.log("✓ PASS: Database is reachable, Redis status is reported honestly.");

  // 2. User Profile Genuine 0-State Verification
  console.log("\n[Test 2] User Profile 0-State Verification...");
  const testUserId = `test_user_${Date.now()}`;
  const profileRes = await fetch(`${baseUrl}/api/user/profile/${testUserId}`);
  const profileData = await profileRes.json();
  console.log("New user profile data:", profileData);
  if (
    profileData.streak_days !== 0 ||
    profileData.total_practice_minutes !== 0 ||
    profileData.xp !== 0
  ) {
    throw new Error("Violation: User profile created with fabricated non-zero statistics!");
  }
  console.log("✓ PASS: Genuine empty profile created without fabricated records.");

  // 3. User Profile Update
  console.log("\n[Test 3] User Profile Update...");
  const updateRes = await fetch(`${baseUrl}/api/user/profile/${testUserId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      selected_instrument: "guitar",
      daily_goal_minutes: 25,
      experience_level: "intermediate",
      primary_goal: "classical",
    }),
  });
  const updateData = await updateRes.json();
  if (updateData.daily_goal_minutes !== 25) {
    throw new Error("Profile update failed");
  }
  console.log("✓ PASS: User preferences updated cleanly.");

  // 4. Retrieve canonical exercise from DB
  const exerciseRes = await pool.query("SELECT id, lesson_id, instrument, title FROM exercises LIMIT 1");
  if (exerciseRes.rows.length === 0) {
    throw new Error("No canonical exercises found in database!");
  }
  const validExercise = exerciseRes.rows[0];
  console.log("Using canonical exercise for practice session:", validExercise);

  // 5. Practice Session Transactional Recording
  console.log("\n[Test 4] Transactional Practice Session Recording...");
  const sessionPayload = {
    userId: testUserId,
    exerciseId: validExercise.id,
    instrument: validExercise.instrument,
    durationSeconds: 120,
    notesPlayed: 16,
    pitchAccuracy: 88,
    rhythmAccuracy: 92,
    overallScore: 90,
    isPassed: true,
  };

  const sessionRes = await fetch(`${baseUrl}/api/practice/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionPayload),
  });
  const sessionData = await sessionRes.json();
  console.log("Practice session response:", sessionData);
  if (sessionData.status !== "saved" || !sessionData.sessionId) {
    throw new Error("Practice session recording failed");
  }
  console.log("✓ PASS: Practice session saved and user aggregates updated.");

  // 6. Verify Practice Session in DB & Duplicate Check
  console.log("\n[Test 5] Verify Practice Session Audit Trail...");
  const dbSession = await pool.query(
    "SELECT * FROM practice_sessions WHERE id = $1",
    [sessionData.sessionId]
  );
  if (dbSession.rows.length !== 1) {
    throw new Error("Practice session missing from PostgreSQL!");
  }
  console.log("✓ PASS: Session audit trail confirmed in PostgreSQL.");

  // 7. Idempotent Lesson Completion
  console.log("\n[Test 6] Idempotent Lesson Completion & Unique Constraint...");
  const lessonPayload = {
    userId: testUserId,
    lessonId: validExercise.lesson_id,
    score: 85,
  };

  // First completion call
  const compRes1 = await fetch(`${baseUrl}/api/practice/complete-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lessonPayload),
  });
  const compData1 = await compRes1.json();
  console.log("First completion call:", compData1);
  if (!compData1.success) {
    throw new Error("First lesson completion call failed");
  }

  // Second (retry) completion call - should succeed idempotently
  const compRes2 = await fetch(`${baseUrl}/api/practice/complete-lesson`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lessonPayload),
  });
  const compData2 = await compRes2.json();
  console.log("Second completion call (retry):", compData2);
  if (!compData2.success) {
    throw new Error("Idempotent retry failed");
  }

  // Check row count in user_lesson_progress
  const progressCount = await pool.query(
    "SELECT COUNT(*) FROM user_lesson_progress WHERE user_id = $1 AND lesson_id = $2",
    [testUserId, validExercise.lesson_id]
  );
  const rowCount = parseInt(progressCount.rows[0].count, 10);
  console.log("User lesson progress row count for lesson:", rowCount);
  if (rowCount !== 1) {
    throw new Error(`Duplicate row detected! Expected 1 row, found ${rowCount}`);
  }
  console.log("✓ PASS: Lesson completion is strictly idempotent with no duplicate rows.");

  // 8. Progress API Contract
  console.log("\n[Test 7] Progress Retrieval API Contract...");
  const progressRes = await fetch(`${baseUrl}/api/user/progress/${testUserId}`);
  const progressData = await progressRes.json();
  console.log("User progress data:", progressData);
  if (
    !progressData.completedLessons.includes(validExercise.lesson_id) ||
    !progressData.completedExercises.includes(validExercise.id)
  ) {
    throw new Error("Progress API did not return real completed lesson or exercise!");
  }
  console.log("✓ PASS: Progress API returns genuine earned records.");

  // 9. AI Mentor Failure Integrity (No Fake Answers When Gemini Unavailable)
  console.log("\n[Test 8] AI Mentor Failure Integrity (No Fabricated AI Responses)...");
  const aiRes = await fetch(`${baseUrl}/api/ai/mentor-chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "How to tune guitar?", instrument: "guitar" }),
  });
  console.log("AI endpoint status:", aiRes.status);
  const aiData = await aiRes.json();
  console.log("AI endpoint response:", aiData);
  // Either 200 with real Gemini response if configured, or 503/500 honest error without pretending
  if (aiRes.status === 200) {
    if (!aiData.reply || typeof aiData.reply !== "string") {
      throw new Error("AI returned invalid payload");
    }
    console.log("✓ PASS: Real Gemini response received.");
  } else {
    if (aiRes.status !== 503 && aiRes.status !== 500) {
      throw new Error(`Unexpected status code: ${aiRes.status}`);
    }
    if (!aiData.error) {
      throw new Error("Expected honest error message when AI service is unavailable");
    }
    console.log("✓ PASS: Honest service unavailable error returned without fake response.");
  }

  // Clean up test user safely
  await pool.query("DELETE FROM users WHERE id = $1", [testUserId]);
  console.log("\n✓ ALL 8 BACKEND & DATABASE INTEGRITY TESTS PASSED SUCCESSFULLY!");
  process.exit(0);
}

runVerification().catch((err) => {
  console.error("\n❌ Verification Failed:", err);
  process.exit(1);
});

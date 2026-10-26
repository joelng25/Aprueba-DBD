/**
 * Import topics and questions from JSON (Tarea 0.3).
 * Idempotent: replaces existing data for topics and questions.
 */

import type { Database } from "sql.js";
import type { QuestionsImport } from "../types";
import { persistDb } from "./init";

export async function importFromJson(db: Database, data: QuestionsImport, version?: number): Promise<void> {
  db.run("BEGIN TRANSACTION");
  try {
    const referenced = db.exec("SELECT DISTINCT question_id FROM user_answers");
    const incoming = new Set(data.questions.map(q => q.id));
    for (const row of referenced[0]?.values ?? []) {
      if (!incoming.has(String(row[0]))) throw new Error("La actualización elimina preguntas con progreso guardado; conserva sus IDs.");
    }
    db.run("DELETE FROM questions");
    db.run("DELETE FROM topics");

    const insertTopic = db.prepare(
      "INSERT INTO topics (id, title, section, sort_order) VALUES (?, ?, ?, ?)"
    );
    for (const t of data.topics) {
      insertTopic.run([t.id, t.title, t.section, t.sortOrder]);
    }
    insertTopic.free();

    const insertQuestion = db.prepare(
      "INSERT INTO questions (id, number, topic_id, text, options, correct_letter, explicacion) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    for (const q of data.questions) {
      const optionsJson = JSON.stringify(q.options);
      insertQuestion.run([
        q.id,
        q.number,
        q.topicId,
        q.text,
        optionsJson,
        q.correctLetter,
        q.explicacion ?? null,
      ]);
    }
    insertQuestion.free();

    if (version !== undefined) db.run("INSERT OR REPLACE INTO user_preferences (key, value) VALUES (?, ?)", ["data_version", String(version)]);
    db.run("COMMIT");

  } catch (e) {
    db.run("ROLLBACK");
    throw e;
  }
  await persistDb();
}

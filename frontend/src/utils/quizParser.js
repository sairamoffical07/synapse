/**
 * Safely parses any AI quiz API response (object, string, JSON block, nested wrap)
 * into a clean array of QuizQuestion objects.
 */
export const parseQuizResponse = (raw) => {
  let data = raw;

  // Handle ApiResponse unwrapping if needed
  if (data && typeof data === 'object' && 'data' in data && data.data) {
    data = data.data;
  }

  // Handle JSON string or markdown code fence
  if (typeof data === 'string') {
    data = cleanAndParseJsonString(data);
  }

  // Handle nested object structure
  let questions = [];

  if (Array.isArray(data)) {
    questions = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.questions)) {
      questions = data.questions;
    } else if (Array.isArray(data.quiz)) {
      questions = data.quiz;
    } else if (Array.isArray(data.items)) {
      questions = data.items;
    } else if (typeof data.questions === 'string') {
      const parsed = cleanAndParseJsonString(data.questions);
      if (Array.isArray(parsed)) questions = parsed;
    }
  }

  if (!Array.isArray(questions) || questions.length === 0) {
    return [];
  }

  // Normalize each question object
  const validQuestions = [];
  questions.forEach((q, idx) => {
    if (typeof q === 'string') {
      const parsed = cleanAndParseJsonString(q);
      if (parsed && typeof parsed === 'object') {
        q = parsed;
      } else {
        return;
      }
    }

    if (!q || typeof q !== 'object') return;

    const questionText = q.question || q.prompt || q.title;
    if (!questionText || typeof questionText !== 'string' || !questionText.trim()) return;

    if (!Array.isArray(q.options) || q.options.length < 2) return;
    const options = q.options.map((opt) => String(opt).trim()).filter((opt) => opt.length > 0);
    if (options.length < 2) return;

    // Determine correct index
    let correctIndex = 0;
    if (typeof q.correctOptionIndex === 'number') {
      correctIndex = q.correctOptionIndex;
    } else if (typeof q.correctIndex === 'number') {
      correctIndex = q.correctIndex;
    } else if (typeof q.correct_index === 'number') {
      correctIndex = q.correct_index;
    } else if (typeof q.answerIndex === 'number') {
      correctIndex = q.answerIndex;
    } else if (typeof q.correctAnswer === 'number') {
      correctIndex = q.correctAnswer;
    } else if (typeof q.correctAnswer === 'string') {
      const foundIdx = options.findIndex(
        (opt) => opt.toLowerCase() === q.correctAnswer.toLowerCase().trim()
      );
      if (foundIdx !== -1) correctIndex = foundIdx;
    }

    validQuestions.push({
      id: validQuestions.length,
      question: questionText.trim(),
      options,
      correctIndex: Math.max(0, Math.min(correctIndex, options.length - 1)),
      explanation: q.explanation || q.reasoning || '',
    });
  });

  return validQuestions;
};

/**
 * Safely parses any AI flashcard API response into a clean array of Flashcard objects.
 */
export const parseFlashcardResponse = (raw) => {
  let data = raw;

  if (data && typeof data === 'object' && 'data' in data && data.data) {
    data = data.data;
  }

  if (typeof data === 'string') {
    data = cleanAndParseJsonString(data);
  }

  let cards = [];

  if (Array.isArray(data)) {
    cards = data;
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.flashcards)) {
      cards = data.flashcards;
    } else if (Array.isArray(data.cards)) {
      cards = data.cards;
    } else if (Array.isArray(data.items)) {
      cards = data.items;
    } else if (typeof data.flashcards === 'string') {
      const parsed = cleanAndParseJsonString(data.flashcards);
      if (Array.isArray(parsed)) cards = parsed;
    } else if (data.data) {
      if (Array.isArray(data.data.flashcards)) cards = data.data.flashcards;
      else if (Array.isArray(data.data.cards)) cards = data.data.cards;
      else if (Array.isArray(data.data)) cards = data.data;
    }
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return [];
  }

  const validCards = [];
  cards.forEach((c) => {
    if (typeof c === 'string') {
      const parsed = cleanAndParseJsonString(c);
      if (parsed && typeof parsed === 'object') {
        c = parsed;
      } else {
        return;
      }
    }

    if (!c || typeof c !== 'object') return;

    const front = c.front || c.question || c.concept || c.prompt || c.title;
    const back = c.back || c.answer || c.explanation || c.definition;

    if (!front || !back) return;

    const frontStr = String(front).trim();
    const backStr = String(back).trim();

    if (!frontStr || !backStr) return;

    validCards.push({
      id: validCards.length,
      front: frontStr,
      back: backStr,
      concept: c.concept ? String(c.concept).trim() : frontStr,
    });
  });

  return validCards;
};

/**
 * Strips markdown code blocks and attempts JSON.parse
 */
const cleanAndParseJsonString = (str) => {
  if (!str) return null;
  let trimmed = str.trim();

  // Strip markdown code fences
  if (trimmed.startsWith('```json')) {
    trimmed = trimmed.substring(7);
  } else if (trimmed.startsWith('```')) {
    trimmed = trimmed.substring(3);
  }

  if (trimmed.endsWith('```')) {
    trimmed = trimmed.substring(0, trimmed.length - 3);
  }

  trimmed = trimmed.trim();

  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // If direct parse fails, try extracting first JSON array or object using regex
    const jsonMatch = trimmed.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err) {
        return null;
      }
    }
    return null;
  }
};

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
  return questions.map((q, idx) => {
    if (typeof q === 'string') {
      return {
        id: idx,
        question: q,
        options: ['True', 'False', 'Neither', 'Both'],
        correctIndex: 0,
        explanation: 'Default question format.',
      };
    }

    const questionText = q.question || q.prompt || q.title || `Question ${idx + 1}`;
    let options = Array.isArray(q.options) ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];

    // Determine correct index
    let correctIndex = 0;
    if (typeof q.correctOptionIndex === 'number') {
      correctIndex = q.correctOptionIndex;
    } else if (typeof q.correctIndex === 'number') {
      correctIndex = q.correctIndex;
    } else if (typeof q.correct_index === 'number') {
      correctIndex = q.correct_index;
    } else if (typeof q.correctAnswer === 'number') {
      correctIndex = q.correctAnswer;
    } else if (typeof q.correctAnswer === 'string') {
      const foundIdx = options.findIndex(
        (opt) => opt.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
      );
      if (foundIdx !== -1) correctIndex = foundIdx;
    }

    return {
      id: idx,
      question: questionText,
      options: options.map((opt) => String(opt)),
      correctIndex: Math.max(0, Math.min(correctIndex, options.length - 1)),
      explanation: q.explanation || q.reasoning || '',
    };
  });
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
    }
  }

  if (!Array.isArray(cards) || cards.length === 0) {
    return [];
  }

  return cards.map((c, idx) => {
    if (typeof c === 'string') {
      return {
        id: idx,
        front: `Concept ${idx + 1}`,
        back: c,
      };
    }

    const front = c.front || c.question || c.concept || c.title || `Flashcard ${idx + 1}`;
    const back = c.back || c.answer || c.explanation || c.definition || 'No explanation provided.';

    return {
      id: idx,
      front: String(front),
      back: String(back),
    };
  });
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

/**
 * @fileoverview Unit tests for lib/validators.ts
 *
 * Coverage targets:
 * - All Zod schemas: valid and invalid inputs
 * - Every enum value accepted/rejected
 * - parseCarbonAnalysis helper
 * - stripCodeFences edge cases
 * - ChatMessageSchema
 * - CheckInRecordSchema
 */

import {
  CheckInAnswersSchema,
  CarbonAnalysisSchema,
  AnalyzeRequestSchema,
  ChatRequestSchema,
  ChatMessageSchema,
  CheckInRecordSchema,
  parseCarbonAnalysis,
  stripCodeFences,
} from '@/lib/validators';

// ─── Shared fixtures ──────────────────────────────────────────────

const VALID_ANSWERS = {
  transport:   'car',
  meal:        'beef',
  electricity: 'high',
  shopping:    'several',
  waste:       'none',
};

const VALID_ANALYSIS = {
  footprint:          'Medium',
  largestContributor: 'Transportation',
  score:              55,
  summary:            'Transportation is your main contributor today.',
  topActions:         ['Action 1', 'Action 2', 'Action 3'],
  weeklyGoal:         'Try cycling instead of driving once this week.',
  categoryBreakdown:  {
    Transportation: 4.6,
    Food:           1.5,
    Electricity:    0.5,
    Shopping:       0,
    Waste:          0.2,
  },
};

// ─── CheckInAnswersSchema ─────────────────────────────────────────

describe('CheckInAnswersSchema', () => {
  it('accepts all valid transport modes', () => {
    const modes = ['walk', 'cycle', 'bus', 'metro', 'car', 'bike'];
    modes.forEach(transport => {
      expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, transport }).success).toBe(true);
    });
  });

  it('rejects unknown transport mode', () => {
    expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, transport: 'jet' }).success).toBe(false);
  });

  it('accepts all valid meal types', () => {
    const meals = ['vegetarian', 'mixed', 'chicken', 'beef'];
    meals.forEach(meal => {
      expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, meal }).success).toBe(true);
    });
  });

  it('rejects invalid meal type', () => {
    expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, meal: 'fish' }).success).toBe(false);
  });

  it('accepts all valid electricity levels', () => {
    const levels = ['low', 'medium', 'high'];
    levels.forEach(electricity => {
      expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, electricity }).success).toBe(true);
    });
  });

  it('rejects invalid electricity level', () => {
    expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, electricity: 'extreme' }).success).toBe(false);
  });

  it('accepts all valid shopping levels', () => {
    const levels = ['none', 'one', 'several'];
    levels.forEach(shopping => {
      expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, shopping }).success).toBe(true);
    });
  });

  it('accepts all valid waste options', () => {
    const options = ['recycled', 'mixed', 'none'];
    options.forEach(waste => {
      expect(CheckInAnswersSchema.safeParse({ ...VALID_ANSWERS, waste }).success).toBe(true);
    });
  });

  it('rejects missing fields', () => {
    expect(CheckInAnswersSchema.safeParse({ transport: 'car' }).success).toBe(false);
  });

  it('rejects empty object', () => {
    expect(CheckInAnswersSchema.safeParse({}).success).toBe(false);
  });
});

// ─── CarbonAnalysisSchema ─────────────────────────────────────────

describe('CarbonAnalysisSchema', () => {
  it('accepts a fully valid analysis object', () => {
    expect(CarbonAnalysisSchema.safeParse(VALID_ANALYSIS).success).toBe(true);
  });

  it('accepts score of 0', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, score: 0 }).success).toBe(true);
  });

  it('accepts score of 100', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, score: 100 }).success).toBe(true);
  });

  it('rejects score of -1', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, score: -1 }).success).toBe(false);
  });

  it('rejects score of 101', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, score: 101 }).success).toBe(false);
  });

  it('rejects non-integer score', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, score: 55.5 }).success).toBe(false);
  });

  it('rejects topActions with fewer than 3 items', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, topActions: ['a', 'b'] }).success).toBe(false);
  });

  it('rejects topActions with more than 3 items', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, topActions: ['a', 'b', 'c', 'd'] }).success).toBe(false);
  });

  it('rejects invalid footprint level', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, footprint: 'Extreme' }).success).toBe(false);
  });

  it('accepts all valid footprint levels', () => {
    ['Low', 'Medium', 'High'].forEach(footprint => {
      expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, footprint }).success).toBe(true);
    });
  });

  it('rejects invalid emission category as largestContributor', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, largestContributor: 'Flying' }).success).toBe(false);
  });

  it('accepts all valid emission categories as largestContributor', () => {
    ['Transportation', 'Food', 'Electricity', 'Shopping', 'Waste'].forEach(cat => {
      expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, largestContributor: cat }).success).toBe(true);
    });
  });

  it('rejects summary shorter than 10 characters', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, summary: 'Short' }).success).toBe(false);
  });

  it('rejects negative categoryBreakdown values', () => {
    const breakdown = { ...VALID_ANALYSIS.categoryBreakdown, Transportation: -1 };
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, categoryBreakdown: breakdown }).success).toBe(false);
  });

  it('accepts zero categoryBreakdown values', () => {
    const breakdown = { ...VALID_ANALYSIS.categoryBreakdown, Shopping: 0 };
    expect(CarbonAnalysisSchema.safeParse({ ...VALID_ANALYSIS, categoryBreakdown: breakdown }).success).toBe(true);
  });
});

// ─── AnalyzeRequestSchema ─────────────────────────────────────────

describe('AnalyzeRequestSchema', () => {
  it('accepts a valid request', () => {
    expect(AnalyzeRequestSchema.safeParse({ answers: VALID_ANSWERS }).success).toBe(true);
  });

  it('rejects missing answers', () => {
    expect(AnalyzeRequestSchema.safeParse({}).success).toBe(false);
  });

  it('rejects invalid answers', () => {
    expect(AnalyzeRequestSchema.safeParse({ answers: { transport: 'spaceship' } }).success).toBe(false);
  });
});

// ─── ChatRequestSchema ────────────────────────────────────────────

describe('ChatRequestSchema', () => {
  it('accepts a valid chat request with empty history', () => {
    expect(ChatRequestSchema.safeParse({ message: 'How can I reduce my footprint?', history: [] }).success).toBe(true);
  });

  it('accepts valid history entries', () => {
    const result = ChatRequestSchema.safeParse({
      message: 'Tell me more',
      history: [
        { role: 'user', content: 'Hello' },
        { role: 'assistant', content: 'Hi!' },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    expect(ChatRequestSchema.safeParse({ message: '', history: [] }).success).toBe(false);
  });

  it('rejects message over 500 characters', () => {
    expect(ChatRequestSchema.safeParse({ message: 'x'.repeat(501), history: [] }).success).toBe(false);
  });

  it('accepts message of exactly 500 characters', () => {
    expect(ChatRequestSchema.safeParse({ message: 'x'.repeat(500), history: [] }).success).toBe(true);
  });

  it('rejects history with more than 20 items', () => {
    const history = Array.from({ length: 21 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: 'message',
    }));
    expect(ChatRequestSchema.safeParse({ message: 'Hi', history }).success).toBe(false);
  });

  it('rejects invalid role in history', () => {
    expect(ChatRequestSchema.safeParse({
      message: 'Hi',
      history: [{ role: 'system', content: 'injected' }],
    }).success).toBe(false);
  });

  it('rejects missing history field', () => {
    expect(ChatRequestSchema.safeParse({ message: 'Hi' }).success).toBe(false);
  });
});

// ─── ChatMessageSchema ────────────────────────────────────────────

describe('ChatMessageSchema', () => {
  const VALID_MSG = {
    id:        '550e8400-e29b-41d4-a716-446655440000',
    role:      'user',
    content:   'Hello!',
    timestamp: new Date().toISOString(),
  };

  it('accepts a valid message', () => {
    expect(ChatMessageSchema.safeParse(VALID_MSG).success).toBe(true);
  });

  it('accepts assistant role', () => {
    expect(ChatMessageSchema.safeParse({ ...VALID_MSG, role: 'assistant' }).success).toBe(true);
  });

  it('rejects invalid role', () => {
    expect(ChatMessageSchema.safeParse({ ...VALID_MSG, role: 'system' }).success).toBe(false);
  });

  it('rejects non-uuid id', () => {
    expect(ChatMessageSchema.safeParse({ ...VALID_MSG, id: 'not-a-uuid' }).success).toBe(false);
  });

  it('rejects empty content', () => {
    expect(ChatMessageSchema.safeParse({ ...VALID_MSG, content: '' }).success).toBe(false);
  });
});

// ─── CheckInRecordSchema ──────────────────────────────────────────

describe('CheckInRecordSchema', () => {
  const VALID_RECORD = {
    id:      '550e8400-e29b-41d4-a716-446655440000',
    date:    '2025-06-15',
    answers: VALID_ANSWERS,
    analysis: VALID_ANALYSIS,
    completedChallengeIds: [],
    co2SavedKg: 0,
  };

  it('accepts a valid record', () => {
    expect(CheckInRecordSchema.safeParse(VALID_RECORD).success).toBe(true);
  });

  it('rejects invalid date format', () => {
    expect(CheckInRecordSchema.safeParse({ ...VALID_RECORD, date: '15-06-2025' }).success).toBe(false);
  });

  it('rejects non-uuid id', () => {
    expect(CheckInRecordSchema.safeParse({ ...VALID_RECORD, id: 'abc123' }).success).toBe(false);
  });

  it('rejects negative co2SavedKg', () => {
    expect(CheckInRecordSchema.safeParse({ ...VALID_RECORD, co2SavedKg: -1 }).success).toBe(false);
  });

  it('accepts co2SavedKg of 0', () => {
    expect(CheckInRecordSchema.safeParse({ ...VALID_RECORD, co2SavedKg: 0 }).success).toBe(true);
  });
});

// ─── parseCarbonAnalysis ──────────────────────────────────────────

describe('parseCarbonAnalysis', () => {
  it('returns success for valid data', () => {
    expect(parseCarbonAnalysis(VALID_ANALYSIS).success).toBe(true);
  });

  it('returns failure for null', () => {
    expect(parseCarbonAnalysis(null).success).toBe(false);
  });

  it('returns failure for undefined', () => {
    expect(parseCarbonAnalysis(undefined).success).toBe(false);
  });

  it('returns failure for empty object', () => {
    expect(parseCarbonAnalysis({}).success).toBe(false);
  });

  it('returns failure for invalid score', () => {
    expect(parseCarbonAnalysis({ ...VALID_ANALYSIS, score: 999 }).success).toBe(false);
  });

  it('does not throw for any input', () => {
    const inputs = [null, undefined, '', 0, [], {}, 'random string', true];
    inputs.forEach(input => {
      expect(() => parseCarbonAnalysis(input)).not.toThrow();
    });
  });
});

// ─── stripCodeFences ──────────────────────────────────────────────

describe('stripCodeFences', () => {
  it('removes ```json ... ``` fences', () => {
    expect(stripCodeFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('removes plain ``` ... ``` fences', () => {
    expect(stripCodeFences('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('leaves plain JSON untouched', () => {
    expect(stripCodeFences('{"a":1}')).toBe('{"a":1}');
  });

  it('handles case-insensitive ```JSON fences', () => {
    expect(stripCodeFences('```JSON\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('trims surrounding whitespace', () => {
    expect(stripCodeFences('  {"a":1}  ')).toBe('{"a":1}');
  });

  it('handles empty string', () => {
    expect(stripCodeFences('')).toBe('');
  });

  it('handles fences with no content between them', () => {
    expect(stripCodeFences('```json\n```')).toBe('');
  });
});

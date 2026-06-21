import {
  CheckInAnswersSchema,
  CarbonAnalysisSchema,
  AnalyzeRequestSchema,
  ChatRequestSchema,
  parseCarbonAnalysis,
  stripCodeFences,
} from '@/lib/validators';

describe('CheckInAnswersSchema', () => {
  it('accepts valid answers', () => {
    const result = CheckInAnswersSchema.safeParse({
      transport:   'car',
      meal:        'beef',
      electricity: 'high',
      shopping:    'several',
      waste:       'none',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unknown transport mode', () => {
    const result = CheckInAnswersSchema.safeParse({ transport: 'jet', meal: 'beef', electricity: 'high', shopping: 'none', waste: 'recycled' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = CheckInAnswersSchema.safeParse({ transport: 'car' });
    expect(result.success).toBe(false);
  });
});

describe('CarbonAnalysisSchema', () => {
  const valid = {
    footprint:          'Medium',
    largestContributor: 'Transportation',
    score:              55,
    summary:            'Transportation is your main contributor today.',
    topActions:         ['Action 1', 'Action 2', 'Action 3'],
    weeklyGoal:         'Try cycling instead of driving once this week.',
    categoryBreakdown:  { Transportation: 4.6, Food: 1.5, Electricity: 0.5, Shopping: 0, Waste: 0.2 },
  };

  it('accepts a fully valid analysis object', () => {
    expect(CarbonAnalysisSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects score out of range', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...valid, score: 150 }).success).toBe(false);
  });

  it('rejects topActions with fewer than 3 items', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...valid, topActions: ['a', 'b'] }).success).toBe(false);
  });

  it('rejects invalid footprint level', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...valid, footprint: 'Extreme' }).success).toBe(false);
  });

  it('rejects invalid emission category', () => {
    expect(CarbonAnalysisSchema.safeParse({ ...valid, largestContributor: 'Flying' }).success).toBe(false);
  });
});

describe('AnalyzeRequestSchema', () => {
  it('accepts a valid request', () => {
    const result = AnalyzeRequestSchema.safeParse({
      answers: { transport: 'bus', meal: 'mixed', electricity: 'medium', shopping: 'one', waste: 'mixed' },
    });
    expect(result.success).toBe(true);
  });
});

describe('ChatRequestSchema', () => {
  it('accepts a valid chat request', () => {
    const result = ChatRequestSchema.safeParse({ message: 'How can I reduce my footprint?', history: [] });
    expect(result.success).toBe(true);
  });

  it('rejects empty message', () => {
    const result = ChatRequestSchema.safeParse({ message: '', history: [] });
    expect(result.success).toBe(false);
  });

  it('rejects message over 500 characters', () => {
    const result = ChatRequestSchema.safeParse({ message: 'x'.repeat(501), history: [] });
    expect(result.success).toBe(false);
  });
});

describe('parseCarbonAnalysis', () => {
  it('returns success for valid data', () => {
    const result = parseCarbonAnalysis({
      footprint: 'Low', largestContributor: 'Food', score: 20,
      summary: 'Great choices today!',
      topActions: ['a', 'b', 'c'],
      weeklyGoal: 'Keep up the plant-based meals.',
      categoryBreakdown: { Transportation: 0, Food: 1.5, Electricity: 0.5, Shopping: 0, Waste: 0.2 },
    });
    expect(result.success).toBe(true);
  });
});

describe('stripCodeFences', () => {
  it('removes json code fences', () => {
    expect(stripCodeFences('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('leaves plain JSON untouched', () => {
    expect(stripCodeFences('{"a":1}')).toBe('{"a":1}');
  });
});

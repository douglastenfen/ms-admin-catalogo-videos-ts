import { InvalidRatingError, Rating, RatingValues } from '../rating.vo';

describe('Rating Unit Tests', () => {
  it('should create a valid rating', () => {
    const rating = Rating.with(RatingValues.R10);

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R10);
  });

  it('should fail when creating an invalid rating', () => {
    expect(() => Rating.with('R20' as any)).toThrow(InvalidRatingError);
  });

  it('should create a RL rating', () => {
    const rating = Rating.createRL();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.RL);
  });

  it('should create a R10 rating', () => {
    const rating = Rating.createR10();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R10);
  });

  it('should create a R12 rating', () => {
    const rating = Rating.createR12();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R12);
  });

  it('should create a R14 rating', () => {
    const rating = Rating.createR14();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R14);
  });

  it('should create a R16 rating', () => {
    const rating = Rating.createR16();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R16);
  });

  it('should create a R18 rating', () => {
    const rating = Rating.createR18();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R18);
  });

  it('should create a valid rating using create method', () => {
    const [rating, error] = Rating.create(RatingValues.R10).asArray();

    expect(rating).toBeInstanceOf(Rating);
    expect(rating.value).toBe(RatingValues.R10);
    expect(error).toBeNull();
  });

  it('should fail when creating an invalid rating using create method', () => {
    const [rating, error] = Rating.create('R20' as any).asArray();

    expect(rating).toBeNull();
    expect(error).toBeInstanceOf(InvalidRatingError);
  });
});

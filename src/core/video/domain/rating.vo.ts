import { Either } from '@core/shared/domain/either';
import { ValueObject } from '@core/shared/domain/value-object';

export enum RatingValues {
  RL = 'L',
  R10 = '10',
  R12 = '12',
  R14 = '14',
  R16 = '16',
  R18 = '18',
}

export class Rating extends ValueObject {
  constructor(readonly value: RatingValues) {
    super();

    this.validate();
  }

  private validate() {
    const isValid = Object.values(RatingValues).includes(this.value);

    if (!isValid) {
      throw new InvalidRatingError(this.value);
    }
  }

  static create(value: RatingValues): Either<Rating, Error> {
    return Either.safe(() => new Rating(value));
  }

  static createRL() {
    return new Rating(RatingValues.RL);
  }

  static createR10() {
    return new Rating(RatingValues.R10);
  }

  static createR12() {
    return new Rating(RatingValues.R12);
  }

  static createR14() {
    return new Rating(RatingValues.R14);
  }

  static createR16() {
    return new Rating(RatingValues.R16);
  }

  static createR18() {
    return new Rating(RatingValues.R18);
  }

  static with = (value: RatingValues) => new Rating(value);
}

export class InvalidRatingError extends Error {
  constructor(value: any) {
    super(
      `The rating must be one of following values: ${Object.values(
        RatingValues,
      ).join(', ')}, passed value: ${value}`,
    );
  }
}

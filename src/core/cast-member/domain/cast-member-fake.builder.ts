import { Chance } from 'chance';
import { CastMemberType } from './cast-member-type.vo';
import { CastMember, CastMemberId } from './cast-member.aggregate';

type PropOrFactory<T> = T | ((index: number) => T);

export class CastMemberFakeBuilder<TBuild = any> {
  private _castMemberId: PropOrFactory<CastMemberId> | undefined = undefined;

  private _name: PropOrFactory<string> = (_index) => this.chance.word();

  private _type: PropOrFactory<CastMemberType> = (_index) =>
    CastMemberType.createActor();

  private _createdAt: PropOrFactory<Date> | undefined = undefined;

  private countObjs;

  static aDirector() {
    return new CastMemberFakeBuilder<CastMember>().withType(
      CastMemberType.createDirector(),
    );
  }

  static anActor() {
    return new CastMemberFakeBuilder<CastMember>().withType(
      CastMemberType.createActor(),
    );
  }

  static theDirectors(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs).withType(
      CastMemberType.createDirector(),
    );
  }

  static theActors(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs).withType(
      CastMemberType.createActor(),
    );
  }

  static theCastMembers(countObjs: number) {
    return new CastMemberFakeBuilder<CastMember[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withCastMemberID(valueOrFactory: PropOrFactory<CastMemberId>) {
    this._castMemberId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  withType(valueOrFactory: PropOrFactory<CastMemberType>) {
    this._type = valueOrFactory;
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  withInvalidTooLongName() {
    this._name = (_index) => this.chance.word({ length: 256 });
    return this;
  }

  build(): TBuild {
    const castMembers = new Array(this.countObjs)
      .fill(undefined)
      .map((_, index) => {
        const castMember = new CastMember({
          castMemberId: !this._castMemberId
            ? undefined
            : this.callFactory(this._castMemberId, index),
          name: this.callFactory(this._name, index),
          type: this.callFactory(this._type, index),
          ...(this._createdAt && {
            createdAt: this.callFactory(this._createdAt, index),
          }),
        });

        castMember.validate();
        return castMember;
      });

    return this.countObjs === 1 ? (castMembers[0] as any) : castMembers;
  }

  get castMemberId() {
    return this.getValue('castMemberId');
  }

  get name() {
    return this.getValue('name');
  }

  get type() {
    return this.getValue('type');
  }

  get createdAt() {
    return this.getValue('createdAt');
  }

  private getValue(prop: string) {
    const optional = ['castMemberId', 'createdAt'];

    const privateProp = `_${prop}` as keyof this;

    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }

    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    return typeof factoryOrValue === 'function'
      ? factoryOrValue(index)
      : factoryOrValue;
  }
}

import { ValueObject } from './value-object';

export abstract class Entity {
  abstract get entityID(): ValueObject;
  abstract toJSON(): any;
}

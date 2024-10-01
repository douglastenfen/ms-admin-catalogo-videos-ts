import { ValueObject } from "./value-object";

export abstract class Entity {
  abstract getEntityId(): ValueObject;
  abstract toJSON(): any;
}
import { Notification } from './validators/notification';
import { ValueObject } from './value-object';

export abstract class Entity {
  notification: Notification = new Notification();

  abstract get entityID(): ValueObject;
  abstract toJSON(): any;
}

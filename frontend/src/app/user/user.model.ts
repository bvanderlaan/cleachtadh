export enum UserStates {
  PENDING = 0,
  ACTIVE,
}

export class User {
  public id : string;

  constructor(public name: string, public state = UserStates.PENDING, public admin = false) {
  }
}

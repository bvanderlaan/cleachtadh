interface User {
  id : string;
  name : string;
}

export class Kata {
  public id : string;
  public addedBy : User;

  constructor(public name: string, public description: string, public created_at?: Date) {
    if (created_at === undefined) {
      this.created_at = new Date();
    }

    this.addedBy = { id: '', name: '' };
  }
}

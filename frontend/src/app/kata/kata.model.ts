export class Kata {
  constructor(public name: string, public description: string, public created_at?: Date) {
    if (created_at === undefined) {
      this.created_at = new Date();
    }
  }
}

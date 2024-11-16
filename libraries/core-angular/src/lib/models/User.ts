
import { Model } from "./Model";

export class User extends Model<User> {
	override className = "User";

	id!: number;
	username = "";
}

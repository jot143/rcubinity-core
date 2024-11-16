import { Injectable } from "@angular/core";

@Injectable()
export class LocalStorageService {
	static set(key: string, data: any) {
		try {
			if (typeof data === "string") {
				localStorage.setItem(key, data);
			} else {
				localStorage.setItem(key, JSON.stringify(data));
			}
		} catch (e) {
			console.error(e);
		}
	}

	static get(key: string) {
		const data: any = localStorage.getItem(key);
		try {
			return JSON.parse(data);
		} catch (e) {
			if (data === "undefined" || data === "null" || data === "NULL" || data === "NaN") {
				return null;
			}
			return data;
		}
	}
}

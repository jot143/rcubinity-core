export function ClassDecorator<T>(getClass: () =>  T) {
	return function (target: any, key: any) {
		if (!target.constructor.prototype["_variable_class"]) {
			target.constructor.prototype["_variable_class"] = {};
		}
		target.constructor.prototype["_variable_class"][key] = getClass;
	};
}

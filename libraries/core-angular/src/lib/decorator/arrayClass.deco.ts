export function ArrayClassDecorator<T>(getClass: () =>  T) {
	return function (target: any, key: any) {
		if (!target.constructor.prototype["_array_variable_class"]) {
			target.constructor.prototype["_array_variable_class"] = {};
		}
		target.constructor.prototype["_array_variable_class"][key] = getClass;
	};
}

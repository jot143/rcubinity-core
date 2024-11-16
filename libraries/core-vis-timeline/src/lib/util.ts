import { DataSet, createNewDataPipeFrom, isDataViewLike as isDataViewLikeUpstream } from "vis-data/esnext";
import * as util from "vis-util/esnext";
import { getType, isNumber, isString } from "vis-util/esnext";

import moment from "moment";
import { v4 as randomUUID } from "uuid";
import { FilterXSS } from 'xss';

// parse ASP.Net Date pattern,
// for example '/Date(1198908717056)/' or '/Date(1198908717056-0700)/'
// code from http://momentjs.com/
const ASPDateRegex = /^\/?Date\((-?\d+)/i;
const NumericRegex = /^\d+$/;

export { randomUUID };


/**
 * Test if an object implements the DataView interface from vis-data.
 * Uses the idProp property instead of expecting a hardcoded id field "id".
 */
export function isDataViewLike(obj: any): boolean {
    if (!obj) {
        return false;
    }
    const idProp = obj.idProp ?? obj._idProp;
    if (!idProp) {
        return false;
    }
    return isDataViewLikeUpstream(idProp, obj);
}

// Define type for conversion options
type ConversionType = "boolean" | "Boolean" | "number" | "Number" | "string" | "String" | "Date" | "Moment" | "ISODate" | "ASPDate";

/**
 * Convert an object into another type
 *
 * @param object - Value of unknown type.
 * @param type - Name of the desired type.
 *
 * @returns Object in the desired type.
 * @throws Error
 */
export function convert(object: any, type: ConversionType): any {
    let match: RegExpExecArray | null;

    if (object === undefined) {
        return undefined;
    }
    if (object === null) {
        return null;
    }

    if (!type) {
        return object;
    }
    if (!(typeof type === "string") && !((type as any) instanceof String)) {
        throw new Error("Type must be a string");
    }

    switch (type) {
        case "boolean":
        case "Boolean":
            return Boolean(object);

        case "number":
        case "Number":
            if (isString(object) && !isNaN(Date.parse(object))) {
                return moment(object).valueOf();
            } else {
                return Number(object.valueOf());
            }
        case "string":
        case "String":
            return String(object);

        case "Date":
            try {
                return convert(object, "Moment").toDate();
            } catch (e) {
                if (e instanceof TypeError) {
                    throw new TypeError(
                        "Cannot convert object of type " + getType(object) + " to type " + type
                    );
                } else {
                    throw e;
                }
            }

        case "Moment":
            if (isNumber(object)) {
                return moment(object);
            }
            if (object instanceof Date) {
                return moment(object.valueOf());
            } else if (moment.isMoment(object)) {
                return moment(object);
            }
            if (isString(object)) {
                match = ASPDateRegex.exec(object);
                if (match) {
                    return moment(Number(match[1]));
                }
                match = NumericRegex.exec(object);
                if (match) {
                    return moment(Number(object));
                }
                return moment(object);
            } else {
                throw new TypeError(
                    "Cannot convert object of type " + getType(object) + " to type " + type
                );
            }

        case "ISODate":
            if (isNumber(object)) {
                return new Date(object).toISOString();
            } else if (object instanceof Date) {
                return object.toISOString();
            } else if (moment.isMoment(object)) {
                return object.toDate().toISOString();
            } else if (isString(object)) {
                match = ASPDateRegex.exec(object);
                if (match) {
                    return new Date(Number(match[1])).toISOString();
                } else {
                    return moment(object).format();
                }
            } else {
                throw new Error(
                    "Cannot convert object of type " +
                    getType(object) +
                    " to type ISODate"
                );
            }

        case "ASPDate":
            if (isNumber(object)) {
                return "/Date(" + object + ")/";
            } else if (object instanceof Date || moment.isMoment(object)) {
                return "/Date(" + object.valueOf() + ")/";
            } else if (isString(object)) {
                match = ASPDateRegex.exec(object);
                let value: number;
                if (match) {
                    value = new Date(Number(match[1])).valueOf();
                } else {
                    value = new Date(object).valueOf();
                }
                return "/Date(" + value + ")/";
            } else {
                throw new Error(
                    "Cannot convert object of type " +
                    getType(object) +
                    " to type ASPDate"
                );
            }

        default:
            throw new Error(`Unknown type ${type}`);
    }
}

// Define types for the typeCoerceDataSet function
interface TypeCoerceDataSetOptions {
    [key: string]: ConversionType;
}

export function typeCoerceDataSet(
    rawDS: any, // DataSet
    type: TypeCoerceDataSetOptions = { start: "Date", end: "Date" }
) {
    const idProp = rawDS._idProp;
    const coercedDS = new DataSet({ fieldId: idProp });

    const pipe = createNewDataPipeFrom(rawDS)
        .map((item: any) =>
            Object.keys(item).reduce((acc, key) => {
                acc[key] = convert(item[key], type[key]);
                return acc;
            }, {} as Record<string, any>)
        )
        .to(coercedDS);

    pipe.all().start();

    return {
        add: (...args: any[]) => rawDS.getDataSet().add(...args),
        remove: (...args: any[]) => rawDS.getDataSet().remove(...args),
        update: (...args: any[]) => rawDS.getDataSet().update(...args),
        updateOnly: (...args: any[]) => rawDS.getDataSet().updateOnly(...args),
        clear: (...args: any[]) => rawDS.getDataSet().clear(...args),

        forEach: coercedDS.forEach.bind(coercedDS),
        get: coercedDS.get.bind(coercedDS),
        getIds: coercedDS.getIds.bind(coercedDS),
        off: coercedDS.off.bind(coercedDS),
        on: coercedDS.on.bind(coercedDS),

        get length() {
            return coercedDS.length;
        },

        idProp,
        type,

        rawDS,
        coercedDS,
        dispose: () => pipe.stop()
    };
}

// XSS Protection
const setupXSSCleaner = (options?: any) => {
    const customXSS = new FilterXSS(options);
    return (string: string) => customXSS.process(string);
};

const setupNoOpCleaner = (string: string) => string;

let configuredXSSProtection = setupXSSCleaner();

export const setupXSSProtection = (options?: any) => {
    if (!options) {
        return;
    }

    if (options.disabled === true) {
        configuredXSSProtection = setupNoOpCleaner;
        console.warn('You disabled XSS protection. I hope you know what you\'re doing!');
    } else {
        if (options.filterOptions) {
            configuredXSSProtection = setupXSSCleaner(options.filterOptions);
        }
    }
};

const availableUtils = {
    ...util,
    convert,
    setupXSSProtection,
    xss: configuredXSSProtection
};

// Object.defineProperty(availableUtils, 'xss', {
//     get: function() {
//         return configuredXSSProtection;
//     }
// })

export default availableUtils;

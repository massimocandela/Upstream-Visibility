/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var	_ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

define("bgpst.lib.date-format", function(){});

define('bgpst.env.utils',[
    "bgpst.lib.date-format"
], function(){
    var locale, timeZoneOffset;

    timeZoneOffset = (new Date()).getTimezoneOffset();

    locale = {};
    /**
     * A collection of utilities
     */

    return {

        addMinutes: function (date, minutes) {
            return new Date(date.getTime() + (minutes * 60 * 1000));
        },

        subMinutes: function (date, minutes) {
            return new Date(date.getTime() - (minutes * 60 * 1000));
        },

        translate: function (pointsArray, vector) {
            var item, translatedArray;

            translatedArray = [];

            for (var n = 0, length = pointsArray.length; n < length; n++) {
                item = pointsArray[n];
                translatedArray.push({x: item.x + vector.x, y: item.y + vector.y});
            }
            return translatedArray;
        },

        computeColorScale: function (legend) {
            var mapOut, legendItem;

            mapOut = {valueRange: [], colorRange: []};

            for (var n = 0, length = legend.length; n < length; n++) {
                legendItem = legend[n];

                mapOut.valueRange = mapOut.valueRange.concat(legendItem.valueRange);
                mapOut.colorRange = mapOut.colorRange.concat(legendItem.colorRange);
            }
            return mapOut;
        },

        getLongestString: function (arrayOfStrings) {
            var maximum, item;

            maximum = -Infinity;
            for (var n = 0, length = arrayOfStrings.length; n < length; n++) {
                item = arrayOfStrings[n].length;

                if (maximum < item) {
                    maximum = item;
                }
            }

            return maximum;
        },

        writeSvgText: function (container, textArray, position, padding) {
            var textItem, actualPosition, interline, text;

            actualPosition = 0;
            interline = 15;

            container
                .selectAll("text")
                .remove();

            for (var n = 0, length = textArray.length; n < length; n++) {
                textItem = textArray[n];

                actualPosition = interline * n;

                container
                    .append("text")
                    .attr("class", "popup-text")
                    .attr("dx", position.x + padding.left)
                    .attr("dy", position.y + actualPosition + padding.top)
                    .text(textItem);
            }

            return text;
        },

        clone: function(obj){
            return JSON.parse(JSON.stringify(obj));
        },

        lightClone: function (toBeCloned) {
            var cloned, isArray;

            isArray = toBeCloned instanceof Array;

            if (isArray) {
                cloned = [];

                for (var n = 0, length = toBeCloned.length; n < length; n++) {
                    cloned.push(toBeCloned[n]);
                }

            } else {
                cloned = {};

                for (var item in toBeCloned) {
                    cloned[item] = toBeCloned[item];
                }
            }

            return cloned;
        },

        log: function (text, debug) {
            if (debug) {
                console.log(new Date(), text);
            }
        },

        getUrlParam: function (key) {
            var regex, result, match, url;

            url = document.location.search;
            regex = new RegExp('(?:\\?|&)' + key + '=(.*?)(?=&|$)', 'gi');
            result = [];

            while ((match = regex.exec(url)) != null) {
                result.push(match[1]);
            }
            return result;
        },

        indexOf: function (element, array) {
            var index = -1;

            if (array.indexOf) {
                index = array.indexOf(element);
            } else {

                for (var n = 0, length = array.length; n < length; n++) {
                    if (array[n] == element) {
                        index = n;
                        break;
                    }
                }
            }
            return index;
        },

        encapsulateDom: function (jQuerySelection) {
            return {$: jQuerySelection, plain: jQuerySelection[0]};
        },

        loadStylesheets: function (cssFiles, callback) {
            var cssRequested, stylesLoaded, cssListenerInterval, cssListenerTimeout, cssListener;

            stylesLoaded = document.styleSheets.length; // Initial css loaded
            cssRequested = cssFiles.length; // css to load

            for (var n=0; n<cssRequested; n++){ // load css
                this.loadCss(cssFiles[n]);
            }

            cssListenerInterval = 50; //50 ms
            cssListenerTimeout = 10000; // 10 secs
            cssListener = setInterval(function(){

                if(document.styleSheets.length >= stylesLoaded + cssRequested){ // check if all the css are loaded
                    clearInterval(cssListener);
                    callback();
                }else{
                    if (cssListenerTimeout <= 0){
                        clearInterval(cssListener);
                        console.log("It is not possible to load stylesheets.");
                    }
                    cssListenerTimeout -= cssListenerInterval;
                }
            }, cssListenerInterval);
        },

        loadCss: function (cssFile) {
            var newLink;

            newLink = document.createElement('link');
            newLink.rel = 'stylesheet';
            newLink.type = 'text/css';
            newLink.href = cssFile;
            newLink.async = true;
            (document.head || document.getElementsByTagName("head")[0]).appendChild(newLink);
        },

        getRectangularVertexPoints: function (x, y, width, height) {
            var leftTop, leftBottom, rightTop, rightBottom;

            leftTop = {x: x, y: y};
            leftBottom = {x: x, y: y + height};

            rightTop = {x: x + width, y: y};
            rightBottom = {x: x + width, y: y + height};

            return [leftTop, rightTop, rightBottom, leftBottom]; //returned clockwise
        },

        isThereAnIntersection: function (selectionVertices, cellVertices) {
            var a, b, c, d, e, f, g, h, thereIsAnIntersection,
                intersectionPoint;

            a = selectionVertices[0];
            b = selectionVertices[1];
            c = selectionVertices[2];
            d = selectionVertices[3];

            e = cellVertices[0];
            f = cellVertices[1];
            g = cellVertices[2];
            h = cellVertices[3];

            intersectionPoint = this.getLinesIntersection(a, b, e, h);

            function isPointInside(a, b, c, d, p) {
                return p.x >= a.x && p.x <= b.x && p.y >= a.y && p.y <= d.y;
            }

            // Don't declare the single items in dedicated vars in order to calculate them only if needed
            thereIsAnIntersection =
                isPointInside(e, f, g, h, a) || //Is It starting in a rect?
                isPointInside(a, b, c, d, this.getRectangleCenter(e, f, g, h)) ||
                isPointInside(a, b, c, d, e) ||
                isPointInside(a, b, c, d, h) ||
                isPointInside(a, b, c, d, g) ||
                isPointInside(a, b, c, d, f) ||
                isPointInside(e, f, g, h, c) || //Is it ending in a rect?
                (intersectionPoint != null);

            return thereIsAnIntersection;
        },

        getLinesIntersection: function (a, b, c, d) {

            /// "unroll" the objects
            var p0x = a.x,
                p0y = a.y,
                p1x = b.x,
                p1y = b.y,
                p2x = c.x,
                p2y = c.y,
                p3x = d.x,
                p3y = d.y,

            /// calc difference between the coords
                d1x = p1x - p0x,
                d1y = p1y - p0y,
                d2x = p3x - p2x,
                d2y = p3y - p2y,

            /// determinator
                d = d1x * d2y - d2x * d1y,

                px, py,
                s, t;

            /// if is not intersecting/is parallel then return immediately
            if (d == 0.0)
                return null;

            /// solve x and y for intersecting point
            px = p0x - p2x;
            py = p0y - p2y;

            s = (d1x * py - d1y * px) / d;
            if (s >= 0 && s <= 1) {

                /// if s was in range, calc t
                t = (d2x * py - d2y * px) / d;
                if (t >= 0 && t <= 1) {

                    return {x: p0x + (t * d1x),
                        y: p0y + (t * d1y)}
                }
            }

            return null;
        },

        getRectangleCenter: function (a, b, c, d) {
            var x, y;
            x = ((b.x - a.x) / 2) + a.x;
            y = ((d.y - a.y) / 2) + a.y;

            return {x: x, y: y};
        },

        join: function (array, char) {
            var stringOut = "";
            if (array.join) {
                stringOut = array.join(char);
            } else {

                for (var n = 0, length = array.length; n < length; n++) {
                    stringOut += array[n];
                    if (n != length - 1) {
                        stringOut += '' + char;
                    }
                }
            }

            return stringOut;
        },

        split: function (string, char, skipEmpty) {
            var arrayOut, item, tmp;

            arrayOut = string.split(char);

            if (skipEmpty) {

                tmp = [];

                for (var n = 0, length = arrayOut.length; n < length; n++) {
                    item = arrayOut[n];
                    if (item != '') {
                        tmp.push(item);
                    }
                }

                arrayOut = tmp;
            }

            return arrayOut;
        },

        logOnce: function (log) {
            if (!window.once) {
                window.once = true;
                this.log(log);
            }
        },

        reduceCalls: function (reductionId, reductionFactor) {
            var callNow;
            callNow = false;
            if (!window.reductionCallsCounters) {
                window.reductionCallsCounters = {};
            }

            if (window.reductionCallsCounters[reductionId] == null) {
                window.reductionCallsCounters[reductionId] = reductionFactor;
            }

            if (window.reductionCallsCounters[reductionId] == 0) {
                callNow = true;
                window.reductionCallsCounters[reductionId] = reductionFactor
            } else {
                window.reductionCallsCounters[reductionId]--;
            }

            return callNow;
        },

        getUTCDate: function(){
            return new Date(new Date().getTime() + (timeZoneOffset * 60 * 1000));
        },

        timestampToUTCDate: function (timestamp) {
            var date = new Date(timestamp * 1000);
            return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
        },

        getInstanceSuffix: function (domName) {
            var suffix;

            suffix = domName.replace('.', '');
            suffix = suffix.replace('#', '');

            return suffix;
        },

        getUrlParameters: function (domName) { // Get a map composed of ALL the parameters
            var map, suffix, subElements, atLeastOne;

            map = {};
            atLeastOne = false;
            suffix = this.getInstanceSuffix(domName) + '.';

            window.location.search
                .replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {

                    key = key.toString().replace(suffix, ''); // Creates the map removing the suffix
                    if (key.indexOf('.') != -1) {
                        subElements = key.split('.');
                        if (!map[subElements[0]]) {
                            map[subElements[0]] = {};
                        }
                        map[subElements[0]][subElements[1]] = value;
                    } else {
                        map[key] = value;
                    }

                    atLeastOne = true;
                });

            return (atLeastOne) ? map : null;
        },

        mergeMaps: function (map1, map2) {
            var mapOut;

            mapOut = {};

            for (var key in map1) {
                mapOut[key] = map1[key];
            }

            for (var key in map2) {
                mapOut[key] = map2[key];
            }

            return mapOut;
        },

        isNumber: function (n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        dateToString: function (date) { //This is an indirection, may be useful in the future to manipulate dates
            return "" + date.getUTCFullYear() +
                "-" + ('0' + (date.getUTCMonth() + 1)).slice(-2) +
                "-" + ('0' + date.getUTCDate()).slice(-2) +
                " " + ('0' + date.getUTCHours()).slice(-2) +
                ":" + ('0' + date.getUTCMinutes()).slice(-2) +
                ":" + ('0' + date.getUTCSeconds()).slice(-2) +
                " UTC";
        },

        dateToStringShort: function (date) { //This is an indirection, may be useful in the future to manipulate dates
            return "" + date.getUTCFullYear() +
                "-" + ('0' + (date.getUTCMonth() + 1)).slice(-2) +
                "-" + ('0' + date.getUTCDate()).slice(-2) +
                " " + ('0' + date.getUTCHours()).slice(-2) +
                ":" + ('0' + date.getUTCMinutes()).slice(-2);
        },

        timestampToLocalDate: function (timestamp) {
            var date;
            date = new Date(timestamp * 1000);
            return date;
        },

        localDateToUTCDate: function (date) {
            var utcDate;

            utcDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());

            return utcDate;
        },

        UTCDateToLocalDate: function (date) {
            return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
        },

        UTCDateToUTCTimestamp: function (date) {
            return parseInt(this.UTCDateToLocalDate(date).getTime()/1000);
        },

        callCallbacks: function (list, parameters) {
            var item;

            for (var n = 0, length = list.length; n < length; n++) {
                item = list[n];
                item.call(this, parameters);
            }
        },

        getCurrentUrl: function () {
            return window.location.href;
        },

        setParam: function (key, value, url) {
            var baseUrl, paramsUrl, pair, query, pairs, keyTmp, valueTmp, newPairs, inserted, questionMarkPosition,
                itemUrl, hash;

            hash = window.location.hash || "";
            newPairs = [];
            inserted = false;

            url = url.replace(hash, ""); // Remove hash

            if (url) {
                questionMarkPosition = url.indexOf('?');
                if (questionMarkPosition == -1) {
                    baseUrl = url;
                    paramsUrl = '';
                } else {
                    baseUrl = url.substring(0, questionMarkPosition);
                    paramsUrl = url.substring(questionMarkPosition + 1, url.length);
                }
            } else {
                baseUrl = '';
                paramsUrl = '';
            }

            pairs = paramsUrl.split('&');

            for (var n = 0, length = pairs.length; n < length; n++) {
                itemUrl = pairs[n];

                if (itemUrl != "") {
                    pair = (itemUrl).split('=');

                    keyTmp = pair[0];
                    valueTmp = pair[1];

                    if (keyTmp == key) {
                        if (value != null && value != '') {
                            newPairs.push(keyTmp + "=" + value);
                        }
                        inserted = true;
                    } else {
                        newPairs.push(keyTmp + "=" + valueTmp);
                    }
                }
            }

            if (!inserted) {
                if (value != null && value != "") {
                    newPairs.push(key + "=" + value);
                }
            }

            query = this.join(newPairs, '&');

            return baseUrl + '?' + query + hash;
        },

        containsAll: function (containerArray, containedArray) {
            var item;

            for (var n = 0, length = containedArray.length; n < length; n++) {
                item = containedArray[n];
                if (this.indexOf(item, containerArray) == -1) {
                    return false;
                }
            }

            return true;
        },

        objectSize: function (object) {
            var recurse, objectList, bytes;

            objectList = [];
            recurse = function (value) {
                bytes = 0;

                if (typeof value === 'boolean') {
                    bytes = 4;
                } else if (typeof value === 'string') {
                    bytes = value.length * 2;
                } else if (typeof value === 'number') {
                    bytes = 8;
                } else if (typeof value === 'object'
                    && objectList.indexOf(value) === -1) {
                    objectList[objectList.length] = value;
                    for (i in value) {
                        bytes += 8;
                        bytes += recurse(value[i]);
                    }
                }
                return bytes;
            };

            return recurse(object);
        },

        removeSubArray: function (mainArray, subArray) {
            var item, tmp;

            tmp = [];
            for (var n=0,length=mainArray.length; n<length; n++) {
                item = mainArray[n];
                if (subArray.indexOf(item) == -1){
                    tmp.push(item);
                }
            }

            return tmp;
        },

        validateIP: function(str){
            var ipv6TestRegEx, ipv4TestRegEx;

            ipv6TestRegEx = /^((?=.*::)(?!.*::.+::)(::)?([\dA-F]{1,4}:(:|\b)|){5}|([\dA-F]{1,4}:){6})((([\dA-F]{1,4}((?!\3)::|:\b|$))|(?!\2\3)){2}|(((2[0-4]|1\d|[1-9])?\d|25[0-5])\.?\b){4})$/;
            ipv4TestRegEx = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;

            return ipv4TestRegEx.test(str) || ipv6TestRegEx.test(str);

//            return /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$|^(([a-zA-Z]|[a-zA-Z][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z]|[A-Za-z][A-Za-z0-9\-]*[A-Za-z0-9])$|^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$/.test(str);
        },

        isLocalStorageAvailable: function(){
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        },

        getLocalData: function(key){
            var storedValue, storedExpiration;

            storedValue = localStorage[key];
            storedExpiration = localStorage['expirationDates-' + key];

            if (storedValue && (!storedExpiration || storedExpiration > (new Date()).getTime())){
                return storedValue;
            }

            return null;
        },

        setLocalData: function(key, data, expiration){
            try {

                localStorage[key] = data;
                localStorage['expirationDates-' + key] = expiration.getTime();

            } catch(error) {

                console.log('It was not possible to store the data: ' + error.toString());

                return false;
            }

            return true;
        },


        globalizeIfUndefined: function(what, where){
            for (var n=0,length=where.length; n<length; n++){
                if (typeof window[where[n]] == 'undefined'){
                    window[where[n]] = what;
                }
            }
        },


        getBrowserVersion: function(){

            if (!locale.browser) {
                locale.browser = (function () {
                    var userAgent, appName, matched, tem;
                    userAgent = navigator.userAgent;
                    appName = navigator.appName;
                    matched = userAgent.match(/(opera|chrome|safari|firefox|msie|trident|Windows Phone|BlackBerry|Opera Mini|IEMobile|iPhone|iPad|iPod|webOS|Android)\/?\s*([\d\.]+)/i) || [];
                    matched = matched[2] ? [matched[1], matched[2]] : [appName, navigator.appVersion, '-?'];
                    if (matched && (tem = userAgent.match(/version\/([\.\d]+)/i)) != null) matched[2] = tem[1];
                    return {name: matched[0], version: matched[1].split('.')};
                })();
            }

            return locale.browser;
        },


        logErrors: function(callback){
            if (callback){
                window.onerror = function errorUnwrapper(errorMsg, url, lineNumber) {
                    return callback("error", errorMsg + ' at ' + url + ' on line ' + lineNumber);
                }
            } else {
                window.onerror = null;
            }
        },

        clearObject: function(objToBeCleaned){
            for (var objKey in objToBeCleaned){
                objToBeCleaned[objKey] = null;
                delete objToBeCleaned[objKey];
            }
        },

        median: function(values) {
            values.sort(function(a,b) {return a - b;});
            var half;

            half = Math.floor(values.length / 2);

            if (values.length % 2) {
                return values[half];
            } else {
                return (values[half-1] + values[half]) / 2.0;
            }
        },

        htmlEncode: function(html){
            if (html === undefined || html === null){
                return html;
            } else {
                return html
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
        },

        htmlDecode: function(string){
            return string
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'")
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&');
        },

        observer: {
            subscriptions: {},

            publish: function (event, obj){
                var callbacks, callback;

                callbacks = this.subscriptions[event] || [];
                for (var n=0,length=callbacks.length; n < length; n++){
                    callback = callbacks[n];
                    callback.callback.call(callback.context, obj);
                }
            },

            subscribe: function (eventName, callback, context){
                var events, event;

                events = (eventName.indexOf(",") != -1) ? [eventName] : eventName.split(",");

                for (var n=0,length=events.length; n<length; n++){
                    event = events[n];
                    if (!this.subscriptions[event]){
                        this.subscriptions[event] = [];
                    }
                    this.subscriptions[event].push({ callback: callback, context: context });
                }

            }
        },

        isPrivateIp: function(addr){
            // return /^(::f{4}:)?10\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/
            //         .test(addr) ||
            //     /^(::f{4}:)?192\.168\.([0-9]{1,3})\.([0-9]{1,3})$/.test(addr) ||
            //     /^(::f{4}:)?172\.(1[6-9]|2\d|30|31)\.([0-9]{1,3})\.([0-9]{1,3})$/
            //         .test(addr) ||
            //     /^(::f{4}:)?127\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})$/.test(addr) ||
            //     /^(::f{4}:)?169\.254\.([0-9]{1,3})\.([0-9]{1,3})$/.test(addr) ||
            //     /^fc00:/i.test(addr) ||
            //     /^fe80:/i.test(addr) ||
            //     /^::1$/.test(addr) ||
            //     /^::$/.test(addr);

            var addressPieces;

            if (addr.indexOf('.') != -1 && addr.indexOf(':') == -1){ // IPv4
                addressPieces = addr.split(".");

                return (addressPieces[0] == 10) ||
                    (addressPieces[0] == 127) ||
                    (addressPieces[0] == 172 && addressPieces[1] >= 16 && addressPieces[1] <= 31) ||
                    (addressPieces[0] == 192 && addressPieces[1] == 168);

            } else { // IPv6
                addressPieces = addr.split(":");

                return (addressPieces[0].toLowerCase().indexOf("fd") == 0) ||
                    (addressPieces[0].toLowerCase().indexOf("fe80") == 0) ||
                    (addressPieces[0].toLowerCase().indexOf("fc00") == 0) ||
                    (addressPieces[0].toLowerCase().indexOf("fc00") == 0) ||
                    (addr == "::1") ||
                    (addr == "::");

            }
        },

        getIdFromIp: function(ip){
            ip = ip.replace(/\./g, "-");
            ip = ip.replace(/\:/g, "-");
            ip = ip.replace(/\*/g, "");

            return ip;
        },

        arrayUnique: function(values){
            var u = {}, a = [];
            for(var i = 0, l = values.length; i < l; ++i){
                if(u.hasOwnProperty(values[i])) {
                    continue;
                }
                a.push(values[i]);
                u[values[i]] = 1;
            }
            return a;
        },

        rotate: function(center, point, angle){
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (point.x - center.x)) + (sin * (point.y - center.y)) + center.x,
                ny = (cos * (point.y - center.y)) - (sin * (point.x - center.x)) + center.y;

            return { x: nx, y: ny };
        },

        hash: function(str) {
            var hash = 0, i, chr, len;
            if (str.length === 0) return hash;
            for (i = 0, len = str.length; i < len; i++) {
                chr   = str.charCodeAt(i);
                hash  = ((hash << 5) - hash) + chr;
                hash |= 0; // Convert to 32bit integer
            }
            return hash;
        },

        getSvg: function(svg){
            var serializer, source;

            serializer = new XMLSerializer();
            source = serializer.serializeToString(svg);
            if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }

            return '<?xml version="1.0" standalone="no"?>\r\n' + source;
        },

        getSvgAndCss: function(svgNode){
            var contains;

            svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
            var cssStyleText = getCSSStyles( svgNode );
            appendCSS( cssStyleText, svgNode );

            var serializer = new XMLSerializer();
            var svgString = serializer.serializeToString(svgNode);
            svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
            svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

            return svgString;

            function getCSSStyles( parentElement ) {
                var selectorTextArr = [];

                // Add Parent element Id and Classes to the list
                selectorTextArr.push( '#' + parentElement.id );
                for (var c = 0; c < parentElement.classList.length; c++)
                    if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
                        selectorTextArr.push( '.' + parentElement.classList[c] );

                // Add Children element Ids and Classes to the list
                var nodes = parentElement.getElementsByTagName("*");
                for (var i = 0; i < nodes.length; i++) {
                    var id = nodes[i].id;
                    if ( !contains('#' + id, selectorTextArr) )
                        selectorTextArr.push( '#'+id );

                    var classes = nodes[i].classList;
                    for (var c = 0; c < classes.length; c++)
                        if ( !contains('.' + classes[c], selectorTextArr) )
                            selectorTextArr.push( '.' + classes[c] );
                }

                // Extract CSS Rules
                var extractedCSSText = "";
                for (var i = 0; i < document.styleSheets.length; i++) {
                    var s = document.styleSheets[i];

                    try {
                        if(!s.cssRules) continue;
                    } catch( e ) {
                        if(e.name !== 'SecurityError') throw e; // for Firefox
                        continue;
                    }

                    var cssRules = s.cssRules;
                    for (var r = 0; r < cssRules.length; r++) {
                        if (cssRules[r].selectorText) {
                            var classes = cssRules[r]
                                .selectorText
                                .split(".")
                                .map(function (item) {
                                    return "." + item;
                                })
                                .filter(function(item){
                                    return item != ".";
                                });

                            if (contains(selectorTextArr, classes)) {
                                extractedCSSText += cssRules[r].cssText;
                            }
                        }
                    }
                }


                return extractedCSSText;

                function contains(containerArray, containedArray) {
                    var item;

                    for (var n = 0, length = containedArray.length; n < length; n++) {
                        item = containedArray[n];
                        if (containerArray.indexOf(item) == -1) {
                            return false;
                        }
                    }

                    return true;
                }

            }

            function appendCSS( cssText, element ) {
                var styleElement = document.createElement("style");
                styleElement.setAttribute("type","text/css");
                styleElement.innerHTML = cssText;
                var refNode = element.hasChildNodes() ? element.children[0] : null;
                element.insertBefore( styleElement, refNode );
            }
        },

        truncateAt: function(number, digits){
            var decimals, float;

            decimals = ("" + number).split(".");
            float = number;

            if (decimals[1]){
                decimals[1] = decimals[1].substring(0, digits);
                float = parseFloat(decimals.join("."));
            }

            return float;
        }
    }
});
define('bgpst.lib.moment',[], function(){define.amd=false;
//! moment.js
//! version : 2.18.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define('bgpst.lib.moment',b):a.moment=b()}(this,function(){"use strict";function a(){return sd.apply(null,arguments)}function b(a){sd=a}function c(a){return a instanceof Array||"[object Array]"===Object.prototype.toString.call(a)}function d(a){return null!=a&&"[object Object]"===Object.prototype.toString.call(a)}function e(a){var b;for(b in a)return!1;return!0}function f(a){return void 0===a}function g(a){return"number"==typeof a||"[object Number]"===Object.prototype.toString.call(a)}function h(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function i(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function j(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function k(a,b){for(var c in b)j(b,c)&&(a[c]=b[c]);return j(b,"toString")&&(a.toString=b.toString),j(b,"valueOf")&&(a.valueOf=b.valueOf),a}function l(a,b,c,d){return sb(a,b,c,d,!0).utc()}function m(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1,parsedDateParts:[],meridiem:null,rfc2822:!1,weekdayMismatch:!1}}function n(a){return null==a._pf&&(a._pf=m()),a._pf}function o(a){if(null==a._isValid){var b=n(a),c=ud.call(b.parsedDateParts,function(a){return null!=a}),d=!isNaN(a._d.getTime())&&b.overflow<0&&!b.empty&&!b.invalidMonth&&!b.invalidWeekday&&!b.nullInput&&!b.invalidFormat&&!b.userInvalidated&&(!b.meridiem||b.meridiem&&c);if(a._strict&&(d=d&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour),null!=Object.isFrozen&&Object.isFrozen(a))return d;a._isValid=d}return a._isValid}function p(a){var b=l(NaN);return null!=a?k(n(b),a):n(b).userInvalidated=!0,b}function q(a,b){var c,d,e;if(f(b._isAMomentObject)||(a._isAMomentObject=b._isAMomentObject),f(b._i)||(a._i=b._i),f(b._f)||(a._f=b._f),f(b._l)||(a._l=b._l),f(b._strict)||(a._strict=b._strict),f(b._tzm)||(a._tzm=b._tzm),f(b._isUTC)||(a._isUTC=b._isUTC),f(b._offset)||(a._offset=b._offset),f(b._pf)||(a._pf=n(b)),f(b._locale)||(a._locale=b._locale),vd.length>0)for(c=0;c<vd.length;c++)d=vd[c],e=b[d],f(e)||(a[d]=e);return a}function r(b){q(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),this.isValid()||(this._d=new Date(NaN)),wd===!1&&(wd=!0,a.updateOffset(this),wd=!1)}function s(a){return a instanceof r||null!=a&&null!=a._isAMomentObject}function t(a){return a<0?Math.ceil(a)||0:Math.floor(a)}function u(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=t(b)),c}function v(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;d<e;d++)(c&&a[d]!==b[d]||!c&&u(a[d])!==u(b[d]))&&g++;return g+f}function w(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function x(b,c){var d=!0;return k(function(){if(null!=a.deprecationHandler&&a.deprecationHandler(null,b),d){for(var e,f=[],g=0;g<arguments.length;g++){if(e="","object"==typeof arguments[g]){e+="\n["+g+"] ";for(var h in arguments[0])e+=h+": "+arguments[0][h]+", ";e=e.slice(0,-2)}else e=arguments[g];f.push(e)}w(b+"\nArguments: "+Array.prototype.slice.call(f).join("")+"\n"+(new Error).stack),d=!1}return c.apply(this,arguments)},c)}function y(b,c){null!=a.deprecationHandler&&a.deprecationHandler(b,c),xd[b]||(w(c),xd[b]=!0)}function z(a){return a instanceof Function||"[object Function]"===Object.prototype.toString.call(a)}function A(a){var b,c;for(c in a)b=a[c],z(b)?this[c]=b:this["_"+c]=b;this._config=a,this._dayOfMonthOrdinalParseLenient=new RegExp((this._dayOfMonthOrdinalParse.source||this._ordinalParse.source)+"|"+/\d{1,2}/.source)}function B(a,b){var c,e=k({},a);for(c in b)j(b,c)&&(d(a[c])&&d(b[c])?(e[c]={},k(e[c],a[c]),k(e[c],b[c])):null!=b[c]?e[c]=b[c]:delete e[c]);for(c in a)j(a,c)&&!j(b,c)&&d(a[c])&&(e[c]=k({},e[c]));return e}function C(a){null!=a&&this.set(a)}function D(a,b,c){var d=this._calendar[a]||this._calendar.sameElse;return z(d)?d.call(b,c):d}function E(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function F(){return this._invalidDate}function G(a){return this._ordinal.replace("%d",a)}function H(a,b,c,d){var e=this._relativeTime[c];return z(e)?e(a,b,c,d):e.replace(/%d/i,a)}function I(a,b){var c=this._relativeTime[a>0?"future":"past"];return z(c)?c(b):c.replace(/%s/i,b)}function J(a,b){var c=a.toLowerCase();Hd[c]=Hd[c+"s"]=Hd[b]=a}function K(a){return"string"==typeof a?Hd[a]||Hd[a.toLowerCase()]:void 0}function L(a){var b,c,d={};for(c in a)j(a,c)&&(b=K(c),b&&(d[b]=a[c]));return d}function M(a,b){Id[a]=b}function N(a){var b=[];for(var c in a)b.push({unit:c,priority:Id[c]});return b.sort(function(a,b){return a.priority-b.priority}),b}function O(b,c){return function(d){return null!=d?(Q(this,b,d),a.updateOffset(this,c),this):P(this,b)}}function P(a,b){return a.isValid()?a._d["get"+(a._isUTC?"UTC":"")+b]():NaN}function Q(a,b,c){a.isValid()&&a._d["set"+(a._isUTC?"UTC":"")+b](c)}function R(a){return a=K(a),z(this[a])?this[a]():this}function S(a,b){if("object"==typeof a){a=L(a);for(var c=N(a),d=0;d<c.length;d++)this[c[d].unit](a[c[d].unit])}else if(a=K(a),z(this[a]))return this[a](b);return this}function T(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}function U(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(Md[a]=e),b&&(Md[b[0]]=function(){return T(e.apply(this,arguments),b[1],b[2])}),c&&(Md[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function V(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function W(a){var b,c,d=a.match(Jd);for(b=0,c=d.length;b<c;b++)Md[d[b]]?d[b]=Md[d[b]]:d[b]=V(d[b]);return function(b){var e,f="";for(e=0;e<c;e++)f+=z(d[e])?d[e].call(b,a):d[e];return f}}function X(a,b){return a.isValid()?(b=Y(b,a.localeData()),Ld[b]=Ld[b]||W(b),Ld[b](a)):a.localeData().invalidDate()}function Y(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(Kd.lastIndex=0;d>=0&&Kd.test(a);)a=a.replace(Kd,c),Kd.lastIndex=0,d-=1;return a}function Z(a,b,c){ce[a]=z(b)?b:function(a,d){return a&&c?c:b}}function $(a,b){return j(ce,a)?ce[a](b._strict,b._locale):new RegExp(_(a))}function _(a){return aa(a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}))}function aa(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function ba(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),g(b)&&(d=function(a,c){c[b]=u(a)}),c=0;c<a.length;c++)de[a[c]]=d}function ca(a,b){ba(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function da(a,b,c){null!=b&&j(de,a)&&de[a](b,c._a,c,a)}function ea(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function fa(a,b){return a?c(this._months)?this._months[a.month()]:this._months[(this._months.isFormat||oe).test(b)?"format":"standalone"][a.month()]:c(this._months)?this._months:this._months.standalone}function ga(a,b){return a?c(this._monthsShort)?this._monthsShort[a.month()]:this._monthsShort[oe.test(b)?"format":"standalone"][a.month()]:c(this._monthsShort)?this._monthsShort:this._monthsShort.standalone}function ha(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._monthsParse)for(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[],d=0;d<12;++d)f=l([2e3,d]),this._shortMonthsParse[d]=this.monthsShort(f,"").toLocaleLowerCase(),this._longMonthsParse[d]=this.months(f,"").toLocaleLowerCase();return c?"MMM"===b?(e=ne.call(this._shortMonthsParse,g),e!==-1?e:null):(e=ne.call(this._longMonthsParse,g),e!==-1?e:null):"MMM"===b?(e=ne.call(this._shortMonthsParse,g),e!==-1?e:(e=ne.call(this._longMonthsParse,g),e!==-1?e:null)):(e=ne.call(this._longMonthsParse,g),e!==-1?e:(e=ne.call(this._shortMonthsParse,g),e!==-1?e:null))}function ia(a,b,c){var d,e,f;if(this._monthsParseExact)return ha.call(this,a,b,c);for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;d<12;d++){if(e=l([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}function ja(a,b){var c;if(!a.isValid())return a;if("string"==typeof b)if(/^\d+$/.test(b))b=u(b);else if(b=a.localeData().monthsParse(b),!g(b))return a;return c=Math.min(a.date(),ea(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a}function ka(b){return null!=b?(ja(this,b),a.updateOffset(this,!0),this):P(this,"Month")}function la(){return ea(this.year(),this.month())}function ma(a){return this._monthsParseExact?(j(this,"_monthsRegex")||oa.call(this),a?this._monthsShortStrictRegex:this._monthsShortRegex):(j(this,"_monthsShortRegex")||(this._monthsShortRegex=re),this._monthsShortStrictRegex&&a?this._monthsShortStrictRegex:this._monthsShortRegex)}function na(a){return this._monthsParseExact?(j(this,"_monthsRegex")||oa.call(this),a?this._monthsStrictRegex:this._monthsRegex):(j(this,"_monthsRegex")||(this._monthsRegex=se),this._monthsStrictRegex&&a?this._monthsStrictRegex:this._monthsRegex)}function oa(){function a(a,b){return b.length-a.length}var b,c,d=[],e=[],f=[];for(b=0;b<12;b++)c=l([2e3,b]),d.push(this.monthsShort(c,"")),e.push(this.months(c,"")),f.push(this.months(c,"")),f.push(this.monthsShort(c,""));for(d.sort(a),e.sort(a),f.sort(a),b=0;b<12;b++)d[b]=aa(d[b]),e[b]=aa(e[b]);for(b=0;b<24;b++)f[b]=aa(f[b]);this._monthsRegex=new RegExp("^("+f.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+e.join("|")+")","i"),this._monthsShortStrictRegex=new RegExp("^("+d.join("|")+")","i")}function pa(a){return qa(a)?366:365}function qa(a){return a%4===0&&a%100!==0||a%400===0}function ra(){return qa(this.year())}function sa(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return a<100&&a>=0&&isFinite(h.getFullYear())&&h.setFullYear(a),h}function ta(a){var b=new Date(Date.UTC.apply(null,arguments));return a<100&&a>=0&&isFinite(b.getUTCFullYear())&&b.setUTCFullYear(a),b}function ua(a,b,c){var d=7+b-c,e=(7+ta(a,0,d).getUTCDay()-b)%7;return-e+d-1}function va(a,b,c,d,e){var f,g,h=(7+c-d)%7,i=ua(a,d,e),j=1+7*(b-1)+h+i;return j<=0?(f=a-1,g=pa(f)+j):j>pa(a)?(f=a+1,g=j-pa(a)):(f=a,g=j),{year:f,dayOfYear:g}}function wa(a,b,c){var d,e,f=ua(a.year(),b,c),g=Math.floor((a.dayOfYear()-f-1)/7)+1;return g<1?(e=a.year()-1,d=g+xa(e,b,c)):g>xa(a.year(),b,c)?(d=g-xa(a.year(),b,c),e=a.year()+1):(e=a.year(),d=g),{week:d,year:e}}function xa(a,b,c){var d=ua(a,b,c),e=ua(a+1,b,c);return(pa(a)-d+e)/7}function ya(a){return wa(a,this._week.dow,this._week.doy).week}function za(){return this._week.dow}function Aa(){return this._week.doy}function Ba(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function Ca(a){var b=wa(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}function Da(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Ea(a,b){return"string"==typeof a?b.weekdaysParse(a)%7||7:isNaN(a)?null:a}function Fa(a,b){return a?c(this._weekdays)?this._weekdays[a.day()]:this._weekdays[this._weekdays.isFormat.test(b)?"format":"standalone"][a.day()]:c(this._weekdays)?this._weekdays:this._weekdays.standalone}function Ga(a){return a?this._weekdaysShort[a.day()]:this._weekdaysShort}function Ha(a){return a?this._weekdaysMin[a.day()]:this._weekdaysMin}function Ia(a,b,c){var d,e,f,g=a.toLocaleLowerCase();if(!this._weekdaysParse)for(this._weekdaysParse=[],this._shortWeekdaysParse=[],this._minWeekdaysParse=[],d=0;d<7;++d)f=l([2e3,1]).day(d),this._minWeekdaysParse[d]=this.weekdaysMin(f,"").toLocaleLowerCase(),this._shortWeekdaysParse[d]=this.weekdaysShort(f,"").toLocaleLowerCase(),this._weekdaysParse[d]=this.weekdays(f,"").toLocaleLowerCase();return c?"dddd"===b?(e=ne.call(this._weekdaysParse,g),e!==-1?e:null):"ddd"===b?(e=ne.call(this._shortWeekdaysParse,g),e!==-1?e:null):(e=ne.call(this._minWeekdaysParse,g),e!==-1?e:null):"dddd"===b?(e=ne.call(this._weekdaysParse,g),e!==-1?e:(e=ne.call(this._shortWeekdaysParse,g),e!==-1?e:(e=ne.call(this._minWeekdaysParse,g),e!==-1?e:null))):"ddd"===b?(e=ne.call(this._shortWeekdaysParse,g),e!==-1?e:(e=ne.call(this._weekdaysParse,g),e!==-1?e:(e=ne.call(this._minWeekdaysParse,g),e!==-1?e:null))):(e=ne.call(this._minWeekdaysParse,g),e!==-1?e:(e=ne.call(this._weekdaysParse,g),e!==-1?e:(e=ne.call(this._shortWeekdaysParse,g),e!==-1?e:null)))}function Ja(a,b,c){var d,e,f;if(this._weekdaysParseExact)return Ia.call(this,a,b,c);for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),d=0;d<7;d++){if(e=l([2e3,1]).day(d),c&&!this._fullWeekdaysParse[d]&&(this._fullWeekdaysParse[d]=new RegExp("^"+this.weekdays(e,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[d]=new RegExp("^"+this.weekdaysShort(e,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[d]=new RegExp("^"+this.weekdaysMin(e,"").replace(".",".?")+"$","i")),this._weekdaysParse[d]||(f="^"+this.weekdays(e,"")+"|^"+this.weekdaysShort(e,"")+"|^"+this.weekdaysMin(e,""),this._weekdaysParse[d]=new RegExp(f.replace(".",""),"i")),c&&"dddd"===b&&this._fullWeekdaysParse[d].test(a))return d;if(c&&"ddd"===b&&this._shortWeekdaysParse[d].test(a))return d;if(c&&"dd"===b&&this._minWeekdaysParse[d].test(a))return d;if(!c&&this._weekdaysParse[d].test(a))return d}}function Ka(a){if(!this.isValid())return null!=a?this:NaN;var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Da(a,this.localeData()),this.add(a-b,"d")):b}function La(a){if(!this.isValid())return null!=a?this:NaN;var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function Ma(a){if(!this.isValid())return null!=a?this:NaN;if(null!=a){var b=Ea(a,this.localeData());return this.day(this.day()%7?b:b-7)}return this.day()||7}function Na(a){return this._weekdaysParseExact?(j(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysStrictRegex:this._weekdaysRegex):(j(this,"_weekdaysRegex")||(this._weekdaysRegex=ye),this._weekdaysStrictRegex&&a?this._weekdaysStrictRegex:this._weekdaysRegex)}function Oa(a){return this._weekdaysParseExact?(j(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex):(j(this,"_weekdaysShortRegex")||(this._weekdaysShortRegex=ze),this._weekdaysShortStrictRegex&&a?this._weekdaysShortStrictRegex:this._weekdaysShortRegex)}function Pa(a){return this._weekdaysParseExact?(j(this,"_weekdaysRegex")||Qa.call(this),a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex):(j(this,"_weekdaysMinRegex")||(this._weekdaysMinRegex=Ae),this._weekdaysMinStrictRegex&&a?this._weekdaysMinStrictRegex:this._weekdaysMinRegex)}function Qa(){function a(a,b){return b.length-a.length}var b,c,d,e,f,g=[],h=[],i=[],j=[];for(b=0;b<7;b++)c=l([2e3,1]).day(b),d=this.weekdaysMin(c,""),e=this.weekdaysShort(c,""),f=this.weekdays(c,""),g.push(d),h.push(e),i.push(f),j.push(d),j.push(e),j.push(f);for(g.sort(a),h.sort(a),i.sort(a),j.sort(a),b=0;b<7;b++)h[b]=aa(h[b]),i[b]=aa(i[b]),j[b]=aa(j[b]);this._weekdaysRegex=new RegExp("^("+j.join("|")+")","i"),this._weekdaysShortRegex=this._weekdaysRegex,this._weekdaysMinRegex=this._weekdaysRegex,this._weekdaysStrictRegex=new RegExp("^("+i.join("|")+")","i"),this._weekdaysShortStrictRegex=new RegExp("^("+h.join("|")+")","i"),this._weekdaysMinStrictRegex=new RegExp("^("+g.join("|")+")","i")}function Ra(){return this.hours()%12||12}function Sa(){return this.hours()||24}function Ta(a,b){U(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}function Ua(a,b){return b._meridiemParse}function Va(a){return"p"===(a+"").toLowerCase().charAt(0)}function Wa(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function Xa(a){return a?a.toLowerCase().replace("_","-"):a}function Ya(a){for(var b,c,d,e,f=0;f<a.length;){for(e=Xa(a[f]).split("-"),b=e.length,c=Xa(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=Za(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&v(e,c,!0)>=b-1)break;b--}f++}return null}function Za(a){var b=null;if(!Fe[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=Be._abbr,require("./locale/"+a),$a(b)}catch(a){}return Fe[a]}function $a(a,b){var c;return a&&(c=f(b)?bb(a):_a(a,b),c&&(Be=c)),Be._abbr}function _a(a,b){if(null!==b){var c=Ee;if(b.abbr=a,null!=Fe[a])y("defineLocaleOverride","use moment.updateLocale(localeName, config) to change an existing locale. moment.defineLocale(localeName, config) should only be used for creating a new locale See http://momentjs.com/guides/#/warnings/define-locale/ for more info."),c=Fe[a]._config;else if(null!=b.parentLocale){if(null==Fe[b.parentLocale])return Ge[b.parentLocale]||(Ge[b.parentLocale]=[]),Ge[b.parentLocale].push({name:a,config:b}),null;c=Fe[b.parentLocale]._config}return Fe[a]=new C(B(c,b)),Ge[a]&&Ge[a].forEach(function(a){_a(a.name,a.config)}),$a(a),Fe[a]}return delete Fe[a],null}function ab(a,b){if(null!=b){var c,d=Ee;null!=Fe[a]&&(d=Fe[a]._config),b=B(d,b),c=new C(b),c.parentLocale=Fe[a],Fe[a]=c,$a(a)}else null!=Fe[a]&&(null!=Fe[a].parentLocale?Fe[a]=Fe[a].parentLocale:null!=Fe[a]&&delete Fe[a]);return Fe[a]}function bb(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return Be;if(!c(a)){if(b=Za(a))return b;a=[a]}return Ya(a)}function cb(){return Ad(Fe)}function db(a){var b,c=a._a;return c&&n(a).overflow===-2&&(b=c[fe]<0||c[fe]>11?fe:c[ge]<1||c[ge]>ea(c[ee],c[fe])?ge:c[he]<0||c[he]>24||24===c[he]&&(0!==c[ie]||0!==c[je]||0!==c[ke])?he:c[ie]<0||c[ie]>59?ie:c[je]<0||c[je]>59?je:c[ke]<0||c[ke]>999?ke:-1,n(a)._overflowDayOfYear&&(b<ee||b>ge)&&(b=ge),n(a)._overflowWeeks&&b===-1&&(b=le),n(a)._overflowWeekday&&b===-1&&(b=me),n(a).overflow=b),a}function eb(a){var b,c,d,e,f,g,h=a._i,i=He.exec(h)||Ie.exec(h);if(i){for(n(a).iso=!0,b=0,c=Ke.length;b<c;b++)if(Ke[b][1].exec(i[1])){e=Ke[b][0],d=Ke[b][2]!==!1;break}if(null==e)return void(a._isValid=!1);if(i[3]){for(b=0,c=Le.length;b<c;b++)if(Le[b][1].exec(i[3])){f=(i[2]||" ")+Le[b][0];break}if(null==f)return void(a._isValid=!1)}if(!d&&null!=f)return void(a._isValid=!1);if(i[4]){if(!Je.exec(i[4]))return void(a._isValid=!1);g="Z"}a._f=e+(f||"")+(g||""),lb(a)}else a._isValid=!1}function fb(a){var b,c,d,e,f,g,h,i,j={" GMT":" +0000"," EDT":" -0400"," EST":" -0500"," CDT":" -0500"," CST":" -0600"," MDT":" -0600"," MST":" -0700"," PDT":" -0700"," PST":" -0800"},k="YXWVUTSRQPONZABCDEFGHIKLM";if(b=a._i.replace(/\([^\)]*\)|[\n\t]/g," ").replace(/(\s\s+)/g," ").replace(/^\s|\s$/g,""),c=Ne.exec(b)){if(d=c[1]?"ddd"+(5===c[1].length?", ":" "):"",e="D MMM "+(c[2].length>10?"YYYY ":"YY "),f="HH:mm"+(c[4]?":ss":""),c[1]){var l=new Date(c[2]),m=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][l.getDay()];if(c[1].substr(0,3)!==m)return n(a).weekdayMismatch=!0,void(a._isValid=!1)}switch(c[5].length){case 2:0===i?h=" +0000":(i=k.indexOf(c[5][1].toUpperCase())-12,h=(i<0?" -":" +")+(""+i).replace(/^-?/,"0").match(/..$/)[0]+"00");break;case 4:h=j[c[5]];break;default:h=j[" GMT"]}c[5]=h,a._i=c.splice(1).join(""),g=" ZZ",a._f=d+e+f+g,lb(a),n(a).rfc2822=!0}else a._isValid=!1}function gb(b){var c=Me.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(eb(b),void(b._isValid===!1&&(delete b._isValid,fb(b),b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b)))))}function hb(a,b,c){return null!=a?a:null!=b?b:c}function ib(b){var c=new Date(a.now());return b._useUTC?[c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate()]:[c.getFullYear(),c.getMonth(),c.getDate()]}function jb(a){var b,c,d,e,f=[];if(!a._d){for(d=ib(a),a._w&&null==a._a[ge]&&null==a._a[fe]&&kb(a),null!=a._dayOfYear&&(e=hb(a._a[ee],d[ee]),(a._dayOfYear>pa(e)||0===a._dayOfYear)&&(n(a)._overflowDayOfYear=!0),c=ta(e,0,a._dayOfYear),a._a[fe]=c.getUTCMonth(),a._a[ge]=c.getUTCDate()),b=0;b<3&&null==a._a[b];++b)a._a[b]=f[b]=d[b];for(;b<7;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];24===a._a[he]&&0===a._a[ie]&&0===a._a[je]&&0===a._a[ke]&&(a._nextDay=!0,a._a[he]=0),a._d=(a._useUTC?ta:sa).apply(null,f),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[he]=24)}}function kb(a){var b,c,d,e,f,g,h,i;if(b=a._w,null!=b.GG||null!=b.W||null!=b.E)f=1,g=4,c=hb(b.GG,a._a[ee],wa(tb(),1,4).year),d=hb(b.W,1),e=hb(b.E,1),(e<1||e>7)&&(i=!0);else{f=a._locale._week.dow,g=a._locale._week.doy;var j=wa(tb(),f,g);c=hb(b.gg,a._a[ee],j.year),d=hb(b.w,j.week),null!=b.d?(e=b.d,(e<0||e>6)&&(i=!0)):null!=b.e?(e=b.e+f,(b.e<0||b.e>6)&&(i=!0)):e=f}d<1||d>xa(c,f,g)?n(a)._overflowWeeks=!0:null!=i?n(a)._overflowWeekday=!0:(h=va(c,d,e,f,g),a._a[ee]=h.year,a._dayOfYear=h.dayOfYear)}function lb(b){if(b._f===a.ISO_8601)return void eb(b);if(b._f===a.RFC_2822)return void fb(b);b._a=[],n(b).empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,j=0;for(e=Y(b._f,b._locale).match(Jd)||[],c=0;c<e.length;c++)f=e[c],d=(h.match($(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&n(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),j+=d.length),Md[f]?(d?n(b).empty=!1:n(b).unusedTokens.push(f),da(f,d,b)):b._strict&&!d&&n(b).unusedTokens.push(f);n(b).charsLeftOver=i-j,h.length>0&&n(b).unusedInput.push(h),b._a[he]<=12&&n(b).bigHour===!0&&b._a[he]>0&&(n(b).bigHour=void 0),n(b).parsedDateParts=b._a.slice(0),n(b).meridiem=b._meridiem,b._a[he]=mb(b._locale,b._a[he],b._meridiem),jb(b),db(b)}function mb(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&b<12&&(b+=12),d||12!==b||(b=0),b):b}function nb(a){var b,c,d,e,f;if(0===a._f.length)return n(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=q({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],lb(b),o(b)&&(f+=n(b).charsLeftOver,f+=10*n(b).unusedTokens.length,n(b).score=f,(null==d||f<d)&&(d=f,c=b));k(a,c||b)}function ob(a){if(!a._d){var b=L(a._i);a._a=i([b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],function(a){return a&&parseInt(a,10)}),jb(a)}}function pb(a){var b=new r(db(qb(a)));return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function qb(a){var b=a._i,d=a._f;return a._locale=a._locale||bb(a._l),null===b||void 0===d&&""===b?p({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),s(b)?new r(db(b)):(h(b)?a._d=b:c(d)?nb(a):d?lb(a):rb(a),o(a)||(a._d=null),a))}function rb(b){var e=b._i;f(e)?b._d=new Date(a.now()):h(e)?b._d=new Date(e.valueOf()):"string"==typeof e?gb(b):c(e)?(b._a=i(e.slice(0),function(a){return parseInt(a,10)}),jb(b)):d(e)?ob(b):g(e)?b._d=new Date(e):a.createFromInputFallback(b)}function sb(a,b,f,g,h){var i={};return f!==!0&&f!==!1||(g=f,f=void 0),(d(a)&&e(a)||c(a)&&0===a.length)&&(a=void 0),i._isAMomentObject=!0,i._useUTC=i._isUTC=h,i._l=f,i._i=a,i._f=b,i._strict=g,pb(i)}function tb(a,b,c,d){return sb(a,b,c,d,!1)}function ub(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return tb();for(d=b[0],e=1;e<b.length;++e)b[e].isValid()&&!b[e][a](d)||(d=b[e]);return d}function vb(){var a=[].slice.call(arguments,0);return ub("isBefore",a)}function wb(){var a=[].slice.call(arguments,0);return ub("isAfter",a)}function xb(a){for(var b in a)if(Re.indexOf(b)===-1||null!=a[b]&&isNaN(a[b]))return!1;for(var c=!1,d=0;d<Re.length;++d)if(a[Re[d]]){if(c)return!1;parseFloat(a[Re[d]])!==u(a[Re[d]])&&(c=!0)}return!0}function yb(){return this._isValid}function zb(){return Sb(NaN)}function Ab(a){var b=L(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._isValid=xb(b),this._milliseconds=+k+1e3*j+6e4*i+1e3*h*60*60,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=bb(),this._bubble()}function Bb(a){return a instanceof Ab}function Cb(a){return a<0?Math.round(-1*a)*-1:Math.round(a)}function Db(a,b){U(a,0,0,function(){var a=this.utcOffset(),c="+";return a<0&&(a=-a,c="-"),c+T(~~(a/60),2)+b+T(~~a%60,2)})}function Eb(a,b){var c=(b||"").match(a);if(null===c)return null;var d=c[c.length-1]||[],e=(d+"").match(Se)||["-",0,0],f=+(60*e[1])+u(e[2]);return 0===f?0:"+"===e[0]?f:-f}function Fb(b,c){var d,e;return c._isUTC?(d=c.clone(),e=(s(b)||h(b)?b.valueOf():tb(b).valueOf())-d.valueOf(),d._d.setTime(d._d.valueOf()+e),a.updateOffset(d,!1),d):tb(b).local()}function Gb(a){return 15*-Math.round(a._d.getTimezoneOffset()/15)}function Hb(b,c,d){var e,f=this._offset||0;if(!this.isValid())return null!=b?this:NaN;if(null!=b){if("string"==typeof b){if(b=Eb(_d,b),null===b)return this}else Math.abs(b)<16&&!d&&(b=60*b);return!this._isUTC&&c&&(e=Gb(this)),this._offset=b,this._isUTC=!0,null!=e&&this.add(e,"m"),f!==b&&(!c||this._changeInProgress?Xb(this,Sb(b-f,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this}return this._isUTC?f:Gb(this)}function Ib(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Jb(a){return this.utcOffset(0,a)}function Kb(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Gb(this),"m")),this}function Lb(){if(null!=this._tzm)this.utcOffset(this._tzm,!1,!0);else if("string"==typeof this._i){var a=Eb($d,this._i);null!=a?this.utcOffset(a):this.utcOffset(0,!0)}return this}function Mb(a){return!!this.isValid()&&(a=a?tb(a).utcOffset():0,(this.utcOffset()-a)%60===0)}function Nb(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Ob(){if(!f(this._isDSTShifted))return this._isDSTShifted;var a={};if(q(a,this),a=qb(a),a._a){var b=a._isUTC?l(a._a):tb(a._a);this._isDSTShifted=this.isValid()&&v(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Pb(){return!!this.isValid()&&!this._isUTC}function Qb(){return!!this.isValid()&&this._isUTC}function Rb(){return!!this.isValid()&&(this._isUTC&&0===this._offset)}function Sb(a,b){var c,d,e,f=a,h=null;return Bb(a)?f={ms:a._milliseconds,d:a._days,M:a._months}:g(a)?(f={},b?f[b]=a:f.milliseconds=a):(h=Te.exec(a))?(c="-"===h[1]?-1:1,f={y:0,d:u(h[ge])*c,h:u(h[he])*c,m:u(h[ie])*c,s:u(h[je])*c,ms:u(Cb(1e3*h[ke]))*c}):(h=Ue.exec(a))?(c="-"===h[1]?-1:1,f={y:Tb(h[2],c),M:Tb(h[3],c),w:Tb(h[4],c),d:Tb(h[5],c),h:Tb(h[6],c),m:Tb(h[7],c),s:Tb(h[8],c)}):null==f?f={}:"object"==typeof f&&("from"in f||"to"in f)&&(e=Vb(tb(f.from),tb(f.to)),f={},f.ms=e.milliseconds,f.M=e.months),d=new Ab(f),Bb(a)&&j(a,"_locale")&&(d._locale=a._locale),d}function Tb(a,b){var c=a&&parseFloat(a.replace(",","."));return(isNaN(c)?0:c)*b}function Ub(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function Vb(a,b){var c;return a.isValid()&&b.isValid()?(b=Fb(b,a),a.isBefore(b)?c=Ub(a,b):(c=Ub(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c):{milliseconds:0,months:0}}function Wb(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(y(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period). See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Sb(c,d),Xb(this,e,a),this}}function Xb(b,c,d,e){var f=c._milliseconds,g=Cb(c._days),h=Cb(c._months);b.isValid()&&(e=null==e||e,f&&b._d.setTime(b._d.valueOf()+f*d),g&&Q(b,"Date",P(b,"Date")+g*d),h&&ja(b,P(b,"Month")+h*d),e&&a.updateOffset(b,g||h))}function Yb(a,b){var c=a.diff(b,"days",!0);return c<-6?"sameElse":c<-1?"lastWeek":c<0?"lastDay":c<1?"sameDay":c<2?"nextDay":c<7?"nextWeek":"sameElse"}function Zb(b,c){var d=b||tb(),e=Fb(d,this).startOf("day"),f=a.calendarFormat(this,e)||"sameElse",g=c&&(z(c[f])?c[f].call(this,d):c[f]);return this.format(g||this.localeData().calendar(f,this,tb(d)))}function $b(){return new r(this)}function _b(a,b){var c=s(a)?a:tb(a);return!(!this.isValid()||!c.isValid())&&(b=K(f(b)?"millisecond":b),"millisecond"===b?this.valueOf()>c.valueOf():c.valueOf()<this.clone().startOf(b).valueOf())}function ac(a,b){var c=s(a)?a:tb(a);return!(!this.isValid()||!c.isValid())&&(b=K(f(b)?"millisecond":b),"millisecond"===b?this.valueOf()<c.valueOf():this.clone().endOf(b).valueOf()<c.valueOf())}function bc(a,b,c,d){return d=d||"()",("("===d[0]?this.isAfter(a,c):!this.isBefore(a,c))&&(")"===d[1]?this.isBefore(b,c):!this.isAfter(b,c))}function cc(a,b){var c,d=s(a)?a:tb(a);return!(!this.isValid()||!d.isValid())&&(b=K(b||"millisecond"),"millisecond"===b?this.valueOf()===d.valueOf():(c=d.valueOf(),this.clone().startOf(b).valueOf()<=c&&c<=this.clone().endOf(b).valueOf()))}function dc(a,b){return this.isSame(a,b)||this.isAfter(a,b)}function ec(a,b){return this.isSame(a,b)||this.isBefore(a,b)}function fc(a,b,c){var d,e,f,g;return this.isValid()?(d=Fb(a,this),d.isValid()?(e=6e4*(d.utcOffset()-this.utcOffset()),b=K(b),"year"===b||"month"===b||"quarter"===b?(g=gc(this,d),"quarter"===b?g/=3:"year"===b&&(g/=12)):(f=this-d,g="second"===b?f/1e3:"minute"===b?f/6e4:"hour"===b?f/36e5:"day"===b?(f-e)/864e5:"week"===b?(f-e)/6048e5:f),c?g:t(g)):NaN):NaN}function gc(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return b-f<0?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)||0}function hc(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ic(){if(!this.isValid())return null;var a=this.clone().utc();return a.year()<0||a.year()>9999?X(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):z(Date.prototype.toISOString)?this.toDate().toISOString():X(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function jc(){if(!this.isValid())return"moment.invalid(/* "+this._i+" */)";var a="moment",b="";this.isLocal()||(a=0===this.utcOffset()?"moment.utc":"moment.parseZone",b="Z");var c="["+a+'("]',d=0<=this.year()&&this.year()<=9999?"YYYY":"YYYYYY",e="-MM-DD[T]HH:mm:ss.SSS",f=b+'[")]';return this.format(c+d+e+f)}function kc(b){b||(b=this.isUtc()?a.defaultFormatUtc:a.defaultFormat);var c=X(this,b);return this.localeData().postformat(c)}function lc(a,b){return this.isValid()&&(s(a)&&a.isValid()||tb(a).isValid())?Sb({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function mc(a){return this.from(tb(),a)}function nc(a,b){return this.isValid()&&(s(a)&&a.isValid()||tb(a).isValid())?Sb({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function oc(a){return this.to(tb(),a)}function pc(a){var b;return void 0===a?this._locale._abbr:(b=bb(a),null!=b&&(this._locale=b),this)}function qc(){return this._locale}function rc(a){switch(a=K(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":case"date":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function sc(a){return a=K(a),void 0===a||"millisecond"===a?this:("date"===a&&(a="day"),this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms"))}function tc(){return this._d.valueOf()-6e4*(this._offset||0)}function uc(){return Math.floor(this.valueOf()/1e3)}function vc(){return new Date(this.valueOf())}function wc(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function xc(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function yc(){return this.isValid()?this.toISOString():null}function zc(){return o(this)}function Ac(){
return k({},n(this))}function Bc(){return n(this).overflow}function Cc(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function Dc(a,b){U(0,[a,a.length],0,b)}function Ec(a){return Ic.call(this,a,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)}function Fc(a){return Ic.call(this,a,this.isoWeek(),this.isoWeekday(),1,4)}function Gc(){return xa(this.year(),1,4)}function Hc(){var a=this.localeData()._week;return xa(this.year(),a.dow,a.doy)}function Ic(a,b,c,d,e){var f;return null==a?wa(this,d,e).year:(f=xa(a,d,e),b>f&&(b=f),Jc.call(this,a,b,c,d,e))}function Jc(a,b,c,d,e){var f=va(a,b,c,d,e),g=ta(f.year,0,f.dayOfYear);return this.year(g.getUTCFullYear()),this.month(g.getUTCMonth()),this.date(g.getUTCDate()),this}function Kc(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}function Lc(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function Mc(a,b){b[ke]=u(1e3*("0."+a))}function Nc(){return this._isUTC?"UTC":""}function Oc(){return this._isUTC?"Coordinated Universal Time":""}function Pc(a){return tb(1e3*a)}function Qc(){return tb.apply(null,arguments).parseZone()}function Rc(a){return a}function Sc(a,b,c,d){var e=bb(),f=l().set(d,b);return e[c](f,a)}function Tc(a,b,c){if(g(a)&&(b=a,a=void 0),a=a||"",null!=b)return Sc(a,b,c,"month");var d,e=[];for(d=0;d<12;d++)e[d]=Sc(a,d,c,"month");return e}function Uc(a,b,c,d){"boolean"==typeof a?(g(b)&&(c=b,b=void 0),b=b||""):(b=a,c=b,a=!1,g(b)&&(c=b,b=void 0),b=b||"");var e=bb(),f=a?e._week.dow:0;if(null!=c)return Sc(b,(c+f)%7,d,"day");var h,i=[];for(h=0;h<7;h++)i[h]=Sc(b,(h+f)%7,d,"day");return i}function Vc(a,b){return Tc(a,b,"months")}function Wc(a,b){return Tc(a,b,"monthsShort")}function Xc(a,b,c){return Uc(a,b,c,"weekdays")}function Yc(a,b,c){return Uc(a,b,c,"weekdaysShort")}function Zc(a,b,c){return Uc(a,b,c,"weekdaysMin")}function $c(){var a=this._data;return this._milliseconds=df(this._milliseconds),this._days=df(this._days),this._months=df(this._months),a.milliseconds=df(a.milliseconds),a.seconds=df(a.seconds),a.minutes=df(a.minutes),a.hours=df(a.hours),a.months=df(a.months),a.years=df(a.years),this}function _c(a,b,c,d){var e=Sb(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}function ad(a,b){return _c(this,a,b,1)}function bd(a,b){return _c(this,a,b,-1)}function cd(a){return a<0?Math.floor(a):Math.ceil(a)}function dd(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;return f>=0&&g>=0&&h>=0||f<=0&&g<=0&&h<=0||(f+=864e5*cd(fd(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=t(f/1e3),i.seconds=a%60,b=t(a/60),i.minutes=b%60,c=t(b/60),i.hours=c%24,g+=t(c/24),e=t(ed(g)),h+=e,g-=cd(fd(e)),d=t(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function ed(a){return 4800*a/146097}function fd(a){return 146097*a/4800}function gd(a){if(!this.isValid())return NaN;var b,c,d=this._milliseconds;if(a=K(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+ed(b),"month"===a?c:c/12;switch(b=this._days+Math.round(fd(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}function hd(){return this.isValid()?this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*u(this._months/12):NaN}function id(a){return function(){return this.as(a)}}function jd(a){return a=K(a),this.isValid()?this[a+"s"]():NaN}function kd(a){return function(){return this.isValid()?this._data[a]:NaN}}function ld(){return t(this.days()/7)}function md(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function nd(a,b,c){var d=Sb(a).abs(),e=uf(d.as("s")),f=uf(d.as("m")),g=uf(d.as("h")),h=uf(d.as("d")),i=uf(d.as("M")),j=uf(d.as("y")),k=e<=vf.ss&&["s",e]||e<vf.s&&["ss",e]||f<=1&&["m"]||f<vf.m&&["mm",f]||g<=1&&["h"]||g<vf.h&&["hh",g]||h<=1&&["d"]||h<vf.d&&["dd",h]||i<=1&&["M"]||i<vf.M&&["MM",i]||j<=1&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,md.apply(null,k)}function od(a){return void 0===a?uf:"function"==typeof a&&(uf=a,!0)}function pd(a,b){return void 0!==vf[a]&&(void 0===b?vf[a]:(vf[a]=b,"s"===a&&(vf.ss=b-1),!0))}function qd(a){if(!this.isValid())return this.localeData().invalidDate();var b=this.localeData(),c=nd(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function rd(){if(!this.isValid())return this.localeData().invalidDate();var a,b,c,d=wf(this._milliseconds)/1e3,e=wf(this._days),f=wf(this._months);a=t(d/60),b=t(a/60),d%=60,a%=60,c=t(f/12),f%=12;var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(m<0?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var sd,td;td=Array.prototype.some?Array.prototype.some:function(a){for(var b=Object(this),c=b.length>>>0,d=0;d<c;d++)if(d in b&&a.call(this,b[d],d,b))return!0;return!1};var ud=td,vd=a.momentProperties=[],wd=!1,xd={};a.suppressDeprecationWarnings=!1,a.deprecationHandler=null;var yd;yd=Object.keys?Object.keys:function(a){var b,c=[];for(b in a)j(a,b)&&c.push(b);return c};var zd,Ad=yd,Bd={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},Cd={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},Dd="Invalid date",Ed="%d",Fd=/\d{1,2}/,Gd={future:"in %s",past:"%s ago",s:"a few seconds",ss:"%d seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},Hd={},Id={},Jd=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,Kd=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,Ld={},Md={},Nd=/\d/,Od=/\d\d/,Pd=/\d{3}/,Qd=/\d{4}/,Rd=/[+-]?\d{6}/,Sd=/\d\d?/,Td=/\d\d\d\d?/,Ud=/\d\d\d\d\d\d?/,Vd=/\d{1,3}/,Wd=/\d{1,4}/,Xd=/[+-]?\d{1,6}/,Yd=/\d+/,Zd=/[+-]?\d+/,$d=/Z|[+-]\d\d:?\d\d/gi,_d=/Z|[+-]\d\d(?::?\d\d)?/gi,ae=/[+-]?\d+(\.\d{1,3})?/,be=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,ce={},de={},ee=0,fe=1,ge=2,he=3,ie=4,je=5,ke=6,le=7,me=8;zd=Array.prototype.indexOf?Array.prototype.indexOf:function(a){var b;for(b=0;b<this.length;++b)if(this[b]===a)return b;return-1};var ne=zd;U("M",["MM",2],"Mo",function(){return this.month()+1}),U("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),U("MMMM",0,0,function(a){return this.localeData().months(this,a)}),J("month","M"),M("month",8),Z("M",Sd),Z("MM",Sd,Od),Z("MMM",function(a,b){return b.monthsShortRegex(a)}),Z("MMMM",function(a,b){return b.monthsRegex(a)}),ba(["M","MM"],function(a,b){b[fe]=u(a)-1}),ba(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);null!=e?b[fe]=e:n(c).invalidMonth=a});var oe=/D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,pe="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),qe="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),re=be,se=be;U("Y",0,0,function(){var a=this.year();return a<=9999?""+a:"+"+a}),U(0,["YY",2],0,function(){return this.year()%100}),U(0,["YYYY",4],0,"year"),U(0,["YYYYY",5],0,"year"),U(0,["YYYYYY",6,!0],0,"year"),J("year","y"),M("year",1),Z("Y",Zd),Z("YY",Sd,Od),Z("YYYY",Wd,Qd),Z("YYYYY",Xd,Rd),Z("YYYYYY",Xd,Rd),ba(["YYYYY","YYYYYY"],ee),ba("YYYY",function(b,c){c[ee]=2===b.length?a.parseTwoDigitYear(b):u(b)}),ba("YY",function(b,c){c[ee]=a.parseTwoDigitYear(b)}),ba("Y",function(a,b){b[ee]=parseInt(a,10)}),a.parseTwoDigitYear=function(a){return u(a)+(u(a)>68?1900:2e3)};var te=O("FullYear",!0);U("w",["ww",2],"wo","week"),U("W",["WW",2],"Wo","isoWeek"),J("week","w"),J("isoWeek","W"),M("week",5),M("isoWeek",5),Z("w",Sd),Z("ww",Sd,Od),Z("W",Sd),Z("WW",Sd,Od),ca(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=u(a)});var ue={dow:0,doy:6};U("d",0,"do","day"),U("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),U("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),U("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),U("e",0,0,"weekday"),U("E",0,0,"isoWeekday"),J("day","d"),J("weekday","e"),J("isoWeekday","E"),M("day",11),M("weekday",11),M("isoWeekday",11),Z("d",Sd),Z("e",Sd),Z("E",Sd),Z("dd",function(a,b){return b.weekdaysMinRegex(a)}),Z("ddd",function(a,b){return b.weekdaysShortRegex(a)}),Z("dddd",function(a,b){return b.weekdaysRegex(a)}),ca(["dd","ddd","dddd"],function(a,b,c,d){var e=c._locale.weekdaysParse(a,d,c._strict);null!=e?b.d=e:n(c).invalidWeekday=a}),ca(["d","e","E"],function(a,b,c,d){b[d]=u(a)});var ve="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),we="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),xe="Su_Mo_Tu_We_Th_Fr_Sa".split("_"),ye=be,ze=be,Ae=be;U("H",["HH",2],0,"hour"),U("h",["hh",2],0,Ra),U("k",["kk",2],0,Sa),U("hmm",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)}),U("hmmss",0,0,function(){return""+Ra.apply(this)+T(this.minutes(),2)+T(this.seconds(),2)}),U("Hmm",0,0,function(){return""+this.hours()+T(this.minutes(),2)}),U("Hmmss",0,0,function(){return""+this.hours()+T(this.minutes(),2)+T(this.seconds(),2)}),Ta("a",!0),Ta("A",!1),J("hour","h"),M("hour",13),Z("a",Ua),Z("A",Ua),Z("H",Sd),Z("h",Sd),Z("k",Sd),Z("HH",Sd,Od),Z("hh",Sd,Od),Z("kk",Sd,Od),Z("hmm",Td),Z("hmmss",Ud),Z("Hmm",Td),Z("Hmmss",Ud),ba(["H","HH"],he),ba(["k","kk"],function(a,b,c){var d=u(a);b[he]=24===d?0:d}),ba(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),ba(["h","hh"],function(a,b,c){b[he]=u(a),n(c).bigHour=!0}),ba("hmm",function(a,b,c){var d=a.length-2;b[he]=u(a.substr(0,d)),b[ie]=u(a.substr(d)),n(c).bigHour=!0}),ba("hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[he]=u(a.substr(0,d)),b[ie]=u(a.substr(d,2)),b[je]=u(a.substr(e)),n(c).bigHour=!0}),ba("Hmm",function(a,b,c){var d=a.length-2;b[he]=u(a.substr(0,d)),b[ie]=u(a.substr(d))}),ba("Hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[he]=u(a.substr(0,d)),b[ie]=u(a.substr(d,2)),b[je]=u(a.substr(e))});var Be,Ce=/[ap]\.?m?\.?/i,De=O("Hours",!0),Ee={calendar:Bd,longDateFormat:Cd,invalidDate:Dd,ordinal:Ed,dayOfMonthOrdinalParse:Fd,relativeTime:Gd,months:pe,monthsShort:qe,week:ue,weekdays:ve,weekdaysMin:xe,weekdaysShort:we,meridiemParse:Ce},Fe={},Ge={},He=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Ie=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/,Je=/Z|[+-]\d\d(?::?\d\d)?/,Ke=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],Le=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Me=/^\/?Date\((\-?\d+)/i,Ne=/^((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d?\d\s(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(?:\d\d)?\d\d\s)(\d\d:\d\d)(\:\d\d)?(\s(?:UT|GMT|[ECMP][SD]T|[A-IK-Za-ik-z]|[+-]\d{4}))$/;a.createFromInputFallback=x("value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are discouraged and will be removed in an upcoming major release. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),a.ISO_8601=function(){},a.RFC_2822=function(){};var Oe=x("moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=tb.apply(null,arguments);return this.isValid()&&a.isValid()?a<this?this:a:p()}),Pe=x("moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/",function(){var a=tb.apply(null,arguments);return this.isValid()&&a.isValid()?a>this?this:a:p()}),Qe=function(){return Date.now?Date.now():+new Date},Re=["year","quarter","month","week","day","hour","minute","second","millisecond"];Db("Z",":"),Db("ZZ",""),Z("Z",_d),Z("ZZ",_d),ba(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=Eb(_d,a)});var Se=/([\+\-]|\d\d)/gi;a.updateOffset=function(){};var Te=/^(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/,Ue=/^(-)?P(?:(-?[0-9,.]*)Y)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)W)?(?:(-?[0-9,.]*)D)?(?:T(?:(-?[0-9,.]*)H)?(?:(-?[0-9,.]*)M)?(?:(-?[0-9,.]*)S)?)?$/;Sb.fn=Ab.prototype,Sb.invalid=zb;var Ve=Wb(1,"add"),We=Wb(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ",a.defaultFormatUtc="YYYY-MM-DDTHH:mm:ss[Z]";var Xe=x("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});U(0,["gg",2],0,function(){return this.weekYear()%100}),U(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Dc("gggg","weekYear"),Dc("ggggg","weekYear"),Dc("GGGG","isoWeekYear"),Dc("GGGGG","isoWeekYear"),J("weekYear","gg"),J("isoWeekYear","GG"),M("weekYear",1),M("isoWeekYear",1),Z("G",Zd),Z("g",Zd),Z("GG",Sd,Od),Z("gg",Sd,Od),Z("GGGG",Wd,Qd),Z("gggg",Wd,Qd),Z("GGGGG",Xd,Rd),Z("ggggg",Xd,Rd),ca(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=u(a)}),ca(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),U("Q",0,"Qo","quarter"),J("quarter","Q"),M("quarter",7),Z("Q",Nd),ba("Q",function(a,b){b[fe]=3*(u(a)-1)}),U("D",["DD",2],"Do","date"),J("date","D"),M("date",9),Z("D",Sd),Z("DD",Sd,Od),Z("Do",function(a,b){return a?b._dayOfMonthOrdinalParse||b._ordinalParse:b._dayOfMonthOrdinalParseLenient}),ba(["D","DD"],ge),ba("Do",function(a,b){b[ge]=u(a.match(Sd)[0],10)});var Ye=O("Date",!0);U("DDD",["DDDD",3],"DDDo","dayOfYear"),J("dayOfYear","DDD"),M("dayOfYear",4),Z("DDD",Vd),Z("DDDD",Pd),ba(["DDD","DDDD"],function(a,b,c){c._dayOfYear=u(a)}),U("m",["mm",2],0,"minute"),J("minute","m"),M("minute",14),Z("m",Sd),Z("mm",Sd,Od),ba(["m","mm"],ie);var Ze=O("Minutes",!1);U("s",["ss",2],0,"second"),J("second","s"),M("second",15),Z("s",Sd),Z("ss",Sd,Od),ba(["s","ss"],je);var $e=O("Seconds",!1);U("S",0,0,function(){return~~(this.millisecond()/100)}),U(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),U(0,["SSS",3],0,"millisecond"),U(0,["SSSS",4],0,function(){return 10*this.millisecond()}),U(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),U(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),U(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),U(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),U(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),J("millisecond","ms"),M("millisecond",16),Z("S",Vd,Nd),Z("SS",Vd,Od),Z("SSS",Vd,Pd);var _e;for(_e="SSSS";_e.length<=9;_e+="S")Z(_e,Yd);for(_e="S";_e.length<=9;_e+="S")ba(_e,Mc);var af=O("Milliseconds",!1);U("z",0,0,"zoneAbbr"),U("zz",0,0,"zoneName");var bf=r.prototype;bf.add=Ve,bf.calendar=Zb,bf.clone=$b,bf.diff=fc,bf.endOf=sc,bf.format=kc,bf.from=lc,bf.fromNow=mc,bf.to=nc,bf.toNow=oc,bf.get=R,bf.invalidAt=Bc,bf.isAfter=_b,bf.isBefore=ac,bf.isBetween=bc,bf.isSame=cc,bf.isSameOrAfter=dc,bf.isSameOrBefore=ec,bf.isValid=zc,bf.lang=Xe,bf.locale=pc,bf.localeData=qc,bf.max=Pe,bf.min=Oe,bf.parsingFlags=Ac,bf.set=S,bf.startOf=rc,bf.subtract=We,bf.toArray=wc,bf.toObject=xc,bf.toDate=vc,bf.toISOString=ic,bf.inspect=jc,bf.toJSON=yc,bf.toString=hc,bf.unix=uc,bf.valueOf=tc,bf.creationData=Cc,bf.year=te,bf.isLeapYear=ra,bf.weekYear=Ec,bf.isoWeekYear=Fc,bf.quarter=bf.quarters=Kc,bf.month=ka,bf.daysInMonth=la,bf.week=bf.weeks=Ba,bf.isoWeek=bf.isoWeeks=Ca,bf.weeksInYear=Hc,bf.isoWeeksInYear=Gc,bf.date=Ye,bf.day=bf.days=Ka,bf.weekday=La,bf.isoWeekday=Ma,bf.dayOfYear=Lc,bf.hour=bf.hours=De,bf.minute=bf.minutes=Ze,bf.second=bf.seconds=$e,bf.millisecond=bf.milliseconds=af,bf.utcOffset=Hb,bf.utc=Jb,bf.local=Kb,bf.parseZone=Lb,bf.hasAlignedHourOffset=Mb,bf.isDST=Nb,bf.isLocal=Pb,bf.isUtcOffset=Qb,bf.isUtc=Rb,bf.isUTC=Rb,bf.zoneAbbr=Nc,bf.zoneName=Oc,bf.dates=x("dates accessor is deprecated. Use date instead.",Ye),bf.months=x("months accessor is deprecated. Use month instead",ka),bf.years=x("years accessor is deprecated. Use year instead",te),bf.zone=x("moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/",Ib),bf.isDSTShifted=x("isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information",Ob);var cf=C.prototype;cf.calendar=D,cf.longDateFormat=E,cf.invalidDate=F,cf.ordinal=G,cf.preparse=Rc,cf.postformat=Rc,cf.relativeTime=H,cf.pastFuture=I,cf.set=A,cf.months=fa,cf.monthsShort=ga,cf.monthsParse=ia,cf.monthsRegex=na,cf.monthsShortRegex=ma,cf.week=ya,cf.firstDayOfYear=Aa,cf.firstDayOfWeek=za,cf.weekdays=Fa,cf.weekdaysMin=Ha,cf.weekdaysShort=Ga,cf.weekdaysParse=Ja,cf.weekdaysRegex=Na,cf.weekdaysShortRegex=Oa,cf.weekdaysMinRegex=Pa,cf.isPM=Va,cf.meridiem=Wa,$a("en",{dayOfMonthOrdinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===u(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),a.lang=x("moment.lang is deprecated. Use moment.locale instead.",$a),a.langData=x("moment.langData is deprecated. Use moment.localeData instead.",bb);var df=Math.abs,ef=id("ms"),ff=id("s"),gf=id("m"),hf=id("h"),jf=id("d"),kf=id("w"),lf=id("M"),mf=id("y"),nf=kd("milliseconds"),of=kd("seconds"),pf=kd("minutes"),qf=kd("hours"),rf=kd("days"),sf=kd("months"),tf=kd("years"),uf=Math.round,vf={ss:44,s:45,m:45,h:22,d:26,M:11},wf=Math.abs,xf=Ab.prototype;return xf.isValid=yb,xf.abs=$c,xf.add=ad,xf.subtract=bd,xf.as=gd,xf.asMilliseconds=ef,xf.asSeconds=ff,xf.asMinutes=gf,xf.asHours=hf,xf.asDays=jf,xf.asWeeks=kf,xf.asMonths=lf,xf.asYears=mf,xf.valueOf=hd,xf._bubble=dd,xf.get=jd,xf.milliseconds=nf,xf.seconds=of,xf.minutes=pf,xf.hours=qf,xf.days=rf,xf.weeks=ld,xf.months=sf,xf.years=tf,xf.humanize=qd,xf.toISOString=rd,xf.toString=rd,xf.toJSON=rd,xf.locale=pc,xf.localeData=qc,xf.toIsoString=x("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",rd),xf.lang=Xe,U("X",0,0,"unix"),U("x",0,0,"valueOf"),Z("x",Zd),Z("X",ae),ba("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),ba("x",function(a,b,c){c._d=new Date(u(a))}),a.version="2.18.1",b(tb),a.fn=bf,a.min=vb,a.max=wb,a.now=Qe,a.utc=l,a.unix=Pc,a.months=Vc,a.isDate=h,a.locale=$a,a.invalid=p,a.duration=Sb,a.isMoment=s,a.weekdays=Xc,a.parseZone=Qc,a.localeData=bb,a.isDuration=Bb,a.monthsShort=Wc,a.weekdaysMin=Zc,a.defineLocale=_a,a.updateLocale=ab,a.locales=cb,a.weekdaysShort=Yc,a.normalizeUnits=K,a.relativeTimeRounding=od,a.relativeTimeThreshold=pd,a.calendarFormat=Yb,a.prototype=bf,a});
return moment; });

/**
 * Change configs here.
 */

define('bgpst.env.config',[], function(){

    /**
     * Configuration file
     */

    return {
        widgetPrefix: "ic",
        defaultTimeWindowMinutes: 60 * 24 * 2, // 2 days

        dataAPIs:{
            main: "https://stat.ripe.net/data/bgplay/data.json",
            count: "https://stat.ripe.net/data/ris-peer-count/data.json",
            cpInfo: "https://stat.ripe.net/data/geoloc/data.json",
            asInfo: "https://stat.ripe.net/data/as-overview/data.json",
            ipInfo: "https://stat.ripe.net/data/whats-my-ip/data.json" 
        },
        
        style: {
            colorRange: ["#FEE8c8", "#B30000"],
            barChart: {
                margin: { top: 20, right: 20, bottom: 70, left: 40, label: 7 },
                width: 1000,
                height: 200
            },
            map: {
                width: 660,
                height: 500
            },
            legend: {
                width: 20,
                height: 300,
                margin: {
                    left: 20,
                    top: 20
                },
                marginLabel: 30
            }
        }
        
    };
});


define('bgpst.env.languages.en',[], function(){
    return {
        title: "Crashes in Washington D.C.",
        legendLabel: "Number of crashes"
    }
});
define('bgpst.lib.jquery-libs',[], function(){define.amd=false;
/*! jQuery v1.11.1 | (c) 2005, 2014 jQuery Foundation, Inc. | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=c.slice,e=c.concat,f=c.push,g=c.indexOf,h={},i=h.toString,j=h.hasOwnProperty,k={},l="1.11.1",m=function(a,b){return new m.fn.init(a,b)},n=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,o=/^-ms-/,p=/-([\da-z])/gi,q=function(a,b){return b.toUpperCase()};m.fn=m.prototype={jquery:l,constructor:m,selector:"",length:0,toArray:function(){return d.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:d.call(this)},pushStack:function(a){var b=m.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a,b){return m.each(this,a,b)},map:function(a){return this.pushStack(m.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(d.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor(null)},push:f,sort:c.sort,splice:c.splice},m.extend=m.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||m.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(e=arguments[h]))for(d in e)a=g[d],c=e[d],g!==c&&(j&&c&&(m.isPlainObject(c)||(b=m.isArray(c)))?(b?(b=!1,f=a&&m.isArray(a)?a:[]):f=a&&m.isPlainObject(a)?a:{},g[d]=m.extend(j,f,c)):void 0!==c&&(g[d]=c));return g},m.extend({expando:"jQuery"+(l+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===m.type(a)},isArray:Array.isArray||function(a){return"array"===m.type(a)},isWindow:function(a){return null!=a&&a==a.window},isNumeric:function(a){return!m.isArray(a)&&a-parseFloat(a)>=0},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},isPlainObject:function(a){var b;if(!a||"object"!==m.type(a)||a.nodeType||m.isWindow(a))return!1;try{if(a.constructor&&!j.call(a,"constructor")&&!j.call(a.constructor.prototype,"isPrototypeOf"))return!1}catch(c){return!1}if(k.ownLast)for(b in a)return j.call(a,b);for(b in a);return void 0===b||j.call(a,b)},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?h[i.call(a)]||"object":typeof a},globalEval:function(b){b&&m.trim(b)&&(a.execScript||function(b){a.eval.call(a,b)})(b)},camelCase:function(a){return a.replace(o,"ms-").replace(p,q)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b,c){var d,e=0,f=a.length,g=r(a);if(c){if(g){for(;f>e;e++)if(d=b.apply(a[e],c),d===!1)break}else for(e in a)if(d=b.apply(a[e],c),d===!1)break}else if(g){for(;f>e;e++)if(d=b.call(a[e],e,a[e]),d===!1)break}else for(e in a)if(d=b.call(a[e],e,a[e]),d===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(n,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(r(Object(a))?m.merge(c,"string"==typeof a?[a]:a):f.call(c,a)),c},inArray:function(a,b,c){var d;if(b){if(g)return g.call(b,a,c);for(d=b.length,c=c?0>c?Math.max(0,d+c):c:0;d>c;c++)if(c in b&&b[c]===a)return c}return-1},merge:function(a,b){var c=+b.length,d=0,e=a.length;while(c>d)a[e++]=b[d++];if(c!==c)while(void 0!==b[d])a[e++]=b[d++];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,f=0,g=a.length,h=r(a),i=[];if(h)for(;g>f;f++)d=b(a[f],f,c),null!=d&&i.push(d);else for(f in a)d=b(a[f],f,c),null!=d&&i.push(d);return e.apply([],i)},guid:1,proxy:function(a,b){var c,e,f;return"string"==typeof b&&(f=a[b],b=a,a=f),m.isFunction(a)?(c=d.call(arguments,2),e=function(){return a.apply(b||this,c.concat(d.call(arguments)))},e.guid=a.guid=a.guid||m.guid++,e):void 0},now:function(){return+new Date},support:k}),m.each("Boolean Number String Function Array Date RegExp Object Error".split(" "),function(a,b){h["[object "+b+"]"]=b.toLowerCase()});function r(a){var b=a.length,c=m.type(a);return"function"===c||m.isWindow(a)?!1:1===a.nodeType&&b?!0:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var s=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+-new Date,v=a.document,w=0,x=0,y=gb(),z=gb(),A=gb(),B=function(a,b){return a===b&&(l=!0),0},C="undefined",D=1<<31,E={}.hasOwnProperty,F=[],G=F.pop,H=F.push,I=F.push,J=F.slice,K=F.indexOf||function(a){for(var b=0,c=this.length;c>b;b++)if(this[b]===a)return b;return-1},L="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",M="[\\x20\\t\\r\\n\\f]",N="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",O=N.replace("w","w#"),P="\\["+M+"*("+N+")(?:"+M+"*([*^$|!~]?=)"+M+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+O+"))|)"+M+"*\\]",Q=":("+N+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+P+")*)|.*)\\)|)",R=new RegExp("^"+M+"+|((?:^|[^\\\\])(?:\\\\.)*)"+M+"+$","g"),S=new RegExp("^"+M+"*,"+M+"*"),T=new RegExp("^"+M+"*([>+~]|"+M+")"+M+"*"),U=new RegExp("="+M+"*([^\\]'\"]*?)"+M+"*\\]","g"),V=new RegExp(Q),W=new RegExp("^"+O+"$"),X={ID:new RegExp("^#("+N+")"),CLASS:new RegExp("^\\.("+N+")"),TAG:new RegExp("^("+N.replace("w","w*")+")"),ATTR:new RegExp("^"+P),PSEUDO:new RegExp("^"+Q),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+M+"*(even|odd|(([+-]|)(\\d*)n|)"+M+"*(?:([+-]|)"+M+"*(\\d+)|))"+M+"*\\)|)","i"),bool:new RegExp("^(?:"+L+")$","i"),needsContext:new RegExp("^"+M+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+M+"*((?:-\\d)?\\d*)"+M+"*\\)|)(?=[^-]|$)","i")},Y=/^(?:input|select|textarea|button)$/i,Z=/^h\d$/i,$=/^[^{]+\{\s*\[native \w/,_=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,ab=/[+~]/,bb=/'|\\/g,cb=new RegExp("\\\\([\\da-f]{1,6}"+M+"?|("+M+")|.)","ig"),db=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)};try{I.apply(F=J.call(v.childNodes),v.childNodes),F[v.childNodes.length].nodeType}catch(eb){I={apply:F.length?function(a,b){H.apply(a,J.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fb(a,b,d,e){var f,h,j,k,l,o,r,s,w,x;if((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,d=d||[],!a||"string"!=typeof a)return d;if(1!==(k=b.nodeType)&&9!==k)return[];if(p&&!e){if(f=_.exec(a))if(j=f[1]){if(9===k){if(h=b.getElementById(j),!h||!h.parentNode)return d;if(h.id===j)return d.push(h),d}else if(b.ownerDocument&&(h=b.ownerDocument.getElementById(j))&&t(b,h)&&h.id===j)return d.push(h),d}else{if(f[2])return I.apply(d,b.getElementsByTagName(a)),d;if((j=f[3])&&c.getElementsByClassName&&b.getElementsByClassName)return I.apply(d,b.getElementsByClassName(j)),d}if(c.qsa&&(!q||!q.test(a))){if(s=r=u,w=b,x=9===k&&a,1===k&&"object"!==b.nodeName.toLowerCase()){o=g(a),(r=b.getAttribute("id"))?s=r.replace(bb,"\\$&"):b.setAttribute("id",s),s="[id='"+s+"'] ",l=o.length;while(l--)o[l]=s+qb(o[l]);w=ab.test(a)&&ob(b.parentNode)||b,x=o.join(",")}if(x)try{return I.apply(d,w.querySelectorAll(x)),d}catch(y){}finally{r||b.removeAttribute("id")}}}return i(a.replace(R,"$1"),b,d,e)}function gb(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function hb(a){return a[u]=!0,a}function ib(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function jb(a,b){var c=a.split("|"),e=a.length;while(e--)d.attrHandle[c[e]]=b}function kb(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||D)-(~a.sourceIndex||D);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function lb(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function mb(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function nb(a){return hb(function(b){return b=+b,hb(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function ob(a){return a&&typeof a.getElementsByTagName!==C&&a}c=fb.support={},f=fb.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fb.setDocument=function(a){var b,e=a?a.ownerDocument||a:v,g=e.defaultView;return e!==n&&9===e.nodeType&&e.documentElement?(n=e,o=e.documentElement,p=!f(e),g&&g!==g.top&&(g.addEventListener?g.addEventListener("unload",function(){m()},!1):g.attachEvent&&g.attachEvent("onunload",function(){m()})),c.attributes=ib(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ib(function(a){return a.appendChild(e.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=$.test(e.getElementsByClassName)&&ib(function(a){return a.innerHTML="<div class='a'></div><div class='a i'></div>",a.firstChild.className="i",2===a.getElementsByClassName("i").length}),c.getById=ib(function(a){return o.appendChild(a).id=u,!e.getElementsByName||!e.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if(typeof b.getElementById!==C&&p){var c=b.getElementById(a);return c&&c.parentNode?[c]:[]}},d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(cb,db);return function(a){var c=typeof a.getAttributeNode!==C&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return typeof b.getElementsByTagName!==C?b.getElementsByTagName(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return typeof b.getElementsByClassName!==C&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=$.test(e.querySelectorAll))&&(ib(function(a){a.innerHTML="<select msallowclip=''><option selected=''></option></select>",a.querySelectorAll("[msallowclip^='']").length&&q.push("[*^$]="+M+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+M+"*(?:value|"+L+")"),a.querySelectorAll(":checked").length||q.push(":checked")}),ib(function(a){var b=e.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+M+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=$.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ib(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",Q)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=$.test(o.compareDocumentPosition),t=b||$.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===e||a.ownerDocument===v&&t(v,a)?-1:b===e||b.ownerDocument===v&&t(v,b)?1:k?K.call(k,a)-K.call(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,f=a.parentNode,g=b.parentNode,h=[a],i=[b];if(!f||!g)return a===e?-1:b===e?1:f?-1:g?1:k?K.call(k,a)-K.call(k,b):0;if(f===g)return kb(a,b);c=a;while(c=c.parentNode)h.unshift(c);c=b;while(c=c.parentNode)i.unshift(c);while(h[d]===i[d])d++;return d?kb(h[d],i[d]):h[d]===v?-1:i[d]===v?1:0},e):n},fb.matches=function(a,b){return fb(a,null,null,b)},fb.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(U,"='$1']"),!(!c.matchesSelector||!p||r&&r.test(b)||q&&q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fb(b,n,null,[a]).length>0},fb.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fb.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&E.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fb.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fb.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fb.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fb.selectors={cacheLength:50,createPseudo:hb,match:X,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(cb,db),a[3]=(a[3]||a[4]||a[5]||"").replace(cb,db),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fb.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fb.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return X.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&V.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(cb,db).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+M+")"+a+"("+M+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||typeof a.getAttribute!==C&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fb.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h;if(q){if(f){while(p){l=b;while(l=l[p])if(h?l.nodeName.toLowerCase()===r:1===l.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){k=q[u]||(q[u]={}),j=k[a]||[],n=j[0]===w&&j[1],m=j[0]===w&&j[2],l=n&&q.childNodes[n];while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if(1===l.nodeType&&++m&&l===b){k[a]=[w,n,m];break}}else if(s&&(j=(b[u]||(b[u]={}))[a])&&j[0]===w)m=j[1];else while(l=++n&&l&&l[p]||(m=n=0)||o.pop())if((h?l.nodeName.toLowerCase()===r:1===l.nodeType)&&++m&&(s&&((l[u]||(l[u]={}))[a]=[w,m]),l===b))break;return m-=e,m===d||m%d===0&&m/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fb.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?hb(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=K.call(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:hb(function(a){var b=[],c=[],d=h(a.replace(R,"$1"));return d[u]?hb(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),!c.pop()}}),has:hb(function(a){return function(b){return fb(a,b).length>0}}),contains:hb(function(a){return function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:hb(function(a){return W.test(a||"")||fb.error("unsupported lang: "+a),a=a.replace(cb,db).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Z.test(a.nodeName)},input:function(a){return Y.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:nb(function(){return[0]}),last:nb(function(a,b){return[b-1]}),eq:nb(function(a,b,c){return[0>c?c+b:c]}),even:nb(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:nb(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:nb(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:nb(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=lb(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=mb(b);function pb(){}pb.prototype=d.filters=d.pseudos,d.setFilters=new pb,g=fb.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){(!c||(e=S.exec(h)))&&(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=T.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(R," ")}),h=h.slice(c.length));for(g in d.filter)!(e=X[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fb.error(a):z(a,i).slice(0)};function qb(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function rb(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(i=b[u]||(b[u]={}),(h=i[d])&&h[0]===w&&h[1]===f)return j[2]=h[2];if(i[d]=j,j[2]=a(b,c,g))return!0}}}function sb(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function tb(a,b,c){for(var d=0,e=b.length;e>d;d++)fb(a,b[d],c);return c}function ub(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(!c||c(f,d,e))&&(g.push(f),j&&b.push(h));return g}function vb(a,b,c,d,e,f){return d&&!d[u]&&(d=vb(d)),e&&!e[u]&&(e=vb(e,f)),hb(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||tb(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ub(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ub(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?K.call(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ub(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):I.apply(g,r)})}function wb(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=rb(function(a){return a===b},h,!0),l=rb(function(a){return K.call(b,a)>-1},h,!0),m=[function(a,c,d){return!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d))}];f>i;i++)if(c=d.relative[a[i].type])m=[rb(sb(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return vb(i>1&&sb(m),i>1&&qb(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(R,"$1"),c,e>i&&wb(a.slice(i,e)),f>e&&wb(a=a.slice(e)),f>e&&qb(a))}m.push(c)}return sb(m)}function xb(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,m,o,p=0,q="0",r=f&&[],s=[],t=j,u=f||e&&d.find.TAG("*",k),v=w+=null==t?1:Math.random()||.1,x=u.length;for(k&&(j=g!==n&&g);q!==x&&null!=(l=u[q]);q++){if(e&&l){m=0;while(o=a[m++])if(o(l,g,h)){i.push(l);break}k&&(w=v)}c&&((l=!o&&l)&&p--,f&&r.push(l))}if(p+=q,c&&q!==p){m=0;while(o=b[m++])o(r,s,g,h);if(f){if(p>0)while(q--)r[q]||s[q]||(s[q]=G.call(i));s=ub(s)}I.apply(i,s),k&&!f&&s.length>0&&p+b.length>1&&fb.uniqueSort(i)}return k&&(w=v,j=t),r};return c?hb(f):f}return h=fb.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wb(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xb(e,d)),f.selector=a}return f},i=fb.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(cb,db),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=X.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(cb,db),ab.test(j[0].type)&&ob(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qb(j),!a)return I.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,ab.test(a)&&ob(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ib(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ib(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||jb("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ib(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||jb("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ib(function(a){return null==a.getAttribute("disabled")})||jb(L,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fb}(a);m.find=s,m.expr=s.selectors,m.expr[":"]=m.expr.pseudos,m.unique=s.uniqueSort,m.text=s.getText,m.isXMLDoc=s.isXML,m.contains=s.contains;var t=m.expr.match.needsContext,u=/^<(\w+)\s*\/?>(?:<\/\1>|)$/,v=/^.[^:#\[\.,]*$/;function w(a,b,c){if(m.isFunction(b))return m.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return m.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(v.test(b))return m.filter(b,a,c);b=m.filter(b,a)}return m.grep(a,function(a){return m.inArray(a,b)>=0!==c})}m.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?m.find.matchesSelector(d,a)?[d]:[]:m.find.matches(a,m.grep(b,function(a){return 1===a.nodeType}))},m.fn.extend({find:function(a){var b,c=[],d=this,e=d.length;if("string"!=typeof a)return this.pushStack(m(a).filter(function(){for(b=0;e>b;b++)if(m.contains(d[b],this))return!0}));for(b=0;e>b;b++)m.find(a,d[b],c);return c=this.pushStack(e>1?m.unique(c):c),c.selector=this.selector?this.selector+" "+a:a,c},filter:function(a){return this.pushStack(w(this,a||[],!1))},not:function(a){return this.pushStack(w(this,a||[],!0))},is:function(a){return!!w(this,"string"==typeof a&&t.test(a)?m(a):a||[],!1).length}});var x,y=a.document,z=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,A=m.fn.init=function(a,b){var c,d;if(!a)return this;if("string"==typeof a){if(c="<"===a.charAt(0)&&">"===a.charAt(a.length-1)&&a.length>=3?[null,a,null]:z.exec(a),!c||!c[1]&&b)return!b||b.jquery?(b||x).find(a):this.constructor(b).find(a);if(c[1]){if(b=b instanceof m?b[0]:b,m.merge(this,m.parseHTML(c[1],b&&b.nodeType?b.ownerDocument||b:y,!0)),u.test(c[1])&&m.isPlainObject(b))for(c in b)m.isFunction(this[c])?this[c](b[c]):this.attr(c,b[c]);return this}if(d=y.getElementById(c[2]),d&&d.parentNode){if(d.id!==c[2])return x.find(a);this.length=1,this[0]=d}return this.context=y,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):m.isFunction(a)?"undefined"!=typeof x.ready?x.ready(a):a(m):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),m.makeArray(a,this))};A.prototype=m.fn,x=m(y);var B=/^(?:parents|prev(?:Until|All))/,C={children:!0,contents:!0,next:!0,prev:!0};m.extend({dir:function(a,b,c){var d=[],e=a[b];while(e&&9!==e.nodeType&&(void 0===c||1!==e.nodeType||!m(e).is(c)))1===e.nodeType&&d.push(e),e=e[b];return d},sibling:function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c}}),m.fn.extend({has:function(a){var b,c=m(a,this),d=c.length;return this.filter(function(){for(b=0;d>b;b++)if(m.contains(this,c[b]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=t.test(a)||"string"!=typeof a?m(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&m.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?m.unique(f):f)},index:function(a){return a?"string"==typeof a?m.inArray(this[0],m(a)):m.inArray(a.jquery?a[0]:a,this):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(m.unique(m.merge(this.get(),m(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function D(a,b){do a=a[b];while(a&&1!==a.nodeType);return a}m.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return m.dir(a,"parentNode")},parentsUntil:function(a,b,c){return m.dir(a,"parentNode",c)},next:function(a){return D(a,"nextSibling")},prev:function(a){return D(a,"previousSibling")},nextAll:function(a){return m.dir(a,"nextSibling")},prevAll:function(a){return m.dir(a,"previousSibling")},nextUntil:function(a,b,c){return m.dir(a,"nextSibling",c)},prevUntil:function(a,b,c){return m.dir(a,"previousSibling",c)},siblings:function(a){return m.sibling((a.parentNode||{}).firstChild,a)},children:function(a){return m.sibling(a.firstChild)},contents:function(a){return m.nodeName(a,"iframe")?a.contentDocument||a.contentWindow.document:m.merge([],a.childNodes)}},function(a,b){m.fn[a]=function(c,d){var e=m.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=m.filter(d,e)),this.length>1&&(C[a]||(e=m.unique(e)),B.test(a)&&(e=e.reverse())),this.pushStack(e)}});var E=/\S+/g,F={};function G(a){var b=F[a]={};return m.each(a.match(E)||[],function(a,c){b[c]=!0}),b}m.Callbacks=function(a){a="string"==typeof a?F[a]||G(a):m.extend({},a);var b,c,d,e,f,g,h=[],i=!a.once&&[],j=function(l){for(c=a.memory&&l,d=!0,f=g||0,g=0,e=h.length,b=!0;h&&e>f;f++)if(h[f].apply(l[0],l[1])===!1&&a.stopOnFalse){c=!1;break}b=!1,h&&(i?i.length&&j(i.shift()):c?h=[]:k.disable())},k={add:function(){if(h){var d=h.length;!function f(b){m.each(b,function(b,c){var d=m.type(c);"function"===d?a.unique&&k.has(c)||h.push(c):c&&c.length&&"string"!==d&&f(c)})}(arguments),b?e=h.length:c&&(g=d,j(c))}return this},remove:function(){return h&&m.each(arguments,function(a,c){var d;while((d=m.inArray(c,h,d))>-1)h.splice(d,1),b&&(e>=d&&e--,f>=d&&f--)}),this},has:function(a){return a?m.inArray(a,h)>-1:!(!h||!h.length)},empty:function(){return h=[],e=0,this},disable:function(){return h=i=c=void 0,this},disabled:function(){return!h},lock:function(){return i=void 0,c||k.disable(),this},locked:function(){return!i},fireWith:function(a,c){return!h||d&&!i||(c=c||[],c=[a,c.slice?c.slice():c],b?i.push(c):j(c)),this},fire:function(){return k.fireWith(this,arguments),this},fired:function(){return!!d}};return k},m.extend({Deferred:function(a){var b=[["resolve","done",m.Callbacks("once memory"),"resolved"],["reject","fail",m.Callbacks("once memory"),"rejected"],["notify","progress",m.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return m.Deferred(function(c){m.each(b,function(b,f){var g=m.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&m.isFunction(a.promise)?a.promise().done(c.resolve).fail(c.reject).progress(c.notify):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?m.extend(a,d):d}},e={};return d.pipe=d.then,m.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=d.call(arguments),e=c.length,f=1!==e||a&&m.isFunction(a.promise)?e:0,g=1===f?a:m.Deferred(),h=function(a,b,c){return function(e){b[a]=this,c[a]=arguments.length>1?d.call(arguments):e,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(e>1)for(i=new Array(e),j=new Array(e),k=new Array(e);e>b;b++)c[b]&&m.isFunction(c[b].promise)?c[b].promise().done(h(b,k,c)).fail(g.reject).progress(h(b,j,i)):--f;return f||g.resolveWith(k,c),g.promise()}});var H;m.fn.ready=function(a){return m.ready.promise().done(a),this},m.extend({isReady:!1,readyWait:1,holdReady:function(a){a?m.readyWait++:m.ready(!0)},ready:function(a){if(a===!0?!--m.readyWait:!m.isReady){if(!y.body)return setTimeout(m.ready);m.isReady=!0,a!==!0&&--m.readyWait>0||(H.resolveWith(y,[m]),m.fn.triggerHandler&&(m(y).triggerHandler("ready"),m(y).off("ready")))}}});function I(){y.addEventListener?(y.removeEventListener("DOMContentLoaded",J,!1),a.removeEventListener("load",J,!1)):(y.detachEvent("onreadystatechange",J),a.detachEvent("onload",J))}function J(){(y.addEventListener||"load"===event.type||"complete"===y.readyState)&&(I(),m.ready())}m.ready.promise=function(b){if(!H)if(H=m.Deferred(),"complete"===y.readyState)setTimeout(m.ready);else if(y.addEventListener)y.addEventListener("DOMContentLoaded",J,!1),a.addEventListener("load",J,!1);else{y.attachEvent("onreadystatechange",J),a.attachEvent("onload",J);var c=!1;try{c=null==a.frameElement&&y.documentElement}catch(d){}c&&c.doScroll&&!function e(){if(!m.isReady){try{c.doScroll("left")}catch(a){return setTimeout(e,50)}I(),m.ready()}}()}return H.promise(b)};var K="undefined",L;for(L in m(k))break;k.ownLast="0"!==L,k.inlineBlockNeedsLayout=!1,m(function(){var a,b,c,d;c=y.getElementsByTagName("body")[0],c&&c.style&&(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),typeof b.style.zoom!==K&&(b.style.cssText="display:inline;margin:0;border:0;padding:1px;width:1px;zoom:1",k.inlineBlockNeedsLayout=a=3===b.offsetWidth,a&&(c.style.zoom=1)),c.removeChild(d))}),function(){var a=y.createElement("div");if(null==k.deleteExpando){k.deleteExpando=!0;try{delete a.test}catch(b){k.deleteExpando=!1}}a=null}(),m.acceptData=function(a){var b=m.noData[(a.nodeName+" ").toLowerCase()],c=+a.nodeType||1;return 1!==c&&9!==c?!1:!b||b!==!0&&a.getAttribute("classid")===b};var M=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,N=/([A-Z])/g;function O(a,b,c){if(void 0===c&&1===a.nodeType){var d="data-"+b.replace(N,"-$1").toLowerCase();if(c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:M.test(c)?m.parseJSON(c):c}catch(e){}m.data(a,b,c)}else c=void 0}return c}function P(a){var b;for(b in a)if(("data"!==b||!m.isEmptyObject(a[b]))&&"toJSON"!==b)return!1;return!0}function Q(a,b,d,e){if(m.acceptData(a)){var f,g,h=m.expando,i=a.nodeType,j=i?m.cache:a,k=i?a[h]:a[h]&&h;
if(k&&j[k]&&(e||j[k].data)||void 0!==d||"string"!=typeof b)return k||(k=i?a[h]=c.pop()||m.guid++:h),j[k]||(j[k]=i?{}:{toJSON:m.noop}),("object"==typeof b||"function"==typeof b)&&(e?j[k]=m.extend(j[k],b):j[k].data=m.extend(j[k].data,b)),g=j[k],e||(g.data||(g.data={}),g=g.data),void 0!==d&&(g[m.camelCase(b)]=d),"string"==typeof b?(f=g[b],null==f&&(f=g[m.camelCase(b)])):f=g,f}}function R(a,b,c){if(m.acceptData(a)){var d,e,f=a.nodeType,g=f?m.cache:a,h=f?a[m.expando]:m.expando;if(g[h]){if(b&&(d=c?g[h]:g[h].data)){m.isArray(b)?b=b.concat(m.map(b,m.camelCase)):b in d?b=[b]:(b=m.camelCase(b),b=b in d?[b]:b.split(" ")),e=b.length;while(e--)delete d[b[e]];if(c?!P(d):!m.isEmptyObject(d))return}(c||(delete g[h].data,P(g[h])))&&(f?m.cleanData([a],!0):k.deleteExpando||g!=g.window?delete g[h]:g[h]=null)}}}m.extend({cache:{},noData:{"applet ":!0,"embed ":!0,"object ":"clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"},hasData:function(a){return a=a.nodeType?m.cache[a[m.expando]]:a[m.expando],!!a&&!P(a)},data:function(a,b,c){return Q(a,b,c)},removeData:function(a,b){return R(a,b)},_data:function(a,b,c){return Q(a,b,c,!0)},_removeData:function(a,b){return R(a,b,!0)}}),m.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=m.data(f),1===f.nodeType&&!m._data(f,"parsedAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=m.camelCase(d.slice(5)),O(f,d,e[d])));m._data(f,"parsedAttrs",!0)}return e}return"object"==typeof a?this.each(function(){m.data(this,a)}):arguments.length>1?this.each(function(){m.data(this,a,b)}):f?O(f,a,m.data(f,a)):void 0},removeData:function(a){return this.each(function(){m.removeData(this,a)})}}),m.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=m._data(a,b),c&&(!d||m.isArray(c)?d=m._data(a,b,m.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=m.queue(a,b),d=c.length,e=c.shift(),f=m._queueHooks(a,b),g=function(){m.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return m._data(a,c)||m._data(a,c,{empty:m.Callbacks("once memory").add(function(){m._removeData(a,b+"queue"),m._removeData(a,c)})})}}),m.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?m.queue(this[0],a):void 0===b?this:this.each(function(){var c=m.queue(this,a,b);m._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&m.dequeue(this,a)})},dequeue:function(a){return this.each(function(){m.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=m.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=m._data(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=["Top","Right","Bottom","Left"],U=function(a,b){return a=b||a,"none"===m.css(a,"display")||!m.contains(a.ownerDocument,a)},V=m.access=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===m.type(c)){e=!0;for(h in c)m.access(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,m.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(m(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},W=/^(?:checkbox|radio)$/i;!function(){var a=y.createElement("input"),b=y.createElement("div"),c=y.createDocumentFragment();if(b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",k.leadingWhitespace=3===b.firstChild.nodeType,k.tbody=!b.getElementsByTagName("tbody").length,k.htmlSerialize=!!b.getElementsByTagName("link").length,k.html5Clone="<:nav></:nav>"!==y.createElement("nav").cloneNode(!0).outerHTML,a.type="checkbox",a.checked=!0,c.appendChild(a),k.appendChecked=a.checked,b.innerHTML="<textarea>x</textarea>",k.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue,c.appendChild(b),b.innerHTML="<input type='radio' checked='checked' name='t'/>",k.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,k.noCloneEvent=!0,b.attachEvent&&(b.attachEvent("onclick",function(){k.noCloneEvent=!1}),b.cloneNode(!0).click()),null==k.deleteExpando){k.deleteExpando=!0;try{delete b.test}catch(d){k.deleteExpando=!1}}}(),function(){var b,c,d=y.createElement("div");for(b in{submit:!0,change:!0,focusin:!0})c="on"+b,(k[b+"Bubbles"]=c in a)||(d.setAttribute(c,"t"),k[b+"Bubbles"]=d.attributes[c].expando===!1);d=null}();var X=/^(?:input|select|textarea)$/i,Y=/^key/,Z=/^(?:mouse|pointer|contextmenu)|click/,$=/^(?:focusinfocus|focusoutblur)$/,_=/^([^.]*)(?:\.(.+)|)$/;function ab(){return!0}function bb(){return!1}function cb(){try{return y.activeElement}catch(a){}}m.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,n,o,p,q,r=m._data(a);if(r){c.handler&&(i=c,c=i.handler,e=i.selector),c.guid||(c.guid=m.guid++),(g=r.events)||(g=r.events={}),(k=r.handle)||(k=r.handle=function(a){return typeof m===K||a&&m.event.triggered===a.type?void 0:m.event.dispatch.apply(k.elem,arguments)},k.elem=a),b=(b||"").match(E)||[""],h=b.length;while(h--)f=_.exec(b[h])||[],o=q=f[1],p=(f[2]||"").split(".").sort(),o&&(j=m.event.special[o]||{},o=(e?j.delegateType:j.bindType)||o,j=m.event.special[o]||{},l=m.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&m.expr.match.needsContext.test(e),namespace:p.join(".")},i),(n=g[o])||(n=g[o]=[],n.delegateCount=0,j.setup&&j.setup.call(a,d,p,k)!==!1||(a.addEventListener?a.addEventListener(o,k,!1):a.attachEvent&&a.attachEvent("on"+o,k))),j.add&&(j.add.call(a,l),l.handler.guid||(l.handler.guid=c.guid)),e?n.splice(n.delegateCount++,0,l):n.push(l),m.event.global[o]=!0);a=null}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,n,o,p,q,r=m.hasData(a)&&m._data(a);if(r&&(k=r.events)){b=(b||"").match(E)||[""],j=b.length;while(j--)if(h=_.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=m.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,n=k[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),i=f=n.length;while(f--)g=n[f],!e&&q!==g.origType||c&&c.guid!==g.guid||h&&!h.test(g.namespace)||d&&d!==g.selector&&("**"!==d||!g.selector)||(n.splice(f,1),g.selector&&n.delegateCount--,l.remove&&l.remove.call(a,g));i&&!n.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||m.removeEvent(a,o,r.handle),delete k[o])}else for(o in k)m.event.remove(a,o+b[j],c,d,!0);m.isEmptyObject(k)&&(delete r.handle,m._removeData(a,"events"))}},trigger:function(b,c,d,e){var f,g,h,i,k,l,n,o=[d||y],p=j.call(b,"type")?b.type:b,q=j.call(b,"namespace")?b.namespace.split("."):[];if(h=l=d=d||y,3!==d.nodeType&&8!==d.nodeType&&!$.test(p+m.event.triggered)&&(p.indexOf(".")>=0&&(q=p.split("."),p=q.shift(),q.sort()),g=p.indexOf(":")<0&&"on"+p,b=b[m.expando]?b:new m.Event(p,"object"==typeof b&&b),b.isTrigger=e?2:3,b.namespace=q.join("."),b.namespace_re=b.namespace?new RegExp("(^|\\.)"+q.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=d),c=null==c?[b]:m.makeArray(c,[b]),k=m.event.special[p]||{},e||!k.trigger||k.trigger.apply(d,c)!==!1)){if(!e&&!k.noBubble&&!m.isWindow(d)){for(i=k.delegateType||p,$.test(i+p)||(h=h.parentNode);h;h=h.parentNode)o.push(h),l=h;l===(d.ownerDocument||y)&&o.push(l.defaultView||l.parentWindow||a)}n=0;while((h=o[n++])&&!b.isPropagationStopped())b.type=n>1?i:k.bindType||p,f=(m._data(h,"events")||{})[b.type]&&m._data(h,"handle"),f&&f.apply(h,c),f=g&&h[g],f&&f.apply&&m.acceptData(h)&&(b.result=f.apply(h,c),b.result===!1&&b.preventDefault());if(b.type=p,!e&&!b.isDefaultPrevented()&&(!k._default||k._default.apply(o.pop(),c)===!1)&&m.acceptData(d)&&g&&d[p]&&!m.isWindow(d)){l=d[g],l&&(d[g]=null),m.event.triggered=p;try{d[p]()}catch(r){}m.event.triggered=void 0,l&&(d[g]=l)}return b.result}},dispatch:function(a){a=m.event.fix(a);var b,c,e,f,g,h=[],i=d.call(arguments),j=(m._data(this,"events")||{})[a.type]||[],k=m.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=m.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,g=0;while((e=f.handlers[g++])&&!a.isImmediatePropagationStopped())(!a.namespace_re||a.namespace_re.test(e.namespace))&&(a.handleObj=e,a.data=e.data,c=((m.event.special[e.origType]||{}).handle||e.handler).apply(f.elem,i),void 0!==c&&(a.result=c)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&(!a.button||"click"!==a.type))for(;i!=this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(e=[],f=0;h>f;f++)d=b[f],c=d.selector+" ",void 0===e[c]&&(e[c]=d.needsContext?m(c,this).index(i)>=0:m.find(c,this,null,[i]).length),e[c]&&e.push(d);e.length&&g.push({elem:i,handlers:e})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},fix:function(a){if(a[m.expando])return a;var b,c,d,e=a.type,f=a,g=this.fixHooks[e];g||(this.fixHooks[e]=g=Z.test(e)?this.mouseHooks:Y.test(e)?this.keyHooks:{}),d=g.props?this.props.concat(g.props):this.props,a=new m.Event(f),b=d.length;while(b--)c=d[b],a[c]=f[c];return a.target||(a.target=f.srcElement||y),3===a.target.nodeType&&(a.target=a.target.parentNode),a.metaKey=!!a.metaKey,g.filter?g.filter(a,f):a},props:"altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,d,e,f=b.button,g=b.fromElement;return null==a.pageX&&null!=b.clientX&&(d=a.target.ownerDocument||y,e=d.documentElement,c=d.body,a.pageX=b.clientX+(e&&e.scrollLeft||c&&c.scrollLeft||0)-(e&&e.clientLeft||c&&c.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||c&&c.scrollTop||0)-(e&&e.clientTop||c&&c.clientTop||0)),!a.relatedTarget&&g&&(a.relatedTarget=g===a.target?b.toElement:g),a.which||void 0===f||(a.which=1&f?1:2&f?3:4&f?2:0),a}},special:{load:{noBubble:!0},focus:{trigger:function(){if(this!==cb()&&this.focus)try{return this.focus(),!1}catch(a){}},delegateType:"focusin"},blur:{trigger:function(){return this===cb()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return m.nodeName(this,"input")&&"checkbox"===this.type&&this.click?(this.click(),!1):void 0},_default:function(a){return m.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}},simulate:function(a,b,c,d){var e=m.extend(new m.Event,c,{type:a,isSimulated:!0,originalEvent:{}});d?m.event.trigger(e,null,b):m.event.dispatch.call(b,e),e.isDefaultPrevented()&&c.preventDefault()}},m.removeEvent=y.removeEventListener?function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c,!1)}:function(a,b,c){var d="on"+b;a.detachEvent&&(typeof a[d]===K&&(a[d]=null),a.detachEvent(d,c))},m.Event=function(a,b){return this instanceof m.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ab:bb):this.type=a,b&&m.extend(this,b),this.timeStamp=a&&a.timeStamp||m.now(),void(this[m.expando]=!0)):new m.Event(a,b)},m.Event.prototype={isDefaultPrevented:bb,isPropagationStopped:bb,isImmediatePropagationStopped:bb,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ab,a&&(a.preventDefault?a.preventDefault():a.returnValue=!1)},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ab,a&&(a.stopPropagation&&a.stopPropagation(),a.cancelBubble=!0)},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ab,a&&a.stopImmediatePropagation&&a.stopImmediatePropagation(),this.stopPropagation()}},m.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){m.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return(!e||e!==d&&!m.contains(d,e))&&(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),k.submitBubbles||(m.event.special.submit={setup:function(){return m.nodeName(this,"form")?!1:void m.event.add(this,"click._submit keypress._submit",function(a){var b=a.target,c=m.nodeName(b,"input")||m.nodeName(b,"button")?b.form:void 0;c&&!m._data(c,"submitBubbles")&&(m.event.add(c,"submit._submit",function(a){a._submit_bubble=!0}),m._data(c,"submitBubbles",!0))})},postDispatch:function(a){a._submit_bubble&&(delete a._submit_bubble,this.parentNode&&!a.isTrigger&&m.event.simulate("submit",this.parentNode,a,!0))},teardown:function(){return m.nodeName(this,"form")?!1:void m.event.remove(this,"._submit")}}),k.changeBubbles||(m.event.special.change={setup:function(){return X.test(this.nodeName)?(("checkbox"===this.type||"radio"===this.type)&&(m.event.add(this,"propertychange._change",function(a){"checked"===a.originalEvent.propertyName&&(this._just_changed=!0)}),m.event.add(this,"click._change",function(a){this._just_changed&&!a.isTrigger&&(this._just_changed=!1),m.event.simulate("change",this,a,!0)})),!1):void m.event.add(this,"beforeactivate._change",function(a){var b=a.target;X.test(b.nodeName)&&!m._data(b,"changeBubbles")&&(m.event.add(b,"change._change",function(a){!this.parentNode||a.isSimulated||a.isTrigger||m.event.simulate("change",this.parentNode,a,!0)}),m._data(b,"changeBubbles",!0))})},handle:function(a){var b=a.target;return this!==b||a.isSimulated||a.isTrigger||"radio"!==b.type&&"checkbox"!==b.type?a.handleObj.handler.apply(this,arguments):void 0},teardown:function(){return m.event.remove(this,"._change"),!X.test(this.nodeName)}}),k.focusinBubbles||m.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){m.event.simulate(b,a.target,m.event.fix(a),!0)};m.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=m._data(d,b);e||d.addEventListener(a,c,!0),m._data(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=m._data(d,b)-1;e?m._data(d,b,e):(d.removeEventListener(a,c,!0),m._removeData(d,b))}}}),m.fn.extend({on:function(a,b,c,d,e){var f,g;if("object"==typeof a){"string"!=typeof b&&(c=c||b,b=void 0);for(f in a)this.on(f,b,c,a[f],e);return this}if(null==c&&null==d?(d=b,c=b=void 0):null==d&&("string"==typeof b?(d=c,c=void 0):(d=c,c=b,b=void 0)),d===!1)d=bb;else if(!d)return this;return 1===e&&(g=d,d=function(a){return m().off(a),g.apply(this,arguments)},d.guid=g.guid||(g.guid=m.guid++)),this.each(function(){m.event.add(this,a,d,c,b)})},one:function(a,b,c,d){return this.on(a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,m(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return(b===!1||"function"==typeof b)&&(c=b,b=void 0),c===!1&&(c=bb),this.each(function(){m.event.remove(this,a,c,b)})},trigger:function(a,b){return this.each(function(){m.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?m.event.trigger(a,b,c,!0):void 0}});function db(a){var b=eb.split("|"),c=a.createDocumentFragment();if(c.createElement)while(b.length)c.createElement(b.pop());return c}var eb="abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",fb=/ jQuery\d+="(?:null|\d+)"/g,gb=new RegExp("<(?:"+eb+")[\\s/>]","i"),hb=/^\s+/,ib=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,jb=/<([\w:]+)/,kb=/<tbody/i,lb=/<|&#?\w+;/,mb=/<(?:script|style|link)/i,nb=/checked\s*(?:[^=]|=\s*.checked.)/i,ob=/^$|\/(?:java|ecma)script/i,pb=/^true\/(.*)/,qb=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g,rb={option:[1,"<select multiple='multiple'>","</select>"],legend:[1,"<fieldset>","</fieldset>"],area:[1,"<map>","</map>"],param:[1,"<object>","</object>"],thead:[1,"<table>","</table>"],tr:[2,"<table><tbody>","</tbody></table>"],col:[2,"<table><tbody></tbody><colgroup>","</colgroup></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:k.htmlSerialize?[0,"",""]:[1,"X<div>","</div>"]},sb=db(y),tb=sb.appendChild(y.createElement("div"));rb.optgroup=rb.option,rb.tbody=rb.tfoot=rb.colgroup=rb.caption=rb.thead,rb.th=rb.td;function ub(a,b){var c,d,e=0,f=typeof a.getElementsByTagName!==K?a.getElementsByTagName(b||"*"):typeof a.querySelectorAll!==K?a.querySelectorAll(b||"*"):void 0;if(!f)for(f=[],c=a.childNodes||a;null!=(d=c[e]);e++)!b||m.nodeName(d,b)?f.push(d):m.merge(f,ub(d,b));return void 0===b||b&&m.nodeName(a,b)?m.merge([a],f):f}function vb(a){W.test(a.type)&&(a.defaultChecked=a.checked)}function wb(a,b){return m.nodeName(a,"table")&&m.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function xb(a){return a.type=(null!==m.find.attr(a,"type"))+"/"+a.type,a}function yb(a){var b=pb.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function zb(a,b){for(var c,d=0;null!=(c=a[d]);d++)m._data(c,"globalEval",!b||m._data(b[d],"globalEval"))}function Ab(a,b){if(1===b.nodeType&&m.hasData(a)){var c,d,e,f=m._data(a),g=m._data(b,f),h=f.events;if(h){delete g.handle,g.events={};for(c in h)for(d=0,e=h[c].length;e>d;d++)m.event.add(b,c,h[c][d])}g.data&&(g.data=m.extend({},g.data))}}function Bb(a,b){var c,d,e;if(1===b.nodeType){if(c=b.nodeName.toLowerCase(),!k.noCloneEvent&&b[m.expando]){e=m._data(b);for(d in e.events)m.removeEvent(b,d,e.handle);b.removeAttribute(m.expando)}"script"===c&&b.text!==a.text?(xb(b).text=a.text,yb(b)):"object"===c?(b.parentNode&&(b.outerHTML=a.outerHTML),k.html5Clone&&a.innerHTML&&!m.trim(b.innerHTML)&&(b.innerHTML=a.innerHTML)):"input"===c&&W.test(a.type)?(b.defaultChecked=b.checked=a.checked,b.value!==a.value&&(b.value=a.value)):"option"===c?b.defaultSelected=b.selected=a.defaultSelected:("input"===c||"textarea"===c)&&(b.defaultValue=a.defaultValue)}}m.extend({clone:function(a,b,c){var d,e,f,g,h,i=m.contains(a.ownerDocument,a);if(k.html5Clone||m.isXMLDoc(a)||!gb.test("<"+a.nodeName+">")?f=a.cloneNode(!0):(tb.innerHTML=a.outerHTML,tb.removeChild(f=tb.firstChild)),!(k.noCloneEvent&&k.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||m.isXMLDoc(a)))for(d=ub(f),h=ub(a),g=0;null!=(e=h[g]);++g)d[g]&&Bb(e,d[g]);if(b)if(c)for(h=h||ub(a),d=d||ub(f),g=0;null!=(e=h[g]);g++)Ab(e,d[g]);else Ab(a,f);return d=ub(f,"script"),d.length>0&&zb(d,!i&&ub(a,"script")),d=h=e=null,f},buildFragment:function(a,b,c,d){for(var e,f,g,h,i,j,l,n=a.length,o=db(b),p=[],q=0;n>q;q++)if(f=a[q],f||0===f)if("object"===m.type(f))m.merge(p,f.nodeType?[f]:f);else if(lb.test(f)){h=h||o.appendChild(b.createElement("div")),i=(jb.exec(f)||["",""])[1].toLowerCase(),l=rb[i]||rb._default,h.innerHTML=l[1]+f.replace(ib,"<$1></$2>")+l[2],e=l[0];while(e--)h=h.lastChild;if(!k.leadingWhitespace&&hb.test(f)&&p.push(b.createTextNode(hb.exec(f)[0])),!k.tbody){f="table"!==i||kb.test(f)?"<table>"!==l[1]||kb.test(f)?0:h:h.firstChild,e=f&&f.childNodes.length;while(e--)m.nodeName(j=f.childNodes[e],"tbody")&&!j.childNodes.length&&f.removeChild(j)}m.merge(p,h.childNodes),h.textContent="";while(h.firstChild)h.removeChild(h.firstChild);h=o.lastChild}else p.push(b.createTextNode(f));h&&o.removeChild(h),k.appendChecked||m.grep(ub(p,"input"),vb),q=0;while(f=p[q++])if((!d||-1===m.inArray(f,d))&&(g=m.contains(f.ownerDocument,f),h=ub(o.appendChild(f),"script"),g&&zb(h),c)){e=0;while(f=h[e++])ob.test(f.type||"")&&c.push(f)}return h=null,o},cleanData:function(a,b){for(var d,e,f,g,h=0,i=m.expando,j=m.cache,l=k.deleteExpando,n=m.event.special;null!=(d=a[h]);h++)if((b||m.acceptData(d))&&(f=d[i],g=f&&j[f])){if(g.events)for(e in g.events)n[e]?m.event.remove(d,e):m.removeEvent(d,e,g.handle);j[f]&&(delete j[f],l?delete d[i]:typeof d.removeAttribute!==K?d.removeAttribute(i):d[i]=null,c.push(f))}}}),m.fn.extend({text:function(a){return V(this,function(a){return void 0===a?m.text(this):this.empty().append((this[0]&&this[0].ownerDocument||y).createTextNode(a))},null,a,arguments.length)},append:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=wb(this,a);b.appendChild(a)}})},prepend:function(){return this.domManip(arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=wb(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return this.domManip(arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},remove:function(a,b){for(var c,d=a?m.filter(a,this):this,e=0;null!=(c=d[e]);e++)b||1!==c.nodeType||m.cleanData(ub(c)),c.parentNode&&(b&&m.contains(c.ownerDocument,c)&&zb(ub(c,"script")),c.parentNode.removeChild(c));return this},empty:function(){for(var a,b=0;null!=(a=this[b]);b++){1===a.nodeType&&m.cleanData(ub(a,!1));while(a.firstChild)a.removeChild(a.firstChild);a.options&&m.nodeName(a,"select")&&(a.options.length=0)}return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return m.clone(this,a,b)})},html:function(a){return V(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a)return 1===b.nodeType?b.innerHTML.replace(fb,""):void 0;if(!("string"!=typeof a||mb.test(a)||!k.htmlSerialize&&gb.test(a)||!k.leadingWhitespace&&hb.test(a)||rb[(jb.exec(a)||["",""])[1].toLowerCase()])){a=a.replace(ib,"<$1></$2>");try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(m.cleanData(ub(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=arguments[0];return this.domManip(arguments,function(b){a=this.parentNode,m.cleanData(ub(this)),a&&a.replaceChild(b,this)}),a&&(a.length||a.nodeType)?this:this.remove()},detach:function(a){return this.remove(a,!0)},domManip:function(a,b){a=e.apply([],a);var c,d,f,g,h,i,j=0,l=this.length,n=this,o=l-1,p=a[0],q=m.isFunction(p);if(q||l>1&&"string"==typeof p&&!k.checkClone&&nb.test(p))return this.each(function(c){var d=n.eq(c);q&&(a[0]=p.call(this,c,d.html())),d.domManip(a,b)});if(l&&(i=m.buildFragment(a,this[0].ownerDocument,!1,this),c=i.firstChild,1===i.childNodes.length&&(i=c),c)){for(g=m.map(ub(i,"script"),xb),f=g.length;l>j;j++)d=i,j!==o&&(d=m.clone(d,!0,!0),f&&m.merge(g,ub(d,"script"))),b.call(this[j],d,j);if(f)for(h=g[g.length-1].ownerDocument,m.map(g,yb),j=0;f>j;j++)d=g[j],ob.test(d.type||"")&&!m._data(d,"globalEval")&&m.contains(h,d)&&(d.src?m._evalUrl&&m._evalUrl(d.src):m.globalEval((d.text||d.textContent||d.innerHTML||"").replace(qb,"")));i=c=null}return this}}),m.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){m.fn[a]=function(a){for(var c,d=0,e=[],g=m(a),h=g.length-1;h>=d;d++)c=d===h?this:this.clone(!0),m(g[d])[b](c),f.apply(e,c.get());return this.pushStack(e)}});var Cb,Db={};function Eb(b,c){var d,e=m(c.createElement(b)).appendTo(c.body),f=a.getDefaultComputedStyle&&(d=a.getDefaultComputedStyle(e[0]))?d.display:m.css(e[0],"display");return e.detach(),f}function Fb(a){var b=y,c=Db[a];return c||(c=Eb(a,b),"none"!==c&&c||(Cb=(Cb||m("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=(Cb[0].contentWindow||Cb[0].contentDocument).document,b.write(),b.close(),c=Eb(a,b),Cb.detach()),Db[a]=c),c}!function(){var a;k.shrinkWrapBlocks=function(){if(null!=a)return a;a=!1;var b,c,d;return c=y.getElementsByTagName("body")[0],c&&c.style?(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),typeof b.style.zoom!==K&&(b.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:1px;width:1px;zoom:1",b.appendChild(y.createElement("div")).style.width="5px",a=3!==b.offsetWidth),c.removeChild(d),a):void 0}}();var Gb=/^margin/,Hb=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ib,Jb,Kb=/^(top|right|bottom|left)$/;a.getComputedStyle?(Ib=function(a){return a.ownerDocument.defaultView.getComputedStyle(a,null)},Jb=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ib(a),g=c?c.getPropertyValue(b)||c[b]:void 0,c&&(""!==g||m.contains(a.ownerDocument,a)||(g=m.style(a,b)),Hb.test(g)&&Gb.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f)),void 0===g?g:g+""}):y.documentElement.currentStyle&&(Ib=function(a){return a.currentStyle},Jb=function(a,b,c){var d,e,f,g,h=a.style;return c=c||Ib(a),g=c?c[b]:void 0,null==g&&h&&h[b]&&(g=h[b]),Hb.test(g)&&!Kb.test(b)&&(d=h.left,e=a.runtimeStyle,f=e&&e.left,f&&(e.left=a.currentStyle.left),h.left="fontSize"===b?"1em":g,g=h.pixelLeft+"px",h.left=d,f&&(e.left=f)),void 0===g?g:g+""||"auto"});function Lb(a,b){return{get:function(){var c=a();if(null!=c)return c?void delete this.get:(this.get=b).apply(this,arguments)}}}!function(){var b,c,d,e,f,g,h;if(b=y.createElement("div"),b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",d=b.getElementsByTagName("a")[0],c=d&&d.style){c.cssText="float:left;opacity:.5",k.opacity="0.5"===c.opacity,k.cssFloat=!!c.cssFloat,b.style.backgroundClip="content-box",b.cloneNode(!0).style.backgroundClip="",k.clearCloneStyle="content-box"===b.style.backgroundClip,k.boxSizing=""===c.boxSizing||""===c.MozBoxSizing||""===c.WebkitBoxSizing,m.extend(k,{reliableHiddenOffsets:function(){return null==g&&i(),g},boxSizingReliable:function(){return null==f&&i(),f},pixelPosition:function(){return null==e&&i(),e},reliableMarginRight:function(){return null==h&&i(),h}});function i(){var b,c,d,i;c=y.getElementsByTagName("body")[0],c&&c.style&&(b=y.createElement("div"),d=y.createElement("div"),d.style.cssText="position:absolute;border:0;width:0;height:0;top:0;left:-9999px",c.appendChild(d).appendChild(b),b.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute",e=f=!1,h=!0,a.getComputedStyle&&(e="1%"!==(a.getComputedStyle(b,null)||{}).top,f="4px"===(a.getComputedStyle(b,null)||{width:"4px"}).width,i=b.appendChild(y.createElement("div")),i.style.cssText=b.style.cssText="-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",i.style.marginRight=i.style.width="0",b.style.width="1px",h=!parseFloat((a.getComputedStyle(i,null)||{}).marginRight)),b.innerHTML="<table><tr><td></td><td>t</td></tr></table>",i=b.getElementsByTagName("td"),i[0].style.cssText="margin:0;border:0;padding:0;display:none",g=0===i[0].offsetHeight,g&&(i[0].style.display="",i[1].style.display="none",g=0===i[0].offsetHeight),c.removeChild(d))}}}(),m.swap=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e};var Mb=/alpha\([^)]*\)/i,Nb=/opacity\s*=\s*([^)]*)/,Ob=/^(none|table(?!-c[ea]).+)/,Pb=new RegExp("^("+S+")(.*)$","i"),Qb=new RegExp("^([+-])=("+S+")","i"),Rb={position:"absolute",visibility:"hidden",display:"block"},Sb={letterSpacing:"0",fontWeight:"400"},Tb=["Webkit","O","Moz","ms"];function Ub(a,b){if(b in a)return b;var c=b.charAt(0).toUpperCase()+b.slice(1),d=b,e=Tb.length;while(e--)if(b=Tb[e]+c,b in a)return b;return d}function Vb(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=m._data(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&U(d)&&(f[g]=m._data(d,"olddisplay",Fb(d.nodeName)))):(e=U(d),(c&&"none"!==c||!e)&&m._data(d,"olddisplay",e?c:m.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}function Wb(a,b,c){var d=Pb.exec(b);return d?Math.max(0,d[1]-(c||0))+(d[2]||"px"):b}function Xb(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=m.css(a,c+T[f],!0,e)),d?("content"===c&&(g-=m.css(a,"padding"+T[f],!0,e)),"margin"!==c&&(g-=m.css(a,"border"+T[f]+"Width",!0,e))):(g+=m.css(a,"padding"+T[f],!0,e),"padding"!==c&&(g+=m.css(a,"border"+T[f]+"Width",!0,e)));return g}function Yb(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ib(a),g=k.boxSizing&&"border-box"===m.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=Jb(a,b,f),(0>e||null==e)&&(e=a.style[b]),Hb.test(e))return e;d=g&&(k.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Xb(a,b,c||(g?"border":"content"),d,f)+"px"}m.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Jb(a,"opacity");return""===c?"1":c}}}},cssNumber:{columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":k.cssFloat?"cssFloat":"styleFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=m.camelCase(b),i=a.style;if(b=m.cssProps[h]||(m.cssProps[h]=Ub(i,h)),g=m.cssHooks[b]||m.cssHooks[h],void 0===c)return g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b];if(f=typeof c,"string"===f&&(e=Qb.exec(c))&&(c=(e[1]+1)*e[2]+parseFloat(m.css(a,b)),f="number"),null!=c&&c===c&&("number"!==f||m.cssNumber[h]||(c+="px"),k.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),!(g&&"set"in g&&void 0===(c=g.set(a,c,d)))))try{i[b]=c}catch(j){}}},css:function(a,b,c,d){var e,f,g,h=m.camelCase(b);return b=m.cssProps[h]||(m.cssProps[h]=Ub(a.style,h)),g=m.cssHooks[b]||m.cssHooks[h],g&&"get"in g&&(f=g.get(a,!0,c)),void 0===f&&(f=Jb(a,b,d)),"normal"===f&&b in Sb&&(f=Sb[b]),""===c||c?(e=parseFloat(f),c===!0||m.isNumeric(e)?e||0:f):f}}),m.each(["height","width"],function(a,b){m.cssHooks[b]={get:function(a,c,d){return c?Ob.test(m.css(a,"display"))&&0===a.offsetWidth?m.swap(a,Rb,function(){return Yb(a,b,d)}):Yb(a,b,d):void 0},set:function(a,c,d){var e=d&&Ib(a);return Wb(a,c,d?Xb(a,b,d,k.boxSizing&&"border-box"===m.css(a,"boxSizing",!1,e),e):0)}}}),k.opacity||(m.cssHooks.opacity={get:function(a,b){return Nb.test((b&&a.currentStyle?a.currentStyle.filter:a.style.filter)||"")?.01*parseFloat(RegExp.$1)+"":b?"1":""},set:function(a,b){var c=a.style,d=a.currentStyle,e=m.isNumeric(b)?"alpha(opacity="+100*b+")":"",f=d&&d.filter||c.filter||"";c.zoom=1,(b>=1||""===b)&&""===m.trim(f.replace(Mb,""))&&c.removeAttribute&&(c.removeAttribute("filter"),""===b||d&&!d.filter)||(c.filter=Mb.test(f)?f.replace(Mb,e):f+" "+e)}}),m.cssHooks.marginRight=Lb(k.reliableMarginRight,function(a,b){return b?m.swap(a,{display:"inline-block"},Jb,[a,"marginRight"]):void 0}),m.each({margin:"",padding:"",border:"Width"},function(a,b){m.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+T[d]+b]=f[d]||f[d-2]||f[0];return e}},Gb.test(a)||(m.cssHooks[a+b].set=Wb)}),m.fn.extend({css:function(a,b){return V(this,function(a,b,c){var d,e,f={},g=0;if(m.isArray(b)){for(d=Ib(a),e=b.length;e>g;g++)f[b[g]]=m.css(a,b[g],!1,d);return f}return void 0!==c?m.style(a,b,c):m.css(a,b)},a,b,arguments.length>1)},show:function(){return Vb(this,!0)},hide:function(){return Vb(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){U(this)?m(this).show():m(this).hide()})}});function Zb(a,b,c,d,e){return new Zb.prototype.init(a,b,c,d,e)}m.Tween=Zb,Zb.prototype={constructor:Zb,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||"swing",this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(m.cssNumber[c]?"":"px")
},cur:function(){var a=Zb.propHooks[this.prop];return a&&a.get?a.get(this):Zb.propHooks._default.get(this)},run:function(a){var b,c=Zb.propHooks[this.prop];return this.pos=b=this.options.duration?m.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Zb.propHooks._default.set(this),this}},Zb.prototype.init.prototype=Zb.prototype,Zb.propHooks={_default:{get:function(a){var b;return null==a.elem[a.prop]||a.elem.style&&null!=a.elem.style[a.prop]?(b=m.css(a.elem,a.prop,""),b&&"auto"!==b?b:0):a.elem[a.prop]},set:function(a){m.fx.step[a.prop]?m.fx.step[a.prop](a):a.elem.style&&(null!=a.elem.style[m.cssProps[a.prop]]||m.cssHooks[a.prop])?m.style(a.elem,a.prop,a.now+a.unit):a.elem[a.prop]=a.now}}},Zb.propHooks.scrollTop=Zb.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},m.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2}},m.fx=Zb.prototype.init,m.fx.step={};var $b,_b,ac=/^(?:toggle|show|hide)$/,bc=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),cc=/queueHooks$/,dc=[ic],ec={"*":[function(a,b){var c=this.createTween(a,b),d=c.cur(),e=bc.exec(b),f=e&&e[3]||(m.cssNumber[a]?"":"px"),g=(m.cssNumber[a]||"px"!==f&&+d)&&bc.exec(m.css(c.elem,a)),h=1,i=20;if(g&&g[3]!==f){f=f||g[3],e=e||[],g=+d||1;do h=h||".5",g/=h,m.style(c.elem,a,g+f);while(h!==(h=c.cur()/d)&&1!==h&&--i)}return e&&(g=c.start=+g||+d||0,c.unit=f,c.end=e[1]?g+(e[1]+1)*e[2]:+e[2]),c}]};function fc(){return setTimeout(function(){$b=void 0}),$b=m.now()}function gc(a,b){var c,d={height:a},e=0;for(b=b?1:0;4>e;e+=2-b)c=T[e],d["margin"+c]=d["padding"+c]=a;return b&&(d.opacity=d.width=a),d}function hc(a,b,c){for(var d,e=(ec[b]||[]).concat(ec["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function ic(a,b,c){var d,e,f,g,h,i,j,l,n=this,o={},p=a.style,q=a.nodeType&&U(a),r=m._data(a,"fxshow");c.queue||(h=m._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,n.always(function(){n.always(function(){h.unqueued--,m.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[p.overflow,p.overflowX,p.overflowY],j=m.css(a,"display"),l="none"===j?m._data(a,"olddisplay")||Fb(a.nodeName):j,"inline"===l&&"none"===m.css(a,"float")&&(k.inlineBlockNeedsLayout&&"inline"!==Fb(a.nodeName)?p.zoom=1:p.display="inline-block")),c.overflow&&(p.overflow="hidden",k.shrinkWrapBlocks()||n.always(function(){p.overflow=c.overflow[0],p.overflowX=c.overflow[1],p.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],ac.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(q?"hide":"show")){if("show"!==e||!r||void 0===r[d])continue;q=!0}o[d]=r&&r[d]||m.style(a,d)}else j=void 0;if(m.isEmptyObject(o))"inline"===("none"===j?Fb(a.nodeName):j)&&(p.display=j);else{r?"hidden"in r&&(q=r.hidden):r=m._data(a,"fxshow",{}),f&&(r.hidden=!q),q?m(a).show():n.done(function(){m(a).hide()}),n.done(function(){var b;m._removeData(a,"fxshow");for(b in o)m.style(a,b,o[b])});for(d in o)g=hc(q?r[d]:0,d,n),d in r||(r[d]=g.start,q&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function jc(a,b){var c,d,e,f,g;for(c in a)if(d=m.camelCase(c),e=b[d],f=a[c],m.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=m.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function kc(a,b,c){var d,e,f=0,g=dc.length,h=m.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=$b||fc(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:m.extend({},b),opts:m.extend(!0,{specialEasing:{}},c),originalProperties:b,originalOptions:c,startTime:$b||fc(),duration:c.duration,tweens:[],createTween:function(b,c){var d=m.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?h.resolveWith(a,[j,b]):h.rejectWith(a,[j,b]),this}}),k=j.props;for(jc(k,j.opts.specialEasing);g>f;f++)if(d=dc[f].call(j,a,k,j.opts))return d;return m.map(k,hc,j),m.isFunction(j.opts.start)&&j.opts.start.call(a,j),m.fx.timer(m.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}m.Animation=m.extend(kc,{tweener:function(a,b){m.isFunction(a)?(b=a,a=["*"]):a=a.split(" ");for(var c,d=0,e=a.length;e>d;d++)c=a[d],ec[c]=ec[c]||[],ec[c].unshift(b)},prefilter:function(a,b){b?dc.unshift(a):dc.push(a)}}),m.speed=function(a,b,c){var d=a&&"object"==typeof a?m.extend({},a):{complete:c||!c&&b||m.isFunction(a)&&a,duration:a,easing:c&&b||b&&!m.isFunction(b)&&b};return d.duration=m.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in m.fx.speeds?m.fx.speeds[d.duration]:m.fx.speeds._default,(null==d.queue||d.queue===!0)&&(d.queue="fx"),d.old=d.complete,d.complete=function(){m.isFunction(d.old)&&d.old.call(this),d.queue&&m.dequeue(this,d.queue)},d},m.fn.extend({fadeTo:function(a,b,c,d){return this.filter(U).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=m.isEmptyObject(a),f=m.speed(b,c,d),g=function(){var b=kc(this,m.extend({},a),f);(e||m._data(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=m.timers,g=m._data(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&cc.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));(b||!c)&&m.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=m._data(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=m.timers,g=d?d.length:0;for(c.finish=!0,m.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),m.each(["toggle","show","hide"],function(a,b){var c=m.fn[b];m.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(gc(b,!0),a,d,e)}}),m.each({slideDown:gc("show"),slideUp:gc("hide"),slideToggle:gc("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){m.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),m.timers=[],m.fx.tick=function(){var a,b=m.timers,c=0;for($b=m.now();c<b.length;c++)a=b[c],a()||b[c]!==a||b.splice(c--,1);b.length||m.fx.stop(),$b=void 0},m.fx.timer=function(a){m.timers.push(a),a()?m.fx.start():m.timers.pop()},m.fx.interval=13,m.fx.start=function(){_b||(_b=setInterval(m.fx.tick,m.fx.interval))},m.fx.stop=function(){clearInterval(_b),_b=null},m.fx.speeds={slow:600,fast:200,_default:400},m.fn.delay=function(a,b){return a=m.fx?m.fx.speeds[a]||a:a,b=b||"fx",this.queue(b,function(b,c){var d=setTimeout(b,a);c.stop=function(){clearTimeout(d)}})},function(){var a,b,c,d,e;b=y.createElement("div"),b.setAttribute("className","t"),b.innerHTML="  <link/><table></table><a href='/a'>a</a><input type='checkbox'/>",d=b.getElementsByTagName("a")[0],c=y.createElement("select"),e=c.appendChild(y.createElement("option")),a=b.getElementsByTagName("input")[0],d.style.cssText="top:1px",k.getSetAttribute="t"!==b.className,k.style=/top/.test(d.getAttribute("style")),k.hrefNormalized="/a"===d.getAttribute("href"),k.checkOn=!!a.value,k.optSelected=e.selected,k.enctype=!!y.createElement("form").enctype,c.disabled=!0,k.optDisabled=!e.disabled,a=y.createElement("input"),a.setAttribute("value",""),k.input=""===a.getAttribute("value"),a.value="t",a.setAttribute("type","radio"),k.radioValue="t"===a.value}();var lc=/\r/g;m.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=m.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,m(this).val()):a,null==e?e="":"number"==typeof e?e+="":m.isArray(e)&&(e=m.map(e,function(a){return null==a?"":a+""})),b=m.valHooks[this.type]||m.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=m.valHooks[e.type]||m.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(lc,""):null==c?"":c)}}}),m.extend({valHooks:{option:{get:function(a){var b=m.find.attr(a,"value");return null!=b?b:m.trim(m.text(a))}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],!(!c.selected&&i!==e||(k.optDisabled?c.disabled:null!==c.getAttribute("disabled"))||c.parentNode.disabled&&m.nodeName(c.parentNode,"optgroup"))){if(b=m(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=m.makeArray(b),g=e.length;while(g--)if(d=e[g],m.inArray(m.valHooks.option.get(d),f)>=0)try{d.selected=c=!0}catch(h){d.scrollHeight}else d.selected=!1;return c||(a.selectedIndex=-1),e}}}}),m.each(["radio","checkbox"],function(){m.valHooks[this]={set:function(a,b){return m.isArray(b)?a.checked=m.inArray(m(a).val(),b)>=0:void 0}},k.checkOn||(m.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var mc,nc,oc=m.expr.attrHandle,pc=/^(?:checked|selected)$/i,qc=k.getSetAttribute,rc=k.input;m.fn.extend({attr:function(a,b){return V(this,m.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){m.removeAttr(this,a)})}}),m.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(a&&3!==f&&8!==f&&2!==f)return typeof a.getAttribute===K?m.prop(a,b,c):(1===f&&m.isXMLDoc(a)||(b=b.toLowerCase(),d=m.attrHooks[b]||(m.expr.match.bool.test(b)?nc:mc)),void 0===c?d&&"get"in d&&null!==(e=d.get(a,b))?e:(e=m.find.attr(a,b),null==e?void 0:e):null!==c?d&&"set"in d&&void 0!==(e=d.set(a,c,b))?e:(a.setAttribute(b,c+""),c):void m.removeAttr(a,b))},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(E);if(f&&1===a.nodeType)while(c=f[e++])d=m.propFix[c]||c,m.expr.match.bool.test(c)?rc&&qc||!pc.test(c)?a[d]=!1:a[m.camelCase("default-"+c)]=a[d]=!1:m.attr(a,c,""),a.removeAttribute(qc?c:d)},attrHooks:{type:{set:function(a,b){if(!k.radioValue&&"radio"===b&&m.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}}}),nc={set:function(a,b,c){return b===!1?m.removeAttr(a,c):rc&&qc||!pc.test(c)?a.setAttribute(!qc&&m.propFix[c]||c,c):a[m.camelCase("default-"+c)]=a[c]=!0,c}},m.each(m.expr.match.bool.source.match(/\w+/g),function(a,b){var c=oc[b]||m.find.attr;oc[b]=rc&&qc||!pc.test(b)?function(a,b,d){var e,f;return d||(f=oc[b],oc[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,oc[b]=f),e}:function(a,b,c){return c?void 0:a[m.camelCase("default-"+b)]?b.toLowerCase():null}}),rc&&qc||(m.attrHooks.value={set:function(a,b,c){return m.nodeName(a,"input")?void(a.defaultValue=b):mc&&mc.set(a,b,c)}}),qc||(mc={set:function(a,b,c){var d=a.getAttributeNode(c);return d||a.setAttributeNode(d=a.ownerDocument.createAttribute(c)),d.value=b+="","value"===c||b===a.getAttribute(c)?b:void 0}},oc.id=oc.name=oc.coords=function(a,b,c){var d;return c?void 0:(d=a.getAttributeNode(b))&&""!==d.value?d.value:null},m.valHooks.button={get:function(a,b){var c=a.getAttributeNode(b);return c&&c.specified?c.value:void 0},set:mc.set},m.attrHooks.contenteditable={set:function(a,b,c){mc.set(a,""===b?!1:b,c)}},m.each(["width","height"],function(a,b){m.attrHooks[b]={set:function(a,c){return""===c?(a.setAttribute(b,"auto"),c):void 0}}})),k.style||(m.attrHooks.style={get:function(a){return a.style.cssText||void 0},set:function(a,b){return a.style.cssText=b+""}});var sc=/^(?:input|select|textarea|button|object)$/i,tc=/^(?:a|area)$/i;m.fn.extend({prop:function(a,b){return V(this,m.prop,a,b,arguments.length>1)},removeProp:function(a){return a=m.propFix[a]||a,this.each(function(){try{this[a]=void 0,delete this[a]}catch(b){}})}}),m.extend({propFix:{"for":"htmlFor","class":"className"},prop:function(a,b,c){var d,e,f,g=a.nodeType;if(a&&3!==g&&8!==g&&2!==g)return f=1!==g||!m.isXMLDoc(a),f&&(b=m.propFix[b]||b,e=m.propHooks[b]),void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=m.find.attr(a,"tabindex");return b?parseInt(b,10):sc.test(a.nodeName)||tc.test(a.nodeName)&&a.href?0:-1}}}}),k.hrefNormalized||m.each(["href","src"],function(a,b){m.propHooks[b]={get:function(a){return a.getAttribute(b,4)}}}),k.optSelected||(m.propHooks.selected={get:function(a){var b=a.parentNode;return b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex),null}}),m.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){m.propFix[this.toLowerCase()]=this}),k.enctype||(m.propFix.enctype="encoding");var uc=/[\t\r\n\f]/g;m.fn.extend({addClass:function(a){var b,c,d,e,f,g,h=0,i=this.length,j="string"==typeof a&&a;if(m.isFunction(a))return this.each(function(b){m(this).addClass(a.call(this,b,this.className))});if(j)for(b=(a||"").match(E)||[];i>h;h++)if(c=this[h],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(uc," "):" ")){f=0;while(e=b[f++])d.indexOf(" "+e+" ")<0&&(d+=e+" ");g=m.trim(d),c.className!==g&&(c.className=g)}return this},removeClass:function(a){var b,c,d,e,f,g,h=0,i=this.length,j=0===arguments.length||"string"==typeof a&&a;if(m.isFunction(a))return this.each(function(b){m(this).removeClass(a.call(this,b,this.className))});if(j)for(b=(a||"").match(E)||[];i>h;h++)if(c=this[h],d=1===c.nodeType&&(c.className?(" "+c.className+" ").replace(uc," "):"")){f=0;while(e=b[f++])while(d.indexOf(" "+e+" ")>=0)d=d.replace(" "+e+" "," ");g=a?m.trim(d):"",c.className!==g&&(c.className=g)}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):this.each(m.isFunction(a)?function(c){m(this).toggleClass(a.call(this,c,this.className,b),b)}:function(){if("string"===c){var b,d=0,e=m(this),f=a.match(E)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else(c===K||"boolean"===c)&&(this.className&&m._data(this,"__className__",this.className),this.className=this.className||a===!1?"":m._data(this,"__className__")||"")})},hasClass:function(a){for(var b=" "+a+" ",c=0,d=this.length;d>c;c++)if(1===this[c].nodeType&&(" "+this[c].className+" ").replace(uc," ").indexOf(b)>=0)return!0;return!1}}),m.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){m.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),m.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)},bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)}});var vc=m.now(),wc=/\?/,xc=/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g;m.parseJSON=function(b){if(a.JSON&&a.JSON.parse)return a.JSON.parse(b+"");var c,d=null,e=m.trim(b+"");return e&&!m.trim(e.replace(xc,function(a,b,e,f){return c&&b&&(d=0),0===d?a:(c=e||b,d+=!f-!e,"")}))?Function("return "+e)():m.error("Invalid JSON: "+b)},m.parseXML=function(b){var c,d;if(!b||"string"!=typeof b)return null;try{a.DOMParser?(d=new DOMParser,c=d.parseFromString(b,"text/xml")):(c=new ActiveXObject("Microsoft.XMLDOM"),c.async="false",c.loadXML(b))}catch(e){c=void 0}return c&&c.documentElement&&!c.getElementsByTagName("parsererror").length||m.error("Invalid XML: "+b),c};var yc,zc,Ac=/#.*$/,Bc=/([?&])_=[^&]*/,Cc=/^(.*?):[ \t]*([^\r\n]*)\r?$/gm,Dc=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,Ec=/^(?:GET|HEAD)$/,Fc=/^\/\//,Gc=/^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,Hc={},Ic={},Jc="*/".concat("*");try{zc=location.href}catch(Kc){zc=y.createElement("a"),zc.href="",zc=zc.href}yc=Gc.exec(zc.toLowerCase())||[];function Lc(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(E)||[];if(m.isFunction(c))while(d=f[e++])"+"===d.charAt(0)?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function Mc(a,b,c,d){var e={},f=a===Ic;function g(h){var i;return e[h]=!0,m.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function Nc(a,b){var c,d,e=m.ajaxSettings.flatOptions||{};for(d in b)void 0!==b[d]&&((e[d]?a:c||(c={}))[d]=b[d]);return c&&m.extend(!0,a,c),a}function Oc(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===e&&(e=a.mimeType||b.getResponseHeader("Content-Type"));if(e)for(g in h)if(h[g]&&h[g].test(e)){i.unshift(g);break}if(i[0]in c)f=i[0];else{for(g in c){if(!i[0]||a.converters[g+" "+i[0]]){f=g;break}d||(d=g)}f=f||d}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Pc(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}m.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:zc,type:"GET",isLocal:Dc.test(yc[1]),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":Jc,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/xml/,html:/html/,json:/json/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":m.parseJSON,"text xml":m.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?Nc(Nc(a,m.ajaxSettings),b):Nc(m.ajaxSettings,a)},ajaxPrefilter:Lc(Hc),ajaxTransport:Lc(Ic),ajax:function(a,b){"object"==typeof a&&(b=a,a=void 0),b=b||{};var c,d,e,f,g,h,i,j,k=m.ajaxSetup({},b),l=k.context||k,n=k.context&&(l.nodeType||l.jquery)?m(l):m.event,o=m.Deferred(),p=m.Callbacks("once memory"),q=k.statusCode||{},r={},s={},t=0,u="canceled",v={readyState:0,getResponseHeader:function(a){var b;if(2===t){if(!j){j={};while(b=Cc.exec(f))j[b[1].toLowerCase()]=b[2]}b=j[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===t?f:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return t||(a=s[c]=s[c]||a,r[a]=b),this},overrideMimeType:function(a){return t||(k.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>t)for(b in a)q[b]=[q[b],a[b]];else v.always(a[v.status]);return this},abort:function(a){var b=a||u;return i&&i.abort(b),x(0,b),this}};if(o.promise(v).complete=p.add,v.success=v.done,v.error=v.fail,k.url=((a||k.url||zc)+"").replace(Ac,"").replace(Fc,yc[1]+"//"),k.type=b.method||b.type||k.method||k.type,k.dataTypes=m.trim(k.dataType||"*").toLowerCase().match(E)||[""],null==k.crossDomain&&(c=Gc.exec(k.url.toLowerCase()),k.crossDomain=!(!c||c[1]===yc[1]&&c[2]===yc[2]&&(c[3]||("http:"===c[1]?"80":"443"))===(yc[3]||("http:"===yc[1]?"80":"443")))),k.data&&k.processData&&"string"!=typeof k.data&&(k.data=m.param(k.data,k.traditional)),Mc(Hc,k,b,v),2===t)return v;h=k.global,h&&0===m.active++&&m.event.trigger("ajaxStart"),k.type=k.type.toUpperCase(),k.hasContent=!Ec.test(k.type),e=k.url,k.hasContent||(k.data&&(e=k.url+=(wc.test(e)?"&":"?")+k.data,delete k.data),k.cache===!1&&(k.url=Bc.test(e)?e.replace(Bc,"$1_="+vc++):e+(wc.test(e)?"&":"?")+"_="+vc++)),k.ifModified&&(m.lastModified[e]&&v.setRequestHeader("If-Modified-Since",m.lastModified[e]),m.etag[e]&&v.setRequestHeader("If-None-Match",m.etag[e])),(k.data&&k.hasContent&&k.contentType!==!1||b.contentType)&&v.setRequestHeader("Content-Type",k.contentType),v.setRequestHeader("Accept",k.dataTypes[0]&&k.accepts[k.dataTypes[0]]?k.accepts[k.dataTypes[0]]+("*"!==k.dataTypes[0]?", "+Jc+"; q=0.01":""):k.accepts["*"]);for(d in k.headers)v.setRequestHeader(d,k.headers[d]);if(k.beforeSend&&(k.beforeSend.call(l,v,k)===!1||2===t))return v.abort();u="abort";for(d in{success:1,error:1,complete:1})v[d](k[d]);if(i=Mc(Ic,k,b,v)){v.readyState=1,h&&n.trigger("ajaxSend",[v,k]),k.async&&k.timeout>0&&(g=setTimeout(function(){v.abort("timeout")},k.timeout));try{t=1,i.send(r,x)}catch(w){if(!(2>t))throw w;x(-1,w)}}else x(-1,"No Transport");function x(a,b,c,d){var j,r,s,u,w,x=b;2!==t&&(t=2,g&&clearTimeout(g),i=void 0,f=d||"",v.readyState=a>0?4:0,j=a>=200&&300>a||304===a,c&&(u=Oc(k,v,c)),u=Pc(k,u,v,j),j?(k.ifModified&&(w=v.getResponseHeader("Last-Modified"),w&&(m.lastModified[e]=w),w=v.getResponseHeader("etag"),w&&(m.etag[e]=w)),204===a||"HEAD"===k.type?x="nocontent":304===a?x="notmodified":(x=u.state,r=u.data,s=u.error,j=!s)):(s=x,(a||!x)&&(x="error",0>a&&(a=0))),v.status=a,v.statusText=(b||x)+"",j?o.resolveWith(l,[r,x,v]):o.rejectWith(l,[v,x,s]),v.statusCode(q),q=void 0,h&&n.trigger(j?"ajaxSuccess":"ajaxError",[v,k,j?r:s]),p.fireWith(l,[v,x]),h&&(n.trigger("ajaxComplete",[v,k]),--m.active||m.event.trigger("ajaxStop")))}return v},getJSON:function(a,b,c){return m.get(a,b,c,"json")},getScript:function(a,b){return m.get(a,void 0,b,"script")}}),m.each(["get","post"],function(a,b){m[b]=function(a,c,d,e){return m.isFunction(c)&&(e=e||d,d=c,c=void 0),m.ajax({url:a,type:b,dataType:e,data:c,success:d})}}),m.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){m.fn[b]=function(a){return this.on(b,a)}}),m._evalUrl=function(a){return m.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},m.fn.extend({wrapAll:function(a){if(m.isFunction(a))return this.each(function(b){m(this).wrapAll(a.call(this,b))});if(this[0]){var b=m(a,this[0].ownerDocument).eq(0).clone(!0);this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstChild&&1===a.firstChild.nodeType)a=a.firstChild;return a}).append(this)}return this},wrapInner:function(a){return this.each(m.isFunction(a)?function(b){m(this).wrapInner(a.call(this,b))}:function(){var b=m(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=m.isFunction(a);return this.each(function(c){m(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){m.nodeName(this,"body")||m(this).replaceWith(this.childNodes)}).end()}}),m.expr.filters.hidden=function(a){return a.offsetWidth<=0&&a.offsetHeight<=0||!k.reliableHiddenOffsets()&&"none"===(a.style&&a.style.display||m.css(a,"display"))},m.expr.filters.visible=function(a){return!m.expr.filters.hidden(a)};var Qc=/%20/g,Rc=/\[\]$/,Sc=/\r?\n/g,Tc=/^(?:submit|button|image|reset|file)$/i,Uc=/^(?:input|select|textarea|keygen)/i;function Vc(a,b,c,d){var e;if(m.isArray(b))m.each(b,function(b,e){c||Rc.test(a)?d(a,e):Vc(a+"["+("object"==typeof e?b:"")+"]",e,c,d)});else if(c||"object"!==m.type(b))d(a,b);else for(e in b)Vc(a+"["+e+"]",b[e],c,d)}m.param=function(a,b){var c,d=[],e=function(a,b){b=m.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=m.ajaxSettings&&m.ajaxSettings.traditional),m.isArray(a)||a.jquery&&!m.isPlainObject(a))m.each(a,function(){e(this.name,this.value)});else for(c in a)Vc(c,a[c],b,e);return d.join("&").replace(Qc,"+")},m.fn.extend({serialize:function(){return m.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=m.prop(this,"elements");return a?m.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!m(this).is(":disabled")&&Uc.test(this.nodeName)&&!Tc.test(a)&&(this.checked||!W.test(a))}).map(function(a,b){var c=m(this).val();return null==c?null:m.isArray(c)?m.map(c,function(a){return{name:b.name,value:a.replace(Sc,"\r\n")}}):{name:b.name,value:c.replace(Sc,"\r\n")}}).get()}}),m.ajaxSettings.xhr=void 0!==a.ActiveXObject?function(){return!this.isLocal&&/^(get|post|head|put|delete|options)$/i.test(this.type)&&Zc()||$c()}:Zc;var Wc=0,Xc={},Yc=m.ajaxSettings.xhr();a.ActiveXObject&&m(a).on("unload",function(){for(var a in Xc)Xc[a](void 0,!0)}),k.cors=!!Yc&&"withCredentials"in Yc,Yc=k.ajax=!!Yc,Yc&&m.ajaxTransport(function(a){if(!a.crossDomain||k.cors){var b;return{send:function(c,d){var e,f=a.xhr(),g=++Wc;if(f.open(a.type,a.url,a.async,a.username,a.password),a.xhrFields)for(e in a.xhrFields)f[e]=a.xhrFields[e];a.mimeType&&f.overrideMimeType&&f.overrideMimeType(a.mimeType),a.crossDomain||c["X-Requested-With"]||(c["X-Requested-With"]="XMLHttpRequest");for(e in c)void 0!==c[e]&&f.setRequestHeader(e,c[e]+"");f.send(a.hasContent&&a.data||null),b=function(c,e){var h,i,j;if(b&&(e||4===f.readyState))if(delete Xc[g],b=void 0,f.onreadystatechange=m.noop,e)4!==f.readyState&&f.abort();else{j={},h=f.status,"string"==typeof f.responseText&&(j.text=f.responseText);try{i=f.statusText}catch(k){i=""}h||!a.isLocal||a.crossDomain?1223===h&&(h=204):h=j.text?200:404}j&&d(h,i,j,f.getAllResponseHeaders())},a.async?4===f.readyState?setTimeout(b):f.onreadystatechange=Xc[g]=b:b()},abort:function(){b&&b(void 0,!0)}}}});function Zc(){try{return new a.XMLHttpRequest}catch(b){}}function $c(){try{return new a.ActiveXObject("Microsoft.XMLHTTP")}catch(b){}}m.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/(?:java|ecma)script/},converters:{"text script":function(a){return m.globalEval(a),a}}}),m.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET",a.global=!1)}),m.ajaxTransport("script",function(a){if(a.crossDomain){var b,c=y.head||m("head")[0]||y.documentElement;return{send:function(d,e){b=y.createElement("script"),b.async=!0,a.scriptCharset&&(b.charset=a.scriptCharset),b.src=a.url,b.onload=b.onreadystatechange=function(a,c){(c||!b.readyState||/loaded|complete/.test(b.readyState))&&(b.onload=b.onreadystatechange=null,b.parentNode&&b.parentNode.removeChild(b),b=null,c||e(200,"success"))},c.insertBefore(b,c.firstChild)},abort:function(){b&&b.onload(void 0,!0)}}}});var _c=[],ad=/(=)\?(?=&|$)|\?\?/;m.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=_c.pop()||m.expando+"_"+vc++;return this[a]=!0,a}}),m.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(ad.test(b.url)?"url":"string"==typeof b.data&&!(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&ad.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=m.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(ad,"$1"+e):b.jsonp!==!1&&(b.url+=(wc.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||m.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,_c.push(e)),g&&m.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),m.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||y;var d=u.exec(a),e=!c&&[];return d?[b.createElement(d[1])]:(d=m.buildFragment([a],b,e),e&&e.length&&m(e).remove(),m.merge([],d.childNodes))};var bd=m.fn.load;m.fn.load=function(a,b,c){if("string"!=typeof a&&bd)return bd.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>=0&&(d=m.trim(a.slice(h,a.length)),a=a.slice(0,h)),m.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(f="POST"),g.length>0&&m.ajax({url:a,type:f,dataType:"html",data:b}).done(function(a){e=arguments,g.html(d?m("<div>").append(m.parseHTML(a)).find(d):a)}).complete(c&&function(a,b){g.each(c,e||[a.responseText,b,a])}),this},m.expr.filters.animated=function(a){return m.grep(m.timers,function(b){return a===b.elem}).length};var cd=a.document.documentElement;function dd(a){return m.isWindow(a)?a:9===a.nodeType?a.defaultView||a.parentWindow:!1}m.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=m.css(a,"position"),l=m(a),n={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=m.css(a,"top"),i=m.css(a,"left"),j=("absolute"===k||"fixed"===k)&&m.inArray("auto",[f,i])>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),m.isFunction(b)&&(b=b.call(a,c,h)),null!=b.top&&(n.top=b.top-h.top+g),null!=b.left&&(n.left=b.left-h.left+e),"using"in b?b.using.call(a,n):l.css(n)}},m.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){m.offset.setOffset(this,a,b)});var b,c,d={top:0,left:0},e=this[0],f=e&&e.ownerDocument;if(f)return b=f.documentElement,m.contains(b,e)?(typeof e.getBoundingClientRect!==K&&(d=e.getBoundingClientRect()),c=dd(f),{top:d.top+(c.pageYOffset||b.scrollTop)-(b.clientTop||0),left:d.left+(c.pageXOffset||b.scrollLeft)-(b.clientLeft||0)}):d},position:function(){if(this[0]){var a,b,c={top:0,left:0},d=this[0];return"fixed"===m.css(d,"position")?b=d.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),m.nodeName(a[0],"html")||(c=a.offset()),c.top+=m.css(a[0],"borderTopWidth",!0),c.left+=m.css(a[0],"borderLeftWidth",!0)),{top:b.top-c.top-m.css(d,"marginTop",!0),left:b.left-c.left-m.css(d,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent||cd;while(a&&!m.nodeName(a,"html")&&"static"===m.css(a,"position"))a=a.offsetParent;return a||cd})}}),m.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c=/Y/.test(b);m.fn[a]=function(d){return V(this,function(a,d,e){var f=dd(a);return void 0===e?f?b in f?f[b]:f.document.documentElement[d]:a[d]:void(f?f.scrollTo(c?m(f).scrollLeft():e,c?e:m(f).scrollTop()):a[d]=e)},a,d,arguments.length,null)}}),m.each(["top","left"],function(a,b){m.cssHooks[b]=Lb(k.pixelPosition,function(a,c){return c?(c=Jb(a,b),Hb.test(c)?m(a).position()[b]+"px":c):void 0})}),m.each({Height:"height",Width:"width"},function(a,b){m.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){m.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return V(this,function(b,c,d){var e;return m.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?m.css(b,c,g):m.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),m.fn.size=function(){return this.length},m.fn.andSelf=m.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return m});var ed=a.jQuery,fd=a.$;return m.noConflict=function(b){return a.$===m&&(a.$=fd),b&&a.jQuery===m&&(a.jQuery=ed),m},typeof b===K&&(a.jQuery=a.$=m),m});

define("bgpst.lib.jquery", function(){});

/*!
 * Bootstrap v3.1.1 (http://getbootstrap.com)
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */
if("undefined"==typeof jQuery)throw new Error("Bootstrap's JavaScript requires jQuery");+function(a){"use strict";function b(){var a=document.createElement("bootstrap"),b={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd otransitionend",transition:"transitionend"};for(var c in b)if(void 0!==a.style[c])return{end:b[c]};return!1}a.fn.emulateTransitionEnd=function(b){var c=!1,d=this;a(this).one(a.support.transition.end,function(){c=!0});var e=function(){c||a(d).trigger(a.support.transition.end)};return setTimeout(e,b),this},a(function(){a.support.transition=b()})}(jQuery),+function(a){"use strict";var b='[data-dismiss="alert"]',c=function(c){a(c).on("click",b,this.close)};c.prototype.close=function(b){function c(){f.trigger("closed.bs.alert").remove()}var d=a(this),e=d.attr("data-target");e||(e=d.attr("href"),e=e&&e.replace(/.*(?=#[^\s]*$)/,""));var f=a(e);b&&b.preventDefault(),f.length||(f=d.hasClass("alert")?d:d.parent()),f.trigger(b=a.Event("close.bs.alert")),b.isDefaultPrevented()||(f.removeClass("in"),a.support.transition&&f.hasClass("fade")?f.one(a.support.transition.end,c).emulateTransitionEnd(150):c())};var d=a.fn.alert;a.fn.alert=function(b){return this.each(function(){var d=a(this),e=d.data("bs.alert");e||d.data("bs.alert",e=new c(this)),"string"==typeof b&&e[b].call(d)})},a.fn.alert.Constructor=c,a.fn.alert.noConflict=function(){return a.fn.alert=d,this},a(document).on("click.bs.alert.data-api",b,c.prototype.close)}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.isLoading=!1};b.DEFAULTS={loadingText:"loading..."},b.prototype.setState=function(b){var c="disabled",d=this.$element,e=d.is("input")?"val":"html",f=d.data();b+="Text",f.resetText||d.data("resetText",d[e]()),d[e](f[b]||this.options[b]),setTimeout(a.proxy(function(){"loadingText"==b?(this.isLoading=!0,d.addClass(c).attr(c,c)):this.isLoading&&(this.isLoading=!1,d.removeClass(c).removeAttr(c))},this),0)},b.prototype.toggle=function(){var a=!0,b=this.$element.closest('[data-toggle="buttons"]');if(b.length){var c=this.$element.find("input");"radio"==c.prop("type")&&(c.prop("checked")&&this.$element.hasClass("active")?a=!1:b.find(".active").removeClass("active")),a&&c.prop("checked",!this.$element.hasClass("active")).trigger("change")}a&&this.$element.toggleClass("active")};var c=a.fn.button;a.fn.button=function(c){return this.each(function(){var d=a(this),e=d.data("bs.button"),f="object"==typeof c&&c;e||d.data("bs.button",e=new b(this,f)),"toggle"==c?e.toggle():c&&e.setState(c)})},a.fn.button.Constructor=b,a.fn.button.noConflict=function(){return a.fn.button=c,this},a(document).on("click.bs.button.data-api","[data-toggle^=button]",function(b){var c=a(b.target);c.hasClass("btn")||(c=c.closest(".btn")),c.button("toggle"),b.preventDefault()})}(jQuery),+function(a){"use strict";var b=function(b,c){this.$element=a(b),this.$indicators=this.$element.find(".carousel-indicators"),this.options=c,this.paused=this.sliding=this.interval=this.$active=this.$items=null,"hover"==this.options.pause&&this.$element.on("mouseenter",a.proxy(this.pause,this)).on("mouseleave",a.proxy(this.cycle,this))};b.DEFAULTS={interval:5e3,pause:"hover",wrap:!0},b.prototype.cycle=function(b){return b||(this.paused=!1),this.interval&&clearInterval(this.interval),this.options.interval&&!this.paused&&(this.interval=setInterval(a.proxy(this.next,this),this.options.interval)),this},b.prototype.getActiveIndex=function(){return this.$active=this.$element.find(".item.active"),this.$items=this.$active.parent().children(),this.$items.index(this.$active)},b.prototype.to=function(b){var c=this,d=this.getActiveIndex();return b>this.$items.length-1||0>b?void 0:this.sliding?this.$element.one("slid.bs.carousel",function(){c.to(b)}):d==b?this.pause().cycle():this.slide(b>d?"next":"prev",a(this.$items[b]))},b.prototype.pause=function(b){return b||(this.paused=!0),this.$element.find(".next, .prev").length&&a.support.transition&&(this.$element.trigger(a.support.transition.end),this.cycle(!0)),this.interval=clearInterval(this.interval),this},b.prototype.next=function(){return this.sliding?void 0:this.slide("next")},b.prototype.prev=function(){return this.sliding?void 0:this.slide("prev")},b.prototype.slide=function(b,c){var d=this.$element.find(".item.active"),e=c||d[b](),f=this.interval,g="next"==b?"left":"right",h="next"==b?"first":"last",i=this;if(!e.length){if(!this.options.wrap)return;e=this.$element.find(".item")[h]()}if(e.hasClass("active"))return this.sliding=!1;var j=a.Event("slide.bs.carousel",{relatedTarget:e[0],direction:g});return this.$element.trigger(j),j.isDefaultPrevented()?void 0:(this.sliding=!0,f&&this.pause(),this.$indicators.length&&(this.$indicators.find(".active").removeClass("active"),this.$element.one("slid.bs.carousel",function(){var b=a(i.$indicators.children()[i.getActiveIndex()]);b&&b.addClass("active")})),a.support.transition&&this.$element.hasClass("slide")?(e.addClass(b),e[0].offsetWidth,d.addClass(g),e.addClass(g),d.one(a.support.transition.end,function(){e.removeClass([b,g].join(" ")).addClass("active"),d.removeClass(["active",g].join(" ")),i.sliding=!1,setTimeout(function(){i.$element.trigger("slid.bs.carousel")},0)}).emulateTransitionEnd(1e3*d.css("transition-duration").slice(0,-1))):(d.removeClass("active"),e.addClass("active"),this.sliding=!1,this.$element.trigger("slid.bs.carousel")),f&&this.cycle(),this)};var c=a.fn.carousel;a.fn.carousel=function(c){return this.each(function(){var d=a(this),e=d.data("bs.carousel"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c),g="string"==typeof c?c:f.slide;e||d.data("bs.carousel",e=new b(this,f)),"number"==typeof c?e.to(c):g?e[g]():f.interval&&e.pause().cycle()})},a.fn.carousel.Constructor=b,a.fn.carousel.noConflict=function(){return a.fn.carousel=c,this},a(document).on("click.bs.carousel.data-api","[data-slide], [data-slide-to]",function(b){var c,d=a(this),e=a(d.attr("data-target")||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,"")),f=a.extend({},e.data(),d.data()),g=d.attr("data-slide-to");g&&(f.interval=!1),e.carousel(f),(g=d.attr("data-slide-to"))&&e.data("bs.carousel").to(g),b.preventDefault()}),a(window).on("load",function(){a('[data-ride="carousel"]').each(function(){var b=a(this);b.carousel(b.data())})})}(jQuery),+function(a){"use strict";var b=function(c,d){this.$element=a(c),this.options=a.extend({},b.DEFAULTS,d),this.transitioning=null,this.options.parent&&(this.$parent=a(this.options.parent)),this.options.toggle&&this.toggle()};b.DEFAULTS={toggle:!0},b.prototype.dimension=function(){var a=this.$element.hasClass("width");return a?"width":"height"},b.prototype.show=function(){if(!this.transitioning&&!this.$element.hasClass("in")){var b=a.Event("show.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.$parent&&this.$parent.find("> .panel > .in");if(c&&c.length){var d=c.data("bs.collapse");if(d&&d.transitioning)return;c.collapse("hide"),d||c.data("bs.collapse",null)}var e=this.dimension();this.$element.removeClass("collapse").addClass("collapsing")[e](0),this.transitioning=1;var f=function(){this.$element.removeClass("collapsing").addClass("collapse in")[e]("auto"),this.transitioning=0,this.$element.trigger("shown.bs.collapse")};if(!a.support.transition)return f.call(this);var g=a.camelCase(["scroll",e].join("-"));this.$element.one(a.support.transition.end,a.proxy(f,this)).emulateTransitionEnd(350)[e](this.$element[0][g])}}},b.prototype.hide=function(){if(!this.transitioning&&this.$element.hasClass("in")){var b=a.Event("hide.bs.collapse");if(this.$element.trigger(b),!b.isDefaultPrevented()){var c=this.dimension();this.$element[c](this.$element[c]())[0].offsetHeight,this.$element.addClass("collapsing").removeClass("collapse").removeClass("in"),this.transitioning=1;var d=function(){this.transitioning=0,this.$element.trigger("hidden.bs.collapse").removeClass("collapsing").addClass("collapse")};return a.support.transition?void this.$element[c](0).one(a.support.transition.end,a.proxy(d,this)).emulateTransitionEnd(350):d.call(this)}}},b.prototype.toggle=function(){this[this.$element.hasClass("in")?"hide":"show"]()};var c=a.fn.collapse;a.fn.collapse=function(c){return this.each(function(){var d=a(this),e=d.data("bs.collapse"),f=a.extend({},b.DEFAULTS,d.data(),"object"==typeof c&&c);!e&&f.toggle&&"show"==c&&(c=!c),e||d.data("bs.collapse",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.collapse.Constructor=b,a.fn.collapse.noConflict=function(){return a.fn.collapse=c,this},a(document).on("click.bs.collapse.data-api","[data-toggle=collapse]",function(b){var c,d=a(this),e=d.attr("data-target")||b.preventDefault()||(c=d.attr("href"))&&c.replace(/.*(?=#[^\s]+$)/,""),f=a(e),g=f.data("bs.collapse"),h=g?"toggle":d.data(),i=d.attr("data-parent"),j=i&&a(i);g&&g.transitioning||(j&&j.find('[data-toggle=collapse][data-parent="'+i+'"]').not(d).addClass("collapsed"),d[f.hasClass("in")?"addClass":"removeClass"]("collapsed")),f.collapse(h)})}(jQuery),+function(a){"use strict";function b(b){a(d).remove(),a(e).each(function(){var d=c(a(this)),e={relatedTarget:this};d.hasClass("open")&&(d.trigger(b=a.Event("hide.bs.dropdown",e)),b.isDefaultPrevented()||d.removeClass("open").trigger("hidden.bs.dropdown",e))})}function c(b){var c=b.attr("data-target");c||(c=b.attr("href"),c=c&&/#[A-Za-z]/.test(c)&&c.replace(/.*(?=#[^\s]*$)/,""));var d=c&&a(c);return d&&d.length?d:b.parent()}var d=".dropdown-backdrop",e="[data-toggle=dropdown]",f=function(b){a(b).on("click.bs.dropdown",this.toggle)};f.prototype.toggle=function(d){var e=a(this);if(!e.is(".disabled, :disabled")){var f=c(e),g=f.hasClass("open");if(b(),!g){"ontouchstart"in document.documentElement&&!f.closest(".navbar-nav").length&&a('<div class="dropdown-backdrop"/>').insertAfter(a(this)).on("click",b);var h={relatedTarget:this};if(f.trigger(d=a.Event("show.bs.dropdown",h)),d.isDefaultPrevented())return;f.toggleClass("open").trigger("shown.bs.dropdown",h),e.focus()}return!1}},f.prototype.keydown=function(b){if(/(38|40|27)/.test(b.keyCode)){var d=a(this);if(b.preventDefault(),b.stopPropagation(),!d.is(".disabled, :disabled")){var f=c(d),g=f.hasClass("open");if(!g||g&&27==b.keyCode)return 27==b.which&&f.find(e).focus(),d.click();var h=" li:not(.divider):visible a",i=f.find("[role=menu]"+h+", [role=listbox]"+h);if(i.length){var j=i.index(i.filter(":focus"));38==b.keyCode&&j>0&&j--,40==b.keyCode&&j<i.length-1&&j++,~j||(j=0),i.eq(j).focus()}}}};var g=a.fn.dropdown;a.fn.dropdown=function(b){return this.each(function(){var c=a(this),d=c.data("bs.dropdown");d||c.data("bs.dropdown",d=new f(this)),"string"==typeof b&&d[b].call(c)})},a.fn.dropdown.Constructor=f,a.fn.dropdown.noConflict=function(){return a.fn.dropdown=g,this},a(document).on("click.bs.dropdown.data-api",b).on("click.bs.dropdown.data-api",".dropdown form",function(a){a.stopPropagation()}).on("click.bs.dropdown.data-api",e,f.prototype.toggle).on("keydown.bs.dropdown.data-api",e+", [role=menu], [role=listbox]",f.prototype.keydown)}(jQuery),+function(a){"use strict";var b=function(b,c){this.options=c,this.$element=a(b),this.$backdrop=this.isShown=null,this.options.remote&&this.$element.find(".modal-content").load(this.options.remote,a.proxy(function(){this.$element.trigger("loaded.bs.modal")},this))};b.DEFAULTS={backdrop:!0,keyboard:!0,show:!0},b.prototype.toggle=function(a){return this[this.isShown?"hide":"show"](a)},b.prototype.show=function(b){var c=this,d=a.Event("show.bs.modal",{relatedTarget:b});this.$element.trigger(d),this.isShown||d.isDefaultPrevented()||(this.isShown=!0,this.escape(),this.$element.on("click.dismiss.bs.modal",'[data-dismiss="modal"]',a.proxy(this.hide,this)),this.backdrop(function(){var d=a.support.transition&&c.$element.hasClass("fade");c.$element.parent().length||c.$element.appendTo(document.body),c.$element.show().scrollTop(0),d&&c.$element[0].offsetWidth,c.$element.addClass("in").attr("aria-hidden",!1),c.enforceFocus();var e=a.Event("shown.bs.modal",{relatedTarget:b});d?c.$element.find(".modal-dialog").one(a.support.transition.end,function(){c.$element.focus().trigger(e)}).emulateTransitionEnd(300):c.$element.focus().trigger(e)}))},b.prototype.hide=function(b){b&&b.preventDefault(),b=a.Event("hide.bs.modal"),this.$element.trigger(b),this.isShown&&!b.isDefaultPrevented()&&(this.isShown=!1,this.escape(),a(document).off("focusin.bs.modal"),this.$element.removeClass("in").attr("aria-hidden",!0).off("click.dismiss.bs.modal"),a.support.transition&&this.$element.hasClass("fade")?this.$element.one(a.support.transition.end,a.proxy(this.hideModal,this)).emulateTransitionEnd(300):this.hideModal())},b.prototype.enforceFocus=function(){a(document).off("focusin.bs.modal").on("focusin.bs.modal",a.proxy(function(a){this.$element[0]===a.target||this.$element.has(a.target).length||this.$element.focus()},this))},b.prototype.escape=function(){this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.bs.modal",a.proxy(function(a){27==a.which&&this.hide()},this)):this.isShown||this.$element.off("keyup.dismiss.bs.modal")},b.prototype.hideModal=function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden.bs.modal")})},b.prototype.removeBackdrop=function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},b.prototype.backdrop=function(b){var c=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var d=a.support.transition&&c;if(this.$backdrop=a('<div class="modal-backdrop '+c+'" />').appendTo(document.body),this.$element.on("click.dismiss.bs.modal",a.proxy(function(a){a.target===a.currentTarget&&("static"==this.options.backdrop?this.$element[0].focus.call(this.$element[0]):this.hide.call(this))},this)),d&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in"),!b)return;d?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b).emulateTransitionEnd(150):b()):b&&b()};var c=a.fn.modal;a.fn.modal=function(c,d){return this.each(function(){var e=a(this),f=e.data("bs.modal"),g=a.extend({},b.DEFAULTS,e.data(),"object"==typeof c&&c);f||e.data("bs.modal",f=new b(this,g)),"string"==typeof c?f[c](d):g.show&&f.show(d)})},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.bs.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("bs.modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());c.is("a")&&b.preventDefault(),e.modal(f,this).one("hide",function(){c.is(":visible")&&c.focus()})}),a(document).on("show.bs.modal",".modal",function(){a(document.body).addClass("modal-open")}).on("hidden.bs.modal",".modal",function(){a(document.body).removeClass("modal-open")})}(jQuery),+function(a){"use strict";var b=function(a,b){this.type=this.options=this.enabled=this.timeout=this.hoverState=this.$element=null,this.init("tooltip",a,b)};b.DEFAULTS={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover focus",title:"",delay:0,html:!1,container:!1},b.prototype.init=function(b,c,d){this.enabled=!0,this.type=b,this.$element=a(c),this.options=this.getOptions(d);for(var e=this.options.trigger.split(" "),f=e.length;f--;){var g=e[f];if("click"==g)this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this));else if("manual"!=g){var h="hover"==g?"mouseenter":"focusin",i="hover"==g?"mouseleave":"focusout";this.$element.on(h+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(i+"."+this.type,this.options.selector,a.proxy(this.leave,this))}}this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.getOptions=function(b){return b=a.extend({},this.getDefaults(),this.$element.data(),b),b.delay&&"number"==typeof b.delay&&(b.delay={show:b.delay,hide:b.delay}),b},b.prototype.getDelegateOptions=function(){var b={},c=this.getDefaults();return this._options&&a.each(this._options,function(a,d){c[a]!=d&&(b[a]=d)}),b},b.prototype.enter=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="in",c.options.delay&&c.options.delay.show?void(c.timeout=setTimeout(function(){"in"==c.hoverState&&c.show()},c.options.delay.show)):c.show()},b.prototype.leave=function(b){var c=b instanceof this.constructor?b:a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type);return clearTimeout(c.timeout),c.hoverState="out",c.options.delay&&c.options.delay.hide?void(c.timeout=setTimeout(function(){"out"==c.hoverState&&c.hide()},c.options.delay.hide)):c.hide()},b.prototype.show=function(){var b=a.Event("show.bs."+this.type);if(this.hasContent()&&this.enabled){if(this.$element.trigger(b),b.isDefaultPrevented())return;var c=this,d=this.tip();this.setContent(),this.options.animation&&d.addClass("fade");var e="function"==typeof this.options.placement?this.options.placement.call(this,d[0],this.$element[0]):this.options.placement,f=/\s?auto?\s?/i,g=f.test(e);g&&(e=e.replace(f,"")||"top"),d.detach().css({top:0,left:0,display:"block"}).addClass(e),this.options.container?d.appendTo(this.options.container):d.insertAfter(this.$element);var h=this.getPosition(),i=d[0].offsetWidth,j=d[0].offsetHeight;if(g){var k=this.$element.parent(),l=e,m=document.documentElement.scrollTop||document.body.scrollTop,n="body"==this.options.container?window.innerWidth:k.outerWidth(),o="body"==this.options.container?window.innerHeight:k.outerHeight(),p="body"==this.options.container?0:k.offset().left;e="bottom"==e&&h.top+h.height+j-m>o?"top":"top"==e&&h.top-m-j<0?"bottom":"right"==e&&h.right+i>n?"left":"left"==e&&h.left-i<p?"right":e,d.removeClass(l).addClass(e)}var q=this.getCalculatedOffset(e,h,i,j);this.applyPlacement(q,e),this.hoverState=null;var r=function(){c.$element.trigger("shown.bs."+c.type)};a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,r).emulateTransitionEnd(150):r()}},b.prototype.applyPlacement=function(b,c){var d,e=this.tip(),f=e[0].offsetWidth,g=e[0].offsetHeight,h=parseInt(e.css("margin-top"),10),i=parseInt(e.css("margin-left"),10);isNaN(h)&&(h=0),isNaN(i)&&(i=0),b.top=b.top+h,b.left=b.left+i,a.offset.setOffset(e[0],a.extend({using:function(a){e.css({top:Math.round(a.top),left:Math.round(a.left)})}},b),0),e.addClass("in");var j=e[0].offsetWidth,k=e[0].offsetHeight;if("top"==c&&k!=g&&(d=!0,b.top=b.top+g-k),/bottom|top/.test(c)){var l=0;b.left<0&&(l=-2*b.left,b.left=0,e.offset(b),j=e[0].offsetWidth,k=e[0].offsetHeight),this.replaceArrow(l-f+j,j,"left")}else this.replaceArrow(k-g,k,"top");d&&e.offset(b)},b.prototype.replaceArrow=function(a,b,c){this.arrow().css(c,a?50*(1-a/b)+"%":"")},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},b.prototype.hide=function(){function b(){"in"!=c.hoverState&&d.detach(),c.$element.trigger("hidden.bs."+c.type)}var c=this,d=this.tip(),e=a.Event("hide.bs."+this.type);return this.$element.trigger(e),e.isDefaultPrevented()?void 0:(d.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d.one(a.support.transition.end,b).emulateTransitionEnd(150):b(),this.hoverState=null,this)},b.prototype.fixTitle=function(){var a=this.$element;(a.attr("title")||"string"!=typeof a.attr("data-original-title"))&&a.attr("data-original-title",a.attr("title")||"").attr("title","")},b.prototype.hasContent=function(){return this.getTitle()},b.prototype.getPosition=function(){var b=this.$element[0];return a.extend({},"function"==typeof b.getBoundingClientRect?b.getBoundingClientRect():{width:b.offsetWidth,height:b.offsetHeight},this.$element.offset())},b.prototype.getCalculatedOffset=function(a,b,c,d){return"bottom"==a?{top:b.top+b.height,left:b.left+b.width/2-c/2}:"top"==a?{top:b.top-d,left:b.left+b.width/2-c/2}:"left"==a?{top:b.top+b.height/2-d/2,left:b.left-c}:{top:b.top+b.height/2-d/2,left:b.left+b.width}},b.prototype.getTitle=function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||("function"==typeof c.title?c.title.call(b[0]):c.title)},b.prototype.tip=function(){return this.$tip=this.$tip||a(this.options.template)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".tooltip-arrow")},b.prototype.validate=function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},b.prototype.enable=function(){this.enabled=!0},b.prototype.disable=function(){this.enabled=!1},b.prototype.toggleEnabled=function(){this.enabled=!this.enabled},b.prototype.toggle=function(b){var c=b?a(b.currentTarget)[this.type](this.getDelegateOptions()).data("bs."+this.type):this;c.tip().hasClass("in")?c.leave(c):c.enter(c)},b.prototype.destroy=function(){clearTimeout(this.timeout),this.hide().$element.off("."+this.type).removeData("bs."+this.type)};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tooltip"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.tooltip",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.tooltip.Constructor=b,a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}(jQuery),+function(a){"use strict";var b=function(a,b){this.init("popover",a,b)};if(!a.fn.tooltip)throw new Error("Popover requires tooltip.js");b.DEFAULTS=a.extend({},a.fn.tooltip.Constructor.DEFAULTS,{placement:"right",trigger:"click",content:"",template:'<div class="popover"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'}),b.prototype=a.extend({},a.fn.tooltip.Constructor.prototype),b.prototype.constructor=b,b.prototype.getDefaults=function(){return b.DEFAULTS},b.prototype.setContent=function(){var a=this.tip(),b=this.getTitle(),c=this.getContent();a.find(".popover-title")[this.options.html?"html":"text"](b),a.find(".popover-content")[this.options.html?"string"==typeof c?"html":"append":"text"](c),a.removeClass("fade top bottom left right in"),a.find(".popover-title").html()||a.find(".popover-title").hide()},b.prototype.hasContent=function(){return this.getTitle()||this.getContent()},b.prototype.getContent=function(){var a=this.$element,b=this.options;return a.attr("data-content")||("function"==typeof b.content?b.content.call(a[0]):b.content)},b.prototype.arrow=function(){return this.$arrow=this.$arrow||this.tip().find(".arrow")},b.prototype.tip=function(){return this.$tip||(this.$tip=a(this.options.template)),this.$tip};var c=a.fn.popover;a.fn.popover=function(c){return this.each(function(){var d=a(this),e=d.data("bs.popover"),f="object"==typeof c&&c;(e||"destroy"!=c)&&(e||d.data("bs.popover",e=new b(this,f)),"string"==typeof c&&e[c]())})},a.fn.popover.Constructor=b,a.fn.popover.noConflict=function(){return a.fn.popover=c,this}}(jQuery),+function(a){"use strict";function b(c,d){var e,f=a.proxy(this.process,this);this.$element=a(a(c).is("body")?window:c),this.$body=a("body"),this.$scrollElement=this.$element.on("scroll.bs.scroll-spy.data-api",f),this.options=a.extend({},b.DEFAULTS,d),this.selector=(this.options.target||(e=a(c).attr("href"))&&e.replace(/.*(?=#[^\s]+$)/,"")||"")+" .nav li > a",this.offsets=a([]),this.targets=a([]),this.activeTarget=null,this.refresh(),this.process()}b.DEFAULTS={offset:10},b.prototype.refresh=function(){var b=this.$element[0]==window?"offset":"position";this.offsets=a([]),this.targets=a([]);{var c=this;this.$body.find(this.selector).map(function(){var d=a(this),e=d.data("target")||d.attr("href"),f=/^#./.test(e)&&a(e);return f&&f.length&&f.is(":visible")&&[[f[b]().top+(!a.isWindow(c.$scrollElement.get(0))&&c.$scrollElement.scrollTop()),e]]||null}).sort(function(a,b){return a[0]-b[0]}).each(function(){c.offsets.push(this[0]),c.targets.push(this[1])})}},b.prototype.process=function(){var a,b=this.$scrollElement.scrollTop()+this.options.offset,c=this.$scrollElement[0].scrollHeight||this.$body[0].scrollHeight,d=c-this.$scrollElement.height(),e=this.offsets,f=this.targets,g=this.activeTarget;if(b>=d)return g!=(a=f.last()[0])&&this.activate(a);if(g&&b<=e[0])return g!=(a=f[0])&&this.activate(a);for(a=e.length;a--;)g!=f[a]&&b>=e[a]&&(!e[a+1]||b<=e[a+1])&&this.activate(f[a])},b.prototype.activate=function(b){this.activeTarget=b,a(this.selector).parentsUntil(this.options.target,".active").removeClass("active");var c=this.selector+'[data-target="'+b+'"],'+this.selector+'[href="'+b+'"]',d=a(c).parents("li").addClass("active");d.parent(".dropdown-menu").length&&(d=d.closest("li.dropdown").addClass("active")),d.trigger("activate.bs.scrollspy")};var c=a.fn.scrollspy;a.fn.scrollspy=function(c){return this.each(function(){var d=a(this),e=d.data("bs.scrollspy"),f="object"==typeof c&&c;e||d.data("bs.scrollspy",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.scrollspy.Constructor=b,a.fn.scrollspy.noConflict=function(){return a.fn.scrollspy=c,this},a(window).on("load",function(){a('[data-spy="scroll"]').each(function(){var b=a(this);b.scrollspy(b.data())})})}(jQuery),+function(a){"use strict";var b=function(b){this.element=a(b)};b.prototype.show=function(){var b=this.element,c=b.closest("ul:not(.dropdown-menu)"),d=b.data("target");if(d||(d=b.attr("href"),d=d&&d.replace(/.*(?=#[^\s]*$)/,"")),!b.parent("li").hasClass("active")){var e=c.find(".active:last a")[0],f=a.Event("show.bs.tab",{relatedTarget:e});if(b.trigger(f),!f.isDefaultPrevented()){var g=a(d);this.activate(b.parent("li"),c),this.activate(g,g.parent(),function(){b.trigger({type:"shown.bs.tab",relatedTarget:e})})}}},b.prototype.activate=function(b,c,d){function e(){f.removeClass("active").find("> .dropdown-menu > .active").removeClass("active"),b.addClass("active"),g?(b[0].offsetWidth,b.addClass("in")):b.removeClass("fade"),b.parent(".dropdown-menu")&&b.closest("li.dropdown").addClass("active"),d&&d()}var f=c.find("> .active"),g=d&&a.support.transition&&f.hasClass("fade");g?f.one(a.support.transition.end,e).emulateTransitionEnd(150):e(),f.removeClass("in")};var c=a.fn.tab;a.fn.tab=function(c){return this.each(function(){var d=a(this),e=d.data("bs.tab");e||d.data("bs.tab",e=new b(this)),"string"==typeof c&&e[c]()})},a.fn.tab.Constructor=b,a.fn.tab.noConflict=function(){return a.fn.tab=c,this},a(document).on("click.bs.tab.data-api",'[data-toggle="tab"], [data-toggle="pill"]',function(b){b.preventDefault(),a(this).tab("show")})}(jQuery),+function(a){"use strict";var b=function(c,d){this.options=a.extend({},b.DEFAULTS,d),this.$window=a(window).on("scroll.bs.affix.data-api",a.proxy(this.checkPosition,this)).on("click.bs.affix.data-api",a.proxy(this.checkPositionWithEventLoop,this)),this.$element=a(c),this.affixed=this.unpin=this.pinnedOffset=null,this.checkPosition()};b.RESET="affix affix-top affix-bottom",b.DEFAULTS={offset:0},b.prototype.getPinnedOffset=function(){if(this.pinnedOffset)return this.pinnedOffset;this.$element.removeClass(b.RESET).addClass("affix");var a=this.$window.scrollTop(),c=this.$element.offset();return this.pinnedOffset=c.top-a},b.prototype.checkPositionWithEventLoop=function(){setTimeout(a.proxy(this.checkPosition,this),1)},b.prototype.checkPosition=function(){if(this.$element.is(":visible")){var c=a(document).height(),d=this.$window.scrollTop(),e=this.$element.offset(),f=this.options.offset,g=f.top,h=f.bottom;"top"==this.affixed&&(e.top+=d),"object"!=typeof f&&(h=g=f),"function"==typeof g&&(g=f.top(this.$element)),"function"==typeof h&&(h=f.bottom(this.$element));var i=null!=this.unpin&&d+this.unpin<=e.top?!1:null!=h&&e.top+this.$element.height()>=c-h?"bottom":null!=g&&g>=d?"top":!1;if(this.affixed!==i){this.unpin&&this.$element.css("top","");var j="affix"+(i?"-"+i:""),k=a.Event(j+".bs.affix");this.$element.trigger(k),k.isDefaultPrevented()||(this.affixed=i,this.unpin="bottom"==i?this.getPinnedOffset():null,this.$element.removeClass(b.RESET).addClass(j).trigger(a.Event(j.replace("affix","affixed"))),"bottom"==i&&this.$element.offset({top:c-h-this.$element.height()}))}}};var c=a.fn.affix;a.fn.affix=function(c){return this.each(function(){var d=a(this),e=d.data("bs.affix"),f="object"==typeof c&&c;e||d.data("bs.affix",e=new b(this,f)),"string"==typeof c&&e[c]()})},a.fn.affix.Constructor=b,a.fn.affix.noConflict=function(){return a.fn.affix=c,this},a(window).on("load",function(){a('[data-spy="affix"]').each(function(){var b=a(this),c=b.data();c.offset=c.offset||{},c.offsetBottom&&(c.offset.bottom=c.offsetBottom),c.offsetTop&&(c.offset.top=c.offsetTop),b.affix(c)})})}(jQuery);
define("bgpst.lib.bootstrap", function(){});

/* =========================================================
 * bootstrap-datetimepicker.js
 * =========================================================
 * Copyright 2012 Stefan Petre
 *
 * Improvements by Andrew Rowls
 * Improvements by Sébastien Malot
 * Improvements by Yun Lai
 * Improvements by Kenneth Henderick
 * Improvements by CuGBabyBeaR
 * Improvements by Christian Vaas <auspex@auspex.eu>
 *
 * Project URL : http://www.malot.fr/bootstrap-datetimepicker
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================= */

(function(factory){
    if (typeof define === 'function' && define.amd)
        define('bgpst.lib.bootstrap.datetimepicker',['jquery'], factory);
    else if (typeof exports === 'object')
        factory(require('jquery'));
    else
        factory(jQuery);

}(function($, undefined){

    // Add ECMA262-5 Array methods if not supported natively (IE8)
    if (!('indexOf' in Array.prototype)) {
        Array.prototype.indexOf = function (find, i) {
            if (i === undefined) i = 0;
            if (i < 0) i += this.length;
            if (i < 0) i = 0;
            for (var n = this.length; i < n; i++) {
                if (i in this && this[i] === find) {
                    return i;
                }
            }
            return -1;
        }
    }

    function elementOrParentIsFixed (element) {
        var $element = $(element);
        var $checkElements = $element.add($element.parents());
        var isFixed = false;
        $checkElements.each(function(){
            if ($(this).css('position') === 'fixed') {
                isFixed = true;
                return false;
            }
        });
        return isFixed;
    }

    function UTCDate() {
        return new Date(Date.UTC.apply(Date, arguments));
    }

    function UTCToday() {
        var today = new Date();
        return UTCDate(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), today.getUTCHours(), today.getUTCMinutes(), today.getUTCSeconds(), 0);
    }

    // Picker object
    var Datetimepicker = function (element, options) {
        var that = this;

        this.element = $(element);

        // add container for single page application
        // when page switch the datetimepicker div will be removed also.
        this.container = options.container || 'body';

        this.language = options.language || this.element.data('date-language') || 'en';
        this.language = this.language in dates ? this.language : this.language.split('-')[0]; // fr-CA fallback to fr
        this.language = this.language in dates ? this.language : 'en';
        this.isRTL = dates[this.language].rtl || false;
        this.formatType = options.formatType || this.element.data('format-type') || 'standard';
        this.format = DPGlobal.parseFormat(options.format || this.element.data('date-format') || dates[this.language].format || DPGlobal.getDefaultFormat(this.formatType, 'input'), this.formatType);
        this.isInline = false;
        this.isVisible = false;
        this.isInput = this.element.is('input');
        this.fontAwesome = options.fontAwesome || this.element.data('font-awesome') || false;

        this.bootcssVer = options.bootcssVer || (this.isInput ? (this.element.is('.form-control') ? 3 : 2) : ( this.bootcssVer = this.element.is('.input-group') ? 3 : 2 ));

        this.component = this.element.is('.date') ? ( this.bootcssVer == 3 ? this.element.find('.input-group-addon .glyphicon-th, .input-group-addon .glyphicon-time, .input-group-addon .glyphicon-remove, .input-group-addon .glyphicon-calendar, .input-group-addon .fa-calendar, .input-group-addon .fa-clock-o').parent() : this.element.find('.add-on .icon-th, .add-on .icon-time, .add-on .icon-calendar, .add-on .fa-calendar, .add-on .fa-clock-o').parent()) : false;
        this.componentReset = this.element.is('.date') ? ( this.bootcssVer == 3 ? this.element.find('.input-group-addon .glyphicon-remove, .input-group-addon .fa-times').parent():this.element.find('.add-on .icon-remove, .add-on .fa-times').parent()) : false;
        this.hasInput = this.component && this.element.find('input').length;
        if (this.component && this.component.length === 0) {
            this.component = false;
        }
        this.linkField = options.linkField || this.element.data('link-field') || false;
        this.linkFormat = DPGlobal.parseFormat(options.linkFormat || this.element.data('link-format') || DPGlobal.getDefaultFormat(this.formatType, 'link'), this.formatType);
        this.minuteStep = options.minuteStep || this.element.data('minute-step') || 5;
        this.pickerPosition = options.pickerPosition || this.element.data('picker-position') || 'bottom-right';
        this.showMeridian = options.showMeridian || this.element.data('show-meridian') || false;
        this.initialDate = options.initialDate || new Date();
        this.zIndex = options.zIndex || this.element.data('z-index') || undefined;
        this.title = typeof options.title === 'undefined' ? false : options.title;
        this.defaultTimeZone = (new Date).toString().split('(')[1].slice(0, -1);
        this.timezone = options.timezone || this.defaultTimeZone;

        this.icons = {
            leftArrow: this.fontAwesome ? 'fa-arrow-left' : (this.bootcssVer === 3 ? 'glyphicon-arrow-left' : 'icon-arrow-left'),
            rightArrow: this.fontAwesome ? 'fa-arrow-right' : (this.bootcssVer === 3 ? 'glyphicon-arrow-right' : 'icon-arrow-right')
        }
        this.icontype = this.fontAwesome ? 'fa' : 'glyphicon';

        this._attachEvents();

        this.clickedOutside = function (e) {
            // Clicked outside the datetimepicker, hide it
            if ($(e.target).closest('.datetimepicker').length === 0) {
                that.hide();
            }
        }

        this.formatViewType = 'datetime';
        if ('formatViewType' in options) {
            this.formatViewType = options.formatViewType;
        } else if ('formatViewType' in this.element.data()) {
            this.formatViewType = this.element.data('formatViewType');
        }

        this.minView = 0;
        if ('minView' in options) {
            this.minView = options.minView;
        } else if ('minView' in this.element.data()) {
            this.minView = this.element.data('min-view');
        }
        this.minView = DPGlobal.convertViewMode(this.minView);

        this.maxView = DPGlobal.modes.length - 1;
        if ('maxView' in options) {
            this.maxView = options.maxView;
        } else if ('maxView' in this.element.data()) {
            this.maxView = this.element.data('max-view');
        }
        this.maxView = DPGlobal.convertViewMode(this.maxView);

        this.wheelViewModeNavigation = false;
        if ('wheelViewModeNavigation' in options) {
            this.wheelViewModeNavigation = options.wheelViewModeNavigation;
        } else if ('wheelViewModeNavigation' in this.element.data()) {
            this.wheelViewModeNavigation = this.element.data('view-mode-wheel-navigation');
        }

        this.wheelViewModeNavigationInverseDirection = false;

        if ('wheelViewModeNavigationInverseDirection' in options) {
            this.wheelViewModeNavigationInverseDirection = options.wheelViewModeNavigationInverseDirection;
        } else if ('wheelViewModeNavigationInverseDirection' in this.element.data()) {
            this.wheelViewModeNavigationInverseDirection = this.element.data('view-mode-wheel-navigation-inverse-dir');
        }

        this.wheelViewModeNavigationDelay = 100;
        if ('wheelViewModeNavigationDelay' in options) {
            this.wheelViewModeNavigationDelay = options.wheelViewModeNavigationDelay;
        } else if ('wheelViewModeNavigationDelay' in this.element.data()) {
            this.wheelViewModeNavigationDelay = this.element.data('view-mode-wheel-navigation-delay');
        }

        this.startViewMode = 2;
        if ('startView' in options) {
            this.startViewMode = options.startView;
        } else if ('startView' in this.element.data()) {
            this.startViewMode = this.element.data('start-view');
        }
        this.startViewMode = DPGlobal.convertViewMode(this.startViewMode);
        this.viewMode = this.startViewMode;

        this.viewSelect = this.minView;
        if ('viewSelect' in options) {
            this.viewSelect = options.viewSelect;
        } else if ('viewSelect' in this.element.data()) {
            this.viewSelect = this.element.data('view-select');
        }
        this.viewSelect = DPGlobal.convertViewMode(this.viewSelect);

        this.forceParse = true;
        if ('forceParse' in options) {
            this.forceParse = options.forceParse;
        } else if ('dateForceParse' in this.element.data()) {
            this.forceParse = this.element.data('date-force-parse');
        }
        var template = this.bootcssVer === 3 ? DPGlobal.templateV3 : DPGlobal.template;
        while (template.indexOf('{iconType}') !== -1) {
            template = template.replace('{iconType}', this.icontype);
        }
        while (template.indexOf('{leftArrow}') !== -1) {
            template = template.replace('{leftArrow}', this.icons.leftArrow);
        }
        while (template.indexOf('{rightArrow}') !== -1) {
            template = template.replace('{rightArrow}', this.icons.rightArrow);
        }
        this.picker = $(template)
            .appendTo(this.isInline ? this.element : this.container) // 'body')
            .on({
                click:     $.proxy(this.click, this),
                mousedown: $.proxy(this.mousedown, this)
            });

        if (this.wheelViewModeNavigation) {
            if ($.fn.mousewheel) {
                this.picker.on({mousewheel: $.proxy(this.mousewheel, this)});
            } else {
                console.log('Mouse Wheel event is not supported. Please include the jQuery Mouse Wheel plugin before enabling this option');
            }
        }

        if (this.isInline) {
            this.picker.addClass('datetimepicker-inline');
        } else {
            this.picker.addClass('datetimepicker-dropdown-' + this.pickerPosition + ' dropdown-menu');
        }
        if (this.isRTL) {
            this.picker.addClass('datetimepicker-rtl');
            var selector = this.bootcssVer === 3 ? '.prev span, .next span' : '.prev i, .next i';
            this.picker.find(selector).toggleClass(this.icons.leftArrow + ' ' + this.icons.rightArrow);
        }

        $(document).on('mousedown', this.clickedOutside);

        this.autoclose = false;
        if ('autoclose' in options) {
            this.autoclose = options.autoclose;
        } else if ('dateAutoclose' in this.element.data()) {
            this.autoclose = this.element.data('date-autoclose');
        }

        this.keyboardNavigation = true;
        if ('keyboardNavigation' in options) {
            this.keyboardNavigation = options.keyboardNavigation;
        } else if ('dateKeyboardNavigation' in this.element.data()) {
            this.keyboardNavigation = this.element.data('date-keyboard-navigation');
        }

        this.todayBtn = (options.todayBtn || this.element.data('date-today-btn') || false);
        this.clearBtn = (options.clearBtn || this.element.data('date-clear-btn') || false);
        this.todayHighlight = (options.todayHighlight || this.element.data('date-today-highlight') || false);

        this.weekStart = ((options.weekStart || this.element.data('date-weekstart') || dates[this.language].weekStart || 0) % 7);
        this.weekEnd = ((this.weekStart + 6) % 7);
        this.startDate = -Infinity;
        this.endDate = Infinity;
        this.datesDisabled = [];
        this.daysOfWeekDisabled = [];
        this.setStartDate(options.startDate || this.element.data('date-startdate'));
        this.setEndDate(options.endDate || this.element.data('date-enddate'));
        this.setDatesDisabled(options.datesDisabled || this.element.data('date-dates-disabled'));
        this.setDaysOfWeekDisabled(options.daysOfWeekDisabled || this.element.data('date-days-of-week-disabled'));
        this.setMinutesDisabled(options.minutesDisabled || this.element.data('date-minute-disabled'));
        this.setHoursDisabled(options.hoursDisabled || this.element.data('date-hour-disabled'));
        this.fillDow();
        this.fillMonths();
        this.update();
        this.showMode();

        if (this.isInline) {
            this.show();
        }
    };

    Datetimepicker.prototype = {
        constructor: Datetimepicker,

        _events:       [],
        _attachEvents: function () {
            this._detachEvents();
            if (this.isInput) { // single input
                this._events = [
                    [this.element, {
                        focus:   $.proxy(this.show, this),
                        keyup:   $.proxy(this.update, this),
                        keydown: $.proxy(this.keydown, this)
                    }]
                ];
            }
            else if (this.component && this.hasInput) { // component: input + button
                this._events = [
                    // For components that are not readonly, allow keyboard nav
                    [this.element.find('input'), {
                        focus:   $.proxy(this.show, this),
                        keyup:   $.proxy(this.update, this),
                        keydown: $.proxy(this.keydown, this)
                    }],
                    [this.component, {
                        click: $.proxy(this.show, this)
                    }]
                ];
                if (this.componentReset) {
                    this._events.push([
                        this.componentReset,
                        {click: $.proxy(this.reset, this)}
                    ]);
                }
            }
            else if (this.element.is('div')) {  // inline datetimepicker
                this.isInline = true;
            }
            else {
                this._events = [
                    [this.element, {
                        click: $.proxy(this.show, this)
                    }]
                ];
            }
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.on(ev);
            }
        },

        _detachEvents: function () {
            for (var i = 0, el, ev; i < this._events.length; i++) {
                el = this._events[i][0];
                ev = this._events[i][1];
                el.off(ev);
            }
            this._events = [];
        },

        show: function (e) {
            this.picker.show();
            this.height = this.component ? this.component.outerHeight() : this.element.outerHeight();
            if (this.forceParse) {
                this.update();
            }
            this.place();
            $(window).on('resize', $.proxy(this.place, this));
            if (e) {
                e.stopPropagation();
                e.preventDefault();
            }
            this.isVisible = true;
            this.element.trigger({
                type: 'show',
                date: this.date
            });
        },

        hide: function (e) {
            if (!this.isVisible) return;
            if (this.isInline) return;
            this.picker.hide();
            $(window).off('resize', this.place);
            this.viewMode = this.startViewMode;
            this.showMode();
            if (!this.isInput) {
                $(document).off('mousedown', this.hide);
            }

            if (
                this.forceParse &&
                (
                    this.isInput && this.element.val() ||
                    this.hasInput && this.element.find('input').val()
                )
            )
                this.setValue();
            this.isVisible = false;
            this.element.trigger({
                type: 'hide',
                date: this.date
            });
        },

        remove: function () {
            this._detachEvents();
            $(document).off('mousedown', this.clickedOutside);
            this.picker.remove();
            delete this.picker;
            delete this.element.data().datetimepicker;
        },

        getDate: function () {
            var d = this.getUTCDate();
            return new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
        },

        getUTCDate: function () {
            return this.date;
        },

        getInitialDate: function () {
            return this.initialDate
        },

        setInitialDate: function (initialDate) {
            this.initialDate = initialDate;
        },

        setDate: function (d) {
            this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
        },

        setUTCDate: function (d) {
            if (d >= this.startDate && d <= this.endDate) {
                this.date = d;
                this.setValue();
                this.viewDate = this.date;
                this.fill();
            } else {
                this.element.trigger({
                    type:      'outOfRange',
                    date:      d,
                    startDate: this.startDate,
                    endDate:   this.endDate
                });
            }
        },

        setFormat: function (format) {
            this.format = DPGlobal.parseFormat(format, this.formatType);
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element && element.val()) {
                this.setValue();
            }
        },

        setValue: function () {
            var formatted = this.getFormattedDate();
            if (!this.isInput) {
                if (this.component) {
                    this.element.find('input').val(formatted);
                }
                this.element.data('date', formatted);
            } else {
                this.element.val(formatted);
            }
            if (this.linkField) {
                $('#' + this.linkField).val(this.getFormattedDate(this.linkFormat));
            }
        },

        getFormattedDate: function (format) {
            if (format == undefined) format = this.format;
            return DPGlobal.formatDate(this.date, format, this.language, this.formatType, this.timezone);
        },

        setStartDate: function (startDate) {
            this.startDate = startDate || -Infinity;
            if (this.startDate !== -Infinity) {
                this.startDate = DPGlobal.parseDate(this.startDate, this.format, this.language, this.formatType, this.timezone);
            }
            this.update();
            this.updateNavArrows();
        },

        setEndDate: function (endDate) {
            this.endDate = endDate || Infinity;
            if (this.endDate !== Infinity) {
                this.endDate = DPGlobal.parseDate(this.endDate, this.format, this.language, this.formatType, this.timezone);
            }
            this.update();
            this.updateNavArrows();
        },

        setDatesDisabled: function (datesDisabled) {
            this.datesDisabled = datesDisabled || [];
            if (!$.isArray(this.datesDisabled)) {
                this.datesDisabled = this.datesDisabled.split(/,\s*/);
            }
            this.datesDisabled = $.map(this.datesDisabled, function (d) {
                return DPGlobal.parseDate(d, this.format, this.language, this.formatType, this.timezone).toDateString();
            });
            this.update();
            this.updateNavArrows();
        },

        setTitle: function (selector, value) {
            return this.picker.find(selector)
                .find('th:eq(1)')
                .text(this.title === false ? value : this.title);
        },

        setDaysOfWeekDisabled: function (daysOfWeekDisabled) {
            this.daysOfWeekDisabled = daysOfWeekDisabled || [];
            if (!$.isArray(this.daysOfWeekDisabled)) {
                this.daysOfWeekDisabled = this.daysOfWeekDisabled.split(/,\s*/);
            }
            this.daysOfWeekDisabled = $.map(this.daysOfWeekDisabled, function (d) {
                return parseInt(d, 10);
            });
            this.update();
            this.updateNavArrows();
        },

        setMinutesDisabled: function (minutesDisabled) {
            this.minutesDisabled = minutesDisabled || [];
            if (!$.isArray(this.minutesDisabled)) {
                this.minutesDisabled = this.minutesDisabled.split(/,\s*/);
            }
            this.minutesDisabled = $.map(this.minutesDisabled, function (d) {
                return parseInt(d, 10);
            });
            this.update();
            this.updateNavArrows();
        },

        setHoursDisabled: function (hoursDisabled) {
            this.hoursDisabled = hoursDisabled || [];
            if (!$.isArray(this.hoursDisabled)) {
                this.hoursDisabled = this.hoursDisabled.split(/,\s*/);
            }
            this.hoursDisabled = $.map(this.hoursDisabled, function (d) {
                return parseInt(d, 10);
            });
            this.update();
            this.updateNavArrows();
        },

        place: function () {
            if (this.isInline) return;

            if (!this.zIndex) {
                var index_highest = 0;
                $('div').each(function () {
                    var index_current = parseInt($(this).css('zIndex'), 10);
                    if (index_current > index_highest) {
                        index_highest = index_current;
                    }
                });
                this.zIndex = index_highest + 10;
            }

            var offset, top, left, containerOffset;
            if (this.container instanceof $) {
                containerOffset = this.container.offset();
            } else {
                containerOffset = $(this.container).offset();
            }

            if (this.component) {
                offset = this.component.offset();
                left = offset.left;
                if (this.pickerPosition == 'bottom-left' || this.pickerPosition == 'top-left') {
                    left += this.component.outerWidth() - this.picker.outerWidth();
                }
            } else {
                offset = this.element.offset();
                left = offset.left;
                if (this.pickerPosition == 'bottom-left' || this.pickerPosition == 'top-left') {
                    left += this.element.outerWidth() - this.picker.outerWidth();
                }
            }

            var bodyWidth = document.body.clientWidth || window.innerWidth;
            if (left + 220 > bodyWidth) {
                left = bodyWidth - 220;
            }

            if (this.pickerPosition == 'top-left' || this.pickerPosition == 'top-right') {
                top = offset.top - this.picker.outerHeight();
            } else {
                top = offset.top + this.height;
            }

            top = top - containerOffset.top;
            left = left - containerOffset.left;

            this.picker.css({
                top:    top,
                left:   left,
                zIndex: this.zIndex
            });
        },

        update: function () {
            var date, fromArgs = false;
            if (arguments && arguments.length && (typeof arguments[0] === 'string' || arguments[0] instanceof Date)) {
                date = arguments[0];
                fromArgs = true;
            } else {
                date = (this.isInput ? this.element.val() : this.element.find('input').val()) || this.element.data('date') || this.initialDate;
                if (typeof date == 'string' || date instanceof String) {
                    date = date.replace(/^\s+|\s+$/g,'');
                }
            }

            if (!date) {
                date = new Date();
                fromArgs = false;
            }

            this.date = DPGlobal.parseDate(date, this.format, this.language, this.formatType, this.timezone);

            if (fromArgs) this.setValue();

            if (this.date < this.startDate) {
                this.viewDate = new Date(this.startDate);
            } else if (this.date > this.endDate) {
                this.viewDate = new Date(this.endDate);
            } else {
                this.viewDate = new Date(this.date);
            }
            this.fill();
        },

        fillDow: function () {
            var dowCnt = this.weekStart,
                html = '<tr>';
            while (dowCnt < this.weekStart + 7) {
                html += '<th class="dow">' + dates[this.language].daysMin[(dowCnt++) % 7] + '</th>';
            }
            html += '</tr>';
            this.picker.find('.datetimepicker-days thead').append(html);
        },

        fillMonths: function () {
            var html = '',
                i = 0;
            while (i < 12) {
                html += '<span class="month">' + dates[this.language].monthsShort[i++] + '</span>';
            }
            this.picker.find('.datetimepicker-months td').html(html);
        },

        fill: function () {
            if (this.date == null || this.viewDate == null) {
                return;
            }
            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                dayMonth = d.getUTCDate(),
                hours = d.getUTCHours(),
                minutes = d.getUTCMinutes(),
                startYear = this.startDate !== -Infinity ? this.startDate.getUTCFullYear() : -Infinity,
                startMonth = this.startDate !== -Infinity ? this.startDate.getUTCMonth() : -Infinity,
                endYear = this.endDate !== Infinity ? this.endDate.getUTCFullYear() : Infinity,
                endMonth = this.endDate !== Infinity ? this.endDate.getUTCMonth() + 1 : Infinity,
                currentDate = (new UTCDate(this.date.getUTCFullYear(), this.date.getUTCMonth(), this.date.getUTCDate())).valueOf(),
                today = new Date();
            this.setTitle('.datetimepicker-days', dates[this.language].months[month] + ' ' + year)
            if (this.formatViewType == 'time') {
                var formatted = this.getFormattedDate();
                this.setTitle('.datetimepicker-hours', formatted);
                this.setTitle('.datetimepicker-minutes', formatted);
            } else {
                this.setTitle('.datetimepicker-hours', dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
                this.setTitle('.datetimepicker-minutes', dayMonth + ' ' + dates[this.language].months[month] + ' ' + year);
            }
            this.picker.find('tfoot th.today')
                .text(dates[this.language].today || dates['en'].today)
                .toggle(this.todayBtn !== false);
            this.picker.find('tfoot th.clear')
                .text(dates[this.language].clear || dates['en'].clear)
                .toggle(this.clearBtn !== false);
            this.updateNavArrows();
            this.fillMonths();
            /*var prevMonth = UTCDate(year, month, 0,0,0,0,0);
             prevMonth.setUTCDate(prevMonth.getDate() - (prevMonth.getUTCDay() - this.weekStart + 7)%7);*/
            var prevMonth = UTCDate(year, month - 1, 28, 0, 0, 0, 0),
                day = DPGlobal.getDaysInMonth(prevMonth.getUTCFullYear(), prevMonth.getUTCMonth());
            prevMonth.setUTCDate(day);
            prevMonth.setUTCDate(day - (prevMonth.getUTCDay() - this.weekStart + 7) % 7);
            var nextMonth = new Date(prevMonth);
            nextMonth.setUTCDate(nextMonth.getUTCDate() + 42);
            nextMonth = nextMonth.valueOf();
            var html = [];
            var clsName;
            while (prevMonth.valueOf() < nextMonth) {
                if (prevMonth.getUTCDay() == this.weekStart) {
                    html.push('<tr>');
                }
                clsName = '';
                if (prevMonth.getUTCFullYear() < year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() < month)) {
                    clsName += ' old';
                } else if (prevMonth.getUTCFullYear() > year || (prevMonth.getUTCFullYear() == year && prevMonth.getUTCMonth() > month)) {
                    clsName += ' new';
                }
                // Compare internal UTC date with local today, not UTC today
                if (this.todayHighlight &&
                    prevMonth.getUTCFullYear() == today.getFullYear() &&
                    prevMonth.getUTCMonth() == today.getMonth() &&
                    prevMonth.getUTCDate() == today.getDate()) {
                    clsName += ' today';
                }
                if (prevMonth.valueOf() == currentDate) {
                    clsName += ' active';
                }
                if ((prevMonth.valueOf() + 86400000) <= this.startDate || prevMonth.valueOf() > this.endDate ||
                    $.inArray(prevMonth.getUTCDay(), this.daysOfWeekDisabled) !== -1 ||
                    $.inArray(prevMonth.toDateString(), this.datesDisabled) !== -1) {
                    clsName += ' disabled';
                }
                html.push('<td class="day' + clsName + '">' + prevMonth.getUTCDate() + '</td>');
                if (prevMonth.getUTCDay() == this.weekEnd) {
                    html.push('</tr>');
                }
                prevMonth.setUTCDate(prevMonth.getUTCDate() + 1);
            }
            this.picker.find('.datetimepicker-days tbody').empty().append(html.join(''));

            html = [];
            var txt = '', meridian = '', meridianOld = '';
            var hoursDisabled = this.hoursDisabled || [];
            for (var i = 0; i < 24; i++) {
                if (hoursDisabled.indexOf(i) !== -1) continue;
                var actual = UTCDate(year, month, dayMonth, i);
                clsName = '';
                // We want the previous hour for the startDate
                if ((actual.valueOf() + 3600000) <= this.startDate || actual.valueOf() > this.endDate) {
                    clsName += ' disabled';
                } else if (hours == i) {
                    clsName += ' active';
                }
                if (this.showMeridian && dates[this.language].meridiem.length == 2) {
                    meridian = (i < 12 ? dates[this.language].meridiem[0] : dates[this.language].meridiem[1]);
                    if (meridian != meridianOld) {
                        if (meridianOld != '') {
                            html.push('</fieldset>');
                        }
                        html.push('<fieldset class="hour"><legend>' + meridian.toUpperCase() + '</legend>');
                    }
                    meridianOld = meridian;
                    txt = (i % 12 ? i % 12 : 12);
                    html.push('<span class="hour' + clsName + ' hour_' + (i < 12 ? 'am' : 'pm') + '">' + txt + '</span>');
                    if (i == 23) {
                        html.push('</fieldset>');
                    }
                } else {
                    txt = i + ':00';
                    html.push('<span class="hour' + clsName + '">' + txt + '</span>');
                }
            }
            this.picker.find('.datetimepicker-hours td').html(html.join(''));

            html = [];
            txt = '', meridian = '', meridianOld = '';
            var minutesDisabled = this.minutesDisabled || [];
            for (var i = 0; i < 60; i += this.minuteStep) {
                if (minutesDisabled.indexOf(i) !== -1) continue;
                var actual = UTCDate(year, month, dayMonth, hours, i, 0);
                clsName = '';
                if (actual.valueOf() < this.startDate || actual.valueOf() > this.endDate) {
                    clsName += ' disabled';
                } else if (Math.floor(minutes / this.minuteStep) == Math.floor(i / this.minuteStep)) {
                    clsName += ' active';
                }
                if (this.showMeridian && dates[this.language].meridiem.length == 2) {
                    meridian = (hours < 12 ? dates[this.language].meridiem[0] : dates[this.language].meridiem[1]);
                    if (meridian != meridianOld) {
                        if (meridianOld != '') {
                            html.push('</fieldset>');
                        }
                        html.push('<fieldset class="minute"><legend>' + meridian.toUpperCase() + '</legend>');
                    }
                    meridianOld = meridian;
                    txt = (hours % 12 ? hours % 12 : 12);
                    //html.push('<span class="minute'+clsName+' minute_'+(hours<12?'am':'pm')+'">'+txt+'</span>');
                    html.push('<span class="minute' + clsName + '">' + txt + ':' + (i < 10 ? '0' + i : i) + '</span>');
                    if (i == 59) {
                        html.push('</fieldset>');
                    }
                } else {
                    txt = i + ':00';
                    //html.push('<span class="hour'+clsName+'">'+txt+'</span>');
                    html.push('<span class="minute' + clsName + '">' + hours + ':' + (i < 10 ? '0' + i : i) + '</span>');
                }
            }
            this.picker.find('.datetimepicker-minutes td').html(html.join(''));

            var currentYear = this.date.getUTCFullYear();
            var months = this.setTitle('.datetimepicker-months', year)
                .end()
                .find('span').removeClass('active');
            if (currentYear == year) {
                // getUTCMonths() returns 0 based, and we need to select the next one
                // To cater bootstrap 2 we don't need to select the next one
                var offset = months.length - 12;
                months.eq(this.date.getUTCMonth() + offset).addClass('active');
            }
            if (year < startYear || year > endYear) {
                months.addClass('disabled');
            }
            if (year == startYear) {
                months.slice(0, startMonth).addClass('disabled');
            }
            if (year == endYear) {
                months.slice(endMonth).addClass('disabled');
            }

            html = '';
            year = parseInt(year / 10, 10) * 10;
            var yearCont = this.setTitle('.datetimepicker-years', year + '-' + (year + 9))
                .end()
                .find('td');
            year -= 1;
            for (var i = -1; i < 11; i++) {
                html += '<span class="year' + (i == -1 || i == 10 ? ' old' : '') + (currentYear == year ? ' active' : '') + (year < startYear || year > endYear ? ' disabled' : '') + '">' + year + '</span>';
                year += 1;
            }
            yearCont.html(html);
            this.place();
        },

        updateNavArrows: function () {
            var d = new Date(this.viewDate),
                year = d.getUTCFullYear(),
                month = d.getUTCMonth(),
                day = d.getUTCDate(),
                hour = d.getUTCHours();
            switch (this.viewMode) {
                case 0:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()
                        && month <= this.startDate.getUTCMonth()
                        && day <= this.startDate.getUTCDate()
                        && hour <= this.startDate.getUTCHours()) {
                        this.picker.find('.prev').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.prev').css({visibility: 'visible'});
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()
                        && month >= this.endDate.getUTCMonth()
                        && day >= this.endDate.getUTCDate()
                        && hour >= this.endDate.getUTCHours()) {
                        this.picker.find('.next').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.next').css({visibility: 'visible'});
                    }
                    break;
                case 1:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()
                        && month <= this.startDate.getUTCMonth()
                        && day <= this.startDate.getUTCDate()) {
                        this.picker.find('.prev').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.prev').css({visibility: 'visible'});
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()
                        && month >= this.endDate.getUTCMonth()
                        && day >= this.endDate.getUTCDate()) {
                        this.picker.find('.next').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.next').css({visibility: 'visible'});
                    }
                    break;
                case 2:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()
                        && month <= this.startDate.getUTCMonth()) {
                        this.picker.find('.prev').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.prev').css({visibility: 'visible'});
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()
                        && month >= this.endDate.getUTCMonth()) {
                        this.picker.find('.next').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.next').css({visibility: 'visible'});
                    }
                    break;
                case 3:
                case 4:
                    if (this.startDate !== -Infinity && year <= this.startDate.getUTCFullYear()) {
                        this.picker.find('.prev').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.prev').css({visibility: 'visible'});
                    }
                    if (this.endDate !== Infinity && year >= this.endDate.getUTCFullYear()) {
                        this.picker.find('.next').css({visibility: 'hidden'});
                    } else {
                        this.picker.find('.next').css({visibility: 'visible'});
                    }
                    break;
            }
        },

        mousewheel: function (e) {

            e.preventDefault();
            e.stopPropagation();

            if (this.wheelPause) {
                return;
            }

            this.wheelPause = true;

            var originalEvent = e.originalEvent;

            var delta = originalEvent.wheelDelta;

            var mode = delta > 0 ? 1 : (delta === 0) ? 0 : -1;

            if (this.wheelViewModeNavigationInverseDirection) {
                mode = -mode;
            }

            this.showMode(mode);

            setTimeout($.proxy(function () {

                this.wheelPause = false

            }, this), this.wheelViewModeNavigationDelay);

        },

        click: function (e) {
            e.stopPropagation();
            e.preventDefault();
            var target = $(e.target).closest('span, td, th, legend');
            if (target.is('.' + this.icontype)) {
                target = $(target).parent().closest('span, td, th, legend');
            }
            if (target.length == 1) {
                if (target.is('.disabled')) {
                    this.element.trigger({
                        type:      'outOfRange',
                        date:      this.viewDate,
                        startDate: this.startDate,
                        endDate:   this.endDate
                    });
                    return;
                }
                switch (target[0].nodeName.toLowerCase()) {
                    case 'th':
                        switch (target[0].className) {
                            case 'switch':
                                this.showMode(1);
                                break;
                            case 'prev':
                            case 'next':
                                var dir = DPGlobal.modes[this.viewMode].navStep * (target[0].className == 'prev' ? -1 : 1);
                                switch (this.viewMode) {
                                    case 0:
                                        this.viewDate = this.moveHour(this.viewDate, dir);
                                        break;
                                    case 1:
                                        this.viewDate = this.moveDate(this.viewDate, dir);
                                        break;
                                    case 2:
                                        this.viewDate = this.moveMonth(this.viewDate, dir);
                                        break;
                                    case 3:
                                    case 4:
                                        this.viewDate = this.moveYear(this.viewDate, dir);
                                        break;
                                }
                                this.fill();
                                this.element.trigger({
                                    type:      target[0].className + ':' + this.convertViewModeText(this.viewMode),
                                    date:      this.viewDate,
                                    startDate: this.startDate,
                                    endDate:   this.endDate
                                });
                                break;
                            case 'clear':
                                this.reset();
                                if (this.autoclose) {
                                    this.hide();
                                }
                                break;
                            case 'today':
                                var date = new Date();
                                date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), 0);

                                // Respect startDate and endDate.
                                if (date < this.startDate) date = this.startDate;
                                else if (date > this.endDate) date = this.endDate;

                                this.viewMode = this.startViewMode;
                                this.showMode(0);
                                this._setDate(date);
                                this.fill();
                                if (this.autoclose) {
                                    this.hide();
                                }
                                break;
                        }
                        break;
                    case 'span':
                        if (!target.is('.disabled')) {
                            var year = this.viewDate.getUTCFullYear(),
                                month = this.viewDate.getUTCMonth(),
                                day = this.viewDate.getUTCDate(),
                                hours = this.viewDate.getUTCHours(),
                                minutes = this.viewDate.getUTCMinutes(),
                                seconds = this.viewDate.getUTCSeconds();

                            if (target.is('.month')) {
                                this.viewDate.setUTCDate(1);
                                month = target.parent().find('span').index(target);
                                day = this.viewDate.getUTCDate();
                                this.viewDate.setUTCMonth(month);
                                this.element.trigger({
                                    type: 'changeMonth',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 3) {
                                    this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                                }
                            } else if (target.is('.year')) {
                                this.viewDate.setUTCDate(1);
                                year = parseInt(target.text(), 10) || 0;
                                this.viewDate.setUTCFullYear(year);
                                this.element.trigger({
                                    type: 'changeYear',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 4) {
                                    this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                                }
                            } else if (target.is('.hour')) {
                                hours = parseInt(target.text(), 10) || 0;
                                if (target.hasClass('hour_am') || target.hasClass('hour_pm')) {
                                    if (hours == 12 && target.hasClass('hour_am')) {
                                        hours = 0;
                                    } else if (hours != 12 && target.hasClass('hour_pm')) {
                                        hours += 12;
                                    }
                                }
                                this.viewDate.setUTCHours(hours);
                                this.element.trigger({
                                    type: 'changeHour',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 1) {
                                    this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                                }
                            } else if (target.is('.minute')) {
                                minutes = parseInt(target.text().substr(target.text().indexOf(':') + 1), 10) || 0;
                                this.viewDate.setUTCMinutes(minutes);
                                this.element.trigger({
                                    type: 'changeMinute',
                                    date: this.viewDate
                                });
                                if (this.viewSelect >= 0) {
                                    this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                                }
                            }
                            if (this.viewMode != 0) {
                                var oldViewMode = this.viewMode;
                                this.showMode(-1);
                                this.fill();
                                if (oldViewMode == this.viewMode && this.autoclose) {
                                    this.hide();
                                }
                            } else {
                                this.fill();
                                if (this.autoclose) {
                                    this.hide();
                                }
                            }
                        }
                        break;
                    case 'td':
                        if (target.is('.day') && !target.is('.disabled')) {
                            var day = parseInt(target.text(), 10) || 1;
                            var year = this.viewDate.getUTCFullYear(),
                                month = this.viewDate.getUTCMonth(),
                                hours = this.viewDate.getUTCHours(),
                                minutes = this.viewDate.getUTCMinutes(),
                                seconds = this.viewDate.getUTCSeconds();
                            if (target.is('.old')) {
                                if (month === 0) {
                                    month = 11;
                                    year -= 1;
                                } else {
                                    month -= 1;
                                }
                            } else if (target.is('.new')) {
                                if (month == 11) {
                                    month = 0;
                                    year += 1;
                                } else {
                                    month += 1;
                                }
                            }
                            this.viewDate.setUTCFullYear(year);
                            this.viewDate.setUTCMonth(month, day);
                            this.element.trigger({
                                type: 'changeDay',
                                date: this.viewDate
                            });
                            if (this.viewSelect >= 2) {
                                this._setDate(UTCDate(year, month, day, hours, minutes, seconds, 0));
                            }
                        }
                        var oldViewMode = this.viewMode;
                        this.showMode(-1);
                        this.fill();
                        if (oldViewMode == this.viewMode && this.autoclose) {
                            this.hide();
                        }
                        break;
                }
            }
        },

        _setDate: function (date, which) {
            if (!which || which == 'date')
                this.date = date;
            if (!which || which == 'view')
                this.viewDate = date;
            this.fill();
            this.setValue();
            var element;
            if (this.isInput) {
                element = this.element;
            } else if (this.component) {
                element = this.element.find('input');
            }
            if (element) {
                element.change();
                if (this.autoclose && (!which || which == 'date')) {
                    //this.hide();
                }
            }
            this.element.trigger({
                type: 'changeDate',
                date: this.getDate()
            });
            if(date == null)
                this.date = this.viewDate;
        },

        moveMinute: function (date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCMinutes(new_date.getUTCMinutes() + (dir * this.minuteStep));
            return new_date;
        },

        moveHour: function (date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCHours(new_date.getUTCHours() + dir);
            return new_date;
        },

        moveDate: function (date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf());
            //dir = dir > 0 ? 1 : -1;
            new_date.setUTCDate(new_date.getUTCDate() + dir);
            return new_date;
        },

        moveMonth: function (date, dir) {
            if (!dir) return date;
            var new_date = new Date(date.valueOf()),
                day = new_date.getUTCDate(),
                month = new_date.getUTCMonth(),
                mag = Math.abs(dir),
                new_month, test;
            dir = dir > 0 ? 1 : -1;
            if (mag == 1) {
                test = dir == -1
                    // If going back one month, make sure month is not current month
                    // (eg, Mar 31 -> Feb 31 == Feb 28, not Mar 02)
                    ? function () {
                    return new_date.getUTCMonth() == month;
                }
                    // If going forward one month, make sure month is as expected
                    // (eg, Jan 31 -> Feb 31 == Feb 28, not Mar 02)
                    : function () {
                    return new_date.getUTCMonth() != new_month;
                };
                new_month = month + dir;
                new_date.setUTCMonth(new_month);
                // Dec -> Jan (12) or Jan -> Dec (-1) -- limit expected date to 0-11
                if (new_month < 0 || new_month > 11)
                    new_month = (new_month + 12) % 12;
            } else {
                // For magnitudes >1, move one month at a time...
                for (var i = 0; i < mag; i++)
                    // ...which might decrease the day (eg, Jan 31 to Feb 28, etc)...
                    new_date = this.moveMonth(new_date, dir);
                // ...then reset the day, keeping it in the new month
                new_month = new_date.getUTCMonth();
                new_date.setUTCDate(day);
                test = function () {
                    return new_month != new_date.getUTCMonth();
                };
            }
            // Common date-resetting loop -- if date is beyond end of month, make it
            // end of month
            while (test()) {
                new_date.setUTCDate(--day);
                new_date.setUTCMonth(new_month);
            }
            return new_date;
        },

        moveYear: function (date, dir) {
            return this.moveMonth(date, dir * 12);
        },

        dateWithinRange: function (date) {
            return date >= this.startDate && date <= this.endDate;
        },

        keydown: function (e) {
            if (this.picker.is(':not(:visible)')) {
                if (e.keyCode == 27) // allow escape to hide and re-show picker
                    this.show();
                return;
            }
            var dateChanged = false,
                dir, day, month,
                newDate, newViewDate;
            switch (e.keyCode) {
                case 27: // escape
                    this.hide();
                    e.preventDefault();
                    break;
                case 37: // left
                case 39: // right
                    if (!this.keyboardNavigation) break;
                    dir = e.keyCode == 37 ? -1 : 1;
                    viewMode = this.viewMode;
                    if (e.ctrlKey) {
                        viewMode += 2;
                    } else if (e.shiftKey) {
                        viewMode += 1;
                    }
                    if (viewMode == 4) {
                        newDate = this.moveYear(this.date, dir);
                        newViewDate = this.moveYear(this.viewDate, dir);
                    } else if (viewMode == 3) {
                        newDate = this.moveMonth(this.date, dir);
                        newViewDate = this.moveMonth(this.viewDate, dir);
                    } else if (viewMode == 2) {
                        newDate = this.moveDate(this.date, dir);
                        newViewDate = this.moveDate(this.viewDate, dir);
                    } else if (viewMode == 1) {
                        newDate = this.moveHour(this.date, dir);
                        newViewDate = this.moveHour(this.viewDate, dir);
                    } else if (viewMode == 0) {
                        newDate = this.moveMinute(this.date, dir);
                        newViewDate = this.moveMinute(this.viewDate, dir);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.date = newDate;
                        this.viewDate = newViewDate;
                        this.setValue();
                        this.update();
                        e.preventDefault();
                        dateChanged = true;
                    }
                    break;
                case 38: // up
                case 40: // down
                    if (!this.keyboardNavigation) break;
                    dir = e.keyCode == 38 ? -1 : 1;
                    viewMode = this.viewMode;
                    if (e.ctrlKey) {
                        viewMode += 2;
                    } else if (e.shiftKey) {
                        viewMode += 1;
                    }
                    if (viewMode == 4) {
                        newDate = this.moveYear(this.date, dir);
                        newViewDate = this.moveYear(this.viewDate, dir);
                    } else if (viewMode == 3) {
                        newDate = this.moveMonth(this.date, dir);
                        newViewDate = this.moveMonth(this.viewDate, dir);
                    } else if (viewMode == 2) {
                        newDate = this.moveDate(this.date, dir * 7);
                        newViewDate = this.moveDate(this.viewDate, dir * 7);
                    } else if (viewMode == 1) {
                        if (this.showMeridian) {
                            newDate = this.moveHour(this.date, dir * 6);
                            newViewDate = this.moveHour(this.viewDate, dir * 6);
                        } else {
                            newDate = this.moveHour(this.date, dir * 4);
                            newViewDate = this.moveHour(this.viewDate, dir * 4);
                        }
                    } else if (viewMode == 0) {
                        newDate = this.moveMinute(this.date, dir * 4);
                        newViewDate = this.moveMinute(this.viewDate, dir * 4);
                    }
                    if (this.dateWithinRange(newDate)) {
                        this.date = newDate;
                        this.viewDate = newViewDate;
                        this.setValue();
                        this.update();
                        e.preventDefault();
                        dateChanged = true;
                    }
                    break;
                case 13: // enter
                    if (this.viewMode != 0) {
                        var oldViewMode = this.viewMode;
                        this.showMode(-1);
                        this.fill();
                        if (oldViewMode == this.viewMode && this.autoclose) {
                            this.hide();
                        }
                    } else {
                        this.fill();
                        if (this.autoclose) {
                            this.hide();
                        }
                    }
                    e.preventDefault();
                    break;
                case 9: // tab
                    this.hide();
                    break;
            }
            if (dateChanged) {
                var element;
                if (this.isInput) {
                    element = this.element;
                } else if (this.component) {
                    element = this.element.find('input');
                }
                if (element) {
                    element.change();
                }
                this.element.trigger({
                    type: 'changeDate',
                    date: this.getDate()
                });
            }
        },

        showMode: function (dir) {
            if (dir) {
                var newViewMode = Math.max(0, Math.min(DPGlobal.modes.length - 1, this.viewMode + dir));
                if (newViewMode >= this.minView && newViewMode <= this.maxView) {
                    this.element.trigger({
                        type:        'changeMode',
                        date:        this.viewDate,
                        oldViewMode: this.viewMode,
                        newViewMode: newViewMode
                    });

                    this.viewMode = newViewMode;
                }
            }
            /*
             vitalets: fixing bug of very special conditions:
             jquery 1.7.1 + webkit + show inline datetimepicker in bootstrap popover.
             Method show() does not set display css correctly and datetimepicker is not shown.
             Changed to .css('display', 'block') solve the problem.
             See https://github.com/vitalets/x-editable/issues/37

             In jquery 1.7.2+ everything works fine.
             */
            //this.picker.find('>div').hide().filter('.datetimepicker-'+DPGlobal.modes[this.viewMode].clsName).show();
            this.picker.find('>div').hide().filter('.datetimepicker-' + DPGlobal.modes[this.viewMode].clsName).css('display', 'block');
            this.updateNavArrows();
        },

        reset: function (e) {
            this._setDate(null, 'date');
        },

        convertViewModeText:  function (viewMode) {
            switch (viewMode) {
                case 4:
                    return 'decade';
                case 3:
                    return 'year';
                case 2:
                    return 'month';
                case 1:
                    return 'day';
                case 0:
                    return 'hour';
            }
        }
    };

    var old = $.fn.datetimepicker;
    $.fn.datetimepicker = function (option) {
        var args = Array.apply(null, arguments);
        args.shift();
        var internal_return;
        this.each(function () {
            var $this = $(this),
                data = $this.data('datetimepicker'),
                options = typeof option == 'object' && option;
            if (!data) {
                $this.data('datetimepicker', (data = new Datetimepicker(this, $.extend({}, $.fn.datetimepicker.defaults, options))));
            }
            if (typeof option == 'string' && typeof data[option] == 'function') {
                internal_return = data[option].apply(data, args);
                if (internal_return !== undefined) {
                    return false;
                }
            }
        });
        if (internal_return !== undefined)
            return internal_return;
        else
            return this;
    };

    $.fn.datetimepicker.defaults = {
    };
    $.fn.datetimepicker.Constructor = Datetimepicker;
    var dates = $.fn.datetimepicker.dates = {
        en: {
            days:        ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            daysShort:   ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            daysMin:     ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
            months:      ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            meridiem:    ['am', 'pm'],
            suffix:      ['st', 'nd', 'rd', 'th'],
            today:       'Today',
            clear:       'Clear'
        }
    };

    var DPGlobal = {
        modes:            [
            {
                clsName: 'minutes',
                navFnc:  'Hours',
                navStep: 1
            },
            {
                clsName: 'hours',
                navFnc:  'Date',
                navStep: 1
            },
            {
                clsName: 'days',
                navFnc:  'Month',
                navStep: 1
            },
            {
                clsName: 'months',
                navFnc:  'FullYear',
                navStep: 1
            },
            {
                clsName: 'years',
                navFnc:  'FullYear',
                navStep: 10
            }
        ],
        isLeapYear:       function (year) {
            return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0))
        },
        getDaysInMonth:   function (year, month) {
            return [31, (DPGlobal.isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month]
        },
        getDefaultFormat: function (type, field) {
            if (type == 'standard') {
                if (field == 'input')
                    return 'yyyy-mm-dd hh:ii';
                else
                    return 'yyyy-mm-dd hh:ii:ss';
            } else if (type == 'php') {
                if (field == 'input')
                    return 'Y-m-d H:i';
                else
                    return 'Y-m-d H:i:s';
            } else {
                throw new Error('Invalid format type.');
            }
        },
        validParts: function (type) {
            if (type == 'standard') {
                return /t|hh?|HH?|p|P|z|Z|ii?|ss?|dd?|DD?|mm?|MM?|yy(?:yy)?/g;
            } else if (type == 'php') {
                return /[dDjlNwzFmMnStyYaABgGhHis]/g;
            } else {
                throw new Error('Invalid format type.');
            }
        },
        nonpunctuation: /[^ -\/:-@\[-`{-~\t\n\rTZ]+/g,
        parseFormat: function (format, type) {
            // IE treats \0 as a string end in inputs (truncating the value),
            // so it's a bad format delimiter, anyway
            var separators = format.replace(this.validParts(type), '\0').split('\0'),
                parts = format.match(this.validParts(type));
            if (!separators || !separators.length || !parts || parts.length == 0) {
                throw new Error('Invalid date format.');
            }
            return {separators: separators, parts: parts};
        },
        parseDate: function (date, format, language, type, timezone) {
            if (date instanceof Date) {
                var dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
                dateUTC.setMilliseconds(0);
                return dateUTC;
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd', type);
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd hh:ii', type);
            }
            if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
                format = this.parseFormat('yyyy-mm-dd hh:ii:ss', type);
            }
            if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
                var part_re = /([-+]\d+)([dmwy])/,
                    parts = date.match(/([-+]\d+)([dmwy])/g),
                    part, dir;
                date = new Date();
                for (var i = 0; i < parts.length; i++) {
                    part = part_re.exec(parts[i]);
                    dir = parseInt(part[1]);
                    switch (part[2]) {
                        case 'd':
                            date.setUTCDate(date.getUTCDate() + dir);
                            break;
                        case 'm':
                            date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
                            break;
                        case 'w':
                            date.setUTCDate(date.getUTCDate() + dir * 7);
                            break;
                        case 'y':
                            date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
                            break;
                    }
                }
                return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), 0);
            }
            var parts = date && date.toString().match(this.nonpunctuation) || [],
                date = new Date(0, 0, 0, 0, 0, 0, 0),
                parsed = {},
                setters_order = ['hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH', 'p', 'P', 'z', 'Z'],
                setters_map = {
                    hh:   function (d, v) {
                        return d.setUTCHours(v);
                    },
                    h:    function (d, v) {
                        return d.setUTCHours(v);
                    },
                    HH:   function (d, v) {
                        return d.setUTCHours(v == 12 ? 0 : v);
                    },
                    H:    function (d, v) {
                        return d.setUTCHours(v == 12 ? 0 : v);
                    },
                    ii:   function (d, v) {
                        return d.setUTCMinutes(v);
                    },
                    i:    function (d, v) {
                        return d.setUTCMinutes(v);
                    },
                    ss:   function (d, v) {
                        return d.setUTCSeconds(v);
                    },
                    s:    function (d, v) {
                        return d.setUTCSeconds(v);
                    },
                    yyyy: function (d, v) {
                        return d.setUTCFullYear(v);
                    },
                    yy:   function (d, v) {
                        return d.setUTCFullYear(2000 + v);
                    },
                    m:    function (d, v) {
                        v -= 1;
                        while (v < 0) v += 12;
                        v %= 12;
                        d.setUTCMonth(v);
                        while (d.getUTCMonth() != v)
                            if (isNaN(d.getUTCMonth()))
                                return d;
                            else
                                d.setUTCDate(d.getUTCDate() - 1);
                        return d;
                    },
                    d:    function (d, v) {
                        return d.setUTCDate(v);
                    },
                    p:    function (d, v) {
                        return d.setUTCHours(v == 1 ? d.getUTCHours() + 12 : d.getUTCHours());
                    },
                    z:    function () {
                        return timezone
                    }
                },
                val, filtered, part;
            setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
            setters_map['dd'] = setters_map['d'];
            setters_map['P'] = setters_map['p'];
            setters_map['Z'] = setters_map['z'];
            date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
            if (parts.length == format.parts.length) {
                for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                    val = parseInt(parts[i], 10);
                    part = format.parts[i];
                    if (isNaN(val)) {
                        switch (part) {
                            case 'MM':
                                filtered = $(dates[language].months).filter(function () {
                                    var m = this.slice(0, parts[i].length),
                                        p = parts[i].slice(0, m.length);
                                    return m == p;
                                });
                                val = $.inArray(filtered[0], dates[language].months) + 1;
                                break;
                            case 'M':
                                filtered = $(dates[language].monthsShort).filter(function () {
                                    var m = this.slice(0, parts[i].length),
                                        p = parts[i].slice(0, m.length);
                                    return m.toLowerCase() == p.toLowerCase();
                                });
                                val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
                                break;
                            case 'p':
                            case 'P':
                                val = $.inArray(parts[i].toLowerCase(), dates[language].meridiem);
                                break;
                            case 'z':
                            case 'Z':
                                timezone;
                                break;

                        }
                    }
                    parsed[part] = val;
                }
                for (var i = 0, s; i < setters_order.length; i++) {
                    s = setters_order[i];
                    if (s in parsed && !isNaN(parsed[s]))
                        setters_map[s](date, parsed[s])
                }
            }
            return date;
        },
        formatDate:       function (date, format, language, type, timezone) {
            if (date == null) {
                return '';
            }
            var val;
            if (type == 'standard') {
                val = {
                    t:    date.getTime(),
                    // year
                    yy:   date.getUTCFullYear().toString().substring(2),
                    yyyy: date.getUTCFullYear(),
                    // month
                    m:    date.getUTCMonth() + 1,
                    M:    dates[language].monthsShort[date.getUTCMonth()],
                    MM:   dates[language].months[date.getUTCMonth()],
                    // day
                    d:    date.getUTCDate(),
                    D:    dates[language].daysShort[date.getUTCDay()],
                    DD:   dates[language].days[date.getUTCDay()],
                    p:    (dates[language].meridiem.length == 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
                    // hour
                    h:    date.getUTCHours(),
                    // minute
                    i:    date.getUTCMinutes(),
                    // second
                    s:    date.getUTCSeconds(),
                    // timezone
                    z:    timezone
                };

                if (dates[language].meridiem.length == 2) {
                    val.H = (val.h % 12 == 0 ? 12 : val.h % 12);
                }
                else {
                    val.H = val.h;
                }
                val.HH = (val.H < 10 ? '0' : '') + val.H;
                val.P = val.p.toUpperCase();
                val.Z = val.z;
                val.hh = (val.h < 10 ? '0' : '') + val.h;
                val.ii = (val.i < 10 ? '0' : '') + val.i;
                val.ss = (val.s < 10 ? '0' : '') + val.s;
                val.dd = (val.d < 10 ? '0' : '') + val.d;
                val.mm = (val.m < 10 ? '0' : '') + val.m;
            } else if (type == 'php') {
                // php format
                val = {
                    // year
                    y: date.getUTCFullYear().toString().substring(2),
                    Y: date.getUTCFullYear(),
                    // month
                    F: dates[language].months[date.getUTCMonth()],
                    M: dates[language].monthsShort[date.getUTCMonth()],
                    n: date.getUTCMonth() + 1,
                    t: DPGlobal.getDaysInMonth(date.getUTCFullYear(), date.getUTCMonth()),
                    // day
                    j: date.getUTCDate(),
                    l: dates[language].days[date.getUTCDay()],
                    D: dates[language].daysShort[date.getUTCDay()],
                    w: date.getUTCDay(), // 0 -> 6
                    N: (date.getUTCDay() == 0 ? 7 : date.getUTCDay()),       // 1 -> 7
                    S: (date.getUTCDate() % 10 <= dates[language].suffix.length ? dates[language].suffix[date.getUTCDate() % 10 - 1] : ''),
                    // hour
                    a: (dates[language].meridiem.length == 2 ? dates[language].meridiem[date.getUTCHours() < 12 ? 0 : 1] : ''),
                    g: (date.getUTCHours() % 12 == 0 ? 12 : date.getUTCHours() % 12),
                    G: date.getUTCHours(),
                    // minute
                    i: date.getUTCMinutes(),
                    // second
                    s: date.getUTCSeconds()
                };
                val.m = (val.n < 10 ? '0' : '') + val.n;
                val.d = (val.j < 10 ? '0' : '') + val.j;
                val.A = val.a.toString().toUpperCase();
                val.h = (val.g < 10 ? '0' : '') + val.g;
                val.H = (val.G < 10 ? '0' : '') + val.G;
                val.i = (val.i < 10 ? '0' : '') + val.i;
                val.s = (val.s < 10 ? '0' : '') + val.s;
            } else {
                throw new Error('Invalid format type.');
            }
            var date = [],
                seps = $.extend([], format.separators);
            for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
                if (seps.length) {
                    date.push(seps.shift());
                }
                date.push(val[format.parts[i]]);
            }
            if (seps.length) {
                date.push(seps.shift());
            }
            return date.join('');
        },
        convertViewMode:  function (viewMode) {
            switch (viewMode) {
                case 4:
                case 'decade':
                    viewMode = 4;
                    break;
                case 3:
                case 'year':
                    viewMode = 3;
                    break;
                case 2:
                case 'month':
                    viewMode = 2;
                    break;
                case 1:
                case 'day':
                    viewMode = 1;
                    break;
                case 0:
                case 'hour':
                    viewMode = 0;
                    break;
            }

            return viewMode;
        },
        headTemplate: '<thead>' +
        '<tr>' +
        '<th class="prev"><i class="{iconType} {leftArrow}"/></th>' +
        '<th colspan="5" class="switch"></th>' +
        '<th class="next"><i class="{iconType} {rightArrow}"/></th>' +
        '</tr>' +
        '</thead>',
        headTemplateV3: '<thead>' +
        '<tr>' +
        '<th class="prev"><span class="{iconType} {leftArrow}"></span> </th>' +
        '<th colspan="5" class="switch"></th>' +
        '<th class="next"><span class="{iconType} {rightArrow}"></span> </th>' +
        '</tr>' +
        '</thead>',
        contTemplate: '<tbody><tr><td colspan="7"></td></tr></tbody>',
        footTemplate: '<tfoot>' +
        '<tr><th colspan="7" class="today"></th></tr>' +
        '<tr><th colspan="7" class="clear"></th></tr>' +
        '</tfoot>'
    };
    DPGlobal.template = '<div class="datetimepicker">' +
        '<div class="datetimepicker-minutes">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-hours">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-days">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplate +
        '<tbody></tbody>' +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplate +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '</div>';
    DPGlobal.templateV3 = '<div class="datetimepicker">' +
        '<div class="datetimepicker-minutes">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplateV3 +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-hours">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplateV3 +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-days">' +
        '<table class=" table-condensed">' +
        DPGlobal.headTemplateV3 +
        '<tbody></tbody>' +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-months">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplateV3 +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '<div class="datetimepicker-years">' +
        '<table class="table-condensed">' +
        DPGlobal.headTemplateV3 +
        DPGlobal.contTemplate +
        DPGlobal.footTemplate +
        '</table>' +
        '</div>' +
        '</div>';
    $.fn.datetimepicker.DPGlobal = DPGlobal;

    /* DATETIMEPICKER NO CONFLICT
     * =================== */

    $.fn.datetimepicker.noConflict = function () {
        $.fn.datetimepicker = old;
        return this;
    };

    /* DATETIMEPICKER DATA-API
     * ================== */

    $(document).on(
        'focus.datetimepicker.data-api click.datetimepicker.data-api',
        '[data-provide="datetimepicker"]',
        function (e) {
            var $this = $(this);
            if ($this.data('datetimepicker')) return;
            e.preventDefault();
            // component click requires us to explicitly show it
            $this.datetimepicker('show');
        }
    );
    $(function () {
        $('[data-provide="datetimepicker-inline"]').datetimepicker();
    });

}));

});


define('bgpst.lib.jquery-amd',["bgpst.lib.jquery-libs"], function () {
    return jQuery.noConflict(true);
});

define('bgpst.lib.d3-amd',[], function(){define.amd=false;
// https://d3js.org Version 4.10.2. Copyright 2017 Mike Bostock.
(function(t,n){"object"==typeof exports&&"undefined"!=typeof module?n(exports):"function"==typeof define&&define.amd?define('bgpst.lib.d3-amd',["exports"],n):n(t.d3=t.d3||{})})(this,function(t){"use strict";function n(t){return function(n,e){return ss(t(n),e)}}function e(t,n){return[t,n]}function r(t,n,e){var r=(n-t)/Math.max(0,e),i=Math.floor(Math.log(r)/Math.LN10),o=r/Math.pow(10,i);return i>=0?(o>=Ts?10:o>=ks?5:o>=Ns?2:1)*Math.pow(10,i):-Math.pow(10,-i)/(o>=Ts?10:o>=ks?5:o>=Ns?2:1)}function i(t,n,e){var r=Math.abs(n-t)/Math.max(0,e),i=Math.pow(10,Math.floor(Math.log(r)/Math.LN10)),o=r/i;return o>=Ts?i*=10:o>=ks?i*=5:o>=Ns&&(i*=2),n<t?-i:i}function o(t){return t.length}function u(t){return"translate("+(t+.5)+",0)"}function a(t){return"translate(0,"+(t+.5)+")"}function c(t){return function(n){return+t(n)}}function s(t){var n=Math.max(0,t.bandwidth()-1)/2;return t.round()&&(n=Math.round(n)),function(e){return+t(e)+n}}function f(){return!this.__axis}function l(t,n){function e(e){var u=null==i?n.ticks?n.ticks.apply(n,r):n.domain():i,a=null==o?n.tickFormat?n.tickFormat.apply(n,r):Ls:o,y=Math.max(l,0)+p,g=n.range(),m=+g[0]+.5,x=+g[g.length-1]+.5,b=(n.bandwidth?s:c)(n.copy()),w=e.selection?e.selection():e,M=w.selectAll(".domain").data([null]),T=w.selectAll(".tick").data(u,n).order(),k=T.exit(),N=T.enter().append("g").attr("class","tick"),S=T.select("line"),E=T.select("text");M=M.merge(M.enter().insert("path",".tick").attr("class","domain").attr("stroke","#000")),T=T.merge(N),S=S.merge(N.append("line").attr("stroke","#000").attr(v+"2",d*l)),E=E.merge(N.append("text").attr("fill","#000").attr(v,d*y).attr("dy",t===qs?"0em":t===Ds?"0.71em":"0.32em")),e!==w&&(M=M.transition(e),T=T.transition(e),S=S.transition(e),E=E.transition(e),k=k.transition(e).attr("opacity",Fs).attr("transform",function(t){return isFinite(t=b(t))?_(t):this.getAttribute("transform")}),N.attr("opacity",Fs).attr("transform",function(t){var n=this.parentNode.__axis;return _(n&&isFinite(n=n(t))?n:b(t))})),k.remove(),M.attr("d",t===Os||t==Us?"M"+d*h+","+m+"H0.5V"+x+"H"+d*h:"M"+m+","+d*h+"V0.5H"+x+"V"+d*h),T.attr("opacity",1).attr("transform",function(t){return _(b(t))}),S.attr(v+"2",d*l),E.attr(v,d*y).text(a),w.filter(f).attr("fill","none").attr("font-size",10).attr("font-family","sans-serif").attr("text-anchor",t===Us?"start":t===Os?"end":"middle"),w.each(function(){this.__axis=b})}var r=[],i=null,o=null,l=6,h=6,p=3,d=t===qs||t===Os?-1:1,v=t===Os||t===Us?"x":"y",_=t===qs||t===Ds?u:a;return e.scale=function(t){return arguments.length?(n=t,e):n},e.ticks=function(){return r=Rs.call(arguments),e},e.tickArguments=function(t){return arguments.length?(r=null==t?[]:Rs.call(t),e):r.slice()},e.tickValues=function(t){return arguments.length?(i=null==t?null:Rs.call(t),e):i&&i.slice()},e.tickFormat=function(t){return arguments.length?(o=t,e):o},e.tickSize=function(t){return arguments.length?(l=h=+t,e):l},e.tickSizeInner=function(t){return arguments.length?(l=+t,e):l},e.tickSizeOuter=function(t){return arguments.length?(h=+t,e):h},e.tickPadding=function(t){return arguments.length?(p=+t,e):p},e}function h(){for(var t,n=0,e=arguments.length,r={};n<e;++n){if(!(t=arguments[n]+"")||t in r)throw new Error("illegal type: "+t);r[t]=[]}return new p(r)}function p(t){this._=t}function d(t,n){return t.trim().split(/^|\s+/).map(function(t){var e="",r=t.indexOf(".");if(r>=0&&(e=t.slice(r+1),t=t.slice(0,r)),t&&!n.hasOwnProperty(t))throw new Error("unknown type: "+t);return{type:t,name:e}})}function v(t,n){for(var e,r=0,i=t.length;r<i;++r)if((e=t[r]).name===n)return e.value}function _(t,n,e){for(var r=0,i=t.length;r<i;++r)if(t[r].name===n){t[r]=Is,t=t.slice(0,r).concat(t.slice(r+1));break}return null!=e&&t.push({name:n,value:e}),t}function y(t){return function(){var n=this.ownerDocument,e=this.namespaceURI;return e===Ys&&n.documentElement.namespaceURI===Ys?n.createElement(t):n.createElementNS(e,t)}}function g(t){return function(){return this.ownerDocument.createElementNS(t.space,t.local)}}function m(){return new x}function x(){this._="@"+(++Xs).toString(36)}function b(t,n,e){return t=w(t,n,e),function(n){var e=n.relatedTarget;e&&(e===this||8&e.compareDocumentPosition(this))||t.call(this,n)}}function w(n,e,r){return function(i){var o=t.event;t.event=i;try{n.call(this,this.__data__,e,r)}finally{t.event=o}}}function M(t){return t.trim().split(/^|\s+/).map(function(t){var n="",e=t.indexOf(".");return e>=0&&(n=t.slice(e+1),t=t.slice(0,e)),{type:t,name:n}})}function T(t){return function(){var n=this.__on;if(n){for(var e,r=0,i=-1,o=n.length;r<o;++r)e=n[r],t.type&&e.type!==t.type||e.name!==t.name?n[++i]=e:this.removeEventListener(e.type,e.listener,e.capture);++i?n.length=i:delete this.__on}}}function k(t,n,e){var r=Gs.hasOwnProperty(t.type)?b:w;return function(i,o,u){var a,c=this.__on,s=r(n,o,u);if(c)for(var f=0,l=c.length;f<l;++f)if((a=c[f]).type===t.type&&a.name===t.name)return this.removeEventListener(a.type,a.listener,a.capture),this.addEventListener(a.type,a.listener=s,a.capture=e),void(a.value=n);this.addEventListener(t.type,s,e),a={type:t.type,name:t.name,value:n,listener:s,capture:e},c?c.push(a):this.__on=[a]}}function N(n,e,r,i){var o=t.event;n.sourceEvent=t.event,t.event=n;try{return e.apply(r,i)}finally{t.event=o}}function S(){}function E(){return[]}function A(t,n){this.ownerDocument=t.ownerDocument,this.namespaceURI=t.namespaceURI,this._next=null,this._parent=t,this.__data__=n}function C(t,n,e,r,i,o){for(var u,a=0,c=n.length,s=o.length;a<s;++a)(u=n[a])?(u.__data__=o[a],r[a]=u):e[a]=new A(t,o[a]);for(;a<c;++a)(u=n[a])&&(i[a]=u)}function z(t,n,e,r,i,o,u){var a,c,s,f={},l=n.length,h=o.length,p=new Array(l);for(a=0;a<l;++a)(c=n[a])&&(p[a]=s=of+u.call(c,c.__data__,a,n),s in f?i[a]=c:f[s]=c);for(a=0;a<h;++a)(c=f[s=of+u.call(t,o[a],a,o)])?(r[a]=c,c.__data__=o[a],f[s]=null):e[a]=new A(t,o[a]);for(a=0;a<l;++a)(c=n[a])&&f[p[a]]===c&&(i[a]=c)}function P(t,n){return t<n?-1:t>n?1:t>=n?0:NaN}function R(t){return function(){this.removeAttribute(t)}}function L(t){return function(){this.removeAttributeNS(t.space,t.local)}}function q(t,n){return function(){this.setAttribute(t,n)}}function U(t,n){return function(){this.setAttributeNS(t.space,t.local,n)}}function D(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttribute(t):this.setAttribute(t,e)}}function O(t,n){return function(){var e=n.apply(this,arguments);null==e?this.removeAttributeNS(t.space,t.local):this.setAttributeNS(t.space,t.local,e)}}function F(t){return function(){this.style.removeProperty(t)}}function I(t,n,e){return function(){this.style.setProperty(t,n,e)}}function Y(t,n,e){return function(){var r=n.apply(this,arguments);null==r?this.style.removeProperty(t):this.style.setProperty(t,r,e)}}function B(t,n){return t.style.getPropertyValue(n)||uf(t).getComputedStyle(t,null).getPropertyValue(n)}function j(t){return function(){delete this[t]}}function H(t,n){return function(){this[t]=n}}function X(t,n){return function(){var e=n.apply(this,arguments);null==e?delete this[t]:this[t]=e}}function $(t){return t.trim().split(/^|\s+/)}function V(t){return t.classList||new W(t)}function W(t){this._node=t,this._names=$(t.getAttribute("class")||"")}function Z(t,n){for(var e=V(t),r=-1,i=n.length;++r<i;)e.add(n[r])}function G(t,n){for(var e=V(t),r=-1,i=n.length;++r<i;)e.remove(n[r])}function J(t){return function(){Z(this,t)}}function Q(t){return function(){G(this,t)}}function K(t,n){return function(){(n.apply(this,arguments)?Z:G)(this,t)}}function tt(){this.textContent=""}function nt(t){return function(){this.textContent=t}}function et(t){return function(){var n=t.apply(this,arguments);this.textContent=null==n?"":n}}function rt(){this.innerHTML=""}function it(t){return function(){this.innerHTML=t}}function ot(t){return function(){var n=t.apply(this,arguments);this.innerHTML=null==n?"":n}}function ut(){this.nextSibling&&this.parentNode.appendChild(this)}function at(){this.previousSibling&&this.parentNode.insertBefore(this,this.parentNode.firstChild)}function ct(){return null}function st(){var t=this.parentNode;t&&t.removeChild(this)}function ft(t,n,e){var r=uf(t),i=r.CustomEvent;"function"==typeof i?i=new i(n,e):(i=r.document.createEvent("Event"),e?(i.initEvent(n,e.bubbles,e.cancelable),i.detail=e.detail):i.initEvent(n,!1,!1)),t.dispatchEvent(i)}function lt(t,n){return function(){return ft(this,t,n)}}function ht(t,n){return function(){return ft(this,t,n.apply(this,arguments))}}function pt(t,n){this._groups=t,this._parents=n}function dt(){return new pt([[document.documentElement]],af)}function vt(){t.event.stopImmediatePropagation()}function _t(t,n){var e=t.document.documentElement,r=cf(t).on("dragstart.drag",null);n&&(r.on("click.drag",ff,!0),setTimeout(function(){r.on("click.drag",null)},0)),"onselectstart"in e?r.on("selectstart.drag",null):(e.style.MozUserSelect=e.__noselect,delete e.__noselect)}function yt(t,n,e,r,i,o,u,a,c,s){this.target=t,this.type=n,this.subject=e,this.identifier=r,this.active=i,this.x=o,this.y=u,this.dx=a,this.dy=c,this._=s}function gt(){return!t.event.button}function mt(){return this.parentNode}function xt(n){return null==n?{x:t.event.x,y:t.event.y}:n}function bt(){return"ontouchstart"in this}function wt(t,n){var e=Object.create(t.prototype);for(var r in n)e[r]=n[r];return e}function Mt(){}function Tt(t){var n;return t=(t+"").trim().toLowerCase(),(n=yf.exec(t))?(n=parseInt(n[1],16),new At(n>>8&15|n>>4&240,n>>4&15|240&n,(15&n)<<4|15&n,1)):(n=gf.exec(t))?kt(parseInt(n[1],16)):(n=mf.exec(t))?new At(n[1],n[2],n[3],1):(n=xf.exec(t))?new At(255*n[1]/100,255*n[2]/100,255*n[3]/100,1):(n=bf.exec(t))?Nt(n[1],n[2],n[3],n[4]):(n=wf.exec(t))?Nt(255*n[1]/100,255*n[2]/100,255*n[3]/100,n[4]):(n=Mf.exec(t))?Ct(n[1],n[2]/100,n[3]/100,1):(n=Tf.exec(t))?Ct(n[1],n[2]/100,n[3]/100,n[4]):kf.hasOwnProperty(t)?kt(kf[t]):"transparent"===t?new At(NaN,NaN,NaN,0):null}function kt(t){return new At(t>>16&255,t>>8&255,255&t,1)}function Nt(t,n,e,r){return r<=0&&(t=n=e=NaN),new At(t,n,e,r)}function St(t){return t instanceof Mt||(t=Tt(t)),t?(t=t.rgb(),new At(t.r,t.g,t.b,t.opacity)):new At}function Et(t,n,e,r){return 1===arguments.length?St(t):new At(t,n,e,null==r?1:r)}function At(t,n,e,r){this.r=+t,this.g=+n,this.b=+e,this.opacity=+r}function Ct(t,n,e,r){return r<=0?t=n=e=NaN:e<=0||e>=1?t=n=NaN:n<=0&&(t=NaN),new Rt(t,n,e,r)}function zt(t){if(t instanceof Rt)return new Rt(t.h,t.s,t.l,t.opacity);if(t instanceof Mt||(t=Tt(t)),!t)return new Rt;if(t instanceof Rt)return t;var n=(t=t.rgb()).r/255,e=t.g/255,r=t.b/255,i=Math.min(n,e,r),o=Math.max(n,e,r),u=NaN,a=o-i,c=(o+i)/2;return a?(u=n===o?(e-r)/a+6*(e<r):e===o?(r-n)/a+2:(n-e)/a+4,a/=c<.5?o+i:2-o-i,u*=60):a=c>0&&c<1?0:u,new Rt(u,a,c,t.opacity)}function Pt(t,n,e,r){return 1===arguments.length?zt(t):new Rt(t,n,e,null==r?1:r)}function Rt(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function Lt(t,n,e){return 255*(t<60?n+(e-n)*t/60:t<180?e:t<240?n+(e-n)*(240-t)/60:n)}function qt(t){if(t instanceof Dt)return new Dt(t.l,t.a,t.b,t.opacity);if(t instanceof Ht){var n=t.h*Nf;return new Dt(t.l,Math.cos(n)*t.c,Math.sin(n)*t.c,t.opacity)}t instanceof At||(t=St(t));var e=Yt(t.r),r=Yt(t.g),i=Yt(t.b),o=Ot((.4124564*e+.3575761*r+.1804375*i)/Ef),u=Ot((.2126729*e+.7151522*r+.072175*i)/Af);return new Dt(116*u-16,500*(o-u),200*(u-Ot((.0193339*e+.119192*r+.9503041*i)/Cf)),t.opacity)}function Ut(t,n,e,r){return 1===arguments.length?qt(t):new Dt(t,n,e,null==r?1:r)}function Dt(t,n,e,r){this.l=+t,this.a=+n,this.b=+e,this.opacity=+r}function Ot(t){return t>Lf?Math.pow(t,1/3):t/Rf+zf}function Ft(t){return t>Pf?t*t*t:Rf*(t-zf)}function It(t){return 255*(t<=.0031308?12.92*t:1.055*Math.pow(t,1/2.4)-.055)}function Yt(t){return(t/=255)<=.04045?t/12.92:Math.pow((t+.055)/1.055,2.4)}function Bt(t){if(t instanceof Ht)return new Ht(t.h,t.c,t.l,t.opacity);t instanceof Dt||(t=qt(t));var n=Math.atan2(t.b,t.a)*Sf;return new Ht(n<0?n+360:n,Math.sqrt(t.a*t.a+t.b*t.b),t.l,t.opacity)}function jt(t,n,e,r){return 1===arguments.length?Bt(t):new Ht(t,n,e,null==r?1:r)}function Ht(t,n,e,r){this.h=+t,this.c=+n,this.l=+e,this.opacity=+r}function Xt(t){if(t instanceof Vt)return new Vt(t.h,t.s,t.l,t.opacity);t instanceof At||(t=St(t));var n=t.r/255,e=t.g/255,r=t.b/255,i=(Bf*r+If*n-Yf*e)/(Bf+If-Yf),o=r-i,u=(Ff*(e-i)-Df*o)/Of,a=Math.sqrt(u*u+o*o)/(Ff*i*(1-i)),c=a?Math.atan2(u,o)*Sf-120:NaN;return new Vt(c<0?c+360:c,a,i,t.opacity)}function $t(t,n,e,r){return 1===arguments.length?Xt(t):new Vt(t,n,e,null==r?1:r)}function Vt(t,n,e,r){this.h=+t,this.s=+n,this.l=+e,this.opacity=+r}function Wt(t,n,e,r,i){var o=t*t,u=o*t;return((1-3*t+3*o-u)*n+(4-6*o+3*u)*e+(1+3*t+3*o-3*u)*r+u*i)/6}function Zt(t,n){return function(e){return t+e*n}}function Gt(t,n,e){return t=Math.pow(t,e),n=Math.pow(n,e)-t,e=1/e,function(r){return Math.pow(t+r*n,e)}}function Jt(t,n){var e=n-t;return e?Zt(t,e>180||e<-180?e-360*Math.round(e/360):e):Jf(isNaN(t)?n:t)}function Qt(t){return 1==(t=+t)?Kt:function(n,e){return e-n?Gt(n,e,t):Jf(isNaN(n)?e:n)}}function Kt(t,n){var e=n-t;return e?Zt(t,e):Jf(isNaN(t)?n:t)}function tn(t){return function(n){var e,r,i=n.length,o=new Array(i),u=new Array(i),a=new Array(i);for(e=0;e<i;++e)r=Et(n[e]),o[e]=r.r||0,u[e]=r.g||0,a[e]=r.b||0;return o=t(o),u=t(u),a=t(a),r.opacity=1,function(t){return r.r=o(t),r.g=u(t),r.b=a(t),r+""}}}function nn(t){return function(){return t}}function en(t){return function(n){return t(n)+""}}function rn(t,n,e,r){function i(t){return t.length?t.pop()+" ":""}function o(t,r,i,o,u,a){if(t!==i||r!==o){var c=u.push("translate(",null,n,null,e);a.push({i:c-4,x:rl(t,i)},{i:c-2,x:rl(r,o)})}else(i||o)&&u.push("translate("+i+n+o+e)}function u(t,n,e,o){t!==n?(t-n>180?n+=360:n-t>180&&(t+=360),o.push({i:e.push(i(e)+"rotate(",null,r)-2,x:rl(t,n)})):n&&e.push(i(e)+"rotate("+n+r)}function a(t,n,e,o){t!==n?o.push({i:e.push(i(e)+"skewX(",null,r)-2,x:rl(t,n)}):n&&e.push(i(e)+"skewX("+n+r)}function c(t,n,e,r,o,u){if(t!==e||n!==r){var a=o.push(i(o)+"scale(",null,",",null,")");u.push({i:a-4,x:rl(t,e)},{i:a-2,x:rl(n,r)})}else 1===e&&1===r||o.push(i(o)+"scale("+e+","+r+")")}return function(n,e){var r=[],i=[];return n=t(n),e=t(e),o(n.translateX,n.translateY,e.translateX,e.translateY,r,i),u(n.rotate,e.rotate,r,i),a(n.skewX,e.skewX,r,i),c(n.scaleX,n.scaleY,e.scaleX,e.scaleY,r,i),n=e=null,function(t){for(var n,e=-1,o=i.length;++e<o;)r[(n=i[e]).i]=n.x(t);return r.join("")}}}function on(t){return((t=Math.exp(t))+1/t)/2}function un(t){return((t=Math.exp(t))-1/t)/2}function an(t){return((t=Math.exp(2*t))-1)/(t+1)}function cn(t){return function(n,e){var r=t((n=Pt(n)).h,(e=Pt(e)).h),i=Kt(n.s,e.s),o=Kt(n.l,e.l),u=Kt(n.opacity,e.opacity);return function(t){return n.h=r(t),n.s=i(t),n.l=o(t),n.opacity=u(t),n+""}}}function sn(t){return function(n,e){var r=t((n=jt(n)).h,(e=jt(e)).h),i=Kt(n.c,e.c),o=Kt(n.l,e.l),u=Kt(n.opacity,e.opacity);return function(t){return n.h=r(t),n.c=i(t),n.l=o(t),n.opacity=u(t),n+""}}}function fn(t){return function n(e){function r(n,r){var i=t((n=$t(n)).h,(r=$t(r)).h),o=Kt(n.s,r.s),u=Kt(n.l,r.l),a=Kt(n.opacity,r.opacity);return function(t){return n.h=i(t),n.s=o(t),n.l=u(Math.pow(t,e)),n.opacity=a(t),n+""}}return e=+e,r.gamma=n,r}(1)}function ln(){return El||(zl(hn),El=Cl.now()+Al)}function hn(){El=0}function pn(){this._call=this._time=this._next=null}function dn(t,n,e){var r=new pn;return r.restart(t,n,e),r}function vn(){ln(),++Ml;for(var t,n=Vf;n;)(t=El-n._time)>=0&&n._call.call(null,t),n=n._next;--Ml}function _n(){El=(Sl=Cl.now())+Al,Ml=Tl=0;try{vn()}finally{Ml=0,gn(),El=0}}function yn(){var t=Cl.now(),n=t-Sl;n>Nl&&(Al-=n,Sl=t)}function gn(){for(var t,n,e=Vf,r=1/0;e;)e._call?(r>e._time&&(r=e._time),t=e,e=e._next):(n=e._next,e._next=null,e=t?t._next=n:Vf=n);Wf=t,mn(r)}function mn(t){Ml||(Tl&&(Tl=clearTimeout(Tl)),t-El>24?(t<1/0&&(Tl=setTimeout(_n,t-Cl.now()-Al)),kl&&(kl=clearInterval(kl))):(kl||(Sl=Cl.now(),kl=setInterval(yn,Nl)),Ml=1,zl(_n)))}function xn(t,n){var e=t.__transition;if(!e||!(e=e[n])||e.state>ql)throw new Error("too late");return e}function bn(t,n){var e=t.__transition;if(!e||!(e=e[n])||e.state>Dl)throw new Error("too late");return e}function wn(t,n){var e=t.__transition;if(!e||!(e=e[n]))throw new Error("too late");return e}function Mn(t,n,e){function r(c){var s,f,l,h;if(e.state!==Ul)return o();for(s in a)if((h=a[s]).name===e.name){if(h.state===Ol)return Pl(r);h.state===Fl?(h.state=Yl,h.timer.stop(),h.on.call("interrupt",t,t.__data__,h.index,h.group),delete a[s]):+s<n&&(h.state=Yl,h.timer.stop(),delete a[s])}if(Pl(function(){e.state===Ol&&(e.state=Fl,e.timer.restart(i,e.delay,e.time),i(c))}),e.state=Dl,e.on.call("start",t,t.__data__,e.index,e.group),e.state===Dl){for(e.state=Ol,u=new Array(l=e.tween.length),s=0,f=-1;s<l;++s)(h=e.tween[s].value.call(t,t.__data__,e.index,e.group))&&(u[++f]=h);u.length=f+1}}function i(n){for(var r=n<e.duration?e.ease.call(null,n/e.duration):(e.timer.restart(o),e.state=Il,1),i=-1,a=u.length;++i<a;)u[i].call(null,r);e.state===Il&&(e.on.call("end",t,t.__data__,e.index,e.group),o())}function o(){e.state=Yl,e.timer.stop(),delete a[n];for(var r in a)return;delete t.__transition}var u,a=t.__transition;a[n]=e,e.timer=dn(function(t){e.state=Ul,e.timer.restart(r,e.delay,e.time),e.delay<=t&&r(t-e.delay)},0,e.time)}function Tn(t,n){var e,r;return function(){var i=bn(this,t),o=i.tween;if(o!==e)for(var u=0,a=(r=e=o).length;u<a;++u)if(r[u].name===n){(r=r.slice()).splice(u,1);break}i.tween=r}}function kn(t,n,e){var r,i;if("function"!=typeof e)throw new Error;return function(){var o=bn(this,t),u=o.tween;if(u!==r){i=(r=u).slice();for(var a={name:n,value:e},c=0,s=i.length;c<s;++c)if(i[c].name===n){i[c]=a;break}c===s&&i.push(a)}o.tween=i}}function Nn(t,n,e){var r=t._id;return t.each(function(){var t=bn(this,r);(t.value||(t.value={}))[n]=e.apply(this,arguments)}),function(t){return wn(t,r).value[n]}}function Sn(t){return function(){this.removeAttribute(t)}}function En(t){return function(){this.removeAttributeNS(t.space,t.local)}}function An(t,n,e){var r,i;return function(){var o=this.getAttribute(t);return o===e?null:o===r?i:i=n(r=o,e)}}function Cn(t,n,e){var r,i;return function(){var o=this.getAttributeNS(t.space,t.local);return o===e?null:o===r?i:i=n(r=o,e)}}function zn(t,n,e){var r,i,o;return function(){var u,a=e(this);{if(null!=a)return(u=this.getAttribute(t))===a?null:u===r&&a===i?o:o=n(r=u,i=a);this.removeAttribute(t)}}}function Pn(t,n,e){var r,i,o;return function(){var u,a=e(this);{if(null!=a)return(u=this.getAttributeNS(t.space,t.local))===a?null:u===r&&a===i?o:o=n(r=u,i=a);this.removeAttributeNS(t.space,t.local)}}}function Rn(t,n){function e(){var e=this,r=n.apply(e,arguments);return r&&function(n){e.setAttributeNS(t.space,t.local,r(n))}}return e._value=n,e}function Ln(t,n){function e(){var e=this,r=n.apply(e,arguments);return r&&function(n){e.setAttribute(t,r(n))}}return e._value=n,e}function qn(t,n){return function(){xn(this,t).delay=+n.apply(this,arguments)}}function Un(t,n){return n=+n,function(){xn(this,t).delay=n}}function Dn(t,n){return function(){bn(this,t).duration=+n.apply(this,arguments)}}function On(t,n){return n=+n,function(){bn(this,t).duration=n}}function Fn(t,n){if("function"!=typeof n)throw new Error;return function(){bn(this,t).ease=n}}function In(t){return(t+"").trim().split(/^|\s+/).every(function(t){var n=t.indexOf(".");return n>=0&&(t=t.slice(0,n)),!t||"start"===t})}function Yn(t,n,e){var r,i,o=In(n)?xn:bn;return function(){var u=o(this,t),a=u.on;a!==r&&(i=(r=a).copy()).on(n,e),u.on=i}}function Bn(t){return function(){var n=this.parentNode;for(var e in this.__transition)if(+e!==t)return;n&&n.removeChild(this)}}function jn(t,n){var e,r,i;return function(){var o=B(this,t),u=(this.style.removeProperty(t),B(this,t));return o===u?null:o===e&&u===r?i:i=n(e=o,r=u)}}function Hn(t){return function(){this.style.removeProperty(t)}}function Xn(t,n,e){var r,i;return function(){var o=B(this,t);return o===e?null:o===r?i:i=n(r=o,e)}}function $n(t,n,e){var r,i,o;return function(){var u=B(this,t),a=e(this);return null==a&&(this.style.removeProperty(t),a=B(this,t)),u===a?null:u===r&&a===i?o:o=n(r=u,i=a)}}function Vn(t,n,e){function r(){var r=this,i=n.apply(r,arguments);return i&&function(n){r.style.setProperty(t,i(n),e)}}return r._value=n,r}function Wn(t){return function(){this.textContent=t}}function Zn(t){return function(){var n=t(this);this.textContent=null==n?"":n}}function Gn(t,n,e,r){this._groups=t,this._parents=n,this._name=e,this._id=r}function Jn(t){return dt().transition(t)}function Qn(){return++$l}function Kn(t){return((t*=2)<=1?t*t:--t*(2-t)+1)/2}function te(t){return((t*=2)<=1?t*t*t:(t-=2)*t*t+2)/2}function ne(t){return(1-Math.cos(Jl*t))/2}function ee(t){return((t*=2)<=1?Math.pow(2,10*t-10):2-Math.pow(2,10-10*t))/2}function re(t){return((t*=2)<=1?1-Math.sqrt(1-t*t):Math.sqrt(1-(t-=2)*t)+1)/2}function ie(t){return(t=+t)<Kl?ch*t*t:t<nh?ch*(t-=th)*t+eh:t<ih?ch*(t-=rh)*t+oh:ch*(t-=uh)*t+ah}function oe(t,n){for(var e;!(e=t.__transition)||!(e=e[n]);)if(!(t=t.parentNode))return _h.time=ln(),_h;return e}function ue(){t.event.stopImmediatePropagation()}function ae(t){return{type:t}}function ce(){return!t.event.button}function se(){var t=this.ownerSVGElement||this;return[[0,0],[t.width.baseVal.value,t.height.baseVal.value]]}function fe(t){for(;!t.__brush;)if(!(t=t.parentNode))return;return t.__brush}function le(t){return t[0][0]===t[1][0]||t[0][1]===t[1][1]}function he(n){function e(t){var e=t.property("__brush",a).selectAll(".overlay").data([ae("overlay")]);e.enter().append("rect").attr("class","overlay").attr("pointer-events","all").attr("cursor",Eh.overlay).merge(e).each(function(){var t=fe(this).extent;cf(this).attr("x",t[0][0]).attr("y",t[0][1]).attr("width",t[1][0]-t[0][0]).attr("height",t[1][1]-t[0][1])}),t.selectAll(".selection").data([ae("selection")]).enter().append("rect").attr("class","selection").attr("cursor",Eh.selection).attr("fill","#777").attr("fill-opacity",.3).attr("stroke","#fff").attr("shape-rendering","crispEdges");var i=t.selectAll(".handle").data(n.handles,function(t){return t.type});i.exit().remove(),i.enter().append("rect").attr("class",function(t){return"handle handle--"+t.type}).attr("cursor",function(t){return Eh[t.type]}),t.each(r).attr("fill","none").attr("pointer-events","all").style("-webkit-tap-highlight-color","rgba(0,0,0,0)").on("mousedown.brush touchstart.brush",u)}function r(){var t=cf(this),n=fe(this).selection;n?(t.selectAll(".selection").style("display",null).attr("x",n[0][0]).attr("y",n[0][1]).attr("width",n[1][0]-n[0][0]).attr("height",n[1][1]-n[0][1]),t.selectAll(".handle").style("display",null).attr("x",function(t){return"e"===t.type[t.type.length-1]?n[1][0]-p/2:n[0][0]-p/2}).attr("y",function(t){return"s"===t.type[0]?n[1][1]-p/2:n[0][1]-p/2}).attr("width",function(t){return"n"===t.type||"s"===t.type?n[1][0]-n[0][0]+p:p}).attr("height",function(t){return"e"===t.type||"w"===t.type?n[1][1]-n[0][1]+p:p})):t.selectAll(".selection,.handle").style("display","none").attr("x",null).attr("y",null).attr("width",null).attr("height",null)}function i(t,n){return t.__brush.emitter||new o(t,n)}function o(t,n){this.that=t,this.args=n,this.state=t.__brush,this.active=0}function u(){function e(){var t=Ks(w);!L||x||b||(Math.abs(t[0]-U[0])>Math.abs(t[1]-U[1])?b=!0:x=!0),U=t,m=!0,xh(),o()}function o(){var t;switch(y=U[0]-q[0],g=U[1]-q[1],T){case wh:case bh:k&&(y=Math.max(C-a,Math.min(P-p,y)),s=a+y,d=p+y),N&&(g=Math.max(z-l,Math.min(R-v,g)),h=l+g,_=v+g);break;case Mh:k<0?(y=Math.max(C-a,Math.min(P-a,y)),s=a+y,d=p):k>0&&(y=Math.max(C-p,Math.min(P-p,y)),s=a,d=p+y),N<0?(g=Math.max(z-l,Math.min(R-l,g)),h=l+g,_=v):N>0&&(g=Math.max(z-v,Math.min(R-v,g)),h=l,_=v+g);break;case Th:k&&(s=Math.max(C,Math.min(P,a-y*k)),d=Math.max(C,Math.min(P,p+y*k))),N&&(h=Math.max(z,Math.min(R,l-g*N)),_=Math.max(z,Math.min(R,v+g*N)))}d<s&&(k*=-1,t=a,a=p,p=t,t=s,s=d,d=t,M in Ah&&F.attr("cursor",Eh[M=Ah[M]])),_<h&&(N*=-1,t=l,l=v,v=t,t=h,h=_,_=t,M in Ch&&F.attr("cursor",Eh[M=Ch[M]])),S.selection&&(A=S.selection),x&&(s=A[0][0],d=A[1][0]),b&&(h=A[0][1],_=A[1][1]),A[0][0]===s&&A[0][1]===h&&A[1][0]===d&&A[1][1]===_||(S.selection=[[s,h],[d,_]],r.call(w),D.brush())}function u(){if(ue(),t.event.touches){if(t.event.touches.length)return;c&&clearTimeout(c),c=setTimeout(function(){c=null},500),O.on("touchmove.brush touchend.brush touchcancel.brush",null)}else _t(t.event.view,m),I.on("keydown.brush keyup.brush mousemove.brush mouseup.brush",null);O.attr("pointer-events","all"),F.attr("cursor",Eh.overlay),S.selection&&(A=S.selection),le(A)&&(S.selection=null,r.call(w)),D.end()}if(t.event.touches){if(t.event.changedTouches.length<t.event.touches.length)return xh()}else if(c)return;if(f.apply(this,arguments)){var a,s,l,h,p,d,v,_,y,g,m,x,b,w=this,M=t.event.target.__data__.type,T="selection"===(t.event.metaKey?M="overlay":M)?bh:t.event.altKey?Th:Mh,k=n===Nh?null:zh[M],N=n===kh?null:Ph[M],S=fe(w),E=S.extent,A=S.selection,C=E[0][0],z=E[0][1],P=E[1][0],R=E[1][1],L=k&&N&&t.event.shiftKey,q=Ks(w),U=q,D=i(w,arguments).beforestart();"overlay"===M?S.selection=A=[[a=n===Nh?C:q[0],l=n===kh?z:q[1]],[p=n===Nh?P:a,v=n===kh?R:l]]:(a=A[0][0],l=A[0][1],p=A[1][0],v=A[1][1]),s=a,h=l,d=p,_=v;var O=cf(w).attr("pointer-events","none"),F=O.selectAll(".overlay").attr("cursor",Eh[M]);if(t.event.touches)O.on("touchmove.brush",e,!0).on("touchend.brush touchcancel.brush",u,!0);else{var I=cf(t.event.view).on("keydown.brush",function(){switch(t.event.keyCode){case 16:L=k&&N;break;case 18:T===Mh&&(k&&(p=d-y*k,a=s+y*k),N&&(v=_-g*N,l=h+g*N),T=Th,o());break;case 32:T!==Mh&&T!==Th||(k<0?p=d-y:k>0&&(a=s-y),N<0?v=_-g:N>0&&(l=h-g),T=wh,F.attr("cursor",Eh.selection),o());break;default:return}xh()},!0).on("keyup.brush",function(){switch(t.event.keyCode){case 16:L&&(x=b=L=!1,o());break;case 18:T===Th&&(k<0?p=d:k>0&&(a=s),N<0?v=_:N>0&&(l=h),T=Mh,o());break;case 32:T===wh&&(t.event.altKey?(k&&(p=d-y*k,a=s+y*k),N&&(v=_-g*N,l=h+g*N),T=Th):(k<0?p=d:k>0&&(a=s),N<0?v=_:N>0&&(l=h),T=Mh),F.attr("cursor",Eh[M]),o());break;default:return}xh()},!0).on("mousemove.brush",e,!0).on("mouseup.brush",u,!0);lf(t.event.view)}ue(),jl(w),r.call(w),D.start()}}function a(){var t=this.__brush||{selection:null};return t.extent=s.apply(this,arguments),t.dim=n,t}var c,s=se,f=ce,l=h(e,"start","brush","end"),p=6;return e.move=function(t,e){t.selection?t.on("start.brush",function(){i(this,arguments).beforestart().start()}).on("interrupt.brush end.brush",function(){i(this,arguments).end()}).tween("brush",function(){function t(t){u.selection=1===t&&le(s)?null:f(t),r.call(o),a.brush()}var o=this,u=o.__brush,a=i(o,arguments),c=u.selection,s=n.input("function"==typeof e?e.apply(this,arguments):e,u.extent),f=cl(c,s);return c&&s?t:t(1)}):t.each(function(){var t=this,o=arguments,u=t.__brush,a=n.input("function"==typeof e?e.apply(t,o):e,u.extent),c=i(t,o).beforestart();jl(t),u.selection=null==a||le(a)?null:a,r.call(t),c.start().brush().end()})},o.prototype={beforestart:function(){return 1==++this.active&&(this.state.emitter=this,this.starting=!0),this},start:function(){return this.starting&&(this.starting=!1,this.emit("start")),this},brush:function(){return this.emit("brush"),this},end:function(){return 0==--this.active&&(delete this.state.emitter,this.emit("end")),this},emit:function(t){N(new mh(e,t,n.output(this.state.selection)),l.apply,l,[t,this.that,this.args])}},e.extent=function(t){return arguments.length?(s="function"==typeof t?t:gh([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),e):s},e.filter=function(t){return arguments.length?(f="function"==typeof t?t:gh(!!t),e):f},e.handleSize=function(t){return arguments.length?(p=+t,e):p},e.on=function(){var t=l.on.apply(l,arguments);return t===l?e:t},e}function pe(t){return function(n,e){return t(n.source.value+n.target.value,e.source.value+e.target.value)}}function de(){this._x0=this._y0=this._x1=this._y1=null,this._=""}function ve(){return new de}function _e(t){return t.source}function ye(t){return t.target}function ge(t){return t.radius}function me(t){return t.startAngle}function xe(t){return t.endAngle}function be(){}function we(t,n){var e=new be;if(t instanceof be)t.each(function(t,n){e.set(n,t)});else if(Array.isArray(t)){var r,i=-1,o=t.length;if(null==n)for(;++i<o;)e.set(i,t[i]);else for(;++i<o;)e.set(n(r=t[i],i,t),r)}else if(t)for(var u in t)e.set(u,t[u]);return e}function Me(){return{}}function Te(t,n,e){t[n]=e}function ke(){return we()}function Ne(t,n,e){t.set(n,e)}function Se(){}function Ee(t,n){var e=new Se;if(t instanceof Se)t.each(function(t){e.add(t)});else if(t){var r=-1,i=t.length;if(null==n)for(;++r<i;)e.add(t[r]);else for(;++r<i;)e.add(n(t[r],r,t))}return e}function Ae(t){return new Function("d","return {"+t.map(function(t,n){return JSON.stringify(t)+": d["+n+"]"}).join(",")+"}")}function Ce(t,n){var e=Ae(t);return function(r,i){return n(e(r),i,t)}}function ze(t){var n=Object.create(null),e=[];return t.forEach(function(t){for(var r in t)r in n||e.push(n[r]=r)}),e}function Pe(t,n,e,r){if(isNaN(n)||isNaN(e))return t;var i,o,u,a,c,s,f,l,h,p=t._root,d={data:r},v=t._x0,_=t._y0,y=t._x1,g=t._y1;if(!p)return t._root=d,t;for(;p.length;)if((s=n>=(o=(v+y)/2))?v=o:y=o,(f=e>=(u=(_+g)/2))?_=u:g=u,i=p,!(p=p[l=f<<1|s]))return i[l]=d,t;if(a=+t._x.call(null,p.data),c=+t._y.call(null,p.data),n===a&&e===c)return d.next=p,i?i[l]=d:t._root=d,t;do{i=i?i[l]=new Array(4):t._root=new Array(4),(s=n>=(o=(v+y)/2))?v=o:y=o,(f=e>=(u=(_+g)/2))?_=u:g=u}while((l=f<<1|s)==(h=(c>=u)<<1|a>=o));return i[h]=p,i[l]=d,t}function Re(t){return t[0]}function Le(t){return t[1]}function qe(t,n,e){var r=new Ue(null==n?Re:n,null==e?Le:e,NaN,NaN,NaN,NaN);return null==t?r:r.addAll(t)}function Ue(t,n,e,r,i,o){this._x=t,this._y=n,this._x0=e,this._y0=r,this._x1=i,this._y1=o,this._root=void 0}function De(t){for(var n={data:t.data},e=n;t=t.next;)e=e.next={data:t.data};return n}function Oe(t){return t.x+t.vx}function Fe(t){return t.y+t.vy}function Ie(t){return t.index}function Ye(t,n){var e=t.get(n);if(!e)throw new Error("missing: "+n);return e}function Be(t){return t.x}function je(t){return t.y}function He(t){return new Xe(t)}function Xe(t){if(!(n=xp.exec(t)))throw new Error("invalid format: "+t);var n,e=n[1]||" ",r=n[2]||">",i=n[3]||"-",o=n[4]||"",u=!!n[5],a=n[6]&&+n[6],c=!!n[7],s=n[8]&&+n[8].slice(1),f=n[9]||"";"n"===f?(c=!0,f="g"):mp[f]||(f=""),(u||"0"===e&&"="===r)&&(u=!0,e="0",r="="),this.fill=e,this.align=r,this.sign=i,this.symbol=o,this.zero=u,this.width=a,this.comma=c,this.precision=s,this.type=f}function $e(n){return bp=Tp(n),t.format=bp.format,t.formatPrefix=bp.formatPrefix,bp}function Ve(){this.reset()}function We(t,n,e){var r=t.s=n+e,i=r-n,o=r-i;t.t=n-o+(e-i)}function Ze(t){return t>1?0:t<-1?cd:Math.acos(t)}function Ge(t){return t>1?sd:t<-1?-sd:Math.asin(t)}function Je(t){return(t=wd(t/2))*t}function Qe(){}function Ke(t,n){t&&Sd.hasOwnProperty(t.type)&&Sd[t.type](t,n)}function tr(t,n,e){var r,i=-1,o=t.length-e;for(n.lineStart();++i<o;)r=t[i],n.point(r[0],r[1],r[2]);n.lineEnd()}function nr(t,n){var e=-1,r=t.length;for(n.polygonStart();++e<r;)tr(t[e],n,1);n.polygonEnd()}function er(){zd.point=ir}function rr(){or(Ap,Cp)}function ir(t,n){zd.point=or,Ap=t,Cp=n,zp=t*=pd,Pp=yd(n=(n*=pd)/2+fd),Rp=wd(n)}function or(t,n){n=(n*=pd)/2+fd;var e=(t*=pd)-zp,r=e>=0?1:-1,i=r*e,o=yd(n),u=wd(n),a=Rp*u,c=Pp*o+a*yd(i),s=a*r*wd(i);Ad.add(_d(s,c)),zp=t,Pp=o,Rp=u}function ur(t){return[_d(t[1],t[0]),Ge(t[2])]}function ar(t){var n=t[0],e=t[1],r=yd(e);return[r*yd(n),r*wd(n),wd(e)]}function cr(t,n){return t[0]*n[0]+t[1]*n[1]+t[2]*n[2]}function sr(t,n){return[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]]}function fr(t,n){t[0]+=n[0],t[1]+=n[1],t[2]+=n[2]}function lr(t,n){return[t[0]*n,t[1]*n,t[2]*n]}function hr(t){var n=Td(t[0]*t[0]+t[1]*t[1]+t[2]*t[2]);t[0]/=n,t[1]/=n,t[2]/=n}function pr(t,n){Bp.push(jp=[Lp=t,Up=t]),n<qp&&(qp=n),n>Dp&&(Dp=n)}function dr(t,n){var e=ar([t*pd,n*pd]);if(Yp){var r=sr(Yp,e),i=sr([r[1],-r[0],0],r);hr(i),i=ur(i);var o,u=t-Op,a=u>0?1:-1,c=i[0]*hd*a,s=dd(u)>180;s^(a*Op<c&&c<a*t)?(o=i[1]*hd)>Dp&&(Dp=o):(c=(c+360)%360-180,s^(a*Op<c&&c<a*t)?(o=-i[1]*hd)<qp&&(qp=o):(n<qp&&(qp=n),n>Dp&&(Dp=n))),s?t<Op?xr(Lp,t)>xr(Lp,Up)&&(Up=t):xr(t,Up)>xr(Lp,Up)&&(Lp=t):Up>=Lp?(t<Lp&&(Lp=t),t>Up&&(Up=t)):t>Op?xr(Lp,t)>xr(Lp,Up)&&(Up=t):xr(t,Up)>xr(Lp,Up)&&(Lp=t)}else Bp.push(jp=[Lp=t,Up=t]);n<qp&&(qp=n),n>Dp&&(Dp=n),Yp=e,Op=t}function vr(){Rd.point=dr}function _r(){jp[0]=Lp,jp[1]=Up,Rd.point=pr,Yp=null}function yr(t,n){if(Yp){var e=t-Op;Pd.add(dd(e)>180?e+(e>0?360:-360):e)}else Fp=t,Ip=n;zd.point(t,n),dr(t,n)}function gr(){zd.lineStart()}function mr(){yr(Fp,Ip),zd.lineEnd(),dd(Pd)>ad&&(Lp=-(Up=180)),jp[0]=Lp,jp[1]=Up,Yp=null}function xr(t,n){return(n-=t)<0?n+360:n}function br(t,n){return t[0]-n[0]}function wr(t,n){return t[0]<=t[1]?t[0]<=n&&n<=t[1]:n<t[0]||t[1]<n}function Mr(t,n){t*=pd;var e=yd(n*=pd);Tr(e*yd(t),e*wd(t),wd(n))}function Tr(t,n,e){$p+=(t-$p)/++Hp,Vp+=(n-Vp)/Hp,Wp+=(e-Wp)/Hp}function kr(){Ld.point=Nr}function Nr(t,n){t*=pd;var e=yd(n*=pd);rd=e*yd(t),id=e*wd(t),od=wd(n),Ld.point=Sr,Tr(rd,id,od)}function Sr(t,n){t*=pd;var e=yd(n*=pd),r=e*yd(t),i=e*wd(t),o=wd(n),u=_d(Td((u=id*o-od*i)*u+(u=od*r-rd*o)*u+(u=rd*i-id*r)*u),rd*r+id*i+od*o);Xp+=u,Zp+=u*(rd+(rd=r)),Gp+=u*(id+(id=i)),Jp+=u*(od+(od=o)),Tr(rd,id,od)}function Er(){Ld.point=Mr}function Ar(){Ld.point=zr}function Cr(){Pr(nd,ed),Ld.point=Mr}function zr(t,n){nd=t,ed=n,t*=pd,n*=pd,Ld.point=Pr;var e=yd(n);rd=e*yd(t),id=e*wd(t),od=wd(n),Tr(rd,id,od)}function Pr(t,n){t*=pd;var e=yd(n*=pd),r=e*yd(t),i=e*wd(t),o=wd(n),u=id*o-od*i,a=od*r-rd*o,c=rd*i-id*r,s=Td(u*u+a*a+c*c),f=Ge(s),l=s&&-f/s;Qp+=l*u,Kp+=l*a,td+=l*c,Xp+=f,Zp+=f*(rd+(rd=r)),Gp+=f*(id+(id=i)),Jp+=f*(od+(od=o)),Tr(rd,id,od)}function Rr(t,n){return[t>cd?t-ld:t<-cd?t+ld:t,n]}function Lr(t,n,e){return(t%=ld)?n||e?Ud(Ur(t),Dr(n,e)):Ur(t):n||e?Dr(n,e):Rr}function qr(t){return function(n,e){return n+=t,[n>cd?n-ld:n<-cd?n+ld:n,e]}}function Ur(t){var n=qr(t);return n.invert=qr(-t),n}function Dr(t,n){function e(t,n){var e=yd(n),a=yd(t)*e,c=wd(t)*e,s=wd(n),f=s*r+a*i;return[_d(c*o-f*u,a*r-s*i),Ge(f*o+c*u)]}var r=yd(t),i=wd(t),o=yd(n),u=wd(n);return e.invert=function(t,n){var e=yd(n),a=yd(t)*e,c=wd(t)*e,s=wd(n),f=s*o-c*u;return[_d(c*o+s*u,a*r+f*i),Ge(f*r-a*i)]},e}function Or(t,n,e,r,i,o){if(e){var u=yd(n),a=wd(n),c=r*e;null==i?(i=n+r*ld,o=n-c/2):(i=Fr(u,i),o=Fr(u,o),(r>0?i<o:i>o)&&(i+=r*ld));for(var s,f=i;r>0?f>o:f<o;f-=c)s=ur([u,-a*yd(f),-a*wd(f)]),t.point(s[0],s[1])}}function Fr(t,n){(n=ar(n))[0]-=t,hr(n);var e=Ze(-n[1]);return((-n[2]<0?-e:e)+ld-ad)%ld}function Ir(t,n,e,r){this.x=t,this.z=n,this.o=e,this.e=r,this.v=!1,this.n=this.p=null}function Yr(t){if(n=t.length){for(var n,e,r=0,i=t[0];++r<n;)i.n=e=t[r],e.p=i,i=e;i.n=e=t[0],e.p=i}}function Br(t,n,e,r){function i(i,o){return t<=i&&i<=e&&n<=o&&o<=r}function o(i,o,a,s){var f=0,l=0;if(null==i||(f=u(i,a))!==(l=u(o,a))||c(i,o)<0^a>0)do{s.point(0===f||3===f?t:e,f>1?r:n)}while((f=(f+a+4)%4)!==l);else s.point(o[0],o[1])}function u(r,i){return dd(r[0]-t)<ad?i>0?0:3:dd(r[0]-e)<ad?i>0?2:1:dd(r[1]-n)<ad?i>0?1:0:i>0?3:2}function a(t,n){return c(t.x,n.x)}function c(t,n){var e=u(t,1),r=u(n,1);return e!==r?e-r:0===e?n[1]-t[1]:1===e?t[0]-n[0]:2===e?t[1]-n[1]:n[0]-t[0]}return function(u){function c(t,n){i(t,n)&&w.point(t,n)}function s(){for(var n=0,e=0,i=h.length;e<i;++e)for(var o,u,a=h[e],c=1,s=a.length,f=a[0],l=f[0],p=f[1];c<s;++c)o=l,u=p,l=(f=a[c])[0],p=f[1],u<=r?p>r&&(l-o)*(r-u)>(p-u)*(t-o)&&++n:p<=r&&(l-o)*(r-u)<(p-u)*(t-o)&&--n;return n}function f(o,u){var a=i(o,u);if(h&&p.push([o,u]),x)d=o,v=u,_=a,x=!1,a&&(w.lineStart(),w.point(o,u));else if(a&&m)w.point(o,u);else{var c=[y=Math.max(tv,Math.min(Kd,y)),g=Math.max(tv,Math.min(Kd,g))],s=[o=Math.max(tv,Math.min(Kd,o)),u=Math.max(tv,Math.min(Kd,u))];Gd(c,s,t,n,e,r)?(m||(w.lineStart(),w.point(c[0],c[1])),w.point(s[0],s[1]),a||w.lineEnd(),b=!1):a&&(w.lineStart(),w.point(o,u),b=!1)}y=o,g=u,m=a}var l,h,p,d,v,_,y,g,m,x,b,w=u,M=Zd(),T={point:c,lineStart:function(){T.point=f,h&&h.push(p=[]),x=!0,m=!1,y=g=NaN},lineEnd:function(){l&&(f(d,v),_&&m&&M.rejoin(),l.push(M.result())),T.point=c,m&&w.lineEnd()},polygonStart:function(){w=M,l=[],h=[],b=!0},polygonEnd:function(){var t=s(),n=b&&t,e=(l=Cs(l)).length;(n||e)&&(u.polygonStart(),n&&(u.lineStart(),o(null,null,1,u),u.lineEnd()),e&&Qd(l,a,t,o,u),u.polygonEnd()),w=u,l=h=p=null}};return T}}function jr(){iv.point=iv.lineEnd=Qe}function Hr(t,n){Dd=t*=pd,Od=wd(n*=pd),Fd=yd(n),iv.point=Xr}function Xr(t,n){t*=pd;var e=wd(n*=pd),r=yd(n),i=dd(t-Dd),o=yd(i),u=r*wd(i),a=Fd*e-Od*r*o,c=Od*e+Fd*r*o;rv.add(_d(Td(u*u+a*a),c)),Dd=t,Od=e,Fd=r}function $r(t,n){return!(!t||!fv.hasOwnProperty(t.type))&&fv[t.type](t,n)}function Vr(t,n){return 0===cv(t,n)}function Wr(t,n){var e=cv(t[0],t[1]);return cv(t[0],n)+cv(n,t[1])<=e+ad}function Zr(t,n){return!!ev(t.map(Gr),Jr(n))}function Gr(t){return(t=t.map(Jr)).pop(),t}function Jr(t){return[t[0]*pd,t[1]*pd]}function Qr(t,n,e){var r=Ms(t,n-ad,e).concat(n);return function(t){return r.map(function(n){return[t,n]})}}function Kr(t,n,e){var r=Ms(t,n-ad,e).concat(n);return function(t){return r.map(function(n){return[n,t]})}}function ti(){function t(){return{type:"MultiLineString",coordinates:n()}}function n(){return Ms(gd(o/_)*_,i,_).map(h).concat(Ms(gd(s/y)*y,c,y).map(p)).concat(Ms(gd(r/d)*d,e,d).filter(function(t){return dd(t%_)>ad}).map(f)).concat(Ms(gd(a/v)*v,u,v).filter(function(t){return dd(t%y)>ad}).map(l))}var e,r,i,o,u,a,c,s,f,l,h,p,d=10,v=d,_=90,y=360,g=2.5;return t.lines=function(){return n().map(function(t){return{type:"LineString",coordinates:t}})},t.outline=function(){return{type:"Polygon",coordinates:[h(o).concat(p(c).slice(1),h(i).reverse().slice(1),p(s).reverse().slice(1))]}},t.extent=function(n){return arguments.length?t.extentMajor(n).extentMinor(n):t.extentMinor()},t.extentMajor=function(n){return arguments.length?(o=+n[0][0],i=+n[1][0],s=+n[0][1],c=+n[1][1],o>i&&(n=o,o=i,i=n),s>c&&(n=s,s=c,c=n),t.precision(g)):[[o,s],[i,c]]},t.extentMinor=function(n){return arguments.length?(r=+n[0][0],e=+n[1][0],a=+n[0][1],u=+n[1][1],r>e&&(n=r,r=e,e=n),a>u&&(n=a,a=u,u=n),t.precision(g)):[[r,a],[e,u]]},t.step=function(n){return arguments.length?t.stepMajor(n).stepMinor(n):t.stepMinor()},t.stepMajor=function(n){return arguments.length?(_=+n[0],y=+n[1],t):[_,y]},t.stepMinor=function(n){return arguments.length?(d=+n[0],v=+n[1],t):[d,v]},t.precision=function(n){return arguments.length?(g=+n,f=Qr(a,u,90),l=Kr(r,e,g),h=Qr(s,c,90),p=Kr(o,i,g),t):g},t.extentMajor([[-180,-90+ad],[180,90-ad]]).extentMinor([[-180,-80-ad],[180,80+ad]])}function ni(){dv.point=ei}function ei(t,n){dv.point=ri,Id=Bd=t,Yd=jd=n}function ri(t,n){pv.add(jd*t-Bd*n),Bd=t,jd=n}function ii(){ri(Id,Yd)}function oi(t,n){xv+=t,bv+=n,++wv}function ui(){Av.point=ai}function ai(t,n){Av.point=ci,oi($d=t,Vd=n)}function ci(t,n){var e=t-$d,r=n-Vd,i=Td(e*e+r*r);Mv+=i*($d+t)/2,Tv+=i*(Vd+n)/2,kv+=i,oi($d=t,Vd=n)}function si(){Av.point=oi}function fi(){Av.point=hi}function li(){pi(Hd,Xd)}function hi(t,n){Av.point=pi,oi(Hd=$d=t,Xd=Vd=n)}function pi(t,n){var e=t-$d,r=n-Vd,i=Td(e*e+r*r);Mv+=i*($d+t)/2,Tv+=i*(Vd+n)/2,kv+=i,Nv+=(i=Vd*t-$d*n)*($d+t),Sv+=i*(Vd+n),Ev+=3*i,oi($d=t,Vd=n)}function di(t){this._context=t}function vi(t,n){Uv.point=_i,zv=Rv=t,Pv=Lv=n}function _i(t,n){Rv-=t,Lv-=n,qv.add(Td(Rv*Rv+Lv*Lv)),Rv=t,Lv=n}function yi(){this._string=[]}function gi(t){return"m0,"+t+"a"+t+","+t+" 0 1,1 0,"+-2*t+"a"+t+","+t+" 0 1,1 0,"+2*t+"z"}function mi(t){return t.length>1}function xi(t,n){return((t=t.x)[0]<0?t[1]-sd-ad:sd-t[1])-((n=n.x)[0]<0?n[1]-sd-ad:sd-n[1])}function bi(t,n,e,r){var i,o,u=wd(t-e);return dd(u)>ad?vd((wd(n)*(o=yd(r))*wd(e)-wd(r)*(i=yd(n))*wd(t))/(i*o*u)):(n+r)/2}function wi(t){return function(n){var e=new Mi;for(var r in t)e[r]=t[r];return e.stream=n,e}}function Mi(){}function Ti(t,n,e){var r=n[1][0]-n[0][0],i=n[1][1]-n[0][1],o=t.clipExtent&&t.clipExtent();t.scale(150).translate([0,0]),null!=o&&t.clipExtent(null),Ed(e,t.stream(mv));var u=mv.result(),a=Math.min(r/(u[1][0]-u[0][0]),i/(u[1][1]-u[0][1])),c=+n[0][0]+(r-a*(u[1][0]+u[0][0]))/2,s=+n[0][1]+(i-a*(u[1][1]+u[0][1]))/2;return null!=o&&t.clipExtent(o),t.scale(150*a).translate([c,s])}function ki(t,n,e){return Ti(t,[[0,0],n],e)}function Ni(t){return wi({point:function(n,e){n=t(n,e),this.stream.point(n[0],n[1])}})}function Si(t,n){function e(r,i,o,u,a,c,s,f,l,h,p,d,v,_){var y=s-r,g=f-i,m=y*y+g*g;if(m>4*n&&v--){var x=u+h,b=a+p,w=c+d,M=Td(x*x+b*b+w*w),T=Ge(w/=M),k=dd(dd(w)-1)<ad||dd(o-l)<ad?(o+l)/2:_d(b,x),N=t(k,T),S=N[0],E=N[1],A=S-r,C=E-i,z=g*A-y*C;(z*z/m>n||dd((y*A+g*C)/m-.5)>.3||u*h+a*p+c*d<Yv)&&(e(r,i,o,u,a,c,S,E,k,x/=M,b/=M,w,v,_),_.point(S,E),e(S,E,k,x,b,w,s,f,l,h,p,d,v,_))}}return function(n){function r(e,r){e=t(e,r),n.point(e[0],e[1])}function i(){y=NaN,w.point=o,n.lineStart()}function o(r,i){var o=ar([r,i]),u=t(r,i);e(y,g,_,m,x,b,y=u[0],g=u[1],_=r,m=o[0],x=o[1],b=o[2],Iv,n),n.point(y,g)}function u(){w.point=r,n.lineEnd()}function a(){i(),w.point=c,w.lineEnd=s}function c(t,n){o(f=t,n),l=y,h=g,p=m,d=x,v=b,w.point=o}function s(){e(y,g,_,m,x,b,l,h,f,p,d,v,Iv,n),w.lineEnd=u,u()}var f,l,h,p,d,v,_,y,g,m,x,b,w={point:r,lineStart:i,lineEnd:u,polygonStart:function(){n.polygonStart(),w.lineStart=a},polygonEnd:function(){n.polygonEnd(),w.lineStart=i}};return w}}function Ei(t){return Ai(function(){return t})()}function Ai(t){function n(t){return t=f(t[0]*pd,t[1]*pd),[t[0]*_+a,c-t[1]*_]}function e(t){return(t=f.invert((t[0]-a)/_,(c-t[1])/_))&&[t[0]*hd,t[1]*hd]}function r(t,n){return t=u(t,n),[t[0]*_+a,c-t[1]*_]}function i(){f=Ud(s=Lr(b,w,M),u);var t=u(m,x);return a=y-t[0]*_,c=g+t[1]*_,o()}function o(){return d=v=null,n}var u,a,c,s,f,l,h,p,d,v,_=150,y=480,g=250,m=0,x=0,b=0,w=0,M=0,T=null,k=Ov,N=null,S=lv,E=.5,A=Bv(r,E);return n.stream=function(t){return d&&v===t?d:d=jv(k(s,A(S(v=t))))},n.clipAngle=function(t){return arguments.length?(k=+t?Fv(T=t*pd,6*pd):(T=null,Ov),o()):T*hd},n.clipExtent=function(t){return arguments.length?(S=null==t?(N=l=h=p=null,lv):Br(N=+t[0][0],l=+t[0][1],h=+t[1][0],p=+t[1][1]),o()):null==N?null:[[N,l],[h,p]]},n.scale=function(t){return arguments.length?(_=+t,i()):_},n.translate=function(t){return arguments.length?(y=+t[0],g=+t[1],i()):[y,g]},n.center=function(t){return arguments.length?(m=t[0]%360*pd,x=t[1]%360*pd,i()):[m*hd,x*hd]},n.rotate=function(t){return arguments.length?(b=t[0]%360*pd,w=t[1]%360*pd,M=t.length>2?t[2]%360*pd:0,i()):[b*hd,w*hd,M*hd]},n.precision=function(t){return arguments.length?(A=Bv(r,E=t*t),o()):Td(E)},n.fitExtent=function(t,e){return Ti(n,t,e)},n.fitSize=function(t,e){return ki(n,t,e)},function(){return u=t.apply(this,arguments),n.invert=u.invert&&e,i()}}function Ci(t){var n=0,e=cd/3,r=Ai(t),i=r(n,e);return i.parallels=function(t){return arguments.length?r(n=t[0]*pd,e=t[1]*pd):[n*hd,e*hd]},i}function zi(t){function n(t,n){return[t*e,wd(n)/e]}var e=yd(t);return n.invert=function(t,n){return[t/e,Ge(n*e)]},n}function Pi(t,n){function e(t,n){var e=Td(o-2*i*wd(n))/i;return[e*wd(t*=i),u-e*yd(t)]}var r=wd(t),i=(r+wd(n))/2;if(dd(i)<ad)return zi(t);var o=1+r*(2*i-r),u=Td(o)/i;return e.invert=function(t,n){var e=u-n;return[_d(t,dd(e))/i*Md(e),Ge((o-(t*t+e*e)*i*i)/(2*i))]},e}function Ri(t){var n=t.length;return{point:function(e,r){for(var i=-1;++i<n;)t[i].point(e,r)},sphere:function(){for(var e=-1;++e<n;)t[e].sphere()},lineStart:function(){for(var e=-1;++e<n;)t[e].lineStart()},lineEnd:function(){for(var e=-1;++e<n;)t[e].lineEnd()},polygonStart:function(){for(var e=-1;++e<n;)t[e].polygonStart()},polygonEnd:function(){for(var e=-1;++e<n;)t[e].polygonEnd()}}}function Li(t){return function(n,e){var r=yd(n),i=yd(e),o=t(r*i);return[o*i*wd(n),o*wd(e)]}}function qi(t){return function(n,e){var r=Td(n*n+e*e),i=t(r),o=wd(i),u=yd(i);return[_d(n*o,r*u),Ge(r&&e*o/r)]}}function Ui(t,n){return[t,xd(kd((sd+n)/2))]}function Di(t){function n(){var n=cd*a(),u=o(Wd(o.rotate()).invert([0,0]));return s(null==f?[[u[0]-n,u[1]-n],[u[0]+n,u[1]+n]]:t===Ui?[[Math.max(u[0]-n,f),e],[Math.min(u[0]+n,r),i]]:[[f,Math.max(u[1]-n,e)],[r,Math.min(u[1]+n,i)]])}var e,r,i,o=Ei(t),u=o.center,a=o.scale,c=o.translate,s=o.clipExtent,f=null;return o.scale=function(t){return arguments.length?(a(t),n()):a()},o.translate=function(t){return arguments.length?(c(t),n()):c()},o.center=function(t){return arguments.length?(u(t),n()):u()},o.clipExtent=function(t){return arguments.length?(null==t?f=e=r=i=null:(f=+t[0][0],e=+t[0][1],r=+t[1][0],i=+t[1][1]),n()):null==f?null:[[f,e],[r,i]]},n()}function Oi(t){return kd((sd+t)/2)}function Fi(t,n){function e(t,n){o>0?n<-sd+ad&&(n=-sd+ad):n>sd-ad&&(n=sd-ad);var e=o/bd(Oi(n),i);return[e*wd(i*t),o-e*yd(i*t)]}var r=yd(t),i=t===n?wd(t):xd(r/yd(n))/xd(Oi(n)/Oi(t)),o=r*bd(Oi(t),i)/i;return i?(e.invert=function(t,n){var e=o-n,r=Md(i)*Td(t*t+e*e);return[_d(t,dd(e))/i*Md(e),2*vd(bd(o/r,1/i))-sd]},e):Ui}function Ii(t,n){return[t,n]}function Yi(t,n){function e(t,n){var e=o-n,r=i*t;return[e*wd(r),o-e*yd(r)]}var r=yd(t),i=t===n?wd(t):(r-yd(n))/(n-t),o=r/i+t;return dd(i)<ad?Ii:(e.invert=function(t,n){var e=o-n;return[_d(t,dd(e))/i*Md(e),o-Md(i)*Td(t*t+e*e)]},e)}function Bi(t,n){var e=yd(n),r=yd(t)*e;return[e*wd(t)/r,wd(n)/r]}function ji(t,n,e,r){return 1===t&&1===n&&0===e&&0===r?lv:wi({point:function(i,o){this.stream.point(i*t+e,o*n+r)}})}function Hi(t,n){return[yd(n)*wd(t),wd(n)]}function Xi(t,n){var e=yd(n),r=1+yd(t)*e;return[e*wd(t)/r,wd(n)/r]}function $i(t,n){return[xd(kd((sd+n)/2)),-t]}function Vi(t,n){return t.parent===n.parent?1:2}function Wi(t){return t.reduce(Zi,0)/t.length}function Zi(t,n){return t+n.x}function Gi(t){return 1+t.reduce(Ji,0)}function Ji(t,n){return Math.max(t,n.y)}function Qi(t){for(var n;n=t.children;)t=n[0];return t}function Ki(t){for(var n;n=t.children;)t=n[n.length-1];return t}function to(t){var n=0,e=t.children,r=e&&e.length;if(r)for(;--r>=0;)n+=e[r].value;else n=1;t.value=n}function no(t,n){if(t===n)return t;var e=t.ancestors(),r=n.ancestors(),i=null;for(t=e.pop(),n=r.pop();t===n;)i=t,t=e.pop(),n=r.pop();return i}function eo(t,n){var e,r,i,o,u,a=new uo(t),c=+t.value&&(a.value=t.value),s=[a];for(null==n&&(n=ro);e=s.pop();)if(c&&(e.value=+e.data.value),(i=n(e.data))&&(u=i.length))for(e.children=new Array(u),o=u-1;o>=0;--o)s.push(r=e.children[o]=new uo(i[o])),r.parent=e,r.depth=e.depth+1;return a.eachBefore(oo)}function ro(t){return t.children}function io(t){t.data=t.data.data}function oo(t){var n=0;do{t.height=n}while((t=t.parent)&&t.height<++n)}function uo(t){this.data=t,this.depth=this.height=0,this.parent=null}function ao(t){for(var n,e,r=t.length;r;)e=Math.random()*r--|0,n=t[r],t[r]=t[e],t[e]=n;return t}function co(t,n){var e,r;if(lo(n,t))return[n];for(e=0;e<t.length;++e)if(so(n,t[e])&&lo(vo(t[e],n),t))return[t[e],n];for(e=0;e<t.length-1;++e)for(r=e+1;r<t.length;++r)if(so(vo(t[e],t[r]),n)&&so(vo(t[e],n),t[r])&&so(vo(t[r],n),t[e])&&lo(_o(t[e],t[r],n),t))return[t[e],t[r],n];throw new Error}function so(t,n){var e=t.r-n.r,r=n.x-t.x,i=n.y-t.y;return e<0||e*e<r*r+i*i}function fo(t,n){var e=t.r-n.r+1e-6,r=n.x-t.x,i=n.y-t.y;return e>0&&e*e>r*r+i*i}function lo(t,n){for(var e=0;e<n.length;++e)if(!fo(t,n[e]))return!1;return!0}function ho(t){switch(t.length){case 1:return po(t[0]);case 2:return vo(t[0],t[1]);case 3:return _o(t[0],t[1],t[2])}}function po(t){return{x:t.x,y:t.y,r:t.r}}function vo(t,n){var e=t.x,r=t.y,i=t.r,o=n.x,u=n.y,a=n.r,c=o-e,s=u-r,f=a-i,l=Math.sqrt(c*c+s*s);return{x:(e+o+c/l*f)/2,y:(r+u+s/l*f)/2,r:(l+i+a)/2}}function _o(t,n,e){var r=t.x,i=t.y,o=t.r,u=n.x,a=n.y,c=n.r,s=e.x,f=e.y,l=e.r,h=r-u,p=r-s,d=i-a,v=i-f,_=c-o,y=l-o,g=r*r+i*i-o*o,m=g-u*u-a*a+c*c,x=g-s*s-f*f+l*l,b=p*d-h*v,w=(d*x-v*m)/(2*b)-r,M=(v*_-d*y)/b,T=(p*m-h*x)/(2*b)-i,k=(h*y-p*_)/b,N=M*M+k*k-1,S=2*(o+w*M+T*k),E=w*w+T*T-o*o,A=-(N?(S+Math.sqrt(S*S-4*N*E))/(2*N):E/S);return{x:r+w+M*A,y:i+T+k*A,r:A}}function yo(t,n,e){var r=t.x,i=t.y,o=n.r+e.r,u=t.r+e.r,a=n.x-r,c=n.y-i,s=a*a+c*c;if(s){var f=.5+((u*=u)-(o*=o))/(2*s),l=Math.sqrt(Math.max(0,2*o*(u+s)-(u-=s)*u-o*o))/(2*s);e.x=r+f*a+l*c,e.y=i+f*c-l*a}else e.x=r+u,e.y=i}function go(t,n){var e=n.x-t.x,r=n.y-t.y,i=t.r+n.r;return i*i-1e-6>e*e+r*r}function mo(t){var n=t._,e=t.next._,r=n.r+e.r,i=(n.x*e.r+e.x*n.r)/r,o=(n.y*e.r+e.y*n.r)/r;return i*i+o*o}function xo(t){this._=t,this.next=null,this.previous=null}function bo(t){if(!(i=t.length))return 0;var n,e,r,i,o,u,a,c,s,f,l;if(n=t[0],n.x=0,n.y=0,!(i>1))return n.r;if(e=t[1],n.x=-e.r,e.x=n.r,e.y=0,!(i>2))return n.r+e.r;yo(e,n,r=t[2]),n=new xo(n),e=new xo(e),r=new xo(r),n.next=r.previous=e,e.next=n.previous=r,r.next=e.previous=n;t:for(a=3;a<i;++a){yo(n._,e._,r=t[a]),r=new xo(r),c=e.next,s=n.previous,f=e._.r,l=n._.r;do{if(f<=l){if(go(c._,r._)){e=c,n.next=e,e.previous=n,--a;continue t}f+=c._.r,c=c.next}else{if(go(s._,r._)){(n=s).next=e,e.previous=n,--a;continue t}l+=s._.r,s=s.previous}}while(c!==s.next);for(r.previous=n,r.next=e,n.next=e.previous=e=r,o=mo(n);(r=r.next)!==e;)(u=mo(r))<o&&(n=r,o=u);e=n.next}for(n=[e._],r=e;(r=r.next)!==e;)n.push(r._);for(r=Zv(n),a=0;a<i;++a)n=t[a],n.x-=r.x,n.y-=r.y;return r.r}function wo(t){return null==t?null:Mo(t)}function Mo(t){if("function"!=typeof t)throw new Error;return t}function To(){return 0}function ko(t){return Math.sqrt(t.value)}function No(t){return function(n){n.children||(n.r=Math.max(0,+t(n)||0))}}function So(t,n){return function(e){if(r=e.children){var r,i,o,u=r.length,a=t(e)*n||0;if(a)for(i=0;i<u;++i)r[i].r+=a;if(o=bo(r),a)for(i=0;i<u;++i)r[i].r-=a;e.r=o+a}}}function Eo(t){return function(n){var e=n.parent;n.r*=t,e&&(n.x=e.x+t*n.x,n.y=e.y+t*n.y)}}function Ao(t){return t.id}function Co(t){return t.parentId}function zo(t,n){return t.parent===n.parent?1:2}function Po(t){var n=t.children;return n?n[0]:t.t}function Ro(t){var n=t.children;return n?n[n.length-1]:t.t}function Lo(t,n,e){var r=e/(n.i-t.i);n.c-=r,n.s+=e,t.c+=r,n.z+=e,n.m+=e}function qo(t){for(var n,e=0,r=0,i=t.children,o=i.length;--o>=0;)(n=i[o]).z+=e,n.m+=e,e+=n.s+(r+=n.c)}function Uo(t,n,e){return t.a.parent===n.parent?t.a:e}function Do(t,n){this._=t,this.parent=null,this.children=null,this.A=null,this.a=this,this.z=0,this.m=0,this.c=0,this.s=0,this.t=null,this.i=n}function Oo(t){for(var n,e,r,i,o,u=new Do(t,0),a=[u];n=a.pop();)if(r=n._.children)for(n.children=new Array(o=r.length),i=o-1;i>=0;--i)a.push(e=n.children[i]=new Do(r[i],i)),e.parent=n;return(u.parent=new Do(null,0)).children=[u],u}function Fo(t,n,e,r,i,o){for(var u,a,c,s,f,l,h,p,d,v,_,y=[],g=n.children,m=0,x=0,b=g.length,w=n.value;m<b;){c=i-e,s=o-r;do{f=g[x++].value}while(!f&&x<b);for(l=h=f,_=f*f*(v=Math.max(s/c,c/s)/(w*t)),d=Math.max(h/_,_/l);x<b;++x){if(f+=a=g[x].value,a<l&&(l=a),a>h&&(h=a),_=f*f*v,(p=Math.max(h/_,_/l))>d){f-=a;break}d=p}y.push(u={value:f,dice:c<s,children:g.slice(m,x)}),u.dice?Qv(u,e,r,i,w?r+=s*f/w:o):e_(u,e,r,w?e+=c*f/w:i,o),w-=f,m=x}return y}function Io(t,n){return t[0]-n[0]||t[1]-n[1]}function Yo(t){for(var n=t.length,e=[0,1],r=2,i=2;i<n;++i){for(;r>1&&u_(t[e[r-2]],t[e[r-1]],t[i])<=0;)--r;e[r++]=i}return e.slice(0,r)}function Bo(t){this._size=t,this._call=this._error=null,this._tasks=[],this._data=[],this._waiting=this._active=this._ended=this._start=0}function jo(t){if(!t._start)try{Ho(t)}catch(n){if(t._tasks[t._ended+t._active-1])$o(t,n);else if(!t._data)throw n}}function Ho(t){for(;t._start=t._waiting&&t._active<t._size;){var n=t._ended+t._active,e=t._tasks[n],r=e.length-1,i=e[r];e[r]=Xo(t,n),--t._waiting,++t._active,e=i.apply(null,e),t._tasks[n]&&(t._tasks[n]=e||c_)}}function Xo(t,n){return function(e,r){t._tasks[n]&&(--t._active,++t._ended,t._tasks[n]=null,null==t._error&&(null!=e?$o(t,e):(t._data[n]=r,t._waiting?jo(t):Vo(t))))}}function $o(t,n){var e,r=t._tasks.length;for(t._error=n,t._data=void 0,t._waiting=NaN;--r>=0;)if((e=t._tasks[r])&&(t._tasks[r]=null,e.abort))try{e.abort()}catch(n){}t._active=NaN,Vo(t)}function Vo(t){if(!t._active&&t._call){var n=t._data;t._data=void 0,t._call(t._error,n)}}function Wo(t){if(null==t)t=1/0;else if(!((t=+t)>=1))throw new Error("invalid concurrency");return new Bo(t)}function Zo(t){return function(n,e){t(null==n?e:null)}}function Go(t){var n=t.responseType;return n&&"text"!==n?t.response:t.responseText}function Jo(t,n){return function(e){return t(e.responseText,n)}}function Qo(t){function n(n){var o=n+"",u=e.get(o);if(!u){if(i!==E_)return i;e.set(o,u=r.push(n))}return t[(u-1)%t.length]}var e=we(),r=[],i=E_;return t=null==t?[]:S_.call(t),n.domain=function(t){if(!arguments.length)return r.slice();r=[],e=we();for(var i,o,u=-1,a=t.length;++u<a;)e.has(o=(i=t[u])+"")||e.set(o,r.push(i));return n},n.range=function(e){return arguments.length?(t=S_.call(e),n):t.slice()},n.unknown=function(t){return arguments.length?(i=t,n):i},n.copy=function(){return Qo().domain(r).range(t).unknown(i)},n}function Ko(){function t(){var t=i().length,r=u[1]<u[0],l=u[r-0],h=u[1-r];n=(h-l)/Math.max(1,t-c+2*s),a&&(n=Math.floor(n)),l+=(h-l-n*(t-c))*f,e=n*(1-c),a&&(l=Math.round(l),e=Math.round(e));var p=Ms(t).map(function(t){return l+n*t});return o(r?p.reverse():p)}var n,e,r=Qo().unknown(void 0),i=r.domain,o=r.range,u=[0,1],a=!1,c=0,s=0,f=.5;return delete r.unknown,r.domain=function(n){return arguments.length?(i(n),t()):i()},r.range=function(n){return arguments.length?(u=[+n[0],+n[1]],t()):u.slice()},r.rangeRound=function(n){return u=[+n[0],+n[1]],a=!0,t()},r.bandwidth=function(){return e},r.step=function(){return n},r.round=function(n){return arguments.length?(a=!!n,t()):a},r.padding=function(n){return arguments.length?(c=s=Math.max(0,Math.min(1,n)),t()):c},r.paddingInner=function(n){return arguments.length?(c=Math.max(0,Math.min(1,n)),t()):c},r.paddingOuter=function(n){return arguments.length?(s=Math.max(0,Math.min(1,n)),t()):s},r.align=function(n){return arguments.length?(f=Math.max(0,Math.min(1,n)),t()):f},r.copy=function(){return Ko().domain(i()).range(u).round(a).paddingInner(c).paddingOuter(s).align(f)},t()}function tu(t){var n=t.copy;return t.padding=t.paddingOuter,delete t.paddingInner,delete t.paddingOuter,t.copy=function(){return tu(n())},t}function nu(t,n){return(n-=t=+t)?function(e){return(e-t)/n}:A_(n)}function eu(t){return function(n,e){var r=t(n=+n,e=+e);return function(t){return t<=n?0:t>=e?1:r(t)}}}function ru(t){return function(n,e){var r=t(n=+n,e=+e);return function(t){return t<=0?n:t>=1?e:r(t)}}}function iu(t,n,e,r){var i=t[0],o=t[1],u=n[0],a=n[1];return o<i?(i=e(o,i),u=r(a,u)):(i=e(i,o),u=r(u,a)),function(t){return u(i(t))}}function ou(t,n,e,r){var i=Math.min(t.length,n.length)-1,o=new Array(i),u=new Array(i),a=-1;for(t[i]<t[0]&&(t=t.slice().reverse(),n=n.slice().reverse());++a<i;)o[a]=e(t[a],t[a+1]),u[a]=r(n[a],n[a+1]);return function(n){var e=hs(t,n,1,i)-1;return u[e](o[e](n))}}function uu(t,n){return n.domain(t.domain()).range(t.range()).interpolate(t.interpolate()).clamp(t.clamp())}function au(t,n){function e(){return i=Math.min(a.length,c.length)>2?ou:iu,o=u=null,r}function r(n){return(o||(o=i(a,c,f?eu(t):t,s)))(+n)}var i,o,u,a=z_,c=z_,s=cl,f=!1;return r.invert=function(t){return(u||(u=i(c,a,nu,f?ru(n):n)))(+t)},r.domain=function(t){return arguments.length?(a=N_.call(t,C_),e()):a.slice()},r.range=function(t){return arguments.length?(c=S_.call(t),e()):c.slice()},r.rangeRound=function(t){return c=S_.call(t),s=sl,e()},r.clamp=function(t){return arguments.length?(f=!!t,e()):f},r.interpolate=function(t){return arguments.length?(s=t,e()):s},e()}function cu(t){var n=t.domain;return t.ticks=function(t){var e=n();return Ss(e[0],e[e.length-1],null==t?10:t)},t.tickFormat=function(t,e){return P_(n(),t,e)},t.nice=function(e){null==e&&(e=10);var i,o=n(),u=0,a=o.length-1,c=o[u],s=o[a];return s<c&&(i=c,c=s,s=i,i=u,u=a,a=i),(i=r(c,s,e))>0?i=r(c=Math.floor(c/i)*i,s=Math.ceil(s/i)*i,e):i<0&&(i=r(c=Math.ceil(c*i)/i,s=Math.floor(s*i)/i,e)),i>0?(o[u]=Math.floor(c/i)*i,o[a]=Math.ceil(s/i)*i,n(o)):i<0&&(o[u]=Math.ceil(c*i)/i,o[a]=Math.floor(s*i)/i,n(o)),t},t}function su(){var t=au(nu,rl);return t.copy=function(){return uu(t,su())},cu(t)}function fu(){function t(t){return+t}var n=[0,1];return t.invert=t,t.domain=t.range=function(e){return arguments.length?(n=N_.call(e,C_),t):n.slice()},t.copy=function(){return fu().domain(n)},cu(t)}function lu(t,n){return(n=Math.log(n/t))?function(e){return Math.log(e/t)/n}:A_(n)}function hu(t,n){return t<0?function(e){return-Math.pow(-n,e)*Math.pow(-t,1-e)}:function(e){return Math.pow(n,e)*Math.pow(t,1-e)}}function pu(t){return isFinite(t)?+("1e"+t):t<0?0:t}function du(t){return 10===t?pu:t===Math.E?Math.exp:function(n){return Math.pow(t,n)}}function vu(t){return t===Math.E?Math.log:10===t&&Math.log10||2===t&&Math.log2||(t=Math.log(t),function(n){return Math.log(n)/t})}function _u(t){return function(n){return-t(-n)}}function yu(){function n(){return o=vu(i),u=du(i),r()[0]<0&&(o=_u(o),u=_u(u)),e}var e=au(lu,hu).domain([1,10]),r=e.domain,i=10,o=vu(10),u=du(10);return e.base=function(t){return arguments.length?(i=+t,n()):i},e.domain=function(t){return arguments.length?(r(t),n()):r()},e.ticks=function(t){var n,e=r(),a=e[0],c=e[e.length-1];(n=c<a)&&(h=a,a=c,c=h);var s,f,l,h=o(a),p=o(c),d=null==t?10:+t,v=[];if(!(i%1)&&p-h<d){if(h=Math.round(h)-1,p=Math.round(p)+1,a>0){for(;h<p;++h)for(f=1,s=u(h);f<i;++f)if(!((l=s*f)<a)){if(l>c)break;v.push(l)}}else for(;h<p;++h)for(f=i-1,s=u(h);f>=1;--f)if(!((l=s*f)<a)){if(l>c)break;v.push(l)}}else v=Ss(h,p,Math.min(p-h,d)).map(u);return n?v.reverse():v},e.tickFormat=function(n,r){if(null==r&&(r=10===i?".0e":","),"function"!=typeof r&&(r=t.format(r)),n===1/0)return r;null==n&&(n=10);var a=Math.max(1,i*n/e.ticks().length);return function(t){var n=t/u(Math.round(o(t)));return n*i<i-.5&&(n*=i),n<=a?r(t):""}},e.nice=function(){return r(R_(r(),{floor:function(t){return u(Math.floor(o(t)))},ceil:function(t){return u(Math.ceil(o(t)))}}))},e.copy=function(){return uu(e,yu().base(i))},e}function gu(t,n){return t<0?-Math.pow(-t,n):Math.pow(t,n)}function mu(){var t=1,n=au(function(n,e){return(e=gu(e,t)-(n=gu(n,t)))?function(r){return(gu(r,t)-n)/e}:A_(e)},function(n,e){return e=gu(e,t)-(n=gu(n,t)),function(r){return gu(n+e*r,1/t)}}),e=n.domain;return n.exponent=function(n){return arguments.length?(t=+n,e(e())):t},n.copy=function(){return uu(n,mu().exponent(t))},cu(n)}function xu(){function t(){var t=0,o=Math.max(1,r.length);for(i=new Array(o-1);++t<o;)i[t-1]=As(e,t/o);return n}function n(t){if(!isNaN(t=+t))return r[hs(i,t)]}var e=[],r=[],i=[];return n.invertExtent=function(t){var n=r.indexOf(t);return n<0?[NaN,NaN]:[n>0?i[n-1]:e[0],n<i.length?i[n]:e[e.length-1]]},n.domain=function(n){if(!arguments.length)return e.slice();e=[];for(var r,i=0,o=n.length;i<o;++i)null==(r=n[i])||isNaN(r=+r)||e.push(r);return e.sort(ss),t()},n.range=function(n){return arguments.length?(r=S_.call(n),t()):r.slice()},n.quantiles=function(){return i.slice()},n.copy=function(){return xu().domain(e).range(r)},n}function bu(){function t(t){if(t<=t)return u[hs(o,t,0,i)]}function n(){var n=-1;for(o=new Array(i);++n<i;)o[n]=((n+1)*r-(n-i)*e)/(i+1);return t}var e=0,r=1,i=1,o=[.5],u=[0,1];return t.domain=function(t){return arguments.length?(e=+t[0],r=+t[1],n()):[e,r]},t.range=function(t){return arguments.length?(i=(u=S_.call(t)).length-1,n()):u.slice()},t.invertExtent=function(t){var n=u.indexOf(t);return n<0?[NaN,NaN]:n<1?[e,o[0]]:n>=i?[o[i-1],r]:[o[n-1],o[n]]},t.copy=function(){return bu().domain([e,r]).range(u)},cu(t)}function wu(){function t(t){if(t<=t)return e[hs(n,t,0,r)]}var n=[.5],e=[0,1],r=1;return t.domain=function(i){return arguments.length?(n=S_.call(i),r=Math.min(n.length,e.length-1),t):n.slice()},t.range=function(i){return arguments.length?(e=S_.call(i),r=Math.min(n.length,e.length-1),t):e.slice()},t.invertExtent=function(t){var r=e.indexOf(t);return[n[r-1],n[r]]},t.copy=function(){return wu().domain(n).range(e)},t}function Mu(t,n,e,r){function i(n){return t(n=new Date(+n)),n}return i.floor=i,i.ceil=function(e){return t(e=new Date(e-1)),n(e,1),t(e),e},i.round=function(t){var n=i(t),e=i.ceil(t);return t-n<e-t?n:e},i.offset=function(t,e){return n(t=new Date(+t),null==e?1:Math.floor(e)),t},i.range=function(e,r,o){var u=[];if(e=i.ceil(e),o=null==o?1:Math.floor(o),!(e<r&&o>0))return u;do{u.push(new Date(+e))}while(n(e,o),t(e),e<r);return u},i.filter=function(e){return Mu(function(n){if(n>=n)for(;t(n),!e(n);)n.setTime(n-1)},function(t,r){if(t>=t)if(r<0)for(;++r<=0;)for(;n(t,-1),!e(t););else for(;--r>=0;)for(;n(t,1),!e(t););})},e&&(i.count=function(n,r){return L_.setTime(+n),q_.setTime(+r),t(L_),t(q_),Math.floor(e(L_,q_))},i.every=function(t){return t=Math.floor(t),isFinite(t)&&t>0?t>1?i.filter(r?function(n){return r(n)%t==0}:function(n){return i.count(0,n)%t==0}):i:null}),i}function Tu(t){return Mu(function(n){n.setDate(n.getDate()-(n.getDay()+7-t)%7),n.setHours(0,0,0,0)},function(t,n){t.setDate(t.getDate()+7*n)},function(t,n){return(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*O_)/F_})}function ku(t){return Mu(function(n){n.setUTCDate(n.getUTCDate()-(n.getUTCDay()+7-t)%7),n.setUTCHours(0,0,0,0)},function(t,n){t.setUTCDate(t.getUTCDate()+7*n)},function(t,n){return(n-t)/F_})}function Nu(t){if(0<=t.y&&t.y<100){var n=new Date(-1,t.m,t.d,t.H,t.M,t.S,t.L);return n.setFullYear(t.y),n}return new Date(t.y,t.m,t.d,t.H,t.M,t.S,t.L)}function Su(t){if(0<=t.y&&t.y<100){var n=new Date(Date.UTC(-1,t.m,t.d,t.H,t.M,t.S,t.L));return n.setUTCFullYear(t.y),n}return new Date(Date.UTC(t.y,t.m,t.d,t.H,t.M,t.S,t.L))}function Eu(t){return{y:t,m:0,d:1,H:0,M:0,S:0,L:0}}function Au(t){function n(t,n){return function(e){var r,i,o,u=[],a=-1,c=0,s=t.length;for(e instanceof Date||(e=new Date(+e));++a<s;)37===t.charCodeAt(a)&&(u.push(t.slice(c,a)),null!=(i=Dy[r=t.charAt(++a)])?r=t.charAt(++a):i="e"===r?" ":"0",(o=n[r])&&(r=o(e,i)),u.push(r),c=a+1);return u.push(t.slice(c,a)),u.join("")}}function e(t,n){return function(e){var i=Eu(1900);if(r(i,t,e+="",0)!=e.length)return null;if("p"in i&&(i.H=i.H%12+12*i.p),"W"in i||"U"in i){"w"in i||(i.w="W"in i?1:0);var o="Z"in i?Su(Eu(i.y)).getUTCDay():n(Eu(i.y)).getDay();i.m=0,i.d="W"in i?(i.w+6)%7+7*i.W-(o+5)%7:i.w+7*i.U-(o+6)%7}return"Z"in i?(i.H+=i.Z/100|0,i.M+=i.Z%100,Su(i)):n(i)}}function r(t,n,e,r){for(var i,o,u=0,a=n.length,c=e.length;u<a;){if(r>=c)return-1;if(37===(i=n.charCodeAt(u++))){if(i=n.charAt(u++),!(o=T[i in Dy?n.charAt(u++):i])||(r=o(t,e,r))<0)return-1}else if(i!=e.charCodeAt(r++))return-1}return r}var i=t.dateTime,o=t.date,u=t.time,a=t.periods,c=t.days,s=t.shortDays,f=t.months,l=t.shortMonths,h=Pu(a),p=Ru(a),d=Pu(c),v=Ru(c),_=Pu(s),y=Ru(s),g=Pu(f),m=Ru(f),x=Pu(l),b=Ru(l),w={a:function(t){return s[t.getDay()]},A:function(t){return c[t.getDay()]},b:function(t){return l[t.getMonth()]},B:function(t){return f[t.getMonth()]},c:null,d:Wu,e:Wu,H:Zu,I:Gu,j:Ju,L:Qu,m:Ku,M:ta,p:function(t){return a[+(t.getHours()>=12)]},S:na,U:ea,w:ra,W:ia,x:null,X:null,y:oa,Y:ua,Z:aa,"%":wa},M={a:function(t){return s[t.getUTCDay()]},A:function(t){return c[t.getUTCDay()]},b:function(t){return l[t.getUTCMonth()]},B:function(t){return f[t.getUTCMonth()]},c:null,d:ca,e:ca,H:sa,I:fa,j:la,L:ha,m:pa,M:da,p:function(t){return a[+(t.getUTCHours()>=12)]},S:va,U:_a,w:ya,W:ga,x:null,X:null,y:ma,Y:xa,Z:ba,"%":wa},T={a:function(t,n,e){var r=_.exec(n.slice(e));return r?(t.w=y[r[0].toLowerCase()],e+r[0].length):-1},A:function(t,n,e){var r=d.exec(n.slice(e));return r?(t.w=v[r[0].toLowerCase()],e+r[0].length):-1},b:function(t,n,e){var r=x.exec(n.slice(e));return r?(t.m=b[r[0].toLowerCase()],e+r[0].length):-1},B:function(t,n,e){var r=g.exec(n.slice(e));return r?(t.m=m[r[0].toLowerCase()],e+r[0].length):-1},c:function(t,n,e){return r(t,i,n,e)},d:Yu,e:Yu,H:ju,I:ju,j:Bu,L:$u,m:Iu,M:Hu,p:function(t,n,e){var r=h.exec(n.slice(e));return r?(t.p=p[r[0].toLowerCase()],e+r[0].length):-1},S:Xu,U:qu,w:Lu,W:Uu,x:function(t,n,e){return r(t,o,n,e)},X:function(t,n,e){return r(t,u,n,e)},y:Ou,Y:Du,Z:Fu,"%":Vu};return w.x=n(o,w),w.X=n(u,w),w.c=n(i,w),M.x=n(o,M),M.X=n(u,M),M.c=n(i,M),{format:function(t){var e=n(t+="",w);return e.toString=function(){return t},e},parse:function(t){var n=e(t+="",Nu);return n.toString=function(){return t},n},utcFormat:function(t){var e=n(t+="",M);return e.toString=function(){return t},e},utcParse:function(t){var n=e(t,Su);return n.toString=function(){return t},n}}}function Cu(t,n,e){var r=t<0?"-":"",i=(r?-t:t)+"",o=i.length;return r+(o<e?new Array(e-o+1).join(n)+i:i)}function zu(t){return t.replace(Iy,"\\$&")}function Pu(t){return new RegExp("^(?:"+t.map(zu).join("|")+")","i")}function Ru(t){for(var n={},e=-1,r=t.length;++e<r;)n[t[e].toLowerCase()]=e;return n}function Lu(t,n,e){var r=Oy.exec(n.slice(e,e+1));return r?(t.w=+r[0],e+r[0].length):-1}function qu(t,n,e){var r=Oy.exec(n.slice(e));return r?(t.U=+r[0],e+r[0].length):-1}function Uu(t,n,e){var r=Oy.exec(n.slice(e));return r?(t.W=+r[0],e+r[0].length):-1}function Du(t,n,e){var r=Oy.exec(n.slice(e,e+4));return r?(t.y=+r[0],e+r[0].length):-1}function Ou(t,n,e){var r=Oy.exec(n.slice(e,e+2));return r?(t.y=+r[0]+(+r[0]>68?1900:2e3),e+r[0].length):-1}function Fu(t,n,e){var r=/^(Z)|([+-]\d\d)(?:\:?(\d\d))?/.exec(n.slice(e,e+6));return r?(t.Z=r[1]?0:-(r[2]+(r[3]||"00")),e+r[0].length):-1}function Iu(t,n,e){var r=Oy.exec(n.slice(e,e+2));return r?(t.m=r[0]-1,e+r[0].length):-1}function Yu(t,n,e){var r=Oy.exec(n.slice(e,e+2));return r?(t.d=+r[0],e+r[0].length):-1}function Bu(t,n,e){var r=Oy.exec(n.slice(e,e+3));return r?(t.m=0,t.d=+r[0],e+r[0].length):-1}function ju(t,n,e){var r=Oy.exec(n.slice(e,e+2));return r?(t.H=+r[0],e+r[0].length):-1}function Hu(t,n,e){var r=Oy.exec(n.slice(e,e+2));return r?(t.M=+r[0],e+r[0].length):-1}function Xu(t,n,e){var r=Oy.exec(n.slice(e,e+2));return r?(t.S=+r[0],e+r[0].length):-1}function $u(t,n,e){var r=Oy.exec(n.slice(e,e+3));return r?(t.L=+r[0],e+r[0].length):-1}function Vu(t,n,e){var r=Fy.exec(n.slice(e,e+1));return r?e+r[0].length:-1}function Wu(t,n){return Cu(t.getDate(),n,2)}function Zu(t,n){return Cu(t.getHours(),n,2)}function Gu(t,n){return Cu(t.getHours()%12||12,n,2)}function Ju(t,n){return Cu(1+$_.count(fy(t),t),n,3)}function Qu(t,n){return Cu(t.getMilliseconds(),n,3)}function Ku(t,n){return Cu(t.getMonth()+1,n,2)}function ta(t,n){return Cu(t.getMinutes(),n,2)}function na(t,n){return Cu(t.getSeconds(),n,2)}function ea(t,n){return Cu(W_.count(fy(t),t),n,2)}function ra(t){return t.getDay()}function ia(t,n){return Cu(Z_.count(fy(t),t),n,2)}function oa(t,n){return Cu(t.getFullYear()%100,n,2)}function ua(t,n){return Cu(t.getFullYear()%1e4,n,4)}function aa(t){var n=t.getTimezoneOffset();return(n>0?"-":(n*=-1,"+"))+Cu(n/60|0,"0",2)+Cu(n%60,"0",2)}function ca(t,n){return Cu(t.getUTCDate(),n,2)}function sa(t,n){return Cu(t.getUTCHours(),n,2)}function fa(t,n){return Cu(t.getUTCHours()%12||12,n,2)}function la(t,n){return Cu(1+_y.count(Ly(t),t),n,3)}function ha(t,n){return Cu(t.getUTCMilliseconds(),n,3)}function pa(t,n){return Cu(t.getUTCMonth()+1,n,2)}function da(t,n){return Cu(t.getUTCMinutes(),n,2)}function va(t,n){return Cu(t.getUTCSeconds(),n,2)}function _a(t,n){return Cu(gy.count(Ly(t),t),n,2)}function ya(t){return t.getUTCDay()}function ga(t,n){return Cu(my.count(Ly(t),t),n,2)}function ma(t,n){return Cu(t.getUTCFullYear()%100,n,2)}function xa(t,n){return Cu(t.getUTCFullYear()%1e4,n,4)}function ba(){return"+0000"}function wa(){return"%"}function Ma(n){return qy=Au(n),t.timeFormat=qy.format,t.timeParse=qy.parse,t.utcFormat=qy.utcFormat,t.utcParse=qy.utcParse,qy}function Ta(t){return new Date(t)}function ka(t){return t instanceof Date?+t:+new Date(+t)}function Na(t,n,e,r,o,u,a,c,s){function f(i){return(a(i)<i?v:u(i)<i?_:o(i)<i?y:r(i)<i?g:n(i)<i?e(i)<i?m:x:t(i)<i?b:w)(i)}function l(n,e,r,o){if(null==n&&(n=10),"number"==typeof n){var u=Math.abs(r-e)/n,a=fs(function(t){return t[2]}).right(M,u);a===M.length?(o=i(e/Zy,r/Zy,n),n=t):a?(o=(a=M[u/M[a-1][2]<M[a][2]/u?a-1:a])[1],n=a[0]):(o=i(e,r,n),n=c)}return null==o?n:n.every(o)}var h=au(nu,rl),p=h.invert,d=h.domain,v=s(".%L"),_=s(":%S"),y=s("%I:%M"),g=s("%I %p"),m=s("%a %d"),x=s("%b %d"),b=s("%B"),w=s("%Y"),M=[[a,1,jy],[a,5,5*jy],[a,15,15*jy],[a,30,30*jy],[u,1,Hy],[u,5,5*Hy],[u,15,15*Hy],[u,30,30*Hy],[o,1,Xy],[o,3,3*Xy],[o,6,6*Xy],[o,12,12*Xy],[r,1,$y],[r,2,2*$y],[e,1,Vy],[n,1,Wy],[n,3,3*Wy],[t,1,Zy]];return h.invert=function(t){return new Date(p(t))},h.domain=function(t){return arguments.length?d(N_.call(t,ka)):d().map(Ta)},h.ticks=function(t,n){var e,r=d(),i=r[0],o=r[r.length-1],u=o<i;return u&&(e=i,i=o,o=e),e=l(t,i,o,n),e=e?e.range(i,o+1):[],u?e.reverse():e},h.tickFormat=function(t,n){return null==n?f:s(n)},h.nice=function(t,n){var e=d();return(t=l(t,e[0],e[e.length-1],n))?d(R_(e,t)):h},h.copy=function(){return uu(h,Na(t,n,e,r,o,u,a,c,s))},h}function Sa(t){var n=t.length;return function(e){return t[Math.max(0,Math.min(n-1,Math.floor(e*n)))]}}function Ea(t){function n(n){var o=(n-e)/(r-e);return t(i?Math.max(0,Math.min(1,o)):o)}var e=0,r=1,i=!1;return n.domain=function(t){return arguments.length?(e=+t[0],r=+t[1],n):[e,r]},n.clamp=function(t){return arguments.length?(i=!!t,n):i},n.interpolator=function(e){return arguments.length?(t=e,n):t},n.copy=function(){return Ea(t).domain([e,r]).clamp(i)},cu(n)}function Aa(t){return t>1?0:t<-1?gg:Math.acos(t)}function Ca(t){return t>=1?mg:t<=-1?-mg:Math.asin(t)}function za(t){return t.innerRadius}function Pa(t){return t.outerRadius}function Ra(t){return t.startAngle}function La(t){return t.endAngle}function qa(t){return t&&t.padAngle}function Ua(t,n,e,r,i,o,u,a){var c=e-t,s=r-n,f=u-i,l=a-o,h=(f*(n-o)-l*(t-i))/(l*c-f*s);return[t+h*c,n+h*s]}function Da(t,n,e,r,i,o,u){var a=t-e,c=n-r,s=(u?o:-o)/_g(a*a+c*c),f=s*c,l=-s*a,h=t+f,p=n+l,d=e+f,v=r+l,_=(h+d)/2,y=(p+v)/2,g=d-h,m=v-p,x=g*g+m*m,b=i-o,w=h*v-d*p,M=(m<0?-1:1)*_g(pg(0,b*b*x-w*w)),T=(w*m-g*M)/x,k=(-w*g-m*M)/x,N=(w*m+g*M)/x,S=(-w*g+m*M)/x,E=T-_,A=k-y,C=N-_,z=S-y;return E*E+A*A>C*C+z*z&&(T=N,k=S),{cx:T,cy:k,x01:-f,y01:-l,x11:T*(i/b-1),y11:k*(i/b-1)}}function Oa(t){this._context=t}function Fa(t){return t[0]}function Ia(t){return t[1]}function Ya(t){this._curve=t}function Ba(t){function n(n){return new Ya(t(n))}return n._curve=t,n}function ja(t){var n=t.curve;return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t.curve=function(t){return arguments.length?n(Ba(t)):n()._curve},t}function Ha(t){return t.source}function Xa(t){return t.target}function $a(t){function n(){var n,a=Cg.call(arguments),c=e.apply(this,a),s=r.apply(this,a);if(u||(u=n=ve()),t(u,+i.apply(this,(a[0]=c,a)),+o.apply(this,a),+i.apply(this,(a[0]=s,a)),+o.apply(this,a)),n)return u=null,n+""||null}var e=Ha,r=Xa,i=Fa,o=Ia,u=null;return n.source=function(t){return arguments.length?(e=t,n):e},n.target=function(t){return arguments.length?(r=t,n):r},n.x=function(t){return arguments.length?(i="function"==typeof t?t:sg(+t),n):i},n.y=function(t){return arguments.length?(o="function"==typeof t?t:sg(+t),n):o},n.context=function(t){return arguments.length?(u=null==t?null:t,n):u},n}function Va(t,n,e,r,i){t.moveTo(n,e),t.bezierCurveTo(n=(n+r)/2,e,n,i,r,i)}function Wa(t,n,e,r,i){t.moveTo(n,e),t.bezierCurveTo(n,e=(e+i)/2,r,e,r,i)}function Za(t,n,e,r,i){var o=Ag(n,e),u=Ag(n,e=(e+i)/2),a=Ag(r,e),c=Ag(r,i);t.moveTo(o[0],o[1]),t.bezierCurveTo(u[0],u[1],a[0],a[1],c[0],c[1])}function Ga(t,n,e){t._context.bezierCurveTo((2*t._x0+t._x1)/3,(2*t._y0+t._y1)/3,(t._x0+2*t._x1)/3,(t._y0+2*t._y1)/3,(t._x0+4*t._x1+n)/6,(t._y0+4*t._y1+e)/6)}function Ja(t){this._context=t}function Qa(t){this._context=t}function Ka(t){this._context=t}function tc(t,n){this._basis=new Ja(t),this._beta=n}function nc(t,n,e){t._context.bezierCurveTo(t._x1+t._k*(t._x2-t._x0),t._y1+t._k*(t._y2-t._y0),t._x2+t._k*(t._x1-n),t._y2+t._k*(t._y1-e),t._x2,t._y2)}function ec(t,n){this._context=t,this._k=(1-n)/6}function rc(t,n){this._context=t,this._k=(1-n)/6}function ic(t,n){this._context=t,this._k=(1-n)/6}function oc(t,n,e){var r=t._x1,i=t._y1,o=t._x2,u=t._y2;if(t._l01_a>yg){var a=2*t._l01_2a+3*t._l01_a*t._l12_a+t._l12_2a,c=3*t._l01_a*(t._l01_a+t._l12_a);r=(r*a-t._x0*t._l12_2a+t._x2*t._l01_2a)/c,i=(i*a-t._y0*t._l12_2a+t._y2*t._l01_2a)/c}if(t._l23_a>yg){var s=2*t._l23_2a+3*t._l23_a*t._l12_a+t._l12_2a,f=3*t._l23_a*(t._l23_a+t._l12_a);o=(o*s+t._x1*t._l23_2a-n*t._l12_2a)/f,u=(u*s+t._y1*t._l23_2a-e*t._l12_2a)/f}t._context.bezierCurveTo(r,i,o,u,t._x2,t._y2)}function uc(t,n){this._context=t,this._alpha=n}function ac(t,n){this._context=t,this._alpha=n}function cc(t,n){this._context=t,this._alpha=n}function sc(t){this._context=t}function fc(t){return t<0?-1:1}function lc(t,n,e){var r=t._x1-t._x0,i=n-t._x1,o=(t._y1-t._y0)/(r||i<0&&-0),u=(e-t._y1)/(i||r<0&&-0),a=(o*i+u*r)/(r+i);return(fc(o)+fc(u))*Math.min(Math.abs(o),Math.abs(u),.5*Math.abs(a))||0}function hc(t,n){var e=t._x1-t._x0;return e?(3*(t._y1-t._y0)/e-n)/2:n}function pc(t,n,e){var r=t._x0,i=t._y0,o=t._x1,u=t._y1,a=(o-r)/3;t._context.bezierCurveTo(r+a,i+a*n,o-a,u-a*e,o,u)}function dc(t){this._context=t}function vc(t){this._context=new _c(t)}function _c(t){this._context=t}function yc(t){this._context=t}function gc(t){var n,e,r=t.length-1,i=new Array(r),o=new Array(r),u=new Array(r);for(i[0]=0,o[0]=2,u[0]=t[0]+2*t[1],n=1;n<r-1;++n)i[n]=1,o[n]=4,u[n]=4*t[n]+2*t[n+1];for(i[r-1]=2,o[r-1]=7,u[r-1]=8*t[r-1]+t[r],n=1;n<r;++n)e=i[n]/o[n-1],o[n]-=e,u[n]-=e*u[n-1];for(i[r-1]=u[r-1]/o[r-1],n=r-2;n>=0;--n)i[n]=(u[n]-i[n+1])/o[n];for(o[r-1]=(t[r]+i[r-1])/2,n=0;n<r-1;++n)o[n]=2*t[n+1]-i[n+1];return[i,o]}function mc(t,n){this._context=t,this._t=n}function xc(t,n){return t[n]}function bc(t){for(var n,e=0,r=-1,i=t.length;++r<i;)(n=+t[r][1])&&(e+=n);return e}function wc(t){return t[0]}function Mc(t){return t[1]}function Tc(){this._=null}function kc(t){t.U=t.C=t.L=t.R=t.P=t.N=null}function Nc(t,n){var e=n,r=n.R,i=e.U;i?i.L===e?i.L=r:i.R=r:t._=r,r.U=i,e.U=r,e.R=r.L,e.R&&(e.R.U=e),r.L=e}function Sc(t,n){var e=n,r=n.L,i=e.U;i?i.L===e?i.L=r:i.R=r:t._=r,r.U=i,e.U=r,e.L=r.R,e.L&&(e.L.U=e),r.R=e}function Ec(t){for(;t.L;)t=t.L;return t}function Ac(t,n,e,r){var i=[null,null],o=lm.push(i)-1;return i.left=t,i.right=n,e&&zc(i,t,n,e),r&&zc(i,n,t,r),sm[t.index].halfedges.push(o),sm[n.index].halfedges.push(o),i}function Cc(t,n,e){var r=[n,e];return r.left=t,r}function zc(t,n,e,r){t[0]||t[1]?t.left===e?t[1]=r:t[0]=r:(t[0]=r,t.left=n,t.right=e)}function Pc(t,n,e,r,i){var o,u=t[0],a=t[1],c=u[0],s=u[1],f=0,l=1,h=a[0]-c,p=a[1]-s;if(o=n-c,h||!(o>0)){if(o/=h,h<0){if(o<f)return;o<l&&(l=o)}else if(h>0){if(o>l)return;o>f&&(f=o)}if(o=r-c,h||!(o<0)){if(o/=h,h<0){if(o>l)return;o>f&&(f=o)}else if(h>0){if(o<f)return;o<l&&(l=o)}if(o=e-s,p||!(o>0)){if(o/=p,p<0){if(o<f)return;o<l&&(l=o)}else if(p>0){if(o>l)return;o>f&&(f=o)}if(o=i-s,p||!(o<0)){if(o/=p,p<0){if(o>l)return;o>f&&(f=o)}else if(p>0){if(o<f)return;o<l&&(l=o)}return!(f>0||l<1)||(f>0&&(t[0]=[c+f*h,s+f*p]),l<1&&(t[1]=[c+l*h,s+l*p]),!0)}}}}}function Rc(t,n,e,r,i){var o=t[1];if(o)return!0;var u,a,c=t[0],s=t.left,f=t.right,l=s[0],h=s[1],p=f[0],d=f[1],v=(l+p)/2,_=(h+d)/2;if(d===h){if(v<n||v>=r)return;if(l>p){if(c){if(c[1]>=i)return}else c=[v,e];o=[v,i]}else{if(c){if(c[1]<e)return}else c=[v,i];o=[v,e]}}else if(u=(l-p)/(d-h),a=_-u*v,u<-1||u>1)if(l>p){if(c){if(c[1]>=i)return}else c=[(e-a)/u,e];o=[(i-a)/u,i]}else{if(c){if(c[1]<e)return}else c=[(i-a)/u,i];o=[(e-a)/u,e]}else if(h<d){if(c){if(c[0]>=r)return}else c=[n,u*n+a];o=[r,u*r+a]}else{if(c){if(c[0]<n)return}else c=[r,u*r+a];o=[n,u*n+a]}return t[0]=c,t[1]=o,!0}function Lc(t,n,e,r){for(var i,o=lm.length;o--;)Rc(i=lm[o],t,n,e,r)&&Pc(i,t,n,e,r)&&(Math.abs(i[0][0]-i[1][0])>dm||Math.abs(i[0][1]-i[1][1])>dm)||delete lm[o]}function qc(t){return sm[t.index]={site:t,halfedges:[]}}function Uc(t,n){var e=t.site,r=n.left,i=n.right;return e===i&&(i=r,r=e),i?Math.atan2(i[1]-r[1],i[0]-r[0]):(e===r?(r=n[1],i=n[0]):(r=n[0],i=n[1]),Math.atan2(r[0]-i[0],i[1]-r[1]))}function Dc(t,n){return n[+(n.left!==t.site)]}function Oc(t,n){return n[+(n.left===t.site)]}function Fc(){for(var t,n,e,r,i=0,o=sm.length;i<o;++i)if((t=sm[i])&&(r=(n=t.halfedges).length)){var u=new Array(r),a=new Array(r);for(e=0;e<r;++e)u[e]=e,a[e]=Uc(t,lm[n[e]]);for(u.sort(function(t,n){return a[n]-a[t]}),e=0;e<r;++e)a[e]=n[u[e]];for(e=0;e<r;++e)n[e]=a[e]}}function Ic(t,n,e,r){var i,o,u,a,c,s,f,l,h,p,d,v,_=sm.length,y=!0;for(i=0;i<_;++i)if(o=sm[i]){for(u=o.site,a=(c=o.halfedges).length;a--;)lm[c[a]]||c.splice(a,1);for(a=0,s=c.length;a<s;)d=(p=Oc(o,lm[c[a]]))[0],v=p[1],l=(f=Dc(o,lm[c[++a%s]]))[0],h=f[1],(Math.abs(d-l)>dm||Math.abs(v-h)>dm)&&(c.splice(a,0,lm.push(Cc(u,p,Math.abs(d-t)<dm&&r-v>dm?[t,Math.abs(l-t)<dm?h:r]:Math.abs(v-r)<dm&&e-d>dm?[Math.abs(h-r)<dm?l:e,r]:Math.abs(d-e)<dm&&v-n>dm?[e,Math.abs(l-e)<dm?h:n]:Math.abs(v-n)<dm&&d-t>dm?[Math.abs(h-n)<dm?l:t,n]:null))-1),++s);s&&(y=!1)}if(y){var g,m,x,b=1/0;for(i=0,y=null;i<_;++i)(o=sm[i])&&(x=(g=(u=o.site)[0]-t)*g+(m=u[1]-n)*m)<b&&(b=x,y=o);if(y){var w=[t,n],M=[t,r],T=[e,r],k=[e,n];y.halfedges.push(lm.push(Cc(u=y.site,w,M))-1,lm.push(Cc(u,M,T))-1,lm.push(Cc(u,T,k))-1,lm.push(Cc(u,k,w))-1)}}for(i=0;i<_;++i)(o=sm[i])&&(o.halfedges.length||delete sm[i])}function Yc(){kc(this),this.x=this.y=this.arc=this.site=this.cy=null}function Bc(t){var n=t.P,e=t.N;if(n&&e){var r=n.site,i=t.site,o=e.site;if(r!==o){var u=i[0],a=i[1],c=r[0]-u,s=r[1]-a,f=o[0]-u,l=o[1]-a,h=2*(c*l-s*f);if(!(h>=-vm)){var p=c*c+s*s,d=f*f+l*l,v=(l*p-s*d)/h,_=(c*d-f*p)/h,y=hm.pop()||new Yc;y.arc=t,y.site=i,y.x=v+u,y.y=(y.cy=_+a)+Math.sqrt(v*v+_*_),t.circle=y;for(var g=null,m=fm._;m;)if(y.y<m.y||y.y===m.y&&y.x<=m.x){if(!m.L){g=m.P;break}m=m.L}else{if(!m.R){g=m;break}m=m.R}fm.insert(g,y),g||(am=y)}}}}function jc(t){var n=t.circle;n&&(n.P||(am=n.N),fm.remove(n),hm.push(n),kc(n),t.circle=null)}function Hc(){kc(this),this.edge=this.site=this.circle=null}function Xc(t){var n=pm.pop()||new Hc;return n.site=t,n}function $c(t){jc(t),cm.remove(t),pm.push(t),kc(t)}function Vc(t){var n=t.circle,e=n.x,r=n.cy,i=[e,r],o=t.P,u=t.N,a=[t];$c(t);for(var c=o;c.circle&&Math.abs(e-c.circle.x)<dm&&Math.abs(r-c.circle.cy)<dm;)o=c.P,a.unshift(c),$c(c),c=o;a.unshift(c),jc(c);for(var s=u;s.circle&&Math.abs(e-s.circle.x)<dm&&Math.abs(r-s.circle.cy)<dm;)u=s.N,a.push(s),$c(s),s=u;a.push(s),jc(s);var f,l=a.length;for(f=1;f<l;++f)s=a[f],c=a[f-1],zc(s.edge,c.site,s.site,i);c=a[0],(s=a[l-1]).edge=Ac(c.site,s.site,null,i),Bc(c),Bc(s)}function Wc(t){for(var n,e,r,i,o=t[0],u=t[1],a=cm._;a;)if((r=Zc(a,u)-o)>dm)a=a.L;else{if(!((i=o-Gc(a,u))>dm)){r>-dm?(n=a.P,e=a):i>-dm?(n=a,e=a.N):n=e=a;break}if(!a.R){n=a;break}a=a.R}qc(t);var c=Xc(t);if(cm.insert(n,c),n||e){if(n===e)return jc(n),e=Xc(n.site),cm.insert(c,e),c.edge=e.edge=Ac(n.site,c.site),Bc(n),void Bc(e);if(e){jc(n),jc(e);var s=n.site,f=s[0],l=s[1],h=t[0]-f,p=t[1]-l,d=e.site,v=d[0]-f,_=d[1]-l,y=2*(h*_-p*v),g=h*h+p*p,m=v*v+_*_,x=[(_*g-p*m)/y+f,(h*m-v*g)/y+l];zc(e.edge,s,d,x),c.edge=Ac(s,t,null,x),e.edge=Ac(t,d,null,x),Bc(n),Bc(e)}else c.edge=Ac(n.site,c.site)}}function Zc(t,n){var e=t.site,r=e[0],i=e[1],o=i-n;if(!o)return r;var u=t.P;if(!u)return-1/0;var a=(e=u.site)[0],c=e[1],s=c-n;if(!s)return a;var f=a-r,l=1/o-1/s,h=f/s;return l?(-h+Math.sqrt(h*h-2*l*(f*f/(-2*s)-c+s/2+i-o/2)))/l+r:(r+a)/2}function Gc(t,n){var e=t.N;if(e)return Zc(e,n);var r=t.site;return r[1]===n?r[0]:1/0}function Jc(t,n,e){return(t[0]-e[0])*(n[1]-t[1])-(t[0]-n[0])*(e[1]-t[1])}function Qc(t,n){return n[1]-t[1]||n[0]-t[0]}function Kc(t,n){var e,r,i,o=t.sort(Qc).pop();for(lm=[],sm=new Array(t.length),cm=new Tc,fm=new Tc;;)if(i=am,o&&(!i||o[1]<i.y||o[1]===i.y&&o[0]<i.x))o[0]===e&&o[1]===r||(Wc(o),e=o[0],r=o[1]),o=t.pop();else{if(!i)break;Vc(i.arc)}if(Fc(),n){var u=+n[0][0],a=+n[0][1],c=+n[1][0],s=+n[1][1];Lc(u,a,c,s),Ic(u,a,c,s)}this.edges=lm,this.cells=sm,cm=fm=lm=sm=null}function ts(t,n,e){this.target=t,this.type=n,this.transform=e}function ns(t,n,e){this.k=t,this.x=n,this.y=e}function es(t){return t.__zoom||ym}function rs(){t.event.stopImmediatePropagation()}function is(){return!t.event.button}function os(){var t,n,e=this;return e instanceof SVGElement?(t=(e=e.ownerSVGElement||e).width.baseVal.value,n=e.height.baseVal.value):(t=e.clientWidth,n=e.clientHeight),[[0,0],[t,n]]}function us(){return this.__zoom||ym}function as(){return-t.event.deltaY*(t.event.deltaMode?120:1)/500}function cs(){return"ontouchstart"in this}var ss=function(t,n){return t<n?-1:t>n?1:t>=n?0:NaN},fs=function(t){return 1===t.length&&(t=n(t)),{left:function(n,e,r,i){for(null==r&&(r=0),null==i&&(i=n.length);r<i;){var o=r+i>>>1;t(n[o],e)<0?r=o+1:i=o}return r},right:function(n,e,r,i){for(null==r&&(r=0),null==i&&(i=n.length);r<i;){var o=r+i>>>1;t(n[o],e)>0?i=o:r=o+1}return r}}},ls=fs(ss),hs=ls.right,ps=ls.left,ds=function(t){return null===t?NaN:+t},vs=function(t,n){var e,r,i=t.length,o=0,u=-1,a=0,c=0;if(null==n)for(;++u<i;)isNaN(e=ds(t[u]))||(c+=(r=e-a)*(e-(a+=r/++o)));else for(;++u<i;)isNaN(e=ds(n(t[u],u,t)))||(c+=(r=e-a)*(e-(a+=r/++o)));if(o>1)return c/(o-1)},_s=function(t,n){var e=vs(t,n);return e?Math.sqrt(e):e},ys=function(t,n){var e,r,i,o=t.length,u=-1;if(null==n){for(;++u<o;)if(null!=(e=t[u])&&e>=e)for(r=i=e;++u<o;)null!=(e=t[u])&&(r>e&&(r=e),i<e&&(i=e))}else for(;++u<o;)if(null!=(e=n(t[u],u,t))&&e>=e)for(r=i=e;++u<o;)null!=(e=n(t[u],u,t))&&(r>e&&(r=e),i<e&&(i=e));return[r,i]},gs=Array.prototype,ms=gs.slice,xs=gs.map,bs=function(t){return function(){return t}},ws=function(t){return t},Ms=function(t,n,e){t=+t,n=+n,e=(i=arguments.length)<2?(n=t,t=0,1):i<3?1:+e;for(var r=-1,i=0|Math.max(0,Math.ceil((n-t)/e)),o=new Array(i);++r<i;)o[r]=t+r*e;return o},Ts=Math.sqrt(50),ks=Math.sqrt(10),Ns=Math.sqrt(2),Ss=function(t,n,e){var i,o,u,a=n<t,c=-1;if(a&&(i=t,t=n,n=i),0===(u=r(t,n,e))||!isFinite(u))return[];if(u>0)for(t=Math.ceil(t/u),n=Math.floor(n/u),o=new Array(i=Math.ceil(n-t+1));++c<i;)o[c]=(t+c)*u;else for(t=Math.floor(t*u),n=Math.ceil(n*u),o=new Array(i=Math.ceil(t-n+1));++c<i;)o[c]=(t-c)/u;return a&&o.reverse(),o},Es=function(t){return Math.ceil(Math.log(t.length)/Math.LN2)+1},As=function(t,n,e){if(null==e&&(e=ds),r=t.length){if((n=+n)<=0||r<2)return+e(t[0],0,t);if(n>=1)return+e(t[r-1],r-1,t);var r,i=(r-1)*n,o=Math.floor(i),u=+e(t[o],o,t);return u+(+e(t[o+1],o+1,t)-u)*(i-o)}},Cs=function(t){for(var n,e,r,i=t.length,o=-1,u=0;++o<i;)u+=t[o].length;for(e=new Array(u);--i>=0;)for(n=(r=t[i]).length;--n>=0;)e[--u]=r[n];return e},zs=function(t,n){var e,r,i=t.length,o=-1;if(null==n){for(;++o<i;)if(null!=(e=t[o])&&e>=e)for(r=e;++o<i;)null!=(e=t[o])&&r>e&&(r=e)}else for(;++o<i;)if(null!=(e=n(t[o],o,t))&&e>=e)for(r=e;++o<i;)null!=(e=n(t[o],o,t))&&r>e&&(r=e);return r},Ps=function(t){if(!(i=t.length))return[];for(var n=-1,e=zs(t,o),r=new Array(e);++n<e;)for(var i,u=-1,a=r[n]=new Array(i);++u<i;)a[u]=t[u][n];return r},Rs=Array.prototype.slice,Ls=function(t){return t},qs=1,Us=2,Ds=3,Os=4,Fs=1e-6,Is={value:function(){}};p.prototype=h.prototype={constructor:p,on:function(t,n){var e,r=this._,i=d(t+"",r),o=-1,u=i.length;{if(!(arguments.length<2)){if(null!=n&&"function"!=typeof n)throw new Error("invalid callback: "+n);for(;++o<u;)if(e=(t=i[o]).type)r[e]=_(r[e],t.name,n);else if(null==n)for(e in r)r[e]=_(r[e],t.name,null);return this}for(;++o<u;)if((e=(t=i[o]).type)&&(e=v(r[e],t.name)))return e}},copy:function(){var t={},n=this._;for(var e in n)t[e]=n[e].slice();return new p(t)},call:function(t,n){if((e=arguments.length-2)>0)for(var e,r,i=new Array(e),o=0;o<e;++o)i[o]=arguments[o+2];if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(o=0,e=(r=this._[t]).length;o<e;++o)r[o].value.apply(n,i)},apply:function(t,n,e){if(!this._.hasOwnProperty(t))throw new Error("unknown type: "+t);for(var r=this._[t],i=0,o=r.length;i<o;++i)r[i].value.apply(n,e)}};var Ys="http://www.w3.org/1999/xhtml",Bs={svg:"http://www.w3.org/2000/svg",xhtml:Ys,xlink:"http://www.w3.org/1999/xlink",xml:"http://www.w3.org/XML/1998/namespace",xmlns:"http://www.w3.org/2000/xmlns/"},js=function(t){var n=t+="",e=n.indexOf(":");return e>=0&&"xmlns"!==(n=t.slice(0,e))&&(t=t.slice(e+1)),Bs.hasOwnProperty(n)?{space:Bs[n],local:t}:t},Hs=function(t){var n=js(t);return(n.local?g:y)(n)},Xs=0;x.prototype=m.prototype={constructor:x,get:function(t){for(var n=this._;!(n in t);)if(!(t=t.parentNode))return;return t[n]},set:function(t,n){return t[this._]=n},remove:function(t){return this._ in t&&delete t[this._]},toString:function(){return this._}};var $s=function(t){return function(){return this.matches(t)}};if("undefined"!=typeof document){var Vs=document.documentElement;if(!Vs.matches){var Ws=Vs.webkitMatchesSelector||Vs.msMatchesSelector||Vs.mozMatchesSelector||Vs.oMatchesSelector;$s=function(t){return function(){return Ws.call(this,t)}}}}var Zs=$s,Gs={};t.event=null,"undefined"!=typeof document&&("onmouseenter"in document.documentElement||(Gs={mouseenter:"mouseover",mouseleave:"mouseout"}));var Js=function(){for(var n,e=t.event;n=e.sourceEvent;)e=n;return e},Qs=function(t,n){var e=t.ownerSVGElement||t;if(e.createSVGPoint){var r=e.createSVGPoint();return r.x=n.clientX,r.y=n.clientY,r=r.matrixTransform(t.getScreenCTM().inverse()),[r.x,r.y]}var i=t.getBoundingClientRect();return[n.clientX-i.left-t.clientLeft,n.clientY-i.top-t.clientTop]},Ks=function(t){var n=Js();return n.changedTouches&&(n=n.changedTouches[0]),Qs(t,n)},tf=function(t){return null==t?S:function(){return this.querySelector(t)}},nf=function(t){return null==t?E:function(){return this.querySelectorAll(t)}},ef=function(t){return new Array(t.length)};A.prototype={constructor:A,appendChild:function(t){return this._parent.insertBefore(t,this._next)},insertBefore:function(t,n){return this._parent.insertBefore(t,n)},querySelector:function(t){return this._parent.querySelector(t)},querySelectorAll:function(t){return this._parent.querySelectorAll(t)}};var rf=function(t){return function(){return t}},of="$",uf=function(t){return t.ownerDocument&&t.ownerDocument.defaultView||t.document&&t||t.defaultView};W.prototype={add:function(t){this._names.indexOf(t)<0&&(this._names.push(t),this._node.setAttribute("class",this._names.join(" ")))},remove:function(t){var n=this._names.indexOf(t);n>=0&&(this._names.splice(n,1),this._node.setAttribute("class",this._names.join(" ")))},contains:function(t){return this._names.indexOf(t)>=0}};var af=[null];pt.prototype=dt.prototype={constructor:pt,select:function(t){"function"!=typeof t&&(t=tf(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u,a=n[i],c=a.length,s=r[i]=new Array(c),f=0;f<c;++f)(o=a[f])&&(u=t.call(o,o.__data__,f,a))&&("__data__"in o&&(u.__data__=o.__data__),s[f]=u);return new pt(r,this._parents)},selectAll:function(t){"function"!=typeof t&&(t=nf(t));for(var n=this._groups,e=n.length,r=[],i=[],o=0;o<e;++o)for(var u,a=n[o],c=a.length,s=0;s<c;++s)(u=a[s])&&(r.push(t.call(u,u.__data__,s,a)),i.push(u));return new pt(r,i)},filter:function(t){"function"!=typeof t&&(t=Zs(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u=n[i],a=u.length,c=r[i]=[],s=0;s<a;++s)(o=u[s])&&t.call(o,o.__data__,s,u)&&c.push(o);return new pt(r,this._parents)},data:function(t,n){if(!t)return p=new Array(this.size()),s=-1,this.each(function(t){p[++s]=t}),p;var e=n?z:C,r=this._parents,i=this._groups;"function"!=typeof t&&(t=rf(t));for(var o=i.length,u=new Array(o),a=new Array(o),c=new Array(o),s=0;s<o;++s){var f=r[s],l=i[s],h=l.length,p=t.call(f,f&&f.__data__,s,r),d=p.length,v=a[s]=new Array(d),_=u[s]=new Array(d);e(f,l,v,_,c[s]=new Array(h),p,n);for(var y,g,m=0,x=0;m<d;++m)if(y=v[m]){for(m>=x&&(x=m+1);!(g=_[x])&&++x<d;);y._next=g||null}}return u=new pt(u,r),u._enter=a,u._exit=c,u},enter:function(){return new pt(this._enter||this._groups.map(ef),this._parents)},exit:function(){return new pt(this._exit||this._groups.map(ef),this._parents)},merge:function(t){for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),u=new Array(r),a=0;a<o;++a)for(var c,s=n[a],f=e[a],l=s.length,h=u[a]=new Array(l),p=0;p<l;++p)(c=s[p]||f[p])&&(h[p]=c);for(;a<r;++a)u[a]=n[a];return new pt(u,this._parents)},order:function(){for(var t=this._groups,n=-1,e=t.length;++n<e;)for(var r,i=t[n],o=i.length-1,u=i[o];--o>=0;)(r=i[o])&&(u&&u!==r.nextSibling&&u.parentNode.insertBefore(r,u),u=r);return this},sort:function(t){t||(t=P);for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i){for(var o,u=n[i],a=u.length,c=r[i]=new Array(a),s=0;s<a;++s)(o=u[s])&&(c[s]=o);c.sort(function(n,e){return n&&e?t(n.__data__,e.__data__):!n-!e})}return new pt(r,this._parents).order()},call:function(){var t=arguments[0];return arguments[0]=this,t.apply(null,arguments),this},nodes:function(){var t=new Array(this.size()),n=-1;return this.each(function(){t[++n]=this}),t},node:function(){for(var t=this._groups,n=0,e=t.length;n<e;++n)for(var r=t[n],i=0,o=r.length;i<o;++i){var u=r[i];if(u)return u}return null},size:function(){var t=0;return this.each(function(){++t}),t},empty:function(){return!this.node()},each:function(t){for(var n=this._groups,e=0,r=n.length;e<r;++e)for(var i,o=n[e],u=0,a=o.length;u<a;++u)(i=o[u])&&t.call(i,i.__data__,u,o);return this},attr:function(t,n){var e=js(t);if(arguments.length<2){var r=this.node();return e.local?r.getAttributeNS(e.space,e.local):r.getAttribute(e)}return this.each((null==n?e.local?L:R:"function"==typeof n?e.local?O:D:e.local?U:q)(e,n))},style:function(t,n,e){return arguments.length>1?this.each((null==n?F:"function"==typeof n?Y:I)(t,n,null==e?"":e)):B(this.node(),t)},property:function(t,n){return arguments.length>1?this.each((null==n?j:"function"==typeof n?X:H)(t,n)):this.node()[t]},classed:function(t,n){var e=$(t+"");if(arguments.length<2){for(var r=V(this.node()),i=-1,o=e.length;++i<o;)if(!r.contains(e[i]))return!1;return!0}return this.each(("function"==typeof n?K:n?J:Q)(e,n))},text:function(t){return arguments.length?this.each(null==t?tt:("function"==typeof t?et:nt)(t)):this.node().textContent},html:function(t){return arguments.length?this.each(null==t?rt:("function"==typeof t?ot:it)(t)):this.node().innerHTML},raise:function(){return this.each(ut)},lower:function(){return this.each(at)},append:function(t){var n="function"==typeof t?t:Hs(t);return this.select(function(){return this.appendChild(n.apply(this,arguments))})},insert:function(t,n){var e="function"==typeof t?t:Hs(t),r=null==n?ct:"function"==typeof n?n:tf(n);return this.select(function(){return this.insertBefore(e.apply(this,arguments),r.apply(this,arguments)||null)})},remove:function(){return this.each(st)},datum:function(t){return arguments.length?this.property("__data__",t):this.node().__data__},on:function(t,n,e){var r,i,o=M(t+""),u=o.length;{if(!(arguments.length<2)){for(a=n?k:T,null==e&&(e=!1),r=0;r<u;++r)this.each(a(o[r],n,e));return this}var a=this.node().__on;if(a)for(var c,s=0,f=a.length;s<f;++s)for(r=0,c=a[s];r<u;++r)if((i=o[r]).type===c.type&&i.name===c.name)return c.value}},dispatch:function(t,n){return this.each(("function"==typeof n?ht:lt)(t,n))}};var cf=function(t){return"string"==typeof t?new pt([[document.querySelector(t)]],[document.documentElement]):new pt([[t]],af)},sf=function(t,n,e){arguments.length<3&&(e=n,n=Js().changedTouches);for(var r,i=0,o=n?n.length:0;i<o;++i)if((r=n[i]).identifier===e)return Qs(t,r);return null},ff=function(){t.event.preventDefault(),t.event.stopImmediatePropagation()},lf=function(t){var n=t.document.documentElement,e=cf(t).on("dragstart.drag",ff,!0);"onselectstart"in n?e.on("selectstart.drag",ff,!0):(n.__noselect=n.style.MozUserSelect,n.style.MozUserSelect="none")},hf=function(t){return function(){return t}};yt.prototype.on=function(){var t=this._.on.apply(this._,arguments);return t===this._?this:t};var pf=function(t,n,e){t.prototype=n.prototype=e,e.constructor=t},df="\\s*([+-]?\\d+)\\s*",vf="\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",_f="\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",yf=/^#([0-9a-f]{3})$/,gf=/^#([0-9a-f]{6})$/,mf=new RegExp("^rgb\\("+[df,df,df]+"\\)$"),xf=new RegExp("^rgb\\("+[_f,_f,_f]+"\\)$"),bf=new RegExp("^rgba\\("+[df,df,df,vf]+"\\)$"),wf=new RegExp("^rgba\\("+[_f,_f,_f,vf]+"\\)$"),Mf=new RegExp("^hsl\\("+[vf,_f,_f]+"\\)$"),Tf=new RegExp("^hsla\\("+[vf,_f,_f,vf]+"\\)$"),kf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074};pf(Mt,Tt,{displayable:function(){return this.rgb().displayable()},toString:function(){return this.rgb()+""}}),pf(At,Et,wt(Mt,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new At(this.r*t,this.g*t,this.b*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new At(this.r*t,this.g*t,this.b*t,this.opacity)},rgb:function(){return this},displayable:function(){return 0<=this.r&&this.r<=255&&0<=this.g&&this.g<=255&&0<=this.b&&this.b<=255&&0<=this.opacity&&this.opacity<=1},toString:function(){var t=this.opacity;return(1===(t=isNaN(t)?1:Math.max(0,Math.min(1,t)))?"rgb(":"rgba(")+Math.max(0,Math.min(255,Math.round(this.r)||0))+", "+Math.max(0,Math.min(255,Math.round(this.g)||0))+", "+Math.max(0,Math.min(255,Math.round(this.b)||0))+(1===t?")":", "+t+")")}})),pf(Rt,Pt,wt(Mt,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new Rt(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new Rt(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=this.h%360+360*(this.h<0),n=isNaN(t)||isNaN(this.s)?0:this.s,e=this.l,r=e+(e<.5?e:1-e)*n,i=2*e-r;return new At(Lt(t>=240?t-240:t+120,i,r),Lt(t,i,r),Lt(t<120?t+240:t-120,i,r),this.opacity)},displayable:function(){return(0<=this.s&&this.s<=1||isNaN(this.s))&&0<=this.l&&this.l<=1&&0<=this.opacity&&this.opacity<=1}}));var Nf=Math.PI/180,Sf=180/Math.PI,Ef=.95047,Af=1,Cf=1.08883,zf=4/29,Pf=6/29,Rf=3*Pf*Pf,Lf=Pf*Pf*Pf;pf(Dt,Ut,wt(Mt,{brighter:function(t){return new Dt(this.l+18*(null==t?1:t),this.a,this.b,this.opacity)},darker:function(t){return new Dt(this.l-18*(null==t?1:t),this.a,this.b,this.opacity)},rgb:function(){var t=(this.l+16)/116,n=isNaN(this.a)?t:t+this.a/500,e=isNaN(this.b)?t:t-this.b/200;return t=Af*Ft(t),n=Ef*Ft(n),e=Cf*Ft(e),new At(It(3.2404542*n-1.5371385*t-.4985314*e),It(-.969266*n+1.8760108*t+.041556*e),It(.0556434*n-.2040259*t+1.0572252*e),this.opacity)}})),pf(Ht,jt,wt(Mt,{brighter:function(t){return new Ht(this.h,this.c,this.l+18*(null==t?1:t),this.opacity)},darker:function(t){return new Ht(this.h,this.c,this.l-18*(null==t?1:t),this.opacity)},rgb:function(){return qt(this).rgb()}}));var qf=-.14861,Uf=1.78277,Df=-.29227,Of=-.90649,Ff=1.97294,If=Ff*Of,Yf=Ff*Uf,Bf=Uf*Df-Of*qf;pf(Vt,$t,wt(Mt,{brighter:function(t){return t=null==t?1/.7:Math.pow(1/.7,t),new Vt(this.h,this.s,this.l*t,this.opacity)},darker:function(t){return t=null==t?.7:Math.pow(.7,t),new Vt(this.h,this.s,this.l*t,this.opacity)},rgb:function(){var t=isNaN(this.h)?0:(this.h+120)*Nf,n=+this.l,e=isNaN(this.s)?0:this.s*n*(1-n),r=Math.cos(t),i=Math.sin(t);return new At(255*(n+e*(qf*r+Uf*i)),255*(n+e*(Df*r+Of*i)),255*(n+e*(Ff*r)),this.opacity)}}));var jf,Hf,Xf,$f,Vf,Wf,Zf=function(t){var n=t.length-1;return function(e){var r=e<=0?e=0:e>=1?(e=1,n-1):Math.floor(e*n),i=t[r],o=t[r+1],u=r>0?t[r-1]:2*i-o,a=r<n-1?t[r+2]:2*o-i;return Wt((e-r/n)*n,u,i,o,a)}},Gf=function(t){var n=t.length;return function(e){var r=Math.floor(((e%=1)<0?++e:e)*n),i=t[(r+n-1)%n],o=t[r%n],u=t[(r+1)%n],a=t[(r+2)%n];return Wt((e-r/n)*n,i,o,u,a)}},Jf=function(t){return function(){return t}},Qf=function t(n){function e(t,n){var e=r((t=Et(t)).r,(n=Et(n)).r),i=r(t.g,n.g),o=r(t.b,n.b),u=Kt(t.opacity,n.opacity);return function(n){return t.r=e(n),t.g=i(n),t.b=o(n),t.opacity=u(n),t+""}}var r=Qt(n);return e.gamma=t,e}(1),Kf=tn(Zf),tl=tn(Gf),nl=function(t,n){var e,r=n?n.length:0,i=t?Math.min(r,t.length):0,o=new Array(r),u=new Array(r);for(e=0;e<i;++e)o[e]=cl(t[e],n[e]);for(;e<r;++e)u[e]=n[e];return function(t){for(e=0;e<i;++e)u[e]=o[e](t);return u}},el=function(t,n){var e=new Date;return t=+t,n-=t,function(r){return e.setTime(t+n*r),e}},rl=function(t,n){return t=+t,n-=t,function(e){return t+n*e}},il=function(t,n){var e,r={},i={};null!==t&&"object"==typeof t||(t={}),null!==n&&"object"==typeof n||(n={});for(e in n)e in t?r[e]=cl(t[e],n[e]):i[e]=n[e];return function(t){for(e in r)i[e]=r[e](t);return i}},ol=/[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,ul=new RegExp(ol.source,"g"),al=function(t,n){var e,r,i,o=ol.lastIndex=ul.lastIndex=0,u=-1,a=[],c=[];for(t+="",n+="";(e=ol.exec(t))&&(r=ul.exec(n));)(i=r.index)>o&&(i=n.slice(o,i),a[u]?a[u]+=i:a[++u]=i),(e=e[0])===(r=r[0])?a[u]?a[u]+=r:a[++u]=r:(a[++u]=null,c.push({i:u,x:rl(e,r)})),o=ul.lastIndex;return o<n.length&&(i=n.slice(o),a[u]?a[u]+=i:a[++u]=i),a.length<2?c[0]?en(c[0].x):nn(n):(n=c.length,function(t){for(var e,r=0;r<n;++r)a[(e=c[r]).i]=e.x(t);return a.join("")})},cl=function(t,n){var e,r=typeof n;return null==n||"boolean"===r?Jf(n):("number"===r?rl:"string"===r?(e=Tt(n))?(n=e,Qf):al:n instanceof Tt?Qf:n instanceof Date?el:Array.isArray(n)?nl:"function"!=typeof n.valueOf&&"function"!=typeof n.toString||isNaN(n)?il:rl)(t,n)},sl=function(t,n){return t=+t,n-=t,function(e){return Math.round(t+n*e)}},fl=180/Math.PI,ll={translateX:0,translateY:0,rotate:0,skewX:0,scaleX:1,scaleY:1},hl=function(t,n,e,r,i,o){var u,a,c;return(u=Math.sqrt(t*t+n*n))&&(t/=u,n/=u),(c=t*e+n*r)&&(e-=t*c,r-=n*c),(a=Math.sqrt(e*e+r*r))&&(e/=a,r/=a,c/=a),t*r<n*e&&(t=-t,n=-n,c=-c,u=-u),{translateX:i,translateY:o,rotate:Math.atan2(n,t)*fl,skewX:Math.atan(c)*fl,scaleX:u,scaleY:a}},pl=rn(function(t){return"none"===t?ll:(jf||(jf=document.createElement("DIV"),Hf=document.documentElement,Xf=document.defaultView),jf.style.transform=t,t=Xf.getComputedStyle(Hf.appendChild(jf),null).getPropertyValue("transform"),Hf.removeChild(jf),t=t.slice(7,-1).split(","),hl(+t[0],+t[1],+t[2],+t[3],+t[4],+t[5]))},"px, ","px)","deg)"),dl=rn(function(t){return null==t?ll:($f||($f=document.createElementNS("http://www.w3.org/2000/svg","g")),$f.setAttribute("transform",t),(t=$f.transform.baseVal.consolidate())?(t=t.matrix,hl(t.a,t.b,t.c,t.d,t.e,t.f)):ll)},", ",")",")"),vl=Math.SQRT2,_l=function(t,n){var e,r,i=t[0],o=t[1],u=t[2],a=n[0],c=n[1],s=n[2],f=a-i,l=c-o,h=f*f+l*l;if(h<1e-12)r=Math.log(s/u)/vl,e=function(t){return[i+t*f,o+t*l,u*Math.exp(vl*t*r)]};else{var p=Math.sqrt(h),d=(s*s-u*u+4*h)/(2*u*2*p),v=(s*s-u*u-4*h)/(2*s*2*p),_=Math.log(Math.sqrt(d*d+1)-d),y=Math.log(Math.sqrt(v*v+1)-v);r=(y-_)/vl,e=function(t){var n=t*r,e=on(_),a=u/(2*p)*(e*an(vl*n+_)-un(_));return[i+a*f,o+a*l,u*e/on(vl*n+_)]}}return e.duration=1e3*r,e},yl=cn(Jt),gl=cn(Kt),ml=sn(Jt),xl=sn(Kt),bl=fn(Jt),wl=fn(Kt),Ml=0,Tl=0,kl=0,Nl=1e3,Sl=0,El=0,Al=0,Cl="object"==typeof performance&&performance.now?performance:Date,zl="object"==typeof window&&window.requestAnimationFrame?window.requestAnimationFrame.bind(window):function(t){setTimeout(t,17)};pn.prototype=dn.prototype={constructor:pn,restart:function(t,n,e){if("function"!=typeof t)throw new TypeError("callback is not a function");e=(null==e?ln():+e)+(null==n?0:+n),this._next||Wf===this||(Wf?Wf._next=this:Vf=this,Wf=this),this._call=t,this._time=e,mn()},stop:function(){this._call&&(this._call=null,this._time=1/0,mn())}};var Pl=function(t,n,e){var r=new pn;return n=null==n?0:+n,r.restart(function(e){r.stop(),t(e+n)},n,e),r},Rl=h("start","end","interrupt"),Ll=[],ql=0,Ul=1,Dl=2,Ol=3,Fl=4,Il=5,Yl=6,Bl=function(t,n,e,r,i,o){var u=t.__transition;if(u){if(e in u)return}else t.__transition={};Mn(t,e,{name:n,index:r,group:i,on:Rl,tween:Ll,time:o.time,delay:o.delay,duration:o.duration,ease:o.ease,timer:null,state:ql})},jl=function(t,n){var e,r,i,o=t.__transition,u=!0;if(o){n=null==n?null:n+"";for(i in o)(e=o[i]).name===n?(r=e.state>Dl&&e.state<Il,e.state=Yl,e.timer.stop(),r&&e.on.call("interrupt",t,t.__data__,e.index,e.group),delete o[i]):u=!1;u&&delete t.__transition}},Hl=function(t,n){var e;return("number"==typeof n?rl:n instanceof Tt?Qf:(e=Tt(n))?(n=e,Qf):al)(t,n)},Xl=dt.prototype.constructor,$l=0,Vl=dt.prototype;Gn.prototype=Jn.prototype={constructor:Gn,select:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=tf(t));for(var r=this._groups,i=r.length,o=new Array(i),u=0;u<i;++u)for(var a,c,s=r[u],f=s.length,l=o[u]=new Array(f),h=0;h<f;++h)(a=s[h])&&(c=t.call(a,a.__data__,h,s))&&("__data__"in a&&(c.__data__=a.__data__),l[h]=c,Bl(l[h],n,e,h,l,wn(a,e)));return new Gn(o,this._parents,n,e)},selectAll:function(t){var n=this._name,e=this._id;"function"!=typeof t&&(t=nf(t));for(var r=this._groups,i=r.length,o=[],u=[],a=0;a<i;++a)for(var c,s=r[a],f=s.length,l=0;l<f;++l)if(c=s[l]){for(var h,p=t.call(c,c.__data__,l,s),d=wn(c,e),v=0,_=p.length;v<_;++v)(h=p[v])&&Bl(h,n,e,v,p,d);o.push(p),u.push(c)}return new Gn(o,u,n,e)},filter:function(t){"function"!=typeof t&&(t=Zs(t));for(var n=this._groups,e=n.length,r=new Array(e),i=0;i<e;++i)for(var o,u=n[i],a=u.length,c=r[i]=[],s=0;s<a;++s)(o=u[s])&&t.call(o,o.__data__,s,u)&&c.push(o);return new Gn(r,this._parents,this._name,this._id)},merge:function(t){if(t._id!==this._id)throw new Error;for(var n=this._groups,e=t._groups,r=n.length,i=e.length,o=Math.min(r,i),u=new Array(r),a=0;a<o;++a)for(var c,s=n[a],f=e[a],l=s.length,h=u[a]=new Array(l),p=0;p<l;++p)(c=s[p]||f[p])&&(h[p]=c);for(;a<r;++a)u[a]=n[a];return new Gn(u,this._parents,this._name,this._id)},selection:function(){return new Xl(this._groups,this._parents)},transition:function(){for(var t=this._name,n=this._id,e=Qn(),r=this._groups,i=r.length,o=0;o<i;++o)for(var u,a=r[o],c=a.length,s=0;s<c;++s)if(u=a[s]){var f=wn(u,n);Bl(u,t,e,s,a,{time:f.time+f.delay+f.duration,delay:0,duration:f.duration,ease:f.ease})}return new Gn(r,this._parents,t,e)},call:Vl.call,nodes:Vl.nodes,node:Vl.node,size:Vl.size,empty:Vl.empty,each:Vl.each,on:function(t,n){var e=this._id;return arguments.length<2?wn(this.node(),e).on.on(t):this.each(Yn(e,t,n))},attr:function(t,n){var e=js(t),r="transform"===e?dl:Hl;return this.attrTween(t,"function"==typeof n?(e.local?Pn:zn)(e,r,Nn(this,"attr."+t,n)):null==n?(e.local?En:Sn)(e):(e.local?Cn:An)(e,r,n+""))},attrTween:function(t,n){var e="attr."+t;if(arguments.length<2)return(e=this.tween(e))&&e._value;if(null==n)return this.tween(e,null);if("function"!=typeof n)throw new Error;var r=js(t);return this.tween(e,(r.local?Rn:Ln)(r,n))},style:function(t,n,e){var r="transform"==(t+="")?pl:Hl;return null==n?this.styleTween(t,jn(t,r)).on("end.style."+t,Hn(t)):this.styleTween(t,"function"==typeof n?$n(t,r,Nn(this,"style."+t,n)):Xn(t,r,n+""),e)},styleTween:function(t,n,e){var r="style."+(t+="");if(arguments.length<2)return(r=this.tween(r))&&r._value;if(null==n)return this.tween(r,null);if("function"!=typeof n)throw new Error;return this.tween(r,Vn(t,n,null==e?"":e))},text:function(t){return this.tween("text","function"==typeof t?Zn(Nn(this,"text",t)):Wn(null==t?"":t+""))},remove:function(){return this.on("end.remove",Bn(this._id))},tween:function(t,n){var e=this._id;if(t+="",arguments.length<2){for(var r,i=wn(this.node(),e).tween,o=0,u=i.length;o<u;++o)if((r=i[o]).name===t)return r.value;return null}return this.each((null==n?Tn:kn)(e,t,n))},delay:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?qn:Un)(n,t)):wn(this.node(),n).delay},duration:function(t){var n=this._id;return arguments.length?this.each(("function"==typeof t?Dn:On)(n,t)):wn(this.node(),n).duration},ease:function(t){var n=this._id;return arguments.length?this.each(Fn(n,t)):wn(this.node(),n).ease}};var Wl=function t(n){function e(t){return Math.pow(t,n)}return n=+n,e.exponent=t,e}(3),Zl=function t(n){function e(t){return 1-Math.pow(1-t,n)}return n=+n,e.exponent=t,e}(3),Gl=function t(n){function e(t){return((t*=2)<=1?Math.pow(t,n):2-Math.pow(2-t,n))/2}return n=+n,e.exponent=t,e}(3),Jl=Math.PI,Ql=Jl/2,Kl=4/11,th=6/11,nh=8/11,eh=.75,rh=9/11,ih=10/11,oh=.9375,uh=21/22,ah=63/64,ch=1/Kl/Kl,sh=function t(n){function e(t){return t*t*((n+1)*t-n)}return n=+n,e.overshoot=t,e}(1.70158),fh=function t(n){function e(t){return--t*t*((n+1)*t+n)+1}return n=+n,e.overshoot=t,e}(1.70158),lh=function t(n){function e(t){return((t*=2)<1?t*t*((n+1)*t-n):(t-=2)*t*((n+1)*t+n)+2)/2}return n=+n,e.overshoot=t,e}(1.70158),hh=2*Math.PI,ph=function t(n,e){function r(t){return n*Math.pow(2,10*--t)*Math.sin((i-t)/e)}var i=Math.asin(1/(n=Math.max(1,n)))*(e/=hh);return r.amplitude=function(n){return t(n,e*hh)},r.period=function(e){return t(n,e)},r}(1,.3),dh=function t(n,e){function r(t){return 1-n*Math.pow(2,-10*(t=+t))*Math.sin((t+i)/e)}var i=Math.asin(1/(n=Math.max(1,n)))*(e/=hh);return r.amplitude=function(n){return t(n,e*hh)},r.period=function(e){return t(n,e)},r}(1,.3),vh=function t(n,e){function r(t){return((t=2*t-1)<0?n*Math.pow(2,10*t)*Math.sin((i-t)/e):2-n*Math.pow(2,-10*t)*Math.sin((i+t)/e))/2}var i=Math.asin(1/(n=Math.max(1,n)))*(e/=hh);return r.amplitude=function(n){return t(n,e*hh)},r.period=function(e){return t(n,e)},r}(1,.3),_h={time:null,delay:0,duration:250,ease:te};dt.prototype.interrupt=function(t){return this.each(function(){jl(this,t)})},dt.prototype.transition=function(t){var n,e;t instanceof Gn?(n=t._id,t=t._name):(n=Qn(),(e=_h).time=ln(),t=null==t?null:t+"");for(var r=this._groups,i=r.length,o=0;o<i;++o)for(var u,a=r[o],c=a.length,s=0;s<c;++s)(u=a[s])&&Bl(u,t,n,s,a,e||oe(u,n));return new Gn(r,this._parents,t,n)};var yh=[null],gh=function(t){return function(){return t}},mh=function(t,n,e){this.target=t,this.type=n,this.selection=e},xh=function(){t.event.preventDefault(),t.event.stopImmediatePropagation()},bh={name:"drag"},wh={name:"space"},Mh={name:"handle"},Th={name:"center"},kh={name:"x",handles:["e","w"].map(ae),input:function(t,n){return t&&[[t[0],n[0][1]],[t[1],n[1][1]]]},output:function(t){return t&&[t[0][0],t[1][0]]}},Nh={name:"y",handles:["n","s"].map(ae),input:function(t,n){return t&&[[n[0][0],t[0]],[n[1][0],t[1]]]},output:function(t){return t&&[t[0][1],t[1][1]]}},Sh={name:"xy",handles:["n","e","s","w","nw","ne","se","sw"].map(ae),input:function(t){return t},output:function(t){return t}},Eh={overlay:"crosshair",selection:"move",n:"ns-resize",e:"ew-resize",s:"ns-resize",w:"ew-resize",nw:"nwse-resize",ne:"nesw-resize",se:"nwse-resize",sw:"nesw-resize"},Ah={e:"w",w:"e",nw:"ne",ne:"nw",se:"sw",sw:"se"},Ch={n:"s",s:"n",nw:"sw",ne:"se",se:"ne",sw:"nw"},zh={overlay:1,selection:1,n:null,e:1,s:null,w:-1,nw:-1,ne:1,se:1,sw:-1},Ph={overlay:1,selection:1,n:-1,e:null,s:1,w:null,nw:-1,ne:-1,se:1,sw:1},Rh=Math.cos,Lh=Math.sin,qh=Math.PI,Uh=qh/2,Dh=2*qh,Oh=Math.max,Fh=Array.prototype.slice,Ih=function(t){return function(){return t}},Yh=Math.PI,Bh=2*Yh,jh=Bh-1e-6;de.prototype=ve.prototype={constructor:de,moveTo:function(t,n){this._+="M"+(this._x0=this._x1=+t)+","+(this._y0=this._y1=+n)},closePath:function(){null!==this._x1&&(this._x1=this._x0,this._y1=this._y0,this._+="Z")},lineTo:function(t,n){this._+="L"+(this._x1=+t)+","+(this._y1=+n)},quadraticCurveTo:function(t,n,e,r){this._+="Q"+ +t+","+ +n+","+(this._x1=+e)+","+(this._y1=+r)},bezierCurveTo:function(t,n,e,r,i,o){this._+="C"+ +t+","+ +n+","+ +e+","+ +r+","+(this._x1=+i)+","+(this._y1=+o)},arcTo:function(t,n,e,r,i){t=+t,n=+n,e=+e,r=+r,i=+i;var o=this._x1,u=this._y1,a=e-t,c=r-n,s=o-t,f=u-n,l=s*s+f*f;if(i<0)throw new Error("negative radius: "+i);if(null===this._x1)this._+="M"+(this._x1=t)+","+(this._y1=n);else if(l>1e-6)if(Math.abs(f*a-c*s)>1e-6&&i){var h=e-o,p=r-u,d=a*a+c*c,v=h*h+p*p,_=Math.sqrt(d),y=Math.sqrt(l),g=i*Math.tan((Yh-Math.acos((d+l-v)/(2*_*y)))/2),m=g/y,x=g/_;Math.abs(m-1)>1e-6&&(this._+="L"+(t+m*s)+","+(n+m*f)),this._+="A"+i+","+i+",0,0,"+ +(f*h>s*p)+","+(this._x1=t+x*a)+","+(this._y1=n+x*c)}else this._+="L"+(this._x1=t)+","+(this._y1=n);else;},arc:function(t,n,e,r,i,o){t=+t,n=+n;var u=(e=+e)*Math.cos(r),a=e*Math.sin(r),c=t+u,s=n+a,f=1^o,l=o?r-i:i-r;if(e<0)throw new Error("negative radius: "+e);null===this._x1?this._+="M"+c+","+s:(Math.abs(this._x1-c)>1e-6||Math.abs(this._y1-s)>1e-6)&&(this._+="L"+c+","+s),e&&(l<0&&(l=l%Bh+Bh),l>jh?this._+="A"+e+","+e+",0,1,"+f+","+(t-u)+","+(n-a)+"A"+e+","+e+",0,1,"+f+","+(this._x1=c)+","+(this._y1=s):l>1e-6&&(this._+="A"+e+","+e+",0,"+ +(l>=Yh)+","+f+","+(this._x1=t+e*Math.cos(i))+","+(this._y1=n+e*Math.sin(i))))},rect:function(t,n,e,r){this._+="M"+(this._x0=this._x1=+t)+","+(this._y0=this._y1=+n)+"h"+ +e+"v"+ +r+"h"+-e+"Z"},toString:function(){return this._}};be.prototype=we.prototype={constructor:be,has:function(t){return"$"+t in this},get:function(t){return this["$"+t]},set:function(t,n){return this["$"+t]=n,this},remove:function(t){var n="$"+t;return n in this&&delete this[n]},clear:function(){for(var t in this)"$"===t[0]&&delete this[t]},keys:function(){var t=[];for(var n in this)"$"===n[0]&&t.push(n.slice(1));return t},values:function(){var t=[];for(var n in this)"$"===n[0]&&t.push(this[n]);return t},entries:function(){var t=[];for(var n in this)"$"===n[0]&&t.push({key:n.slice(1),value:this[n]});return t},size:function(){var t=0;for(var n in this)"$"===n[0]&&++t;return t},empty:function(){for(var t in this)if("$"===t[0])return!1;return!0},each:function(t){for(var n in this)"$"===n[0]&&t(this[n],n.slice(1),this)}};var Hh=we.prototype;Se.prototype=Ee.prototype={constructor:Se,has:Hh.has,add:function(t){return t+="",this["$"+t]=t,this},remove:Hh.remove,clear:Hh.clear,values:Hh.keys,size:Hh.size,empty:Hh.empty,each:Hh.each};var Xh={},$h={},Vh=34,Wh=10,Zh=13,Gh=function(t){function n(t,n){function e(){if(s)return $h;if(f)return f=!1,Xh;var n,e,r=a;if(t.charCodeAt(r)===Vh){for(;a++<u&&t.charCodeAt(a)!==Vh||t.charCodeAt(++a)===Vh;);return(n=a)>=u?s=!0:(e=t.charCodeAt(a++))===Wh?f=!0:e===Zh&&(f=!0,t.charCodeAt(a)===Wh&&++a),t.slice(r+1,n-1).replace(/""/g,'"')}for(;a<u;){if((e=t.charCodeAt(n=a++))===Wh)f=!0;else if(e===Zh)f=!0,t.charCodeAt(a)===Wh&&++a;else if(e!==o)continue;return t.slice(r,n)}return s=!0,t.slice(r,u)}var r,i=[],u=t.length,a=0,c=0,s=u<=0,f=!1;for(t.charCodeAt(u-1)===Wh&&--u,t.charCodeAt(u-1)===Zh&&--u;(r=e())!==$h;){for(var l=[];r!==Xh&&r!==$h;)l.push(r),r=e();n&&null==(l=n(l,c++))||i.push(l)}return i}function e(n){return n.map(r).join(t)}function r(t){return null==t?"":i.test(t+="")?'"'+t.replace(/"/g,'""')+'"':t}var i=new RegExp('["'+t+"\n\r]"),o=t.charCodeAt(0);return{parse:function(t,e){var r,i,o=n(t,function(t,n){if(r)return r(t,n-1);i=t,r=e?Ce(t,e):Ae(t)});return o.columns=i,o},parseRows:n,format:function(n,e){return null==e&&(e=ze(n)),[e.map(r).join(t)].concat(n.map(function(n){return e.map(function(t){return r(n[t])}).join(t)})).join("\n")},formatRows:function(t){return t.map(e).join("\n")}}},Jh=Gh(","),Qh=Jh.parse,Kh=Jh.parseRows,tp=Jh.format,np=Jh.formatRows,ep=Gh("\t"),rp=ep.parse,ip=ep.parseRows,op=ep.format,up=ep.formatRows,ap=function(t){return function(){return t}},cp=function(){return 1e-6*(Math.random()-.5)},sp=function(t,n,e,r,i){this.node=t,this.x0=n,this.y0=e,this.x1=r,this.y1=i},fp=qe.prototype=Ue.prototype;fp.copy=function(){var t,n,e=new Ue(this._x,this._y,this._x0,this._y0,this._x1,this._y1),r=this._root;if(!r)return e;if(!r.length)return e._root=De(r),e;for(t=[{source:r,target:e._root=new Array(4)}];r=t.pop();)for(var i=0;i<4;++i)(n=r.source[i])&&(n.length?t.push({source:n,target:r.target[i]=new Array(4)}):r.target[i]=De(n));return e},fp.add=function(t){var n=+this._x.call(null,t),e=+this._y.call(null,t);return Pe(this.cover(n,e),n,e,t)},fp.addAll=function(t){var n,e,r,i,o=t.length,u=new Array(o),a=new Array(o),c=1/0,s=1/0,f=-1/0,l=-1/0;for(e=0;e<o;++e)isNaN(r=+this._x.call(null,n=t[e]))||isNaN(i=+this._y.call(null,n))||(u[e]=r,a[e]=i,r<c&&(c=r),r>f&&(f=r),i<s&&(s=i),i>l&&(l=i));for(f<c&&(c=this._x0,f=this._x1),l<s&&(s=this._y0,l=this._y1),this.cover(c,s).cover(f,l),e=0;e<o;++e)Pe(this,u[e],a[e],t[e]);return this},fp.cover=function(t,n){if(isNaN(t=+t)||isNaN(n=+n))return this;var e=this._x0,r=this._y0,i=this._x1,o=this._y1;if(isNaN(e))i=(e=Math.floor(t))+1,o=(r=Math.floor(n))+1;else{if(!(e>t||t>i||r>n||n>o))return this;var u,a,c=i-e,s=this._root;switch(a=(n<(r+o)/2)<<1|t<(e+i)/2){case 0:do{u=new Array(4),u[a]=s,s=u}while(c*=2,i=e+c,o=r+c,t>i||n>o);break;case 1:do{u=new Array(4),u[a]=s,s=u}while(c*=2,e=i-c,o=r+c,e>t||n>o);break;case 2:do{u=new Array(4),u[a]=s,s=u}while(c*=2,i=e+c,r=o-c,t>i||r>n);break;case 3:do{u=new Array(4),u[a]=s,s=u}while(c*=2,e=i-c,r=o-c,e>t||r>n)}this._root&&this._root.length&&(this._root=s)}return this._x0=e,this._y0=r,this._x1=i,this._y1=o,this},fp.data=function(){var t=[];return this.visit(function(n){if(!n.length)do{t.push(n.data)}while(n=n.next)}),t},fp.extent=function(t){return arguments.length?this.cover(+t[0][0],+t[0][1]).cover(+t[1][0],+t[1][1]):isNaN(this._x0)?void 0:[[this._x0,this._y0],[this._x1,this._y1]]},fp.find=function(t,n,e){var r,i,o,u,a,c,s,f=this._x0,l=this._y0,h=this._x1,p=this._y1,d=[],v=this._root;for(v&&d.push(new sp(v,f,l,h,p)),null==e?e=1/0:(f=t-e,l=n-e,h=t+e,p=n+e,e*=e);c=d.pop();)if(!(!(v=c.node)||(i=c.x0)>h||(o=c.y0)>p||(u=c.x1)<f||(a=c.y1)<l))if(v.length){var _=(i+u)/2,y=(o+a)/2;d.push(new sp(v[3],_,y,u,a),new sp(v[2],i,y,_,a),new sp(v[1],_,o,u,y),new sp(v[0],i,o,_,y)),(s=(n>=y)<<1|t>=_)&&(c=d[d.length-1],d[d.length-1]=d[d.length-1-s],d[d.length-1-s]=c)}else{var g=t-+this._x.call(null,v.data),m=n-+this._y.call(null,v.data),x=g*g+m*m;if(x<e){var b=Math.sqrt(e=x);f=t-b,l=n-b,h=t+b,p=n+b,r=v.data}}return r},fp.remove=function(t){if(isNaN(o=+this._x.call(null,t))||isNaN(u=+this._y.call(null,t)))return this;var n,e,r,i,o,u,a,c,s,f,l,h,p=this._root,d=this._x0,v=this._y0,_=this._x1,y=this._y1;if(!p)return this;if(p.length)for(;;){if((s=o>=(a=(d+_)/2))?d=a:_=a,(f=u>=(c=(v+y)/2))?v=c:y=c,n=p,!(p=p[l=f<<1|s]))return this;if(!p.length)break;(n[l+1&3]||n[l+2&3]||n[l+3&3])&&(e=n,h=l)}for(;p.data!==t;)if(r=p,!(p=p.next))return this;return(i=p.next)&&delete p.next,r?(i?r.next=i:delete r.next,this):n?(i?n[l]=i:delete n[l],(p=n[0]||n[1]||n[2]||n[3])&&p===(n[3]||n[2]||n[1]||n[0])&&!p.length&&(e?e[h]=p:this._root=p),this):(this._root=i,this)},fp.removeAll=function(t){for(var n=0,e=t.length;n<e;++n)this.remove(t[n]);return this},fp.root=function(){return this._root},fp.size=function(){var t=0;return this.visit(function(n){if(!n.length)do{++t}while(n=n.next)}),t},fp.visit=function(t){var n,e,r,i,o,u,a=[],c=this._root;for(c&&a.push(new sp(c,this._x0,this._y0,this._x1,this._y1));n=a.pop();)if(!t(c=n.node,r=n.x0,i=n.y0,o=n.x1,u=n.y1)&&c.length){var s=(r+o)/2,f=(i+u)/2;(e=c[3])&&a.push(new sp(e,s,f,o,u)),(e=c[2])&&a.push(new sp(e,r,f,s,u)),(e=c[1])&&a.push(new sp(e,s,i,o,f)),(e=c[0])&&a.push(new sp(e,r,i,s,f))}return this},fp.visitAfter=function(t){var n,e=[],r=[];for(this._root&&e.push(new sp(this._root,this._x0,this._y0,this._x1,this._y1));n=e.pop();){var i=n.node;if(i.length){var o,u=n.x0,a=n.y0,c=n.x1,s=n.y1,f=(u+c)/2,l=(a+s)/2;(o=i[0])&&e.push(new sp(o,u,a,f,l)),(o=i[1])&&e.push(new sp(o,f,a,c,l)),(o=i[2])&&e.push(new sp(o,u,l,f,s)),(o=i[3])&&e.push(new sp(o,f,l,c,s))}r.push(n)}for(;n=r.pop();)t(n.node,n.x0,n.y0,n.x1,n.y1);return this},fp.x=function(t){return arguments.length?(this._x=t,this):this._x},fp.y=function(t){return arguments.length?(this._y=t,this):this._y};var lp,hp=10,pp=Math.PI*(3-Math.sqrt(5)),dp=function(t,n){if((e=(t=n?t.toExponential(n-1):t.toExponential()).indexOf("e"))<0)return null;var e,r=t.slice(0,e);return[r.length>1?r[0]+r.slice(2):r,+t.slice(e+1)]},vp=function(t){return(t=dp(Math.abs(t)))?t[1]:NaN},_p=function(t,n){return function(e,r){for(var i=e.length,o=[],u=0,a=t[0],c=0;i>0&&a>0&&(c+a+1>r&&(a=Math.max(1,r-c)),o.push(e.substring(i-=a,i+a)),!((c+=a+1)>r));)a=t[u=(u+1)%t.length];return o.reverse().join(n)}},yp=function(t){return function(n){return n.replace(/[0-9]/g,function(n){return t[+n]})}},gp=function(t,n){var e=dp(t,n);if(!e)return t+"";var r=e[0],i=e[1];return i<0?"0."+new Array(-i).join("0")+r:r.length>i+1?r.slice(0,i+1)+"."+r.slice(i+1):r+new Array(i-r.length+2).join("0")},mp={"":function(t,n){t:for(var e,r=(t=t.toPrecision(n)).length,i=1,o=-1;i<r;++i)switch(t[i]){case".":o=e=i;break;case"0":0===o&&(o=i),e=i;break;case"e":break t;default:o>0&&(o=0)}return o>0?t.slice(0,o)+t.slice(e+1):t},"%":function(t,n){return(100*t).toFixed(n)},b:function(t){return Math.round(t).toString(2)},c:function(t){return t+""},d:function(t){return Math.round(t).toString(10)},e:function(t,n){return t.toExponential(n)},f:function(t,n){return t.toFixed(n)},g:function(t,n){return t.toPrecision(n)},o:function(t){return Math.round(t).toString(8)},p:function(t,n){return gp(100*t,n)},r:gp,s:function(t,n){var e=dp(t,n);if(!e)return t+"";var r=e[0],i=e[1],o=i-(lp=3*Math.max(-8,Math.min(8,Math.floor(i/3))))+1,u=r.length;return o===u?r:o>u?r+new Array(o-u+1).join("0"):o>0?r.slice(0,o)+"."+r.slice(o):"0."+new Array(1-o).join("0")+dp(t,Math.max(0,n+o-1))[0]},X:function(t){return Math.round(t).toString(16).toUpperCase()},x:function(t){return Math.round(t).toString(16)}},xp=/^(?:(.)?([<>=^]))?([+\-\( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?([a-z%])?$/i;He.prototype=Xe.prototype,Xe.prototype.toString=function(){return this.fill+this.align+this.sign+this.symbol+(this.zero?"0":"")+(null==this.width?"":Math.max(1,0|this.width))+(this.comma?",":"")+(null==this.precision?"":"."+Math.max(0,0|this.precision))+this.type};var bp,wp=function(t){return t},Mp=["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"],Tp=function(t){function n(t){function n(t){var n,r,u,f=_,x=y;if("c"===v)x=g(t)+x,t="";else{var b=(t=+t)<0;if(t=g(Math.abs(t),d),b&&0==+t&&(b=!1),f=(b?"("===s?s:"-":"-"===s||"("===s?"":s)+f,x=x+("s"===v?Mp[8+lp/3]:"")+(b&&"("===s?")":""),m)for(n=-1,r=t.length;++n<r;)if(48>(u=t.charCodeAt(n))||u>57){x=(46===u?i+t.slice(n+1):t.slice(n))+x,t=t.slice(0,n);break}}p&&!l&&(t=e(t,1/0));var w=f.length+t.length+x.length,M=w<h?new Array(h-w+1).join(a):"";switch(p&&l&&(t=e(M+t,M.length?h-x.length:1/0),M=""),c){case"<":t=f+t+x+M;break;case"=":t=f+M+t+x;break;case"^":t=M.slice(0,w=M.length>>1)+f+t+x+M.slice(w);break;default:t=M+f+t+x}return o(t)}var a=(t=He(t)).fill,c=t.align,s=t.sign,f=t.symbol,l=t.zero,h=t.width,p=t.comma,d=t.precision,v=t.type,_="$"===f?r[0]:"#"===f&&/[boxX]/.test(v)?"0"+v.toLowerCase():"",y="$"===f?r[1]:/[%p]/.test(v)?u:"",g=mp[v],m=!v||/[defgprs%]/.test(v);return d=null==d?v?6:12:/[gprs]/.test(v)?Math.max(1,Math.min(21,d)):Math.max(0,Math.min(20,d)),n.toString=function(){return t+""},n}var e=t.grouping&&t.thousands?_p(t.grouping,t.thousands):wp,r=t.currency,i=t.decimal,o=t.numerals?yp(t.numerals):wp,u=t.percent||"%";return{format:n,formatPrefix:function(t,e){var r=n((t=He(t),t.type="f",t)),i=3*Math.max(-8,Math.min(8,Math.floor(vp(e)/3))),o=Math.pow(10,-i),u=Mp[8+i/3];return function(t){return r(o*t)+u}}}};$e({decimal:".",thousands:",",grouping:[3],currency:["$",""]});var kp=function(t){return Math.max(0,-vp(Math.abs(t)))},Np=function(t,n){return Math.max(0,3*Math.max(-8,Math.min(8,Math.floor(vp(n)/3)))-vp(Math.abs(t)))},Sp=function(t,n){return t=Math.abs(t),n=Math.abs(n)-t,Math.max(0,vp(n)-vp(t))+1},Ep=function(){return new Ve};Ve.prototype={constructor:Ve,reset:function(){this.s=this.t=0},add:function(t){We(ud,t,this.t),We(this,ud.s,this.s),this.s?this.t+=ud.t:this.s=ud.t},valueOf:function(){return this.s}};var Ap,Cp,zp,Pp,Rp,Lp,qp,Up,Dp,Op,Fp,Ip,Yp,Bp,jp,Hp,Xp,$p,Vp,Wp,Zp,Gp,Jp,Qp,Kp,td,nd,ed,rd,id,od,ud=new Ve,ad=1e-6,cd=Math.PI,sd=cd/2,fd=cd/4,ld=2*cd,hd=180/cd,pd=cd/180,dd=Math.abs,vd=Math.atan,_d=Math.atan2,yd=Math.cos,gd=Math.ceil,md=Math.exp,xd=Math.log,bd=Math.pow,wd=Math.sin,Md=Math.sign||function(t){return t>0?1:t<0?-1:0},Td=Math.sqrt,kd=Math.tan,Nd={Feature:function(t,n){Ke(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)Ke(e[r].geometry,n)}},Sd={Sphere:function(t,n){n.sphere()},Point:function(t,n){t=t.coordinates,n.point(t[0],t[1],t[2])},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)t=e[r],n.point(t[0],t[1],t[2])},LineString:function(t,n){tr(t.coordinates,n,0)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)tr(e[r],n,0)},Polygon:function(t,n){nr(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)nr(e[r],n)},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)Ke(e[r],n)}},Ed=function(t,n){t&&Nd.hasOwnProperty(t.type)?Nd[t.type](t,n):Ke(t,n)},Ad=Ep(),Cd=Ep(),zd={point:Qe,lineStart:Qe,lineEnd:Qe,polygonStart:function(){Ad.reset(),zd.lineStart=er,zd.lineEnd=rr},polygonEnd:function(){var t=+Ad;Cd.add(t<0?ld+t:t),this.lineStart=this.lineEnd=this.point=Qe},sphere:function(){Cd.add(ld)}},Pd=Ep(),Rd={point:pr,lineStart:vr,lineEnd:_r,polygonStart:function(){Rd.point=yr,Rd.lineStart=gr,Rd.lineEnd=mr,Pd.reset(),zd.polygonStart()},polygonEnd:function(){zd.polygonEnd(),Rd.point=pr,Rd.lineStart=vr,Rd.lineEnd=_r,Ad<0?(Lp=-(Up=180),qp=-(Dp=90)):Pd>ad?Dp=90:Pd<-ad&&(qp=-90),jp[0]=Lp,jp[1]=Up}},Ld={sphere:Qe,point:Mr,lineStart:kr,lineEnd:Er,polygonStart:function(){Ld.lineStart=Ar,Ld.lineEnd=Cr},polygonEnd:function(){Ld.lineStart=kr,Ld.lineEnd=Er}},qd=function(t){return function(){return t}},Ud=function(t,n){function e(e,r){return e=t(e,r),n(e[0],e[1])}return t.invert&&n.invert&&(e.invert=function(e,r){return(e=n.invert(e,r))&&t.invert(e[0],e[1])}),e};Rr.invert=Rr;var Dd,Od,Fd,Id,Yd,Bd,jd,Hd,Xd,$d,Vd,Wd=function(t){function n(n){return n=t(n[0]*pd,n[1]*pd),n[0]*=hd,n[1]*=hd,n}return t=Lr(t[0]*pd,t[1]*pd,t.length>2?t[2]*pd:0),n.invert=function(n){return n=t.invert(n[0]*pd,n[1]*pd),n[0]*=hd,n[1]*=hd,n},n},Zd=function(){var t,n=[];return{point:function(n,e){t.push([n,e])},lineStart:function(){n.push(t=[])},lineEnd:Qe,rejoin:function(){n.length>1&&n.push(n.pop().concat(n.shift()))},result:function(){var e=n;return n=[],t=null,e}}},Gd=function(t,n,e,r,i,o){var u,a=t[0],c=t[1],s=0,f=1,l=n[0]-a,h=n[1]-c;if(u=e-a,l||!(u>0)){if(u/=l,l<0){if(u<s)return;u<f&&(f=u)}else if(l>0){if(u>f)return;u>s&&(s=u)}if(u=i-a,l||!(u<0)){if(u/=l,l<0){if(u>f)return;u>s&&(s=u)}else if(l>0){if(u<s)return;u<f&&(f=u)}if(u=r-c,h||!(u>0)){if(u/=h,h<0){if(u<s)return;u<f&&(f=u)}else if(h>0){if(u>f)return;u>s&&(s=u)}if(u=o-c,h||!(u<0)){if(u/=h,h<0){if(u>f)return;u>s&&(s=u)}else if(h>0){if(u<s)return;u<f&&(f=u)}return s>0&&(t[0]=a+s*l,t[1]=c+s*h),f<1&&(n[0]=a+f*l,n[1]=c+f*h),!0}}}}},Jd=function(t,n){return dd(t[0]-n[0])<ad&&dd(t[1]-n[1])<ad},Qd=function(t,n,e,r,i){var o,u,a=[],c=[];if(t.forEach(function(t){if(!((n=t.length-1)<=0)){var n,e,r=t[0],u=t[n];if(Jd(r,u)){for(i.lineStart(),o=0;o<n;++o)i.point((r=t[o])[0],r[1]);i.lineEnd()}else a.push(e=new Ir(r,t,null,!0)),c.push(e.o=new Ir(r,null,e,!1)),a.push(e=new Ir(u,t,null,!1)),c.push(e.o=new Ir(u,null,e,!0))}}),a.length){for(c.sort(n),Yr(a),Yr(c),o=0,u=c.length;o<u;++o)c[o].e=e=!e;for(var s,f,l=a[0];;){for(var h=l,p=!0;h.v;)if((h=h.n)===l)return;s=h.z,i.lineStart();do{if(h.v=h.o.v=!0,h.e){if(p)for(o=0,u=s.length;o<u;++o)i.point((f=s[o])[0],f[1]);else r(h.x,h.n.x,1,i);h=h.n}else{if(p)for(s=h.p.z,o=s.length-1;o>=0;--o)i.point((f=s[o])[0],f[1]);else r(h.x,h.p.x,-1,i);h=h.p}s=(h=h.o).z,p=!p}while(!h.v);i.lineEnd()}}},Kd=1e9,tv=-Kd,nv=Ep(),ev=function(t,n){var e=n[0],r=n[1],i=[wd(e),-yd(e),0],o=0,u=0;nv.reset();for(var a=0,c=t.length;a<c;++a)if(f=(s=t[a]).length)for(var s,f,l=s[f-1],h=l[0],p=l[1]/2+fd,d=wd(p),v=yd(p),_=0;_<f;++_,h=g,d=x,v=b,l=y){var y=s[_],g=y[0],m=y[1]/2+fd,x=wd(m),b=yd(m),w=g-h,M=w>=0?1:-1,T=M*w,k=T>cd,N=d*x;if(nv.add(_d(N*M*wd(T),v*b+N*yd(T))),o+=k?w+M*ld:w,k^h>=e^g>=e){var S=sr(ar(l),ar(y));hr(S);var E=sr(i,S);hr(E);var A=(k^w>=0?-1:1)*Ge(E[2]);(r>A||r===A&&(S[0]||S[1]))&&(u+=k^w>=0?1:-1)}}return(o<-ad||o<ad&&nv<-ad)^1&u},rv=Ep(),iv={sphere:Qe,point:Qe,lineStart:function(){iv.point=Hr,iv.lineEnd=jr},lineEnd:Qe,polygonStart:Qe,polygonEnd:Qe},ov=function(t){return rv.reset(),Ed(t,iv),+rv},uv=[null,null],av={type:"LineString",coordinates:uv},cv=function(t,n){return uv[0]=t,uv[1]=n,ov(av)},sv={Feature:function(t,n){return $r(t.geometry,n)},FeatureCollection:function(t,n){for(var e=t.features,r=-1,i=e.length;++r<i;)if($r(e[r].geometry,n))return!0;return!1}},fv={Sphere:function(){return!0},Point:function(t,n){return Vr(t.coordinates,n)},MultiPoint:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(Vr(e[r],n))return!0;return!1},LineString:function(t,n){return Wr(t.coordinates,n)},MultiLineString:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(Wr(e[r],n))return!0;return!1},Polygon:function(t,n){return Zr(t.coordinates,n)},MultiPolygon:function(t,n){for(var e=t.coordinates,r=-1,i=e.length;++r<i;)if(Zr(e[r],n))return!0;return!1},GeometryCollection:function(t,n){for(var e=t.geometries,r=-1,i=e.length;++r<i;)if($r(e[r],n))return!0;return!1}},lv=function(t){return t},hv=Ep(),pv=Ep(),dv={point:Qe,lineStart:Qe,lineEnd:Qe,polygonStart:function(){dv.lineStart=ni,dv.lineEnd=ii},polygonEnd:function(){dv.lineStart=dv.lineEnd=dv.point=Qe,hv.add(dd(pv)),pv.reset()},result:function(){var t=hv/2;return hv.reset(),t}},vv=1/0,_v=vv,yv=-vv,gv=yv,mv={point:function(t,n){t<vv&&(vv=t),t>yv&&(yv=t),n<_v&&(_v=n),n>gv&&(gv=n)},lineStart:Qe,lineEnd:Qe,polygonStart:Qe,polygonEnd:Qe,result:function(){var t=[[vv,_v],[yv,gv]];return yv=gv=-(_v=vv=1/0),t}},xv=0,bv=0,wv=0,Mv=0,Tv=0,kv=0,Nv=0,Sv=0,Ev=0,Av={point:oi,lineStart:ui,lineEnd:si,polygonStart:function(){Av.lineStart=fi,Av.lineEnd=li},polygonEnd:function(){Av.point=oi,Av.lineStart=ui,Av.lineEnd=si},result:function(){var t=Ev?[Nv/Ev,Sv/Ev]:kv?[Mv/kv,Tv/kv]:wv?[xv/wv,bv/wv]:[NaN,NaN];return xv=bv=wv=Mv=Tv=kv=Nv=Sv=Ev=0,t}};di.prototype={_radius:4.5,pointRadius:function(t){return this._radius=t,this},polygonStart:function(){this._line=0},polygonEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){0===this._line&&this._context.closePath(),this._point=NaN},point:function(t,n){switch(this._point){case 0:this._context.moveTo(t,n),this._point=1;break;case 1:this._context.lineTo(t,n);break;default:this._context.moveTo(t+this._radius,n),this._context.arc(t,n,this._radius,0,ld)}},result:Qe};var Cv,zv,Pv,Rv,Lv,qv=Ep(),Uv={point:Qe,lineStart:function(){Uv.point=vi},lineEnd:function(){Cv&&_i(zv,Pv),Uv.point=Qe},polygonStart:function(){Cv=!0},polygonEnd:function(){Cv=null},result:function(){var t=+qv;return qv.reset(),t}};yi.prototype={_radius:4.5,_circle:gi(4.5),pointRadius:function(t){return(t=+t)!==this._radius&&(this._radius=t,this._circle=null),this},polygonStart:function(){this._line=0},polygonEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){0===this._line&&this._string.push("Z"),this._point=NaN},point:function(t,n){switch(this._point){case 0:this._string.push("M",t,",",n),this._point=1;break;case 1:this._string.push("L",t,",",n);break;default:null==this._circle&&(this._circle=gi(this._radius)),this._string.push("M",t,",",n,this._circle)}},result:function(){if(this._string.length){var t=this._string.join("");return this._string=[],t}return null}};var Dv=function(t,n,e,r){return function(i,o){function u(n,e){var r=i(n,e);t(n=r[0],e=r[1])&&o.point(n,e)}function a(t,n){var e=i(t,n);_.point(e[0],e[1])}function c(){b.point=a,_.lineStart()}function s(){b.point=u,_.lineEnd()}function f(t,n){v.push([t,n]);var e=i(t,n);m.point(e[0],e[1])}function l(){m.lineStart(),v=[]}function h(){f(v[0][0],v[0][1]),m.lineEnd();var t,n,e,r,i=m.clean(),u=g.result(),a=u.length;if(v.pop(),p.push(v),v=null,a)if(1&i){if(e=u[0],(n=e.length-1)>0){for(x||(o.polygonStart(),x=!0),o.lineStart(),t=0;t<n;++t)o.point((r=e[t])[0],r[1]);o.lineEnd()}}else a>1&&2&i&&u.push(u.pop().concat(u.shift())),d.push(u.filter(mi))}var p,d,v,_=n(o),y=i.invert(r[0],r[1]),g=Zd(),m=n(g),x=!1,b={point:u,lineStart:c,lineEnd:s,polygonStart:function(){b.point=f,b.lineStart=l,b.lineEnd=h,d=[],p=[]},polygonEnd:function(){b.point=u,b.lineStart=c,b.lineEnd=s,d=Cs(d);var t=ev(p,y);d.length?(x||(o.polygonStart(),x=!0),Qd(d,xi,t,e,o)):t&&(x||(o.polygonStart(),x=!0),o.lineStart(),e(null,null,1,o),o.lineEnd()),x&&(o.polygonEnd(),x=!1),d=p=null},sphere:function(){o.polygonStart(),o.lineStart(),e(null,null,1,o),o.lineEnd(),o.polygonEnd()}};return b}},Ov=Dv(function(){return!0},function(t){var n,e=NaN,r=NaN,i=NaN;return{lineStart:function(){t.lineStart(),n=1},point:function(o,u){var a=o>0?cd:-cd,c=dd(o-e);dd(c-cd)<ad?(t.point(e,r=(r+u)/2>0?sd:-sd),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(a,r),t.point(o,r),n=0):i!==a&&c>=cd&&(dd(e-i)<ad&&(e-=i*ad),dd(o-a)<ad&&(o-=a*ad),r=bi(e,r,o,u),t.point(i,r),t.lineEnd(),t.lineStart(),t.point(a,r),n=0),t.point(e=o,r=u),i=a},lineEnd:function(){t.lineEnd(),e=r=NaN},clean:function(){return 2-n}}},function(t,n,e,r){var i;if(null==t)i=e*sd,r.point(-cd,i),r.point(0,i),r.point(cd,i),r.point(cd,0),r.point(cd,-i),r.point(0,-i),r.point(-cd,-i),r.point(-cd,0),r.point(-cd,i);else if(dd(t[0]-n[0])>ad){var o=t[0]<n[0]?cd:-cd;i=e*o/2,r.point(-o,i),r.point(0,i),r.point(o,i)}else r.point(n[0],n[1])},[-cd,-sd]),Fv=function(t,n){function e(t,n){return yd(t)*yd(n)>o}function r(t,n,e){var r=[1,0,0],i=sr(ar(t),ar(n)),u=cr(i,i),a=i[0],c=u-a*a;if(!c)return!e&&t;var s=o*u/c,f=-o*a/c,l=sr(r,i),h=lr(r,s);fr(h,lr(i,f));var p=l,d=cr(h,p),v=cr(p,p),_=d*d-v*(cr(h,h)-1);if(!(_<0)){var y=Td(_),g=lr(p,(-d-y)/v);if(fr(g,h),g=ur(g),!e)return g;var m,x=t[0],b=n[0],w=t[1],M=n[1];b<x&&(m=x,x=b,b=m);var T=b-x,k=dd(T-cd)<ad,N=k||T<ad;if(!k&&M<w&&(m=w,w=M,M=m),N?k?w+M>0^g[1]<(dd(g[0]-x)<ad?w:M):w<=g[1]&&g[1]<=M:T>cd^(x<=g[0]&&g[0]<=b)){var S=lr(p,(-d+y)/v);return fr(S,h),[g,ur(S)]}}}function i(n,e){var r=u?t:cd-t,i=0;return n<-r?i|=1:n>r&&(i|=2),e<-r?i|=4:e>r&&(i|=8),i}var o=yd(t),u=o>0,a=dd(o)>ad;return Dv(e,function(t){var n,o,c,s,f;return{lineStart:function(){s=c=!1,f=1},point:function(l,h){var p,d=[l,h],v=e(l,h),_=u?v?0:i(l,h):v?i(l+(l<0?cd:-cd),h):0;if(!n&&(s=c=v)&&t.lineStart(),v!==c&&(!(p=r(n,d))||Jd(n,p)||Jd(d,p))&&(d[0]+=ad,d[1]+=ad,v=e(d[0],d[1])),v!==c)f=0,v?(t.lineStart(),p=r(d,n),t.point(p[0],p[1])):(p=r(n,d),t.point(p[0],p[1]),t.lineEnd()),n=p;else if(a&&n&&u^v){var y;_&o||!(y=r(d,n,!0))||(f=0,u?(t.lineStart(),t.point(y[0][0],y[0][1]),t.point(y[1][0],y[1][1]),t.lineEnd()):(t.point(y[1][0],y[1][1]),t.lineEnd(),t.lineStart(),t.point(y[0][0],y[0][1])))}!v||n&&Jd(n,d)||t.point(d[0],d[1]),n=d,c=v,o=_},lineEnd:function(){c&&t.lineEnd(),n=null},clean:function(){return f|(s&&c)<<1}}},function(e,r,i,o){Or(o,t,n,i,e,r)},u?[0,-t]:[-cd,t-cd])};Mi.prototype={constructor:Mi,point:function(t,n){this.stream.point(t,n)},sphere:function(){this.stream.sphere()},lineStart:function(){this.stream.lineStart()},lineEnd:function(){this.stream.lineEnd()},polygonStart:function(){this.stream.polygonStart()},polygonEnd:function(){this.stream.polygonEnd()}};var Iv=16,Yv=yd(30*pd),Bv=function(t,n){return+n?Si(t,n):Ni(t)},jv=wi({point:function(t,n){this.stream.point(t*pd,n*pd)}}),Hv=function(){return Ci(Pi).scale(155.424).center([0,33.6442])},Xv=function(){return Hv().parallels([29.5,45.5]).scale(1070).translate([480,250]).rotate([96,0]).center([-.6,38.7])},$v=Li(function(t){return Td(2/(1+t))});$v.invert=qi(function(t){return 2*Ge(t/2)});var Vv=Li(function(t){return(t=Ze(t))&&t/wd(t)});Vv.invert=qi(function(t){return t});Ui.invert=function(t,n){return[t,2*vd(md(n))-sd]};Ii.invert=Ii;Bi.invert=qi(vd);Hi.invert=qi(Ge);Xi.invert=qi(function(t){return 2*vd(t)});$i.invert=function(t,n){return[-n,2*vd(md(t))-sd]};uo.prototype=eo.prototype={constructor:uo,count:function(){return this.eachAfter(to)},each:function(t){var n,e,r,i,o=this,u=[o];do{for(n=u.reverse(),u=[];o=n.pop();)if(t(o),e=o.children)for(r=0,i=e.length;r<i;++r)u.push(e[r])}while(u.length);return this},eachAfter:function(t){for(var n,e,r,i=this,o=[i],u=[];i=o.pop();)if(u.push(i),n=i.children)for(e=0,r=n.length;e<r;++e)o.push(n[e]);for(;i=u.pop();)t(i);return this},eachBefore:function(t){for(var n,e,r=this,i=[r];r=i.pop();)if(t(r),n=r.children)for(e=n.length-1;e>=0;--e)i.push(n[e]);return this},sum:function(t){return this.eachAfter(function(n){for(var e=+t(n.data)||0,r=n.children,i=r&&r.length;--i>=0;)e+=r[i].value;n.value=e})},sort:function(t){return this.eachBefore(function(n){n.children&&n.children.sort(t)})},path:function(t){for(var n=this,e=no(n,t),r=[n];n!==e;)n=n.parent,r.push(n);for(var i=r.length;t!==e;)r.splice(i,0,t),t=t.parent;return r},ancestors:function(){for(var t=this,n=[t];t=t.parent;)n.push(t);return n},descendants:function(){var t=[];return this.each(function(n){t.push(n)}),t},leaves:function(){var t=[];return this.eachBefore(function(n){n.children||t.push(n)}),t},links:function(){var t=this,n=[];return t.each(function(e){e!==t&&n.push({source:e.parent,target:e})}),n},copy:function(){return eo(this).eachBefore(io)}};var Wv=Array.prototype.slice,Zv=function(t){for(var n,e,r=0,i=(t=ao(Wv.call(t))).length,o=[];r<i;)n=t[r],e&&fo(e,n)?++r:(e=ho(o=co(o,n)),r=0);return e},Gv=function(t){return function(){return t}},Jv=function(t){t.x0=Math.round(t.x0),t.y0=Math.round(t.y0),t.x1=Math.round(t.x1),t.y1=Math.round(t.y1)},Qv=function(t,n,e,r,i){for(var o,u=t.children,a=-1,c=u.length,s=t.value&&(r-n)/t.value;++a<c;)(o=u[a]).y0=e,o.y1=i,o.x0=n,o.x1=n+=o.value*s},Kv="$",t_={depth:-1},n_={};Do.prototype=Object.create(uo.prototype);var e_=function(t,n,e,r,i){for(var o,u=t.children,a=-1,c=u.length,s=t.value&&(i-e)/t.value;++a<c;)(o=u[a]).x0=n,o.x1=r,o.y0=e,o.y1=e+=o.value*s},r_=(1+Math.sqrt(5))/2,i_=function t(n){function e(t,e,r,i,o){Fo(n,t,e,r,i,o)}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(r_),o_=function t(n){function e(t,e,r,i,o){if((u=t._squarify)&&u.ratio===n)for(var u,a,c,s,f,l=-1,h=u.length,p=t.value;++l<h;){for(c=(a=u[l]).children,s=a.value=0,f=c.length;s<f;++s)a.value+=c[s].value;a.dice?Qv(a,e,r,i,r+=(o-r)*a.value/p):e_(a,e,r,e+=(i-e)*a.value/p,o),p-=a.value}else t._squarify=u=Fo(n,t,e,r,i,o),u.ratio=n}return e.ratio=function(n){return t((n=+n)>1?n:1)},e}(r_),u_=function(t,n,e){return(n[0]-t[0])*(e[1]-t[1])-(n[1]-t[1])*(e[0]-t[0])},a_=[].slice,c_={};Bo.prototype=Wo.prototype={constructor:Bo,defer:function(t){if("function"!=typeof t)throw new Error("invalid callback");if(this._call)throw new Error("defer after await");if(null!=this._error)return this;var n=a_.call(arguments,1);return n.push(t),++this._waiting,this._tasks.push(n),jo(this),this},abort:function(){return null==this._error&&$o(this,new Error("abort")),this},await:function(t){if("function"!=typeof t)throw new Error("invalid callback");if(this._call)throw new Error("multiple await");return this._call=function(n,e){t.apply(null,[n].concat(e))},Vo(this),this},awaitAll:function(t){if("function"!=typeof t)throw new Error("invalid callback");if(this._call)throw new Error("multiple await");return this._call=t,Vo(this),this}};var s_=function(){return Math.random()},f_=function t(n){function e(t,e){return t=null==t?0:+t,e=null==e?1:+e,1===arguments.length?(e=t,t=0):e-=t,function(){return n()*e+t}}return e.source=t,e}(s_),l_=function t(n){function e(t,e){var r,i;return t=null==t?0:+t,e=null==e?1:+e,function(){var o;if(null!=r)o=r,r=null;else do{r=2*n()-1,o=2*n()-1,i=r*r+o*o}while(!i||i>1);return t+e*o*Math.sqrt(-2*Math.log(i)/i)}}return e.source=t,e}(s_),h_=function t(n){function e(){var t=l_.source(n).apply(this,arguments);return function(){return Math.exp(t())}}return e.source=t,e}(s_),p_=function t(n){function e(t){return function(){for(var e=0,r=0;r<t;++r)e+=n();return e}}return e.source=t,e}(s_),d_=function t(n){function e(t){var e=p_.source(n)(t);return function(){return e()/t}}return e.source=t,e}(s_),v_=function t(n){function e(t){return function(){return-Math.log(1-n())/t}}return e.source=t,e}(s_),__=function(t,n){function e(t){var n,e=s.status;if(!e&&Go(s)||e>=200&&e<300||304===e){if(o)try{n=o.call(r,s)}catch(t){return void a.call("error",r,t)}else n=s;a.call("load",r,n)}else a.call("error",r,t)}var r,i,o,u,a=h("beforesend","progress","load","error"),c=we(),s=new XMLHttpRequest,f=null,l=null,p=0;if("undefined"==typeof XDomainRequest||"withCredentials"in s||!/^(http(s)?:)?\/\//.test(t)||(s=new XDomainRequest),"onload"in s?s.onload=s.onerror=s.ontimeout=e:s.onreadystatechange=function(t){s.readyState>3&&e(t)},s.onprogress=function(t){a.call("progress",r,t)},r={header:function(t,n){return t=(t+"").toLowerCase(),arguments.length<2?c.get(t):(null==n?c.remove(t):c.set(t,n+""),r)},mimeType:function(t){return arguments.length?(i=null==t?null:t+"",r):i},responseType:function(t){return arguments.length?(u=t,r):u},timeout:function(t){return arguments.length?(p=+t,r):p},user:function(t){return arguments.length<1?f:(f=null==t?null:t+"",r)},password:function(t){return arguments.length<1?l:(l=null==t?null:t+"",r)},response:function(t){return o=t,r},get:function(t,n){return r.send("GET",t,n)},post:function(t,n){return r.send("POST",t,n)},send:function(n,e,o){return s.open(n,t,!0,f,l),null==i||c.has("accept")||c.set("accept",i+",*/*"),s.setRequestHeader&&c.each(function(t,n){s.setRequestHeader(n,t)}),null!=i&&s.overrideMimeType&&s.overrideMimeType(i),null!=u&&(s.responseType=u),p>0&&(s.timeout=p),null==o&&"function"==typeof e&&(o=e,e=null),null!=o&&1===o.length&&(o=Zo(o)),null!=o&&r.on("error",o).on("load",function(t){o(null,t)}),a.call("beforesend",r,s),s.send(null==e?null:e),r},abort:function(){return s.abort(),r},on:function(){var t=a.on.apply(a,arguments);return t===a?r:t}},null!=n){if("function"!=typeof n)throw new Error("invalid callback: "+n);return r.get(n)}return r},y_=function(t,n){return function(e,r){var i=__(e).mimeType(t).response(n);if(null!=r){if("function"!=typeof r)throw new Error("invalid callback: "+r);return i.get(r)}return i}},g_=y_("text/html",function(t){return document.createRange().createContextualFragment(t.responseText)}),m_=y_("application/json",function(t){return JSON.parse(t.responseText)}),x_=y_("text/plain",function(t){return t.responseText}),b_=y_("application/xml",function(t){var n=t.responseXML;if(!n)throw new Error("parse error");return n}),w_=function(t,n){return function(e,r,i){arguments.length<3&&(i=r,r=null);var o=__(e).mimeType(t);return o.row=function(t){return arguments.length?o.response(Jo(n,r=t)):r},o.row(r),i?o.get(i):o}},M_=w_("text/csv",Qh),T_=w_("text/tab-separated-values",rp),k_=Array.prototype,N_=k_.map,S_=k_.slice,E_={name:"implicit"},A_=function(t){return function(){return t}},C_=function(t){return+t},z_=[0,1],P_=function(n,e,r){var o,u=n[0],a=n[n.length-1],c=i(u,a,null==e?10:e);switch((r=He(null==r?",f":r)).type){case"s":var s=Math.max(Math.abs(u),Math.abs(a));return null!=r.precision||isNaN(o=Np(c,s))||(r.precision=o),t.formatPrefix(r,s);case"":case"e":case"g":case"p":case"r":null!=r.precision||isNaN(o=Sp(c,Math.max(Math.abs(u),Math.abs(a))))||(r.precision=o-("e"===r.type));break;case"f":case"%":null!=r.precision||isNaN(o=kp(c))||(r.precision=o-2*("%"===r.type))}return t.format(r)},R_=function(t,n){var e,r=0,i=(t=t.slice()).length-1,o=t[r],u=t[i];return u<o&&(e=r,r=i,i=e,e=o,o=u,u=e),t[r]=n.floor(o),t[i]=n.ceil(u),t},L_=new Date,q_=new Date,U_=Mu(function(){},function(t,n){t.setTime(+t+n)},function(t,n){return n-t});U_.every=function(t){return t=Math.floor(t),isFinite(t)&&t>0?t>1?Mu(function(n){n.setTime(Math.floor(n/t)*t)},function(n,e){n.setTime(+n+e*t)},function(n,e){return(e-n)/t}):U_:null};var D_=U_.range,O_=6e4,F_=6048e5,I_=Mu(function(t){t.setTime(1e3*Math.floor(t/1e3))},function(t,n){t.setTime(+t+1e3*n)},function(t,n){return(n-t)/1e3},function(t){return t.getUTCSeconds()}),Y_=I_.range,B_=Mu(function(t){t.setTime(Math.floor(t/O_)*O_)},function(t,n){t.setTime(+t+n*O_)},function(t,n){return(n-t)/O_},function(t){return t.getMinutes()}),j_=B_.range,H_=Mu(function(t){var n=t.getTimezoneOffset()*O_%36e5;n<0&&(n+=36e5),t.setTime(36e5*Math.floor((+t-n)/36e5)+n)},function(t,n){t.setTime(+t+36e5*n)},function(t,n){return(n-t)/36e5},function(t){return t.getHours()}),X_=H_.range,$_=Mu(function(t){t.setHours(0,0,0,0)},function(t,n){t.setDate(t.getDate()+n)},function(t,n){return(n-t-(n.getTimezoneOffset()-t.getTimezoneOffset())*O_)/864e5},function(t){return t.getDate()-1}),V_=$_.range,W_=Tu(0),Z_=Tu(1),G_=Tu(2),J_=Tu(3),Q_=Tu(4),K_=Tu(5),ty=Tu(6),ny=W_.range,ey=Z_.range,ry=G_.range,iy=J_.range,oy=Q_.range,uy=K_.range,ay=ty.range,cy=Mu(function(t){t.setDate(1),t.setHours(0,0,0,0)},function(t,n){t.setMonth(t.getMonth()+n)},function(t,n){return n.getMonth()-t.getMonth()+12*(n.getFullYear()-t.getFullYear())},function(t){return t.getMonth()}),sy=cy.range,fy=Mu(function(t){t.setMonth(0,1),t.setHours(0,0,0,0)},function(t,n){t.setFullYear(t.getFullYear()+n)},function(t,n){return n.getFullYear()-t.getFullYear()},function(t){return t.getFullYear()});fy.every=function(t){return isFinite(t=Math.floor(t))&&t>0?Mu(function(n){n.setFullYear(Math.floor(n.getFullYear()/t)*t),n.setMonth(0,1),n.setHours(0,0,0,0)},function(n,e){n.setFullYear(n.getFullYear()+e*t)}):null};var ly=fy.range,hy=Mu(function(t){t.setUTCSeconds(0,0)},function(t,n){t.setTime(+t+n*O_)},function(t,n){return(n-t)/O_},function(t){return t.getUTCMinutes()}),py=hy.range,dy=Mu(function(t){t.setUTCMinutes(0,0,0)},function(t,n){t.setTime(+t+36e5*n)},function(t,n){return(n-t)/36e5},function(t){return t.getUTCHours()}),vy=dy.range,_y=Mu(function(t){t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCDate(t.getUTCDate()+n)},function(t,n){return(n-t)/864e5},function(t){return t.getUTCDate()-1}),yy=_y.range,gy=ku(0),my=ku(1),xy=ku(2),by=ku(3),wy=ku(4),My=ku(5),Ty=ku(6),ky=gy.range,Ny=my.range,Sy=xy.range,Ey=by.range,Ay=wy.range,Cy=My.range,zy=Ty.range,Py=Mu(function(t){t.setUTCDate(1),t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCMonth(t.getUTCMonth()+n)},function(t,n){return n.getUTCMonth()-t.getUTCMonth()+12*(n.getUTCFullYear()-t.getUTCFullYear())},function(t){return t.getUTCMonth()}),Ry=Py.range,Ly=Mu(function(t){t.setUTCMonth(0,1),t.setUTCHours(0,0,0,0)},function(t,n){t.setUTCFullYear(t.getUTCFullYear()+n)},function(t,n){return n.getUTCFullYear()-t.getUTCFullYear()},function(t){return t.getUTCFullYear()});Ly.every=function(t){return isFinite(t=Math.floor(t))&&t>0?Mu(function(n){n.setUTCFullYear(Math.floor(n.getUTCFullYear()/t)*t),n.setUTCMonth(0,1),n.setUTCHours(0,0,0,0)},function(n,e){n.setUTCFullYear(n.getUTCFullYear()+e*t)}):null};var qy,Uy=Ly.range,Dy={"-":"",_:" ",0:"0"},Oy=/^\s*\d+/,Fy=/^%/,Iy=/[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;Ma({dateTime:"%x, %X",date:"%-m/%-d/%Y",time:"%-I:%M:%S %p",periods:["AM","PM"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],shortDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],months:["January","February","March","April","May","June","July","August","September","October","November","December"],shortMonths:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]});var Yy=Date.prototype.toISOString?function(t){return t.toISOString()}:t.utcFormat("%Y-%m-%dT%H:%M:%S.%LZ"),By=+new Date("2000-01-01T00:00:00.000Z")?function(t){var n=new Date(t);return isNaN(n)?null:n}:t.utcParse("%Y-%m-%dT%H:%M:%S.%LZ"),jy=1e3,Hy=60*jy,Xy=60*Hy,$y=24*Xy,Vy=7*$y,Wy=30*$y,Zy=365*$y,Gy=function(t){return t.match(/.{6}/g).map(function(t){return"#"+t})},Jy=Gy("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf"),Qy=Gy("393b795254a36b6ecf9c9ede6379398ca252b5cf6bcedb9c8c6d31bd9e39e7ba52e7cb94843c39ad494ad6616be7969c7b4173a55194ce6dbdde9ed6"),Ky=Gy("3182bd6baed69ecae1c6dbefe6550dfd8d3cfdae6bfdd0a231a35474c476a1d99bc7e9c0756bb19e9ac8bcbddcdadaeb636363969696bdbdbdd9d9d9"),tg=Gy("1f77b4aec7e8ff7f0effbb782ca02c98df8ad62728ff98969467bdc5b0d58c564bc49c94e377c2f7b6d27f7f7fc7c7c7bcbd22dbdb8d17becf9edae5"),ng=wl($t(300,.5,0),$t(-240,.5,1)),eg=wl($t(-100,.75,.35),$t(80,1.5,.8)),rg=wl($t(260,.75,.35),$t(80,1.5,.8)),ig=$t(),og=Sa(Gy("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725")),ug=Sa(Gy("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf")),ag=Sa(Gy("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4")),cg=Sa(Gy("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921")),sg=function(t){return function(){return t}},fg=Math.abs,lg=Math.atan2,hg=Math.cos,pg=Math.max,dg=Math.min,vg=Math.sin,_g=Math.sqrt,yg=1e-12,gg=Math.PI,mg=gg/2,xg=2*gg;Oa.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._point=0},lineEnd:function(){(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:this._context.lineTo(t,n)}}};var bg=function(t){return new Oa(t)},wg=function(){function t(t){var a,c,s,f=t.length,l=!1;for(null==i&&(u=o(s=ve())),a=0;a<=f;++a)!(a<f&&r(c=t[a],a,t))===l&&((l=!l)?u.lineStart():u.lineEnd()),l&&u.point(+n(c,a,t),+e(c,a,t));if(s)return u=null,s+""||null}var n=Fa,e=Ia,r=sg(!0),i=null,o=bg,u=null;return t.x=function(e){return arguments.length?(n="function"==typeof e?e:sg(+e),t):n},t.y=function(n){return arguments.length?(e="function"==typeof n?n:sg(+n),t):e},t.defined=function(n){return arguments.length?(r="function"==typeof n?n:sg(!!n),t):r},t.curve=function(n){return arguments.length?(o=n,null!=i&&(u=o(i)),t):o},t.context=function(n){return arguments.length?(null==n?i=u=null:u=o(i=n),t):i},t},Mg=function(){function t(t){var n,f,l,h,p,d=t.length,v=!1,_=new Array(d),y=new Array(d);for(null==a&&(s=c(p=ve())),n=0;n<=d;++n){if(!(n<d&&u(h=t[n],n,t))===v)if(v=!v)f=n,s.areaStart(),s.lineStart();else{for(s.lineEnd(),s.lineStart(),l=n-1;l>=f;--l)s.point(_[l],y[l]);s.lineEnd(),s.areaEnd()}v&&(_[n]=+e(h,n,t),y[n]=+i(h,n,t),s.point(r?+r(h,n,t):_[n],o?+o(h,n,t):y[n]))}if(p)return s=null,p+""||null}function n(){return wg().defined(u).curve(c).context(a)}var e=Fa,r=null,i=sg(0),o=Ia,u=sg(!0),a=null,c=bg,s=null;return t.x=function(n){return arguments.length?(e="function"==typeof n?n:sg(+n),r=null,t):e},t.x0=function(n){return arguments.length?(e="function"==typeof n?n:sg(+n),t):e},t.x1=function(n){return arguments.length?(r=null==n?null:"function"==typeof n?n:sg(+n),t):r},t.y=function(n){return arguments.length?(i="function"==typeof n?n:sg(+n),o=null,t):i},t.y0=function(n){return arguments.length?(i="function"==typeof n?n:sg(+n),t):i},t.y1=function(n){return arguments.length?(o=null==n?null:"function"==typeof n?n:sg(+n),t):o},t.lineX0=t.lineY0=function(){return n().x(e).y(i)},t.lineY1=function(){return n().x(e).y(o)},t.lineX1=function(){return n().x(r).y(i)},t.defined=function(n){return arguments.length?(u="function"==typeof n?n:sg(!!n),t):u},t.curve=function(n){return arguments.length?(c=n,null!=a&&(s=c(a)),t):c},t.context=function(n){return arguments.length?(null==n?a=s=null:s=c(a=n),t):a},t},Tg=function(t,n){return n<t?-1:n>t?1:n>=t?0:NaN},kg=function(t){return t},Ng=Ba(bg);Ya.prototype={areaStart:function(){this._curve.areaStart()},areaEnd:function(){this._curve.areaEnd()},lineStart:function(){this._curve.lineStart()},lineEnd:function(){this._curve.lineEnd()},point:function(t,n){this._curve.point(n*Math.sin(t),n*-Math.cos(t))}};var Sg=function(){return ja(wg().curve(Ng))},Eg=function(){var t=Mg().curve(Ng),n=t.curve,e=t.lineX0,r=t.lineX1,i=t.lineY0,o=t.lineY1;return t.angle=t.x,delete t.x,t.startAngle=t.x0,delete t.x0,t.endAngle=t.x1,delete t.x1,t.radius=t.y,delete t.y,t.innerRadius=t.y0,delete t.y0,t.outerRadius=t.y1,delete t.y1,t.lineStartAngle=function(){return ja(e())},delete t.lineX0,t.lineEndAngle=function(){return ja(r())},delete t.lineX1,t.lineInnerRadius=function(){return ja(i())},delete t.lineY0,t.lineOuterRadius=function(){return ja(o())},delete t.lineY1,t.curve=function(t){return arguments.length?n(Ba(t)):n()._curve},t},Ag=function(t,n){return[(n=+n)*Math.cos(t-=Math.PI/2),n*Math.sin(t)]},Cg=Array.prototype.slice,zg={draw:function(t,n){var e=Math.sqrt(n/gg);t.moveTo(e,0),t.arc(0,0,e,0,xg)}},Pg={draw:function(t,n){var e=Math.sqrt(n/5)/2;t.moveTo(-3*e,-e),t.lineTo(-e,-e),t.lineTo(-e,-3*e),t.lineTo(e,-3*e),t.lineTo(e,-e),t.lineTo(3*e,-e),t.lineTo(3*e,e),t.lineTo(e,e),t.lineTo(e,3*e),t.lineTo(-e,3*e),t.lineTo(-e,e),t.lineTo(-3*e,e),t.closePath()}},Rg=Math.sqrt(1/3),Lg=2*Rg,qg={draw:function(t,n){var e=Math.sqrt(n/Lg),r=e*Rg;t.moveTo(0,-e),t.lineTo(r,0),t.lineTo(0,e),t.lineTo(-r,0),t.closePath()}},Ug=Math.sin(gg/10)/Math.sin(7*gg/10),Dg=Math.sin(xg/10)*Ug,Og=-Math.cos(xg/10)*Ug,Fg={draw:function(t,n){var e=Math.sqrt(.8908130915292852*n),r=Dg*e,i=Og*e;t.moveTo(0,-e),t.lineTo(r,i);for(var o=1;o<5;++o){var u=xg*o/5,a=Math.cos(u),c=Math.sin(u);t.lineTo(c*e,-a*e),t.lineTo(a*r-c*i,c*r+a*i)}t.closePath()}},Ig={draw:function(t,n){var e=Math.sqrt(n),r=-e/2;t.rect(r,r,e,e)}},Yg=Math.sqrt(3),Bg={draw:function(t,n){var e=-Math.sqrt(n/(3*Yg));t.moveTo(0,2*e),t.lineTo(-Yg*e,-e),t.lineTo(Yg*e,-e),t.closePath()}},jg=-.5,Hg=Math.sqrt(3)/2,Xg=1/Math.sqrt(12),$g=3*(Xg/2+1),Vg={draw:function(t,n){var e=Math.sqrt(n/$g),r=e/2,i=e*Xg,o=r,u=e*Xg+e,a=-o,c=u;t.moveTo(r,i),t.lineTo(o,u),t.lineTo(a,c),t.lineTo(jg*r-Hg*i,Hg*r+jg*i),t.lineTo(jg*o-Hg*u,Hg*o+jg*u),t.lineTo(jg*a-Hg*c,Hg*a+jg*c),t.lineTo(jg*r+Hg*i,jg*i-Hg*r),t.lineTo(jg*o+Hg*u,jg*u-Hg*o),t.lineTo(jg*a+Hg*c,jg*c-Hg*a),t.closePath()}},Wg=[zg,Pg,qg,Ig,Fg,Bg,Vg],Zg=function(){};Ja.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){switch(this._point){case 3:Ga(this,this._x1,this._y1);case 2:this._context.lineTo(this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,this._context.lineTo((5*this._x0+this._x1)/6,(5*this._y0+this._y1)/6);default:Ga(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}};Qa.prototype={areaStart:Zg,areaEnd:Zg,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._y0=this._y1=this._y2=this._y3=this._y4=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x2,this._y2),this._context.closePath();break;case 2:this._context.moveTo((this._x2+2*this._x3)/3,(this._y2+2*this._y3)/3),this._context.lineTo((this._x3+2*this._x2)/3,(this._y3+2*this._y2)/3),this._context.closePath();break;case 3:this.point(this._x2,this._y2),this.point(this._x3,this._y3),this.point(this._x4,this._y4)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x2=t,this._y2=n;break;case 1:this._point=2,this._x3=t,this._y3=n;break;case 2:this._point=3,this._x4=t,this._y4=n,this._context.moveTo((this._x0+4*this._x1+t)/6,(this._y0+4*this._y1+n)/6);break;default:Ga(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}};Ka.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3;var e=(this._x0+4*this._x1+t)/6,r=(this._y0+4*this._y1+n)/6;this._line?this._context.lineTo(e,r):this._context.moveTo(e,r);break;case 3:this._point=4;default:Ga(this,t,n)}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n}};tc.prototype={lineStart:function(){this._x=[],this._y=[],this._basis.lineStart()},lineEnd:function(){var t=this._x,n=this._y,e=t.length-1;if(e>0)for(var r,i=t[0],o=n[0],u=t[e]-i,a=n[e]-o,c=-1;++c<=e;)r=c/e,this._basis.point(this._beta*t[c]+(1-this._beta)*(i+r*u),this._beta*n[c]+(1-this._beta)*(o+r*a));this._x=this._y=null,this._basis.lineEnd()},point:function(t,n){this._x.push(+t),this._y.push(+n)}};var Gg=function t(n){function e(t){return 1===n?new Ja(t):new tc(t,n)}return e.beta=function(n){return t(+n)},e}(.85);ec.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:nc(this,this._x1,this._y1)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2,this._x1=t,this._y1=n;break;case 2:this._point=3;default:nc(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Jg=function t(n){function e(t){return new ec(t,n)}return e.tension=function(n){return t(+n)},e}(0);rc.prototype={areaStart:Zg,areaEnd:Zg,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:nc(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Qg=function t(n){function e(t){return new rc(t,n)}return e.tension=function(n){return t(+n)},e}(0);ic.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:nc(this,t,n)}this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var Kg=function t(n){function e(t){return new ic(t,n)}return e.tension=function(n){return t(+n)},e}(0);uc.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x2,this._y2);break;case 3:this.point(this._x2,this._y2)}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3;default:oc(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var tm=function t(n){function e(t){return n?new uc(t,n):new ec(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);ac.prototype={areaStart:Zg,areaEnd:Zg,lineStart:function(){this._x0=this._x1=this._x2=this._x3=this._x4=this._x5=this._y0=this._y1=this._y2=this._y3=this._y4=this._y5=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){switch(this._point){case 1:this._context.moveTo(this._x3,this._y3),this._context.closePath();break;case 2:this._context.lineTo(this._x3,this._y3),this._context.closePath();break;case 3:this.point(this._x3,this._y3),this.point(this._x4,this._y4),this.point(this._x5,this._y5)}},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1,this._x3=t,this._y3=n;break;case 1:this._point=2,this._context.moveTo(this._x4=t,this._y4=n);break;case 2:this._point=3,this._x5=t,this._y5=n;break;default:oc(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var nm=function t(n){function e(t){return n?new ac(t,n):new rc(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);cc.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._x2=this._y0=this._y1=this._y2=NaN,this._l01_a=this._l12_a=this._l23_a=this._l01_2a=this._l12_2a=this._l23_2a=this._point=0},lineEnd:function(){(this._line||0!==this._line&&3===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){if(t=+t,n=+n,this._point){var e=this._x2-t,r=this._y2-n;this._l23_a=Math.sqrt(this._l23_2a=Math.pow(e*e+r*r,this._alpha))}switch(this._point){case 0:this._point=1;break;case 1:this._point=2;break;case 2:this._point=3,this._line?this._context.lineTo(this._x2,this._y2):this._context.moveTo(this._x2,this._y2);break;case 3:this._point=4;default:oc(this,t,n)}this._l01_a=this._l12_a,this._l12_a=this._l23_a,this._l01_2a=this._l12_2a,this._l12_2a=this._l23_2a,this._x0=this._x1,this._x1=this._x2,this._x2=t,this._y0=this._y1,this._y1=this._y2,this._y2=n}};var em=function t(n){function e(t){return n?new cc(t,n):new ic(t,0)}return e.alpha=function(n){return t(+n)},e}(.5);sc.prototype={areaStart:Zg,areaEnd:Zg,lineStart:function(){this._point=0},lineEnd:function(){this._point&&this._context.closePath()},point:function(t,n){t=+t,n=+n,this._point?this._context.lineTo(t,n):(this._point=1,this._context.moveTo(t,n))}};dc.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x0=this._x1=this._y0=this._y1=this._t0=NaN,this._point=0},lineEnd:function(){switch(this._point){case 2:this._context.lineTo(this._x1,this._y1);break;case 3:pc(this,this._t0,hc(this,this._t0))}(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line=1-this._line},point:function(t,n){var e=NaN;if(t=+t,n=+n,t!==this._x1||n!==this._y1){switch(this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;break;case 2:this._point=3,pc(this,hc(this,e=lc(this,t,n)),e);break;default:pc(this,this._t0,e=lc(this,t,n))}this._x0=this._x1,this._x1=t,this._y0=this._y1,this._y1=n,this._t0=e}}},(vc.prototype=Object.create(dc.prototype)).point=function(t,n){dc.prototype.point.call(this,n,t)},_c.prototype={moveTo:function(t,n){this._context.moveTo(n,t)},closePath:function(){this._context.closePath()},lineTo:function(t,n){this._context.lineTo(n,t)},bezierCurveTo:function(t,n,e,r,i,o){this._context.bezierCurveTo(n,t,r,e,o,i)}},yc.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=[],this._y=[]},lineEnd:function(){var t=this._x,n=this._y,e=t.length;if(e)if(this._line?this._context.lineTo(t[0],n[0]):this._context.moveTo(t[0],n[0]),2===e)this._context.lineTo(t[1],n[1]);else for(var r=gc(t),i=gc(n),o=0,u=1;u<e;++o,++u)this._context.bezierCurveTo(r[0][o],i[0][o],r[1][o],i[1][o],t[u],n[u]);(this._line||0!==this._line&&1===e)&&this._context.closePath(),this._line=1-this._line,this._x=this._y=null},point:function(t,n){this._x.push(+t),this._y.push(+n)}};mc.prototype={areaStart:function(){this._line=0},areaEnd:function(){this._line=NaN},lineStart:function(){this._x=this._y=NaN,this._point=0},lineEnd:function(){0<this._t&&this._t<1&&2===this._point&&this._context.lineTo(this._x,this._y),(this._line||0!==this._line&&1===this._point)&&this._context.closePath(),this._line>=0&&(this._t=1-this._t,this._line=1-this._line)},point:function(t,n){switch(t=+t,n=+n,this._point){case 0:this._point=1,this._line?this._context.lineTo(t,n):this._context.moveTo(t,n);break;case 1:this._point=2;default:if(this._t<=0)this._context.lineTo(this._x,n),this._context.lineTo(t,n);else{var e=this._x*(1-this._t)+t*this._t;this._context.lineTo(e,this._y),this._context.lineTo(e,n)}}this._x=t,this._y=n}};var rm=function(t,n){if((i=t.length)>1)for(var e,r,i,o=1,u=t[n[0]],a=u.length;o<i;++o)for(r=u,u=t[n[o]],e=0;e<a;++e)u[e][1]+=u[e][0]=isNaN(r[e][1])?r[e][0]:r[e][1]},im=function(t){for(var n=t.length,e=new Array(n);--n>=0;)e[n]=n;return e},om=function(t){var n=t.map(bc);return im(t).sort(function(t,e){return n[t]-n[e]})},um=function(t){return function(){return t}};Tc.prototype={constructor:Tc,insert:function(t,n){var e,r,i;if(t){if(n.P=t,n.N=t.N,t.N&&(t.N.P=n),t.N=n,t.R){for(t=t.R;t.L;)t=t.L;t.L=n}else t.R=n;e=t}else this._?(t=Ec(this._),n.P=null,n.N=t,t.P=t.L=n,e=t):(n.P=n.N=null,this._=n,e=null);for(n.L=n.R=null,n.U=e,n.C=!0,t=n;e&&e.C;)e===(r=e.U).L?(i=r.R)&&i.C?(e.C=i.C=!1,r.C=!0,t=r):(t===e.R&&(Nc(this,e),e=(t=e).U),e.C=!1,r.C=!0,Sc(this,r)):(i=r.L)&&i.C?(e.C=i.C=!1,r.C=!0,t=r):(t===e.L&&(Sc(this,e),e=(t=e).U),e.C=!1,r.C=!0,Nc(this,r)),e=t.U;this._.C=!1},remove:function(t){t.N&&(t.N.P=t.P),t.P&&(t.P.N=t.N),t.N=t.P=null;var n,e,r,i=t.U,o=t.L,u=t.R;if(e=o?u?Ec(u):o:u,i?i.L===t?i.L=e:i.R=e:this._=e,o&&u?(r=e.C,e.C=t.C,e.L=o,o.U=e,e!==u?(i=e.U,e.U=t.U,t=e.R,i.L=t,e.R=u,u.U=e):(e.U=i,i=e,t=e.R)):(r=t.C,t=e),t&&(t.U=i),!r)if(t&&t.C)t.C=!1;else{do{if(t===this._)break;if(t===i.L){if((n=i.R).C&&(n.C=!1,i.C=!0,Nc(this,i),n=i.R),n.L&&n.L.C||n.R&&n.R.C){n.R&&n.R.C||(n.L.C=!1,n.C=!0,Sc(this,n),n=i.R),n.C=i.C,i.C=n.R.C=!1,Nc(this,i),t=this._;break}}else if((n=i.L).C&&(n.C=!1,i.C=!0,Sc(this,i),n=i.L),n.L&&n.L.C||n.R&&n.R.C){n.L&&n.L.C||(n.R.C=!1,n.C=!0,Nc(this,n),n=i.L),n.C=i.C,i.C=n.L.C=!1,Sc(this,i),t=this._;break}n.C=!0,t=i,i=i.U}while(!t.C);t&&(t.C=!1)}}};var am,cm,sm,fm,lm,hm=[],pm=[],dm=1e-6,vm=1e-12;Kc.prototype={constructor:Kc,polygons:function(){var t=this.edges;return this.cells.map(function(n){var e=n.halfedges.map(function(e){return Dc(n,t[e])});return e.data=n.site.data,e})},triangles:function(){var t=[],n=this.edges;return this.cells.forEach(function(e,r){if(o=(i=e.halfedges).length)for(var i,o,u,a=e.site,c=-1,s=n[i[o-1]],f=s.left===a?s.right:s.left;++c<o;)u=f,f=(s=n[i[c]]).left===a?s.right:s.left,u&&f&&r<u.index&&r<f.index&&Jc(a,u,f)<0&&t.push([a.data,u.data,f.data])}),t},links:function(){return this.edges.filter(function(t){return t.right}).map(function(t){return{source:t.left.data,target:t.right.data}})},find:function(t,n,e){for(var r,i,o=this,u=o._found||0,a=o.cells.length;!(i=o.cells[u]);)if(++u>=a)return null;var c=t-i.site[0],s=n-i.site[1],f=c*c+s*s;do{i=o.cells[r=u],u=null,i.halfedges.forEach(function(e){var r=o.edges[e],a=r.left;if(a!==i.site&&a||(a=r.right)){var c=t-a[0],s=n-a[1],l=c*c+s*s;l<f&&(f=l,u=a.index)}})}while(null!==u);return o._found=r,null==e||f<=e*e?i.site:null}};var _m=function(t){return function(){return t}};ns.prototype={constructor:ns,scale:function(t){return 1===t?this:new ns(this.k*t,this.x,this.y)},translate:function(t,n){return 0===t&0===n?this:new ns(this.k,this.x+this.k*t,this.y+this.k*n)},apply:function(t){return[t[0]*this.k+this.x,t[1]*this.k+this.y]},applyX:function(t){return t*this.k+this.x},applyY:function(t){return t*this.k+this.y},invert:function(t){return[(t[0]-this.x)/this.k,(t[1]-this.y)/this.k]},invertX:function(t){return(t-this.x)/this.k},invertY:function(t){return(t-this.y)/this.k},rescaleX:function(t){return t.copy().domain(t.range().map(this.invertX,this).map(t.invert,t))},rescaleY:function(t){return t.copy().domain(t.range().map(this.invertY,this).map(t.invert,t))},toString:function(){return"translate("+this.x+","+this.y+") scale("+this.k+")"}};var ym=new ns(1,0,0);es.prototype=ns.prototype;var gm=function(){t.event.preventDefault(),t.event.stopImmediatePropagation()};t.version="4.10.2",t.bisect=hs,t.bisectRight=hs,t.bisectLeft=ps,t.ascending=ss,t.bisector=fs,t.cross=function(t,n,r){var i,o,u,a,c=t.length,s=n.length,f=new Array(c*s);for(null==r&&(r=e),i=u=0;i<c;++i)for(a=t[i],o=0;o<s;++o,++u)f[u]=r(a,n[o]);return f},t.descending=function(t,n){return n<t?-1:n>t?1:n>=t?0:NaN},t.deviation=_s,t.extent=ys,t.histogram=function(){function t(t){var o,u,a=t.length,c=new Array(a);for(o=0;o<a;++o)c[o]=n(t[o],o,t);var s=e(c),f=s[0],l=s[1],h=r(c,f,l);Array.isArray(h)||(h=i(f,l,h),h=Ms(Math.ceil(f/h)*h,Math.floor(l/h)*h,h));for(var p=h.length;h[0]<=f;)h.shift(),--p;for(;h[p-1]>l;)h.pop(),--p;var d,v=new Array(p+1);for(o=0;o<=p;++o)(d=v[o]=[]).x0=o>0?h[o-1]:f,d.x1=o<p?h[o]:l;for(o=0;o<a;++o)f<=(u=c[o])&&u<=l&&v[hs(h,u,0,p)].push(t[o]);return v}var n=ws,e=ys,r=Es;return t.value=function(e){return arguments.length?(n="function"==typeof e?e:bs(e),t):n},t.domain=function(n){return arguments.length?(e="function"==typeof n?n:bs([n[0],n[1]]),t):e},t.thresholds=function(n){return arguments.length?(r="function"==typeof n?n:bs(Array.isArray(n)?ms.call(n):n),t):r},t},t.thresholdFreedmanDiaconis=function(t,n,e){return t=xs.call(t,ds).sort(ss),Math.ceil((e-n)/(2*(As(t,.75)-As(t,.25))*Math.pow(t.length,-1/3)))},t.thresholdScott=function(t,n,e){return Math.ceil((e-n)/(3.5*_s(t)*Math.pow(t.length,-1/3)))},t.thresholdSturges=Es,t.max=function(t,n){var e,r,i=t.length,o=-1;if(null==n){for(;++o<i;)if(null!=(e=t[o])&&e>=e)for(r=e;++o<i;)null!=(e=t[o])&&e>r&&(r=e)}else for(;++o<i;)if(null!=(e=n(t[o],o,t))&&e>=e)for(r=e;++o<i;)null!=(e=n(t[o],o,t))&&e>r&&(r=e);return r},t.mean=function(t,n){var e,r=t.length,i=r,o=-1,u=0;if(null==n)for(;++o<r;)isNaN(e=ds(t[o]))?--i:u+=e;else for(;++o<r;)isNaN(e=ds(n(t[o],o,t)))?--i:u+=e;if(i)return u/i},t.median=function(t,n){var e,r=t.length,i=-1,o=[];if(null==n)for(;++i<r;)isNaN(e=ds(t[i]))||o.push(e);else for(;++i<r;)isNaN(e=ds(n(t[i],i,t)))||o.push(e);return As(o.sort(ss),.5)},t.merge=Cs,t.min=zs,t.pairs=function(t,n){null==n&&(n=e);for(var r=0,i=t.length-1,o=t[0],u=new Array(i<0?0:i);r<i;)u[r]=n(o,o=t[++r]);return u},t.permute=function(t,n){for(var e=n.length,r=new Array(e);e--;)r[e]=t[n[e]];return r},t.quantile=As,t.range=Ms,t.scan=function(t,n){if(e=t.length){var e,r,i=0,o=0,u=t[o];for(null==n&&(n=ss);++i<e;)(n(r=t[i],u)<0||0!==n(u,u))&&(u=r,o=i);return 0===n(u,u)?o:void 0}},t.shuffle=function(t,n,e){for(var r,i,o=(null==e?t.length:e)-(n=null==n?0:+n);o;)i=Math.random()*o--|0,r=t[o+n],t[o+n]=t[i+n],t[i+n]=r;return t},t.sum=function(t,n){var e,r=t.length,i=-1,o=0;if(null==n)for(;++i<r;)(e=+t[i])&&(o+=e);else for(;++i<r;)(e=+n(t[i],i,t))&&(o+=e);return o},t.ticks=Ss,t.tickIncrement=r,t.tickStep=i,t.transpose=Ps,t.variance=vs,t.zip=function(){return Ps(arguments)},t.axisTop=function(t){return l(qs,t)},t.axisRight=function(t){return l(Us,t)},t.axisBottom=function(t){return l(Ds,t)},t.axisLeft=function(t){return l(Os,t)},t.brush=function(){return he(Sh)},t.brushX=function(){return he(kh)},t.brushY=function(){return he(Nh)},t.brushSelection=function(t){var n=t.__brush;return n?n.dim.output(n.selection):null},t.chord=function(){function t(t){var o,u,a,c,s,f,l=t.length,h=[],p=Ms(l),d=[],v=[],_=v.groups=new Array(l),y=new Array(l*l);for(o=0,s=-1;++s<l;){for(u=0,f=-1;++f<l;)u+=t[s][f];h.push(u),d.push(Ms(l)),o+=u}for(e&&p.sort(function(t,n){return e(h[t],h[n])}),r&&d.forEach(function(n,e){n.sort(function(n,i){return r(t[e][n],t[e][i])})}),c=(o=Oh(0,Dh-n*l)/o)?n:Dh/l,u=0,s=-1;++s<l;){for(a=u,f=-1;++f<l;){var g=p[s],m=d[g][f],x=t[g][m],b=u,w=u+=x*o;y[m*l+g]={index:g,subindex:m,startAngle:b,endAngle:w,value:x}}_[g]={index:g,startAngle:a,endAngle:u,value:h[g]},u+=c}for(s=-1;++s<l;)for(f=s-1;++f<l;){var M=y[f*l+s],T=y[s*l+f];(M.value||T.value)&&v.push(M.value<T.value?{source:T,target:M}:{source:M,target:T})}return i?v.sort(i):v}var n=0,e=null,r=null,i=null;return t.padAngle=function(e){return arguments.length?(n=Oh(0,e),t):n},t.sortGroups=function(n){return arguments.length?(e=n,t):e},t.sortSubgroups=function(n){return arguments.length?(r=n,t):r},t.sortChords=function(n){return arguments.length?(null==n?i=null:(i=pe(n))._=n,t):i&&i._},t},t.ribbon=function(){function t(){var t,a=Fh.call(arguments),c=n.apply(this,a),s=e.apply(this,a),f=+r.apply(this,(a[0]=c,a)),l=i.apply(this,a)-Uh,h=o.apply(this,a)-Uh,p=f*Rh(l),d=f*Lh(l),v=+r.apply(this,(a[0]=s,a)),_=i.apply(this,a)-Uh,y=o.apply(this,a)-Uh;if(u||(u=t=ve()),u.moveTo(p,d),u.arc(0,0,f,l,h),l===_&&h===y||(u.quadraticCurveTo(0,0,v*Rh(_),v*Lh(_)),u.arc(0,0,v,_,y)),u.quadraticCurveTo(0,0,p,d),u.closePath(),t)return u=null,t+""||null}var n=_e,e=ye,r=ge,i=me,o=xe,u=null;return t.radius=function(n){return arguments.length?(r="function"==typeof n?n:Ih(+n),t):r},t.startAngle=function(n){return arguments.length?(i="function"==typeof n?n:Ih(+n),t):i},t.endAngle=function(n){return arguments.length?(o="function"==typeof n?n:Ih(+n),t):o},t.source=function(e){return arguments.length?(n=e,t):n},t.target=function(n){return arguments.length?(e=n,t):e},t.context=function(n){return arguments.length?(u=null==n?null:n,t):u},t},t.nest=function(){function t(n,i,u,a){if(i>=o.length)return null!=e&&n.sort(e),null!=r?r(n):n;for(var c,s,f,l=-1,h=n.length,p=o[i++],d=we(),v=u();++l<h;)(f=d.get(c=p(s=n[l])+""))?f.push(s):d.set(c,[s]);return d.each(function(n,e){a(v,e,t(n,i,u,a))}),v}function n(t,e){if(++e>o.length)return t;var i,a=u[e-1];return null!=r&&e>=o.length?i=t.entries():(i=[],t.each(function(t,r){i.push({key:r,values:n(t,e)})})),null!=a?i.sort(function(t,n){return a(t.key,n.key)}):i}var e,r,i,o=[],u=[];return i={object:function(n){return t(n,0,Me,Te)},map:function(n){return t(n,0,ke,Ne)},entries:function(e){return n(t(e,0,ke,Ne),0)},key:function(t){return o.push(t),i},sortKeys:function(t){return u[o.length-1]=t,i},sortValues:function(t){return e=t,i},rollup:function(t){return r=t,i}}},t.set=Ee,t.map=we,t.keys=function(t){var n=[];for(var e in t)n.push(e);return n},t.values=function(t){var n=[];for(var e in t)n.push(t[e]);return n},t.entries=function(t){var n=[];for(var e in t)n.push({key:e,value:t[e]});return n},t.color=Tt,t.rgb=Et,t.hsl=Pt,t.lab=Ut,t.hcl=jt,t.cubehelix=$t,t.dispatch=h,t.drag=function(){function n(t){t.on("mousedown.drag",e).filter(bt).on("touchstart.drag",o).on("touchmove.drag",u).on("touchend.drag touchcancel.drag",a).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function e(){if(!p&&d.apply(this,arguments)){var n=c("mouse",v.apply(this,arguments),Ks,this,arguments);n&&(cf(t.event.view).on("mousemove.drag",r,!0).on("mouseup.drag",i,!0),lf(t.event.view),vt(),l=!1,s=t.event.clientX,f=t.event.clientY,n("start"))}}function r(){if(ff(),!l){var n=t.event.clientX-s,e=t.event.clientY-f;l=n*n+e*e>x}y.mouse("drag")}function i(){cf(t.event.view).on("mousemove.drag mouseup.drag",null),_t(t.event.view,l),ff(),y.mouse("end")}function o(){if(d.apply(this,arguments)){var n,e,r=t.event.changedTouches,i=v.apply(this,arguments),o=r.length;for(n=0;n<o;++n)(e=c(r[n].identifier,i,sf,this,arguments))&&(vt(),e("start"))}}function u(){var n,e,r=t.event.changedTouches,i=r.length;for(n=0;n<i;++n)(e=y[r[n].identifier])&&(ff(),e("drag"))}function a(){var n,e,r=t.event.changedTouches,i=r.length;for(p&&clearTimeout(p),p=setTimeout(function(){p=null},500),n=0;n<i;++n)(e=y[r[n].identifier])&&(vt(),e("end"))}function c(e,r,i,o,u){var a,c,s,f=i(r,e),l=g.copy();if(N(new yt(n,"beforestart",a,e,m,f[0],f[1],0,0,l),function(){return null!=(t.event.subject=a=_.apply(o,u))&&(c=a.x-f[0]||0,s=a.y-f[1]||0,!0)}))return function t(h){var p,d=f;switch(h){case"start":y[e]=t,p=m++;break;case"end":delete y[e],--m;case"drag":f=i(r,e),p=m}N(new yt(n,h,a,e,p,f[0]+c,f[1]+s,f[0]-d[0],f[1]-d[1],l),l.apply,l,[h,o,u])}}var s,f,l,p,d=gt,v=mt,_=xt,y={},g=h("start","drag","end"),m=0,x=0;return n.filter=function(t){return arguments.length?(d="function"==typeof t?t:hf(!!t),n):d},n.container=function(t){return arguments.length?(v="function"==typeof t?t:hf(t),n):v},n.subject=function(t){return arguments.length?(_="function"==typeof t?t:hf(t),n):_},n.on=function(){var t=g.on.apply(g,arguments);return t===g?n:t},n.clickDistance=function(t){return arguments.length?(x=(t=+t)*t,n):Math.sqrt(x)},n},t.dragDisable=lf,t.dragEnable=_t,t.dsvFormat=Gh,t.csvParse=Qh,t.csvParseRows=Kh,t.csvFormat=tp,t.csvFormatRows=np,t.tsvParse=rp,t.tsvParseRows=ip,t.tsvFormat=op,t.tsvFormatRows=up,t.easeLinear=function(t){return+t},t.easeQuad=Kn,t.easeQuadIn=function(t){return t*t},t.easeQuadOut=function(t){return t*(2-t)},t.easeQuadInOut=Kn,t.easeCubic=te,t.easeCubicIn=function(t){return t*t*t},t.easeCubicOut=function(t){return--t*t*t+1},t.easeCubicInOut=te,t.easePoly=Gl,t.easePolyIn=Wl,t.easePolyOut=Zl,t.easePolyInOut=Gl,t.easeSin=ne,t.easeSinIn=function(t){return 1-Math.cos(t*Ql)},t.easeSinOut=function(t){return Math.sin(t*Ql)},t.easeSinInOut=ne,t.easeExp=ee,t.easeExpIn=function(t){return Math.pow(2,10*t-10)},t.easeExpOut=function(t){return 1-Math.pow(2,-10*t)},t.easeExpInOut=ee,t.easeCircle=re,t.easeCircleIn=function(t){return 1-Math.sqrt(1-t*t)},t.easeCircleOut=function(t){return Math.sqrt(1- --t*t)},t.easeCircleInOut=re,t.easeBounce=ie,t.easeBounceIn=function(t){return 1-ie(1-t)},t.easeBounceOut=ie,t.easeBounceInOut=function(t){return((t*=2)<=1?1-ie(1-t):ie(t-1)+1)/2},t.easeBack=lh,t.easeBackIn=sh,t.easeBackOut=fh,t.easeBackInOut=lh,t.easeElastic=dh,t.easeElasticIn=ph,t.easeElasticOut=dh,t.easeElasticInOut=vh,t.forceCenter=function(t,n){function e(){var e,i,o=r.length,u=0,a=0;for(e=0;e<o;++e)u+=(i=r[e]).x,a+=i.y;for(u=u/o-t,a=a/o-n,e=0;e<o;++e)(i=r[e]).x-=u,i.y-=a}var r;return null==t&&(t=0),null==n&&(n=0),e.initialize=function(t){r=t},e.x=function(n){return arguments.length?(t=+n,e):t},e.y=function(t){return arguments.length?(n=+t,e):n},e},t.forceCollide=function(t){function n(){for(var t,n,r,c,s,f,l,h=i.length,p=0;p<a;++p)for(n=qe(i,Oe,Fe).visitAfter(e),t=0;t<h;++t)r=i[t],f=o[r.index],l=f*f,c=r.x+r.vx,s=r.y+r.vy,n.visit(function(t,n,e,i,o){var a=t.data,h=t.r,p=f+h;if(!a)return n>c+p||i<c-p||e>s+p||o<s-p;if(a.index>r.index){var d=c-a.x-a.vx,v=s-a.y-a.vy,_=d*d+v*v;_<p*p&&(0===d&&(d=cp(),_+=d*d),0===v&&(v=cp(),_+=v*v),_=(p-(_=Math.sqrt(_)))/_*u,r.vx+=(d*=_)*(p=(h*=h)/(l+h)),r.vy+=(v*=_)*p,a.vx-=d*(p=1-p),a.vy-=v*p)}})}function e(t){if(t.data)return t.r=o[t.data.index];for(var n=t.r=0;n<4;++n)t[n]&&t[n].r>t.r&&(t.r=t[n].r)}function r(){if(i){var n,e,r=i.length;for(o=new Array(r),n=0;n<r;++n)e=i[n],o[e.index]=+t(e,n,i)}}var i,o,u=1,a=1;return"function"!=typeof t&&(t=ap(null==t?1:+t)),n.initialize=function(t){i=t,r()},n.iterations=function(t){return arguments.length?(a=+t,n):a},n.strength=function(t){return arguments.length?(u=+t,n):u},n.radius=function(e){return arguments.length?(t="function"==typeof e?e:ap(+e),r(),n):t},n},t.forceLink=function(t){function n(n){for(var e=0,r=t.length;e<p;++e)for(var i,a,c,f,l,h,d,v=0;v<r;++v)a=(i=t[v]).source,f=(c=i.target).x+c.vx-a.x-a.vx||cp(),l=c.y+c.vy-a.y-a.vy||cp(),f*=h=((h=Math.sqrt(f*f+l*l))-u[v])/h*n*o[v],l*=h,c.vx-=f*(d=s[v]),c.vy-=l*d,a.vx+=f*(d=1-d),a.vy+=l*d}function e(){if(a){var n,e,l=a.length,h=t.length,p=we(a,f);for(n=0,c=new Array(l);n<h;++n)(e=t[n]).index=n,"object"!=typeof e.source&&(e.source=Ye(p,e.source)),"object"!=typeof e.target&&(e.target=Ye(p,e.target)),c[e.source.index]=(c[e.source.index]||0)+1,c[e.target.index]=(c[e.target.index]||0)+1;for(n=0,s=new Array(h);n<h;++n)e=t[n],s[n]=c[e.source.index]/(c[e.source.index]+c[e.target.index]);o=new Array(h),r(),u=new Array(h),i()}}function r(){if(a)for(var n=0,e=t.length;n<e;++n)o[n]=+l(t[n],n,t)}function i(){if(a)for(var n=0,e=t.length;n<e;++n)u[n]=+h(t[n],n,t)}var o,u,a,c,s,f=Ie,l=function(t){return 1/Math.min(c[t.source.index],c[t.target.index])},h=ap(30),p=1;return null==t&&(t=[]),n.initialize=function(t){a=t,e()},n.links=function(r){return arguments.length?(t=r,e(),n):t},n.id=function(t){return arguments.length?(f=t,n):f},n.iterations=function(t){return arguments.length?(p=+t,n):p},n.strength=function(t){return arguments.length?(l="function"==typeof t?t:ap(+t),r(),n):l},n.distance=function(t){return arguments.length?(h="function"==typeof t?t:ap(+t),i(),n):h},n},t.forceManyBody=function(){function t(t){var n,a=i.length,c=qe(i,Be,je).visitAfter(e);for(u=t,n=0;n<a;++n)o=i[n],c.visit(r)}function n(){if(i){var t,n,e=i.length;for(a=new Array(e),t=0;t<e;++t)n=i[t],a[n.index]=+c(n,t,i)}}function e(t){var n,e,r,i,o,u=0;if(t.length){for(r=i=o=0;o<4;++o)(n=t[o])&&(e=n.value)&&(u+=e,r+=e*n.x,i+=e*n.y);t.x=r/u,t.y=i/u}else{(n=t).x=n.data.x,n.y=n.data.y;do{u+=a[n.data.index]}while(n=n.next)}t.value=u}function r(t,n,e,r){if(!t.value)return!0;var i=t.x-o.x,c=t.y-o.y,h=r-n,p=i*i+c*c;if(h*h/l<p)return p<f&&(0===i&&(i=cp(),p+=i*i),0===c&&(c=cp(),p+=c*c),p<s&&(p=Math.sqrt(s*p)),o.vx+=i*t.value*u/p,o.vy+=c*t.value*u/p),!0;if(!(t.length||p>=f)){(t.data!==o||t.next)&&(0===i&&(i=cp(),p+=i*i),0===c&&(c=cp(),p+=c*c),p<s&&(p=Math.sqrt(s*p)));do{t.data!==o&&(h=a[t.data.index]*u/p,o.vx+=i*h,o.vy+=c*h)}while(t=t.next)}}var i,o,u,a,c=ap(-30),s=1,f=1/0,l=.81;return t.initialize=function(t){i=t,n()},t.strength=function(e){return arguments.length?(c="function"==typeof e?e:ap(+e),n(),t):c},t.distanceMin=function(n){return arguments.length?(s=n*n,t):Math.sqrt(s)},t.distanceMax=function(n){return arguments.length?(f=n*n,t):Math.sqrt(f)},t.theta=function(n){return arguments.length?(l=n*n,t):Math.sqrt(l)},t},t.forceSimulation=function(t){function n(){e(),d.call("tick",o),u<a&&(p.stop(),d.call("end",o))}function e(){var n,e,r=t.length;for(u+=(s-u)*c,l.each(function(t){t(u)}),n=0;n<r;++n)null==(e=t[n]).fx?e.x+=e.vx*=f:(e.x=e.fx,e.vx=0),null==e.fy?e.y+=e.vy*=f:(e.y=e.fy,e.vy=0)}function r(){for(var n,e=0,r=t.length;e<r;++e){if(n=t[e],n.index=e,isNaN(n.x)||isNaN(n.y)){var i=hp*Math.sqrt(e),o=e*pp;n.x=i*Math.cos(o),n.y=i*Math.sin(o)}(isNaN(n.vx)||isNaN(n.vy))&&(n.vx=n.vy=0)}}function i(n){return n.initialize&&n.initialize(t),n}var o,u=1,a=.001,c=1-Math.pow(a,1/300),s=0,f=.6,l=we(),p=dn(n),d=h("tick","end");return null==t&&(t=[]),r(),o={tick:e,restart:function(){return p.restart(n),o},stop:function(){return p.stop(),o},nodes:function(n){return arguments.length?(t=n,r(),l.each(i),o):t},alpha:function(t){return arguments.length?(u=+t,o):u},alphaMin:function(t){return arguments.length?(a=+t,o):a},alphaDecay:function(t){return arguments.length?(c=+t,o):+c},alphaTarget:function(t){return arguments.length?(s=+t,o):s},velocityDecay:function(t){return arguments.length?(f=1-t,o):1-f},force:function(t,n){return arguments.length>1?(null==n?l.remove(t):l.set(t,i(n)),o):l.get(t)},find:function(n,e,r){var i,o,u,a,c,s=0,f=t.length;for(null==r?r=1/0:r*=r,s=0;s<f;++s)(u=(i=n-(a=t[s]).x)*i+(o=e-a.y)*o)<r&&(c=a,r=u);return c},on:function(t,n){return arguments.length>1?(d.on(t,n),o):d.on(t)}}},t.forceX=function(t){function n(t){for(var n,e=0,u=r.length;e<u;++e)(n=r[e]).vx+=(o[e]-n.x)*i[e]*t}function e(){if(r){var n,e=r.length;for(i=new Array(e),o=new Array(e),n=0;n<e;++n)i[n]=isNaN(o[n]=+t(r[n],n,r))?0:+u(r[n],n,r)}}var r,i,o,u=ap(.1);return"function"!=typeof t&&(t=ap(null==t?0:+t)),n.initialize=function(t){r=t,e()},n.strength=function(t){return arguments.length?(u="function"==typeof t?t:ap(+t),e(),n):u},n.x=function(r){return arguments.length?(t="function"==typeof r?r:ap(+r),e(),n):t},n},t.forceY=function(t){function n(t){for(var n,e=0,u=r.length;e<u;++e)(n=r[e]).vy+=(o[e]-n.y)*i[e]*t}function e(){if(r){var n,e=r.length;for(i=new Array(e),o=new Array(e),n=0;n<e;++n)i[n]=isNaN(o[n]=+t(r[n],n,r))?0:+u(r[n],n,r)}}var r,i,o,u=ap(.1);return"function"!=typeof t&&(t=ap(null==t?0:+t)),n.initialize=function(t){r=t,e()},n.strength=function(t){return arguments.length?(u="function"==typeof t?t:ap(+t),e(),n):u},n.y=function(r){return arguments.length?(t="function"==typeof r?r:ap(+r),e(),n):t},n},t.formatDefaultLocale=$e,t.formatLocale=Tp,t.formatSpecifier=He,t.precisionFixed=kp,t.precisionPrefix=Np,t.precisionRound=Sp,t.geoArea=function(t){return Cd.reset(),Ed(t,zd),2*Cd},t.geoBounds=function(t){var n,e,r,i,o,u,a;if(Dp=Up=-(Lp=qp=1/0),Bp=[],Ed(t,Rd),e=Bp.length){for(Bp.sort(br),n=1,o=[r=Bp[0]];n<e;++n)wr(r,(i=Bp[n])[0])||wr(r,i[1])?(xr(r[0],i[1])>xr(r[0],r[1])&&(r[1]=i[1]),xr(i[0],r[1])>xr(r[0],r[1])&&(r[0]=i[0])):o.push(r=i);for(u=-1/0,n=0,r=o[e=o.length-1];n<=e;r=i,++n)i=o[n],(a=xr(r[1],i[0]))>u&&(u=a,Lp=i[0],Up=r[1])}return Bp=jp=null,Lp===1/0||qp===1/0?[[NaN,NaN],[NaN,NaN]]:[[Lp,qp],[Up,Dp]]},t.geoCentroid=function(t){Hp=Xp=$p=Vp=Wp=Zp=Gp=Jp=Qp=Kp=td=0,Ed(t,Ld);var n=Qp,e=Kp,r=td,i=n*n+e*e+r*r;return i<1e-12&&(n=Zp,e=Gp,r=Jp,Xp<ad&&(n=$p,e=Vp,r=Wp),(i=n*n+e*e+r*r)<1e-12)?[NaN,NaN]:[_d(e,n)*hd,Ge(r/Td(i))*hd]},t.geoCircle=function(){function t(){var t=r.apply(this,arguments),a=i.apply(this,arguments)*pd,c=o.apply(this,arguments)*pd;return n=[],e=Lr(-t[0]*pd,-t[1]*pd,0).invert,Or(u,a,c,1),t={type:"Polygon",coordinates:[n]},n=e=null,t}var n,e,r=qd([0,0]),i=qd(90),o=qd(6),u={point:function(t,r){n.push(t=e(t,r)),t[0]*=hd,t[1]*=hd}};return t.center=function(n){return arguments.length?(r="function"==typeof n?n:qd([+n[0],+n[1]]),t):r},t.radius=function(n){return arguments.length?(i="function"==typeof n?n:qd(+n),t):i},t.precision=function(n){return arguments.length?(o="function"==typeof n?n:qd(+n),t):o},t},t.geoClipExtent=function(){var t,n,e,r=0,i=0,o=960,u=500;return e={stream:function(e){return t&&n===e?t:t=Br(r,i,o,u)(n=e)},extent:function(a){return arguments.length?(r=+a[0][0],i=+a[0][1],o=+a[1][0],u=+a[1][1],t=n=null,e):[[r,i],[o,u]]}}},t.geoContains=function(t,n){return(t&&sv.hasOwnProperty(t.type)?sv[t.type]:$r)(t,n)},t.geoDistance=cv,t.geoGraticule=ti,t.geoGraticule10=function(){return ti()()},t.geoInterpolate=function(t,n){var e=t[0]*pd,r=t[1]*pd,i=n[0]*pd,o=n[1]*pd,u=yd(r),a=wd(r),c=yd(o),s=wd(o),f=u*yd(e),l=u*wd(e),h=c*yd(i),p=c*wd(i),d=2*Ge(Td(Je(o-r)+u*c*Je(i-e))),v=wd(d),_=d?function(t){var n=wd(t*=d)/v,e=wd(d-t)/v,r=e*f+n*h,i=e*l+n*p,o=e*a+n*s;return[_d(i,r)*hd,_d(o,Td(r*r+i*i))*hd]}:function(){return[e*hd,r*hd]};return _.distance=d,_},t.geoLength=ov,t.geoPath=function(t,n){function e(t){return t&&("function"==typeof o&&i.pointRadius(+o.apply(this,arguments)),Ed(t,r(i))),i.result()}var r,i,o=4.5;return e.area=function(t){return Ed(t,r(dv)),dv.result()},e.measure=function(t){return Ed(t,r(Uv)),Uv.result()},e.bounds=function(t){return Ed(t,r(mv)),mv.result()},e.centroid=function(t){return Ed(t,r(Av)),Av.result()},e.projection=function(n){return arguments.length?(r=null==n?(t=null,lv):(t=n).stream,e):t},e.context=function(t){return arguments.length?(i=null==t?(n=null,new yi):new di(n=t),"function"!=typeof o&&i.pointRadius(o),e):n},e.pointRadius=function(t){return arguments.length?(o="function"==typeof t?t:(i.pointRadius(+t),+t),e):o},e.projection(t).context(n)},t.geoAlbers=Xv,t.geoAlbersUsa=function(){function t(t){var n=t[0],e=t[1];return a=null,i.point(n,e),a||(o.point(n,e),a)||(u.point(n,e),a)}function n(){return e=r=null,t}var e,r,i,o,u,a,c=Xv(),s=Hv().rotate([154,0]).center([-2,58.5]).parallels([55,65]),f=Hv().rotate([157,0]).center([-3,19.9]).parallels([8,18]),l={point:function(t,n){a=[t,n]}};return t.invert=function(t){var n=c.scale(),e=c.translate(),r=(t[0]-e[0])/n,i=(t[1]-e[1])/n;return(i>=.12&&i<.234&&r>=-.425&&r<-.214?s:i>=.166&&i<.234&&r>=-.214&&r<-.115?f:c).invert(t)},t.stream=function(t){return e&&r===t?e:e=Ri([c.stream(r=t),s.stream(t),f.stream(t)])},t.precision=function(t){return arguments.length?(c.precision(t),s.precision(t),f.precision(t),n()):c.precision()},t.scale=function(n){return arguments.length?(c.scale(n),s.scale(.35*n),f.scale(n),t.translate(c.translate())):c.scale()},t.translate=function(t){if(!arguments.length)return c.translate();var e=c.scale(),r=+t[0],a=+t[1];return i=c.translate(t).clipExtent([[r-.455*e,a-.238*e],[r+.455*e,a+.238*e]]).stream(l),o=s.translate([r-.307*e,a+.201*e]).clipExtent([[r-.425*e+ad,a+.12*e+ad],[r-.214*e-ad,a+.234*e-ad]]).stream(l),u=f.translate([r-.205*e,a+.212*e]).clipExtent([[r-.214*e+ad,a+.166*e+ad],[r-.115*e-ad,a+.234*e-ad]]).stream(l),n()},t.fitExtent=function(n,e){return Ti(t,n,e)},t.fitSize=function(n,e){return ki(t,n,e)},t.scale(1070)},t.geoAzimuthalEqualArea=function(){return Ei($v).scale(124.75).clipAngle(179.999)},t.geoAzimuthalEqualAreaRaw=$v,t.geoAzimuthalEquidistant=function(){return Ei(Vv).scale(79.4188).clipAngle(179.999)},t.geoAzimuthalEquidistantRaw=Vv,t.geoConicConformal=function(){return Ci(Fi).scale(109.5).parallels([30,30])},t.geoConicConformalRaw=Fi,t.geoConicEqualArea=Hv,t.geoConicEqualAreaRaw=Pi,t.geoConicEquidistant=function(){return Ci(Yi).scale(131.154).center([0,13.9389])},t.geoConicEquidistantRaw=Yi,t.geoEquirectangular=function(){return Ei(Ii).scale(152.63)},t.geoEquirectangularRaw=Ii,t.geoGnomonic=function(){return Ei(Bi).scale(144.049).clipAngle(60)},t.geoGnomonicRaw=Bi,t.geoIdentity=function(){function t(){return i=o=null,u}var n,e,r,i,o,u,a=1,c=0,s=0,f=1,l=1,h=lv,p=null,d=lv;return u={stream:function(t){return i&&o===t?i:i=h(d(o=t))},clipExtent:function(i){return arguments.length?(d=null==i?(p=n=e=r=null,lv):Br(p=+i[0][0],n=+i[0][1],e=+i[1][0],r=+i[1][1]),t()):null==p?null:[[p,n],[e,r]]},scale:function(n){return arguments.length?(h=ji((a=+n)*f,a*l,c,s),t()):a},translate:function(n){return arguments.length?(h=ji(a*f,a*l,c=+n[0],s=+n[1]),t()):[c,s]},reflectX:function(n){return arguments.length?(h=ji(a*(f=n?-1:1),a*l,c,s),t()):f<0},reflectY:function(n){return arguments.length?(h=ji(a*f,a*(l=n?-1:1),c,s),t()):l<0},fitExtent:function(t,n){return Ti(u,t,n)},fitSize:function(t,n){return ki(u,t,n)}}},t.geoProjection=Ei,t.geoProjectionMutator=Ai,t.geoMercator=function(){return Di(Ui).scale(961/ld)},t.geoMercatorRaw=Ui,t.geoOrthographic=function(){return Ei(Hi).scale(249.5).clipAngle(90+ad)},t.geoOrthographicRaw=Hi,t.geoStereographic=function(){return Ei(Xi).scale(250).clipAngle(142)},t.geoStereographicRaw=Xi,t.geoTransverseMercator=function(){var t=Di($i),n=t.center,e=t.rotate;return t.center=function(t){return arguments.length?n([-t[1],t[0]]):(t=n(),[t[1],-t[0]])},t.rotate=function(t){return arguments.length?e([t[0],t[1],t.length>2?t[2]+90:90]):(t=e(),[t[0],t[1],t[2]-90])},e([0,0,90]).scale(159.155)},t.geoTransverseMercatorRaw=$i,t.geoRotation=Wd,t.geoStream=Ed,t.geoTransform=function(t){return{stream:wi(t)}},t.cluster=function(){function t(t){var o,u=0;t.eachAfter(function(t){var e=t.children;e?(t.x=Wi(e),t.y=Gi(e)):(t.x=o?u+=n(t,o):0,t.y=0,o=t)});var a=Qi(t),c=Ki(t),s=a.x-n(a,c)/2,f=c.x+n(c,a)/2;return t.eachAfter(i?function(n){n.x=(n.x-t.x)*e,n.y=(t.y-n.y)*r}:function(n){n.x=(n.x-s)/(f-s)*e,n.y=(1-(t.y?n.y/t.y:1))*r})}var n=Vi,e=1,r=1,i=!1;return t.separation=function(e){return arguments.length?(n=e,t):n},t.size=function(n){return arguments.length?(i=!1,e=+n[0],r=+n[1],t):i?null:[e,r]},t.nodeSize=function(n){return arguments.length?(i=!0,e=+n[0],r=+n[1],t):i?[e,r]:null},t},t.hierarchy=eo,t.pack=function(){function t(t){return t.x=e/2,t.y=r/2,n?t.eachBefore(No(n)).eachAfter(So(i,.5)).eachBefore(Eo(1)):t.eachBefore(No(ko)).eachAfter(So(To,1)).eachAfter(So(i,t.r/Math.min(e,r))).eachBefore(Eo(Math.min(e,r)/(2*t.r))),t}var n=null,e=1,r=1,i=To;return t.radius=function(e){return arguments.length?(n=wo(e),t):n},t.size=function(n){return arguments.length?(e=+n[0],r=+n[1],t):[e,r]},t.padding=function(n){return arguments.length?(i="function"==typeof n?n:Gv(+n),t):i},t},t.packSiblings=function(t){return bo(t),t},t.packEnclose=Zv,t.partition=function(){function t(t){var u=t.height+1;return t.x0=t.y0=i,t.x1=e,t.y1=r/u,t.eachBefore(n(r,u)),o&&t.eachBefore(Jv),t}function n(t,n){return function(e){e.children&&Qv(e,e.x0,t*(e.depth+1)/n,e.x1,t*(e.depth+2)/n);var r=e.x0,o=e.y0,u=e.x1-i,a=e.y1-i;u<r&&(r=u=(r+u)/2),a<o&&(o=a=(o+a)/2),e.x0=r,e.y0=o,e.x1=u,e.y1=a}}var e=1,r=1,i=0,o=!1;return t.round=function(n){return arguments.length?(o=!!n,t):o},t.size=function(n){return arguments.length?(e=+n[0],r=+n[1],t):[e,r]},t.padding=function(n){return arguments.length?(i=+n,t):i},t},t.stratify=function(){function t(t){var r,i,o,u,a,c,s,f=t.length,l=new Array(f),h={};for(i=0;i<f;++i)r=t[i],a=l[i]=new uo(r),null!=(c=n(r,i,t))&&(c+="")&&(h[s=Kv+(a.id=c)]=s in h?n_:a);for(i=0;i<f;++i)if(a=l[i],null!=(c=e(t[i],i,t))&&(c+="")){if(!(u=h[Kv+c]))throw new Error("missing: "+c);if(u===n_)throw new Error("ambiguous: "+c);u.children?u.children.push(a):u.children=[a],a.parent=u}else{if(o)throw new Error("multiple roots");o=a}if(!o)throw new Error("no root");if(o.parent=t_,o.eachBefore(function(t){t.depth=t.parent.depth+1,--f}).eachBefore(oo),o.parent=null,f>0)throw new Error("cycle");return o}var n=Ao,e=Co;return t.id=function(e){return arguments.length?(n=Mo(e),t):n},t.parentId=function(n){return arguments.length?(e=Mo(n),t):e},t},t.tree=function(){function t(t){var r=Oo(t);if(r.eachAfter(n),r.parent.m=-r.z,r.eachBefore(e),c)t.eachBefore(i);else{var s=t,f=t,l=t;t.eachBefore(function(t){t.x<s.x&&(s=t),t.x>f.x&&(f=t),t.depth>l.depth&&(l=t)});var h=s===f?1:o(s,f)/2,p=h-s.x,d=u/(f.x+h+p),v=a/(l.depth||1);t.eachBefore(function(t){t.x=(t.x+p)*d,t.y=t.depth*v})}return t}function n(t){var n=t.children,e=t.parent.children,i=t.i?e[t.i-1]:null;if(n){qo(t);var u=(n[0].z+n[n.length-1].z)/2;i?(t.z=i.z+o(t._,i._),t.m=t.z-u):t.z=u}else i&&(t.z=i.z+o(t._,i._));t.parent.A=r(t,i,t.parent.A||e[0])}function e(t){t._.x=t.z+t.parent.m,t.m+=t.parent.m}function r(t,n,e){if(n){for(var r,i=t,u=t,a=n,c=i.parent.children[0],s=i.m,f=u.m,l=a.m,h=c.m;a=Ro(a),i=Po(i),a&&i;)c=Po(c),(u=Ro(u)).a=t,(r=a.z+l-i.z-s+o(a._,i._))>0&&(Lo(Uo(a,t,e),t,r),s+=r,f+=r),l+=a.m,s+=i.m,h+=c.m,f+=u.m;a&&!Ro(u)&&(u.t=a,u.m+=l-f),i&&!Po(c)&&(c.t=i,c.m+=s-h,e=t)}return e}function i(t){t.x*=u,t.y=t.depth*a}var o=zo,u=1,a=1,c=null;return t.separation=function(n){return arguments.length?(o=n,t):o},t.size=function(n){return arguments.length?(c=!1,u=+n[0],a=+n[1],t):c?null:[u,a]},t.nodeSize=function(n){return arguments.length?(c=!0,u=+n[0],a=+n[1],t):c?[u,a]:null},t},t.treemap=function(){function t(t){return t.x0=t.y0=0,t.x1=i,t.y1=o,t.eachBefore(n),u=[0],r&&t.eachBefore(Jv),t}function n(t){var n=u[t.depth],r=t.x0+n,i=t.y0+n,o=t.x1-n,h=t.y1-n;o<r&&(r=o=(r+o)/2),h<i&&(i=h=(i+h)/2),t.x0=r,t.y0=i,t.x1=o,t.y1=h,t.children&&(n=u[t.depth+1]=a(t)/2,r+=l(t)-n,i+=c(t)-n,o-=s(t)-n,h-=f(t)-n,o<r&&(r=o=(r+o)/2),h<i&&(i=h=(i+h)/2),e(t,r,i,o,h))}var e=i_,r=!1,i=1,o=1,u=[0],a=To,c=To,s=To,f=To,l=To;return t.round=function(n){return arguments.length?(r=!!n,t):r},t.size=function(n){return arguments.length?(i=+n[0],o=+n[1],t):[i,o]},t.tile=function(n){return arguments.length?(e=Mo(n),t):e},t.padding=function(n){return arguments.length?t.paddingInner(n).paddingOuter(n):t.paddingInner()},t.paddingInner=function(n){return arguments.length?(a="function"==typeof n?n:Gv(+n),t):a},t.paddingOuter=function(n){return arguments.length?t.paddingTop(n).paddingRight(n).paddingBottom(n).paddingLeft(n):t.paddingTop()},t.paddingTop=function(n){return arguments.length?(c="function"==typeof n?n:Gv(+n),t):c},t.paddingRight=function(n){return arguments.length?(s="function"==typeof n?n:Gv(+n),t):s},t.paddingBottom=function(n){return arguments.length?(f="function"==typeof n?n:Gv(+n),t):f},t.paddingLeft=function(n){return arguments.length?(l="function"==typeof n?n:Gv(+n),t):l},t},t.treemapBinary=function(t,n,e,r,i){function o(t,n,e,r,i,u,a){if(t>=n-1){var s=c[t];return s.x0=r,s.y0=i,s.x1=u,void(s.y1=a)}for(var l=f[t],h=e/2+l,p=t+1,d=n-1;p<d;){var v=p+d>>>1;f[v]<h?p=v+1:d=v}h-f[p-1]<f[p]-h&&t+1<p&&--p;var _=f[p]-l,y=e-_;if(u-r>a-i){var g=(r*y+u*_)/e;o(t,p,_,r,i,g,a),o(p,n,y,g,i,u,a)}else{var m=(i*y+a*_)/e;o(t,p,_,r,i,u,m),o(p,n,y,r,m,u,a)}}var u,a,c=t.children,s=c.length,f=new Array(s+1);for(f[0]=a=u=0;u<s;++u)f[u+1]=a+=c[u].value;o(0,s,t.value,n,e,r,i)},t.treemapDice=Qv,t.treemapSlice=e_,t.treemapSliceDice=function(t,n,e,r,i){(1&t.depth?e_:Qv)(t,n,e,r,i)},t.treemapSquarify=i_,t.treemapResquarify=o_,t.interpolate=cl,t.interpolateArray=nl,t.interpolateBasis=Zf,t.interpolateBasisClosed=Gf,t.interpolateDate=el,t.interpolateNumber=rl,t.interpolateObject=il,t.interpolateRound=sl,t.interpolateString=al,t.interpolateTransformCss=pl,t.interpolateTransformSvg=dl,t.interpolateZoom=_l,t.interpolateRgb=Qf,t.interpolateRgbBasis=Kf,t.interpolateRgbBasisClosed=tl,t.interpolateHsl=yl,t.interpolateHslLong=gl,t.interpolateLab=function(t,n){var e=Kt((t=Ut(t)).l,(n=Ut(n)).l),r=Kt(t.a,n.a),i=Kt(t.b,n.b),o=Kt(t.opacity,n.opacity);return function(n){return t.l=e(n),t.a=r(n),t.b=i(n),t.opacity=o(n),t+""}},t.interpolateHcl=ml,t.interpolateHclLong=xl,t.interpolateCubehelix=bl,t.interpolateCubehelixLong=wl,t.quantize=function(t,n){for(var e=new Array(n),r=0;r<n;++r)e[r]=t(r/(n-1));return e},t.path=ve,t.polygonArea=function(t){for(var n,e=-1,r=t.length,i=t[r-1],o=0;++e<r;)n=i,i=t[e],o+=n[1]*i[0]-n[0]*i[1];return o/2},t.polygonCentroid=function(t){for(var n,e,r=-1,i=t.length,o=0,u=0,a=t[i-1],c=0;++r<i;)n=a,a=t[r],c+=e=n[0]*a[1]-a[0]*n[1],o+=(n[0]+a[0])*e,u+=(n[1]+a[1])*e;return c*=3,[o/c,u/c]},t.polygonHull=function(t){if((e=t.length)<3)return null;var n,e,r=new Array(e),i=new Array(e);for(n=0;n<e;++n)r[n]=[+t[n][0],+t[n][1],n];for(r.sort(Io),n=0;n<e;++n)i[n]=[r[n][0],-r[n][1]];var o=Yo(r),u=Yo(i),a=u[0]===o[0],c=u[u.length-1]===o[o.length-1],s=[];for(n=o.length-1;n>=0;--n)s.push(t[r[o[n]][2]]);for(n=+a;n<u.length-c;++n)s.push(t[r[u[n]][2]]);return s},t.polygonContains=function(t,n){for(var e,r,i=t.length,o=t[i-1],u=n[0],a=n[1],c=o[0],s=o[1],f=!1,l=0;l<i;++l)e=(o=t[l])[0],(r=o[1])>a!=s>a&&u<(c-e)*(a-r)/(s-r)+e&&(f=!f),c=e,s=r;return f},t.polygonLength=function(t){for(var n,e,r=-1,i=t.length,o=t[i-1],u=o[0],a=o[1],c=0;++r<i;)n=u,e=a,n-=u=(o=t[r])[0],e-=a=o[1],c+=Math.sqrt(n*n+e*e);return c},t.quadtree=qe,t.queue=Wo,t.randomUniform=f_,t.randomNormal=l_,t.randomLogNormal=h_,t.randomBates=d_,t.randomIrwinHall=p_,t.randomExponential=v_,t.request=__,t.html=g_,t.json=m_,t.text=x_,t.xml=b_,t.csv=M_,t.tsv=T_,t.scaleBand=Ko,t.scalePoint=function(){return tu(Ko().paddingInner(1))},t.scaleIdentity=fu,t.scaleLinear=su,t.scaleLog=yu,t.scaleOrdinal=Qo,t.scaleImplicit=E_,t.scalePow=mu,t.scaleSqrt=function(){return mu().exponent(.5)},t.scaleQuantile=xu,t.scaleQuantize=bu,t.scaleThreshold=wu,t.scaleTime=function(){return Na(fy,cy,W_,$_,H_,B_,I_,U_,t.timeFormat).domain([new Date(2e3,0,1),new Date(2e3,0,2)])},t.scaleUtc=function(){return Na(Ly,Py,gy,_y,dy,hy,I_,U_,t.utcFormat).domain([Date.UTC(2e3,0,1),Date.UTC(2e3,0,2)])},t.schemeCategory10=Jy,t.schemeCategory20b=Qy,t.schemeCategory20c=Ky,t.schemeCategory20=tg,t.interpolateCubehelixDefault=ng,t.interpolateRainbow=function(t){(t<0||t>1)&&(t-=Math.floor(t));var n=Math.abs(t-.5);return ig.h=360*t-100,ig.s=1.5-1.5*n,ig.l=.8-.9*n,ig+""},t.interpolateWarm=eg,t.interpolateCool=rg,t.interpolateViridis=og,t.interpolateMagma=ug,t.interpolateInferno=ag,t.interpolatePlasma=cg,t.scaleSequential=Ea,t.creator=Hs,t.local=m,t.matcher=Zs,t.mouse=Ks,t.namespace=js,t.namespaces=Bs,t.select=cf,t.selectAll=function(t){return"string"==typeof t?new pt([document.querySelectorAll(t)],[document.documentElement]):new pt([null==t?[]:t],af)},t.selection=dt,t.selector=tf,t.selectorAll=nf,t.style=B,t.touch=sf,t.touches=function(t,n){null==n&&(n=Js().touches);for(var e=0,r=n?n.length:0,i=new Array(r);e<r;++e)i[e]=Qs(t,n[e]);return i},t.window=uf,t.customEvent=N,t.arc=function(){function t(){var t,s,f=+n.apply(this,arguments),l=+e.apply(this,arguments),h=o.apply(this,arguments)-mg,p=u.apply(this,arguments)-mg,d=fg(p-h),v=p>h;if(c||(c=t=ve()),l<f&&(s=l,l=f,f=s),l>yg)if(d>xg-yg)c.moveTo(l*hg(h),l*vg(h)),c.arc(0,0,l,h,p,!v),f>yg&&(c.moveTo(f*hg(p),f*vg(p)),c.arc(0,0,f,p,h,v));else{var _,y,g=h,m=p,x=h,b=p,w=d,M=d,T=a.apply(this,arguments)/2,k=T>yg&&(i?+i.apply(this,arguments):_g(f*f+l*l)),N=dg(fg(l-f)/2,+r.apply(this,arguments)),S=N,E=N;if(k>yg){var A=Ca(k/f*vg(T)),C=Ca(k/l*vg(T));(w-=2*A)>yg?(A*=v?1:-1,x+=A,b-=A):(w=0,x=b=(h+p)/2),(M-=2*C)>yg?(C*=v?1:-1,g+=C,m-=C):(M=0,g=m=(h+p)/2)}var z=l*hg(g),P=l*vg(g),R=f*hg(b),L=f*vg(b);if(N>yg){var q=l*hg(m),U=l*vg(m),D=f*hg(x),O=f*vg(x);if(d<gg){var F=w>yg?Ua(z,P,D,O,q,U,R,L):[R,L],I=z-F[0],Y=P-F[1],B=q-F[0],j=U-F[1],H=1/vg(Aa((I*B+Y*j)/(_g(I*I+Y*Y)*_g(B*B+j*j)))/2),X=_g(F[0]*F[0]+F[1]*F[1]);S=dg(N,(f-X)/(H-1)),E=dg(N,(l-X)/(H+1))}}M>yg?E>yg?(_=Da(D,O,z,P,l,E,v),y=Da(q,U,R,L,l,E,v),c.moveTo(_.cx+_.x01,_.cy+_.y01),E<N?c.arc(_.cx,_.cy,E,lg(_.y01,_.x01),lg(y.y01,y.x01),!v):(c.arc(_.cx,_.cy,E,lg(_.y01,_.x01),lg(_.y11,_.x11),!v),c.arc(0,0,l,lg(_.cy+_.y11,_.cx+_.x11),lg(y.cy+y.y11,y.cx+y.x11),!v),c.arc(y.cx,y.cy,E,lg(y.y11,y.x11),lg(y.y01,y.x01),!v))):(c.moveTo(z,P),c.arc(0,0,l,g,m,!v)):c.moveTo(z,P),f>yg&&w>yg?S>yg?(_=Da(R,L,q,U,f,-S,v),y=Da(z,P,D,O,f,-S,v),c.lineTo(_.cx+_.x01,_.cy+_.y01),S<N?c.arc(_.cx,_.cy,S,lg(_.y01,_.x01),lg(y.y01,y.x01),!v):(c.arc(_.cx,_.cy,S,lg(_.y01,_.x01),lg(_.y11,_.x11),!v),c.arc(0,0,f,lg(_.cy+_.y11,_.cx+_.x11),lg(y.cy+y.y11,y.cx+y.x11),v),c.arc(y.cx,y.cy,S,lg(y.y11,y.x11),lg(y.y01,y.x01),!v))):c.arc(0,0,f,b,x,v):c.lineTo(R,L)}else c.moveTo(0,0);if(c.closePath(),t)return c=null,t+""||null}var n=za,e=Pa,r=sg(0),i=null,o=Ra,u=La,a=qa,c=null;return t.centroid=function(){var t=(+n.apply(this,arguments)+ +e.apply(this,arguments))/2,r=(+o.apply(this,arguments)+ +u.apply(this,arguments))/2-gg/2;return[hg(r)*t,vg(r)*t]},t.innerRadius=function(e){return arguments.length?(n="function"==typeof e?e:sg(+e),t):n},t.outerRadius=function(n){return arguments.length?(e="function"==typeof n?n:sg(+n),t):e},t.cornerRadius=function(n){return arguments.length?(r="function"==typeof n?n:sg(+n),t):r},t.padRadius=function(n){return arguments.length?(i=null==n?null:"function"==typeof n?n:sg(+n),t):i},t.startAngle=function(n){return arguments.length?(o="function"==typeof n?n:sg(+n),t):o},t.endAngle=function(n){return arguments.length?(u="function"==typeof n?n:sg(+n),t):u},t.padAngle=function(n){return arguments.length?(a="function"==typeof n?n:sg(+n),t):a},t.context=function(n){return arguments.length?(c=null==n?null:n,t):c},t},t.area=Mg,t.line=wg,t.pie=function(){function t(t){var a,c,s,f,l,h=t.length,p=0,d=new Array(h),v=new Array(h),_=+i.apply(this,arguments),y=Math.min(xg,Math.max(-xg,o.apply(this,arguments)-_)),g=Math.min(Math.abs(y)/h,u.apply(this,arguments)),m=g*(y<0?-1:1);for(a=0;a<h;++a)(l=v[d[a]=a]=+n(t[a],a,t))>0&&(p+=l);for(null!=e?d.sort(function(t,n){return e(v[t],v[n])}):null!=r&&d.sort(function(n,e){return r(t[n],t[e])}),a=0,s=p?(y-h*m)/p:0;a<h;++a,_=f)c=d[a],f=_+((l=v[c])>0?l*s:0)+m,v[c]={data:t[c],index:a,value:l,startAngle:_,endAngle:f,padAngle:g};return v}var n=kg,e=Tg,r=null,i=sg(0),o=sg(xg),u=sg(0);return t.value=function(e){return arguments.length?(n="function"==typeof e?e:sg(+e),t):n},t.sortValues=function(n){return arguments.length?(e=n,r=null,t):e},t.sort=function(n){return arguments.length?(r=n,e=null,t):r},t.startAngle=function(n){return arguments.length?(i="function"==typeof n?n:sg(+n),t):i},t.endAngle=function(n){return arguments.length?(o="function"==typeof n?n:sg(+n),t):o},t.padAngle=function(n){return arguments.length?(u="function"==typeof n?n:sg(+n),t):u},t},t.areaRadial=Eg,t.radialArea=Eg,t.lineRadial=Sg,t.radialLine=Sg,t.pointRadial=Ag,t.linkHorizontal=function(){return $a(Va)},t.linkVertical=function(){return $a(Wa)},t.linkRadial=function(){var t=$a(Za);return t.angle=t.x,delete t.x,t.radius=t.y,delete t.y,t},t.symbol=function(){function t(){var t;if(r||(r=t=ve()),n.apply(this,arguments).draw(r,+e.apply(this,arguments)),t)return r=null,t+""||null}var n=sg(zg),e=sg(64),r=null;return t.type=function(e){return arguments.length?(n="function"==typeof e?e:sg(e),t):n},t.size=function(n){return arguments.length?(e="function"==typeof n?n:sg(+n),t):e},t.context=function(n){return arguments.length?(r=null==n?null:n,t):r},t},t.symbols=Wg,t.symbolCircle=zg,t.symbolCross=Pg,t.symbolDiamond=qg,t.symbolSquare=Ig,t.symbolStar=Fg,t.symbolTriangle=Bg,t.symbolWye=Vg,t.curveBasisClosed=function(t){return new Qa(t)},t.curveBasisOpen=function(t){return new Ka(t)},t.curveBasis=function(t){return new Ja(t)},t.curveBundle=Gg,t.curveCardinalClosed=Qg,t.curveCardinalOpen=Kg,t.curveCardinal=Jg,t.curveCatmullRomClosed=nm,t.curveCatmullRomOpen=em,t.curveCatmullRom=tm,t.curveLinearClosed=function(t){return new sc(t)},t.curveLinear=bg,t.curveMonotoneX=function(t){return new dc(t)},t.curveMonotoneY=function(t){return new vc(t)},t.curveNatural=function(t){return new yc(t)},t.curveStep=function(t){return new mc(t,.5)},t.curveStepAfter=function(t){return new mc(t,1)},t.curveStepBefore=function(t){return new mc(t,0)},t.stack=function(){function t(t){var o,u,a=n.apply(this,arguments),c=t.length,s=a.length,f=new Array(s);for(o=0;o<s;++o){for(var l,h=a[o],p=f[o]=new Array(c),d=0;d<c;++d)p[d]=l=[0,+i(t[d],h,d,t)],l.data=t[d];p.key=h}for(o=0,u=e(f);o<s;++o)f[u[o]].index=o;return r(f,u),f}var n=sg([]),e=im,r=rm,i=xc;return t.keys=function(e){return arguments.length?(n="function"==typeof e?e:sg(Cg.call(e)),t):n},t.value=function(n){return arguments.length?(i="function"==typeof n?n:sg(+n),t):i},t.order=function(n){return arguments.length?(e=null==n?im:"function"==typeof n?n:sg(Cg.call(n)),t):e},t.offset=function(n){return arguments.length?(r=null==n?rm:n,t):r},t},t.stackOffsetExpand=function(t,n){if((r=t.length)>0){for(var e,r,i,o=0,u=t[0].length;o<u;++o){for(i=e=0;e<r;++e)i+=t[e][o][1]||0;if(i)for(e=0;e<r;++e)t[e][o][1]/=i}rm(t,n)}},t.stackOffsetDiverging=function(t,n){if((a=t.length)>1)for(var e,r,i,o,u,a,c=0,s=t[n[0]].length;c<s;++c)for(o=u=0,e=0;e<a;++e)(i=(r=t[n[e]][c])[1]-r[0])>=0?(r[0]=o,r[1]=o+=i):i<0?(r[1]=u,r[0]=u+=i):r[0]=o},t.stackOffsetNone=rm,t.stackOffsetSilhouette=function(t,n){if((e=t.length)>0){for(var e,r=0,i=t[n[0]],o=i.length;r<o;++r){for(var u=0,a=0;u<e;++u)a+=t[u][r][1]||0;i[r][1]+=i[r][0]=-a/2}rm(t,n)}},t.stackOffsetWiggle=function(t,n){if((i=t.length)>0&&(r=(e=t[n[0]]).length)>0){for(var e,r,i,o=0,u=1;u<r;++u){for(var a=0,c=0,s=0;a<i;++a){for(var f=t[n[a]],l=f[u][1]||0,h=(l-(f[u-1][1]||0))/2,p=0;p<a;++p){var d=t[n[p]];h+=(d[u][1]||0)-(d[u-1][1]||0)}c+=l,s+=h*l}e[u-1][1]+=e[u-1][0]=o,c&&(o-=s/c)}e[u-1][1]+=e[u-1][0]=o,rm(t,n)}},t.stackOrderAscending=om,t.stackOrderDescending=function(t){return om(t).reverse()},t.stackOrderInsideOut=function(t){var n,e,r=t.length,i=t.map(bc),o=im(t).sort(function(t,n){return i[n]-i[t]}),u=0,a=0,c=[],s=[];for(n=0;n<r;++n)e=o[n],u<a?(u+=i[e],c.push(e)):(a+=i[e],s.push(e));return s.reverse().concat(c)},t.stackOrderNone=im,t.stackOrderReverse=function(t){return im(t).reverse()},t.timeInterval=Mu,t.timeMillisecond=U_,t.timeMilliseconds=D_,t.utcMillisecond=U_,t.utcMilliseconds=D_,t.timeSecond=I_,t.timeSeconds=Y_,t.utcSecond=I_,t.utcSeconds=Y_,t.timeMinute=B_,t.timeMinutes=j_,t.timeHour=H_,t.timeHours=X_,t.timeDay=$_,t.timeDays=V_,t.timeWeek=W_,t.timeWeeks=ny,t.timeSunday=W_,t.timeSundays=ny,t.timeMonday=Z_,t.timeMondays=ey,t.timeTuesday=G_,t.timeTuesdays=ry,t.timeWednesday=J_,t.timeWednesdays=iy,t.timeThursday=Q_,t.timeThursdays=oy,t.timeFriday=K_,t.timeFridays=uy,t.timeSaturday=ty,t.timeSaturdays=ay,t.timeMonth=cy,t.timeMonths=sy,t.timeYear=fy,t.timeYears=ly,t.utcMinute=hy,t.utcMinutes=py,t.utcHour=dy,t.utcHours=vy,t.utcDay=_y,t.utcDays=yy,t.utcWeek=gy,t.utcWeeks=ky,t.utcSunday=gy,t.utcSundays=ky,t.utcMonday=my,t.utcMondays=Ny,t.utcTuesday=xy,t.utcTuesdays=Sy,t.utcWednesday=by,t.utcWednesdays=Ey,t.utcThursday=wy,t.utcThursdays=Ay,t.utcFriday=My,t.utcFridays=Cy,t.utcSaturday=Ty,t.utcSaturdays=zy,t.utcMonth=Py,t.utcMonths=Ry,t.utcYear=Ly,t.utcYears=Uy,t.timeFormatDefaultLocale=Ma,t.timeFormatLocale=Au,t.isoFormat=Yy,t.isoParse=By,t.now=ln,t.timer=dn,t.timerFlush=vn,t.timeout=Pl,t.interval=function(t,n,e){var r=new pn,i=n;return null==n?(r.restart(t,n,e),r):(n=+n,e=null==e?ln():+e,r.restart(function o(u){u+=i,r.restart(o,i+=n,e),t(u)},n,e),r)},t.transition=Jn,t.active=function(t,n){var e,r,i=t.__transition;if(i){n=null==n?null:n+"";for(r in i)if((e=i[r]).state>Ul&&e.name===n)return new Gn([[t]],yh,n,+r)}return null},t.interrupt=jl,t.voronoi=function(){function t(t){return new Kc(t.map(function(r,i){var o=[Math.round(n(r,i,t)/dm)*dm,Math.round(e(r,i,t)/dm)*dm];return o.index=i,o.data=r,o}),r)}var n=wc,e=Mc,r=null;return t.polygons=function(n){return t(n).polygons()},t.links=function(n){return t(n).links()},t.triangles=function(n){return t(n).triangles()},t.x=function(e){return arguments.length?(n="function"==typeof e?e:um(+e),t):n},t.y=function(n){return arguments.length?(e="function"==typeof n?n:um(+n),t):e},t.extent=function(n){return arguments.length?(r=null==n?null:[[+n[0][0],+n[0][1]],[+n[1][0],+n[1][1]]],t):r&&[[r[0][0],r[0][1]],[r[1][0],r[1][1]]]},t.size=function(n){return arguments.length?(r=null==n?null:[[0,0],[+n[0],+n[1]]],t):r&&[r[1][0]-r[0][0],r[1][1]-r[0][1]]},t},t.zoom=function(){function n(t){t.property("__zoom",us).on("wheel.zoom",s).on("mousedown.zoom",f).on("dblclick.zoom",l).filter(cs).on("touchstart.zoom",p).on("touchmove.zoom",d).on("touchend.zoom touchcancel.zoom",v).style("touch-action","none").style("-webkit-tap-highlight-color","rgba(0,0,0,0)")}function e(t,n){return(n=Math.max(b,Math.min(w,n)))===t.k?t:new ns(n,t.x,t.y)}function r(t,n,e){var r=n[0]-e[0]*t.k,i=n[1]-e[1]*t.k;return r===t.x&&i===t.y?t:new ns(t.k,r,i)}function i(t,n){var e=t.invertX(n[0][0])-M,r=t.invertX(n[1][0])-T,i=t.invertY(n[0][1])-k,o=t.invertY(n[1][1])-S;return t.translate(r>e?(e+r)/2:Math.min(0,e)||Math.max(0,r),o>i?(i+o)/2:Math.min(0,i)||Math.max(0,o))}function o(t){return[(+t[0][0]+ +t[1][0])/2,(+t[0][1]+ +t[1][1])/2]}function u(t,n,e){t.on("start.zoom",function(){a(this,arguments).start()}).on("interrupt.zoom end.zoom",function(){a(this,arguments).end()}).tween("zoom",function(){var t=this,r=arguments,i=a(t,r),u=m.apply(t,r),c=e||o(u),s=Math.max(u[1][0]-u[0][0],u[1][1]-u[0][1]),f=t.__zoom,l="function"==typeof n?n.apply(t,r):n,h=A(f.invert(c).concat(s/f.k),l.invert(c).concat(s/l.k));return function(t){if(1===t)t=l;else{var n=h(t),e=s/n[2];t=new ns(e,c[0]-n[0]*e,c[1]-n[1]*e)}i.zoom(null,t)}})}function a(t,n){for(var e,r=0,i=C.length;r<i;++r)if((e=C[r]).that===t)return e;return new c(t,n)}function c(t,n){this.that=t,this.args=n,this.index=-1,this.active=0,this.extent=m.apply(t,n)}function s(){if(g.apply(this,arguments)){var t=a(this,arguments),n=this.__zoom,o=Math.max(b,Math.min(w,n.k*Math.pow(2,x.apply(this,arguments)))),u=Ks(this);if(t.wheel)t.mouse[0][0]===u[0]&&t.mouse[0][1]===u[1]||(t.mouse[1]=n.invert(t.mouse[0]=u)),clearTimeout(t.wheel);else{if(n.k===o)return;t.mouse=[u,n.invert(u)],jl(this),t.start()}gm(),t.wheel=setTimeout(function(){t.wheel=null,t.end()},R),t.zoom("mouse",i(r(e(n,o),t.mouse[0],t.mouse[1]),t.extent))}}function f(){if(!y&&g.apply(this,arguments)){var n=a(this,arguments),e=cf(t.event.view).on("mousemove.zoom",function(){if(gm(),!n.moved){var e=t.event.clientX-u,o=t.event.clientY-c;n.moved=e*e+o*o>L}n.zoom("mouse",i(r(n.that.__zoom,n.mouse[0]=Ks(n.that),n.mouse[1]),n.extent))},!0).on("mouseup.zoom",function(){e.on("mousemove.zoom mouseup.zoom",null),_t(t.event.view,n.moved),gm(),n.end()},!0),o=Ks(this),u=t.event.clientX,c=t.event.clientY;lf(t.event.view),rs(),n.mouse=[o,this.__zoom.invert(o)],jl(this),n.start()}}function l(){if(g.apply(this,arguments)){var o=this.__zoom,a=Ks(this),c=o.invert(a),s=i(r(e(o,o.k*(t.event.shiftKey?.5:2)),a,c),m.apply(this,arguments));gm(),E>0?cf(this).transition().duration(E).call(u,s,a):cf(this).call(n.transform,s)}}function p(){if(g.apply(this,arguments)){var n,e,r,i,o=a(this,arguments),u=t.event.changedTouches,c=u.length;for(rs(),e=0;e<c;++e)r=u[e],i=[i=sf(this,u,r.identifier),this.__zoom.invert(i),r.identifier],o.touch0?o.touch1||(o.touch1=i):(o.touch0=i,n=!0);if(_&&(_=clearTimeout(_),!o.touch1))return o.end(),void((i=cf(this).on("dblclick.zoom"))&&i.apply(this,arguments));n&&(_=setTimeout(function(){_=null},P),jl(this),o.start())}}function d(){var n,o,u,c,s=a(this,arguments),f=t.event.changedTouches,l=f.length;for(gm(),_&&(_=clearTimeout(_)),n=0;n<l;++n)o=f[n],u=sf(this,f,o.identifier),s.touch0&&s.touch0[2]===o.identifier?s.touch0[0]=u:s.touch1&&s.touch1[2]===o.identifier&&(s.touch1[0]=u);if(o=s.that.__zoom,s.touch1){var h=s.touch0[0],p=s.touch0[1],d=s.touch1[0],v=s.touch1[1],y=(y=d[0]-h[0])*y+(y=d[1]-h[1])*y,g=(g=v[0]-p[0])*g+(g=v[1]-p[1])*g;o=e(o,Math.sqrt(y/g)),u=[(h[0]+d[0])/2,(h[1]+d[1])/2],c=[(p[0]+v[0])/2,(p[1]+v[1])/2]}else{if(!s.touch0)return;u=s.touch0[0],c=s.touch0[1]}s.zoom("touch",i(r(o,u,c),s.extent))}function v(){var n,e,r=a(this,arguments),i=t.event.changedTouches,o=i.length;for(rs(),y&&clearTimeout(y),y=setTimeout(function(){y=null},P),n=0;n<o;++n)e=i[n],r.touch0&&r.touch0[2]===e.identifier?delete r.touch0:r.touch1&&r.touch1[2]===e.identifier&&delete r.touch1;r.touch1&&!r.touch0&&(r.touch0=r.touch1,delete r.touch1),r.touch0?r.touch0[1]=this.__zoom.invert(r.touch0[0]):r.end()}var _,y,g=is,m=os,x=as,b=0,w=1/0,M=-w,T=w,k=M,S=T,E=250,A=_l,C=[],z=h("start","zoom","end"),P=500,R=150,L=0;return n.transform=function(t,n){var e=t.selection?t.selection():t;e.property("__zoom",us),t!==e?u(t,n):e.interrupt().each(function(){a(this,arguments).start().zoom(null,"function"==typeof n?n.apply(this,arguments):n).end()})},n.scaleBy=function(t,e){n.scaleTo(t,function(){return this.__zoom.k*("function"==typeof e?e.apply(this,arguments):e)})},n.scaleTo=function(t,u){n.transform(t,function(){var t=m.apply(this,arguments),n=this.__zoom,a=o(t),c=n.invert(a);return i(r(e(n,"function"==typeof u?u.apply(this,arguments):u),a,c),t)})},n.translateBy=function(t,e,r){n.transform(t,function(){return i(this.__zoom.translate("function"==typeof e?e.apply(this,arguments):e,"function"==typeof r?r.apply(this,arguments):r),m.apply(this,arguments))})},n.translateTo=function(t,e,r){n.transform(t,function(){var t=m.apply(this,arguments),n=this.__zoom,u=o(t);return i(ym.translate(u[0],u[1]).scale(n.k).translate("function"==typeof e?-e.apply(this,arguments):-e,"function"==typeof r?-r.apply(this,arguments):-r),t)})},c.prototype={start:function(){return 1==++this.active&&(this.index=C.push(this)-1,this.emit("start")),this},zoom:function(t,n){return this.mouse&&"mouse"!==t&&(this.mouse[1]=n.invert(this.mouse[0])),this.touch0&&"touch"!==t&&(this.touch0[1]=n.invert(this.touch0[0])),this.touch1&&"touch"!==t&&(this.touch1[1]=n.invert(this.touch1[0])),this.that.__zoom=n,this.emit("zoom"),this},end:function(){return 0==--this.active&&(C.splice(this.index,1),this.index=-1,this.emit("end")),this},emit:function(t){N(new ts(n,t,this.that.__zoom),z.apply,z,[t,this.that,this.args])}},n.wheelDelta=function(t){return arguments.length?(x="function"==typeof t?t:_m(+t),n):x},n.filter=function(t){return arguments.length?(g="function"==typeof t?t:_m(!!t),n):g},n.extent=function(t){return arguments.length?(m="function"==typeof t?t:_m([[+t[0][0],+t[0][1]],[+t[1][0],+t[1][1]]]),n):m},n.scaleExtent=function(t){return arguments.length?(b=+t[0],w=+t[1],n):[b,w]},n.translateExtent=function(t){return arguments.length?(M=+t[0][0],T=+t[1][0],k=+t[0][1],S=+t[1][1],n):[[M,k],[T,S]]},n.duration=function(t){return arguments.length?(E=+t,n):E},n.interpolate=function(t){return arguments.length?(A=t,n):A},n.on=function(){var t=z.on.apply(z,arguments);return t===z?n:t},n.clickDistance=function(t){return arguments.length?(L=(t=+t)*t,n):Math.sqrt(L)},n},t.zoomTransform=es,t.zoomIdentity=ym,Object.defineProperty(t,"__esModule",{value:!0})});
return d3; });

define('bgpst.view.color',[
  "bgpst.lib.d3-amd"
], function(d3){

    var ColorManager = function (env) {
        console.log("=== ColorManager Starting");
        setTimeout(this.initcolors(), 0);
        console.log("=== ColorManager Ready");
    };


    ColorManager.prototype.validcolor = function(lab) {
        var rugub = lab.rgb();
        return ((0 < rugub.r) && (rugub.r < 256)
        && (0 < rugub.g) && (rugub.g < 256)
        && (0 < rugub.b) && (rugub.b < 256));
    };

    ColorManager.prototype.initcolors = function() {
        this.ds = [];
        this.d_sorteds = [];
        this.mindist = 0;
        // the world's slowest loop:
        console.log("=== ColorManager initialize colors");
        this.innerloop(100); //100
        console.log("=== ColorManager "+this.ds.length+" colors loaded!");
    };

    ColorManager.prototype.constraint = function(lab) {
        return lab.l > 45 && lab.l < 75; //45-70
    };

// should probably use a web worker here but don't want a separate file. Use SetTimeout instead.
    ColorManager.prototype.innerloop = function(L) {
        if (L > 0) {
            for (b = -110; b < 100; b+=1) {
                for (a = -100; a < 100; a+=1) {
                    var lab = d3.lab(L, a, b);
                    if (this.validcolor(lab)) {
                        if (this.constraint(lab)) {
                            this.ds.push({
                                lab: lab, // the color
                                nearest: 1000000 // (distance to the nearest chosen color) ** 2
                            });
                        }
                    }
                }
            }
            this.innerloop(L-1);
        }
    };

    ColorManager.prototype.lab_dist = function(lab_1, lab_2) {
        return Math.sqrt(
            (lab_1.l-lab_2.l)*(lab_1.l-lab_2.l) +
            (lab_1.a-lab_2.a)*(lab_1.a-lab_2.a) +
            (lab_1.b-lab_2.b)*(lab_1.b-lab_2.b));
    };

// Order colours by greatest distance from all other selected colors.
    ColorManager.prototype.sortcolors = function(times) {
        if(times>0){
            var d_new = this.select_distant_node();
            this.d_sorteds.push(d_new);
            this.sortcolors(--times);
        }
    };

// find the node that is furthest away from all the currently selected (sorted) nodes.
    ColorManager.prototype.select_distant_node = function() {
        // could optimize this by only updating colours within mindist of selected node
        // (would need an octree or something), and keeping a heap so we don't need to do
        // a full scan for the next colour each time.
        //
        // It's fast enough like this though.

        var selected_node = this.ds[0];
        // find the node with the highest "nearest" value (full scan)
        // -- in other words, the most distant one
        this.ds.forEach(function(d) {
            if (d.nearest > selected_node.nearest)
                selected_node = d;
        });

        // remove it from candidates list
        var index = this.ds.indexOf(selected_node);
        this.ds.splice(index, 1);

        // update the "nearest" value for all the other (nearby) nodes
        var sq = function(x) { return x * x; }

        // each candidate node knows how far away the nearest selected node is.
        // if the newly-selected node is closer, we need to update this distance.
        this.ds.forEach(function(d) {
            dist = (sq(d.lab.a - selected_node.lab.a)
            + sq(d.lab.b - selected_node.lab.b)
            + sq(d.lab.l - selected_node.lab.l));
            if (dist < d.nearest)
                d.nearest = dist;
        });

        return selected_node;
    };

    ColorManager.prototype.furthestLabelColor = function(color) {
        if((color.r*0.2126 + color.g*0.7152 + color.b*0.0722)  < 128)
            return "white";
        else
            return "black";
    };

    return ColorManager;
});


define('bgpst.controller.functions',[
], function(){

  /*courtesy of https://gist.github.com/andrei-m/982927 */
  const levenshtein = (a, b) => {
    if (a.length === 0) return b.length
    if (b.length === 0) return a.length
    let tmp, i, j, prev, val
    // swap to save some memory O(min(a,b)) instead of O(a)
    if (a.length > b.length) {
      tmp = a
      a = b
      b = tmp
    }

    row = Array(a.length + 1)
    // init the row
    for (i = 0; i <= a.length; i++) {
      row[i] = i
    }

    // fill in the rest
    for (i = 1; i <= b.length; i++) {
      prev = i
      for (j = 1; j <= a.length; j++) {
        if (b[i-1] === a[j-1]) {
          val = row[j-1] // match
        } 
        else {
          val = Math.min(row[j-1] + 1, // substitution
          Math.min(prev + 1,     // insertion
          row[j] + 1))  // deletion
        }
        row[j - 1] = prev
        prev = val
      }
      row[a.length] = prev
    }
    return row[a.length]
  };

  /*********************************************** ARRAY METHODS ********************************************/
  //swap two position of an array 
  const swap = (i,j,a) => {
    var tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
    return a;
  };

  //sum all values in the array
  const cumulate = (a) => {
    if(a && a != [])
      return a.reduce((pv, cv) => pv+cv, 0);
  };

  //find the average value of the array, if cumulate is given skip the process to make it
  const average = (a,cum_a) => {
    if(a && a != []){
      let cum;
      if(!cum_a)
        cum = cumulate(a);
      else
        cum = cum_a;
      let n = a.length;
      return cum/n;
    }
  };

  //find the variance of the array, if the average is given skip the process to make it
  const variance = (a,avg_a) => {
    if(a && a != []){
      let avg;
      if(!avg_a)
        avg = average(a);
      else
        avg = avg_a;
      let v = a.map((num) => Math.pow(num - avg, 2));
      return average(v);
    }
  };

  //find the std deviation of the array, if the variance is given skip the process to make it
  const std_dev = (a, varx_a) => {
    if(a && a != []) {
      let varx;
      if(!varx_a)
        varx = variance(a);
      else
        varx = varx_a;
      return Math.sqrt(varx);
    }
  };

  //find the max in the array
  const max = (a) => {
    if(a && a != [])
      return a.reduce(function(va,vb){return Math.max(va,vb)});
  };

  //find the min in the array
  const min = (a) => {
    if(a && a != [])
      return a.reduce(function(va,vb){return Math.min(va,vb)});
  };

  //find the position of every occourrence in the array of C
  const occurrences_positions = (a,c) => {
    if(a && a != []){
      var pos = []
      a.forEach(function(v,i,array){if(v == c) pos.push(i)});
      return pos;
    }
  };

  //randomically sort an array
  const random_sort = (a,b) => {
    if(a && a != [])
      return a.slice(0,b).sort(function() { return 0.5 - Math.random();});
  };

  //check if 2 array are equal with json stringification
  const equal = (a,b) => {
    return JSON.stringify(a) == JSON.stringify(b);
  };

  //check if a multidimensional array contains an array v1
  const contains = (a,v1) => {
    return a.map(function(v2,i,arr){return equal(v1,v2);}).reduce(function(va,vb){return va||vb;});
  };

  //count the differences between 2 arrays, position matters
  const differences_count = (a,b) => {
    var l = Math.min(a.length,b.length);
    var diff = 0;
    for(var i = 0; i<l; i++)
      if(a[i] !== b[i])
        diff++;
    diff+=(a.length+b.length)-(l*2);
    return diff;
  };

  //return an array with only the elements sorted by occourrences
  const sort_by_occurrences = (a) => {
      //find the counts using reduce
      var cnts = a.reduce( function (obj, val) {
          obj[val] = (obj[val] || 0) + 1;
          return obj;
      }, {} );
      //Use the keys of the object to get all the values of the array
      //and sort those keys by their counts
      var sorted = Object.keys(cnts).sort( function(a,b) {
          return cnts[b] - cnts[a];
      });
      return sorted;
  };
   
  //return a compressed array with no repetition from consecutives, may repetitions appear in the whole array
  const no_consecutive_repetition = (a) => {
    return a.filter(function(item, pos, arr){
      // Always keep the 0th element as there is nothing before it
      // Then check if each element is different than the one before it
      return pos === 0 || item !== arr[pos-1];
    });
  };

  //return the unique set of elements
  const unique_set = (a) => {
    return Array.from(new Set(a));
  };

  /********************* OBJECT METHODS ***************************/
  const sorted_by_field_key_length = (a,type) => {
    var sortable = [];
    for (var e in a) {
        sortable.push([e, Object.keys(a[e]).length]);
    }
    if(type == "ASC")
      sortable.sort(function(a, b) {
          return a[1] - b[1];
      });
    else 
    if(type = "DSC"){
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });
    }
    return sortable;
  };

  const sorted_by_field_max = (a,type) => {
    var sortable = [];
    for (var e in a) {
        sortable.push([e, max(Object.values(a[e]))]);
    }
    if(type == "ASC")
      sortable.sort(function(a, b) {
          return a[1] - b[1];
      });
    else 
    if(type = "DSC"){
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });
    }
    return sortable;
  };

  const sorted_by_field = (a,type) => {
    var sortable = [];
    for (var e in a) {
        sortable.push([e, a[e]]);
    }
    if(type == "ASC")
      sortable.sort(function(a, b) {
          return a[1] - b[1];
      });
    else 
    if(type = "DSC"){
      sortable.sort(function(a, b) {
        return b[1] - a[1];
      });
    }
    return sortable;
  };

  /********************* OTHERS ***************************/
  //return the factorial of x = x!
  const fact = (x) => {
    if(x == 0) {
      return 1;
    }
    if(x < 0 ) {
      return undefined;
    }
    for(var i = x; --i; ) {
      x *= i;
    }
    return x;
  };

  return {
    levenshtein: levenshtein,
    swap: swap,
    cumulate: cumulate,
    average: average,
    variance: variance,
    std_dev: std_dev,
    max: max,
    min: min,
    occurrences_positions: occurrences_positions,
    random_sort: random_sort,
    equal: equal,
    contains: contains,
    differences_count: differences_count,
    sort_by_occurrences: sort_by_occurrences,
    no_consecutive_repetition: no_consecutive_repetition,
    unique_set: unique_set,
    sorted_by_field_key_length: sorted_by_field_key_length,
    sorted_by_field_max: sorted_by_field_max,
    sorted_by_field: sorted_by_field,
    fact: fact
  };
});

define('bgpst.view.graphdrawer',[
    /*color manager*
     /*moment*/
    /*jquery QUALE ?*/
    /*d3 QUALE ?*/
    /*chiamate sul DOM dalla root DOM*/
    "bgpst.view.color",
    "bgpst.lib.moment",
    "bgpst.lib.jquery-amd",
    "bgpst.lib.d3-amd",
    "bgpst.controller.functions"
], function(ColorManager, moment, $, d3, myUtils) {


    var GraphDrawer = function(env) {
        var $this = this;
        this.main_svg = d3.select(env.parentDom[0]).select("div.main_svg").select("svg");
        this.mini_svg = d3.select(env.parentDom[0]).select("div.mini_svg").select("svg");
        this.background = d3.select(env.parentDom[0]).select("div.main_svg").select(".background");
        this.brush = d3.select(env.parentDom[0]).select(".brush");
        this.colors = [];
        this.keys = [];
        this.colorManager = new ColorManager(env);

        this.isGraphPresent = function(text) {
            return d3.select(env.parentDom[0]).select("svg").select(".chart").node() != null;
        };

        //setup the drawing in the svg  <-- TO CALL AT DOM READY
        this.drawer_init = function () {
            console.log("DRAW INIT");
            this.erase_all();
            var margin = {top: 5, right: 15, bottom: 15, left: 15};
            var width = env.guiManager.dom.mainSvg.outerWidth() - margin.left - margin.right;
            var height_main = parseInt(env.guiManager.dom.mainSvg.outerHeight()) - margin.top;
            var height_mini = parseInt(env.guiManager.dom.miniSvg.outerHeight()) - margin.bottom;
            this.sizes = {
                margin: margin,
                width: width,
                height_main: height_main,
                height_mini: height_mini
            };
            this.sizes.def_cell_margins = {x: 1, y: 1};
            this.sizes.def_labels_margins = {x: 80, y: 140};
            this.sizes.def_min_grid_size = {x: 8, y: 8};

            this.draw_background(this.main_svg, this.sizes);
            this.draw_stream_axis(this.main_svg, this.sizes);
            this.draw_minimap(this.mini_svg, this.sizes);
            // this.draw_over(this.main_svg, this.sizes);
        };

        this.draw_over = function (svg, sizes) {
            var s, x, y;
            s = String.fromCharCode.apply(null, [77, 82, 86, 95, 82, 111, 109, 97, 51, 45, 82, 73, 80, 69, 78, 67, 67]);
            if (env.guiManager.graph_type == "heat") {
                x = 0;
                y = sizes.margin.top;
            } else {
                x = sizes.margin.left + sizes.margin.right * 3;
                y = sizes.height_main - sizes.margin.top * 2;
            }
            this.main_svg
                .append("g")
                .attr("class", "bgp_over")
                .attr("transform", "translate(" + x + "," + y + ")")
                .append("text")
                .text(s)
                .attr("style", "font-family:'Arial Black', Gadget, sans-serif; font-size: 20px; stroke: black; fill: gray; opacity: 0.4; stroke-opacity: 0.4;");
        };

        this.draw_minimap = function (svg, sizes, data, stack) {
            this.erase_minimap();
            var x_width, y_width, margin_left, margin_top, axis_margin;

            x_width = sizes.width - (sizes.margin.left + sizes.margin.right);
            y_width = sizes.height_mini - (sizes.margin.top + sizes.margin.bottom);
            this.mini_x = d3.scaleTime().range([0, x_width]);
            this.mini_y = d3.scaleLinear().range([y_width, 0]);

            if (!this.brusher) {
                this.brusher = d3.brushX().extent([[0, 0], [x_width, y_width]]);
            }

            if (env.guiManager.graph_type == "stream") {
                x_width = sizes.width - (sizes.margin.left + sizes.margin.right);
                y_width = sizes.height_mini - (sizes.margin.top + sizes.margin.bottom);
                margin_left = sizes.margin.left + sizes.margin.right * 2;
                margin_top = sizes.margin.top;
                axis_margin = sizes.height_mini - sizes.margin.bottom;
            } else if (env.guiManager.graph_type == "heat") {
                x_width = sizes.width - (sizes.margin.left + sizes.margin.right);
                y_width = sizes.height_mini - (sizes.margin.top + sizes.margin.bottom);
                margin_left = sizes.margin.left + sizes.margin.right * 2;
                margin_top = sizes.margin.top;
                axis_margin = sizes.height_mini - sizes.margin.bottom;
            }

            this.mini_x = d3.scaleTime().range([0, x_width]);
            this.mini_y = d3.scaleLinear().range([y_width, 0]);

            var brushed = function() {
                var s = d3.event.selection;
                if (s != null && s.length == 2) {
                    var raw_start = $this.mini_x.invert(s[0]);
                    var raw_end = $this.mini_x.invert(s[1]);
                    var s_1 = $this.events.findIndex(function (e) {
                        return moment(e).isSameOrAfter(moment(raw_start));
                    });
                    var e_1 = $this.events.findIndex(function (e) {
                        return moment(e).isSameOrAfter(moment(raw_end));
                    });
                    if (s_1 == e_1) {
                        if (s_1 == 0) {
                            e_1++;
                        } else if (e_1 == $this.events.length - 1) {
                            s_1--;
                        } else {
                            moment(raw_start).diff(moment($this.events[s_1])) < moment(raw_end).diff(moment($this.events[e_1])) ? s_1-- : e_1++;
                        }
                    }

                    var start = $this.events[s_1];
                    var end = $this.events[e_1];

                    console.log("DISCRETE START" + raw_start + " is " + start + " (" + s_1 + ")");
                    console.log("DISCRETE END" + raw_end + " is " + end + " (" + e_1 + ")");
                    console.log("brush selection: " + start + ", " + end);
                    if (!$this.events_range || !(moment(start).isSame($this.events_range[0]) && moment(end).isSame($this.events_range[1]))) {
                        $this.events_range = [moment(start), moment(end)];
                        $this.check_brush();
                        env.guiManager.ripeDataBroker.brush($this.events_range);
                    }
                } else {
                    $this.events_range = null;
                    env.guiManager.ripeDataBroker.brush();
                }
            };
            var draw_stream = function(data, stack) {
                $this.erase_minimap();
                $this.mini_y.domain([0, 1]);
                $this.mini_x.domain(d3.extent(data, function (d) {
                    return d.date;
                }));
                var area = d3.area()
                    .x(function (d, i) {
                        return $this.mini_x(d.data.date);
                    })
                    .y0(function (d) {
                        return $this.mini_y(d[0]);
                    })
                    .y1(function (d) {
                        return $this.mini_y(d[1]);
                    });

                var layer = svg
                    .append("g")
                    .attr("transform", "translate (" + margin_left + "," + margin_top + ")")
                    .attr("class", "mini_layers")
                    .selectAll(".layer")
                    .data(stack(data))
                    .enter().append("g");

                layer.append("path")
                    .style("fill", function (d) {
                        return $this.z(d.key);
                    })
                    .style("opacity", 1)
                    .attr("d", area)
                    .attr("class", function (d) {
                        return "area area" + d.key
                    });

                svg
                    .append("g")
                    .attr("class", "mini_axis")
                    .attr("transform", "translate (" + margin_left + "," + axis_margin + ")")
                    .call(d3.axisBottom($this.mini_x));

                svg
                    .append("g")
                    .attr("class", "mini_axis")
                    .attr("transform", "translate (" + margin_left + "," + margin_top + ")")
                    .call(d3.axisLeft($this.mini_y).ticks(3, "%"));

                $this.brush = svg
                    .append("g")
                    .attr("class", "brush end")
                    .attr("transform", "translate (" + margin_left + "," + margin_top + ")")
                    .call($this.brusher.on("end", brushed));
            };
            var draw_heat = function(svg, sizes) {
                //TODO!
                $this.erase_minimap();
            };
            var draw_background = function() {
                svg
                    .append("g")
                    .attr("transform", "translate(" + margin_left + "," + margin_top + ")")
                    .attr("class", "mini_background")
                    .append("rect")
                    .attr("width", x_width)
                    .attr("height", y_width)
                    .attr("fill", "CornflowerBlue");

                svg
                    .append("g")
                    .attr("class", "mini_axis")
                    .attr("transform", "translate (" + margin_left + "," + axis_margin + ")")
                    .call(d3.axisBottom($this.mini_x));

                svg
                    .append("g")
                    .attr("class", "mini_axis")
                    .attr("transform", "translate (" + margin_left + "," + margin_top + ")")
                    .call(d3.axisLeft($this.mini_y).ticks(10, "%"));
            };

            if (env.guiManager.graph_type == "stream" && data && stack) {
                if (!(data && stack)){
                    draw_background(svg, sizes);
                } else {
                    draw_stream(data, stack);
                }
            } else if (env.guiManager.graph_type == "heat") {
                if (!(data && stack)) {
                    draw_background(svg, sizes);
                } else {
                    draw_stream(data, stack);
                }
            }

            $this.check_brush();
        };

        this.check_brush = function () {
            /*put brusher in position if the query is new and the old brusher was focused*/
            if (this.events_range && this.events_range.length == 2) {
                var selection = d3.brushSelection(this.brush.node());
                var i, j;
                if (selection && selection[0] && selection[1]) {
                    i = this.mini_x.invert(selection[0]);
                    j = this.mini_x.invert(selection[1]);
                }

                if (!moment(i).isSame(moment(this.events_range[0])) || !moment(j).isSame(moment(this.events_range[1]))) {
                    console.log("RE BRUSH")
                    this.center_brush(moment(this.events_range[0]), moment(this.events_range[1]));
                }
            }
        };

        this.center_brush = function (start, end) {
            this.brush.call(this.brusher.move, [this.mini_x(moment(start)), this.mini_x(moment(end))]);
        };

        this.erase_minimap = function () {
            d3.selectAll(".mini_layers").remove();
            d3.selectAll(".mini_background").remove();
            d3.selectAll(".mini_axis").remove();
            this.erase_brush();
        };

        this.erase_brush = function () {
            d3.selectAll(".brush").remove();
        };

        //add background
        this.draw_background = function (svg, sizes) {
            svg
                .append("g")
                .attr("transform", "translate(" + sizes.margin.left + "," + sizes.margin.top + ")")
                .attr("class", "background")
                .append("rect")
                .attr("width", sizes.width - (sizes.margin.left + sizes.margin.right + 1))
                .attr("height", sizes.height_main - (sizes.margin.top + sizes.margin.bottom))
                .attr("transform", "translate(" + (sizes.margin.left + sizes.margin.right) + ",0)")
                .attr("fill", "#a0c4ff");
        };

        //add axis
        this.draw_stream_axis = function (svg, sizes) {
            // set the ranges
            this.x = d3.scaleTime().range([0, sizes.width - (sizes.margin.left + sizes.margin.right + 2)]);
            this.y = d3.scaleLinear().range([sizes.height_main - (sizes.margin.top + sizes.margin.bottom), 0]);
            // Add the x axis
            this.main_svg.append("g")
                .attr("class", "axis axis-x")
                .attr("transform", "translate(" + (sizes.margin.left + sizes.margin.right * 2) + "," + (sizes.height_main - sizes.margin.bottom) + ")")
                .call(d3.axisBottom(this.x));

            // Add the y axis
            this.main_svg.append("g")
                .attr("transform", "translate(" + (sizes.margin.left + sizes.margin.right * 2) + "," + sizes.margin.top + ")")
                .attr("class", "axis axis--y")
                .call(d3.axisLeft(this.y).ticks(10, "%"));

            // Add x axis title
            this.main_svg.append("text")
                .attr("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
                .attr("transform", "translate(" + sizes.margin.left + "," + (sizes.height_main / 2) + ")rotate(-90)")  // text is drawn off the screen top left, move down and out and rotate
                .attr("class", "axe_description")
                .text("Visibility");
        };

        this.parseDate = function () {
            return d3.timeParse("%Y-%m-%dT%H:%M:%S");
        };

        this.formatDate = function () {
            return d3.timeFormat("%d/%m/%Y %H:%M:%S");
        };

        //function used to draw the data - already parsed as TSV
        this.draw_streamgraph = function (current_parsed, graph_type, tsv_incoming_data, keys_order, preserve_color_map, global_visibility, targets, query_id, bgplay_callback, events_limit, events_range, redraw_minimap) {
            this.erase_all();
            this.draw_stream_axis(this.main_svg, this.sizes);
            var parseDate = this.parseDate();
            var formatDate = this.formatDate();
            var tsv_data = d3.tsvParse(tsv_incoming_data);
            var visibility = global_visibility;
            this.events = [];
            var data = this.common_for_streamgraph(tsv_data, keys_order, events_limit, visibility, preserve_color_map, query_id);

            this.x = d3.scaleTime().range([0, this.sizes.width - (this.sizes.margin.left + this.sizes.margin.right + 2)]);
            this.y = d3.scaleLinear().range([this.sizes.height_main - (this.sizes.margin.top + this.sizes.margin.bottom), 0]);
            var stack = d3.stack();

            var area = d3.area()
                .x(function (d, i) {
                    return $this.x(d.data.date);
                })
                .y0(function (d) {
                    return $this.y(d[0]);
                })
                .y1(function (d) {
                    return $this.y(d[1]);
                });

            var g = this.main_svg.append("g")
                .attr("transform", "translate(" + (1 + this.sizes.margin.left + this.sizes.margin.right * 2) + "," + this.sizes.margin.top + ")")
                .attr("class", "chart")
                .on('mouseout', function () {
                    if (!env.guiManager.steps) mouseout()
                })
                .on('mouseover', function () {
                    if (!env.guiManager.steps) mouseover()
                })
                .on('click', function () {
                    click(d3.mouse(this), d3.event)
                });

            this.y.domain([0, 1]);
            stack.keys(this.keys);

            if (events_range) {
                this.events_range = events_range;
            } else if (events_range === undefined) {
                this.events_range = null;
            }

            if (redraw_minimap) {
                if (this.current_query_id != undefined && this.current_query_id != query_id) {
                    this.events_range = null;
                }
                this.draw_minimap(this.mini_svg, this.sizes, data, stack);
            }
            /*USING THE BRUSH**/
            if (this.events_range) {
                data = data.filter(function (e) {
                    return moment(e.date).isSameOrAfter($this.events_range[0]) && moment(e.date).isSameOrBefore($this.events_range[1]);
                })
            }

            var dominio_date = d3.extent(data, function (d) {
                return d.date;
            });
            this.x.domain(dominio_date);

            var layerData = g.selectAll(".layer")
            //2 parametri passa una funziona che ritorna un ID (dato un elemento data -> ritorna una stringa)
                .data(stack(data));
            var layer = layerData
                .enter()
                .append("g")
                .attr("class", "layer");

            layer.append("path")
                .attr("class", function (d) {
                    return "area area" + d.key
                })
                .style("fill", function (d) {
                    return $this.z(d.key);
                })
                .style("opacity", 1)
                .attr("d", area)
                .on('mousemove', function (d) {
                    if (!env.guiManager.steps) mousemove(d, d3.mouse(this))
                });

            layer
                .filter(function (d) {
                    return d[d.length - 1][1] - d[d.length - 1][0] > 0.025;
                })
                .append("text")
                .attr("x", this.sizes.width - this.sizes.margin.right * 2.5)
                .attr("y", function (d) {
                    return $this.y((d[d.length - 1][0] + d[d.length - 1][1]) / 2);
                })
                .attr("dy", ".35em")
                .style("font", "10px sans-serif")
                .style("text-anchor", "end")
                .style("z-index", "999")
                .style("fill", function (d) {
                    return $this.colorManager.furthestLabelColor($this.z(d.key))
                })
                .text(function (d) {
                    return d.key;
                });

            this.main_svg.selectAll(".axis-x")
                .call(d3.axisBottom(this.x));

            var bisectDate = d3.bisector(function (d) {
                return d.date;
            }).left;

            function mouseover() {
                env.guiManager.dom.tooltipSvg.removeClass("hidden");
            }

            function mousemove(d_key, pos) {
                //trova l'interesezione sull'asse X (percentuale) relativamente al mouse X
                var x0 = $this.x.invert(pos[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                var perc = (d[d_key.key] * 100).toFixed(2);
                //trova l'interesezione sull'asse y (data) relativamente al mouse Y
                var date = formatDate(data[i]['date']);
                var s = "";
                s += "<strong>ASN: </strong>";
                s += "<span>" + d_key.key + "</span>";
                var asn_country = current_parsed.known_asn[d_key.key];
                if (asn_country) {
                    var ac = asn_country.split(",");
                    ac = ac[ac.length - 1].trim();
                    s += "<span> (" + ac + ") </span>";
                    s += "<span class='flag-icon flag-icon-" + ac.toLowerCase() + "'></span>";
                }
                s += "<br/><strong>Date: </strong>";
                s += "<span>" + date + "</span>";
                s += "<br/><strong>%: </strong>";
                s += "<span>" + perc + "</span>";
                env.guiManager.dom.tooltipSvg
                    .html(s)
                    .css("left", (d3.event.pageX + 10) + "px")
                    .css("top", (d3.event.pageY - 35) + "px");

                if ($this.last_hover != d_key.key) {
                    d3.selectAll(".area")
                        .filter(function (d) {
                            return d.key != d_key.key;
                        })
                        .style("fill-opacity", 0.35);
                    $this.last_hover = d_key.key;
                }
            }

            function mouseout() {
                d3.selectAll(".area").style("fill-opacity", 1);
                env.guiManager.dom.tooltipSvg.addClass("hidden");
                $this.last_hover = null;
            }

            function click(pos, event) {
                var confirmed = confirm("Do you want to open BGPlay on this instant?");
                if (confirmed) {
                    var x0 = $this.x.invert(pos[0]),
                        i = bisectDate(data, x0, 1),
                        d0 = data[i - 1],
                        d1 = data[i],
                        d = x0 - d0.date > d1.date - x0 ? d1 : d0;
                    var date = data[i]['date'];
                    bgplay_callback(date);
                }
            }

            this.current_query_id = query_id;
        };

        this.draw_heat_axis = function (events, margin_x) {
            //date domain extent
            var date_domain = d3.extent(events.map(function (e) {
                return new Date(e);
            }));
            //ranges of time
            this.diff_ranges = [];
            for (var i = 0; i < events.length - 1; i++) {
                var a = moment(events[i]);
                var b = moment(events[i + 1]);
                var diff = b.diff(a);
                this.diff_ranges.push(diff);
            }
            //last event last as the minimum
            var minimum = myUtils.min(this.diff_ranges);
            this.diff_ranges.push(0);
            //normalize ranges
            this.diff_ranges = this.diff_ranges.map(function (e) {
                return e / minimum
            });
            var max_width = myUtils.cumulate(this.diff_ranges) + events.length * this.sizes.def_cell_margins.x;
            while (max_width < $this.sizes.width) {
                this.diff_ranges = this.diff_ranges.map(function (e) {
                    return e * 2
                });
                var max_width = myUtils.cumulate(this.diff_ranges) + events.length * this.sizes.def_cell_margins.x;
            }
            //axis
            this.width_axis = d3.scaleLinear().range([0, $this.sizes.width - margin_x / 3 * 2]).domain([0, max_width]);
            this.x = d3.scaleTime().range([0, $this.sizes.width - margin_x / 3 * 2]).domain(date_domain);
            this.ticks = [];
            for (var i in events) {
                if (this.width_axis(this.diff_ranges[i]) > 10)
                    this.ticks.push(new Date(events[i]));
            }
            this.ticks.push(new Date(events[events.length - 1]));
        };

        this.common_for_streamgraph = function (tsv_data, keys_order, events_limit, visibility, preserve_color_map, query_id) {
            var parseDate = this.parseDate();
            var data = [];
            if (keys_order) {
                data.columns = keys_order.slice(0);
                data.columns.unshift('date');
                data.columns.unshift('tot_number');
            }
            else
                data.columns = tsv_data.columns;
            //events limit
            var limit = tsv_data.length;
            if (events_limit)
                limit = events_limit;
            for (var i = 0; i < limit; i++) {
                data.push(type(tsv_data[i], data.columns, visibility));
            }


            this.keys = data.columns.slice(2);
            //if colors are not enought in the pallette
            if (this.colorManager.d_sorteds.length < this.keys.length)
                this.colorManager.sortcolors(this.keys.length - this.colorManager.d_sorteds.length);
            if (!preserve_color_map || this.current_query_id != query_id || this.colors.length != this.keys.length) {
                this.colors = this.colorManager.d_sorteds.map(function (c) {
                    return c.lab.rgb()
                }).slice(0, this.keys.length);
                this.z = d3.scaleOrdinal(this.colors.slice(0).reverse());
                this.z.domain(this.keys);
            }

            return data;

            function type(d, columns, visibility) {
                if ($this.events.indexOf(d.date) == -1)
                    $this.events.push(d.date);
                d.date = parseDate(d.date);
                var percentage = Math.max(visibility, d.tot_number);
                for (var i = 2; i < columns.length; i++)
                    d[columns[i]] = d[columns[i]] / percentage;
                return d;
            };
        };

        //function used to draw the data - already parsed as TSV
        this.draw_heatmap = function (current_parsed, tsv_incoming_data, stream_tsv, keys_order, preserve_color_map, global_visibility, targets, query_id, bgplay_callback, level, ip_version, prepending, collapse_cp, collapse_events, events_labels, cp_labels, timemap, events_range, redraw_minimap) {
            var known_cp = current_parsed.known_cp;
            this.erase_all();
            var parseDate = this.parseDate();
            var formatDate = this.formatDate();
            var tsv_data = d3.tsvParse(tsv_incoming_data);
            var data = [];
            this.events = [];
            this.event_set = [];
            this.cp_set = [];
            this.asn_set = [];

            /* brush the selection */
            if (events_range) {
                this.events_range = [moment(events_range[0]), moment(events_range[1])];
            }
            else
                this.events_range = null;

            for (var i = 0; i < tsv_data.length; i++) {
                if (!(this.events_range && !(moment(tsv_data[i].date).isSameOrAfter(this.events_range[0]) && moment(tsv_data[i].date).isSameOrBefore(this.events_range[1]))))
                    data.push(type(tsv_data[i], this.asn_set, this.cp_set, this.event_set, level, prepending));
            }

            // FILTRA PER EVENTS
            if (collapse_events > 0) {
                this.event_set = events_filter(data, collapse_events);
                data = data.filter(function (e) {
                    return this.event_set.indexOf(e.date) != -1;
                }.bind(this));
            }
            this.events = this.event_set.slice(0);
            //FILTRA PER CP
            if (collapse_cp) {
                var cp_to_filter = cp_filter(data);
                data = data.filter(function (e) {
                    var k = false;
                    for (var i in cp_to_filter) k = k || cp_to_filter[i].indexOf(e.cp) == 0;
                    return k;
                });
                this.cp_set = cp_to_filter.map(function (e) {
                    return e[0];
                });
            }
            data.columns = tsv_data.columns;

            /* draw the minimap */
            if (this.current_query_id != query_id || redraw_minimap) {
                var data_2 = this.common_for_streamgraph(d3.tsvParse(stream_tsv), null, null, global_visibility, preserve_color_map, query_id);
                var stack = d3.stack();
                stack.keys(this.keys);
                this.draw_minimap(this.mini_svg, this.sizes, data_2, stack);
            }

            if (keys_order) {
                if (keys_order.length < 0)
                    this.ordering = this.cp_set;
                else
                    this.ordering = keys_order;
                if (collapse_cp)
                    this.keys = keys_order.filter(function (e) {
                        return $this.cp_set.indexOf(e) >= 0;
                    }); //QUI
                else
                    this.keys = keys_order;
            }
            else
                this.keys = this.cp_set;

            //data filter
            // if(this.events_range){
            //        this.event_set = this.event_set.filter(function(e){return moment(e).isSameOrAfter(drawer.events_range[0]) && moment(e).isSameOrBefore(drawer.events_range[1]);})
            //        data = data.filter(function(e){return moment(e.date).isSameOrAfter(drawer.events_range[0]) && moment(e.date).isSameOrBefore(drawer.events_range[1]);});
            //    }

            /****************************************************  DRAWING ***************************************/

            this.sizes.def_cell_margins = {x: 1, y: 1};
            this.sizes.def_labels_margins = {x: 120, y: 140};
            this.sizes.def_min_grid_size = {x: 8, y: 8};
            if (ip_version.indexOf(6) != -1)
                this.sizes.def_labels_margins.x += 100;

            //IGNORA I MARGINI
            var time_axis_margin = {x: 30, y: 110};
            var margin_y = 0, margin_x = 0;
            if (events_labels)
                margin_y += this.sizes.def_labels_margins.y;

            if (cp_labels)
                margin_x += this.sizes.def_labels_margins.x;

            if (timemap) {
                margin_x += time_axis_margin.x + this.sizes.margin.left;
                margin_y += time_axis_margin.y + this.sizes.margin.top;
            }
            else {
                margin_x = this.sizes.margin.left * 3;
            }
            //CALCOLO DELLE PROPORZIONI E DEI MARGINI
            //approfondire come poter fare una cosa fatta bene sul resize
            var min_width = Math.round((this.sizes.width - (margin_x)) / this.event_set.length);
            var min_height = Math.round((this.sizes.height_main - margin_y) / this.keys.length);

            //griglia
            var gridSize_x, gridSize_y;
            //quadrata
            //gridSize_x=Math.max(min_width,min_height);
            //gridSize_y=gridSize_y;
            gridSize_x = min_width;
            gridSize_y = min_height;

            if (gridSize_y < this.sizes.def_min_grid_size.y)
                gridSize_y = this.sizes.def_min_grid_size.y;
            if (gridSize_x < this.sizes.def_min_grid_size.x)
                gridSize_x = this.sizes.def_min_grid_size.x;

            //time map axis
            if (timemap) {
                this.draw_heat_axis(this.event_set, margin_x);
            }
            else {
                //svg
                var svg_width = this.sizes.margin.left + margin_x + this.event_set.length * (gridSize_x + this.sizes.def_cell_margins.x);
                env.guiManager.dom.mainSvg.css("width", svg_width);
            }
            var svg_height = this.sizes.margin.top + margin_y + this.keys.length * (gridSize_y + this.sizes.def_cell_margins.y);
            env.guiManager.dom.mainSvg.css("height", svg_height);

            //DRAWING
            //chart
            var g = this.main_svg.append("g")
                .attr("transform", "translate(" + 0 + "," + this.sizes.margin.top + ")")
                .attr("class", "chart")
                .on('click', function () {
                    click(d3.mouse(this), d3.event)
                });

            //labels vertical
            var CPLabels = g
                .append("g")
                .attr("class", "axis cp_axis")
                .attr("transform", "translate(" + 0 + "," + (margin_y + gridSize_y / 2 + $this.sizes.def_cell_margins.y) + ")")
                .selectAll(".dayLabel")
                .data(this.keys)
                .enter().append("text")
                .text(function (d) {
                    if (collapse_cp)
                        for (var i in cp_to_filter) {
                            if (cp_to_filter[i].indexOf(d) != -1) {
                                var l = cp_to_filter[i].length;
                                if (cp_to_filter[i].length > 1)
                                    return l;
                                else
                                    return d;

                            }
                        }
                    else
                        return d;
                })
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return (i * (gridSize_y + $this.sizes.def_cell_margins.y));
                })
                .style("text-anchor", "start")
                .attr("class", "dayLabel mono axis")
                .on('mouseout', mouseout)
                .on('mouseover', mouseover)
                .on("mousemove", function (d) {
                    cp_mouse_over(d, d3.mouse(this))
                });

            if (!cp_labels)
                $(".cp_axis").css("display", "none");
            //labels horizontal
            var EventsLabels = g
                .append("g")
                .attr("class", "axis event_axis")
                .attr("transform", "translate(" + (margin_x + (gridSize_x + $this.sizes.def_cell_margins.x * 2 + $this.sizes.def_min_grid_size.x) / 2) + "," + (margin_y / 2) + ") rotate (-90)")
                .selectAll(".timeLabel")
                .data(this.event_set)
                .enter()
                .append("g")
                .append("text")
                .text(function (d) {
                    return formatDate(parseDate(d));
                })
                .attr("x", 0)
                .attr("y", function (d, i) {
                    return (i * (gridSize_x + $this.sizes.def_cell_margins.x));
                })
                .style("text-anchor", "middle")
                .attr("class", function (d, i) {
                    return "timeLabel mono axis"
                })
                .on('mouseout', mouseout)
                .on("mousemove", function (d) {
                    date_mouse_over(d, d3.mouse(this))
                });

            if (!events_labels)
                $(".event_axis").css("display", "none");
            //areas
            var areas = g
                .append("g")
                .attr("class", "areas")
                .attr("transform", "translate(" + (margin_x + this.sizes.def_cell_margins.x) + "," + (margin_y - this.sizes.def_cell_margins.y) + ")")
                .selectAll(".area")
                .data(data);

            areas.enter().append("rect")
                .attr("x", function (d) {
                    if (timemap) {
                        /*console.log(d);*/
                        var i = $this.event_set.indexOf(d.date);
                        var before = $this.diff_ranges.slice(0, i);
                        var dist = 0;
                        for (var j in before) {
                            dist += before[j] + $this.sizes.def_cell_margins.x;
                        }
                        return $this.width_axis(dist);
                    }
                    else {
                        return ($this.event_set.indexOf(d.date) * (gridSize_x + $this.sizes.def_cell_margins.x));
                    }
                })
                .attr("y", function (d) {
                    return ($this.keys.indexOf(d.cp) * (gridSize_y + $this.sizes.def_cell_margins.y));
                })
                .attr("class", function (d) {
                    return "area area" + d.cp.replace(/[\.:]/g, "-") + " area" + d.date.replace(/:/g, "-") + " area" + d.asn
                })
                .attr("width", function (d) {
                    if (timemap) {
                        /*console.log(d);*/
                        return $this.width_axis($this.diff_ranges[$this.event_set.indexOf(d.date)] - $this.sizes.def_cell_margins.x);
                    }
                    else
                        return gridSize_x;
                })
                .attr("height", gridSize_y)
                .style("fill", function (d) {
                    return (d.asn && d.asn != null) ? $this.z(d.asn) : "#ffffff";
                })
                .style("stroke", "black")
                .style("stroke-width", this.sizes.def_cell_margins.x / 5)
                .style("opacity", 1)
                .on('mousemove', function (d) {
                    mousemove(d, d3.mouse(this))
                })
                .on('mouseout', mouseout)
                .on('mouseover', mouseover);

            //FLAGS cp
            if (!collapse_cp) {
                var FlagLabels = g
                    .append("g")
                    .attr("transform", "translate(" + (margin_x - 45) + "," + (margin_y - (this.sizes.def_min_grid_size.y + (this.sizes.def_min_grid_size.y / 4 * 3))) + ")")
                    .attr("class", "flags")
                    .append("text")
                    .attr("style", "font-size: 11px;")
                    .text("Country");

                var Flags = g
                    .append("g")
                    .attr("class", "axis mono flag_axis")
                    .attr("transform", "translate(" + 4 + "," + (margin_y + gridSize_y / 2 + $this.sizes.def_cell_margins.y) + ")")
                    .selectAll(".flagLabel")
                    .data(this.keys)
                    .enter();
                Flags
                    .append("text")
                    .attr("style", "font-size: 8px;")
                    .text(function (d) {
                        var s = "";
                        try {
                            var geo = current_parsed.known_cp[d]['geo'].split("-")[0];
                            s += geo;
                        }
                        catch (err) {

                        }
                        return s;
                    })
                    .attr("x", 0)
                    .attr("y", function (d, i) {
                        return (i * (gridSize_y + $this.sizes.def_cell_margins.y));
                    })
                    .style("text-anchor", "start");
                Flags
                    .append("image")
                    .attr("height", 8)
                    .attr("width", 8)
                    .attr("xlink:href", function (d) {
                        var s = "/css/flags/2.8.0/flags/4x3/";
                        try {
                            var geo = current_parsed.known_cp[d]['geo'].split("-")[0];
                            s += geo.toLowerCase() + ".svg";
                        }
                        catch (err) {

                        }
                        return s;
                    })
                    .attr("x", 20)
                    .attr("y", function (d, i) {
                        return (i * (gridSize_y + $this.sizes.def_cell_margins.y) - 7);
                    });
            }
            areas.exit().remove();

            //other functions
            var bisectDate = d3.bisector(function (d) {
                return d.date;
            }).left;

            if (timemap) {
                this.main_svg
                    .append("g")
                    .attr("class", "axis axis-x")
                    .attr("transform", "translate(" + margin_x + ", " + margin_y + ")")
                    .call(d3.axisTop(this.x).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M:%S")).tickValues(this.ticks))
                    .selectAll("text")
                    .attr("y", 0)
                    .attr("x", 10)
                    .attr("dy", ".35em")
                    .attr("transform", "rotate(-90)")
                    .style("text-anchor", "start");
            }
            this.current_query_id = query_id;
            // this.draw_over(this.main_svg, this.sizes);

            function type(d, asn_set, cp_set, event_set, level, prepending) {
                if (cp_set.indexOf(d.cp) == -1)
                    cp_set.push(d.cp);
                if (event_set.indexOf(d.date) == -1)
                    event_set.push(d.date);
                var asn_path = JSON.parse(d.asn_path);
                if (prepending) {
                    var set = myUtils.no_consecutive_repetition(asn_path);
                    asn_path = set;
                }
                if (asn_path.length != 0 && asn_path.length > level) {
                    var asn = asn_path[asn_path.length - (1 + level)];
                    d.asn = asn;
                    if (asn_set.indexOf(asn) == -1)
                        asn_set.push(asn);
                }
                else
                    d.asn = null;
                return d;
            };

            function mouseover() {
                env.guiManager.dom.tooltipSvg.removeClass("hidden");
            };

            function mousemove(d_key, pos) {
                var s = "<strong> ASN: </strong>";
                s += "<span>" + ((d_key.asn != null) ? d_key.asn : "None") + "</span>";
                var asn_country = current_parsed.known_asn[d_key.asn];
                if (asn_country) {
                    var ac = asn_country.split(",");
                    ac = ac[ac.length - 1];
                    s += "<span> (" + ac + ") </span>";
                    s += "<span class='flag-icon flag-icon-" + ac.toLowerCase().trim() + "'></span>";
                }
                s += "<br/><strong>Date: </strong><span>" + formatDate(parseDate(d_key.date)) + "</span>";
                s += "<br/><strong>CP: </strong>";
                if (collapse_cp) {
                    for (var i in cp_to_filter)
                        if (cp_to_filter[i].indexOf(d_key.cp) != -1) {
                            var list = cp_to_filter[i];
                            if (list.length > 1)
                                s += "<br/>";
                            for (var j in list) {
                                var r = list[j];
                                s += "<span>" + r;
                                var cp_country = current_parsed.known_cp[r];
                                if (cp_country) {
                                    var cc = cp_country["geo"].trim().split("-")[0];
                                    s += "<span> (" + cc + ") </span>";
                                    s += "<span class='flag-icon flag-icon-" + cc.toLowerCase() + "'></span>";
                                }
                                s += "</span><br/>";
                            }
                        }
                }
                else {
                    s += d_key.cp;
                    var cp_country = current_parsed.known_cp[d_key.cp];
                    if (cp_country) {
                        var cc = cp_country["geo"].trim().split("-")[0];
                        s += "<span> (" + cc + ") </span>";
                        s += "<span class='flag-icon flag-icon-" + cc.toLowerCase() + "'></span>";
                    }
                }
                env.guiManager.dom.tooltipSvg
                    .html(s)
                    .css("left", (d3.event.pageX + 10) + "px")
                    .css("top", (d3.event.pageY - 30) + "px");

                if ($this.last_hover != d_key.asn) {
                    d3.selectAll("rect.area")
                        .filter(function (d) {
                            return d.asn != d_key.asn;
                        })
                        .style("fill-opacity", 0.35);
                    d3.selectAll("path.area")
                        .filter(function (d) {
                            return d.key != d_key.asn;
                        })
                        .style("fill-opacity", 0.35);
                    $this.last_hover = d_key.asn;
                }
            };

            function mouseout() {
                d3.selectAll(".area")
                    .style("fill-opacity", 1);
                $this.last_hover = null;
                env.guiManager.dom.tooltipSvg.addClass("hidden");
            }

            function click(pos, event) {
                if (event.ctrlKey || event.altKey || event.shiftKey || event.metaKey) {
                    var confirmed = confirm("Do you want to open BGPlay on this instant?");
                    if (confirmed) {
                        var date = $this.x.invert(pos[0]);
                        bgplay_callback(date);
                    }
                }
            }

            function cp_mouse_over(d, pos) {
                var s = "<strong>CP: </strong>";
                if (collapse_cp) {
                    for (var i in cp_to_filter)
                        if (cp_to_filter[i].indexOf(d) != -1)
                            var list = cp_to_filter[i];
                    if (Array.isArray(list)) {
                        s += "<br/>";
                        for (var i in list)
                            s += list[i] + "<br/>";
                    }
                    else
                        s += list;
                }
                else {
                    s += d;
                }
                env.guiManager.dom.tooltipSvg
                    .html(s)
                    .css("left", (d3.event.pageX + 10) + "px")
                    .css("top", (d3.event.pageY - 30) + "px");

                if ($this.last_hover != d) {
                    d3.selectAll(".area")
                        .filter(function (e) {
                            return (e.cp != d);
                        })
                        .style("fill-opacity", 0.35);
                    $this.last_hover = d;
                }
            };

            function date_mouse_over(d, pos) {
                if ($this.last_hover != d) {
                    d3.selectAll(".area")
                        .filter(function (e) {
                            return (e.date != d);
                        })
                        .style("fill-opacity", 0.35);
                    $this.last_hover = d;
                }
            };

            function cp_filter(data) {
                var set = {};
                var flat = {};
                /*for every CP build a map CP -> ASNs */
                for (var i in data) {
                    var d = data[i];
                    var tmp = [];
                    if (set[d.cp])
                        tmp = set[d.cp];
                    tmp.push(d.asn);
                    set[d.cp] = tmp;
                }
                /*group CPs with same map value*/
                for (var i in set) {
                    var tmp = [];
                    var k = JSON.stringify(set[i]);
                    if (flat[k])
                        tmp = flat[k];
                    tmp.push(i);
                    flat[k] = tmp;
                }
                //return only the cp_s buckets
                return Object.values(flat);
            };

            function events_filter(data, tollerance) {
                var set = {};
                var flat = [];
                /*for every event build a map DATE -> ASNs */
                for (var i in data) {
                    var d = data[i];
                    var tmp = [];
                    if (set[d.date])
                        tmp = set[d.date];
                    tmp.push(d.asn);
                    set[d.date] = tmp;
                }
                /*group DATEs with same map value*/
                var moments = Object.keys(set);
                var pos = 0;
                var shifter = set[moments[pos]];
                for (var i = 1; i < moments.length; i++) {
                    var tmp = set[moments[i]];
                    if (myUtils.differences_count(shifter, tmp) >= tollerance) {
                        flat.push(moments[pos]);
                        pos = i;
                        shifter = tmp;
                    }
                    else {

                    }
                }
                flat.push(moments[pos]);
                //return only the events buckets
                return flat;
            };
        };

        //extra functions
        //change color to areas
        //just shuffle the current color set contained in d_sorteds
        this.shuffle_color_map = function (graph_type) {
            if (graph_type == "stream") {
                this.colors = myUtils.random_sort(this.colorManager.d_sorteds.map(function (c) {
                    return c.lab.rgb()
                }), this.keys.length);
                this.z = d3.scaleOrdinal(this.colors.slice(0).reverse());
                this.z.domain(this.keys);
                d3.select(env.parentDom[0]).selectAll(".area").each(function (d, i) {
                    d3.select(this).style("fill", $this.z(d.key));
                });
            }
            else if (graph_type == "heat") {
                this.colors = myUtils.random_sort(this.colorManager.d_sorteds.map(function (c) {
                    return c.lab.rgb()
                }), this.asn_set.length);
                this.z = d3.scaleOrdinal(this.colors.slice(0).reverse());
                this.z.domain(this.asn_set);
                d3.select(env.parentDom[0]).select(".main_svg").selectAll(".area").each(function (d, i) {
                    d3.select(this).style("fill", (d.asn && d.asn != null) ? $this.z(d.asn) : "#ffffff");
                });
                d3.select(env.parentDom[0]).select(".mini_svg").selectAll(".area").each(function (d, i) {
                    d3.select(this).style("fill", $this.z(d.key));
                });
            }
        };

        //remove the chart
        this.erase_all = function () {
            this.main_svg.select(".chart").remove();
            this.main_svg.select(".background").remove();
            this.main_svg.selectAll(".axis").remove();
            this.main_svg.selectAll(".axe_description").remove();
            this.main_svg.selectAll(".bgp_over").remove();
            this.mini_svg.select(".chart").remove();
            this.mini_svg.select(".background").remove();
            this.mini_svg.selectAll(".axis").remove();
        };
    };



    return GraphDrawer;
});
define('bgpst.controller.asnvalidator',[
], function(){

	var ASNValidator = function(){

	};

	ASNValidator.prototype.checkasn = function(str) {
		var asnregex = "^(AS|as)?( |\s|\t)?[0-9]+$";
		var regex = new RegExp(asnregex);
		try{
			var number = str.replace(/^(A|a)(S|s)/,"").trim();
			number = parseInt(number);
			return (regex.test(str)&&number <= 4294967294);
		}
		catch(e){
			return false;
		}
	};

	return ASNValidator;
});
define('bgpst.controller.datevalidator',[
	"bgpst.lib.moment"
], function(moment){

	var DateValidator = function(){

	};

	DateValidator.prototype.checkdate = function(str){
		if(str&&str != "")
			try {
				return moment(str).isValid();
			}
			catch(e) {
				return false;
			}
		else
			return false;
	};

	DateValidator.prototype.checkdate_format = function(str,format){
		if(str && str != "")
			try{
				return moment(str,format,true).isValid();
			}
			catch(e){
				return false;
			}
		else
			return false;
	};

	return DateValidator;
});
define('bgpst.controller.ipv4validator',[
	], 
function(){

	var IPv4Validator = function(){

	};

	IPv4Validator.prototype.checkipv4 = function(str) {
		try {
			var blocks = str.split(".");
			if(blocks.length == 4 && blocks.every(function (e) {e = parseInt(e); return e >= 0 && e <= 255;})) {
				var mask = str.split("/");
				if(mask.length == 1 || (mask.length == 2 && parseInt(mask[1]) <= 32 && parseInt(mask[1]) > 0))  
					return true;
			}
		}
		catch(e){
			return false;
		}
		return false;
	};

	return IPv4Validator;
});
define('bgpst.controller.ipv6validator',[
], function(){
	// Javascript to test an IPv6 address for proper format, and to 
	// present the "best text representation" according to IETF Draft RFC at
	// http://tools.ietf.org/html/draft-ietf-6man-text-addr-representation-04

	// 8 Feb 2010 Rich Brown, Dartware, LLC

	// LICENSE
	//
	// IPv6 Validator by Dartware, LLC is licensed under a 
	// Creative Commons Attribution-ShareAlike 3.0 Unported License.
	// http://creativecommons.org/licenses/by-sa/3.0/
	// 
	// Please mention Dartware and provide a link back to our site
	// in the documentation with other attributions. It should say,
	// 
	// ---
	// IPv6 Validator courtesy of Dartware, LLC (http://intermapper.com)
	// For full details see http://intermapper.com/ipv6validator
	// ---


	// do the work of checking the string
	var IPv6Validator = function(){

	};

	IPv6Validator.prototype.checkipv6 = function(str) {
		var perlipv6regex = "^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*$";
		var aeronipv6regex = "^\s*((?=.*::.*)(::)?([0-9A-F]{1,4}(:(?=[0-9A-F])|(?!\2)(?!\5)(::)|\z)){0,7}|((?=.*::.*)(::)?([0-9A-F]{1,4}(:(?=[0-9A-F])|(?!\7)(?!\10)(::))){0,5}|([0-9A-F]{1,4}:){6})((25[0-5]|(2[0-4]|1[0-9]|[1-9]?)[0-9])(\.(?=.)|\z)){4}|([0-9A-F]{1,4}:){7}[0-9A-F]{1,4})\s*$";
		var foxipv6regex = "^\s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))(%.+)?\s*(/([0-9]|[1-9][0-9]|1[0-1][0-9]|12[0-8]))?$";

		var regex = new RegExp(foxipv6regex);
		return (regex.test(str));
	};

	IPv6Validator.prototype.formatbestipv6 = function(theaddress) {
		var str;
		var beststr = "Not valid IPv6 Address";
		
		if (this.checkipv6(theaddress))
		{	
			// ASSERT: theaddress is a well-formed IPv6 address, as a result of the this.checkipv6() call
			// Make the string lowercase and split it up on the ":"
			str = theaddress.toLowerCase();
			segments = str.split(":");
			
			// Trim off leading or trailing double-"" from front or back (:: or ::a:b:c... or a:b:c::)
			this.trimcolonsfromends();
			// ASSERT: at this point segments[] has exactly zero or one "" string in it
		
			// Check for IPv4 in the final segment. This affects the total number of segment expected; 
			// If IPv4 is present, then only 7 segments; otherwise there'll be 8
			totalsegments = this.adjustsegmentsforipv4();
			
			// Fill in empty segments
			// Scan to see if there are any empty segments (resulting from "::")
			// fill them with "0000"
			this.fillemptysegments();
			// ASSERT: There are exactly *totalsegments* segments, with original (non-empty) entry, or "0000"
		
			// Now strip off leading zero's from all entries
			this.stripleadingzeroes();
			// ASSERT: at this point, all leading zeroes have been stripped off
		
			// Scan through looking for consecutive "0" segments
			this.removeconsecutivezeroes();
			
			// debugstr = debugstr + "-----<br />" + this.printsegments();
			
			// Assemble best representation from remainder of segments
			beststr = this.assemblebestrepresentation();
		}
		return beststr;
	};

	// printsegments - return each of the actual segments, one per line for debugging. 
	IPv6Validator.prototype.printsegments = function() {
		var resultstr = "";
		for (i=0;i<segments.length; i++)
	 	{
	 		resultstr = resultstr + i.toString() + ' "' + segments[i] + '"<br />';
	 	}
		return resultstr;
	};

	// Trim off leading or trailing double-"" from front or back (:: or ::a:b:c... or a:b:c::)
	IPv6Validator.prototype.trimcolonsfromends = function() {
		var seglen = segments.length;
		if ((segments[0] == '') && (segments[1] == '') && (segments[2] == "")) // must have been ::
			{ segments.shift(); segments.shift() }							//    remove first two items
		else if ((segments[0] == '') && (segments[1] == ''))				// must have been ::xxxx
			{ segments.shift(); }											//    remove the first item
		else if ((segments[seglen-1] == '') && (segments[seglen-2] == '')) 	// must have been xxxx::
			{ segments.pop(); }												//    remove the last item	
		// ASSERT: at this point segments[] has exactly zero or one "" string in it
	};

	// adjust number of segments - if IPv4 address present, there really are only seven segments
	IPv6Validator.prototype.adjustsegmentsforipv4 = function() {
		var numsegments = 8;
		// found a "." which means IPv4
		if (segments[segments.length-1].indexOf(".") != -1){
			// alert ("only seven segments");
			numsegments = 7;
		}
		return numsegments;
	};

	// fillemptysegments - find all the empty segments and fill them with "0000"
	IPv6Validator.prototype.fillemptysegments = function() {
		var pos;
		for (pos=0; pos<segments.length; pos++)								// scan to find position of the ""
		{
			if (segments[pos] == '') { break; }
		}
		// alert(pos.toString());
		
		// Now splice in enough "0000" entries in the array to flesh it out to totalsegments entries

		if (pos < totalsegments)
		{
			segments.splice(pos, 1, "0000");				// Replace the "" with "0000"
			while (segments.length < totalsegments)			// if it's not long enough
			{
				segments.splice(pos, 0, "0000");			// insert one more "0000"
			}
		}
	};

	// strip leading zeroes from every segment
	IPv6Validator.prototype.stripleadingzeroes = function() {
		var segs;
		for (i=0; i<totalsegments; i++)						// for each of the segments
		{
			segs=segments[i].split("");						// split the segment apart
			for (j=0; j<3 ; j++)							// scan through at most three characters 
			{
				// alert(segs);
				if ((segs[0] == "0") && (segs.length > 1))	// if leading zero and not last character
					segs.splice(0,1);						//    take it out
				else break;									// non-zero or last character - break out
			}
			segments[i] = segs.join("");					// put 'em back together
		}
	};

	// find longest sequence of zeroes and coalesce them into one segment
	IPv6Validator.prototype.removeconsecutivezeroes = function() {
			var bestpos = -1;									// bestpos contains position of longest sequence
			var bestcnt = 0;									// bestcnt contains the number of occurrences
			var inzeroes = false;								// assume we start in zeroes
			var curcnt = 0;
			var curpos = -1;
			var i;
			
			for (i=0; i<totalsegments; i++)
			{
				// alert (i.toString() + " " + inzeroes.toString() + " " + bestpos.toString() + " " + bestcnt.toString() + " ");
				if (inzeroes)									// we're in a run of zero segments
				{
					if (segments[i] == "0")						// one more - just count it
						curcnt += 1;
					else										// found the end of it
					{
						inzeroes = false;						// not in zeroes anymore
						if (curcnt > bestcnt)
							{ bestpos = curpos; bestcnt = curcnt; } // remember this place & count
					}
				}
				else											// not in a run of zeroes
				{
					if (segments[i] == "0")						// found one!
						{ inzeroes = true; curpos = i; curcnt = 1; }
				}
			}
			if (curcnt > bestcnt)
				{ bestpos = curpos; bestcnt = curcnt; } // remember this place & count

			//debugstr = 'bestpos: ' + bestpos.toString() + ' bestcnt: ' + bestcnt.toString() + '<br />';
			//debugstr = resultstr + this.printsegments();		// 
			
			// now take out runs of zeroes that are longer than one occurrance
			if (bestcnt > 1)
			{
				segments.splice(bestpos, bestcnt, "");
			}
	};

	// Assemble best representation of the string
	IPv6Validator.prototype.assemblebestrepresentation = function() {
		var beststr = "";
		var segslen = segments.length;
		if (segments[0] == "") 
			beststr = ":";
		for (i=0; i<segslen; i++)
		{
			beststr = beststr + segments[i];
			if (i == segslen-1) break;
			beststr = beststr + ":";
		}
		if (segments[segslen-1] == "")
			beststr = beststr + ":";
		return beststr;
	};
	 
	IPv6Validator.prototype.XTEST = function(sbok, str, beststr)  {
	 	var bestrep;
	 	var lcstr;
	 	
	 	return; 					// Just return for production - too slow
	 	if (this.checkipv6(str) && sbok) 
	 	{
	 		// it's OK - both return true
	 	}
	 	else if (!this.checkipv6(str) && !sbok)
	 	{
	 		// this is OK, too
	 	}
	 	else
	 	{
	 		alert (str + " is not OK");
	 	}
	 	
	 	// Check the best representation, as well
	 	
	 	bestrep = this.formatbestipv6(str);	// get the best representation
	 	lcstr = beststr.toLowerCase();	// the lower-case representation of the test case
	 	if (sbok && (lcstr != bestrep))	// if it should be well formatted, is it correct?
	 	{
	 		debugstr = debugstr + "<br />'" + lcstr + "'<br />'" + bestrep + "'<br />";
	 	}
	 };
	 
	IPv6Validator.prototype.checkall = function() {
		this.XTEST(false,"","---");
		this.XTEST(true ,"2001:0000:1234:0000:0000:C1C0:ABCD:0876","2001:0:1234::C1C0:ABCD:876"); 
		this.XTEST(true ,"3ffe:0b00:0000:0000:0001:0000:0000:000a","3ffe:b00::1:0:0:a"); 
		this.XTEST(true ,"FF02:0000:0000:0000:0000:0000:0000:0001","FF02::1"); 
		this.XTEST(true ,"0000:0000:0000:0000:0000:0000:0000:0001","::1"); 
		this.XTEST(true ,"0000:0000:0000:0000:0000:0000:0000:0000","::"); 
		this.XTEST(true ,"::ffff:192.168.1.26","::ffff:192.168.1.26"); 
		this.XTEST(false,"02001:0000:1234:0000:0000:C1C0:ABCD:0876","---");      
		this.XTEST(false,"2001:0000:1234:0000:00001:C1C0:ABCD:0876","---");     
		this.XTEST(true ," 2001:0000:1234:0000:0000:C1C0:ABCD:0876"," 2001:0:1234::C1C0:ABCD:876"); 
		this.XTEST(true ," 2001:0000:1234:0000:0000:C1C0:ABCD:0876  "," 2001:0:1234::C1C0:ABCD:876  "); 
		this.XTEST(false," 2001:0000:1234:0000:0000:C1C0:ABCD:0876  0","---"); 
		this.XTEST(false,"2001:0000:1234: 0000:0000:C1C0:ABCD:0876","---"); 
		this.XTEST(false,"2001:1:1:1:1:1:255Z255X255Y255","---");
		
		this.XTEST(false,"3ffe:0b00:0000:0001:0000:0000:000a","---"); 
		this.XTEST(false,"FF02:0000:0000:0000:0000:0000:0000:0000:0001","---"); 
		this.XTEST(false,"3ffe:b00::1::a","---"); 
		this.XTEST(false,"::1111:2222:3333:4444:5555:6666::","---");       
		this.XTEST(true ,"2::10","2::10"); 
		this.XTEST(true ,"ff02::1","ff02::1"); 
		this.XTEST(true ,"fe80::","fe80::"); 
		this.XTEST(true ,"2002::","2002::"); 
		this.XTEST(true ,"2001:db8::","2001:db8::"); 
		this.XTEST(true ,"2001:0db8:1234::","2001:db8:1234::"); 
		this.XTEST(true ,"::ffff:0:0","::ffff:0:0"); 
		this.XTEST(true ,"::1","::1"); 
		this.XTEST(true ,"::ffff:192.168.1.1","::ffff:192.168.1.1"); 
		this.XTEST(true ,"1:2:3:4:5:6:7:8","1:2:3:4:5:6:7:8"); 
		this.XTEST(true ,"1:2:3:4:5:6::8","1:2:3:4:5:6:0:8"); 
		this.XTEST(true ,"1:2:3:4:5::8","1:2:3:4:5::8"); 
		this.XTEST(true ,"1:2:3:4::8","1:2:3:4::8"); 
		this.XTEST(true ,"1:2:3::8","1:2:3::8"); 
		this.XTEST(true ,"1:2::8","1:2::8"); 
		this.XTEST(true ,"1::8","1::8"); 
		this.XTEST(true ,"1::2:3:4:5:6:7","1:0:2:3:4:5:6:7"); 
		this.XTEST(true ,"1::2:3:4:5:6","1::2:3:4:5:6"); 
		this.XTEST(true ,"1::2:3:4:5","1::2:3:4:5"); 
		this.XTEST(true ,"1::2:3:4","1::2:3:4"); 
		this.XTEST(true ,"1::2:3","1::2:3"); 
		this.XTEST(true ,"1::8","1::8"); 
		this.XTEST(true ,"::2:3:4:5:6:7:8","0:2:3:4:5:6:7:8"); 
		this.XTEST(true ,"::2:3:4:5:6:7","::2:3:4:5:6:7"); 
		this.XTEST(true ,"::2:3:4:5:6","::2:3:4:5:6"); 
		this.XTEST(true ,"::2:3:4:5","::2:3:4:5"); 
		this.XTEST(true ,"::2:3:4","::2:3:4"); 
		this.XTEST(true ,"::2:3","::2:3"); 
		this.XTEST(true ,"::8","::8"); 
		this.XTEST(true ,"1:2:3:4:5:6::","1:2:3:4:5:6::"); 
		this.XTEST(true ,"1:2:3:4:5::","1:2:3:4:5::"); 
		this.XTEST(true ,"1:2:3:4::","1:2:3:4::"); 
		this.XTEST(true ,"1:2:3::","1:2:3::"); 
		this.XTEST(true ,"1:2::","1:2::"); 
		this.XTEST(true ,"1::","1::"); 
		this.XTEST(true ,"1:2:3:4:5::7:8","1:2:3:4:5:0:7:8"); 
		this.XTEST(false,"1:2:3::4:5::7:8","---"); 
		this.XTEST(false,"12345::6:7:8","---"); 
		this.XTEST(true ,"1:2:3:4::7:8","1:2:3:4::7:8"); 
		this.XTEST(true ,"1:2:3::7:8","1:2:3::7:8"); 
		this.XTEST(true ,"1:2::7:8","1:2::7:8"); 
		this.XTEST(true ,"1::7:8","1::7:8"); 
		this.XTEST(true ,"1:2:3:4:5:6:1.2.3.4","1:2:3:4:5:6:1.2.3.4"); 
		this.XTEST(true ,"1:2:3:4:5::1.2.3.4","1:2:3:4:5:0:1.2.3.4"); 
		this.XTEST(true ,"1:2:3:4::1.2.3.4","1:2:3:4::1.2.3.4"); 
		this.XTEST(true ,"1:2:3::1.2.3.4","1:2:3::1.2.3.4"); 
		this.XTEST(true ,"1:2::1.2.3.4","1:2::1.2.3.4"); 
		this.XTEST(true ,"1::1.2.3.4","1::1.2.3.4"); 
		this.XTEST(true ,"1:2:3:4::5:1.2.3.4","1:2:3:4:0:5:1.2.3.4"); 
		this.XTEST(true ,"1:2:3::5:1.2.3.4","1:2:3::5:1.2.3.4"); 
		this.XTEST(true ,"1:2::5:1.2.3.4","1:2::5:1.2.3.4"); 
		this.XTEST(true ,"1::5:1.2.3.4","1::5:1.2.3.4"); 
		this.XTEST(true ,"1::5:11.22.33.44","1::5:11.22.33.44"); 
		this.XTEST(false,"1::5:400.2.3.4","---"); 
		this.XTEST(false,"1::5:260.2.3.4","---"); 
		this.XTEST(false,"1::5:256.2.3.4","---"); 
		this.XTEST(false,"1::5:1.256.3.4","---"); 
		this.XTEST(false,"1::5:1.2.256.4","---"); 
		this.XTEST(false,"1::5:1.2.3.256","---"); 
		this.XTEST(false,"1::5:300.2.3.4","---"); 
		this.XTEST(false,"1::5:1.300.3.4","---"); 
		this.XTEST(false,"1::5:1.2.300.4","---"); 
		this.XTEST(false,"1::5:1.2.3.300","---"); 
		this.XTEST(false,"1::5:900.2.3.4","---"); 
		this.XTEST(false,"1::5:1.900.3.4","---"); 
		this.XTEST(false,"1::5:1.2.900.4","---"); 
		this.XTEST(false,"1::5:1.2.3.900","---"); 
		this.XTEST(false,"1::5:300.300.300.300","---"); 
		this.XTEST(false,"1::5:3000.30.30.30","---"); 
		this.XTEST(false,"1::400.2.3.4","---"); 
		this.XTEST(false,"1::260.2.3.4","---"); 
		this.XTEST(false,"1::256.2.3.4","---"); 
		this.XTEST(false,"1::1.256.3.4","---"); 
		this.XTEST(false,"1::1.2.256.4","---"); 
		this.XTEST(false,"1::1.2.3.256","---"); 
		this.XTEST(false,"1::300.2.3.4","---"); 
		this.XTEST(false,"1::1.300.3.4","---"); 
		this.XTEST(false,"1::1.2.300.4","---"); 
		this.XTEST(false,"1::1.2.3.300","---"); 
		this.XTEST(false,"1::900.2.3.4","---"); 
		this.XTEST(false,"1::1.900.3.4","---"); 
		this.XTEST(false,"1::1.2.900.4","---"); 
		this.XTEST(false,"1::1.2.3.900","---"); 
		this.XTEST(false,"1::300.300.300.300","---"); 
		this.XTEST(false,"1::3000.30.30.30","---"); 
		this.XTEST(false,"::400.2.3.4","---"); 
		this.XTEST(false,"::260.2.3.4","---"); 
		this.XTEST(false,"::256.2.3.4","---"); 
		this.XTEST(false,"::1.256.3.4","---"); 
		this.XTEST(false,"::1.2.256.4","---"); 
		this.XTEST(false,"::1.2.3.256","---"); 
		this.XTEST(false,"::300.2.3.4","---"); 
		this.XTEST(false,"::1.300.3.4","---"); 
		this.XTEST(false,"::1.2.300.4","---"); 
		this.XTEST(false,"::1.2.3.300","---"); 
		this.XTEST(false,"::900.2.3.4","---"); 
		this.XTEST(false,"::1.900.3.4","---"); 
		this.XTEST(false,"::1.2.900.4","---"); 
		this.XTEST(false,"::1.2.3.900","---"); 
		this.XTEST(false,"::300.300.300.300","---"); 
		this.XTEST(false,"::3000.30.30.30","---"); 
		this.XTEST(true ,"fe80::217:f2ff:254.7.237.98","fe80::217:f2ff:254.7.237.98"); 
		this.XTEST(true ,"fe80::217:f2ff:fe07:ed62","fe80::217:f2ff:fe07:ed62"); 
		this.XTEST(true ,"2001:DB8:0:0:8:800:200C:417A","2001:DB8::8:800:200C:417A"); 
		this.XTEST(true ,"FF01:0:0:0:0:0:0:101","FF01::101"); 
		this.XTEST(true ,"0:0:0:0:0:0:0:1","::1"); 
		this.XTEST(true ,"0:0:0:0:0:0:0:0","::"); 
		this.XTEST(true ,"2001:DB8::8:800:200C:417A","2001:DB8::8:800:200C:417A"); 
		this.XTEST(true ,"FF01::101","FF01::101"); 
		this.XTEST(true ,"::1","::1"); 
		this.XTEST(true ,"::","::"); 
		this.XTEST(true ,"0:0:0:0:0:0:13.1.68.3","::13.1.68.3"); 
		this.XTEST(true ,"0:0:0:0:0:FFFF:129.144.52.38","::FFFF:129.144.52.38");
		this.XTEST(true ,"::13.1.68.3","::13.1.68.3"); 
		this.XTEST(true ,"::FFFF:129.144.52.38","::FFFF:129.144.52.38"); 
	// 	# this.XTEST(true ,"2001:0DB8:0000:CD30:0000:0000:0000:0000/60","2001:0DB8:0000:CD30:0000:0000:0000:0000/60");
	// 	# this.XTEST(true ,"2001:0DB8::CD30:0:0:0:0/60","2001:0DB8::CD30:0:0:0:0/60");
	// 	# this.XTEST(true ,"2001:0DB8:0:CD30::/60","2001:0DB8:0:CD30::/60");
	// 	# this.XTEST(true ,"::/128","::/128"); 
	// 	# this.XTEST(true ,"::1/128","::1/128"); 
	// 	# this.XTEST(true ,"FF00::/8","FF00::/8"); 
	// 	# this.XTEST(true ,"FE80::/10","FE80::/10"); 
	// 	# this.XTEST(true ,"FEC0::/10","FEC0::/10"); 
	// 	# this.XTEST(false,"124.15.6.89/60","---"); 
		this.XTEST(false,"2001:DB8:0:0:8:800:200C:417A:221","---"); 
		this.XTEST(false,"FF01::101::2","---");
		this.XTEST(false,"","---"); 
		
		this.XTEST(true ,"fe80:0000:0000:0000:0204:61ff:fe9d:f156","fe80::204:61ff:fe9d:f156"); 
		this.XTEST(true ,"fe80:0:0:0:204:61ff:fe9d:f156","fe80::204:61ff:fe9d:f156"); 
		this.XTEST(true ,"fe80::204:61ff:fe9d:f156","fe80::204:61ff:fe9d:f156"); 
		this.XTEST(false,"fe80:0000:0000:0000:0204:61ff:254.157.241.086","---"); 
		this.XTEST(true ,"fe80:0:0:0:204:61ff:254.157.241.86","fe80::204:61ff:254.157.241.86"); 
		this.XTEST(true ,"fe80::204:61ff:254.157.241.86","fe80::204:61ff:254.157.241.86"); 
		this.XTEST(true ,"::1","::1"); 
		this.XTEST(true ,"fe80::","fe80::"); 
		this.XTEST(true ,"fe80::1","fe80::1"); 
		this.XTEST(false,":","---");

	// Aeron supplied these test cases.	
		this.XTEST(false,"1111:2222:3333:4444::5555:","---");
		this.XTEST(false,"1111:2222:3333::5555:","---");
		this.XTEST(false,"1111:2222::5555:","---");
		this.XTEST(false,"1111::5555:","---");
		this.XTEST(false,"::5555:","---");
		this.XTEST(false,":::","---");
		this.XTEST(false,"1111:","---");
		this.XTEST(false,":","---");
		
		this.XTEST(false,":1111:2222:3333:4444::5555","---");
		this.XTEST(false,":1111:2222:3333::5555","---");
		this.XTEST(false,":1111:2222::5555","---");
		this.XTEST(false,":1111::5555","---");
		this.XTEST(false,":::5555","---");
		this.XTEST(false,":::","---");
		
		this.XTEST(false,"1.2.3.4:1111:2222:3333:4444::5555","---");
		this.XTEST(false,"1.2.3.4:1111:2222:3333::5555","---");
		this.XTEST(false,"1.2.3.4:1111:2222::5555","---");
		this.XTEST(false,"1.2.3.4:1111::5555","---");
		this.XTEST(false,"1.2.3.4::5555","---");
		this.XTEST(false,"1.2.3.4::","---");

	// Additional Patterns
	// from http://rt.cpan.org/Public/Bug/Display.html?id=50693

		this.XTEST(true ,"2001:0db8:85a3:0000:0000:8a2e:0370:7334","2001:db8:85a3::8a2e:370:7334");
		this.XTEST(true ,"2001:db8:85a3:0:0:8a2e:370:7334","2001:db8:85a3::8a2e:370:7334");
		this.XTEST(true ,"2001:db8:85a3::8a2e:370:7334","2001:db8:85a3::8a2e:370:7334");
		this.XTEST(true ,"2001:0db8:0000:0000:0000:0000:1428:57ab","2001:db8::1428:57ab");
		this.XTEST(true ,"2001:0db8:0000:0000:0000::1428:57ab","2001:db8::1428:57ab");
		this.XTEST(true ,"2001:0db8:0:0:0:0:1428:57ab","2001:db8::1428:57ab");
		this.XTEST(true ,"2001:0db8:0:0::1428:57ab","2001:db8::1428:57ab");
		this.XTEST(true ,"2001:0db8::1428:57ab","2001:db8::1428:57ab");
		this.XTEST(true ,"2001:db8::1428:57ab","2001:db8::1428:57ab");
		this.XTEST(true ,"0000:0000:0000:0000:0000:0000:0000:0001","::1");
		this.XTEST(true ,"::1","::1");
		this.XTEST(true ,"::ffff:12.34.56.78","::ffff:12.34.56.78");
		this.XTEST(true ,"::ffff:0c22:384e","::ffff:c22:384e");
		this.XTEST(true ,"2001:0db8:1234:0000:0000:0000:0000:0000","2001:db8:1234::");
		this.XTEST(true ,"2001:0db8:1234:ffff:ffff:ffff:ffff:ffff","2001:db8:1234:ffff:ffff:ffff:ffff:ffff");
		this.XTEST(true ,"2001:db8:a::123","2001:db8:a::123");
		this.XTEST(true ,"fe80::","fe80::");
		this.XTEST(true ,"::ffff:192.0.2.128","::ffff:192.0.2.128");
		this.XTEST(true ,"::ffff:c000:280","::ffff:c000:280");

		this.XTEST(false,"123","---");
		this.XTEST(false,"ldkfj","---");
		this.XTEST(false,"2001::FFD3::57ab","---");
		this.XTEST(false,"2001:db8:85a3::8a2e:37023:7334","---");
		this.XTEST(false,"2001:db8:85a3::8a2e:370k:7334","---");
		this.XTEST(false,"1:2:3:4:5:6:7:8:9","---");
		this.XTEST(false,"1::2::3","---");
		this.XTEST(false,"1:::3:4:5","---");
		this.XTEST(false,"1:2:3::4:5:6:7:8:9","---");
		this.XTEST(false,"::ffff:2.3.4","---");
		this.XTEST(false,"::ffff:257.1.2.3","---");
		this.XTEST(false,"1.2.3.4","---");
		
	// Test collapsing zeroes...

		this.XTEST(true ,"a:b:c:d:e:f:f1:f2","a:b:c:d:e:f:f1:f2");
		this.XTEST(true ,"a:b:c::d:e:f:f1","a:b:c:0:d:e:f:f1");
		this.XTEST(true ,"a:b:c::d:e:f","a:b:c::d:e:f");
		this.XTEST(true ,"a:b:c::d:e","a:b:c::d:e");
		this.XTEST(true ,"a:b:c::d","a:b:c::d");
		this.XTEST(true ,"::a","::a");
		this.XTEST(true ,"::a:b:c","::a:b:c");
		this.XTEST(true ,"::a:b:c:d:e:f:f1","0:a:b:c:d:e:f:f1");
		this.XTEST(true ,"a::","a::");
		this.XTEST(true ,"a:b:c::","a:b:c::");
		this.XTEST(true ,"a:b:c:d:e:f:f1::","a:b:c:d:e:f:f1:0");
		this.XTEST(true ,"a:bb:ccc:dddd:000e:00f:0f::","a:bb:ccc:dddd:e:f:f:0");
		this.XTEST(true ,"0:a:0:a:0:0:0:a","0:a:0:a::a");
		this.XTEST(true ,"0:a:0:0:a:0:0:a","0:a::a:0:0:a");
		this.XTEST(true ,"2001:db8:1:1:1:1:0:0","2001:db8:1:1:1:1::");
		this.XTEST(true ,"2001:db8:1:1:1:0:0:0","2001:db8:1:1:1::");
		this.XTEST(true ,"2001:db8:1:1:0:0:0:0","2001:db8:1:1::");
		this.XTEST(true ,"2001:db8:1:0:0:0:0:0","2001:db8:1::");
		this.XTEST(true ,"2001:db8:0:0:0:0:0:0","2001:db8::");
		this.XTEST(true ,"2001:0:0:0:0:0:0:0","2001::");

		this.XTEST(true ,"A:BB:CCC:DDDD:000E:00F:0F::","A:BB:CCC:DDDD:E:F:F:0");

		this.XTEST(true ,"0:0:0:0:0:0:0:0","::");
		this.XTEST(true ,"0:0:0:0:0:0:0:a","::a");
		this.XTEST(true ,"0:0:0:0:a:0:0:0","::a:0:0:0");
		this.XTEST(true ,"0:0:0:a:0:0:0:0","0:0:0:a::");
		this.XTEST(true ,"0:a:0:0:a:0:0:a","0:a::a:0:0:a");
		this.XTEST(true ,"a:0:0:a:0:0:a:a","a::a:0:0:a:a");
		this.XTEST(true ,"a:0:0:a:0:0:0:a","a:0:0:a::a");
		this.XTEST(true ,"a:0:0:0:a:0:0:a","a::a:0:0:a");
		this.XTEST(true ,"a:0:0:0:a:0:0:0","a::a:0:0:0");
		this.XTEST(true ,"a:0:0:0:0:0:0:0","a::");
	 };

	 return IPv6Validator;
	});
define('bgpst.controller.validator',[
	"bgpst.controller.asnvalidator",
	"bgpst.controller.datevalidator",
	"bgpst.controller.ipv4validator",
	"bgpst.controller.ipv6validator"
], function(ASNValidator, DateValidator, IPv4Validator, IPv6Validator){
	var Validator = function(env){
		this.ipv6_validator = new IPv6Validator();
		this.ipv4_validator = new IPv4Validator();
		this.date_validator = new DateValidator();
		this.asn_validator = new ASNValidator();
	};

	Validator.prototype.check_date = function(str){
		return this.date_validator.checkdate(str);
	};

	Validator.prototype.check_date_with_format = function(str, format){
		return this.date_validator.checkdate_format(str, format);
	};


	Validator.prototype.check_ipv4 = function(str){
		return this.ipv4_validator.checkipv4(str);
	};

	Validator.prototype.check_ipv6 = function(str){
		return this.ipv6_validator.checkipv6(str);
	};

	Validator.prototype.check_asn = function(str){
		return this.asn_validator.checkasn(str);
	};

	return Validator;
});
define('bgpst.controller.dateconverter',[
	"bgpst.lib.moment"
], function(moment){

	var DateConverter = function(){
		this.ripestat_data_format = "YYYY-MM-DDTHH:mm:ss";
		this.ripestat_data_format_date = "YYYY-MM-DD";
		this.ripestat_data_format_time = "HH:mm:ss";
		this.interface_format_date = "D/M/YYYY";
		this.interface_format_time = "HH:mm:ss";
	};

	/****************************************************************/
	DateConverter.prototype.parseRipe = function(date){
		return moment(date, this.ripestat_data_format);
	};

	DateConverter.prototype.parseRipeTime = function(date){
		return moment(date,this.ripestat_data_format_time).format(this.ripestat_data_format_time);
	};

	DateConverter.prototype.parseRipeDate = function(date){
		return moment(date,this.ripestat_data_format_date);
	};

	DateConverter.prototype.formatRipe = function(date){
		return moment(date).format(this.ripestat_data_format);	
	};

	DateConverter.prototype.formatRipeDate = function(date){
		return moment(date,this.interface_format_date).format(this.ripestat_data_format_date);	
	};

	DateConverter.prototype.formatRipeTime = function(date){
		return moment(date,this.ripestat_data_format_time).format(this.ripestat_data_format_time);
	};

	DateConverter.prototype.formatRipeDateTime = function(date, time){
		return this.formatRipeDate(date)+"T"+this.formatRipeTime(time);
	};

	/****************************************************************/
	DateConverter.prototype.parseUnix = function(date){
		return moment.unix(date);
	};

	DateConverter.prototype.formatUnix = function(date){
		return moment(date).utc().unix();
	};

	/****************************************************************/
	DateConverter.prototype.parseInterfaceDate = function(date){
		return moment(date,this.interface_format_date);
	};

	DateConverter.prototype.parseInterfaceTime = function(date){
		return moment(date,this.interface_format_time).format(this.interface_format_time);	
	};

	DateConverter.prototype.parseInterface = function(date){
		return moment(date,this.interface_format_date+" "+this.interface_format_time);
	};

	DateConverter.prototype.formatInterfaceDate = function(date){
		return moment(date).format(this.interface_format_date);
	};

	DateConverter.prototype.formatInterfaceTime = function(date){
		return moment(date,this.ripestat_data_format_time).format(this.interface_format_time);
	};

	DateConverter.prototype.formatInterface = function(date){
		return moment(date).format(this.interface_format_date+" "+this.interface_format_time);
	};

	/****************************************************************/
	DateConverter.prototype.executionTime = function(start,end){
		var dif = moment.duration(moment(end).diff(moment(start)));
		return dif.hours()+":"+dif.minutes()+":"+dif.seconds()+"."+dif.milliseconds();
	};

	return DateConverter;
});
define('bgpst.view.parser',[
    "bgpst.lib.moment",
    "bgpst.controller.validator",
    "bgpst.controller.functions"
], function(moment, Validator, myUtils){

    var RipeDataParser = function(env) {
        env.logger.log("==== RipeParser Starting");
        this.validator = new Validator();
        this.states = [];
        this.events = [];
        this.resources = [];
        this.asn_distributions = [];

        this.asn_set = [];
        this.cp_set = [];
        this.asn_freqs = [];
        this.asn_sumfreqs = [];
        this.asn_avgfreqs = [];
        this.asn_varfreqs = [];
        this.asn_stdev = [];
        this.cp_shiftings = {};

        this.fake_head = false;
        this.fake_tail = false;
        this.query_starttime = "";
        this.query_endtime = "";

        this.known_asn = {};
        this.known_cp = {};

        env.logger.log("==== RipeParser Ready");

        /**manage the events and state of the announcement**/
        //the level of detail is by CP and only later cumulated to ASN view
        //there are fiew global variables used to maintain the state of the flow
        //states_asn:array of states, each state is a normalized vector of ASN weight on routing
        //states:array of states, each state is cp routing
        //events:array of timestamps, one for each state
        //cp_map:object used to maintain the current state
        //last_date:last timestamp seen

        //ripe_response_parse();
        //main function to call for parsing
        this.ripe_response_parse = function (json, start, end) {
            env.logger.log(start, end);
            //on local load from data.json
            //json = require('./data.json');
            //global variables init
            var data = json['data'];
            this.cp_map = {};
            this.states = {};
            this.events = [];
            this.resources = [];
            this.targets = [];
            this.last_date = data['query_starttime'];
            this.asn_distributions = [];
            this.asn_set = [];
            this.cp_set = [];
            this.asn_freqs = {};
            this.asn_sumfreqs = {};
            this.asn_avgfreqs = {};
            this.asn_varfreqs = {};
            this.asn_stdev = {};

            //fetch nodes and cp
            this.fetchNodes(data);
            this.fetchCP(data);

            //date
            this.query_starttime = data['query_starttime'];
            this.query_endtime = data['query_endtime'];

            //estraggo i targets
            for (var t in data['targets']) {
                this.targets.push(data['targets'][t]['prefix']);
            }
            this.resources = data.sources;
            //inizializza la mappa in base al numero di targets
            for (var t in this.targets) {
                this.cp_map[this.targets[t]] = {};
                this.states[this.targets[t]] = [];
            }
            //stato iniziale
            if (data.initial_state.length > 0)
                this.loadFirstState(json);
            //eventi
            if (data.events.length > 0)
                this.loadUpdates(json);
            //zero fill
            this.zeroFilling(start, end);
            //for debugging
            var log_on = false;
            var print_on = false;
            if (log_on) {
                env.logger.log(this.states);
                env.logger.log(this.events);
                env.logger.log(this.resources);
                env.logger.log(this.targets);
                env.logger.log(this.cp_set);
            }
            if (print_on) {
                this.print_json_to_file(this.states, 'states.json');
                this.print_json_to_file(this.events, 'events.json');
                this.print_json_to_file(this.targets, 'targets.json');
                this.print_json_to_file(this.resources, 'resources.json');
                this.print_json_to_file(this.cp_set, 'map.json');
            }
            return {
                query_id: json['query_id'],
                states: this.states,			//array of values % by cp
                events: this.events,			//array of timestamps
                targets: this.targets,		//array of targets
                resources: this.resources,	//array of CP by asn
                cp_set: this.cp_set,		//array of cp
                asn_set: this.asn_set,

                asn_freqs: this.asn_freqs,
                asn_sumfreqs: this.asn_sumfreqs,
                asn_avgfreqs: this.asn_avgfreqs,
                asn_varfreqs: this.asn_varfreqs,
                asn_stdev: this.asn_stdev,
                asn_distributions: this.asn_distributions,

                query_starttime: this.query_starttime,
                query_endtime: this.query_endtime,
                fake_head: this.fake_head,
                fake_tail: this.fake_tail,

                known_asn: this.known_asn,
                known_cp: this.known_cp
            }
        };

        //first load function, load the initial state and the first events
        this.loadFirstState = function (json) {
            var data = json['data'];
            this.makeIntialStateMapping(data);
            this.snapshotOfState();
            //data_check();
        };

        //only load new events on the already existing configuration
        this.loadUpdates = function (json) {
            var data = json['data'];
            this.fetchUpdates(data);
            this.snapshotOfState();
            //data_check();
        };

        //initialize the cp_map
        this.makeIntialStateMapping = function (data) {
            var initial_state = data['initial_state'];
            for (var i in initial_state) {
                var state = initial_state[i];
                var path = state['path'];
                var cp_id = state['source_id'];
                if (this.cp_set.indexOf(cp_id) == -1)
                    this.cp_set.push(cp_id);
                this.cp_map[state['target_prefix']][cp_id] = path;
            }
        };

        //fetch updates event using timestamp to cumultate the effects
        //everytime the last_date is different from the current event timestamp a new "state" as a snapshot is taken
        //from the cp_map
        this.fetchUpdates = function (data) {
            var updates = data['events'];
            this.last_date = updates[0]['timestamp'];
            for (var i in updates) {
                var e = updates[i];
                var e_attrs = e['attrs'];
                var e_s_id = e_attrs['source_id'];
                var e_target = e_attrs['target_prefix'];
                var e_type = e['type'];
                //if its a new resource add to cp_set
                if (this.cp_set.indexOf(e_s_id) == -1)
                    this.cp_set.push(e_s_id);
                //make snapshot if timestamp is different
                if (this.last_date != e['timestamp']) {
                    this.snapshotOfState();
                    this.last_date = e['timestamp'];
                }
                switch (e_type) {
                    case 'A':
                        this.cp_map[e_target][e_s_id] = e_attrs['path'];
                        break;
                    case 'W':
                        this.cp_map[e_target][e_s_id] = "";
                        break;
                    default:
                        break;
                }
            }
        };

        //take a snapshot of the cp_map
        //cumulate the single CP announcement into ASN view
        this.snapshotOfState = function () {
            for (var t in this.targets)
                this.states[this.targets[t]].push(JSON.parse(JSON.stringify(this.cp_map[this.targets[t]])));
            this.events.push(this.last_date);
        };

        //zero fill the cps in every moment
        this.zeroFilling = function (start, end) {
            for (var t in this.targets) {
                var tgt = this.targets[t];
                for (var i in this.states[tgt]) {
                    var e = this.states[tgt][i];
                    for (var r in this.cp_set) {
                        var cp = this.cp_set[r];
                        if (!e[cp])
                            e[cp] = [];
                    }
                }
            }

            //PATCH EVENT BEFORE AND AFTER
            if (moment(this.events[0]).isAfter(start)) {
                env.logger.log("ADDED HEAD FAKE EVENT");
                this.fake_head = true;
                this.query_starttime = start.format(env.dateConverter.ripestat_data_format);
            }
            else
                this.fake_head = false;
            if (moment(this.events[this.events.length - 1]).isBefore(end)) {
                env.logger.log("ADDED TAIL FAKE EVENT");
                this.fake_tail = true;
                this.query_endtime = end.format(env.dateConverter.ripestat_data_format);
            }
            else
                this.fake_tail = false;
            //}
        };

        //object of cp and an array of states for any of them
        // MAP OF CP AND THEIR ASN TRAVERSED
        this.states_cp = function (parsed, level, antiprepending) {
            this.states_by_cp = {};
            //init
            for (var r in parsed.cp_set)
                this.states_by_cp[parsed.cp_set[r]] = [];
            //popolate
            for (var t in parsed.targets) {
                var tgt = parsed.targets[t];
                var states = parsed.states[tgt];
                for (var s in states) {
                    var state = states[s];
                    for (var r in state) {
                        var cp = state[r];
                        if (antiprepending)
                            cp = myUtils.no_consecutive_repetition(cp);
                        if (cp.length > level)
                            this.states_by_cp[r].push(cp[cp.length - level - 1]);
                        else
                            this.states_by_cp[r].push(null);
                    }
                }
            }
            parsed.states_by_cp = this.states_by_cp;
        };

        //object of cp and their asn sorted for occurrences
        //MAP OF CP AND ASN COMPOSITION (ORDERED SET OF ASN FOR THAT CP)
        this.cp_composition = function (parsed) {
            this.cp_by_composition = {};
            for (var r in parsed.cp_set) {
                var cp = parsed.cp_set[r];
                var asn_seq = parsed.states_by_cp[cp];
                this.cp_by_composition[cp] = myUtils.sort_by_occurrences(asn_seq);
            }
            parsed.cp_by_composition = this.cp_by_composition;
        };

        //object of cp and their asn seqs changed
        //MAP OF CP AND ASN TRAVERSED (SEQUENCE OF ASN TRAVERSED)
        this.cp_seqs = function (parsed) {
            this.cp_by_seqs = {};
            for (var r in parsed.cp_set) {
                var cp = parsed.cp_set[r];
                var asn_seq = parsed.states_by_cp[cp];
                this.cp_by_seqs[cp] = myUtils.no_consecutive_repetition(asn_seq);
            }
            parsed.cp_by_seqs = this.cp_by_seqs;
        };

        //MAP OF ASN (AND EXCHANGES FOR OTHER ASN COUNTED)
        this.asn_exchanges = function (parsed) {
            this.asn_by_exchanges = {}
            for (var i in parsed.cp_set) {
                var as_list = parsed.cp_by_seqs[parsed.cp_set[i]];
                if (as_list.length > 1) {
                    for (var a = 0; a < as_list.length - 1; a++) {
                        var pre = as_list[a];
                        var post = as_list[a + 1];
                        if (!this.asn_by_exchanges[pre])
                            this.asn_by_exchanges[pre] = {};
                        var counter = this.asn_by_exchanges[pre][post];
                        if (!counter)
                            counter = 0;
                        counter++;
                        this.asn_by_exchanges[pre][post] = counter;
                    }
                }
            }
            parsed.asn_by_exchanges = this.asn_by_exchanges;
        };

        this.get_cp_shiftings = function (parsed) {
            this.cp_shiftings = {};
            for (var t in parsed.targets) {
                this.cp_shiftings[parsed.targets[t]] = {};
            }
            for (var r in parsed.cp_set) {
                this.cp_shiftings[parsed.cp_set[r]] = [];
            }
            for (var r in parsed.cp_set) {
                var cp = parsed.cp_set[r];
                for (var s in parsed.states) {
                    var val = parsed.states[s][cp];
                    this.cp_shiftings[cp].push(val);
                }
            }
            parsed.cp_shiftings = this.cp_shiftings;
        };

        /* compute the frequency analysis */
        this.computeAsnFrequencies = function (data) {
            //initialization
            this.asn_freqs = {};
            this.asn_sumfreqs = {};
            this.asn_avgfreqs = {};
            this.asn_varfreqs = {};
            this.asn_stdev = {};
            for (var a in this.asn_set)
                this.asn_freqs[this.asn_set[a]] = [];
            for (var i in data) {
                for (var a in this.asn_set) {
                    this.asn_freqs[this.asn_set[a]].push(data[i][this.asn_set[a]]);
                }
            }
            //compute cumulate, avg, variance and std_dev
            for (var a in this.asn_freqs) {
                this.asn_sumfreqs[a] = myUtils.cumulate(this.asn_freqs[a]);
                this.asn_avgfreqs[a] = myUtils.average(this.asn_freqs[a], this.asn_sumfreqs[a]);
                this.asn_varfreqs[a] = myUtils.variance(this.asn_freqs[a], this.asn_avgfreqs[a]);
                this.asn_stdev[a] = myUtils.std_dev(this.asn_freqs[a], this.asn_varfreqs[a]);
            }
        };

        this.fetchNodes = function (data) {
            for (var a in data.nodes) {
                var node = data.nodes[a];
                var asn = node["as_number"];
                var owner = node["owner"];
                if (!this.known_asn[asn])
                    this.known_asn[asn] = owner;
            }
        };

        this.fetchCP = function (data) {
            for (var a in data.sources) {
                var node = data.sources[a];
                var id = node["id"];
                var ip = node["ip"];
                var cp = node["rrc"];
                var as_number = node["as_number"];
                var geo_of_as = this.known_asn[as_number];
                if (geo_of_as) {
                    var index = geo_of_as.lastIndexOf(",");
                    var geo = geo_of_as.substr(index + 1).split("-")[0].trim();
                }
                if (geo) {
                    this.known_cp[id] = {
                        "ip": ip,
                        "id": id,
                        "rrc": cp,
                        "as_number": as_number,
                        "geo": geo
                    }
                }
            }
        };

        //print out the object to a file
        this.print_json_to_file = function (json, filename) {
            var fs = require('fs');
            fs.writeFile("./" + filename, JSON.stringify(json, null, 4), function (err) {
                if (err) {
                    return env.logger.log(err);
                }
                env.logger.log(filename + " file written");
            });
        };

        /************************************************ CONVERSIONS ************************************************/

        this.comune_converter = function (data, antiprepending, level, target_types) {
            this.asn_distributions = [];
            var include_ipv4 = target_types.indexOf(4) != -1;
            var include_ipv6 = target_types.indexOf(6) != -1;

            this.asn_set = [];
            this.local_visibility = 0;
            //initialize
            for (var i in data.events)
                this.asn_distributions.push({});
            //counting
            for (var t in data.targets) {
                var tgt = data.targets[t];
                if ((include_ipv4 && this.validator.check_ipv4(tgt)) || (include_ipv6 && this.validator.check_ipv6(tgt))) {
                    for (var i in data.states[tgt]) {
                        var state = data.states[tgt][i];
                        var tot = 0;
                        for (var e in state) {
                            var path = state[e];
                            if (antiprepending) {
                                //antiprepending-da-spostare
                                path = myUtils.no_consecutive_repetition(path);
                            }
                            if (path !== "" && path.length > (level)) {
                                var asn = path[path.length - (level + 1)];
                                //update the asn list if wasnt discovered
                                if (this.asn_set.indexOf(asn) == -1)
                                    this.asn_set.push(asn);
                                //update counters
                                var temp = this.asn_distributions[i][asn];
                                if (!temp)
                                    temp = 0;
                                this.asn_distributions[i][asn] = (temp + 1);
                                tot++;
                            }
                        }
                        this.asn_distributions[i]['tot_number'] = tot;
                        if (tot > this.local_visibility)
                            this.local_visibility = tot;
                    }
                }
            }
            //zero-filling
            for (var i in this.asn_distributions)
                for (var a in this.asn_set) {
                    if (!this.asn_distributions[i][this.asn_set[a]])
                        this.asn_distributions[i][this.asn_set[a]] = 0;
                }
            data.asn_distributions = this.asn_distributions;
            this.computeAsnFrequencies(this.asn_distributions);
            this.computeDifferenceVector(data);
            this.computeDistanceVector(data);
            this.get_cp_shiftings(data);
            data.asn_freqs = this.asn_freqs;
            data.asn_sumfreqs = this.asn_sumfreqs;
            data.asn_avgfreqs = this.asn_avgfreqs;
            data.asn_varfreqs = this.asn_varfreqs;
            data.asn_stdev = this.asn_stdev;
            data.query_starttime = this.query_starttime;
            data.query_endtime = this.query_endtime;
            data.local_visibility = this.local_visibility;
        };

        //convert the data to a TSV format for streamgraph
        this.convert_to_streamgraph_tsv = function (data, antiprepending, level, target_types) {
            this.comune_converter(data, antiprepending, level, target_types);

            var real_states = data.asn_distributions.concat();
            var real_events = data.events.concat();
            var dummy_state = {};

            if (data.fake_tail || data.fake_tail) {
                for (var d in this.asn_set) {
                    dummy_state[this.asn_set[d]] = 0;
                }
                dummy_state['tot_number'] = 0;
            }

            if (data.fake_head) {
                real_states = [dummy_state].concat(real_states);
                real_events = [data.query_starttime].concat(real_events);
                env.logger.log(real_states)
            }

            if (data.fake_tail) {
                real_states = real_states.concat(real_states[real_states.length - 1]);
                real_events = real_events.concat(data.query_endtime);
            }

            //parse to TSV
            var converted_data = [];
            //TSV header
            var header = "date\ttot_number";
            for (var i in this.asn_set)
                header += "\t" + this.asn_set[i];
            converted_data.push(header);
            //TSV DATA
            var last_values = "";
            var length = real_events.length - 1;
            for (var i = 0; i < length; i++) {
                var date = real_events[i] + "\t";
                var tot = real_states[i]['tot_number'];
                var values = "";
                for (var j in this.asn_set) {
                    var value = real_states[i][this.asn_set[j]];
                    if (!value)
                        value = 0;
                    values += "\t" + value;
                }
                values = tot + values;
                line = date + values;

                //PATCH FOR STREAMGRAPH AVOID INTERPOLATION
                if (last_values != "" && last_values != values && i < data.events.length - 2) {
                    converted_data.push(date + last_values);
                }
                converted_data.push(line);
                last_values = values;
            }

            var last_date = real_events[length] + "\t";
            var last_tot = real_states[length]['tot_number'];
            var last_values = "";
            for (var j in this.asn_set) {
                var value = real_states[length][this.asn_set[j]];
                if (!value)
                    value = 0;
                last_values += "\t" + value;
            }
            last_values = last_tot + last_values;
            converted_data.push(date + last_values);
            converted_data.push(last_date + last_values);

            var converted = converted_data.join("\n");
            data.asn_set = this.asn_set;
            return converted;
        };

        //convert the data to a TSV format for heatmap
        this.convert_to_heatmap_tsv = function (data, antiprepending, level, target_types) {
            this.comune_converter(data, antiprepending, level, target_types);

            var real_states = {};
            var real_events = data.events.concat();
            var dummy_state = {};

            if (data.fake_tail || data.fake_tail) {
                for (var d in this.cp_set)
                    dummy_state[this.cp_set[d]] = [];
            }

            for (var t in data.targets) {
                var tgt = data.targets[t];
                real_states[tgt] = data.states[tgt].concat();
            }

            if (data.fake_head) {
                for (var t in data.targets) {
                    var tgt = data.targets[t];
                    real_states[tgt] = [dummy_state].concat(real_states[tgt]);
                }
                real_events = [data.query_starttime].concat(real_events);
            }

            if (data.fake_tail) {
                for (var t in data.targets) {
                    var tgt = data.targets[t];
                    //real_states[tgt]=real_states[tgt].concat(real_states[tgt][real_states[tgt].length-1]);
                    real_states[tgt] = real_states[tgt].concat(dummy_state);
                }
                real_events = real_events.concat(data.query_endtime);
            }

            env.logger.log(real_events)
            var converted_data = [];
            var header = "date\tcp\tasn_path";
            var cp_set = data.cp_set.sort();
            var include_ipv4 = target_types.indexOf(4) != -1;
            var include_ipv6 = target_types.indexOf(6) != -1;
            converted_data.push(header);
            for (var t in data.targets) {
                var tgt = data.targets[t];
                if ((include_ipv4 && this.validator.check_ipv4(tgt)) || (include_ipv6 && this.validator.check_ipv6(tgt))) {
                    for (var i in real_states[tgt]) {
                        var state = real_states[tgt][i];
                        for (var j in cp_set) {
                            var path = state[cp_set[j]];
                            if (!Array.isArray(path))
                                path = [];
                            var line = real_events[i];
                            line += "\t" + cp_set[j] + "\t" + JSON.stringify(path);
                            converted_data.push(line);
                        }
                    }
                }
            }
            var converted = converted_data.join("\n");
            return converted;
        };

        /************************ OTHER ************************/
        /**freq difference**/
        /* compute the difference vector (N-1) length by each sample (column) */
        this.computeDifferenceVector = function (current_parsed) {
            var counters = [];
            for (var i = 0; i < current_parsed.events.length - 1; i++)
                counters[i] = 0;
            for (var i = 0; i < counters.length; i++)
                for (var k in current_parsed.asn_freqs) {
                    counters[i] += Math.abs(current_parsed.asn_freqs[k][i] - current_parsed.asn_freqs[k][i + 1]);
                }
            //counters è un array della differenza tra ogni campione considerando le frequenze
            return counters;
        };

        /**freq distance**/
        /* compute the distance vector (N-1) length by each sample (column) */
        this.computeDistanceVector = function (current_parsed) {
            var counters = [];
            for (var i = 0; i < current_parsed.events.length - 1; i++)
                counters[i] = 0;
            for (var i = 0; i < counters.length; i++)
                for (var k in current_parsed.asn_freqs) {
                    counters[i] += Math.sqrt(Math.abs(Math.pow(current_parsed.asn_freqs[k][i], 2) - Math.pow(current_parsed.asn_freqs[k][i + 1], 2)));
                }
            //counters è un array delle distanza tra ogni campione considerando le frequenze
            return counters;
        };
    };

    return RipeDataParser;
});

define('bgpst.view.metrics',[
    "bgpst.controller.functions",
    "bgpst.lib.moment"
], function(myUtils, moment){

    var MetricsManager = function(env) {
        this.logger = env.logger;
    };

    MetricsManager.prototype.metrics = function(current_parsed, asn_ordering){
        var line_std_devs = Object.values(this.lineDistancesStdDev(current_parsed, asn_ordering));
        var wiggles = this.computeWiggle(current_parsed, asn_ordering);
        var wiggles_sum = this.sortByWiggleMinSum(wiggles,asn_ordering);
        var wiggles_max = this.sortByWiggleMinMax(wiggles, asn_ordering);
        var disconnections = this.disconnections(current_parsed,asn_ordering);
        this.logger.log("Line_Stanard_Deviation_Score ["+(this.lineDistanceStdDevScore(line_std_devs)).toFixed(1)+"]");
        this.logger.log("Wiggle_sum_score ["+(this.wiggleScore(wiggles_sum)).toFixed(1)+"]");
        this.logger.log("Wiggle_max_score ["+(this.wiggleScore(wiggles_max)).toFixed(1)+"]");
        this.logger.log("Disconnections_Score ["+this.disconnectionsScore(disconnections)+"]");
    };

    /************************ DISCONNECTIONS ************************/
    MetricsManager.prototype.disconnections = function(current_parsed, asn_ordering){
        //values store the myUtils.cumulates in every instant for every ASN
        var values = [];
        for(var e in current_parsed.asn_distributions) {
            values.push({});
        }
        for(var e in current_parsed.asn_distributions) {
            var dist = current_parsed.asn_distributions[e];
            for(var a = 0; a<asn_ordering.length; a++){
                var current_as = asn_ordering[a];
                var current_value = dist[current_as];
                if(current_value>0){
                    var level = asn_ordering.slice(0,a);
                    for(var l in level){
                        current_value+=dist[level[l]];
                    }
                    values[e][current_as] = current_value;
                }
                else
                    values[e][current_as] = 0;
            }
        }
        //fragments
        var disconnections = {};
        for(var a in asn_ordering){
            disconnections[asn_ordering[a]] = 0;
        }
        for(var a = 1; a<asn_ordering.length; a++)
            for(var v = 1; v<values.length; v++){
                if(values[v][asn_ordering[a]]>0 && values[v-1][asn_ordering[a]]>0){
                    //previous minimum more than next maximum
                    if(values[v-1][asn_ordering[a-1]] >= values[v][asn_ordering[a]]){
                        disconnections[asn_ordering[a]]+=1;
                    } else if (values[v][asn_ordering[a-1]] >= values[v-1][asn_ordering[a]]) {//previous maximum less than next minimum
                        disconnections[asn_ordering[a]]+=1;
                    }
                }
            }
        return disconnections;
    };

    MetricsManager.prototype.disconnectionsScore = function(disconnections){
        var disc = 0 ;

        for (var d in disconnections) {
            disc += disconnections[d];
        }

        return disc;
    };

    /************************ BORDER LINES STANDARD DEVIATION ************************/
    MetricsManager.prototype.lineDistances = function(asn_distributions, asn_ordering){
        var distances = [];
        for(var i = 0; i<asn_distributions.length-1; i++){
            distances[i] = [];
        }
        for(var i = 0; i<distances.length; i++){
            var stato = asn_distributions[i];
            var under = 0;
            for(var j in asn_ordering) {
                var a = asn_ordering[j];
                distances[i].push(parseFloat((stato[a]+under).toFixed(3)));
                under+=stato[a];
            }
        }
        return distances;
    };

    MetricsManager.prototype.lineDistancesStdDev = function(current_parsed, asn_ordering){
        var distances = this.lineDistances(current_parsed.asn_distributions,asn_ordering);
        var std_devs = {};
        for(var i in asn_ordering)
            std_devs[asn_ordering[i]] = [];
        for(var i in distances){
            var stato = distances[i];
            for(var j in asn_ordering){
                var asn = asn_ordering[j];
                std_devs[asn].push(stato[j]);
            }
        }
        for(var i in std_devs)
            std_devs[i] = myUtils.std_dev(std_devs[i]);
        return std_devs;
    };

    MetricsManager.prototype.lineDistanceStdDevScore = function(line_distance){
        var distance = 0;
        for(var i in line_distance)
            distance+=line_distance[i];
        return distance;
    };

    /************************ WIGGLES ************************/
    MetricsManager.prototype.sortByWiggleMinMax = function(wiggles, ordering){
        var as_w = {};
        for(var a in ordering)
            as_w[ordering[a]] = [];
        for(var w in wiggles){
            var list = wiggles[w];
            for(var a in list)
                as_w[a].push(list[a]);
        }

        for(var w in as_w){
            as_w[w] = myUtils.max(as_w[w]);
        }

        return as_w;
    };

    MetricsManager.prototype.sortByWiggleMinSum = function(wiggles, ordering){
        var as_w = {};
        for(var a in ordering)
            as_w[ordering[a]] = [];
        for(var w in wiggles){
            var list = wiggles[w];
            for(var a in list)
                as_w[a].push(list[a]);
        }

        for(var w in as_w){
            as_w[w] = myUtils.cumulate(as_w[w]);
        }

        return as_w;
    };

    MetricsManager.prototype.wiggleScore = function(wiggles){
        var w = 0;
        for(var i in wiggles){
            w+=wiggles[i];
        }
        return w;
    };

    MetricsManager.prototype.computeWiggle = function(current_parsed, asn_ordering){
        var wiggles = [];
        for(var e = 1; e < current_parsed.asn_distributions.length; e++)
            wiggles.push({});

        for(var a = 0 ;a<asn_ordering.length; a++){
            var as = asn_ordering[a];
            for(var e = 1; e<current_parsed.asn_distributions.length; e++){

                var fi = current_parsed.asn_distributions[e][as];

                var xi = moment(current_parsed.events[e]).unix();
                var xi_1 = moment(current_parsed.events[(e-1)]).unix();

                var yi = calc_y(e,a,asn_ordering,current_parsed.asn_distributions);
                var yi_1 = calc_y((e-1),a,asn_ordering,current_parsed.asn_distributions);

                var yi1 = calc_y(e,(a-1),asn_ordering,current_parsed.asn_distributions);
                var yi1_1 = calc_y((e-1),(a-1),asn_ordering,current_parsed.asn_distributions);

                var g = calc_g(yi, yi_1, xi, xi_1);
                var g_1 = calc_g(yi1, yi1_1, xi, xi_1);

                var w = calc_w(fi,g,g_1);

                if(isNaN(w)){
                    this.logger.log("Wiggle IS NAN!"+xi+" "+xi_1+" "+yi+" "+yi_1+" "+yi1+" "+yi1_1);
                    w = 0;
                }
                wiggles[(e-1)][as] = w;
            }
        }
        return wiggles;

        function calc_y(e,a,ordering,asn_distributions){
            var dist = asn_distributions[e];
            var y = 0;
            if(a >= 0)
                for(var i = 0; i <= a; i++)
                    y+=dist[ordering[i]];
            return y;
        }

        function calc_g(y0,y1,x0,x1){
            return (y0-y1)/(x0-x1);
        }

        function calc_w(fi, g, g_1){
            return fi*(Math.abs(g)+Math.abs(g_1))/2;
        }
    };

    /************************ LEVENSTHEIN ************************/
    /* compute the levensthein matrix */
    MetricsManager.prototype.characterization = function(asn_distributions, asn_ordering){
        var counters = [];
        var mapping = {};
        /*init*/
        for(var a = 0; a<asn_ordering.length; a++)
            mapping[asn_ordering[a]] = String.fromCharCode(35+a);
        for(var i = 0; i<asn_distributions.length;i++)
            counters[i] = "";
        /*fit*/
        for(var i = 0; i<asn_distributions.length;i++){
            var stato = asn_distributions[i];
            for(var s in asn_ordering){
                var valore = Math.round(stato[asn_ordering[s]]);
                for(var v = 0; v<valore; v++)
                    counters[i]+=mapping[asn_ordering[s]];
            }
        }
        return counters;
    };

    MetricsManager.prototype.computeLevenshteinDistance = function(current_parsed, asn_ordering){
        var strings = this.characterization(current_parsed.asn_distributions, asn_ordering);
        var distances = [];
        for(var i = 0; i<strings.length-1; i++)
            distances.push(myUtils.levenshtein(strings[i],strings[i+1]));
        return distances;
    };

    return MetricsManager;
});
define('bgpst.model.gdbstruct',[], function(){

    var GDBStruct = function(env){
        this.perm_list = [];	//permutations
        this.seq = [];			//elements of the sequence
        this.binds = [];
        this.logger = env.logger;
    };

    GDBStruct.prototype.init = function(seq) {
        this.seq = seq.slice(0);
        this.perm_list = [];
        this.binds = [];
        for(var i in this.seq){
            this.perm_list.push(this.seq[i]);
        }
    };

    GDBStruct.prototype.consecutive = function(x,y){
        this.logger.log("Consecutive "+x+" "+y+" from ");
        this.logger.log(this.perm_list.slice(0));
        var cons = false;
        //CHECK IF THEY ARE ALREADY CONSECUTIVE IN THE SAME SUB-SEQUENCE
        for(var p = 0; p<this.perm_list.length && !cons; p++){
            var s = this.perm_list[p];
            if(Array.isArray(s)){
                var i = s.indexOf(x);
                var j = s.indexOf(y);
                if(i >= 0 && j >= 0 && Math.abs(i-j) == 1){
                    cons = true;
                    this.logger.log("Already consecutive");
                }
            }
        }
        //IF NOT ALREADY CONSECUTIVE
        //CHECK IF THEY ARE ON EXTREMIS OF DIFFERENT SUB-SEQUENCES OR IN SINGLE SUB-SEQUENCE
        if(!cons){
            var x_done = false;
            var y_done = false;
            var seq_x = -1;
            var seq_y = -1;
            var x_i = -1;
            var y_i = -1;
            var cur_index = -1;
            //iterate all sub-sequences
            for(var i = 0; i<this.perm_list.length && !(x_done&&y_done); i++){
                var s = this.perm_list[i];
                //if the sub-sequence is an array check for x or y position
                if(Array.isArray(s)){
                    if(!x_done) {
                        cur_index= s.indexOf(x);
                        if(cur_index == 0 || cur_index == s.length-1){
                            this.logger.log("X in a sub-sequence");
                            seq_x = i;
                            x_i = cur_index;
                            x_done = true;
                        }
                    }
                    if(!y_done) {
                        cur_index = s.indexOf(y);
                        if(cur_index == 0 || cur_index == s.length-1){
                            this.logger.log("Y in a sub-sequence");
                            seq_y = i;
                            y_i = cur_index;
                            y_done = true;
                        }
                    }
                }
                //if the sub-sequence is a single element check is x or y
                else {
                    if(s == x && !x_done){
                        this.logger.log("X is single");
                        seq_x = -1;
                        x_i = i;
                        x_done = true;
                    }
                    if(s == y && !y_done){
                        this.logger.log("Y is single");
                        seq_y = -1;
                        y_i = i;
                        y_done = true;
                    }
                }
            }
            this.logger.log("x_done "+x_done+", y_done "+y_done);
            this.logger.log(seq_x+" "+x_i+" | "+seq_y+" "+y_i);
            //CHECK THE FOUND INDEXES
            //if both are found and are not in the same sub-sequence
            if(x_done && y_done && !(seq_x != -1&&seq_y != -1&&seq_x == seq_y)){
                //UPDATE
                this.logger.log("Consecutive by Update");
                var node;
                cons = true;
                //CASE: BOTH SINGLES (use reverse and splice to try order preservation)
                if(seq_x == -1&&seq_y == -1){
                    this.logger.log("Case 1");
                    node = [];
                    if(x_i > y_i){
                        node.push(this.perm_list.splice(x_i,1)[0]);
                        node.push(this.perm_list.splice(y_i,1)[0]);
                        //node.reverse();
                        this.logger.log("nodo "+node)
                        this.perm_list.splice(y_i,0,node);
                    }
                    else {
                        node.push(this.perm_list.splice(y_i,1)[0]);
                        node.push(this.perm_list.splice(x_i,1)[0]);

                        this.logger.log("nodo", node);
                        this.perm_list.splice(x_i,0,node);
                    }
                }
                else
                //CASE: X IS THE SINGLE, Y IS A SUB-SEQUENCE
                if(seq_x == -1&&seq_y != -1){
                    this.logger.log("Case 2");
                    //remove X
                    node = this.perm_list.splice(x_i,1)[0];
                    this.logger.log("nodo "+node);
                    if(x_i<seq_y)
                        seq_y--;
                    //if Y is on head
                    if(y_i == 0){
                        this.perm_list[seq_y].unshift(node);
                    }
                    //if Y is on tail
                    else{
                        this.perm_list[seq_y].push(node);
                    }
                }
                else
                //CASE: Y IS THE SINGLE, X IS A SUB-SEQUENCE
                if(seq_y == -1 && seq_x != -1){
                    this.logger.log("Case 3");
                    //remove Y
                    node = this.perm_list.splice(y_i,1)[0];
                    this.logger.log("nodo", node);
                    if(y_i < seq_x)
                        seq_x--;
                    //if X is on head
                    if(x_i == 0){
                        this.perm_list[seq_x].unshift(node);
                    }
                    //if X is on tail
                    else{
                        this.perm_list[seq_x].push(node);
                    }
                }
                //CASE: X AND Y ARE SUB-SEQUENCES
                else{
                    this.logger.log("Case 4");
                    //not both in head or tail
                    if(y_i != x_i){
                        //X is head => push in tail of Y
                        if(x_i == 0) {
                            this.logger.log("- X head , Y tail");
                            node = this.perm_list.splice(seq_x,1)[0];
                            if(seq_x<seq_y)
                                seq_y--;
                            this.logger.log("nodo "+node)
                            for(var n in node)
                                this.perm_list[seq_y].push(node[n]);
                        }
                        //Y is head => push in tail of X
                        else
                        if(y_i == 0)	{
                            this.logger.log("- Y head , X tail");
                            node = this.perm_list.splice(seq_y,1)[0];
                            if(seq_y<seq_x)
                                seq_x--;
                            this.logger.log("nodo "+node)
                            for(var n in node)
                                this.perm_list[seq_x].push(node[n]);
                        }
                    }
                    //both head or tail => push X into Y
                    else {
                        node = this.perm_list.splice(seq_x,1)[0];
                        this.logger.log("nodo ", node);
                        if(seq_x<seq_y)
                            seq_y--;
                        //from head
                        if(x_i == y_i == 0){
                            this.logger.log("- X,Y head");
                            for(var n in node)
                                this.perm_list[seq_y].unshift(node[n]);
                        }
                        //from tail
                        else {
                            this.logger.log("- X,Y tail");
                            for(var n = node.length-1; n >= 0; n--)
                                this.perm_list[seq_y].push(node[n]);
                        }
                    }
                }
            }
        }
        if(!cons){
            this.logger.log("Cant' Be Consecutive");
        }
        return cons;
    };

    GDBStruct.prototype.show = function(){
        var shown = [];
        for(var n in this.perm_list) {
            var node = this.perm_list[n];
            if(Array.isArray(node)){
                for(var i in node)
                    shown.push(node[i]);
            }
            else
                shown.push(node);
        }
        return shown;
    };

    GDBStruct.prototype.getStructure = function(){
        return this.perm_list;
    };

    return GDBStruct;
});
define('bgpst.view.heuristics',[
    /*date converter*/
    /*metrics manager*/
    /*functions helper*/
    /*moment*/
    "bgpst.controller.dateconverter",
    "bgpst.view.metrics",
    "bgpst.controller.functions",
    "bgpst.lib.moment",
    "bgpst.model.gdbstruct"
], function(DateConverter, MetricsManager, myUtils, moment, GDBStruct){

    var HeuristicsManager = function(env) {
        this.dateConverter = new DateConverter(env);
        this.MetricsManager = new MetricsManager(env);
        this.logger = env.logger;

        this.StreamgraphHeuristics = {
            "lev_rnd_cum":"asnStdDevByPointMinimizationRandomWalker",
            "lev_rnd_max":"asnLevDistMinimizationRandWalkMAX",
            "st_rnd_cum":"asnLevDistMinimizationRandWalkCUM",
            "st_inf_cum":"asnStdDevByPointMinimizationInference",
            "st_grdy_cum":"asnStdDevByPointMinimizationGreedy",
            "n_f":"getSortedASByExchanges",
            "w_cum":"wiggleSort",
            "w_max":"wiggleSort",
            "disc":"disconnectionsSort",
            "s_st":"getSortedAsnByFreqSTDEV",
            "s_var":"getSortedAsnByFreqVAR",
            "s_avg":"getSortedAsnByFreqAVG",
            "s_cum":"getSortedAsnByFreqSUM"
        };

        this.HeatmapHeuristics = {
            "st_grdy_cum":"getHeatStdev",
            "nf_1":"getSortedCPByExchanges_level",
            "nf_2":"getSortedCPByExchanges_level_var",
            "geo":"getGeoOrder",
            "asn":"getASNOrder"
        };

        this.Sorts = {
            "asc":"asc",
            "dsc":"dsc"
        };
        /*defaults*/
        this.default_heuristic_s = "n_f";
        this.default_heuristic_h = "nf_1";

        this.setDefaultHeuristic = function(type){
            if(type == "stream") {
                this.current_heuristic = this.default_heuristic_s;
            } else if(type == "heat") {
                this.current_heuristic = this.default_heuristic_h;
            }
        };

        this.getCurrentOrdering = function(current_parsed, type){
            var ordering,heuristic;
            if(type == "stream"){
                heuristic = this.StreamgraphHeuristics[this.current_heuristic];
                switch(this.current_heuristic){
                    //STREAMGRAPH
                    case "lev_rnd_cum" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "lev_rnd_max" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "st_rnd_cum" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case"st_inf_cum" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "st_grdy_cum" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "n_f" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "w_cum" :
                        ordering = this[heuristic](current_parsed,this.MetricsManager.sortByWiggleMinSum);
                        break;
                    case "w_max" :
                        ordering = this[heuristic](current_parsed,this.MetricsManager.sortByWiggleMinMax);
                        break;
                    case "disc" :
                        ordering = null;
                        break;
                    case "s_st" :
                        ordering = this[heuristic](current_parsed,this.current_sort_type);
                        break;
                    case "s_var" :
                        ordering = this[heuristic](current_parsed,this.current_sort_type);
                        break;
                    case "s_avg" :
                        ordering = this[heuristic](current_parsed,this.current_sort_type);
                        break;
                    case "s_cum" :
                        ordering = this[heuristic](current_parsed,this.current_sort_type);
                        break;
                    default:
                        ordering = null;
                        break;
                }
            }
            else
            if(type == "heat"){
                heuristic = this.HeatmapHeuristics[this.current_heuristic];
                switch(this.current_heuristic){
                    case "st_grdy_cum" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "nf_1" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "nf_2" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case"geo" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    case "asn" :
                        ordering = this[heuristic](current_parsed);
                        break;
                    default:
                        ordering = null;
                        break;
                }
            }
            return ordering;
        };

        //STD DEV RANDOM
        this.asnStdDevByPointMinimizationRandomWalker = function(current_parsed){
            var start = moment().valueOf();
            var best_ordering = current_parsed.asn_set;
            var theorical_devs = current_parsed.asn_stdev;
            var best_devs = this.MetricsManager.lineDistancesStdDev(current_parsed, best_ordering);
            var best_cum =  Math.floor(this.MetricsManager.lineDistanceStdDevScore(best_devs));
            var tentatives = best_cum*Object.keys(best_devs).length;
            var temperature = 1;
            var done_ordering = [];
            done_ordering.push(best_ordering);
            this.logger.log("myUtils.std_dev_RND_WLK_CUM, DIST: "+best_cum+", TENTATIVES: "+tentatives);
            while(tentatives > 0){
                var new_seq = myUtils.random_sort(asn_ordering);
                if(!myUtils.contains(done_ordering,new_seq)){
                    var new_devs = this.MetricsManager.lineDistancesStdDev(current_parsed, new_seq);
                    var new_cum = Math.floor(this.MetricsManager.lineDistanceStdDevScore(new_devs));
                    if(new_cum < best_cum){
                        best_devs = new_devs;
                        best_cum = new_cum;
                        best_ordering = new_seq;
                        tentatives += best_cum*asn_ordering.length*temperature;
                        this.logger.log("New best ["+best_cum+"], "+" tentatives left:"+tentatives);
                    }
                    else {
                        tentatives-=Math.floor(temperature*Math.min(best_cum,asn_ordering.length)/Math.max(best_cum,asn_ordering.length));
                    }
                    temperature++;
                }
                else {
                    tentatives = tentatives/best_ordering.length;
                }

            }
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return best_ordering;
        };

        //STD DEV SWAP
        this.asnStdDevByPointMinimizationGreedy = function(current_parsed){
            var start = moment().valueOf();
            var theorical_devs = current_parsed.asn_stdev;
            var done = [];
            for(var i in theorical_devs)
                if(theorical_devs[i] == 0){
                    done.push(i);
                }
            var d_l = done.length;
            var a_l = current_parsed.asn_set.length;
            this.logger.log("myUtils.std_dev_GREEDY "+d_l+" on "+a_l+" are on baseline (0% deviation)");
            while(d_l<a_l){
                d_l++;
                var best = this.pickbest(current_parsed,done,current_parsed.asn_set);
                this.logger.log(d_l+" pick "+best);
                done.push(best);
            }

            var ordering = this.stdDevBubbles(current_parsed,done);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return ordering;
        };

        this.pickbest = function (current_parsed,done,asn_ordering) {
            var left = asn_ordering.filter(function(e){return done.indexOf(e) == -1});
            var best_choose = left[0];
            var best_order = done.slice(0);
            best_order.push(best_choose);
            var best_dist = Object.values(this.MetricsManager.lineDistancesStdDev(current_parsed, best_order));
            var best_score = myUtils.cumulate(best_dist);
            for(var i = 1; i<left.length; i++){
                var try_choose = left[i];
                var try_order = done.slice(0);
                try_order.push(try_choose);
                var try_dist = Object.values(this.MetricsManager.lineDistancesStdDev(current_parsed, try_order));
                var try_score = myUtils.cumulate(try_dist);
                if(try_score <= best_score){
                    if(try_score<best_score || (myUtils.max(try_dist)<myUtils.max(best_dist)&&try_score == best_score)) {
                        best_score = try_score;
                        best_choose = try_choose;
                        best_dist = try_dist;
                    }
                }
            }
            return best_choose;
        };

        this.stdDevBubbles = function(current_parsed, asn_ordering){
            var improved = false;
            var best_score = this.MetricsManager.lineDistanceStdDevScore(this.MetricsManager.lineDistancesStdDev(current_parsed,asn_ordering));
            var best_order = asn_ordering.slice(0);
            var phase_max = asn_ordering.length-1;
            //var changed = false;
            this.logger.log("BEST SCORE "+best_score);
            //while(!changed){
            var phase = 0;
            while(phase<phase_max){
                phase++;
                this.logger.log("phase "+phase);
                for(var i = 0; i<asn_ordering.length-1; i++){
                    var new_order = myUtils.swap(i,(i+phase)%phase_max,asn_ordering.slice(0));
                    var new_score = this.MetricsManager.lineDistanceStdDevScore(this.MetricsManager.lineDistancesStdDev(current_parsed,new_order));
                    if(new_score<best_score){
                        //changed = true;
                        best_score = new_score;
                        best_order = new_order.slice(0);
                        this.logger.log("NEW BEST "+best_score);
                    }
                }
                //}
                //changed = !changed;
            }
            return best_order;
        };

        this.asnStdDevByPointMinimizationInference = function(current_parsed){
            var start = moment().valueOf();
            var theorical_devs = current_parsed.asn_stdev;
            var done = [];
            for(var i in theorical_devs)
                if(theorical_devs[i] == 0){
                    done.push(i);
                }
            var d_l = done.length;
            var a_l = current_parsed.asn_set;
            this.logger.log("myUtils.std_dev_INF "+d_l+" on "+a_l+" are on baseline (0% deviation)");
            while(d_l<a_l){
                d_l++;
                var best = this.pickbest(current_parsed, done, current_parsed.asn_set);
                this.logger.log(d_l+" pick "+best);
                done.push(best);
            }
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return done;
        };

        /************************************************ LEVENSTHEIN DISTANCE METHODS ************************************************/
        this.asnLevDistMinimizationRandWalkCUM = function(current_parsed){
            var start = moment().valueOf();
            var best_ordering = current_parsed.asn_set.slice(0);
            var ordering_length = best_ordering.length;
            var best_lev = this.MetricsManager.computeLevenshteinDistance(current_parsed,best_ordering);
            var best_cum = myUtils.cumulate(best_lev);
            var best_avg = Math.floor(myUtils.average(best_lev,best_cum));
            var best_max = myUtils.max(best_lev);
            var done_ordering = [];
            done_ordering.push(best_ordering);
            var tentatives = Math.floor(myUtils.fact(Math.floor(Math.sqrt(ordering_length))))*Math.min(best_cum,ordering_length);
            var temperature = 1;
            while(tentatives>0){
                var new_seq = myUtils.random_sort(current_parsed.asn_set);
                if(!myUtils.contains(done_ordering,new_seq)){
                    done_ordering.push(new_seq);
                    var new_dist = this.MetricsManager.computeLevenshteinDistance(current_parsed,new_seq);
                    var new_dist_tot = myUtils.cumulate(new_dist);
                    if(new_dist_tot<best_cum) {
                        best_ordering = new_seq;
                        best_cum = new_dist_tot;
                        best_avg = Math.max(Math.floor(myUtils.average(best_lev,best_cum)),1);
                        best_max = myUtils.max(best_lev);
                        tentatives+=best_cum*ordering_length;
                        this.logger.log("New best ["+best_cum+"], "+" tentatives left:"+tentatives);
                    }
                    else {
                        tentatives-=Math.floor(temperature*Math.min(best_cum,ordering_length)/Math.max(best_cum,ordering_length));
                    }
                    temperature = temperature+1;
                }
                else
                    tentatives = Math.floor(tentatives/best_cum);

            }
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return best_ordering;
        };

        this.asnLevDistMinimizationRandWalkMAX = function(current_parsed){
            var start = moment().valueOf();
            var best_ordering = current_parsed.asn_set.slice(0);
            var ordering_length = best_ordering.length;
            var best_lev = this.MetricsManager.computeLevenshteinDistance(current_parsed,best_ordering);
            var best_cum = myUtils.cumulate(best_lev);
            var best_avg = Math.floor(myUtils.average(best_lev,best_cum));
            var best_max = myUtils.max(best_lev);
            var done_ordering = [];
            done_ordering.push(best_ordering);
            var tentatives = Math.floor(myUtils.fact(Math.floor(Math.sqrt(ordering_length))))*Math.max(best_max,ordering_length);
            var temperature = 1;
            this.logger.log("LEV_DIST_RND_WLK_MAX, DIST: "+best_max+", TENTATIVES: "+tentatives);
            while(tentatives>0){
                var new_seq = myUtils.random_sort(current_parsed.asn_set);
                if(!myUtils.contains(done_ordering,new_seq)){
                    done_ordering.push(new_seq);
                    var new_dist = this.MetricsManager.computeLevenshteinDistance(current_parsed,new_seq);
                    var new_dist_tot = myUtils.cumulate(new_dist);
                    var new_dist_max = myUtils.max(new_dist);
                    if(new_dist_max<best_max) {
                        best_ordering = new_seq;
                        best_cum = new_dist_tot;
                        best_avg = Math.max(Math.floor(myUtils.average(best_lev,best_cum)),1);
                        best_max = new_dist_max;
                        tentatives+=best_max*temperature*ordering_length;
                        this.logger.log("New best ["+best_max+"], "+" tentatives left:"+tentatives);
                    }
                    else {
                        tentatives-=Math.floor(temperature*Math.max(best_max,1)/ordering_length);
                    }
                    temperature = temperature+1;
                }
                else
                    tentatives = Math.floor(tentatives/ordering_length);

            }
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return best_ordering;
        };

        /************************************************ SORTING METHODS ************************************************/
        /* get ASN sorted by STD DEV VALUE */
        this.getSortedAsnByFreqSTDEV = function(current_parsed, sort_type){
            var start = moment().valueOf();
            var new_order = [];
            for (var i in current_parsed.asn_stdev)
                new_order.push([i, current_parsed.asn_stdev[i]])
            if(sort_type == "asc"){
                this.logger.log("SORT_myUtils.std_dev_ASC");
                new_order.sort(function(a, b) {
                    return a[1] - b[1];
                });
            } else {
                this.logger.log("SORT_myUtils.std_dev_DSC");
                new_order.sort(function(a, b) {
                    return b[1] - a[1];
                });
            }
            var values = new_order.map(function(o){
                return o[0];
            });
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return values;
        };

        /* get ASN sorted by myUtils.variance VALUE */
        this.getSortedAsnByFreqVAR = function(current_parsed, sort_type){
            var start = moment().valueOf();
            var new_order = [];
            for (var i in current_parsed.asn_varfreqs)
                new_order.push([i, current_parsed.asn_varfreqs[i]])
            if(sort_type == "asc"){
                this.logger.log("SORT_VAR_ASC");
                new_order.sort(function(a, b) {
                    return a[1] - b[1];
                });
            }
            else {
                this.logger.log("SORT_VAR_DSC");
                new_order.sort(function(a, b) {
                    return b[1] - a[1];
                });
            }
            var values = new_order.map(function(o){
                return o[0];
            });
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return values;
        };

        /* get ASN sorted by myUtils.average VALUE */
        this.getSortedAsnByFreqAVG = function(current_parsed, sort_type){
            var start = moment().valueOf();
            var new_order = [];
            for (var i in current_parsed.asn_avgfreqs)
                new_order.push([i, current_parsed.asn_avgfreqs[i]])
            if(sort_type == "asc"){
                this.logger.log("SORT_AVG_ASC");
                new_order.sort(function(a, b) {
                    return a[1] - b[1];
                });
            }
            else {
                this.logger.log("SORT_AVG_DSC");
                new_order.sort(function(a, b) {
                    return b[1] - a[1];
                });
            }
            var values = new_order.map(function(o){return o[0] });
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return values;
        };

        /* get ASN sorted by myUtils.cumulate VALUE*/
        this.getSortedAsnByFreqSUM = function(current_parsed, sort_type){
            var start = moment().valueOf();
            var new_order = [];
            for (var i in current_parsed.asn_sumfreqs)
                new_order.push([i, current_parsed.asn_sumfreqs[i]])
            if(sort_type == "asc"){
                this.logger.log("SORT_SUM_ASC");
                new_order.sort(function(a, b) {
                    return a[1] - b[1];
                });
            }
            else {
                this.logger.log("SORT_SUM_DSC");
                new_order.sort(function(a, b) {
                    return b[1] - a[1];
                });
            }
            var values = new_order.map(function(o){return o[0]});
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return values;
        };

        /************************ near flows ************************/
        this.getSortedASByExchanges = function(current_parsed){
            var start = moment().valueOf();
            this.logger.log("NEAR_FLOWS");
            var bind_structure = new GDBStruct(env);
            var asn_set = current_parsed.asn_set.slice(0);
            //ignore null
            //asn_set.push(null);

            //exchanges
            var exchanges = current_parsed.asn_by_exchanges;
            //as involved in exchanges
            var exchanges_as = Object.keys(exchanges).map(function(e){if(e != "null") return parseInt(e); else return null;});
            //as not involved in exchanges
            var non_exchange_as = asn_set.filter(function(e){return exchanges_as.indexOf(e)<0});

            //SORT exchanges from the most important to the less important
            var exchange_sorted = [];
            for(var s in exchanges){
                var dest = exchanges[s];
                for(var d in dest){
                    var count = dest[d];
                    var source = (s != "null")? parseInt(s) : null;
                    var destination = (d != "null")? parseInt(d) : null;
                    //IGNORE NULL
                    if(source != null && destination != null) {
                        var o = {
                            source: source,
                            destination: destination,
                            count: count
                        };
                        exchange_sorted.push(o);
                    }
                }
            }
            exchange_sorted = exchange_sorted.sort(function(a,b){return b["count"]-a["count"];});

            //init the bind structure
            bind_structure.init(exchanges_as);

            //best effort add-binds
            for(var e in exchange_sorted){
                var ex = exchange_sorted[e];
                bind_structure.consecutive(ex["source"],ex["destination"]);
            }

            var ordering;
            ordering = this.exchanges_plus_sd_greedy_block(current_parsed, bind_structure, non_exchange_as);
            ordering = ordering.filter(function(e){return e != null;});
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return ordering;
        };

        this.exchanges_as_is = function(current_parsed, bind_structure, non_exchange_as){
            //PROBLEM NULL SHOULD STAY ALWAYS ON HEAD
            return non_exchange_as.concat(bind_structure.show());
        };

        this.exchanges_plus_sd_greedy_block = function(current_parsed, bind_structure, non_exchange_as){
            var ordering = non_exchange_as;
            //find left blocks
            var left = [];
            var blocks = bind_structure.getStructure();
            for(var b in blocks)
                left.push(parseInt(b));
            //while there are left blocks
            while(left.length>0){
                var base = ordering.slice(0);
                var best_score = Infinity;
                var best_index = 0;
                var best_order = [];
                var block;
                for(var b in left){
                    //straigth
                    block = blocks[left[b]];
                    var new_order = base.concat(block);
                    var new_score = this.MetricsManager.lineDistanceStdDevScore(this.MetricsManager.lineDistancesStdDev(current_parsed,new_order));
                    if(new_score<best_score){
                        best_score = new_score;
                        best_index = b;
                        if(Array.isArray(block))
                            best_order = block.slice(0);
                        else
                            best_order = block;
                    }
                    //reversed
                    if(Array.isArray(block)){
                        block = blocks[left[b]].slice(0).reverse();
                        new_order = base.concat(block);
                        new_score = this.MetricsManager.lineDistanceStdDevScore(this.MetricsManager.lineDistancesStdDev(current_parsed,new_order));
                        if(new_score<best_score){
                            best_score = new_score;
                            best_index = b;
                            best_order = block.slice(0);
                        }
                    }
                }
                //UPDATE with greedy best
                left.splice(best_index,1);
                ordering = ordering.concat(best_order);
            }
            return ordering;
        };

        /************************ wiggles ************************/
        this.wiggleFirstOrdering = function(current_parsed, asn_set, calc_type){
            var fixed_order = [];
            var best_order = [];
            var left = asn_set.slice(0);
            var layers = asn_set.length;
            for(var i = 0;i<layers;i++){
                var best_w = Infinity;
                for(var j in left){
                    var temp = fixed_order.slice(0);
                    temp.push(left[j]);
                    var w = this.MetricsManager.computeWiggle(current_parsed,temp);
                    var curr_w = this.MetricsManager.wiggleScore(calc_type(w,temp));
                    if(curr_w<best_w){
                        best_w = curr_w;
                        best_order = temp.slice(0);
                    }
                }
                fixed_order = best_order;
                left = asn_set.filter(function(e){return fixed_order.indexOf(e)<0;});
                this.logger.log(left.length+"/"+layers);
            }
            return fixed_order;
        };

        this.wiggleBubblesPhase = function(current_parsed, asn_ordering, calc_type){
            var improved = false;
            var best_score = this.MetricsManager.wiggleScore(calc_type(this.MetricsManager.computeWiggle(current_parsed,asn_ordering,calc_type), asn_ordering));
            var best_order = asn_ordering.slice(0);
            var phase_max = asn_ordering.length-1;
            //var changed = false;
            this.logger.log("BEST SCORE "+best_score);
            //while(!changed){
            var phase = 0;
            while(phase<phase_max){
                phase++;
                this.logger.log("phase "+phase);
                for(var i = 0; i<asn_ordering.length-1; i++){
                    var new_order = myUtils.swap(i,(i+phase)%phase_max,asn_ordering.slice(0));
                    var new_wiggle = this.MetricsManager.computeWiggle(current_parsed,new_order);
                    var new_score = this.MetricsManager.wiggleScore(calc_type(new_wiggle,new_order));
                    if(new_score<best_score){
                        //changed = true;
                        best_score = new_score;
                        best_order = new_order.slice(0);
                        this.logger.log("NEW BEST "+best_score);
                    }
                }
                //}
                //changed = !changed;
            }
            return best_order;
        };

        this.wiggleSort = function(current_parsed, calc_type){
            var start = moment().valueOf();
            this.logger.log("WIGGLE_SORT");
            this.logger.log("initial sorting");
            var order = this.wiggleFirstOrdering(current_parsed,current_parsed.asn_set, calc_type);
            this.logger.log("bubble phase");
            order = this.wiggleBubblesPhase(current_parsed,order, calc_type);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };

        /************************ disconnections ************************/
        this.disconnectionsFirstOrdering = function(current_parsed,asn_set){
            var fixed_order = [];
            var best_order = [];
            var left = asn_set.slice(0);
            var layers = asn_set.length;
            for(var i = 0;i<layers;i++){
                var best_w = Infinity;
                for(var j in left){
                    var temp = fixed_order.slice(0);
                    temp.push(left[j]);
                    var w = this.MetricsManager.disconnections(current_parsed,temp);
                    var curr_w = this.MetricsManager.disconnectionsScore(w);
                    if(curr_w<best_w){
                        best_w = curr_w;
                        best_order = temp.slice(0);
                    }
                }
                fixed_order = best_order;
                left = asn_set.filter(function(e){return fixed_order.indexOf(e)<0;});
                this.logger.log(left.length+"/"+layers);
            }
            return fixed_order;
        };

        this.disconnectionsBubblesPhase = function(current_parsed, asn_ordering){
            var best_score = this.MetricsManager.disconnectionsScore(this.MetricsManager.disconnections(current_parsed,asn_ordering));
            var best_order = asn_ordering.slice(0);
            var phase_max = asn_ordering.length-1;
            //var changed = false;
            this.logger.log("BEST SCORE "+best_score);
            //while(!changed){
            var phase = 0;
            while(phase<phase_max){
                phase++;
                this.logger.log("phase "+phase);
                for(var i = 0; i<asn_ordering.length-1; i++){
                    var new_order = myUtils.swap(i,(i+phase)%phase_max,asn_ordering.slice(0));
                    var new_disconnections = this.MetricsManager.disconnections(current_parsed,new_order);
                    var new_score = this.MetricsManager.disconnectionsScore(new_disconnections);
                    if(new_score<best_score){
                        //changed = true;
                        best_score = new_score;
                        best_order = new_order.slice(0);
                        this.logger.log("NEW BEST "+best_score);
                    }
                }
            }
            //changed = !changed;
            //}
            return best_order;
        };

        this.disconnectionsSort = function(current_parsed){
            var start = moment().valueOf();
            this.logger.log("DISCONNECTIONS_SORT");
            this.logger.log("initial sorting");
            var order = this.disconnectionsFirstOrdering(current_parsed,current_parsed.asn_set);
            this.logger.log("bubble phase");
            order = this.disconnectionsBubblesPhase(current_parsed,order);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };

        /************************ HEAT SORTING ************************/
        this.sortCPByASOrdering_level = function(current_parsed,asn_ordering){
            var start = moment().valueOf();
            var cp_composition = current_parsed.cp_by_composition;
            var tail_set = Object.keys(cp_composition);
            var result = [];
            //buckets
            var buckets = {};
            asn_ordering.push(null);
            for(var i in asn_ordering){
                buckets[asn_ordering[i]] = [];
            }
            //find max depth
            var max_depth = 0;
            for(var r in cp_composition)
                max_depth = Math.max(max_depth, cp_composition[r].length);
            //for every depth and every as in the ordering
            for(var i = 1; i <= max_depth; i++){
                var current_set = [];
                var temp = [];
                tail_set.forEach(function(e){if(cp_composition[e].length == i) current_set.push(e); else temp.push(e);});
                tail_set = temp;
                for(var c in current_set){
                    var cp = current_set[c];
                    var asn = cp_composition[cp][(i-1)];
                    if(asn == "null")
                        asn = null;
                    else
                        asn = parseInt(asn);
                    buckets[asn].push(cp);
                }
            }
            //recompose
            for(var i in asn_ordering){
                var as = asn_ordering[i];
                for(var j in buckets[as]){
                    var cp = buckets[as][j];
                    result.push(cp);
                }
            }
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return result;
        };

        this.sortCPByASOrdering_level_var = function(current_parsed,asn_ordering){
            var start = moment().valueOf();
            var cp_composition = current_parsed.cp_by_composition;
            var tail_set = Object.keys(cp_composition);
            var result = [];
            //buckets
            var buckets = {};
            asn_ordering.push(null);
            for(var i in asn_ordering){
                buckets[asn_ordering[i]] = [];
            }
            //find max depth
            var max_depth = 0;
            for(var r in cp_composition)
                max_depth = Math.max(max_depth, cp_composition[r].length);
            //for every depth and every as in the ordering
            for(var i = 1; i <= max_depth; i++){
                var current_set = [];
                var temp = [];
                tail_set.forEach(function(e){if(cp_composition[e].length == i) current_set.push(e); else temp.push(e);});
                tail_set = temp;
                for(var c in current_set){
                    var cp = current_set[c];
                    //here the variation get always the first
                    var asn = cp_composition[cp][0];
                    if(asn == "null")
                        asn = null;
                    else
                        asn = parseInt(asn);
                    buckets[asn].push(cp);
                }
            }
            //recompose
            for(var i in asn_ordering){
                var as = asn_ordering[i];
                for(var j in buckets[as]){
                    var cp = buckets[as][j];
                    result.push(cp);
                }
            }
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return result;
        };

        this.sortCPByGeoOrder = function(current_parsed){
            var geo_counter = [];
            for(var r in current_parsed.cp_set){
                var cp = current_parsed.cp_set[r];
                var geo = current_parsed.known_cp[cp]['geo'].split("-")[0];
                var to_insert = geo_counter[geo];
                if(!to_insert){
                    to_insert = [];
                }
                to_insert.push(cp);
                geo_counter[geo] = to_insert;
            }
            var sorted_geo = myUtils.sorted_by_field_key_length(geo_counter);
            sorted_geo = sorted_geo.map(function(e){return e[0]});
            /*geo order found*/
            var order = [];
            for(var g in sorted_geo){
                var geo = sorted_geo[g];
                order = order.concat(geo_counter[geo]);
            }
            return order;
        };

        this.sortCPByAsnOrder = function(current_parsed){
            var geo_counter = [];
            var empty = [];
            for(var r in current_parsed.cp_by_composition){
                var cp = r;
                var as = current_parsed.cp_by_composition[cp][0];
                if(as == "null") {
                    empty.push(cp);
                }
                else{
                    var as_string = current_parsed.known_asn[as];
                    var split_index = as_string.lastIndexOf(",");
                    var as_string = as_string.substring(split_index+1);
                    var geo = (as_string).trim();//.split("-")[0]
                    var to_insert = geo_counter[geo];
                    if(!to_insert){
                        to_insert = [];
                    }
                    to_insert.push(cp);
                    geo_counter[geo] = to_insert;
                }
            }
            var sorted_geo = myUtils.sorted_by_field_key_length(geo_counter);
            sorted_geo = sorted_geo.map(function(e){return e[0]});
            /*as order found*/
            var order = [];
            for(var g in sorted_geo){
                var geo = sorted_geo[g];
                order = order.concat(geo_counter[geo]);
            }
            return empty.concat(order);
        };

        /**************************************************************************************/
        this.getSortedCPByExchanges_level = function(current_parsed){
            var start = moment().valueOf();
            var asn_ordering = this.getSortedASByExchanges(current_parsed)
            var order = this.sortCPByASOrdering_level(current_parsed,current_parsed.asn_set);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };

        this.getSortedCPByExchanges_level_var = function(current_parsed){
            var start = moment().valueOf();
            var asn_ordering = this.getSortedASByExchanges(current_parsed)
            var order = this.sortCPByASOrdering_level_var(current_parsed,current_parsed.asn_set);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };

        this.getHeatStdev = function(current_parsed){
            var start = moment().valueOf();
            var asn_ordering = this.asnStdDevByPointMinimizationGreedy(current_parsed)
            var order = this.sortCPByASOrdering_level_var(current_parsed,current_parsed.asn_set);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };

        this.getGeoOrder = function(current_parsed){
            var start = moment().valueOf();
            var order = this.sortCPByGeoOrder(current_parsed);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };

        this.getASNOrder = function(current_parsed){
            var start = moment().valueOf();
            var order = this.sortCPByAsnOrder(current_parsed);
            var end = moment().valueOf();
            this.logger.log("TIME_EXECUTED "+this.dateConverter.executionTime(start,end));
            return order;
        };


        // INIT
        this.setDefaultHeuristic(env.guiManager.graph_type);
    };

    return HeuristicsManager;
});


define('bgpst.view.broker',[
    "bgpst.env.utils",
    "bgpst.lib.jquery-amd",
    "bgpst.view.parser",
    "bgpst.controller.dateconverter",
    "bgpst.view.heuristics",
    "bgpst.lib.moment",
    "bgpst.controller.functions"
], function(utils, $, RipeDataParser, DateConverter, HeuristicsManager, moment, myUtils){


    var RipeDataBroker = function(env) {
        env.logger.log("=== RipeBroker Starting");
        var $this = this;
        this.parser = new RipeDataParser(env);
        this.dateConverter = new DateConverter();
        env.dateConverter = this.dateConverter;
        this.heuristicsManager = new HeuristicsManager(env);
        this.ipv6_peerings = 0;
        this.ipv4_peerings = 0;
        env.logger.log("=== RipeBroker Ready");


        //do the ajax get
        this.getData = function() {
            var url_ris_peer_count = "https://stat.ripe.net/data/ris-peer-count/data.json";

            utils.observer.publish("updated", env.queryParams);
            $.ajax({
                url: url_ris_peer_count,
                dataType: "json",
                data : {
                    starttime: env.queryParams.startDate.unix(),
                    endtime: env.queryParams.stopDate.unix()
                },
                success: function(data){
                    env.logger.log("=== RipeBroker Success! Peer count loaded");
                    env.logger.log(data);
                    try {
                        $this.ipv4_peerings = myUtils.max(data['data']['peer_count']['v4']['full_feed'].map(function(e){return e['count'];}));
                        $this.ipv6_peerings = myUtils.max(data['data']['peer_count']['v6']['full_feed'].map(function(e){return e['count'];}));
                        if($this.ipv6_peerings == 0 && env.queryParams.targets.some(function(e){return env.guiManager.validator.check_ipv6(e)}))
                            env.guiManager.global_visibility = false;
                        if($this.ipv4_peerings == 0 && env.queryParams.targets.some(function(e){return env.guiManager.validator.check_ipv4(e)}))
                            env.guiManager.global_visibility = false;
                    } catch(err) {
                        env.logger.log("=== RipeBroker Warning: empty peerings size");
                        $this.ipv6_peerings = 0;
                        $this.ipv4_peerings = 0;
                        env.guiManager.global_visibility = false;
                    }
                    $this.getBGPData();
                },
                fail: function (argument) {
                    alert("Server error");
                }
            });
        };


        this.getBGPData = function() {
            var url_bgplay = "https://stat.ripe.net/data/bgplay/data.json";
            $.ajax({
                url: url_bgplay,
                dataType: "json",
                data : {
                    resource: env.queryParams.targets.join(","),
                    starttime: env.queryParams.startDate.unix(),
                    endtime: env.queryParams.stopDate.unix()
                },
                success: function(data){
                    env.logger.log("=== RipeBroker Success! Data loaded from:"+url_bgplay);
                    env.logger.log(data);
                    try {
                        $this.current_parsed = $this.parser.ripe_response_parse(data, env.queryParams.startDate, env.queryParams.stopDate);
                        if(env.guiManager.gather_information){
                            env.logger.log("=== RipeBroker Starting gathering CP Info");
                            env.guiManager.rrc_info_done=false;
                            setTimeout(function(){
                                $this.getCPInfo($this.current_parsed.resources,0)
                            },0);
                        }
                        env.queryParams.targets = data.data.targets.map(function (e) {return e['prefix'].replace(/"/g,'');});
                        $this.loadCurrentState(true, env.guiManager.drawer.events_range, true);

                        if(env.guiManager.gather_information){
                            env.logger.log("=== RipeBroker Starting gathering ASN Info");
                            setTimeout(function(){
                                env.guiManager.asn_info_done=false;
                                if(env.guiManager.graph_type=="stream")
                                    $this.getASNInfo($this.current_parsed.asn_set,0);
                                else
                                if(env.guiManager.graph_type=="heat")
                                    $this.getASNInfo(env.guiManager.drawer.asn_set,0);
                            },0);
                        }
                    }
                    catch(err){
                        env.logger.log(err);
                        alert("No data found for this target in the interval of time selected");
                    }
                    finally {
                        env.guiManager.draw_functions_btn_enabler();
                    }
                },
                error: function(jqXHR, exception){
                    switch(jqXHR.status){
                        case 500:
                            alert("Server error");
                            break;
                        case 404:
                            alert("Bad Request");
                            break;
                        default:
                            alert("Something went wrong");
                            break;
                    }
                }
            });
        };


        this.CPInfoCallBack = function(res) {
            var url_cp = "https://stat.ripe.net/data/geoloc/data.json?resource=" + res.ip;
            $.ajax({
                url: url_cp,
                dataType: "json",
                success: function(data){
                    res["geo"] = data.data.locations[0].country;
                    $this.current_parsed.known_cp[res.id] = res;
                },
                error: function(jqXHR, exception){
                    alert("failed CP lookup for "+res);
                }
            });
        };

        this.getCPInfo = function(resources,index) {
            if(index<resources.length){
                var res = resources[index];
                var r_id = res.id;
                if(!this.current_parsed.known_cp[r_id])
                    this.CPInfoCallBack(res);
                index++;
                this.getCPInfo(resources, index);
            }
            else{
                env.guiManager.cp_info_done = true;
                env.logger.log("=== RipeBroker CPinfo Completed");
            }
        };

        this.ASNInfoCallBack = function(res) {
            var url_asn = "https://stat.ripe.net/data/as-overview/data.json?resource=AS" + res;
            $.ajax({
                url: url_asn,
                dataType: "json",
                success: function(data){
                    $this.current_parsed.known_asn[res] = data.data.holder;
                },
                error: function(jqXHR, exception){
                    alert("failed ASN lookup for "+res);
                }
            });
        };

        this.getASNInfo = function(resources,index) {
            if(index<resources.length){
                var res = resources[index]
                if(!this.current_parsed.known_asn[res] && !isNaN(parseInt(res)))
                    this.ASNInfoCallBack(res);
                index++;
                this.getASNInfo(resources, index);
            }
            else{
                env.guiManager.asn_info_done = true;
                env.logger.log("=== RipeBroker ASNinfo Completed");
            }
        };

        this.brush = function(events_range){
            this.loadCurrentState(null,events_range,false);
        };

        this.loadCurrentState = function(store, events_range, redraw_minimap) {
            console.log("update");
            env.guiManager.ip_version_checkbox_enabler();
            env.guiManager.restoreQuery();
            var ordering;
            if(env.guiManager.gather_information){
                env.logger.log("=== RipeBroker Starting gathering CP Info");
                env.guiManager.cp_info_done = false;
                setTimeout(function(){
                    $this.getCPInfo($this.current_parsed.resources,0)
                },0);
                env.logger.log("=== RipeBroker Starting gathering ASN Info");
                setTimeout(function(){
                    env.guiManager.asn_info_done = false;
                    if(env.guiManager.graph_type == "stream")
                        $this.getASNInfo($this.current_parsed.asn_set,0);
                    else
                    if(env.guiManager.graph_type == "heat")
                        $this.getASNInfo(env.guiManager.drawer.asn_set,0);
                },0);
            }
            /*COMMON*/

            this.current_asn_tsv = this.parser.convert_to_streamgraph_tsv(this.current_parsed, env.guiManager.prepending_prevention, env.guiManager.asn_level, env.guiManager.ip_version);
            this.parser.states_cp(this.current_parsed,env.guiManager.asn_level,env.guiManager.prepending_prevention);
            this.parser.cp_composition(this.current_parsed);
            this.parser.cp_seqs(this.current_parsed);
            this.parser.asn_exchanges(this.current_parsed);
            this.current_visibility = 0;
            if(env.guiManager.global_visibility) {
                for(var t in this.current_parsed.targets){
                    var tgs = this.current_parsed.targets[t];
                    if(env.guiManager.ip_version.indexOf(4) != -1 && env.guiManager.validator.check_ipv4(tgs)){
                        env.logger.log("== RipeBroker adding ipv4 peerings");
                        this.current_visibility+=this.ipv4_peerings;
                    }
                    if(env.guiManager.ip_version.indexOf(6) != -1 && env.guiManager.validator.check_ipv6(tgs)){
                        env.logger.log("== RipeBroker adding ipv6 peerings");
                        this.current_visibility+=this.ipv6_peerings;
                    }
                }
            }
            else
                this.current_visibility = this.current_parsed.local_visibility;
            //STREAM
            if(env.guiManager.graph_type == "stream") {
                //ORDERING
                ordering = this.heuristicsManager.getCurrentOrdering(this.current_parsed, env.guiManager.graph_type);
                if(!ordering) {
                    ordering = this.current_parsed.asn_set;
                }
                env.guiManager.update_counters(".counter_asn", this.current_parsed.asn_set.length);
                env.guiManager.update_counters(".counter_events", this.current_parsed.events.length);

                env.guiManager.drawer.draw_streamgraph(
                    this.current_parsed,
                    env.guiManager.graph_type,
                    this.current_asn_tsv,
                    ordering,
                    env.guiManager.preserve_map,
                    this.current_visibility,
                    this.current_parsed.targets,
                    this.current_parsed.query_id,
                    $this.gotToBgplayFromPosition,
                    null,
                    events_range,
                    redraw_minimap);
                this.heuristicsManager.MetricsManager.metrics(this.current_parsed, env.guiManager.drawer.keys);
                env.guiManager.isGraphPresent();

            } else if(env.guiManager.graph_type == "heat") { // HEAT

                this.current_cp_tsv = this.parser.convert_to_heatmap_tsv(this.current_parsed, env.guiManager.prepending_prevention, env.guiManager.asn_level, env.guiManager.ip_version);
                //ORDERING
                ordering = this.heuristicsManager.getCurrentOrdering(this.current_parsed, env.guiManager.graph_type);
                if (!ordering) {
                    env.logger.log("ordering non c'è");
                    ordering = this.current_parsed.cp_set;
                } else {
                    env.logger.log("ordering c'è");
                }
                env.guiManager.drawer.draw_heatmap(
                    this.current_parsed,
                    this.current_cp_tsv,
                    this.current_asn_tsv,
                    ordering,
                    env.guiManager.preserve_map,
                    this.current_visibility,
                    this.current_parsed.targets,
                    this.current_parsed.query_id,
                    $this.gotToBgplayFromPosition,
                    env.guiManager.asn_level,
                    env.guiManager.ip_version,
                    env.guiManager.prepending_prevention,
                    env.guiManager.merge_cp,
                    env.guiManager.merge_events,
                    env.guiManager.events_labels,
                    env.guiManager.cp_labels,
                    env.guiManager.heatmap_time_map,
                    events_range,
                    redraw_minimap);
                if (env.guiManager.merge_events) {
                    env.guiManager.update_counters(".counter_events", env.guiManager.drawer.event_set.length + "/" + this.current_parsed.events.length);
                } else {
                    env.guiManager.update_counters(".counter_events", this.current_parsed.events.length);
                }
                if(env.guiManager.merge_cp)
                    env.guiManager.update_counters(".counter_asn", env.guiManager.drawer.keys.length+"/"+this.current_parsed.cp_set.length);
                else
                    env.guiManager.update_counters(".counter_asn", env.guiManager.drawer.keys.length);
            }
            else {
                alert("nè heat nè stream, problema!");
                env.guiManager.drawer.drawer_init();
            }
            env.guiManager.boolean_checker();
            env.guiManager.draw_functions_btn_enabler();
        };

        this.go_to_bgplay = function(start, end, targets, pos){

            var url = "https://stat.ripe.net/widget/bgplay#";
            url+="w.resource="+targets;
            url+="&w.starttime="+start;
            url+="&w.endtime="+end;
            url+="&w.instant="+this.dateConverter.formatUnix(pos);
            url+="&w.type=bgp";
            env.logger.log("con utc"+moment(pos).utc().unix(pos));
            env.logger.log("senza utc"+moment(pos).unix(pos));
            env.logger.log("GO TO BGPLAY AT "+url);
            return window.open(url,'_blank');
        };

        this.streamgraph_streaming = function(every) {
            var interval_id = setInterval(function (){
                // var date = moment(new Date());
                // var formatted = $this.DateConverter.formatRipe(date);
                $this.getData();
                env.logger.log("Streaming got new data!");
            }, every);
            env.logger.log("Streaming started with interval ID: "+interval_id);
            return interval_id;
        };

        this.streamgraph_stepped_view = function(every) {
            var max = this.current_asn_tsv.split("\n").length-1;
            var i = 2;
            var interval_id = setInterval(function (){
                if(i>max){
                    clearInterval(interval_id);
                    env.guiManager.steps = false;
                    env.guiManager.draw_functions_btn_enabler();
                }
                else {
                    core(i);
                    i+=1;
                }
            },every);
            env.logger.log("Step view started with interval ID: "+interval_id);

            function core(i) {
                env.guiManager.drawer.draw_streamgraph($this.current_parsed, env.guiManager.graph_type, $this.current_asn_tsv, env.guiManager.drawer.keys, env.guiManager.preserve_map, $this.current_visibility, $this.current_parsed.targets, $this.current_parsed.query_id, $this.gotToBgplayFromPosition, i, null, false);
                env.guiManager.update_counters(".counter_asn", $this.current_parsed.asn_set.length);
                env.guiManager.update_counters(".counter_events", i + "/" + max);
            }
        };

        this.gotToBgplayFromPosition = function(pos){
            return $this.go_to_bgplay(env.queryParams.startDate, env.queryParams.stopDate, env.queryParams.targets, pos);
        };
    };

    return RipeDataBroker;
});
define('bgpst.view.scroller',[
    /*contiene dei DOM element dinamici cercati su root del DOM*/
], function(){

    /**
     *
     * Created by Borbás Geri on 12/17/13
     * Copyright (c) 2013 eppz! development, LLC.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
     * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     *
     */

    var EPPZScrollTo = function(){

    };

    /**
    * Helpers.
    */
    EPPZScrollTo.prototype.documentVerticalScrollPosition = function() {
        if (self.pageYOffset) 
            return self.pageYOffset; // Firefox, Chrome, Opera, Safari.
        if (document.documentElement && document.documentElement.scrollTop) 
            return document.documentElement.scrollTop; // Internet Explorer 6 (standards mode).
        if (document.body.scrollTop)
             return document.body.scrollTop; // Internet Explorer 6, 7 and 8.
        return 0; // None of the above.
    };

    EPPZScrollTo.prototype.viewportHeight=function() {
        return (document.compatMode === "CSS1Compat") ? document.documentElement.clientHeight : document.body.clientHeight; 
    };

    EPPZScrollTo.prototype.documentHeight = function() {
        return (document.height !== undefined) ? document.height : document.body.offsetHeight;
    };

    EPPZScrollTo.prototype.documentMaximumScrollPosition = function() {
        return this.documentHeight() - this.viewportHeight();
    };

    EPPZScrollTo.prototype.elementVerticalClientPositionById= function(id) {
        var element = document.getElementById(id);
        var rectangle = element.getBoundingClientRect();
        return rectangle.top;
    };

    /**
    * Animation tick.
    */
    EPPZScrollTo.prototype.scrollVerticalTickToPosition = function(currentPosition, targetPosition) {
        var filter = 0.2;
        var fps = 60;
        var difference = parseFloat(targetPosition) - parseFloat(currentPosition);
        // Snap, then stop if arrived.
        var arrived = (Math.abs(difference) <= 0.5);
        if (arrived) {
            // Apply target.
            scrollTo(0.0, targetPosition);
            return;
        }
        // Filtered position.
        currentPosition = (parseFloat(currentPosition) * (1.0 - filter)) + (parseFloat(targetPosition) * filter);
        // Apply target.
        scrollTo(0.0, Math.round(currentPosition));
        // Schedule next tick.
        setTimeout("EPPZScrollTo.scrollVerticalTickToPosition("+currentPosition+", "+targetPosition+")", (1000 / fps));
    };

    /**
    * For public use.
    *
    * @param id The id of the element to scroll to.
    * @param padding Top padding to apply above element.
    */
    EPPZScrollTo.prototype.scrollVerticalToElementById= function(id, padding) {
        var element = document.getElementById(id);
        if (element == null) {
            console.warn('Cannot find element with id \''+id+'\'.');
            return;
        }
        var targetPosition = this.documentVerticalScrollPosition() + this.elementVerticalClientPositionById(id) - padding;
        var currentPosition = this.documentVerticalScrollPosition();
        // Clamp.
        var maximumScrollPosition = this.documentMaximumScrollPosition();
        if (targetPosition > maximumScrollPosition) 
            targetPosition = maximumScrollPosition;
        // Start animation.
        this.scrollVerticalTickToPosition(currentPosition, targetPosition);
    };

    EPPZScrollTo.prototype.elementVerticalClientPositionByClass= function(clas) {
        var element = document.getElementsByClassName(clas)[0];
        var rectangle = element.getBoundingClientRect();
        return rectangle.top;
    };

    EPPZScrollTo.prototype.scrollVerticalToElementByClass= function(clas, padding) {
        var element = document.getElementsByClassName(clas)[0];
        if (element == null) {
            console.warn('Cannot find element with class \''+clas+'\'.');
            return;
        }
        var targetPosition = this.documentVerticalScrollPosition() + this.elementVerticalClientPositionByClass(clas) - padding;
        var currentPosition = this.documentVerticalScrollPosition();
        // Clamp.
        var maximumScrollPosition = this.documentMaximumScrollPosition();
        if (targetPosition > maximumScrollPosition) 
            targetPosition = maximumScrollPosition;
        // Start animation.
        this.scrollVerticalTickToPosition(currentPosition, targetPosition);
    };

    return EPPZScrollTo;
});
define('bgpst.lib.text',{});
/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */

/*global define: false Mustache: true*/
define.amd = true;
(function defineMustache (global, factory) {
    if (typeof exports === 'object' && exports && typeof exports.nodeName !== 'string') {
        factory(exports); // CommonJS
    } else if (typeof define === 'function' && define.amd) {
        define('bgpst.lib.mustache',['exports'], factory); // AMD
    } else {
        global.Mustache = {};
        factory(global.Mustache); // script, wsh, asp
    }
}(this, function mustacheFactory (mustache) {

    var objectToString = Object.prototype.toString;
    var isArray = Array.isArray || function isArrayPolyfill (object) {
            return objectToString.call(object) === '[object Array]';
        };

    function isFunction (object) {
        return typeof object === 'function';
    }

    /**
     * More correct typeof string handling array
     * which normally returns typeof 'object'
     */
    function typeStr (obj) {
        return isArray(obj) ? 'array' : typeof obj;
    }

    function escapeRegExp (string) {
        return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
    }

    /**
     * Null safe way of checking whether or not an object,
     * including its prototype, has a given property
     */
    function hasProperty (obj, propName) {
        return obj != null && typeof obj === 'object' && (propName in obj);
    }

    // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
    // See https://github.com/janl/mustache.js/issues/189
    var regExpTest = RegExp.prototype.test;
    function testRegExp (re, string) {
        return regExpTest.call(re, string);
    }

    var nonSpaceRe = /\S/;
    function isWhitespace (string) {
        return !testRegExp(nonSpaceRe, string);
    }

    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    function escapeHtml (string) {
        return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
            return entityMap[s];
        });
    }

    var whiteRe = /\s*/;
    var spaceRe = /\s+/;
    var equalsRe = /\s*=/;
    var curlyRe = /\s*\}/;
    var tagRe = /#|\^|\/|>|\{|&|=|!/;

    /**
     * Breaks up the given `template` string into a tree of tokens. If the `tags`
     * argument is given here it must be an array with two string values: the
     * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
     * course, the default is to use mustaches (i.e. mustache.tags).
     *
     * A token is an array with at least 4 elements. The first element is the
     * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
     * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
     * all text that appears outside a symbol this element is "text".
     *
     * The second element of a token is its "value". For mustache tags this is
     * whatever else was inside the tag besides the opening symbol. For text tokens
     * this is the text itself.
     *
     * The third and fourth elements of the token are the start and end indices,
     * respectively, of the token in the original template.
     *
     * Tokens that are the root node of a subtree contain two more elements: 1) an
     * array of tokens in the subtree and 2) the index in the original template at
     * which the closing tag for that section begins.
     */
    function parseTemplate (template, tags) {
        if (!template)
            return [];

        var sections = [];     // Stack to hold section tokens
        var tokens = [];       // Buffer to hold the tokens
        var spaces = [];       // Indices of whitespace tokens on the current line
        var hasTag = false;    // Is there a {{tag}} on the current line?
        var nonSpace = false;  // Is there a non-space char on the current line?

        // Strips all whitespace tokens array for the current line
        // if there was a {{#tag}} on it and otherwise only space.
        function stripSpace () {
            if (hasTag && !nonSpace) {
                while (spaces.length)
                    delete tokens[spaces.pop()];
            } else {
                spaces = [];
            }

            hasTag = false;
            nonSpace = false;
        }

        var openingTagRe, closingTagRe, closingCurlyRe;
        function compileTags (tagsToCompile) {
            if (typeof tagsToCompile === 'string')
                tagsToCompile = tagsToCompile.split(spaceRe, 2);

            if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
                throw new Error('Invalid tags: ' + tagsToCompile);

            openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
            closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
            closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
        }

        compileTags(tags || mustache.tags);

        var scanner = new Scanner(template);

        var start, type, value, chr, token, openSection;
        while (!scanner.eos()) {
            start = scanner.pos;

            // Match any text between tags.
            value = scanner.scanUntil(openingTagRe);

            if (value) {
                for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
                    chr = value.charAt(i);

                    if (isWhitespace(chr)) {
                        spaces.push(tokens.length);
                    } else {
                        nonSpace = true;
                    }

                    tokens.push([ 'text', chr, start, start + 1 ]);
                    start += 1;

                    // Check for whitespace on the current line.
                    if (chr === '\n')
                        stripSpace();
                }
            }

            // Match the opening tag.
            if (!scanner.scan(openingTagRe))
                break;

            hasTag = true;

            // Get the tag type.
            type = scanner.scan(tagRe) || 'name';
            scanner.scan(whiteRe);

            // Get the tag value.
            if (type === '=') {
                value = scanner.scanUntil(equalsRe);
                scanner.scan(equalsRe);
                scanner.scanUntil(closingTagRe);
            } else if (type === '{') {
                value = scanner.scanUntil(closingCurlyRe);
                scanner.scan(curlyRe);
                scanner.scanUntil(closingTagRe);
                type = '&';
            } else {
                value = scanner.scanUntil(closingTagRe);
            }

            // Match the closing tag.
            if (!scanner.scan(closingTagRe))
                throw new Error('Unclosed tag at ' + scanner.pos);

            token = [ type, value, start, scanner.pos ];
            tokens.push(token);

            if (type === '#' || type === '^') {
                sections.push(token);
            } else if (type === '/') {
                // Check section nesting.
                openSection = sections.pop();

                if (!openSection)
                    throw new Error('Unopened section "' + value + '" at ' + start);

                if (openSection[1] !== value)
                    throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
            } else if (type === 'name' || type === '{' || type === '&') {
                nonSpace = true;
            } else if (type === '=') {
                // Set the tags for the next time around.
                compileTags(value);
            }
        }

        // Make sure there are no open sections when we're done.
        openSection = sections.pop();

        if (openSection)
            throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

        return nestTokens(squashTokens(tokens));
    }

    /**
     * Combines the values of consecutive text tokens in the given `tokens` array
     * to a single token.
     */
    function squashTokens (tokens) {
        var squashedTokens = [];

        var token, lastToken;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];

            if (token) {
                if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
                    lastToken[1] += token[1];
                    lastToken[3] = token[3];
                } else {
                    squashedTokens.push(token);
                    lastToken = token;
                }
            }
        }

        return squashedTokens;
    }

    /**
     * Forms the given array of `tokens` into a nested tree structure where
     * tokens that represent a section have two additional items: 1) an array of
     * all tokens that appear in that section and 2) the index in the original
     * template that represents the end of that section.
     */
    function nestTokens (tokens) {
        var nestedTokens = [];
        var collector = nestedTokens;
        var sections = [];

        var token, section;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            token = tokens[i];

            switch (token[0]) {
                case '#':
                case '^':
                    collector.push(token);
                    sections.push(token);
                    collector = token[4] = [];
                    break;
                case '/':
                    section = sections.pop();
                    section[5] = token[2];
                    collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
                    break;
                default:
                    collector.push(token);
            }
        }

        return nestedTokens;
    }

    /**
     * A simple string scanner that is used by the template parser to find
     * tokens in template strings.
     */
    function Scanner (string) {
        this.string = string;
        this.tail = string;
        this.pos = 0;
    }

    /**
     * Returns `true` if the tail is empty (end of string).
     */
    Scanner.prototype.eos = function eos () {
        return this.tail === '';
    };

    /**
     * Tries to match the given regular expression at the current position.
     * Returns the matched text if it can match, the empty string otherwise.
     */
    Scanner.prototype.scan = function scan (re) {
        var match = this.tail.match(re);

        if (!match || match.index !== 0)
            return '';

        var string = match[0];

        this.tail = this.tail.substring(string.length);
        this.pos += string.length;

        return string;
    };

    /**
     * Skips all text until the given regular expression can be matched. Returns
     * the skipped string, which is the entire tail if no match can be made.
     */
    Scanner.prototype.scanUntil = function scanUntil (re) {
        var index = this.tail.search(re), match;

        switch (index) {
            case -1:
                match = this.tail;
                this.tail = '';
                break;
            case 0:
                match = '';
                break;
            default:
                match = this.tail.substring(0, index);
                this.tail = this.tail.substring(index);
        }

        this.pos += match.length;

        return match;
    };

    /**
     * Represents a rendering context by wrapping a view object and
     * maintaining a reference to the parent context.
     */
    function Context (view, parentContext) {
        this.view = view;
        this.cache = { '.': this.view };
        this.parent = parentContext;
    }

    /**
     * Creates a new context using the given view with this context
     * as the parent.
     */
    Context.prototype.push = function push (view) {
        return new Context(view, this);
    };

    /**
     * Returns the value of the given name in this context, traversing
     * up the context hierarchy if the value is absent in this context's view.
     */
    Context.prototype.lookup = function lookup (name) {
        var cache = this.cache;

        var value;
        if (cache.hasOwnProperty(name)) {
            value = cache[name];
        } else {
            var context = this, names, index, lookupHit = false;

            while (context) {
                if (name.indexOf('.') > 0) {
                    value = context.view;
                    names = name.split('.');
                    index = 0;

                    /**
                     * Using the dot notion path in `name`, we descend through the
                     * nested objects.
                     *
                     * To be certain that the lookup has been successful, we have to
                     * check if the last object in the path actually has the property
                     * we are looking for. We store the result in `lookupHit`.
                     *
                     * This is specially necessary for when the value has been set to
                     * `undefined` and we want to avoid looking up parent contexts.
                     **/
                    while (value != null && index < names.length) {
                        if (index === names.length - 1)
                            lookupHit = hasProperty(value, names[index]);

                        value = value[names[index++]];
                    }
                } else {
                    value = context.view[name];
                    lookupHit = hasProperty(context.view, name);
                }

                if (lookupHit)
                    break;

                context = context.parent;
            }

            cache[name] = value;
        }

        if (isFunction(value))
            value = value.call(this.view);

        return value;
    };

    /**
     * A Writer knows how to take a stream of tokens and render them to a
     * string, given a context. It also maintains a cache of templates to
     * avoid the need to parse the same template twice.
     */
    function Writer () {
        this.cache = {};
    }

    /**
     * Clears all cached templates in this writer.
     */
    Writer.prototype.clearCache = function clearCache () {
        this.cache = {};
    };

    /**
     * Parses and caches the given `template` and returns the array of tokens
     * that is generated from the parse.
     */
    Writer.prototype.parse = function parse (template, tags) {
        var cache = this.cache;
        var tokens = cache[template];

        if (tokens == null)
            tokens = cache[template] = parseTemplate(template, tags);

        return tokens;
    };

    /**
     * High-level method that is used to render the given `template` with
     * the given `view`.
     *
     * The optional `partials` argument may be an object that contains the
     * names and templates of partials that are used in the template. It may
     * also be a function that is used to load partial templates on the fly
     * that takes a single argument: the name of the partial.
     */
    Writer.prototype.render = function render (template, view, partials) {
        var tokens = this.parse(template);
        var context = (view instanceof Context) ? view : new Context(view);
        return this.renderTokens(tokens, context, partials, template);
    };

    /**
     * Low-level method that renders the given array of `tokens` using
     * the given `context` and `partials`.
     *
     * Note: The `originalTemplate` is only ever used to extract the portion
     * of the original template that was contained in a higher-order section.
     * If the template doesn't use higher-order sections, this argument may
     * be omitted.
     */
    Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate) {
        var buffer = '';

        var token, symbol, value;
        for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
            value = undefined;
            token = tokens[i];
            symbol = token[0];

            if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate);
            else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate);
            else if (symbol === '>') value = this.renderPartial(token, context, partials, originalTemplate);
            else if (symbol === '&') value = this.unescapedValue(token, context);
            else if (symbol === 'name') value = this.escapedValue(token, context);
            else if (symbol === 'text') value = this.rawValue(token);

            if (value !== undefined)
                buffer += value;
        }

        return buffer;
    };

    Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate) {
        var self = this;
        var buffer = '';
        var value = context.lookup(token[1]);

        // This function is used to render an arbitrary template
        // in the current context by higher-order sections.
        function subRender (template) {
            return self.render(template, context, partials);
        }

        if (!value) return;

        if (isArray(value)) {
            for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
                buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate);
            }
        } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
            buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate);
        } else if (isFunction(value)) {
            if (typeof originalTemplate !== 'string')
                throw new Error('Cannot use higher-order sections without the original template');

            // Extract the portion of the original template that the section contains.
            value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

            if (value != null)
                buffer += value;
        } else {
            buffer += this.renderTokens(token[4], context, partials, originalTemplate);
        }
        return buffer;
    };

    Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate) {
        var value = context.lookup(token[1]);

        // Use JavaScript's definition of falsy. Include empty arrays.
        // See https://github.com/janl/mustache.js/issues/186
        if (!value || (isArray(value) && value.length === 0))
            return this.renderTokens(token[4], context, partials, originalTemplate);
    };

    Writer.prototype.renderPartial = function renderPartial (token, context, partials) {
        if (!partials) return;

        var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
        if (value != null)
            return this.renderTokens(this.parse(value), context, partials, value);
    };

    Writer.prototype.unescapedValue = function unescapedValue (token, context) {
        var value = context.lookup(token[1]);
        if (value != null)
            return value;
    };

    Writer.prototype.escapedValue = function escapedValue (token, context) {
        var value = context.lookup(token[1]);
        if (value != null)
            return mustache.escape(value);
    };

    Writer.prototype.rawValue = function rawValue (token) {
        return token[1];
    };

    mustache.name = 'mustache.js';
    mustache.version = '2.2.1';
    mustache.tags = [ '{{', '}}' ];

    // All high-level mustache.* functions use this writer.
    var defaultWriter = new Writer();

    /**
     * Clears all cached templates in the default writer.
     */
    mustache.clearCache = function clearCache () {
        return defaultWriter.clearCache();
    };

    /**
     * Parses and caches the given template in the default writer and returns the
     * array of tokens it contains. Doing this ahead of time avoids the need to
     * parse templates on the fly as they are rendered.
     */
    mustache.parse = function parse (template, tags) {
        return defaultWriter.parse(template, tags);
    };

    /**
     * Renders the `template` with the given `view` and `partials` using the
     * default writer.
     */
    mustache.render = function render (template, view, partials) {
        if (typeof template !== 'string') {
            throw new TypeError('Invalid template! Template should be a "string" ' +
                'but "' + typeStr(template) + '" was given as the first ' +
                'argument for mustache#render(template, view, partials)');
        }

        return defaultWriter.render(template, view, partials);
    };

    // This is here for backwards compatibility with 0.4.x.,
    /*eslint-disable */ // eslint wants camel cased function name
    mustache.to_html = function to_html (template, view, partials, send) {
        /*eslint-enable*/

        var result = mustache.render(template, view, partials);

        if (isFunction(send)) {
            send(result);
        } else {
            return result;
        }
    };

    // Export the escaping function so that the user may override it.
    // See https://github.com/janl/mustache.js/issues/244
    mustache.escape = escapeHtml;

    // Export these mainly for testing, but also for advanced usage.
    mustache.Scanner = Scanner;
    mustache.Context = Context;
    mustache.Writer = Writer;

}));
define('bgpst.lib.stache',{load: function(id){throw new Error("Dynamic load not allowed: " + id);}});

define('bgpst.lib.stache!main', ['bgpst.lib.mustache'], function (Mustache) { var template = '<div class="bgpst-container">\n\n    <div class="modal fade time-modal">\n        <div class="modal-dialog" role="document">\n            <div class="modal-content">\n                <div class="modal-header">\n                    <h5 class="modal-title">Select Time range</h5>\n                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                        <span aria-hidden="true">&times;</span>\n                    </button>\n                </div>\n                <div class="modal-body">\n                    Start: <input size="14" type="text" readonly class="start-date">\n                    Stop: <input size="14" type="text" readonly class="stop-date">\n                    <button type="button" class="btn btn-default btn-xs apply-time">Ok</button>\n                </div>\n                <div class="modal-footer">\n                    <button type="button" class="btn btn-primary">Ok</button>\n                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>\n                </div>\n            </div>\n        </div>\n    </div>\n\n\n    <div class="bgpst-header">\n        <button type="button" class="btn btn-primary time-modal-button" data-toggle="modal" data-target="#exampleModal">\n            Time\n        </button>\n\n        <div class="btn-group steps_btn stream_option" data-toggle="buttons" style="margin-left: 30px;">\n            <label class="btn btn-default btn-xs">\n                <input type="checkbox" name="steps" value="steps" autocomplete="off">\n                <span class="glyphicon glyphicon-step-forward" aria-hidden="true"></span>\n                Steps\n            </label>\n        </div>\n        <div class="btn-group streaming_btn stream_option" data-toggle="buttons">\n            <label class="btn btn-default btn-xs">\n                <input type="checkbox" name="streaming" value="streaming" autocomplete="off">\n                <span class="glyphicon glyphicon-record" aria-hidden="true"></span>\n                Streaming\n            </label>\n        </div>\n        <div class="btn-group ip_version" data-toggle="buttons">\n            <label class="btn btn-default btn-xs">\n                <input type="checkbox" name="ip_version" value="4" autocomplete="off">\n                IPv4\n            </label>\n            <label class="btn btn-default btn-xs">\n                <input type="checkbox" name="ip_version" value="6" autocomplete="off">\n                IPv6\n            </label>\n        </div>\n        <div class="btn-group graph_type" data-toggle="buttons">\n            <label class="btn btn-default btn-xs">\n                <input type="radio" name="graph_type" value="stream" autocomplete="off">\n                Global\n            </label>\n            <label class="btn btn-default btn-xs">\n                <input type="radio" name="graph_type" value="heat" autocomplete="off">\n                Local\n            </label>\n        </div>\n        <span class="dropdown">\n            <button type="button" class="btn-group btn-xs dropdown-toggle option_command_btn btn btn-default text_centerd" data-toggle="dropdown">\n                <span class="glyphicon glyphicon-wrench" aria-hidden="true"></span>\n            </button>\n            <ul class="dropdown-menu dropdown-menu-right repositioned">\n                <!--<li><a href="#" class="draw_last_data_btn">Draw Last Data</a></li>\n                <li><a href="#" class="erase_graph_btn">Erase Graph</a></li>\n                <li>\n                    <a href="#" class="preserve_color_btn">\n                        Preserve Color Map\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                <li>\n                    <a href="#" class="gather_information_btn">\n                        Gather Information (CP Geo, ASN Detail)\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                <li>\n                    <a href="#" class="localstorage_enabled_btn">\n                        Enable Local Storage\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li> -->\n\n                <!-- SHARED OPTIONS -->\n                <li>\n                    <a href="#" class="prepending_prevention_btn">\n                        AS-Path Anti-Prepending\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                <li style="display: inline-flex;">\n                    <a href="#" class="asn_lvl_btn" onclick="event.preventDefault(); event.stopPropagation(); $(this).siblings().find(\'input\').focus();">\n                        Upstream Level (AS-path hop)\n\n                    </a>\n                    <input type="number" name="asn_lvl" min="0" max="50"\n                           style="width: 60px; float: right; height: 25px; text-align: center;" class="asn_lvl form-control jquery_ui_spinner">\n                </li>\n\n                <!-- STREAMGRAPH OPTIONS -->\n                <li class="stream_option">\n                    <a href="#" class="global_visibility_btn">\n                        Global visibility (All CPs)\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                \n                <!-- HEATMAP OPTIONS -->\n                <li class="heat_option">\n                    <a href="#" class="merge_cp_btn">\n                        Merge CPs with same paths\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                <li class="heat_option" style="display: inline-flex;">\n                    <a href="#" class="merge_events_btn" onclick="event.preventDefault(); event.stopPropagation(); $(this).siblings().find(\'input\').focus();">\n                        Merge events with same routing\n\n                    </a>\n                    <input type="number" name="merge_events" min="0" max="500"\n                           style="width: 60px; float: right; height: 25px; text-align: center;" class="merge_events form-control jquery_ui_spinner">\n                </li>\n                <li class="heat_option">\n                    <a href="#" class="events_labels_btn">\n                        Events labels\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                <li class="heat_option">\n                    <a href="#" class="cp_labels_btn">\n                        CP labels\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n                <li class="heat_option">\n                    <a href="#" class="heatmap_time_btn">\n                        Use time mapping\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n            </ul>\n        </span>\n        <!-- <span class="dropdown">\n            <button type="button" class="btn-group btn-xs dropdown-toggle path_btn btn btn-default text_centerd" data-toggle="dropdown">\n                <span class="glyphicon glyphicon-pencil" aria-hidden="true"></span>\n            </button>\n            <ul class="dropdown-menu dropdown-menu-right repositioned">\n                <li>\n                    <a href="#" class="draw_path_btn">Draw Path</a>\n                </li>\n\n                <li class="heat_option">\n                    <a href="#" class="scrollbars_btn">\n                        Use scrollbars\n                        <span class="glyphicon glyphicon-ok" aria-hidden="true"></span>\n                    </a>\n                </li>\n            </ul>\n        </span> -->\n        <span class="dropdown">\n            <button type="button" class="btn-xs btn-group dropdown-toggle list_btn btn btn-default text_centerd" data-toggle="dropdown">\n                <span class="glyphicon glyphicon-modal-window" aria-hidden="true"></span>\n            </button>\n            <ul class="dropdown-menu dropdown-menu-right multi-level repositioned" role="menu">\n               <li class="dropdown-submenu right_arrows">\n                <a tabindex="-1" href="#" class="asn_list_btn">AS List</a>\n                <ul class="dropdown-menu dropdown-menu-right no_top_padding asn_list"></ul>\n            </li>\n            <li class="dropdown-submenu right_arrows">\n                <a tabindex="-1" href="#" class="cp_list_btn">CP List</a>\n                <ul class="dropdown-menu dropdown-menu-right no_top_padding cp_list"></ul>\n            </li>\n        </ul>\n    </span>\n        <span class="dropdown">\n            <button type="button" class="btn-xs btn-group dropdown-toggle sort_btn btn btn-default text_centerd" data-toggle="dropdown">\n                <span class="glyphicon glyphicon-option-horizontal" aria-hidden="true"></span>\n            </button>\n            <ul class="dropdown-menu dropdown-menu-right repositioned">\n                <li ><a href="#" class="shuffle_color_map_btn">Shuffle Color Map</a></li>\n                <li class="divider stream_option"></li>\n\n                <!-- STREAMGRAPH OPTIONS -->\n                <li class="stream_option"><a href="#" class="exchange_greedy_sort_btn">Ordering by Near Flows</a></li>\n                <li class="stream_option"><a href="#" class="point_dist_greedy_btn">Ordering by STDEV Swap</a></li>\n                <li class="stream_option"><a href="#" class="wiggle_max_btn">Ordering by Wiggle Swap (Min Max)</a></li>\n                <li class="stream_option"><a href="#" class="wiggle_sum_btn">Ordering by Wiggle Swap (Min Sum )</a></li>\n                <li class="divider stream_option"></li>\n                <li class="stream_option"><a href="#" class="sort_asn_ascstdev_btn">Sort By Frequency STD Dev (ASC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_dscstdev_btn">Sort By Frequency STD Dev (DSC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_ascvar_btn">Sort By Frequency Variance (ASC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_dscvar_btn">Sort By Frequency Variance (DSC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_ascavg_btn">Sort By Frequency Avg (ASC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_dscavg_btn">Sort By Frequency Avg (DSC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_ascsum_btn">Sort By Frequency Sum (ASC)</a></li>\n                <li class="stream_option"><a href="#" class="sort_asn_dscsum_btn">Sort By Frequency Sum (DSC)</a></li>\n                <!-- <li class="divider stream_option"></li>\n                <li class="stream_option"><a href="#" class="lev_dist_randwalk_cum_btn">Ordering by Levensthein Cum Dist Rand.Walk</a></li>\n                <li class="stream_option"><a href="#" class="lev_dist_randwalk_max_btn">Ordering by Levensthein Max Dist Rand.Walk</a></li>\n                <li class="stream_option"><a href="#" class="point_dist_by_randwalk_btn">Ordering by STDEV Rand.Walk</a></li>\n                <li class="not-active disabled stream_option"><a href="#" class="point_dist_by_inference_btn">Ordering by STDEV Inference</a></li> -->\n                \n                <!-- HEATMAP OPTIONS -->\n                <li class="heat_option"><a href="#" class="heat_stdev_sort_btn">Ordering by StdDev </a></li>\n                <li class="heat_option"><a href="#" class="heat_greedy_sort_1_btn">Ordering by Exchanges Greedy (Level) </a></li>\n                <li class="heat_option"><a href="#" class="heat_greedy_sort_2_btn">Ordering by Exchanges Greedy (Level + Changes) </a></li>\n                <li class="heat_option"><a href="#" class="heat_as_sort">Sort By Collector Peer AS</a></li>\n                <li class="heat_option"><a href="#" class="heat_country_sort">Sort By Collector Peer Country </a></li>\n            </ul>\n        </span>\n    </div>\n\n    <div class="svg_tooltip hidden"></div>\n    <div class="canvas_container main_svg">\n        <svg></svg>\n    </div>\n    <div class="canvas_container mini_svg">\n        <svg></svg>\n    </div>\n</div>'; Mustache.parse( template ); return function( view, partials) { return Mustache.render( template, view, partials); } });

define('bgpst.view.gui',[
    "bgpst.view.graphdrawer",
    "bgpst.controller.validator",
    "bgpst.controller.dateconverter",
    "bgpst.view.broker",
    "bgpst.view.scroller",
    "bgpst.lib.moment",
    "bgpst.lib.jquery-amd",
    "bgpst.lib.stache!main"
], function(GraphDrawer, Validator, DateConverter, RipeDataBroker, EPPZScrollTo, moment, $, template){


    //setup the whole gui interface actions, events and styles <-- TO CALL AT DOM READY
    var GuiManager = function(env) {

        /*************************************** DOM elements ************************************/
        env.parentDom.append(template());

        this.dom = {
            svg: env.parentDom.find("svg"),
            applyTime: env.parentDom.find(".apply-time"),
            container: env.parentDom.find(".bgpst-container"),
            canvasContainer: env.parentDom.find(".canvas_container"),
            mainSvg: env.parentDom.find("div.main_svg"),
            miniSvg: env.parentDom.find("div.mini_svg"),
            tooltip: env.parentDom.find("[data-toggle='tooltip']"),
			tooltipSvg: env.parentDom.find(".svg_tooltip"),

            title: env.parentDom.find(".title"),

            pathButton: env.parentDom.find(".path_btn"),
            sortButton: env.parentDom.find(".sort_btn"),

            listButton: env.parentDom.find(".list_btn"),
            asnList: env.parentDom.find(".asn_list"),
            asnListButton: env.parentDom.find(".asn_list_btn"),
            cpList: env.parentDom.find(".cp_list"),
            cpListButton: env.parentDom.find(".cp_list_btn"),

            docsButton: env.parentDom.find(".docs_btn"),
            aboutButton: env.parentDom.find(".about_btn"),
            embedButton: env.parentDom.find(".embed_btn"),

            stepsButton: env.parentDom.find(".steps_btn"),
            stepsValueButton : env.parentDom.find("input[name='steps'][value='steps']"),

            streamingButton : env.parentDom.find(".streaming_btn"),
            streamingValueButton : env.parentDom.find("input[name='streaming'][value='streaming']").parent(),


            eraseGraphButton: env.parentDom.find(".erase_graph_btn"),
            optionCommandButton: env.parentDom.find(".option_command_btn"),
            clearTargetsButton: env.parentDom.find(".clear_targets_button"),
            myIpButton: env.parentDom.find(".my_ip_button"),
            goButton: env.parentDom.find(".go_button"),
            date: env.parentDom.find(".date"),
            counter: env.parentDom.find(".counter"),
            counterAsn: env.parentDom.find(".counter_asn").parent(),

            graphType : env.parentDom.find("input[name='graph_type']"),
            graphTypeHeat : env.parentDom.find("input[name='graph_type'][value='heat']"),
            graphTypeStream : env.parentDom.find('input[name="graph_type"][value="stream"]'),

            ipVersion6Button : env.parentDom.find("input[name='ip_version'][value='6']"),
            ipVersion4Button : env.parentDom.find("input[name='ip_version'][value='4']"),
            ipVersionButton : env.parentDom.find("input[name='ip_version']"),
            ipVersionCheckedButton : env.parentDom.find("input[name='ip_version']:checked"),

            heatmapTimeButton: env.parentDom.find(".heatmap_time_btn"),
            gatherInformationButton : env.parentDom.find(".gather_information_btn"),
            preserveColorButton : env.parentDom.find(".preserve_color_btn"),
            globalVisibilityButton : env.parentDom.find(".global_visibility_btn"),
            prependingPreventionButton : env.parentDom.find(".prepending_prevention_btn"),
            mergeEventsButton : env.parentDom.find(".merge_events"),
            mergeEventsInput: env.parentDom.find("input[name='merge_events']"),
            mergeEventsInputInput: env.parentDom.find("input[name='merge_events']:input"),

            mergeCPButton : env.parentDom.find(".merge_cp_btn"),
            eventsLabelsButton : env.parentDom.find(".events_labels_btn"),
            cpLabelsButton : env.parentDom.find(".cp_labels_btn"),
            scrollbarsButton : env.parentDom.find(".scrollbars_btn"),

            asnLvlButton : env.parentDom.find(".asn_lvl"),
            asnLvlInput : env.parentDom.find("input[name='asn_lvl']"),
            asnLvlInputInput : env.parentDom.find("input[name='asn_lvl']:input"),

            heatOptionButton : env.parentDom.find(".heat_option"),
            streamOptionButton : env.parentDom.find(".stream_option"),

            //heuristics_buttons
            shuffleColorButton: env.parentDom.find(".shuffle_color_map_btn"),
            levDistRandCumButton : env.parentDom.find(".lev_dist_randwalk_cum_btn"),
            levDistRanMaxButton : env.parentDom.find(".lev_dist_randwalk_max_btn"),
            pointDistRanButton : env.parentDom.find(".point_dist_by_randwalk_btn"),
            pointDistInfButton : env.parentDom.find(".point_dist_by_inference_btn"),
            pointDistGreedyButton : env.parentDom.find(".point_dist_greedy_btn"),
            exchangeGreedyButton : env.parentDom.find(".exchange_greedy_sort_btn"),
            wiggleSumButton : env.parentDom.find(".wiggle_sum_btn"),
            wiggleMaxButton : env.parentDom.find(".wiggle_max_btn"),
            ascstdevSortButton : env.parentDom.find(".sort_asn_ascstdev_btn"),
            dscstdevSortButton : env.parentDom.find(".sort_asn_dscstdev_btn"),
            ascvarSortButton : env.parentDom.find(".sort_asn_ascvar_btn"),
            dscvarSortButton : env.parentDom.find(".sort_asn_dscvar_btn"),
            ascavgSortButton : env.parentDom.find(".sort_asn_ascavg_btn"),
            dscavgSortButton : env.parentDom.find(".sort_asn_dscavg_btn"),
            ascsumSortButton : env.parentDom.find(".sort_asn_ascsum_btn"),
            dscsumSortButton : env.parentDom.find(".sort_asn_dscsum_btn"),
            heatGreedy1SortButton : env.parentDom.find(".heat_greedy_sort_1_btn"),
            heatGreedy2SortButton : env.parentDom.find(".heat_greedy_sort_2_btn"),
            heatStdevSortButton : env.parentDom.find(".heat_stdev_sort_btn"),
            heatCountrySortButton : env.parentDom.find(".heat_country_sort"),
            heatGeoSortButton : env.parentDom.find(".heat_as_sort"),

            startDate : env.parentDom.find(".start-date"),
            stopDate : env.parentDom.find(".stop-date"),

            timeModal: env.parentDom.find(".time-modal"),
            timeModalButton: env.parentDom.find(".time-modal-button")
        };

        this.drawer = new GraphDrawer(env);
        
        this.preserve_map = true;
        this.global_visibility = true;
        this.prepending_prevention = true;
        this.asn_level = 1;
        this.ip_version = [4];
        this.graph_type = "stream";
        this.streaming = false;
        this.steps = false;
        this.merge_cp = false;
        this.merge_events = 1;
        this.events_labels = false;
        this.cp_labels = false;
        this.use_scrollbars = false;
        this.cp_info_done = false;
        this.asn_info_done = false;
        this.gather_information = true;
        this.heatmap_time_map = true;
        this.streaming_speed = 10000;
        var $this = this;


        this.init = function () {
            this.ripeDataBroker = new RipeDataBroker(env);
            this.validator = new Validator();
            this.dateConverter = new DateConverter();

            this.drawer.drawer_init();
            this.pickers_setup();
            this.other_command_button_setup();
            this.tooltip_setup();

            this.ripeDataBroker.getData();
        };

        this.checkDatetimepicker = function () {
            var start = moment($this.dom.startDate.datetimepicker("getDate"));
            var stop = moment($this.dom.stopDate.datetimepicker("getDate"));

            if (!stop.isAfter(start)) {
                $this.dom.stopDate.datetimepicker("setDate", moment.utc().toDate());
            }
        };

        this.pickers_setup = function () {

            this.dom.timeModalButton.on("mousedown", function () {
                env.logger.log("time modal open");
                $this.dom.timeModal.modal("show");
            });
            this.dom.startDate
                .datetimepicker({
                    initialDate: env.queryParams.startDate.format("YYYY-MM-DD hh:ss"),
                    format: 'yyyy-mm-dd hh:ii',
                    autoclose: true,
                    startDate: "2004-01-01 00:00",
                    endDate: moment.utc().format("YYYY-MM-DD hh:ss"),
                    container: $this.dom.container
                })
                .on('changeDate', this.checkDatetimepicker);

            this.dom.stopDate
                .datetimepicker({
                    initialDate: env.queryParams.stopDate.format("YYYY-MM-DD hh:ss"),
                    format: 'yyyy-mm-dd hh:ii',
                    autoclose: true,
                    startDate: "2004-01-01 00:00",
                    endDate: moment.utc().format("YYYY-MM-DD hh:ss"),
                    container: $this.dom.container
                })
                .on('changeDate', this.checkDatetimepicker);
        };

        this.setTimeFrameButton = function () {
            this.dom.applyTime.on("mousedown", function () {
                env.queryParams.startDate = moment($this.dom.startDate.datetimepicker("getDate"));
                env.queryParams.stopDate = moment($this.dom.stopDate.datetimepicker("getDate"));
                $this.ripeDataBroker.getData();
            });
        };

        //other_command_menu
        this.other_command_button_setup = function () {
            this.setTimeFrameButton();
            this.shuffle_color_map_btn_setup();
            this.erase_graph_btn_setup();
            this.gather_information_btn_setup();
            this.preserve_color_map_btn_setup();
            this.prepending_prevention_btn_setup();
            this.merge_events_btn_setup();
            this.merge_cp_btn_setup();
            this.events_labels_btn_setup();
            this.cp_labels_btn_setup();
            this.scrollbars_btn_setup();
            this.heatmap_time_btn_setup();
            this.global_visiblity_btn_setup();
            this.graph_type_radio_setup();
            this.ip_version_checkbox_setup();
            this.asn_level_setup();
            this.streaming_btn_setup();
            this.steps_btn_setup();
            this.asn_list_btn_setup();
            this.cp_list_btn_setup();
            /***********************************************/
            this.boolean_checker();
            /***********************************************/
            this.sort_asn_ascstdev_btn_setup();
            this.sort_asn_dscstdev_btn_setup();
            this.sort_asn_ascvar_btn_setup();
            this.sort_asn_dscvar_btn_setup();
            this.sort_asn_ascavg_btn_setup();
            this.sort_asn_dscavg_btn_setup();
            this.sort_asn_ascsum_btn_setup();
            this.sort_asn_dscsum_btn_setup();
            this.lev_dist_randwalk_cum_btn_setup();
            this.lev_dist_randwalk_max_btn_setup();
            this.point_dist_by_randwalk_btn_setup();
            this.point_dist_by_inference_btn_setup();
            this.point_dist_greedy_btn_setup();
            this.exchange_greedy_sort_btn_setup();
            this.wiggle_max_btn_setup();
            this.wiggle_sum_btn_setup();
            /**********************************************/
            this.heat_greedy_sort_1_btn_setup();
            this.heat_greedy_sort_2_btn_setup();
            this.heat_stdev_sort_btn_setup();
            this.heat_geo_sort_btn_setup();
            this.heat_asn_sort_btn_setup();
            this.draw_functions_btn_enabler();
            /**********************************************/
            this.docs_btn_setup();
            this.about_btn_setup();
            this.embed_btn_setup();
        };


        this.isGraphPresent = function (text) {
            //return d3.select("svg").select(".chart").node() != null;
            return this.drawer.isGraphPresent();
        };

        this.lock_all = function () {
            this.dom.pathButton.addClass("disabled");
            this.dom.listButton.addClass("disabled");
            this.dom.sortButton.addClass("disabled");
            this.dom.optionCommandButton.addClass("disabled");
            this.dom.clearTargetsButton.addClass("disabled");
            this.dom.myIpButton.addClass("disabled");
            this.dom.goButton.addClass("disabled");
            this.dom.date.addClass("disabled");

            this.dom.pathButton.addClass("not-active");
            this.dom.listButton.addClass("not-active");
            this.dom.sortButton.addClass("not-active");
            this.dom.optionCommandButton.addClass("not-active");
            this.dom.clearTargetsButton.addClass("not-active");
            this.dom.myIpButton.addClass("not-active");
            this.dom.goButton.addClass("not-active");
            this.dom.date.addClass("not-active");

            this.dom.graphType.parent().addClass("disabled");
            this.dom.graphType.parent().addClass("not-active");
            this.dom.graphType.parent().attr("disabled", true);

            this.dom.ipVersion6Button.addClass("disabled");
            this.dom.ipVersion6Button.addClass("not-active");
            this.dom.ipVersion6Button.attr("disabled", true);

            this.dom.ipVersion4Button.addClass("disabled");
            this.dom.ipVersion4Button.addClass("not-active");
            this.dom.ipVersion4Button.attr("disabled", true);

            this.dom.stepsValueButton.parent().addClass("disabled");
            this.dom.stepsValueButton.parent().addClass("not-active");
            this.dom.stepsValueButton.parent().attr("disabled", true);
            this.dom.stepsButton.addClass("not-active");

            if (!this.streaming) {
                this.dom.streamingValueButton.addClass("disabled");
                this.dom.streamingValueButton.addClass("not-active");
                this.dom.streamingValueButton.attr("disabled", true);
                this.dom.streamingButton.addClass("not-active");
            }
        };

        this.boolean_checker = function () {
            if (!this.gather_information) {
                this.dom.gatherInformationButton.find("span").addClass("hidden");
                this.dom.gatherInformationButton.parent().removeClass("active");
            }
            else {
                this.dom.gatherInformationButton.find("span").removeClass("hidden");
                this.dom.gatherInformationButton.parent().addClass("active");
            }

            if (!this.preserve_map) {
                this.dom.preserveColorButton.find("span").addClass("hidden");
                this.dom.preserveColorButton.parent().removeClass("active");
            }
            else {
                this.dom.preserveColorButton.find("span").removeClass("hidden");
                this.dom.preserveColorButton.parent().addClass("active");
            }

            if (!this.global_visibility) {
                this.dom.globalVisibilityButton.find("span").addClass("hidden");
                this.dom.globalVisibilityButton.parent().removeClass("active");
            }
            else {
                this.dom.globalVisibilityButton.find("span").removeClass("hidden");
                this.dom.globalVisibilityButton.parent().addClass("active");
            }

            if (!this.prepending_prevention) {
                this.dom.prependingPreventionButton.find("span").addClass("hidden");
                this.dom.prependingPreventionButton.parent().removeClass("active");
            }
            else {
                this.dom.prependingPreventionButton.find("span").removeClass("hidden");
                this.dom.prependingPreventionButton.parent().addClass("active");
            }

            if (!this.merge_cp) {
                this.dom.mergeCPButton.find("span").addClass("hidden");
                this.dom.mergeCPButton.parent().removeClass("active");
            }
            else {
                this.dom.mergeCPButton.find("span").removeClass("hidden");
                this.dom.mergeCPButton.parent().addClass("active");
            }
            if (!this.merge_events) {
                this.dom.mergeEventsButton.find("span").addClass("hidden");
                this.dom.mergeEventsButton.parent().removeClass("active");
            }
            else {
                this.dom.mergeEventsButton.find("span").removeClass("hidden");
                this.dom.mergeEventsButton.parent().addClass("active");
            }
            if (!this.events_labels) {
                this.dom.eventsLabelsButton.find("span").addClass("hidden");
                this.dom.eventsLabelsButton.parent().removeClass("active");
            }
            else {
                this.dom.eventsLabelsButton.find("span").removeClass("hidden");
                this.dom.eventsLabelsButton.parent().addClass("active");
            }

            if (!this.cp_labels) {
                this.dom.cpLabelsButton.find("span").addClass("hidden");
                this.dom.cpLabelsButton.parent().removeClass("active");
            }
            else {
                this.dom.cpLabelsButton.find("span").removeClass("hidden");
                this.dom.cpLabelsButton.parent().addClass("active");
            }

            if (!this.heatmap_time_map) {
                this.dom.heatmapTimeButton.find("span").addClass("hidden");
                this.dom.heatmapTimeButton.parent().removeClass("active");
            }
            else {
                this.dom.heatmapTimeButton.find("span").removeClass("hidden");
                this.dom.heatmapTimeButton.parent().addClass("active");
            }

            if (!this.use_scrollbars) {
                this.dom.scrollbarsButton.find("span").addClass("hidden");
                this.dom.scrollbarsButton.parent().removeClass("active");
            }
            else {
                this.dom.scrollbarsButton.find("span").removeClass("hidden");
                this.dom.scrollbarsButton.parent().addClass("active");
            }
            if (this.graph_type == "stream") {
                this.dom.graphTypeStream.prop('checked', true);
                this.dom.graphTypeStream.parent().addClass("active");
                this.dom.graphTypeHeat.parent().removeClass("active");
                this.dom.streamOptionButton.removeClass("hidden");
                this.dom.heatOptionButton.addClass("hidden");
            }
            else if (this.graph_type == "heat") {
                this.dom.graphTypeHeat.prop('checked', true);
                this.dom.graphTypeHeat.parent().addClass("active");
                this.dom.graphTypeStream.parent().removeClass("active");
                this.dom.heatOptionButton.removeClass("hidden");
                this.dom.streamOptionButton.addClass("hidden");
            }
            if (this.ip_version.indexOf(4) != -1) {
                this.dom.ipVersion4Button.prop('checked', true);
                this.dom.ipVersion4Button.parent().addClass("active");
            }
            if (this.ip_version.indexOf(6) != -1) {
                this.dom.ipVersion6Button.prop('checked', true);
                this.dom.ipVersion6Button.parent().addClass("active");
            }

            // asnLvlButton.spinner();
            // this.dom.asnLvlButton.spinner("value", this.asn_level);
            // this.dom.mergeEventsButton.spinner();
            // this.dom.mergeEventsButton.spinner("value", this.merge_events);
        };

        this.draw_functions_btn_enabler = function () {
            if (!this.streaming) {
                this.dom.optionCommandButton.removeClass("disabled");
                this.dom.myIpButton.removeClass("disabled");
                this.dom.goButton.removeClass("disabled");
                this.dom.date.removeClass("disabled");

                this.dom.optionCommandButton.removeClass("not-active");
                this.dom.myIpButton.removeClass("not-active");
                this.dom.goButton.removeClass("not-active");
                this.dom.date.removeClass("not-active");

                this.dom.graphType.parent().removeClass("disabled");
                this.dom.graphType.parent().removeClass("not-active");
                this.dom.graphType.parent().attr("disabled", false);

                if (this.isGraphPresent()) {
                    this.dom.pathButton.removeClass("disabled");
                    this.dom.listButton.removeClass("disabled");
                    this.dom.sortButton.removeClass("disabled");
                    this.dom.pathButton.removeClass("not-active");
                    this.dom.listButton.removeClass("not-active");
                    this.dom.sortButton.removeClass("not-active");
                    if (!this.ripeDataBroker.current_parsed.targets.some(function (e) {
                            return $this.validator.check_ipv4(e);
                        })) {
                        this.dom.ipVersion4Button.addClass("disabled");
                        this.dom.ipVersion4Button.addClass("not-active");
                        this.dom.ipVersion4Button.attr("disabled", true);
                    }
                    else {
                        this.dom.ipVersion4Button.removeClass("disabled");
                        this.dom.ipVersion4Button.removeClass("not-active");
                        this.dom.ipVersion4Button.attr("disabled", false);
                    }
                    if (!this.ripeDataBroker.current_parsed.targets.some(function (e) {
                            return $this.validator.check_ipv6(e);
                        })) {
                        this.dom.ipVersion6Button.addClass("disabled");
                        this.dom.ipVersion6Button.addClass("not-active");
                        this.dom.ipVersion6Button.attr("disabled", true);
                    }
                    else {
                        this.dom.ipVersion6Button.removeClass("disabled");
                        this.dom.ipVersion6Button.removeClass("not-active");
                        this.dom.ipVersion6Button.attr("disabled", false);
                    }
                    if (this.ip_version.indexOf(4) != -1) {
                        this.dom.ipVersionButton.filter('[value="4"]').prop('checked', true);
                        this.dom.ipVersionButton.filter('[value="4"]').parent().addClass("active");
                    }
                    else {
                        this.dom.ipVersionButton.filter('[value="4"]').prop('checked', false);
                        this.dom.ipVersionButton.filter('[value="4"]').parent().removeClass("active");
                    }
                    if (this.ip_version.indexOf(6) != -1) {
                        this.dom.ipVersionButton.filter('[value="6"]').prop('checked', true);
                        this.dom.ipVersionButton.filter('[value="6"]').parent().addClass("active");
                    }
                    else {
                        this.dom.ipVersionButton.filter('[value="6"]').prop('checked', false);
                        this.dom.ipVersionButton.filter('[value="6"]').parent().removeClass("active");
                    }
                    this.dom.counter.removeClass("hidden");
                    if (this.graph_type == "stream") {
                        this.dom.stepsValueButton.parent().removeClass("disabled");
                        this.dom.stepsValueButton.parent().removeClass("not-active");
                        this.dom.stepsValueButton.parent().attr("disabled", false);
                        this.dom.stepsButton.removeClass("not-active");

                        this.dom.streamingValueButton.parent().removeClass("disabled");
                        this.dom.streamingValueButton.parent().removeClass("not-active");
                        this.dom.streamingValueButton.parent().attr("disabled", false);
                        this.dom.streamingButton.removeClass("not-active");
                    }
                    if (this.graph_type == "heat") {
                        this.dom.stepsValueButton.parent().addClass("disabled");
                        this.dom.stepsValueButton.parent().addClass("not-active");
                        this.dom.stepsValueButton.parent().attr("disabled", true);
                        this.dom.stepsButton.addClass("not-active");

                        this.dom.streamingValueButton.parent().addClass("disabled");
                        this.dom.streamingValueButton.parent().addClass("not-active");
                        this.dom.streamingValueButton.parent().attr("disabled", true);
                        this.dom.streamingButton.addClass("not-active");
                    }
                    if (!this.steps) {
                        this.dom.stepsValueButton.prop('checked', false);
                        this.dom.stepsValueButton.parent().removeClass("active");
                    }
                }
                else {
                    this.dom.pathButton.addClass("disabled");
                    this.dom.listButton.addClass("disabled");
                    this.dom.sortButton.addClass("disabled");
                    this.dom.pathButton.addClass("not-active");
                    this.dom.listButton.addClass("not-active");
                    this.dom.sortButton.addClass("not-active");

                    this.dom.ipVersion6Button.addClass("disabled");
                    this.dom.ipVersion6Button.addClass("not-active");
                    this.dom.ipVersion6Button.attr("disabled", true);

                    this.dom.ipVersion4Button.addClass("disabled");
                    this.dom.ipVersion4Button.addClass("not-active");
                    this.dom.ipVersion4Button.attr("disabled", true);

                    this.dom.counter.addClass("hidden");

                    this.dom.stepsValueButton.parent().addClass("disabled");
                    this.dom.stepsValueButton.parent().addClass("not-active");
                    this.dom.stepsValueButton.parent().attr("disabled", true);
                    this.dom.stepsButton.addClass("not-active");

                    this.dom.streamingValueButton.parent().addClass("disabled");
                    this.dom.streamingValueButton.parent().addClass("not-active");
                    this.dom.streamingButton.parent().attr("disabled", true);
                    this.dom.streamingButton.addClass("not-active");
                }
            }
        };

        this.ip_version_checkbox_enabler = function () {
            if (!this.streaming) {
                if (this.ripeDataBroker.current_parsed.targets.every(function (e) {
                        return $this.validator.check_ipv4(e);
                    })) {
                    this.dom.ipVersion4Button.removeClass("disabled");
                    this.dom.ipVersion4Button.removeClass("not-active");
                    this.dom.ipVersion4Button.attr("disabled", false);
                    this.ip_version = [4];
                }
                else {
                    this.dom.ipVersion4Button.addClass("disabled");
                    this.dom.ipVersion4Button.addClass("not-active");
                    this.dom.ipVersion4Button.attr("disabled", true);
                }
                if (this.ripeDataBroker.current_parsed.targets.every(function (e) {
                        return $this.validator.check_ipv6(e);
                    })) {
                    this.dom.ipVersion6Button.removeClass("disabled");
                    this.dom.ipVersion6Button.removeClass("not-active");
                    this.dom.ipVersion6Button.attr("disabled", false);
                    this.ip_version = [6];
                }
                else {
                    this.dom.ipVersion6Button.addClass("disabled");
                    this.dom.ipVersion6Button.addClass("not-active");
                    this.dom.ipVersion6Button.attr("disabled", true);
                }
                if (this.ripeDataBroker.current_parsed.targets.some(function (e) {
                        return $this.validator.check_ipv4(e);
                    }) && this.ripeDataBroker.current_parsed.targets.some(function (e) {
                        return $this.validator.check_ipv6(e);
                    })) {
                    this.dom.ipVersion4Button.removeClass("disabled");
                    this.dom.ipVersion4Button.removeClass("not-active");
                    this.dom.ipVersion4Button.attr("disabled", false);
                    this.dom.ipVersion6Button.removeClass("disabled");
                    this.dom.ipVersion6Button.removeClass("not-active");
                    this.dom.ipVersion6Button.attr("disabled", false);
                    if (this.ip_version.length == 0)
                        this.ip_version = [4];
                }
            }
        };


        /************************** CLICKABLE UI SETUP **************************/
        //TO CALL AT SETUP

        this.tooltip_setup = function () {
            this.dom.tooltip.tooltip();
        };

        this.shuffle_color_map_btn_setup = function () {
            this.dom.shuffleColorButton.on("click", function (e) {
                if ($this.isGraphPresent())
                    $this.drawer.shuffle_color_map($this.graph_type);
            });
        };

        this.erase_graph_btn_setup = function () {
            this.dom.eraseGraphButton.on("click", function (e) {
                $this.drawer.drawer_init();
                $this.draw_functions_btn_enabler();
            });
        };

        this.gather_information_btn_setup = function () {
            this.dom.gatherInformationButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.gather_information = !$this.gather_information;
            });
        };

        this.preserve_color_map_btn_setup = function () {
            this.dom.preserveColorButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.preserve_map = !$this.preserve_map;
                // GuiManager.url_string();
            });
        };

        this.prepending_prevention_btn_setup = function () {
            this.dom.prependingPreventionButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.prepending_prevention = !$this.prepending_prevention;
                if ($this.isGraphPresent())
                    if ($this.graph_type == "stream")
                        $this.ripeDataBroker.loadCurrentState(false, null, true);
                    else if ($this.graph_type == "heat")
                        $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.merge_cp_btn_setup = function () {
            this.dom.mergeCPButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.merge_cp = !$this.merge_cp;
                if ($this.isGraphPresent()) {
                    $this.ripeDataBroker.loadCurrentState(false, null, true);
                    if ($this.merge_cp)
                        $this.update_counters(".counter_asn", $this.drawer.keys.length + "/" + env.current_parsed.cp_set.length);
                    else
                        $this.update_counters(".counter_asn", $this.drawer.keys.length);
                }
            });
        };

        this.merge_events_btn_setup = function () {
            this.dom.mergeEventsInputInput.on("change", function (e, ui) {
                // $this.merge_events = $("input[name='merge_events']").spinner("value");
                if ($this.isGraphPresent()) {
                    $this.ripeDataBroker.loadCurrentState(false, null, true);
                    if ($this.merge_events)
                        $this.update_counters(".counter_events", $this.drawer.event_set.length + "/" + env.current_parsed.events.length);
                    else
                        $this.update_counters(".counter_events", env.current_parsed.events.length);
                }
            });
        };

        this.events_labels_btn_setup = function () {
            this.dom.eventsLabelsButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.events_labels = !$this.events_labels;
                if ($this.isGraphPresent())
                    $this.ripeDataBroker.loadCurrentState(false, null, false);
            });
        };

        this.cp_labels_btn_setup = function () {
            this.dom.cpLabelsButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.cp_labels = !$this.cp_labels;
                if ($this.isGraphPresent())
                    $this.ripeDataBroker.loadCurrentState(false, null, false);
            });
        };

        this.heatmap_time_btn_setup = function () {
            this.dom.heatmapTimeButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.heatmap_time_map = !$this.heatmap_time_map;
                if ($this.isGraphPresent())
                    $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.scrollbars_btn_setup = function () {
            this.dom.scrollbarsButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.use_scrollbars = !$this.use_scrollbars;
                if ($this.use_scrollbars) {
                    $this.dom.svg.parent().css("overflow", "scroll");

                }
                else {
                    $this.dom.svg.parent().css("overflow", "visible");
                }
            });
        };

        this.global_visiblity_btn_setup = function () {
            this.dom.globalVisibilityButton.on("click", function (e) {
                var target = e.target;
                $(target).find("span").toggleClass("hidden");
                $(target).parent().toggleClass("active");
                $this.global_visibility = !$this.global_visibility;
                if ($this.isGraphPresent())
                    if ($this.graph_type == "stream")
                        $this.ripeDataBroker.loadCurrentState(false, null, true);
                    else if ($this.graph_type == "heat")
                        $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.graph_type_radio_setup = function () {
            this.dom.graphType.on("change", function (e) {
                $this.graph_type = $this.dom.graphType.filter(":checked").val();
                console.log($this.graph_type);
                if ($this.graph_type == "stream") {
                    $this.dom.title.html("Global View");
                    $this.dom.mainSvg.css("height", "70vh");
                    $this.dom.mainSvg.css("width", "auto");
                    $this.dom.canvasContainer.css("width", "auto");
                    $this.dom.svg.parent().css("overflow", "visible");
                    $this.dom.counterAsn.find("label").text("#ASN");
                    $this.dom.streamOptionButton.removeClass("hidden");
                    $this.dom.heatOptionButton.addClass("hidden");
                }
                if ($this.graph_type == "heat") {
                    $this.dom.title.html("Local View");
                    $this.dom.canvasContainer.css("width", "100%");
                    // if ($this.use_scrollbars) {
                    //     $this.dom.svg.parent().css("overflow", "scroll");
                    // }
                    // else
                    //     $this.dom.body.css("overflow-y", "scroll");
                    $this.dom.counterAsn.find("label").text("#CP");
                    $this.dom.streamOptionButton.addClass("hidden");
                    $this.dom.heatOptionButton.removeClass("hidden");
                }
                $this.ripeDataBroker.heuristicsManager.setDefaultHeuristic($this.graph_type);
                if ($this.isGraphPresent())
                    $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.ip_version_checkbox_setup = function () {
            this.dom.ipVersionButton.on("change", function (e) {
                $this.ip_version = [];
                $this.dom.ipVersionCheckedButton.each(function () {
                    $this.ip_version.push(parseInt($(this).val()));
                });
                if ($this.isGraphPresent()) {
                    if ($this.graph_type == "heat")
                        $this.ripeDataBroker.loadCurrentState(false, null, true);
                    else if ($this.graph_type == "stream")
                        $this.ripeDataBroker.loadCurrentState(false, null, true);
                }
            });
        };

        this.asn_level_setup = function () {
            this.dom.asnLvlInputInput.on("change", function (e, ui) {
                // $this.asn_level = $("input[name='asn_lvl']").spinner("value");
                if ($this.isGraphPresent()) {
                    $this.ripeDataBroker.loadCurrentState(false, null, true);
                }
            });
        };

        this.streaming_btn_setup = function () {
            var interval;
            this.dom.streamingButton.on("click", function (e, ui) {
                $this.streaming = !$this.streaming;
                streaming_icon_swap();
                if ($this.streaming) {
                    $this.lock_all();
                    interval = $this.ripeDataBroker.streamgraph_streaming($this.streaming_speed);
                }
                else {
                    clearInterval(interval);
                    env.logger.log("== GuiManager Streaming stopped");
                    $this.draw_functions_btn_enabler();
                }
            });

            streaming_icon_swap = function () {
                var icon = $this.dom.streamingButton.find("span");
                if ($this.streaming) {
                    icon.removeClass("glyphicon-record");
                    icon.addClass("glyphicon-stop");
                }
                else {
                    icon.addClass("glyphicon-record");
                    icon.removeClass("glyphicon-stop");
                }
            };
        };

        this.steps_btn_setup = function () {
            this.dom.stepsButton.on("click", function (e, ui) {
                $this.steps = !$this.steps;
                if ($this.steps) {
                    $this.lock_all();
                    $this.ripeDataBroker.streamgraph_stepped_view(50);
                }
            });
        };

        this.list_btn_setup = function () {
            this.dom.listButton.on("click", function (e) {
                if ($this.asn_info_done) {
                    $this.dom.asnListButton.parent().removeClass("not-active");
                    $this.dom.asnListButton.parent().removeClass("disabled");
                }
                else {
                    $this.dom.asnListButton.parent().addClass("not-active");
                    $this.dom.asnListButton.parent().addClass("disabled");
                }
                if ($this.cp_info_done) {
                    $this.dom.cpListButton.parent().removeClass("not-active");
                    $this.dom.cpListButton.parent().removeClass("disabled");
                }
                else {
                    $this.dom.cpListButton.parent().addClass("not-active");
                    $this.dom.cpListButton.parent().addClass("disabled");
                }
            });
        };

        this.asn_list_btn_setup = function () {
            this.dom.asnListButton.hover(function (event) {
                var html = "";
                var set;
                if ($this.graph_type == "stream")
                    set = $this.drawer.keys.slice(0).reverse();
                else if ($this.graph_type == "heat")
                    set = $this.drawer.asn_set.slice(0);
                for (var i in set) {
                    var asn = set[i];
                    var color_background = $this.drawer.z(asn);
                    var color_text = $this.drawer.colorManager.furthestLabelColor(color_background);
                    html += '<li class="list-group-item as' + asn + '" style="color:' + color_text + '; background-color:' + color_background + ';"'
                    if ($this.graph_type == "stream")
                        html += 'onmouseover="d3.selectAll(\'.area\').filter(function(d){return d.key!=' + asn + ';}).style(\'fill-opacity\',\'0.35\');" onmouseout="d3.selectAll(\'.area\').style(\'fill-opacity\',1);">';
                    else if ($this.graph_type == 'heat')
                        html += 'onmouseover="d3.selectAll(\'.area\').filter(function(d){return d.asn!=' + asn + ';}).style(\'fill-opacity\',\'0.35\');" onmouseout="d3.selectAll(\'.area\').style(\'fill-opacity\',1);">';
                    html += "<div> ASN: " + asn + "</div>";
                    var info = $this.ripeDataBroker.current_parsed.known_asn[asn];
                    if (info) {
                        var tokens = info.split(",");
                        html += "<div>" + tokens[0].trim() + "</div>";
                        var country = tokens[tokens.length - 1].trim().split("-")[0];
                        html += '<div> Country: (' + country + ') <span class="flag-icon flag-icon-' + country.toLowerCase() + '" alt="' + country + '" title="' + country + '"></span></div>';
                    }
                    html += "</li>";
                }
                $this.dom.asnList.html(html);
                if (set.length < 11) {
                    $this.dom.asnList.css("height", "auto");
                    $this.dom.asnList.css("overflow-y", "visible");
                }
                else {
                    $this.dom.asnList.css("height", "");
                    $this.dom.asnList.css("overflow-y", "");
                }
            });
        };

        this.cp_list_btn_setup = function () {
            this.dom.cpListButton.hover(function (event) {
                var html = "";
                var set;
                if ($this.graph_type == "stream")
                    set = $this.ripeDataBroker.current_parsed.cp_set;
                else if ($this.graph_type == "heat")
                    set = $this.drawer.keys;
                for (var i in set) {
                    var cp = set[i];
                    html += "<li>";
                    html += "<div> ID: " + cp + "</div>";
                    var info = $this.ripeDataBroker.current_parsed.known_cp[cp];
                    if (info) {
                        html += "<div> IP: " + info["ip"] + "</div>";
                        html += "<div> Peering with CP: " + info["cp"] + "</div>";
                        html += "<div> From AS: " + info["as_number"] + "</div>";
                        var country = info["geo"].trim().split("-")[0];
                        html += '<div> Country: (' + country + ') <span class="flag-icon flag-icon-' + country.toLowerCase() + '" alt="' + country + '" title="' + country + '"></span></div>';
                    }
                    html += "</li>";
                }
                $this.dom.cpList.html(html);
                if (set.length < 11) {
                    $this.dom.cpList.css("height", "auto");
                    $this.dom.cpList.css("overflow-y", "visible");
                }
                else {
                    $this.dom.cpList.css("height", "");
                    $this.dom.cpList.css("overflow-y", "");
                }
            });
        };

        /************************** ORDERING BUTTONS **************************/
        //levensthein
        this.lev_dist_randwalk_cum_btn_setup = function () {
            this.dom.levDistRandCumButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "lev_rnd_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.lev_dist_randwalk_max_btn_setup = function () {
            this.dom.levDistRanMaxButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "lev_rnd_max";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        //best std dev random walking
        this.point_dist_by_randwalk_btn_setup = function () {
            this.dom.pointDistRanButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "st_rnd_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.point_dist_by_inference_btn_setup = function () {
            this.dom.pointDistInfButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "st_inf_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        //STD DEV SWAP
        this.point_dist_greedy_btn_setup = function () {
            this.dom.pointDistGreedyButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "st_grdy_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        //NEARFLOWS
        this.exchange_greedy_sort_btn_setup = function () {
            this.dom.exchangeGreedyButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "n_f";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        //WIGGLES
        this.wiggle_sum_btn_setup = function () {
            this.dom.wiggleSumButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "w_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.wiggle_max_btn_setup = function () {
            this.dom.wiggleMaxButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "w_max";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        //SORTS
        this.sort_asn_ascstdev_btn_setup = function () {
            this.dom.ascstdevSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_st";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "asc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_dscstdev_btn_setup = function () {
            this.dom.dscstdevSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_st";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "dsc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_ascvar_btn_setup = function () {
            this.dom.ascvarSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_var";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "asc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_dscvar_btn_setup = function () {
            this.dom.dscvarSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_var";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "dsc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_ascavg_btn_setup = function () {
            this.dom.ascavgSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_avg";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "asc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_dscavg_btn_setup = function () {
            this.dom.dscavgSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_avg";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "dsc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_ascsum_btn_setup = function () {
            this.dom.ascsumSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "asc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.sort_asn_dscsum_btn_setup = function () {
            this.dom.dscsumSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "s_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = "dsc";
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        /**HEATMAP**/
        this.heat_greedy_sort_1_btn_setup = function () {
            this.dom.heatGreedy1SortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "nf_1";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.heat_greedy_sort_2_btn_setup = function () {
            this.dom.heatGreedy2SortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "nf_2";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.heat_stdev_sort_btn_setup = function () {
            this.dom.heatStdevSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "st_grdy_cum";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.heat_geo_sort_btn_setup = function () {
            this.dom.heatCountrySortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "geo";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };

        this.heat_asn_sort_btn_setup = function () {
            this.dom.heatGeoSortButton.on("click", function (e) {
                $this.ripeDataBroker.heuristicsManager.current_heuristic = "asn";
                $this.ripeDataBroker.heuristicsManager.current_sort_type = null;
                $this.ripeDataBroker.loadCurrentState(false, null, true);
            });
        };


        /**************************************** OTHERS ************************************************/
        this.set_ordering = function (order) {
            $this.ripeDataBroker.loadCurrentState(order, false, null, true);
        };

        this.get_ordering = function () {
            return this.drawer.keys;
        };

        this.restoreQuery = function () {
            // Populate UI elements
        };

        this.update_counters = function (selector, quantity) {
            $(selector).text(quantity);
        };

        /*************************************** BOTTOM BUTTONS ****************************************/
        this.docs_btn_setup = function () {
            this.dom.docsButton.on("click", function (e) {
                var thewindow = window.open('https://massimo.ripe.net/bgpstreamgraph/', '_blank');
                thewindow.blur();
            });
        };

        this.about_btn_setup = function () {
            this.dom.aboutButton.on("click", function (e) {
                var thewindow = window.open('https://massimo.ripe.net/bgpstreamgraph/', '_blank');
                thewindow.blur();
            });
        };

        this.embed_btn_setup = function () {
            this.dom.embedButton.on("click", function (e) {
                var thewindow = window.open('https://massimo.ripe.net/bgpstreamgraph/#embed', '_blank');
                thewindow.blur();
            });
        };
    };

    return GuiManager;
});
define('bgpst.controller.main',[
    "bgpst.env.utils",
    "bgpst.view.graphdrawer",
    "bgpst.view.gui"
], function(utils, GraphDrawer, GuiManager){

    var Main = function(env) {
        this.exposedMethods = ["getVersion", "on", "init"];

        this.getVersion = function(){
            return env.version;
        };

        this.on = function(event, callback){
            utils.observer.subscribe(event, callback, this);
        };

        this.init = function(){
            env.guiManager = new GuiManager(env);
            env.guiManager.init();

        };

    };

    return Main;
});
define('bgpst.controller.logger',[
], function(){
	
	return function () {
		var printErrors = false;
		var printDebug = false;

		this.log = function (string, type){
			if ((!type || type == "debug") && printDebug){
				console.log(string);
			} else if (type == "error" && printErrors) {
				console.log(string);
			}
		}
	}
});
/**
 * Some require.js configurations
 */


requirejs.config({
    waitSeconds: 30,
    paths:{
        /* environment */
        "bgpst.env.utils": window.atlas._widgets.bgpst.urls.env + "utils",
        "bgpst.env.config": window.atlas._widgets.bgpst.urls.env + "config",
        "bgpst.env.languages.en": window.atlas._widgets.bgpst.urls.env + "languages/language.eng",

        /* libs */
        "bgpst.lib.require": window.atlas._widgets.bgpst.urls.libs + "require.min",
        "bgpst.lib.jquery-amd": window.atlas._widgets.bgpst.urls.libs + "jquery-libs-amd",
        "bgpst.lib.jquery-libs": window.atlas._widgets.bgpst.urls.libs + "jquery-libs",
        "bgpst.lib.date-format": window.atlas._widgets.bgpst.urls.libs + "dateFormat",
        "bgpst.lib.d3-amd": window.atlas._widgets.bgpst.urls.libs + "d3-libs",
        "bgpst.lib.mustache": window.atlas._widgets.bgpst.urls.libs + "mustache",
        "bgpst.lib.text": window.atlas._widgets.bgpst.urls.libs + "require-text",
        "bgpst.lib.stache": window.atlas._widgets.bgpst.urls.libs + "stache",
        "bgpst.lib.colorbrewer": window.atlas._widgets.bgpst.urls.libs + "colorbrewer",
        "bgpst.lib.d3.legend": window.atlas._widgets.bgpst.urls.libs + "d3.legend",
        "bgpst.lib.moment": window.atlas._widgets.bgpst.urls.libs + "moment-libs",

        "bgpst.lib.bootstrap.datetimepicker": window.atlas._widgets.bgpst.urls.libs + "datetimepicker/4.17.47/bootstrap-datetimepicker.min",
        "bgpst.lib.bootstrap.validator": window.atlas._widgets.bgpst.urls.libs + "form_validator/0.5.3/bootstrapValidator.min",
        "bgpst.lib.bootstrap.validator-it": window.atlas._widgets.bgpst.urls.libs + "form_validator/0.5.3/it_IT",

        "bgpst.lib.bootstrap.tokenfield": window.atlas._widgets.bgpst.urls.libs + "tokenfield/0.12.0/bootstrap-tokenfield.min",



        /* view */
        "bgpst.view.main": window.atlas._widgets.bgpst.urls.view + "MainView",
        "bgpst.view.color": window.atlas._widgets.bgpst.urls.view + "ColorManager",
        "bgpst.view.graphdrawer": window.atlas._widgets.bgpst.urls.view + "GraphDrawer",
        "bgpst.view.gui": window.atlas._widgets.bgpst.urls.view + "GuiManager",
        "bgpst.view.heuristics": window.atlas._widgets.bgpst.urls.view + "HeuristicsManager",
        "bgpst.view.metrics": window.atlas._widgets.bgpst.urls.view + "MetricsManager",
        "bgpst.view.broker": window.atlas._widgets.bgpst.urls.view + "RipeDataBroker",
        "bgpst.view.parser": window.atlas._widgets.bgpst.urls.view + "RipeDataParser",
        "bgpst.view.scroller": window.atlas._widgets.bgpst.urls.view + "Scroller",

        /* controller */
        "bgpst.controller.main": window.atlas._widgets.bgpst.urls.controller + "main",

        "bgpst.controller.asnvalidator": window.atlas._widgets.bgpst.urls.controller + "helpers/AsnValidator",
        "bgpst.controller.dateconverter": window.atlas._widgets.bgpst.urls.controller + "helpers/DateConverter",
        "bgpst.controller.datevalidator": window.atlas._widgets.bgpst.urls.controller + "helpers/DateValidator",
        "bgpst.controller.functions": window.atlas._widgets.bgpst.urls.controller + "helpers/Functions",
        "bgpst.controller.ipv4validator": window.atlas._widgets.bgpst.urls.controller + "helpers/Ipv4Validator",
        "bgpst.controller.ipv6validator": window.atlas._widgets.bgpst.urls.controller + "helpers/Ipv6Validator",
        "bgpst.controller.logger": window.atlas._widgets.bgpst.urls.controller + "helpers/Logger",
        "bgpst.controller.validator": window.atlas._widgets.bgpst.urls.controller + "helpers/Validator",


        /* model */
        "bgpst.model.gdbstruct": window.atlas._widgets.bgpst.urls.model + "gdb_structure/GDBStruct"
        

    },
    shim:{
        "bgpst.lib.bootstrap-datetimepicker": {
            deps: ["bgpst.lib.jquery-amd"]
        },
        "bgpst.lib.bootstrap-validator": {
            deps: ["bgpst.lib.jquery-amd"]
        },
        "bgpst.lib.bootstrap-validator-it": {
            deps: ["bgpst.lib.jquery-amd"]
        },
        "bgpst.lib.bootstrap-tokenfield": {
            deps: ["bgpst.lib.jquery-amd"]
        },
        "bgpst.lib.d3-amd": {
            export: "d3"
        }
    },

    stache: {
        extension: '.html', // default = '.html'
        path: 'dev/view/html/' // default = ''
    }
});



define('bgpst-loader',[
    "bgpst.env.utils",
    "bgpst.lib.moment",
    "bgpst.env.config",
    "bgpst.env.languages.en",
    "bgpst.lib.jquery-amd",
    "bgpst.controller.main",
    "bgpst.controller.logger"
], function(utils, moment, config, language, $, Main, Logger){

    return function(instance){
        var env, instanceParams, queryParams, parentDom, styleDownloads, objectToBeEnriched;

        /*
         * Access to the instance
         */
        instanceParams = instance.instanceParams;
        queryParams = instance.queryParams;
        parentDom = instance.domElement;

        /*
         * Init Dependency Injection Vector
         */
        env = {
            "version": "17.12.12.0",
            "dev": instanceParams.dev,
            "logger": new Logger(),
            "autoStart": instanceParams.autoStart || true,
            "widgetUrl": WIDGET_URL + "dev/",
            "parentDom": $(parentDom),
            "queryParams": queryParams
            //{ resource: "IP", startDate: new Date(), stopDate: new Date()}
        };


        if (env.queryParams.stopDate) {
            env.queryParams.stopDate = (typeof env.queryParams.stopDate == "string") ?
                moment(env.queryParams.stopDate).utc() : // parse string
                moment.unix(env.queryParams.stopDate).utc(); // parse unix timestamp
        } else {
            env.queryParams.stopDate = moment.utc(); // now
        }

        if (env.queryParams.startDate) {
            env.queryParams.startDate = (typeof env.queryParams.startDate == "string") ?
                moment(env.queryParams.startDate).utc() :
                moment.unix(env.queryParams.startDate).utc();
        } else {
            env.queryParams.startDate = moment(env.queryParams.stopDate).subtract(config.defaultTimeWindowMinutes, "minute"); // default time window
        }


        /*
         * Check if parent dom exists
         */
        if (!env.parentDom || env.parentDom.length == 0){
            throw "It was not possible to find the DOM element to populate";
        }


        /*
         * Check if stylesheets are loaded
         */

        if (!instanceParams.dev){
            styleDownloads = [
                window.atlas._widgets.bgpst.urls.view + "css/style-lib-dist.min.css"
            ];
        } else {
            styleDownloads = [
                window.atlas._widgets.bgpst.urls.view + "css/style.css",
                window.atlas._widgets.bgpst.urls.libs + "jquery/jquery-ui.min.css",
                window.atlas._widgets.bgpst.urls.libs + "bootstrap/css/bootstrap.min.css",
                window.atlas._widgets.bgpst.urls.libs + "bootstrap/css/bootstrap-theme.min.css",
                window.atlas._widgets.bgpst.urls.libs + "bootstrap-slider/css/bootstrap-slider.css",
                window.atlas._widgets.bgpst.urls.view + "css/flags/2.8.0/flag-icon.min.css",
                window.atlas._widgets.bgpst.urls.libs + "bootstrap-datetimepicker/css/bootstrap-datetimepicker.css"
            ];

        }


        objectToBeEnriched = {};

        utils.loadStylesheets(styleDownloads, function(){
            var n, length, methodName, callbackReady;

            env.main = new Main(env);

            if (env.autoStart){
                env.main.init();
            }

            function enrichMethod(methodName) {
                objectToBeEnriched[methodName] = function () {
                    return env.main[methodName].apply(env.main, arguments);
                }
            }

            for (n=0,length=env.main.exposedMethods.length; n<length; n++){
                methodName = env.main.exposedMethods[n];
                enrichMethod(methodName);
            }

            callbackReady = window.atlas._widgets.bgpst.instances.callback[parentDom];

            console.log(callbackReady);
            /* bgp stream script to ben run */
            if (callbackReady){
                callbackReady(objectToBeEnriched);
            }
        });


        /**
         * A set of methods exposed outside
         */
        return objectToBeEnriched;
    };

});



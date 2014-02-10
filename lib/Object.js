(function () {

	/**
     * @method Object.prototype.setValueOf
     * Being used for creating dynamic tree structures onto an object.
     */
    Object.defineProperty(Object.prototype, 'setValueOf', {
        enumerable: false,
        value: function(key, val) {
            var keyparts = key.split('.'),
                i_part = 0,
                part,
                evaled,
                shallow = this;


            for (i_part; i_part < keyparts.length; i_part += 1) {

                part = keyparts[i_part];
                try {
                    eval("evaled = shallow['" + part + "'];");
                } catch (e) {
                    //Silently move on
                }
                if (undefined === evaled) {

                    if (i_part < (keyparts.length - 1)) {
                        shallow[part] = {};
                        shallow = shallow[part];
                    } else {
                        shallow[part] = val;
                    }

                } else {
                    shallow = shallow[part];
                }
            }
            return this.getValueOf(key, false);
        }
    });

    /**
     * @method Object.prototype.getValueOf
     * Being used for retrieving dynamic tree structures from an object.
     */
    Object.defineProperty(Object.prototype, 'getValueOf', {
        enumerable: false,
        value: function(params, fallback) {
            var value,
                keyparts = params.split("."),
                i_part = 0,
                part,
                teststring = [];


            for (i_part; i_part < keyparts.length; i_part += 1) {
                part = keyparts[i_part];
                if ("number" === typeof part) {
                    teststring.push("[" + number + "]");
                } else if ('string' === typeof part) {
                    teststring.push("['" + part + "']");
                }
            }

            try {
                eval('value = this' + teststring.join("") + ';');

            } catch (e) {
                //Silent move on
            }
            if (undefined === value) {
                value = fallback;
            }
            return value;
        }
    });

    /**
     * @method Object.prototype.unsetValueOf
     * Being used for deleting dynamic tree structures from an object.
     */
    Object.defineProperty(Object.prototype, 'unsetValueOf', {
        enumerable: false,
        value: function(params) {
            var value,
                keyparts = params.split("."),
                lastPart,
                shallowPointer;
            if ('function' !== typeof params && 'string' === typeof params) {
                if (1 < keyparts.length) {
                    params = keyparts.pop();

                    try {
                        eval("shallowPointer = this['" + keyparts.join("']['") + "']");

                    } catch (e) {

                    }
                } else {
                    shallowPointer = this;
                }

                try {
                    delete shallowPointer[params];
                } catch (e) {
                    return false;
                }

            } else {
                return false;
            }
            return value;
        }
    });



    /**
     * @method Object.prototype.updateValueOf
     * Being used for updating dynamic tree structures onto an object.
     */
    Object.defineProperty(Object.prototype, 'updateValueOf', {
        enumerable: false,
        value: function(params, value) {

            var parts, placebo, key;
            if (undefined !== this.getValueOf(params)) {
                if (/\./.test(params) && 'function' !== typeof value) {
                    parts = params.split('.');
                    key = parts.pop();
                    try {
                        eval("placebo = this." + parts.join('.'));
                        if (undefined !== placebo) {
                            placebo[key] = value;
                        }
                    } catch (e) {
                        console.error('Object prototype updateValueOf has failed');
                        console.error(e);
                        return false;
                    }
                } else {
                    this[params] = value;
                }
            } else {
                this.setValueOf(params, value);
            }
        }
    });

	/**
     * @property HTMLElement.html
     * Shortcut to innerHTML
     */
    Object.defineProperty(HTMLElement.prototype, "html", {
        set: function (value) {
            this.innerHTML = value;
        },
        get: function () {
            return this.innerHTML;
        }
    });

    /**
     * @property HTMLElement.text
     * Shortcut to innerText
     */
    Object.defineProperty(HTMLElement.prototype, "text", {
        set: function (value) {
            this.innerText = value;
        },
        get: function () {
            return this.innerText;
        }
    });

    /**
     * @method HTMLElement.setValueMap
     * Sets the map on an element value
     */
    Object.defineProperty(HTMLElement.prototype, "setValueMap", {
        value: function (map) {
            if (undefined !== map && null !== map) {
                this.setValueOf("attrs.map", map);
            }
        }
    });

    /**
     * @method HTMLElement.getValueMap
     * Get the map of an element
     */
    Object.defineProperty(HTMLElement.prototype, "getValueMap", {
        value: function () {
            var self;

            self = this;
            return this.getValueOf("attrs.map", (function () {
                switch (self.nodeName.toLowerCase()) {
                    case "input":
                        if (['radio', 'checkbox'].indexOf(self.getAttribute("type")) !== -1) {
                            return "checked";
                        }
                        return "value";
                        break;
                    case "select":
                        return "value";
                        break;
                    case "textarea":
                        return "value";
                        break;
                    default:
                        return "html";
                        break;
                }       
            }()));
        }
    });

    /**
     * @method HTMLElement.getElementValue
     * Returns the element value by handling the type of element node
     */
    Object.defineProperty(HTMLElement.prototype, "getElementValue", {
            enumerable: false,
            value: function() {
                return this.getValueOf(this.getValueMap(), this.getValueOf("attributes." + this.getValueMap()));
            }
    });

    /**
     * @method  HTMLElement.setElementValue
     * Returns the element value by handling the type of element node
     */
    Object.defineProperty(HTMLElement.prototype, "setElementValue", {
            enumerable: false,
            value: function(value) {
                this.updateValueOf(this.getValueMap(), value);
            }
    });
}());
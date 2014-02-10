/**
 * Viewport Controller
 * Manages viewports trhough-out the system
 * @author Cornita Liviu
 */
(function () {
	"use strict";

	var Viewport = null;

	/**
	 * Viewports instance prototype
	 * Will define the instance prototype on which viewports can be created
	 */
	Viewport = function (name) {
		
		if (undefined === name) {
			throw new Error("ViewportException: The viewport needs a name");
		}
		this.name = name;
		this.feedDetails = null;
		this.body = Application.createTemplateInstance("viewport", name);
		this.asPage = false;
		this.hasFeed = false;
		this.showing = false;
		this.listeners = {}; 
		this.callIdentifier = null;
		return this;
	};

	/**
	 * @method Viewport.clone
	 * Clones the viewport body
	 */
	Viewport.prototype.clone = function () {
		this.trigger("clone");
		return this.body.cloneNode(true);
	};

	/**
	 * @method Viewport.on
	 * Appends a listener to an action
	 */
	Viewport.prototype.on = function (event, callback) {
		event = event.replace(".", "-", " ", "-");
		this.listeners.setValueOf(event, []);
		this.listeners[event].push(callback);
		return this;
	};

	/**
	 * @method Viewport.trigger
	 * Appends a listener to an action
	 */
	Viewport.prototype.trigger = function (event) {
		var listeners,
			self;

		event = event.replace(".", "-", " ", "-");
		listeners = this.listeners.getValueOf(event, []);
		self = this;
		listeners.forEach(function (listener) {
			listener.call(self);
		});

		return this;
	};
	

	/**
	 * @method Viewport.show
	 * Shows the viewport and dictates ui flow.
	 */
	Viewport.prototype.show = function (options) {
		var self;
		this.trigger("before.show");
		if (undefined !== options && "object" === typeof options) {
			self = this;
			Object.keys(options).forEach(function (option) {
				if (true === options[option]) {
					if ("function" === typeof self[option]) {
						self[option]();
					}
				}
			});
		}

		if (true === this.asPage) {
			Application.hideAll("viewport", {
				asPage: true
			});
		}

		$(this.body).show("slide", {direction: "left"}, 800);
		this.trigger("after.show");
		this.showing = true;
	};

	/**
	 * @method Viewport.hide
	 * Shows the viewport
	 */
	Viewport.prototype.hide = function () {
		this.showing = false;
		this.trigger("before.hide");
		$(this.body).hide("fade");
		this.trigger("after.hide");
		return false;
	};

	/**
	 * @method Viewport.createFeed
	 * Declares a feed source for the viewport
	 * @param {Object} feed
	 */
	Viewport.prototype.createFeed = function (feed, map) {
		['source'].forEach(function (item) {
			if (undefined === feed[item]) {
				throw new Error("ViewportException: The feed cannot be created without feed." + item);
			}
		});

		this.feedDetails = feed;
		return this;
	};

	/**
	 * @method Viewport.prototype.deploy
	 * Deploys the viewport on the main document
	 * @param {String} queryLocation
	 */
	Viewport.prototype.deploy = function (queryLocation) {
		var self;

		if (undefined === queryLocation) {
			queryLocation = "body";
		}
		self = this;
		Object.keys(this).forEach(function (item) {
			if (true === self[item] instanceof Viewport) {
				self.body.appendChild(self[item].body);
				self[item].hide();
				self[item].on("before.show", function () {
					if (false === self.showing) {
						self.show();
					}
				});

				self.on("before.hide", function () {
					if (true === self[item].showing) {
						self[item].hide();
					}
				});
			}
		});
		this.hide();
		document.querySelector(queryLocation).appendChild(this.body);

	};
	

	/**
	 * @method Viewport.setKey
	 * Sets an internal key's value
	 */
	Viewport.prototype.setKey = function (key, value, map) {
		var documentFragment,
			element;

		documentFragment = document.createDocumentFragment();
		documentFragment.appendChild(this.body);
		element = documentFragment.querySelector("[data-key='" + key + "'");

		if (null !== element) {
			if (null !== map) {
				element.setValueMap(map);	
			}
			element.setElementValue(value);
		}
	};

	/**
	 * @method Viewport.isPage
	 * Declares the viewport as page. This means it won't have the same behaviour as a viewport
	 */
	Viewport.prototype.isPage = function () {
		this.asPage = true;
		return this;
	};

	/**
	 * @method Viewport.reset
	 * Resets the viewport
	 */
	Viewport.prototype.reset = function () {
		this.hasFeed = false;
		this.trigger("reset");
		return this;
	};

	/**
	 * @method Viewport.feed
	 * Feeds the viewport using the provided feed details
	 *
	 * @param {Object} FeedItem - optional. If passed, the feeding action will resume to this item. 
	 */
	Viewport.prototype.feed = function (feedItem, map) {
		var data,
			self;
		if (true === this.hasFeed) {
			return this;
		}

		if (null !== this.feedDetails) {
			if ('function' === typeof this.feedDetails.source) {
				data = this.feedDetails.source();
			} else {
				data = this.feedDetails.source;
			}
		}

		if (undefined !== feedItem) {
			data = [feedItem];
		}

		if (false === data instanceof Array) {
			throw new Error("ViewportException: The data provided for the feed source is not an array");
		}
		self = this;
		
		if (null !== this.getValueOf("feedDetails.iterator", null)) {
			data.forEach(function (item) {
				var element;
				element = self.feedDetails.iterator.feed(item, self.feedDetails.map).clone();
				self.body.appendChild(element);
				self.on("reset", function () {
					try {
						self.body.removeChild(element);
					} catch (e) {
						//The node has been removed
					}
				});
			});
			this.hasFeed = true;
		} else {
			data.forEach(function(item) {
				Object.keys(item).forEach(function (key) {
					var mapItem = null;
					if (undefined !== map && "object" === typeof map) {
						mapItem = map.getValueOf(key, null);
					}
					self.setKey(key, item[key], mapItem);
				});
				
			});
		}
		return this;
	};

	/**
	 * @method Viewport.createAction
	 * Creates a new action on the given element inside the body
	 *
	 * @param {String} action
	 * @param {String} itemDataName
	 * @param {String} callback
	 */
	Viewport.prototype.createAction = function (action, itemDataName, callback) {
		var item;
		$("[data-name='" + itemDataName + "']").on(action, callback);
		return this;
	};

	/**
	 * Public by Facade
	 */
	Application.viewport = {
		//Container
		instances: {},
		
		//Create a new viewport
		create: function (name) {
			var instance = new Viewport(name);
			this.instances[name] = instance;
			return instance;
		},

		//Retrieve an instance
		get: function (name) {
			return (undefined !== this.viewports[name]) ? this.viewports[name] : null;
		}
	};

	
}());
/**
 * Application Controller
 * Manages the application engine
 * @author Cornita Liviu
 */
(function () {

	//The general namespace
	window.Application = {
		components: [],
		templates: {}
	};

	/**
	 * @method Application.initialize
	 * Initializes the Application by 
	 * doing some bootstrap jobs
	 */
	Application.initialize = function () {
		var event;

		this.parseDocumentComponents();
		this.setPageListeners();

		event = new Event("initialize", {
			detail: {},
			bubbles: true,
			cancelable: true
		});
		document.dispatchEvent(event);
	};

	/**
	 * @method Application.setPageListeners
	 * Sets the default page listeners
	 */
	Application.setPageListeners = function () {
		
		//Viewport show
		$("body").on("click", function (e) {
			var params;


			if (null !== e.target.getAttribute("data-show")) {
				params = e.target.getAttribute("data-show").split(',');
				params.push(e);
				Application.showSingle.apply(Application, params);
			}
		});
	};

	/**
	 * @method  Application.showSingle
	 * Shows a single component type. It excludes the others
	 *
	 * @param {String} type
	 * @param {String} name
	 */
	Application.showSingle = function (type, name, param, e) {
		var instances;
		instances = this.getValueOf([type, "instances"].join("."), {});

		if (undefined !== param && undefined !== e) {
			param = e.target.getAttribute(param);
		}

		Object.keys(instances).forEach(function (instance) {
			if (instance !== name && false === instances[instance].asPage) {
				if (true === instances[instance].showing) {
					instances[instance].hide();
				}
			} else if (instance === name){
				if (false === instances[instance].showing) {
					instances[instance].callIdentifier = param;
					instances[instance].show();
				}
			}
		});
	};

	/**
	 * @method Application.hideAll
	 * Closes all specified types of components
	 *
	 * @param {String} type
	 * @param {Object} filter - optional
	 */
	Application.hideAll = function (type, filter) {
		var instances,
			i_filter;
		instances = this.getValueOf([type, "instances"].join("."), {});

		Object.keys(instances).forEach(function (instance) {
			var close = true;

			for (i_filter in filter) {
				if (undefined === instances[instance][i_filter] || filter[i_filter] !== instances[instance][i_filter]) {
					close = false;
				}
			}

			if (true === close) {
				if (true === instances[instance].showing) {
					instances[instance].hide();
				}
			}
		});
	};
	
	
	/**
	 * @method Application.parseDocumentComponents
	 * Parses the document for key-components
	 */
	Application.parseDocumentComponents = function () {
		var component,
			shreds,
			i_shred,
			startTime;

		startTime = new Date().getTime();
		console.log("Application: Scanning the document");
		for (component in this.components) {
			shreds = document.querySelectorAll("[data-" + this.components[component] + "]");
			if (0 < shreds.length) {
				if (undefined === this.templates[this.components[component]]) {
					this.templates[this.components[component]] = {};
				}
				for (i_shred = 0; i_shred < shreds.length; i_shred += 1) {
					this.templates[this.components[component]][shreds[i_shred].dataset[this.components[component]]] = shreds[i_shred];
					shreds[i_shred].parentNode.removeChild(shreds[i_shred]);
				}
			}
		}
		console.log("Application: Done. Took " + (new Date().getTime() - startTime) + " ms");
	};

	/**
	 * @method Application.createTemplateInstance
	 * Creates a requested template clone
	 *
	 * @param {String} type
	 * @param {String} name
	 */
	Application.createTemplateInstance = function (type, name) {
		return this.templates[type][name].cloneNode(true);
	};
}());
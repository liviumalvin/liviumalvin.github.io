/**
 * Bootstrapper
 * Bootstraps the application
 *  
 */
(function () {
	document.addEventListener("DOMContentLoaded", function () {

		console.log("Application: Start");

		/**
		 * Set application components
		 */
		Application.components = ['page', 'viewport'];

		/**
		 * Firebase component
		 */
		Application.firebase = new Firebase("https://snipperion.firebaseio.com/");

		/**
		 * @property Application.snippets
		 */
		Application.snippets = {
			container: [],
			getFeed: function () {
				return Application.snippets.container;
			},
			getFeedByID: function (id) {
				var item;
				for (item in Application.snippets.container) {
					if (Application.snippets.container[item].id === id) {
						return Application.snippets.container[item];
					}
				}
				return false;
			}
		}

		/**
		 * @event Firebase value
		 * Triggers every time there is a change inside 
		 */
		Application.firebase.on("value", function (snapshot) {
			var item,
				items,
				FirebaseEvent;

			Application.snippets.container = [];
			items = snapshot.val();

			for (item in items) {
				if ("object" === typeof items[item]) {
					items[item].id = item;
					Application.snippets.container.push(items[item]);
				}
			}

			FirebaseEvent = new Event("firebase.update", {
				detail: {},
				bubbles: true,
				cancelable: true
			});
			document.dispatchEvent(FirebaseEvent);
		});		

		/**
		 * Jolt the application
		 */
		Application.initialize();


	});
}());
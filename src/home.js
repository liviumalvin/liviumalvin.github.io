document.addEventListener("initialize", function () {
	"use strict";
	
	var Dashboard;
	/**
	 * Home page
	 * Dashboard
	 * - Lists all snippets
	 *
	 * @features
	 *  Grid view
	 *  List view
	 */
	Dashboard = Application.viewport.create("dashboard").isPage();

	/**
	 * @grid view
	 */
	Dashboard.grid = Application.viewport.create("dashboard-grid")
					.createFeed({
						source: Application.snippets.getFeed,
						iterator: Application.viewport.create("snippet-grid-item"),
						map: {
							id: "id"
						}
					})
					.on("before.show", function () {
						this.feed();
					})
					.on("after.hide", function () {
						this.reset();
					});
	
	/**
	 * @list view
	 */
	Dashboard.list = Application.viewport.create("dashboard-list")
					.createFeed({
						source: Application.snippets.getFeed,
						iterator: Application.viewport.create("snippet-list-item"),
					})
					.on("before.show", function () {
						this.feed();
					})
					.on("after.hide", function () {
						this.reset();
					});;

	/**
	 * @deploy Dashboard
	 */
	Dashboard.deploy();

	/**
	 * @event firebase.update
	 * triggers when firebase updates the collection
	 */
	document.addEventListener("firebase.update", function () {
		if (true === Dashboard.showing) {
			Dashboard.grid.hide();
			Dashboard.list.hide();
		}

		/**
		 * @show default grid
		 */
		Dashboard.grid.show();
	});

});
document.addEventListener("initialize", function () {
	"use strict";

	var Snippet;
	/**
	 * Snippet Page
	 *
	 * @features
	 *   - add snippet
	 *   - view snippet
	 */

	Snippet = Application.viewport.create("snippet").isPage();
	
	/**
	 * @feature add snippet
	 * Creates the add-snippet viewport
	 */
	Snippet.add = Application.viewport.create("add-snippet");

	/**
	 * @feature view snippet
	 * Creates the view-snippet viewport
	 */
	Snippet.view = Application.viewport.create("view-snippet");

	/**
	 * @event before.show
	 */
	Snippet.view.on("before.show", function () {

		if (null !== this.callIdentifier) {
			this.feed(Application.snippets.getFeedByID(this.callIdentifier));
			//Reset identifier
			this.callIdentifier = null;
		}

	});

	/**
	 * @event after.show
	 * Append the snippet view to the page
	 */
	Snippet.view.on("after.show", function () {
		//Append the feed to the body
		Snippet.body.appendChild(this.body);

		//Initialize highlighter
  		$('pre').each(function(i, e) {console.log(this); hljs.highlightBlock(e)});
	});

	/**
	 * Deploy snippet
	 */
	Snippet.deploy();

	/**
	 * @action submit
	 * Triggers on submiting the form
	 */
	Snippet.add.createAction("submit", "addSnippetForm", function (e) {
		e.preventDefault();
		var code = {};
		
		code.title = $("#snippetTitle").val();
		code.description = $("#snippetDescription").val();
		code.code = $("#snippetBody").val();

		//Push to firebase
		Application.firebase.push(code);

		//Reset form
		$("[data-name='addSnippetForm']").trigger('reset');
		return false;
	});

});
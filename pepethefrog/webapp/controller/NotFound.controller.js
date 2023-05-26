sap.ui.define([
		"zjblessons/pepethefrog/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblessons.pepethefrog.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);
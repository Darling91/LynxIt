sap.ui.define([
		"zjblessons/Marketplace/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("zjblessons.Marketplace.controller.NotFound", {

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
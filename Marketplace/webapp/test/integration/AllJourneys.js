/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/Marketplace/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/Marketplace/test/integration/pages/Worklist",
	"zjblessons/Marketplace/test/integration/pages/Object",
	"zjblessons/Marketplace/test/integration/pages/NotFound",
	"zjblessons/Marketplace/test/integration/pages/Browser",
	"zjblessons/Marketplace/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.Marketplace.view."
	});

	sap.ui.require([
		"zjblessons/Marketplace/test/integration/WorklistJourney",
		"zjblessons/Marketplace/test/integration/ObjectJourney",
		"zjblessons/Marketplace/test/integration/NavigationJourney",
		"zjblessons/Marketplace/test/integration/NotFoundJourney",
		"zjblessons/Marketplace/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});
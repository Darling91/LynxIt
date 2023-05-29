/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/FrogThePepe/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/FrogThePepe/test/integration/pages/App",
	"zjblessons/FrogThePepe/test/integration/pages/Browser",
	"zjblessons/FrogThePepe/test/integration/pages/Master",
	"zjblessons/FrogThePepe/test/integration/pages/Detail",
	"zjblessons/FrogThePepe/test/integration/pages/NotFound"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.FrogThePepe.view."
	});

	sap.ui.require([
		"zjblessons/FrogThePepe/test/integration/NavigationJourneyPhone",
		"zjblessons/FrogThePepe/test/integration/NotFoundJourneyPhone",
		"zjblessons/FrogThePepe/test/integration/BusyJourneyPhone"
	], function () {
		QUnit.start();
	});
});
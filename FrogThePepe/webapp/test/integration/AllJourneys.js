/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 jbcommon_auth_ModifiedBy in the list

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
		"zjblessons/FrogThePepe/test/integration/MasterJourney",
		"zjblessons/FrogThePepe/test/integration/NavigationJourney",
		"zjblessons/FrogThePepe/test/integration/NotFoundJourney",
		"zjblessons/FrogThePepe/test/integration/BusyJourney"
	], function () {
		QUnit.start();
	});
});
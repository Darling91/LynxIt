/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"zjblessons/pepethefrog/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"zjblessons/pepethefrog/test/integration/pages/Worklist",
	"zjblessons/pepethefrog/test/integration/pages/Object",
	"zjblessons/pepethefrog/test/integration/pages/NotFound",
	"zjblessons/pepethefrog/test/integration/pages/Browser",
	"zjblessons/pepethefrog/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "zjblessons.pepethefrog.view."
	});

	sap.ui.require([
		"zjblessons/pepethefrog/test/integration/WorklistJourney",
		"zjblessons/pepethefrog/test/integration/ObjectJourney",
		"zjblessons/pepethefrog/test/integration/NavigationJourney",
		"zjblessons/pepethefrog/test/integration/NotFoundJourney"
	], function () {
		QUnit.start();
	});
});
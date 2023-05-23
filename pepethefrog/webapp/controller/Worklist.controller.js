sap.ui.define([
		"zjblessons/pepethefrog/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/pepethefrog/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator,Fragment) {
		"use strict";

		return BaseController.extend("zjblessons.pepethefrog.controller.Worklist", {

			formatter: formatter,


			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");


				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();

				this._aTableSearchState = [];


				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");


				oTable.attachEventOnce("updateFinished", function(){

					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},


			onUpdateFinished : function (oEvent) {

				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");

				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},
			
			_showObject: function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("MaterialID")
				});
			},

			onPressShowMaterial : function (oEvent) {

				this._showObject(oEvent.getSource());
			},


			onNavBack : function() {
				history.go(-1);
			},

	onShareInJamPress: function () {
			var oViewModel = this.getModel("worklistView"),
				oShareDialog = sap.ui.getCore().createComponent({
					name: "sap.collaboration.components.fiori.sharing.dialog",
					settings: {
						object: {
							id: location.href,
							share: oViewModel.getProperty("/shareOnJamTitle")
						}
					}
				});
			oShareDialog.open();
		},

		_loadCreateFragment: function(oEntryContext){
			if(!this.oCreateDialog){
				this.pCreateMaterial = Fragment.load({
					name:"zjblessons.pepethefrog.view.fragment.CreateMaterial",
					controller: this,
					id: "fCreateDialog"
				}).then(oDialog => {
					this.oCreateDialog = oDialog;
					this.getView().addDependent(this.oCreateDialog);
					return Promise.resolve(oDialog);
				});
			}
			this.pCreateMaterial.then(oDialog => {
				oDialog.setBindingContext(oEntryContext);
				oDialog.open();
			})
		},

		_closeCreateDialog:function(){
			this.oCreateDialog.close();
		},

		onPressSaveMaterial: function(){
			this.getModel().submitChanges();
			this._closeCreateDialog();
		},

		onPressCloseCreateDialog:function(){
			this.getModel().resetChanges();
			this._closeCreateDialog();
		},

		onPressCreateMaterial: function(){
			const mProperties = {
				MaterialID: "0",
				Version: "A",
				Language: "RU"
			};
			const oEntryContext = this.getModel().createEntry("/zjblessons_base_Materials",{
				properties: mProperties
			});
			this._loadCreateFragment(oEntryContext);
		},

		onPressDeleteMaterial: function(oEvent){
			const sEntryPath = oEvent.getSource().getBindingContext().getPath();
			this.getModel().remove(sEntryPath);
		},

		onSearch: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				this.onRefresh();
			} else {
				var aTableSearchState = [];
				var sQuery = oEvent.getParameter('query');
				if (sQuery && sQuery.length > 0) {
					aTableSearchState = [new Filter("MaterialText", FilterOperator = 'EQ', sQuery)];
				}
				this._applySearch(aTableSearchState);
			}

		},
		onSearchable: function (oEvent) {
			if (oEvent.getParameters().refreshButtonPressed) {
				this.onRefresh1();
			} else {
				var aTableSearchStatets = [];
				var sQuery = oEvent.getParameter("query");
				if (sQuery && sQuery.length > 0) {
					aTableSearchStatets = [new Filter("CreatedByFullName", FilterOperator.Contains, sQuery)];
				}
				this._applySearchs(aTableSearchStatets);
			}
		},

		onRefresh: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},
		onRefresh1: function () {
			var oTable = this.byId("table");
			oTable.getBinding("items").refresh();
		},

		

		_applySearch: function (aTableSearchState) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchState, "Application");
			if (aTableSearchState.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		},
		_applySearchs: function (aTableSearchStatets) {
			var oTable = this.byId("table"),
				oViewModel = this.getModel("worklistView");
			oTable.getBinding("items").filter(aTableSearchStatets, "Application");
			if (aTableSearchStatets.length !== 0) {
				oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
			}
		}

		});
	}
);
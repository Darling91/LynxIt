/*global history */
sap.ui.define([
		"zjblessons/FrogThePepe/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/GroupHeaderListItem",
		"sap/ui/Device",
		"zjblessons/FrogThePepe/model/formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter) {
		"use strict";

		return BaseController.extend("zjblessons.FrogThePepe.controller.Master", {

			formatter: formatter,

			
			onInit : function () {
				// Control state model
				var oList = this.byId("list"),
					oViewModel = this._createViewModel(),
					// Put down master list's original value for busy indicator delay,
					// so it can be restored later on. Busy handling on the master list is
					// taken care of by the master list itself.
					iOriginalBusyDelay = oList.getBusyIndicatorDelay();


				this._oList = oList;
				
				this._oListFilterState = {
					aFilter : [],
					aSearch : []
				};

				this.setModel(oViewModel, "masterView");
			
				oList.attachEventOnce("updateFinished", function(){
				
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				});

				this.getView().addEventDelegate({
					onBeforeFirstShow: function () {
						this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
					}.bind(this)
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onMasterMatched, this);
				this.getRouter().attachBypassed(this.onBypassed, this);
			},

			
			onUpdateFinished : function (oEvent) {
				// update the master list object counter after new data is loaded
				this._updateListItemCount(oEvent.getParameter("total"));
				// hide pull to refresh if necessary
				this.byId("pullToRefresh").hide();
			},

		
			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					// Search field's 'refresh' button has been pressed.
					// This is visible if you select any master list item.
					// In this case no new search is triggered, we only
					// refresh the list binding.
					this.onRefresh();
					return;
				}

				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					this._oListFilterState.aSearch = [new Filter("ModifiedByFullName", FilterOperator.Contains, sQuery)];
				} else {
					this._oListFilterState.aSearch = [];
				}
				this._applyFilterSearch();

			},
			
			

			onRefresh : function () {
				this._oList.getBinding("items").refresh();
			},



			onSelectionChange : function (oEvent) {
				this._showDetail(oEvent.getParameter("listItem"));
				},
				
			_showDetail : function (oItem) {
				this.getRouter().navTo("object",{
					entity:oItem.getCustomData()[0].getKey()	
				});
			},

			/**
			 * Event handler for the bypassed event, which is fired when no routing pattern matched.
			 * If there was an object selected in the master list, that selection is removed.
			 * @public
			 */
			onBypassed : function () {
				this._oList.removeSelections(true);
			},

			/**
			 * Used to create GroupHeaders with non-capitalized caption.
			 * These headers are inserted into the master list to
			 * group the master list's items.
			 * @param {Object} oGroup group whose text is to be displayed
			 * @public
			 * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
			 */
			createGroupHeader : function (oGroup) {
				return new GroupHeaderListItem({
					title : oGroup.text,
					upperCase : false
				});
			},

			/**
			 * Event handler for navigating back.
			 * We navigate back in the browser historz
			 * @public
			 */
			onNavBack : function() {
				history.go(-1);
			},

			/* =========================================================== */
			/* begin: internal methods                                     */
			/* =========================================================== */


			_createViewModel : function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "ModifiedByFullName",
					groupBy: "None"
				});
			},

			/**
			 * If the master route was hit (empty hash) we have to set
			 * the hash to to the first item in the list as soon as the
			 * listLoading is done and the first item in the list is known
			 * @private
			 */
			_onMasterMatched :  function() {
				this.getOwnerComponent().oListSelector.oWhenListLoadingIsDone.then(
					function (mParams) {
						if (mParams.list.getMode() === "None") {
							return;
						}
						var sObjectId = mParams.firstListitem.getBindingContext().getProperty("ModifiedBy");
						this.getRouter().navTo("object", {objectId : sObjectId}, true);
					}.bind(this),
					function (mParams) {
						if (mParams.error) {
							return;
						}
						this.getRouter().getTargets().display("detailNoObjectsAvailable");
					}.bind(this)
				);
			},
			

			/**
			 * Sets the item count on the master list header
			 * @param {integer} iTotalItems the total number of items in the list
			 * @private
			 */
			_updateListItemCount : function (iTotalItems) {
				var sTitle;
				// only update the counter if the length is final
				if (this._oList.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
					this.getModel("masterView").setProperty("/title", sTitle);
				}
			},

			/**
			 * Internal helper method to apply both filter and search state together on the list binding
			 * @private
			 */
			_applyFilterSearch : function () {
				var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
					oViewModel = this.getModel("masterView");
				this._oList.getBinding("items").filter(aFilters, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aFilters.length !== 0) {
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
				} else if (this._oListFilterState.aSearch.length > 0) {
					// only reset the no data text to default when no new search was triggered
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
				}
			},

			/**
			 * Internal helper method to apply both group and sort state together on the list binding
			 * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
			 * @private
			 */
			_applyGroupSort : function (aSorters) {
				this._oList.getBinding("items").sort(aSorters);
			},

			/**
			 * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
			 * @param {string} sFilterBarText the selected filter value
			 * @private
			 */
			_updateFilterBar : function (sFilterBarText) {
				var oViewModel = this.getModel("masterView");
				oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
				oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
			}

		});

	}
);
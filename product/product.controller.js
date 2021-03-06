(function ()
{
	'use strict';

	angular
		.module('app.product')
		.controller('ProductController', ProductController)
		.directive('imageResize', function($q) {
			return {
				restrict: 'A',
				scope: {
					percent: '@imageResizePercent',
					src: '@',
					id: '@'
				},
				link: function (scope, element, attr) {
					var canvas;

					// Creates a new image object from the src
					// Uses the deferred pattern
					var createImage = function (src) {
						var deferred = $q.defer();
						var img = new Image();

						img.onload = function() {
							deferred.resolve(img);
						};
						img.src = src;

						return deferred.promise;
					};

					// Resize image
					var resize = function (img) {
						canvas = document.getElementById(scope.id);
						var ctx = canvas.getContext("2d");

						var newHeight = (img.height * scope.percent) / 100;
						var newWidth = (img.width * scope.percent) / 100;

						canvas.width = newWidth;
						canvas.height = newHeight;
						ctx.drawImage(img, 0, 0, newHeight, newWidth);
					};

					// Create an Image, when loaded pass it on to the resizer
					var startResize = function () {
						createImage(scope.src)
							.then(resize, function () {
								// console.log('error')
							});
					};

					if (scope.percent !== 100) {
						startResize();
					}
				}
			}
		})
		.directive('dragAndDrop', function() {
			return {
				restrict: 'A',
				link: function ($scope, elem, attr) {
					elem.bind('dragover', function (e) {
						e.stopPropagation();
						e.preventDefault();
						$scope.divClass = true;
						//debugger;
						// e.dataTransfer.dropEffect = 'copy';
					});
					elem.bind('dragenter', function (e) {
						e.stopPropagation();
						e.preventDefault();
						$scope.$apply(function () {
							$scope.divClass = true;
						});
					});
					elem.bind('dragleave', function (e) {
						e.stopPropagation();
						e.preventDefault();
						$scope.$apply(function () {
							$scope.divClass = '';
						});
					});
					elem.bind('drop', function (e) {
						e.stopPropagation();
						e.preventDefault();

						var files = e.originalEvent.dataTransfer.files;

						if (files && files[0]) {
							var FR= new FileReader();

							FR.readAsDataURL( files[0] );
							FR.addEventListener("load", function(e) {
								// $timeout(function () {
								$scope.addedImage = e.target.result;
								$scope.$apply();
								$scope.divClass = false;
								// },0);
							});
						}

						if(files.length > 0) {
							$scope.productImgChanged = true;
							var splitIndex=files[0].name.lastIndexOf('.');
							$scope.productImgFileName = files[0].name.substr(0,splitIndex);
							// $scope.productImgFileType = files[0].type.split("/")[1];
							$scope.productImgFileType = 'jpg';
							// if($scope.productImgFileType == 'jpeg'){$scope.productImgFileType = "jpg";}
						}

					});
				}
			}
		});

	/** @ngInject */
	function ProductController($mdToast, $scope, $document, $timeout, $mdDialog, $mdMedia,$rootScope, $mdSidenav, $charge,$productHandler,$filter,notifications,$state,$uploader,$storage, $anchorScroll, $location, $http)
	{
		var vm = this;

		vm.checked = [];
		vm.appInnerState = "default";
		vm.pageTitle="Create New";
		vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
		// vm.selectedAccount = 'creapond';
		vm.selectedProduct = {};
		vm.toggleSidenav = toggleSidenav;

		vm.responsiveReadPane = undefined;
		vm.activeProductPaneIndex = 0;
		vm.dynamicHeight = false;
		vm.showFilters=true;

		vm.scrollPos = 0;
		vm.scrollEl = angular.element('#content');
		//vm.products =vm.productLst;
		//product data getter !
		//vm.selectedProduct = vm.products[0];
		vm.selectedMailShowDetails = false;
		$scope.showInpageReadpane = false;

		// Methods
		vm.checkAll = checkAll;
		vm.closeReadPane = closeReadPane;
		//vm.addProductDialog = addProductDialog;
		vm.addProductDialog = toggleinnerView;
		vm.isChecked = isChecked;
		vm.selectProduct = selectProduct;
		vm.toggleStarred = toggleStarred;
		vm.toggleCheck = toggleCheck;

		//////////


		//// product app ctrl conversion ///
		vm.isCleared=false;
		vm.productlist=[];
		vm.selectedProduct = {};
		vm.filters = {};
		$scope.changeProduct={};
		vm.status="true";
		$scope.categories = [];
		$scope.taxes = ['10', '20', '30', '40'];
		$scope.brands=[];
		$scope.taxGroup=[];
		//$scope.UOMs=[];
		$rootScope.editOff=false;
		var skipGrp= 0,takeGrp=100;
		$scope.startCount=1;
		$scope.pageCount=1;
		$scope.totalCount=0;


		$charge.tax().allgroups(skipGrp,takeGrp,"asc").success(function(data) {
			//
			skipGrp += takeGrp;
			//console.log(data);
			//if($scope.loading) {
			// returned data contains an array of 2 sentences
			for (var i = 0; i < data.length; i++) {
				$scope.taxGroup.push(data[i]);

			}
		}).error(function(data) {
			//console.log(data);
		})

		$charge.uom().getAllUOM('Product_123').success(function(data) {
			$scope.UOMs=[];
			//
			//console.log(data);
			for(var i=0;i<data.length;i++)
			{
				//
				$scope.UOMs.push(data[i]["UOMCode"]);
				//
			}
		}).error(function(data) {
			//console.log(data);
		})

		$rootScope.isBrandLoaded=false;
    $scope.brands=[];
		$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Brand").success(function(data) {
			$scope.brands=[];
			$rootScope.isBrandLoaded=true;
			//console.log(data);
			for(var i=0;i<data.length;i++)
			{
				//
				$scope.brands.push(data[i]["RecordFieldData"]);
			}

		}).error(function(data) {
			//console.log(data);
			$rootScope.isBrandLoaded=false;
		});

		$rootScope.isCategoryLoaded=false;
    $scope.categories=[];
		$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Category").success(function(data) {
			$scope.categories=[];
			$rootScope.isCategoryLoaded=true;
			//console.log(data);
			for(var i=0;i<data.length;i++)
			{
				//
				$scope.categories.push(data[i]["RecordFieldData"]);
			}
		}).error(function(data) {
			//console.log(data);
			$rootScope.isCategoryLoaded=false;
		})

		var skip=0;
		var take=100;
		var response="";
		//newly added code start
		//$scope.isLoad = true;
		vm.productLst=[];
		$scope.lastSet=false;
		$scope.initial=true;

		$scope.more = function(){
			$productHandler.getClient().LoadProductByScroll(skip,take).onComplete(function(data)
			{
				$scope.initial=false;
				if(data.length<take)
					$scope.lastSet=true;
				for (var i = 0; i <data.length; i++) {
					//data[i].select=false;
					vm.productLst.push(data[i]);
				}
				//}
				//
				//$scope.loading = false;
				vm.products =vm.productLst;
				$scope.totalCount=vm.products.length;
				$scope.listLoaded = true;
				$scope.startCount=skip+1;
				skip += take;
				//$scope.pageCount=($scope.totalCount<100)?$scope.totalCount:100;
				//product data getter !
				$scope.openProduct(vm.products[0]);
				//vm.selectedProduct = vm.products[0];
			}).onError(function(data)
			{
				$scope.listLoaded = true;

				//$scope.isSpinnerShown=false;
				//$scope.lastSet=true;


			});
		};
		// we call the function twice to populate the list
		$scope.more();


		$scope.getNextProducts= function (keyword) {
			if(keyword==undefined)
			{
				if(vm.filterName=='All') {
					$productHandler.getClient().LoadProductByScroll(skip, 100).onComplete(function (data) {
						for (var i = 0; i < data.length; i++) {
							vm.products.push(data[i]);
						}
						skip += 100;
						if(data.length<100)
							$scope.lastSet=true;
						else
							$scope.lastSet=false;
					}).onError(function (data) {
						//$scope.isSpinnerShown=false;
						//$scope.lastSet=true;


					});
				}
				else if(vm.filterName=='LowOnStock')
				{
					$charge.product().getProductsLowOnStock(skipType, 100,'asc').success(function (data) {
						vm.products=data;
						vm.filterName='LowOnStock';
						$scope.initial=false;
						if(data.length<100)
							$scope.lastSet=true;
						else
							$scope.lastSet=false;
						skipType+=100;
					}).error(function(data){
						//vm.products=[];
					});
				}
				else if(vm.filterName=='Status')
				{
					$charge.product().getproductsbystatus(status, skipStatusType, 100,'asc').success(function (data) {
						vm.products=data;
						$scope.initial=false;
						if(data.length<100)
							$scope.lastSet=true;
						else
							$scope.lastSet=false;
						vm.filterName='Status';
						skipStatusType+=100;
					}).error(function(data){
						//vm.products=[];
					});
				}
			}
			else if(keyword.length!=0) {
				var skipProduct = 0;
				takeProduct = 100;
				$charge.product().filterByKey(keyword, skipProduct, takeProduct).success(function (data) {
					for (var i = 0; i < data.length; i++) {
						vm.products.push(data[i]);
					}
					//vm.products
				}).error(function (data) {

				});
			}
			else if(keyword.length==0)
			{
				if(vm.filterName=='All') {
					$productHandler.getClient().LoadProductByScroll(skip, 100).onComplete(function (data) {
						for (var i = 0; i < data.length; i++) {
							vm.products.push(data[i]);
						}
						if(data.length<100)
							$scope.lastSet=true;
						else
							$scope.lastSet=false;
					}).onError(function (data) {
						//$scope.isSpinnerShown=false;
						//$scope.lastSet=true;


					});
				}
				else if(vm.filterName=='LowOnStock')
				{
					$charge.product().getProductsLowOnStock(skipType, 100,'asc').success(function (data) {
						vm.products=data;
						vm.filterName='LowOnStock';
						$scope.initial=false;
						if(data.length<100)
							$scope.lastSet=true;
						else
							$scope.lastSet=false;
						skipType+=100;
					}).error(function(data){
						//vm.products=[];
					});
				}
				else if(vm.filterName=='Status')
				{
					$charge.product().getproductsbystatus(status, skipStatusType, 100,'asc').success(function (data) {
						vm.products=data;
						$scope.initial=false;
						if(data.length<100)
							$scope.lastSet=true;
						else
							$scope.lastSet=false;
						vm.filterName='Status';
						skipStatusType+=100;
					}).error(function(data){
						//vm.products=[];
					});
				}
			}

		}

		$scope.getPreviousProducts= function (startIndex) {

			if(startIndex>100) {
				vm.products=[];
				var end = startIndex - 1;
				var start = end - 100;
				$scope.startCount = start + 1;
				skip -= 100;
				$scope.pageCount = ($scope.totalCount < 100) ? $scope.totalCount : skip;
				//$scope.loading = false;
				for (var i = start; i < vm.productLst.length; i++) {
					//data[i].select=false;
					if (i <= end) {
						vm.products.push(vm.productLst[i]);
					}
					//break;
				}
			}
		};


		$scope.enableTaxCode = function(chkTax) {
			document.getElementById('selectTax').disabled=!chkTax;
		};

		$scope.enableStockLevel = function(chkInv) {
			//
			document.getElementById('txtMinStock').disabled=!chkInv;
		};


		$scope.openProduct= function (product) {
			//vm.selectedProduct = product;
			$scope.productReadPaneLoaded = true;
			vm.selectedProduct=angular.copy({});
			//
			$charge.product().getByID(product.guproductID).success(function(dataProduct) {
				//vm.selectedProduct.attachment="";
				//
				vm.selectedProduct=angular.copy(dataProduct[0]);

				//if(vm.selectedProduct.attachment==""){
				//  var productImg = angular.element(document.querySelector('#product-image'));
				//  productImg.attr('src','app/core/cloudcharge/img/noimage.png');
				//}
				vm.selectedProduct.currency=$scope.content.selectCurrency;
				var taxgrp=$filter('filter')($scope.taxGroup, {taxgroupid: product.taxId})[0];
				$charge.stock().getStock(product.guproductID).success(function(data) {
					//
					//vm.selectedProduct = angular.copy(dataProduct[0]);
					//
					vm.selectedProduct.inventoryStock = vm.selectedProduct.sku!=0 ? data.qty : vm.selectedProduct.quantity_of_unit;

					vm.selectedProduct.quantity_of_unit = vm.selectedProduct.inventoryStock;

					vm.selectedProduct.tax=taxgrp==undefined?"":vm.selectedProduct.apply_tax!=0?taxgrp.taxgroupcode:"";
					if(vm.selectedProduct.apply_tax==0)
					{
						$rootScope.editTax=false;
					}
					else
					{
						$rootScope.editTax=true;
					}

					if(vm.selectedProduct.sku==0)
						$rootScope.editInv=false;
					else
						$rootScope.editInv=true;
					$scope.tempEditPlan = vm.selectedProduct;
					$scope.productReadPaneLoaded = false;
				}).error(function(data) {
					vm.selectedProduct = angular.copy(dataProduct[0]);
					vm.selectedProduct.inventoryStock="";
					vm.selectedProduct.tax=taxgrp==undefined?"":vm.selectedProduct.apply_tax!=0?taxgrp.taxgroupcode:"";
					if(vm.selectedProduct.apply_tax==0)
					{
						$rootScope.editTax=false;
					}
					else
					{
						$rootScope.editTax=true;
					}
					$scope.productReadPaneLoaded = false;

					//if($rootScope.selectedProduct.sku==0)
					$rootScope.editInv=false;
					//else
					//    $rootScope.editInv=true;
				})

        skipAuditTrails = 0;
        $scope.auditTrailList = [];
        $scope.moreAuditTrailLoaded = false;
        $scope.loadProductHistory(product);

			}).error(function(data)
			{
				$scope.productReadPaneLoaded = false;

			})

			$scope.editOn=true;

		}

    var skipAuditTrails = 0;
    var takeAuditTrails = 100;
    $scope.auditTrailList = [];
    vm.isAuditTrailLoaded = true;
    $scope.moreAuditTrailLoaded = false;
    vm.productHistryLoading = false;

    $scope.loadProductHistory = function (product) {

      var productId = product.guproductID;
      $scope.noAuditTrailLabel = false;
      vm.isAuditTrailLoaded = true;
      vm.productHistryLoading = true;
      $charge.orderhistory().getAuditHistoryByAccID(productId, skipAuditTrails, takeAuditTrails, 'desc').success(function (data) {
        //console.log(data);
        if(!vm.productHistryLoading){
          skipAuditTrails = 0;
          $scope.auditTrailList = [];
        }

        skipAuditTrails += takeAuditTrails;
        //$scope.auditTrailList=data;
        for (var i = 0; i < data.result.length; i++) {
          var objAuditTrail = data.result[i];
          //objAuditTrail.id=i+1;
          //objAuditTrail.createdDate=objAuditTrail.createdDate.split(' ')[0];
          $scope.auditTrailList.push(objAuditTrail);

        }

        if (data.result.length < takeAuditTrails) {
          vm.isAuditTrailLoaded = false;
        }
        $scope.moreAuditTrailLoaded = true;
        vm.productHistryLoading = false;

      }).error(function (data) {
        //console.log(data);
        if (data == 204) {
          $scope.noAuditTrailLabel = true;
        }
        $scope.moreAuditTrailLoaded = true;
        vm.isAuditTrailLoaded = false;
        vm.productHistryLoading = false;
        //$scope.auditTrailList=[];
      })
    }

    $scope.searchmoreAuditTrails = function (product) {
      $scope.moreAuditTrailLoaded = false;
      $scope.getAuditTrailDetails(product);
    }



		//////
		// Watch screen size to activate responsive read pane
		$scope.$watch(function ()
		{
			return $mdMedia('gt-md');
		}, function (current)
		{
			vm.responsiveReadPane = !current;
		});

		// Watch screen size to activate dynamic height on tabs
		$scope.$watch(function ()
		{
			return $mdMedia('xs');
		}, function (current)
		{
			vm.dynamicHeight = current;
		});

		/**
		 * Select product
		 *
		 * @param product
		 */
		function selectProduct(product)
		{
			//
			$scope.openProduct(product);
			vm.showFilters=false;
			//vm.selectedProduct = product;
		}

		/**
		 * Close read pane
		 */


		function closeReadPane()
		{
			if(vm.updateForm != undefined && vm.updateForm.$dirty) {
				var confirm = $mdDialog.confirm()
					.title('Are you sure?')
					.textContent('Fields have changed and you might have unsaved data. Are you sure you want to leave this page?')
					.ariaLabel('Are you sure?')
					.targetEvent()
					.ok('Yes')
					.cancel('Stay');

				$mdDialog.show(confirm).then(function () {
					vm.updateForm.$pristine = false;
					vm.updateForm.$dirty = false;
					$scope.clearFields();
					vm.activeProductPaneIndex = 0;
					vm.showFilters=true;
					$rootScope.editOff=false;
					//vm.selectedProduct={};
					$timeout(function () {
						vm.scrollEl.scrollTop(vm.scrollPos);
						vm.selectedProduct.attachment="";
						vm.productSelectedTab = 0;
					}, 0);

					$scope.editOn = false;
				}, function () {
				});
			}else{
				$scope.editOff = false;
				vm.activeProductPaneIndex = 0;
				vm.showFilters=true;
				$rootScope.editOff=false;
				//vm.selectedProduct={};
				$timeout(function () {
					vm.scrollEl.scrollTop(vm.scrollPos);
					vm.selectedProduct.attachment="";
					vm.productSelectedTab = 0;
				}, 0);

				$scope.editOn = true;
			}
		}

		/**
		 * Toggle starred
		 *
		 * @param mail
		 * @param event
		 */
		function toggleStarred(mail, event)
		{
			event.stopPropagation();
			mail.starred = !mail.starred;
		}

		/**
		 * Toggle checked status of the mail
		 *
		 * @param mail
		 * @param event
		 */
		function toggleCheck(mail, event)
		{
			if ( event )
			{
				event.stopPropagation();
			}

			var idx = vm.checked.indexOf(mail);

			if ( idx > -1 )
			{
				vm.checked.splice(idx, 1);
			}
			else
			{
				vm.checked.push(mail);
			}
		}

		/**
		 * Return checked status of the mail
		 *
		 * @param mail
		 * @returns {boolean}
		 */
		function isChecked(mail)
		{
			return vm.checked.indexOf(mail) > -1;
		}

		/**
		 * Check all
		 */
		function checkAll()
		{
			if ( vm.allChecked )
			{
				vm.checked = [];
				vm.allChecked = false;
			}
			else
			{
				angular.forEach(vm.products, function (mail)
				{
					if ( !isChecked(mail) )
					{
						toggleCheck(mail);
					}
				});

				vm.allChecked = true;
			}
		}

		/**
		 * Open compose dialog
		 *
		 * @param ev
		 */
		//function addProductDialog(ev)
		//{
		//	$mdDialog.show({
		//		controller         : 'AddProductController',
		//		controllerAs       : 'vm',
		//		locals             : {
		//			selectedMail: undefined,
		//			taxGroups:$scope.taxGroup,
		//			products:vm.products
		//		},
		//		templateUrl        : 'app/main/product/dialogs/compose/compose-dialog.html',
		//		parent             : angular.element($document.body),
		//		targetEvent        : ev,
		//		clickOutsideToClose: true
		//	});
		//	//  .then(function(product) {
		//	//
		//	//  if(product!=undefined ||product !="")
		//	//    vm.productLst.push(product);
		//	//});
		//}

		/**
		 * Toggle sidenav
		 *
		 * @param sidenavId
		 */


		function toggleinnerView(){
			if(vm.activeProductPaneIndex == 0){
				$timeout(function () {
					$scope.inpageReadPaneEdit = false;
					$scope.showInpageReadpane = false;
					vm.activeProductPaneIndex = 1;
					$scope.editCompanyLogoInit();
				});
			}else{
				if(vm.editForm != undefined && vm.editForm.$dirty ) {
					var confirm = $mdDialog.confirm()
						.title('Are you sure?')
						.textContent('Fields have changed and you might have unsaved data. Are you sure you want to leave this page?')
						.ariaLabel('Are you sure?')
						.targetEvent()
						.ok('Yes')
						.cancel('Stay');

					$mdDialog.show(confirm).then(function () {
						vm.editForm.$setPristine = false;
						vm.editForm.$setDirty = false;
						$scope.clearFields();
						vm.activeProductPaneIndex = 0;
					}, function () {
					});
				}else {
					$timeout(function () {
						vm.activeProductPaneIndex = 0;
					});
				}
			}
		}

		function toggleSidenav(sidenavId)
		{
			$mdSidenav(sidenavId).toggle();
		}


		/**
		 * Toggle for edit
		 */
		$scope.inpageReadPaneEdit = false;
		$rootScope.toggleEdit = function()
		{
			$timeout(function(){
				$scope.cropper.croppedImage = vm.selectedProduct.attachment;
			});

			var prodCont = document.getElementById('editProdContainer');

			$rootScope.editOff = !$rootScope.editOff;
			$scope.inpageReadPaneEdit = true;
			if (vm.selectedProduct.apply_tax != 0) {
				$rootScope.editTax = !$rootScope.editTax;
			}

			if (vm.selectedProduct.sku != 0) {
				$rootScope.editInv = !$rootScope.editInv;
			}
			//
			if($rootScope.editOff==true) {

				//$rootScope.UnitSize="flex-85";
				//$rootScope.unitMeasure="flex-15";
				//
				if (vm.selectedProduct.status==1) {
					vm.selectedProduct.status = "true";
				}
				else {
					vm.selectedProduct.status = "false";
				}
				//
				if (vm.selectedProduct.sku == "true") {
					vm.selectedProduct.sku = true
				}
				else if (vm.selectedProduct.sku == true) {
					vm.selectedProduct.sku = true
				}
				else {
					vm.selectedProduct.sku = false;
				}

				if (vm.selectedProduct.apply_tax == "true") {
					vm.selectedProduct.apply_tax = true
				}
				else if (vm.selectedProduct.apply_tax == true) {
					vm.selectedProduct.apply_tax = true
				}
				else {
					vm.selectedProduct.apply_tax = false;
				}
			}
			else if($rootScope.editOff==false)
			{
				$rootScope.UnitSize="flex-70";
				$rootScope.unitMeasure="flex-30";
				//
				if (vm.selectedProduct.status == "true") {
					vm.selectedProduct.status = true
				}
				else {
					vm.selectedProduct.status = false;
				}
				//
				if (vm.selectedProduct.sku == 1) {
					vm.selectedProduct.sku = true
				}
				else {
					vm.selectedProduct.sku = false;
				}

				if (vm.selectedProduct.apply_tax == 1) {
					vm.selectedProduct.apply_tax = true
				}
				else {
					vm.selectedProduct.apply_tax = false;
				}
			}
			$scope.changeProduct=angular.copy(vm.selectedProduct);
			$scope.changeProduct.files=[];
			//prodCont.scrollTop=0;
			//
		}

		$scope.savingEdited = false;

		$scope.saveEdit = function(model)
		{
			var prodCont = document.getElementById('editProdContainer');

			if(vm.updateForm.$valid == true) {
				$scope.savingEdited = true;
				$rootScope.UnitSize = "flex-85";
				$rootScope.unitMeasure = "flex-15";
				var editReq = $scope.changeProduct;
				editReq.guproductID=editReq.guproductID;
				var tempTaxgroup = angular.copy(editReq);
				var taxgrp = $filter('filter')($scope.taxGroup, {taxgroupcode: editReq.tax})[0];
				if (taxgrp != undefined || taxgrp != null)
					editReq.tax = taxgrp = taxgrp.taxgroupid;
				else
					editReq.tax = 0;
				if (editReq.status == "false") {
					editReq.status = false;
				}
				else if (editReq.status == "true") {
					editReq.status = true;
				}
				editReq.apply_tax ? editReq.apply_tax = 1 : editReq.apply_tax = 0;
				editReq.sku ? editReq.sku = 1 : editReq.sku = 0;
				editReq.status ? editReq.status = 1 : editReq.status = 0;

				if ($scope.cropper.croppedImage != 'assets/images/no-image-full.jpg' && $scope.cropper.croppedImage != editReq.attachment) {

					var uploadImageObj = {
						"base64Image": $scope.cropper.croppedImage,
						"fileName": $scope.changeProduct.product_name,
						"format": $scope.productImgFileType,
						"app": "Company",
						"fileType": "image"
					};

					$charge.storage().storeImage(uploadImageObj).success(function (data) {
						var path = data.fileUrl;
						editReq.attachment = path + '?' + Math.floor(Date.now() / 1000);

						editReq.currency = $scope.content.selectCurrency;
						editReq.rate = 1;  // need  to be changed

						$charge.product().update(editReq).success(function (data) {
							//
							if (data.count) {
								//
								for (var i = 0; i < vm.products.length; i++) {
									if (vm.products[i].productId == editReq.productId) {
										vm.products[i] = angular.copy(editReq);
									}
								}
								editReq.tax = tempTaxgroup.tax;

								vm.selectedProduct = editReq;
								$rootScope.editOff = !$rootScope.editOff;
								if (vm.selectedProduct.apply_tax == true || vm.selectedProduct.apply_tax == "true") {
									$rootScope.editTax = !$rootScope.editTax;
								}
								else
									vm.selectedProduct.tax = "";
								if (vm.selectedProduct.sku == true || vm.selectedProduct.sku == "true") {
									$rootScope.editInv = !$rootScope.editInv;
								}
								else {
                  vm.selectedProduct.inventoryStock = "";
                }
                notifications.toast("Record Updated, Product Code " + editReq.code, "success");
                $scope.savingEdited = false;
                $scope.inpageReadPaneEdit=false;

								//prodCont.scrollTop=0;

							}

						}).error(function (data) {
							//console.log(data);
							//prodCont.scrollTop=0;
							notifications.toast("Error when updating record, Product Code " + editReq.code, "error");
							$scope.savingEdited = false;
							$scope.inpageReadPaneEdit=false;
						})
					}).error(function (res) {
						//console.log(res);
						$scope.inpageReadPaneEdit=false;
						$scope.savingEdited = false;
					});
				}
				else {

					if (editReq.apply_tax) {
						editReq.apply_tax = "1";
					}else{
						editReq.apply_tax = "0";
					}

					if (editReq.sku) {
						editReq.sku = "1";
					}else{
						editReq.sku = "0";
					}

					editReq.currency = $scope.content.selectCurrency;
					editReq.rate = 1;  // need  to be changed

					$charge.product().update(editReq).success(function (data) {
						//
						if (data.count) {
							//
							for (var i = 0; i < vm.products.length; i++) {
								if (vm.products[i].productId == editReq.productId) {
									vm.products[i] = angular.copy(editReq);
								}
							}
							editReq.tax = tempTaxgroup.tax;

							vm.selectedProduct = editReq;
							//
							$rootScope.editOff = !$rootScope.editOff;
							if (vm.selectedProduct.apply_tax == true || vm.selectedProduct.apply_tax == "true") {
								//
								$rootScope.editTax = !$rootScope.editTax;
							}
							else
								vm.selectedProduct.tax = "";
							if (vm.selectedProduct.sku == true || vm.selectedProduct.sku == "true") {
								$rootScope.editInv = !$rootScope.editInv;
							}
							else {
								vm.selectedProduct.inventoryStock = "";
							}
							//prodCont.scrollTop=0;
							//$scope.imgWidth = "";
							//$scope.imgHeight = "";
							notifications.toast("Record Updated, Product Code " + editReq.code, "success");
							$scope.savingEdited = false;
							$scope.inpageReadPaneEdit=false;
						}
					}).error(function (data) {
						//console.log(data);
						//prodCont.scrollTop=0;
						notifications.toast("Error when updating record, Product Code " + editReq.code, "error");
						$scope.inpageReadPaneEdit=false;
						$scope.savingEdited = false;
					});
				}
			}else{
				angular.element(document.querySelector('#productEditForm')).find('.ng-invalid:visible:first').focus();
			}
		}


		//depleated products

		$scope.depleatedProduct= function () {
			$scope.depleatedProducts=[];
			for(var i=0;i<vm.products.length;i++)
			{
				if(vm.products[i].sku==1)
				{
					$scope.depleatedProducts.push(vm.products[i]);
				}
			}
			vm.products=$scope.depleatedProducts;
		}

		$scope.isProductListLoaded = true;
		$scope.getAllProducts= function () {
			$scope.isProductListLoaded = false;
			var skip=0;
			var take=100;
			vm.productLst=[];
			$productHandler.getClient().LoadProductByScroll(skip,take).onComplete(function(data)
			{
				//
				//if($scope.loading) {
				for (var i = 0; i < data.length; i++) {
					//data[i].select=false;
					vm.productLst.push(data[i]);
				}
				//}
				//
				//$scope.loading = false;
				vm.products =vm.productLst;

				$scope.totalCount=vm.products.length;
				$scope.startCount=skip+1;
				skip += take;
				$scope.pageCount=($scope.totalCount<100)?$scope.totalCount:100;
				//product data getter !
				// $scope.openProduct(vm.products[0]);
				$scope.isProductListLoaded = true;
				//vm.selectedProduct = vm.products[0];
			}).onError(function(data)
			{
				//$scope.isSpinnerShown=false;
				//$scope.lastSet=true;

				$scope.isProductListLoaded = true;

			});
		}

		//29-08-2016
		var skipProduct,takeProduct;
		var tempList;
		$scope.loadByKeyword= function (keyword) {

			if(vm.productLst.length==100) {
				if (keyword.length == 3) {
					skipProduct = 0;
					takeProduct = 100;
					tempList = [];
					$charge.product().filterByKey(keyword, skipProduct, takeProduct).success(function (data) {
						for (var i = 0; i < data.length; i++) {
							tempList.push(data[i]);
						}
						vm.products=tempList;
						//skipProduct += takeProduct;
						//$scope.loadPaging(keyword, skipProduct, takeProduct);
					}).error(function (data) {
						vm.products = [];
						vm.selectedProduct = null;
					});
				}
				else if (keyword.length == 0 || keyword == null) {
					vm.products = vm.productLst;
				}
				//else if(keyword.length>3)
				//{
				//  for(var i=0;i<vm.products.length;i++)
				//  {
				//    if(vm.products[i].)
				//  }
				//}
			}
		}

		$scope.loadPaging= function (keyword,skip, take) {
			$charge.product().filterByKey(keyword, skip, take).success(function (data) {
				for(var i=0;i<data.length;i++)
				{
					tempList.push(data[i]);
				}
				skip += take;
				$scope.loadPaging(keyword, skip, take);
			}).error(function (data) {
				if(tempList.length>0) {
					vm.products = tempList;
					$scope.openProduct(vm.products[0]);
				}
				else
				{
					vm.products=[];
					vm.selectedProduct=null;
				}
			});
		}

		$scope.searchKeyPressProduct = function (event,keyword){
			if(event.keyCode === 13)
			{
				if(!$scope.lastSet) {
					var productObj=$filter('filter')(vm.products, {code: keyword.trim()})[0];
					if(productObj==null || productObj ==undefined) {
						$scope.getNextProducts(keyword);
					}
				}
			}
		}
		//custom filter orderby start
		$scope.reverse=true;
		$scope.showBoth=false;
		$scope.showCatBoth=false;
		$scope.showBrandBoth=false;
		$scope.showAmtBoth=false;
		$scope.showStatBoth=false;
		//$scope.propertyName = 'product_name';
		$scope.sortBy = function(propertyName,status,property) {
			//$scope.reverse =!reverse;
			//
			vm.products=$filter('orderBy')(vm.products, propertyName, $scope.reverse)
			$scope.reverse =!$scope.reverse;
			if(status!=null) {
				if(property=='Name')
				{
					$scope.showBoth = status;
					$scope.showCatBoth = false;
					$scope.showBrandBoth=false;
					$scope.showAmtBoth = false;
					$scope.showStatBoth = false;
				}
				if(property=='Category')
				{
					$scope.showCatBoth = status;
					$scope.showBoth = false;
					$scope.showBrandBoth=false;
					$scope.showAmtBoth = false;
					$scope.showStatBoth = false;
				}
				if(property=='Brand')
				{
					$scope.showBrandBoth = status;
					$scope.showBoth = false;
					$scope.showCatBoth=false;
					$scope.showAmtBoth = false;
					$scope.showStatBoth = false;
				}
				if(property=='Amount')
				{
					$scope.showAmtBoth = status;
					$scope.showBoth = false;
					$scope.showBrandBoth = false;
					$scope.showCatBoth=false;
					$scope.showStatBoth = false;
				}
				if(property=='Status')
				{
					$scope.showStatBoth = status;
					$scope.showBoth = false;
					$scope.showAmtBoth = false;
					$scope.showBrandBoth = false;
					$scope.showCatBoth=false;
				}
			}
		};
		//custom filter order
		//active/inactive filter product start
		vm.filterName='All';
		var skipStatusType,takeStatusType;
		$scope.getProductByStatus= function (status) {
			skipStatusType=0,takeStatusType=100;
			$charge.product().getproductsbystatus(status, skipStatusType, takeStatusType,'asc').success(function (data) {
				vm.products=data;
				$scope.initial=false;
				if(data.length<takeStatusType)
					$scope.lastSet=true;
				else
					$scope.lastSet=false;
				vm.filterName='Status';
				skipStatusType+=takeStatusType;
			}).error(function(data){
				vm.products=[];
			});
		}
		//active/inactive filter product end

		/*
		 *  Low on product filter method start
		 */
		var skipType,takeType;
		$scope.getLowOnStockProducts= function () {
			skipType=0,takeType=100;
			$charge.product().getProductsLowOnStock(skipType, takeType,'asc').success(function (data) {
				vm.products=data;
				vm.filterName='LowOnStock';
				$scope.initial=false;
				if(data.length<takeType)
					$scope.lastSet=true;
				else
					$scope.lastSet=false;
				skipType+=takeType;
			}).error(function(data){
				vm.products=[];
			});
		}
		/*
		 *  Low on product filter method end
		 */

		//get all products filter start
		$scope.getAllProductsFilter= function () {
			vm.filterName='All';
			vm.products=vm.productLst;
			$scope.initial=false;
			if(vm.products.length<100)
				$scope.lastSet=true;
			else
				$scope.lastSet=false;
		}
		//get all products filter end


		//addProduct set
		$scope.filters = {};
		$scope.changeProduct={};
		$scope.status="true";
		//$scope.categories = [];
		$scope.taxes = ['10', '20', '30', '40'];

		var vm = this;


		//merging existing code

		$scope.content = {};
		$scope.content.files=[];
		$scope.content.attachment='assets/images/no-preview.jpg';
		$scope.content.descroption="";
		$scope.content.category="";
		$scope.content.brand="";
		$scope.content.uom="";
		$scope.content.selectCurrency="";
		$scope.content.status=true;
		$scope.toggleActive = true;
		//$scope.Currencies=['LKR','USD','GBP'];
		$scope.newUom=false;
		$scope.newCat=false;
		$scope.newBrand=false;
		$scope.isAdded=false;
		$scope.buttonName="Browse";

		$scope.addCat = function(ev)
		{
			$scope.content.category = "";
			$scope.content.newCatVal = "";
			$scope.newCat=true;
			$scope.requireCat=true;

			$mdDialog.show({
				controller: ProductController,
				templateUrl: 'app/main/product/dialogs/prompt-dialog-cat.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:false
			})
				.then(function(result) {
					if(result != undefined)
          {
            $scope.categories.push(result);
            $scope.content.category=result;
          }
				}, function() {
				});

			//var confirm = $mdDialog.prompt()
			//  .title('Enter Category')
			//  .placeholder('Category')
			//  .ariaLabel('Category')
			//  .targetEvent(ev)
			//  .ok('Add')
			//  .cancel('Cancel');
			//
			//$mdDialog.show(confirm).then(function(result) {
			//  $scope.saveCategory(result);
			//}, function() {
			//  $scope.newCat=false;
			//});
		}

		$scope.promptInput = "";
		$scope.promptInputSetup = function(form, updateMethod){
			if(form.$valid){
				updateMethod($scope.promptInput);
				//if(!$scope.isDuplicateCat && !$scope.isDuplicateBrand && !$scope.isDuplicate) {
				//  $mdDialog.hide();
				//}
			}else{
				angular.element(document.querySelector('#promptForm')).find('.ng-invalid:visible:first').focus();
			}
		}

		$scope.closeDialog = function () {
			$scope.newCat=false;
			$scope.newBrand=false;
			$scope.newUom=false;
			$mdDialog.hide();
		}


		$scope.cancelCat= function () {
			//$scope.newCatVal = "";
			$scope.newCat=false;
			//$scope.requireCat=false;
		}

		$scope.addBrand = function(ev)
		{
			//
			$scope.content.brand = "";
			$scope.content.newBrandVal= "";
			$scope.newBrand=true;
			//$scope.requireBrand=true;

			$mdDialog.show({
				controller: ProductController,
				templateUrl: 'app/main/product/dialogs/prompt-dialog-brand.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:false
			})
				.then(function(result) {
					if(result != undefined)
          {
            $scope.brands.push(result);
            $scope.content.brand=result;
          }
				}, function() {
				});

			//var confirm = $mdDialog.prompt()
			//  .title('Enter Brand Name')
			//  .placeholder('Brand Name')
			//  .ariaLabel('Brand Name')
			//  .targetEvent(ev)
			//  .ok('Add')
			//  .cancel('Cancel');
			//
			//
			//
			//$mdDialog.show(confirm).then(function(result) {
			//  $scope.saveBrand(result);
			//}, function() {
			//  $scope.newBrandVal= "";
			//  $scope.newBrand=false;
			//});
		}

		$scope.cancelBrand= function () {
			$scope.newBrandVal= "";
			$scope.newBrand=false;
			//$scope.requireBrand=false;
		}


		$scope.addUOM = function(ev)
		{
			$scope.content.newUOMVal = "";
			$scope.content.uom = "";
			$scope.newUom=true;
			//$scope.requireUOM=true;

			$mdDialog.show({
				controller: ProductController,
				templateUrl: 'app/main/product/dialogs/prompt-dialog-uom.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose:false
			})
				.then(function(result) {
					if(result != undefined)
          {
            $scope.UOMs.push(result);
            $scope.content.uom=result;
          }
				}, function() {
				});
			//var confirm = $mdDialog.prompt()
			//  .title('Enter UOM')
			//  .placeholder('UOM')
			//  .ariaLabel('UOM')
			//  .targetEvent(ev)
			//  .ok('Add')
			//  .cancel('Cancel');
			//
			//
			//
			//$mdDialog.show(confirm).then(function(result) {
			//  $scope.saveUOM(result);
			//}, function() {
			//  $scope.newUom=false;
			//});
		}

		$scope.cancelUOM= function () {
			//
			$scope.newUom=false;
			//$scope.requireUOM=false;

		}

		//Image Uploader===================================

		$scope.cropper = {};
		$scope.cropper.sourceImage = null;
		$scope.cropper.croppedImage = 'assets/images/no-image-full.jpg';
		$scope.bounds = {};
		$scope.bounds.left = 0;
		$scope.bounds.right = 0;
		$scope.bounds.top = 0;
		$scope.bounds.bottom = 0;
		$scope.productImgFileName = "";
		$scope.productImgSrc = "";
		$scope.productImgChanged = false;
		var files = [];

		// (function () {
		// 	var canvas = document.createElement('canvas');
		// 	var ctx = canvas.getContext('2d');
		// 	ctx.canvas.width = 180;
		// 	ctx.canvas.height = 180;
		// 	var img = new Image();
		// 	img.setAttribute('crossOrigin', 'anonymous');
		// 	img.onload = function() {
		// 		ctx.drawImage(img, 0, 0);
		// 		$scope.cropper.croppedImage = $scope.template.croppedLogo = canvas.toDataURL("image/png", "");
		// 		$scope.tempCompanyLogo = $scope.cropper.croppedImage;
		// 	}
		// 	img.src = 'https://ccresourcegrpdisks974.blob.core.windows.net/b2c/images/dummy_logo.jpg';
		// })();

		$scope.triggerImgInput = function () {
			$scope.addedImage = false;

			angular.element(document.querySelector('#productImageInput')).trigger('click');
			angular.element(document.querySelector('#productImageInput')).on('change', function () {
				files = this.files;

				if (this.files && this.files[0]) {
					var FR= new FileReader();

					FR.readAsDataURL( this.files[0] );
					FR.addEventListener("load", function(e) {
						$timeout(function () {
							$scope.addedImage = e.target.result;
						},0);
					});
				}

				if(files.length > 0) {
					$scope.productImgChanged = true;
					var splitIndex=files[0].name.lastIndexOf('.');
					$scope.productImgFileName = files[0].name.substr(0,splitIndex);
					// $scope.productImgFileType = files[0].type.split("/")[1];
					$scope.productImgFileType = 'jpg';
					// if($scope.productImgFileType == 'jpeg'){$scope.productImgFileType = "jpg";}
				}
			});
		}

		$scope.$watch(function () {
			angular.element('#dragZone').bind('dragover', function(e){
				// console.log('Over');
			})
		});

		// Drag & Drop image #########################################################

		// Drag & Drop image #########################################################

		//Image Uploader 15_06_2017
		vm.showControls = false;
		vm.fit = false;
		$scope.editImageOn = false;

		$scope.editCompanyLogoInit = function () {
			$scope.tempCompanyLogo = angular.copy($scope.cropper.croppedImage);
			$timeout(function(){
				$scope.editImageOn = true;
				//$scope.cropper.croppedImage ? $scope.addedImage = $scope.cropper.croppedImage : $scope.addedImage=false;
			});
		};

		$scope.editCompanyCancel = function () {
			$scope.cropper.croppedImage = $scope.tempCompanyLogo;
			$timeout(function(){
				$scope.editImageOn = false;
				$scope.addedImage = false;
			});
		};

		$scope.retryImageUpload = function () {
			$timeout(function(){
				$scope.editImageOn = false;
				$scope.editImageOn = true;
				$scope.addedImage = false;
				$scope.cropper.croppedImage = $scope.tempCompanyLogo;
			});
		};

		vm.myButtonLabels = {
			rotateLeft: '',
			rotateRight: '',
			zoomIn: '<i class="material-icons">zoom_in</i>',
			zoomOut: '<i class="material-icons">zoom_out</i>',
			fit: '<i class="material-icons">filter_center_focus</i>',
			crop: ''
		};

		vm.updateResultImage = function(base64) {
			vm.resultImage = base64;
			$scope.cropper.croppedImage = vm.resultImage;
			$scope.$apply();
		};

		vm.doneImageCropping = function(cropperApi) {
			// angular.element('#imageCropElement').trigger('Cropped');
			$timeout(function(){
				$scope.editImageOn = false;
				$scope.addedImage = false;
			});
		};

		vm.cropperApi = function(cropperApi) {
			cropperApi.zoomOut(1.01);
			cropperApi.zoomIn(1.01);
			cropperApi.fit();
			$scope.cropper.croppedImage = cropperApi.crop();
			//cropperApi.remove();
			$scope.$apply();
		};
		//Image Uploader 15_06_2017

		//Image Uploader===================================

		$scope.trackInventoryClicked = function(sku){
		  if(!sku){
			$scope.content.quantity_of_unit = 0;
		  }
		}

		$scope.productSubmit=false;


		$scope.saveProduct = function(){

			$scope.isAdded=false;
			if(vm.editForm.$valid == true) {
				$scope.productSubmit=true;
				//if ($scope.newCat != true && $scope.newUom != true && $scope.newBrand != true) {
				//  if ($scope.content.category != "" && $scope.content.brand != "" && $scope.content.uom != "") {
				if (isAvailable) {
					if ($scope.content.selectCurrency != "" && $scope.content.selectCurrency != undefined) {

						if($scope.cropper.croppedImage != 'assets/images/no-image-full.jpg'){
							var uploadImageObj = {
								"base64Image": $scope.cropper.croppedImage,
								"fileName": $scope.content.product_name,
								"format": $scope.productImgFileType,
								"app": "Company",
								"fileType": "image"
							}
							$charge.storage().storeImage(uploadImageObj).success(function (data) {
								var path = data.fileUrl;
								$scope.spinnerAdd = true;

								if ($scope.content.quantity_of_unit == null || $scope.content.quantity_of_unit == "")
									$scope.content.quantity_of_unit = 0;
								if ($scope.content.cost_price == null || $scope.content.cost_price == "")
									$scope.content.cost_price = 0;

								//if ($scope.content.apply_tax == undefined || $scope.content.apply_tax == null || $scope.content.apply_tax == "false" || $scope.content.apply_tax == false) {
								//  $scope.content.apply_tax = false;
								//  $scope.content.tax = "0";
								//}
								//else {
								//  var taxgrp = $filter('filter')($scope.taxGroup, {taxgroupcode: $scope.content.tax.trim()})[0];
								//
								//  $scope.content.tax = taxgrp.taxgroupid;
								//}
								//
								if ($scope.content.sku == undefined || $scope.content.sku == null || $scope.content.sku == "false" || $scope.content.sku == false) {
									$scope.content.sku = 0;
									$scope.content.minimum_stock_level = 0;
								}
								//if($scope.content.files !=null) {
								$scope.content.attachment = path;
								// }

								$scope.content.apply_tax = $scope.content.apply_tax ? 1 : 0;
								$scope.content.status = 1;

								$scope.content.currency = $scope.content.selectCurrency;
								$scope.content.rate = 1;  // need  to be changed

								var req = $scope.content;

								$charge.product().store(req).success(function (data) {
									if (data.id) {
										notifications.toast("Record Inserted, Product Code " + req.code, "success");
										$scope.isAdded = true;
										$rootScope.isCleared = true;
										var product = {}
										product.code = req.code;
										product.product_name = req.product_name;
										product.price_of_unit = req.price_of_unit;
										product.status = req.status;
										vm.products.unshift(product);
										vm.productLst.unshift(product);
                    $scope.getAllProducts();
                    vm.closeReadPane();
										//$rootScope.productlist.push(product);
                    $scope.clearFields();

									}
								}).error(function (data) {
									//console.log(data);
								})
							}).error(function (res) {
								//console.log(res);
							});
							// else {
							// 	$scope.spinnerAdd = true;
							// 	//$scope.content.product_name=self.searchText;
							// 	//
							// 	if ($scope.content.quantity_of_unit == null || $scope.content.quantity_of_unit == "")
							// 		$scope.content.quantity_of_unit = 0;
							// 	if ($scope.content.cost_price == null || $scope.content.cost_price == "")
							// 		$scope.content.cost_price = 0;
							// 	if($scope.content.tax==null ||$scope.content.tax=="")
							// 		$scope.content.tax="0";
							//
							// 	if ($scope.content.apply_tax == undefined || $scope.content.apply_tax == null || $scope.content.apply_tax == "false" || $scope.content.apply_tax == false) {
							// 		$scope.content.apply_tax = false;
							// 		$scope.content.tax = "0";
							// 	}
							// 	else {
							// 		var taxgrp = $filter('filter')($scope.taxGroup, {taxgroupcode: $scope.content.tax.trim()})[0];
							// 		//
							// 		$scope.content.tax = taxgrp.taxgroupid;
							// 	}
							//
							//
							// 	$scope.content.apply_tax = $scope.content.apply_tax ? 1 : 0;
							//
							// 	if ($scope.content.sku == undefined || $scope.content.sku == null || $scope.content.sku == "false" || $scope.content.sku == false) {
							// 		$scope.content.sku = 0;
							// 		$scope.content.minimum_stock_level = 0;
							// 	}
							// 	//if($scope.content.files !=null) {
							// 	//$scope.content.attachment = $scope.content.files;
							// 	// }
							// 	$scope.content.attachment = "app/core/cloudcharge/img/noimage.png";
							//
							// 	$scope.content.currency = $scope.content.selectCurrency;
							// 	$scope.content.rate = 1;  // need  to be changed
							//
							// 	var req = $scope.content;
							//
							// 	$charge.product().store(req).success(function (data) {
							// 		if (data.id) {
							// 			//console.log(data);
							// 			$scope.productSubmit=false;
							// 			notifications.toast("Record Inserted, Product Code " + req.code, "success");
							// 			$scope.isAdded = true;
							// 			$scope.spinnerAdd = false;
							// 			$scope.clearFields();
							// 			$rootScope.isCleared = true;
							// 			var product = {}
							// 			product.code = req.code;
							// 			product.product_name = req.product_name;
							// 			product.price_of_unit = req.price_of_unit;
							// 			product.status = req.status;
							// 			vm.products.unshift(product);
							// 			vm.productLst.unshift(product);
							// 			$scope.imgWidth = "";
							// 			$scope.imgHeight = "";
							//
							// 		}
							//
							// 		window.scrollTo(0, 0);
							//
							// 	}).error(function (data) {
							// 		//console.log(data);
							// 		$scope.productSubmit=false;
							// 	})
							// }
						}else{
							$scope.spinnerAdd = true;

							if ($scope.content.quantity_of_unit == null || $scope.content.quantity_of_unit == "")
								$scope.content.quantity_of_unit = 0;
							if ($scope.content.cost_price == null || $scope.content.cost_price == "")
								$scope.content.cost_price = 0;

							//if ($scope.content.apply_tax == undefined || $scope.content.apply_tax == null || $scope.content.apply_tax == "false" || $scope.content.apply_tax == false) {
							//  $scope.content.apply_tax = false;
							//  $scope.content.tax = "0";
							//}
							//else {
							//  var taxgrp = $filter('filter')($scope.taxGroup, {taxgroupcode: $scope.content.tax.trim()})[0];
							//
							//  $scope.content.tax = taxgrp.taxgroupid;
							//}
							//
							if ($scope.content.sku == undefined || $scope.content.sku == null || $scope.content.sku == "false" || $scope.content.sku == false) {
								$scope.content.sku = 0;
								$scope.content.minimum_stock_level = 0;
							}
							//if($scope.content.files !=null) {
							$scope.content.attachment = $scope.cropper.croppedImage;
							// }

							$scope.content.apply_tax = $scope.content.apply_tax ? 1 : 0;
							$scope.content.status = 1;

							$scope.content.currency = $scope.content.selectCurrency;
							$scope.content.rate = 1;  // need  to be changed

							var req = $scope.content;

							$charge.product().store(req).success(function (data) {
								if (data.id) {
									notifications.toast("Record Inserted, Product Code " + req.code, "success");
									$scope.isAdded = true;
									$rootScope.isCleared = true;
									var product = {}
									product.code = req.code;
									product.product_name = req.product_name;
									product.price_of_unit = req.price_of_unit;
									product.status = req.status;
									vm.products.unshift(product);
									vm.productLst.unshift(product);
                  $scope.getAllProducts();
                  vm.closeReadPane();
									//$rootScope.productlist.push(product);
                  $scope.clearFields();

								}
							}).error(function (data) {
								//console.log(data);
							})
						}

					}else {
						notifications.toast("Please add base currency before creating products.", "error");
					}
				}else {
					$scope.chkProductCode($scope.content.code);
				}
				//}
				//else {
				//  notifications.toast("Please fill all the details", "error");
				//}
				//}
				//else//This is done because the HTML simple validation might work and enter the submit, however the form can still be invalid
				//{
				//  notifications.toast("Please fill all the details", "error");
				//}
			}else{
				angular.element(document.querySelector('#addProductForm')).find('.ng-invalid:visible:first').focus();
			}

		}

		$scope.clearFields= function () {
			$scope.content.product_name='';
			//self.searchText='';
			$scope.content.files=[];
			$scope.content.descroption="";
			$scope.content.code="";
			$scope.content.quantity_of_unit="";
			$scope.content.price_of_unit=null;
			$scope.content.cost_price=null;
			$scope.content.tax="0";
			$scope.content.sku=false;
			$scope.content.apply_tax=false;
			$scope.content.status=true;
			$scope.content.uom="";
			$scope.content.category="";
			$scope.content.brand="";
			//$scope.content.files=[];
			$scope.content.minimum_stock_level=0;
			//$('#deletebtn').click();
			$scope.cropper = {};
      vm.editForm.$setPristine();
      vm.editForm.$setUntouched();
			//context.clearRect(0, 0, canvas.width, canvas.height);
			//$state.go($state.current, {}, {reload: $scope.isAdded});
		}
		$scope.backToMain = function(ev)
		{
			location.href = "#/main";
		}

		var isAvailable;
		$scope.validateProduct=function (ev)
		{
			if(ev!=null) {
				if (ev.length < 3) {
					//notifications.toast("Please enter more than 3 characters", "error");
					//$scope.content.code = "";
				}
				else {
					$scope.chkProductCode(ev);
				}
			}
			//var products=$rootScope.productlist;

			//var txtEntered=ev;
			//products.forEach(function(product){
			//  if(product.code.toLowerCase()==txtEntered.toLowerCase())
			//  {
			//    notifications.toast(txtEntered +" has been already added" , "error");
			//    $scope.content.code="";
			//  }
			//});
		}

		$scope.chkProductCode= function (ev) {
			$charge.product().getByCode(ev).success(function (data) {
				isAvailable=true;
				notifications.toast(ev +" has been already added" , "error");
				$scope.content.code="";
			}).error(function (status) {
				//
				if(status!=204) {
					notifications.toast("Error occurred while checking product code", "error");
					isAvailable=false;
				}
				else
				{
					isAvailable=true;
				}
			});
		}
		//18-07-2016
		$scope.content.selectCurrency="";
		$charge.settingsapp().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
			$scope.content.selectCurrency=data[0]['RecordFieldData'];
		}).error(function(data) {
			$scope.content.selectCurrency="";
		})



		//save uom
		$scope.UOMs=[];
		$scope.saveUOM = function(uomval)
		{

			if(uomval!=undefined) {
				$scope.isDuplicate = false;
				if ($scope.UOMs.length != 0) {
					for (var i = 0; i < $scope.UOMs.length; i++) {
						if ($scope.UOMs[i] == uomval) {
							notifications.toast("UOM Code is already exist.", "error");
							$scope.isDuplicate = true;
							break;
						}
					}
					if (!$scope.isDuplicate) {
						var req = {
							"GUUOMID": "123",
							"GUUOMTypeID": "supplier1",
							"GUTranID": "12345",
							"CommitStatus": "Active",
							"UOMCode": uomval,
							"uomApplicationMapperDetail": [{
								"GUApplicationID": "Product_123"
							}],
							"uomConversionDetails": [{
								"FromUOMCode": uomval,
								"Qty": "10",
								"ToUOMCode": uomval
							}]

						}

						$charge.uom().store(req).success(function (data) {

							if (data.error = "00000") {
								//$scope.UOMs.push(uomval);
								$scope.newUom = false;
								$mdDialog.hide(uomval);
								notifications.toast("UOM has been added", "success");
							}
						}).error(function (data) {
							//console.log(data);
							$scope.newUom = false;
						})
					}

				}
				else {
					var req = {
						"GUUOMID": "123",
						"GUUOMTypeID": "supplier1",
						"GUTranID": "12345",
						"CommitStatus": "Active",
						"UOMCode": uomval,
						"uomApplicationMapperDetail": [{
							"GUApplicationID": "Product_123"
						}],
						"uomConversionDetails": [{
							"FromUOMCode": uomval,
							"Qty": "10",
							"ToUOMCode": uomval
						}]

					}

					$charge.uom().store(req).success(function (data) {

						if (data.error = "00000") {
							//$scope.UOMs.push(uomval);
							$scope.newUom = false;
							$mdDialog.hide(uomval);
							notifications.toast("UOM has been added", "success");

						}
					}).error(function (data) {
						//console.log(data);
						$scope.newUom = false;
					})
				}
			}
			else
			{
				//notifications.toast("UOM Code cannot be empty.", "error");
			}

		}

		// save brand
		$scope.saveBrand = function(brandval)
		{
			if(brandval!=undefined) {
				$scope.isDuplicateBrand = false;
				if ($scope.brands.length != 0) {
					for (var i = 0; i < $scope.brands.length; i++) {
						if ($scope.brands[i] == brandval) {
							$scope.isDuplicateBrand = true;
							notifications.toast("Brand is already exist.", "error");
							break;
						}
					}
					if (!$scope.isDuplicateBrand) {
						if ($rootScope.isBrandLoaded) {
							var req = {
								"RecordName": "CTS_CommonAttributes",
								"FieldName": "Brand",
								"RecordFieldData": brandval
							}

							$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {
								//console.log(data);
								if (data.error == "00000") {
									//$scope.brands.push(brandval);
									$scope.newBrand = false;
									$mdDialog.hide(brandval);
									notifications.toast("Brand has been added.", "success");
									//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
								}
							}).error(function (data) {
								//console.log(data);
								$scope.newBrand = false;
							})
						}
						else {
							var req = {
								"GURecID": "123",
								"RecordType": "CTS_CommonAttributes",
								"OperationalStatus": "Active",
								"RecordStatus": "Active",
								"Cache": "CTS_CommonAttributes",
								"Separate": "Test",
								"RecordName": "CTS_CommonAttributes",
								"GuTranID": "12345",
								"RecordCultureName": "CTS_CommonAttributes",
								"RecordCode": "CTS_CommonAttributes",
								"commonDatafieldDetails": [
									{
										"FieldCultureName": "Brand",
										"FieldID": "124",
										"FieldName": "Brand",
										"FieldType": "BrandType",
										"ColumnIndex": "1"
									}],
								"commonDataValueDetails": [
									{
										"RowID": "1452",
										"RecordFieldData": brandval,
										"ColumnIndex": "1"
									}]
							}

							$charge.settingsapp().store(req).success(function (data) {
								$rootScope.isBrandLoaded = true;
								if (data[0].error == "00000") {
									//$scope.brands.push(brandval);
									$scope.newBrand = false;
									$mdDialog.hide(brandval);
									notifications.toast("Brand has been added.", "success");
									//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
								}
							}).error(function (data) {
								//console.log(data);
								$scope.newBrand = false;
							})
						}
					}
				}

				else {
					var req = {
						"GURecID": "123",
						"RecordType": "CTS_CommonAttributes",
						"OperationalStatus": "Active",
						"RecordStatus": "Active",
						"Cache": "CTS_CommonAttributes",
						"Separate": "Test",
						"RecordName": "CTS_CommonAttributes",
						"GuTranID": "12345",
						"RecordCultureName": "CTS_CommonAttributes",
						"RecordCode": "CTS_CommonAttributes",
						"commonDatafieldDetails": [
							{
								"FieldCultureName": "Brand",
								"FieldID": "124",
								"FieldName": "Brand",
								"FieldType": "BrandType",
								"ColumnIndex": "1"
							}],
						"commonDataValueDetails": [
							{
								"RowID": "1452",
								"RecordFieldData": brandval,
								"ColumnIndex": "1"
							}]
					}

					$charge.settingsapp().store(req).success(function (data) {
						$rootScope.isBrandLoaded = true;
						if (data[0].error == "00000") {
							//$scope.brands.push(brandval);
							$scope.newBrand = false;
							$mdDialog.hide(brandval);
							notifications.toast("Brand has been added.", "success");
							//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
						}
					}).error(function (data) {
						//console.log(data);
						$scope.newBrand = false;
					})
				}
			}
			else
			{
				//notifications.toast("Brand cannot be empty.", "error");
			}
		}

		//save Category

		$scope.switchInfoPane = function (state, product) {
			if(state=='show'){
				$scope.showInpageReadpane = true;
				$scope.showEmbedForm=false;
				vm.selectProduct(product);
			}else if(state=='close'){
				if($scope.inpageReadPaneEdit){
					vm.editForm.$setPristine = false;
					vm.editForm.$setDirty = false;
					vm.selectedPlan = $scope.tempEditPlan;
					$scope.inpageReadPaneEdit=false;
				}else{
					$scope.showInpageReadpane = false;
					$scope.inpageReadPaneEdit=false;
				}
			}
		};

		$scope.saveCategory = function(cateval) {

			if(cateval !=undefined) {
				$scope.isDuplicateCat = false;
				if ($scope.categories.length != 0) {
					for (var i = 0; i < $scope.categories.length; i++) {
						if ($scope.categories[i] == cateval) {
							$scope.isDuplicateCat = true;
							notifications.toast("Category is already exist.", "error");
							break;
						}
					}
					if (!$scope.isDuplicateCat) {
						if ($rootScope.isCategoryLoaded) {
							var req = {
								"RecordName": "CTS_CommonAttributes",
								"FieldName": "Category",
								"RecordFieldData": cateval
							}

							$charge.settingsapp().insertDuoBaseValuesAddition(req).success(function (data) {

								if (data.error == "00000") {
									//$scope.categories.push(cateval);
									$scope.newCat = false;
									//$scope.newProductAdded = true;
									notifications.toast("Category is added.", "success");
									$mdDialog.hide(cateval);
									//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
								}
							}).error(function (data) {
								//console.log(data);
								$scope.newCat = false;
							})
						}
						else {
							var req = {
								"GURecID": "123",
								"RecordType": "CTS_CommonAttributes",
								"OperationalStatus": "Active",
								"RecordStatus": "Active",
								"Cache": "CTS_CommonAttributes",
								"Separate": "Test",
								"RecordName": "CTS_CommonAttributes",
								"GuTranID": "12345",
								"RecordCultureName": "CTS_CommonAttributes",
								"RecordCode": "CTS_CommonAttributes",
								"commonDatafieldDetails": [
									{
										"FieldCultureName": "Category",
										"FieldID": "124",
										"FieldName": "Category",
										"FieldType": "CategoryType",
										"ColumnIndex": "0"
									}],
								"commonDataValueDetails": [
									{
										"RowID": "1452",
										"RecordFieldData": cateval,
										"ColumnIndex": "0"
									}]
							}

							$charge.settingsapp().store(req).success(function (data) {
								$rootScope.isCategoryLoaded = true;
								if (data[0].error == "00000") {
									//$scope.categories.push(cateval);
									$scope.newCat = false;
									notifications.toast("Category is added.", "success");
									$mdDialog.hide(cateval);
									//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
								}
							}).error(function (data) {
								//console.log(data);
								$scope.newCat = false;
							})
						}
					}
				}
				else {
					var req = {
						"GURecID": "123",
						"RecordType": "CTS_CommonAttributes",
						"OperationalStatus": "Active",
						"RecordStatus": "Active",
						"Cache": "CTS_CommonAttributes",
						"Separate": "Test",
						"RecordName": "CTS_CommonAttributes",
						"GuTranID": "12345",
						"RecordCultureName": "CTS_CommonAttributes",
						"RecordCode": "CTS_CommonAttributes",
						"commonDatafieldDetails": [
							{
								"FieldCultureName": "Category",
								"FieldID": "124",
								"FieldName": "Category",
								"FieldType": "CategoryType",
								"ColumnIndex": "0"
							}],
						"commonDataValueDetails": [
							{
								"RowID": "1452",
								"RecordFieldData": cateval,
								"ColumnIndex": "0"
							}]
					}

					$charge.settingsapp().store(req).success(function (data) {
						$rootScope.isCategoryLoaded = true;
						if (data[0].error == "00000") {
							//$scope.categories.push(cateval);
							$scope.newCat = false;
							$mdDialog.hide(cateval);
							notifications.toast("Category is added.", "success");
							//notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
						}
					}).error(function (data) {
						//console.log(data);
						$scope.newCat = false;
					})
				}
			}
			else
			{
				//notifications.toast("Category cannot be empty.", "error");
			}
		}

		$charge.settingsapp().getDuobaseValuesByTableName("CTS_GeneralAttributes").success(function(data) {
			//
			$rootScope.decimalPoint=parseInt(data[6].RecordFieldData);
			$rootScope.step=($rootScope.decimalPoint/$rootScope.decimalPoint)/Math.pow(10,$rootScope.decimalPoint);
		}).error(function(data) {
		})






		function dataURItoBlob(dataURI, callback) {
			// convert base64 to raw binary data held in a string
			// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
			var byteString = atob(dataURI.split(',')[1]);

			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

			// write the bytes of the string to an ArrayBuffer
			var ab = new ArrayBuffer(byteString.length);
			var ia = new Uint8Array(ab);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			// write the ArrayBuffer to a blob, and you're done
			var bb = new Blob([ab]);
			return bb;
		}
	}

	//function filterByPattern()
	//{
	//  return function (cardTypes, CardNo) {
	//    if (!CardNo) {
	//      CardNo = "";
	//      return cardTypes;
	//    }
	//    for (var i = 0; i < cardTypes.length; ++i) {
	//
	//      var contains = cardTypes[i].code.startsWith(CardNo);
	//      if (contains === true) {
	//        $rootScope.cardTypeRoot = cardTypes[i];
	//        return [cardTypes[i]];
	//      }
	//    }
	//  }
	//}

	//$scope.addNewProduct = function(ev) {
	//
	//  var confirm = $mdDialog.prompt()
	//    .title('Enter Product Name')
	//    .placeholder('Dog name')
	//    .ariaLabel('Dog name')
	//    .initialValue('Buddy')
	//    .targetEvent(ev)
	//    .ok('Add')
	//    .cancel('Cancel');
	//
	//  $mdDialog.show(confirm).then(function(result) {
	//  }, function() {
	//  });
	//};

})();

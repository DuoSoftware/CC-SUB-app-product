var app=angular.module('mainApp', ['ngMaterial', 'ngAnimate','ngMdIcons', 'ui.router', 'directivelibrary','uiMicrokernel', 'ngMessages','cloudcharge','productModule','ngTable', 'data-table', 'jkuri.slimscroll'])
	.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
	$urlRouterProvider.otherwise('/main');

	$stateProvider
	
	// HOME STATES AND NESTED VIEWS ========================================
   
	 .state('main', {
		url: '/main',
		templateUrl: 'partials/main.html',
        controller:'MainCtrl as ctrl'
	})
	
	.state('add', {
		url: '/add',
		templateUrl: 'partials/add.html',
		controller: 'AddCtrl as ctrl'
	})

})


app.controller('AppCtrl', function ($scope,$rootScope, $mdDialog, $location, $state, $timeout, $q,$http, uiInitilize,$charge, $filter) {
    $rootScope.DivClassName = 'flex-50';
    $rootScope.isCleared=false;
    $rootScope.productlist=[];
    $rootScope.selectedProduct = {};
    $scope.filters = {};
    $scope.changeProduct={};
    $scope.status="true";
    $scope.categories = [];
    $scope.taxes = ['10', '20', '30', '40'];
    $scope.brands=[];
    $scope.taxGroup=[];
    $scope.UOMs=[];
    var skipGrp= 0,takeGrp=100;
    var response="";

    $charge.tax().allgroups(skipGrp,takeGrp,"asc").success(function(data) {
        //debugger;
        skipGrp += takeGrp;
        if(response=="") {
            console.log(data);
            //if($scope.loading) {
            // returned data contains an array of 2 sentences
            for (i = 0; i < data.length; i++) {
                $scope.taxGroup.push(data[i]);

            }
            //$scope.more();
            $scope.loading = false;
            $scope.isSpinnerShown=false;
            //}
        }
    }).error(function(data) {
        //console.log(data);
        response=data;
        $scope.isSpinnerShown=false;
    })

    $charge.uom().getAllUOM('Product_123').success(function(data) {
        $scope.UOMs=[];
        //debugger;
        console.log(data);
        for(i=0;i<data.length;i++)
        {
            //debugger;
            $scope.UOMs.push(data[i][0]["UOMCode"]);
            //debugger;
        }
    }).error(function(data) {
        console.log(data);
    })
    $rootScope.isBrandLoaded=false;
    $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Brand").success(function(data) {
        $scope.brands=[];
        $rootScope.isBrandLoaded=true;
        //console.log(data);
        for(i=0;i<data.length;i++)
        {
            //debugger;
            $scope.brands.push(data[i]["RecordFieldData"]);
        }

    }).error(function(data) {
        console.log(data);
        $rootScope.isBrandLoaded=false;
    })

    $rootScope.isCategoryLoaded=false;
    $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Category").success(function(data) {
        $scope.categories=[];
        $rootScope.isCategoryLoaded=true;
        //console.log(data);
        for(i=0;i<data.length;i++)
        {
            //debugger;
            $scope.categories.push(data[i]["RecordFieldData"]);
        }
    }).error(function(data) {
        console.log(data);
        $rootScope.isCategoryLoaded=false;
    })


    //var productPrefix,prefixLength;
    //$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","ProductPrefix").success(function(data) {
    //    productPrefix=data[0];
    //    //debugger;
    //}).error(function(data) {
    //    console.log(data);
    //})
    //
    //$charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","PrefixLength").success(function(data) {
    //    prefixLength=data[0];
    //    //debugger;
    //}).error(function(data) {
    //    console.log(data);
    //})

	$scope.openProduct = function(product)
	{
        for(i=0;i<$rootScope.products.length;i++)
        {
            $rootScope.products[i].select=false;
        }
        product.select=true;
        var taxgrp=$filter('filter')($scope.taxGroup, {taxgroupid: product.tax})[0];
        $charge.stock().getStock(product.productId).success(function(data) {
            //debugger;
            $rootScope.selectedProduct = angular.copy(product);
            $rootScope.selectedProduct.inventoryStock=$rootScope.selectedProduct.sku!=0?data.qty:"";
            $rootScope.selectedProduct.tax=taxgrp==undefined?"":$rootScope.selectedProduct.apply_tax!=0?taxgrp.taxgroupcode:"";
            if($rootScope.selectedProduct.apply_tax==0)
            {
                $rootScope.editTax=false;
            }
            else
            {
                $rootScope.editTax=true;
            }

            if($rootScope.selectedProduct.sku==0)
                $rootScope.editInv=false;
            else
                $rootScope.editInv=true;
            $rootScope.DivClassName = 'flex-40';
            $rootScope.viewCount=1;
        }).error(function(data) {
            $rootScope.selectedProduct = angular.copy(product);
            $rootScope.selectedProduct.inventoryStock="";
            //$rootScope.selectedProduct.inventoryStock=$rootScope.selectedProduct.sku!=0?data.qty:"";
            $rootScope.viewCount=1;
            $rootScope.DivClassName = 'flex-40';
            $rootScope.selectedProduct.tax=taxgrp==undefined?"":$rootScope.selectedProduct.apply_tax!=0?taxgrp.taxgroupcode:"";
            if($rootScope.selectedProduct.apply_tax==0)
            {
                $rootScope.editTax=false;
            }
            else
            {
                $rootScope.editTax=true;
            }

            //if($rootScope.selectedProduct.sku==0)
                $rootScope.editInv=false;
            //else
            //    $rootScope.editInv=true;
        })

	}

	$scope.change_ref = function(id)
	{
		defaultColors();
		angular.element('#'+id).css('background', '#00acc4');
	}
	
	function defaultColors()
	{
		angular.element('#main').css('background', '#34474E');
		angular.element('#myapps').css('background', '#34474E');
		angular.element('#myaccount').css('background', '#34474E');
        $rootScope.products.code
		
	}
    $rootScope.editOff = true;

    $rootScope.toggleEdit = function()
	{
        $rootScope.editOff = !$rootScope.editOff;
        if ($scope.selectedProduct.apply_tax != 0) {
            $rootScope.editTax = !$rootScope.editTax;
        }

        if ($scope.selectedProduct.sku != 0) {
            $rootScope.editInv = !$rootScope.editInv;
        }

        if($rootScope.editOff==true) {
            $rootScope.UnitSize="flex-85";
            $rootScope.unitMeasure="flex-15";
            if ($scope.selectedProduct.status == "true") {
                $scope.selectedProduct.status = true
            }
            else {
                $scope.selectedProduct.status = false;
            }
            //debugger;
            if ($scope.selectedProduct.sku == "true") {
                $scope.selectedProduct.sku = true
            }
            else if ($scope.selectedProduct.sku == true) {
                $scope.selectedProduct.sku = true
            }
            else {
                $scope.selectedProduct.sku = false;
            }

            if ($scope.selectedProduct.apply_tax == "true") {
                $scope.selectedProduct.apply_tax = true
            }
            else if ($scope.selectedProduct.apply_tax == true) {
                $scope.selectedProduct.apply_tax = true
            }
            else {
                $scope.selectedProduct.apply_tax = false;
            }
        }
        else if($rootScope.editOff==false)
        {
            $rootScope.UnitSize="flex-70";
            $rootScope.unitMeasure="flex-30";
            if ($scope.selectedProduct.status == true) {
                $scope.selectedProduct.status = "true"
            }
            else {
                $scope.selectedProduct.status = "false";
            }
           // debugger;
            if ($scope.selectedProduct.sku == 1) {
                $scope.selectedProduct.sku = true
            }
            else {
                $scope.selectedProduct.sku = false;
            }

            if ($scope.selectedProduct.apply_tax == 1) {
                $scope.selectedProduct.apply_tax = true
            }
            else {
                $scope.selectedProduct.apply_tax = false;
            }
        }
        $scope.changeProduct=angular.copy($scope.selectedProduct);
        //debugger;
	}


})//END OF AppCtrl


app.controller('AddCtrl', function ($scope,$rootScope, $mdDialog, $window, $mdToast,$charge,notifications,$state,$productHandler,$filter) {
	//debugger;

    $scope.content = {};
    $scope.content.files=[];
    $scope.content.attachment='../img/noimage.png';
    $scope.content.descroption="";
    $scope.content.category="";
    $scope.content.brand="";
    $scope.content.uom="";
    $scope.content.selectCurrency="";
    $scope.content.status=true;
    $scope.toggleActive = true;
    $scope.Currencies=['LKR','USD','GBP'];

	$scope.addCat = function(ev)
	{
        //debugger;
		//console.log("yes");
		$scope.content.category = "";

		$mdDialog.show({
		  	controller: 'addCategoryCtrl',
		    templateUrl: 'partials/add_category.html',
            locals:{categories: $scope.categories},
		    parent: angular.element(document.body),
		    targetEvent: ev,
		    clickOutsideToClose:true
		})
		.then(function(categoryName) {
                if(categoryName!="") {
                    $scope.categories.push(categoryName);
                    $scope.content.category = categoryName
                }
		})

	}

    $scope.addBrand = function(ev)
    {
        console.log("yes");
        $scope.content.brand = "";

        $mdDialog.show({
            controller: 'addBrandCtrl',
            templateUrl: 'partials/add_brand.html',
            locals:{brands: $scope.brands},
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
            .then(function(brandName) {
                if(brandName!="") {
                    $scope.brands.push(brandName);
                    $scope.content.brand = brandName
                }
            })

    }
    
    $scope.toggleSwitch= function (ev) {
        if(ev) {
            $scope.toggleActive = true;
            $scope.toggleInActive=false;
        }
        else {
            $scope.toggleInActive = true;
            $scope.toggleActive = false;
        }
    }

    $scope.addUOM = function(ev)
    {
        //console.log("yes");
        $scope.content.uom = "";

        $mdDialog.show({
            controller: 'addUOMCtrl',
            templateUrl: 'partials/add_uom.html',
            locals:{uoms: $scope.UOMs},
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
            .then(function(uom) {
                //debugger;
                $scope.UOMs.push(uom);
                $scope.content.uom  = uom
            })

    }

    $scope.addCurrencies = function(ev)
    {
        console.log("yes");
        $scope.content.selectCurrency = "";

        $mdDialog.show({
            controller: 'addCurrencyCtrl',
            templateUrl: 'partials/add_currencies.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
            .then(function(currency) {
                //debugger;
                $scope.Currencies.push(currency);
                $scope.content.selectCurrency  = currency
            })

    }

    if(!$rootScope.isCleared) {
        $rootScope.productlist=[];
        $productHandler.getClient().LoadProduct().onComplete(function (data) {
            debugger;
            $rootScope.productlist = data;
        });
    }

    //var self = this;
    //self.selectedItem  = '';
    //self.searchText    = null;
    //self.querySearch   = querySearch;
    //
    //function querySearch (query) {
    //
    //    //Custom Filter
    //    var results=[];
    //    for (i = 0, len = $scope.productlist.length; i<len; ++i){
    //        //console.log($scope.allBanks[i].value.value);
    //        if($scope.productlist[i].product_name.toLowerCase().indexOf(query.toLowerCase()) !=-1)
    //        {
    //            if($scope.productlist[i].product_name.toLowerCase().startsWith(query.toLowerCase()))
    //            {
    //                results.push($scope.productlist[i]);
    //            }
    //
    //        }
    //    }
    //    return results;
    //}


    //debugger;
	$scope.submit = function(){
		if($scope.editForm.$valid == true)
		{
            $scope.spinnerAdd=true;
            //$scope.content.product_name=self.searchText;
            //debugger;
            if($scope.content.quantity_of_unit==null ||$scope.content.quantity_of_unit=="")
                $scope.content.quantity_of_unit=0;
            if($scope.content.cost_price==null ||$scope.content.cost_price=="")
                $scope.content.cost_price=0;
            //if($scope.content.tax==null ||$scope.content.tax=="")
            //    $scope.content.tax="0";
            debugger;
            if($scope.content.apply_tax==undefined || $scope.content.apply_tax==null || $scope.content.apply_tax=="false" || $scope.content.apply_tax==false)
            {
                $scope.content.apply_tax=false;
                $scope.content.tax="0";
            }
            else
            {
                var taxgrp=$filter('filter')($scope.taxGroup, {taxgroupcode: $scope.content.tax.trim()})[0];
                //debugger;
                $scope.content.tax=taxgrp.taxgroupid;
            }
            debugger;
            if($scope.content.sku==undefined || $scope.content.sku==null || $scope.content.sku=="false" || $scope.content.sku==false)
            {
                $scope.content.sku=false;
                $scope.content.minimun_stock_level=0;
            }
            if($scope.content.files.length>0) {
                $scope.content.attachment = $scope.content.files[0];
            }
            var req=$scope.content;
            debugger;
            $charge.product().store(req).success(function(data) {
                if(data.id) {
                    //console.log(data);
                    notifications.toast("Record Inserted, Product Code " + req.code , "success");
                    $scope.spinnerAdd=false;
                    $scope.clearFields();
                    $rootScope.isCleared=true;
                    var product={}
                    product.code=req.code;
                    product.product_name=req.product_name;
                    $rootScope.productlist.push(product);
                    //$productHandler.getClient().LoadProduct().onComplete(function(data)
                    //{
                    //    $scope.productlist=data;
                    //});

                }
            }).error(function(data) {
                console.log(data);
            })
		}
        else//This is done because the HTML simple validation might work and enter the submit, however the form can still be invalid
		{
			$mdToast.show({
				template: '<md-toast class="md-toast-error" >Please fill all the details</md-toast>',
				hideDelay: 2000,
				position: 'bottom right'
			});
		}

		//$scope.submitted = true; // Disable the submit button until the form is submitted successfully to the database (ng-disabled)

		//submit info to database

		 /*
		 ---if submit request is successful---
			self.searchText = "";
			$scope.submitted = false; // Make submit button enabled again (ng-disabled)
			$scope.template = ""; // Empty the form
			$scope.editForm.$setUntouched();
			$scope.editForm.$setPristine();
		 */

	}

    $scope.clearFields= function () {
        //$scope.editForm.$setPristine();
        //$scope.editForm.$setUntouched();
        //$scope.content.product_name='';
        ////self.searchText='';
        //$scope.content.files=[];
        //$scope.content.descroption="";
        //$scope.content.code="";
        //$scope.content.quantity_of_unit="";
        //$scope.content.price_of_unit=null;
        //$scope.content.cost_price=null;
        //$scope.content.tax="0";
        //$scope.content.sku="false";
        //$scope.content.applyTax=false;
        //$scope.content.status=true;
        //$scope.content.uom="";
        //$scope.content.category="";
        //$scope.content.brand="";
        //$scope.content.files=[];
        //$('#deletebtn').click();
        $state.go($state.current, {}, {reload: true});
    }
	$scope.backToMain = function(ev)
	{
		location.href = "#/main";
	}

    $scope.validateProduct=function (ev)
    {
        //debugger;
        var products=$rootScope.productlist;
        var txtEntered=ev;
        products.forEach(function(product){
            if(product.code.toLowerCase()==txtEntered.toLowerCase())
            {
                notifications.toast(txtEntered +" has been already added" , "error");
                $scope.content.code="";
            }
        });
    }

    //18-07-2016
    $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_GeneralAttributes","BaseCurrency").success(function(data) {
        $scope.content.selectCurrency=data[0]['RecordFieldData'];
    }).error(function(data) {
        console.log(data);
    })


    //22-07-2016
    $scope.closeApplication = function () {
        window.parent.dwShellController.closeCustomApp();
    };
	
})//END OF AddCtrl


app.controller('MainCtrl', function ($scope,$rootScope,$mdDialog, $window, $mdToast,$charge,notifications,$state,$productHandler,$filter) {
    //debugger;
    $rootScope.isCleared=false;
    var skip=0;
    var take=1000;
    var response="";
    $rootScope.DivClassName = 'flex-50';
    //newly added code start
    //$scope.isLoad = true;
    $rootScope.viewCount = 0;
    $rootScope.products=[];
    $rootScope.productlist=[];
    $scope.statusArray = [];
    if($scope.filters.category==null)
        $scope.title='All';
    else
        $scope.title=$scope.filters.category;
    //debugger;
    $scope.includeStatus = function(status) {
        var i = $.inArray(status, $scope.statusArray);
        //debugger;
        if (i > -1) {
            $scope.statusArray.splice(i, 1);
        } else {
            $scope.statusArray.push(status);
        }
    }


    $scope.statusFilter = function(product) {
        //debugger;
        if ($scope.statusArray.length > 0) {
            //debugger;
            if ($.inArray(product.status, $scope.statusArray) < 0)
                return;
        }

        return product;
    }

    $scope.removeFilterCat=function()
    {
        $scope.filters = {};
        $scope.title='All';
    }

    $scope.addFilterCat=function(cat)
    {
        $scope.title=cat;
        $scope.filters.category=cat;
    }

    $scope.enableTaxCode = function(chkTax) {
        document.getElementById('selectTax').disabled=!chkTax;
    }
    $scope.enableStockLevel = function(chkInv) {
        //debugger;
        document.getElementById('txtMinStock').disabled=!chkInv;
    }
    if($scope.selectedProduct.product_name!=null)
    {
        angular.element('#viewAllWhiteframe').css('margin', '0');
        angular.element('#viewAllWhiteframe').css('max-width', '550px');

    }
    $scope.loading = true;
    // this function fetches a random text and adds it to array
    $scope.more = function(){
        $scope.isSpinnerShown=true;
        //debugger;
        $productHandler.getClient().LoadProductByScroll(skip,take).onComplete(function(data)
        {
            if(data.length<take)
                $scope.lastSet=true;
            if($scope.loading) {
                for (i = 0; i < data.length; i++) {
                    data[i].select=false;
                    $rootScope.products.push(data[i]);
                }
            }
            //debugger;
            $scope.loading = false;
            skip += take;
            $scope.isSpinnerShown=false;
        }).onError(function(data)
        {
            $scope.isSpinnerShown=false;
            $scope.lastSet=true;

        });
    };
        // we call the function twice to populate the list
        $scope.more();


    $scope.loadmore = function(takeMre){
        $scope.isSpinnerShown=true;
        $productHandler.getClient().LoadProductByScroll(skip,takeMre).onComplete(function(data)
        {
            if(data.length<takeMre)
                $scope.lastSet=true;
            for (i = 0; i < data.length; i++) {
                data[i].select=false;
                $rootScope.products.push(data[i]);
            }
            debugger;
            //$scope.loading = false;
            skip += take;
            $scope.isSpinnerShown=false;
        }).onError(function(data)
        {
            $scope.isSpinnerShown=false;
            $scope.lastSet=true;

        });
    };

    $scope.editBrand = function(ev)
    {
        console.log("yes");
        if($scope.changeProduct.brand=="") {
            $mdDialog.show({
                controller: 'addBrandCtrl',
                templateUrl: 'partials/add_brand.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
                    .then(function (brandName) {
                        //debugger;
                        $scope.brands.push(brandName);
                        $scope.changeProduct.brand = brandName
                    })
        }

    }

    $scope.editUOM = function(ev)
    {
        //console.log(ev);
        if(ev=="Add UOM") {
            //$scope.changeProduct.uom = "";

            $mdDialog.show({
                controller: 'addUOMCtrl',
                templateUrl: 'partials/add_uom.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
                .then(function (uom) {
                    //debugger;
                    $scope.UOMs.push(uom);
                    $scope.changeProduct.uom = uom
                })
        }
    }

    $scope.editCat = function(ev)
    {
        if($scope.changeProduct.category=="") {
            $mdDialog.show({
                controller: 'addCategoryCtrl',
                templateUrl: 'partials/add_category.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
                    .then(function (categoryName) {
                        //debugger;
                        $scope.categories.push(categoryName);
                        $scope.changeProduct.category = categoryName
                    })
        }
    }
    $scope.uploadImg = function(ev)
    {
        $mdDialog.show({
            controller: 'uploadImgCtrl',
            templateUrl: 'partials/upload_images.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
            .then(function(img) {
                    if(img.length>0) {
                        $scope.changeProduct.attachment = img[0];
                    }
            })
    }


    $scope.saveEdit = function(model)
    {
        debugger;
        $rootScope.UnitSize="flex-85";
        $rootScope.unitMeasure="flex-15";
        var editReq=$scope.changeProduct;
        var tempTaxgroup=angular.copy(editReq);
        var taxgrp=$filter('filter')($scope.taxGroup, {taxgroupcode: editReq.tax.trim()})[0];
        if(taxgrp!=undefined || taxgrp!=null)
            editReq.tax=taxgrp=taxgrp.taxgroupid;
        else
            editReq.tax=0;
        if(editReq.status=="false")
        {
            editReq.status=false;
        }
        else if(editReq.status=="true")
        {
            editReq.status=true;
        }

        $charge.product().update(editReq).success(function(data) {
            //debugger;
            if(data.count) {
                //debugger;
                console.log(data);
                for(var i=0;i<$rootScope.products.length;i++)
                {
                    if($rootScope.products[i].productId==editReq.productId)
                    {
                        $rootScope.products[i] = angular.copy(editReq);
                    }
                }
                editReq.tax=tempTaxgroup.tax;
                $rootScope.selectedProduct = editReq;
                //debugger;
                $rootScope.editOff = !$rootScope.editOff;
                if($rootScope.selectedProduct.apply_tax==true ||$rootScope.selectedProduct.apply_tax=="true")
                {
                    //debugger;
                    $rootScope.editTax = !$rootScope.editTax;
                }
                else
                    $rootScope.selectedProduct.tax="";
                if($rootScope.selectedProduct.sku==true ||$rootScope.selectedProduct.sku=="true")
                {
                    //debugger;
                    $rootScope.editInv = !$rootScope.editInv;
                }
                else
                    $rootScope.selectedProduct.inventoryStock="";
                notifications.toast("Record Updated, Product Code "+ editReq.code, "success");
            }
        }).error(function(data) {
            console.log(data);
            notifications.toast("Error when updating record, Product Code " + editReq.code , "error");
        })

    }


    //22-07-16

    $scope.hoverEdit = false;

    $scope.hoverIn = function(){
        $scope.hoverEdit = true;
        angular.element('#filtersection').css('height', '70');
        angular.element('#rightsection').css('height', '676');
    };

    $scope.hoverOut = function(){
        $scope.hoverEdit = false;
        angular.element('#filtersection').css('height', '0');
        angular.element('#rightsection').css('height', '606');
    };

    $scope.closeApplication = function () {
        window.parent.dwShellController.closeCustomApp();
    };
})

app.filter('Confloat', function() {
    return function(input) {
        return parseFloat(input, 10);
    };
});

app.controller('addCategoryCtrl', function ($scope,$rootScope,categories,$mdDialog,$charge,notifications) {
        //debugger;
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.submit = function() {
      debugger;
      if(categories.length!=0) {
          for (i = 0; i < categories.length; i++) {
              if (categories[i] == $scope.category) {
                  notifications.toast("Category is already exist.", "error");
                  //$mdDialog.hide("");
              }
              else {
                  if ($rootScope.isCategoryLoaded) {
                      var req = {
                          "RecordName": "CTS_CommonAttributes",
                          "FieldName": "Category",
                          "RecordFieldData": $scope.category
                      }

                      $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
                          debugger;
                          console.log(data);
                          debugger;
                          if (data.IsSuccess) {
                              console.log(data);
                              //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                          }
                      }).error(function (data) {
                          console.log(data);
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
                                  "RecordFieldData": $scope.category,
                                  "ColumnIndex": "0"
                              }]
                      }

                      $charge.commondata().store(req).success(function (data) {
                          $rootScope.isCategoryLoaded = true;
                          if (data.IsSuccess) {
                              console.log(data);
                              //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                          }
                      }).error(function (data) {
                          console.log(data);
                      })
                  }
                  $mdDialog.hide($scope.category);
              }
              break;
          }
      }

      else
      {
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
                      "RecordFieldData": $scope.category,
                      "ColumnIndex": "0"
                  }]
          }

          $charge.commondata().store(req).success(function (data) {
              $rootScope.isCategoryLoaded = true;
              if (data.IsSuccess) {
                  console.log(data);
                  //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
              }
          }).error(function (data) {
              console.log(data);
          })

          $mdDialog.hide($scope.category);
      }

  }
})

app.controller('addBrandCtrl', function ($scope,$rootScope,brands,$mdDialog,$charge,notifications) {
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.submit = function()
    {
        if(brands.length!=0) {
            for (i = 0; i < brands.length; i++) {
                if (brands[i] == $scope.brand) {
                    notifications.toast("Brand is already exist.", "error");
                    //$mdDialog.hide("");
                }
                else {
                    if ($rootScope.isBrandLoaded) {
                        var req = {
                            "RecordName": "CTS_CommonAttributes",
                            "FieldName": "Brand",
                            "RecordFieldData": $scope.brand
                        }
                        debugger;
                        $charge.commondata().insertDuoBaseValuesAddition(req).success(function (data) {
                            //console.log(data);
                            if (data.IsSuccess) {
                                console.log(data);
                                //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                            }
                        }).error(function (data) {
                            console.log(data);
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
                                    "RecordFieldData": $scope.brand,
                                    "ColumnIndex": "1"
                                }]
                        }

                        $charge.commondata().store(req).success(function (data) {
                            $rootScope.isBrandLoaded = true;
                            if (data.IsSuccess) {
                                console.log(data);
                                //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                            }
                        }).error(function (data) {
                            console.log(data);
                        })
                    }

                    $mdDialog.hide($scope.brand);
                }
            }
        }

        else
        {
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
                        "RecordFieldData": $scope.brand,
                        "ColumnIndex": "1"
                    }]
            }

            $charge.commondata().store(req).success(function (data) {
                $rootScope.isBrandLoaded = true;
                if (data.IsSuccess) {
                    console.log(data);
                    //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                }
            }).error(function (data) {
                console.log(data);
            })

            $mdDialog.hide($scope.brand);
        }
    }
})



app.directive("whenScrolled", function(){
    return{

        restrict: 'A',
        link: function(scope, elem, attrs){

            // we get a list of elements of size 1 and need the first element
            raw = elem[0];

            // we load more elements when scrolled past a limit
            elem.bind("scroll", function(){
                if(raw.scrollTop+raw.offsetHeight+5 >= raw.scrollHeight){
                    scope.loading = true;

                    // we can give any function which loads more elements into the list
                    scope.$apply(attrs.whenScrolled);
                }
            });
        }
    }
});

app.directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });

            attrs.$observe('ngSrc', function (value) {
                if (!value && attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    }
});







var app=angular.module('mainApp', ['ngMaterial', 'ngAnimate','ngMdIcons', 'ui.router', 'directivelibrary','uiMicrokernel', 'ngMessages','cloudcharge','productModule'])
	
	.config(function($stateProvider, $urlRouterProvider,$httpProvider) {
	$urlRouterProvider.otherwise('/main');

	$stateProvider
	
	// HOME STATES AND NESTED VIEWS ========================================
   
	 .state('main', {
		url: '/main',
		templateUrl: 'partials/main.html',
        controller:'MainCtrl'
	})
	
	.state('add', {
		url: '/add',
		templateUrl: 'partials/add.html',
		controller: 'AddCtrl as ctrl'
	})

})


app.controller('AppCtrl', function ($scope,$rootScope, $mdDialog, $location, $state, $timeout, $q,$http, uiInitilize,$charge, $objectstore) {

    $rootScope.selectedProduct = {};
    $scope.filters = {};
    $scope.changeProduct={};
    $scope.status="true";
    $scope.categories = [];
    $scope.taxes = ['10', '20', '30', '40'];
    $scope.brands=[];

    $charge.uom().all(0,5,"asc").success(function(data) {
        $scope.UOMs=[];
        //debugger;
        console.log(data);
        for(i=0;i<data.length;i++)
        {
            //debugger;
            $scope.UOMs.push(data[i]["UOMCode"]);
        }
    }).error(function(data) {
        console.log(data);
    })


    $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Brand").success(function(data) {
        $scope.brands=[];
        //console.log(data);
        for(i=0;i<data.length;i++)
        {
            //debugger;
            $scope.brands.push(data[i]["RecordFieldData"]);
        }
    }).error(function(data) {
        console.log(data);
    })

    $charge.commondata().getDuobaseFieldDetailsByTableNameAndFieldName("CTS_CommonAttributes","Category").success(function(data) {
        $scope.categories=[];
        //console.log(data);
        for(i=0;i<data.length;i++)
        {
            //debugger;
            $scope.categories.push(data[i]["RecordFieldData"]);
        }
    }).error(function(data) {
        console.log(data);
    })

	$scope.openProduct = function(product)
	{
        debugger;
        $rootScope.selectedProduct = product;
        angular.element('#viewAllWhiteframe').css('margin', '0');
        angular.element('#viewAllWhiteframe').css('max-width', '600px');
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
		$scope.products.code
		
	}
    $rootScope.editOff = true;

    $rootScope.toggleEdit = function()
	{
        angular.element('#editContent').css('padding', '0px');
        angular.element('#editContent').css('padding-left', '10px');
        $rootScope.editOff = !$rootScope.editOff;
        if($rootScope.editOff==true) {
            if ($scope.selectedProduct.status == "true") {
                $scope.selectedProduct.status = true
            }
            else {
                $scope.selectedProduct.status = false;
            }
            if ($scope.selectedProduct.sku == "true") {
                $scope.selectedProduct.sku = true
            }
            else {
                $scope.selectedProduct.sku = false;
            }
        }
        else if($rootScope.editOff==false)
        {
            if ($scope.selectedProduct.status == true) {
                $scope.selectedProduct.status = "true"
            }
            else {
                $scope.selectedProduct.status = "false";
            }
            //debugger;
            //if ($scope.selectedProduct.sku == true) {
            //    $scope.selectedProduct.sku = "true"
            //}
            //else {
            //    $scope.selectedProduct.sku = "false";
            //}
        }
        $scope.changeProduct=angular.copy($scope.selectedProduct);
        debugger;
	}


})//END OF AppCtrl


app.controller('AddCtrl', function ($scope,$rootScope, $mdDialog, $window, $mdToast,$charge,notifications,$state,$productHandler) {
	//debugger;

    $scope.content = {};
    $scope.content.files=[];
    $scope.productlist=[];
    $scope.content.attachment='../img/noimage.png';
    //$scope.content.attachment='../img/contacts.png';
    $scope.content.descroption="";
    $scope.content.category="";
    $scope.content.brand="";
    $scope.content.uom="";
    $scope.content.selectCurrency="USD";
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
		    parent: angular.element(document.body),
		    targetEvent: ev,
		    clickOutsideToClose:true
		})
		.then(function(categoryName) {
			//debugger;
			$scope.categories.push(categoryName);
			$scope.content.category  = categoryName
		})

	}

    $scope.addBrand = function(ev)
    {
        console.log("yes");
        $scope.content.brand = "";

        $mdDialog.show({
            controller: 'addBrandCtrl',
            templateUrl: 'partials/add_brand.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
            .then(function(brandName) {
                //debugger;
                $scope.brands.push(brandName);
                $scope.content.brand  = brandName
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


    $productHandler.getClient().LoadProduct().onComplete(function(data)
    {
        $scope.productlist=data;
    });


    var self = this;
    self.selectedItem  = '';
    self.searchText    = null;
    self.querySearch   = querySearch;

    function querySearch (query) {

        //Custom Filter
        var results=[];
        for (i = 0, len = $scope.productlist.length; i<len; ++i){
            //console.log($scope.allBanks[i].value.value);
            debugger;
            if($scope.productlist[i].product_name.toLowerCase().indexOf(query.toLowerCase()) !=-1)
            {
                if($scope.productlist[i].product_name.toLowerCase().startsWith(query.toLowerCase()))
                {
                    results.push($scope.productlist[i]);
                }

            }
        }
        return results;
    }


    //debugger;
	$scope.submit = function(){
		if($scope.editForm.$valid == true)
		{
            $scope.content.product_name=self.searchText;
            debugger;
            if($scope.content.quantity_of_unit==null ||$scope.content.quantity_of_unit=="")
                $scope.content.quantity_of_unit=0;
            if($scope.content.cost_price==null ||$scope.content.cost_price=="")
                $scope.content.cost_price=0;
            //if($scope.content.tax==null ||$scope.content.tax=="")
            //    $scope.content.tax="0";
            if($scope.content.applyTax==null | $scope.content.applyTax=="false")
            {
                $scope.content.applyTax=false;
                $scope.content.tax="0";
            }
            if($scope.content.sku==null | $scope.content.sku=="false")
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
                if(data.IsSuccess) {
                    console.log(data);
                    notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                    //$scope.content.product_name='';
                    ////$scope.content.attachment='../img/contacts.png';
                    //$scope.content.descroption="";
                    //$scope.content.code="";
                    //$scope.content.quantity_of_unit="";
                    //$scope.content.price_of_unit=null;
                    //$scope.content.cost_price=null;
                    //$scope.content.tax="";
                    //$scope.content.sku="false";
                    //$scope.content.applyTax=false;
                    //$scope.content.status=true;
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
	
	$scope.backToMain = function(ev)
	{
		location.href = "#/main";
	}
	
})//END OF AddCtrl


app.controller('MainCtrl', function ($scope,$rootScope,$mdDialog, $window, $mdToast,$charge,notifications,$state,$productHandler) {
    //debugger;
    var skip=0;
    var take=100;
    var response="";
    $scope.products=[];
    $scope.statusArray = [];
    $scope.title='All';

    $scope.includeStatus = function(status) {
        var i = $.inArray(status, $scope.statusArray);
        debugger;
        if (i > -1) {
            $scope.statusArray.splice(i, 1);
        } else {
            $scope.statusArray.push(status);
        }
    }


    $scope.statusFilter = function(product) {
        if ($scope.statusArray.length > 0) {
            debugger;
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
        //$charge.product().all(skip,take,"asc").success(function(data) {
        //    //debugger;
        //    skip += take;
        //    if(response=="") {
        //        if($scope.loading) {
        //            // returned data contains an array of 2 sentences
        //            for (i = 0; i < data.length; i++) {
        //                newItem = data[i];
        //                //console.log(data[i]);
        //                //debugger;
        //                $scope.products.push(data[i]);
        //
        //            }
        //            //$scope.more();
        //            $scope.loading = false;
        //            $scope.isSpinnerShown=false;
        //            console.log($scope.products.length);
        //        }
        //    }
        //}).error(function(data) {
        //    //console.log(data);
        //    response=data;
        //    $scope.isSpinnerShown=false;
        //})
        $productHandler.getClient().LoadProductByScroll(skip,take).onComplete(function(data)
        {
            if($scope.loading) {
                for (i = 0; i < data.length; i++) {
                    $scope.products.push(data[i]);
                }
            }
            $scope.loading = false;
            skip += take;
            $scope.isSpinnerShown=false;
        }).onError(function(data)
        {
            $scope.isSpinnerShown=false;

        });
    };
        // we call the function twice to populate the list
        $scope.more();

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
        //console.log("yes");
        $scope.changeProduct.uom = "";

        $mdDialog.show({
            controller: 'addUOMCtrl',
            templateUrl: 'partials/add_uom.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true
        })
            .then(function(uom) {
                //debugger;
                $scope.UOMs.push(uom);
                $scope.changeProduct.uom  = uom
            })

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
        var editReq=$scope.changeProduct;
        if(editReq.status="false")
        {
            editReq.status=false;
        }
        else if(editReq.status="true")
        {
            editReq.status=true;
        }

        $charge.product().update(editReq).success(function(data) {
            debugger;
            if(data.IsSuccess) {
                debugger;
                console.log(data);
                for(var i=0;i<$scope.products.length;i++)
                {
                    if($scope.products[i].productId==editReq.productId)
                    {
                        $scope.products[i] = editReq;
                    }
                }
                $rootScope.selectedProduct = editReq;
                debugger;
                $rootScope.editOff = !$rootScope.editOff;
                notifications.toast("Record Updated, Product ID "+ data.Data[0].ID, "success");
            }
        }).error(function(data) {
            console.log(data);
            notifications.toast("Error when updating record, Product ID " + data.Data[0].ID , "error");
        })

    }
})

app.filter('Confloat', function() {
    return function(input) {
        return parseFloat(input, 10);
    };
});

app.controller('addCategoryCtrl', function ($scope,$mdDialog,$charge) {
        //debugger;
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.submit = function()
  {

      var req = {
          "GURecID":"123",
          "RecordType":"CTS_CommonAttributes",
          "OperationalStatus":"Active",
          "RecordStatus":"Active",
          "Cache":"CTS_CommonAttributes",
          "Separate":"CTS_CommonAttributes",
          "RecordName":"CTS_CommonAttributes",
          "GuTranID":"12345",
          "RecordCultureName":"CTS_CommonAttributes",
          "RecordCode":"CTS_CommonAttributes",
          "FieldCultureName":"Category",
          "FieldID":"124",
          "FieldName":"Category",
          "FieldType":"CategoryType",
          "ColumnIndex":"0",
          "RowID":"1452",
          "RecordFieldData":$scope.category
      }

      $charge.commondata().insertDuoBaseValuesAddition(req).success(function(data) {
          debugger;
          console.log(data);
          debugger;
          if(data.IsSuccess) {
              console.log(data);
              //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
          }
      }).error(function(data) {
          console.log(data);
      })

      $mdDialog.hide($scope.category);
  }
})

app.controller('addBrandCtrl', function ($scope,$mdDialog,$charge) {
    debugger;
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.submit = function()
    {

        var req = {
            "GURecID":"123",
            "RecordType":"CTS_CommonAttributes",
            "OperationalStatus":"Active",
            "RecordStatus":"Active",
            "Cache":"CTS_CommonAttributes",
            "Separate":"CTS_CommonAttributes",
            "RecordName":"CTS_CommonAttributes",
            "GuTranID":"12345",
            "RecordCultureName":"CTS_CommonAttributes",
            "RecordCode":"CTS_CommonAttributes",
            "FieldCultureName":"Brand",
            "FieldID":"124",
            "FieldName":"Brand",
            "FieldType":"BrandType",
            "ColumnIndex":"0",
            "RowID":"1452",
            "RecordFieldData":JSON.stringify($scope.brand)
        }
        console.log(JSON.stringify($scope.brand));
        debugger;
        $charge.commondata().insertDuoBaseValuesAddition(req).success(function(data) {
            //console.log(data);
            if(data.IsSuccess) {
                console.log(data);
                //notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
            }
        }).error(function(data) {
            console.log(data);
        })

        $mdDialog.hide($scope.brand);
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







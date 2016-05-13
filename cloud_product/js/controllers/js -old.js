var app=angular.module('mainApp', ['ngMaterial', 'ngAnimate','ngMdIcons', 'ui.router', 'directivelibrary','uiMicrokernel', 'ngMessages','cloudcharge'])
	
	.config(function($stateProvider, $urlRouterProvider) {

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
		controller: 'AddCtrl'
	})

})


app.controller('AppCtrl', function ($scope, $mdDialog, $location, $state, $timeout, $q,$http, uiInitilize,$charge, $objectstore) {

	$scope.selectedProduct = {};
    $scope.categories = ['Cateogory 1', 'Cateogory 2', 'Cateogory 3', 'Cateogory 4'];

        $charge.product().all(0,30,"asc").success(function(data) {
            //debugger;
            console.log(data);
            $scope.products=data;
        }).error(function(data) {
            console.log(data);
        })

	$scope.openProduct = function(product)
	{
        //debugger;
		$scope.selectedProduct = product;
        angular.element('#viewAllWhiteframe').css('margin', '0');
        angular.element('#viewAllWhiteframe').css('max-width', '550px');
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
	$scope.editOff = true;
    $scope.editBtn=true;
    $scope.IsEdit=false;
    $scope.hoverEdit=function(ev)
    {
        console.log(ev);
        angular.element('#editContent').css('cursor', 'pointer');
        angular.element('#editDiv').css('flex','75');
        angular.element('#editContent').css('padding', '0px');
        angular.element('#editContent').css('padding-left', '10px');
        //$scope.editOff = !$scope.editOff;
        $scope.editBtn=!$scope.editBtn;
    }

    $scope.hoverEditOff=function()
    {
        //debugger;
        if($scope.IsEdit) {
            $scope.editOff = !$scope.editOff;
        }
        angular.element('#editContent').css('cursor', '');
        $scope.editBtn = !$scope.editBtn;
        angular.element('#editContent').css('padding', '10px');
        $scope.IsEdit=false;
    }
	$scope.toggleEdit = function()
	{

        angular.element('#editContent').css('padding', '0px');
        angular.element('#editContent').css('padding-left', '10px');
        $scope.editOff = !$scope.editOff;
        $scope.IsEdit=true;
        //$state.go('add',{obj: $scope.selectedProduct});
        //angular.element('#editContent').css('padding', '0px');
        //angular.element('#editContent').css('padding-left', '10px');
        //$scope.editOff = !$scope.editOff;
	}

    $scope.hideContent=function()
    {
        if($scope.IsEdit)
            return true;
    }

	
})//END OF AppCtrl


app.controller('AddCtrl', function ($scope, $mdDialog, $window, $mdToast,$charge,notifications,$state) {
	//debugger;

    $scope.content = {};
    $scope.content.attachment='../img/contacts.png';
    $scope.content.descroption="";
    $scope.content.category="";
    $scope.content.brand="";
    $scope.content.quantity_of_unit=0;
    $scope.content.unitOfMeasure="";
    $scope.content.selectCurrency="";
    $scope.content.price_of_unit="0";
    $scope.content.applyTax="false";
    $scope.content.tax="0";
    $scope.content.cost_price="0";
    $scope.content.minimun_stock_level=0;
    $scope.content.status="true";

    //$scope.content = {};
    //$scope.content.files=['img/contacts.png'];
    //$scope.categories = ['Cateogory 1', 'Cateogory 2', 'Cateogory 3', 'Cateogory 4'];
    $scope.brands = ['Brand 1', 'Brand 2', 'Brand 3', 'Brand 4'];
	$scope.UOMs=['Day','Hour','Currency'];
    $scope.Currencies=['LKR','USD','GBP'];

	$scope.addCat = function(ev)
	{
        debugger;
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

    $scope.addUOM = function(ev)
    {
        //console.log("yes");
        $scope.content.unitOfMeasure = "";

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
                $scope.content.unitOfMeasure  = uom
            })

    }

    $scope.addCurrencies = function(ev)
    {
        console.log("yes");
        $scope.content.unitOfMeasure = "";

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
    //debugger;
	$scope.submit = function(){
		if($scope.editForm.$valid == true)
		{
            var req=$scope.content;
            debugger;
            if($scope.IsUpdate)
            {
                $charge.product().update(req).success(function(data) {
                    debugger;
                    if(data.IsSuccess) {
                        debugger;
                        console.log(data);
                        notifications.toast("Record Updated, Product ID "+ data.Data[0].ID, "success");
                    }
                }).error(function(data) {
                    console.log(data);
                    notifications.toast("Error when updating record, Product ID " + data.Data[0].ID , "error");
                })
            }
            else
            {
                $charge.product().store(req).success(function(data) {
                    if(data.IsSuccess) {
                        console.log(data);
                        notifications.toast("Record Inserted, Product ID " + data.Data[0].ID , "success");
                    }
                }).error(function(data) {
                    console.log(data);
                })
            }
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


app.controller('MainCtrl', function ($scope,$mdDialog) {
    //debugger;
    if($scope.selectedProduct.product_name!=null)
    {
        angular.element('#viewAllWhiteframe').css('margin', '0');
        angular.element('#viewAllWhiteframe').css('max-width', '550px');
    }
})

app.controller('addCategoryCtrl', function ($scope,$mdDialog) {
        debugger;
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.submit = function()
  {
		$mdDialog.hide($scope.category);
  }
})

app.controller('addBrandCtrl', function ($scope,$mdDialog) {
    debugger;
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.submit = function()
    {
        debugger;
        $mdDialog.hide($scope.brand);
    }
})










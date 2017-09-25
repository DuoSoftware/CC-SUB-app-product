// /////////////////////////////////
// App : Product
// File : Product
// Owner  : Ishara
// Last changed date : 2017-09-13
// Version : 6.1.0.1
// Updated By : ishara
/////////////////////////////////
(function ()
{
    'use strict';

    angular
        .module('app.product', ['directivelibrary'])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
      ////////////////////////////////
      // App : Product
      // Owner  : Suvethan
      // Last changed date : 2017/01/08
      // Version : 6.0.0.31
      // Updated By : Kasun
      /////////////////////////////////
        mesentitlementProvider.setStateCheck("product");

        $stateProvider
            .state('app.product', {
                url    : '/product',
                views  : {
                    'product@app': {
                        templateUrl: 'app/main/product/product.html',
                        controller : 'ProductController as vm'
                    }
                },
                resolve: {
					security: ['$q','mesentitlement','$timeout','$rootScope','$state','$location', function($q,mesentitlement,$timeout,$rootScope,$state, $location){
						return $q(function(resolve, reject) {
							$timeout(function() {
								if ($rootScope.isBaseSet2) {
									resolve(function () {
										var entitledStatesReturn = mesentitlement.stateDepResolver('product');

										mesentitlementProvider.setStateCheck("product");

										if(entitledStatesReturn !== true){
											return $q.reject("unauthorized");
										}
									});
								} else {
									return $location.path('/guide');
								}
							});
						});
					}]
                },
                bodyClass: 'product'
            });

        msNavigationServiceProvider.saveItem('product', {
            title    : 'product',
            state    : 'app.product',
            weight   : 9
        });
    }
})();

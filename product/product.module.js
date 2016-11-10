(function ()
{
    'use strict';

    angular
        .module('app.product', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
      ////////////////////////////////
      // App : Product
      // Owner  : Suvethan
      // Last changed date : 2016/11/10
      // Version : 6.0.0.13
      // Updated By : Suvethan
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
                  Product: function (msApi)
                  {

                  },
                    security: ['$q','mesentitlement','$timeout','$rootScope','$state', function($q,mesentitlement,$timeout,$rootScope,$state){
                        var entitledStatesReturn = mesentitlement.stateDepResolver('product');

                        if(entitledStatesReturn !== true){
                              return $q.reject("unauthorized");
                        }
                        else
                        {
                          //debugger;
                          $timeout(function() {
                            var firstLogin=localStorage.getItem("firstLogin");
                            if(firstLogin==null ||firstLogin=="" || firstLogin==undefined) {
                              console.log('Product First Login null');
                              //localStorage.removeItem('firstLogin');
                              $state.go('app.settings', {}, {location: 'settings'});
                              //return $q.reject("settings");
                            }
                            else
                            {
                              //localStorage.removeItem('firstLogin');
                            }
                          }, 50);
                        }
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

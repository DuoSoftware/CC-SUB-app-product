(function ()
{
    'use strict';

    angular
        .module('app.product', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, msNavigationServiceProvider, mesentitlementProvider)
    {
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
                    security: ['$q','mesentitlement', function($q,mesentitlement){
                        var entitledStatesReturn = mesentitlement.stateDepResolver('product');

                        if(entitledStatesReturn !== true){
                              return $q.reject("unauthorized");
                        };
                    }]
                },
                bodyClass: 'product'
            });

        msNavigationServiceProvider.saveItem('product', {
            title    : 'product',
            state    : 'app.product',
            weight   : 2
        });
    }
})();

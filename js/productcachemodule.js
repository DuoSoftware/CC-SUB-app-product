(function(cf){
    cf.factory('$productCacheHandler', function($cacheFactory){
        return $cacheFactory('productCache')
    });
})(angular.module('productCacheFactory', []))
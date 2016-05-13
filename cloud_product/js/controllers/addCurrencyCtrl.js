/**
 * Created by Suvethan on 3/30/2016.
 */

app.controller('addCurrencyCtrl', function ($scope,$mdDialog) {
    debugger;
    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    $scope.submit = function()
    {
        debugger;
        $mdDialog.hide($scope.selectCurrency);
    }
})
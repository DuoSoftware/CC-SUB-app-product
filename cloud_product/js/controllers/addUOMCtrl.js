/**
 * Created by Suvethan on 3/30/2016.
 */

app.controller('addUOMCtrl', function ($scope,$mdDialog,$charge) {
        //debugger;
        $scope.cancel = function() {
            $mdDialog.cancel();
        };
        $scope.submit = function()
        {
            var req = {
                "GUUOMID":"123",
                "GUUOMTypeID":"supplier1",
                "GUTranID":"12345",
                "CommitStatus":"Active",
                "UOMCode":$scope.uom,
                "uomApplicationMapperDetail":
                    [{
                        "GUApplicationID":"Product_123"
                    }],
                "uomConversionDetails":
                    [{
                        "FromUOMCode":$scope.uom,
                        "Qty":"10",
                        "ToUOMCode":$scope.uom
                    }]

            }
            debugger;
            $charge.uom().store(req).success(function(data) {
                debugger;
                if(data.IsSuccess) {
                    console.log(data);
                }
            }).error(function(data) {
                console.log(data);
            })

            //debugger;
            $mdDialog.hide($scope.uom);
        }
    })
/**
 * Created by Suvethan on 4/5/2016.
 */

app.controller('uploadImgCtrl', function ($scope,$mdDialog,$rootScope) {
    debugger;
    $scope.cancel = function() {
        //$mdDialog.cancel();
        //debugger;
        if($scope.content.files.length==0)
        {
            $scope.content.files=[];
        }
        $mdDialog.hide($scope.content.files);
    };
    $scope.submit = function()
    {
        debugger;
        $mdDialog.hide($scope.content.files);
    }

    $rootScope.$on('scanner-started', function(event, args) {

        $mdDialog.hide($scope.content.files);
    });
})
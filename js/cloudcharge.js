(function(cc){
    var $h;
    //var service;
    function gst(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    function getSecurityToken() {
        var _st = gst("securityToken");
        return (_st != null) ? _st : "8bb4e93e877564262d46723d099108d9";//d8c17a12da4c5174e81209e0aa993853	8bb4e93e877564262d46723d099108d9
    }
    function BP(){
        var sfn,ffn, u,endpoint,domain, b, p,host;
        function call(){
            //debugger;
            var domainReq = {
                method: "GET" ,
                url: "../js/config.json",
                headers: {'Content-Type': 'application/json', 'securityToken': getSecurityToken()}
            };
            $h(domainReq).success(function(data)
            {
                if (sfn && ffn){
                    for (key in data) {
                        if (data.hasOwnProperty(endpoint)) {
                            //console.log(data[r]["domain"]);
                            //domain=data[endpoint]["domain"];
                            //debugger;
                            var host=location.hostname;
                            if(host!="localhost") {
                                var hostContent = host.split(".");
                                var prefix = hostContent[0];
                                domain=prefix+'.'+data[endpoint]["domain"];
                            }
                            else
                            {
                                domain=data[endpoint]["domain"];
                            }
                            break;
                        }
                    }
                    var reqObj = {
                        method: b ? "POST" : "GET" ,
                        url: "http://" + domain + u,
                        headers: {'Content-Type': 'application/json', 'securityToken': getSecurityToken()}
                    };
                    //debugger;
                    //console.log(domainReq);
                    if (b) reqObj.data = b;
                    if (p) reqObj.params = p;
                    //console.log(reqObj);
                    $h(reqObj).
                        success(function(data, status, headers, config) {
                            //debugger;
                            //console.log(data);
                            if (status == 200) sfn(data);
                            else ffn(data);
                        }).
                        error(function(data, status, headers, config) {

                            ffn(data);
                        });

                }
            }).error(function(data)
            {
                //console.log(data);
            });
            //if (sfn && ffn){
            //var reqObj = {
            //   method: b ? "POST" : "GET" ,
            //   url: "http://" + ipAddress + u,
            //   headers: {'Content-Type': 'application/json', 'securityToken': getSecurityToken()}
            //};
            //if (b) reqObj.data = b;
            //if (p) reqObj.params = p;
            //   console.log(reqObj);
            ////$h(reqObj).
            ////  success(function(data, status, headers, config) {
            ////	if (status == 200) sfn(data);
            ////	else ffn(data);
            ////  }).
            ////  error(function(data, status, headers, config) {
            ////	ffn(data);
            ////  });
            //
            //}
        }
        return {
            success: function(f){sfn=f;call();return this;},
            error: function(f){ffn=f;return this;},
            p: function(ur,rr){u=ur;endpoint=rr;return this;},
            b: function(j){b =j;return this;},
            qp: function(po){p=po;return this;}
        }
    }

    cc.factory('$charge', function($http){
        $h = $http;
        return {
            product: function(){ return new ProductProxy();},
            uom: function(){ return new UomProxy();},
            commondata:function(){return new CommonDataProxy();},
            stock:function(){return new StockProxy();},
            tax:function(){return new TaxProxy();}
        }
    });

    function ProductProxy(){
        //debugger;
        var p = BP();
        var service="product";
        var handler = "/duosoftware.product.service";
        p.all = function(s,t,o){p.p(handler + "/products/getAll/",service).qp({"skip":s,"take":t,"order":o}); return p;}
        p.store = function(i){p.p(handler + "/products/insert",service).b(i); return p;}
        p.getByID=function(s){p.p(handler + "/products/getById/",service).qp({"skip":s}); return p;}
        p.update=function(i){p.p(handler + "/products/update",service).b(i); return p;}
        return p;
    }

    function UomProxy(){
        var p = BP();
        //debugger;
        var service="uom";
        var handler = "/duosoftware.uom.service";
        p.all = function(s,t,o){p.p(handler + "/uoms/getAll/",service).qp({"skip":s,"take":t,"order":o}); return p;}
        p.store = function(i){p.p(handler + "/uoms/insert",service).b(i); return p;}
        p.getUOMMasterById=function(s){p.p(handler + "/uoms/getUOMMasterById/",service).qp({"skip":s}); return p;}
        p.getUOMConversionByUOMId=function(s){p.p(handler + "/uoms/getUOMConversionByUOMId/",service).qp({"skip":s}); return p;}
        p.getUOMAppMapperByUOMId=function(s){p.p(handler + "/uoms/getUOMAppMapperByUOMId/",service).qp({"skip":s}); return p;}
        p.getAllUOM=function(s){p.p(handler + "/uoms/getAllUOMByID/",service).qp({"GUAppID":s}); return p;}
        return p;
    }

    function CommonDataProxy(){
        var p = BP();
        //debugger;
        var service="commondata";
        var handler = "/duosoftware.commondata.service";
        p.all = function(s,t,o){p.p(handler + "/commondata/getAll/",service).qp({"skip":s,"take":t,"order":o}); return p;}
        p.store = function(i){p.p(handler + "/commondata/insert",service).b(i); return p;}
        p.getDuobaseFieldDetailsByTableNameAndFieldName=function(s,t){p.p(handler + "/commondata/getDuobaseFieldDetailsByTableNameAndFieldName/",service).qp({"tableName":s,"fieldName":t}); return p;}
        p.getUOMConversionByUOMId=function(s){p.p(handler + "/commondata/getUOMConversionByUOMId/",service).qp({"skip":s}); return p;}
        p.getUOMAppMapperByUOMId=function(s){p.p(handler + "/commondata/getUOMAppMapperByUOMId/",service).qp({"skip":s}); return p;}
        p.insertDuoBaseValuesAddition=function(i){p.p(handler + "/commondata/insertDuoBaseValuesAdditional",service).b(i); return p;}
        p.getIDByRecord=function(s){p.p(handler + "/commondata/getIDByRecordName/",service).qp({"name":s}); return p;}
        return p;
    }

    function StockProxy(){
        var p = BP();
        //debugger;
        var service="stock";
        var handler = "/duosoftware.stock.service";
        p.getStock = function(s){p.p(handler + "/stock/getAvailableStock/",service).qp({"itemID":s}); return p;}
        //p.store = function(i){p.p(handler + "/uoms/insert",service).b(i); return p;}
        return p;
    }

    function TaxProxy(){
        //debugger;
        var p = BP();
        var service="tax";
        var handler = "/duosoftware.tax.service";
        p.all = function(s,t,o){p.p(handler + "/tax/getAll/",service).qp({"skip":s,"take":t,"order":o}); return p;}
        p.getTaxByIDs = function(s){p.p(handler + "/tax/getDetailsById/",service).qp({"taxId":s}); return p;}
        p.allgroups=function(s,t,o){p.p(handler + "/taxgroup/getAll/",service).qp({"skip":s,"take":t,"order":o}); return p;}
        p.getTaxGrpByIDs = function(s){p.p(handler + "/taxgroup/getById/",service).qp({"id":s}); return p;}
        p.storeTaxGrp = function(i){p.p(handler + "/taxgroup/insert",service).b(i); return p;}
        p.updateTaxGrp = function(i){p.p(handler + "/taxgroup/update",service).b(i); return p;}
        p.updateTax = function(i){p.p(handler + "/tax/update",service).b(i); return p;}
        p.storeTax = function(i){p.p(handler + "/tax/insert",service).b(i); return p;}


        return p;
    }




})(angular.module("cloudcharge", []));
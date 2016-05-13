(function(ps){
	var $h;
	function gh(){
	    var h = window.location.hostname;
	    if (h.indexOf("localhost") !=-1 || h.indexOf("127.0.0.1") !=-1)
	    	h="paydemo.epayments.lk";
	    return h + "/payapi";
	}
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
        return (_st != null) ? _st : "N/A";
    }
	function BP(){
		var sfn,ffn, u, b, p;
		function call(){
			if (sfn && ffn){
			var reqObj = {
                method: b ? "POST" : "GET" ,
                url: "http://" + gh() + u, 
                headers: {'Content-Type': 'application/json', 'securityToken': getSecurityToken()}
            };
			if (b) reqObj.data = b;
            if (p) reqObj.params = p;
			$h(reqObj).
			  success(function(data, status, headers, config) {
				if (status == 200) sfn(data);			  
				else ffn(data);
			  }).
			  error(function(data, status, headers, config) {
		  		ffn(data);
			  });

			}
		}
		return {
			success: function(f){sfn=f;call();return this;},
			error: function(f){ffn=f;call();return this;},
			p: function(ur){u=ur;return this;},
			b: function(j){b =j;return this;},
            qp: function(po){p=po;return this;}
		}
	}

	ps.factory('$pay', function($http){
		$h = $http;
		return {
			bank: function(){ return new BankProxy();},
			account: function(){ return new AccountProxy();},
			document:function(){ return new DocProxy();},
			transaction:function(){ return new TransactionProxy();},
            transactionAuthorize:function() {return new TransactionAuthenticationProxy();},
			registration:function(){ return new RegistrationProxy();},
			institute:function(){ return new InstituteProxy();},
			profile:function(){ return new ProfileProxy();},
			company:function(){ return new CompanyProxy();},
            transactionConfig:function(){ return new TransactionConfigProxy();}
		}	
	});


	function AccountProxy(){
		var p = BP();
		p.getUserAccounts = function(s,t){p.p("/account/?skip=" + s + "&take=" + t); return p;}
		p.all = function(s,t){p.p("/account/?skip=" + s + "&take=" + t); return p;}
		p.search = function(q,s,t){p.p("/account/search/?skip=" + s + "&take=" + t + "&q=" + q); return p;}
		p.add = function(a){p.p("/account/").b(a); return p;}
		p.info = function(i){p.p("/account/" + i); return p;}
		p.status = function(i){p.p("/account/status/" + i); return p;}
		p.getUserAccountsByStatus = function(i){p.p("/account/byStatus/" + i); return p;}
		p.getVerificationCode = function(i){p.p("/account/vcode/" + i); return p;}
		//p.statusUpdate = function(i){p.p("/account/status/" + i).body(i); return p;}
		return p;
	}

	function BankProxy(){
		var p = BP();
		p.all = function(s,t){p.p("/bank/"); return p;}
		p.get = function(i){p.p("/bank/" + i); return p;}
		p.confirmAccount = function(i,v){p.p("/bank/confirmaccount/" + i + "/" + v); return p;}
//		p.rejectAccount = function(i,v){p.p("/bank/rejectaccount/" + i + "/" + v); return p;}
        p.rejectAccount = function(i,v,c){p.p("/bank/rejectaccount/" + i + "/" + v).qp({"comments[]":c}); return p;}
		p.pendingAccount = function(i,v){p.p("/bank/pendingaccount/" + i + "/" + v); return p;}
		
		p.accountHolders = function(ty,s,t){p.p("/bank/accountholders/?type=" + ty + "&skip="+ s + "&take=" + t); return p;}
		//+ "&skip="+ s + "&take=" + t + "&keyword=" + str
		p.searchAccountHolders = function(ty,str,s,t){p.p("/bank/accountholders/search?type=" + ty); return p;}
		return p;
	}

	function CompanyProxy(){
		var p = BP();
		p.all = function(s,t){p.p("/company/").qp({"skip":s,"take":t}); return p;}
		p.get = function(i){p.p("/company/" + i); return p;}
		p.getFields = function(i){p.p("/company/fields/" + i); return p;}
		p.saveFields = function(i){p.p("/company/fields").b(i); return p;}
		return p;
	}


	function DocProxy(){
		var p = BP();
		p.accountConfirm = function(i){p.p("/documents/confirmacc/" + i); return p;}
		p.transactionReciept = function(i){p.p("/documents/tranreciept/" + i); return p;}
		return p;
	}
	
	function ProfileProxy(){
		var p = BP();
		p.details = function(i){p.p("/profile/" + i); return p;}
		return p;
	}
	function InstituteProxy(){
		var p = BP();
		p.all = function(s,t){p.p("/institute/?skip=" + s + "&take=" + t); return p;}
		p.search = function(q,s,t){p.p("/institute/search/?skip=" + s + "&take=" + t + "&q=" + q); return p;}
		return p;
	}

	function TransactionProxy(){
		var p = BP();
		p.newId = function(){p.p("/transaction/newid"); return p;}
		p.all = function(){p.p("/transaction"); return p;}
		p.get = function(i){p.p("/transaction/" + i); return p;}
		p.pay = function(i){p.p("/transaction/pay").b(i); return p;}
		p.status = function(i){p.p("/transaction/status/" + i); return p;}
		p.accept = function(i,s){p.p("/transaction/accept/" + i + "/" + s); return p;}
		p.reject = function(i,s){p.p("/transaction/reject/" + i + "/" + s); return p;}
		return p;
	}
	
	function TransactionConfigProxy() {
		var p = BP();
		p.newId = function(){p.p("/transaction/config/rule/newid"); return p;}
		p.all = function(){p.p("/transaction/config/rule"); return p;}
		p.store = function(i){p.p("/transaction/config/rule").b(i); return p;}
		return p;
	}
    
    function TransactionAuthenticationProxy() {
        var p = BP();
        p.storeAuthorizeUsers = function(i){p.p("/account/authorize/users").b(i); return p;}
        p.tenantUsers = function(){p.p("/tenant/users"); return p;}
        return p;
    }
    
	function RegistrationProxy(){
		var p = BP();
		p.register = function(i){p.p("/registration/register/").b(i); return p;}
		p.registerBank = function(i,n){p.p("/registration/bankregister/" + i +"?name=" + n); return p;}
		p.registerCompany = function(i,n){p.p("/registration/companyregister/" + i +"?name=" + n); return p;}
		p.checkUserNameAvialability = function(u){p.p("/registration/usernameAvailability/" + u); return p;}
        p.validateCaptcha = function(i){p.p("/registration/validateCaptcha/").b(i); return p;}
		return p;
	}

})(angular.module("paymentGateway", []));
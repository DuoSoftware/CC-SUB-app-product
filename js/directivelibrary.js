/**
 * Angular Material still lacks some components. This project aims to bring those missing components.
 * directive-library build:31-03-2016
 * Last update: Made a significant change in the file uploader directive
**/

(function($angular) {
var directiveLibraryModule = angular.module('directivelibrary',['uiMicrokernel']);

/*
_____  ___  _____ _____    _____ __  ____ __ __ _____ _____      __ _____  ___  _____ _____ 
||  ) ||=||  ||   ||==     ||_// || ((    ||<<  ||==  ||_//     ((   ||   ||=|| ||_//  ||   
||_// || ||  ||   ||___    ||    ||  \\__ || \\ ||___ || \\    \_))  ||   || || || \\  || 

*/	


   directiveLibraryModule.run(["$templateCache", function($templateCache) {
        $templateCache.put("date-picker/date-picker-dialog.html", "<md-dialog class=\"mdc-date-picker\">\n    <!-- Date picker -->\n    <div md-theme=\"{{mdTheme}}\">\n      <!-- Current day of week -->\n      <md-toolbar class=\"md-hue-2 mdc-date-picker__current-day-of-week\">\n        <span>{{ moment(selected.date).format(\'dddd\') }}</span>\n      </md-toolbar>\n\n      <!-- Current date -->\n      <md-toolbar class=\"mdc-date-picker__current-date\">\n        <span>{{ moment(selected.date).format(\'MMM\') }}</span>\n        <strong>{{ moment(selected.date).format(\'DD\') }}</strong>\n        <a ng-click=\"displayYearSelection()\">{{ moment(selected.date).format(\'YYYY\') }}</a>\n      </md-toolbar>\n\n      <!-- Calendar -->\n      <div class=\"mdc-date-picker__calendar\" ng-if=\"!yearSelection\">\n        <div class=\"mdc-date-picker__nav\">\n          <md-button class=\"md-fab md-primary\" aria-label=\"Previous month\" ng-click=\"previousMonth()\">\n            <md-icon style='margin-top:-20px' md-svg-src='/img/directive_library/ic_chevron_left_24px.svg'>  </md-icon>          </md-button>\n\n          <span>{{ activeDate.format(\'MMMM YYYY\') }}</span>\n\n       <md-button class=\"md-fab md-primary\" aria-label=\"Next month\" ng-click=\"nextMonth()\">     <md-icon style='margin-top:-20px' md-svg-src='/img/directive_library/ic_chevron_right_24px.svg' </md-icon>                </md-button>\n        </div>\n\n        <div class=\"mdc-date-picker__days-of-week\">\n          <span ng-repeat=\"day in daysOfWeek\">{{ day }}</span>\n        </div>\n\n        <div class=\"mdc-date-picker__days\">\n                    <span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\n                          ng-repeat=\"x in emptyFirstDays\">&nbsp;</span><!--\n\n                 --><div class=\"mdc-date-picker__day\"\n                         ng-class=\"{ \'mdc-date-picker__day--is-selected\': day.selected,\n                                     \'mdc-date-picker__day--is-today\': day.today }\"\n                         ng-repeat=\"day in days\">\n          <a ng-click=\"select(day)\">{{ day ? day.format(\'D\') : \'\' }}</a>\n        </div><!--\n\n                 --><span class=\"mdc-date-picker__day mdc-date-picker__day--is-empty\"\n                          ng-repeat=\"x in emptyLastDays\">&nbsp;</span>\n        </div>\n      </div>\n\n      <!-- Year selection -->\n      <div class=\"mdc-date-picker__year-selector\" ng-show=\"yearSelection\">\n        <a class=\"mdc-date-picker__year\"\n           ng-class=\"{ \'mdc-date-picker__year--is-active\': year == activeDate.format(\'YYYY\') }\"\n           ng-repeat=\"year in years\"\n           ng-click=\"selectYear(year)\"\n           ng-if=\"yearSelection\">\n          <span>{{year}}</span>\n        </a>\n      </div>\n\n          </div>\n</md-dialog>\n");
        $templateCache.put("date-picker/date-picker-input.html", "<md-input-container class=\"md-block\" flex-gt-sm>\n  <label>{{label}}</label>\n  <input id=\"datePicker\" type=\"text\" ng-model=\"selected.model\" tabindex=\"-1\" ng-disabled=\"disableDatePicker\"  ng-click=\"openPicker($event)\"/>\n</md-input-container>\n");
    }]);
	
	directiveLibraryModule.controller('mdcDatePickerController', function ($scope, $timeout, $mdDialog, $document, model, locale, mdTheme) {
    function checkLocale(locale) {
      if (!locale) {
        return (navigator.language !== null ? navigator.language : navigator.browserLanguage).split('_')[0].split('-')[0] || 'en';
      }
      return locale;
    }

    $scope.model = model;
    $scope.mdTheme = mdTheme ? mdTheme : 'default';

    var activeLocale;

    this.build = function (locale) {
      activeLocale = locale;

      moment.locale(activeLocale);

      if (angular.isDefined($scope.model)) {
        $scope.selected = {
          model: moment($scope.model).format('LL'),
          date: $scope.model
        };

        $scope.activeDate = moment($scope.model);
      }
      else {
        $scope.selected = {
          model: undefined,
          date: new Date()
        };

        $scope.activeDate = moment();
      }

      $scope.moment = moment;

      $scope.days = [];
      //TODO: Use moment locale to set first day of week properly.
      $scope.daysOfWeek = [moment.weekdaysMin(1), moment.weekdaysMin(2), moment.weekdaysMin(3), moment.weekdaysMin(4), moment.weekdaysMin(5), moment.weekdaysMin(6), moment.weekdaysMin(0)];

      $scope.years = [];

      for (var y = moment().year() - 100; y <= moment().year() + 100; y++) {
        $scope.years.push(y);
      }

      generateCalendar();
    };
    this.build(checkLocale(locale));

    $scope.previousMonth = function () {
      $scope.activeDate = $scope.activeDate.subtract(1, 'month');
      generateCalendar();
    };

    $scope.nextMonth = function () {
      $scope.activeDate = $scope.activeDate.add(1, 'month');
      generateCalendar();
    };

    $scope.select = function (day) {
      $scope.selected = {
        model: day.format('LL'),
        date: day.toDate()
      };

      $scope.model = day.toDate();

      generateCalendar();
	  $mdDialog.hide($scope.selected);
    };

    $scope.selectYear = function (year) {
      $scope.yearSelection = false;

      $scope.selected.model = moment($scope.selected.date).year(year).format('LL');
      $scope.selected.date = moment($scope.selected.date).year(year).toDate();
      $scope.model = moment($scope.selected.date).toDate();
      $scope.activeDate = $scope.activeDate.add(year - $scope.activeDate.year(), 'year');

      generateCalendar();
    };
    $scope.displayYearSelection = function () {
      var calendarHeight = $document[0].getElementsByClassName('mdc-date-picker__calendar')[0].offsetHeight;
      var yearSelectorElement = $document[0].getElementsByClassName('mdc-date-picker__year-selector')[0];
      yearSelectorElement.style.height = calendarHeight + 'px';

      $scope.yearSelection = true;

      $timeout(function () {
        var activeYearElement = $document[0].getElementsByClassName('mdc-date-picker__year--is-active')[0];
        yearSelectorElement.scrollTop = yearSelectorElement.scrollTop + activeYearElement.offsetTop - yearSelectorElement.offsetHeight / 2 + activeYearElement.offsetHeight / 2;
      });
    };

    function generateCalendar() {
      var days = [],
        previousDay = angular.copy($scope.activeDate).date(0),
        firstDayOfMonth = angular.copy($scope.activeDate).date(1),
        lastDayOfMonth = angular.copy(firstDayOfMonth).endOf('month'),
        maxDays = angular.copy(lastDayOfMonth).date();

      $scope.emptyFirstDays = [];

      for (var i = firstDayOfMonth.day() === 0 ? 6 : firstDayOfMonth.day() - 1; i > 0; i--) {
        $scope.emptyFirstDays.push({});
      }

      for (var j = 0; j < maxDays; j++) {
        var date = angular.copy(previousDay.add(1, 'days'));

        date.selected = angular.isDefined($scope.selected.model) && date.isSame($scope.selected.date, 'day');
        date.today = date.isSame(moment(), 'day');

        days.push(date);
      }

      $scope.emptyLastDays = [];

      for (var k = 7 - (lastDayOfMonth.day() === 0 ? 7 : lastDayOfMonth.day()); k > 0; k--) {
        $scope.emptyLastDays.push({});
      }

      $scope.days = days;
    }

    $scope.cancel = function() {
      $mdDialog.hide();
    };

    $scope.closePicker = function () {
      $mdDialog.hide($scope.selected);
    };
  })
directiveLibraryModule.controller('mdcDatePickerInputController', function ($scope, $attrs, $timeout, $mdDialog) {
    if (angular.isDefined($scope.model)) {
      $scope.selected = {
        model: moment($scope.model).format('LL'),
        date: $scope.model
      };
    }
    else {
      $scope.selected = {
        model: undefined,
        date: new Date()
      };
    }

    $scope.openPicker = function (ev) {
      $scope.yearSelection = false;

      $mdDialog.show({
        targetEvent: ev,
        templateUrl: 'date-picker/date-picker-dialog.html',
        controller: 'mdcDatePickerController',
		clickOutsideToClose:true,
        locals: {model: $scope.model, locale: $attrs.locale, mdTheme: $attrs.dialogMdTheme}
      }).then(function (selected) {
        if (selected) {
          $scope.selected = selected;
          $scope.model = selected.model;
        }
      });
    };
  })
directiveLibraryModule.directive('mdDatePicker', function () {
    return {
      restrict: 'AE',
      controller: 'mdcDatePickerInputController',
      scope: {
        model: '=',
        label: '@',
		disableDatePicker: '='
      },
      templateUrl: 'date-picker/date-picker-input.html'
    };
  });
  
  
  //This is a minified version of moment.js which is needed by this directive
//! moment.js
//! version : 2.11.1
//! authors : Tim Wood, Iskren Chernev, Moment.js contributors
//! license : MIT
//! momentjs.com
!function(a,b){"object"==typeof exports&&"undefined"!=typeof module?module.exports=b():"function"==typeof define&&define.amd?define(b):a.moment=b()}(this,function(){"use strict";function a(){return Uc.apply(null,arguments)}function b(a){Uc=a}function c(a){return"[object Array]"===Object.prototype.toString.call(a)}function d(a){return a instanceof Date||"[object Date]"===Object.prototype.toString.call(a)}function e(a,b){var c,d=[];for(c=0;c<a.length;++c)d.push(b(a[c],c));return d}function f(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function g(a,b){for(var c in b)f(b,c)&&(a[c]=b[c]);return f(b,"toString")&&(a.toString=b.toString),f(b,"valueOf")&&(a.valueOf=b.valueOf),a}function h(a,b,c,d){return Da(a,b,c,d,!0).utc()}function i(){return{empty:!1,unusedTokens:[],unusedInput:[],overflow:-2,charsLeftOver:0,nullInput:!1,invalidMonth:null,invalidFormat:!1,userInvalidated:!1,iso:!1}}function j(a){return null==a._pf&&(a._pf=i()),a._pf}function k(a){if(null==a._isValid){var b=j(a);a._isValid=!(isNaN(a._d.getTime())||!(b.overflow<0)||b.empty||b.invalidMonth||b.invalidWeekday||b.nullInput||b.invalidFormat||b.userInvalidated),a._strict&&(a._isValid=a._isValid&&0===b.charsLeftOver&&0===b.unusedTokens.length&&void 0===b.bigHour)}return a._isValid}function l(a){var b=h(NaN);return null!=a?g(j(b),a):j(b).userInvalidated=!0,b}function m(a){return void 0===a}function n(a,b){var c,d,e;if(m(b._isAMomentObject)||(a._isAMomentObject=b._isAMomentObject),m(b._i)||(a._i=b._i),m(b._f)||(a._f=b._f),m(b._l)||(a._l=b._l),m(b._strict)||(a._strict=b._strict),m(b._tzm)||(a._tzm=b._tzm),m(b._isUTC)||(a._isUTC=b._isUTC),m(b._offset)||(a._offset=b._offset),m(b._pf)||(a._pf=j(b)),m(b._locale)||(a._locale=b._locale),Wc.length>0)for(c in Wc)d=Wc[c],e=b[d],m(e)||(a[d]=e);return a}function o(b){n(this,b),this._d=new Date(null!=b._d?b._d.getTime():NaN),Xc===!1&&(Xc=!0,a.updateOffset(this),Xc=!1)}function p(a){return a instanceof o||null!=a&&null!=a._isAMomentObject}function q(a){return 0>a?Math.ceil(a):Math.floor(a)}function r(a){var b=+a,c=0;return 0!==b&&isFinite(b)&&(c=q(b)),c}function s(a,b,c){var d,e=Math.min(a.length,b.length),f=Math.abs(a.length-b.length),g=0;for(d=0;e>d;d++)(c&&a[d]!==b[d]||!c&&r(a[d])!==r(b[d]))&&g++;return g+f}function t(){}function u(a){return a?a.toLowerCase().replace("_","-"):a}function v(a){for(var b,c,d,e,f=0;f<a.length;){for(e=u(a[f]).split("-"),b=e.length,c=u(a[f+1]),c=c?c.split("-"):null;b>0;){if(d=w(e.slice(0,b).join("-")))return d;if(c&&c.length>=b&&s(e,c,!0)>=b-1)break;b--}f++}return null}function w(a){var b=null;if(!Yc[a]&&"undefined"!=typeof module&&module&&module.exports)try{b=Vc._abbr,require("./locale/"+a),x(b)}catch(c){}return Yc[a]}function x(a,b){var c;return a&&(c=m(b)?z(a):y(a,b),c&&(Vc=c)),Vc._abbr}function y(a,b){return null!==b?(b.abbr=a,Yc[a]=Yc[a]||new t,Yc[a].set(b),x(a),Yc[a]):(delete Yc[a],null)}function z(a){var b;if(a&&a._locale&&a._locale._abbr&&(a=a._locale._abbr),!a)return Vc;if(!c(a)){if(b=w(a))return b;a=[a]}return v(a)}function A(a,b){var c=a.toLowerCase();Zc[c]=Zc[c+"s"]=Zc[b]=a}function B(a){return"string"==typeof a?Zc[a]||Zc[a.toLowerCase()]:void 0}function C(a){var b,c,d={};for(c in a)f(a,c)&&(b=B(c),b&&(d[b]=a[c]));return d}function D(a){return a instanceof Function||"[object Function]"===Object.prototype.toString.call(a)}function E(b,c){return function(d){return null!=d?(G(this,b,d),a.updateOffset(this,c),this):F(this,b)}}function F(a,b){return a.isValid()?a._d["get"+(a._isUTC?"UTC":"")+b]():NaN}function G(a,b,c){a.isValid()&&a._d["set"+(a._isUTC?"UTC":"")+b](c)}function H(a,b){var c;if("object"==typeof a)for(c in a)this.set(c,a[c]);else if(a=B(a),D(this[a]))return this[a](b);return this}function I(a,b,c){var d=""+Math.abs(a),e=b-d.length,f=a>=0;return(f?c?"+":"":"-")+Math.pow(10,Math.max(0,e)).toString().substr(1)+d}function J(a,b,c,d){var e=d;"string"==typeof d&&(e=function(){return this[d]()}),a&&(bd[a]=e),b&&(bd[b[0]]=function(){return I(e.apply(this,arguments),b[1],b[2])}),c&&(bd[c]=function(){return this.localeData().ordinal(e.apply(this,arguments),a)})}function K(a){return a.match(/\[[\s\S]/)?a.replace(/^\[|\]$/g,""):a.replace(/\\/g,"")}function L(a){var b,c,d=a.match($c);for(b=0,c=d.length;c>b;b++)bd[d[b]]?d[b]=bd[d[b]]:d[b]=K(d[b]);return function(e){var f="";for(b=0;c>b;b++)f+=d[b]instanceof Function?d[b].call(e,a):d[b];return f}}function M(a,b){return a.isValid()?(b=N(b,a.localeData()),ad[b]=ad[b]||L(b),ad[b](a)):a.localeData().invalidDate()}function N(a,b){function c(a){return b.longDateFormat(a)||a}var d=5;for(_c.lastIndex=0;d>=0&&_c.test(a);)a=a.replace(_c,c),_c.lastIndex=0,d-=1;return a}function O(a,b,c){td[a]=D(b)?b:function(a,d){return a&&c?c:b}}function P(a,b){return f(td,a)?td[a](b._strict,b._locale):new RegExp(Q(a))}function Q(a){return R(a.replace("\\","").replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g,function(a,b,c,d,e){return b||c||d||e}))}function R(a){return a.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}function S(a,b){var c,d=b;for("string"==typeof a&&(a=[a]),"number"==typeof b&&(d=function(a,c){c[b]=r(a)}),c=0;c<a.length;c++)ud[a[c]]=d}function T(a,b){S(a,function(a,c,d,e){d._w=d._w||{},b(a,d._w,d,e)})}function U(a,b,c){null!=b&&f(ud,a)&&ud[a](b,c._a,c,a)}function V(a,b){return new Date(Date.UTC(a,b+1,0)).getUTCDate()}function W(a,b){return c(this._months)?this._months[a.month()]:this._months[Ed.test(b)?"format":"standalone"][a.month()]}function X(a,b){return c(this._monthsShort)?this._monthsShort[a.month()]:this._monthsShort[Ed.test(b)?"format":"standalone"][a.month()]}function Y(a,b,c){var d,e,f;for(this._monthsParse||(this._monthsParse=[],this._longMonthsParse=[],this._shortMonthsParse=[]),d=0;12>d;d++){if(e=h([2e3,d]),c&&!this._longMonthsParse[d]&&(this._longMonthsParse[d]=new RegExp("^"+this.months(e,"").replace(".","")+"$","i"),this._shortMonthsParse[d]=new RegExp("^"+this.monthsShort(e,"").replace(".","")+"$","i")),c||this._monthsParse[d]||(f="^"+this.months(e,"")+"|^"+this.monthsShort(e,""),this._monthsParse[d]=new RegExp(f.replace(".",""),"i")),c&&"MMMM"===b&&this._longMonthsParse[d].test(a))return d;if(c&&"MMM"===b&&this._shortMonthsParse[d].test(a))return d;if(!c&&this._monthsParse[d].test(a))return d}}function Z(a,b){var c;return a.isValid()?"string"==typeof b&&(b=a.localeData().monthsParse(b),"number"!=typeof b)?a:(c=Math.min(a.date(),V(a.year(),b)),a._d["set"+(a._isUTC?"UTC":"")+"Month"](b,c),a):a}function $(b){return null!=b?(Z(this,b),a.updateOffset(this,!0),this):F(this,"Month")}function _(){return V(this.year(),this.month())}function aa(a){return this._monthsParseExact?(f(this,"_monthsRegex")||ca.call(this),a?this._monthsShortStrictRegex:this._monthsShortRegex):this._monthsShortStrictRegex&&a?this._monthsShortStrictRegex:this._monthsShortRegex}function ba(a){return this._monthsParseExact?(f(this,"_monthsRegex")||ca.call(this),a?this._monthsStrictRegex:this._monthsRegex):this._monthsStrictRegex&&a?this._monthsStrictRegex:this._monthsRegex}function ca(){function a(a,b){return b.length-a.length}var b,c,d=[],e=[],f=[];for(b=0;12>b;b++)c=h([2e3,b]),d.push(this.monthsShort(c,"")),e.push(this.months(c,"")),f.push(this.months(c,"")),f.push(this.monthsShort(c,""));for(d.sort(a),e.sort(a),f.sort(a),b=0;12>b;b++)d[b]=R(d[b]),e[b]=R(e[b]),f[b]=R(f[b]);this._monthsRegex=new RegExp("^("+f.join("|")+")","i"),this._monthsShortRegex=this._monthsRegex,this._monthsStrictRegex=new RegExp("^("+e.join("|")+")$","i"),this._monthsShortStrictRegex=new RegExp("^("+d.join("|")+")$","i")}function da(a){var b,c=a._a;return c&&-2===j(a).overflow&&(b=c[wd]<0||c[wd]>11?wd:c[xd]<1||c[xd]>V(c[vd],c[wd])?xd:c[yd]<0||c[yd]>24||24===c[yd]&&(0!==c[zd]||0!==c[Ad]||0!==c[Bd])?yd:c[zd]<0||c[zd]>59?zd:c[Ad]<0||c[Ad]>59?Ad:c[Bd]<0||c[Bd]>999?Bd:-1,j(a)._overflowDayOfYear&&(vd>b||b>xd)&&(b=xd),j(a)._overflowWeeks&&-1===b&&(b=Cd),j(a)._overflowWeekday&&-1===b&&(b=Dd),j(a).overflow=b),a}function ea(b){a.suppressDeprecationWarnings===!1&&"undefined"!=typeof console&&console.warn&&console.warn("Deprecation warning: "+b)}function fa(a,b){var c=!0;return g(function(){return c&&(ea(a+"\nArguments: "+Array.prototype.slice.call(arguments).join(", ")+"\n"+(new Error).stack),c=!1),b.apply(this,arguments)},b)}function ga(a,b){Jd[a]||(ea(b),Jd[a]=!0)}function ha(a){var b,c,d,e,f,g,h=a._i,i=Kd.exec(h)||Ld.exec(h);if(i){for(j(a).iso=!0,b=0,c=Nd.length;c>b;b++)if(Nd[b][1].exec(i[1])){e=Nd[b][0],d=Nd[b][2]!==!1;break}if(null==e)return void(a._isValid=!1);if(i[3]){for(b=0,c=Od.length;c>b;b++)if(Od[b][1].exec(i[3])){f=(i[2]||" ")+Od[b][0];break}if(null==f)return void(a._isValid=!1)}if(!d&&null!=f)return void(a._isValid=!1);if(i[4]){if(!Md.exec(i[4]))return void(a._isValid=!1);g="Z"}a._f=e+(f||"")+(g||""),wa(a)}else a._isValid=!1}function ia(b){var c=Pd.exec(b._i);return null!==c?void(b._d=new Date(+c[1])):(ha(b),void(b._isValid===!1&&(delete b._isValid,a.createFromInputFallback(b))))}function ja(a,b,c,d,e,f,g){var h=new Date(a,b,c,d,e,f,g);return 100>a&&a>=0&&isFinite(h.getFullYear())&&h.setFullYear(a),h}function ka(a){var b=new Date(Date.UTC.apply(null,arguments));return 100>a&&a>=0&&isFinite(b.getUTCFullYear())&&b.setUTCFullYear(a),b}function la(a){return ma(a)?366:365}function ma(a){return a%4===0&&a%100!==0||a%400===0}function na(){return ma(this.year())}function oa(a,b,c){var d=7+b-c,e=(7+ka(a,0,d).getUTCDay()-b)%7;return-e+d-1}function pa(a,b,c,d,e){var f,g,h=(7+c-d)%7,i=oa(a,d,e),j=1+7*(b-1)+h+i;return 0>=j?(f=a-1,g=la(f)+j):j>la(a)?(f=a+1,g=j-la(a)):(f=a,g=j),{year:f,dayOfYear:g}}function qa(a,b,c){var d,e,f=oa(a.year(),b,c),g=Math.floor((a.dayOfYear()-f-1)/7)+1;return 1>g?(e=a.year()-1,d=g+ra(e,b,c)):g>ra(a.year(),b,c)?(d=g-ra(a.year(),b,c),e=a.year()+1):(e=a.year(),d=g),{week:d,year:e}}function ra(a,b,c){var d=oa(a,b,c),e=oa(a+1,b,c);return(la(a)-d+e)/7}function sa(a,b,c){return null!=a?a:null!=b?b:c}function ta(b){var c=new Date(a.now());return b._useUTC?[c.getUTCFullYear(),c.getUTCMonth(),c.getUTCDate()]:[c.getFullYear(),c.getMonth(),c.getDate()]}function ua(a){var b,c,d,e,f=[];if(!a._d){for(d=ta(a),a._w&&null==a._a[xd]&&null==a._a[wd]&&va(a),a._dayOfYear&&(e=sa(a._a[vd],d[vd]),a._dayOfYear>la(e)&&(j(a)._overflowDayOfYear=!0),c=ka(e,0,a._dayOfYear),a._a[wd]=c.getUTCMonth(),a._a[xd]=c.getUTCDate()),b=0;3>b&&null==a._a[b];++b)a._a[b]=f[b]=d[b];for(;7>b;b++)a._a[b]=f[b]=null==a._a[b]?2===b?1:0:a._a[b];24===a._a[yd]&&0===a._a[zd]&&0===a._a[Ad]&&0===a._a[Bd]&&(a._nextDay=!0,a._a[yd]=0),a._d=(a._useUTC?ka:ja).apply(null,f),null!=a._tzm&&a._d.setUTCMinutes(a._d.getUTCMinutes()-a._tzm),a._nextDay&&(a._a[yd]=24)}}function va(a){var b,c,d,e,f,g,h,i;b=a._w,null!=b.GG||null!=b.W||null!=b.E?(f=1,g=4,c=sa(b.GG,a._a[vd],qa(Ea(),1,4).year),d=sa(b.W,1),e=sa(b.E,1),(1>e||e>7)&&(i=!0)):(f=a._locale._week.dow,g=a._locale._week.doy,c=sa(b.gg,a._a[vd],qa(Ea(),f,g).year),d=sa(b.w,1),null!=b.d?(e=b.d,(0>e||e>6)&&(i=!0)):null!=b.e?(e=b.e+f,(b.e<0||b.e>6)&&(i=!0)):e=f),1>d||d>ra(c,f,g)?j(a)._overflowWeeks=!0:null!=i?j(a)._overflowWeekday=!0:(h=pa(c,d,e,f,g),a._a[vd]=h.year,a._dayOfYear=h.dayOfYear)}function wa(b){if(b._f===a.ISO_8601)return void ha(b);b._a=[],j(b).empty=!0;var c,d,e,f,g,h=""+b._i,i=h.length,k=0;for(e=N(b._f,b._locale).match($c)||[],c=0;c<e.length;c++)f=e[c],d=(h.match(P(f,b))||[])[0],d&&(g=h.substr(0,h.indexOf(d)),g.length>0&&j(b).unusedInput.push(g),h=h.slice(h.indexOf(d)+d.length),k+=d.length),bd[f]?(d?j(b).empty=!1:j(b).unusedTokens.push(f),U(f,d,b)):b._strict&&!d&&j(b).unusedTokens.push(f);j(b).charsLeftOver=i-k,h.length>0&&j(b).unusedInput.push(h),j(b).bigHour===!0&&b._a[yd]<=12&&b._a[yd]>0&&(j(b).bigHour=void 0),b._a[yd]=xa(b._locale,b._a[yd],b._meridiem),ua(b),da(b)}function xa(a,b,c){var d;return null==c?b:null!=a.meridiemHour?a.meridiemHour(b,c):null!=a.isPM?(d=a.isPM(c),d&&12>b&&(b+=12),d||12!==b||(b=0),b):b}function ya(a){var b,c,d,e,f;if(0===a._f.length)return j(a).invalidFormat=!0,void(a._d=new Date(NaN));for(e=0;e<a._f.length;e++)f=0,b=n({},a),null!=a._useUTC&&(b._useUTC=a._useUTC),b._f=a._f[e],wa(b),k(b)&&(f+=j(b).charsLeftOver,f+=10*j(b).unusedTokens.length,j(b).score=f,(null==d||d>f)&&(d=f,c=b));g(a,c||b)}function za(a){if(!a._d){var b=C(a._i);a._a=e([b.year,b.month,b.day||b.date,b.hour,b.minute,b.second,b.millisecond],function(a){return a&&parseInt(a,10)}),ua(a)}}function Aa(a){var b=new o(da(Ba(a)));return b._nextDay&&(b.add(1,"d"),b._nextDay=void 0),b}function Ba(a){var b=a._i,e=a._f;return a._locale=a._locale||z(a._l),null===b||void 0===e&&""===b?l({nullInput:!0}):("string"==typeof b&&(a._i=b=a._locale.preparse(b)),p(b)?new o(da(b)):(c(e)?ya(a):e?wa(a):d(b)?a._d=b:Ca(a),k(a)||(a._d=null),a))}function Ca(b){var f=b._i;void 0===f?b._d=new Date(a.now()):d(f)?b._d=new Date(+f):"string"==typeof f?ia(b):c(f)?(b._a=e(f.slice(0),function(a){return parseInt(a,10)}),ua(b)):"object"==typeof f?za(b):"number"==typeof f?b._d=new Date(f):a.createFromInputFallback(b)}function Da(a,b,c,d,e){var f={};return"boolean"==typeof c&&(d=c,c=void 0),f._isAMomentObject=!0,f._useUTC=f._isUTC=e,f._l=c,f._i=a,f._f=b,f._strict=d,Aa(f)}function Ea(a,b,c,d){return Da(a,b,c,d,!1)}function Fa(a,b){var d,e;if(1===b.length&&c(b[0])&&(b=b[0]),!b.length)return Ea();for(d=b[0],e=1;e<b.length;++e)(!b[e].isValid()||b[e][a](d))&&(d=b[e]);return d}function Ga(){var a=[].slice.call(arguments,0);return Fa("isBefore",a)}function Ha(){var a=[].slice.call(arguments,0);return Fa("isAfter",a)}function Ia(a){var b=C(a),c=b.year||0,d=b.quarter||0,e=b.month||0,f=b.week||0,g=b.day||0,h=b.hour||0,i=b.minute||0,j=b.second||0,k=b.millisecond||0;this._milliseconds=+k+1e3*j+6e4*i+36e5*h,this._days=+g+7*f,this._months=+e+3*d+12*c,this._data={},this._locale=z(),this._bubble()}function Ja(a){return a instanceof Ia}function Ka(a,b){J(a,0,0,function(){var a=this.utcOffset(),c="+";return 0>a&&(a=-a,c="-"),c+I(~~(a/60),2)+b+I(~~a%60,2)})}function La(a,b){var c=(b||"").match(a)||[],d=c[c.length-1]||[],e=(d+"").match(Ud)||["-",0,0],f=+(60*e[1])+r(e[2]);return"+"===e[0]?f:-f}function Ma(b,c){var e,f;return c._isUTC?(e=c.clone(),f=(p(b)||d(b)?+b:+Ea(b))-+e,e._d.setTime(+e._d+f),a.updateOffset(e,!1),e):Ea(b).local()}function Na(a){return 15*-Math.round(a._d.getTimezoneOffset()/15)}function Oa(b,c){var d,e=this._offset||0;return this.isValid()?null!=b?("string"==typeof b?b=La(qd,b):Math.abs(b)<16&&(b=60*b),!this._isUTC&&c&&(d=Na(this)),this._offset=b,this._isUTC=!0,null!=d&&this.add(d,"m"),e!==b&&(!c||this._changeInProgress?cb(this,Za(b-e,"m"),1,!1):this._changeInProgress||(this._changeInProgress=!0,a.updateOffset(this,!0),this._changeInProgress=null)),this):this._isUTC?e:Na(this):null!=b?this:NaN}function Pa(a,b){return null!=a?("string"!=typeof a&&(a=-a),this.utcOffset(a,b),this):-this.utcOffset()}function Qa(a){return this.utcOffset(0,a)}function Ra(a){return this._isUTC&&(this.utcOffset(0,a),this._isUTC=!1,a&&this.subtract(Na(this),"m")),this}function Sa(){return this._tzm?this.utcOffset(this._tzm):"string"==typeof this._i&&this.utcOffset(La(pd,this._i)),this}function Ta(a){return this.isValid()?(a=a?Ea(a).utcOffset():0,(this.utcOffset()-a)%60===0):!1}function Ua(){return this.utcOffset()>this.clone().month(0).utcOffset()||this.utcOffset()>this.clone().month(5).utcOffset()}function Va(){if(!m(this._isDSTShifted))return this._isDSTShifted;var a={};if(n(a,this),a=Ba(a),a._a){var b=a._isUTC?h(a._a):Ea(a._a);this._isDSTShifted=this.isValid()&&s(a._a,b.toArray())>0}else this._isDSTShifted=!1;return this._isDSTShifted}function Wa(){return this.isValid()?!this._isUTC:!1}function Xa(){return this.isValid()?this._isUTC:!1}function Ya(){return this.isValid()?this._isUTC&&0===this._offset:!1}function Za(a,b){var c,d,e,g=a,h=null;return Ja(a)?g={ms:a._milliseconds,d:a._days,M:a._months}:"number"==typeof a?(g={},b?g[b]=a:g.milliseconds=a):(h=Vd.exec(a))?(c="-"===h[1]?-1:1,g={y:0,d:r(h[xd])*c,h:r(h[yd])*c,m:r(h[zd])*c,s:r(h[Ad])*c,ms:r(h[Bd])*c}):(h=Wd.exec(a))?(c="-"===h[1]?-1:1,g={y:$a(h[2],c),M:$a(h[3],c),d:$a(h[4],c),h:$a(h[5],c),m:$a(h[6],c),s:$a(h[7],c),w:$a(h[8],c)}):null==g?g={}:"object"==typeof g&&("from"in g||"to"in g)&&(e=ab(Ea(g.from),Ea(g.to)),g={},g.ms=e.milliseconds,g.M=e.months),d=new Ia(g),Ja(a)&&f(a,"_locale")&&(d._locale=a._locale),d}function $a(a,b){var c=a&&parseFloat(a.replace(",","."));return(isNaN(c)?0:c)*b}function _a(a,b){var c={milliseconds:0,months:0};return c.months=b.month()-a.month()+12*(b.year()-a.year()),a.clone().add(c.months,"M").isAfter(b)&&--c.months,c.milliseconds=+b-+a.clone().add(c.months,"M"),c}function ab(a,b){var c;return a.isValid()&&b.isValid()?(b=Ma(b,a),a.isBefore(b)?c=_a(a,b):(c=_a(b,a),c.milliseconds=-c.milliseconds,c.months=-c.months),c):{milliseconds:0,months:0}}function bb(a,b){return function(c,d){var e,f;return null===d||isNaN(+d)||(ga(b,"moment()."+b+"(period, number) is deprecated. Please use moment()."+b+"(number, period)."),f=c,c=d,d=f),c="string"==typeof c?+c:c,e=Za(c,d),cb(this,e,a),this}}function cb(b,c,d,e){var f=c._milliseconds,g=c._days,h=c._months;b.isValid()&&(e=null==e?!0:e,f&&b._d.setTime(+b._d+f*d),g&&G(b,"Date",F(b,"Date")+g*d),h&&Z(b,F(b,"Month")+h*d),e&&a.updateOffset(b,g||h))}function db(a,b){var c=a||Ea(),d=Ma(c,this).startOf("day"),e=this.diff(d,"days",!0),f=-6>e?"sameElse":-1>e?"lastWeek":0>e?"lastDay":1>e?"sameDay":2>e?"nextDay":7>e?"nextWeek":"sameElse",g=b&&(D(b[f])?b[f]():b[f]);return this.format(g||this.localeData().calendar(f,this,Ea(c)))}function eb(){return new o(this)}function fb(a,b){var c=p(a)?a:Ea(a);return this.isValid()&&c.isValid()?(b=B(m(b)?"millisecond":b),"millisecond"===b?+this>+c:+c<+this.clone().startOf(b)):!1}function gb(a,b){var c=p(a)?a:Ea(a);return this.isValid()&&c.isValid()?(b=B(m(b)?"millisecond":b),"millisecond"===b?+c>+this:+this.clone().endOf(b)<+c):!1}function hb(a,b,c){return this.isAfter(a,c)&&this.isBefore(b,c)}function ib(a,b){var c,d=p(a)?a:Ea(a);return this.isValid()&&d.isValid()?(b=B(b||"millisecond"),"millisecond"===b?+this===+d:(c=+d,+this.clone().startOf(b)<=c&&c<=+this.clone().endOf(b))):!1}function jb(a,b){return this.isSame(a,b)||this.isAfter(a,b)}function kb(a,b){return this.isSame(a,b)||this.isBefore(a,b)}function lb(a,b,c){var d,e,f,g;return this.isValid()?(d=Ma(a,this),d.isValid()?(e=6e4*(d.utcOffset()-this.utcOffset()),b=B(b),"year"===b||"month"===b||"quarter"===b?(g=mb(this,d),"quarter"===b?g/=3:"year"===b&&(g/=12)):(f=this-d,g="second"===b?f/1e3:"minute"===b?f/6e4:"hour"===b?f/36e5:"day"===b?(f-e)/864e5:"week"===b?(f-e)/6048e5:f),c?g:q(g)):NaN):NaN}function mb(a,b){var c,d,e=12*(b.year()-a.year())+(b.month()-a.month()),f=a.clone().add(e,"months");return 0>b-f?(c=a.clone().add(e-1,"months"),d=(b-f)/(f-c)):(c=a.clone().add(e+1,"months"),d=(b-f)/(c-f)),-(e+d)}function nb(){return this.clone().locale("en").format("ddd MMM DD YYYY HH:mm:ss [GMT]ZZ")}function ob(){var a=this.clone().utc();return 0<a.year()&&a.year()<=9999?D(Date.prototype.toISOString)?this.toDate().toISOString():M(a,"YYYY-MM-DD[T]HH:mm:ss.SSS[Z]"):M(a,"YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]")}function pb(b){var c=M(this,b||a.defaultFormat);return this.localeData().postformat(c)}function qb(a,b){return this.isValid()&&(p(a)&&a.isValid()||Ea(a).isValid())?Za({to:this,from:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function rb(a){return this.from(Ea(),a)}function sb(a,b){return this.isValid()&&(p(a)&&a.isValid()||Ea(a).isValid())?Za({from:this,to:a}).locale(this.locale()).humanize(!b):this.localeData().invalidDate()}function tb(a){return this.to(Ea(),a)}function ub(a){var b;return void 0===a?this._locale._abbr:(b=z(a),null!=b&&(this._locale=b),this)}function vb(){return this._locale}function wb(a){switch(a=B(a)){case"year":this.month(0);case"quarter":case"month":this.date(1);case"week":case"isoWeek":case"day":this.hours(0);case"hour":this.minutes(0);case"minute":this.seconds(0);case"second":this.milliseconds(0)}return"week"===a&&this.weekday(0),"isoWeek"===a&&this.isoWeekday(1),"quarter"===a&&this.month(3*Math.floor(this.month()/3)),this}function xb(a){return a=B(a),void 0===a||"millisecond"===a?this:this.startOf(a).add(1,"isoWeek"===a?"week":a).subtract(1,"ms")}function yb(){return+this._d-6e4*(this._offset||0)}function zb(){return Math.floor(+this/1e3)}function Ab(){return this._offset?new Date(+this):this._d}function Bb(){var a=this;return[a.year(),a.month(),a.date(),a.hour(),a.minute(),a.second(),a.millisecond()]}function Cb(){var a=this;return{years:a.year(),months:a.month(),date:a.date(),hours:a.hours(),minutes:a.minutes(),seconds:a.seconds(),milliseconds:a.milliseconds()}}function Db(){return this.isValid()?this.toISOString():"null"}function Eb(){return k(this)}function Fb(){return g({},j(this))}function Gb(){return j(this).overflow}function Hb(){return{input:this._i,format:this._f,locale:this._locale,isUTC:this._isUTC,strict:this._strict}}function Ib(a,b){J(0,[a,a.length],0,b)}function Jb(a){return Nb.call(this,a,this.week(),this.weekday(),this.localeData()._week.dow,this.localeData()._week.doy)}function Kb(a){return Nb.call(this,a,this.isoWeek(),this.isoWeekday(),1,4)}function Lb(){return ra(this.year(),1,4)}function Mb(){var a=this.localeData()._week;return ra(this.year(),a.dow,a.doy)}function Nb(a,b,c,d,e){var f;return null==a?qa(this,d,e).year:(f=ra(a,d,e),b>f&&(b=f),Ob.call(this,a,b,c,d,e))}function Ob(a,b,c,d,e){var f=pa(a,b,c,d,e),g=ka(f.year,0,f.dayOfYear);return this.year(g.getUTCFullYear()),this.month(g.getUTCMonth()),this.date(g.getUTCDate()),this}function Pb(a){return null==a?Math.ceil((this.month()+1)/3):this.month(3*(a-1)+this.month()%3)}function Qb(a){return qa(a,this._week.dow,this._week.doy).week}function Rb(){return this._week.dow}function Sb(){return this._week.doy}function Tb(a){var b=this.localeData().week(this);return null==a?b:this.add(7*(a-b),"d")}function Ub(a){var b=qa(this,1,4).week;return null==a?b:this.add(7*(a-b),"d")}function Vb(a,b){return"string"!=typeof a?a:isNaN(a)?(a=b.weekdaysParse(a),"number"==typeof a?a:null):parseInt(a,10)}function Wb(a,b){return c(this._weekdays)?this._weekdays[a.day()]:this._weekdays[this._weekdays.isFormat.test(b)?"format":"standalone"][a.day()]}function Xb(a){return this._weekdaysShort[a.day()]}function Yb(a){return this._weekdaysMin[a.day()]}function Zb(a,b,c){var d,e,f;for(this._weekdaysParse||(this._weekdaysParse=[],this._minWeekdaysParse=[],this._shortWeekdaysParse=[],this._fullWeekdaysParse=[]),d=0;7>d;d++){if(e=Ea([2e3,1]).day(d),c&&!this._fullWeekdaysParse[d]&&(this._fullWeekdaysParse[d]=new RegExp("^"+this.weekdays(e,"").replace(".",".?")+"$","i"),this._shortWeekdaysParse[d]=new RegExp("^"+this.weekdaysShort(e,"").replace(".",".?")+"$","i"),this._minWeekdaysParse[d]=new RegExp("^"+this.weekdaysMin(e,"").replace(".",".?")+"$","i")),this._weekdaysParse[d]||(f="^"+this.weekdays(e,"")+"|^"+this.weekdaysShort(e,"")+"|^"+this.weekdaysMin(e,""),this._weekdaysParse[d]=new RegExp(f.replace(".",""),"i")),c&&"dddd"===b&&this._fullWeekdaysParse[d].test(a))return d;if(c&&"ddd"===b&&this._shortWeekdaysParse[d].test(a))return d;if(c&&"dd"===b&&this._minWeekdaysParse[d].test(a))return d;if(!c&&this._weekdaysParse[d].test(a))return d}}function $b(a){if(!this.isValid())return null!=a?this:NaN;var b=this._isUTC?this._d.getUTCDay():this._d.getDay();return null!=a?(a=Vb(a,this.localeData()),this.add(a-b,"d")):b}function _b(a){if(!this.isValid())return null!=a?this:NaN;var b=(this.day()+7-this.localeData()._week.dow)%7;return null==a?b:this.add(a-b,"d")}function ac(a){return this.isValid()?null==a?this.day()||7:this.day(this.day()%7?a:a-7):null!=a?this:NaN}function bc(a){var b=Math.round((this.clone().startOf("day")-this.clone().startOf("year"))/864e5)+1;return null==a?b:this.add(a-b,"d")}function cc(){return this.hours()%12||12}function dc(a,b){J(a,0,0,function(){return this.localeData().meridiem(this.hours(),this.minutes(),b)})}function ec(a,b){return b._meridiemParse}function fc(a){return"p"===(a+"").toLowerCase().charAt(0)}function gc(a,b,c){return a>11?c?"pm":"PM":c?"am":"AM"}function hc(a,b){b[Bd]=r(1e3*("0."+a))}function ic(){return this._isUTC?"UTC":""}function jc(){return this._isUTC?"Coordinated Universal Time":""}function kc(a){return Ea(1e3*a)}function lc(){return Ea.apply(null,arguments).parseZone()}function mc(a,b,c){var d=this._calendar[a];return D(d)?d.call(b,c):d}function nc(a){var b=this._longDateFormat[a],c=this._longDateFormat[a.toUpperCase()];return b||!c?b:(this._longDateFormat[a]=c.replace(/MMMM|MM|DD|dddd/g,function(a){return a.slice(1)}),this._longDateFormat[a])}function oc(){return this._invalidDate}function pc(a){return this._ordinal.replace("%d",a)}function qc(a){return a}function rc(a,b,c,d){var e=this._relativeTime[c];return D(e)?e(a,b,c,d):e.replace(/%d/i,a)}function sc(a,b){var c=this._relativeTime[a>0?"future":"past"];return D(c)?c(b):c.replace(/%s/i,b)}function tc(a){var b,c;for(c in a)b=a[c],D(b)?this[c]=b:this["_"+c]=b;this._ordinalParseLenient=new RegExp(this._ordinalParse.source+"|"+/\d{1,2}/.source)}function uc(a,b,c,d){var e=z(),f=h().set(d,b);return e[c](f,a)}function vc(a,b,c,d,e){if("number"==typeof a&&(b=a,a=void 0),a=a||"",null!=b)return uc(a,b,c,e);var f,g=[];for(f=0;d>f;f++)g[f]=uc(a,f,c,e);return g}function wc(a,b){return vc(a,b,"months",12,"month")}function xc(a,b){return vc(a,b,"monthsShort",12,"month")}function yc(a,b){return vc(a,b,"weekdays",7,"day")}function zc(a,b){return vc(a,b,"weekdaysShort",7,"day")}function Ac(a,b){return vc(a,b,"weekdaysMin",7,"day")}function Bc(){var a=this._data;return this._milliseconds=se(this._milliseconds),this._days=se(this._days),this._months=se(this._months),a.milliseconds=se(a.milliseconds),a.seconds=se(a.seconds),a.minutes=se(a.minutes),a.hours=se(a.hours),a.months=se(a.months),a.years=se(a.years),this}function Cc(a,b,c,d){var e=Za(b,c);return a._milliseconds+=d*e._milliseconds,a._days+=d*e._days,a._months+=d*e._months,a._bubble()}function Dc(a,b){return Cc(this,a,b,1)}function Ec(a,b){return Cc(this,a,b,-1)}function Fc(a){return 0>a?Math.floor(a):Math.ceil(a)}function Gc(){var a,b,c,d,e,f=this._milliseconds,g=this._days,h=this._months,i=this._data;return f>=0&&g>=0&&h>=0||0>=f&&0>=g&&0>=h||(f+=864e5*Fc(Ic(h)+g),g=0,h=0),i.milliseconds=f%1e3,a=q(f/1e3),i.seconds=a%60,b=q(a/60),i.minutes=b%60,c=q(b/60),i.hours=c%24,g+=q(c/24),e=q(Hc(g)),h+=e,g-=Fc(Ic(e)),d=q(h/12),h%=12,i.days=g,i.months=h,i.years=d,this}function Hc(a){return 4800*a/146097}function Ic(a){return 146097*a/4800}function Jc(a){var b,c,d=this._milliseconds;if(a=B(a),"month"===a||"year"===a)return b=this._days+d/864e5,c=this._months+Hc(b),"month"===a?c:c/12;switch(b=this._days+Math.round(Ic(this._months)),a){case"week":return b/7+d/6048e5;case"day":return b+d/864e5;case"hour":return 24*b+d/36e5;case"minute":return 1440*b+d/6e4;case"second":return 86400*b+d/1e3;case"millisecond":return Math.floor(864e5*b)+d;default:throw new Error("Unknown unit "+a)}}function Kc(){return this._milliseconds+864e5*this._days+this._months%12*2592e6+31536e6*r(this._months/12)}function Lc(a){return function(){return this.as(a)}}function Mc(a){return a=B(a),this[a+"s"]()}function Nc(a){return function(){return this._data[a]}}function Oc(){return q(this.days()/7)}function Pc(a,b,c,d,e){return e.relativeTime(b||1,!!c,a,d)}function Qc(a,b,c){var d=Za(a).abs(),e=Ie(d.as("s")),f=Ie(d.as("m")),g=Ie(d.as("h")),h=Ie(d.as("d")),i=Ie(d.as("M")),j=Ie(d.as("y")),k=e<Je.s&&["s",e]||1>=f&&["m"]||f<Je.m&&["mm",f]||1>=g&&["h"]||g<Je.h&&["hh",g]||1>=h&&["d"]||h<Je.d&&["dd",h]||1>=i&&["M"]||i<Je.M&&["MM",i]||1>=j&&["y"]||["yy",j];return k[2]=b,k[3]=+a>0,k[4]=c,Pc.apply(null,k)}function Rc(a,b){return void 0===Je[a]?!1:void 0===b?Je[a]:(Je[a]=b,!0)}function Sc(a){var b=this.localeData(),c=Qc(this,!a,b);return a&&(c=b.pastFuture(+this,c)),b.postformat(c)}function Tc(){var a,b,c,d=Ke(this._milliseconds)/1e3,e=Ke(this._days),f=Ke(this._months);a=q(d/60),b=q(a/60),d%=60,a%=60,c=q(f/12),f%=12;var g=c,h=f,i=e,j=b,k=a,l=d,m=this.asSeconds();return m?(0>m?"-":"")+"P"+(g?g+"Y":"")+(h?h+"M":"")+(i?i+"D":"")+(j||k||l?"T":"")+(j?j+"H":"")+(k?k+"M":"")+(l?l+"S":""):"P0D"}var Uc,Vc,Wc=a.momentProperties=[],Xc=!1,Yc={},Zc={},$c=/(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,_c=/(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,ad={},bd={},cd=/\d/,dd=/\d\d/,ed=/\d{3}/,fd=/\d{4}/,gd=/[+-]?\d{6}/,hd=/\d\d?/,id=/\d\d\d\d?/,jd=/\d\d\d\d\d\d?/,kd=/\d{1,3}/,ld=/\d{1,4}/,md=/[+-]?\d{1,6}/,nd=/\d+/,od=/[+-]?\d+/,pd=/Z|[+-]\d\d:?\d\d/gi,qd=/Z|[+-]\d\d(?::?\d\d)?/gi,rd=/[+-]?\d+(\.\d{1,3})?/,sd=/[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF\/]+(\s*?[\u0600-\u06FF]+){1,2}/i,td={},ud={},vd=0,wd=1,xd=2,yd=3,zd=4,Ad=5,Bd=6,Cd=7,Dd=8;J("M",["MM",2],"Mo",function(){return this.month()+1}),J("MMM",0,0,function(a){return this.localeData().monthsShort(this,a)}),J("MMMM",0,0,function(a){return this.localeData().months(this,a)}),A("month","M"),O("M",hd),O("MM",hd,dd),O("MMM",function(a,b){return b.monthsShortRegex(a)}),O("MMMM",function(a,b){return b.monthsRegex(a)}),S(["M","MM"],function(a,b){b[wd]=r(a)-1}),S(["MMM","MMMM"],function(a,b,c,d){var e=c._locale.monthsParse(a,d,c._strict);null!=e?b[wd]=e:j(c).invalidMonth=a});var Ed=/D[oD]?(\[[^\[\]]*\]|\s+)+MMMM?/,Fd="January_February_March_April_May_June_July_August_September_October_November_December".split("_"),Gd="Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec".split("_"),Hd=sd,Id=sd,Jd={};a.suppressDeprecationWarnings=!1;var Kd=/^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/,Ld=/^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?/,Md=/Z|[+-]\d\d(?::?\d\d)?/,Nd=[["YYYYYY-MM-DD",/[+-]\d{6}-\d\d-\d\d/],["YYYY-MM-DD",/\d{4}-\d\d-\d\d/],["GGGG-[W]WW-E",/\d{4}-W\d\d-\d/],["GGGG-[W]WW",/\d{4}-W\d\d/,!1],["YYYY-DDD",/\d{4}-\d{3}/],["YYYY-MM",/\d{4}-\d\d/,!1],["YYYYYYMMDD",/[+-]\d{10}/],["YYYYMMDD",/\d{8}/],["GGGG[W]WWE",/\d{4}W\d{3}/],["GGGG[W]WW",/\d{4}W\d{2}/,!1],["YYYYDDD",/\d{7}/]],Od=[["HH:mm:ss.SSSS",/\d\d:\d\d:\d\d\.\d+/],["HH:mm:ss,SSSS",/\d\d:\d\d:\d\d,\d+/],["HH:mm:ss",/\d\d:\d\d:\d\d/],["HH:mm",/\d\d:\d\d/],["HHmmss.SSSS",/\d\d\d\d\d\d\.\d+/],["HHmmss,SSSS",/\d\d\d\d\d\d,\d+/],["HHmmss",/\d\d\d\d\d\d/],["HHmm",/\d\d\d\d/],["HH",/\d\d/]],Pd=/^\/?Date\((\-?\d+)/i;a.createFromInputFallback=fa("moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release. Please refer to https://github.com/moment/moment/issues/1407 for more info.",function(a){a._d=new Date(a._i+(a._useUTC?" UTC":""))}),J("Y",0,0,function(){var a=this.year();return 9999>=a?""+a:"+"+a}),J(0,["YY",2],0,function(){return this.year()%100}),J(0,["YYYY",4],0,"year"),J(0,["YYYYY",5],0,"year"),J(0,["YYYYYY",6,!0],0,"year"),A("year","y"),O("Y",od),O("YY",hd,dd),O("YYYY",ld,fd),O("YYYYY",md,gd),O("YYYYYY",md,gd),S(["YYYYY","YYYYYY"],vd),S("YYYY",function(b,c){c[vd]=2===b.length?a.parseTwoDigitYear(b):r(b)}),S("YY",function(b,c){c[vd]=a.parseTwoDigitYear(b)}),S("Y",function(a,b){b[vd]=parseInt(a,10)}),a.parseTwoDigitYear=function(a){return r(a)+(r(a)>68?1900:2e3)};var Qd=E("FullYear",!1);a.ISO_8601=function(){};var Rd=fa("moment().min is deprecated, use moment.min instead. https://github.com/moment/moment/issues/1548",function(){var a=Ea.apply(null,arguments);return this.isValid()&&a.isValid()?this>a?this:a:l()}),Sd=fa("moment().max is deprecated, use moment.max instead. https://github.com/moment/moment/issues/1548",function(){var a=Ea.apply(null,arguments);return this.isValid()&&a.isValid()?a>this?this:a:l()}),Td=function(){return Date.now?Date.now():+new Date};Ka("Z",":"),Ka("ZZ",""),O("Z",qd),O("ZZ",qd),S(["Z","ZZ"],function(a,b,c){c._useUTC=!0,c._tzm=La(qd,a)});var Ud=/([\+\-]|\d\d)/gi;a.updateOffset=function(){};var Vd=/(\-)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)\.?(\d{3})?)?/,Wd=/^(-)?P(?:(?:([0-9,.]*)Y)?(?:([0-9,.]*)M)?(?:([0-9,.]*)D)?(?:T(?:([0-9,.]*)H)?(?:([0-9,.]*)M)?(?:([0-9,.]*)S)?)?|([0-9,.]*)W)$/;
Za.fn=Ia.prototype;var Xd=bb(1,"add"),Yd=bb(-1,"subtract");a.defaultFormat="YYYY-MM-DDTHH:mm:ssZ";var Zd=fa("moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.",function(a){return void 0===a?this.localeData():this.locale(a)});J(0,["gg",2],0,function(){return this.weekYear()%100}),J(0,["GG",2],0,function(){return this.isoWeekYear()%100}),Ib("gggg","weekYear"),Ib("ggggg","weekYear"),Ib("GGGG","isoWeekYear"),Ib("GGGGG","isoWeekYear"),A("weekYear","gg"),A("isoWeekYear","GG"),O("G",od),O("g",od),O("GG",hd,dd),O("gg",hd,dd),O("GGGG",ld,fd),O("gggg",ld,fd),O("GGGGG",md,gd),O("ggggg",md,gd),T(["gggg","ggggg","GGGG","GGGGG"],function(a,b,c,d){b[d.substr(0,2)]=r(a)}),T(["gg","GG"],function(b,c,d,e){c[e]=a.parseTwoDigitYear(b)}),J("Q",0,"Qo","quarter"),A("quarter","Q"),O("Q",cd),S("Q",function(a,b){b[wd]=3*(r(a)-1)}),J("w",["ww",2],"wo","week"),J("W",["WW",2],"Wo","isoWeek"),A("week","w"),A("isoWeek","W"),O("w",hd),O("ww",hd,dd),O("W",hd),O("WW",hd,dd),T(["w","ww","W","WW"],function(a,b,c,d){b[d.substr(0,1)]=r(a)});var $d={dow:0,doy:6};J("D",["DD",2],"Do","date"),A("date","D"),O("D",hd),O("DD",hd,dd),O("Do",function(a,b){return a?b._ordinalParse:b._ordinalParseLenient}),S(["D","DD"],xd),S("Do",function(a,b){b[xd]=r(a.match(hd)[0],10)});var _d=E("Date",!0);J("d",0,"do","day"),J("dd",0,0,function(a){return this.localeData().weekdaysMin(this,a)}),J("ddd",0,0,function(a){return this.localeData().weekdaysShort(this,a)}),J("dddd",0,0,function(a){return this.localeData().weekdays(this,a)}),J("e",0,0,"weekday"),J("E",0,0,"isoWeekday"),A("day","d"),A("weekday","e"),A("isoWeekday","E"),O("d",hd),O("e",hd),O("E",hd),O("dd",sd),O("ddd",sd),O("dddd",sd),T(["dd","ddd","dddd"],function(a,b,c,d){var e=c._locale.weekdaysParse(a,d,c._strict);null!=e?b.d=e:j(c).invalidWeekday=a}),T(["d","e","E"],function(a,b,c,d){b[d]=r(a)});var ae="Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),be="Sun_Mon_Tue_Wed_Thu_Fri_Sat".split("_"),ce="Su_Mo_Tu_We_Th_Fr_Sa".split("_");J("DDD",["DDDD",3],"DDDo","dayOfYear"),A("dayOfYear","DDD"),O("DDD",kd),O("DDDD",ed),S(["DDD","DDDD"],function(a,b,c){c._dayOfYear=r(a)}),J("H",["HH",2],0,"hour"),J("h",["hh",2],0,cc),J("hmm",0,0,function(){return""+cc.apply(this)+I(this.minutes(),2)}),J("hmmss",0,0,function(){return""+cc.apply(this)+I(this.minutes(),2)+I(this.seconds(),2)}),J("Hmm",0,0,function(){return""+this.hours()+I(this.minutes(),2)}),J("Hmmss",0,0,function(){return""+this.hours()+I(this.minutes(),2)+I(this.seconds(),2)}),dc("a",!0),dc("A",!1),A("hour","h"),O("a",ec),O("A",ec),O("H",hd),O("h",hd),O("HH",hd,dd),O("hh",hd,dd),O("hmm",id),O("hmmss",jd),O("Hmm",id),O("Hmmss",jd),S(["H","HH"],yd),S(["a","A"],function(a,b,c){c._isPm=c._locale.isPM(a),c._meridiem=a}),S(["h","hh"],function(a,b,c){b[yd]=r(a),j(c).bigHour=!0}),S("hmm",function(a,b,c){var d=a.length-2;b[yd]=r(a.substr(0,d)),b[zd]=r(a.substr(d)),j(c).bigHour=!0}),S("hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[yd]=r(a.substr(0,d)),b[zd]=r(a.substr(d,2)),b[Ad]=r(a.substr(e)),j(c).bigHour=!0}),S("Hmm",function(a,b,c){var d=a.length-2;b[yd]=r(a.substr(0,d)),b[zd]=r(a.substr(d))}),S("Hmmss",function(a,b,c){var d=a.length-4,e=a.length-2;b[yd]=r(a.substr(0,d)),b[zd]=r(a.substr(d,2)),b[Ad]=r(a.substr(e))});var de=/[ap]\.?m?\.?/i,ee=E("Hours",!0);J("m",["mm",2],0,"minute"),A("minute","m"),O("m",hd),O("mm",hd,dd),S(["m","mm"],zd);var fe=E("Minutes",!1);J("s",["ss",2],0,"second"),A("second","s"),O("s",hd),O("ss",hd,dd),S(["s","ss"],Ad);var ge=E("Seconds",!1);J("S",0,0,function(){return~~(this.millisecond()/100)}),J(0,["SS",2],0,function(){return~~(this.millisecond()/10)}),J(0,["SSS",3],0,"millisecond"),J(0,["SSSS",4],0,function(){return 10*this.millisecond()}),J(0,["SSSSS",5],0,function(){return 100*this.millisecond()}),J(0,["SSSSSS",6],0,function(){return 1e3*this.millisecond()}),J(0,["SSSSSSS",7],0,function(){return 1e4*this.millisecond()}),J(0,["SSSSSSSS",8],0,function(){return 1e5*this.millisecond()}),J(0,["SSSSSSSSS",9],0,function(){return 1e6*this.millisecond()}),A("millisecond","ms"),O("S",kd,cd),O("SS",kd,dd),O("SSS",kd,ed);var he;for(he="SSSS";he.length<=9;he+="S")O(he,nd);for(he="S";he.length<=9;he+="S")S(he,hc);var ie=E("Milliseconds",!1);J("z",0,0,"zoneAbbr"),J("zz",0,0,"zoneName");var je=o.prototype;je.add=Xd,je.calendar=db,je.clone=eb,je.diff=lb,je.endOf=xb,je.format=pb,je.from=qb,je.fromNow=rb,je.to=sb,je.toNow=tb,je.get=H,je.invalidAt=Gb,je.isAfter=fb,je.isBefore=gb,je.isBetween=hb,je.isSame=ib,je.isSameOrAfter=jb,je.isSameOrBefore=kb,je.isValid=Eb,je.lang=Zd,je.locale=ub,je.localeData=vb,je.max=Sd,je.min=Rd,je.parsingFlags=Fb,je.set=H,je.startOf=wb,je.subtract=Yd,je.toArray=Bb,je.toObject=Cb,je.toDate=Ab,je.toISOString=ob,je.toJSON=Db,je.toString=nb,je.unix=zb,je.valueOf=yb,je.creationData=Hb,je.year=Qd,je.isLeapYear=na,je.weekYear=Jb,je.isoWeekYear=Kb,je.quarter=je.quarters=Pb,je.month=$,je.daysInMonth=_,je.week=je.weeks=Tb,je.isoWeek=je.isoWeeks=Ub,je.weeksInYear=Mb,je.isoWeeksInYear=Lb,je.date=_d,je.day=je.days=$b,je.weekday=_b,je.isoWeekday=ac,je.dayOfYear=bc,je.hour=je.hours=ee,je.minute=je.minutes=fe,je.second=je.seconds=ge,je.millisecond=je.milliseconds=ie,je.utcOffset=Oa,je.utc=Qa,je.local=Ra,je.parseZone=Sa,je.hasAlignedHourOffset=Ta,je.isDST=Ua,je.isDSTShifted=Va,je.isLocal=Wa,je.isUtcOffset=Xa,je.isUtc=Ya,je.isUTC=Ya,je.zoneAbbr=ic,je.zoneName=jc,je.dates=fa("dates accessor is deprecated. Use date instead.",_d),je.months=fa("months accessor is deprecated. Use month instead",$),je.years=fa("years accessor is deprecated. Use year instead",Qd),je.zone=fa("moment().zone is deprecated, use moment().utcOffset instead. https://github.com/moment/moment/issues/1779",Pa);var ke=je,le={sameDay:"[Today at] LT",nextDay:"[Tomorrow at] LT",nextWeek:"dddd [at] LT",lastDay:"[Yesterday at] LT",lastWeek:"[Last] dddd [at] LT",sameElse:"L"},me={LTS:"h:mm:ss A",LT:"h:mm A",L:"MM/DD/YYYY",LL:"MMMM D, YYYY",LLL:"MMMM D, YYYY h:mm A",LLLL:"dddd, MMMM D, YYYY h:mm A"},ne="Invalid date",oe="%d",pe=/\d{1,2}/,qe={future:"in %s",past:"%s ago",s:"a few seconds",m:"a minute",mm:"%d minutes",h:"an hour",hh:"%d hours",d:"a day",dd:"%d days",M:"a month",MM:"%d months",y:"a year",yy:"%d years"},re=t.prototype;re._calendar=le,re.calendar=mc,re._longDateFormat=me,re.longDateFormat=nc,re._invalidDate=ne,re.invalidDate=oc,re._ordinal=oe,re.ordinal=pc,re._ordinalParse=pe,re.preparse=qc,re.postformat=qc,re._relativeTime=qe,re.relativeTime=rc,re.pastFuture=sc,re.set=tc,re.months=W,re._months=Fd,re.monthsShort=X,re._monthsShort=Gd,re.monthsParse=Y,re._monthsRegex=Id,re.monthsRegex=ba,re._monthsShortRegex=Hd,re.monthsShortRegex=aa,re.week=Qb,re._week=$d,re.firstDayOfYear=Sb,re.firstDayOfWeek=Rb,re.weekdays=Wb,re._weekdays=ae,re.weekdaysMin=Yb,re._weekdaysMin=ce,re.weekdaysShort=Xb,re._weekdaysShort=be,re.weekdaysParse=Zb,re.isPM=fc,re._meridiemParse=de,re.meridiem=gc,x("en",{ordinalParse:/\d{1,2}(th|st|nd|rd)/,ordinal:function(a){var b=a%10,c=1===r(a%100/10)?"th":1===b?"st":2===b?"nd":3===b?"rd":"th";return a+c}}),a.lang=fa("moment.lang is deprecated. Use moment.locale instead.",x),a.langData=fa("moment.langData is deprecated. Use moment.localeData instead.",z);var se=Math.abs,te=Lc("ms"),ue=Lc("s"),ve=Lc("m"),we=Lc("h"),xe=Lc("d"),ye=Lc("w"),ze=Lc("M"),Ae=Lc("y"),Be=Nc("milliseconds"),Ce=Nc("seconds"),De=Nc("minutes"),Ee=Nc("hours"),Fe=Nc("days"),Ge=Nc("months"),He=Nc("years"),Ie=Math.round,Je={s:45,m:45,h:22,d:26,M:11},Ke=Math.abs,Le=Ia.prototype;Le.abs=Bc,Le.add=Dc,Le.subtract=Ec,Le.as=Jc,Le.asMilliseconds=te,Le.asSeconds=ue,Le.asMinutes=ve,Le.asHours=we,Le.asDays=xe,Le.asWeeks=ye,Le.asMonths=ze,Le.asYears=Ae,Le.valueOf=Kc,Le._bubble=Gc,Le.get=Mc,Le.milliseconds=Be,Le.seconds=Ce,Le.minutes=De,Le.hours=Ee,Le.days=Fe,Le.weeks=Oc,Le.months=Ge,Le.years=He,Le.humanize=Sc,Le.toISOString=Tc,Le.toString=Tc,Le.toJSON=Tc,Le.locale=ub,Le.localeData=vb,Le.toIsoString=fa("toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)",Tc),Le.lang=Zd,J("X",0,0,"unix"),J("x",0,0,"valueOf"),O("x",od),O("X",rd),S("X",function(a,b,c){c._d=new Date(1e3*parseFloat(a,10))}),S("x",function(a,b,c){c._d=new Date(r(a))}),a.version="2.11.1",b(Ea),a.fn=ke,a.min=Ga,a.max=Ha,a.now=Td,a.utc=h,a.unix=kc,a.months=wc,a.isDate=d,a.locale=x,a.invalid=l,a.duration=Za,a.isMoment=p,a.weekdays=yc,a.parseZone=lc,a.localeData=z,a.isDuration=Ja,a.monthsShort=xc,a.weekdaysMin=Ac,a.defineLocale=y,a.weekdaysShort=zc,a.normalizeUnits=B,a.relativeTimeThreshold=Rc,a.prototype=ke;var Me=a;return Me});
/*
_____  ___  _____ _____    _____ __  ____ __ __ _____ _____    _____ __ __  __ __   __ __  __ 
||  ) ||=||  ||   ||==     ||_// || ((    ||<<  ||==  ||_//    ||==  || ||\\|| ||  ((  ||==|| 
||_// || ||  ||   ||___    ||    ||  \\__ || \\ ||___ || \\    ||    || || \|| || \_)) ||  ||
*/

/*
_____ __ __    _____    __ __ _____ __     _____   ___  _____      __ _____  ___  _____ _____ 
||==  || ||    ||==     || || ||_// ||    ((   )) ||=|| ||  )     ((   ||   ||=|| ||_//  ||   
||    || ||__| ||___    \\_// ||    ||__|  \\_//  || || ||_//    \_))  ||   || || || \\  || 
*/	
directiveLibraryModule.directive('fileUpLoader',["$rootScope", "$mdToast", "$http", "$uploader", "$storage","notifications", function($rootScope, $mdToast, $http,$uploader,$storage, notifications) {
	  return {
		restrict: 'E',
		template: "<div class='content' ng-init='showUploadButton=false;showDeleteButton=false;showUploadTable=false;'><div id='drop-files' ondragover='return false' layout='column'><div id='uploaded-holder'><div id='dropped-files' ng-show='showUploadTable' style='width:100%'><table id='Tabulate' style='width:100%'></table></div></div><div layout='row' layout-align='space-around center' style='margin-top: 20px;'><md-button class='md-raised' id='uploadbtn' aria-label='uploadbtn' ng-show='showUploadButton' ng-disabled='disableUploadButton' style='margin-top: 5px;'><md-icon md-svg-src='../img/directive_library/ic_cloud_upload_24px.svg' style='color:#1976D2'></md-icon><span style='margin-left: 5px;'>Upload</span></md-button><md-button class='md-raised' id='deletebtn' aria-label='deletebtn' ng-show='showDeleteButton' ng-disabled='disableButton' style='color:rgb(244,67,54);'><md-icon md-svg-src='../img/directive_library/ic_delete_24px.svg' style='color:rgb(244,67,54)'></md-icon><span style='margin-left: 5px;'>Remove</span></md-button></div><div layout='column'><img src='../img/directive_library/placeholder.png' ng-show='!showUploadButton' style='width:54px;height:54px;margin: 0 auto;margin-bottom:12px'/><text style='font-weight:700;font-size:14px;margin: 15px;'>{{label}}<text></div></div></div>",
		scope:{
			osClass:'@',
			label:'@',
			model: '='
		},
		link: function(scope,element){

			// Makes sure the dataTransfer information is sent when we
			// Drop the item in the drop box.
			jQuery.event.props.push('dataTransfer');
			

			// file/s on a single drag and drop
			var files;
			
			// total of all the files dragged and dropped
			var filesArray = [];
			scope.disableButton = false;
			//scope.disableUploadButton=false;
			// Bind the drop event to the dropzone.
			element.find("#drop-files").bind('drop', function(e) {
					
				// Stop the default action, which is to redirect the page
				// To the dropped file

				  files = e.dataTransfer.files || e.dataTransfer.files;
					debugger;
				  for(indexx = 0; indexx < files.length; indexx++) {
						filesArray.push(files[indexx]);
					}
				

			 var newHtml = "<tr class='md-table-headers-row'><th class='md-table-header' style='Padding:0px 16px 10px 0;min-width:0'>Name</th><th class='md-table-header' style='Padding:0px 16px 10px 0;min-width:0'>Type</th><th class='md-table-header' hide-xs style='Padding:0px 16px 10px 0;min-width:0'>Size</th></tr>";

			  for (var i = 0; i < filesArray.length; i++) {
					 var tableRow = "<tr><td class='upload-table'>" + filesArray[i].name + "</td><td class='upload-table'>" +
					 filesArray[i].type+ "</td><td class='upload-table' hide-xs>" +
					 filesArray[i].size +" bytes"+ "</td></tr>";
					 newHtml += tableRow;
				}
				
				element.find("#Tabulate").html(newHtml);
				 
				 $rootScope.$apply(function(){
					scope.showUploadButton = true;
					scope.showDeleteButton = true;
					scope.showUploadTable = true;
				 })
	
			});
			
			function restartFiles() {
				
				// We need to remove all the images and li elements as
				// appropriate. We'll also make the upload button disappear
				
				
				
				 $rootScope.$apply(function(){
					scope.showUploadButton = false;
					scope.showDeleteButton = false;
					scope.showUploadTable = false;
				 })
			
				// And finally, empty the array
				filesArray = [];
				scope.model = [];
				
				return false;
			}
			
            //var urls = [];
            
			function asyncFor(callback, array, index){
			    index++;
			    
			    var currentItem = array[index];
			    if (index >= array.length){
			        callback();
			        return;
			    }
			    

				$uploader.onSuccess(function(){
                   // scope.model = $storage.getUserMediaUrl(scope.osClass,  currentItem.name);
                    scope.model = [];
				    scope.model.push($storage.getMediaUrl(scope.osClass,  currentItem.name));
                    asyncFor(callback, array, index);
				});
				$uploader.onError(function(){
					notifications.toast("There was an error uploading ", "error");
				});
				$uploader.uploadMedia(scope.osClass, currentItem, currentItem.name);
			    
			}
			
			element.find('#uploadbtn').click(function(){
			  
			    scope.disableButton = true;
                //scope.disableUploadButton=true;
				notifications.toast("Please wait...");
				
				asyncFor(function(){
				    notifications.toast(scope.model.length + " Successfully Uploaded", "success");
				    scope.disableButton = false;
				    console.log(scope.model);
				}, filesArray,-1)
				
			});
		
			
			// Just some styling for the drop file container.
			element.find('#drop-files').bind('dragenter', function() {
				$(this).css({'box-shadow' : 'inset 0px 0px 20px rgba(0, 0, 0, 0.1)', 'border' : '2px dashed #1976D2'});
				return false;
			});
			
			element.find('#drop-files').bind('drop', function() {
				$(this).css({'box-shadow' : 'none', 'border' : '2px dashed rgba(0,0,0,0.2)'});
				return false;
			});
			
		
			element.find('#deletebtn').click(restartFiles);
			
		
		} //end of link
	  };
	}]);
/*
_____ __ __    _____    __ __ _____ __     _____   ___  _____    _____ __ __  __ __   __ __  __ 
||==  || ||    ||==     || || ||_// ||    ((   )) ||=|| ||  )    ||==  || ||\\|| ||  ((  ||==|| 
||    || ||__| ||___    \\_// ||    ||__|  \\_//  || || ||_//    ||    || || \|| || \_)) ||  || 
*/


/*
_____  ___  _____ __ __  __  ____     ____   ___  _____      __ _____  ___  _____ _____ 
||_// ||=||  ||   || ||\\|| (( ___    ||=)  ||=|| ||_//     ((   ||   ||=|| ||_//  ||   
|| \\ || ||  ||   || || \||  \\_||    ||_)) || || || \\    \_))  ||   || || || \\  || 
*/
directiveLibraryModule.directive('starRating', function () {
		return {
			scope: {
				rating: '=',
				colour: '=',
				maxRating: '@',
				readOnly: '@',
				click: "&",
				mouseHover: "&",
				mouseLeave: "&"
			},
			template:
				"<div style='display: inline-block; margin: 0px; padding: 0px; cursor:pointer; font-size:1.5em' ng-repeat='idx in maxRatings track by $index'> \
						<md-icon style='color:{{colour}};height:20px;width:20px;outline:0' md-svg-src='{{((hoverValue + _rating) <= $index) && \"img/directive_library/ic_star_outline_24px.svg\" || \"img/directive_library/ic_star_24px.svg\"}}'\
						ng-Click='isolatedClick($index + 1)'\
						ng-mouseenter='isolatedMouseHover($index + 1)'\
						ng-mouseleave='isolatedMouseLeave($index + 1)'></md-icon>\
				</div>",
			compile: function (element, attrs) {
				if (!attrs.maxRating || (Number(attrs.maxRating) <= 0)) {
					attrs.maxRating = '5';
				};
			},
			controller: function ($scope) {
				$scope.maxRatings = [];

				for (var i = 1; i <= $scope.maxRating; i++) {
					$scope.maxRatings.push({});
				};

				$scope._rating = $scope.rating;

				$scope.isolatedClick = function (param) {
					if ($scope.readOnly == 'true') return;

					$scope.rating = $scope._rating = param;
					$scope.hoverValue = 0;
					$scope.click({ param: param });
				};

				$scope.isolatedMouseHover = function (param) {
					if ($scope.readOnly == 'true') return;

					$scope._rating = 0;
					$scope.hoverValue = param;
					$scope.mouseHover({ param: param });
				};

				$scope.isolatedMouseLeave = function (param) {
					if ($scope.readOnly == 'true') return;

					$scope._rating = $scope.rating;
					$scope.hoverValue = 0;
					$scope.mouseLeave({ param: param });
				};
			}
		};
	});

/*
_____  ___  _____ __ __  __  ____     ____   ___  _____    _____ __ __  __ __   __ __  __ 
||_// ||=||  ||   || ||\\|| (( ___    ||=)  ||=|| ||_//    ||==  || ||\\|| ||  ((  ||==|| 
|| \\ || ||  ||   || || \||  \\_||    ||_)) || || || \\    ||    || || \|| || \_)) ||  ||
*/	  

/*
  _                _                                   _   _                                       _             _   
 | |__   __ _  ___| | ____ _ _ __ ___  _   _ _ __   __| | | |__   __ _ _ __  _ __   ___ _ __   ___| |_ __ _ _ __| |_ 
 | '_ \ / _` |/ __| |/ / _` | '__/ _ \| | | | '_ \ / _` | | '_ \ / _` | '_ \| '_ \ / _ \ '__| / __| __/ _` | '__| __|
 | |_) | (_| | (__|   < (_| | | | (_) | |_| | | | | (_| | | |_) | (_| | | | | | | |  __/ |    \__ \ || (_| | |  | |_ 
 |_.__/ \__,_|\___|_|\_\__, |_|  \___/ \__,_|_| |_|\__,_| |_.__/ \__,_|_| |_|_| |_|\___|_|    |___/\__\__,_|_|   \__|
                       |___/                                                                                         
*/

	directiveLibraryModule.directive('mdBackgroundBanner', function() {
	  return {
		restrict: 'E',
		template: "<div id='backgound_banner' style='margin:0px; background:{{color}}; position:fixed; height:{{height}}; width:100%; z-index:0;)'></div>",
		//"<div id='prlx_lyr_1' style='position:fixed; background: url() 0px 200px;width:100%;height:800px;'></div> <div id='backgound_banner' style='margin:0px; background:; position:fixed; height:{{height}}; width:100%; z-index:-2; box-shadow:0 3px 1px -2px rgba(0,0,0,.14),0 2px 2px 0 rgba(0,0,0,.098),0 1px 5px 0 rgba(0,0,0,.084);'></div>",
		
		scope:{
			color:'@',
			height:'@'
		},
		link: function(scope,element){

			 if(!scope.color)
			 {
				scope.color = "rgb(98, 203, 143)";
			 }
			 if(!scope.height)
			 {
				scope.height = "230px";
			 }
				
			//parallax scroll effect
			/*
			function parallax(){
			 var prlx_lyr_1 = document.getElementById('prlx_lyr_1');
			 var backgound_banner = document.getElementById('backgound_banner');
			 prlx_lyr_1.style.top = -(window.pageYOffset / 10)+'px';
			 backgound_banner.style.top = -(window.pageYOffset / 25)+'px';
			}
			window.addEventListener("scroll", parallax, false);
			*/
		} //end of link
	  };
	});
	
	/*
	  _                _                                   _   _                                                  _ 
	 | |__   __ _  ___| | ____ _ _ __ ___  _   _ _ __   __| | | |__   __ _ _ __  _ __   ___ _ __    ___ _ __   __| |
	 | '_ \ / _` |/ __| |/ / _` | '__/ _ \| | | | '_ \ / _` | | '_ \ / _` | '_ \| '_ \ / _ \ '__|  / _ \ '_ \ / _` |
	 | |_) | (_| | (__|   < (_| | | | (_) | |_| | | | | (_| | | |_) | (_| | | | | | | |  __/ |    |  __/ | | | (_| |
	 |_.__/ \__,_|\___|_|\_\__, |_|  \___/ \__,_|_| |_|\__,_| |_.__/ \__,_|_| |_|_| |_|\___|_|     \___|_| |_|\__,_|
							|___/                                                                                   
	*/
	
	
	/*
	                _   _               _   _ _   _            _             _   
	  ___  ___  ___| |_(_) ___  _ __   | |_(_) |_| | ___   ___| |_ __ _ _ __| |_ 
	 / __|/ _ \/ __| __| |/ _ \| '_ \  | __| | __| |/ _ \ / __| __/ _` | '__| __|
	 \__ \  __/ (__| |_| | (_) | | | | | |_| | |_| |  __/ \__ \ || (_| | |  | |_ 
	 |___/\___|\___|\__|_|\___/|_| |_|  \__|_|\__|_|\___| |___/\__\__,_|_|   \__|
	*/
	
	directiveLibraryModule.directive('sectionTitle', function() {
	  return {
		restrict: 'E',
		template: "<div id='newdiv' layout='row' style='width: 255px; margin-top:8px; margin-left:8px;' flex layout-sm='row'><div flex='25'>	<img ng-src={{catogeryLetter}} style='margin-top:22px;border-radius:20px'/>	</div> <div flex style='margin-top:27px;'>	<label style='font-weight:700'>{{title}}</label> </div></div>",
		scope:{
			title:'@'
		},
		link: function(scope,element){

      if (scope.title == "" || scope.title == null) {
         
        element.find('#newdiv').attr('hide-sm', '');
        //console.log("one of the pic is empty");
      }else{
        scope.catogeryLetter = "../img/material_alperbert/avatar_tile_"+scope.title.charAt(0).toLowerCase()+"_28.png";
         
         element.find('#newdiv').attr('new', '');
      }

		} //end of link
	  };
	});
	
	/*
		                _   _               _   _ _   _                       _ 
		  ___  ___  ___| |_(_) ___  _ __   | |_(_) |_| | ___    ___ _ __   __| |
		 / __|/ _ \/ __| __| |/ _ \| '_ \  | __| | __| |/ _ \  / _ \ '_ \ / _` |
		 \__ \  __/ (__| |_| | (_) | | | | | |_| | |_| |  __/ |  __/ | | | (_| |
		 |___/\___|\___|\__|_|\___/|_| |_|  \__|_|\__|_|\___|  \___|_| |_|\__,_|
                                                                        
	*/
	
	
	/*
		  _     _                  _             _   
		 | |__ | |_   _ _ __   ___| |_ __ _ _ __| |_ 
		 | '_ \| | | | | '__| / __| __/ _` | '__| __|
		 | |_) | | |_| | |    \__ \ || (_| | |  | |_ 
		 |_.__/|_|\__,_|_|    |___/\__\__,_|_|   \__|
	*/
	
	//Strat Card background image blur directive
	directiveLibraryModule.directive('blur',function(){
	  return{
		restrict:'E',
		replace:true,
		scope:{
		  id:"@",
		  blurSrc:"@",
		  blurIntensity:"@"
		},
		template:'<canvas id="{{id}}">'
		+'</canvas>',
		link:function(scope,element,attrs){

		  var canvas,context,canvasBackground,width,height;

		  canvas=element[0];
		  width=parseInt(canvas.parentNode.offsetWidth);
		  height=parseInt(canvas.parentNode.offsetHeight);
		  canvas.width=width;
		  canvas.height=height;
		  context=canvas.getContext('2d');
		  canvasBackground = new Image();
		  canvasBackground.src = scope.blurSrc;

		  var drawBlur=function(){
			context.drawImage(canvasBackground, 0, 0, width, height);
			stackBlurCanvasRGBA(attrs.id, 0, 0, width, height, scope.blurIntensity);
		  }

		  canvasBackground.onload=function(){
			drawBlur();
		  }
		}
	  }

	});//End Card background image blur directive

	//This StackBlur.js is needed for the blur directive
	function stackBlurImage(a,t,e,r){var n=document.getElementById(a),l=n.naturalWidth,g=n.naturalHeight,c=document.getElementById(t);c.style.width=l+"px",c.style.height=g+"px",c.width=l,c.height=g;var o=c.getContext("2d");o.clearRect(0,0,l,g),o.drawImage(n,0,0),isNaN(e)||1>e||(r?stackBlurCanvasRGBA(t,0,0,l,g,e):stackBlurCanvasRGB(t,0,0,l,g,e))}function stackBlurCanvasRGBA(a,t,e,r,n,l){if(!(isNaN(l)||1>l)){l|=0;var g,c=document.getElementById(a),o=c.getContext("2d");try{try{g=o.getImageData(t,e,r,n)}catch(s){try{netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"),g=o.getImageData(t,e,r,n)}catch(s){throw alert("Cannot access local image"),new Error("unable to access local image data: "+s)}}}catch(s){throw alert("Cannot access image"),new Error("unable to access image data: "+s)}var i,u,b,m,f,h,x,d,v,B,w,y,I,C,k,E,R,p,D,N,_,S,G,P,A=g.data,M=l+l+1,U=r-1,H=n-1,W=l+1,j=W*(W+1)/2,q=new BlurStack,z=q;for(b=1;M>b;b++)if(z=z.next=new BlurStack,b==W)var F=z;z.next=q;var J=null,K=null;x=h=0;var L=mul_table[l],O=shg_table[l];for(u=0;n>u;u++){for(E=R=p=D=d=v=B=w=0,y=W*(N=A[h]),I=W*(_=A[h+1]),C=W*(S=A[h+2]),k=W*(G=A[h+3]),d+=j*N,v+=j*_,B+=j*S,w+=j*G,z=q,b=0;W>b;b++)z.r=N,z.g=_,z.b=S,z.a=G,z=z.next;for(b=1;W>b;b++)m=h+((b>U?U:b)<<2),d+=(z.r=N=A[m])*(P=W-b),v+=(z.g=_=A[m+1])*P,B+=(z.b=S=A[m+2])*P,w+=(z.a=G=A[m+3])*P,E+=N,R+=_,p+=S,D+=G,z=z.next;for(J=q,K=F,i=0;r>i;i++)A[h+3]=G=w*L>>O,0!=G?(G=255/G,A[h]=(d*L>>O)*G,A[h+1]=(v*L>>O)*G,A[h+2]=(B*L>>O)*G):A[h]=A[h+1]=A[h+2]=0,d-=y,v-=I,B-=C,w-=k,y-=J.r,I-=J.g,C-=J.b,k-=J.a,m=x+((m=i+l+1)<U?m:U)<<2,E+=J.r=A[m],R+=J.g=A[m+1],p+=J.b=A[m+2],D+=J.a=A[m+3],d+=E,v+=R,B+=p,w+=D,J=J.next,y+=N=K.r,I+=_=K.g,C+=S=K.b,k+=G=K.a,E-=N,R-=_,p-=S,D-=G,K=K.next,h+=4;x+=r}for(i=0;r>i;i++){for(R=p=D=E=v=B=w=d=0,h=i<<2,y=W*(N=A[h]),I=W*(_=A[h+1]),C=W*(S=A[h+2]),k=W*(G=A[h+3]),d+=j*N,v+=j*_,B+=j*S,w+=j*G,z=q,b=0;W>b;b++)z.r=N,z.g=_,z.b=S,z.a=G,z=z.next;for(f=r,b=1;l>=b;b++)h=f+i<<2,d+=(z.r=N=A[h])*(P=W-b),v+=(z.g=_=A[h+1])*P,B+=(z.b=S=A[h+2])*P,w+=(z.a=G=A[h+3])*P,E+=N,R+=_,p+=S,D+=G,z=z.next,H>b&&(f+=r);for(h=i,J=q,K=F,u=0;n>u;u++)m=h<<2,A[m+3]=G=w*L>>O,G>0?(G=255/G,A[m]=(d*L>>O)*G,A[m+1]=(v*L>>O)*G,A[m+2]=(B*L>>O)*G):A[m]=A[m+1]=A[m+2]=0,d-=y,v-=I,B-=C,w-=k,y-=J.r,I-=J.g,C-=J.b,k-=J.a,m=i+((m=u+W)<H?m:H)*r<<2,d+=E+=J.r=A[m],v+=R+=J.g=A[m+1],B+=p+=J.b=A[m+2],w+=D+=J.a=A[m+3],J=J.next,y+=N=K.r,I+=_=K.g,C+=S=K.b,k+=G=K.a,E-=N,R-=_,p-=S,D-=G,K=K.next,h+=r}o.putImageData(g,t,e)}}function stackBlurCanvasRGB(a,t,e,r,n,l){if(!(isNaN(l)||1>l)){l|=0;var g,c=document.getElementById(a),o=c.getContext("2d");try{try{g=o.getImageData(t,e,r,n)}catch(s){try{netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead"),g=o.getImageData(t,e,r,n)}catch(s){throw alert("Cannot access local image"),new Error("unable to access local image data: "+s)}}}catch(s){throw alert("Cannot access image"),new Error("unable to access image data: "+s)}var i,u,b,m,f,h,x,d,v,B,w,y,I,C,k,E,R,p,D,N,_=g.data,S=l+l+1,G=r-1,P=n-1,A=l+1,M=A*(A+1)/2,U=new BlurStack,H=U;for(b=1;S>b;b++)if(H=H.next=new BlurStack,b==A)var W=H;H.next=U;var j=null,q=null;x=h=0;var z=mul_table[l],F=shg_table[l];for(u=0;n>u;u++){for(C=k=E=d=v=B=0,w=A*(R=_[h]),y=A*(p=_[h+1]),I=A*(D=_[h+2]),d+=M*R,v+=M*p,B+=M*D,H=U,b=0;A>b;b++)H.r=R,H.g=p,H.b=D,H=H.next;for(b=1;A>b;b++)m=h+((b>G?G:b)<<2),d+=(H.r=R=_[m])*(N=A-b),v+=(H.g=p=_[m+1])*N,B+=(H.b=D=_[m+2])*N,C+=R,k+=p,E+=D,H=H.next;for(j=U,q=W,i=0;r>i;i++)_[h]=d*z>>F,_[h+1]=v*z>>F,_[h+2]=B*z>>F,d-=w,v-=y,B-=I,w-=j.r,y-=j.g,I-=j.b,m=x+((m=i+l+1)<G?m:G)<<2,C+=j.r=_[m],k+=j.g=_[m+1],E+=j.b=_[m+2],d+=C,v+=k,B+=E,j=j.next,w+=R=q.r,y+=p=q.g,I+=D=q.b,C-=R,k-=p,E-=D,q=q.next,h+=4;x+=r}for(i=0;r>i;i++){for(k=E=C=v=B=d=0,h=i<<2,w=A*(R=_[h]),y=A*(p=_[h+1]),I=A*(D=_[h+2]),d+=M*R,v+=M*p,B+=M*D,H=U,b=0;A>b;b++)H.r=R,H.g=p,H.b=D,H=H.next;for(f=r,b=1;l>=b;b++)h=f+i<<2,d+=(H.r=R=_[h])*(N=A-b),v+=(H.g=p=_[h+1])*N,B+=(H.b=D=_[h+2])*N,C+=R,k+=p,E+=D,H=H.next,P>b&&(f+=r);for(h=i,j=U,q=W,u=0;n>u;u++)m=h<<2,_[m]=d*z>>F,_[m+1]=v*z>>F,_[m+2]=B*z>>F,d-=w,v-=y,B-=I,w-=j.r,y-=j.g,I-=j.b,m=i+((m=u+A)<P?m:P)*r<<2,d+=C+=j.r=_[m],v+=k+=j.g=_[m+1],B+=E+=j.b=_[m+2],j=j.next,w+=R=q.r,y+=p=q.g,I+=D=q.b,C-=R,k-=p,E-=D,q=q.next,h+=r}o.putImageData(g,t,e)}}function BlurStack(){this.r=0,this.g=0,this.b=0,this.a=0,this.next=null}var mul_table=[512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,289,287,285,282,280,278,275,273,271,269,267,265,263,261,259],shg_table=[9,11,12,13,13,14,14,15,15,15,15,16,16,16,16,17,17,17,17,17,17,17,18,18,18,18,18,18,18,18,18,19,19,19,19,19,19,19,19,19,19,19,19,19,19,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,21,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,22,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,23,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24,24];

	/*
	  _     _                             _ 
	 | |__ | |_   _ _ __    ___ _ __   __| |
	 | '_ \| | | | | '__|  / _ \ '_ \ / _` |
	 | |_) | | |_| | |    |  __/ | | | (_| |
	 |_.__/|_|\__,_|_|     \___|_| |_|\__,_|
	*/
	
	/*
	 ____  _____  _  ____  _  _____  _   ____  _____  ____  ____  _____ 
	/ ___\/__ __\/ \/   _\/ |/ /\  \//  / ___\/__ __\/  _ \/  __\/__ __\
	|    \  / \  | ||  /  |   /  \  /   |    \  / \  | / \||  \/|  / \  
	\___ |  | |  | ||  \_ |   \  / /    \___ |  | |  | |-|||    /  | |  
	\____/  \_/  \_/\____/\_|\_\/_/     \____/  \_/  \_/ \|\_/\_\  \_/
	*/
	
	directiveLibraryModule.directive("sticky", ["$window", function(t) {
        return {
            restrict: "A",
            scope: {
                disabled: "=disabledSticky"
            },
            link: function(e, s, o) {
                function n(e) {
                    return "true" === e ? t.innerHeight - (s[0].offsetHeight + parseInt(z)) < 0 : !1
                }

                function i(t, e, s) {
                    var o = "top",
                        n = Math.abs(t - e),
                        i = Math.abs(t - s);
                    return n > i && (o = "bottom"), o
                }

                function r(t) {
                    s.attr("style", I), g = !1, k.removeClass(y), s.removeClass(b), s.removeClass(b), s.addClass(v), "top" === t ? s.css("z-index", 10).css("width", s[0].offsetWidth).css("top", W.top).css("position", W.position).css("left", W.cssLeft).css("margin-top", W.marginTop).css("height", W.height) : "bottom" === t && M === !0 && s.css("z-index", 10).css("width", s[0].offsetWidth).css("top", "").css("bottom", 0).css("position", "absolute").css("left", W.cssLeft).css("margin-top", W.marginTop).css("margin-bottom", W.marginBottom).css("height", W.height), u && t === H && u.remove()
                }

                function c(t) {
                    g = !0, W.offsetWidth = s[0].offsetWidth, k.addClass(y), s.removeClass(v), s.addClass(b), T && t === H && (u = angular.element("<div>"), u.css("height", s[0].offsetHeight + "px"), s.after(u)), s.css("z-index", "10").css("width", s[0].offsetWidth + "px").css("position", "fixed").css("left", s.css("left").replace("px", "") + "px").css(H, z + a(w) + "px").css("margin-top", 0), "bottom" === H && s.css("margin-bottom", 0)
                }

                function a(t) {
                    var e = 0;
                    return t.getBoundingClientRect && (e = t.getBoundingClientRect().top), e
                }

                function f() {
                    var t;
                    return t = "undefined" != typeof w.scrollTop ? w.scrollTop : "undefined" != typeof w.pageYOffset ? w.pageYOffset : document.documentElement.scrollTop
                }

                function l() {
                    var e;
                    return e = C[0] instanceof HTMLElement ? t.getComputedStyle(C[0], null).getPropertyValue("height").replace(/px;?/, "") : t.innerHeight, parseInt(e) || 0
                }

                function d() {
                    var e = o.mediaQuery || !1,
                        s = t.matchMedia;
                    return e && !(s("(" + e + ")").matches || s(e).matches)
                }
                var p, m, u, h, g = !1,
                    b = o.stickyClass || "",
                    v = o.unstickyClass || "",
                    y = o.bodyClass || "",
                    w = document.getElementsByTagName("sticky-scroll")[0] || t,
                    x = angular.element(t),
                    C = angular.element(w),
                    k = angular.element(document.body),
                    T = "false" !== o.usePlaceholder,
                    H = "bottom" === o.anchor ? "bottom" : "top",
                    M = "true" === o.confine,
                    z = o.offset ? parseInt(o.offset.replace(/px;?/, "")) : 0,
                    I = s.attr("style") || "",
                    W = {
                        zIndex: s.css("z-index"),
                        top: s.css("top"),
                        position: s.css("position"),
                        marginTop: s.css("margin-top"),
                        marginBottom: s.css("margin-bottom"),
                        cssLeft: s.css("left"),
                        height: s.css("height")
                    },
                    B = function() {
                        C.on("scroll", L), x.on("resize", e.$apply.bind(e, E)), e.$on("$destroy", $)
                    },
                    L = function() {
                        if ((e.disabled === !0 || d()) && g) return r();
                        var t, l = f() - (document.documentElement.clientTop || 0);
                        t = "top" === H ? M === !0 ? l > p && m >= l : l > p : p >= l;
                        var u = i(l, p, m);
                        !t || n(o.stickLimit) || g ? !t && g ? r(u, l) : M && !t && "bottom" === u && "absolute" !== s.css("position") && (h = a(s[0]), r(u, l)) : c(u)
                    },
                    $ = function() {
                        C.off("scroll", L), x.off("resize", E), k.removeClass(y), u && u.remove()
                    },
                    E = function() {
                        r(H), L()
                    },
                    P = function() {
                        return e.disabled === !0 ? r() : "top" === H ? (h || a(s[0])) - a(w) + f() : a(s[0]) - l() + s[0].offsetHeight + f()
                    },
                    O = function(t, e) {
                        if ((t !== e || "undefined" == typeof p) && !g) {
                            p = t - z, M && s.parent().css({
                                position: "relative"
                            });
                            var o = s.parent()[0],
                                n = parseInt(o.offsetHeight) - (T ? 0 : s[0].offsetHeight),
                                i = parseInt(s.css("margin-bottom").replace(/px;?/, "")) || 0,
                                r = a(s[0]),
                                c = a(o),
                                l = a(w),
                                d = r - l,
                                u = c + n - r;
                            m = d + u - s[0].offsetHeight - i - z + +f(), L()
                        }
                    };
                e.$watch(P, O), B()
            }
        }
    }]), window.matchMedia = window.matchMedia || function() {
        var t = "angular-sticky: This browser does not support matchMedia, therefore the minWidth option will not work on this browser. Polyfill matchMedia to fix this issue.";
        return window.console && console.warn && console.warn(t),
            function() {
                return {
                    matches: !0
                }
            }
    }()
	
	/*
	 ____  _____  _  ____  _  _____  _   _____ _      ____ 
	/ ___\/__ __\/ \/   _\/ |/ /\  \//  /  __// \  /|/  _ \
	|    \  / \  | ||  /  |   /  \  /   |  \  | |\ ||| | \|
	\___ |  | |  | ||  \_ |   \  / /    |  /_ | | \||| |_/|
	\____/  \_/  \_/\____/\_|\_\/_/     \____\\_/  \|\____/
	*/
	
	
	
	directiveLibraryModule.service('uiInitilize', function(){
		this.insertIndex = function(array) {
			
			 for(var i=0; i<array.length; i++){
				  array[i].$index   = i;
			  }
			
			return array;
		};
		var toggles = {};
		this.openOne = function(array, $index)
		{
			   for (ind in array)
				if (toggles[ind] && ind != $index)
					toggles[ind] = false;
				
			   if (!toggles[$index])
					toggles[$index] = true;
			   else toggles[$index] = !toggles[$index];
			   
			   return toggles;
			 
		}
	});
	
	directiveLibraryModule.service('notifications',['$mdToast','$mdDialog', function($mdToast,$mdDialog){

		this.toast = function(content,status, delay) {
			if(!delay)
				delay = 2000;
			 $mdToast.show({
            	template: '<md-toast class="md-toast-'+status+'">'+content+'</md-toast>',
            	hideDelay: delay,
            	position: 'bottom right'
            });
		};
		
		this.alertDialog = function(title, content){
			$mdDialog.show(
			  $mdDialog.alert()
				.parent(angular.element(document.querySelector('input[name="editForm"]')))
				.clickOutsideToClose(true)
				.title(title)
				.textContent(content)
				.ariaLabel('Alert Dialog Demo')
				.ok('Got it!')
			);
		}
	}]);
	
})(window.angular);
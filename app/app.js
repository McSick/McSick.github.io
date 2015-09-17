'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.view1',
  'myApp.WeeklyPicks',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
   $routeProvider.
   when('WeeklyPicks',{
		templateUrl:'WeeklyPicks/WeeklyPicks.html',
		controller:'WeeklyPicksCtrl'
		} 
	).
   otherwise({redirectTo: '/WeeklyPicks'});
}]);

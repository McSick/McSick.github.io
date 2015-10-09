'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'myApp.QuickPick',
  'myApp.WeeklyPicks',
    'myApp.addGame',
  'myApp.version'
]).
config(['$routeProvider', function($routeProvider) {
   $routeProvider.
   when('WeeklyPicks',{
		templateUrl:'WeeklyPicks/WeeklyPicks/4',
		controller:'WeeklyPicksCtrl'
		}
	).
  when('QuickPick',{
  		templateUrl:'QuickPick/QuickPick.html',
  		controller:'QuickPickCtrl'
  		}
  	).
	   when('addGame',{
		templateUrl:'addGame/addGame.html',
		controller:'addGameCtrl'
		}
	).
   otherwise({redirectTo: '/WeeklyPicks/5'});
}]);

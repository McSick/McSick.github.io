'use strict';

angular.module('myApp.WeeklyPicks', ['ngRoute','firebase'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/WeeklyPicks', {
    templateUrl: 'WeeklyPicks/WeeklyPicks.html',
    controller: 'WeeklyPicksCtrl'
  });
}])

.controller('WeeklyPicksCtrl', function($scope, $firebaseObject) {
	var ref = new Firebase("https://nflquickpick.firebaseio.com");
	
	$scope.week = {};
	$scope.winners = ['Broncos','Patriots','Browns','Panthers','Cardinals','Bengals','Vikings','Buccaneers','Falcons','Steelers','Redskins','Raiders','Cowboys','Jaguars'];
	$scope.losers = ['Chiefs','Bills','Titans','Texans','Bears','Chargers','Lions','Saints','Giants','49ers','Rams','Ravens','Dolphins','Eagles'];
	$scope.totals = [];
	$scope.init= function(){
		$scope.week = $firebaseObject(ref.child('week2'));
	/*	week.$loaded(function(week){
			week.forEach(function(key,value){
				$scope.week[key] = value;
				
			});
		});
		*/
		var points = [99,75,50,40,30,20,10,9,8,7,6,5,4,3,2,1];
		/*for(var i = 0; i < points.length;i++){
			$scope.week[
		}*/
		$scope.week.$loaded(function(week){
		
			week.forEach(function(picks,name){
				var total = 0;
				angular.forEach(picks,function(team,point){
					if($scope.winners.indexOf(team) >= 0){
						total += parseInt(point);
					}
				});
				$scope.totals[name] = total;
			});
		});
	}
	
	$scope.init();
});


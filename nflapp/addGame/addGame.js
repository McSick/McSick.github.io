'use strict';

angular.module('myApp.addGame', ['ngRoute','firebase'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/addGame', {
    templateUrl: 'addGame/addGame.html',
    controller: 'addGameCtrl'
  });
}])

.controller('addGameCtrl', function($scope, $firebaseObject) {
	var ref = new Firebase("https://nflquickpick.firebaseio.com");

	$scope.games = [];
	$scope.gamenumbers = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]
	$scope.totals = [];

	$scope.submit = function(){
		var week = $firebaseObject(ref.child('games').child('week'+$scope.weeknumber));
		for(var i =0; i < $scope.gamenumbers.length; i++){
			week[i]={
				Home: $scope.games[i].Home,
				Away:$scope.games[i].Away,
        id: i

			};

		}
		week.$save();
		alert('saved!');



	}
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

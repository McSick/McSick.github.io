'use strict';

angular.module('myApp.WeeklyPicks', ['ngRoute','firebase'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/WeeklyPicks/:week', {
    templateUrl: 'WeeklyPicks/WeeklyPicks.html',
    controller: 'WeeklyPicksCtrl'
  });
}])

.controller('WeeklyPicksCtrl', function($scope, $firebaseObject,$firebaseArray,$routeParams) {
	var ref = new Firebase("https://nflquickpick.firebaseio.com");
	$scope.weeknumber = $routeParams.week;
	$scope.week = {};
  $scope.winners = [];
  $scope.losers = [];

	var winners = $firebaseArray(ref.child('outcome').child('week'+$scope.weeknumber).child('winners')); //['Broncos','Patriots','Browns','Panthers','Cardinals','Bengals','Vikings','Buccaneers','Falcons','Steelers','Redskins','Raiders','Cowboys','Jaguars','Packers','Jets'];

  winners.$loaded(function(wins){
    $scope.winners = wins[0];
    var losers = $firebaseArray(ref.child('outcome').child('week'+$scope.weeknumber).child('losers'));

    losers.$loaded(function(los){
        $scope.losers = los[0];
        $scope.init();
    });
  });


  $scope.totals = [];
	$scope.init= function(){
		$scope.week = $firebaseObject(ref.child('week'+	$scope.weeknumber));
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

//	$scope.init();
});

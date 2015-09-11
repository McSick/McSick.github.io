'use strict';

angular.module('myApp.view1', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', function($scope) {


	$scope.games = week1;
	$scope.winners = [];
	$scope.points = [99,75,50,40,30,20,10,9,8,7,6,5,4,3,2,1];
	$scope.pointchoice = [];
	$scope.picks = [];
	$scope.init = function(){
		for(var i =0; i < week1.length; i++){
			var pick = {
				team : week1[i].Away,
				points : ''
			}
			$scope.winners[i] = pick;

		}

	}
	$scope.addGame = function(index){
		console.log(index + ' game - ' + $scope.winners[index] + ' ' + $scope.winners[index].points);
		$scope.picks.push({
			winner:$scope.winners[index].team,
			points:$scope.winners[index].points
		});



		$scope.points.splice($scope.points.indexOf($scope.winners[index].points),1);
		$scope.winners.splice(index,1);
		$scope.games.splice(index,1);
		

		

	};
	
	
	$scope.init();
	
});
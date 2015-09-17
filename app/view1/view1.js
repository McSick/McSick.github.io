'use strict';

angular.module('myApp.view1', ['ngRoute', 'firebase'])

.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/view1', {
				templateUrl : 'view1/view1.html',
				controller : 'View1Ctrl'
			});
		}
	])

.controller('View1Ctrl', function ($scope, $firebaseObject) {
	var ref = new Firebase("https://nflquickpick.firebaseio.com");
	$scope.games = angular.copy(week2);
	$scope.name = '';
	// download the data into a local object
	$scope.data = $firebaseObject(ref);
	$scope.winners = [];
	$scope.points = [99, 75, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
	$scope.pointchoice = [];
	$scope.picks = [];
	$scope.init = function () {
		for (var i = 0; i < week2.length; i++) {
			var pick = {
				team : week2[i].Home,
				points : ''
			}
			$scope.winners[i] = pick;

		}

	}
	$scope.savedPicks = [];
	$scope.getPicks = function () {
		var serverPicks = $firebaseObject(ref.child('week2').child($scope.name));
		serverPicks.$loaded(function (savedPicks) {

			savedPicks.forEach(function (value, key) {
				if (!angular.isFunction(value)) {
					$scope.picks.push({
						winner : value,
						points : key

					});
				}
			});
		});
		$scope.picks.sort(function(a,b){
			return parseInt(b.points) - parseInt(a.points);
		});
		$scope.games = [];
		$scope.points = [];

	};
	$scope.submit = function () {
		$scope.savedPicks = $firebaseObject(ref.child('week2').child($scope.name));
		for (var i = 0; i < $scope.picks.length; i++) {
			var pick = $scope.picks[i];
			$scope.savedPicks[pick.points] = pick.winner;
		}
		$scope.savedPicks.$save();
		alert('Saved Picks!');

	};

	$scope.addGame = function (index) {
	
	    if((!($scope.winners[game.id].team) || !($scope.winners[game.id].points))){
			alert('Please select both a team and points first!');
			return;
		}

		$scope.picks.push({
			winner : $scope.winners[index].team,
			points : $scope.winners[index].points
		});

		$scope.points.splice($scope.points.indexOf($scope.winners[index].points), 1);
		for (var i = $scope.games.length - 1; i >= 0; i--) {
			if ($scope.games[i].id == index)
				$scope.games.splice(i, 1);
		}

	};
	$scope.removeGame = function (index) {
		var pick = $scope.picks[index];
		for (var i = 0; i < week2.length; i++) {
			if (week2[i].Home === pick.winner || week2[i].Away === pick.winner) {
				$scope.games.push(week2[i]);
				$scope.points.push(pick.points);
			}
		}
		$scope.picks.splice(index, 1);

	};

	$scope.init();

});

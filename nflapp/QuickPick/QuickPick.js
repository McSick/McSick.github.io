'use strict';

angular.module('myApp.QuickPick', ['ngRoute', 'firebase'])

.config(['$routeProvider', function ($routeProvider) {
			$routeProvider.when('/QuickPick', {
				templateUrl : 'QuickPick/QuickPick.html',
				controller : 'QuickPickCtrl'
			});
		}
	])

.controller('QuickPickCtrl', function ($scope, $firebaseObject, $firebaseArray) {
	var ref = new Firebase("https://nflquickpick.firebaseio.com");


	$scope.games = $firebaseArray(ref.child('games').child('week3'));
	$scope.copyofgames =$firebaseArray(ref.child('games').child('week3'));
	$scope.name = '';
	// download the data into a local object
	$scope.data = $firebaseObject(ref);
	$scope.winners = [];
	$scope.points = [99, 75, 50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
	$scope.pointchoice = [];
	$scope.picks = [];
	$scope.init = function () {
		for (var i = 0; i < $scope.games.length; i++) {
			var pick = {
				team : $scope.games[i].Home,
				points : '',
				id:$scope.games[i].id
			}
			$scope.winners[i] = pick;

		}

	}
	$scope.savedPicks = [];
	$scope.getPicks = function () {
		$scope.picks = [];
		var serverPicks = $firebaseObject(ref.child('week3').child($scope.name));
		serverPicks.$loaded(function (savedPicks) {

			savedPicks.forEach(function (value, key) {
				if (!angular.isFunction(value)) {
					$scope.picks.push({
						winner : value,
						points : key,
						id: getIdByTeam(value)

					});
				}
			});

			$scope.picks.sort(function(a,b){
				return parseInt(b.points) - parseInt(a.points);
			});
		});

		$scope.games = [];
		$scope.points = [];

	};
	var getIdByTeam = function(team){
			for(var i = 0; i < $scope.copyofgames.length;i++){
					if($scope.copyofgames[i].Home == team || $scope.copyofgames[i].Away == team){
						return $scope.copyofgames[i].id;
					}

			}
			return -1;

	}
	$scope.submit = function () {
		if(($scope.picks.length != 16) || !$scope.name){
			alert('Please Enter your name and Add all 16 games!');
		}
		$scope.savedPicks = $firebaseObject(ref.child('week3').child($scope.name));
		for (var i = 0; i < $scope.picks.length; i++) {
			var pick = $scope.picks[i];
			$scope.savedPicks[pick.points] = pick.winner;
		}
		$scope.savedPicks.$save();
		alert('Saved Picks!');

	};

	$scope.addGame = function (game,index) {

	    if((!($scope.winners[game.id].team) || !($scope.winners[game.id].points))){
			alert('Please select both a team and points first!');
			return;
		}

		$scope.picks.push({
			winner : $scope.winners[index].team,
			points : $scope.winners[index].points,
			id: $scope.winners[index].id
		});

		$scope.points.splice($scope.points.indexOf($scope.winners[index].points), 1);
		for (var i = $scope.games.length - 1; i >= 0; i--) {
			if ($scope.games[i].id == index)
				$scope.games.splice(i, 1);
		}

		$scope.picks.sort(function(a,b){
			return parseInt(b.points) - parseInt(a.points);
		});

	};
	$scope.removeGame = function (index) {
		var pick = $scope.picks[index];
		var id = getIdByTeam(pick.winner);
		$scope.points.push(pick.points);
		$scope.games.push($scope.copyofgames[id]);
		/*for (var i = 0; i < $scope.copyofgames.length; i++) {
			if (week2[i].Home === pick.winner || week2[i].Away === pick.winner) {
				$scope.games.push(week2[i]);
				$scope.points.push(pick.points);
			}
		}*/
		$scope.picks.splice(index, 1);

	};

	$scope.init();

});

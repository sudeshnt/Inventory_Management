angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('ItemCtrl', function($scope,$http,$window, $ionicPopup,$timeout,$location) {
   $scope.login_status=false;

  // Called when the form is submitted
  $scope.createItem = function(task) {

    var data = {
      itemCode: task.itemCode,
      mesureUnit: task.measureUnit,
      itemName: task.itemName
    };
    var config = {
      headers : {
        'Content-Type': 'application/json'
      }
    };
    console.log(data);
    $http.post('http://52.221.245.58:8080/inventory_service/Item/new', data, config)
        .success(function (data, status, headers, config) {
          console.log("success");
        })
        .error(function (data, status, header, config ) {
          console.log("error");
        });
  };

  //for view all
  $scope.allItems = [];
  $http.get("http://52.221.245.58:8080/inventory_service/Item/getAllItems").then(function (response) {
    response.data.forEach(function(item) {
      $scope.allItems.push(item);
    });
  });
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    group.show = !group.show;
  };
  $scope.isGroupShown = function(group) {
    return group.show;
  };

  //for deleting
  $scope.delete = function(itemId){
    console.log(itemId);
    $http.delete('http://52.221.245.58:8080/inventory_service/Item/delete/'+itemId)
        .success(function (data, status, headers) {
          console.log('success');
          $scope.ServerResponse = data;
          $window.location.reload( "/view" );
        })
        .error(function (data, status, header, config) {
          console.log('error');
        });
  };

  // Triggered on a button click, or some other target
  $scope.update = function(item) {

      console.log(item);
      $scope.editedItem = {};
      $scope.editedItem.id = item.id;
      if(item.itemCode!='string')
        $scope.editedItem.itemCode = item.itemCode;
      if(item.mesureUnit!='string')
        $scope.editedItem.measureUnit =  item.mesureUnit;
      if(item.itemName!='string')
        $scope.editedItem.itemName =  item.itemName;
      if(item.itemName!='')
          $scope.editedItem.unitsInHand =  item.unitsInHand;
      // An elaborate, custom popup
      var myPopup = $ionicPopup.show({
        template: '<label>Item Code</label><input type="text" ng-model="editedItem.itemCode" placeholder="Enter Item Code" style="margin: 5px 0 5px;">'+
                  '<label>Measure Unit</label><input type="text" ng-model="editedItem.measureUnit" placeholder="Enter Measure Unit" style="margin: 5px 0 5px;">'+
                  '<label>Item Name</label><input type="text" ng-model="editedItem.itemName" placeholder="Enter Item Name" style="margin: 5px 0 5px;">'+
                  '<label>Units In Hand</label><input type="number" ng-model="editedItem.unitsInHand" placeholder="Enter Units in Hand" style="margin: 5px 0 5px;">',
        title: 'Edit Item Details',
        subTitle: '',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Save</b>',
            type: 'submit',
            onTap: function(e) {
              //edit item
                console.log($scope.editedItem);

                  var data = {
                    id: $scope.editedItem.id,
                    itemCode: $scope.editedItem.itemCode,
                    mesureUnit: $scope.editedItem.measureUnit,
                    itemName: $scope.editedItem.itemName,
                    unitsInHand: $scope.editedItem.unitsInHand
                  };
                  $scope.updateItem(data);
                  $window.location.reload();
                //$location.path('/view');
                $route.reload();
            }
          }
        ]
      });

      myPopup.then(function(res) {
        console.log('Tapped!', res);
      });

  };

  $scope.GRN = function(item){
        if(item.id!='' && item.qty!='') {
            $http.get("http://52.221.245.58:8080/inventory_service/Item/get/"+item.id).then(function (response) {
                if(response.data!='' && item.qty>0){
                    response.data.unitsInHand+=item.qty;
                    console.log(response.data);
                    $scope.updateItem(response.data);
                    $scope.showAlert();

                }
                else
                    console.log('item not found');

            });
        }
      else{
            console.log('all fields are required')
        }
  };
    $scope.GIN = function(item){
        if(item.id!='' && item.qty!='') {
            $http.get("http://52.221.245.58:8080/inventory_service/Item/get/"+item.id).then(function (response) {
                if(response.data!='' && item.qty>0){
                    response.data.unitsInHand-=item.qty;
                    console.log(response.data);
                    $scope.updateItem(response.data);
                    $scope.showAlert();
                }
                else
                    console.log('item not found');

            });
        }
        else{
            console.log('all fields are required')
        }
    };

   $scope.updateItem = function(data){
       var config = {
           headers : {
               'Content-Type': 'application/json'
           }
       }
       console.log($scope.data);
       $http.put('http://52.221.245.58:8080/inventory_service/Item/update/' , data , config)
           .success(function (data, status, headers) {
               $scope.ServerResponse = data;

           })
           .error(function (data, status, header, config) {
               $scope.ServerResponse =  htmlDecode("Data: " + data +
                   "\n\n\n\nstatus: " + status +
                   "\n\n\n\nheaders: " + header +
                   "\n\n\n\nconfig: " + config);
           });
   };

    // An alert dialog
    $scope.showAlert = function() {
        var alertPopup = $ionicPopup.alert({
            /*title: 'Don\'t eat that!',*/
            template: 'It might taste good'
        });

        alertPopup.then(function(res) {
            $location.path('/view');

        });
    };

  $scope.authenticateUser = function (user){
      if((user.username=="sudesh" && user.password=='sudesh') || (user.username=="darshana" && user.password=='darshana')){
          /*$scope.login_status=true;*/
          console.log('menu');
         /* $window.location.reload( "/menu" );*/
          $location.path('/menu');
      }
  };

});

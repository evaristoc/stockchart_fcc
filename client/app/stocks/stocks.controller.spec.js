'use strict';

describe('Controller: StocksCtrl', function () {

  // load the controller's module
  beforeEach(module('stockchartFccApp'));

  var StocksCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    StocksCtrl = $controller('StocksCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});

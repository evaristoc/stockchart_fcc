'use strict';

describe('Directive: graphs', function () {

  // load the directive's module
  beforeEach(module('stockchartFccApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<graphs></graphs>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the graphs directive');
  }));
});
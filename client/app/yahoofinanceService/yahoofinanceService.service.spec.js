'use strict';

describe('Service: yahoofinanceService', function () {

  // load the service's module
  beforeEach(module('stockchartFccApp'));

  // instantiate service
  var yahoofinanceService;
  beforeEach(inject(function (_yahoofinanceService_) {
    yahoofinanceService = _yahoofinanceService_;
  }));

  it('should do something', function () {
    expect(!!yahoofinanceService).toBe(true);
  });

});

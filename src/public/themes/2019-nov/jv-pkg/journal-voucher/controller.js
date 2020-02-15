app.config(['$routeProvider', function($routeProvider) {

    $routeProvider.
    when('/journal-vouchers', {
        template: '<journal-vouchers></journal-vouchers>',
        title: 'JournalVouchers',
    });
}]);

app.component('journalVouchers', {
    templateUrl: journal_voucher_list_template_url,
    controller: function($http, $location, HelperService, $scope, $routeParams, $rootScope, $location) {
        $scope.loading = true;
        var self = this;
        self.hasPermission = HelperService.hasPermission;
        $http({
            url: laravel_routes['getJournalVouchers'],
            method: 'GET',
        }).then(function(response) {
            self.journal_vouchers = response.data.journal_vouchers;
            $rootScope.loading = false;
        });
        $rootScope.loading = false;
    }
});
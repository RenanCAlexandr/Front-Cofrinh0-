(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .factory('DashboardService', DashboardService);

    DashboardService.$inject = ['$http', '$q', 'APP_CONFIG'];

    function DashboardService($http, $q, APP_CONFIG) {
        var API_URL = APP_CONFIG.API_URL;
        var canceladorPendente = null;

        return {
            obter: obter
        };

        function obter(espacoId, dtInicio, dtFim) {
            if (canceladorPendente) {
                canceladorPendente.resolve();
            }
            canceladorPendente = $q.defer();

            var config = {
                params: { dtInicio: dtInicio, dtFim: dtFim },
                cache: false,
                timeout: canceladorPendente.promise
            };

            return $http.get(API_URL + '/espacos-financeiros/' + espacoId + '/dashboard', config)
                .then(function (r) {
                    canceladorPendente = null;
                    return r.data;
                });
        }
    }
})();

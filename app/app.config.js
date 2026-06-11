(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .config(appConfig)
        .run(appRun);

    appConfig.$inject = ['$stateProvider', '$urlRouterProvider', '$httpProvider'];

    function appConfig($stateProvider, $urlRouterProvider, $httpProvider) {
        $urlRouterProvider.otherwise('/login');

        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'app/auth/login.html',
                controller: 'LoginController',
                controllerAs: 'vm'
            })
            .state('cadastro', {
                url: '/cadastro',
                templateUrl: 'app/auth/cadastro.html',
                controller: 'CadastroController',
                controllerAs: 'vm'
            })
            .state('app', {
                abstract: true,
                templateUrl: 'app/components/layout/layout.html'
            })
            .state('dashboard', {
                parent: 'app',
                url: '/dashboard',
                templateUrl: 'app/dashboard/dashboard.html',
                controller: 'DashboardController',
                controllerAs: 'vm'
            })
            .state('espacos', {
                parent: 'app',
                url: '/espacos',
                templateUrl: 'app/espacos/espacos.html',
                controller: 'EspacosController',
                controllerAs: 'vm'
            })
            .state('movimentacoes', {
                parent: 'app',
                url: '/movimentacoes',
                templateUrl: 'app/movimentacoes/movimentacoes.html',
                controller: 'MovimentacoesController',
                controllerAs: 'vm'
            })
            .state('categorias', {
                parent: 'app',
                url: '/categorias',
                templateUrl: 'app/categorias/categorias.html',
                controller: 'CategoriasController',
                controllerAs: 'vm'
            })
            .state('cartoes', {
                parent: 'app',
                url: '/cartoes',
                templateUrl: 'app/cartoes/cartoes.html',
                controller: 'CartoesController',
                controllerAs: 'vm'
            })
            .state('faturas', {
                parent: 'app',
                url: '/faturas/:cartaoId',
                templateUrl: 'app/cartoes/faturas.html',
                controller: 'FaturasController',
                controllerAs: 'vm'
            })
            .state('convites', {
                parent: 'app',
                url: '/convites',
                templateUrl: 'app/convites/convites.html',
                controller: 'ConvitesController',
                controllerAs: 'vm'
            });

        $httpProvider.interceptors.push('authInterceptor');
    }

    appRun.$inject = ['$rootScope', '$state', 'AuthService', 'EspacoService'];

    function appRun($rootScope, $state, AuthService, EspacoService) {
        $rootScope.darkMode = localStorage.getItem('cofrinh0_dark_mode') === 'true';
        $rootScope.espacos = [];
        $rootScope.espacoAtual = null;

        // Recuperar espaço salvo
        var espacoSalvo = localStorage.getItem('cofrinh0_espaco');
        if (espacoSalvo) {
            try {
                $rootScope.espacoAtual = JSON.parse(espacoSalvo);
            } catch (e) {
                localStorage.removeItem('cofrinh0_espaco');
            }
        }

        $rootScope.toggleTheme = function () {
            $rootScope.darkMode = !$rootScope.darkMode;
            localStorage.setItem('cofrinh0_dark_mode', $rootScope.darkMode);
        };

        $rootScope.selecionarEspaco = function (espaco) {
            $rootScope.espacoAtual = espaco;
            localStorage.setItem('cofrinh0_espaco', JSON.stringify(espaco));
            $rootScope.$broadcast('espacoAlterado');
        };

        // Modal Criar Espaço
        $rootScope.novoEspaco = { nome: '' };
        $rootScope.criandoEspaco = false;
        $rootScope._modalCriarEspaco = null;

        $rootScope.abrirCriarEspaco = function () {
            $rootScope.novoEspaco = { nome: '' };
            if (!$rootScope._modalCriarEspaco) {
                $rootScope._modalCriarEspaco = new bootstrap.Modal(document.getElementById('modalCriarEspaco'));
            }
            $rootScope._modalCriarEspaco.show();
        };

        $rootScope.criarEspaco = function () {
            if (!$rootScope.novoEspaco.nome) return;
            $rootScope.criandoEspaco = true;
            EspacoService.criar($rootScope.novoEspaco)
                .then(function (espaco) {
                    $rootScope.espacos.push(espaco);
                    $rootScope.selecionarEspaco(espaco);
                    $rootScope.novoEspaco = { nome: '' };
                    $rootScope.criandoEspaco = false;
                    if ($rootScope._modalCriarEspaco) $rootScope._modalCriarEspaco.hide();
                })
                .catch(function () {
                    $rootScope.criandoEspaco = false;
                });
        };

        $rootScope.logout = function () {
            AuthService.logout();
            localStorage.removeItem('cofrinh0_espaco');
            $rootScope.espacoAtual = null;
            $rootScope.espacos = [];
            $state.go('login');
        };

        // Carregar espaços ao iniciar se logado
        if (AuthService.isAuthenticated()) {
            EspacoService.listar().then(function (espacos) {
                $rootScope.espacos = espacos;
                if (!$rootScope.espacoAtual && espacos.length > 0) {
                    $rootScope.selecionarEspaco(espacos[0]);
                }
            });
        }

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            var publicStates = ['login', 'cadastro'];
            var isPublic = publicStates.indexOf(toState.name) !== -1;

            if (!isPublic && !AuthService.isAuthenticated()) {
                event.preventDefault();
                $state.go('login');
            }
        });

        $rootScope.$on('$stateChangeSuccess', function () {
            // Recarregar espaços se ainda estiver vazio mas estiver logado
            if (AuthService.isAuthenticated() && $rootScope.espacos.length === 0) {
                EspacoService.listar().then(function (espacos) {
                    $rootScope.espacos = espacos;
                    if (!$rootScope.espacoAtual && espacos.length > 0) {
                        $rootScope.selecionarEspaco(espacos[0]);
                    }
                });
            }
        });
    }
})();

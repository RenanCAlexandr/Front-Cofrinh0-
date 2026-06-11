(function () {
    'use strict';

    angular
        .module('cofrinh0App')
        .controller('MovimentacoesController', MovimentacoesController);

    MovimentacoesController.$inject = ['$rootScope', 'MovimentacaoService', 'CategoriaService'];

    function MovimentacoesController($rootScope, MovimentacaoService, CategoriaService) {
        var vm = this;

        vm.movimentacoes = [];
        vm.categorias = [];
        vm.loading = true;
        vm.salvando = false;
        vm.excluindo = false;
        vm.editando = false;
        vm.editandoId = null;
        vm.movimentacaoExcluir = null;
        vm.erro = null;
        vm.sucesso = null;
        vm.busca = '';
        vm.filtroRapido = '';
        vm.mostrarFiltroAvancado = false;
        vm.modal = null;
        vm.modalExcluir = null;

        vm.paginacao = { page: 0, size: 20, totalPages: 0, totalElements: 0 };
        vm.nova = resetNova();
        vm.filtro = {};

        vm.abrirModal = abrirModal;
        vm.salvar = salvar;
        vm.abrirEdicao = abrirEdicao;
        vm.confirmarExclusao = confirmarExclusao;
        vm.excluir = excluir;
        vm.filtrar = filtrar;
        vm.limparFiltro = limparFiltro;
        vm.aplicarFiltroRapido = aplicarFiltroRapido;
        vm.pesquisar = pesquisar;
        vm.irPagina = irPagina;
        vm.toggleFiltroAvancado = toggleFiltroAvancado;
        vm.categoriasPorTipo = categoriasPorTipo;
        vm.movimentacoesFiltradas = movimentacoesFiltradas;
        vm.formatarData = formatarData;
        vm.formatarDataInput = formatarDataInput;

        init();

        function init() {
            if (!$rootScope.espacoAtual) {
                vm.loading = false;
                return;
            }
            carregarDados();
        }

        function carregarDados() {
            vm.loading = true;
            CategoriaService.listar($rootScope.espacoAtual.id)
                .then(function (cats) {
                    vm.categorias = cats.filter(function (c) { return c.ativo; });
                    return carregarMovimentacoes();
                })
                .catch(function () {
                    vm.erro = 'Erro ao carregar dados.';
                    vm.loading = false;
                });
        }

        function carregarMovimentacoes() {
            var params = { page: vm.paginacao.page, size: vm.paginacao.size, sort: 'dtMovimentacao,desc' };
            return MovimentacaoService.listar($rootScope.espacoAtual.id, params)
                .then(function (data) {
                    vm.movimentacoes = data.content;
                    vm.paginacao.totalPages = data.totalPages;
                    vm.paginacao.totalElements = data.totalElements;
                    vm.loading = false;
                });
        }

        function abrirModal() {
            vm.nova = resetNova();
            vm.editando = false;
            vm.editandoId = null;
            vm.erro = null;
            if (!vm.modal) {
                vm.modal = new bootstrap.Modal(document.getElementById('modalMovimentacao'));
            }
            vm.modal.show();
        }

        function abrirEdicao(mov) {
            vm.editando = true;
            vm.editandoId = mov.id;
            vm.nova = {
                categoriaId: mov.categoriaId,
                valor: mov.valor,
                tipo: mov.tipo,
                dtMovimentacao: formatarDataInput(mov.dtMovimentacao),
                descricao: mov.descricao || ''
            };
            vm.erro = null;
            if (!vm.modal) {
                vm.modal = new bootstrap.Modal(document.getElementById('modalMovimentacao'));
            }
            vm.modal.show();
        }

        function salvar() {
            if (!vm.nova.categoriaId || !vm.nova.valor || !vm.nova.tipo || !vm.nova.dtMovimentacao) return;
            vm.salvando = true;
            vm.erro = null;

            var payload = angular.copy(vm.nova);
            payload.valor = parseFloat(payload.valor);

            var promise;
            if (vm.editando) {
                promise = MovimentacaoService.editar($rootScope.espacoAtual.id, vm.editandoId, payload);
            } else {
                promise = MovimentacaoService.criar($rootScope.espacoAtual.id, payload);
            }

            promise
                .then(function () {
                    vm.sucesso = vm.editando ? 'Movimentação atualizada com sucesso!' : 'Movimentação registrada com sucesso!';
                    vm.nova = resetNova();
                    vm.editando = false;
                    vm.editandoId = null;
                    vm.salvando = false;
                    vm.paginacao.page = 0;
                    if (vm.modal) vm.modal.hide();
                    carregarMovimentacoes();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao salvar movimentação.';
                    vm.salvando = false;
                });
        }

        function confirmarExclusao(mov) {
            vm.movimentacaoExcluir = mov;
            if (!vm.modalExcluir) {
                vm.modalExcluir = new bootstrap.Modal(document.getElementById('modalExcluirMovimentacao'));
            }
            vm.modalExcluir.show();
        }

        function excluir() {
            if (!vm.movimentacaoExcluir) return;
            vm.excluindo = true;

            MovimentacaoService.excluir($rootScope.espacoAtual.id, vm.movimentacaoExcluir.id)
                .then(function () {
                    vm.sucesso = 'Movimentação excluída com sucesso!';
                    vm.excluindo = false;
                    vm.movimentacaoExcluir = null;
                    if (vm.modalExcluir) vm.modalExcluir.hide();
                    carregarMovimentacoes();
                })
                .catch(function (err) {
                    vm.erro = err.data && err.data.mensagem ? err.data.mensagem : 'Erro ao excluir movimentação.';
                    vm.excluindo = false;
                });
        }

        function filtrar() {
            vm.loading = true;
            vm.paginacao.page = 0;
            var filtroParams = angular.copy(vm.filtro);
            if (vm.filtroRapido) {
                filtroParams.tipo = vm.filtroRapido;
            }
            var params = { page: 0, size: vm.paginacao.size, sort: 'dtMovimentacao,desc' };
            MovimentacaoService.filtrar($rootScope.espacoAtual.id, filtroParams, params)
                .then(function (data) {
                    vm.movimentacoes = data.content;
                    vm.paginacao.totalPages = data.totalPages;
                    vm.paginacao.totalElements = data.totalElements;
                    vm.loading = false;
                })
                .catch(function () {
                    vm.erro = 'Erro ao filtrar movimentações.';
                    vm.loading = false;
                });
        }

        function aplicarFiltroRapido(tipo) {
            vm.filtroRapido = tipo;
            if (tipo) {
                vm.filtro.tipo = tipo;
                filtrar();
            } else {
                delete vm.filtro.tipo;
                vm.paginacao.page = 0;
                carregarMovimentacoes();
            }
        }

        function pesquisar() {
            // Client-side filter on description
        }

        function movimentacoesFiltradas() {
            if (!vm.busca) return vm.movimentacoes;
            var termo = vm.busca.toLowerCase();
            return vm.movimentacoes.filter(function (mov) {
                return (mov.descricao && mov.descricao.toLowerCase().indexOf(termo) !== -1) ||
                       (mov.categoria && mov.categoria.toLowerCase().indexOf(termo) !== -1);
            });
        }

        function limparFiltro() {
            vm.filtro = {};
            vm.filtroRapido = '';
            vm.busca = '';
            vm.paginacao.page = 0;
            carregarMovimentacoes();
        }

        function irPagina(page) {
            if (page < 0 || page >= vm.paginacao.totalPages) return;
            vm.paginacao.page = page;
            carregarMovimentacoes();
        }

        function toggleFiltroAvancado() {
            vm.mostrarFiltroAvancado = !vm.mostrarFiltroAvancado;
        }

        function categoriasPorTipo(tipo) {
            return vm.categorias.filter(function (c) {
                return !c.tipo || c.tipo === tipo;
            });
        }

        function formatarData(data) {
            if (!data) return '';
            var partes = data.split('-');
            if (partes.length === 3) {
                return partes[2] + '/' + partes[1] + '/' + partes[0];
            }
            return data;
        }

        function formatarDataInput(data) {
            if (!data) return new Date().toISOString().substring(0, 10);
            // Se for timestamp em milissegundos
            if (typeof data === 'number' && data > 10000000000) {
                return new Date(data).toISOString().substring(0, 10);
            }
            // Se for string, extrair apenas YYYY-MM-DD
            if (typeof data === 'string') {
                if (data.length >= 10) {
                    return data.substring(0, 10);
                }
            }
            return new Date().toISOString().substring(0, 10);
        }

        function resetNova() {
            return { categoriaId: null, valor: null, tipo: 'SAIDA', dtMovimentacao: formatarDataInput(null), descricao: '' };
        }

        $rootScope.$on('espacoAlterado', function () {
            carregarDados();
        });
    }
})();

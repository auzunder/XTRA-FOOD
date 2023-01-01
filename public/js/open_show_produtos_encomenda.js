var aberto = false;
function hide_show_produtos(encomenda) {
    if (aberto) {
        document.getElementById('encomenda_produtos_' + encomenda).classList.add('hidden');
        document.getElementById('hide_show_produtos_seta_' + encomenda).classList.remove('rotate90');
        aberto = false;
    } else {
        document.getElementById('encomenda_produtos_' + encomenda).classList.remove('hidden');
        document.getElementById('hide_show_produtos_seta_' + encomenda).classList.add('rotate90');
        aberto = true;
    }
}
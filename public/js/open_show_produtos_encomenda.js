var aberto = false;
document.getElementById('hide_show_produtos').onclick = function () {
    if (aberto) {
        document.getElementById('encomenda_produtos').classList.add('hidden');
        document.getElementById('hide_show_produtos_seta').classList.remove('rotate90');
        aberto = false;
    } else {
        document.getElementById('encomenda_produtos').classList.remove('hidden');
        document.getElementById('hide_show_produtos_seta').classList.add('rotate90');
        aberto = true;
    }
}
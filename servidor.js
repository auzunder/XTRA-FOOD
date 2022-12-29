const session = require('express-session');
const express = require('express');
const fs = require('fs');
const mysql = require("mysql2");

const fileUpload = require("express-fileupload");

const servidor = express();
var porta = 8080;

servidor.use(express.urlencoded({extended: true}));
servidor.use(express.static("public"));
servidor.use(fileUpload());
//  Sessão
servidor.use(session({
    secret: "supercalifragilisticexpialidocious",
    resave: false,
    saveUninitialized: true
}));

// Ligação ao servidor
var porta = 8080;
servidor.listen(porta, function () {
    console.log("servidor a ser executado em http://localhost:" + porta);
});

// MySQL user - database
var pool = mysql.createPool({
    host: "localhost",
    user: "xtra_food",
    password: "xtra_food",
    database: "xtra_food",
    charset: "utf8",
    multipleStatements: true
});


//LOG SYSTEM
const logging = (req, res, next) => {
    console.log('================================================================================================================================================');
    console.log("Date: ", Date());
    console.log("Path: ", req.session);
    console.log('================================================================================================================================================');
    next();
};

// Tentar abrir fichieros prinicipais
    try {
        var navbar = fs.readFileSync('html/NavBar.html', 'utf-8');
        var registo_login_popUp = fs.readFileSync('html/registo_login.html', 'utf-8');
        var footer = fs.readFileSync('html/Footer.html', 'utf-8');
       // var err_404 = fs.readFileSync('','utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

// PAGINA INICIAL
servidor.get("/", logging, function (req, res) {
    var query ='';
    // Tentar abrir ficheiro
    try {
        var home_content = fs.readFileSync('html/home.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }
    
    var html = "";
    
    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/css/bootstrap.min.css">\n';
    html += '<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.7/js/bootstrap.min.js">\n</script>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/home_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';
    
    
    //HTML NavBar
    html += navbar;
    if (req.session.username){
        html += '<a href="/user" id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></a>';
         html += '</div></div></header>';
    }else{
        html += '<div id="userAccount_navbar" class="flex flex_row flex_center navBarMenuOption pointer" onclick="session_abrir('+"'"+'registo_popUp'+"'"+')"> <img class="navBarIcons" src="images/navbar icons/contaIcon.png" alt="icone conta"></div>'; 
        html += '</div></div></header>';
        html += registo_login_popUp;
    }
    
    //HTML Content
    html += home_content;
    
    query += 'SELECT cartaz_img FROM evento ORDER BY data asc;';
    pool.query(query, function (err, result, fields) {
        if (!err) {
            if (result && result.length > 0) {
                console.log(result)
                html += '\n<script>';
                
                for (var index in result){
                    html += 'document.getElementById("cartaz_' + (parseInt(index)+1).toString() + '").src = "images/eventos/' + (parseInt(index)+1).toString() + '.jpg";\n';
                }
                //html += 'document.getElementById("cartaz_2")';
                //html += 'document.getElementById("cartaz_3")';

                html += '\n</script>\n';
            }else {
                console.log('Não foi possível obter resultados')
            };
        }
        else {
            console.log(err)
            console.log('Erro ao executar pedido ao servidor')
        }
        html += footer;
        html += '</body>\n</html>';
        res.send(html);
    });
});


// PAGINA VOLUNTARIADO
servidor.get("/voluntariado", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/voluntariado.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Voluntariado | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/voluntariado_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

servidor.get("/voluntariado/submissao", logging, function (req, res) {
});

// PAGINA DOAÇÃO
servidor.get("/doacao", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/doacao.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Doação | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/doacao_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA SOBRE NÓS
servidor.get("/sobre_nos", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/sobre_nos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Sobre Nós | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/sobre_nos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA SERVIÇOS
servidor.get("/parceiros", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/servicos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Serviços | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/servicos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});


// PAGINA EVENTOS
servidor.get("/eventos", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/eventos.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/eventos_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA LOJA
servidor.get("/loja", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/loja.html', 'utf-8');
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="css/loja_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/images/logos/main.png">';
    html += '<script src="js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp;

    //HTML Content
    html += content;

    html += footer;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// PAGINA PRODUTO LOJA
servidor.get("/loja/produto/ultrafood", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/produto.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// CARRINHO
servidor.get("/loja/carrinho", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_produtos.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// CARRINHO
servidor.get("/loja/carrinho/informacao", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_informação.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// CARRINHO
servidor.get("/loja/carrinho/finalizacao", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/carrinho_finalização.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/loja_css.css" type="text/css">\n';
    //html += '<link rel="stylesheet" href="/../css/produto_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});

// USER ACCOUNT
servidor.get("/user", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/user_info.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});


// USER ACCOUNT
servidor.get("/user/history", logging, function (req, res) {
    // Tentar abrir ficheiro
    try {
        var content = fs.readFileSync('html/user_history.html', 'utf-8');
        var navbar_loja = fs.readFileSync('html/NavBar Loja.html', 'utf-8')
        var footer_loja = fs.readFileSync('html/Footer Loja.html', 'utf-8')
        var registo_login_popUp_loja = fs.readFileSync('html/registo_login Loja.html', 'utf-8')
    }
    // Caso nao consiga da log do erro
    catch (error){
        console.error("Erro ao ler ficheiros de conteudo.")
        console.error(error)
    }

    var html = "";

    //HTML head
    html += '<!DOCTYPE html>\n<html lang=pt>\n<head>\n';
    //HTML head meta
    html += '<meta charset="utf-8">\n';
    html += '<meta http-equiv="X-UA-Compatible" content="IE=edge">\n';
    html += '<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    //Title
    html += '<title>Eventos | XTRA FOOD</title>\n';
    html += '<link rel="stylesheet" href="/../css/fonts.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/navbar_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/footer_css.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/general_styles.css" type="text/css">\n';
    html += '<link rel="stylesheet" href="/../css/carrinho_css.css" type="text/css">\n';
    html += '<link rel="icon" type="images/x-icon" href="/../images/logos/main.png">';
    html += '<script src="/../js/login.js"></script>\n';
    //HTML close head
    html += '</head>\n<body>';

    //HTML NavBar
    html += navbar_loja;
    //html += '<div id="navbar_ghost_scpace"></div>'

    html += registo_login_popUp_loja;

    //HTML Content
    html += content;

    html += footer_loja;

    //HTML close
    html += '\n</body>\n</html>';
    res.send(html);
});